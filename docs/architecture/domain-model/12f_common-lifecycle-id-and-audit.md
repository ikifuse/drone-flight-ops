# 12f. 共通ライフサイクル・ID・監査と一括登録準備

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: Entity共通分類・更新規則・ID・監査メタデータ。Sheets台帳一覧は24a、SyncQueueは14を参照。

## 1. AuditEvent（全般監査ログ・変更履歴）
- **ID**: `audit_id` (UUID v4)
- **分類**: **History**
- **役割**: DIPS提出だけでなく、機体・バッテリー・人員・許可・運航記録の作成・更新・同期・論理削除を記録。
- **属性**: `timestamp`, `entity_type`, `entity_id`, `action` (`CREATE`, `UPDATE`, `LIFECYCLE_CHANGE`, `SYNC`), `actor_personnel_id`, `diff_summary`, `reason`。

## 2. AppSetting（アプリ設定・警告閾値マスター）
- **ID**: `setting_key` (string)
- **分類**: Key-Value Master
- 各種期限警告閾値（機体登録、技能証明、許可承認）、地図キャッシュ設定、連携スプレッドシートID等を保持。

## 3. Master / Preset / History / Projection の4大分類と共通設計規約

| 分類 | 定義と性質 | 該当エンティティ | ライフサイクル・更新規則 |
|---|---|---|---|
| **Master** | 実在する管理対象・運用資産。他エンティティから参照される親データ。 | `Organization`, `Client`, `Project`, `AircraftModel`, `Aircraft`, `BatteryModel`, `BatteryCompatibility`, `Battery`, `Personnel`, `Location`, `Permission`, `InsurancePolicy`, `AppSetting` | **物理削除禁止**。`ACTIVE`, `INACTIVE`, `RETIRED`, `DISPOSED`, `EXPIRED` 等の論理状態で管理。過去履歴の参照を保護。 |
| **Preset** | 現場入力の手間を省くための再利用可能な条件セット。 | `FlightAreaPreset`, `FlightPurposePreset`, `SafetyMeasurePreset`, `OperationTemplate` | **コピーソース原則**。新規計画へ値をコピー実体化。後日のプリセット変更は過去データへ影響しない。 |
| **History** | 現場で実際に発生・確定した不可逆の運航・点検・通報・監査実績。 | `FlightPlan`, `DipsSubmission`, `Mission`, `Flight`, `AircraftSwitch`, `PreflightInspection`, `PostflightInspection`, `MaintenanceRecord`, `BatteryUsage`, `ReportSnapshot`, `AuditEvent` | **確定時点を区別**。FlightPlan Draftは編集可能、計画変更はRevision管理。確定提出・帳票Snapshot本文は不変。実績訂正は監査履歴を保持してData Authorityの手修正規則に従い、ライフサイクルメタデータ更新も `AuditEvent` で追跡する。 |
| **Projection** | 複数のエンティティから画面表示、帳票レンダリング、地図エクスポートのために導出される参照ビュー。 | `DipsNotification`, `ReportUnit` / `FlightLogReportViewModel`, `KmlExportModel` | **一時的・導出モデル**。正本を持たず、元データから動的に計算・構築（KMLやPDF用に専用入力画面を作らず、Domain単一入力から生成）。 |

人員の離任はPersonnel全体のRETIREDではなく、[31d](../identity-and-access/31d_membership-lifecycle.md)の環境への所属終了として読む。共通の物理削除禁止・過去履歴保護は維持する。人物・アカウント・Membership・QualificationsのID対応とschemaの未確定は[31a](../identity-and-access/31a_person-account-and-environment.md)へ接続し、本書のUUID方針だけで新しい列・関連を確定しない。

### 3.1. 共通監査メタデータ方針
すべてのMasterおよびHistoryエンティティは、以下の標準メタデータ属性を保持可能な構造とします：
- `created_at`: 作成日時 (ISO8601)
- `created_by`: 作成者Personnel ID（任意）
- `updated_at`: 更新日時 (ISO8601)
- `updated_by`: 更新者Personnel ID（任意）
- `version`: 楽観的ロック・競合検出用リビジョン番号（整数、1から開始）

### 3.2. 一括登録（Bulk Import/Export）対応準備
会社利用における大量機材（機体20機、バッテリー50本、人員30人等）の登録に対応するため、以下の原則を適用します：
- Masterは原則として安定したUUID v4を主キーとしつつ、`external_code`（社内管理番号等）による重複判定・UPSERTを許容。既存の例外として `AppSetting.setting_key` は安定した文字列キー、`BatteryCompatibility` はUUID v4または型式IDの複合キーを許容する（後者の採用方式はC1 schema確定時に決定）。
- 将来の大量Master登録に備え、各フィールドの必須・任意制約およびバリデーションをドメイン層で明確化。CSV等の業務データ取込とローカルDB全量復旧は別責務であり、ユーザー向けJSON import/exportはC1で実装しない。DB全量バックアップ/restoreのユーザー形式は **PENDING**（[ADR-0008](../../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md)）。

## 4. ID戦略と冪等性（Idempotency）設計

### 4.1. クライアント主導のUUID v4生成
運航・提出・資産等のエンティティID（`mission_id`, `flight_id`, `personnel_id`, `aircraft_id`, `battery_id`, `submission_id` 等）は、オフライン現場での即時発行を保証するため、原則として**クライアント側で生成するUUID v4**を採用します。`AppSetting.setting_key` の文字列キー、および `BatteryCompatibility` のUUID/複合キーという個別定義の例外は保持し、既存キーを機械的にUUIDへ置き換えません。

### 4.2. 冪等キー（Idempotency Key）の設計原則
- **不変操作（Flight打刻、点検記録、提出スナップショット等）**: 操作発生時に発行された不変の `operation_id`（UUID v4）を用いて再送時の重複登録を防止。
- **状態更新エンティティ（Mission、機体設定等）**: `idempotency_key = SHA256(entity_type + ":" + entity_id + ":" + sync_revision)` により、実質的な更新のみを安全に反映。
- **外部同期**: Googleスプレッドシート側で `operation_id` または `record_id` + `sync_revision` によるUPSERTを実施し、多重送信による二重書き込みを完全に防止。

## 5. 共通監査と専門評価の関係

`AuditEvent.action` はCRUD等の共通分類。離陸時等の具体的な監査イベントを識別する `event_type` と必要な理由・メモは [13c](../state-machines/13c_takeoff-readiness.md) が定義する。操作アカウントと記録対象人物を同一視せず、[31c](../identity-and-access/31c_operational-actors.md)の役割分離を維持する。

冪等キーは自前Sheets台帳への書込に用いる。DIPS APIが同じキーを解釈する前提は置かず、送信結果不明時は [13b](../state-machines/13b_dips-submission.md) の照合へ進む。同期キューの型・実行・再試行は [14](../14_offline-and-sync.md)、手動修正優先順位は [11](../11_data-authority.md)。

## 6. 操作アカウントと人員の監査接続（PENDING-C1-SCHEMA）

本書の既存 `actor_personnel_id` / `created_by` / `updated_by` はPersonnel参照を示すが、[31c](../identity-and-access/31c_operational-actors.md)のSubmitter / SubmissionActorはUserAccountであり同一人物・同一IDとは限らない。通報・編集した操作主体と、操縦・点検等を行った記録対象人員の両方を識別可能にする証跡要件を保持する。操作アカウントの監査参照、Personnelとの任意関連、未ログイン運用時の識別方法はC1 schema確定前に整理するPENDINGであり、UserAccount IDをPersonnel ID欄へ無条件に代入しない。これはC1で認証機能を追加する指示ではない。
