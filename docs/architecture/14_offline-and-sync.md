# 14. オフラインファースト・同期キュー・ストレージ保護設計（14_offline-and-sync.md）

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計 / Step 8 99.2反映）

---

## 1. 機能別オフライン可否マトリクス

現場（山間部、沿岸部、災害現場等の完全電波圏外）での自律運航を実現するため、アプリ機能ごとのオフライン稼働レベルを3区分で定義します。端末側の一時保持（cache / replica および draft / local work state）を活用し、圏外でも運航が停止しない構造とします。

| 機能名 | 区分 | 前提条件 | 圏外時の挙動・フォールバック |
|---|:---:|---|---|
| **アプリ起動** | **事前キャッシュで可能** | 一度オンラインで開いてPWAインストール済 | Service Worker等により即時起動 |
| **機体・パイロット選択** | **完全オフライン可能** | 端末一時保持（cache/replica）にマスター保持 | 瞬時にローカルロード |
| **バッテリー選択・状態切替** | **完全オフライン可能** | 端末一時保持（cache/replica）にバッテリー台帳保持 | 瞬時に切替・残量記録 |
| **過去の飛行計画閲覧** | **完全オフライン可能** | 端末一時保持（cache/replica）に計画保持 | 即時閲覧・複製可能 |
| **地図表示（国土地理院）** | **事前キャッシュで可能** | 事前に現場周辺タイルを画面表示済 | キャッシュ済タイルを表示、未取得部はグリッド表示 |
| **飛行範囲（POLYGON / CIRCLE / BUFFERED_LINE）作成** | **完全オフライン可能** | 選定済み地図エンジン・幾何処理の事前ロード済（選定はC5実機評価） | 中立FlightAreaGeometryのローカル編集・座標計算 |
| **DIPS飛行計画作成・提出確定** | **完全オフライン可能** | 端末一時保持（draft）に計画保持 | 不変スナップショット作成・端末一時保持へ即時保存 |
| **DIPS Web手動通報の実施** | **通信必須** | DIPS Webへ到達可能 | 支援表示・ローカル記録は可能だが、圏外では新規通報を完了したと扱わない |
| **DIPS手動入力支援（コピー画面）** | **完全オフライン可能** | 不変スナップショット保持 | 画面表示・クリップボードコピー即座に実行可能 |
| **日常点検（飛行前・飛行後）** | **完全オフライン可能** | なし | 端末一時保持（draft）へ即時保存（下書き保護） |
| **離着陸打刻・タイマー計測** | **完全オフライン可能** | なし | ミリ秒打刻・端末一時保持（draft）へ即時保存 |
| **バッテリー交換・機体交代** | **完全オフライン可能** | なし | 端末内で瞬時に切り替え（draft更新） |
| **飛行日誌プレビュー・PDF生成** | **完全オフライン可能** | ライブラリ・日本語フォント等を事前キャッシュ（詳細は18） | 本文PDFは生成可能。地図未取得時は座標等で代替 |
| **KMLファイル生成** | **完全オフライン可能** | クライアント側KmlExporter | ブラウザ内で即時生成・端末保存可能 |
| **KMLのGoogle Drive保存** | **通信必須** | オンライン | **同期キューに保持し、電波復帰時に保存試行（現場操作は非ブロッキング）** |
| **Googleスプレッドシート「DIPS台帳」保存** | **通信必須** | オンライン | **同期キューに保持し、電波復帰時に自動反映** |
| **DIPS機体・許可情報照会** | **通信必須** | オンライン | 過去取得済みキャッシュを表示 |
| **DIPS飛行計画API通報 (Optional)** | **通信必須** | オンライン・API承認済み | **手動通報へ即時フォールバック可能** |
| **Googleスプレッドシート飛行日誌同期** | **通信必須** | オンライン | **同期キューに保持し、電波復帰時に一括同期** |

---

## 2. 端末側ストレージ保護とオフライン耐性

iOS Safari / WebKit 等のモバイル環境では、端末ストレージの逼迫時にローカルデータが自動削除（Eviction）されるリスクが存在します。これに対し、本システムでは現場入力を確実に保護するための多層防御アプローチを適用します。

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [第1層] 現場入力の逐次一時保存・下書き保護（技術中立の原則）           │
│   飛行計画・点検・離着陸打刻・BAT交換等を端末側へ即時保存               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [第2層] WebKit Storage API等のプラットフォーム保護（可能な場合）       │
│   navigator.storage.persist() 要求・persisted() 状態表示               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [第3層] 外部台帳（Google Drive / Sheets）への最終送信・同期            │
│   運航完了時、操縦者の明示的送信により確定原本へ反映                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [将来の追加防御] 全量DBバックアップ / restore形式はPENDING-LOCAL-RESTORE│
│   ADR-0008で旧ユーザーJSON退避を部分置換。KMLによる復旧は禁止        │
└────────────────────────────────────────────────────────────────────────┘
```

端末側の一時保持技術（IndexedDB、localStorage 等）、DB物理構造、ID型等の具体実装方式は、本書では固定せず `PENDING-C1-SYNC` / `PENDING-C1-SCHEMA` としてC1実装側へ留保します。現場入力を端末側へ逐次一時保持し、圏外・画面遷移・誤操作から下書きを保護するという **技術中立な原則** を `CURRENT-ACCEPTED` とします。

---

## 3. 同期キュー（SyncQueue）アーキテクチャ

現場で発生した外部送信リクエスト（Optional DIPS API通報、スプレッドシート同期、KMLのDrive保存）は、直接画面をブロックして再送を繰り返さず、同期キュー（SyncQueue）を介して非同期に処理されます。

### 3.1 ジョブ概念データ構造（Conceptual Job Schema）

以下は同期ジョブの責務・属性を説明するための概念モデル（CURRENT-PROPOSAL）です。物理テーブル定義、UUID / `operation_id` / `idempotency_key` の具体的生成・検証方式、IndexedDB上のスキーマ等は `PENDING-C1-SYNC` / `PENDING-C1-SCHEMA` とし、06台帳側の中央監査用SyncQueueの恒久保持是非は `PENDING-AUDIT-QUEUE` とします。

```typescript
// 概念モデル（物理スキーマはPENDING-C1-SYNC）
interface SyncJobConcept {
  job_id: string;             // 一意識別子
  target: 'spreadsheet_flight_log' | 'spreadsheet_dips_ledger' | 'dips_fpr' | 'google_drive_kml';
  entity_type: string;        // 'mission' | 'flight_plan' | 'flight' | 'dips_submission'
  entity_id: string;          // 対象エンティティ識別子
  operation_id: string;       // 操作ごとに一度だけ発行される不変識別子
  sync_revision: number;      // エンティティの同期間リビジョン
  idempotency_key: string;    // 冪等キー
  status: 'pending' | 'running' | 'retry_wait' | 'submission_uncertain' | 'reconciliation_required' | 'succeeded' | 'failed_manual_action';
  payload: Record<string, any>; // 送信対象スナップショット
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
   - アプリ側でスプレッドシートの列定義を設計可能。
   - レコードごとに一意キーを付与し、既存行の更新（UPDATE）または新規行追記（INSERT）を行うUPSERTアプローチを適用。
   - 具体的idempotency実装および行マッチング方式はC1へ留保（`PENDING-C1-SYNC`）。
2. **国交省DIPS 向け（Reconciliation Strategy / CURRENT-ACCEPTED）**:
   - 国交省APIが利用者独自のIdempotency-Keyを解釈する保証に依存しない。公式契約で未確認の重複防止機能を推測で利用しない。
   - 送信中タイムアウトや通信切断で結果が不明（UNKNOWN）となった場合、**安易な盲目的POST再送を固く禁止**し、ジョブを `submission_uncertain` 状態に設定。
   - **照合（Reconciliation）**:
     1. DIPS飛行計画検索API（計画名称、日時範囲、機体登録記号、エリア座標等）を実行。
     2. 同一計画が既にDIPS側に登録されているか自動検索。
     3. 登録確認が取れた場合は、その計画IDおよび受付番号を回収して `succeeded` へ遷移。
     4. 明確に未登録であることが確認できた場合のみ、安全に再POSTを実行。
     5. 照合不能または検索APIエラー時は `reconciliation_required` へ移行し、操縦者にDIPS Web画面での目視確認を要請。

### 3.3 リトライ戦略とネットワーク復帰判定

- **`online` イベントの位置づけ**:
  - `window.addEventListener('online')` はOSの通信アダプタがアクティブになった「再試行のきっかけ（トリガー候補）」に過ぎない。
  - **「onlineイベント検知 ＝ DIPSまたはGoogleへ到達可能」と誤認してはならない**。実際の成否は対象エンドポイントへの疎通をもって判断する。
- **リトライ制御パラメータ（PENDING-C1-SYNC）**:
  - ネットワーク到達不能 / タイムアウト時の指数バックオフ秒数、最大リトライ回数、間隔等の具体的パラメータは `PENDING-C1-SYNC` としてC1実装側で確定する。
  - DIPSの送信結果不明POSTは自動再送せず、第3.2節の照合を優先する（CURRENT-ACCEPTED）。

### 3.4 入力保護と送信時点の3段階確定分離（Pre-submission Snapshot & 3-Stage Lifecycle）

旧アプリ（`autel-evo-lite-flight-log`）の「入力途中をローカルに保持し、一括保存成功まで下書きを破棄しない」「二重保存を防止する」思想を継承・拡張し、新アプリでは以下の **3段階の確定・送信時点（CURRENT-ACCEPTED）** に分離します。

```text
【第1時点: 飛行計画確定・DIPS通報時】(CURRENT-ACCEPTED)
   ├─ 不変 submission_snapshot および中立Geometryを端末側へ先行確定（下書き保護）
   ├─ 通報内容＋中立GeometryからKMLを生成し、07_出力フォルダーへの保存を試行
   └─ DIPS通報（手動通報またはAPI通報）を実施
        ※KML保存の成否は、DIPS通報および共有飛行リスト登録の必須前提条件としない。
       │
       ▼ (現場運航へ移行)
【第2時点: 現場運航中（点検・離着陸・BAT交換）】(CURRENT-ACCEPTED)
   ├─ 飛行前点検、離着陸時刻打刻、BAT交換、機体交代、飛行後点検の入力を端末側へ逐次一時保存
   └─ 通信圏外でもすべての現場入力を draft / local work state として確実に保護
       │
       ▼ (運航終了・操縦者の最終送信操作)
【第3時点: 運航終了・操縦者による最終送信】(CURRENT-ACCEPTED)
   ├─ 操縦者の明示的な「送信」操作により、04_運航記録（A4日付/連番シート原本複製）、BAT履歴、機体累計等のアプリ管理記録を外部確定台帳へ確定保存
   └─ ［CURRENT-PROPOSAL］第1時点でKML保存が未同期だった場合、この最終送信操作時または通信復帰時に未同期KMLの再保存を試みる案（具体的retry/sync方式はPENDING-C1-SYNC）
```

- **障害分離境界（最重要・CURRENT-ACCEPTED）**:
  1. **Drive/Sheets/KML側の同期失敗だけを理由にDIPSへ再通報しない**:
     - Google SheetsやGoogle Drive（KML保存）の通信失敗・同期障害だけを理由として、DIPSへ飛行計画を再通報してはならない。DIPS通報と外部台帳/KML同期は完全に独立した別系統として扱う。
  2. **KML失敗による共有飛行リスト登録の非ブロッキング**:
     - KMLの生成やDrive保存が失敗した場合でも、DIPS通報が完了した飛行計画の共有飛行リストへの登録を阻害してはならない。
  3. **保存済みKMLの重複保存防止（業務原則・CURRENT-ACCEPTED）**:
     - すでに07フォルダーに保存済みのKMLを、後続処理で不必要に二重生成・二重保存しない。
     - 重複回避を実現する具体的な物理方式（ハッシュ検査、メタデータ照合等）は `PENDING-C1-SYNC` へ留保する。
  4. **低コスト運用の徹底**:
     - 全利用者データの中央集約を避け、各運用環境のGoogle Drive容量を利用する。Google Maps等の従量課金APIは無料枠と利用量を考慮し、必要最小限の利用に限定する。

---

## 4. 外部退避・復旧形式と残る保護範囲

[ADR-0008](../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) により、旧ユーザー向けJSON全量エクスポート/インポート復旧は現行要件から外します。暗号化/プレーンJSON、全テーブル一括ファイル、UUID照合によるマージという旧案の履歴は同ADRに残します。

- 端末側一時保持、永続化要求・状態監視、運航完了時のSheets確定台帳同期を維持します。
- Sheetsからの復旧対象は同期・保存されている台帳データです。未同期レコード・端末設定などを含む全量DB復旧を保証しません。
- ローカル全量DB backup/restoreの将来ユーザー形式・検証/暗号化・競合処理は `PENDING-LOCAL-RESTORE-01`。C1でユーザー向けJSON import/exportや代替形式を実装しません。
- KMLは地理表示・共有、PDFは帳票であり、DBバックアップやrestoreの代替にしません。復旧の失敗時対応は [19 Failure Recovery](19_failure-recovery.md) を参照します。

---

## 5. 他の正本との契約

同期ジョブの概念・送信先別再試行境界は本書が正本です。Data Authorityと手修正尊重は [11](11_data-authority.md)、DipsSubmission型は [12d](domain-model/12d_flight-plan-and-dips.md)、状態の定義・遷移は [13 状態管理目次](state-machines/README.md)、Manual手順は [24](dips-submission/24_manual-submission.md)、Sheets論理台帳は [24a](dips-submission/24a_submission-and-sheets-ledger.md) に従います。第3.4節は保存順序の説明であり、状態や確認条件を独立定義しません。

KML保存ジョブは [27b](output/27b_google-drive-storage.md)、PDFのオフライン成立条件は [18](18_reports.md)、地図エンジンの選定留保は [ADR-0009](../decisions/ADR-0009-map-renderer-selection-deferred-to-c5.md) を参照します。アプリ停止中のバックグラウンド再試行は保証せず、実行可能時・アプリ再開時に未完了キューを再開します。
