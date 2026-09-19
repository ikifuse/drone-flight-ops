# 99.2再移植 Step 7c — KMLの位置づけ・単位・生成契機・内容・再送の監査

最終更新: 2026-09-19

## 1. 対象と基準点

- 作業ブランチ: `claude/99-2-continuation`。開始HEADは[Step 7b](99-2-step-7b-causal-audit.md)の完了commit `48435d93c6b92fa38f2a897dbb094291cab8de5c`、開始時working treeはclean。
- 保全: `redo/99-2-causal-migration`（`01eeac3`）と比較用main／origin/main（`6344d7a0816eef4adc69d2cbe948dbefa4352019`）は変更・push先にしない。
- 原本: 現在の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。Git管理外のローカルファイルで、変更・追跡追加しない。SHA-256は開始時から不変。
- 移管範囲: §8のKML（発端、正本と派生、1飛行1KML、生成・保存タイミング、内容の確定境界、未確定のKML部分）、§7・§9でKMLの生成・保存・未同期・再送に触れる箇所、§10のKMLサンプルの位置づけ。
- 対象外: §8のPDFの役割分離・生成方針のPDF部分・飛行履歴と出力の画面、§9のcache・正本確認・同期状態・コスト、§11、コード・C1実装、DIPS操作、Drive操作。

本書は対応・証拠・確認範囲の索引。詳細理由の正本は[27e](../architecture/output/27e_kml-generation-timing-and-content.md)。旧mainのStep成果・ADRのコピー／cherry-pick／転用は行っていない。2026-09-19の追補（A4の機体別保存・命名）は範囲外で変更していない。

## 2. 原本の識別と範囲の切り出し

UTF-8の元バイト列（各行末の改行を含む）のSHA-256。行番号は今回の同一原本に対する1始まりの位置であり、将来版への固定参照ではない。

| 検査対象 | 行・範囲 | SHA-256 |
|---|---|---|
| 原本全体 | 全文の同一性（620行）。全文を今回移植する意味ではない | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| §8 発端 | 426〜428 | `1f027688e7c5314f1b09911cfb02ba2d7542ba25ce03bcf5da6dd1a34e920f2b` |
| §8 正本と派生の境界 | 429〜434 | `aa9b5e4cd9f08b7d5d2348b2e59a768f4839b614a6f7f9f9b20cfb1993879b06` |
| §8 1飛行1KML | 435〜439 | `05190c7e52319935d58e25ec39d2ed227645e764076cf51e57c28fd9da153afa` |
| §8 KML生成・保存タイミング | 440〜444 | `7adfee82fdca804f711acf9e161bc07da0764b2daf8d2cfe87a29d0866f2107f` |
| §8 KML内容の確定境界 | 445〜452 | `060019de8cdc7173387d68da3271b213e257998e6980f7380000873a83649830` |
| §8 生成方針のKML部分 | 462〜464（463〜464がKML、462は総論）。PDF部分の465〜467は対象外 | `94e5c5eb96f7ad2f14ad7c60273e9f18c50b730f2a2a9f6813d55fa1542f7fbf` |
| §8 KMLを帳票として直接印刷しない | 468。PDF側の再生成はPDFの再移植で扱う | `4bf0c170c6b54cd2907e76c9276d21b4ef9a7cb768543c8c79eef85456ca902a` |
| §8 未確定のKML部分 | 476〜479。480は地図付きPDFで対象外 | `478b315280b0c3a2d6cac70060eeb80ff59912943a7a44d33dccf0b7d5695b4c` |
| §7 共通源のKML | 370〜374。365〜369はStep 7aで移管済み | `e1447c96424358943789575094b43bed2194d20fa0ae9390e8c8ddb3cedd094f` |
| §7 再試行のKML部分 | 390〜392 | `aa51184a1a33b46b202e55629b7346aca15132764be5b5208c607fe524b780aa` |
| §7 保存への反映のKML部分 | 405〜409 | `bdbfde3c135059e92f7566d93074d7e893ac37c7e38e23d37009ac8e36935c9d` |
| §9 三つの時点の分離のKML部分 | 509〜511。506〜508・512はcache・入力保護の再移植で扱う | `e8b4470ee628dbe7ccd4fc40f979f60f40f4c5c943035d9f3ec7e83d359278e4` |
| §10 KMLサンプルの位置づけ | 555・578（それぞれ1行。ツリーの一部と注記） | `43d6741de997971e105106c27ea422cd020d067c0715b741e38ab036d6e95cd2`（555）、`7553624611c56d4c2d797b8ea03602ffb7fede3f61d894703615d124999689ea`（578） |

453〜461・465〜467・469〜475・480（PDFと履歴・出力）、§9の他の行、§11は今回の対象外で、読んで境界を確認したことと再移植したことを区別する。

## 3. 証拠経路と直接確認の範囲

| 証拠経路 | 今回確認した内容 | 限界 |
|---|---|---|
| 99.2原本 | 対象範囲（上表）を直接読み、他Step・後続への境界を識別 | 原本が記録する実Drive（07配下のサンプル）・KML表示を今回確認したわけではない |
| 現在の正式Docs | 27・27a〜27d・output README、11、14、19、03（§8）、23（C8）、12e、35a・35d、37、34c、ADR-0008・0023・decisions README、Step 5・6・7a・7bの監査 | 全設計領域を99.2全文と対照した監査ではない。18・34bはPDF・履歴出力の再移植へ残す |
| Git履歴 | 開始commit `48435d9`、`84ae73b`（KMLのユーザー出力とAPI JSONの分離）、`3e6bc06`（KMLのDriveとMy Maps設計の追加）、`ea73d08`（output群の分割） | 旧mainのADR・Step成果は本文を移管元にしていない |
| My Maps・Google Earth・実Drive | 今回アクセス・操作していない | 27cの既存PENDING-MYMAPSに接続 |

実Drive ID・実名・登録記号・画像やKMLの実ファイル名を正式Docsへ複写せず、証拠の種類と確認限界を残す。

## 4. 論点ごとの詳細正本

| 原本の論点 | 詳細正本 | 移管した因果・境界 |
|---|---|---|
| 426〜434 発端・正本と派生・飛行リストとの関係 | [27e §2](../architecture/output/27e_kml-generation-timing-and-content.md#2-正本と派生の境界) | 再入力せず後利用、06が正本でKMLは派生、正式受付番号は06へ別保持、飛行リストはKMLを走査せず、KML保存成否と掲載可否を結ばない |
| 435〜439・555・578 単位・階層 | [27e §3](../architecture/output/27e_kml-generation-timing-and-content.md#3-単位1飛行につき1kmlと階層) | 1飛行1KML（旧1 FlightPlan＝1 KMLはHISTORICAL）、階層とファイル名は確定でなくサンプル。対応はPENDING-S7C-KML-UNIT-MAPPING |
| 370〜374・390〜392・405〜409・440〜444・463〜464・509〜511 生成契機・未同期・再送 | [27e §4](../architecture/output/27e_kml-generation-timing-and-content.md#4-生成契機保存未同期保持再送) | 通報時に生成・保存、後発データを待たない、未同期の保持、最後の送信時の再送、保存済みは重複させない、三つの時点の区別。旧「運航完了時に追記・更新」はHISTORICAL |
| 445〜452 内容の確定境界 | [27e §5](../architecture/output/27e_kml-generation-timing-and-content.md#5-内容の確定境界) | 通報内容＋共通Geometry、運航後情報と受付証跡は含めない、旧保留表現の除去。共有時の秘匿との合成はPENDING-S7C-KML-SHARE-PROJECTION |
| 476〜479 未確定のKML部分 | 27e §6.2 | ファイル名・Placemark配置・円と線＋幅の表現・表示・上書き／版管理は実装詳細として27a・27b・27cへ接続 |
| 468 KMLを帳票として直接印刷しない | 27e（参照）／PDFの再移植 | PDFの生成元の意味はPDFの再移植で扱う |
| 決定の要約 | [ADR-0024](../decisions/ADR-0024-kml-generated-at-plan-submission-from-report-content.md) | Proposed。0008・0023のClarifies。新規ADR |

## 5. Responsibility Check・状態・旧設計の処置

KMLの生成契機・内容・単位・再送の意味は、27a（形式・Geometry変換・命名・プロファイル）、27b（Drive保存設定）、27c（My Maps運用）、27（出力境界）、14（キュー）と、主要責務・ライフサイクル（意味は判断と実物確認で更新され、形式は実装で更新される）・外部依存・独立変更可能性が異なるため、既存のoutput領域へ新文書27eを追加した。新しい責任領域は作らない。旧27a・27b・03・23・27dの運航実績追記モデルは、ADRに記録されていなかった設計文書の記述であるため、Supersedesではなく各文書でHISTORICAL化した。決定はADR-0024（Proposed）に要約した。

| 観点 | 確認した境界 |
|---|---|
| 保守性・追加実装性 | 形式・保存・My Mapsの正本は保持し、意味を27eへ集約。KMLの内容の源を通報内容へ一本化し、属性の再選定を不要にした |
| 堅牢性・障害復旧性 | KML・Driveの失敗は通報・離着陸・運航確定を止めない。未同期を端末に保持し、通信復帰時と最後の送信時に再送。保存済みは重複させない |
| セキュリティ | 共有時の氏名・連絡先・登録記号の非出力（27a §6）を緩めず、合成をPENDINGにした。実Drive ID・実名・登録記号を複写しない |
| 検証可能性・監査性 | KMLは正式なDIPS証拠でも運航の正本でもなく、受付証跡は06へ別保持。旧案・現在・未確定を別ラベルで追跡 |
| 可観測性 | 既存の`drive_kml_export_status`と`ledger_sync_status`の独立を維持し、新しい監視基盤を追加しない |
| 複数ユーザー・複数組織 | 保存先は環境rootの下の07配置に従う方向で、旧の利用者指定フォルダー設定との関係をPENDINGにした |

| 状態 | 対象 |
|---|---|
| CURRENT-ACCEPTED | KMLの位置づけ（正本と派生）、単位（意味上の1飛行）、飛行計画通報時の生成と保存、未同期の保持と最後の送信時の再送、内容（通報内容と共通Geometry、運航後情報を含めない） |
| CURRENT-PROPOSAL | 27aのファイル名規則・XML構造・Geometry変換（99.2が具体表現を未確定とするため） |
| PENDING | PENDING-S7C-KML-UNIT-MAPPING・PENDING-S7C-KML-SHARE-PROJECTION（27e）、PENDING-S7C-KML-DESTINATION（27b）、PENDING-S7C-KML-FINAL-SEND（35d）。ID索引は[04](../04_open-questions.md#step-7cの未確定検証先)。既存のPENDING-MYMAPS-01〜06は解消していない |
| VERIFY | 既存のもの（My Maps実機、実Driveの07配下）。新規なし |
| HISTORICAL | 「運航完了時に実績を追記して更新」「1 FlightPlan＝1 KML」「1 FlightPlan＝1 My Map推奨」、広い運航属性・候補列挙して最終一覧は今後確定する保留表現、27dの運航実績サマリーKML |
| EVIDENCE/EXAMPLE | 07配下の操縦者・年度・1飛行のサンプル階層 |
| NEW-PROPOSAL | なし |

27aのGeometry変換・27bの更新方針・27cのPENDING-MYMAPSは削除・置換せず、状態ラベルと参照だけを付けた。旧案の記録はHISTORICALとして保持している。

## 6. 変更ファイル・検査

| 種別 | 文書 | 主責任 |
|---|---|---|
| 新規 | [27e](../architecture/output/27e_kml-generation-timing-and-content.md) | KMLの位置づけ・単位・生成契機・内容・再送の意味 |
| 新規 | [ADR-0024](../decisions/ADR-0024-kml-generated-at-plan-submission-from-report-content.md) | 判断の要約（Proposed） |
| 新規 | [本書](99-2-step-7c-causal-audit.md) | 移管・証拠・確認範囲の索引 |
| 変更 | 27a／27b／27c／27d／27_output-boundaries | 旧案のHISTORICAL化、状態ラベル、27eへの参照。形式・保存・My Maps・境界の本文は保持 |
| 変更 | 03／23／12e／35a／35d／37 | 旧KMLモデルの更新、27eへの参照、PENDING-S7C-KML-FINAL-SEND |
| 変更 | 11／14／19／output README | 27eへの参照・登録 |
| 変更 | decisions README／migration README／architecture README／00_index／04／AGENTS.md／README.md | 索引・停止位置・未確定の案内 |

### 検査結果

- 検査はリポジトリ外の作業用ディレクトリに置いた読取専用スクリプトで実施した（リポジトリにはファイルを作らない）。過去Stepの件数とは数え方が異なるため、単純比較しない。
- Markdown 127文書（docs/ 124文書）、164表、52コードブロック、相対リンク1,767件（アンカー付き267件）を検査し、参照先ファイル・アンカー・表列数・閉じ忘れのエラー0、入口から到達できない文書0。
- 変更は上記25文書（変更22・新規3）のみで、削除0。削除された行は、状態ラベル・見出し・旧KMLの記述・停止位置・表の行の書き換えだけで、27aのGeometry変換・27bの保存設定と更新方針・27cのPENDING-MYMAPS・14のキュー定義の本文は削除していない。旧KMLモデルの語句は、HISTORICAL明記の箇所と旧案を説明する箇所にのみ残る。差分を読み、Step 7c以外の変更が混入していないことを確認した。
- コード・設定の差分は0。`redo/99-2-causal-migration`は`01eeac3`、mainは`6344d7a…`のまま。99.2原本のSHA-256は`f31b4856…`で不変、Git管理外のまま。
- 追加した行と新規文書の全文（318行）を、個人名・メール・ユーザーパス・IPv4・登録記号・Drive ID風のトークン・画像やOffice文書のファイル名・秘密情報の語で走査し、該当0。
- 責任重複: 新規のPENDING-S7C-*は27e §6（UNIT-MAPPING・SHARE-PROJECTION）、27b §1.1（DESTINATION）、35d §4（FINAL-SEND）のみで定義し、他は参照。27eは27a・27b・27c・14・35dの形式・保存設定・My Maps・キュー・最終保存契約の定義を複写していない。Accepted ADRの本文は不変。

これは文書移管・構造検査の完了であり、単位と計画の対応・共有時の秘匿投影・保存先の指定方法・最後の送信との契約の確定、My Maps・Driveでの実機受入の完了ではない。既存のPENDING／VERIFYを独自に解決していない。
