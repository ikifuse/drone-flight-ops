# 12c. 場所・範囲・入力プリセットと運航テンプレート

最終更新: 2026-09-15\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: 再利用する現場条件と、新規計画へ値を複製する規則。Geometryの形状定義は17番が正本。

## 1. Location（場所マスター）
- **ID**: `location_id` (UUID v4)
- **分類**: **Master**
- **役割**: 登録済みの飛行現場。頻繁に飛行する現場の基本情報・注意事項を再利用。
- **主な属性**:
  - `name`: 現場地点名・施設名（例: "架空公園A", "〇〇浄水場"）
  - `address`: 住所・地番
  - `latitude` / `longitude`: 現場代表基準座標（10進表記）
  - `site_contact`: 現地管理者・連絡先
  - `land_manager_notes`: 土地管理者との調整事項・許可条件メモ
  - `parking_entry_notes`: 駐車場・搬入・立入注意事項
  - `is_favorite`: お気に入りフラグ
  - `status`: 状態（`ACTIVE`, `INACTIVE`, `ARCHIVED`）

## 2. FlightAreaPreset（飛行範囲プリセット）
- **ID**: `flight_area_preset_id` (UUID v4)
- **分類**: **Preset**
- **役割**: `Location 1:N FlightAreaPreset`。同一現場内の具体的な飛行範囲形状・高度。
- **主な属性**:
  - `location_id`: 属する場所マスターID
  - `name`: エリア呼称（例: "野球場外野エリア", "南側練習範囲", "30m円形基本枠"）
  - `geometry`: [FlightAreaGeometry](../17_map-and-airspace.md)（`POLYGON` / `CIRCLE` / `BUFFERED_LINE`）を値として保持。形状判別子・中心・半径・頂点・線形バッファの全定義は17番を参照。
  - 旧 `shape_type` / `radius_meters` / `geojson_geometry` の用途は中立Geometryの形状・半径・頂点へ対応する。GeoJSONは描画/外部変換表現でありPresetの別正本にしない。
  - `default_altitude_agl_meters`: 既定計画対地高度（m、例: 30m）
  - `max_altitude_agl_meters`: 運用上限高度（m）

## 3. 入力プリセット群（FlightPurposePreset / SafetyMeasurePreset）
- **分類**: **Preset**
- **`FlightPurposePreset`**: 飛行目的マスター（"練習", "空撮", "点検", "測量", "農薬散布" 等）。
- **`SafetyMeasurePreset`**: 安全措置プリセット（"補助者1名配置", "カラーコーン区画設定", "監視員配置", "第三者立入禁止周知" 等）。
- 現場での定型入力をドロップダウンおよびチェックボックスで1タップ選択可能とする。

## 4. OperationTemplate（運航テンプレート - Copy Source原則）
- **ID**: `template_id` (UUID v4)
- **分類**: **Preset**
- **役割**: 頻繁に行う運航条件の組み合わせセット。
- **主な属性**:
  - `template_name`: テンプレート名（例: "架空公園A 定例練習", "〇〇現場 進捗空撮"）
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

## 5. 計画ごとの形状複製

Presetから新規FlightPlanへ形状をディープコピーし、今回の範囲に頂点・半径を調整できる。調整するのは計画Draftであり、確定済み `DipsSubmission.submission_snapshot` ではない。実際の経路に即した範囲設定とコピー時のGeometry規則は [17](../17_map-and-airspace.md)、提出可否は [Requirement Validation](../dips-flight-plan/25d_requirement-validation.md) を参照。
