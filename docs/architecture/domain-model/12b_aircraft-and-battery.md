# 12b. 機種・機体・バッテリーと互換関係

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: 機材の型式と個体、N:M互換、バッテリーの非飛行ライフサイクル。

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
  - `cumulative_flight_minutes`: 当方管理開始後の累計飛行時間（分）
  - `cumulative_flight_count`: 当方管理開始後の累計飛行回数
  - `management_start_date`: 当方管理開始日 (ISO8601)
  - `status`: 状態（`ACTIVE`, `MAINTENANCE`, `RETIRED`, `LOST`）
  - **期限管理属性**:
    - `registration_expires_at`: 機体登録有効期限日時 (ISO8601)
    - `registration_warning_days`: 期限前警告日数（初期値: 30日）
    - `maintenance_due_date`: 次回点検予定日
    - `maintenance_due_flight_minutes`: 次回点検飛行時間閾値（例: 20時間/100時間）
- **中古機材の取得前履歴と当方管理開始後累計の恒久的分離**:
  - 中古機体（EVO Lite+等）を取得した場合、「当方管理開始累計 = 00:00」として管理を開始する。これは製造後一度も飛行していないことを意味するのではなく、根拠のない推測過去時間を作らず、当方で責任をもって管理・追跡できる時点からの確定累計として扱う設計である。
  - 過去の飛行を推測して架空の `Flight` や `Mission` を補完・作成してはならない。
  - 将来、前所有者の信頼できる公的・整備記録が入手できた場合も、当方管理開始累計そのものへ過去時間を加算・上書きせず、「取得前履歴」と「当方管理開始後累計」を別の意味論として独立保持する。
  - 取得前履歴（前所有者記録、推計値等）の具体的物理保持構造は **PENDING-C1-SCHEMA** とする。
- **リレーション**: `AircraftModel` (N:1), `Flight` (1:N), `MaintenanceRecord` (1:N)

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
  - これにより、同一モデルの複数機体間だけでなく、互換性のある異機種間でも同一バッテリー個体を安全・適正に共有可能とする。
- **N:M共用管理とフリート拡張性**:
  - バッテリー個体を特定機体の固定所属（1:N関係）とせず、型式互換に基づく共用プールとして管理する。
  - 個人運用の「機体2機・BAT7本」の実例から、将来会社・スクール等で機体数やBAT本数が増加した場合（例: 3機・20本）でも、マスターの変更で拡張しやすくし、データ構造の破壊的変更リスクを低減する。
  - スプレッドシートや画面表示で見られる「機体セット別BAT配置」は、現場利用者の見やすさを目的とした表示上の配慮（Projection / Presentation）にすぎず、データ構造上の物理的所有関係を表すものではない。

## 5. Battery（実物バッテリー個体台帳）
- **ID**: `battery_id` (UUID v4)
- **分類**: **Master**
- **役割**: 実在するバッテリー1本。**特定機体の所有物としない**。
- **主な属性**:
  - `battery_model_id`: バッテリー型式ID（`BatteryModel` 参照）
  - `display_name`: 現場管理用表示名（例: "BAT-01", "BAT-02", "BAT-⑤"）
  - `serial_number`: バッテリー個体シリアル番号
  - `purchase_date`: 購入日または取得日 (ISO8601)
  - `condition_at_start`: 管理開始時状態（`NEW`, `USED`）
  - `cumulative_cycle_count`: 累計充電サイクル数
  - `cumulative_flight_minutes`: 当方管理開始後の累計飛行時間（分、全機体での飛行合算）
  - `status`: 状態（`ACTIVE`, `IN_USE`, `DISCHARGED`, `MAINTENANCE`, `RETIRED`, `DISPOSED`）
  - `last_health_note`: 直近の異常・所感・セル電圧バランスメモ
- **取得時確認サイクル数と管理開始後使用履歴の分離**:
  - 中古BAT（実例: ⑤=5回、⑥=7回、⑦=6回）を取得した場合、取得時に実確認したサイクル数を「取得時確認サイクル数」として台帳に保持し、当方管理開始後の使用回数・飛行時間と意味論を分離する。
  - 取得時サイクル数から機体の総飛行時間を推測・逆算してはならない。
  - 取得時確認サイクル数を保持する具体的物理カラム名・定義は **PENDING-C1-SCHEMA** とする。

## 6. BatteryUsage（バッテリーライフサイクルイベント）
- **ID**: `usage_id` (UUID v4)
- **分類**: **History**
- **役割**: **飛行以外のバッテリーライフサイクルイベント専用エンティティ**（充電完了、深放電、保管管理、定期点検、セル電圧測定、廃棄処理等）。飛行実績と責務を重複させない。
- **主な属性**: `battery_id`, `event_type` (`CHARGE`, `STORAGE_MAINTENANCE`, `CAPACITY_TEST`, `DEEP_DISCHARGE_WARNING`, `RETIRED_EVENT`), `event_time`, `measured_voltage_v`, `cell_voltages`, `notes`。

## 7. 飛行実績との責務境界

バッテリー交換は次のFlightの `battery_id` 選択であり、交換だけで `BatteryUsage` に飛行使用記録を重複生成しない。実使用の機体・バッテリー・時間の正本は [Flight](12e_operation-inspection-maintenance.md)、非飛行の充放電・保管等は本書 `BatteryUsage`。累計値の手動修正と同期優先順位は [Data Authority](../11_data-authority.md)。

## 8. 業務上の状態と物理保存構造の保留（PENDING-C1-SCHEMA）

1. **業務状態とenumの対応**:
   - 統合要件が求める保管・点検・劣化・紛失の管理と、本書の既存 `Battery.status` / 非飛行イベントの対応は未確定である。これらの業務状態を省略せず、ライフサイクル、使用中/放電等の運用状態、健全性を1つのenumに統合すべきか別軸にすべきかをC1 schema確定前に整理する。既存enumを完成済みと扱わず、推測で新しい保存値を追加しない。
2. **飛行外BATイベントの物理配置**:
   - 飛行実績（Flight）と飛行外イベント（BatteryUsage）の責務分離は確定とするが、飛行外イベントをスプレッドシートやIndexedDBのどの表/タブ/行へ物理配置するかは未固定とする（99.2 §4準拠）。
3. **取得前履歴属性の物理配置**:
   - 機体の取得前履歴およびバッテリーの取得時確認サイクル数の具体的フィールド定義は、C1 schema確定前に決定する。
