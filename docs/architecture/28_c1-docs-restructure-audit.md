# 28. C1前 docs構造再編・設計整合監査

最終監査日: 2026-09-18\
対象基準: `84ae73b74cd20fcabd5953bde8ac550b42f07285` / `main`\
状態: 全22項目PASS・docs再編/整合監査完了（Phase C1未着手）

本書は今回の責務監査・移行対照・訂正根拠・検査結果の記録であり、設計定義の追加正本ではありません。現行正本は [architecture README](README.md#3-主要概念の正本)、開始前の未決事項は [04_open-questions](../04_open-questions.md#3-c1前docs再編で追跡するpending) を参照します。

本書の「全22項目PASS」は上記基準時点（2026-09-18・`84ae73b`）の監査範囲を指す。その後の99.2再移植（Step 1〜8）で更新された設計・状態は[移植・監査記録](../migration/README.md)から辿り、本書を最新状態の証明として使わない。

## 1. 範囲・再開・証拠

- 開始時の作業ツリーはclean、`main`のHEADとfetch後の`origin/main`は上記基準SHAと一致。中断再開時は同じHEADに保存されていたdocs変更と担当別進捗を照合し、完了済み分割は維持して未完了の整合・監査を進めました。
- 編集前に基準コミットの全45 Markdown（docs 42、root 3）を全文読了し、下記の責務評価を実施。編集後は各担当の全移管先対照と、担当を交替した独立レビューを実施しました。
- 現在資料・Git履歴・C0の実ソースを調査。履歴の `00bd729` はADR承認ヘッダ更新の根拠です。過去エージェント履歴は指定リポジトリ/パス検索で結果なし、履歴インベントリには失敗単位もあるため網羅確認とは扱いません。現行資料とGitを根拠にしています。
- DIPS画面の観測日2026-09-14、元のAPI資料版数、OBSERVED / OFFICIAL_SPEC / INFERRED / PENDINGを維持。今回、DIPS APIの現行契約・法令・申請資格を新たに認定していません。Google My Mapsの公式資料照合は [27c](output/27c_google-mymaps-workflow.md) に日付・出典・実機未確認を分けて記録しました。
- 文書のみを変更。アプリコード、依存関係、設定、既存コミットは変更していません。C1、実API送信、KML生成、Drive接続、地図編集実装は開始していません。ランタイムテストは変更対象外です。

## 2. 編集前の全体責務評価

「維持」は行数ではなく、単一の判断対象・ライフサイクルとして読む理由があることを示します。重複した詳細は正本参照へ整理し、履歴は当時の記録と明示しました。各ファイルの役割を以下に列挙します。

| 基準文書 | 主責務 | 副責務 | 重複・矛盾の評価 | 分割判断・理由 | 正本 / 参照範囲 |
|---|---|---|---|---|---|
| [01_アプリ概要.md](../../01_アプリ概要.md) | 目的/引継ぎ | 文書案内 | C0開始/ADR1〜6が古い | 維持：全体説明 | 概要。要件/23参照 |
| [AGENTS.md](../../AGENTS.md) | AI作業規約 | Phase/入口 | 未選定表現/2形状が古い | 維持：共通規約 | 規約。詳細はguidelines/ADR/23 |
| [README.md](../../README.md) | repository入口 | 現在Phase | B2/C0表記の混在 | 維持：短い案内 | 入口。詳細は00_index |
| [00_goal.md](../00_goal.md) | 目標/現場フロー | 運用思想 | API必須/物理制御表現 | 維持：目的を保存 | 目標。詳細は03/設計 |
| [00_index.md](../00_index.md) | 総合発見性 | 状態 | 平坦一覧/ADR0000仮想file | 維持：階層化 | 入口のみ |
| [01_current-system-analysis.md](../01_current-system-analysis.md) | 基準アプリ分析 | 運用理由 | BAT固定等は旧仕様 | 維持：日時付き記録 | 旧資産分析。現型は12系 |
| [02_reference-app-requirements.md](../02_reference-app-requirements.md) | 参考アプリ分析 | 機能比較 | 現行外部挙動の再認定不可 | 維持：日時付き記録 | 参考証拠。採用要件は03 |
| [03_integrated-requirements.md](../03_integrated-requirements.md) | 横断機能要件 | 状態/出力要約 | API必須/重複FSM/数値Core | 維持：受入能力の一覧 | 要件。型/機構は領域正本へ |
| [04_open-questions.md](../04_open-questions.md) | 未決事項 | 旧選択肢 | 採用済みが未決に見える | 維持：決定とPENDING分離 | 未決一覧。決定はADR |
| [00_b1-audit-and-corrections.md](00_b1-audit-and-corrections.md) | B1監査履歴 | 旧訂正/判断 | 旧JSON/BAT/状態 | 維持：履歴注記 | 履歴。現仕様はADR/領域 |
| [01_frontend-runtime-comparison.md](01_frontend-runtime-comparison.md) | runtime比較 | offline条件 | 旧JSON提案 | 維持：一比較軸 | 比較履歴。ADR1/8参照 |
| [02_backend-and-security-comparison.md](02_backend-and-security-comparison.md) | backend比較 | 秘密/費用 | 過去の外部製品条件 | 維持：一比較軸 | 比較履歴。ADR1/16参照 |
| [03_data-storage-and-sync-comparison.md](03_data-storage-and-sync-comparison.md) | 保存方式比較 | 同期案 | 旧BAT/再送提案 | 維持：一比較軸 | 比較履歴。ADR2/7/14参照 |
| [04_cost-and-operations-analysis.md](04_cost-and-operations-analysis.md) | 費用/運用比較 | 規模例 | 当時の料金・無料枠 | 維持：一判断領域 | 履歴。支出判断時再確認 |
| [05_recommended-architecture.md](05_recommended-architecture.md) | B1推奨理由 | 代案/見直し | 旧地図/JSON/Phase | 維持：判断履歴 | 現行は後続ADR |
| [09_b2-audit-and-corrections.md](09_b2-audit-and-corrections.md) | B2.1監査履歴 | 当時の型/状態 | 現行状態に見える見出し | 維持：監査履歴 | 現型は12/13系等 |
| [10_system-boundaries.md](10_system-boundaries.md) | システム境界 | 通信/将来Port | 地図固定/外部同期必須誤読 | 維持：横断境界契約 | 境界。個別機構は参照 |
| [11_data-authority.md](11_data-authority.md) | データ権威 | 競合/同期概略 | Model D承認待ち/BAT/状態 | 維持：権威判断一体 | Authority。queue14/台帳24a |
| [12_domain-model.md](12_domain-model.md) | Domain型 | 監査/ID/Sheets/評価 | 型と外部保存/状態の混在 | 分割：領域独立 | 12a〜f。Geometry17/Sheets24a |
| [13_state-machines.md](13_state-machines.md) | 状態管理 | 運航/提出/離陸評価 | 独立FSMと法令評価の混在 | 分割：別Phase/遷移 | 13a/b/c。要件評価25d |
| [14_offline-and-sync.md](14_offline-and-sync.md) | 保存/同期機構 | DIPS業務/復旧 | JSON/地図固定/Job状態 | 維持：保存→再試行一体 | SyncQueue。業務24/復旧19 |
| [15_dips-adapter.md](15_dips-adapter.md) | 三戦略Adapter | 手動UI/認証 | 単数人員/コピー中心/取消ID | 維持：境界、UI移管 | Adapter。UI25b/JSON25c/秘密16 |
| [16_security.md](16_security.md) | 秘密/開示境界 | session候補比較 | JSON出力/暗号文保管表現 | 維持：横断制御 | Security。出力profile27a |
| [17_map-and-airspace.md](17_map-and-airspace.md) | 地理モデル/地図層 | editor/鮮度/選定 | 26とGeometry重複 | 維持：地理責務 | Geometry。API25c/KML27a |
| [18_reports.md](18_reports.md) | 帳票pipeline | 区切り/法令UI | 区間欠落/形式境界重複 | 維持：一生成系 | Reports。形式27/型12e |
| [19_failure-recovery.md](19_failure-recovery.md) | 障害回復 | 継続/外部隔離 | JSON/全DB復旧保証 | 維持：回復表 | Recovery。機構は14等 |
| [20_source-structure.md](20_source-structure.md) | source責務/依存 | 将来tree | React固定/外部責務混在 | 維持：依存方向契約 | source配置。各仕様参照 |
| [21_testing-strategy.md](21_testing-strategy.md) | 検証戦略 | 単体/統合/実機 | 実打刻制止/API必須誤読 | 維持：検証階層 | テスト境界。仕様は正本へ |
| [22_migration-plan.md](22_migration-plan.md) | 移行ライフサイクル | 並行/切替/復帰 | 固定7本/旧Sheet変更/JSON | 維持：一移行過程 | 移行。復旧19/型12系 |
| [23_implementation-roadmap.md](23_implementation-roadmap.md) | Phase配分 | 受入/依存 | C0開始/地図固定/KML配置 | 維持：横断Phase計画 | Phase。詳細は領域へ |
| [24_b2.2-dips-manual-fallback-and-ledger.md](24_b2.2-dips-manual-fallback-and-ledger.md) | Manual通報 | Sheets/状態/UI | 外部依存/実装Phase混在 | 分割：業務と台帳 | 24/24a。UI25b/状態13b |
| [25_dips-flight-plan-field-mapping.md](25_dips-flight-plan-field-mapping.md) | DIPS項目対応 | UI/DTO/型/評価 | 5責務/重複型/fence崩れ | 分割：外部契約別 | 25a/b/c/d。型12/17/13c |
| [26_dips-web-ui-verification.md](26_dips-web-ui-verification.md) | 観測証拠 | 要件/型の提案 | 証拠と規範型が混在 | 維持：規範を正本へ移管 | 証拠分類。UI25b/Geometry17 |
| [27_output-kml-drive-and-mymaps.md](27_output-kml-drive-and-mymaps.md) | 出力境界 | KML/Drive/My Maps/log | 独立依存/JSON詳細重複 | 分割：5責務 | 27/a/b/c/d。JSON25c |
| [README.md](README.md) | 設計入口 | 正本/履歴一覧 | 分割後の参照更新必要 | 維持：概念別案内 | 詳細を重複しない |
| [ADR-0001-architecture-selection.md](../decisions/ADR-0001-architecture-selection.md) | 構成採用履歴 | 地図/JSON | 地図固定/JSONは現方針と不一致 | 維持：承認記録不変 | 0008/9の限定後続が優先 |
| [ADR-0002-data-authority-and-sync.md](../decisions/ADR-0002-data-authority-and-sync.md) | Model D採用 | 同期影響 | Acceptedと本文承認待ち | 維持：状態誤記だけ訂正 | 採用理由。詳細11/14 |
| [ADR-0003-offline-storage-and-eviction-defense.md](../decisions/ADR-0003-offline-storage-and-eviction-defense.md) | 多層永続化採用 | JSON退避 | ユーザーJSONと現方針衝突 | 維持：本文不変 | 0008でJSONのみ部分置換 |
| [ADR-0004-dips-adapter-architecture.md](../decisions/ADR-0004-dips-adapter-architecture.md) | Adapter採用履歴 | 認証/照合 | Proposal残存は承認前履歴 | 維持：本文不変 | 理由。現契約15/16 |
| [ADR-0005-state-machine-separation.md](../decisions/ADR-0005-state-machine-separation.md) | FSM分離採用 | readiness | 旧状態名は後続拡張前 | 維持：本文不変 | 理由。現状態13系 |
| [ADR-0006-dips-optional-and-manual-submission-ledger.md](../decisions/ADR-0006-dips-optional-and-manual-submission-ledger.md) | API非依存採用 | snapshot/台帳 | 旧型名は詳細設計前 | 維持：一採用判断 | 理由。現定義12d/24/25系 |
| [ADR-0007-normalized-masters-and-business-reporting.md](../decisions/ADR-0007-normalized-masters-and-business-reporting.md) | 正規化/帳票採用 | 人員/機材/組織 | 形状例示は後続拡張前 | 維持：本文不変 | 理由。現型12/17、帳票18 |
| [README.md](../decisions/README.md) | ADR運用/索引 | template | 0000実体誤読/旧Proposal | 維持：決定の入口 | 決定状態/後続優先 |
| [01_structure-and-maintenance-rules.md](../guidelines/01_structure-and-maintenance-rules.md) | 構造/保守規約 | source例 | 外部責務混在/追加判定不足 | 維持：Responsibility Check追加 | 保守規約。source例20参照 |
| [02_legal-and-operations-rules.md](../guidelines/02_legal-and-operations-rules.md) | 法令8区分/全記録評価 | 運用例 | BAT物理Sheet誤読 | 維持：意味保持訂正 | 評価規約。新法令判断なし |

## 3. 再編後の入口と非分割判断

```text
AGENTS.md → docs/00_index.md → docs/architecture/README.md
docs/architecture/
├── domain-model/
│   ├── README.md / 12_overview.md
│   ├── 12a_organization-and-personnel.md
│   ├── 12b_aircraft-and-battery.md
│   ├── 12c_location-and-presets.md
│   ├── 12d_flight-plan-and-dips.md
│   ├── 12e_operation-inspection-maintenance.md
│   └── 12f_common-lifecycle-id-and-audit.md
├── state-machines/
│   ├── README.md / 13_overview.md
│   ├── 13a_operation.md
│   ├── 13b_dips-submission.md
│   └── 13c_takeoff-readiness.md
├── dips-submission/
│   ├── README.md / 24_manual-submission.md
│   └── 24a_submission-and-sheets-ledger.md
├── dips-flight-plan/
│   ├── README.md / 25_overview.md
│   ├── 25a_field-catalog.md
│   ├── 25b_manual-web-mapping.md
│   ├── 25c_api-payload-mapping.md
│   └── 25d_requirement-validation.md
├── output/
│   ├── README.md / 27_output-boundaries.md
│   ├── 27a_kml-export.md
│   ├── 27b_google-drive-storage.md
│   ├── 27c_google-mymaps-workflow.md
│   └── 27d_aircraft-flight-log-import.md
└── 28_c1-docs-restructure-audit.md
docs/decisions/
├── README.md / ADR-0001〜0007（既存の決定記録）
├── ADR-0008-user-facing-export-and-recovery-boundaries.md
└── ADR-0009-map-renderer-selection-deferred-to-c5.md
```

総合目次は要件・規約・設計・決定の入口、architecture READMEは領域と概念別正本の対応表、各領域READMEは責務・読む順番・関連正本だけを案内します。旧12/13/24/25/27は既存ADR・履歴リンクを保つ移行案内として残し、詳細の追記先にはしません。文書削除はありません。

12はDomainの変更単位、13は運航/通報/離陸評価、24はManual業務/Sheets保存、25は外部項目参照/手動UI/API変換/要件評価、27は生成/保存/外部閲覧/将来取込の独立性から分割しました。

一方、11の権威判断と競合保護、14の保存・ジョブ・再試行、15の三戦略Adapter境界、16の秘密境界、17の地理モデルと地図層、18の帳票パイプライン、19の障害回復表、20の依存方向、21の検証戦略、22の移行ライフサイクル、23のPhase配分はそれぞれ一つの判断責務として維持しました。25aの88項目は一つの照合カタログであり、長さだけを理由に細分化しません。26は証拠資料、ADRは一つの採用判断、旧比較文書は一つの比較軸として保持します。

## 4. 旧章からの移行対照と保持検査

以下の章番号は基準コミットの旧文書に対するものです。詳細は移管先正本を読み、本書を仕様の再定義に使いません。

### 4.1. 12 Domain

| 旧章 | 新正本・保持範囲 |
|---|---|
| §1 全体ER/4分類概要 | domain-model/12_overview.md §1–2。正規化関係をMermaid化。元図のAircraft→Battery所有関係に見える線を排しBatteryCompatibilityと実績Flightによる関連を明示。独立管理Entityと外部Sheets/SyncQueueの所在を列挙 |
| §2.1/2.2/2.8 | 12a §1–3。Organization, Client, Project, Personnelの属性・役割・UserAccount分離すべて保持 |
| §2.3–2.7/2.26 | 12b §1–6。機種/個体、型式/個体、互換N:M、BatteryUsage非飛行専用を保持 |
| §2.9–2.12 | 12c §1–4。Location, FlightAreaPreset,目的/安全Preset,OperationTemplate、Copy Source原則を保持。Geometry個別属性は17正本へ移管し旧名対応も説明 |
| §2.13/2.14 | 12d §1–2。Permissionの全属性、InsurancePolicyの全属性を25旧§4.1の完全TS定義と統合して保持 |
| §2.15–2.17 | 12d §3–5。FlightPlan全項目、DipsSubmission全項目、DipsNotification読取Projectionを保持。Core数値コードは意味キーへ置換し旧名/意味/公式数値の所在を25a/25cへ接続 |
| §2.18–2.20/2.24/2.25/2.27 | 12e §1–6。Mission/Flight/Switch/点検/整備/ReportSnapshotを保持。24に定義済のplanned_submission_idと既存監査記録のinitial_aircraft_idをEntityへ補完 |
| §2.21 | 12d §8はサービスの所在だけとし、全ルール/型は25d。Application契約評価サービスへ責務整合しCoreへの外部契約混入を禁止 |
| §2.22/2.23 | state-machines/13c。ReportingRequirementEvaluatorとTakeoffReadinessの完全定義へ参照。12_overview/12d/領域READMEから辿れる |
| §2.28/2.29 | 12f §1–2。AuditEvent/AppSetting全属性と用途を保持 |
| §3/3.1/3.2 | 12f §3。Master/Preset/History/Projection全分類表、共通監査メタデータ、一括登録/UPSERT準備を保持。JSON import/exportはADR0008に従い廃止、将来全量復旧形式PENDING |
| §4/4.1/4.2 | dips-submission/24a §1。全12論理台帳の名称/役割/独立Sheet推奨/同期方針を移管 |
| §5/5.1/5.2 | 12f §4。UUID v4/operation_id/SHA256式/外部UPSERTを保持。DIPSの照合方式と混同しない参照を追加 |

### 4.2. 13 State / Readiness

| 旧章 | 新正本・保持範囲 |
|---|---|
| §1導入/分離図、§1.1全4段階/接続図/説明 | state-machines/13_overview.md §1。独立性と保存/提出/現場運航の接続を保持。要件判定詳細は25dへ参照 |
| §1.2 A/B/C | 13c §1。REQUIRED/NOT_REQUIRED/UNDETERMINED、公式障害例外の人間確認/禁止事項を保持。NOT_SUBMITTED/NOT_APPLICABLEはSubmission未起票時の表示Projectionとして整理 |
| §1.3 | 13c §2。TakeoffReadinessAssessmentのTS属性、Hard Block/Warning/現実の離陸記録保証を保持 |
| §1.4 | 13c §3。未確認離陸/障害例外時のAuditEvent識別と非特定飛行除外を保持 |
| §2/2.1–2.3 | 13a §1。Operation FSM/全11状態表/8飛行以上/日跨ぎ/再起動復帰を保持。BAT1〜7固定とBatteryUsage飛行重複をADR0007に整合 |
| §3/3.1/3.2/5大ルール | 13b §1。DIPS FSM/全13状態表/状態UI/五原則を保持。送信後処理不明5xxを無条件RETRYへ落とさず照合へ接続 |

### 4.3. 24 Manual / Sheets

| 旧章 | 新正本・保持範囲 |
|---|---|
| §1/1.1/1.2 | dips-submission/24_manual-submission.md §1。背景、API審査等未確認、API非依存、Snapshot先行/非同期、誤認防止を保持 |
| §2全体フロー図 | 24_manual §2–3の支援原則図/手順と13_overviewの接続図へ統合。元図の全ノード（Draft/要件評価/ローカルSnapshot/Sheets非同期/Manual/API/手動打刻/登録確認/台帳UPSERT/現場点検/離陸評価/Flight/日誌）を文章・図で保持 |
| §3/3.1 | 24a §2のA–AE全31列を保持。Geometryを3形状に整合。§3に完全Snapshot/API exact/同期軸/契約版のAF–AI保持要件を追加し、従来全情報を単数表示列で失わない設計へ補完 |
| §4/4.1 | 12d §7へ改訂理由・本文不変/metadata更新・AuditEvent・新revision/前後ID・DIPS取消確認/日時理由/過去保持の全規則を移管。状態は13b |
| §5/5.1 | dips-flight-plan/25bへ移管（dips担当）。旧10コピーカードの全情報、別タブ導線、手動打刻、確認A/B、番号null一覧照合、台帳反映を保持。24_manualは全体業務導線のみ |
| §6/6.1/6.2 | 13bの単一状態表・5原則と24a§4の同期表示軸へ統合。確認方式3種・番号非必須・Mock区別・飛行可能非保証を保持 |
| §7 | 24a §5に計画選択スキップ/2つのMission FK/逆引き/予定実績対比を保持。Entity属性は12e |
| §8/8.1 | 24a §6に全5ステップ順序/圏外queue/復帰反映を保持。Manual画面ローカル利用とDIPSWebへの外部通信を区別 |
| §9 | 24_manual §4にC6第一級/C7承認時のみ/C7省略経路/C8C9本番判定/C7後付けを保持。全Phase別実装詳細はroot担当23正本（旧図のMapLibre固定は17/ADR0009へ訂正） |
| §10 | 24_manual §5へ全10行保持。2026-09-14時点の調査/申請記録と今回未調査を明記。「DIPS標準様式」を「飛行日誌様式」に訂正 |

### 4.4. 25 DIPS Field / UI / API / Validation

| 元章 | 移行先 | 保持・修正理由 |
|---|---|---|
| 1.1 位置付け/責務 | 25_overview / README | Manual C6 / API C7 Optionalと型C1参照を明示 |
| 1.2 公式根拠4資料 | 25a §1 | 名称/版数/日付を継承。今回新たな公式全行再検証をしたとは主張しない |
| 2 外部DTO分離と図 | 25_overview §2 | 手動/API二経路図を保全、孤立fenceと接続不明末尾Adapter箱を修復（15へのリンクに置換） |
| 2.1 コード変換 | 25c §1.1/2 | versioned mapperと旧数値Core属性→中立意味配列の対応を保持 |
| 2.2 Snapshot/仕様版 | 12d正本 + 25c §1.2/5 | 意味論不変記録と実送出電文を分離、法的完全立証という保証表現を証跡用途へ精密化 |
| 3.0 3軸定義/具体例 | 25d §1 | 全enumと操縦者/資格/許可/その他の例を保持 |
| 3.1 入力分類 | 25a §2.1 | 旧タグを保持しcanonical3軸enumとの対応を明示。CONDITIONAL等を入力責任と混同させない |
| 3.2 全88表 | 25a §2.2 | No.1〜88完全保持。旧Core名/例示のみ中立型・匿名値へ整合 |
| 4.1 InsurancePolicy21属性 | domain-model/12d §2（domain担当） | 全21属性保持。単一型正本へ移管 |
| 4.2 -1変換/台帳推奨 | 25c §3 / 24a Sheets Ledger | bool無制限→外部-1保持、台帳同期推奨保持 |
| 5.1 Web/API形状差 | 25c §4 | Polygon/Circle、BUFFERED_LINE MANUAL_ONLY・自己流Polygon送信禁止を保持 |
| 5.2 Preset deep copy/過大範囲防止 | 17 §2.3 | 一般Geometry責務へ完全移管 |
| 6 複数機体/操縦者/重量/航続/人数 | 12d §3/6（domain担当） | 全意味を保持、外部数値コードは25cへ |
| 7 Manualレイアウト | 25b §3 | 図を保持して匿名化、APIコード非表示。登録Picker/checkbox中心に正式化 |
| 8 参考入力数集計 | 25b §5 | 全数値/内訳/動的算出注意を保持。重複分類と非No項目を含む概算であると精密化 |
| 9.1 RequirementEngine図 | 25d §2.1 | 全入力/出力/判断責務保持 |
| 9.2 機体能力とGeometry非混同 | 25d §2.2 | waypoint等能力からShape必須判定しない原則保持 |
| 9.3 Effective/Override | 25d §2.3 | 元値・override・確定値・マスター欠損時救済保持 |
| 9.4 Domain Types | 25d §2.4 | 3軸/状態enumと23型フィールド保持 |
| 9.5 Blocking Rules | 25d §2.5/3 | 自動補完有効性保持、単一statusをAUTO_FILLEDかつVALIDと誤記しない。条件未決でReadyにしない |
| 9.6 法的通報要否 | 13c §4（domain担当） | 9条件・出力3値・例外/推奨保持。API数値依存、>150と以上の齟齬、未確定を非該当にする例を解消 |
| 10 PENDING01–05/集合参照 | 26 §5 | 個別ID全維持。旧PENDING06〜12は個別7定義ではなく集合参照だった旨明記 |

### 4.5. 27 Output / Drive / My Maps / Import

| 旧27章 | 新正本・保持内容 |
|---|---|
| §1 / 1.1 | 27_output-boundaries §1。4境界の説明・全体図・台帳/帳票/地図/内部通信の役割を保持。Sheets権威昇格を外部同期完了後と明確化 |
| §1.2.1 | 27_output-boundaries §2。JSONを一般利用者へ扱わせない理由と禁止、KML/Sheets/PDF境界を保持。CSV/Excel帳票も維持 |
| §1.2.2 | dips-flight-plan/25c §5へ移管（DIPS担当と協働）。送信直前serialize、API経路限定、内部監査snapshot、端末/Drive出力禁止を保持。未確認endpoint例は確定仕様と扱わない |
| §1.3 | 25c §1.2/§5およびdomain-model/12d §4/§7。全方式の意味論的不変snapshot、lockForSubmission、元属性、手動支援/Sheets用途、API時のみnullable exact JSON、内部永続化JSONとファイル出力の区別を保持。型と利用側を分離し旧図は同情報を流れ図へ整理 |
| §2 | 27a §1。1計画1KML、通報不要計画対応、Folder/Placemark/ExtendedDataのXML全例。例の地名だけ架空化 |
| §3 | 27a §2。POLYGONリング、CIRCLE36/72分割例と中心半径、BUFFERED_LINE中心線/帯Polygon、実装時精度決定を保持。一般Geometryは17を参照 |
| §4 | 27a §3。計画16属性行・実績3分類・非原本性を保持。属性カタログと実出力プロファイルを明確に区別 |
| §5 | 27a §4。初回→運航→最終生成の全図、計画Identity、監査原本の所在を保持。Drive版管理方針は27bへ移管 |
| §6 | 27b §1。ExportDestinationConfig全型、設定UI全図、自動保存2トリガー、非同期SyncQueueを保持 |
| §7 | 27a §5。命名、サニタイズ、NoLocation、短縮ID、複数日保持を保存。短縮ID衝突対処とMINIMAL_MAP全出力範囲を補足 |
| §8 | 27c §1。Driveから手動importフロー、1計画1地図の共有・集中回避・後続軌跡重畳の理由を保持。全項目自動展開の未検証保証を除き確認手順化 |
| §9 | 27d §1/2。計画/実績/GPS軌跡3層図、メーカー依存排除、原本ログ、ImportPort、ActualFlightTrackを保持。KMLユーザー出力/GeoJSON内部変換を区別 |
| §10 | 27_output-boundaries §3。ポート図、二重入力禁止、両方向失敗時の独立ステータス全文を保持 |
| §11 | 27a §6。PRIVATE_FULL/SHARE_SAFE/MINIMAL_MAP全表・既定SHARE_SAFEを保持。属性候補・ファイル名にも除外規則を適用 |
| §12 | 27c §3。PENDING-MYMAPS-01〜06のID・題・本文全件を保持。公式仕様と未実機検証を分離 |
| §13 | 27_output-boundaries §4。C1禁止、中立Geometry、UUID、表示/Drive metadata分離、現在はC8（C5.x案は履歴）、C1/C2/C4を妨げない範囲を保持 |

他文書からの移管も照合しました。旧15の手動支援16表示フィールドと旧24の10コピー領域は25b、旧26の関係者分離は12a、旧26のGeometry型は17、旧25のInsurancePolicy全21属性は12d、旧25の法的通報要否9条件は13cへ移管しています。

保持検査では旧12の属性識別子154種類、旧24のA〜AE全31列、旧25のNo.1〜88全行・公式側5列、要件型23属性、InsurancePolicy21属性を照合し、未検出0件でした。旧27のXML例は架空地名への変更以外一致、設定型・計画属性16行・privacy profile3種・My MapsのPENDING6件も保持しています。PENDING-WEB-01〜11と旧25の個別PENDING-01〜05を保持し、旧PENDING-06〜12は元々集合参照だったことを明記しました。

訂正対象だった重複定義・矛盾する表現は下記の理由に基づいて移管先へ統合しました。基準コミットの本文と本対照から元の検討経緯を追えます。照合した章・属性・表・PENDINGの範囲で、意図しない欠落は検出されませんでした。

## 5. 設計整合の訂正とADR

| 対象 | 訂正結果と根拠 |
|---|---|
| ADR状態 / Model D | ADR-0002第3節の承認待ち残存だけを意味不変訂正し、履歴根拠と訂正注記を追加。11はAcceptedのModel Dへ整合 |
| BAT個別Sheet / 上限 | 旧アプリの個別Sheetや2機・7本・5/6飛行は履歴/初期例として保持。現設計は正規化Flight/BatteryUsage台帳と個体別射影、機数/本数/飛行回数の固定上限にしない |
| JSON退避 | ADR-0008でユーザー向けJSON backup/export/importだけを部分置換。14/19/12f/22/要件を整合。KMLによるDB復旧は禁止、全量復旧方式はPENDING |
| MapLibre固定 | ADR-0009でADR-0001のMapLibre固定部分だけを部分置換。17/20/23/14はC5開始時の実機評価へ留保。今回ライブラリ選定なし |
| Geometry | 17だけを中立型の正本としPOLYGON/CIRCLE/BUFFERED_LINEを統合。名前付き緯度経度、片側距離、面積派生値、高度との関係を保持。API/GeoJSON/KMLはAdapterで変換 |
| API required | 00_goal/03/Adapter/ロードマップをC6 Manual第一級・C7 Optionalへ統一。圏外準備とDIPSへの実通信、通報記録と登録確認を区別 |
| Phase / source | C0 Shell構築完了、C0受入・GO待ち、C1未着手に入口を統一。20は現C0 Vanilla TypeScriptを根拠にApp.tsとし、将来Sheets/Drive/DIPS/Map/出力を分離 |
| ADR-0000 | 独立ファイルがあるような表示を除去。decisions README内の運用決定として説明 |
| 状態と権威 | Mission/Flight状態、Submission状態、Entity.sync_status、SyncJob.statusを分離。11の権威フローを別の保存FSMとして扱わない。飛行済み中断を飛行0回ABORTEDへ落とさず、DIPS例外の図の省略範囲を明示 |
| 保存・台帳 | 不変snapshotと更新可能metadataを区別。台帳の計画列と確認/同期列の由来を訂正。Submissionに対する複数Missionを代表ID1個へ切り捨てない |
| Manual確認・取消 | 番号nullの一覧照合を正式経路として維持。共通取消は内部Submission起点、API固有外部IDはAPI契約に閉じる |
| 入力・離陸判定 | 必須条件未確定をReadyにしない。自動補完値も検証する。既存「150m以上」と例の不一致、未確定の非該当扱いを訂正。新法令判断はしていない。実際の離着陸記録は拒否しない |
| 帳票・出力・復旧 | 帳票図の連続運航区間を補完。KML生成の現PhaseはC8、C5.xは旧代替案。My Maps全情報表示やSheetsからDB全量復旧の未検証保証を除去 |
| ID・監査schema | 共通UUID原則の既存例外（AppSettingキー/互換表キー）を保持。実操縦者・点検日時/FK・操作アカウント・Battery状態対応の未接続schemaはPENDINGへ追跡 |

[ADR-0008](../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) はADR-0003の利用者向けJSON退避部分とADR-0001の同一退避条項だけをPartially Supersedesします。IndexedDB、永続化要求、監視、Sheets確定台帳、Model Dは維持します。[ADR-0009](../decisions/ADR-0009-map-renderer-selection-deferred-to-c5.md) はADR-0001の地図ライブラリ固定だけをPartially Supersedesします。いずれも今回のオーナー指示に基づく限定変更であり、新しい復旧形式やライブラリを決定しません。

ADR-0001/0003/0004/0005/0006/0007は基準コミットとバイト一致、**ADR-0003の直接変更はありません**。過去本文のProposal等の扱いと後続決定の優先範囲は [ADR README](../decisions/README.md) に明示しています。

## 6. 実画面成果の正式要件化と支援原則

26の14観測領域から、登録済機体/操縦者Picker、目的/空域/飛行方法の複数checkbox、数値/日時、構造化保険、許可情報選択、地図3形状、連絡先の選択元と操縦者の分離、通報操作主体と実操縦者の分離、複数日への拡張を正本へ反映しました。対応は [25b](dips-flight-plan/25b_manual-web-mapping.md)、関係者は12a、計画は12d、Geometryは17に集約しています。観測だけでAPI対応・法的代理権限を確定していません。

支援原則の唯一の正本は [25 overview §1](dips-flight-plan/25_overview.md#1-dips-submission-assistance-principle通報入力支援原則) です。採用文言の記録として、その中心文を引用します。

> 本アプリはDIPSそのものの完全複製を目的とせず、利用者が既に入力・選択したFlightPlan、Master、Preset、Permission、InsurancePolicy、Personnel、Aircraftを最大限再利用し、DIPS通報時の再入力・判断・画面往復を最小化する。

標準経路はMaster/Preset/FlightPlanから不変snapshot、Manual Assistance ViewModelを経てDIPS Webで必要最小限の選択・入力・確認を行い、通報確認記録を残すものです。ユーザーにAPI JSONの表示・作成・保存・コピーを要求しません。APIが正式利用可能になった場合のみ同じsnapshotからAPI Mapper経路を追加し、FlightPlan・現場運航を作り直しません。

| 形式 | 最終境界（詳細は[27](output/27_output-boundaries.md)） |
|---|---|
| JSON | DIPS API内部transport。内部snapshot直列化とユーザー向けファイル出力を混同しない |
| KML | 地理表示・共有用。full database backupではなくDB復旧の代替にしない |
| Sheets | Model Dに従う同期済み確定台帳・長期外部保管。未同期データの保管保証ではない |
| PDF | 人が読む派生帳票。CSV/Excelの帳票・分析用途も維持 |

## 7. 最終READ ONLY監査と機械検査

担当編集後に全docsを再読し、Domain担当がDIPS、DIPS担当が要件/入口、Output担当がDomain/状態/台帳を独立に照合しました。見つかった不一致は訂正後に再確認しています。以下の判定は文書構造・整合を対象とし、将来実装や外部サービスの実機動作が検証済みという意味ではありません。

| 評価項目 | 判定 | 確認根拠 |
|---|---|---|
| 責務分離 | PASS | 領域別正本と外部境界を分離 |
| docs分割 | PASS | 12/13/24/25/27の移行対照、既存情報保持 |
| 保守性 | PASS | Responsibility Checkの6観点、2つ以上の分離条件と定期レビュー |
| セキュリティ境界 | PASS | 16/BFFと出力profile、Domainにcredentialを持ち込まない |
| API非依存性 | PASS | Manual・計画・現場運航がAPI資格に依存しない |
| Manual DIPS第一級設計 | PASS | 24/25bの標準経路と番号なし一覧照合 |
| C7 Optional境界 | PASS | 23/15/25c、C7を省略できる完成経路 |
| JSON/KML境界 | PASS | ADR-0008と27。KMLをDB復旧に使わない |
| Data Authority | PASS | 11のModel D Accepted、別軸の状態を区別 |
| Sheets normalisation | PASS | 24aの正規化台帳、Battery個別物理Sheetを作らない |
| Geometry | PASS | 17の3形状のみが型正本 |
| Actor/Pilot/Contact分離 | PASS | 12aの関係者、操作監査の未接続型はPENDING |
| Offline/Fault isolation | PASS | 14/19、外部失敗で運航・記録を停止しない |
| ADR整合 | PASS | 0008/9の限定置換、0002意味不変訂正、保護6冊一致 |
| Phase整合 | PASS | C0構築完了・受入/GO待ち・C1未着手 |
| README整合 | PASS | 全入口と5領域READMEの責務/読む順番を確認 |
| Index整合 | PASS | 総合目次から76文書へ到達 |
| broken links | PASS | 相対ファイル/見出しリンク不在0 |
| stale files | PASS | 旧5冊は意図した移行案内。比較/監査は履歴区分 |
| duplicate authority | PASS | architecture概念対応表、重複完全定義を正本参照へ統合 |
| Markdown syntax | PASS | 表・見出し番号・fence機械検査と図の静的点検 |
| privacy | PASS | staged 70文書を走査・差分目視。検出1件は匿名サンプルと確認しSAFE判定 |

最終検査の実測結果:

- 全76 Markdown、総合目次からの到達76/76、相対リンク先・見出しanchorエラー0。
- Markdown parserで64表・50 code fenceを処理。表の列数・見出し番号・fence均衡エラー0、`git diff --cached --check` エラー0。
- Mermaid 3ブロックは全文を静的点検し、ER/FSM本文と照合。専用parser・実レンダーは未実施です。図で省略する障害例外は参照先を明示しました。
- 変更は文書70件（既存39、新規31）、削除0。実装ファイル変更0。保護対象ADR 6冊は基準コミットとバイト一致。
- 指定旧語彙は全文検索し、現行・履歴・初期例・PENDINGを文脈で区別。旧語が存在することだけをFAILとせず、現行要件に誤読できる箇所を訂正しました。
- 公開対象はstagedの70 Markdownだけで、バイナリ・読取不能・未検査添付はありません。自動privacy検査の候補1件は25bの氏名欄にある匿名例「操縦者A」であり、前後の架空UI例を読みSAFEと判定。認証キー名などの説明と実値を区別し、サンプルの実名・連絡先・実登録記号、個人端末パス、非公開URLの新規混入は検査範囲で見つかりませんでした。KMLの既定SHARE_SAFEも保持しています。

検査記録の範囲は全Markdown、相対ファイル/見出しリンク、総合目次からの到達性、見出し番号、表列、code/diagram fence、既存ADR保持、指定旧語彙、差分範囲、公開対象のprivacyです。外部URLの一括生存確認、DIPS実API、実My Maps import、iPhone/Android受入、法令の新規適法性評価は未実施です。

## 8. 後続Phaseに残すWARNと停止条件

| WARN | 次の判断時点 |
|---|---|
| C0のiPhone/Android受入とオーナーGO | C1開始前 |
| 中立意味キー辞書、Geometry旧名統合、状態永続化表記、catalogとEntity対応 | 該当C1 schema/type固定前 |
| Flightごとの実操縦者、点検のMission参照/日時、UserAccount操作主体の監査、Battery業務状態との対応 | 該当C1 schema/type固定前。要求は維持し、推測で型を確定しない |
| Sheets全snapshotの容量超過時保管/復元・複数Mission物理表現 | C4前。部分保存で同期済みと扱わない |
| 地図ライブラリの実機選定 | C5開始時 |
| DIPS Web既存未確認、API資格・操作別公式契約・版別変換 | C6/C7の該当実装前。C7はOptional |
| 全DB backup/restoreの形式・範囲・暗号化・復旧試験 | ADR-0008に従い整理、C9本番判定前。C1でJSON機能を追加しない |
| My Maps実表示、Drive更新/版管理、機体ログ形式 | C8/将来拡張 |

この監査の完了はC1開始承認ではありません。今回の文書をcommit/pushして報告した後、C1未着手のまま停止します。終了SHAとpush結果は当該コミットのGit記録および完了報告で示し、本書へ自己参照するSHAを埋め込みません。
