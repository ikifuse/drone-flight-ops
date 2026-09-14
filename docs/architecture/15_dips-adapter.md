# 15. DIPS 2.0 Adapter境界設計（15_dips-adapter.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計）

---

## 1. DIPS Adapterの責務と基本設計思想

DIPS Adapterは、国土交通省の「DIPS 2.0（ドローン情報基盤システム2.0）」との通信仕様を完全にカプセル化し、**外部APIの仕様変更や未確認要件がアプリ本体（UI・運航管理・飛行日誌）へ波及することを遮断する防波堤（Anti-Corruption Layer）**として機能します。

```text
┌────────────────────────────────────────────────────────┐
│ クライアント Core / UI / 運航管理                     │
│  - IDipsService (共通インターフェース)                │
└───────────────────────────┬────────────────────────────┘
                            │ (抽象化メソッド呼出)
                            ▼
┌────────────────────────────────────────────────────────┐
│ DIPS Adapter レイヤー                                  │
│  ┌─────────────────┬─────────────────┬────────────────┐│
│  │   DRS Adapter   │   FPA Adapter   │  FPR Adapter   ││
│  │ (機体登録系)    │ (飛行許可承認系)│ (飛行計画通報) ││
│  │ realm: drs-utm  │ realm: drs-req  │ realm: drs-fpl ││
│  └────────┬────────┴────────┬────────┴────────┬───────┘│
└───────────┼─────────────────┼─────────────────┼────────┘
            │                 │                 │
            ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────┐
│ バックエンド中継境界 (Cloudflare Workers Proxy)        │
│  - client_secretの安全な秘匿保管                       │
│  - 各realmのToken Endpoint / API EndpointへのHTTPS中継 │
└───────────────────────────┬────────────────────────────┘
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
- **対象業務**: 航空法第132条の85に基づく包括許可・承認情報、許可番号、期間、付加条件の照合。
- **認可エンドポイント**: `/auth/realms/drs-req/protocol/openid-connect/auth`
- **トークンエンドポイント**: `/auth/realms/drs-req/protocol/openid-connect/token`
- **主要メソッド**: `fetchApprovedPermissions()`, `verifyPermissionNumber(num)`

### 2.3 FPR Adapter（飛行計画通報系: `drs-fpl`）
- **対象業務**: 飛行計画の作成・通報、通報状況照会、通報取消、周辺他機飛行計画の照会。
- **認可エンドポイント**: `/auth/realms/drs-fpl/protocol/openid-connect/auth`
- **トークンエンドポイント**: `/auth/realms/drs-fpl/protocol/openid-connect/token`
- **主要メソッド**: `submitFlightPlan(planPayload)`, `queryPlanStatus(planId)`, `cancelFlightPlan(planId)`

---

## 3. 未確認事項の吸収アーキテクチャ

国交省公式ガイドラインで確認済みの事項と、未確認の事項をAdapter内部で以下のように吸収します。

| 項目 | 現状の事実・未確認 | DIPS Adapterでの吸収設計 |
|---|---|---|
| **認証プロトコル** | **【確認済】** OIDC / 認可コードフロー | Workers側で標準的なAuthorization Code/Token交換ロジックを実装。 |
| **`client_secret` 必須性** | **【確認済】** トークン要求に必要 | クライアントへ露出させず、WorkersのSecret Managerで安全に保管。 |
| **credentialの発行単位** | **【未確認】** 3系統共通か個別か | 設定ファイル（Config）で `shared_credentials: true/false` を切り替え可能な構造とし、個別キーでも共通キーでもコード変更なしで対応。 |
| **利用申請主体（資格）** | **【確認済】** 現行案内は法人・団体対象<br>**【未確認】** 個人の申請条件 | クライアント側には `MockDipsAdapter` を用意。正式キー取得前でも全UI・計画作成・通報キューの動作検証を完全実施可能にする。 |
| **複数realmのSSO挙動** | **【未確認】** 1回ログインで全realm有効か | TokenManagerにおいて各realm（`drs-utm`, `drs-req`, `drs-fpl`）ごとに独立したTokenストアを保持し、個別トークンが必要な場合も自動ハンドリング。 |

---

## 4. 共通インターフェース定義（TypeScript）

```typescript
export interface IDipsService {
  // 接続確認・認証状態
  getAuthStatus(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<DipsAuthStatus>;
  login(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<void>;
  logout(realm: 'drs-utm' | 'drs-req' | 'drs-fpl'): Promise<void>;

  // DRS: 機体登録
  getRegisteredAircraft(): Promise<DipsAircraftDTO[]>;

  // FPA: 許可承認
  getApprovedPermissions(): Promise<DipsPermissionDTO[]>;

  // FPR: 飛行計画通報
  submitFlightPlan(plan: InternalFlightPlan): Promise<DipsSubmissionResult>;
  cancelFlightPlan(dipsPlanId: string): Promise<boolean>;
  getSurroundingPlans(area: FlightAreaDTO, timeRange: TimeRangeDTO): Promise<DipsPlanDTO[]>;
}
```

---

## 5. テスト用モック（`MockDipsAdapter`）の設計

開発中およびAPI利用申請の審査中においても、Phase Cの実装・単体テスト・E2Eテストが完全に進められるよう、`MockDipsAdapter` を用意します。

- ネットワーク通信を行わず、ローカルでリアルなDIPS受付番号（例: `DIPS-202609-MOCK-XXXX`）を生成。
- 意図的なバリデーションエラー、503一時通信エラー、トークン期限切れなどのシミュレーション機能を備え、エラーハンドリングUIの堅牢性を事前検証。
