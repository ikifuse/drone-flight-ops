# アーキテクチャ設計目次

最終更新: 2026-09-23\
状態: Phase B設計凍結 / C0 Shell構築完了・C1設計準備完了 / C1未着手（C0受入確認・オーナーGO待ち）

## 1. 本目次の役割と読み順

[総合目次](../00_index.md)から本書へ進み、対象領域のREADMEと正本詳細文書を読みます。ここには仕様本文を複製せず、責務・正本・状態・履歴を案内します。C1ではまずDomain READMEから必要なschema/typeへ進みます。採用根拠と部分置換は [ADR一覧](../decisions/README.md)（ADR-0001〜0007、追加ADR-0008/0009）を参照してください。

## 2. 現行設計の入口

99.2再移植は[Step 1（§0・§1）](../migration/99-2-step-1-causal-audit.md)、[Step 2（§2）](../migration/99-2-step-2-causal-audit.md)、[Step 3（§4と§6の取得確認・点検整備Actor部分）](../migration/99-2-step-3-causal-audit.md)、[Step 4（§7のDIPS API基盤・固定IP・通信境界）](../migration/99-2-step-4-causal-audit.md)、[Step 5（§3と§7の正常受付後・共有リスト限定部分）](../migration/99-2-step-5-causal-audit.md)、[Step 6（§5・§6残り・§10）](../migration/99-2-step-6-causal-audit.md)、[Step 7a（§7の実画面確認・共通Geometry・submission_snapshot・Manual／API経路・DIPS対象外）](../migration/99-2-step-7a-causal-audit.md)、[Step 7b（§7の06の記録責任・作業台帳・取消／リスト整理の境界）](../migration/99-2-step-7b-causal-audit.md)、[Step 7c（KMLの位置づけ・単位・生成契機・内容・再送）](../migration/99-2-step-7c-causal-audit.md)、[Step 7d（PDFの役割分離・生成契機、飛行履歴・出力の画面）](../migration/99-2-step-7d-causal-audit.md)、[Step 7e（§9の正本・端末cache・時点分離・費用の境界）](../migration/99-2-step-7e-causal-audit.md)、[Step 8（§11の差分監査）](../migration/99-2-step-8-diff-audit.md)まで。人物領域はidentity-and-access、機材取得・共用・履歴の因果はasset-managementへ配置する。現在の目的・設計順序は[00_goal](../00_goal.md)、依存実装の開始条件は[23](23_implementation-roadmap.md)。他の詳細領域は基準設計を保持し、Step 4の経路・通信安全の因果はdips-infrastructure、秘密／認証候補は16。Step 5の画面因果はpresentationに配置する。Step 6の詳細因果はoperation-recording／maintenance-storage／drive-structureへ配置。Step 7aの因果は[25e](dips-flight-plan/25e_common-source-and-submission-boundaries.md)、実画面の証拠系列は[26](26_dips-web-ui-verification.md)へ配置し、判断はADR-0023（Proposed）に要約した。Step 7bの因果は[24b](dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)へ配置し、06の作業台帳と履歴・証跡の分離をADR-0022（Proposed）へ追補した。Step 7cの因果は[27e](output/27e_kml-generation-timing-and-content.md)へ配置し、判断をADR-0024（Proposed）に要約した。Step 7dの因果は[27f](output/27f_derived-pdf-roles-and-map-pdf.md)と[34e](presentation/34e_history-and-output.md)へ配置し、判断をADR-0025（Proposed）に要約した。Step 7eの因果は[sync-and-cache](sync-and-cache/README.md)の38a・38bと[37 §6](drive-structure/37_environment-storage-responsibilities.md#6-保存の所有と費用の境界)へ配置し、判断をADR-0026・0027（Proposed）に要約した。§11の差分監査はStep 8で実施し、旧案の残存と回収項目の所在を確かめた（未確定は各正本のPENDING／VERIFY）。

| 入口 / 文書 | 主責務・読む場面 |
|---|---|
| [domain-model README](domain-model/README.md) | ER・領域別Entity・共通ライフサイクル/ID/監査。C1型・schema実装の入口 |
| [identity-and-access README](identity-and-access/README.md) | 人物・アカウント・環境、三層権限、運航担当、所属終了の詳細因果と未確定 |
| [asset-management README](asset-management/README.md) | 機材取得・BAT共用・累計の意味・取得確認と点検整備Actorの因果、BAT管理の適用範囲・保存構造・現場入力（2026-09-20）、登録機体とBAT共用グループの関係 |
| [dips-infrastructure README](dips-infrastructure/README.md) | DIPS API固定出口・限定バックエンド、Manual独立・結果不明時retryの因果 |
| [presentation README](presentation/README.md) | 10項目規約、初回・ホーム4入口・共有飛行リスト・正常受付後・飛行履歴・出力の因果と画面仕様、機体管理の入口と対象機体の表示責任 |
| [operation-recording README](operation-recording/README.md) | 柔軟な1飛行・通常画面・A4最新実物と生成・最終保存の因果 |
| [maintenance-storage README](maintenance-storage/README.md) | 日常点検から分離した機体別整備媒体・原本コピー |
| [drive-structure README](drive-structure/README.md) | 旧配置から01〜07、内部正規化と人間向け媒体、物理配置PENDING、保存の所有と費用の境界（37 §6） |
| [sync-and-cache README](sync-and-cache/README.md) | 共有正本と端末cache・正本確認・確定／保存／外部反映の時点分離（§9） |
| [state-machines README](state-machines/README.md) | Operation FSM / DIPS FSM / 法令・安全総合評価。C2/C6/C7の独立状態管理 |
| [dips-submission README](dips-submission/README.md) | Manual通報業務と独立Sheets台帳、06の記録責任と作業台帳（24b）。C4/C6の境界 |
| [dips-flight-plan README](dips-flight-plan/README.md) | 公式88項目、Manual Web UI、C7 payload、要件エンジンの責務分離、共通の源とManual／API・DIPS対象外の境界の因果（25e） |
| [output README](output/README.md) | JSON/KML/Sheets/PDF境界、KML生成、KMLの生成契機・内容・単位（27e）、派生PDFの役割・生成契機（27f）、Drive保存、My Maps操作、将来機体ログ |
| [10_system-boundaries](10_system-boundaries.md) | システム間責務・障害境界・将来ネイティブ拡張ポート |
| [11_data-authority](11_data-authority.md) | Model Dのライフサイクル別権威・確定台帳・手修正保護 |
| [14_offline-and-sync](14_offline-and-sync.md) | オフライン成立条件・Storage保護・SyncQueue・再試行 |
| [15_dips-adapter](15_dips-adapter.md) | Manual / Mock / Optional APIの共通Adapter・DRS/FPA/FPR・結果不明照合 |
| [16_security](16_security.md) | BFF・秘密情報・セッション・マスキング・開示境界 |
| [17_map-and-airspace](17_map-and-airspace.md) | 中立Geometry・地図層・編集・空域情報・データ鮮度・ライブラリ留保 |
| [18_reports](18_reports.md) | 帳票生成パイプライン・射影・発行記録・法令UI分離。A4詳細は35c |
| [19_failure-recovery](19_failure-recovery.md) | 障害分類・業務継続・復旧できる範囲・未決の全DB復旧 |
| [20_source-structure](20_source-structure.md) | C0実装との関係・将来source責務配置・依存方向 |
| [21_testing-strategy](21_testing-strategy.md) | 単体/統合/実機の検証境界・Manual/API別シナリオ |
| [22_migration-plan](22_migration-plan.md) | 旧GAS非破壊移行・Shadow Run・資産継承・切替/復帰 |
| [23_implementation-roadmap](23_implementation-roadmap.md) | C0〜C9の範囲・受入基準・C7スキップ経路・現在の停止位置 |
| [26_dips-web-ui-verification](26_dips-web-ui-verification.md) | OBSERVED / OFFICIAL_SPEC / INFERRED / PENDINGを保つ実画面の証拠資料。PC版・スマホ版の証拠系列と回収範囲を含む |
| [28_c1-docs-restructure-audit](28_c1-docs-restructure-audit.md) | 今回の全docs責務監査・移行対照・整合修正・最終検査記録 |

設計の基準は確定でも、PENDINGは未解決です。26番は証拠資料であり、現行型・UI契約は上表の対応する設計正本に置きます。

## 3. 主要概念の正本

| 概念 | 唯一の詳細正本 | 他文書で扱う範囲 |
|---|---|---|
| 記入支援の目的・優先対象 | [00_goal §1.1](../00_goal.md#11-記入支援を中心に置くまでの因果) | 18/Domainは利用上の参照 |
| 保存・出力確認と依存実装の開始ゲート | [23 §1.2](23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート) | ADR-0015は選択理由、21は検証との接続 |
| 設計因果・7状態・試作証拠・質問境界 | [設計証拠規約](../guidelines/03_design-evidence-and-causality.md) | 移植監査は対象と移管先の記録のみ |
| 画面仕様の記録10項目 | [30](presentation/30_screen-specification-standard.md) | 個別画面は規約を適用し本文を複製しない |
| 内部設計用語と利用者表示文言の分離（規約）／利用者向け表示名の対応表／設計確認用モックの左右の役割と未決事項の扱い | [30 §4](presentation/30_screen-specification-standard.md#4-内部設計用語と利用者表示文言の分離)（規約）／[30 §5](presentation/30_screen-specification-standard.md#5-設計確認用モックの左右の役割と未決事項の扱い)（モックの左右の役割）／[34h](presentation/34h_user-facing-wording-and-terminology.md)（対応表・文言の型・§9置き場所の表） | 各画面文書は規約を適用。内部の概念・責務分離は31a・31bのまま。19は失敗表示の型を参照 |
| 初回導線（直接はじめの登録）・ホームの環境ボタン／シート・作成／参加・root再発見・通常起動・DIPSログイン情報の登録方針（保存方式は未決） | [34a](presentation/34a_setup-and-environment-entry.md)（§8はDIPSログイン情報。秘密情報の境界は[16 §10](16_security.md#10-利用者自身のdipsログイン情報2026-09-22方針のみ)） | 人物・環境・権限は31a〜31d。表示名は34h。物理方式は未確定 |
| ホーム4入口・画面→保存責任の接続 | [34b](presentation/34b_home-and-navigation.md) | 各領域は到達先。Drive全体構造の追加正本を作らない |
| 共有飛行リスト・カード5系統・対象選択 | [34c](presentation/34c_shared-flight-worklist.md) | 24aは提出履歴保存。画面カードへ列全体を複製しない |
| API正常受付時の掲載・後で飛行する・通報内容確認 | [34d](presentation/34d_dips-accepted-and-plan-content.md) | 13bはFSM、33bは通信安全、取消／重複調整の詳細は対象外 |
| FlightAreaGeometry | [17](17_map-and-airspace.md) | 12は型参照、25cはDIPS変換、27aはKML変換。共通の源とする因果は25e |
| Organization / Client / Project | [12a](domain-model/12a_organization-and-personnel.md) | OperationalEnvironmentとの未確定対応は31a |
| Personnel / GoogleIdentity・UserAccount / OperationalEnvironment / Membership / Qualifications | [31a](identity-and-access/31a_person-account-and-environment.md) | Domainは概念とschema未決の参照、Presentationは環境表示を参照 |
| 業務役割・アプリ機能・Google実アクセス / アプリ管理者 | [31b](identity-and-access/31b_roles-and-access-control.md) | 16は秘密・認証、Driveは保存処理。権限の二重正本を作らない |
| Pilot / Submitter・SubmissionActor / Recorder / Assistant / 日常点検実施者 / Contact境界 | [31c](identity-and-access/31c_operational-actors.md) | 12d/12eは保持先、18は帳票射影、25bは選択UI、26は観測 |
| 所属終了・離任履歴・再所属 / 物理所有の未確定 | [31d](identity-and-access/31d_membership-lifecycle.md) | 12fは共通Lifecycle・Audit、Google共有は31b |
| AircraftModel / Aircraft / BatteryModel / Battery / Compatibilityの属性 | [12b](domain-model/12b_aircraft-and-battery.md) | 取得・共用の詳細因果は32a/32b、18/24aは射影・外部保存 |
| 機体取得前履歴・管理開始累計・後日継承の意味 | [32a](asset-management/32a_aircraft-acquisition-and-cumulative-time.md) | 12bは属性、11は権威、22は移行への参照 |
| BAT共用・セット表示・取得時状態・個体履歴の意味 | [32b](asset-management/32b_battery-sharing-and-acquisition-history.md) | Flight / BatteryUsage属性は12b/12e、物理配置は未確定 |
| 取得時確認の算入判断・点検整備実施者と作成／転記者 | [32c](asset-management/32c_acquisition-check-and-maintenance-actors.md) | 12e/12fはEntity・監査、通常運航Recorderは31c |
| Location / Preset / Template | [12c](domain-model/12c_location-and-presets.md) | 17はGeometry参照、25は再利用方法 |
| FlightPlan / DipsSubmission / semantic snapshot | [12d](domain-model/12d_flight-plan-and-dips.md) | 状態全値は13b、API電文は25c、24aは台帳への保存。Snapshotを必須とする因果は25e |
| 柔軟な1飛行・内部明細・機体交代境界 | [35a](operation-recording/35a_flexible-flight-and-details.md) | 12eは旧schema候補とPENDING。意味を帳票枠から逆算しない |
| 通常運航の画面と途中入力 | [35b](operation-recording/35b_normal-operation-and-final-save.md) | 13aは論理状態、34dは入口 |
| A4実物・機体個体別保存・次空き連番・特殊競合の非採用・必要時PDF | [35c](operation-recording/35c_a4-operation-record.md) | 18は生成技術、37は配置要約。実物観測とオーナー追加判断を区別 |
| 運航全体の最終確定・更新責任・再送要件 | [35d](operation-recording/35d_operation-finalization-and-write-boundary.md) | 11／14は共通権威・同期。§9全体は未移植 |
| 機体別整備Spreadsheet・原本コピー | [36](maintenance-storage/36_aircraft-maintenance-records.md) | Actorは32c、通常日常点検は35b |
| Driveの01〜07責任と変遷・媒体境界 | [37](drive-structure/37_environment-storage-responsibilities.md) | 各領域は詳細記録、27bはKML保存のみ。保存の所有と費用の境界は§6（判断はADR-0027） |
| Mission / Flight / Inspection / Maintenanceの属性候補 | [12e](domain-model/12e_operation-inspection-maintenance.md) | 意味・因果は35a／36、13aは状態、18は射影 |
| 共通Lifecycle / ID / AuditEvent | [12f](domain-model/12f_common-lifecycle-id-and-audit.md) | 各領域は利用する監査イベント・制約だけ |
| Operation FSM | [13a](state-machines/13a_operation.md) | Missionのデータ項目は12e |
| DipsSubmission status / lifecycle | [13b](state-machines/13b_dips-submission.md) | DipsSubmissionの保存schemaは12d |
| DipsReportingRequirement / TakeoffReadinessAssessment | [13c](state-machines/13c_takeoff-readiness.md) | 25dの入力完備性と混同しない |
| DipsFieldRequirement / validation / SUBMISSION_READY | [25d](dips-flight-plan/25d_requirement-validation.md) | 25aは公式カタログの要約タグ |
| DIPS No.1〜88 | [25a](dips-flight-plan/25a_field-catalog.md) | API操作ごとの未精査箇所はPENDING |
| Manual DIPS業務 | [24](dips-submission/24_manual-submission.md) | 15はAdapter呼出、25bは画面・ViewModel |
| Manual Web mapping / Assistance ViewModel | [25b](dips-flight-plan/25b_manual-web-mapping.md) | 24は通報記録フローのみ |
| DIPS Submission Assistance Principle | [25 overview](dips-flight-plan/25_overview.md) | 要件と24は要約/リンク |
| 共通の源（FlightPlan・Geometry・不変Snapshot）とManual／API・DIPS対象外の境界の因果・却下案・再検討条件 | [25e](dips-flight-plan/25e_common-source-and-submission-boundaries.md) | 型は17／12d、原則は25 overview、電文は25c、通報要否は13c。判断の要約はADR-0023 |
| DIPS実画面の証拠系列・観測・確認待ち | [26](26_dips-web-ui-verification.md) | 採用した設計要件は25b／25e。観測をDIPS内部仕様の事実へ拡張しない |
| Data Authority | [11](11_data-authority.md) | 台帳/同期/出力はこの権威分担に従う。共有マスター・リストのcacheは38a |
| SyncQueue | [14](14_offline-and-sync.md) | 各Adapterは対象ジョブ・失敗処理を参照。確定・保存・外部反映の時点分離は38b |
| 共有データの正本と端末cache・cacheの捨て方・正本確認の時点・offlineの意味・同期状態の判断の方向 | [38a](sync-and-cache/38a_shared-source-and-device-cache.md) | 権威は11、キューは14、画面は34a／34c、リスト整理の意味は24b。判断の要約はADR-0026 |
| 計画確定・逐次保存・最終送信の時点分離・未同期の保持・中央SyncQueue／監査の未確定 | [38b](sync-and-cache/38b_confirmation-and-sync-timing-separation.md) | 各時点の詳細は25e／35b／35d／27e、キューは14。判断の要約はADR-0026 |
| Sheets Ledger | [24a](dips-submission/24a_submission-and-sheets-ledger.md) | 12にSheets列を重複定義しない |
| 06の記録責任・人が見る作業台帳と内部の履歴・証跡の分離・取消と作業リスト整理の意味 | [24b](dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md) | 履歴schemaは24a、画面は34c／34d、取消の状態は13b。判断の追補はADR-0022 |
| DIPS API JSON | [25c](dips-flight-plan/25c_api-payload-mapping.md) | 通信Adapterは15、27は内部transportという境界のみ |
| 出力・復旧の形式境界 | [27](output/27_output-boundaries.md) | ADR-0008は決定理由、全量restoreはPENDING |
| KMLの形式・Geometry変換・命名・共有プロファイル | [27a](output/27a_kml-export.md) | 生成契機・内容・単位は27e、Drive/My Mapsは保存・利用のみ |
| KMLの位置づけ・単位・生成契機・未同期の保持と最後の送信時の再送・内容の確定境界 | [27e](output/27e_kml-generation-timing-and-content.md) | 形式は27a、保存は27b、キューは14、最後の送信は35d。判断の要約はADR-0024 |
| 派生PDF（A4運航記録PDF・地図付きPDF）の役割分離・必要な時だけ生成する方針・地図付きPDFの配置の方向 | [27f](output/27f_derived-pdf-roles-and-map-pdf.md) | A4の実物・生成単位は35c、生成技術・発行記録は18。判断の要約はADR-0025 |
| 飛行履歴・出力の画面（検索・選択・出力への導線） | [34e](presentation/34e_history-and-output.md) | 入口は34b、出力の内容・生成契機は27e／27f、A4は35c |
| BAT管理を使う範囲（機体単位の任意）・飛行記録の区切りとの分離・新品／中古の起点 | [32e](asset-management/32e_battery-management-scope-and-flight-separation.md) | 個体の意味は32b、A4は35c、飛行の意味は35a、点検整備は32c／36。判断はADR-0029 |
| BATの保存構造（共用機体系ごとの1Spreadsheet・1物理BAT＝1シート・総合台帳なし） | [32f](asset-management/32f_battery-storage-structure.md) | Drive全体は37、内部schemaは12b／12e、最終保存は35d。判断はADR-0028 |
| BAT使用開始・交換時の現場入力（4項目）と自動記録 | [32g](asset-management/32g_battery-field-input.md) | 画面は35b §7、保存は32f、適用範囲は32e。判断はADR-0029 |
| BATの表示（一覧・詳細・交換時の選択）と状態の見せ方（設計案・オーナー確認待ち） | [32d](asset-management/32d_battery-ledger-and-status-design.md) | 属性・enumのPENDINGは12b、BAT交換の画面は35b §7 |
| 運用環境に属する機体・BAT、02の登録済み実機と、BAT共用グループとの使用関係（使用許可） | [32h](asset-management/32h_registered-aircraft-and-battery-group-relations.md) | 環境は31a、権限は31b、BATの意味は32b、保存は32f、機体の取得・累計は32a、画面は34g |
| 画面の並びと画面間の行き先の俯瞰、設計の到達範囲、未設計領域 | [34f](presentation/34f_screen-map-and-design-coverage.md) | 各画面の中身と遷移の正本は各画面仕様（34a〜34e・35b）。食い違えば各画面仕様が優先 |
| ［各種設定・管理］の機体管理の流れ、現在の運用環境の表示と対象機体の表示の責任 | [34g](presentation/34g_settings-aircraft-management-and-context-display.md) | 環境の表示条件は31a §4／34a §5、対象機体を扱う各画面は35b、関係の意味は32h |
| KML Drive Storage | [27b](output/27b_google-drive-storage.md) | 14はキュー共通契約、KML生成とは別 |
| My Maps | [27c](output/27c_google-mymaps-workflow.md) | 実アカウントの表示検証はPENDING |
| Aircraft flight-log import | [27d](output/27d_aircraft-flight-log-import.md) | 将来入力境界、Flight実績の自動確定ではない |
| 帳票生成技術 / ReportUnit / ReportSnapshot | [18](18_reports.md) | 12はEntity参照・FK、27は形式境界 |
| DIPS固定送信元IP・Google Cloud／Cloud NAT・限定バックエンド | [33a](dips-infrastructure/33a_fixed-egress-and-api-connection.md) | 10/15/23は参照。コンピュート・VPC経路はPENDING |
| API基盤の非依存・DIPS POST結果不明時の通信安全の因果 | [33b](dips-infrastructure/33b_api-availability-and-retry-boundaries.md) | 13bはFSM、14はキュー、19は障害対応、24はManual |
| Security / 旧BFF・Token候補と正式認証のVERIFY | [16](16_security.md) | 固定出口は33a、業務権限は31b、KML開示profileは27a |

## 4. 比較・監査の履歴

以下は当時の比較・監査記録です。本文の旧提案を現行契約として再採用しません。最新の採用範囲はADRと§2/§3の設計を読みます。

| 文書 | 保存する検討・証拠 |
|---|---|
| [00_b1-audit-and-corrections](00_b1-audit-and-corrections.md) | B1.3最終整合・事実訂正・当時の未確認事項 |
| [01_frontend-runtime-comparison](01_frontend-runtime-comparison.md) | PWA / Flutter / React Native / Capacitor / Native / GAS比較 |
| [02_backend-and-security-comparison](02_backend-and-security-comparison.md) | Workers / Firebase / Supabase / GAS等の費用・秘密境界比較 |
| [03_data-storage-and-sync-comparison](03_data-storage-and-sync-comparison.md) | ローカル・Sheets・クラウドの保存/権威候補 |
| [04_cost-and-operations-analysis](04_cost-and-operations-analysis.md) | 当時の規模・無料枠・費用・個人運用負荷の評価 |
| [05_recommended-architecture](05_recommended-architecture.md) | B1の第一候補・代替案・却下理由・見直し条件 |
| [09_b2-audit-and-corrections](09_b2-audit-and-corrections.md) | B2.1の状態・法令・認証・データモデル訂正履歴 |

## 5. 旧番号からの移行案内

旧文書はリンク履歴を保つための案内だけを残します。詳細仕様の追記先にせず、§2の領域READMEから正本へ進んでください。

| 旧入口 | 現在の領域 |
|---|---|
| [12_domain-model](12_domain-model.md) | domain-model |
| [13_state-machines](13_state-machines.md) | state-machines |
| [24_b2.2-dips-manual-fallback-and-ledger](24_b2.2-dips-manual-fallback-and-ledger.md) | dips-submission |
| [25_dips-flight-plan-field-mapping](25_dips-flight-plan-field-mapping.md) | dips-flight-plan |
| [27_output-kml-drive-and-mymaps](27_output-kml-drive-and-mymaps.md) | output |
