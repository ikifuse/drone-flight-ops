# 25a. DIPSフィールドカタログ

最終更新: 2026-09-18\
状態: 設計整合（C1未着手）\
主責務: 記録済API 1.9 No.1〜88、外部契約とCore意味論の対応参照\
入口: [DIPS Flight Plan設計群](README.md)

本書は旧25の全88行を保持した参照資料である。以下の公式資料名・版数・対応値は従来の調査記録を継承する。本再編では公式資料の全行照合を再実施していないため、C7開始時は最新公式原文で契約を再確認する。表には新規通報以外に取消・照会・応答専用行も含まれる。**表の88行すべてを新規POSTへ含める指示ではない**。送信操作別のexact contractは[25c](25c_api-payload-mapping.md)の再検証対象とする。

必須性判定の正本は[25d](25d_requirement-validation.md)、Web画面上の入力方法は[25b](25b_manual-web-mapping.md)。本カタログの手動支援列は識別・照合・必要時コピーの用途を示し、全項目に手入力を要求するものではない。

## 1. 正本とする公式一次資料
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

## 2. カタログ凡例と3軸評価との対応

### 2.1. 入力分類の定義
- **`MASTER`**: 登録済みマスター（`Aircraft`, `Personnel`, `Permission`, `InsurancePolicy`, `Location` 等）から自動取得。
- **`PRESET`**: 運航テンプレートまたはプリセット（`FlightPurposePreset`, `SafetyMeasurePreset`, `FlightAreaPreset`）から初期値をロード。
- **`PLAN_INPUT`**: 飛行計画ごとに現場や操縦者が確定入力（日時、高度、今回の飛行範囲等）。
- **`DERIVED`**: 他のフィールドから自動計算（終了時刻、補助者人数、面積等）。
- **`DIPS_REGISTERED`**: DIPS Web画面上で登録済み台帳から選択される項目（手動時）。
- **`CONDITIONAL`**: 特定条件（「その他」選択時、特定飛行該当時等）でのみ必須・出現。
- **`SUBMISSION_METADATA`**: 通報処理時にシステムが付与（リビジョン、タイムスタンプ等）。
- **`LEGACY`**: 制度改正により将来廃止予定、または形式的互換性のために残存している項目。
- **`UNVERIFIED`**: 公式API定義上存在するが、実画面・実運用での検証を要する項目。

この入力分類は旧調査表の複数タグを保持した凡例である。`PLAN_INPUT → USER_INPUT`、`DIPS_REGISTERED → DIPS_REGISTERED_SELECTION`、`SUBMISSION_METADATA → SYSTEM_METADATA` と25dの入力責任へ対応付ける。`CONDITIONAL` / `LEGACY` は条件・契約属性、`UNVERIFIED` は証拠状態であり、入力責任enumへ混入させない。

### 2.2. No.1〜No.88 完全対比表

Step 2で人物・資格の詳細正本を[31a](../identity-and-access/31a_person-account-and-environment.md)へ移した。下表の旧取得元`Personnel.has_license / license_number / legacy_private_license`は調査時の対応名であり、人物直下の現行物理列を確定するものではない。資格の分離と正確な列の未確定は31aに従う。API項番・契約値自体は本Stepで変更しない。

| No | DIPS項目名 | API parameter | 必須区分 | 条件 | データ型/値域 | 新アプリの取得元 | 入力分類 | API送信 | 手動Web支援 | Snapshot保存 | 備考 |
|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| 1 | 飛行計画ID | `flightPlanId` | 任意 (新規時null) | 変更/取消時必須 | 文字列 (UUID/ID) | `DipsSubmission.dips_plan_id` | SUBMISSION_METADATA | ○ | - | ○ | 新規通報時は空、改訂通報時は前回取得ID |
| 2 | 飛行計画名称 | `name` | **必須** | - | 文字列 (最大100文字) | `FlightPlan.name` / `Location.name` + 日時 | PLAN_INPUT / PRESET | ○ | コピー可 | ○ | 例: "架空公園A_定期空撮_20261020" |
| 3 | 重複飛行計画取得フラグ | `getDuplicateFlightPlanFlag` | 任意 | - | boolean (`true`/`false`) | アプリ設定 / 照会オプション | SUBMISSION_METADATA | ○ | - | ○ | 重複空域の他機計画を応答に含めるか |
| 4 | 操縦者情報リスト | `pilotInfo` | **必須** | 配列 (1以上) | Object[] | `FlightPlan.pilot_ids` | MASTER / Personnel | ○ | 選択/コピー | ○ | 配列構造（複数操縦者対応） |
| 5 | - 操縦者ID (DIPS内部) | `pilotInfo[].pilotId` | 条件付必須 | API登録済時 | 文字列 | `Personnel.dips_pilot_id` | MASTER | ○ | - | ○ | DIPS側IDがある場合 |
| 6 | - 氏名 (漢字) | `pilotInfo[].name` | **必須** | - | 文字列 | `Personnel.name` | MASTER | ○ | コピー可 | ○ | 例: "操縦者A" |
| 7 | - 氏名 (フリガナ) | `pilotInfo[].kana` | **必須** | - | 文字列 | `Personnel.kana` | MASTER | ○ | コピー可 | ○ | 例: "ソウジュウシャエー" |
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
| 28| 飛行目的リスト | `flightPurpose` | **必須** | 配列 (1以上) | 数値コード[] (1〜16) | `FlightPlan.flight_purposes` | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | **※複数選択可能** |
| 29| 飛行目的その他1内容 | `flightPurposeOther1` | 条件付必須 | 目的コード該当時 | 文字列 | `FlightPlan.flight_purpose_other1_text` | CONDITIONAL | ○ | コピー可 | ○ | |
| 30| 飛行目的その他2内容 | `flightPurposeOther2` | 条件付必須 | 目的コード該当時 | 文字列 | `FlightPlan.flight_purpose_other2_text` | CONDITIONAL | ○ | コピー可 | ○ | |
| 31| 飛行目的詳細メモ | `flightPurposeDetail` | 任意 | - | 文字列 | `FlightPlan.flight_purpose_notes` | PLAN_INPUT | ○ | コピー可 | ○ | 業務・訓練の詳細 |
| 32| 飛行空域リスト | `flightAirspace` | **必須** | 配列 (1以上) | 数値コード[] (1:DID, 2:150m+, 3:空港) | `FlightPlan.flight_airspaces` | PLAN_INPUT / PRESET | ○ | 画面選択 | ○ | **※複数選択可能** |
| 33| 飛行空域その他内容 | `flightAirspaceOther` | 条件付必須 | 空域コード該当時 | 文字列 | `FlightPlan.flight_airspace_other_text` | CONDITIONAL | ○ | コピー可 | ○ | |
| 34| 飛行方法リスト | `flightType` | **必須** | 配列 (1以上) | 数値コード[] (1:30m未満, 2:催し, 3:夜間, 4:目視外等) | `FlightPlan.flight_methods` | PLAN_INPUT / PRESET | ○ | 画面選択 | ○ | **※複数選択可能** |
| 35| 飛行予定開始日時 | `startTime` | **必須** | - | 日時 (YYYY-MM-DDTHH:mm:ss) | `FlightPlan.planned_start_time` | PLAN_INPUT | ○ | コピー可 | ○ | ISO8601から変換 |
| 36| 飛行予定時間 (分) | `plannedFlightTime` | **必須** | - | 整数 (分) | `FlightPlan.planned_duration_minutes` | PLAN_INPUT / DERIVED | ○ | コピー可 | ○ | 終了日時との整合 |
| 37| 巡航対地速度 (km/h) | `speed` | **必須** | - | 数値 (km/h) | `FlightPlan.planned_speed_kmh` | PRESET / PLAN_INPUT | ○ | コピー可 | ○ | 既定値（例: 15km/h） |
| 38| 飛行高度種別 | `altitudeType` | **必須** | - | 数値 (1:対地高度AGL, 2:海抜高度MSL) | `FlightPlan.altitude_type` (1推奨) | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | 基本は対地高度AGL |
| 39| 計画対地高度 (m) | `altitude` | 条件付必須 | `altitudeType=1` | 数値 (m) | `FlightPlan.planned_altitude_agl_meters` | PLAN_INPUT / PRESET | ○ | コピー可 | ○ | 例: 30m |
| 40| 計画海抜高度 (m) | `altitudeMsl` | 条件付必須 | `altitudeType=2` | 数値 (m) | `FlightPlan.planned_altitude_msl_meters` | PLAN_INPUT | ○ | コピー可 | ○ | |
| 41| 飛行経路データ | `flyRoute` | **必須** | Object (GeoJSON準拠) | GeoJSON Geometry | `FlightPlan.geometry_snapshot` | PRESET / PLAN_INPUT | ○ | 地図描画・形状照合 | ○ | **Polygon または Circle** |
| 42| - 経路種別 | `flyRoute.type` | **必須** | - | 文字列 (`"Polygon"` / `"Circle"`) | `FlightPlan.geometry.kind` | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | API 1.9直接対応形状 |
| 43| - 座標配列 (Polygon時) | `flyRoute.coordinates` | 条件付必須 | `type="Polygon"` | [ [lng, lat], ... ] | `FlightPlan.geometry.polygon_points` | PRESET / PLAN_INPUT | ○ | 地図描画 | ○ | WGS84 10進表記 |
| 44| - 中心座標 (Circle時) | `flyRoute.center` | 条件付必須 | `type="Circle"` | [lng, lat] | `FlightPlan.geometry.center` | PRESET / PLAN_INPUT | ○ | コピー可 | ○ | WGS84 10進表記 |
| 45| - 半径m (Circle時) | `flyRoute.radius` | 条件付必須 | `type="Circle"` | 数値 (m) | `FlightPlan.geometry.radius_meters` | PRESET / PLAN_INPUT | ○ | コピー可 | ○ | 例: 150 |
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
| 62| - 保険会社名 | `insuranceInfo[].insuranceCompany` | 条件付必須 | 加入有の場合 | 文字列 | `InsurancePolicy.insurer_name` | MASTER / Insurance | ○ | コピー可 | ○ | 例: "架空保険会社A" |
| 63| - 商品名 | `insuranceInfo[].insuranceProduct` | 任意 | 加入有の場合 | 文字列 | `InsurancePolicy.product_name` | MASTER / Insurance | ○ | コピー可 | ○ | 例: "ドローン賠償責任保険" |
| 64| - 対人賠償限度額 (万円) | `insuranceInfo[].interPerson` | 条件付必須 | 加入有の場合 | 整数 (万円、無制限は `-1`) | `InsurancePolicy.bodily_injury_limit_man_yen` | MASTER / Insurance | ○ | コピー可 | ○ | **Domain(unlimited=true) → Adapter(-1)** |
| 65| - 対物賠償限度額 (万円) | `insuranceInfo[].interObject` | 条件付必須 | 加入有の場合 | 整数 (万円、無制限は `-1`) | `InsurancePolicy.property_damage_limit_man_yen` | MASTER / Insurance | ○ | コピー可 | ○ | **Domain(unlimited=true) → Adapter(-1)** |
| 66| 安全確保措置 (立入管理) | `riskMitigationOnsiteControl` | **必須** | - | 数値コード (1:区画設定, 2:補助者配置等) | `FlightPlan.onsite_control_measure` | PRESET / PLAN_INPUT | ○ | 画面選択 | ○ | |
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
| 77| 申請者ID (通報者) | `applicantId` | 任意 / システム | - | 文字列 | ログインユーザー / BFF注入 | SUBMISSION_METADATA | ○ | - | ○ | DIPSバックエンド側の扱いは正式認証契約照合後（[16](../16_security.md)のVERIFY） |
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

## 3. Core参照名の適用範囲

表の「新アプリの取得元」はAPIフィールドに対応する意味の所在を示す。外部数値コードは25cで生成する投影であり、Coreに公式APIコード値を直接格納しない。実際のEntity属性と完全enumは[12d](../domain-model/12d_flight-plan-and-dips.md)を正本とする。旧表で型未定義の取得元名は即座にschema追加を意味せず、C1型整合時の `PENDING` として扱う。`InsurancePolicy` の無制限はbool、金額は `*_limit_man_yen` とし、旧 `*_amount_man_yen` 表記を統一した。
