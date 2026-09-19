# 99.2再移植 Step 8 — §11の差分監査

最終更新: 2026-09-19

## 1. 対象と基準点

- 作業ブランチ: `claude/99-2-continuation`。開始HEADは[Step 7e](99-2-step-7e-causal-audit.md)の完了commit `15471f8e89a494ab8964447f00efb6571ddd4bec`、開始時working treeはclean。
- 保全: `redo/99-2-causal-migration`（`01eeac3`）と比較用main／origin/main（`6344d7a0816eef4adc69d2cbe948dbefa4352019`）は変更・push先にしない。
- 原本: 現在の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。Git管理外のローカルファイルで、変更・追跡追加しない。SHA-256は開始時から不変。
- 対象: §11【正式設計への移植】【現状差分】【監査方法】【旧資料の最終照合と退避】【根拠保持ルール】【今回の照合対象と結果】に基づく、Step 1〜7eの移植結果と正式Docsの差分監査。
- 対象外: 新たな設計判断・仕様の追加、PENDING／VERIFYの解決、コード・C1実装、DIPS・Drive・Cloud操作、旧資料の削除・退避、実機・実画面・実Driveの再確認。

本書は、§11が求める「旧案が現在仕様として残っていないか」「原本の現状差分が正式Docsに置かれているか」を、Step 1〜7eの成果に対して確かめた記録。新しい設計の正本ではなく、詳細は各領域の正本（§4〜§6の表のリンク先）にある。旧mainのStep成果・ADRのコピー／cherry-pick／転用は行っていない。2026-09-19の追補（A4の機体別保存・命名・簡素な採番）は変更していない。

## 2. 原本の識別と範囲の切り出し

UTF-8の元バイト列（各行末の改行を含む）のSHA-256。行番号は今回の同一原本に対する1始まりの位置であり、将来版への固定参照ではない。

| 検査対象 | 行・範囲 | SHA-256 |
|---|---|---|
| 原本全体 | 全文の同一性（620行） | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| §11 全体 | 586〜617 | `f9756cb3c3bb05c955ef2f5196cebfa9d6cc1aed5032db40416b0181e7d24262` |
| §11 正式設計への移植 | 586〜590 | `14185350d2d834a3b437b9e9b4c36a4545c3d8347bc1ad82acc0769e6e53eabf` |
| §11 現状差分 | 591〜596 | `afb7ea6520381a252c5fea16f3cf56e27286b29f21ac3e999bea56c74362e9ce` |
| §11 監査方法 | 597〜600 | `059993bec1c7a6e6f8b58abf5c82d5b81b5476c9458f7b71795ba2cf3e6c557b` |
| §11 旧資料の最終照合と退避 | 601〜608 | `1020807f4ce4d54c7fe1a9e39eee23c08bb912af092cdcf94a900f9f395edc24` |
| §11 根拠保持ルール | 609〜612 | `94b6056e8d180b1782eee8efb95cffbbfebbce534359806908f0bed3bb5cf480` |
| §11 今回の照合対象と結果 | 613〜617 | `24e487985b5bda4a798e6dec1baca69e57508a5ae9091f52722d472e4d38d0d7` |

## 3. 証拠経路と直接確認の範囲

| 証拠経路 | 今回確認した内容 | 限界 |
|---|---|---|
| 99.2原本 | §11を直接読み、Step 1〜7eの各監査記録が記す行範囲と対照して、§0〜§10の全ての非空行がいずれかのStepで使用済みであることを確認（§5の表） | 原本の実Drive・旧資料・旧実装・実画面・A4確認用実物を今回確認したわけではない |
| 現在の正式Docs | 00_goal・01_アプリ概要・03・04・23・28・各領域README、33a・34b・34c・25e・35c・37・27a〜27f・18・16・15・ADR-0001・0007・0018・0021〜0027、decisions README。旧案の語句（Workers・KML運航実績追記・KML属性未確定・自動ページネーション・「設計確定」）の全文検索 | 全文を文単位で99.2と再照合した監査ではない。各Stepが確認した範囲は各監査記録に残る |
| Git履歴 | 開始commit `15471f8`、Step 7a〜7eの各commit | 旧mainのADR・画面仕様は本文を移管元にしていない |
| 旧資料の照合結果 | §11【旧資料の最終照合と退避】は99.2自身が行った照合の記録。本書はその主張を、正式Docsに回収12項目が置かれているかで確かめた | 旧資料（旧98・99系・技術モック・実Drive）そのものは今回再確認していない。VERIFYとして保持 |

## 4. §11「現状差分」の8項目の対照

原本は、次の8項目が正式Docsに完全移植されていないと記していた。Step 1〜7eの後の状態を対照した。

| 原本が挙げた項目 | 正式Docsの現在の正本 | 移植Step | 状態 |
|---|---|---|---|
| 運用環境／人物／三層権限 | [identity-and-access](../architecture/identity-and-access/README.md)の31a〜31d | Step 2 | 配置済み。物理schema・UI・所有はPENDING-S2-* |
| ホーム4入口（新規飛行・飛行リスト・飛行履歴／出力・各種設定／管理） | [34b](../architecture/presentation/34b_home-and-navigation.md)。飛行履歴・出力の画面は[34e](../architecture/presentation/34e_history-and-output.md) | Step 5・7d | 配置済み。詳細UIはPENDING-S5-HOME-DETAIL・PENDING-S7D-HISTORY-* |
| DIPS正常応答後に共有飛行リストへ反映して、別人・別端末へ引き継ぐ通常系 | [34c](../architecture/presentation/34c_shared-flight-worklist.md)・[34d](../architecture/presentation/34d_dips-accepted-and-plan-content.md)、リスト整理の意味は[24b](../architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)、共有反映・cacheは[38a](../architecture/sync-and-cache/38a_shared-source-and-device-cache.md) | Step 5・7b・7e | 配置済み。物理保持・cache実装はPENDING-S5-LIST-DETAIL・PENDING-S7E-CACHE-DETAIL |
| 新01〜07のDrive構造 | [37](../architecture/drive-structure/37_environment-storage-responsibilities.md) | Step 6 | 配置済み。物理配置はPENDING-S6-DRIVE-PLACEMENT |
| 最新のA4縦帳票 | [35c](../architecture/operation-recording/35c_a4-operation-record.md)（2026-09-19の追補を含む） | Step 6・追補 | 配置済み。詳細はPENDING-S6-A4-DETAIL・VERIFY-S6-A4-PRINT |
| submission_snapshot／Geometry | [25e](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md)。実画面の証拠は[26 §1.3](../architecture/26_dips-web-ui-verification.md#13-証拠系列と回収範囲) | Step 7a | 配置済み。作図操作・`flyRoute`表現はPENDING／VERIFY |
| 飛行履歴・出力UI | [34e](../architecture/presentation/34e_history-and-output.md)。PDFは[27f](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md) | Step 7d | 配置済み。出力選択はCURRENT-PROPOSAL |
| Google Cloud固定IPによるDIPS API接続構成 | [33a](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)・[33b](../architecture/dips-infrastructure/33b_api-availability-and-retry-boundaries.md)。判断は[ADR-0018](../decisions/ADR-0018-dips-fixed-egress-and-limited-backend.md)（Proposed） | Step 4 | 配置済み。実行基盤・認証契約・credentialは未確定 |

「配置済み」は、原本の因果が該当領域の正本に移されたという意味であり、実装・実物での受入完了ではない。物理schema・UI詳細・実機差等の個別の未確定は、各正本のPENDING／VERIFYとして保持している。

## 5. 原本の全行の使用状況

Step 1〜7eの各監査記録が挙げる原本の行範囲から、§0〜§10の非空行がいずれかのStepで使用されているかを検査した。

| 節 | 行 | 使用したStep |
|---|---|---|
| §0・§1 | 1〜60 | Step 1 |
| §2 | 61〜144 | Step 2 |
| §3 | 145〜196 | Step 5 |
| §4 | 197〜238 | Step 3 |
| §5・§6 | 239〜332 | Step 6（§6の一部はStep 3） |
| §7 | 333〜424 | Step 4（固定IP・通信・再試行）、Step 5（正常受付後・共有リスト）、Step 7a〜7c |
| §8 | 425〜486 | Step 7c（KML）、Step 7d（PDF・履歴出力） |
| §9 | 488〜528 | Step 7c（KMLの一部）、Step 7e |
| §10 | 530〜585 | Step 6 |
| §11 | 586〜617 | 本Step |

結果: 原本620行のうち、いずれのStepにも使用されていない非空行は0。ただし「使用」は、各Stepの監査記録が示す範囲を読んで該当領域へ移管した（または対象外と識別した）という意味で、各行の内容が実装可能な確定仕様になったという意味ではない。行の一部だけを使用して残りを対象外にしたStep（§6のStep 3、§7のStep 4・5・7a・7b・7c）は、それぞれの監査記録に境界が残っている。

## 6. 旧案の残存点検

原本は、GitHub側の旧案の残存を挙げた（Workers前提・KMLへの運航実績追記・KML属性の未確定・A4の旧ページネーション）。正式Docs全体を語句で検索し、現在仕様として読める箇所がないかを確かめた。

| 旧案（原本の指摘） | 検索の観点と結果 | 処置 |
|---|---|---|
| Cloudflare Workers前提 | 現行仕様の文書は、00_goal、03_integrated-requirements、04_open-questions、architecture配下の10・15・16・19・33a、AGENTS.md、README.mdの箇所を確認。architecture配下の10・15・16・19・33aと、03_integrated-requirements・04_open-questions・AGENTS.md・README.mdは旧経路を過去のもの・変更済みと明示。ADR-0001・0004・0009は承認済み本文を保持し、変更はADR-0018（Proposed）が記録。architecture配下の02・03・04・05・09（比較・監査の記録）は冒頭で履歴資料と明示 | 00_goal §1の注記だけが「Workersを採用した」と現行の事実のように読めたため、DIPS API用の経路は固定IP要件で変更済みで、PWA・IndexedDB・Sheetsの方針は維持と追記（今回変更） |
| KMLへ飛行前後点検・運航実績を追記し、Mission完了時に更新する旧案 | 「Mission完了」「運航実績」「追記」「1 FlightPlan = 1 KML」等を検索。27a・27b・27c・27d・03・23・12e・ADR-0024の各箇所はHISTORICALまたは現在方針への参照を持つ | 追加の変更なし（Step 7cで処置済み） |
| KMLの属性の最終一覧を未確定とする旧案 | 「属性」「最終一覧」を検索。27e §5が、内容は通報内容と共通Geometryで確定しKMLだけの属性一覧を選び直さないと記し、具体の表現（ファイル名・Placemark／ExtendedDataの配置）は27aのCURRENT-PROPOSAL。27aの旧表現はHISTORICAL | 追加の変更なし（Step 7cで処置済み） |
| A4帳票の旧ページネーション（自動続紙・整備サマリー） | 「ページネーション」「続紙」「整備サマリー」を検索。ADR-0007 §2.9（承認済み）は本文を保持し、限定置換をADR-0021（Proposed）が記録。18・35c・03・23は現在の固定7枠・日付連番の物理シートを正本とし、旧案をHISTORICALと明示 | 追加の変更なし（Step 6で処置済み） |
| 古い「設計確定」表記だけを根拠にした旧仕様の実装 | 「設計確定」を検索。migration配下以外の文書に0件（27・27a〜27dはStep 7cで「設計整合」へ変更済み） | 追加の変更なし |
| 旧「地図付き飛行計画書」 | 語句を検索。18・03は現在の位置づけと27fへの参照を持つ。00_goalの目標の一覧は旧名のままだった | 00_goalの該当項目に、現在は必要な時だけ生成する地図付きPDFであることと27fへの参照を追記（今回変更） |

これらの点検は語句の検索と該当箇所の読解であり、全文の意味の再監査ではない。ここで見つからなかったことは、旧案が残っていないことの完全な証明ではない。

## 7. 回収した12項目の所在

原本は、旧資料の最終照合で回収した固有情報を挙げる。正式Docsに置かれているかを確認した。

| 回収項目 | 現在の所在 | Step |
|---|---|---|
| Qualificationsの分離 | [31a §3](../architecture/identity-and-access/31a_person-account-and-environment.md#3-資格の分離と確認用5タブ) | Step 2 |
| 旧Viewer制約と三層権限の関係 | [31b](../architecture/identity-and-access/31b_roles-and-access-control.md) | Step 2 |
| 退職履歴の粒度 | [31d](../architecture/identity-and-access/31d_membership-lifecycle.md) | Step 2 |
| Google認証／drive.file／appDataFolderの候補 | [34a](../architecture/presentation/34a_setup-and-environment-entry.md)（候補・VERIFY-S5-GOOGLE-CONTRACT） | Step 5 |
| 通常飛行中のその場登録 | 34a（操縦者は現在到達点、場所・機体・BAT等はCURRENT-PROPOSAL） | Step 5 |
| 旧Mission／Flight／FlightLegs／AircraftSwitchesの関係 | [35a](../architecture/operation-recording/35a_flexible-flight-and-details.md)・ADR-0020 | Step 6 |
| 飛行外のBatteryUsage | [32b](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md)・[12b §6](../architecture/domain-model/12b_aircraft-and-battery.md#6-batteryusageバッテリーライフサイクルイベント) | Step 3 |
| 年度のロールオーバー | [35c](../architecture/operation-recording/35c_a4-operation-record.md)のPENDING-S6-A4-DETAIL（年度替わりと長期・複数環境でのSpreadsheet分割）。用語「ロールオーバー」は正式Docsに現れないが、意味は同じ未確定として保持 | Step 6 |
| 旧SyncQueue等の内部監査構造 | [38b §3](../architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md#3-中央のsyncqueue監査の未確定)（PENDING-S7E-SYNCQUEUE-AUDIT） | Step 7e |
| DIPSのPC・スマホ二系統の証拠 | [26 §1.3](../architecture/26_dips-web-ui-verification.md#13-証拠系列と回収範囲) | Step 7a |
| 地図付きPDFの配置案 | [27f §4](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md#4-地図付きpdfの配置の方向と未確定) | Step 7d |
| 旧マスターのLocations／Clients／Projects／許可／保険 | [37](../architecture/drive-structure/37_environment-storage-responsibilities.md)（概念廃止の証拠にしない、PENDING-S6-DRIVE-PLACEMENT） | Step 6 |

12項目すべてに、正式Docs内の所在がある。

## 8. §11の運用方針への対応

| 原本の方針 | 対応 |
|---|---|
| 結論だけを短文化せず、理由・条件・例外・実物確認・訂正関係・未確定を移す | 各Stepの詳細正本に「当初状態・発端・問題・変更理由・現在の到達点・未確定」を置き、監査記録は索引に限定した。要約だけでなくADRへ判断と却下案を分けた |
| 旧案は現在仕様として並列に載せず、理由として必要な部分だけ保持 | 旧案はHISTORICALまたは当初状態として、現在の到達点と区別して保持（§6） |
| 差分を矛盾扱いせず、根拠へ戻る。資料だけで判定できない場合だけ狭く確認する | 本Stepは新たな確認を行っていない。判定できない事項はPENDING／VERIFYとして保持し、オーナーへ質問していない |
| 根拠保持（何を見た→何が分かった→なぜ判断→どこへ反映→後で何が変わった） | 各Stepの詳細正本の因果段落と、監査記録の証拠経路の限界を保持。新証拠が出た場合は、過去理由を消さず同じ因果へ統合する |
| 新しい98.3・99.3を作らない | 作っていない。本Stepの記録は99.2の追加版ではなく、移植の差分監査の記録 |
| 原ファイル・旧技術モックの削除は、別途の明示確認後にだけ行う | 削除・退避を行っていない。99.2原本はGit管理外のまま、変更していない |
| DIPS実画面・旧操作マニュアルの、正式設計書への移植監査は次工程 | Step 7a〜7eで、実画面の証拠系列・作図・手動経路等をDIPS領域へ移した。旧マニュアルと旧実装の実物は再確認していない（VERIFY-S6-OPERATION-EVIDENCE等として保持） |

## 9. 残る未確定と、着手前の照合の索引

本Stepは、PENDING／VERIFYを解決していない。定義は各正本にあり、下表は所在の索引（定義の複写ではない）。同じIDを複数の文書が太字で挙げる例（8件）を確認した。多くは詳細正本を明示する参照（16・32c・35aなど）で、VERIFY-S6-OPERATION-EVIDENCE（35a・35b）とVERIFY-S5-SETUP-EVIDENCE（34a・34b）は領域ごとに別の側面を挙げる。定義の食い違いは確認されなかったため、過去Stepの記述は変更していない。

| 領域 | 未確定・確認待ち | 定義先 |
|---|---|---|
| 人物・環境・権限（Step 2） | PENDING-S2-ENVIRONMENT-UI／-ACCESS-DETAIL／-MEMBERSHIP／-OWNERSHIP、VERIFY-S2-IDENTITY-EVIDENCE／-ACCESS-EVIDENCE／-ACTOR-EVIDENCE | 31a〜31d |
| 機材（Step 3） | PENDING-S3-AIRCRAFT-HISTORY／-BATTERY-HISTORY／-MAINTENANCE-ACTOR／-ACQUISITION-RECORD、対応するVERIFY-S3-*-EVIDENCE | 32a〜32c・36 |
| DIPS接続（Step 4） | PENDING-C7-INFRA、PENDING-S4-SESSION、VERIFY-S4-API-CONTRACT／-APPLICATION-EVIDENCE | 33a・33b・16 |
| 画面（Step 5・7d） | PENDING-S5-ROOT-DISCOVERY／-INITIAL-REQUIRED／-HOME-DETAIL／-LIST-DETAIL／-MANUAL-LIST／-ACCEPTED-UI、VERIFY-S5-*、PENDING-S7D-HISTORY-* | 34a〜34e |
| 運航記録・A4・整備・Drive（Step 6） | PENDING-S6-OPERATION-SCHEMA／-OPERATION-UI／-A4-DETAIL／-FINAL-SAVE-CONTRACT／-MAINTENANCE-PHYSICAL／-DRIVE-PLACEMENT、VERIFY-S6-* | 35a〜35d・36・37 |
| DIPS計画・証拠（Step 7a・7b） | PENDING-S7A-DRAW-OPERATION／-NON-DIPS-SCOPE、VERIFY-S7A-EVIDENCE／-FLYROUTE-CONTRACT、PENDING-S7B-FLIGHT-KEY／-CLEANUP-CONDITION／-DUPLICATE-ADJUST | 25c・25e・26・24b |
| KML・PDF（Step 7c・7d） | PENDING-S7C-KML-UNIT-MAPPING／-SHARE-PROJECTION／-DESTINATION／-FINAL-SEND、PENDING-S7D-MAPPDF-DETAIL／-SCOPE、VERIFY-S7D-MAPPDF-REGEN | 27b・27e・27f・35d |
| 同期・cache（Step 7e） | PENDING-S7E-CACHE-DETAIL／-SYNCQUEUE-AUDIT、VERIFY-S7E-DEVICE-DIFF | 38a・38b |
| C1前から続く項目 | PENDING-C0-ACCEPTANCE、PENDING-DOMAIN-SEMANTIC-KEYS、PENDING-C1-SCHEMA、PENDING-LEDGER-SNAPSHOT、PENDING-LOCAL-RESTORE、PENDING-MAP-RENDERER、PENDING-WEB-*、PENDING-MYMAPS-* | [04 §3](../04_open-questions.md#3-c1前docs再編で追跡するpending)ほか |

**着手前の扱い（既存の規則。新しいゲートは作らない）**: C1は未着手のまま、C0受入確認とオーナーGO（PENDING-C0-ACCEPTANCE）を待つ。依存実装は[23 §1.2](../architecture/23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)の確認事項を、その責任領域の正本で追跡できることが前提。該当のC1型・schemaを固定する前に、PENDING-DOMAIN-SEMANTIC-KEYS・PENDING-C1-SCHEMAと、対象領域のPENDING（例: 35aのPENDING-S6-OPERATION-SCHEMA、24bのPENDING-S7B-FLIGHT-KEY、27eのPENDING-S7C-KML-UNIT-MAPPING、32a〜32cの取得履歴）を照合する。本Stepはこれらを解決済みとも実装開始の許可とも扱わない。

## 10. 変更ファイル・検査

| 種別 | 文書 | 主責任 |
|---|---|---|
| 新規 | [本書](99-2-step-8-diff-audit.md) | §11の差分監査の記録 |
| 変更 | 00_goal | §1の注記のWorkers前提の更新、目標の一覧の「地図付き飛行計画書」の現在の位置づけ |
| 変更 | 28 | 当時の監査であり、その後の99.2再移植の記録を参照する旨の注記 |
| 変更 | 04／23 | Step 8の範囲・残る未確定の案内、§11の差分監査の完了と依存実装のゲートの維持 |
| 変更 | migration README／architecture README／00_index／AGENTS.md／README.md | 索引・停止位置 |

### 検査結果

- 検査はリポジトリ外の作業用ディレクトリに置いた読取専用スクリプトで実施した（リポジトリにはファイルを作らない）。過去Stepの件数とは数え方が異なるため、単純比較しない。
- Markdown 138文書（docs/ 135文書）、191表、52コードブロック、相対リンク2,005件（アンカー付き313件）を検査し、参照先ファイル・アンカー・表列数・閉じ忘れのエラー0、入口から到達できない文書0。
- 変更は上記10文書（変更9・新規1）のみで、削除0。削除された行は、日付・停止位置・表の行・文の書き換えと、00_goalの2箇所（Workers前提の注記、目標の一覧の1項目）の置換だけで、いずれも旧記述の意味を新記述が含む形で更新した。差分を読み、Step 8以外の変更が混入していないことを確認した。
- コード・設定の差分は0。`redo/99-2-causal-migration`は`01eeac3`、mainは`6344d7a…`のまま。99.2原本のSHA-256は`f31b4856…`で不変、Git管理外のまま。
- 追加した行と新規文書の全文を、個人名・メール・ユーザーパス・IPv4・登録記号・Drive ID風のトークン・画像やOffice文書のファイル名・秘密情報の語で走査し、該当0。
- 責任重複: 本書は所在の索引と対照表で、詳細仕様・PENDING／VERIFYの定義を新たに置いていない。新しいADR・状態ラベルの昇格はない。Accepted ADRの本文は不変。

これは文書の差分監査の完了であり、実機・実Drive・旧資料の再確認、PENDING／VERIFYの解決、C1実装の許可ではない。
