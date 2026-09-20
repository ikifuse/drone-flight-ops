# 12b. 機種・機体・バッテリーと互換関係

最終更新: 2026-09-20\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: 機材の型式と個体、N:M互換、バッテリーの非飛行ライフサイクル。

99.2 §4の取得・共用・累計の詳細因果は[asset-management](../asset-management/README.md)を正本とする。本書は既存の正規化と属性定義を保持し、未確定の取得履歴schemaを追加しない。

## 1. AircraftModel（機種・型式マスター）
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

## 2. Aircraft（機体個別台帳）
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

`cumulative_flight_minutes`を取得以前を含む正確な総飛行時間と無条件に同一視しない。[32a](../asset-management/32a_aircraft-acquisition-and-cumulative-time.md)が前歴不明・管理開始00:00・後日の記録継承の意味と根拠を定める。既存の累計・管理開始日だけで取得前履歴を保持済みとはせず、具体的な追加列・関連は同書のPENDINGに残す。

## 3. BatteryModel（バッテリー型式マスター）
- **ID**: `battery_model_id` (UUID v4)
- **分類**: **Master**
- **役割**: バッテリーの製品型番仕様。実物個体とは分離して仕様を定義。
- **主な属性**:
  - `manufacturer`: 製造者
  - `model_number`: バッテリー製品型番（例: "AUTEL-LITE-BAT"）
  - `nominal_capacity_mah`: 公称容量（mAh、例: 6175）
  - `nominal_voltage_v`: 公称電圧（V、例: 11.13）
  - `cell_count`: セル数（例: 3S）

## 4. BatteryCompatibility（機材型式互換マッピング）
- **ID**: `compatibility_id` (UUID v4) または複合キー `(model_id, battery_model_id)`
- **分類**: **Master (関連)**
- **役割**: どの機種にどのバッテリー型式が装着可能かを定義する多対多（N:M）互換マスター。
- **例**:
  - `(EVO Lite Series, AUTEL-LITE-BAT)`
  - `(EVO Lite+ Series, AUTEL-LITE-BAT)`
  - これにより、同一モデルの複数機体間だけでなく、互換性のある異機種間でも同一バッテリー個体を安全・適正に共有可能。

固定スロット／主所属機体から現在の分離に至った因果、機体セット別表示を固定所有にしない理由と実例は[32b §1・§2](../asset-management/32b_battery-sharing-and-acquisition-history.md)へ集約する。例示された機種・機数・BAT数を固定仕様としない。

## 5. Battery（実物バッテリー個体台帳）
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

中古BATの取得時確認値と取得後履歴の意味は[32b §3](../asset-management/32b_battery-sharing-and-acquisition-history.md#3-中古batの取得時確認とその後の履歴)。現在累計と取得時観測値を混同せず、物理フィールド名を本書で先取りしない。

## 6. BatteryUsage（バッテリーライフサイクルイベント）
- **ID**: `usage_id` (UUID v4)
- **分類**: **History**
- **役割**: **飛行以外のバッテリーライフサイクルイベント専用エンティティ**（充電完了、深放電、保管管理、定期点検、セル電圧測定、廃棄処理等）。飛行実績と責務を重複させない。
- **主な属性**: `battery_id`, `event_type` (`CHARGE`, `STORAGE_MAINTENANCE`, `CAPACITY_TEST`, `DEEP_DISCHARGE_WARNING`, `RETIRED_EVENT`), `event_time`, `measured_voltage_v`, `cell_voltages`, `notes`。

## 7. 飛行実績との責務境界

バッテリー交換は次のFlightの `battery_id` 選択であり、交換だけで `BatteryUsage` に飛行使用記録を重複生成しない。実使用の機体・バッテリー・時間の正本は [Flight](12e_operation-inspection-maintenance.md)、非飛行の充放電・保管等は本書 `BatteryUsage`。累計値の手動修正と同期優先順位は [Data Authority](../11_data-authority.md)。

この論理責任と、旧BatteryUsageモックや現03の表・行構造を区別する。[32b §4・§5](../asset-management/32b_battery-sharing-and-acquisition-history.md#4-飛行実績と非飛行履歴の責任を保持する)に従い、最終的な物理保存の配置はPENDINGとする。

## 8. 業務上の状態と保存enumの対応（PENDING-C1-SCHEMA）

統合要件が求める保管・点検・劣化・紛失の管理と、本書の既存 `Battery.status` / 非飛行イベントの対応は未確定である。これらの業務状態を省略せず、ライフサイクル、使用中/放電等の運用状態、健全性を1つのenumに統合すべきか別軸にすべきかをC1 schema確定前に整理する。既存enumを完成済みと扱わず、推測で新しい保存値を追加しない。表示の案は[32d](../asset-management/32d_battery-ledger-and-status-design.md)（NEW-PROPOSAL、オーナー確認待ち）。状態を三つの軸に分ける初版の案は取り下げた。BAT管理を機体単位の任意にしたこと（[32e](../asset-management/32e_battery-management-scope-and-flight-separation.md)）と保存構造・入力の方針（[32f](../asset-management/32f_battery-storage-structure.md)・[32g](../asset-management/32g_battery-field-input.md)）に伴い、機体ごとのBAT管理の有無を保持する場所（Aircraft属性か環境の設定か）、BAT管理がOFFの機体のFlightでの`battery_id`の扱い、管理ラベルと`display_name`・個体番号と`serial_number`の対応、入手元、最新サイクル数と`cumulative_cycle_count`の意味の対応も、schema固定前に整理する（推測で属性・保存値を追加しない）。

Step 6の柔軟な1飛行・内部明細の意味は[35a](../operation-recording/35a_flexible-flight-and-details.md)。本書の飛行由来使用履歴の参照を、1Flight1BATという最終schemaの決定に使わない。32bの物理履歴配置PENDINGは維持する。
