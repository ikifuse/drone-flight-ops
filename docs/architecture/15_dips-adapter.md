# 15. DIPS 2.0 Adapter境界設計（15_dips-adapter.md）

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計）

---

## 1. DIPS Adapterの責務と基本設計思想

DIPS Adapterは、国土交通省の「DIPS 2.0（ドローン情報基盤システム2.0）」との通信仕様を適切にカプセル化し、**外部APIの仕様変更や未確認要件がアプリ本体（UI・運航管理・飛行日誌）へ波及することを遮断する防波堤（Anti-Corruption Layer）**として機能します。

> [!IMPORTANT]
> **API JSON 生成の内部局所性と手動アダプターの完全分離**:
> - **API JSON 生成は `ApiDipsAdapter` の内部責務**です。これは国交省APIとの通信電文（Wire Format）に過ぎず、**ユーザー向けにJSONファイルとして出力・エクスポートするものではありません**。
> - **`ManualDipsAdapter` は API JSON payload の生成を前提としません**。手動通報支援は意味論的Snapshot（`submission_snapshot`）から直接、人間の視認・1タップコピーに適した ViewModel（`DipsManualEntryViewModel`）を生成します。
> - 本書に記載された OIDC フロー、認証レルム（`drs-utm`, `drs-req`, `drs-fpl`）、エンドポイント候補、は、公式仕様書に基づく調査結果・設計候補資産であり、**正式なAPI利用承認・credential取得前の実装確定事項ではありません**。正式資格が取得された場合のみ Phase C7（Optional Integration）開始時に最新公式仕様と突き合わせて再確認します。旧Workers ProxyはHISTORICALであり、現在接続経路と変更理由は[33a](dips-infrastructure/33a_fixed-egress-and-api-connection.md)。C7の実装開始は別の承認・ゲートに従います。

```text
┌────────────────────────────────────────────────────────┐
│ クライアント Core / UI / 運航管理                     │
│  - 内部FlightPlan / 不変 submission_snapshot           │
│  - IDipsSubmissionAdapter (共通通報インターフェース)   │
└───────────────────────────┬────────────────────────────┘
                            │ (共通インターフェース呼出)
                            ▼
┌────────────────────────────────────────────────────────┐
│ 通報アダプター群（Multi-Adapter Strategy）            │
│  ┌──────────────────────┬────────────────────────────┐ │
│  │  ManualDipsAdapter   │      MockDipsAdapter       │ │
│  │ 【正式・第一級対応】 │ 【開発・テスト・検証用】   │ │
│  │ - 手動入力支援画面DTO│ - 擬似受付番号発行         │ │
│  │ - 1タップコピー展開  │ - 擬似エラーシミュレート   │ │
│  │ - 操縦者手動確認記録 │ - オフライン開発完結       │ │
│  │ ※JSON生成は行わない │ ※JSON生成は行わない       │ │
│  └──────────────────────┴────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  ApiDipsAdapter 【将来・利用承認時 Optional (C7)】 │ │
│  │  - DRS / FPA / FPR 契約別通信（認証はVERIFY）      │ │
│  │  - DIPS API exact outbound JSON の内部生成        │ │
│  │  - api_payload_snapshot (nullable) の記録         │ │
│  └──────────────────────┬────────────────────────────┘ │
└─────────────────────────┼──────────────────────────────┘
                          │ (API利用可能時のみ中継)
                          ▼
┌────────────────────────────────────────────────────────┐
│ バックエンド中継境界（固定出口経路は33a正本）        │
│  - client_secretの安全な秘匿保管                       │
│  - 正式契約確認後の認証・API HTTPS中継 │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│ 国土交通省 DIPS 2.0 (外部API)                          │
└────────────────────────────────────────────────────────┘
```

---

## 2. 3系統の認証レルム（Realm）と論理分離

以下の具体realm・endpoint・メソッドは、旧設計が2026年9月の公式調査として記録したHISTORICAL / EVIDENCE/EXAMPLEです。業務差分の論理分離を維持しますが、現在の接続先契約として再認定しません。正式認証・endpoint・照合の利用条件はVERIFY-S4-API-CONTRACT（[16 §9](16_security.md#9-step-4の認証確認と保持方式の未確定)）。

### 2.1 DRS Adapter（機体登録系: `drs-utm`）
- **対象業務**: DIPS登録記号（JU324...）、有効期限、機体スペック情報の自動取得・照合。
- **認可エンドポイント**: `/auth/realms/drs-utm/protocol/openid-connect/auth`
- **トークンエンドポイント**: `/auth/realms/drs-utm/protocol/openid-connect/token`
- **主要メソッド**: `fetchRegisteredAircraftList()`, `verifyRegistrationMark(mark)`

### 2.2 FPA Adapter（飛行許可・承認系: `drs-req`）
- **対象業務**: 航空法に基づく特定飛行の飛行許可・承認情報（国空航第...）、許可番号、期間、付加条件の照合。
- **認可エンドポイント**: `/auth/realms/drs-req/protocol/openid-connect/auth`
- **トークンエンドポイント**: `/auth/realms/drs-req/protocol/openid-connect/token`
- **主要メソッド**: `fetchApprovedPermissions()`, `verifyPermissionNumber(num)`

### 2.3 FPR Adapter（飛行計画通報系: `drs-fpl`）
- **対象業務**: 飛行計画の作成・通報、通報状況照会、通報取消、周辺他機飛行計画の照会、送信結果不明時の計画照合（Reconciliation）。
- **認可エンドポイント**: `/auth/realms/drs-fpl/protocol/openid-connect/auth`
- **トークンエンドポイント**: `/auth/realms/drs-fpl/protocol/openid-connect/token`
- **主要メソッド**: `submitFlightPlan(planPayload)`, `queryPlanStatus(planId)`, `reconcileFlightPlan(criteria)`, `cancelFlightPlan(planId)`
- **冪等性・二重通報防止**: 旧調査の「独自 `Idempotency-Key` 未提供」は今回再認定しない。現在の通信安全境界は、未確認の重複防止保証へ依存せず、結果不明時に再POSTしないこと（[33b §2](dips-infrastructure/33b_api-availability-and-retry-boundaries.md#2-通常同期とdips正式通報を分けた因果)）。具体的な検索API契約はVERIFY。

---

## 3. 未確認事項の吸収アーキテクチャ

旧調査の確認記録と、99.2 §7で追加確認された申請・固定IP条件を区別する。詳細なネットワーク因果は33a、秘密／認証確認は16へ一本化する。

| 項目 | 旧状態から現在の扱い | Adapterの境界 |
|---|---|---|
| 認証プロトコル・realm・Token Endpoint | 旧公式調査のOIDC／認可コード例はEVIDENCE/EXAMPLE。正式接続仕様・通知への照合はVERIFY | 旧フローをそのまま実装契約にしない |
| client_secret | クライアントへ置かない意味は維持。通知は未受領 | 16の秘密隔離境界へ接続。Workers Secretsの製品指定は過去設計 |
| 重複防止契約 | 旧ヘッダ非提供の記録と、現在の仕様保証を区別 | 結果不明時の再POST禁止は33b。検索・照合の具体契約はVERIFY |
| credentialの発行単位・複数realmのSSO | 旧Config切替・realm別Tokenストア案はHISTORICALな設計候補 | 共通／個別・SSO・保持方式を推定で確定しない |
| 個人申請・固定IP | 99.2に個人申請可能・専有固定IP条件の確認、最終訂正版送付済みの記録（33a） | API利用承認・credential発行とは別。Manual／Mockの独立を維持 |

---

## 4. 共通インターフェース定義（TypeScript）

APIの有無によってアプリ本体のデータ構造や呼び出し元コードを変更させないため、共通の通報アダプターインターフェース `IDipsSubmissionAdapter` を定義します。

```typescript
// 提出方式
// 型定義の正本は12d。以下はAdapterが利用する型の参照例。
export type DipsSubmissionMethod = 'manual' | 'api' | 'mock';

// 手動支援ViewModelは25bが正本。旧ManualAssistanceDataはこの型へ名称統一。
// 具体型はC6で25bの表示契約に沿って実装する。
// import type { DipsManualEntryViewModel } from application boundary;

// 通報結果
export interface DipsSubmissionResult {
  success: boolean;
  method: DipsSubmissionMethod;
  dipsPlanId?: string | null;          // nullable / optional (手動確認で番号未取得時はnull)
  confirmationMethod?: 'flight_plan_list_match' | 'displayed_id' | 'api_response';
  status: DipsSubmissionStatus;         // 正本: 13b DIPS状態、12dから参照
  errorMessage?: string;
  submittedAt?: string;               // 実通報の打刻またはAPI送出時のみ。支援表示中は未設定。
  confirmedAt?: string;
}

// 通報アダプター共通インターフェース
export interface IDipsSubmissionAdapter {
  readonly method: DipsSubmissionMethod;
  
  // 提出準備（スナップショット検証・外部台帳退避用データ生成）
  prepareSubmission(plan: InternalFlightPlan): Promise<DipsSubmissionSnapshot>;
  
  // 通報実行（手動支援表示、またはAPI送信、またはモック実行）
  executeSubmission(snapshot: DipsSubmissionSnapshot): Promise<DipsSubmissionResult>;
  
  // 手動入力支援データの取得（手動アダプター時）
  getManualAssistanceData(snapshot: DipsSubmissionSnapshot): DipsManualEntryViewModel;
  
  // 内部提出記録を起点に取消。手動通報ではdips_plan_idがnullでも利用可能。
  cancelPlan(submissionId: string, reason: string): Promise<boolean>;
}

// API接続用サービスの旧realm別インターフェース例（HISTORICAL / VERIFY）
// 正式契約受領前に具体realmや認証方式を確定しない。共通Manual契約とは別。
export interface IDipsApiService extends IDipsSubmissionAdapter {
  getAuthStatus(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<DipsAuthStatus>;
  login(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<void>;
  logout(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<void>;
  reconcileFlightPlan(criteria: DipsPlanSearchCriteria): Promise<DipsReconciliationResult>;
}
```

取消は内部 `submission_id` から提出記録・Snapshot・確認方法を解決する。ManualではDIPS Web側で該当計画を確認して取消操作を行った後、外部番号がnullでも内部記録へ取消を打刻できる。API経路だけは公式取消契約が要求する外部計画ID等を取得・照合し、不足時は推測したIDで送信せず手動確認へ案内する。取消履歴・改訂の正本は[12d](domain-model/12d_flight-plan-and-dips.md)と[13b](state-machines/13b_dips-submission.md)。

---

## 5. アダプター実装区分（Manual / Mock / API）

### 5.1 ManualDipsAdapter（手動通報アダプター - 正式・第一級）
- **役割**: DIPS API未取得時、電波微弱時、または手動運用を選択した場合の基幹アダプター。
- **挙動**:
  1. 内部飛行計画から不変の `submission_snapshot` を生成しローカル保存（status: 'SNAPSHOT_SAVED'）。API JSON payloadの生成は行わない。
  2. Googleスプレッドシート「DIPS飛行計画台帳」へ非同期同期ジョブ（`SyncJob.status: 'pending'`）を登録。Entity側の `DipsSubmission.sync_status: 'sync_pending'` とは別軸で管理（Sheets同期完了は待たずに通報可能）。
  3. スマホ画面に「手動入力支援画面（コピー用UI）」を表示。
  4. 通報操作者がDIPS Webで実際の通報操作を行い、「DIPSへ手動通報した」をタップした時点で `MANUAL_SUBMITTED` を記録。入力やコピーの完了だけではこの状態にしない。
  5. 通報操作者がDIPS画面で受付番号を入力、またはDIPS飛行計画一覧の一致を目視確認した時点で `DIPS_CONFIRMED`（`confirmation_method: 'displayed_id'` または `'flight_plan_list_match'`、受付番号は任意）を記録。

### 5.2 MockDipsAdapter（開発・テスト用モック）
- **役割**: 外部APIやDIPS本番環境を汚染せずに、通報成功・エラー・照合の全フローをテスト。
- **挙動**:
  - 擬似受付番号（例: `MOCK-DIPS-2026-XXXX`）を発行。
  - 画面上に **`[MOCK] 疑似通報`** と明確に表示し、本物の通報と混同させない。

### 5.3 ApiDipsAdapter（DIPS 2.0 APIアダプター - 利用承認時 Optional）
- **役割**: 国交省審査を通過し、credentialが発行された場合のみ有効化する自動連携プラグイン。
- **挙動**:
  - [33a](dips-infrastructure/33a_fixed-egress-and-api-connection.md)の現在接続経路を通して、正式契約で確認したDIPS FPR APIへJSON送信。
  - DIPS公式API仕様で定義された成功レスポンスを受領・検証後、計画ID等を抽出し、`API_CONFIRMED`（confirmation_method: 'api_response'）を記録。

---

## 6. Manual入力支援の正本とAdapterの責務

登録済Picker、checkbox、構造化数値/日時、1タップコピー、受付番号または一覧照合による確認操作は[25b Manual Web mapping](dips-flight-plan/25b_manual-web-mapping.md)を正本とする。旧15の全表示項目と下部操作、旧24の確認パターンを同書へ統合した。Adapterは意味論的SnapshotをViewModelへ渡し、ユーザーの手動通報打刻と確認操作を状態管理へ通知する。

状態名・遷移の正本は[状態設計群](state-machines/README.md)、DipsSubmission / Snapshot型は[12d](domain-model/12d_flight-plan-and-dips.md)。共通インターフェースの `DipsSubmissionSnapshot` は12dの `submission_snapshot` 型を指し、API wire DTOではない。`DipsSubmissionResult.success` は操作結果であり、手動通報時にDIPS受理を独立に保証するboolではない。

C7送信DTO・コード変換・API契約版・exact outbound JSONの正本は[25c](dips-flight-plan/25c_api-payload-mapping.md)。認証および機密管理は[16](16_security.md)に従う。API未承認時はこれらの実装を要求しない。

Step 5の正常API受付後・重複なしの画面と共有リスト掲載契機は[34d](presentation/34d_dips-accepted-and-plan-content.md)。Adapterは正常応答の意味を画面へ渡し、表示文言・ボタンを本書へ複製しない。Manualの既存確認契約、正式認証VERIFY、payload責任は維持する。
