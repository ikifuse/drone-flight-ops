# 12e. 運航・飛行・点検・整備と帳票発行記録

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: 現場で発生する運航実績と点検・整備のEntity定義。FSMと帳票レイアウトを再定義しない。

## 1. Mission（現場運航セッション束）
- **ID**: `mission_id` (UUID v4)
- **分類**: **History (Session)**
- **役割**: 現場での一連の作業枠（準備開始〜完全撤収）。操縦者の片手操作フローを束ねる。
- **主な属性**:
  - `planned_flight_plan_id`: 紐付く計画ID（任意）
  - `planned_submission_id`: 今回適用したDIPS提出スナップショットID（任意）。計画なし運航も許容。
  - `initial_aircraft_id`: 運航開始時の機体。途中交代は `AircraftSwitch`、各飛行の実機体は `Flight.aircraft_id`。
  - `location_id`: 現場場所ID
  - `pilot_id`: 主操縦者ID
  - `assistant_id`: 補助者ID（任意）
  - `weather`: 天候、`wind_speed_ms`: 風速、`temperature_c`: 気温
  - `status`: セッションの粗粒度ライフサイクル（`preparing`, `in_progress`, `completed`, `aborted`）。点検・飛行・交換など詳細進行は [Operation FSM](../state-machines/13a_operation.md) を参照し、両者を同じenumとしない。
  - `started_at` / `ended_at`: 運航日時
  - `sync_status`: 台帳同期状態

## 2. Flight（個々の離陸〜着陸セッション）
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

## 3. AircraftSwitch（機体交代イベント記録）
- **ID**: `switch_id` (UUID v4)
- **分類**: **History (Event)**
- **主な属性**: `mission_id`, `from_aircraft_id`, `to_aircraft_id`, `switched_at`, `reason`。

## 4. PreflightInspection & PostflightInspection（日常点検記録）
- **ID**: `inspection_id` (UUID v4)
- **分類**: **History**
- **主な属性**: `inspection_type` (`preflight` / `postflight`), `aircraft_id`, `inspector_id` (`Personnel` 参照), `items` (点検項目配列), `is_all_normal`, `defect_description`, `remedy_action`。

## 5. MaintenanceRecord（点検整備台帳・国交省様式3）
- **ID**: `maintenance_id` (UUID v4)
- **分類**: **History**
- **役割**: 機体の生涯点検整備記録（定期点検20h/100h、修理、改造、部品交換、ファーム更新）。
- **主な属性**: `aircraft_id`, `maintenance_type`, `performed_at`, `cumulative_flight_minutes_at_maintenance`, `description`, `parts_replaced`, `technician_name`。

## 6. ReportSnapshot（帳票発行不変スナップショット）
- **ID**: `report_snapshot_id` (UUID v4)
- **分類**: **History (Snapshot)**
- **役割**: 統合運航帳票または国交省様式PDF/Excel出力時に生成される発行不変スナップショット。提出・監査用に「発行時点でどのような帳票が確定されたか」を恒久保管する。
- **主な属性**: `report_type` (`INTEGRATED_OPERATION_REPORT`, `FORM_1_FLIGHT_LOG`, `FORM_2_DAILY_INSPECTION`, `FORM_3_MAINTENANCE`), `mission_id`, `aircraft_id`, `location_id`, `generated_at`, `page_count`, `checksum_sha256`, `pdf_blob_key`。

## 7. 予定と実績の参照と帳票境界

予定の数値を実飛行時間として自動確定しない。Missionから計画・提出へ辿り、`Mission.planned_submission_id` から関連Mission全件を逆引きして計画日時・範囲・高度対実際の時刻・時間・点検結果の比較を可能にする。Sheets台帳の旧 `linked_mission_id` は代表表示に限り、全件関係を単一IDへ切り捨てない（[Ledger](../dips-submission/24a_submission-and-sheets-ledger.md)）。ReportSnapshotは発行実績を保持するEntityであり、帳票の組版・3領域・続紙・法令様式の正本は [18_reports](../18_reports.md)。

## 8. 実績と点検の未定義参照（PENDING-C1-SCHEMA）

各Flightの実際の操縦者は、計画の `pilot_ids` やMissionの主操縦者と区別して追跡し、[帳票](../18_reports.md)・[KMLの実績表示](../output/27a_kml-export.md) が正しい人員を参照できなければならない。現属性一覧にはFlight単位の実操縦者参照が未定義であり、Mission.pilot_idを全飛行の実操縦者と無条件に代用しない。単独/複数交代を含む具体的FK・保持形式はC1 schema確定前のPENDINGとする。

飛行前/飛行後点検は、その点検が属するMissionと実施日時を保持し、日常点検帳票や機体交代後の点検を実績へ結び付ける必要がある。現属性一覧に不足するMission参照・実施日時の具体的フィールド名と型・関連基数はC1 schema確定前に決定し、作成日時から実施日時を推測しない。
