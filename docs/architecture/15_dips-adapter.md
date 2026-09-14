# 15. DIPS 2.0 Adapter境界設計（15_dips-adapter.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計）

---

## 1. DIPS Adapterの責務と基本設計思想

DIPS Adapterは、国土交通省の「DIPS 2.0（ドローン情報基盤システム2.0）」との通信仕様を適切にカプセル化し、**外部APIの仕様変更や未確認要件がアプリ本体（UI・運航管理・飛行日誌）へ波及することを遮断する防波堤（Anti-Corruption Layer）**として機能します。

```text
┌────────────────────────────────────────────────────────┐
│ クライアント Core / UI / 運航管理                     │
│  - 内部FlightPlan / 不変DipsSubmission スナップショット │
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
│  │ - クリップボード抽出 │ - 擬似エラーシミュレート   │ │
│  │ - 操縦者手動打刻記録 │ - オフライン開発完結       │ │
│  └──────────────────────┴────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  ApiDipsAdapter 【将来・利用承認時 Optional】      │ │
│  │  - DRS / FPA / FPR レルム別 OIDC / REST 通信      │ │
│  └──────────────────────┬────────────────────────────┘ │
└─────────────────────────┼──────────────────────────────┘
                          │ (API利用可能時のみ中継)
                          ▼
┌────────────────────────────────────────────────────────┐
│ バックエンド中継境界 (Cloudflare Workers Proxy)        │
│  - client_secretの安全な秘匿保管                       │
│  - 各realmのToken Endpoint / API EndpointへのHTTPS中継 │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│ 国土交通省 DIPS 2.0 (外部API)                          │
└────────────────────────────────────────────────────────┘
```

---

## 2. 3系統の認証レルム（Realm）と論理分離

国交省公式仕様書（2026年9月確認）に基づき、3系統の独立したアダプターを設けます。

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
- **冪等性・二重通報防止**: 国交省FPR APIは利用者独自の `Idempotency-Key` ヘッダを解釈しないため、POST切断時の自動再送は行わず、`reconcileFlightPlan()` による既存計画検索で重複登録を防止します。

---

## 3. 未確認事項の吸収アーキテクチャ

国交省公式ガイドラインで確認済みの事項と、未確認の事項をAdapter内部で以下のように吸収します。

| 項目 | 現状の事実・未確認 | DIPS Adapterでの吸収設計 |
|---|---|---|
| **認証プロトコル** | **【確認済】** OIDC / 認可コードフロー | Workers側で標準的なAuthorization Code/Token交換ロジックを実装。 |
| **`client_secret` 必須性** | **【確認済】** トークン要求に必要 | クライアントへ露出させず、Cloudflare Workers Secretsで安全に保管。 |
| **重複防止ヘッダ** | **【確認済】** 独自Idempotency-Keyは未提供 | 結果不明時はPOST再送を行わず、検索APIによる照合（Reconciliation）を必須化。 |
| **credentialの発行単位** | **【未確認】** 3系統共通か個別か | 設定ファイル（Config）で `shared_credentials: true/false` を切り替え可能な構造とし、個別キーでも共通キーでもコード変更なしで対応。 |
| **利用申請主体（資格）** | **【確認済】** 現行案内は法人・団体対象<br>**【未確認】** 個人の申請条件 | クライアント側には `MockDipsAdapter` を用意。正式キー取得前でも全UI・計画作成・通報キューの動作検証を実施可能にする。 |
| **複数realmのSSO挙動** | **【未確認】** 1回ログインで全realm有効か | TokenManagerにおいて各realm（`drs-utm`, `drs-req`, `drs-fpl`）ごとに独立したTokenストアを保持し、個別トークンが必要な場合も自動ハンドリング。 |

---

## 4. 共通インターフェース定義（TypeScript）

APIの有無によってアプリ本体のデータ構造や呼び出し元コードを変更させないため、共通の通報アダプターインターフェース `IDipsSubmissionAdapter` を定義します。

```typescript
// 提出方式
export type DipsSubmissionMethod = 'manual' | 'api' | 'mock';

// 手動入力支援用DTO
export interface ManualAssistanceData {
  flightPlanId: string;
  revision: number;
  plannedStartTimeFormatted: string;   // 例: "2026/10/20 10:00"
  plannedEndTimeFormatted: string;     // 例: "2026/10/20 12:00"
  locationName: string;                // 例: "〇〇町飛行場"
  coordinatesText: string;             // 例: "33.456789, 129.876543"
  radiusMetersText: string;            // 例: "150m"
  altitudeAglText: string;             // 例: "30m (AGL)"
  aircraftRegistrationMark: string;    // 例: "JU324XXXXXXX"
  aircraftModel: string;               // 例: "EVO Lite Series"
  pilotName: string;                   // 例: "山田 太郎"
  pilotLicenseNumber: string;          // 例: "第XXXXX号"
  flightPurpose: string;               // 例: "空撮"
  flightType: string;                  // 例: "目視内飛行・昼間飛行"
  permissionNumber: string;            // 例: "国空航第XXXXX号"
  dipsWebUrl: string;                  // DIPS 2.0 ログイン/飛行計画通報画面URL
}

// 通報結果
export interface DipsSubmissionResult {
  success: boolean;
  method: DipsSubmissionMethod;
  dipsPlanId?: string | null;          // nullable / optional (手動確認で番号未取得時はnull)
  confirmationMethod?: 'flight_plan_list_match' | 'displayed_id' | 'api_response';
  status: 'snapshot_saved' | 'manual_submit_wait' | 'manual_submitted' | 'dips_confirmed' | 'submission_uncertain' | 'failed';
  errorMessage?: string;
  submittedAt: string;
  confirmedAt?: string;
}

// 通報アダプター共通インターフェース
export interface IDipsSubmissionAdapter {
  readonly method: DipsSubmissionMethod;
  
  // 提出準備（スナップショット検証・外部台帳退避用データ生成）
  prepareSubmission(plan: InternalFlightPlan): Promise<DipsSubmissionPayload>;
  
  // 通報実行（手動支援表示、またはAPI送信、またはモック実行）
  executeSubmission(payload: DipsSubmissionPayload): Promise<DipsSubmissionResult>;
  
  // 手動入力支援データの取得（手動アダプター時）
  getManualAssistanceData(payload: DipsSubmissionPayload): ManualAssistanceData;
  
  // 計画取消
  cancelPlan(dipsPlanId: string, reason: string): Promise<boolean>;
}

// API接続用サービス（承認時 Optional）
export interface IDipsApiService extends IDipsSubmissionAdapter {
  getAuthStatus(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<DipsAuthStatus>;
  login(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<void>;
  logout(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<void>;
  reconcileFlightPlan(criteria: DipsPlanSearchCriteria): Promise<DipsReconciliationResult>;
}
```

---

## 5. アダプター実装区分（Manual / Mock / API）

### 5.1 ManualDipsAdapter（手動通報アダプター - 正式・第一級）
- **役割**: DIPS API未取得時、電波微弱時、または手動運用を選択した場合の基幹アダプター。
- **挙動**:
  1. 内部飛行計画から不変の `payload_snapshot` を生成しローカル保存（status: 'snapshot_saved'）。
  2. Googleスプレッドシート「DIPS飛行計画台帳」へ非同期同期ジョブ（sync_status: 'sync_pending'）を登録（Sheets同期完了は待たずに通報可能）。
  3. スマホ画面に「手動入力支援画面（コピー用UI）」を表示。
  4. 操縦者が「DIPSへ入力完了」をタップした時点で `manual_submitted` を記録。
  5. 操縦者がDIPS画面で受付番号を入力、またはDIPS飛行計画一覧の一致を目視確認した時点で `dips_confirmed`（`confirmation_method: 'displayed_id'` または `'flight_plan_list_match'`、受付番号は任意）を記録。

### 5.2 MockDipsAdapter（開発・テスト用モック）
- **役割**: 外部APIやDIPS本番環境を汚染せずに、通報成功・エラー・照合の全フローをテスト。
- **挙動**:
  - 擬似受付番号（例: `MOCK-DIPS-2026-XXXX`）を発行。
  - 画面上に **`[MOCK] 疑似通報`** と明確に表示し、本物の通報と混同させない。

### 5.3 ApiDipsAdapter（DIPS 2.0 APIアダプター - 利用承認時 Optional）
- **役割**: 国交省審査を通過し、credentialが発行された場合のみ有効化する自動連携プラグイン。
- **挙動**:
  - Cloudflare Workers中継プロキシを経由してDIPS 2.0 FPRエンドポイントへJSON送信。
  - レスポンスから受付番号を自動抽出し、`dips_confirmed`（confirmation_method: 'api_response'）を記録。

---

## 6. 手動入力支援画面（Manual Assistance Screen）設計

DIPS APIがない場合でも、スマートフォン1台でストレスなくDIPS Web画面へ必要事項を転記できるよう、専用の「手動入力支援画面」を提供します。

### 6.1 画面構成と1タップコピーUI
- **上部**: 「DIPS Webを開く」外部リンクボタン（ブラウザの別タブで開く）。
- **注意文**: 「※DIPS側へ自動入力はされません。各項目の『コピー』を押し、DIPS画面へ貼り付けてください」。
- **項目リスト（各項目にワンタップ「コピー」ボタン付き）**:
  - 飛行予定日時（開始・終了）
  - 飛行場所・名称
  - 緯度経度（10進数）
  - 飛行高度（AGL対地高度）
  - 飛行範囲半径（m）
  - 機体登録記号（JU324...）
  - 操縦者氏名・技能証明番号
  - 飛行目的（空撮・点検等）
  - 飛行形態（昼間・目視内等）
  - 許可承認番号
- **下部アクション**:
  - **「DIPSへ手動通報した」ボタン**: 押下により `MANUAL_SUBMITTED` 状態を打刻。
  - **「通報結果の確認完了」操作**:
    - パターンA（番号確認時）: DIPS画面に表示された計画番号/受付番号を入力し、`confirmation_method: 'displayed_id'` で `DIPS_CONFIRMED` へ更新。
    - パターンB（一覧目視照合時）: DIPS「飛行計画一覧」画面で日時・機体・範囲の一致を目視確認し「一覧で確認済み」をチェックすることで、番号未取得のまま `confirmation_method: 'flight_plan_list_match'` で安全に `DIPS_CONFIRMED` へ更新可能。
