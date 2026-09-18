# 99.2 因果を保持する再移植 — Step 3 対照・監査

確認日: 2026-09-18\
対象: §4「機体・バッテリー・中古EVO Lite+」全体と、取得確認・点検整備Actorに直接必要な§6の部分\
役割: 移管対応・証拠・確認範囲・検査の索引。設計因果の詳細正本は32a〜32c。

## 1. 基準と対象境界

- 開始ブランチ: `redo/99-2-causal-migration`。開始HEAD / origin同ブランチ: `7130f690359d98fbc9505c1a1bc61902f6d8931c`。開始時working treeはclean。
- [Step 1](99-2-step-1-causal-audit.md)と[Step 2](99-2-step-2-causal-audit.md)は完了済み。再移植の基準`ea73d083f83f5bd58d9d78d930c0c860c038c849`と開始HEADにある12b／12e／12f等を比較する。
- main / origin/mainの保存対象: `6344d7a0816eef4adc69d2cbe948dbefa4352019`。旧mainのStep成果・ADR-0010〜0014をコピー・転用・cherry-pickしない。
- §3・§5・§6の残り・§7以降の移植、コード、Phase C1、Drive書込みは対象外。§6全体を移植したという状態表示をしない。

## 2. 証拠と確認範囲

| 証拠 | 今回の確認・限界 |
|---|---|
| ユーザー提供99.2原本 | §4の197〜238行を直接読解。全体SHA-256 `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358`、§4部分 `d669923a7ac91dccd31619a84d1339b24800ef8530ba77c9b3cbacc578a3d9f5`（UTF-8・元改行） |
| §6の限定抽出 | 下記の4断片だけを§4の因果へ接続。§6全体は境界識別のため読んだが、保存構造・通常整備運用は移植していない |
| 基準DocsとGit履歴 | 12b／12e／12f、11、18、22、23、24a、要件、ADR-0002／0007を照合。`0211a9a`の機体属性混在・BAT主所属から`5d51315`の型式／個体・N:M互換・非飛行イベント分離、`ea73d08`の領域分割まで確認 |
| 基準アプリの設計文書 | `ikifuse/autel-evo-lite-flight-log`のローカルcheckout `e8560b03e1220cb3b38e927190bdcb03191ddc57`。設計書06（機体・BAT・累計）と07（点検整備・管理開始）、関連する02の根拠入口を補助読解。旧v6の機能再操作やDrive実記録の再確認ではない。詳細因果・文書リンクは32a／32c |
| 過去エージェント履歴 | ctxの既存索引を更新せず、中古・管理開始・初期飛行時間等で検索。検索範囲では本判断の原操作を裏付ける該当結果なし。索引には49失敗単位があり、網羅的不在とはしない |
| 国交省公式の補助照合 | 2026-09-18、公式掲載入口から取扱要領の継承・整備記録と、ガイドラインの起算・完成検査・外部整備資料の範囲を確認。リンク・適用条件の限界は32a §3、32c §2・§3。99.2の実物確認や個別行政承認と区別 |
| 原本が挙げる実物 | 02機体、03共用BAT一覧・個体使用履歴、05取得確認、旧BAT_1〜BAT_7・BatteryUsageモック、旧99.1 §4、旧v6設定の実物・原操作は未再確認。各詳細正本のVERIFYに接続 |

§6から移管した断片は以下。行番号とhashは原本照合用で、非公開値そのものは公開しない。

| 原本位置 | 取り込む意味・移管先 | SHA-256（元UTF-8・改行込み） |
|---|---|---|
| 319行の「コピー後のシートは」より後の文末部分のみ | Drive編集権限者による実態どおりの記入／転記。32c §3 | `70b79bd373a2e1dd34a236551dd2bfcf203f0acca78ae70123de0c85c5dc5ae1` |
| 320行 | 実施者と原本コピー者／転記者を同一に固定しない。32c §3 | `ffacf5c7314f86238d31f27c6bbefc029bfaf00b7a0f9dc9e158a5c94e37d497` |
| 321行 | 外部業者の入力を要求せず資料から転記し、両者を区別。32c §3 | `f314e0da39dd934c76d8a607560ce895a9e8b4d61e57a88b389cc764d17234db` |
| 326行 | 取得確認・正式時間不算入・管理開始・低使用歴評価・推定加算しない因果。32a／32b／32cへ責任分配 | `0da0552d021e54d180ce8b966ef2c50c7930ead0964045c9bc74f7446fa8b109` |

319行前半のコピー手順、その他のフォルダー／Spreadsheet／原本生成・保存・通常整備運用・物理タブ方針は取り込まない。基準Docsと§6対象外部分の相違は後続へ残す。対象外の到達済み設計をPENDINGへ再分類する判断ではない。

## 3. §4および限定した§6の移管対応

各リンク先に当初状態→問題→確認・根拠→検討案→変更・却下理由→現在到達点→例外・未確定を置く。同じ因果の詳細を本表へ複写しない。

| 論点 | 既存Docsとの関係 | 詳細正本・因果の所在 |
|---|---|---|
| AircraftModel／Aircraft、実在個体の識別、新品と中古、未確認値 | 12bの正規化を維持。実例による固定化を防ぐ | [32a §1](../architecture/asset-management/32a_aircraft-acquisition-and-cumulative-time.md#1-型式と実機を分けた経緯)。証明等は31aへ参照 |
| 取得前の正確な総時間不明、推定逆算不採用 | 累計属性が扱う期間・未知を具体化 | [32a §2](../architecture/asset-management/32a_aircraft-acquisition-and-cumulative-time.md#2-不明な過去を推定せず0000から管理するまで) |
| 管理開始00:00、旧v6初期時間設定、今回固有の理由 | 一律中古ゼロと誤解しない。初期累計設定要件は維持 | [32a §2](../architecture/asset-management/32a_aircraft-acquisition-and-cumulative-time.md#2-不明な過去を推定せず0000から管理するまで) |
| 後日の前所有者記録、当初理由・管理開始後実績の保持 | 11の確定台帳・手修正を維持し22の継承へ接続 | [32a §3・§4](../architecture/asset-management/32a_aircraft-acquisition-and-cumulative-time.md#3-後から記録が得られた場合と法規根拠の限界) |
| BatteryModel／Battery／BatteryCompatibility、Lite間共用、同型複数機 | 型式／独立個体／N:M互換を維持 | [32b §1](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md#1-固定スロットから型式独立個体互換へ) |
| 旧BAT資産、機体セット表示、共用参照、固定所有との違い | 旧所属案は履歴。途中表示を完成schemaにしない | [32b §1・§2](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md#2-機体セット別表示を所有関係と混同しない経緯) |
| 実例2機・7本、将来N機・M本、個体情報の非推測 | 値・数・ラベルは仕様固定せず抽象化 | [32b §2・§5](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md#5-未確定と検証観点) |
| 中古BAT取得時サイクル数と機体状態、低使用歴判断 | 実確認値／評価／未知を区別。機体総時間へ逆算しない | [32b §3](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md#3-中古batの取得時確認とその後の履歴)、累計判断は32a |
| 取得時状態と取得後利用履歴 | 12bの現在累計だけで観測履歴を表現済みとしない | [32b §3・§5](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md#3-中古batの取得時確認とその後の履歴) |
| FlightのBAT使用とBatteryUsage、旧モックと現03 | 論理責任と二重保存排除を維持、最終表／行は未確定 | [32b §4・§5](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md#4-飛行実績と非飛行履歴の責任を保持する) |
| 取得時短時間確認、正式運航時間不算入、0件との整合、05記録 | 12eへ限定条件を接続。一般的な短時間除外へ拡大しない | [32c §1・§2](../architecture/asset-management/32c_acquisition-check-and-maintenance-actors.md#1-取得時の短時間動作確認をどう残すか) |
| 整備実施者と記録作成者／転記者、外部業者、根拠資料 | 12eのtechnician_nameと12fの作成者を混同せず、31c Recorderも維持 | [32c §3・§4](../architecture/asset-management/32c_acquisition-check-and-maintenance-actors.md#3-実施者と作成転記者を分ける理由) |

## 4. Responsibility Checkと正本の分離

型式・個体属性と取得時の運用判断は主責務・ライフサイクル・独立変更範囲が異なる。さらに累計の起算、BAT個体の共用、点検整備Actorは参照対象・証拠・セキュリティ境界が異なるため、12b／12eへ全文を詰め込まず32a〜32cに分ける。文書分割であり、将来sourceのモジュール・物理schemaの決定ではない。

| 観点 | 保持する境界 |
|---|---|
| 保守性・追加実装性 | 取得累計／BAT共用／整備Actorの詳細正本を分け、属性・帳票には要約参照のみ |
| 堅牢性・障害復旧性 | 未知・観測・管理実績を区別し、後日継承や訂正で既存履歴・台帳権威を壊さない。新しい復旧機構は決めない |
| セキュリティ | 実機識別子・実名・私的Drive IDを転記せず、操作アカウントと業務実施者を区別 |
| 検証可能性・監査性 | 旧案・実物証拠の限界・現在判断・未確定を正式Docs内で辿れる。原本断片のhashで移植範囲を特定 |
| 可観測性 | 累計の意味・取得時観測・実施者／転記者を追える責任を保持。保存列やログ機構は未確定のまま |
| 複数ユーザー・複数組織 | N機・M本を前提に固定所有・固定人数を持ち込まない。31a〜31dの環境・所属・権限を上書きせず、機材の新しい所属FKも作らない |

[ADR-0017](../decisions/ADR-0017-asset-acquisition-history-and-cumulative-scope.md)をProposedで追加。0007 §2.1／§2.2と0002の累計基点をClarifiesとして記録する。0010〜0014の既存番号、0015／0016を再利用せず、承認済ADRの正式な上書きとはしない。

## 5. 状態・実例・残す事項

| 分類 | 今回の扱い |
|---|---|
| CURRENT-ACCEPTED | 正規化・独立BAT共用、前歴不明と管理累計の区別、当該取得確認の扱い、実施者／転記者分離。変更可能な現在ベースライン |
| CURRENT-PROPOSAL | 03の具体的な機体セット別表示は途中案（32b §2）。表示エラー修正だけで確定しない |
| PENDING | AIRCRAFT-HISTORY（32a）、BATTERY-HISTORY（32b）、MAINTENANCE-ACTOR／ACQUISITION-RECORD（32c）。いずれもPENDING-S3識別子。物理列・FK・表／行・UIを先取りしない |
| VERIFY | AIRCRAFT-EVIDENCE／BATTERY-EVIDENCE／MAINTENANCE-EVIDENCE。99.2が挙げる実Drive・旧実装等との再照合であり、原本に記録済みの観測を消さない |
| HISTORICAL | 旧機体内型式属性、BAT主所属・固定スロット、比較用配置を現在に至る状態として保持 |
| EVIDENCE/EXAMPLE | 2機・7本、セットの4／3、付属中古BAT3本の確認、低使用歴の評価、取得時短時間確認。個体実値は公開せず、機数・本数・値を一般仕様へ固定しない |
| NEW-PROPOSAL | 新規業務仕様・schemaの追加なし。文書責任の分割・参照整備とAI独自の業務設計を区別 |

未確定の詳細を本書へ複製せず、[04の入口](../04_open-questions.md#6-992再移植step-3の未確定と確認境界)から各正本へ辿る。Step 1・2と基準DocsのPENDING／WARNを解消したとは扱わない。

## 6. 変更ファイルと責任

新規6件・既存更新17件、削除0件。

| 種別 | ファイル | 主な責任・変更 |
|---|---|---|
| 更新 | [AGENTS.md](../../AGENTS.md) | AIの停止位置・対象外範囲 |
| 更新 | [README.md](../../README.md) | 利用者向け現在位置と新領域入口 |
| 更新 | [docs/00_index.md](../00_index.md) | 総合入口・配置・移植範囲 |
| 更新 | [docs/03_integrated-requirements.md](../03_integrated-requirements.md) | 機材・累計・取得確認要件から因果正本への参照 |
| 更新 | [docs/04_open-questions.md](../04_open-questions.md) | S3の未確定・VERIFY入口。既存未決は保持 |
| 更新 | [11_data-authority.md](../architecture/11_data-authority.md) | 台帳権威を維持し、累計基点の意味へ接続 |
| 更新 | [18_reports.md](../architecture/18_reports.md) | BAT個体表示と累計・Actorの意味への参照。具体レイアウトは保持 |
| 更新 | [22_migration-plan.md](../architecture/22_migration-plan.md) | 旧BAT配置と最終schemaの区別、累計継承の意味 |
| 更新 | [23_implementation-roadmap.md](../architecture/23_implementation-roadmap.md) | 停止位置・対象と未移植範囲。開始ゲート・Phase配分は保持 |
| 更新 | [architecture/README.md](../architecture/README.md) | 領域入口・唯一の詳細正本表 |
| 更新 | [24a_submission-and-sheets-ledger.md](../architecture/dips-submission/24a_submission-and-sheets-ledger.md) | 論理台帳案と取得履歴・物理保持未決の接続。DIPS列は不変 |
| 更新 | [12b_aircraft-and-battery.md](../architecture/domain-model/12b_aircraft-and-battery.md) | 正規化属性を維持し、取得・累計・共用の因果を参照 |
| 更新 | [12e_operation-inspection-maintenance.md](../architecture/domain-model/12e_operation-inspection-maintenance.md) | Flight／MaintenanceRecordと取得確認・Actor境界を接続 |
| 更新 | [12f_common-lifecycle-id-and-audit.md](../architecture/domain-model/12f_common-lifecycle-id-and-audit.md) | 共通監査から実施者を推定しない参照 |
| 更新 | [domain-model/README.md](../architecture/domain-model/README.md) | 属性と運用意味の正本境界 |
| 新規 | [asset-management/README.md](../architecture/asset-management/README.md) | 新領域の責任・読み順・停止範囲 |
| 新規 | [32a_aircraft-acquisition-and-cumulative-time.md](../architecture/asset-management/32a_aircraft-acquisition-and-cumulative-time.md) | 機体取得前履歴・累計起算・後日継承の詳細因果 |
| 新規 | [32b_battery-sharing-and-acquisition-history.md](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md) | BAT共用・表示・取得時状態・個体履歴の詳細因果 |
| 新規 | [32c_acquisition-check-and-maintenance-actors.md](../architecture/asset-management/32c_acquisition-check-and-maintenance-actors.md) | 取得確認と正式時間、整備実施者／転記者の詳細因果 |
| 新規 | [ADR-0017](../decisions/ADR-0017-asset-acquisition-history-and-cumulative-scope.md) | 重要判断の要約・却下理由への参照・見直し条件（Proposed） |
| 更新 | [decisions/README.md](../decisions/README.md) | 番号履歴・Clarifies・Proposedの案内 |
| 新規 | [本Step 3監査](99-2-step-3-causal-audit.md) | 移管対応・証拠・確認境界・検査結果の索引 |
| 更新 | [migration/README.md](README.md) | Step 1・2の履歴保持とStep 3への案内 |

## 7. 最終検査

2026-09-18に次を確認した。実装や実物の受入完了とは区別する。

- Markdown変更23件（既存17・新規6）、削除0、非文書変更0。src／public／packageを含むコード変更0。Phase C1未着手。
- 全95文書をMarkdown parserで処理し、93表・49 code fence・相対リンク980件の対象ファイル／見出しと、表の列数・fence閉じ忘れを検査。エラー0。総合INDEXから95/95文書へ到達。
- §4全文と§6の指定4断片を§3の12論点群へ照合。32a〜32c内で当初状態・問題・証拠の限界・検討と却下理由・現在到達点・例外／未確定を追跡できる。migrationだけを理由の保存先にする論点はない。
- 属性正本12b／12e／12f、意味・因果正本32a〜32c、帳票18、台帳権威11、移行22、保存参照24aの分担を点検。同じ詳細因果の別正本を追加せず、INDEX・README・概念正本表・利用側参照を照合した。
- Step 1の00_goal、guidelines/03、presentation/30、ADR-0015、移植監査は開始HEADとバイト一致。Step 2のidentity-and-access全5文書、ADR-0016、移植監査も一致。23の§1.1・開始ゲートの規則本文とC0〜C9の実装配分は一致。
- ADR-0001〜0009本文は開始HEADと一致。0017は未使用番号を確認してProposedで追加し、承認履歴を上書きしていない。
- 99.2全体・§4・対象§6断片のhashは開始時と一致。原本の変更、§3・§5・§6対象外・§7以降の設計移植、旧main成果の転用、Drive書込みは行っていない。
- `git diff --check`はエラー0。commit前のremote照会でmainは保存SHA、作業ブランチは開始SHAと一致し、別のremote更新なし。
- 公開対象23文書を本文・差分読解とprivacy scannerで確認し、検出なし（SAFE）。原本の登録記号・Drive識別子との機械照合も一致なし。個人実値・私的URL・ローカル絶対パス・原本そのものを対象へ持ち込んでいない。自動検出を網羅保証とはしない。
- 基準PENDING／WARNと各正本のPENDING／VERIFYは保持。アプリ受入・動作テスト、実Drive・ハードウェア再確認、旧v6再操作は未実施。文書・Git検査の成功をこれらの完了とは報告しない。

Step 3を単一のatomic commitとして指定ブランチへpushした後に停止する。commit SHAとpush結果はGit記録と完了報告で示す。次Stepへは進まない。
