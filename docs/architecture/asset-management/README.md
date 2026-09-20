# 機材の取得・共用・管理履歴

最終更新: 2026-09-20\
対象: 99.2再移植Step 3（§4、および取得時確認・点検整備Actorに直接必要な§6の部分）と、2026-09-20のBAT管理設計の更新（32d〜32g）

本領域は機材管理の意味・因果・条件の詳細正本である。型式・個体・互換の属性定義は[12b](../domain-model/12b_aircraft-and-battery.md)、運航・整備Entityは[12e](../domain-model/12e_operation-inspection-maintenance.md)に残し、ここで物理schemaを追加しない。

| 文書 | 唯一の詳細責任 | 他領域との境界 |
|---|---|---|
| [32a 機体取得と累計](32a_aircraft-acquisition-and-cumulative-time.md) | 新品・中古、取得前履歴不明と管理開始後累計、00:00の理由、後日判明する記録 | 12bは属性、11は台帳権威、22は旧データ移行 |
| [32b BAT共用と取得履歴](32b_battery-sharing-and-acquisition-history.md) | 型式と個体、共用と表示、取得時観測と取得後履歴、Flightと非飛行イベント | 12bはEntity、18は出力。実物のタブは最終schemaではない |
| [32c 取得時確認と点検整備Actor](32c_acquisition-check-and-maintenance-actors.md) | 取得時の短時間確認の記録意味、正式時間への算入判断、実施者と作成・転記者 | 12eは保持先、12fは共通監査、31cは通常運航Recorder |
| [32d BATの表示と状態の設計案](32d_battery-ledger-and-status-design.md) | 設計検討フェーズの設計案（NEW-PROPOSAL）。BATの一覧・詳細・交換時の選択、現在状態の見せ方、多数の機体・BATと複数ユーザー・組織での見せ方 | 適用範囲は32e、保存は32f、入力は32g、意味は32b、BAT交換の画面は35b §7。オーナー確認待ち |
| [32e BAT管理の適用範囲と飛行記録の区切りとの分離](32e_battery-management-scope-and-flight-separation.md) | BAT管理は機体単位の任意、OFFでも基本運用は完結、BAT管理と飛行記録の区切りの分離、新品・中古の起点、中古機導入時の点検との関係（2026-09-20のオーナー方針） | 個体の意味は32b、A4は35c、飛行の意味は35a、点検整備は32c／36。判断はADR-0029 |
| [32f BATの保存構造](32f_battery-storage-structure.md) | 共用機体系ごとに1Spreadsheet・1物理BAT＝1シート・総合台帳なし、機体別分割を退けた因果、1BATシートの構造案、Driveの現在状態の確認範囲 | Drive全体は37、内部schemaは12b／12e、最終保存は35d。判断はADR-0028 |
| [32g BAT使用開始・交換時の現場入力](32g_battery-field-input.md) | 入力を管理ラベル・サイクル数・状態確認・備考の4項目に絞った因果、自動記録する値、状態確認の候補 | 画面は35b §7、保存は32f、適用範囲は32e。判断はADR-0029 |

[architecture正本表](../README.md#3-主要概念の正本) → 本README → 対象文書の順に読む。[ADR-0017](../../decisions/ADR-0017-asset-acquisition-history-and-cumulative-scope.md)は判断の要約と見直し条件、[Step 3監査](../../migration/99-2-step-3-causal-audit.md)は移管対応・証拠・検査の索引であり、設計理由をそこだけに置かない。

状態は[7分類規約](../../guidelines/03_design-evidence-and-causality.md)に従う。CURRENT-ACCEPTEDは変更可能な設計ベースラインであり、ADR承認・実装完了・今回の実物再確認を意味しない。実例の2機・7本や具体機種を固定仕様にしない。

§3・§5・§6の保存構造／通常整備運用・§7以降は今回未移植。旧Docsとそれらの後続論点との相違を本Stepで解消しない。C1未着手、依存する物理schema・画面・保存の確定は[23の開始ゲート](../23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)に従う。

上記はStep 3の範囲。Step 6の§6残りは[36](../maintenance-storage/36_aircraft-maintenance-records.md)、保存全体は[37](../drive-structure/37_environment-storage-responsibilities.md)。32a〜32cは累計・取得確認・Actorの詳細正本を維持する。
