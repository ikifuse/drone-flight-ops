# 12. 概念データモデル・型定義・ID戦略（12_domain-model.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B設計反映（ADR-0007 承認済）

---

## 1. ドメインモデル全体関連図（ER概要）

本モデルは、個人の小規模運用から業務利用・法人フリート運用までを視野に入れた**正規化データモデル**です。
「実在する管理対象（**Master**）」「入力再利用セット（**Preset**）」「実際の運航・提出結果（**History**）」「参照ビュー（**Projection**）」の4領域に明確に分離しています。

```text
  ┌──────────────────┐
  │   Organization   │ (運用主体・法人/事業主スコープ)
  └────────┬─────────┘
           │ 1
     ┌─────┴───────────────────────────────────────────┐
     │ *                                               │ *
┌────┴────────────┐                               ┌────┴────────────┐
│     Client      │                               │   Personnel     │
│   (顧客企業)    │                               │  (人員マスター) │
└────┬────────────┘                               └────┬────────────┘
     │ 1                                               │ 1
     │ *                                               │
┌────┴────────────┐                                    │
│     Project     │                                    │
│   (業務案件)    │                                    │
└────┬────────────┘                                    │
     │ 1                                               │
     │ *                                               │
     │   ┌────────────────┐ 1       * ┌──────────────┐ │
     │   │ AircraftModel  ├───────────┤   Aircraft   │ │
     │   │  (機種マスター)│           │ (機体台帳)   │ │
     │   └───────┬────────┘           └──────┬───────┘ │
     │           │ 1                         │ 1       │
     │           │ *                         │         │
     │   ┌───────┴──────────────┐            │         │
     │   │ BatteryCompatibility │            │         │
     │   │  (機材型式互換関係)  │            │         │
     │   └───────┬──────────────┘            │         │
     │           │ *                         │         │
     │           │ 1                         │         │
     │   ┌───────┴────────┐ 1       * ┌──────┴───────┐ │
     │   │  BatteryModel  ├───────────┤   Battery    │ │
     │   │(バッテリー型式)│           │ (バッテリー) │ │
     │   └────────────────┘           └──────┬───────┘ │
     │                                       │ 1       │
     │ * (任意参照)                          │         │
┌────┴────────────┐ 1               *        │         │
│   FlightPlan    ├──────────────────────────┼─────────┤
│ (内部飛行計画)  │ (primary / aircraft_ids) │         │
└────┬────────────┘                          │         │
     │ 1                                     │         │
     ├──────────────┐ 1       * ┌────────────┴─────────┴─────────┐
     │ 1            ├───────────┤         DipsSubmission         │
     │              │           │    (提出SSoT不変スナップショット)│
     │              ▼           └──────────────────┬─────────────┘
     │        ┌────────────────┐                   │ (台帳行同期)
     │        │DipsNotification│                   ▼
     │        │ (通報状態集約) │         ┌───────────────────────┐
     │        └────────────────┘         │ Googleスプレッドシート│
     ▼                                   │ 「DIPS飛行計画台帳」  │
┌────────────────┐ 1          *          └───────────────────────┘
│    Location    ├──────────────┐
│  (場所マスター)│              │
└────┬───────────┘              ▼
     │ 1 *              ┌────────────────┐
     ├─────────────────►│FlightAreaPreset│
     │                  │ (範囲プリセット)│
     ▼                  └────────────────┘
┌────────────────┐
│OperationTemplate
│(運航テンプレート
└────┬───────────┘
     │ (コピーソース)
     ▼ (新規作成時値コピー)
┌────────────────┐ 1                         *
│   FlightPlan   ├──────────────────────────────┐
└────┬───────────┘                              │
     │ 1 (任意紐付け)                           │
     ▼                                          │
┌────────────────┐ 1                          * │
│    Mission     ├──────────────────────────────┘
│(現場セッション)│ (planned_submission_id / flight_plan_id)
└────┬───┬───┬───┘
     │1  │1  │1
     │   │   │
     │   │   ├─────────────────────────┐
     │   │   │                         │ 1
     │   │ * │                 ┌───────┴──────────────┐
     │ ┌─┴───┼──────────┐      │ PreflightInspection  │
     │ │     Flight     │      │   (飛行前日常点検)   │
     │ │ (個々の離着陸) │      └──────────────────────┘
     │ └─────┬──┬───────┘
     │       │  │              ┌──────────────────────┐
     │       │  └─────────────►│ PostflightInspection │
     │       │                 │     (飛行後点検)     │
     │       │                 └──────────────────────┘
     │       ├─────────────────┐
     │       │ (aircraft_id)   │ (battery_id)
     │       ▼                 ▼
     │   [Aircraft]        [Battery]
     │
     │ *
   ┌─┴────────────────────────┐
   │     AircraftSwitch       │
   │      (機体交代記録)      │
   └──────────────────────────┘

  【独立台帳・管理・監査エンティティ】
  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐
  │   Permission   │  │  BatteryUsage  │  │ MaintenanceRecord  │
  │ (許可承認情報) │  │(充放電/保管/点検│  │  (点検整備台帳)    │
  └────────────────┘  └────────────────┘  └────────────────────┘
  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐
  │ ReportSnapshot │  │   SyncQueue    │  │     AuditEvent     │
  │(帳票発行スナップ│  │ (外部同期制御) │  │  (監査変更履歴)    │
  └────────────────┘  └────────────────┘  └────────────────────┘
```

---

## 2. 主要エンティティ詳細仕様

### 2.1 Organization（運用主体・企業/個人事業主マスター）
- **ID**: `organization_id` (UUID v4)
- **分類**: **Master**
- **役割**: ドローン運航の所有・法的管理主体。C1初期は単一デフォルト組織（UUID固定値）で動作し、将来の複数組織・企業利用に備えたデータスコープ境界を提供する。
- **主な属性**:
  - `name`: 組織・事業者名称（例: "個人事業主 吉田", "〇〇建設株式会社"）
  - `operator_code`: DIPS事業者コード / 法人番号（任意）
  - `contact_email`: 代表連絡先メールアドレス
  - `contact_phone`: 代表緊急連絡先
  - `status`: 状態（`ACTIVE`, `INACTIVE`）
  - 共通監査メタデータ（`created_at`, `updated_at`, `version`）

### 2.2 Client & Project（顧客・案件マスター - 業務利用対応）
- **Client ID**: `client_id` (UUID v4) / **Project ID**: `project_id` (UUID v4)
- **分類**: **Master**（業務利用任意マスター）
- **役割**: 商業空撮・測量・点検業務における発注元顧客および案件管理。個人練習時は未入力可。
- **主な属性 (Client)**:
  - `name`: 顧客企業名・個人名（例: "〇〇建設株式会社"）
  - `contact_person`: 担当者名
  - `contact_phone`: 連絡先
- **主な属性 (Project)**:
  - `client_id`: 発注顧客ID
  - `name`: 案件名称（例: "新東名第3工区進捗空撮"）
  - `start_date` / `end_date`: 案件期間
  - `notes`: 案件特記事項
- **リレーション**: `FlightPlan`, `Mission`, `OperationTemplate` から任意参照。

### 2.3 AircraftModel（機種・型式マスター）
- **ID**: `model_id` (UUID v4)
- **分類**: **Master**
- **役割**: ドローン製品の型式仕様。同一機種の複数機（A号機、B号機等）を所有する場合も本マスターを参照して仕様情報の重複を防ぐ。
- **主な属性**:
  - `manufacturer`: 製造者（例: "Autel Robotics", "DJI"）
  - `model_name`: 型式名（例: "EVO Lite Series", "Matrice 350 RTK"）
  - `model_code`: メーカー型番・記号（例: "MD-EVOLITE"）
  - `maker_type`: 区分（マルチコプター、固定翼、VTOL等）
  - `weight_grams`: 機体標準自重（g、バッテリー込）
  - `max_flight_time_minutes`: カタログ最大飛行時間（分）
  - `status`: 状態（`ACTIVE`, `DISCONTINUED`）

### 2.4 Aircraft（機体個別台帳）
- **ID**: `aircraft_id` (UUID v4)
- **分類**: **Master**
- **役割**: 実在する1機のドローン。
- **主な属性**:
  - `model_id`: 機種マスターID（`AircraftModel` 参照）
  - `nickname`: 機体呼称・愛称（例: "EVO Lite+ A号機"）
  - `registration_mark`: DIPS登録記号（例: "JU324XXXXXXX"）
  - `serial_number`: 機体固有製造番号
  - `cumulative_flight_minutes`: 累計飛行時間（分）
  - `cumulative_flight_count`: 累計飛行回数
  - `management_start_date`: 管理開始日
  - `status`: 状態（`ACTIVE`, `MAINTENANCE`, `RETIRED`, `LOST`）
  - **期限管理属性**:
    - `registration_expires_at`: 機体登録有効期限日時 (ISO8601)
    - `registration_warning_days`: 期限前警告日数（初期値: 30日）
    - `maintenance_due_date`: 次回点検予定日
    - `maintenance_due_flight_minutes`: 次回点検飛行時間閾値（例: 20時間/100時間）
- **リレーション**: `AircraftModel` (N:1), `Flight` (1:N), `MaintenanceRecord` (1:N)

### 2.5 BatteryModel（バッテリー型式マスター）
- **ID**: `battery_model_id` (UUID v4)
- **分類**: **Master**
- **役割**: バッテリーの製品型番仕様。実物個体とは分離して仕様を定義。
- **主な属性**:
  - `manufacturer`: 製造者
  - `model_number`: バッテリー製品型番（例: "AUTEL-LITE-BAT"）
  - `nominal_capacity_mah`: 公称容量（mAh、例: 6175）
  - `nominal_voltage_v`: 公称電圧（V、例: 11.13）
  - `cell_count`: セル数（例: 3S）

### 2.6 BatteryCompatibility（機材型式互換マッピング）
- **ID**: `compatibility_id` (UUID v4) または複合キー `(model_id, battery_model_id)`
- **分類**: **Master (関連)**
- **役割**: どの機種にどのバッテリー型式が装着可能かを定義する多対多（N:M）互換マスター。
- **例**:
  - `(EVO Lite Series, AUTEL-LITE-BAT)`
  - `(EVO Lite+ Series, AUTEL-LITE-BAT)`
  - これにより、同一モデルの複数機体間だけでなく、互換性のある異機種間でも同一バッテリー個体を安全・適正に共有可能。

### 2.7 Battery（実物バッテリー個体台帳）
- **ID**: `battery_id` (UUID v4)
- **分類**: **Master**
- **役割**: 実在するバッテリー1本。**特定機体の所有物としない**。
- **主な属性**:
  - `battery_model_id`: バッテリー型式ID（`BatteryModel` 参照）
  - `display_name`: 現場管理用表示名（例: "BAT-01", "BAT-02"）
  - `serial_number`: バッテリー個体シリアル番号
  - `purchase_date`: 購入日
  - `condition_at_start`: 管理開始時状態（`NEW`, `USED`）
  - `cumulative_cycle_count`: 累計充電サイクル数
  - `cumulative_flight_minutes`: 累計飛行時間（分、全機体での飛行合算）
  - `status`: 状態（`ACTIVE`, `IN_USE`, `DISCHARGED`, `MAINTENANCE`, `RETIRED`, `DISPOSED`）
  - `last_health_note`: 直近の異常・所感・セル電圧バランスメモ

### 2.8 Personnel（人員マスター）& ユーザーアカウント分離
- **ID**: `personnel_id` (UUID v4)
- **分類**: **Master**
- **役割**: 操縦者、日常点検者、立入管理補助者等を1人物1レコードとして一元管理。
- **ユーザーアカウントとの分離原則**: 運航記録に登場する人物（`Personnel`）と、アプリを操作するログインアカウント（`UserAccount`）を概念上分離し、補助者や同行パイロットがアプリアカウントを持たない場合でも適正に記録可能とする。
- **主な属性**:
  - `name`: 氏名（漢字）
  - `kana`: フリガナ
  - `contact_phone`: 緊急連絡先電話番号
  - `contact_email`: 連絡先メール
  - `roles`: 担当可能役割配列（`['pilot', 'inspector', 'assistant', 'administrator', 'viewer']`）
  - **操縦者プロファイル（`roles` に `pilot` を含む場合のみ有効）**:
    - `license_number`: 技能証明書番号 / 技能認証番号
    - `certificate_type`: 区分（一等、二等、民間修了等）
    - `certificate_expires_at`: 有効期限 (ISO8601)
    - `warning_days`: 期限前警告日数（初期値: 30日）
  - `is_default_pilot`: 既定の主操縦者フラグ
  - `is_default_inspector`: 既定の日常点検者フラグ
  - `status`: 状態（`ACTIVE`, `INACTIVE`, `RETIRED`）

### 2.9 Location（場所マスター）
- **ID**: `location_id` (UUID v4)
- **分類**: **Master**
- **役割**: 登録済みの飛行現場。頻繁に飛行する現場の基本情報・注意事項を再利用。
- **主な属性**:
  - `name`: 現場地点名・施設名（例: "金岡公園", "〇〇浄水場"）
  - `address`: 住所・地番
  - `latitude` / `longitude`: 現場代表基準座標（10進表記）
  - `site_contact`: 現地管理者・連絡先
  - `land_manager_notes`: 土地管理者との調整事項・許可条件メモ
  - `parking_entry_notes`: 駐車場・搬入・立入注意事項
  - `is_favorite`: お気に入りフラグ
  - `status`: 状態（`ACTIVE`, `INACTIVE`, `ARCHIVED`）

### 2.10 FlightAreaPreset（飛行範囲プリセット）
- **ID**: `flight_area_preset_id` (UUID v4)
- **分類**: **Preset**
- **役割**: `Location 1:N FlightAreaPreset`。同一現場内の具体的な飛行範囲形状・高度。
- **主な属性**:
  - `location_id`: 属する場所マスターID
  - `name`: エリア呼称（例: "野球場外野エリア", "南側練習範囲", "30m円形基本枠"）
  - `shape_type`: 形状区分（`circle` / `polygon`）
  - `radius_meters`: 半径（m、円形時）
  - `geojson_geometry`: 多角形ポリゴンGeoJSON（ポリゴン時）
  - `default_altitude_agl_meters`: 既定計画対地高度（m、例: 30m）
  - `max_altitude_agl_meters`: 運用上限高度（m）

### 2.11 入力プリセット群（FlightPurposePreset / SafetyMeasurePreset）
- **分類**: **Preset**
- **`FlightPurposePreset`**: 飛行目的マスター（"練習", "空撮", "点検", "測量", "農薬散布" 等）。
- **`SafetyMeasurePreset`**: 安全措置プリセット（"補助者1名配置", "カラーコーン区画設定", "監視員配置", "第三者立入禁止周知" 等）。
- 現場での定型入力をドロップダウンおよびチェックボックスで1タップ選択可能とする。

### 2.12 OperationTemplate（運航テンプレート - Copy Source原則）
- **ID**: `template_id` (UUID v4)
- **分類**: **Preset**
- **役割**: 頻繁に行う運航条件の組み合わせセット。
- **主な属性**:
  - `template_name`: テンプレート名（例: "金岡公園 定例練習", "〇〇現場 進捗空撮"）
  - `location_id`: 場所マスターID
  - `flight_area_preset_id`: 飛行範囲プリセットID
  - `flight_purpose`: 飛行目的プリセット値
  - `planned_altitude_agl`: 既定計画高度
  - `default_aircraft_id`: **任意（nullable）**（機体まで固定したテンプレート、または機体は現場で決める汎用テンプレートの両方に対応）
  - `pilot_id`: 既定操縦者ID
  - `assistant_id`: 既定補助者ID（任意）
  - `safety_measures`: 適用する安全措置配列
  - `permission_id`: 適用する包括許可承認ID（任意）
- **コピーソース原則（Copy Source Principle）**:
  - テンプレートから新規計画（`FlightPlan`）を作成する際、テンプレートの値は**計画Draftへ独立してコピー（実体化）**される。
  - **後日テンプレートを編集・更新・削除しても、過去の計画・通報・運航実績データは一切改変されない。**

### 2.13 Permission（飛行許可・承認台帳）
- **ID**: `permission_id` (UUID v4)
- **分類**: **Master**
- **役割**: 国交省包括許可・個別許可承認書情報。
- **主な属性**:
  - `permit_number`: 許可承認番号（例: "国空航第XXXXX号"）
  - `permit_date`: 許可年月日 (YYYY-MM-DD)
  - `permit_type`: 許可区分（DID、夜間、目視外、30m等）
  - `valid_from` / `valid_to`: 適用有効期間開始日・終了日
  - `issuing_authority`: 発行機関（国土交通省航空局長等）
  - `contact_name`: 許可申請連絡先氏名
  - `contact_phone`: 許可申請連絡先電話番号
  - `contact_email`: 許可申請連絡先メールアドレス
  - `conditions`: 付加条件メモ / 飛行マニュアル区分
  - `status`: 状態（`ACTIVE`, `EXPIRED`, `SUPERSEDED`）

### 2.14 InsurancePolicy（保険台帳マスター - 新設）
- **ID**: `insurance_policy_id` (UUID v4)
- **分類**: **Master**
- **役割**: ドローン賠償責任保険・機体保険の契約台帳（DIPS No.60〜65対応）。特定1機に固定されず組織・複数機材で適用可能。
- **主な属性**:
  - `organization_id`: 運用組織ID (nullable)
  - `insurer_name`: 引受保険会社名（例: "三井住友海上火災保険"）
  - `product_name`: 保険商品名（例: "ドローン賠償責任保険"）
  - `policy_number`: 証券番号（任意 / マスキング考慮）
  - `valid_from` / `valid_until`: 保険期間開始日・満了日 (YYYY-MM-DD)
  - `liability_available`: 賠償責任保険加入有無 (boolean)
  - `bodily_injury_limit_man_yen`: 対人賠償限度額（万円、無制限時は下記フラグ優先）
  - `bodily_injury_unlimited`: 対人賠償無制限フラグ（※DIPS Adapterで `-1` へ変換）
  - `property_damage_limit_man_yen`: 対物賠償限度額（万円、無制限時は下記フラグ優先）
  - `property_damage_unlimited`: 対物賠償無制限フラグ（※DIPS Adapterで `-1` へ変換）
  - `coverage_scope`: 適用範囲（`organization_wide`, `fleet_wide`, `specific_aircraft`, `project_specific`）
  - `applicable_aircraft_ids`: 特定機体限定時の対象機体ID配列
  - `status`: 状態（`ACTIVE`, `EXPIRED`, `ARCHIVED`）
  - `notes`: 保険特記メモ

### 2.15 FlightPlan（内部飛行計画）
- **ID**: `flight_plan_id` (UUID v4)
- **分類**: **History (Plan)**
- **主な属性**:
  - `revision`: リビジョン番号（整数、変更時にインクリメント）
  - `organization_id`: 運用組織ID
  - `project_id`: 関連業務案件ID（任意）
  - `name`: 飛行計画名称（例: "金岡公園_定期空撮_20261020"。DIPS Web自動生成名称は表示用参考とし、UUIDを内部正本IDとする）
  - `submitted_by_user_id`: 通報・入力操作者（SubmissionActor。現場パイロットや連絡先と同一である必要はない）
  - `primary_aircraft_id`: 主使用機体ID
  - `aircraft_ids`: 対象機体ID配列（**複数機体対応**）
  - `planned_total_weight_kg`: 当該運航での最大離陸総重量（自重＋装備品、kg）
  - `planned_endurance_minutes`: 当該計画での航続可能時間（分）
  - `primary_pilot_id`: 主操縦者ID
  - `pilot_ids`: 操縦者ID配列（**複数操縦者対応**）
  - `selected_assistant_person_ids`: 登録Personnelから選択した補助者ID配列
  - `planned_assistants_count`: DIPS申告用補助者人数（人数override対応）
  - `location_id`: 場所マスターID
  - `planned_start_time` / `planned_end_time`: 飛行予定日時 (ISO8601、主日程)
  - `planned_occurrences`: **複数日・定期指定拡張用配列**（オプショナル: `Array<{ start_time: string; end_time: string }>`。C1で単一日時スキーマを破壊せず、将来拡張を許容）
  - `planned_duration_minutes`: 飛行予定時間（分）
  - `planned_speed_kmh`: 巡航対地速度（km/h）
  - `altitude_type`: 高度種別（`AGL`対地 / `MSL`海抜）
  - `planned_altitude_agl_meters`: 計画対地高度（m）
  - `planned_altitude_msl_meters`: 計画海抜高度（m、任意）
  - `geometry_kind`: 形状種別（`circle` / `polygon` / `buffered_line`）
  - `geometry`: 中立幾何モデル（`FlightAreaGeometry`: center/radius、polygon_points、または path_points/buffer_radius）
  - `geometry_snapshot`: 提出時飛行範囲ディープコピー（不変スナップショット）
  - `internal_purpose_id`: アプリ内部目的ID（`InternalFlightPurpose`。操縦練習、観光PR撮影、屋根外壁点検等）
  - `flight_purpose_codes`: DIPS公式飛行目的数値コード配列（**複数選択対応**、1〜16。`DipsPurposeMapper` により内部目的から自動推奨または手動選択）
  - `flight_purpose_other_text`: 目的「その他」選択時の詳細理由（テキスト）
  - `flight_airspace_codes`: 飛行空域数値コード配列（**複数選択対応**、空港等周辺・150m以上・DID・該当なし。緊急用務空域は飛行前現場確認として分離）
  - `flight_type_codes`: 飛行形態数値コード配列（**複数選択対応**、夜間・目視外・30m未満・催し場所・危険物・物件投下・該当なし）
  - `permission_id`: 適用許可承認ID (nullable、選択時に許可番号・期間・カテゴリーを参照)
  - `insurance_policy_id`: 適用保険マスターID (nullable、選択時に保険会社・商品名・対人対物補償等を自動補完し今回Override可能)
  - `onsite_control_code`: 立入管理等の安全確保措置コード
  - `safety_measures`: 適用安全措置テキスト配列
  - `flight_manual_type`: 飛行マニュアル区分（標準 / 独自）
  - `emergency_procedure_confirmed`: 緊急時手順確認フラグ（true固定）
  - `preflight_inspection_planned`: 点検実施確認フラグ（true固定）
  - `weather_check_confirmed`: 気象確認フラグ（true固定）
  - `communication_check_confirmed`: 連絡体制確認フラグ（true固定）
  - `radio_check_confirmed`: 無線機器確認フラグ（true固定）
  - `accident_action_confirmed`: 事故対応確認フラグ（true固定）
  - `contact_source`: 緊急連絡先選択区分（`user_account` 自アカウント / `application` 申請書情報 / `pilot` 操縦者）
  - `contact_person_id`: 連絡先対象人物ID（操縦者選択時の参照）
  - `emergency_contact_target`: 優先緊急連絡先区分（`pilot` / `reporter` / `permit`）
  - `remarks`: 計画書特記事項
  - `plan_status`: 計画状態（`draft` [入力途中常時保存可], `submission_ready` [必須・適用条件充足], `locked_for_submission` [提出スナップショット生成済], `active` [運航中], `completed` [運航完了], `cancelled` [中止]）
  - `readiness_cache`: 直近の `DipsSubmissionReadiness` 評価結果キャッシュ（オプショナル）
  - **値の上書き追跡（Effective/Override）**: 各項目について `source_master_value`（マスター/プリセット元値）と `override_value`（今回計画の上書き値）を区別し、通報・スナップショットには `effective_value`（上書き優先確定値）を採用する。

### 2.16 DipsSubmission（DIPS提出試行・不変スナップショット台帳 - SSoT）
- **ID**: `submission_id` (UUID v4)
- **分類**: **History (SSoT)**
- **役割**: DIPSへの通報直前または手動確定時点で生成される提出試行レコード。スプレッドシート「DIPS飛行計画台帳」の1行に対応。
- **属性**:
  - `flight_plan_id`: 対象飛行計画ID
  - `revision`: 提出リビジョン番号
  - `dips_contract_version`: 基準API仕様バージョン（例: `"FPR-API-1.9"`）
  - `submission_method`: 通報方式 (`manual` / `api` / `mock`)
  - `status`: 通報状態 (`snapshot_saved`, `manual_submit_wait`, `manual_submitted`, `dips_confirmed`, `api_confirmed`, `failed`, `cancelled`, `superseded`, `system_outage_exception`)
  - `sync_status`: スプレッドシート台帳同期状態 (`local_saved`, `sync_pending`, `syncing`, `synced`, `sync_failed`)
  - `payload_snapshot`: **提出時点のexact outbound payload（不変JSON文字列）**
  - `dips_plan_id`: DIPS飛行計画番号（受付番号、nullable）
  - `confirmation_method`: 確認方式 (`flight_plan_list_match` / `displayed_id` / `api_response`)
  - `submitted_at`: 通報日時
  - `confirmed_at`: 確認日時
  - `cancel_reason`: 取消時の理由テキスト
  - `notes`: 提出特記事項

### 2.17 DipsNotification（通報状態集約プロジェクション）
- **分類**: **Projection (集約ビュー)**
- `DipsSubmission` から最新状態を射影してUIへ表示する読み取り専用モデル（二重正本を排除）。

### 2.18 Mission（現場運航セッション束）
- **ID**: `mission_id` (UUID v4)
- **分類**: **History (Session)**
- **役割**: 現場での一連の作業枠（準備開始〜完全撤収）。操縦者の片手操作フローを束ねる。
- **主な属性**:
  - `planned_flight_plan_id`: 紐付く計画ID（任意）
  - `location_id`: 現場場所ID
  - `pilot_id`: 主操縦者ID
  - `assistant_id`: 補助者ID（任意）
  - `weather`: 天候、`wind_speed_ms`: 風速、`temperature_c`: 気温
  - `status`: 運航状態（`preparing`, `in_progress`, `completed`, `aborted`）
  - `started_at` / `ended_at`: 運航日時
  - `sync_status`: 台帳同期状態

### 2.19 Flight（個々の離陸〜着陸セッション）
- **ID**: `flight_id` (UUID v4)
- **分類**: **History (Event)**
- **役割**: ドローンの1回の離陸から着陸までの実績記録。
- **主な属性**:
  - `mission_id`: 属するミッションID
  - `flight_sequence`: 運航内通番（1, 2, 3... 制限なし）
  - `aircraft_id`: **実際に飛行した機体ID**（途中交代対応）
  - `battery_id`: **使用したバッテリーID**
  - `takeoff_time` / `landing_time`: 離陸・着陸打刻日時 (ISO8601)
  - `duration_seconds`: 実飛行秒数（分単位へ換算可能）
  - `start_battery_pct` / `end_battery_pct`: 離陸時・着陸時残量（%）
  - `flight_nature`: 業務・訓練の別
  - `pilot_notes`: 飛行所感・特記不具合
- **二重保存の排除**: 飛行によるバッテリー使用実績（いつ、どの機体で、何分飛び、何%消費したか）は本 `Flight` レコードから完全に集計・導出可能であるため、別テーブルへ重複保存しない。

### 2.20 AircraftSwitch（機体交代イベント記録）
- **ID**: `switch_id` (UUID v4)
- **分類**: **History (Event)**
- **主な属性**: `mission_id`, `from_aircraft_id`, `to_aircraft_id`, `switched_at`, `reason`。

### 2.21 DipsFieldRequirementEngine（通報項目要件・適用性判定ドメインサービス）
- **分類**: **Domain Service**
- **役割**: `FlightPlan`, `Aircraft`, `Personnel`, `Permission`, `InsurancePolicy`, プリセットおよび運航条件を入力とし、指定DIPS契約バージョン（例: `"FPR-API-1.9"`）に基づいて、各通報項目の「要求度（Contract Requirement）」「適用性（Applicability）」「入力責任（Input Responsibility）」「有効確定値（Effective Value）」「検証合否（Validation Status）」を評価し、`DipsSubmissionReadiness`（計画全体の提出可否判定結果）を出力する。
- **4段階状態の遷移判定**:
  - `DRAFT`（入力途中常時保存可） → [Requirement Engine評価] → `SUBMISSION_READY`（提出可） → [スナップショット生成] → `SNAPSHOT_SAVED`（`DipsSubmission` 起票・ローカルDB保存）。

### 2.22 DipsReportingRequirementEvaluator（DIPS通報要否判定ドメインサービス）
- **分類**: **Domain Service**
- **役割**: `FlightPlan` の飛行空域・飛行形態条件から、今回の運航が航空法上の特定飛行（通報義務あり: `REQUIRED`）か、非特定飛行（通報推奨: `NOT_REQUIRED`）かを独立判定する。

### 2.23 TakeoffReadinessAssessment（離陸前総合評価ドメインサービス）
- **分類**: **Domain Service**
- **役割**: 現場離陸前の総合状態を評価する。DIPS要否（`DipsReportingRequirement`）とDIPS通報状態（`DipsSubmission.status`）、飛行前日常点検（合否）、許可承認の有効性、気象・現場安全状況、システム障害例外（`SYSTEM_OUTAGE_EXCEPTION`）の有無を独立に多軸判定し、Application Hard Block（点検不合格等）と Regulatory/Safety Warning を分離して提供する（操縦者の実際の離陸打刻記録は妨げない）。

### 2.24 PreflightInspection & PostflightInspection（日常点検記録）
- **ID**: `inspection_id` (UUID v4)
- **分類**: **History**
- **主な属性**: `inspection_type` (`preflight` / `postflight`), `aircraft_id`, `inspector_id` (`Personnel` 参照), `items` (点検項目配列), `is_all_normal`, `defect_description`, `remedy_action`。

### 2.25 MaintenanceRecord（点検整備台帳・国交省様式3）
- **ID**: `maintenance_id` (UUID v4)
- **分類**: **History**
- **役割**: 機体の生涯点検整備記録（定期点検20h/100h、修理、改造、部品交換、ファーム更新）。
- **主な属性**: `aircraft_id`, `maintenance_type`, `performed_at`, `cumulative_flight_minutes_at_maintenance`, `description`, `parts_replaced`, `technician_name`。

### 2.26 BatteryUsage（バッテリーライフサイクルイベント）
- **ID**: `usage_id` (UUID v4)
- **分類**: **History**
- **役割**: **飛行以外のバッテリーライフサイクルイベント専用エンティティ**（充電完了、深放電、保管管理、定期点検、セル電圧測定、廃棄処理等）。飛行実績と責務を重複させない。
- **主な属性**: `battery_id`, `event_type` (`CHARGE`, `STORAGE_MAINTENANCE`, `CAPACITY_TEST`, `DEEP_DISCHARGE_WARNING`, `RETIRED_EVENT`), `event_time`, `measured_voltage_v`, `cell_voltages`, `notes`。

### 2.27 ReportSnapshot（帳票発行不変スナップショット）
- **ID**: `report_snapshot_id` (UUID v4)
- **分類**: **History (Snapshot)**
- **役割**: 統合運航帳票または国交省様式PDF/Excel出力時に生成される発行不変スナップショット。提出・監査用に「発行時点でどのような帳票が確定されたか」を恒久保管する。
- **主な属性**: `report_type` (`INTEGRATED_OPERATION_REPORT`, `FORM_1_FLIGHT_LOG`, `FORM_2_DAILY_INSPECTION`, `FORM_3_MAINTENANCE`), `mission_id`, `aircraft_id`, `location_id`, `generated_at`, `page_count`, `checksum_sha256`, `pdf_blob_key`。

### 2.28 AuditEvent（全般監査ログ・変更履歴）
- **ID**: `audit_id` (UUID v4)
- **分類**: **History**
- **役割**: DIPS提出だけでなく、機体・バッテリー・人員・許可・運航記録の作成・更新・同期・論理削除を記録。
- **属性**: `timestamp`, `entity_type`, `entity_id`, `action` (`CREATE`, `UPDATE`, `LIFECYCLE_CHANGE`, `SYNC`), `actor_personnel_id`, `diff_summary`, `reason`。

### 2.29 AppSetting（アプリ設定・警告閾値マスター）
- **ID**: `setting_key` (string)
- **分類**: Key-Value Master
- 各種期限警告閾値（機体登録、技能証明、許可承認）、地図キャッシュ設定、連携スプレッドシートID等を保持。

---

## 3. Master / Preset / History / Projection の4大分類と共通設計規約

| 分類 | 定義と性質 | 該当エンティティ | ライフサイクル・更新規則 |
|---|---|---|---|
| **Master** | 実在する管理対象・運用資産。他エンティティから参照される親データ。 | `Organization`, `Client`, `Project`, `AircraftModel`, `Aircraft`, `BatteryModel`, `BatteryCompatibility`, `Battery`, `Personnel`, `Location`, `Permission`, `InsurancePolicy`, `AppSetting` | **物理削除禁止**。`ACTIVE`, `INACTIVE`, `RETIRED`, `DISPOSED`, `EXPIRED` 等の論理状態で管理。過去履歴の参照を保護。 |
| **Preset** | 現場入力の手間を省くための再利用可能な条件セット。 | `FlightAreaPreset`, `FlightPurposePreset`, `SafetyMeasurePreset`, `OperationTemplate` | **コピーソース原則**。新規計画へ値をコピー実体化。後日のプリセット変更は過去データへ影響しない。 |
| **History** | 現場で実際に発生・確定した不可逆の運航・点検・通報・監査実績。 | `FlightPlan`, `DipsSubmission`, `Mission`, `Flight`, `AircraftSwitch`, `PreflightInspection`, `PostflightInspection`, `MaintenanceRecord`, `BatteryUsage`, `ReportSnapshot`, `AuditEvent` | **不変性重視**。生成後の値改変は禁止（ライフサイクルメタデータ更新のみ許容し、変更は `AuditEvent` 追跡）。 |
| **Projection** | 複数のエンティティから画面表示、帳票レンダリング、地図エクスポートのために導出される参照ビュー。 | `DipsNotification`, `ReportUnit` / `FlightLogReportViewModel`, `KmlExportModel` | **一時的・導出モデル**。正本を持たず、元データから動的に計算・構築（KMLやPDF用に専用入力画面を作らず、Domain単一入力から生成）。 |

### 3.1 共通監査メタデータ方針
すべてのMasterおよびHistoryエンティティは、以下の標準メタデータ属性を保持可能な構造とします：
- `created_at`: 作成日時 (ISO8601)
- `created_by`: 作成者Personnel ID（任意）
- `updated_at`: 更新日時 (ISO8601)
- `updated_by`: 更新者Personnel ID（任意）
- `version`: 楽観的ロック・競合検出用リビジョン番号（整数、1から開始）

### 3.2 一括登録（Bulk Import/Export）対応準備
会社利用における大量機材（機体20機、バッテリー50本、人員30人等）の登録に対応するため、以下の原則を適用します：
- すべてのMasterは安定したUUID v4を主キーとしつつ、`external_code`（社内管理番号等）による重複判定・UPSERTを許容。
- 将来のCSV/JSONインポート機能に対応できるよう、各フィールドの必須・任意制約およびバリデーションをドメイン層で明確化。

---

## 4. Googleスプレッドシート論理台帳構成

### 4.1 シート増殖禁止の原則
- **「機体数・バッテリー数・人員数・現場数・飛行回数・運航日数に比例してシートを自動増殖させない」**ことを絶対原則とします。
- 1機体1シート、1バッテリー1シート、日別原本複製を禁止し、各シートはリレーショナルテーブルに準じた「行追加型」「行更新型」の台帳として運用します。

### 4.2 シート分類と推奨構成
枚数は固定せず、同期の安全性・運用の見通し・監査性に基づき以下のように分類します。

| No | 論理台帳名（シート名） | 役割・格納データ | 独立Sheet推奨 | 同期・管理方針 |
|:--:|---|---|:--:|:--:|
| 1 | **`DIPS飛行計画台帳`** | DIPS提出不変スナップショット・通報履歴（SSoT） | **YES** | **必須同期**（法的監査最重要） |
| 2 | **`運航実績台帳`** | 全フライトの離着陸実績（時刻、実時間、機体ID、BAT-ID、残量、所感） | **YES** | **必須同期**（全機体共通の行追加型） |
| 3 | **`日常点検台帳`** | 飛行前・飛行後日常点検記録（日付、機体ID、点検者、合否、処置） | **YES** | **必須同期**（全機体共通の行追加型） |
| 4 | **`点検整備台帳`** | 国交省様式3（定期点検20h/100h、部品交換、修理）。全機体共通 | **YES** | **必須同期**（機体ID列を持つ行追加型） |
| 5 | **`機体台帳`** | 機種（Model）情報および機体個別情報（登録記号、製造番号、累計） | **YES** | **同期推奨**（行更新型マスター） |
| 6 | **`バッテリー台帳`** | バッテリー型式および個体情報（シリアル、互換機種、累計サイクル、時間） | **YES** | **同期推奨**（行更新型マスター） |
| 7 | **`バッテリー使用履歴`** | バッテリー個体ごとの使用実績（飛行時間、放電、所感） | **NO** (派生View) | **派生View**（`運航実績台帳` から数式・QUERY等で自動参照表示） |
| 8 | **`人員・場所台帳`** | 人員（Personnel）、場所（Location）、許可承認（Permission） | **YES** | **任意同期**（1シートにまとめるかタブ分け） |
| 9 | **`保険台帳`** | ドローン賠償責任保険（`InsurancePolicy`）情報（会社名、証券、限度額） | **YES** | **同期推奨**（行更新型マスター） |
| 10 | **`案件台帳`** | 顧客（Client）、案件（Project）マスター | **YES** (業務利用時) | **任意同期**（個人利用時は省略可） |
| 11 | **`プリセット・テンプレート`** | 飛行範囲、目的、安全措置Preset、運航テンプレート | **NO** (ローカル優先) | **ローカル中心**（バックアップ時のみJSON同期等） |
| 12 | **`帳票発行台帳`** | 発行された統合A4帳票等のメタデータ・履歴（`ReportSnapshot`） | **YES** (監査用) | **任意同期**（監査用メタデータ行追加） |

---

## 5. ID戦略と冪等性（Idempotency）設計

### 5.1 クライアント主導のUUID v4生成
すべてのエンティティID（`mission_id`, `flight_id`, `personnel_id`, `aircraft_id`, `battery_id`, `submission_id` 等）は、オフライン現場での即時発行を保証するため、**クライアント側で生成するUUID v4**を採用します。

### 5.2 冪等キー（Idempotency Key）の設計原則
- **不変操作（Flight打刻、点検記録、提出スナップショット等）**: 操作発生時に発行された不変の `operation_id`（UUID v4）を用いて再送時の重複登録を防止。
- **状態更新エンティティ（Mission、機体設定等）**: `idempotency_key = SHA256(entity_type + ":" + entity_id + ":" + sync_revision)` により、実質的な更新のみを安全に反映。
- **外部同期**: Googleスプレッドシート側で `operation_id` または `record_id` + `sync_revision` によるUPSERTを実施し、多重送信による二重書き込みを完全に防止。
