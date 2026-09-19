# 99.2再移植 Step 7d — PDFの役割分離・生成契機と飛行履歴・出力の監査

最終更新: 2026-09-19

## 1. 対象と基準点

- 作業ブランチ: `claude/99-2-continuation`。開始HEADは[Step 7c](99-2-step-7c-causal-audit.md)の完了commit `99b47b1a9509bdc9ff4469d80ccbffb6c8327e66`、開始時working treeはclean。
- 保全: `redo/99-2-causal-migration`（`01eeac3`）と比較用main／origin/main（`6344d7a0816eef4adc69d2cbe948dbefa4352019`）は変更・push先にしない。
- 原本: 現在の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。Git管理外のローカルファイルで、変更・追跡追加しない。SHA-256は開始時から不変。
- 移管範囲: §8のPDFの役割分離、生成方針のPDF部分、飛行履歴・出力の画面と出力選択、地図付きPDFの未確定。
- 対象外: §8のKML部分（Step 7cで移管済み）、§9のcache・正本確認・同期状態・コスト、§11、コード・C1実装、DIPS操作、Drive操作。

本書は対応・証拠・確認範囲の索引。詳細理由の正本は[27f](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md)（PDF）と[34e](../architecture/presentation/34e_history-and-output.md)（画面）。旧mainのStep成果・ADRのコピー／cherry-pick／転用は行っていない。2026-09-19の追補（A4の機体別保存・命名）は範囲外で変更していない。

## 2. 原本の識別と範囲の切り出し

UTF-8の元バイト列（各行末の改行を含む）のSHA-256。行番号は今回の同一原本に対する1始まりの位置であり、将来版への固定参照ではない。

| 検査対象 | 行・範囲 | SHA-256 |
|---|---|---|
| 原本全体 | 全文の同一性（620行）。全文を今回移植する意味ではない | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| §8 発端 | 426〜428。Step 7cと共通の発端。PDFの要求（不要ファイルを増やさない）を今回使用 | `1f027688e7c5314f1b09911cfb02ba2d7542ba25ce03bcf5da6dd1a34e920f2b` |
| §8 PDFの役割分離 | 453〜461 | `49777c3ef783a3cceedd1fc3d3f265578937bf4f223aa0021bbc2f2ccb0a3848` |
| §8 生成方針のPDF部分 | 465〜467。462〜464・468はKMLと総論でStep 7cが使用 | `df946045f203ff41eec528f154c88a828a196cde67c9f20354d2d2ae21dfd3b5` |
| §8 飛行履歴・出力UI | 469〜472 | `fda5d7757055822974e2c57dd0bfbab7c151f5e5c8f5e82ae776e1f1bee51c25` |
| §8 出力選択 | 473〜475 | `47d3e7f7a4c8708b2f653099b47f7f6fe2f957ccb45cc7491cee83f6409666ea` |
| §8 地図付きPDFの未確定 | 480 | `7854c8212eff0efed176bc740afbafb90154914246f1a15061ddcb24b5f87aa1` |
| §8 根拠 | 481〜486。証拠の所在の識別のみ。実Drive ID・ファイル名は複写しない | `22eed4d99b2a5d5466c9afa46b662f587118b3cb94468d68a5a3ff28ca0237e7` |

§9の他の行、§11は今回の対象外で、読んで境界を確認したことと再移植したことを区別する。

## 3. 証拠経路と直接確認の範囲

| 証拠経路 | 今回確認した内容 | 限界 |
|---|---|---|
| 99.2原本 | 対象範囲（上表）を直接読み、他Step・後続への境界を識別 | 原本が記録する実Drive（07のPDF）・A4確認用実物・DIPS画面を今回確認したわけではない |
| 現在の正式Docs | 18（全文）、27_output、35c・35d、34b・34c、30、presentation README、37、03（§8）、12e（ReportSnapshot）、ADR-0021・0023・0024・decisions README、Step 5・6・7a〜7cの監査 | 全設計領域を99.2全文と対照した監査ではない。旧18・03の「地図付き飛行計画書」との関係は未確認のまま保持 |
| Git履歴 | 開始commit `99b47b1`、`ea73d08`（18・outputの構成）、`84ae73b`（KMLとAPI JSONの分離） | 旧mainのADR・画面仕様は本文を移管元にしていない |
| 実画面・実物PDF | 今回アクセス・作成していない | VERIFY-S7D-MAPPDF-REGENに接続 |

実Drive ID・実名・登録記号を正式Docsへ複写せず、証拠の種類と確認限界を残す。旧資料（98.2の画面と保存先の整理、99.1の該当節）は今回再確認していない。

## 4. 論点ごとの詳細正本

| 原本の論点 | 詳細正本 | 移管した因果・境界 |
|---|---|---|
| 426〜428・453〜461 役割分離 | [27f §2](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md#2-二つのpdfを役割で分けた因果) | A4運航記録PDF（04）と地図付きPDF（06＋Geometry）の分離、DIPS画面の地図と入力項目の関係をA4へ再構成する理由、二つを合わせる意味。旧18・03の「地図付き飛行計画書」との関係はPENDING-S7D-MAPPDF-SCOPE |
| 465〜467 生成方針 | [27f §3](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md#3-生成契機方針) | PDFは必要な時だけ、Sheets標準印刷／PDF化も可能でアプリを唯一の印刷手段にしない、KMLを帳票として直接印刷しない（468はStep 7c参照） |
| 457〜459・480 地図付きPDFの配置・未確定 | [27f §4](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md#4-地図付きpdfの配置の方向と未確定) | 地図左上・DIPS項目右側・入りきらない項目は地図下の検討案、現在は主視覚要素＋右または下の方向、最終は1飛行テスト。PENDING-S7D-MAPPDF-DETAIL・VERIFY-S7D-MAPPDF-REGEN |
| 469〜475 飛行履歴・出力UI・出力選択 | [34e](../architecture/presentation/34e_history-and-output.md) | 10項目の画面仕様、`flight_id`を見せない・内部で結合、出力選択（第一候補＝CURRENT-PROPOSAL）。PENDING-S7D-HISTORY-DETAIL・-OUTPUT-UNIT・-KML |
| 決定の要約 | [ADR-0025](../decisions/ADR-0025-derived-pdf-roles-and-on-demand-generation.md) | Proposed。0021・0023・0024のClarifies。新規ADR |

## 5. Responsibility Check・状態・旧設計の処置

地図付きPDFの役割・生成契機は、18（生成技術・発行記録）、35c（A4運航記録の実物・生成単位）、27（出力境界）と、主要責務（源が06で、A4は04）・ライフサイクル・独立変更可能性が異なるため、既存のoutput領域へ新文書27fを追加した。飛行履歴・出力は、34bが入口の意味までとしていた画面で、30の10項目規約に沿う画面仕様のため、presentation領域へ新文書34eを追加した。新しい責任領域は作らない。決定はADR-0025（Proposed）に要約した。

| 観点 | 確認した境界 |
|---|---|
| 保守性・追加実装性 | 生成技術（18）・A4（35c）・KML（27e）の正本は保持し、PDFの役割・生成契機を27fへ、画面を34eへ分離。新しい出力を足しても既存の責任を変えない |
| 堅牢性・障害復旧性 | PDFは必要な時だけ生成し、Sheets標準の印刷経路を残す。端末でのPDF生成の条件は18 §6を維持 |
| セキュリティ | 実Drive ID・実名・登録記号を複写しない。地図付きPDFの内容（通報内容に連絡先等を含み得る）の共有範囲は、旧記述との関係とともにPENDINGに残し、緩めていない |
| 検証可能性・監査性 | 1飛行テストとの実物確認をVERIFYに、旧記述との関係をPENDINGにし、発行記録（ReportSnapshot、18 §4）を維持 |
| 可観測性 | 新しい監視・ログ基盤を追加しない |
| 複数ユーザー・複数組織 | 権限は31b、環境は34aに従う。履歴画面の権限・offlineは34eのPENDING |

| 状態 | 対象 |
|---|---|
| CURRENT-ACCEPTED | A4運航記録PDFと地図付きPDFの役割分離、PDFを必要な時だけ生成する方針、KMLを帳票として直接印刷しない、［飛行履歴・出力］から検索・選択して出力へ進む導線、内部でflight_idにより04・06・07を結合し利用者には見せないこと |
| CURRENT-PROPOSAL | 出力選択の方式（［A4運航記録PDF］［地図付きPDF］［両方作成］）。99.2が第一候補とするもの |
| PENDING | PENDING-S7D-MAPPDF-DETAIL・PENDING-S7D-MAPPDF-SCOPE（27f）、PENDING-S7D-HISTORY-DETAIL・-OUTPUT-UNIT・-KML（34e）。ID索引は[04](../04_open-questions.md#step-7dの未確定検証先) |
| VERIFY | VERIFY-S7D-MAPPDF-REGEN（27f）。既存のVERIFY-S6-A4-PRINTは解消していない |
| HISTORICAL | 18 §2・03 §8.1の旧「地図付き飛行計画書」の記述（計画作成後の事前印刷／提出用）。ただし現在の帳票との関係は未確認のため、旧案（要照合）として保持 |
| EVIDENCE/EXAMPLE | 07のPDFの実Drive、A4確認用の実物。今回未再確認 |
| NEW-PROPOSAL | なし |

18の3層パイプライン・§4・§6、35cのA4、27の境界は保持し、削除・置換していない。追加したのはPDFの役割・生成契機・画面の記録と参照リンクである。

## 6. 変更ファイル・検査

| 種別 | 文書 | 主責任 |
|---|---|---|
| 新規 | [27f](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md) | 派生PDFの役割分離・生成契機・地図付きPDF |
| 新規 | [34e](../architecture/presentation/34e_history-and-output.md) | 飛行履歴・出力の画面（10項目） |
| 新規 | [ADR-0025](../decisions/ADR-0025-derived-pdf-roles-and-on-demand-generation.md) | 判断の要約（Proposed） |
| 新規 | [本書](99-2-step-7d-causal-audit.md) | 移管・証拠・確認範囲の索引 |
| 変更 | 18／27_output／35c／34b／37／03 | 27f・34eへの参照。18 §2の地図付き行を旧記述として更新。本文の生成技術・境界・A4・入口・七責任は保持 |
| 変更 | output README／presentation README／23／04 | 27f・34eの登録、C8への接続、未確定の案内 |
| 変更 | decisions README／migration README／architecture README／00_index／AGENTS.md／README.md | 索引・停止位置 |

### 検査結果

- 検査はリポジトリ外の作業用ディレクトリに置いた読取専用スクリプトで実施した（リポジトリにはファイルを作らない）。過去Stepの件数とは数え方が異なるため、単純比較しない。
- Markdown 131文書（docs/ 128文書）、173表、52コードブロック、相対リンク1,853件（アンカー付き277件）を検査し、参照先ファイル・アンカー・表列数・閉じ忘れのエラー0、入口から到達できない文書0。
- 変更は上記20文書（変更16・新規4）のみで、削除0。削除された行は、日付・停止位置・表の行・文の書き換えだけで、18の3層パイプライン・§4・§6、35cのA4、27の境界、34bの入口の本文は削除していない。差分を読み、Step 7d以外の変更が混入していないことを確認した。
- コード・設定の差分は0。`redo/99-2-causal-migration`は`01eeac3`、mainは`6344d7a…`のまま。99.2原本のSHA-256は`f31b4856…`で不変、Git管理外のまま。
- 追加した行と新規文書の全文（295行）を、個人名・メール・ユーザーパス・IPv4・登録記号・Drive ID風のトークン・画像やOffice文書のファイル名・秘密情報の語で走査し、該当0。
- 責任重複: 新規のPENDING／VERIFYは27f §4（MAPPDF-*）と34e §3（HISTORY-*）のみで定義し、他は参照。27fは18・35c・27e・24bの生成技術・A4・KML・記録責任の定義を複写していない。34eは30の規約本文と、34b・34cの入口・画面の定義を複写していない。Accepted ADRの本文は不変。

これは文書移管・構造検査の完了であり、地図付きPDFの詳細・履歴画面の詳細・出力単位・KML取得の確定、実物PDFや画面での受入完了ではない。既存のPENDING／VERIFYを独自に解決していない。
