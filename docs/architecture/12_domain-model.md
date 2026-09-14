# 12. 概念データモデル・型定義・ID戦略（12_domain-model.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2 / B2.1（詳細アーキテクチャ・監査・実装前設計）

---

## 1. ドメインモデル全体関連図（ER概要）

```text
  ┌────────────────┐ *        * ┌────────────────┐
  │   Aircraft     ├────────────┤    Battery     │
  │   (機体台帳)   │            │   (バッテリー) │
  └───────┬────────┘            └───────┬────────┘
          │ 1                           │ 1
          │                             │
          │ 1                           │ *
  ┌───────┴────────┐ 1        * ┌───────┴────────┐
  │   Mission      ├────────────┤  BatteryUsage  │
  │ (一連の運航束) │            │ (バッテリー使用)│
  └───┬───┬───┬────┘            └────────────────┘
      │1  │1  │1
      │   │   │
      │   │   ├─────────────────────────┐
      │   │   │                         │ 1
      │   │ * │                 ┌───────┴──────────────┐
      │ ┌─┴───┼──────────┐      │ PreflightInspection  │
      │ │     Flight     │      │   (飛行前日常点検)   │
      │ │ (個々の離着陸) │      └──────────────────────┘
      │ └────────────────┘
      │1                        ┌──────────────────────┐
      ├─────────────────────────┤  PostflightInspection│
      │1                        │     (飛行後点検)     │
      │                         └──────────────────────┘
      │ *
    ┌─┴────────────────────────┐
    │     AircraftSwitch       │
    │      (機体交代記録)      │
    └──────────────────────────┘

  ┌────────────────┐ *        * ┌────────────────┐
  │   FlightPlan   ├────────────┤    Aircraft    │
  │ (内部飛行計画) │            │   (複数機紐付) │
  └───────┬────────┘            └────────────────┘
          │ 1
          │
          ├──────────────┐ 1        * ┌──────────────────────┐
          │ 1            ├────────────┤    DipsSubmission    │
          │              │            │(不変提出スナップショット)│
          │              ▼            └──────────┬───────────┘
          │        ┌────────────────┐            │ (台帳行同期)
          │        │DipsNotification│            ▼
          │        │ (通報状態管理) │  ┌──────────────────────┐
          │        └────────────────┘  │ Googleスプレッドシート │
          ▼                            │  「DIPS飛行計画台帳」  │
  ┌────────────────┐                   └──────────────────────┘
  │   FlightArea   │                              ▲
  │ (飛行範囲形状) │                              │
  └────────────────┘                              │
          ▲                                       │ 計画紐付け
          │ 計画参照                              │ (予定と実績の結合)
  ┌───────┴────────┐ 1                          * │
  │   Mission      ├──────────────────────────────┘
  │ (一連の運航束) │ (planned_submission_id / flight_plan_id)
  └───┬───┬───┬────┘

  【独立台帳・管理エンティティ】
  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐
  │     Pilot      │  │   Permission   │  │ MaintenanceRecord  │
  │  (操縦者情報)  │  │ (許可承認情報) │  │  (点検整備台帳)    │
  └────────────────┘  └────────────────┘  └────────────────────┘
  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐
  │   Assistant    │  │   SyncQueue    │  │     AuditEvent     │
  │ (補助者情報)   │  │ (外部同期制御) │  │  (監査変更履歴)    │
  └────────────────┘  └────────────────┘  └────────────────────┘
```

---

## 2. 主要エンティティ詳細仕様

### 2.1 Aircraft（機体台帳）
- **ID**: `aircraft_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
  - `nickname`: 表示名（例: "EVO Lite+"）
  - `manufacturer`: 製造者（例: "Autel Robotics"）
  - `model`: 型式（例: "EVO Lite Series"）
  - `registration_mark`: DIPS登録記号（例: "JU324XXXXXXX"）
  - `serial_number`: 機体製造番号
  - `weight_grams`: 機体重量（例: 835）
  - `cumulative_flight_minutes`: 累計飛行時間（分）
  - `cumulative_flight_count`: 累計飛行回数
  - `management_start_date`: 管理開始日
  - `status`: 状態（`active`, `maintenance`, `retired`）
  - **期限管理属性**:
    - `registration_expires_at`: 機体登録有効期限日時 (ISO8601)
    - `registration_warning_days`: 期限前警告日数（初期値: 30日）
    - `maintenance_due_date`: 次回点検予定日
    - `maintenance_due_flight_minutes`: 次回点検飛行時間閾値（例: 20時間/100時間）
- **リレーション**: Battery (N:M互換モデル), Mission (1:N), MaintenanceRecord (1:N), FlightPlan (N:M)
- **ライフサイクル**: マスターデータ。削除不可（論理削除 `retired` のみ）。

### 2.2 Battery（バッテリー個体台帳）
- **ID**: `battery_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
  - `slot_number`: 管理スロット番号（1〜7、将来任意拡張）
  - `display_name`: 表示名（例: "BAT-01"）
  - `compatible_aircraft_models`: 互換機種名配列（例: `["EVO Lite", "EVO Lite+"]`）
  - `default_aircraft_id`: 主使用機体ID（任意・優先表示用）
  - `serial_number`: 個体シリアル番号
  - `purchase_date`: 購入日
  - `condition_at_start`: 管理開始時状態（`new`, `used`）
  - `cumulative_cycle_count`: 累計充電サイクル数
  - `cumulative_flight_minutes`: 累計飛行時間（分）
  - `status`: 状態（`ready`, `in_use`, `discharged`, `error`, `retired`）
  - `last_health_note`: 直近の異常・所感
- **リレーション**: BatteryUsage (1:N)
- **多重度方針**: 同一シリーズ・互換機種間でバッテリーを共有利用できるよう、機体とは1:N固定とせず、互換モデル配列および実績側（BatteryUsage/Flight）の機体記録で紐づけます。

### 2.3 FlightArea（飛行範囲・空域定義）
- **ID**: `flight_area_id` (UUID v4)
- **分類**: エンティティ（またはFlightPlan付属Value Object）
- **主な属性**:
  - `shape_type`: 形状タイプ（`circle` または `polygon`）
  - `center_latitude`: 中心の緯度（10進表記）
  - `center_longitude`: 中心の経度（10進表記）
  - `radius_meters`: 半径（m、円形時）
  - `geojson_geometry`: 形状GeoJSON（多角形ポリゴン時）
  - `planned_altitude_agl_meters`: 計画対地高度（m、実運航値、例: 30m, 50m）
  - `max_altitude_agl_meters`: 運用上限対地高度（m、安全マージン込み）
  - `planned_altitude_msl_meters`: 計画海抜高度（m、任意）
  - `altitude_source`: 高度算出元（`manual_input`, `dem_elevation`, `dips_imported`）
  - `name`: 現場地点名・呼称
- **高度設計の原則**: 150m AGLは航空法上の許可承認要否を分ける空域規制境界であり、既定の飛行計画高度ではありません。実際の計画対地高度を保存し、150m以上であるか否かは空域規制評価エンジンで判定します。

### 2.4 FlightPlan（飛行計画）
- **ID**: `flight_plan_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
  - `revision`: 現在のリビジョン番号（整数、1から開始。変更確定時にインクリメント）
  - `mission_id`: 紐づくミッションID（任意、計画先行作成可、実運航開始時に紐付け）
  - `primary_aircraft_id`: 主使用機体ID
  - `aircraft_ids`: 対象機体ID配列（複数機体対応）
  - `pilot_id`: 操縦者ID
  - `flight_area_id`: 飛行範囲ID
  - `planned_start_time`: 開始予定日時 (ISO8601)
  - `planned_end_time`: 終了予定日時 (ISO8601)
  - `flight_purpose`: 飛行目的（空撮、点検、訓練等）
  - `flight_type`: 飛行形態（昼間/夜間、目視内/目視外、30m以内等）
  - `permission_id`: 適用する許可承認ID（任意）
  - `plan_status`: 計画ステータス（`draft`, `locked_for_submission`, `active`, `completed`, `cancelled`）
- **複数機体対応方針**: 内部データモデルとしては `aircraft_ids[]` で複数機体を許容し、DIPS通報アダプタにおいてDIPS 2.0 APIの単機/複数機仕様に応じて適切にマッピングします。
- **リビジョン管理**: 計画内容を変更した場合、過去の通報済みスナップショットを直接上書きせず、リビジョンを上げて新しい計画内容として保存します。

### 2.5 DipsSubmission（DIPS提出試行・不変スナップショット台帳エンティティ - SSoT）
- **ID**: `submission_id` (UUID v4)
- **分類**: 独立エンティティ（FlightPlan 1 : N DipsSubmission）。**各提出試行における唯一の正本（Single Source of Truth）**。
- **役割**: DIPSへの通報直前または手動入力画面確定時点で生成される通報試行レコードであり、Googleスプレッドシート「DIPS飛行計画台帳」の1行と1対1に対応します。
- **不変境界の定義**:
  - **不変部（Immutable Snapshot）**: `payload_snapshot` は一度生成されたら絶対に改変されません。計画変更時は新しい `DipsSubmission` を新リビジョンとして起票します。
  - **可変部（Mutable Lifecycle Metadata）**: ステータスや確認情報等の進行状態は更新可能です。更新履歴は `AuditEvent` に記録されます。
- **主な属性**:
  - `flight_plan_id`: 対象飛行計画ID
  - `revision`: 提出時の計画リビジョン番号
  - `submission_method`: 通報方式（`'manual'` / `'api'` / `'mock'`）
  - `status`: DIPS提出ステータス
    - `snapshot_saved`: 提出スナップショット保存済・通報準備完了
    - `manual_submit_wait`: 手動通報待ち（手動支援画面表示中）
    - `manual_submitted`: 操縦者が手動通報実施を記録（※DIPS受理確認ではない）
    - `dips_confirmed`: 操縦者がDIPS画面での計画登録を確認済み（一覧目視照合または受付番号入力）
    - `sending`: API送信中
    - `api_confirmed`: APIによるDIPS受理確認済み（計画ID自動受領）
    - `submission_uncertain`: API送信中切断・タイムアウト（成否不明・照合待ち）
    - `reconciliation_required`: 自動照合不能（パイロット手動確認待ち）
    - `failed`: 通報失敗（エラー）
    - `retry_wait`: 一時通信エラー再送待ち
    - `superseded`: 新リビジョンにより更新・差し替え
    - `cancelled`: 計画取消
  - `sync_status`: 外部台帳同期ステータス（DIPS通報状態とは直交する別軸として管理）
    - `local_saved`: 端末ローカルDBにのみ保存（台帳未同期）
    - `sync_pending`: スプレッドシート同期キュー投入中（送信待ち）
    - `syncing`: スプレッドシート送信中
    - `synced`: Googleスプレッドシート「DIPS飛行計画台帳」へ反映完了
    - `sync_failed`: 同期失敗（オフラインまたはSheets APIエラー）
  - `payload_snapshot`: **不変JSON**（その時点でDIPSへ渡す予定の全データ: 飛行日時、場所名称、緯度経度、高度、円/ポリゴンGeoJSON、機体登録記号、操縦者氏名/証明書番号、飛行目的、飛行形態、許可承認番号等）
  - `confirmation_method`: 確認方法（`'flight_plan_list_match'` / `'displayed_id'` / `'api_response'` / `null`）
  - `dips_plan_id`: DIPS側発行の計画番号/受付番号（**手動一覧照合時は省略可・nullable**。番号が確認できた場合またはAPIレスポンス時のみ保存）
  - `submitted_at`: 通報日時（手動記録日時またはAPI送信日時、ISO8601）
  - `confirmed_at`: DIPS登録確認日時（手動確認日時またはAPIレスポンス日時、ISO8601）
  - `spreadsheet_row_id`: スプレッドシート側の行番号（同期完了時にバインド）
  - `supersedes_submission_id`: 訂正前の過去提出ID（任意）
  - `superseded_by_submission_id`: 本提出を上書きした新提出ID（任意）
  - `cancelled_at`: 取消日時（任意）
  - `cancellation_reason`: 取消理由（任意）
  - `notes`: 備考・エラー所感・パイロット手記

### 2.6 DipsNotification（FlightPlanに対する通報状態集約・Projection）
- **ID**: `flight_plan_id` と1:1
- **分類**: **集約ビュー / 参照プロジェクション（Projection）**
- **二重正本の排除**: `DipsNotification` は独立して状態を更新・保持する正本ではありません。`FlightPlan` に紐づく最新の `DipsSubmission`（`current_submission_id`）への参照を持ち、画面表示用に最新状態を射影（Projection）する読み取り集約モデルです。
- **主なプロパティ（すべて最新の `DipsSubmission` からの参照・導出）**:
  - `flight_plan_id`: 対象飛行計画ID
  - `current_submission_id`: 最新の提出スナップショットID（`DipsSubmission` へのポインタ）
  - `readonly current_status`: 最新提出の `status`
  - `readonly current_sync_status`: 最新提出の `sync_status`
  - `readonly dips_plan_id`: 最新提出の `dips_plan_id` (nullable)
  - `readonly confirmation_method`: 最新提出の `confirmation_method` (nullable)
  - `readonly last_submitted_at`: 最新提出の `submitted_at`
  - `readonly last_confirmed_at`: 最新提出の `confirmed_at`
  - `readonly last_error_message`: エラー内容（存在する場合）

### 2.7 Mission（一連の現場運航セッション）
- **ID**: `mission_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
  - `planned_flight_plan_id`: 関連する飛行計画ID（任意・現場で紐付け可能）
  - `planned_submission_id`: 適用したDIPS提出スナップショットID（任意・予定と実績の結合）
  - `initial_aircraft_id`: 運航開始時の初期機体ID（主機体）
  - `pilot_id`: 操縦者ID
  - `pilot_name`: 操縦者名（表示用キャッシュ）
  - `assistant_id`: 補助者ID（任意）
  - `location_name`: 飛行場所名称
  - `weather`: 天候（晴、曇、雨等）
  - `wind_speed_ms`: 風速（m/s）
  - `temperature_c`: 気温（℃）
  - `status`: 運航状態（`preparing`, `in_progress`, `completed`, `aborted`）
  - `started_at`: 運航開始日時
  - `ended_at`: 運航終了日時
  - `sync_status`: 外部同期状態（`draft`, `recorded`, `sync_pending`, `synced`, `sync_failed`）
  - `spreadsheet_row_id`: 反映されたスプレッドシート行番号

### 2.8 Flight（個々の離陸〜着陸セッション）
- **ID**: `flight_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
  - `mission_id`: 属するミッションID
  - `flight_sequence`: 第何飛行か（1, 2, 3... 8回以上無制限）
  - `aircraft_id`: 実際に飛行した機体ID（途中交代対応）
  - `battery_id`: 使用したバッテリーID
  - `takeoff_time`: 離陸打刻日時 (ISO8601、秒/ミリ秒精度)
  - `landing_time`: 着陸打刻日時 (ISO8601、秒/ミリ秒精度)
  - `duration_seconds`: 飛行秒数
  - `start_battery_pct`: 離陸時残量（%）
  - `end_battery_pct`: 着陸時残量（%）
  - `flight_nature`: 業務・訓練の別

### 2.9 AircraftSwitch（機体交代イベント記録）
- **ID**: `switch_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
  - `mission_id`: 対象ミッションID
  - `from_aircraft_id`: 交代前機体ID
  - `to_aircraft_id`: 交代後機体ID
  - `switched_at`: 交代日時 (ISO8601)
  - `reason`: 交代理由（定期機体ローテーション、不調、予備機投入等）

### 2.10 PreflightInspection & PostflightInspection（点検記録）
- **ID**: `inspection_id` (UUID v4)
- **分類**: 独立エンティティ（Missionと1:1または機体交代時1:N）
- **主な属性**:
  - `inspection_type`: `preflight`（飛行前日常点検）または `postflight`（飛行後日常点検）
  - `aircraft_id`: 点検対象機体ID
  - `inspector_id`: 点検実施者ID
  - `items`: 点検項目チェック結果配列（正常 / 異常 / 該当なし）
  - `is_all_normal`: 全項目正常フラグ（1タップ充足用）
  - `defect_description`: 異常内容・特記事項（異常時のみ展開）
  - `remedy_action`: 処置内容（異常時のみ）

### 2.11 Pilot（操縦者情報台帳）
- **ID**: `pilot_id` (UUID v4)
- **分類**: 独立エンティティ（複数ミッション・計画から参照されるマスター）
- **主な属性**:
  - `name`: 氏名（漢字）
  - `license_number`: 技能証明書番号 / 技能認証番号
  - `certificate_type`: 技能証明区分（一等、二等、民間講習修了等）
  - `certificate_expires_at`: 技能証明有効期限 (ISO8601)
  - `warning_days`: 期限前警告日数（初期値: 30日）
  - `contact_phone`: 緊急連絡先電話番号
  - `is_default`: 既定の主操縦者フラグ

### 2.12 Assistant（立入管理措置補助者台帳）
- **ID**: `assistant_id` (UUID v4)
- **分類**: 独立エンティティ（またはMission付属Value Object）
- **主な属性**:
  - `name`: 補助者氏名
  - `role`: 担当役割（立入監視員、安全補助員等）
  - `contact_phone`: 連絡先電話番号

### 2.13 Permission（飛行許可・承認情報台帳）
- **ID**: `permission_id` (UUID v4)
- **分類**: 独立エンティティ（1年間の包括許可等を複数計画・ミッションで共有）
- **主な属性**:
  - `permit_number`: 許可承認番号（例: "国空航第XXXXX号"）
  - `permit_type`: 許可区分（DID、夜間、目視外、30m以内等）
  - `valid_from`: 有効開始日 (ISO8601)
  - `valid_to`: 有効終了日 (ISO8601)
  - `warning_days`: 期限前警告日数（初期値: 30日）
  - `issuing_authority`: 発行機関（航空局、空港事務所等）
  - `conditions`: 付加条件メモ / 別添マニュアル参照番号

### 2.14 MaintenanceRecord（点検整備台帳・国交省様式3）
- **ID**: `maintenance_id` (UUID v4)
- **分類**: 独立エンティティ（航空法上の機体生涯台帳）
- **主な属性**:
  - `aircraft_id`: 対象機体ID
  - `maintenance_type`: 区分（定期点検20h/100h、部品交換、不具合修理、ファーム更新）
  - `performed_at`: 実施日時 (ISO8601)
  - `cumulative_flight_minutes_at_maintenance`: 実施時点の機体累計飛行時間
  - `description`: 実施内容詳細
  - `parts_replaced`: 交換部品名・型番
  - `technician_name`: 点検整備実施者氏名
  - `next_inspection_due_minutes`: 次回点検目安累計時間

### 2.15 AuditEvent（監査ログ・変更履歴）
- **ID**: `audit_id` (UUID v4)
- **分類**: 独立エンティティ（不変ログ）
- **主な属性**:
  - `timestamp`: 発生日時 (ISO8601)
  - `entity_type`: 対象種別（`mission`, `flight`, `aircraft`, `battery`, `flight_plan`, `dips_submission`）
  - `entity_id`: 対象ID
  - `action`: 操作種別（`create`, `update`, `delete`, `sync`, `conflict_resolved`）
  - `actor`: 操作主体（`pilot`, `system_sync`, `manual_repair`）
  - `diff_summary`: 変更差分サマリ

### 2.16 AppSetting（アプリ設定・警告閾値マスター）
- **ID**: `setting_key` (string)
- **分類**: 独立エンティティ / Key-Value
- **主な属性**:
  - `value`: 設定値（JSON形式）
  - `updated_at`: 更新日時
  - **保持設定例**:
    - 各種期限警告閾値（機体登録、許可承認、技能証明）
    - 既定の主操縦者・主機体ID
    - 地図タイルキャッシュ上限容量
    - Googleスプレッドシート連携先ID

### 2.17 DipsFlightPlanLedger（Googleスプレッドシート「DIPS飛行計画台帳」論理スキーマ - B2.2追加）
Googleスプレッドシート上に保持される「DIPS飛行計画台帳」シートの列定義です。1行が1つの `DipsSubmission` に対応し、過去の提出履歴・改訂履歴を完全に可視化・監査可能とします。

| 列番号 | 列物理名 | 列論理名 | 型・形式 | 説明・必須区分 |
|:---:|---|---|---|---|
| A | `submission_id` | 提出ID | UUID v4 | 1つの通報試行・スナップショットの一意識別子（主キー） |
| B | `flight_plan_id` | 飛行計画ID | UUID v4 | 内部飛行計画の一意識別子 |
| C | `revision` | 計画リビジョン | 整数 (1, 2, ...) | 計画変更ごとにインクリメントされる版数 |
| D | `created_at` | 計画作成日時 | ISO8601 | 計画が最初に起票された日時 |
| E | `snapshot_created_at` | 提出確定日時 | ISO8601 | 提出スナップショットが確定された日時 |
| F | `planned_start_time` | 飛行予定開始日時 | ISO8601 | 飛行予定開始時刻 |
| G | `planned_end_time` | 飛行予定終了日時 | ISO8601 | 飛行予定終了時刻 |
| H | `location_name` | 飛行場所名称 | 文字列 | 現場地点名 |
| I | `shape_type` | 飛行範囲形状 | `circle` / `polygon` | 円またはポリゴン |
| J | `center_coordinates` | 計画中心座標 | 緯度,経度 | 例: `33.456789, 129.876543` |
| K | `radius_meters` | 半径(m) | 数値 | 円形時の半径 |
| L | `geojson_geometry` | GeoJSON形状 | 文字列(JSON) | 範囲ポリゴンジオメトリ |
| M | `planned_altitude_agl` | 計画高度(AGL m) | 数値 | 計画対地高度（例: 30, 50） |
| N | `aircraft_model` | 使用機体型式 | 文字列 | 例: "EVO Lite Series" |
| O | `registration_mark` | 機体登録記号 | 文字列 | 例: "JU324XXXXXXX" |
| P | `pilot_name` | 操縦者氏名 | 文字列 | 操縦者名 |
| Q | `pilot_license_number`| 技能証明番号 | 文字列 | 技能証明等番号 |
| R | `flight_purpose` | 飛行目的 | 文字列 | 空撮、点検、測量等 |
| S | `flight_type` | 飛行形態 | 文字列 | 目視内/目視外、30m等 |
| T | `permission_number` | 許可承認番号 | 文字列 | 包括許可等の番号 |
| U | `submission_method` | 通報方式 | `manual` / `api` / `mock` | 手動通報かAPI通報かモックか |
| V | `submission_status` | 通報状態 | 文字列 | `snapshot_saved`, `manual_submitted`, `dips_confirmed`, `api_confirmed`, `superseded`, `cancelled` 等 |
| W | `confirmation_method` | 確認方法 | 文字列 | `flight_plan_list_match` / `displayed_id` / `api_response` |
| X | `dips_plan_id` | DIPS計画番号/受付番号 | 文字列(任意) | 番号確認時またはAPI受領時の番号（手動一覧照合時は空欄可） |
| Y | `submitted_at` | 通報実施日時 | ISO8601 | 手動記録またはAPI送信打刻 |
| Z | `confirmed_at` | 受理確認日時 | ISO8601 | 確認・追記打刻日時 |
| AA| `supersedes_id` | 訂正前提出ID | UUID v4 | 本版が差し替えた旧提出ID（訂正履歴） |
| AB| `superseded_by_id` | 訂正後提出ID | UUID v4 | 本版を差し替えた新提出ID |
| AC| `cancellation_info` | 取消情報 | 文字列 | 取消日時および理由（取消時） |
| AD| `linked_mission_id` | 紐付運航実績ID | UUID v4 | 実際に実施されたMission ID（予定と実績の結合） |
| AE| `notes` | 備考・エラーログ | 文字列 | 通報時メモ、エラー所感、手動追記事項 |

---

## 3. ID戦略と冪等性（Idempotency）設計

現場での通信切断、アプリの不意の強制終了、再送操作に対しても、二重記録や二重通報を防止する冪等性アーキテクチャを確立します。

### 3.1 クライアント主導のUUID v4生成
すべてのエンティティID（`mission_id`, `flight_id`, `job_id`, `switch_id` 等）は、サーバーの発行を待たず、**クライアント側で生成するUUID v4**を使用します。これにより、電波圏外の現場でも重複のない一意識別子を即座に発行できます。

### 3.2 冪等キー（Idempotency Key）の設計原則

再送や同期時に使用する冪等キーは、**「更新日時（updated_at）のみに依存させない」**設計とします。ローカルでの編集や再送トリガーのたびにキーが変動して重複防止が破綻することを防ぎます。

1. **不変操作（Immutable Event: Flight打刻、点検記録等）**:
   - `operation_id`: 操作発生時に発行される不変のUUID v4。
   - 同一ジョブの再送では常に同一の `operation_id` を送信。
2. **状態変更エンティティ（Stateful Entity: Mission更新、機体設定等）**:
   - `idempotency_key = SHA256(entity_type + ":" + entity_id + ":" + sync_revision)`
   - `sync_revision`: エンティティの内容が実質的に更新された場合のみインクリメントされるリビジョン番号。単なる送信リトライでは変動しない。

### 3.3 送信先別の重複防止戦略
- **Googleスプレッドシート**: 列定義に `operation_id` または `record_id` + `sync_revision` を保持し、GAS側でUPSERT（存在すれば更新、なければ追加）を行う。
- **国交省DIPS 2.0**: DIPS FPR APIはカスタムIdempotency-Keyヘッダを解釈しないため、結果不明時は自動再POSTを行わず、DIPS計画検索による照合（Reconciliation）によって二重登録を防止する。
