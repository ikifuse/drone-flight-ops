# 99.2再移植 Step 7a — 実画面確認・共通の源・Manual／API経路・DIPS対象外の監査

最終更新: 2026-09-19

## 1. 対象と基準点

- 作業ブランチ: `claude/99-2-continuation`。`redo/99-2-causal-migration`の`01eeac3`から分岐したローカルブランチで、オーナーの指示により以降の作業をここで継続する。
- 開始HEAD: `01eeac3b4625e75d6e67b3b438d49af589f5df22`。開始時working treeはclean。
- 保全: `redo/99-2-causal-migration`（`01eeac3`）と比較用main／origin/main（`6344d7a0816eef4adc69d2cbe948dbefa4352019`）は変更・push先にしない。
- 原本: 現在の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。原本はGit管理外のローカルファイルで、変更・追跡追加しない。行範囲とSHA-256は今回の同一原本に対する記録であり、この端末以外では再検証できない。
- 移管範囲: §7の実画面確認、共通の源（Geometry・submission_snapshot）、Manual／API経路の責任境界、DIPS対象外との境界。
- 対象外: §7の残り（KMLの生成・保存・再送、06の保存構造、取消・重複あり調整・リスト自動整理）、§8、§9全体、§11、コード・C1実装、DIPS操作、Drive操作。

本書は対応・証拠・確認範囲の索引。設計理由の詳細正本は[25e](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md)、実画面の証拠系列は[26 §1.3](../architecture/26_dips-web-ui-verification.md#13-証拠系列と回収範囲)。旧mainのStep成果・ADRのコピー／cherry-pick／転用は行っていない。2026-09-19の追補（[35c §3](../architecture/operation-recording/35c_a4-operation-record.md#3-その後の運用判断による現在ベースライン)、[ADR-0021](../decisions/ADR-0021-a4-record-layout-and-sheet-boundary.md)）が確定したCURRENT-ACCEPTED（A4の保存先・命名）は、今回の範囲と重ならず変更していない。今回使用した原本の範囲にA4の保存先・命名に触れる記述はない。

## 2. 原本の識別と範囲の切り出し

UTF-8の元バイト列（各行末の改行を含む）のSHA-256。行番号は今回の同一原本に対する1始まりの位置であり、将来版への固定参照ではない。

| 検査対象 | 行・範囲 | SHA-256 |
|---|---|---|
| 原本全体 | 全文の同一性（620行）。全文を今回移植する意味ではない | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| §7 | 333〜424。境界識別のため全文を読み、下記だけ使用 | `2fe751a18934d16dee503fb3ab1eeee537619c135cb787c388db39b34d9cb81b` |
| 実画面確認 | 334〜340 | `6ef7128be36f406d47d1a43f61891c78eb80eb13f881b27ad0205f4135b2c047` |
| 人物設計への反映 | 341〜342。Step 2で移管済みのため参照のみ | `265d5cfd0c6d7b81b002265ae6d7ee91dfbd7c01f8ec6f6e51beeca14dc21bc0` |
| 地図作図の確認 | 343〜346 | `956fb35747783b7bbe0af15ea86fc2a1600282eafde447fdf8ecc2a4d6d5ef63` |
| API側で回収済みの範囲 | 347〜349 | `e1ce994de7decf7f35c094cd149b2eeebdb96e567a379ff1ec51d4a1c6772b89` |
| 共通源の設計（Geometry・submission_snapshot） | 365〜369。370〜374のKMLは対象外 | `b488f981656bd2b73916bb0b45d3132c5e264163f89fde0b6d87d0239da90590` |
| 手動経路 | 375〜377 | `d449c2b70856922b4fe4f8969b1134ce1ce2e08bc4383de2483402a69f61c2ef` |
| API経路 | 378〜380。381〜384はStep 4で移管済み | `338ff3eadf91c433b5e985c78c50a1a9bb51ca2a04f95838bbd739b5e6fb0f89` |
| DIPS対象外 | 385〜387 | `1d5de69d90e9c7dc2953a7b991e5c01d21a720b0239f9cea9e914ca7f9008151` |
| 未確定・回収継続 | 413〜414のうち作図・API表現・保存再利用に係る部分。重複あり調整・自動整理は対象外 | `c25c7dc8bb963d2fdcdb82a48b2106b631ee606e570e3af76d24a8f6115c90ca` |
| 根拠 | 415〜423。証拠の所在の識別のみ。実Drive ID・画像ファイル名等は複写しない | `3bab221e7d1e5c5d778598eabd4c75946593fa554f5240986cc1b0e963f70e5a` |

§7の350〜364は正常応答・共有リスト・通常画面としてStep 5、363後半・381〜384・389・393〜394は通信安全としてStep 4で移管済み。370〜374・390〜392・405〜409（KML）、388・395〜396・402〜404・410〜412（再試行のKML側、06の保存構造、取消・リスト整理、1枚台帳）は今回の対象外で、読んで境界を確認したことと再移植したことを区別する。

## 3. 証拠経路と直接確認の範囲

| 証拠経路 | 今回確認した内容 | 限界 |
|---|---|---|
| 99.2原本 | §7を全文読み、対象範囲（上表）と他Step・後続への境界を識別 | 原本が記録する実画面・過去会話・スクリーンショット・API過去調査を今回操作・再確認したわけではない。個々の画像ファイルの一意な特定は原本も未完了（L423） |
| 現在の正式Docs | 17（§1〜§2）、12d（§3・§4・§7・§8）、13b／13c／13_overview、14、24／24a、25 overview・25a（No.41〜45と冒頭）・25b（冒頭）・25c、26、27_output（§1〜§2）、31c（根拠の確認範囲）、33b、35b／12e（対象外の記述）、ADR-0004／0006／0009と一覧 | 全設計領域を99.2全文と対照した監査ではない。25a・25d・15・13bは関係箇所のみ。27a等のKML記述と99.2 §8の相違は後続へ残す |
| Git履歴 | `05c7852`（26とFlightAreaGeometryの初出）、`9a2fb26`（`payload_snapshot`の初出）、`84ae73b`（`submission_snapshot`／`api_payload_snapshot`への改称とKML分離）、`a1d93ff`（`DipsManualEntryViewModel`の初出）、`ea73d08`（25 overviewの分割）、開始commit `01eeac3` | 旧mainのADR・Step成果は本文を移管元にしていない |
| DIPS Web・スマホ画面・API公式資料・実Drive | 今回アクセス・操作していない | 各VERIFYへ接続。今回の再確認済みの範囲はない |
| 過去エージェント履歴（ctx） | 今回のStepでは使用していない | 過去会話の記録は99.2の記述としてのみ扱った |

実名・登録記号・個別Drive ID・画像ファイル名・固定IPを正式Docsへ複写せず、証拠の種類と確認限界を残す。現在の到達点は原本から移管し、今回の実画面再確認がないという理由だけでPENDINGへ戻さない。

## 4. 論点ごとの詳細正本

| 原本の論点 | 詳細正本 | 移管した因果・境界 |
|---|---|---|
| 334〜340 実画面確認（PC版実操作、スマホ版、二系統） | [26 §1.3](../architecture/26_dips-web-ui-verification.md#13-証拠系列と回収範囲) | 二系統の証拠系列、過去会話の時刻記録、スマホ版の項目名、相違を一般知識で補完しない。スマホ版はOBSERVEDへ含めずEVIDENCE/EXAMPLE |
| 343〜346 地図作図の確認 | 26 §1.3 | 3図形・編集・削除・半径10mの確認記録。未回収をPENDING-S7A-DRAW-OPERATIONとして26が保持。パレット確認の系列は原本が明示せず決めない |
| 347〜349 API側の過去調査 | 26 §1.3／[25c §6](../architecture/dips-flight-plan/25c_api-payload-mapping.md#6-c7契約再確認と検証) | 過去調査の要約と25aの`flyRoute`表現の相違をVERIFY-S7A-FLYROUTE-CONTRACTとして25cが保持。線＋幅のAPI表現は既存PENDING-WEB-05 |
| 365〜368 共通の源 | [25e §2](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md#2-実画面の観測から共通geometryへ至った因果) | 観測→再入力を避けたい→共通のGeometry。却下案A〜C、採用D、全形状を全経路へ同じ形で送れるとは限らない限界、提出Snapshotへの値保持 |
| 369 submission_snapshot | [25e §3](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md#3-不変submission_snapshotをapiの有無に関わらず持つ理由) | APIの有無に関わらず必須、`SNAPSHOT_SAVED`時の不変保存、共通の源との連なり、型・電文・台帳の境界 |
| 375〜380 手動経路・API経路 | [25e §4](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md#4-manual経路とapi経路の責任境界) | 共通／Manual固有／API固有の責任、変えないもの。項目例は例示、コピー対象の全一覧は25b |
| 385〜387 DIPS対象外 | [25e §5](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md#5-dips対象外飛行との境界) | 内部の運航記録と通報証跡の区別。判定は13c。「対象外／対象」の定義が原本にないことをPENDING-S7A-NON-DIPS-SCOPEとして25eが保持 |
| 413〜414 未確定（作図・API表現・保存再利用） | 26 §1.3／25e §6 | 既存PENDING-WEB-05〜07を置換せず、Step 7a固有の未確定を追加 |
| 決定の要約 | [ADR-0023](../decisions/ADR-0023-common-source-and-derived-submission-paths.md) | Proposed。0004／0006／0009をClarifies |

## 5. Responsibility Check・状態・旧設計の処置

25 overviewは通報入力支援原則、17と12dは型、25cは電文、26は観測を担う。今回の因果・却下案・限界・再検討条件は、主要責務（原則・型・電文・観測と別）、ライフサイクル（証拠の追加やPENDING解消で更新され、型や原則より変わりやすい）、外部依存（DIPS Web／API公式資料・過去会話の証拠）、Phase（C1の型・C5の編集・C6のManual・C7のAPIにまたがる）、独立変更可能性の点で既存文書と分かれるため、既存のdips-flight-plan領域へ新文書25eを追加した。新しい責任領域ディレクトリは作らない。主題が既存領域の通報入力支援原則の因果で、別README・別読者・別ライフサイクルを持たず、過剰分割を避けるため。二系統の証拠系列は観測の責務なので26へ置き、25eから参照して二重に書かない。

| 観点 | 確認した境界 |
|---|---|
| 保守性・追加実装性 | 型・原則・電文・観測の正本は変えず、因果を25eへ集約。新しい経路・出力は共通の源から派生させ、入力元を増やさない |
| 堅牢性・障害復旧性 | 提出内容の不変Snapshotをローカルへ先行保存し、Sheets・KMLの失敗でDIPS通報や現場記録を止めない既存契約（14 §3.4・33b）を維持。共通の源の後日編集が過去の提出内容へ波及しない |
| セキュリティ | API電文（JSON）を利用者へ表示・編集・保存・出力させない境界を維持（25c §5）。実名・登録記号・Drive ID・画像ファイル名・固定IPを複写しない |
| 検証可能性・監査性 | 観測・過去調査・設計採用を別出典として追跡。証拠系列（PC版／スマホ版）を分け、未再確認をVERIFYへ。提出当時の内容と実送出電文を別保持 |
| 可観測性 | 通報状態・台帳同期・確認を混同しない既存契約（13b）を維持。監視基盤・ログ方式を追加しない |
| 複数ユーザー・複数組織 | 通報者・操縦者・記録者の分離（31c）と環境単位の台帳（37）を維持。個人環境の実例を固定しない |

| 状態 | 対象 |
|---|---|
| CURRENT-ACCEPTED | 共通の源（FlightPlan・FlightAreaGeometry）と派生する経路・出力、不変submission_snapshot（APIの有無に関わらず必須）、Manual／API経路の責任境界、DIPS対象外の内部記録と通報証跡の区別 |
| CURRENT-PROPOSAL | なし |
| PENDING | PENDING-S7A-DRAW-OPERATION（26）、PENDING-S7A-NON-DIPS-SCOPE（25e）。既存のPENDING-WEB-05〜07、PENDING-C1-SCHEMA、PENDING-LEDGER-SNAPSHOTは解消していない。ID索引は[04](../04_open-questions.md#step-7aの未確定検証先) |
| VERIFY | VERIFY-S7A-EVIDENCE（26）、VERIFY-S7A-FLYROUTE-CONTRACT（25c）。既存のAPI契約・認証のVERIFYは解消していない |
| HISTORICAL | 旧`payload_snapshot`名・旧`geometry_snapshot`名（既存Docsに旧設計名として残る）、DIPS API専用形式を内部モデルとする案（ADR-0004の選択肢B） |
| EVIDENCE/EXAMPLE | 99.2が挙げるPC版の実操作、スマホ版の画面、過去会話の記録、API側の過去調査の要約。今回未再確認 |
| NEW-PROPOSAL | 新規設計の採用なし。未確定の判定境界をAI一般論で確定しない |

ADR-0023をProposedで新設した。ADR-0004・0006・0009（Accepted）の本文は変更せずClarifiesとして記録し、番号は0022の続きで、mainにある0010〜0014と衝突しない。CURRENT-ACCEPTEDとADR Acceptedは別軸。

25 overviewの原則と図、17 §2の型、12dの提出Snapshot、25c §4〜§6のGeometry変換とJSON、26 §2のOBSERVED記録、24のManual業務は保持し、削除・置換していない。追加したのは因果・却下案・証拠系列・未確定の整理と参照リンクである。

## 6. 変更ファイル・検査

既存変更14、新規3、削除0。すべてMarkdown文書。

| 種別 | 文書 | 主責任 |
|---|---|---|
| 新規 | [25e](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md) | 共通の源・Manual／API・DIPS対象外の因果、却下案、限界、再検討条件 |
| 新規 | [ADR-0023](../decisions/ADR-0023-common-source-and-derived-submission-paths.md) | 共通の源の判断の要約（Proposed） |
| 新規 | [本書](99-2-step-7a-causal-audit.md) | 移管・証拠・確認範囲の索引 |
| 変更 | [26](../architecture/26_dips-web-ui-verification.md) | 証拠系列と回収範囲（§1.3）、PENDING／VERIFY |
| 変更 | [25c](../architecture/dips-flight-plan/25c_api-payload-mapping.md) | `flyRoute`表現のVERIFY |
| 変更 | [25 overview](../architecture/dips-flight-plan/25_overview.md) | 25eへの参照・正本関係 |
| 変更 | [dips-flight-plan README](../architecture/dips-flight-plan/README.md) | 25eの登録 |
| 変更 | [17](../architecture/17_map-and-airspace.md) | 25eへの参照（型は不変） |
| 変更 | [12d](../architecture/domain-model/12d_flight-plan-and-dips.md) | 25eへの参照（型・不変性は不変） |
| 変更 | [architecture README](../architecture/README.md) | 領域表・概念の正本表 |
| 変更 | [23](../architecture/23_implementation-roadmap.md) | 停止位置とStep 7aの接続。C0〜C9の配分は不変 |
| 変更 | [04](../04_open-questions.md) | Step 7aの未確定・検証先 |
| 変更 | [decisions README](../decisions/README.md) | ADR-0023の登録 |
| 変更 | [migration README](README.md) | Step 7aの登録 |
| 変更 | [00_index](../00_index.md) | 総合目次・領域配置 |
| 変更 | [AGENTS.md](../../AGENTS.md) | 停止位置・正本の入口 |
| 変更 | [README.md](../../README.md) | Step範囲と分岐の案内 |

### 検査結果

- リポジトリ内に検査スクリプトがないため、ファイルを作らないインラインの読取専用スクリプトで検査した。過去Stepの件数とは数え方が異なるため、単純比較しない。
- Markdown 122文書（docs/ 119文書）、149表、52コードブロック、相対リンク1,640件（アンカー付き228件）を検査し、参照先ファイル・アンカー・表列数・閉じ忘れのエラー0。追加・変更した17文書はすべて00_index／AGENTS／READMEから到達できる。
- 変更は上記17文書（変更14・新規3）のみで、削除0。削除された行は、日付・停止位置の記述・表の行を書き換えた箇所だけで、既存の型・手順・電文・観測の本文は削除していない。差分を読み、Step 7a以外の変更が混入していないことを確認した。
- コード・設定（src、public、package.json、tsconfig.json、vite.config.ts、index.html、eslint.config.js）の差分は0。C1実装・DIPS操作・Drive操作・Cloud設定変更なし。
- 99.2原本のSHA-256は`f31b4856…`で開始時と一致し、Git管理外のまま。`redo/99-2-causal-migration`は`01eeac3`、mainは`6344d7a…`のまま。
- 追加した行と新規3文書の全文を、個人名・メール・ユーザーパス・IPv4・登録記号・Drive ID風のトークン・画像やOffice文書のファイル名・秘密情報の語で走査し、該当0。Drive ID風のパターンにヒットしたのはコミットSHA・SHA-256・設計IDだけで、Drive IDではない。
- 責任重複: 新規IDの定義箇所を一意にした（PENDING-S7A-DRAW-OPERATIONとVERIFY-S7A-EVIDENCEは26、VERIFY-S7A-FLYROUTE-CONTRACTは25c、PENDING-S7A-NON-DIPS-SCOPEは25e。04・23・ADR・本書は索引または参照）。25eは25c・24・12d・13が持つ手順・型・判定の定義を複写していない。Accepted ADR-0004・0006・0009の本文は不変。

これは文書移管・構造検査の完了であり、未確定のschema・作図操作・`flyRoute`契約・対象外の定義、実機・実画面・API通信の受入完了ではない。既存のPENDING／VERIFYを独自に解決していない。

commit SHA・push結果・最終working tree状態はcommit／push後にチャットで報告し、その後は停止する。
