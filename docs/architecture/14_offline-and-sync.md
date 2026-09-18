# 14. オフラインファースト・同期キュー・ストレージ保護設計（14_offline-and-sync.md）

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計）

---

## 1. 機能別オフライン可否マトリクス

現場（山間部、沿岸部、災害現場等の完全電波圏外）での自律運航を実現するため、アプリ機能ごとのオフライン稼働レベルを3区分で定義します。

| 機能名 | 区分 | 前提条件 | 圏外時の挙動・フォールバック |
|---|:---:|---|---|
| **アプリ起動** | **事前キャッシュで可能** | 一度オンラインで開いてPWAインストール済 | Service Workerにより即時起動 |
| **機体・パイロット選択** | **完全オフライン可能** | 端末内IndexedDBにマスター保持 | 瞬時にローカルロード |
| **バッテリー選択・状態切替** | **完全オフライン可能** | 端末内IndexedDBにバッテリー台帳保持 | 瞬時に切替・残量記録 |
| **過去の飛行計画閲覧** | **完全オフライン可能** | 端末内IndexedDBに計画保持 | 即時閲覧・複製可能 |
| **地図表示（国土地理院）** | **事前キャッシュで可能** | 事前に現場周辺タイルを画面表示済 | キャッシュ済タイルを表示、未取得部はグリッド表示 |
| **飛行範囲（POLYGON / CIRCLE / BUFFERED_LINE）作成** | **完全オフライン可能** | 選定済み地図エンジン・幾何処理の事前ロード済（選定はC5実機評価） | 中立FlightAreaGeometryのローカル編集・座標計算 |
| **DIPS飛行計画作成・提出確定** | **完全オフライン可能** | 端末内IndexedDBに計画保持 | 不変スナップショット作成・ローカルDBへ即時永続化 |
| **DIPS Web手動通報の実施** | **通信必須** | DIPS Webへ到達可能 | 支援表示・ローカル記録は可能だが、圏外では新規通報を完了したと扱わない |
| **DIPS手動入力支援（コピー画面）** | **完全オフライン可能** | 不変スナップショット保持 | 画面表示・クリップボードコピー即座に実行可能 |
| **日常点検（飛行前・飛行後）** | **完全オフライン可能** | なし | ローカルDBへ即時永続化 |
| **離着陸打刻・タイマー計測** | **完全オフライン可能** | なし | ミリ秒打刻・IndexedDB即時保存 |
| **バッテリー交換・機体交代** | **完全オフライン可能** | なし | 端末内で瞬時に切り替え |
| **飛行日誌プレビュー・PDF生成** | **完全オフライン可能** | ライブラリ・日本語フォント等を事前キャッシュ（詳細は18） | 本文PDFは生成可能。地図未取得時は座標等で代替 |
| **KMLファイル生成** | **完全オフライン可能** | クライアント側KmlExporter | ブラウザ内で即時生成・端末保存可能 |
| **KMLのGoogle Drive保存** | **通信必須** | オンライン | **同期キューに保持し、電波復帰時に自動保存（現場操作は非ブロッキング）** |
| **Googleスプレッドシート「DIPS台帳」保存** | **通信必須** | オンライン | **同期キューに保持し、電波復帰時に自動反映** |
| **DIPS機体・許可情報照会** | **通信必須** | オンライン | 過去取得済みキャッシュを表示 |
| **DIPS飛行計画API通報 (Optional)** | **通信必須** | オンライン・API承認済み | **手動支援は独立。送信結果不明なら再通報前に照合（33b参照）** |
| **Googleスプレッドシート飛行日誌同期** | **通信必須** | オンライン | **同期キューに保持し、電波復帰時に一括同期** |

---

## 2. iOS Safari / WebKit ストレージ保護（Persistent Storage対策）

iOS Safariでは端末のストレージ容量が逼迫した際にIndexedDBがOSにより自動削除（Eviction）されるリスクが存在します。これに対し、本システムでは**「多層防御アーキテクチャ」**を実装します。

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [第1層] WebKit Storage APIによる永続化要求                             │
│   navigator.storage.persist() による永続化モード獲得                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [第2層] 永続化ステータスの可視化                                       │
│   navigator.storage.persisted() による保護状態の画面表示 (緑/黄バッジ) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [第3層] 外部台帳（Googleスプレッドシート）への定期同期                  │
│   運航完了後、または電波復帰時に同期済み台帳範囲をクラウド側にも保管             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [将来の追加防御] 全量DBバックアップ / restore形式はPENDING           │
│   ADR-0008で旧ユーザーJSON退避を部分置換。KMLによる復旧は禁止        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Storage API実装フロー

1. **PWA起動時チェック**:
   - `navigator.storage && navigator.storage.persisted` を確認。
   - `persisted()` が `false` の場合、`navigator.storage.persist()` を呼び出す（結果はブラウザの判断に依存し、承認・削除回避を保証しない）。
2. **UI表示**:
   - 設定画面および運航記録画面の片隅に「ストレージ保護: 正常（永続）」または「通常（外部同期推奨）」をアイコン表示。
3. **容量監視**:
   - `navigator.storage.estimate()` を定期確認し、使用率が警告閾値を超えた場合にパイロットへ通知。

---

## 3. 同期キュー（SyncQueue）アーキテクチャ

現場で発生したアプリ管理の外部送信リクエスト（Optional DIPS API通報、スプレッドシート同期、KMLのDrive保存）は、直接再送を繰り返さず、**IndexedDB上の `SyncQueue` テーブル**にジョブとして格納されます。

### 3.1 ジョブデータ構造（Job Schema）

```typescript
interface SyncJob {
  job_id: string;             // UUID v4
  target: 'spreadsheet_flight_log' | 'spreadsheet_dips_ledger' | 'dips_fpr' | 'google_drive_kml';
  entity_type: string;        // 'mission' | 'flight_plan' | 'flight' | 'dips_submission'
  entity_id: string;          // 対象のエンティティID
  operation_id: string;       // 操作ごとに一度だけ発行される不変UUID (再送時も不変)
  sync_revision: number;      // エンティティの同期間リビジョン番号
  idempotency_key: string;    // operation_id または SHA256(entity_type + ":" + entity_id + ":" + sync_revision)
  status: 'pending' | 'running' | 'retry_wait' | 'submission_uncertain' | 'reconciliation_required' | 'succeeded' | 'failed_manual_action';
  payload: Record<string, any>; // 送信対象の内部スナップショット（ユーザー向けJSON出力ではない）
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  last_attempt_at: string | null;
  last_error: string | null;
  created_at: string;
}
```

### 3.2 送信先別の冪等性・重複防止戦略（Spreadsheet vs DIPS の分離）

外部送信先によって利用可能な重複防止機構が根本的に異なるため、単一の方式で一元化せず、送信先ごとに最適化した戦略を採用します。

1. **Google Spreadsheet 向け（UPSERT Strategy）**:
   - **前提**: アプリ側でスプレッドシートの列定義を自由に設計可能。
   - **方式**: 各レコード行に `operation_id` および `mission_id` / `record_id` カラムを書き込む。
   - **重複防止**: GAS / Sheets API側で `operation_id` の重複を検査し、同一IDが存在する場合は更新（UPDATE）、存在しない場合のみ新規行追記（INSERT）を行うUPSERT方式を適用。
   - **耐障害性**: ネットワーク切断による同一ジョブの再送が発生しても、同一行が二重挿入される事故を確実に防止。

2. **国交省DIPS 2.0 向け（Reconciliation Strategy）**:
   - **前提**: 国交省FPR APIが利用者独自の `Idempotency-Key` を解釈する保証に依存しない。公式契約で未確認の重複防止機能を推測で利用しない。
   - **方式**: 送信中タイムアウトや通信切断で結果が不明となった場合、**安易なPOST再送を固く禁止**し、ジョブを `submission_uncertain` 状態に設定。
   - **照合（Reconciliation）**:
     1. DIPS飛行計画検索API（計画名称、日時範囲、機体登録記号、エリア座標）を実行。
     2. 同一計画が既にDIPS側に登録されているか自動検索。
     3. 登録確認が取れた場合は、その計画IDおよび受付番号を回収して `succeeded` へ遷移。
     4. 明確に未登録であることが確認できた場合のみ、安全に再POSTを実行。
     5. 照合不能または検索APIエラー時は `reconciliation_required` へ移行し、パイロットにDIPS Web画面での目視確認を要請。

通常同期とDIPS正式通報を同じretryにしない因果は[33b §2](dips-infrastructure/33b_api-availability-and-retry-boundaries.md#2-通常同期とdips正式通報を分けた因果)。Sheets／KML保存失敗を理由にDIPSを再通報しない。本書のキュー型・状態やKML保存契機をStep 4で新たに設計せず、具体的なDIPS照合契約は[15](15_dips-adapter.md)のVERIFYへ接続する。

### 3.3 リトライ戦略とネットワーク復帰判定

- **`online` イベントの位置づけ**:
  - `window.addEventListener('online')` はOSの通信アダプタがアクティブになった「再試行のきっかけ（トリガー候補）」に過ぎない。
  - **「onlineイベント検知 ＝ DIPSまたはGoogleへ到達可能」と誤認してはならない**。
  - 実際の成否は、対象エンドポイントへのHTTPリクエスト（または軽量ヘルスチェック）の実際のレスポンスをもって初めて判断する。
- **リトライ制御**:
  - ネットワーク到達不能 / タイムアウト / 5xxエラー: 再送可能なジョブのみ指数バックオフ（1秒 → 5秒 → 15秒 → 60秒 → 最大300秒）で段階的に再試行。DIPSの送信結果不明POSTは第3.2節の照合を優先し、自動再送しない。
  - 4xxエラー（バリデーション・認証不備）: 自動再試行を停止し、`failed_manual_action` 状態へ遷移。パイロットへ入力修正または再認証を促す。

### 3.4 DIPS通報前の不変スナップショット保存と外部台帳非同期退避（Pre-submission Snapshot & Non-blocking Ledger Sync）

DIPSへの通報（API通報または手動通報）にあたっては、「DIPSへ提出した後に保存する」のではなく、**「提出予定内容を確定した時点でローカルへ不変submission_snapshotを先行保存する」**順序を必須原則とします。外部台帳（Googleスプレッドシート等）への同期はこれと直交する非同期ジョブとして扱い、**Sheets同期の成否はDIPS通報の前提条件としません**。

```text
1. 計画作成・確定
   ↓ 提出スナップショット (DipsSubmission, status: 'snapshot_saved') 生成
2. ローカルDB即時永続化 (IndexedDB)
   ├─ 不変 submission_snapshot 保存（必須・改変不可）
   └─ 同期ジョブ登録 (SyncJob.target: 'spreadsheet_dips_ledger', SyncJob.status: 'pending')
       └─ DipsSubmission.sync_status は 'sync_pending'（別軸）
3. 外部台帳への非同期同期（DIPS通報をブロックしない）
   ├─ オンラインかつSheets疎通可: Googleスプレッドシート「DIPS飛行計画台帳」へ行挿入 (sync_status: 'synced')
   └─ オフラインまたはSheets障害中: キュー保持 (sync_status: 'sync_pending' / 'sync_failed') のままDIPS通報へ進む
4. DIPS通報実施（Sheets同期完了を待たずに即時実行可能）
   ├─ 手動通報: 手動支援画面でコピー → DIPS Web/アプリ入力 → アプリで「手動通報完了」記録 (MANUAL_SUBMITTED と確認後の DIPS_CONFIRMED を区別)
   └─ API通報 (Optional): バックエンド経由でDIPS FPR APIへ送信 (SENDING → API_CONFIRMED / FAILED / 結果不明照合、13b正本。exact JSON を api_payload_snapshot へ記録)
5. 通報結果・確認方法の記録
   ↓ ローカルDB更新 (手動確認: DIPS_CONFIRMED / API確認: API_CONFIRMED、confirmation_method, dips_plan_id: nullable)
6. 外部台帳の行更新 (UPSERT)
   └─ スプレッドシート「DIPS飛行計画台帳」の該当行へ確認ステータス・確認方法・受付番号（取得時のみ）を反映
```

- **オフライン現場・外部サービス障害時の堅牢性**:
  - DIPS通報前にローカルへ不変 `submission_snapshot` が確実に永続化されます。
  - Google Sheetsへの同期完了はDIPS通報の必須条件ではありません。Google Sheets障害中でも、DIPSへ到達可能なら手動またはAPI通報を進められます。完全圏外では支援画面・ローカル記録を継続できますが、DIPS Web/APIへの実通報は通信復帰が必要です。
  - 端末画面では「ローカル保存済」「外部台帳同期待ち」「外部台帳同期済」を明確に区別して表示します。
  - 電波復帰時や障害解消時に台帳同期ジョブが自動実行され、スプレッドシート上の台帳が最新状態へ追いつきます。

---

## 4. 外部退避・復旧形式と残る保護範囲

[ADR-0008](../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) により、旧ユーザー向けJSON全量エクスポート/インポート復旧は現行要件から外します。暗号化/プレーンJSON、全テーブル一括ファイル、UUID照合によるマージという旧案の履歴は同ADRに残します。

- IndexedDB、永続化要求・状態/容量監視、運航完了時/通信復帰時のSheets確定台帳同期を維持します。
- Sheetsからの復旧対象は同期・保存されている台帳データです。未同期レコード・端末設定などを含む全量DB復旧を保証しません。
- ローカルDB全量backup/restoreの将来ユーザー形式・検証/暗号化・競合処理は `PENDING-LOCAL-RESTORE-01`。C1でユーザー向けJSON import/exportや代替形式を実装しません。
- KMLは地理表示・共有、PDFは帳票であり、DBバックアップやrestoreの代替にしません。復旧の失敗時対応は [19 Failure Recovery](19_failure-recovery.md) を参照します。

## 5. 他の正本との契約

SyncQueueのジョブ型・送信先別再試行は本書が正本です。Data Authorityと手修正尊重は [11](11_data-authority.md)、DipsSubmission型は [12d](domain-model/12d_flight-plan-and-dips.md)、状態の定義・遷移は [13 状態管理目次](state-machines/README.md)、Manual手順は [24](dips-submission/24_manual-submission.md)、Sheets論理台帳は [24a](dips-submission/24a_submission-and-sheets-ledger.md) に従います。第3.4節は保存順序の説明であり、状態や確認条件を独立定義しません。

KML保存ジョブは [27b](output/27b_google-drive-storage.md)、PDFのオフライン成立条件は [18](18_reports.md)、地図エンジンの選定留保は [ADR-0009](../decisions/ADR-0009-map-renderer-selection-deferred-to-c5.md) を参照します。アプリ停止中のバックグラウンド再試行は保証せず、実行可能時・アプリ再開時に未完了キューを再開します。

Step 6で§5の運航全体最終保存を[35d](operation-recording/35d_operation-finalization-and-write-boundary.md)へ移管した。同一行UPSERTと、物理A4・BAT履歴・機体累計全体の割当／部分完了／再送契約は別で、後者はPENDING。SyncQueueの型・既存retryを変更せず、§9全体の再移植は行っていない。
