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
          ├──────────────┐ 1
          │ 1            ▼
          │        ┌────────────────┐
          │        │DipsNotification│
          │        │ (DIPS通報状態) │
          │        └────────────────┘
          ▼
  ┌────────────────┐
  │   FlightArea   │
  │ (飛行範囲形状) │
  └────────────────┘

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
  - `mission_id`: 紐づくミッションID（任意、計画先行作成可）
  - `primary_aircraft_id`: 主使用機体ID
  - `aircraft_ids`: 対象機体ID配列（複数機体対応）
  - `pilot_id`: 操縦者ID
  - `flight_area_id`: 飛行範囲ID
  - `planned_start_time`: 開始予定日時 (ISO8601)
  - `planned_end_time`: 終了予定日時 (ISO8601)
  - `flight_purpose`: 飛行目的（空撮、点検、訓練等）
  - `flight_type`: 飛行形態（昼間/夜間、目視内/目視外、30m以内等）
  - `permission_id`: 適用する許可承認ID（任意）
- **複数機体対応方針**: 内部データモデルとしては `aircraft_ids[]` で複数機体を許容し、DIPS通報アダプタにおいてDIPS 2.0 APIの単機/複数機仕様に応じて適切にマッピングします。

### 2.5 DipsNotification（DIPS飛行計画通報ステータス）
- **ID**: `dips_notification_id` (UUID v4)
- **分類**: 独立エンティティ（FlightPlanと1:1）
- **主な属性**:
  - `flight_plan_id`: 対象飛行計画ID
  - `status`: 通報状態マシンステータス
    - `uncreated`: 未作成
    - `created`: 作成済み
    - `pending`: 送信待ち
    - `sending`: 送信中
    - `submission_uncertain`: 送信中切断・タイムアウト（成否不明・照合待ち）
    - `reconciliation_required`: 自動照合不能（パイロット手動確認待ち）
    - `success_confirmed`: 国交省DIPS通報成功確認済み（受付番号取得）
    - `failed`: 通報失敗（4xx恒久エラー）
    - `retry_wait`: 一時通信エラー再送待ち
  - `dips_plan_id`: DIPS側発行の計画番号（成功時）
  - `reconciliation_checked_at`: 照合実行日時
  - `submitted_at`: 通報日時
  - `confirmed_at`: 受理確認日時
  - `last_error_message`: エラー内容

### 2.6 Mission（一連の現場運航セッション）
- **ID**: `mission_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
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

### 2.7 Flight（個々の離陸〜着陸セッション）
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

### 2.8 AircraftSwitch（機体交代イベント記録）
- **ID**: `switch_id` (UUID v4)
- **分類**: 独立エンティティ
- **主な属性**:
  - `mission_id`: 対象ミッションID
  - `from_aircraft_id`: 交代前機体ID
  - `to_aircraft_id`: 交代後機体ID
  - `switched_at`: 交代日時 (ISO8601)
  - `reason`: 交代理由（定期機体ローテーション、不調、予備機投入等）

### 2.9 PreflightInspection & PostflightInspection（点検記録）
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

### 2.10 Pilot（操縦者情報台帳）
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

### 2.11 Assistant（立入管理措置補助者台帳）
- **ID**: `assistant_id` (UUID v4)
- **分類**: 独立エンティティ（またはMission付属Value Object）
- **主な属性**:
  - `name`: 補助者氏名
  - `role`: 担当役割（立入監視員、安全補助員等）
  - `contact_phone`: 連絡先電話番号

### 2.12 Permission（飛行許可・承認情報台帳）
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

### 2.13 MaintenanceRecord（点検整備台帳・国交省様式3）
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

### 2.14 AuditEvent（監査ログ・変更履歴）
- **ID**: `audit_id` (UUID v4)
- **分類**: 独立エンティティ（不変ログ）
- **主な属性**:
  - `timestamp`: 発生日時 (ISO8601)
  - `entity_type`: 対象種別（`mission`, `flight`, `aircraft`, `battery`）
  - `entity_id`: 対象ID
  - `action`: 操作種別（`create`, `update`, `delete`, `sync`, `conflict_resolved`）
  - `actor`: 操作主体（`pilot`, `system_sync`, `manual_repair`）
  - `diff_summary`: 変更差分サマリ

### 2.15 AppSetting（アプリ設定・警告閾値マスター）
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
