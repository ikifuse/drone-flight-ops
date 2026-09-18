# 99.2再移植 Step 5 — 初回・ホーム・共有計画の因果監査

最終更新: 2026-09-18

## 1. 対象と基準点

- 作業ブランチ: `redo/99-2-causal-migration`。
- 開始HEAD: `b2a7a949b930aca9208087add405ee9b35fac8d6`。開始時working treeはclean。
- 比較用main／origin/main: `6344d7a0816eef4adc69d2cbe948dbefa4352019`。変更・push対象にしない。
- 入力: ローカル保管の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。原本は変更・追加追跡しない。
- 移管範囲: §3全体と、§7のホーム4入口・正常受付後・共有飛行リストの因果に直接必要な限定部分。Step 1〜4を保持する。

本書は移管対応・証拠・確認範囲の索引。設計の理由・現在案・未確定は[Presentationの正本](../architecture/presentation/README.md)に置き、本書を理由の唯一の保存場所にしない。旧main成果のコピー・cherry-pick・転用は行わない。

## 2. 原本の識別と§7の切り出し

UTF-8の元バイト列（改行を含む）のSHA-256。行番号は今回の同一原本に対する1始まりの位置であり、将来版への固定参照ではない。

| 検査対象 | 行・範囲 | SHA-256 |
|---|---|---|
| 原本全体 | 全文の同一性。全文を今回移植する意味ではない | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| §3 | 145〜196 | `394ecff5e6976466715c42b4281fd20cb11321909f15998b713b063193d5ad92` |
| §7 | 333〜424。境界識別のため全文を読み、下記だけ使用 | `2fe751a18934d16dee503fb3ab1eeee537619c135cb787c388db39b34d9cb81b` |
| 正常応答・通常画面の周辺 | 350〜364。363後半は33bを参照、364は対象外の境界確認 | `a54a661cba0cea28daa32208f29c2a9eb3dddc4a3553afc12aad06deb162a881` |
| 結果不明のUI境界 | 363の冒頭から「結果確認が必要な状態として保持し」の直前まで。末尾改行なし | `0a8f06f50bcd6c7dfa10a4982adbaffdeeca00cc3b0bf72e40bffed5414f98c9` |
| 作業リスト・カード・内容への導線 | 397〜401 | `a15b10cea5abcb3088a317f1e1fa83dc1710c453564bea1c8d49062299b31fbe` |
| 1枚台帳の実物確認記録 | 410〜412。利用者の一覧の見え方の証拠に限定 | `ba2dc804302868d96a5bc9996d1b3e04acdd3e20ccbf44b5c22ada6a4c814af2` |

§7の350〜362は正常応答の確認記録、正式掲載、通常画面、後で飛行する、カード、直接導線、ローカル編集を常設しない境界として移管した。363は通常の通報済みへ混ぜないUI境界だけを34dへ接続し、通信再送の因果全文を33bから複写しない。397〜401は軽量作業リストの意味と表示・操作へ接続する。410〜412はEVIDENCE/EXAMPLEであり、物理シートやDrive全体構造の新規採用・完成判定ではない。

重複調整、DIPS取消詳細、予定日時経過・事故等への対応、作業リスト自動整理、KML、Geometry・payload、§7の保存構造全体は移植対象外。これらを読んで境界を確認したことと、正式Docsへ再移植したことを区別する。§5・§6の残り・§8以降・§10のDrive全体再移植へ進まない。

## 3. 証拠の確認範囲と限界

| 証拠経路 | 確認した範囲・使い方 | 限界 |
|---|---|---|
| 99.2原本 | §3を直接読み、§7を上記の範囲へ切り分けた。初期・中間・現在案と未確定を対照 | 原本の記録した実物確認を今回実施したとは扱わない |
| 現在の正式Docs | 30、31a〜31d、13a／13b／13_overview、24／24a、33a／33b／16、23、18・outputの関連入口、要件・未確定・ADRを照合 | 全設計領域を99.2全文と対照した監査ではない。対象外の本文は保持 |
| Git履歴 | 0211a9aの旧13の運航開始・API受理確認、ea73d08の24aの保存済み計画選択を対照。b2a7a94を今回差分の基準とする | 旧mainのPresentation／ADR一覧は番号・履歴対応の確認に限定し、旧Stepの本文を移管元にしていない |
| 過去エージェント履歴 | ctxの読取検索。絞った「飛行リスト」「初回セットアップ」「後で飛行する」の完全句検索では、検索した範囲に該当結果なし | inventoryには取得失敗元があり、履歴全体の不存在を示さない。一般語の広い検索は設計採用の根拠にしない |
| Google公式資料 | 34a §6のリンク先で、認証／API同意の区別、files.create、drive.fileのファイル単位scopeを補助確認 | scope全体、既存環境参加・再発見・実アプリ動作の検証ではない |
| 実物・DIPS正式資料 | 原本中の旧99.1／98.2・実Drive・台帳叩き台・正常応答確認記録を証拠として位置付けた | 今回の実Drive操作、DIPS本番API、原ガイドライン版の再照合、モックの操作は行っていない。各VERIFYへ接続 |

実名・個別Drive ID・ローカルユーザーパスを正式Docsへ複写せず、証拠の種類と確認限界を残す。現在の到達点は原本から移管し、今回の実物再確認がないという理由だけでPENDINGに戻さない。

## 4. 論点ごとの因果の詳細正本

表は所在を案内する。因果の本文はリンク先にあり、この表だけを読まないと理由が分からない構造にしない。

| 原本の論点 | 詳細正本 | 正本に保持した連鎖・境界 |
|---|---|---|
| §3 初回作成／既存参加 | [34a §1](../architecture/presentation/34a_setup-and-environment-entry.md#1-環境作成と参加を分けた因果) | PWA／Drive機能だけでは入口の役割が足りない→作成と参加を分ける→本人の公式認証・同意→権限後の本番生成。独自認証入力・PWA追加だけの生成を採らない |
| §3 生成対象 | 34a §1・§4 | 本番01〜07への入口責任。一般利用者へ設計管理00／98／99を作らない。全Drive構造は未移管 |
| §3 root重複と再発見 | [34a §2](../architecture/presentation/34a_setup-and-environment-entry.md#2-再起動とroot重複防止) | 再ログイン・再インストール・端末変更・切替での重複／混在→環境IDとroot対応→再発見が必要→appDataFolder等の旧候補は方式未決 |
| §3 初回必須登録 | [34a §3](../architecture/presentation/34a_setup-and-environment-entry.md#3-初回必須登録を見直した経緯) | 最低1機・操縦者案→初期管理者と操縦者の分離→操縦者は利用時に選択／未登録なら登録して戻る→他マスターも候補→初回必須範囲は未確定 |
| §3 通常起動・複数環境 | [34a §5](../architecture/presentation/34a_setup-and-environment-entry.md#5-通常起動と環境選択の10項目) | 31aの環境分離を参照→複数なら明示・切替／単一なら省略可能→前回環境の初期選択は方向。新しい環境モデルを作らない |
| §3 ホーム2→3→4 | [34b §1](../architecture/presentation/34b_home-and-navigation.md#1-2入口から3入口4入口へ進んだ因果) | 初期2→履歴・出力を独立表示した3→通報と実飛行の日付・担当の分離→新規／続行の識別→旧「通常飛行」をやめ4入口へ。原本にない2→3だけの独立した調査理由は捏造しない |
| §3 ホームの件数・入口責任 | 34b §1・§2 | 件数widgetをホーム必須にせずリスト側へ。4入口の目的・到達先と未決を保持 |
| §3 画面→01〜07 | [34b §3](../architecture/presentation/34b_home-and-navigation.md#3-画面から保存責任へ接続する範囲) | 新規01／02／06、受付後06、開始後01／02／03／04／06、履歴04／06→07、設定01〜06を画面責任として接続。詳細物理構造を確定しない |
| §3・§7 作業リストの意味 | [34c §1](../architecture/presentation/34c_shared-flight-worklist.md#1-保存済み計画の選択から共有作業リストへ) | 既存24aの保存済み計画選択→担当者の引継ぎ→これから扱う軽量共有リスト。恒久履歴と分離、1枚台帳の実物は証拠 |
| §7 カード5系統 | [34c §2](../architecture/presentation/34c_shared-flight-worklist.md#2-カードの情報と絞り込み) | 日時・場所・機体・操縦者／通報者・DIPS状態。計画名等の必須追加をしない。2種類のDIPS状態表示と重複調整の対象外を区別 |
| §7 絞り込み | 34c §2 | 上部4分類の具体案と「等で絞り込める方向」の表現を対照→CURRENT-PROPOSAL。初期値・並び順等は確定しない |
| §7 カード→通報内容 | [34c §4](../architecture/presentation/34c_shared-flight-worklist.md#4-通報内容へ直接進みローカル編集を置かない理由) | 通報した内容を確認して点検へ→汎用中間詳細を挟まない。日時等をローカルだけ変える不一致を避け、変更／再通報は別処理 |
| §7 正常応答と正式掲載 | [34d §1・§2](../architecture/presentation/34d_dips-accepted-and-plan-content.md#1-受理確認をその後の作業選択へ接続した因果) | 旧受理確認表示→応答の調査記録→送信開始と受付を分離→正常受付・計画ID・重複有無確定が掲載契機。結果不明の安全理由は33b参照 |
| §7 正常受付後・後で飛行する | [34d §2・§3](../architecture/presentation/34d_dips-accepted-and-plan-content.md#3-正常受付重複なし画面の10項目) | 通報完了・重複なし→点検／後で飛行。後者を押す前に掲載し、計画を残してホームへ戻る→権限ある本人／他利用者・別端末へ引継ぎ |
| §7 重複なし通報内容画面 | [34d §4](../architecture/presentation/34d_dips-accepted-and-plan-content.md#4-dips通報内容画面の10項目) | 直接内容確認→点検／飛行中止・削除。ボタンの存在までを保持し、取消不能等の詳細は先取りしない |
| 既存Manualとの接続・保存軸 | 34c §5・34d §2／§5、[24a](../architecture/dips-submission/24a_submission-and-sheets-ledger.md) | API正常受付の掲載条件をManualの番号任意確認へ一律適用しない。DIPS受付と共有書込み成功の独立を維持し、具体接続をPENDINGに残す |

## 5. Responsibility Checkと重複防止

[構造規約](../guidelines/01_structure-and-maintenance-rules.md#6-docs変更時のresponsibility-check)を適用した。初回生成／環境復帰、ホームの入口選択、共有作業対象の選択、外部正常応答後の選択は、主責務・ライフサイクル・外部依存・セキュリティ境界・独立変更可能性が異なる。30へ統合せず、既存Presentation内の34a〜34dへ分冊した。新しい実装モジュールは追加しない。

| 分割時に確認した観点 | 今回の扱い |
|---|---|
| 保守性・追加実装性 | 4画面責任と規約30を分離し、初回方式の変更が通報画面全文へ波及しない |
| 堅牢性・障害復旧性 | DIPS受付／Drive保存／現場状態を混同しない。未知の復旧方式はPENDINGとし33b・14等へ接続 |
| セキュリティ | Google公式認証、三層権限、環境分離を既存正本へ委譲。独自パスワード収集・無条件共有を作らない |
| 検証可能性・監査性 | 各画面10項目、原本識別・移管対応、旧案と現在案・未確定を区別 |
| 可観測性 | 正常応答・結果不明・共有反映完了の意味を分離。画面表示から通信成功・全端末反映まで推定しない。新しいログ実装は設計しない |
| 将来の複数ユーザー／複数組織 | 31a〜31dを正本として、日付・担当・端末をまたぐ権限付き引継ぎと環境別rootを接続 |

詳細正本は[architectureの概念表](../architecture/README.md#3-主要概念の正本)へ登録した。13a／13bは状態、24aは提出履歴保存、31a〜31dは人物・環境・権限、33a／33b／16はAPI基盤・通信安全・秘密／認証、18／outputは帳票・出力のまま保持する。既存側へは必要な要約と参照だけを置き、6画面の10項目表や因果全文を複製していない。ADR-0019は重要判断の理由を要約し、詳細は34a〜34dへ参照する。

## 6. 状態分類・未確定・ADR

状態の意味は[guidelines/03](../guidelines/03_design-evidence-and-causality.md)を保持する。

| 状態 | 今回の主な対象 |
|---|---|
| CURRENT-ACCEPTED | 作成／参加、必要権限後の本人Drive生成、重複防止の意味、利用時の操縦者登録、ホーム4入口、カード5系統、正常受付時掲載、後で飛行、通報内容へ直接進む通常操作 |
| CURRENT-PROPOSAL | 前回環境の初期選択、drive.file第一候補、場所／機体／BATの選択時登録、リストの4分類絞り込み方向 |
| PENDING | root再発見・参加／中断復旧の具体方式、初回必須登録範囲、詳細配置・権限／offline表現、共有反映／cache／物理保持、Manual接続。詳細IDは34a〜34dと[04](../04_open-questions.md#8-992再移植step-5の未確定と確認境界) |
| VERIFY | 原本が記録した旧画面・実Drive・台帳・DIPS正常応答資料の再照合、Google正式認証／scope。Step 4の正式認証VERIFYも維持 |
| HISTORICAL | ホーム2入口・3入口、初回操縦者強制案、旧root保持候補、旧API成功時の受付番号中心表示 |
| EVIDENCE/EXAMPLE | 原本中の実Drive・画面資料・1枚作業台帳・APIガイドライン確認記録。今回の公式Google補助読解と混同しない |
| NEW-PROPOSAL | 今回追加なし。widget・追加カード項目・検索／ソートを新たに提案していない |

旧「通常飛行」や2／3入口はHISTORICALに限定し、現在の4入口と並立させない。最低1機等の初回必須範囲は、旧案が存在したことも現在未確定であることも保持する。旧13・24aの現場状態や履歴保存を古いという理由で削除せず、利用側画面を具体化した。

[ADR-0019](../decisions/ADR-0019-home-entry-and-shared-plan-handoff.md)をProposedで追加。0015〜0018と番号衝突せず、旧mainの0011を転用していない。0005の分離原則を入口・引継ぎへ具体化するClarifiesであり、Accepted本文・履歴を変更しない。CURRENT-ACCEPTEDは今回の到達ベースラインであり、ADR Acceptedや永久確定ではない。既存PENDING／WARNを解消したとは報告しない。

## 7. 変更ファイルと責任

既存変更20、新規6、削除0。すべてMarkdown文書。

| 種別 | ファイル | 主責任 |
|---|---|---|
| 変更 | [AGENTS.md](../../AGENTS.md) | 停止位置と正本への入口 |
| 変更 | [README.md](../../README.md) | Step 5の範囲と利用者向け文書入口 |
| 変更 | [docs/00_index.md](../00_index.md) | 総合目次・現在範囲・ADR／Presentation案内 |
| 変更 | [docs/03_integrated-requirements.md](../03_integrated-requirements.md) | 機能一覧から画面正本への参照 |
| 変更 | [docs/04_open-questions.md](../04_open-questions.md) | 未確定・VERIFYの所在索引 |
| 変更 | [docs/architecture/15_dips-adapter.md](../architecture/15_dips-adapter.md) | 正常応答を利用する画面への参照 |
| 変更 | [docs/architecture/18_reports.md](../architecture/18_reports.md) | 飛行履歴・出力入口との接続のみ |
| 変更 | [docs/architecture/23_implementation-roadmap.md](../architecture/23_implementation-roadmap.md) | 停止位置・移管進捗のみ。開始ゲートと実装配分は保持 |
| 変更 | [docs/architecture/README.md](../architecture/README.md) | 領域目次と唯一の詳細正本の概念表 |
| 変更 | [docs/architecture/dips-infrastructure/README.md](../architecture/dips-infrastructure/README.md) | Step 4の外側で具体化した画面への参照 |
| 変更 | [docs/architecture/dips-submission/24a_submission-and-sheets-ledger.md](../architecture/dips-submission/24a_submission-and-sheets-ledger.md) | 作業リストと履歴の責任分離、対象選択の参照 |
| 変更 | [docs/architecture/dips-submission/README.md](../architecture/dips-submission/README.md) | 提出履歴保存と画面正本の区別 |
| 変更 | [docs/architecture/identity-and-access/README.md](../architecture/identity-and-access/README.md) | 初回・共有画面から人物正本への接続 |
| 変更 | [docs/architecture/output/README.md](../architecture/output/README.md) | 履歴・出力の入口責任のみ |
| 変更 | [docs/architecture/presentation/README.md](../architecture/presentation/README.md) | 30／34a〜34dの責任と読む順 |
| 変更 | [docs/architecture/state-machines/13_overview.md](../architecture/state-machines/13_overview.md) | 状態Gateと通常画面を混同しない参照 |
| 変更 | [docs/architecture/state-machines/13a_operation.md](../architecture/state-machines/13a_operation.md) | 現場開始とホーム入口の区別。FSM本文は保持 |
| 変更 | [docs/architecture/state-machines/13b_dips-submission.md](../architecture/state-machines/13b_dips-submission.md) | API成功表示を34dへ委譲。状態・遷移は保持 |
| 変更 | [docs/decisions/README.md](../decisions/README.md) | 0019の登録・Proposed／旧履歴との関係 |
| 変更 | [docs/migration/README.md](README.md) | Step 4完了点とStep 5監査への入口 |
| 新規 | [docs/architecture/presentation/34a_setup-and-environment-entry.md](../architecture/presentation/34a_setup-and-environment-entry.md) | 初回作成／参加・root再発見・初回必須・通常起動 |
| 新規 | [docs/architecture/presentation/34b_home-and-navigation.md](../architecture/presentation/34b_home-and-navigation.md) | ホーム2→3→4の因果、入口・画面→保存責任 |
| 新規 | [docs/architecture/presentation/34c_shared-flight-worklist.md](../architecture/presentation/34c_shared-flight-worklist.md) | 軽量共有リスト・カード・絞り込み方向・直接導線の理由 |
| 新規 | [docs/architecture/presentation/34d_dips-accepted-and-plan-content.md](../architecture/presentation/34d_dips-accepted-and-plan-content.md) | 掲載契機・正常受付後・後で飛行・通報内容の画面 |
| 新規 | [docs/decisions/ADR-0019-home-entry-and-shared-plan-handoff.md](../decisions/ADR-0019-home-entry-and-shared-plan-handoff.md) | 4入口と共有引継ぎの重要判断（Proposed） |
| 新規 | [docs/migration/99-2-step-5-causal-audit.md](99-2-step-5-causal-audit.md) | 原本識別・対応・証拠・確認範囲の索引（本書） |

## 8. 完了検査

- Markdown 106文書を解析。117表の列数、51コードブロックの閉じ、相対リンク1,250件のファイル・見出し参照にエラーなし。INDEXから106文書すべてへ到達できる。
- 初回セットアップ、通常起動／環境選択、ホーム、飛行リスト、正常受付後、通報内容の6画面は各10項目。30と番号・項目名が一致し、項目9の権限とonline/offlineを分割していない。
- 差分は既存20文書・新規6文書、削除0。コード・src・public・package関連の変更0。C1以降の実装なし。
- 全文保持44文書を開始commitとバイト比較。guidelines/03、presentation/30、31a〜31d、asset-management、33a／33b、16、ADR-0001〜0009／0015〜0018、既存移植監査、payload／Geometry参照領域・出力詳細・Manual等を保持した。
- 23の§1.1／§1.2の開始ゲートとC0〜C9の実装配分は同一。13aのFSM本文と13bの状態遷移図を保持し、API成功時の表示だけを34dへの参照に置き換え、旧表示はHISTORICALに残した。
- 正式Docsの責任表・本文と旧語の検索を対照。ホームの旧2／3入口を現在案として並立させず、旧「通常飛行記録」等の一般業務語はホームボタンと混同しない。因果の詳細正本は34a〜34dに一元化し、他領域・ADR・監査へ全文複製していない。
- 原本全体・§3・§7と切り出し範囲のhash一致。99.2原本、実Drive、DIPS本番、Google Cloud設定は変更していない。
- 変更26文書の公開前機密スキャンはSAFE（検出候補0・読取不明0）。差分読解でも実名・個別Drive ID・秘密値・ローカルユーザーパスの追加なし。Gitの空白検査はエラーなし。
- commit前のリモート照合では対象ブランチは開始HEAD、mainは§1の比較用SHAと一致。main／origin/mainのローカル参照も同一。今回のcommitとpushは指定ブランチだけを対象とする。

実機・実API・共有反映の動作確認は未実施で、docs検査をそれらの完了とは扱わない。未確定・VERIFYは§6と各詳細正本へ残す。commit後のSHA、push先一致、working tree cleanはチャットで報告し、本書へ自己参照SHAを書くための追加commitは行わない。
