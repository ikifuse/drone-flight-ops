# 12. 概念データモデル・型定義・ID戦略（12_domain-model.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計）

---

## 1. ドメインモデル全体関連図（ER概要）

```text
  ┌────────────────┐ 1        * ┌────────────────┐
  │   Aircraft     ├────────────┤    Battery     │
  │   (機体台帳)   │            │   (バッテリー) │
  └───────┬────────┘            └───────┬────────┘
          │ 1                           │ 1
          │                             │
          │ *                           │ *
  ┌───────┴────────┐ 1        * ┌───────┴────────┐
  │   Mission      ├────────────┤  BatteryUsage  │
  │ (一連の運航束) │            │ (バッテリー使用)│
  └───┬───┬───┬────┘            └────────────────┘
      │1  │1  │1
      │   │   │
      │   │   └─────────────────────────┐
      │   │ *                           │ 1
      │ ┌─┴──────────────┐      ┌───────┴──────────────┐
      │ │     Flight     │      │ PreflightInspection  │
      │ │ (個々の離着陸) │      │   (飛行前日常点検)   │
      │ └────────────────┘      └──────────────────────┘
      │1
    ┌─┴────────────────────────┐
    │  PostflightInspection    │
    │     (飛行後点検)         │
    └──────────────────────────┘

  ┌────────────────┐ 1        1 ┌────────────────┐
  │   FlightPlan   ├────────────┤DipsNotification│
  │ (内部飛行計画) │            │ (DIPS通報状態) │
  └───────┬────────┘            └────────────────┘
          │ 1
          │
          │ 1
  ┌───────┴────────┐
  │   FlightArea   │
  │ (飛行範囲形状) │
  └────────────────┘
```

---

## 2. 主要エンティティ詳細仕様

### 2.1 Aircraft（機体台帳）
- **ID**: `aircraft_id` (UUID v4)
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
- **リレーション**: Battery (1:N), Mission (1:N), MaintenanceRecord (1:N)
- **ライフサイクル**: マスターデータ。削除不可（論理削除 `retired` のみ）。

### 2.2 Battery（バッテリー個体台帳）
- **ID**: `battery_id` (UUID v4)
- **主な属性**:
  - `slot_number`: 管理番号（1〜7、将来任意拡張）
  - `display_name`: 表示名（例: "BAT-01"）
  - `aircraft_id`: 主対応機体ID
  - `serial_number`: 個体シリアル
  - `purchase_date`: 購入日
  - `condition_at_start`: 管理開始時状態（`new`, `used`）
  - `cumulative_cycle_count`: 累計充電サイクル数
  - `cumulative_flight_minutes`: 累計飛行時間（分）
  - `status`: 状態（`ready`, `in_use`, `discharged`, `error`, `retired`）
  - `last_health_note`: 直近の異常・所感
- **リレーション**: BatteryUsage (1:N)
- **現場最適化**: 画面タップ1回で使用対象を切り替え可能。

### 2.3 FlightArea（飛行範囲・空域定義）
- **ID**: `flight_area_id` (UUID v4)
- **主な属性**:
  - `shape_type`: 形状タイプ（`circle` または `polygon`）
  - `center_latitude`: 中心の緯度（10進表記）
  - `center_longitude`: 中心の経度（10進表記）
  - `radius_meters`: 半径（m、円形時）
  - `geojson_geometry`: 形状GeoJSON（多角形ポリゴン時）
  - `max_altitude_agl`: 対地高度（m、上限150m標準）
  - `name`: 現場地点名・呼称
- **DIPS Adapter連携**: DIPS 2.0の通報形式（緯度経度列または中心点・半径形式）へ相互変換可能。

### 2.4 FlightPlan（飛行計画）
- **ID**: `flight_plan_id` (UUID v4)
- **主な属性**:
  - `mission_id`: 紐づくミッションID（任意、計画先行作成可）
  - `aircraft_id`: 使用予定機体ID
  - `pilot_id`: 操縦者ID
  - `flight_area_id`: 飛行範囲ID
  - `planned_start_time`: 開始予定日時 (ISO8601)
  - `planned_end_time`: 終了予定日時 (ISO8601)
  - `flight_purpose`: 飛行目的（空撮、点検、訓練等）
  - `flight_type`: 飛行形態（昼間/夜間、目視内/目視外、30m以内等）
  - `permission_number`: 国交省包括許可・承認番号（該当時）

### 2.5 DipsNotification（DIPS飛行計画通報ステータス）
- **ID**: `dips_notification_id` (UUID v4)
- **主な属性**:
  - `flight_plan_id`: 対象飛行計画ID (1:1)
  - `status`: 通報状態マシンステータス
    - `uncreated`（未作成）
    - `created`（作成済み）
    - `pending`（送信待ち）
    - `sending`（送信中）
    - `success_confirmed`（国交省DIPS通報成功確認済み）
    - `failed`（通報失敗）
    - `retry_wait`（再送待ち）
  - `dips_plan_id`: DIPS側発行の計画番号（成功時）
  - `submitted_at`: 通報日時
  - `confirmed_at`: 受理確認日時
  - `last_error_message`: エラー時の内容
- **重要設計**: 本ステータスが `success_confirmed` であっても、総合的な飛行可能とはみなさず、通報要件の充足のみを表す。

### 2.6 Mission（一連の現場運航セッション）
- **ID**: `mission_id` (UUID v4)
- **主な属性**:
  - `aircraft_id`: 主機体ID
  - `pilot_name`: 操縦者名
  - `assistant_name`: 立入管理措置補助者名（任意）
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
- **主な属性**:
  - `mission_id`: 属するミッションID
  - `flight_sequence`: 第何飛行か（1, 2, 3... 8回以上無制限）
  - `takeoff_time`: 離陸打刻日時 (ミリ秒精度)
  - `landing_time`: 着陸打刻日時 (ミリ秒精度)
  - `duration_seconds`: 飛行秒数
  - `battery_id`: 使用したバッテリーID
  - `aircraft_id`: 飛行した機体ID（途中交代対応）
  - `start_battery_pct`: 離陸時残量（%）
  - `end_battery_pct`: 着陸時残量（%）
  - `flight_nature`: 業務・訓練の別

### 2.8 PreflightInspection & PostflightInspection（点検記録）
- **ID**: `inspection_id` (UUID v4)
- **主な属性**:
  - プロペラ、モーター、アーム、バッテリー取付、コンパス、GPS捕捉数、通信リンク等の合否配列
  - 異常有無フラグ
  - 特記事項・処置内容
  - 法令8区分に基づき、正常時は一括確認、異常時のみ詳細記録。

### 2.9 SyncQueue（同期ジョブキュー）
- **ID**: `job_id` (UUID v4)
- **主な属性**:
  - `target`: 同期先（`spreadsheet`, `dips_fpr`, `backup_drive`）
  - `entity_type`: 送信対象エンティティ名
  - `entity_id`: 送信対象ID
  - `idempotency_key`: 冪等キー（重複送信防止ハッシュ）
  - `status`: `pending`, `running`, `retry_wait`, `succeeded`, `failed_manual_action`
  - `retry_count`: 再試行回数
  - `next_retry_at`: 次回リトライ予定時刻
  - `last_error`: 直近のエラーログ

---

## 3. ID戦略と冪等性（Idempotency）設計

現場での通信切断、アプリの不意の強制終了、再送操作に対しても、**二重記録・二重課金・二重通報を絶対に発生させない冪等性アーキテクチャ**を確立します。

### 3.1 クライアント主導のUUID v4生成
すべてのエンティティID（`mission_id`, `flight_id`, `job_id`）は、サーバーの発行を待たず、**クライアント生成のUUID v4**を使用します。これにより、完全圏外の山間部でも重複のない一意識別子を即座に発行できます。

### 3.2 冪等キー（Idempotency Key）による二重保存防止
スプレッドシートやDIPSサーバーへ送信する際、ヘッダーまたはリクエストボディに以下の合成冪等キーを付与します。

```text
IdempotencyKey = SHA256(entity_type + ":" + entity_id + ":" + updated_at)
```

- **スプレッドシート同期**: 同期スクリプト側で `mission_id` 列をインデックス検索し、すでに同一 `mission_id` が存在する場合は「新規行追加（Append）」ではなく「該当行更新（Update）」または「スキップ」として処理する。
- **DIPS通報**: 同一計画に対する通報リクエストが再送された場合、直前の通報処理結果（受付番号）を返し、重複した二重計画登録を防止する。
