# 12d. 許可・保険・飛行計画とDIPS提出記録

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: FlightPlan / Permission / InsurancePolicy / DipsSubmissionのデータ意味論。外部API DTO、状態遷移、要件判定は別正本から参照する。

## 1. Permission（飛行許可・承認台帳）
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

## 2. InsurancePolicy（保険台帳マスター）
分類: **Master**。ドローン賠償責任保険・機体保険契約を組織・複数機材で再利用する。DIPS No.60〜65への変換は [25c](../dips-flight-plan/25c_api-payload-mapping.md)、台帳同期推奨は [24a](../dips-submission/24a_submission-and-sheets-ledger.md)。

```typescript
export interface InsurancePolicy {
  insurance_policy_id: string;        // UUID v4
  organization_id?: string;           // 運用主体 (nullable)
  insurer_name: string;               // 保険会社名（例: "架空保険会社A"）
  product_name: string;               // 保険商品名（例: "ドローン賠償責任保険"）
  policy_number?: string;             // 証券番号（任意 / マスキング考慮）
  valid_from: string;                 // 保険期間開始日 (YYYY-MM-DD)
  valid_until: string;                // 保険期間満了日 (YYYY-MM-DD)

  // 賠償限度額 (万円) - Core Domain の表現
  liability_available: boolean;       // 賠償責任保険加入有無
  bodily_injury_limit_man_yen?: number;   // 対人賠償限度額 (万円)
  bodily_injury_unlimited: boolean;       // 対人無制限フラグ
  property_damage_limit_man_yen?: number; // 対物賠償限度額 (万円)
  property_damage_unlimited: boolean;     // 対物無制限フラグ

  coverage_scope: 'organization_wide' | 'fleet_wide' | 'specific_aircraft' | 'project_specific';
  applicable_aircraft_ids?: string[]; // 特定機体限定時の対象機体ID配列
  status: 'ACTIVE' | 'EXPIRED' | 'ARCHIVED';
  notes?: string;

  // 共通監査メタデータ
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  version: number;
}
```

## 3. FlightPlan（内部飛行計画）
- **ID**: `flight_plan_id` (UUID v4)
- **分類**: **History (Plan)**
- **主な属性**:
  - `revision`: リビジョン番号（整数、変更時にインクリメント）
  - `organization_id`: 運用組織ID
  - `project_id`: 関連業務案件ID（任意）
  - `name`: 飛行計画名称（例: "架空公園A_定期空撮_20261020"。DIPS Web自動生成名称は表示用参考とし、UUIDを内部正本IDとする）
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
  - `geometry_kind`: 旧設計名。独立保存せず `geometry.kind` から導出する（値定義は17番正本）。
  - `geometry`: [FlightAreaGeometry](../17_map-and-airspace.md) を保持。`POLYGON` / `CIRCLE` / `BUFFERED_LINE` の型・座標・半径定義は17番正本。
  - `geometry_snapshot`: Presetから計画作成時に複製した形状の旧設計名。計画Draftでは今回範囲へ編集可能。提出確定後の不変形状は `DipsSubmission.submission_snapshot` 内にディープコピーして保持する。`geometry` との実装上の統合方法はC1 schema確定時のPENDING（別正本を作らない）。
  - `internal_purpose_id`: アプリ内部目的ID（`InternalFlightPurpose`。操縦練習、観光PR撮影、屋根外壁点検等）
  - `flight_purposes`: 飛行目的の意味キー配列（**複数選択対応**）。内部目的から推奨し今回選択を保持する。DIPS公式数値コード（1〜16）は25cのMapperだけで扱う。
  - `flight_purpose_other_text`: 目的「その他」選択時の詳細理由（テキスト）
  - `flight_airspaces`: 飛行空域の意味キー配列（**複数選択対応**、空港等周辺・150m以上・DID・該当なし。緊急用務空域は飛行前現場確認として分離）。
  - `flight_methods`: 飛行方法の意味キー配列（**複数選択対応**、夜間・目視外・30m未満・催し場所・危険物・物件投下・該当なし）。
  - `permission_id`: 適用許可承認ID (nullable、選択時に許可番号・期間・カテゴリーを参照)
  - `insurance_policy_id`: 適用保険マスターID (nullable、選択時に保険会社・商品名・対人対物補償等を自動補完し今回Override可能)
  - `onsite_control_measure`: 立入管理等の安全確保措置の意味値。APIコード変換は25c。
  - `safety_measures`: 適用安全措置テキスト配列
  - `flight_manual_type`: 飛行マニュアル区分（標準 / 独自）
  - `emergency_procedure_confirmed`: 緊急時手順確認フラグ（初期は未確認。提出時の要求値は下記の確認規則による）
  - `preflight_inspection_planned`: 点検実施確認フラグ（初期は未確認。提出時の要求値は下記の確認規則による）
  - `weather_check_confirmed`: 気象確認フラグ（初期は未確認。提出時の要求値は下記の確認規則による）
  - `communication_check_confirmed`: 連絡体制確認フラグ（初期は未確認。提出時の要求値は下記の確認規則による）
  - `radio_check_confirmed`: 無線機器確認フラグ（初期は未確認。提出時の要求値は下記の確認規則による）
  - `accident_action_confirmed`: 事故対応確認フラグ（初期は未確認。提出時の要求値は下記の確認規則による）
  - `contact_source`: 緊急連絡先選択区分（`user_account` 自アカウント / `application` 申請書情報 / `pilot` 操縦者）
  - `contact_person_id`: 連絡先対象人物ID（操縦者選択時の参照）
  - `emergency_contact_target`: 優先緊急連絡先区分（`pilot` / `reporter` / `permit`）
  - `remarks`: 計画書特記事項
  - `plan_status`: 計画状態（`draft` [入力途中常時保存可], `submission_ready` [必須・適用条件充足], `locked_for_submission` [提出スナップショット生成済], `active` [運航中], `completed` [運航完了], `cancelled` [中止]）
  - `readiness_cache`: 直近の `DipsSubmissionReadiness` 評価結果キャッシュ（オプショナル）
  - **値の上書き追跡（Effective/Override）**: 各項目について `source_master_value`（マスター/プリセット元値）と `override_value`（今回計画の上書き値）を区別し、通報・スナップショットには `effective_value`（上書き優先確定値）を採用する。

上記6つの確認項目は [25a No.70〜75](../dips-flight-plan/25a_field-catalog.md) で `PLAN_INPUT / チェック` とされる項目であり、API契約上の `true` 指定を初期値の無条件自動確認と解釈しない。Draftは未確認のまま保存できる。提出準備評価では [25d](../dips-flight-plan/25d_requirement-validation.md) に従い明示確認と有効値を必要とし、未確認を自動的に `true` へ変換しない。手動Webの固有validationで未確認の事項は26のPENDINGに残す。

## 4. DipsSubmission（DIPS提出試行・不変スナップショット台帳 - SSoT）
- **ID**: `submission_id` (UUID v4)
- **分類**: **History (SSoT)**
- **役割**: DIPSへの通報直前または手動確定時点で生成される提出試行レコード。スプレッドシート「DIPS飛行計画台帳」の1行に対応。
- **属性**:
  - `flight_plan_id`: 対象飛行計画ID
  - `revision`: 提出リビジョン番号
  - `dips_contract_version`: 基準API仕様バージョン（例: `"FPR-API-1.9"`）
  - `submission_method`: 通報方式 (`manual` / `api` / `mock`)
  - `status`: [DipsSubmissionStatus](../state-machines/13b_dips-submission.md)（全状態・遷移の正本）。大文字は設計状態名、小文字は従来保存例。永続化時の符号化方式はC1 schema確定時に決め、別状態体系を作らない。
  - `submission_snapshot`: **提出確定時点の意味論的不変通報スナップショット（必須・通報方式問わず保持）**。手動入力支援（`ManualDipsAdapter`）の1タップコピー展開、およびGoogle Sheets飛行計画台帳同期の元データ。
  - `api_payload_snapshot`: **DIPS API送信時のexact outbound JSON文字列（任意・nullable、Phase C7 Optional）**。`ApiDipsAdapter` 経由で国交省へ実際にPOSTした電文の監査記録。手動通報時やAPI未利用時はnull。
  - `dips_plan_id`: DIPS飛行計画番号（受付番号、nullable）
  - `confirmation_method`: 確認方式 (`flight_plan_list_match` / `displayed_id` / `api_response`)、未確認時はnull。
  - `submitted_at`: 通報日時（未通報時はnull）
  - `confirmed_at`: 確認日時（未確認時はnull）
  - `cancel_reason`: 取消時の理由テキスト（旧 `cancellation_reason` と同じ意味。台帳 `cancellation_info` は日時と理由の表示用合成）。
  - `cancelled_at`: 取消日時。
  - `snapshot_created_at`: 提出内容確定日時。
  - `supersedes_id` / `superseded_by_id`: 訂正前・訂正後の提出ID（任意）。
  - `sync_status`: 外部台帳への同期状態。定義は [14](../14_offline-and-sync.md) と [24a](../dips-submission/24a_submission-and-sheets-ledger.md)。
  - `notes`: 提出特記事項

## 5. DipsNotification（通報状態集約プロジェクション）
- **分類**: **Projection (集約ビュー)**
- `DipsSubmission` から最新状態を射影してUIへ表示する読み取り専用モデル（二重正本を排除）。

## 6. Core意味論と入力再利用の境界

旧設計の `flight_purpose_codes` / `flight_airspace_codes` / `flight_type_codes` / `onsite_control_code` の数値はCore属性に直保存しない。対応する情報は上記意味値で保持し、公式コード体系は [25a](../dips-flight-plan/25a_field-catalog.md)、変換は [25c](../dips-flight-plan/25c_api-payload-mapping.md) が正本。意味キーの全enum・未選択と「該当なし」の符号化は **PENDING**。未選択を非特定飛行と推定しない。主機体と対象機体配列、主操縦者と操縦者配列を分け、総重量はカタログ自重ではなく搭載品を含む今回値、航続可能時間は現場条件を考慮した今回値とする。補助者は登録Personnel選択に加えて未登録補助者を含む申告人数overrideを許容する。

機体と操縦者は登録済Picker、目的・空域・方法は複数選択、保険は構造化したMasterから再利用、許可は許可情報から選択する。日時は主日程を保ちながら `planned_occurrences` による複数日拡張を阻害しない。これらは [26のOBSERVED記録](../26_dips-web-ui-verification.md) から採用したアプリ設計要件であり、DIPS内部保存形式や代理通報の法的可否を確定するものではない。

## 7. 不変提出スナップショットと改訂・取消

ドローン運航現場では、天候や業務都合により飛行日時や使用機体が直前に変更されることが頻繁にあります。
もし「最新のFlightPlan」のみを保持し過去データを上書き更新した場合、「午前中にDIPSへ何を通報したか」という公的証跡が消滅してしまいます。

そのため、以下の改訂プロトコルを確立します：
1. **不変スナップショットと可変メタデータの厳格分離**:
   - **不変なのはSnapshot本文であり、レコード全体ではない**: 通報準備に入った時点で生成される `submission_snapshot` は一切の改変が禁止されます。API通報経路（Phase C7 Optional）において実際にDIPS APIへ送信した電文 exact JSON が存在する場合は `api_payload_snapshot`（nullable）として記録し、送出済み電文を後から書き換えません。手動通報経路においてAPI JSONは生成されず、ユーザー向けJSONファイル出力も行いません。
   - **ライフサイクルメタデータは更新可能**: `status`, `sync_status`, `dips_plan_id`, `confirmation_method`, `submitted_at`, `confirmed_at`, `superseded_by_id`, `cancelled_at` 等の進行状態はライフサイクルに応じて更新されますが、状態遷移の都度 `AuditEvent`（変更理由・日時）を記録し、監査履歴を完全に追跡可能とします。
2. **計画変更と新リビジョン起票**:
   - 計画内容を変更して再通報する場合、`FlightPlan.revision` をインクリメント（例: Revision 1 → Revision 2）し、新しい `submission_id` を持つ別の `DipsSubmission` を起票します。
3. **履歴リンクの形成**:
   - 旧提出（Revision 1）の `superseded_by_id` に新提出IDを記録し、ステータスを `SUPERSEDED` に変更。
   - 新提出（Revision 2）の `supersedes_id` に旧提出IDを記録。
4. **計画取消（Cancellation）**:
   - 運航中止等で計画を取り消す場合、操縦者がDIPS側で取消手続きを実施した上で、アプリ側で「取消」を打刻。
   - `cancelled_at`（取消日時）および `cancel_reason`（強風、体調不良、機体不調等）を記録し、ステータスを `CANCELLED` に更新。過去スナップショット自体は削除せず長期にわたり保持します。

## 8. 関連サービスの所在

- **分類**: **Applicationの契約評価サービス**（Core EntityへDIPS契約ルールを埋め込まない）
- **役割**: `DipsFieldRequirementEngine` は `FlightPlan`, `Aircraft`, `Personnel`, `Permission`, `InsurancePolicy`, プリセットおよび運航条件の中立データを入力とし、Applicationが受け取るバージョン付き外部契約ルール（例: `"FPR-API-1.9"`）で要求度・適用性・入力責任・有効値・Validationを評価する。結果は `DipsSubmissionReadiness`。外部契約の取得・対応表・変換をCoreへ混入させない（[20の責務境界](../20_source-structure.md)、[25d](../dips-flight-plan/25d_requirement-validation.md)）。
- **4段階状態の遷移判定**:
  - `DRAFT`（入力途中常時保存可） → [Requirement Engine評価] → `SUBMISSION_READY`（提出可） → [スナップショット生成] → `SNAPSHOT_SAVED`（`DipsSubmission` 起票・ローカルDB保存）。

完全な型・要求度/適用性/入力責任・Validation/SUBMISSION_READY規則は [25d](../dips-flight-plan/25d_requirement-validation.md) が正本。本書はサービスの所在のみを示す。通報要否と離陸総合評価の正本は [13c](../state-machines/13c_takeoff-readiness.md)。
