# 25d. DIPS Field Requirement・入力充足判定

最終更新: 2026-09-23\
状態: 設計整合（C1未着手）\
主責務: 3軸要件、effective値、validation、SUBMISSION_READY\
入口: [DIPS Flight Plan設計群](README.md)

本書は `DipsFieldRequirement` / `DipsFieldRequirementEngine` の正本。外部契約ルールを受け取る判定サービスとしてCore意味論とDIPS契約の境界に置き、基礎Entityへ外部コードを混入させない。通報要否と離陸判断は[13c](../state-machines/13c_takeoff-readiness.md)の別責務である。

## 1. 必須性・適用性・入力責任の「独立3軸評価モデル」

DIPS APIにおける各フィールドの取り扱いを、単一の「必須/任意」という1軸で表現することを厳禁とします。\
**「DIPS API上で必須」＝「ユーザーが毎回手入力」ではありません**。また、**「API仕様上存在する」＝「今回の飛行で必ず該当する」でもありません**。\
新アプリでは、すべてのDIPSフィールドを以下の**独立した3軸**によって直交評価します。

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 軸 A: DIPS Contract Requirement（API規約上の要求度）                        │
│   - REQUIRED              : DIPS仕様上、通報データに常に含まれるべき項目     │
│   - CONDITIONAL_REQUIRED  : 特定の先行条件（フラグ等）成立時に必須となる項目 │
│   - OPTIONAL              : 送信しても空欄でも受理される項目                 │
│   - NOT_SENT              : API送信対象外（アプリ内・照会専用）             │
│   - RESPONSE_ONLY         : DIPS側からの応答・照会時のみ受信する項目         │
│   - LEGACY                : 制度移行期互換項目（将来廃止予定）               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ 評価
┌─────────────────────────────────────────────────────────────────────────────┐
│ 軸 B: Applicability（今回の計画への適用性）                                 │
│   - APPLICABLE        : 今回の飛行計画の条件に該当し、評価・通報対象となる   │
│   - NOT_APPLICABLE    : 今回の飛行条件に該当せず、入力・提出不要             │
│   - CONDITION_PENDING : 先行フラグ未決定のため適用可否が保留されている状態   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ 解決
┌─────────────────────────────────────────────────────────────────────────────┐
│ 軸 C: Input Responsibility（値の調達責任・取得元）                          │
│   - USER_INPUT                : ユーザーが現場・画面で入力・確定             │
│   - MASTER                    : 機体/人員/許可/保険台帳等から自動引き当て   │
│   - PRESET                    : 目的・安全措置プリセット等から初期ロード     │
│   - DERIVED                   : 他フィールドから自動計算（終了時刻、人数等） │
│   - DIPS_REGISTERED_SELECTION : DIPS Web画面上で登録済台帳から選択           │
│   - SYSTEM_METADATA           : システムが自動付与（リビジョン、識別名等）   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1. 3軸評価の具体例
1. **操縦者氏名 (No.6)**:
   - Contract Requirement: `REQUIRED`
   - Applicability: `APPLICABLE`
   - Input Responsibility: `MASTER`（人員マスターから自動取得。ユーザーの手入力は不要）
2. **技能証明書番号 (No.9)**:
   - Contract Requirement: `CONDITIONAL_REQUIRED`
   - Applicability: 国家資格あり → `APPLICABLE` / なし → `NOT_APPLICABLE`
   - Input Responsibility: `MASTER`
3. **許可承認番号 (No.46)**:
   - Contract Requirement: `CONDITIONAL_REQUIRED`
   - Applicability: 今回の飛行で許可承認を使用 → `APPLICABLE` / 使用しない（特定飛行なし等） → `NOT_APPLICABLE`
   - Input Responsibility: `MASTER` または `DIPS_REGISTERED_SELECTION`
4. **飛行目的その他理由 (No.29)**:
   - Contract Requirement: `CONDITIONAL_REQUIRED`
   - Applicability: 目的コードに「その他」を含む → `APPLICABLE` / 含まない → `NOT_APPLICABLE`
   - Input Responsibility: `USER_INPUT`

## 2. DipsFieldRequirementEngine と 判定アーキテクチャ設計

### 2.1. エンジンの責務と設計原則
`DipsFieldRequirementEngine` は、飛行計画（`FlightPlan`）、選択されたマスター（`Aircraft`, `Personnel`, `Permission`, `InsurancePolicy`）、プリセット、および運航文脈を入力として受け取り、指定された DIPS API 仕様バージョン（例: `"FPR-API-1.9"`）に基づいて、各フィールドの**「Contract Requirement」「Applicability」「Input Responsibility」「Validation Status」**を決定的に算出する契約評価サービスです。

```text
┌────────────────────────────────────────────────────────────┐
│ [入力コンテキスト Context]                                  │
│  - FlightPlan (ドラフト値・override値)                     │
│  - Aircraft, AircraftModel                                 │
│  - Personnel (主操縦者・操縦者配列・補助者配列)            │
│  - Permission (包括許可・個別許可)                         │
│  - InsurancePolicy (保険契約)                              │
│  - Location, FlightAreaPreset                              │
│  - Operation Conditions (DID, 夜間, 目視外, 30m未満等)    │
│  - contract_version: string (例: "FPR-API-1.9")            │
└─────────────────────────────┬──────────────────────────────┘
                              │ evaluate(context)
                              ▼
┌────────────────────────────────────────────────────────────┐
│ DipsFieldRequirementEngine                                 │
│  - 仕様バージョン別ルール適用 (FPR-API-1.9 Rules)          │
│  - 3軸マッピング解決 (ContractReq x Applicability x Input) │
│  - 有効値解決 (Effective Value: Master vs Override)        │
│  - Blocking 条件評価 (REQUIRED + Applicable CONDITIONAL)   │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│ [出力 Output]                                              │
│  - DipsSubmissionReadiness (計画全体の提出可否・進捗集計)  │
│  - DipsFieldValidationResult[] (全フィールド個別検証結果)  │
└────────────────────────────────────────────────────────────┘
```

### 2.2. 機体能力（Aircraft Capabilities）とDIPS空域形状の非混同原則
- **過剰設計の排除**: 業務用アプリとして機体モデルには将来的に `GNSS`, `waypoint`, `remote_id`, `night_lighting` 等の能力（`AircraftModelCapability`）を保持可能としますが、**DIPS Requirement Engine の必須判定に直結させるのはDIPS側が要求する項目（例: DRS登録有無、型式認証区分等）のみに限定**します。
- **Geometry 独立原則**: DIPSにおける飛行範囲形状（Polygon, Circle, Buffered Line）は「どの空域・範囲を飛ぶか」を表す運航ジオメトリであり、**「機体に自律Waypoint飛行機能があるか否か」とは全くの別概念**です。機体性能を理由にDIPSのPolygon必須/不要を機械的に直結判定してはなりません。

### 2.3. Effective / Override 値の解決セマンティクス
マスターやプリセットから初期値を取得する項目であっても、今回の運航計画において現場判断で値を変更（override）できる項目（総重量、航続時間、巡航速度、高度、補助者人数、緊急連絡先等）について、以下の3層で値を追跡します：

1. **`source_master_value`**: マスターまたはプリセットに登録されている元の値。
2. **`override_value`**: 今回の飛行計画（`FlightPlan`）でユーザーが一時的・意図的に指定した上書き値（未指定時は `null` / `undefined`）。
3. **`effective_value`**: 最終的に通報ペイロードおよび提出不変スナップショット（`DipsSubmission.submission_snapshot`）へ採用される確定値。
   - `effective_value = override_value ?? source_master_value`
- **マスター欠損時の救済**: 例えば操縦者マスターで電話番号が欠落しておりDIPSで必須となる場合、`FlightPlan` 画面で一時入力（override）して提出可能とするとともに、必要に応じて「人員マスター側も更新するか」を操縦者が選択できるようにします。

### 2.4. データ型・モデル定義（Domain Types）

```typescript
// 軸 A: DIPS Contract Requirement
export type DipsContractRequirement =
  | 'REQUIRED'              // 常に必須
  | 'CONDITIONAL_REQUIRED'  // 先行条件成立時に必須
  | 'OPTIONAL'              // 任意項目
  | 'NOT_SENT'              // API送信対象外
  | 'RESPONSE_ONLY'         // 照会・応答専用
  | 'LEGACY';               // 移行期互換（将来廃止予定）

// 軸 B: Applicability（今回の計画への適用性）
export type DipsFieldApplicability =
  | 'APPLICABLE'            // 今回の飛行に適用
  | 'NOT_APPLICABLE'        // 今回の飛行に不適用（評価対象外）
  | 'CONDITION_PENDING';    // 条件確定待ち

// 軸 C: Input Responsibility（値の調達責任）
export type DipsInputResponsibility =
  | 'USER_INPUT'                // ユーザー手入力
  | 'MASTER'                    // マスター台帳参照
  | 'PRESET'                    // プリセット初期値
  | 'DERIVED'                   // 自動計算
  | 'DIPS_REGISTERED_SELECTION' // DIPS側選択
  | 'SYSTEM_METADATA';          // システム自動付与

// フィールド検証ステータス
export type DipsFieldStatus =
  | 'VALID'                 // 充足・形式正常
  | 'AUTO_FILLED'           // マスター/プリセットから自動補完済
  | 'MISSING_REQUIRED'      // 必須項目未入力（Blocking）
  | 'WAITING_CONDITION'     // 先行条件未定のため保留
  | 'INVALID_FORMAT'        // 書式・型エラー（Blocking）
  | 'OUT_OF_RANGE'          // 値域エラー（Blocking）
  | 'NOT_APPLICABLE'        // 不適用（Non-blocking）
  | 'OPTIONAL_EMPTY';       // 任意項目空欄（Non-blocking）

// 単一フィールドの評価結果
export interface DipsFieldValidationResult {
  field_key: string;                       // パラメータ識別子 (例: "pilotInfo[].phone")
  dips_item_number: number;                // No.1〜No.88
  contract_requirement: DipsContractRequirement;
  applicability: DipsFieldApplicability;
  input_responsibility: DipsInputResponsibility;
  source_master_value?: unknown;
  override_value?: unknown;
  effective_value?: unknown;
  status: DipsFieldStatus;
  is_blocking: boolean;                    // SUBMISSION_READY を阻害するか
  message?: string;                        // 現場向け平易な日本語案内
}

// 計画全体の提出準備完了度（Readiness Result）
export interface DipsSubmissionReadiness {
  is_ready: boolean;                       // SUBMISSION_READY に達しているか
  contract_version: string;                // 評価基準バージョン ("FPR-API-1.9")
  evaluated_at: string;                    // 評価日時 (ISO8601)

  // 集計メトリクス（現場UI表示用）
  required_total: number;
  required_satisfied: number;
  conditional_required_total: number;
  conditional_required_satisfied: number;
  optional_total: number;
  optional_missing: number;

  // ブロッキング項目および警告
  blocking_fields: DipsFieldValidationResult[]; // is_blocking = true の一覧
  warnings: string[];                          // 非ブロッキングの注意事項
  optional_missing_keys: string[];             // 空欄の任意項目一覧
}
```

### 2.5. SUBMISSION_READY を阻害する条件（Blocking Rules）
計画が `SUBMISSION_READY`（提出準備完了）となるための厳格な論理ルールを以下のように定めます：

1. **`is_ready = true` の成立条件**:
   - `blocking_fields.length === 0`
   - 必要条件として、**`Applicability === 'APPLICABLE'` かつ (`Contract Requirement === 'REQUIRED'` または 条件成立した `CONDITIONAL_REQUIRED`) である全項目について、`effective_value` が存在し、バリデーション（型・形式・値域）を満たしていること**。
   - 上記の適用済み項目の充足だけでは十分ではない。必須/条件付必須の適用性が `CONDITION_PENDING` の項目も `is_blocking: true` として含め、未確定条件を含む全 `blocking_fields` が0件であることを必要とする。
2. **提出を阻害しない項目（Non-blocking）**:
   - **NOT_APPLICABLE 項目**: 今回の飛行条件に該当しない項目（例: 技能証明なし時の証明書番号、特定飛行なし時の許可書番号、「その他」以外選択時のその他理由等）は、空欄であってもエラーとせず、通報ペイロードからも除外される。
   - **マスター自動補完項目**: `MASTER` から有効な値が引き当てられている場合は `status: AUTO_FILLED`（形式検証も完了した有効値）となり、ユーザーの追加入力なしで充足とみなす。

---

## 3. 判定の保留・境界

- `CONDITION_PENDING` は不適用の確定ではない。必須/条件付必須の適用性が未決の項目は `WAITING_CONDITION` として提出準備完了を保留し、`is_blocking: true` とする。入力を強制するのでなく先行条件の確認を促す。
- `AUTO_FILLED` は有効な形式検証を通過した自動補完値を表す単一statusであり、同じenumが同時に `VALID` を持つという意味ではない。
- 実画面の青い `i` を必須マークと推定しない。API契約の必須と、手動Web側の入力・選択方法を区別し、Web固有の未確認validationは[26](../26_dips-web-ui-verification.md)の `PENDING-WEB-08` に残す。
- `SUBMISSION_READY` は提出内容の充足であり、通報完了・法的な飛行可能の判断ではない。非特定飛行の推奨通報、通報義務の未確定、システム障害例外および離陸打刻は[13c](../state-machines/13c_takeoff-readiness.md)の `DipsReportingRequirementEvaluator` / `TakeoffReadinessAssessment` に委譲する。
- ルール検証では「マスター充足」「その他条件」「条件未決」「override 0/false」「不適用」「不正形式」を独立に評価する。固定12入力フォームやAPI JSON生成を判定の前提にしない。

## 4. 入力時点を分ける横断監査（2026-09-23）

**CURRENT-ACCEPTED（同日のオーナー指示）**: 最終的に法定記録・DIPS通報へ必要な情報と、その画面で直ちに手入力する情報を分ける。既登録情報の再利用、自動取得、後補完、条件付き処理、別紙・原本・手動補記が既存運用として成立する場合はそちらを優先する。一般的な法令論だけで確定済みの柔軟運用をPENDINGや必須候補へ戻さない。[法令・運用規約02](../../guidelines/02_legal-and-operations-rules.md)の8区分と正式記録全体での評価を維持する。

分類は「今この工程で必要」「最終的には必要だが後補完」「マスター再利用」「条件該当時のみ」「独自の任意機能」。分類をAPIのREQUIREDと一対一対応させない。製造番号の扱いは[34g](../presentation/34g_settings-aircraft-management-and-context-display.md)を参照する。

**HISTORICAL（モックの不整合）**: 内容確認で不足を表示しても、送信ボタンの処理は同じ判定を通らず疑似正常受付に進めた。

**EVIDENCE/EXAMPLE（今回のモック）**: 既存の機体・操縦者・目的・地図・日時・速度・高度の判定を、送信確認へ進む操作と送信操作の双方へ接続。目的「その他」の説明は該当時だけ確認する。登録・計画途中でこれら全部の入力を要求しない。通報しない運航には通報用の地図・空域・方法を要求しない。許可の未入力日付を今日／1年後で捏造せず、未入力として保持する。これは外部API契約の完全なvalidationではない。

25aの88フィールドにはレスポンス・旧互換・条件付き・マスター由来も含まれる。モックの22項目が揃ったことだけで、exact API契約・未観測の6確認項目・最大飛行時間の意味・複数日単位を検証済みとはしない。既存VERIFY／PENDINGを維持し、未観測事項を現場の必須欄へ昇格させない。
