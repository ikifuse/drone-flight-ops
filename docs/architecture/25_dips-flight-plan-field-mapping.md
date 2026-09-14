# 25. DIPS飛行計画通報フィールドマッピング・入力再利用・Geometry詳細設計（25_dips-flight-plan-field-mapping.md）

最終更新: 2026-09-14  
プロジェクト: `drone-flight-ops`  
フェーズ: Phase B設計反映 / DIPS 2.0 API 1.9版・操作マニュアル詳細設計  
ステータス: **フィールド対応確定（手動通報支援C6 / API JSON生成はC7 Optional）**

---

## 1. 本文書の位置づけと公式根拠資料

### 1.1 本文書の目的と責務境界
本文書は、国土交通省の「ドローン情報基盤システム（DIPS 2.0）」における飛行計画通報について、**公式仕様に基づく通報リクエスト項目の網羅的マッピング、Core Domainとの変換境界、入力省力化（Master/Preset再利用）、およびGeometry（飛行空域形状）の仕様**を確定する正本設計書です。

- 既存の `24_b2.2-dips-manual-fallback-and-ledger.md` は、手動/APIフォールバック、提出状態マシン、`DipsSubmission` ライフサイクル、Googleスプレッドシート台帳連携を主責務とします。
- 本文書 `25_dips-flight-plan-field-mapping.md` は、**「何をDIPSへ通報するか」「各項目をアプリのどこから取得・導出するか」「Web手動入力支援とAPI自動送信の等価性」「88項目の全件定義」**を主責務とします。
- **実装フェーズの分離**: 本書のフィールド定義は手動通報支援（Phase C6）およびAPI自動送信（Phase C7 Optional）の共通基礎ですが、**DIPS API用のJSONシリアライズ実装自体は Phase C7（正式credential取得時）の責務**であり、Phase C1〜C6のブロッカーとしません。

### 1.2 正本とする公式一次資料
本設計は、以下の国土交通省およびDIPS公式一次資料のみを仕様根拠として策定しています。非公式ブログ、二次解説サイト、個人の推測は一切根拠としていません。

1. **DIPS2.0 API（飛行計画通報）接続システム向けガイドライン**
   - 確認版数: **第1.9版（2026-03-23）**
   - 参照箇所: 特に `2.3.8 飛行計画通報受付 API`（リクエストボディ項番 No.1〜No.88）
2. **無人航空機の飛行計画の通報要領**
   - 国土交通省航空局（2026-03-31 最終改正）
3. **ドローン情報基盤システム操作マニュアル（飛行計画通報編）**
   - 国土交通省（2026-06-22版）
4. **DIPS 2.0 公式注意喚起・お知らせ**
   - 「飛行計画の通報における飛行経路の適切な設定について（過大・広域な経路設定の抑制）」（2026-07-17付）

---

## 2. 外部API DTOとCore Domainの分離設計（Anti-Corruption Layer）

DIPS APIのリクエストパラメータ名（例: `flightPurpose`, `flightAirspace`, `assistantsNumber`, `flyRoute` 等）や数値コード体系を、そのままCore Domainのエンティティ属性として直接混入させることを厳禁とします。

また、**手動通報支援経路**と**将来のAPI送信経路**を明確に分離します。

```text
┌────────────────────────────────────────────────────────┐
│ [Core Domain]                                          │
│  - FlightPlan (計画日時、意味論ベースの目的・空域・形態) │
│  - Aircraft, Personnel, Permission, Location, Preset   │
│  - InsurancePolicy (保険台帳)                          │
└───────────────────────────┬────────────────────────────┘
                            │ lockForSubmission()
                            ▼
┌────────────────────────────────────────────────────────┐
│ [不変提出Snapshot] submission_snapshot                 │
│  - 提出確定時点の意味論的通報データ (不変保持)         │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼ (手動 Web 通報支援経路: C6) │
┌───────────────────────────┐              │
│ DipsManualEntryViewModel  │              │
│  - DIPS Web実画面順配置   │              │
│  - 1タップコピー用テキスト│              │
│  - 登録済選択 vs 手入力   │              │
│  ※JSONシリアライズは不要 │              │
└───────────────────────────┘              │
                                           ▼ (API 自動通報経路: C7 Optional)
                              ┌───────────────────────────┐
                              │ DipsFlightPlanMapper      │
                              │  - FPR-API-1.9 コード変換 │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │ DipsFlightPlanPayloadDTO  │
                              │  - No.1〜88 準拠 DTO      │
                              │  - 内部JSONシリアライズ   │
                              │  - api_payload_snapshot   │
                              │    (POST送信時のみ記録)   │
                              └─────────────┬─────────────┘
                                            │ (HTTPS POST)
                                            ▼
                              ┌───────────────────────────┐
                              │ DIPS 2.0 FPR-API (外部)   │
                              └───────────────────────────┘
```
              ▼
┌───────────────────────────┐
│ IDipsSubmissionAdapter    │
│  (ApiAdapter/Manual/Mock) │
└───────────────────────────┘
```

### 2.1 バージョン管理されたコード値変換（Versioned Code Mapping）
DIPS APIでは、飛行目的（1〜16）、飛行空域（1: DID, 2: 150m以上, 3: 空港周辺等）、飛行方法（1: 30m未満, 2: イベント, 3: 夜間, 4: 目視外等）のように数値コードが多用されます。これらをUIやDomainにハードコードせず、`DipsCodeMapper(contract_version)` を介して変換します。

### 2.2 意味論的スナップショット、exact outbound payload、および仕様バージョンメタデータの保持
`DipsSubmission` には以下の属性を規定します：
- `dips_contract_version`: 生成基準となったAPI仕様バージョン（例: `"FPR-API-1.9"`）。
- `submission_snapshot`: 提出確定時点の**完全な意味論的通報スナップショット**。手動通報およびAPI通報の双方で必ず保持。
- `api_payload_snapshot`: 実際にDIPS APIへ送信した**完全な exact outbound payload（JSON文字列、Phase C7 Optional、nullable）**。手動通報時はnull。
後日マスター（機体、人員、保険、場所）が改定されたり、DIPS APIが2.0へ改版された場合でも、「提出当時に何を通報しようとし／通報したか」を法的に完全再現・立証可能とします。手動通報経路においてユーザーへJSONファイルを出力・要求することはありません。

---

## 3. DIPS 2.0 API 1.9版（2.3.8）リクエストボディ No.1〜No.88 全件マッピング

### 3.0 必須性・適用性・入力責任の「独立3軸評価モデル」

DIPS APIにおける各フィールドの取り扱いを、単一の「必須/任意」という1軸で表現することを厳禁とします。  
**「DIPS API上で必須」＝「ユーザーが毎回手入力」ではありません**。また、**「API仕様上存在する」＝「今回の飛行で必ず該当する」でもありません**。  
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

#### 3軸評価の具体例
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

### 3.1 入力分類の定義
- **`MASTER`**: 登録済みマスター（`Aircraft`, `Personnel`, `Permission`, `InsurancePolicy`, `Location` 等）から自動取得。
- **`PRESET`**: 運航テンプレートまたはプリセット（`FlightPurposePreset`, `SafetyMeasurePreset`, `FlightAreaPreset`）から初期値をロード。
- **`PLAN_INPUT`**: 飛行計画ごとに現場や操縦者が確定入力（日時、高度、今回の飛行範囲等）。
- **`DERIVED`**: 他のフィールドから自動計算（終了時刻、補助者人数、面積等）。
- **`DIPS_REGISTERED`**: DIPS Web画面上で登録済み台帳から選択される項目（手動時）。
- **`CONDITIONAL`**: 特定条件（「その他」選択時、特定飛行該当時等）でのみ必須・出現。
- **`SUBMISSION_METADATA`**: 通報処理時にシステムが付与（リビジョン、タイムスタンプ等）。
- **`LEGACY`**: 制度改正により将来廃止予定、または形式的互換性のために残存している項目。
- **`UNVERIFIED`**: 公式API定義上存在するが、実画面・実運用での検証を要する項目。

### 3.2 No.1〜No.88 完全対比表

| No | DIPS項目名 | API parameter | 必須区分 | 条件 | データ型/値域 | 新アプリの取得元 | 入力分類 | API送信 | 手動Web支援 | Snapshot保存 | 備考 |
|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| 1 | 飛行計画ID | `flightPlanId` | 任意 (新規時null) | 変更/取消時必須 | 文字列 (UUID/ID) | `DipsSubmission.dips_plan_id` | SUBMISSION_METADATA | ○ | - | ○ | 新規通報時は空、改訂通報時は前回取得ID |
| 2 | 飛行計画名称 | `name` | **必須** | - | 文字列 (最大100文字) | `FlightPlan.name` / `Location.name` + 日時 | PLAN_INPUT / PRESET | ○ | コピー可 | ○ | 例: "金岡公園_定期空撮_20261020" |
| 3 | 重複飛行計画取得フラグ | `getDuplicateFlightPlanFlag` | 任意 | - | boolean (`true`/`false`) | アプリ設定 / 照会オプション | SUBMISSION_METADATA | ○ | - | ○ | 重複空域の他機計画を応答に含めるか |
| 4 | 操縦者情報リスト | `pilotInfo` | **必須** | 配列 (1以上) | Object[] | `FlightPlan.pilot_ids` | MASTER / Personnel | ○ | 選択/コピー | ○ | 配列構造（複数操縦者対応） |
| 5 | - 操縦者ID (DIPS内部) | `pilotInfo[].pilotId` | 条件付必須 | API登録済時 | 文字列 | `Personnel.dips_pilot_id` | MASTER | ○ | - | ○ | DIPS側IDがある場合 |
| 6 | - 氏名 (漢字) | `pilotInfo[].name` | **必須** | - | 文字列 | `Personnel.name` | MASTER | ○ | コピー可 | ○ | 例: "山田 太郎" |
| 7 | - 氏名 (フリガナ) | `pilotInfo[].kana` | **必須** | - | 文字列 | `Personnel.kana` | MASTER | ○ | コピー可 | ○ | 例: "ヤマダ タロウ" |
| 8 | - 技能証明保有有無 | `pilotInfo[].licenseFlag` | **必須** | - | boolean (`true`/`false`) | `Personnel.has_license` | MASTER | ○ | 画面選択 | ○ | 国家技能証明の有無 |
| 9 | - 技能証明書番号 | `pilotInfo[].licenseNumber` | 条件付必須 | `licenseFlag=true` | 文字列 | `Personnel.license_number` | MASTER | ○ | コピー可 | ○ | 国家技能証明コード |
| 10| - 技能認証保有状況 (民間) | `pilotInfo[].privateLicense` | 条件付必須 | `licenseFlag=false` | 数値コード | `Personnel.legacy_private_license` | MASTER / LEGACY | ○ | 画面選択 | ○ | **※制度改正に伴い将来廃止予定の注記あり** |
| 11| - 連絡先電話番号 | `pilotInfo[].phone` | **必須** | - | 文字列 (半角数字ハイフン) | `Personnel.contact_phone` | MASTER | ○ | コピー可 | ○ | 緊急連絡先 |
| 12| - メールアドレス | `pilotInfo[].mail` | **必須** | - | 文字列 (email形式) | `Personnel.contact_email` | MASTER | ○ | コピー可 | ○ | |
| 13| - 緊急連絡先フラグ | `pilotInfo[].emergencyContactFlag` | **必須** | - | boolean | `FlightPlan.emergency_contact_target == 'pilot'` | PLAN_INPUT | ○ | 画面選択 | ○ | 操縦者を緊急連絡先とするか |
| 14| 補助者人数 | `assistantsNumber` | **必須** | - | 整数 (0以上) | `FlightPlan.planned_assistants_count` | DERIVED / PLAN_INPUT | ○ | コピー可 | ○ | 登録Personnel数または手動override人数 |
| 15| 機体情報リスト | `aircraftInfo` | **必須** | 配列 (1以上) | Object[] | `FlightPlan.aircraft_ids` | MASTER / Aircraft | ○ | 選択/コピー | ○ | 配列構造（複数機体対応） |
| 16| - 機体ID (DIPS内部) | `aircraftInfo[].aircraftId` | 条件付必須 | DIPS登録済時 | 文字列 | `Aircraft.dips_aircraft_id` | MASTER | ○ | - | ○ | DRS API取得ID |
| 17| - 機体登録記号 | `aircraftInfo[].registrationMark` | **必須** | - | 文字列 (JU...) | `Aircraft.registration_mark` | MASTER | ○ | コピー可 | ○ | 例: "JU324XXXXXXX" |
| 18| - 機体種別 | `aircraftInfo[].type` | **必須** | - | 数値コード (1:マルチコプター等) | `AircraftModel.maker_type_code` | MASTER | ○ | 画面選択 | ○ | |
| 19| - 型式認証区分 | `aircraftInfo[].certificationType` | 任意 | - | 数値コード | `AircraftModel.certification_type` | MASTER | ○ | 画面選択 | ○ | 第一種・第二種認証機等 |
| 20| - 型式認証番号 | `aircraftInfo[].certificationNum` | 条件付必須 | 認証機の場合 | 文字列 | `AircraftModel.certification_number` | MASTER | ○ | コピー可 | ○ | |
| 21| - 機体名/愛称 | `aircraftInfo[].symbol` | 任意 | - | 文字列 | `Aircraft.nickname` | MASTER | ○ | コピー可 | ○ | 現場識別呼称 |
| 22| - 製造者名 | `aircraftInfo[].maker` | **必須** | - | 文字列 | `AircraftModel.manufacturer` | MASTER | ○ | コピー可 | ○ | 例: "Autel Robotics" |
| 23| - 機体型式名 | `aircraftInfo[].model` | **必須** | - | 文字列 | `AircraftModel.model_name` | MASTER | ○ | コピー可 | ○ | 例: "EVO Lite Series" |
| 24| - 機体製造番号 (シリアル) | `aircraftInfo[].serialNumber` | **必須** | - | 文字列 | `Aircraft.serial_number` | MASTER | ○ | コピー可 | ○ | 機体シリアル |
| 25| - 機体認証有無 (第一種/二種) | `aircraftInfo[].aircraftCertificationFlag`| 任意 | - | boolean | `Aircraft.has_aircraft_certification` | MASTER | ○ | 画面選択 | ○ | 機体個別認証 |
| 26| - 最大離陸重量 (kg) | `aircraftInfo[].maxWeight` | **必須** | - | 数値 (小数可) | `FlightPlan.planned_total_weight_kg` | PLAN_INPUT / MASTER | ○ | コピー可 | ○ | **※自重ではなく当該運航時の総重量** |
| 27| - 航続可能時間 (分) | `aircraftInfo[].plannedMaxTime` | **必須** | - | 整数 (分) | `FlightPlan.planned_endurance_minutes` | PLAN_INPUT / MASTER | ○ | コピー可 | ○ | カタログ値初期値、計画時確定 |
| 28| 飛行目的リスト | `flightPurpose` | **必須** | 配列 (1以上) | 数値コード[] (1〜16) | `FlightPlan.flight_purpose_codes` | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | **※複数選択可能** |
| 29| 飛行目的その他1内容 | `flightPurposeOther1` | 条件付必須 | 目的コード該当時 | 文字列 | `FlightPlan.flight_purpose_other1_text` | CONDITIONAL | ○ | コピー可 | ○ | |
| 30| 飛行目的その他2内容 | `flightPurposeOther2` | 条件付必須 | 目的コード該当時 | 文字列 | `FlightPlan.flight_purpose_other2_text` | CONDITIONAL | ○ | コピー可 | ○ | |
| 31| 飛行目的詳細メモ | `flightPurposeDetail` | 任意 | - | 文字列 | `FlightPlan.flight_purpose_notes` | PLAN_INPUT | ○ | コピー可 | ○ | 業務・訓練の詳細 |
| 32| 飛行空域リスト | `flightAirspace` | **必須** | 配列 (1以上) | 数値コード[] (1:DID, 2:150m+, 3:空港) | `FlightPlan.flight_airspace_codes` | PLAN_INPUT / PRESET | ○ | 画面選択 | ○ | **※複数選択可能** |
| 33| 飛行空域その他内容 | `flightAirspaceOther` | 条件付必須 | 空域コード該当時 | 文字列 | `FlightPlan.flight_airspace_other_text` | CONDITIONAL | ○ | コピー可 | ○ | |
| 34| 飛行方法リスト | `flightType` | **必須** | 配列 (1以上) | 数値コード[] (1:30m未満, 2:催し, 3:夜間, 4:目視外等) | `FlightPlan.flight_type_codes` | PLAN_INPUT / PRESET | ○ | 画面選択 | ○ | **※複数選択可能** |
| 35| 飛行予定開始日時 | `startTime` | **必須** | - | 日時 (YYYY-MM-DDTHH:mm:ss) | `FlightPlan.planned_start_time` | PLAN_INPUT | ○ | コピー可 | ○ | ISO8601から変換 |
| 36| 飛行予定時間 (分) | `plannedFlightTime` | **必須** | - | 整数 (分) | `FlightPlan.planned_duration_minutes` | PLAN_INPUT / DERIVED | ○ | コピー可 | ○ | 終了日時との整合 |
| 37| 巡航対地速度 (km/h) | `speed` | **必須** | - | 数値 (km/h) | `FlightPlan.planned_speed_kmh` | PRESET / PLAN_INPUT | ○ | コピー可 | ○ | 既定値（例: 15km/h） |
| 38| 飛行高度種別 | `altitudeType` | **必須** | - | 数値 (1:対地高度AGL, 2:海抜高度MSL) | `FlightPlan.altitude_type` (1推奨) | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | 基本は対地高度AGL |
| 39| 計画対地高度 (m) | `altitude` | 条件付必須 | `altitudeType=1` | 数値 (m) | `FlightPlan.planned_altitude_agl_meters` | PLAN_INPUT / PRESET | ○ | コピー可 | ○ | 例: 30m |
| 40| 計画海抜高度 (m) | `altitudeMsl` | 条件付必須 | `altitudeType=2` | 数値 (m) | `FlightPlan.planned_altitude_msl_meters` | PLAN_INPUT | ○ | コピー可 | ○ | |
| 41| 飛行経路データ | `flyRoute` | **必須** | Object (GeoJSON準拠) | GeoJSON Geometry | `FlightPlan.geometry_snapshot` | PRESET / PLAN_INPUT | ○ | 地図描画/GeoJSON | ○ | **Polygon または Circle** |
| 42| - 経路種別 | `flyRoute.type` | **必須** | - | 文字列 (`"Polygon"` / `"Circle"`) | `FlightPlan.geometry_kind` | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | API 1.9直接対応形状 |
| 43| - 座標配列 (Polygon時) | `flyRoute.coordinates` | 条件付必須 | `type="Polygon"` | [ [lng, lat], ... ] | `FlightPlan.polygon_coordinates` | PRESET / PLAN_INPUT | ○ | 地図描画 | ○ | WGS84 10進表記 |
| 44| - 中心座標 (Circle時) | `flyRoute.center` | 条件付必須 | `type="Circle"` | [lng, lat] | `FlightPlan.center_coordinates` | PRESET / PLAN_INPUT | ○ | コピー可 | ○ | WGS84 10進表記 |
| 45| - 半径m (Circle時) | `flyRoute.radius` | 条件付必須 | `type="Circle"` | 数値 (m) | `FlightPlan.radius_meters` | PRESET / PLAN_INPUT | ○ | コピー可 | ○ | 例: 150 |
| 46| 飛行許可・承認書番号 | `flightPermitApplicationNumber` | 条件付必須 | 特定飛行時必須 | 文字列 | `Permission.permit_number` | MASTER / Permission | ○ | コピー可 | ○ | 例: "国空航第XXXXX号" |
| 47| 許可年月日 | `permitDate` | 条件付必須 | 許可書番号あり時 | 日付 (YYYY-MM-DD) | `Permission.permit_date` | MASTER / Permission | ○ | コピー可 | ○ | |
| 48| 許可期間開始日 | `startDate` | 条件付必須 | 許可書番号あり時 | 日付 (YYYY-MM-DD) | `Permission.valid_from` | MASTER / Permission | ○ | コピー可 | ○ | |
| 49| 許可期間終了日 | `finishDate` | 条件付必須 | 許可書番号あり時 | 日付 (YYYY-MM-DD) | `Permission.valid_to` | MASTER / Permission | ○ | コピー可 | ○ | |
| 50| 許可等連絡先フラグ | `contactPermitFlag` | 条件付必須 | 許可書番号あり時 | boolean | `FlightPlan.emergency_contact_target == 'permit'` | PLAN_INPUT | ○ | 画面選択 | ○ | 許可申請時の連絡先を使用するか |
| 51| 許可等連絡先情報 | `contactPermit` | 条件付必須 | `contactPermitFlag=true` | Object | `Permission.contact_info` | MASTER / Permission | ○ | コピー可 | ○ | 氏名・電話・メール |
| 52| - 連絡先氏名 | `contactPermit.name` | 条件付必須 | 上記該当時 | 文字列 | `Permission.contact_name` | MASTER | ○ | コピー可 | ○ | |
| 53| - 連絡先電話 | `contactPermit.phone` | 条件付必須 | 上記該当時 | 文字列 | `Permission.contact_phone` | MASTER | ○ | コピー可 | ○ | |
| 54| - 連絡先メール | `contactPermit.mail` | 条件付必須 | 上記該当時 | 文字列 | `Permission.contact_email` | MASTER | ○ | コピー可 | ○ | |
| 55| 通報者連絡先フラグ | `contactReporterFlag` | **必須** | - | boolean | `FlightPlan.emergency_contact_target == 'reporter'` | PLAN_INPUT | ○ | 画面選択 | ○ | アカウント主を連絡先とするか |
| 56| 通報者連絡先情報 | `contactReporter` | 条件付必須 | `contactReporterFlag=true` | Object | `Organization.contact` / `Personnel` | MASTER / Org | ○ | コピー可 | ○ | |
| 57| - 通報者氏名 | `contactReporter.name` | 条件付必須 | 上記該当時 | 文字列 | `Organization.representative_name` | MASTER | ○ | コピー可 | ○ | |
| 58| - 通報者電話 | `contactReporter.phone` | 条件付必須 | 上記該当時 | 文字列 | `Organization.contact_phone` | MASTER | ○ | コピー可 | ○ | |
| 59| - 通報者メール | `contactReporter.mail` | 条件付必須 | 上記該当時 | 文字列 | `Organization.contact_email` | MASTER | ○ | コピー可 | ○ | |
| 60| 保険情報リスト | `insuranceInfo` | **必須** | 配列 (1以上) | Object[] | `InsurancePolicy` (新マスター) | MASTER / Insurance | ○ | 選択/コピー | ○ | **※保険マスターから導出** |
| 61| - 保険加入有無 | `insuranceInfo[].insuranceAbility` | **必須** | - | boolean (`true`/`false`) | `InsurancePolicy.liability_available` | MASTER / Insurance | ○ | 画面選択 | ○ | |
| 62| - 保険会社名 | `insuranceInfo[].insuranceCompany` | 条件付必須 | 加入有の場合 | 文字列 | `InsurancePolicy.insurer_name` | MASTER / Insurance | ○ | コピー可 | ○ | 例: "三井住友海上" |
| 63| - 商品名 | `insuranceInfo[].insuranceProduct` | 任意 | 加入有の場合 | 文字列 | `InsurancePolicy.product_name` | MASTER / Insurance | ○ | コピー可 | ○ | 例: "ドローン賠償責任保険" |
| 64| - 対人賠償限度額 (万円) | `insuranceInfo[].interPerson` | 条件付必須 | 加入有の場合 | 整数 (万円、無制限は `-1`) | `InsurancePolicy.bodily_injury_amount_man_yen` | MASTER / Insurance | ○ | コピー可 | ○ | **Domain(unlimited=true) → Adapter(-1)** |
| 65| - 対物賠償限度額 (万円) | `insuranceInfo[].interObject` | 条件付必須 | 加入有の場合 | 整数 (万円、無制限は `-1`) | `InsurancePolicy.property_damage_amount_man_yen` | MASTER / Insurance | ○ | コピー可 | ○ | **Domain(unlimited=true) → Adapter(-1)** |
| 66| 安全確保措置 (立入管理) | `riskMitigationOnsiteControl` | **必須** | - | 数値コード (1:区画設定, 2:補助者配置等) | `FlightPlan.onsite_control_code` | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | |
| 67| 安全確保措置その他内容 | `riskMitigationOnsiteControlOther` | 条件付必須 | 上記コード該当時 | 文字列 | `FlightPlan.onsite_control_other_text` | CONDITIONAL | ○ | コピー可 | ○ | |
| 68| 飛行マニュアル区分 | `flightManualType` | **必須** | - | 数値 (1:国交省標準, 2:独自マニュアル) | `FlightPlan.flight_manual_type` | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | 航空局標準または独自 |
| 69| 独自マニュアル概要 | `flightManualOther` | 条件付必須 | `flightManualType=2` | 文字列 | `FlightPlan.flight_manual_other_summary` | CONDITIONAL | ○ | コピー可 | ○ | |
| 70| 緊急時手順確認フラグ | `emergencyProcedureFlag` | **必須** | - | boolean (`true`固定) | `FlightPlan.emergency_procedure_confirmed` | PLAN_INPUT / チェック | ○ | 画面チェック | ○ | 現場確認チェック |
| 71| 機体点検確認フラグ | `aircraftInspectionFlag` | **必須** | - | boolean (`true`固定) | `FlightPlan.preflight_inspection_planned` | PLAN_INPUT / チェック | ○ | 画面チェック | ○ | 日常点検実施確認 |
| 72| 気象情報確認フラグ | `weatherCheckFlag` | **必須** | - | boolean (`true`固定) | `FlightPlan.weather_check_confirmed` | PLAN_INPUT / チェック | ○ | 画面チェック | ○ | 気象状況確認 |
| 73| 連絡体制確認フラグ | `communicationCheckFlag` | **必須** | - | boolean (`true`固定) | `FlightPlan.communication_check_confirmed` | PLAN_INPUT / チェック | ○ | 画面チェック | ○ | 関係者連絡網確認 |
| 74| 無線機器確認フラグ | `radioEquipmentCheckFlag` | **必須** | - | boolean (`true`固定) | `FlightPlan.radio_check_confirmed` | PLAN_INPUT / チェック | ○ | 画面チェック | ○ | プロポ・通信確認 |
| 75| 不具合・事故時措置フラグ | `accidentActionFlag` | **必須** | - | boolean (`true`固定) | `FlightPlan.accident_action_confirmed` | PLAN_INPUT / チェック | ○ | 画面チェック | ○ | 事故対応手順確認 |
| 76| 計画書特記事項 | `remarks` | 任意 | - | 文字列 | `FlightPlan.remarks` | PLAN_INPUT | ○ | コピー可 | ○ | 土地所有者許可状況等 |
| 77| 申請者ID (通報者) | `applicantId` | 任意 / システム | - | 文字列 | ログインユーザー / BFF注入 | SUBMISSION_METADATA | ○ | - | ○ | Workersプロキシにて注入可 |
| 78| 連絡先種別 | `contactType` | **必須** | - | 数値 (1:操縦者, 2:通報者, 3:許可連絡先) | `FlightPlan.emergency_contact_target` | PLAN_INPUT | ○ | 画面選択 | ○ | 優先連絡先選択 |
| 79| 計画状態コード | `planStatus` | 任意 / 照会 | - | 数値コード | DIPS側ステータス | SUBMISSION_METADATA | - | - | ○ | 応答・照会時の受信項目 |
| 80| 登録日時 | `registrationDate` | 任意 / 照会 | - | 日時文字列 | DIPS側登録日時 | SUBMISSION_METADATA | - | - | ○ | 応答受領項目 |
| 81| 更新日時 | `updateDate` | 任意 / 照会 | - | 日時文字列 | DIPS側更新日時 | SUBMISSION_METADATA | - | - | ○ | 応答受領項目 |
| 82| 飛行計画番号 (受付番号) | `flightPlanNumber` | 照会/結果 | - | 文字列 (DIPS計画番号) | `DipsSubmission.dips_plan_id` | SUBMISSION_METADATA | - | コピー可 | ○ | 通報完了時にDIPSから返却 |
| 83| 取消日時 | `cancelDate` | 条件付 / 照会 | 取消時 | 日時文字列 | DIPS側取消日時 | SUBMISSION_METADATA | - | - | ○ | 取消API呼出時 |
| 84| 取消理由 | `cancelReason` | 条件付必須 | 取消時 | 文字列 | `DipsSubmission.cancel_reason` | PLAN_INPUT | ○ | コピー可 | ○ | 取消API呼出時パラメータ |
| 85| 他機重複フラグ | `duplicateFlag` | 照会/結果 | - | boolean | `DuplicateFlightPlanCheck.has_duplicates` | SUBMISSION_METADATA | - | 警告表示 | ○ | 照会応答フラグ |
| 86| 重複計画リスト | `duplicateFlightPlanList` | 照会/結果 | - | Object[] | `DuplicateFlightPlanCheck.plans` | SUBMISSION_METADATA | - | 一覧表示 | ○ | 重複する他機計画詳細 |
| 87| 通報システム名 | `systemName` | 任意 / 固定値 | - | 文字列 | `"drone-flight-ops"` | SUBMISSION_METADATA | ○ | - | ○ | 外部接続システム識別名 |
| 88| システム通報リビジョン | `systemRevision` | 任意 | - | 整数 | `FlightPlan.revision` | SUBMISSION_METADATA | ○ | - | ○ | アプリ内リビジョン番号 |

---

## 4. 新設マスター: InsurancePolicy（保険台帳）設計

DIPS通報における保険情報（No.60〜65: `insuranceInfo`）を適正に管理するため、独立した論理マスターとして `InsurancePolicy` を追加します。

### 4.1 エンティティ仕様
```typescript
export interface InsurancePolicy {
  insurance_policy_id: string;        // UUID v4
  organization_id?: string;           // 運用主体 (nullable)
  insurer_name: string;               // 保険会社名（例: "三井住友海上火災保険"）
  product_name: string;               // 保険商品名（例: "ドローン賠償責任保険"）
  policy_number?: string;             // 証券番号（任意 / マスキング考慮）
  valid_from: string;                 // 保険期間開始日 (YYYY-MM-DD)
  valid_until: string;                // 保険期間満了日 (YYYY-MM-DD)
  
  // 賠償限度額 (万円) - Core Domain の表現
  liability_available: boolean;       // 賠償責任保険加入有無
  bodily_injury_limit_man_yen?: number;   // 対人賠償限度額 (万円)
  bodily_injury_unlimited: boolean;       // 対人無制限フラグ
  property_damage_limit_man_yen?: number; // 対物賠償限度額 (万円)
  property_damage_unlimited: boolean;     // 対物無制限フラグ
  
  coverage_scope: 'organization_wide' | 'fleet_wide' | 'specific_aircraft' | 'project_specific';
  applicable_aircraft_ids?: string[]; // 特定機体限定時の対象機体ID配列
  status: 'ACTIVE' | 'EXPIRED' | 'ARCHIVED';
  notes?: string;

  // 共通監査メタデータ
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  version: number;
}
```

### 4.2 DIPS APIとの境界マッピング規則
- **無制限の取り扱い**: Core Domainでは `bodily_injury_unlimited: true` として意味的に保持します。DIPS AdapterがAPIペイロードへ変換する際に、DIPS仕様の `-1` へマッピングします（Core Domainに `-1万円` という不自然な値を保持させない）。
- **Googleスプレッドシート台帳同期**: `InsurancePolicy` は `機体台帳` や `人員台帳` と同様に**「同期推奨」**の論理シートとして扱います。

---

## 5. Geometry（飛行空域形状）詳細設計とWeb/API差異

### 5.1 Web UI と API 1.9 の機能差
公式操作マニュアルおよびAPIガイドラインの精査により、以下の差異が存在することを明記します。

| 形状 | DIPS Web UI | DIPS API 1.9 | アプリ内部Domain | API送信時の扱い | 手動Web支援時の扱い |
|---|:---:|:---:|:---:|---|---|
| **Polygon（多角形）** | ○ (描画・保存可) | ○ (`"Polygon"`) | サポート | そのままAPI送信 | 頂点座標列を提示・地図確認 |
| **Circle（円形）** | ○ (中心＋半径m) | ○ (`"Circle"`) | サポート | そのままAPI送信 | 中心座標・半径をワンタップコピー |
| **Buffered Line（バッファライン/経路）** | ○ (線分＋幅m) | **未確認 / 非推奨** | 保持可能 (`BUFFERED_LINE`) | **API直接送信禁止** (`MANUAL_ONLY` 判定) | Web画面で線分・バッファ幅を入力支援 |

> [!WARNING]
> **BUFFERED_LINE（バッファライン）を勝手にAPI対応済みとして扱ってはなりません。**  
> DIPS API 1.9仕様書の `flyRoute.type` に明記されているのは `"Polygon"` および `"Circle"` のみです。アプリ内部では将来のWeb入力支援のために `BUFFERED_LINE` を保持可能としますが、API送信時は `MANUAL_ONLY` として判定し、公式な変換受付仕様が確認されるまでPolygonへの勝手な自己流変換送信を禁止します。

### 5.2 FlightAreaPreset から FlightPlan へのコピー原則
1. `FlightAreaPreset` は現場の飛行可能枠（マスター/プリセット）として保存されます。
2. 計画作成時、`FlightAreaPreset` から `FlightPlan.geometry_snapshot` へ**ディープコピー**されます。
3. コピー後、パイロットは今回の運航に合わせて頂点を微調整したり半径を絞り込むことができます。
4. **過大経路設定の防止**: DIPS公式注意喚起（2026-07-17付）に準拠し、現場枠全体を無思慮に通報するのではなく、「今回の実際の飛行経路」に即した形状へ調整することを推奨するUX設計とします。

---

## 6. FlightPlan / DipsSubmission の複数機材・複数操縦者対応

業務利用を想定し、1つの飛行計画に複数機体・複数操縦者が登場するケースに対応します。

### 6.1 FlightPlan の機材・人員属性
- `primary_aircraft_id`: 主使用機体ID
- `aircraft_ids`: 当該計画で使用予定の機体ID配列（複数指定可）
- `planned_total_weight_kg`: 当該飛行計画における最大離陸総重量（機体カタログ自重ではなく、ペイロード・装備品を含めた実計画重量）
- `planned_endurance_minutes`: 航続可能時間（公称最大飛行時間から現場条件を考慮した確定値）
- `primary_pilot_id`: 主操縦者ID
- `pilot_ids`: 操縦者ID配列（交代操縦者・副操縦者を含む）
- `selected_assistant_person_ids`: 登録Personnelから選択した補助者ID配列
- `planned_assistants_count`: 最終的にDIPSへ申告する補助者人数（Personnel未登録の外部補助員等のための人数override対応）
- `flight_purpose_codes`: 飛行目的数値コード配列（複数選択対応）
- `flight_airspace_codes`: 飛行空域数値コード配列（複数選択対応）
- `flight_type_codes`: 飛行形態数値コード配列（複数選択対応）

---

## 7. 手動DIPS Web入力支援（DipsManualEntryViewModel）設計

DIPS APIが利用できない場合（またはAPI未承認時）、操縦者がスマートフォン1台でDIPS Web画面へ転記作業を迅速に行えるよう、`DipsManualEntryViewModel` を生成します。

### 7.1 手動画面の区分レイアウトと1タップコピー導線
DIPS Web画面のタブ・入力セクション構成に一致させた並び順でViewModelを提供します。

```text
┌────────────────────────────────────────────────────────┐
│ [DIPS Web入力支援画面]                                 │
│  [DIPS 2.0 Webを開く ↗] (別タブでログイン画面へ誘導)   │
├────────────────────────────────────────────────────────┤
│ ▼ 1. 飛行計画基本情報                                  │
│  ・計画名称: [金岡公園_空撮_20261020]      [コピー]    │
│  ・開始日時: [2026/10/20 10:00]            [コピー]    │
│  ・終了日時: [2026/10/20 12:00]            [コピー]    │
│  ・飛行時間: [120分]                       [コピー]    │
├────────────────────────────────────────────────────────┤
│ ▼ 2. 機体・操縦者選択（DIPS登録済みから選択）          │
│  ・機体登録記号: [JU324XXXXXXX]            [コピー]    │
│    ※DIPS画面の「登録機体から選択」で該当機を選択       │
│  ・操縦者氏名: [山田 太郎]                 [コピー]    │
│    ※DIPS画面の「登録操縦者から選択」で選択             │
│  ・補助者人数: [1名]                       [コピー]    │
├────────────────────────────────────────────────────────┤
│ ▼ 3. 飛行空域・飛行形態・目的                          │
│  ・目的: [空撮] (コード: 2)                [表示照合]  │
│  ・空域: [DID人口集中地区]                 [表示照合]  │
│  ・形態: [目視内・昼間・30m未満]           [表示照合]  │
├────────────────────────────────────────────────────────┤
│ ▼ 4. 飛行経路・高度（地図入力）                        │
│  ・中心座標: [33.456789, 129.876543]       [コピー]    │
│  ・半径: [150m]                            [コピー]    │
│  ・高度 (AGL): [30m]                       [コピー]    │
│  ・速度: [15km/h]                          [コピー]    │
├────────────────────────────────────────────────────────┤
│ ▼ 5. 許可承認・保険・安全措置                          │
│  ・許可書番号: [国空航第XXXXX号]           [コピー]    │
│  ・保険会社: [三井住友海上]                [コピー]    │
│  ・対人/対物: [無制限 / 10000万円]         [コピー]    │
│  ・立入管理: [関係者以外の立入禁止区画]    [表示照合]  │
├────────────────────────────────────────────────────────┤
│ [DIPSへ通報完了打刻] → [受付番号入力 or 一覧照合確認]   │
└────────────────────────────────────────────────────────┘
```

---

## 8. 全88項目の入力元・自動化集計と動的評価

全88項目について、「現場で人間が毎回入力しなければならない項目」と「システムが自動補完・再利用する項目」の件数を集計しました。

| 入力元分類 | 項目数 | 主な内訳 |
|---|:---:|---|
| **MASTER から自動取得** | **34** | 機体スペック（18〜25）、操縦者プロファイル（5〜12）、許可承認詳細（47〜54）、保険台帳（60〜65）、通報者情報（56〜59） |
| **PRESET から初期ロード** | **14** | 飛行目的（28〜31）、安全措置（66〜67）、飛行マニュアル（68〜69）、基本高度・速度（37〜40）、飛行空域プリセット |
| **DERIVED（自動計算・導出）** | **4** | 終了日時、補助者人数（14）、飛行時間（36）、面積 |
| **PLAN_INPUT（現場確定入力）**| **12** | 計画名（2）、開始日時（35）、実総重量（26）、航続時間（27）、実飛行経路（41〜45）、特記事項（76）、安全確認チェック（70〜75） |
| **SUBMISSION_METADATA** | **14** | 計画ID（1）、重複フラグ（3, 85〜86）、システム名（87〜88）、DIPS受付番号（82）、状態コード（79〜81, 83〜84） |
| **CONDITIONAL（特定条件時）** | **10** | 各種「その他」理由入力（29, 30, 33, 67, 69）、取消理由（84）、許可連絡先（50〜54） |

> [!IMPORTANT]
> **「現場入力約12項目」は固定値ではありません（動的算出値）**:  
> 上記の「約12項目」は、マスター（機体、操縦者、許可承認、保険）が完全に事前登録されており、かつ「その他」理由や特殊条件が発生しない場合の**典型的なケースにおける参考値**です。  
> 操縦者の連絡先電話番号がマスター上で未登録の場合や、飛行目的に「その他」を選択した場合、あるいは新機体で包括許可書番号を個別上書きする場合は、現場での手入力・確認項目数は増減します。  
> アプリは「固定12項目フォーム」として画面をハードコードするのではなく、後述の `DipsFieldRequirementEngine` が文脈に応じて動的に必須性と入力責任を判定します。

---

## 9. DipsFieldRequirementEngine と 判定アーキテクチャ設計

### 9.1 エンジンの責務と設計原則
`DipsFieldRequirementEngine` は、飛行計画（`FlightPlan`）、選択されたマスター（`Aircraft`, `Personnel`, `Permission`, `InsurancePolicy`）、プリセット、および運航文脈を入力として受け取り、指定された DIPS API 仕様バージョン（例: `"FPR-API-1.9"`）に基づいて、各フィールドの**「Contract Requirement」「Applicability」「Input Responsibility」「Validation Status」**を決定的に算出するドメインサービスです。

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

### 9.2 機体能力（Aircraft Capabilities）とDIPS空域形状の非混同原則
- **過剰設計の排除**: 業務用アプリとして機体モデルには将来的に `GNSS`, `waypoint`, `remote_id`, `night_lighting` 等の能力（`AircraftModelCapability`）を保持可能としますが、**DIPS Requirement Engine の必須判定に直結させるのはDIPS側が要求する項目（例: DRS登録有無、型式認証区分等）のみに限定**します。
- **Geometry 独立原則**: DIPSにおける飛行範囲形状（Polygon, Circle, Buffered Line）は「どの空域・範囲を飛ぶか」を表す運航ジオメトリであり、**「機体に自律Waypoint飛行機能があるか否か」とは全くの別概念**です。機体性能を理由にDIPSのPolygon必須/不要を機械的に直結判定してはなりません。

### 9.3 Effective / Override 値の解決セマンティクス
マスターやプリセットから初期値を取得する項目であっても、今回の運航計画において現場判断で値を変更（override）できる項目（総重量、航続時間、巡航速度、高度、補助者人数、緊急連絡先等）について、以下の3層で値を追跡します：

1. **`source_master_value`**: マスターまたはプリセットに登録されている元の値。
2. **`override_value`**: 今回の飛行計画（`FlightPlan`）でユーザーが一時的・意図的に指定した上書き値（未指定時は `null` / `undefined`）。
3. **`effective_value`**: 最終的に通報ペイロードおよび提出不変スナップショット（`DipsSubmission.submission_snapshot`）へ採用される確定値。
   - `effective_value = override_value ?? source_master_value`
- **マスター欠損時の救済**: 例えば操縦者マスターで電話番号が欠落しておりDIPSで必須となる場合、`FlightPlan` 画面で一時入力（override）して提出可能とするとともに、必要に応じて「人員マスター側も更新するか」を操縦者が選択できるようにします。

### 9.4 データ型・モデル定義（Domain Types）

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

### 9.5 SUBMISSION_READY を阻害する条件（Blocking Rules）
計画が `SUBMISSION_READY`（提出準備完了）となるための厳格な論理ルールを以下のように定めます：

1. **`is_ready = true` の成立条件**:
   - `blocking_fields.length === 0`
   - すなわち、**`Applicability === 'APPLICABLE'` かつ (`Contract Requirement === 'REQUIRED'` または 条件成立した `CONDITIONAL_REQUIRED`) である全項目について、`effective_value` が存在し、バリデーション（型・形式・値域）を満たしていること**。
2. **提出を阻害しない項目（Non-blocking）**:
   - **NOT_APPLICABLE 項目**: 今回の飛行条件に該当しない項目（例: 技能証明なし時の証明書番号、特定飛行なし時の許可書番号、「その他」以外選択時のその他理由等）は、空欄であってもエラーとせず、通報ペイロードからも除外される。
   - **マスター自動補完項目**: `MASTER` から有効な値が引き当てられている場合は `AUTO_FILLED` かつ `VALID` となり、ユーザーの追加入力なしで充足とみなす。

---

### 9.6 DIPS通報要否判定サービス（DipsReportingRequirementEvaluator）
`DipsFieldRequirementEngine` が「No.1〜88の各フィールドの入力必須性・適用性」を評価する責務を持つのに対し、**「今回の飛行計画全体が、航空法上そもそもDIPS通報を義務づけられているか（特定飛行か否か）」**の判定責務は、ドメインサービスとして明確に分離された `DipsReportingRequirementEvaluator` が担います。

```typescript
// 飛行計画通報の法令上の要否
export type DipsReportingRequirement =
  | 'REQUIRED'      // 特定飛行（航空法第132条の88により通報義務あり）
  | 'NOT_REQUIRED'  // 非特定飛行（法令上の義務なし、通報は推奨扱い）
  | 'UNDETERMINED'; // 空域・形態未確定のため判定不能

export class DipsReportingRequirementEvaluator {
  /**
   * 航空法上の特定飛行該否に基づき、通報義務の有無を決定
   */
  public static evaluate(plan: FlightPlan): {
    requirement: DipsReportingRequirement;
    is_specific_flight: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    // 1. 空域チェック (航空法第132条の85: 空港周辺、150m以上、DID人口集中地区)
    const isAirport = plan.flight_airspace_codes.includes(3); // 空港周辺等
    const isOver150m = plan.flight_airspace_codes.includes(2) || (plan.planned_altitude_agl_meters ?? 0) > 150;
    const isDid = plan.flight_airspace_codes.includes(1);     // 人口集中地区
    
    if (isAirport) reasons.push('空港等の周辺空域');
    if (isOver150m) reasons.push('地表・水面から150m以上の空域');
    if (isDid) reasons.push('人口集中地区（DID）の上空');
    
    // 2. 飛行方法チェック (航空法第132条の86: 夜間、目視外、30m未満、催し、危険物、物件投下)
    const isNight = plan.flight_type_codes.includes(3);       // 夜間飛行
    const isBvlos = plan.flight_type_codes.includes(4);       // 目視外飛行
    const isUnder30m = plan.flight_type_codes.includes(1);    // 人・物件30m未満
    const isEvent = plan.flight_type_codes.includes(2);       // 多数の者が集まる催し上空
    const isHazardous = plan.flight_type_codes.includes(5);   // 危険物輸送
    const isDrop = plan.flight_type_codes.includes(6);        // 物件投下
    
    if (isNight) reasons.push('夜間飛行');
    if (isBvlos) reasons.push('目視外飛行');
    if (isUnder30m) reasons.push('人又は物件から30m未満の飛行');
    if (isEvent) reasons.push('多数の者の集合する催しの上空');
    if (isHazardous) reasons.push('危険物の輸送');
    if (isDrop) reasons.push('物件投下');
    
    const is_specific_flight = reasons.length > 0;
    
    return {
      requirement: is_specific_flight ? 'REQUIRED' : 'NOT_REQUIRED',
      is_specific_flight,
      reasons: is_specific_flight ? reasons : ['非特定飛行（DID外・昼間・目視内・30m距離確保等）']
    };
  }
}
```

- **非特定飛行時の取り扱い**:
  - `requirement === 'NOT_REQUIRED'` の場合、DIPS通報は法令上の義務ではなく**「推奨」**となります。
  - したがって、DIPS通報が未完了（`NOT_SUBMITTED`, `SNAPSHOT_SAVED` 等）であっても、離陸判定（`TakeoffReadinessAssessment`）において Blocking や エラー扱いとせず、「非特定飛行（通報推奨）」の Informational 表示とします。
- **システム障害例外の取り扱い**:
  - 国交省公式通報要領第4条に基づき、通報システム障害により事前通報手段がない場合は飛行開始後の事後通報が可能です。操縦者が公認障害情報に基づき `SYSTEM_OUTAGE_EXCEPTION` を記録している場合、事前通報未完了でも Blocking ではなく「システム障害例外記録あり（着陸後速やかに通報）」として扱います。

---

## 10. 実画面確認待ち事項（WEB_UI_VERIFICATION_PENDING）

国土交通省の公式ドキュメント上では定義されているものの、実運用においてDIPS 2.0 Webポータルの操作性・挙動と突き合わせ確認を要する項目を整理します。
2026-09-14にオーナーによるDIPS Web「飛行計画 新規作成」実画面検証が行われ、機体・操縦者・目的・空域・方法・保険・作図ツール・国土地理院タイル等の挙動が `OBSERVED` として記録されました。詳細な観測事実および最新の未確認事項リストは [26_dips-web-ui-verification.md](26_dips-web-ui-verification.md) を正本とします。

1. **`PENDING-01: 機体選択時の重量自動反映挙動`**:
   - DIPS Web画面で登録済み機体を選択した際、最大離陸重量（No.26）にDRS登録自重が自動セットされるか、空欄で毎回入力が求められるか。
2. **`PENDING-02: バッファラインの保存・再編集可否`**:
   - Web画面で描画したバッファライン（経路）が、計画変更や再利用時にポリゴンへ変換されて保持されるか、線分＋幅のまま保持されるか（API 1.9送信時の表現を含む）。
3. **`PENDING-03: 許可承認書の複数選択可否`**:
   - APIリクエスト上は許可番号が単一文字列（No.46）となっているが、DIDと夜間で別々の許可書番号を持つ場合、Web画面上で複数入力欄が存在するか。
4. **`PENDING-04: 民間技能認証（privateLicense）の画面残存状況`**:
   - 2026年現在のDIPS Web画面において、民間講習修了証（privateLicense）の入力欄がまだ有効か、完全に国家資格番号のみへ移行しているか。
5. **`PENDING-05: 一覧照合時の表示項目`**:
   - DIPS飛行計画一覧画面で、受付番号が未発番の段階で「計画名称」「開始日時」「機体登録記号」が即時確認できる画面遷移になっているか。
6. **`PENDING-06〜12: 実画面検証で新設された未確認事項`**:
   - 計画自動生成名称の確定規則、定期・複数日指定の詳細ルール、カテゴリー判定アルゴリズム詳細等（詳細は [26_dips-web-ui-verification.md](26_dips-web-ui-verification.md) 第6節 参照）。
