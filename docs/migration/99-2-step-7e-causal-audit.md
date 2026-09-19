# 99.2再移植 Step 7e — 共有正本・端末cache・時点分離・費用の境界の監査

最終更新: 2026-09-19

## 1. 対象と基準点

- 作業ブランチ: `claude/99-2-continuation`。開始HEADは[Step 7d](99-2-step-7d-causal-audit.md)の完了commit `41d0dd4ef8a1ed64ef96500da9719edc4029f982`、開始時working treeはclean。
- 保全: `redo/99-2-causal-migration`（`01eeac3`）と比較用main／origin/main（`6344d7a0816eef4adc69d2cbe948dbefa4352019`）は変更・push先にしない。
- 原本: 現在の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。Git管理外のローカルファイルで、変更・追跡追加しない。SHA-256は開始時から不変。
- 移管範囲: §9の共有正本と端末cache、cacheの捨て方、正本確認の時点、offlineの意味、同期状態の判断の方向、確定・保存・外部反映の時点分離、費用の境界、未確定。
- 対象外: §11の差分監査（Step 8）、コード・C1実装、DIPS操作、Drive操作、cache・同期の実装。

本書は対応・証拠・確認範囲の索引。詳細理由の正本は[38a](../architecture/sync-and-cache/38a_shared-source-and-device-cache.md)・[38b](../architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md)（同期・cache）と[37 §6](../architecture/drive-structure/37_environment-storage-responsibilities.md#6-保存の所有と費用の境界)（保存の所有と費用の境界）。旧mainのStep成果・ADRのコピー／cherry-pick／転用は行っていない。2026-09-19の追補（A4の機体別保存・命名・簡素な採番）は変更していない。

## 2. 原本の識別と範囲の切り出し

UTF-8の元バイト列（各行末の改行を含む）のSHA-256。行番号は今回の同一原本に対する1始まりの位置であり、将来版への固定参照ではない。

| 検査対象 | 行・範囲 | SHA-256 |
|---|---|---|
| 原本全体 | 全文の同一性（620行）。全文を今回移植する意味ではない | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| §9 見出し・発端 | 488〜490 | `e87865c0582f7a37f049357c8a8e6cd1e5dba8a9cb7f125aa19a4cecd5e9fb05` |
| §9 正本 | 491〜495 | `dfd170f0e5fe623eeccf7212b6869fed3131501ef70cd301edb8b325f3ddf255` |
| §9 正本確認 | 496〜505 | `8b1590a96822cfb45ee616f8df095d3ed0c9f0e39903502296767c9d711e532d` |
| §9 入力保護・送信時点の分離 | 506〜512 | `b486e492b79c9ee5035fb72531a2279a2df4418c4d1b5e05ced32e0b564b9a9d` |
| §9 コスト | 513〜517 | `3c659cc3130e9d383a5880c08734e227af63e64e4174e46105645cf732294ac9` |
| §9 未確定 | 518〜521 | `03164c865485f33028dabb9ea1eafc1978621fad7325691df3eccbb59ea471d1` |
| §9 根拠 | 522〜528。証拠の所在の識別のみ。実Drive ID・ファイル名・画像名は複写しない | `abe07f6bdbb7c40afb4cd567599ff91514d3108984f30f1c579109da52d5f719` |

§10（Step 6で移管済み）・§11は今回の対象外で、読んで境界を確認したことと再移植したことを区別する。

## 3. 証拠経路と直接確認の範囲

| 証拠経路 | 今回確認した内容 | 限界 |
|---|---|---|
| 99.2原本 | 対象範囲（上表）を直接読み、他Step・後続への境界を識別 | 原本が挙げる旧実装・旧の図・現場操作マニュアルの実物、旧06の叩き台の実物を今回確認したわけではない |
| 現在の正式Docs | 11・14・19・10・12f・34a・34c・24b・25e・27e・35b・35d・37・33b、ADR-0001・0002・0003・0018・0021〜0025、decisions README、Step 5・6・7a〜7dの監査、04・23 | 全設計領域を99.2全文と対照した監査ではない。ストレージ保護（14）やADR-0003の本文は再定義していない |
| Git履歴 | 開始commit `41d0dd4`、`ea73d08`（11・14の構成） | 旧mainのADR・画面仕様は本文を移管元にしていない |
| 実機・実運用 | 今回アクセス・作成していない | VERIFY-S7E-DEVICE-DIFFに接続 |

実Drive ID・実名・登録記号・旧の画像資料のファイル名を正式Docsへ複写せず、証拠の種類と確認限界を残す。旧資料（98.2の画面と保存先の整理、99.1の該当節）は今回再確認していない。

## 4. 論点ごとの詳細正本

| 原本の論点 | 詳細正本 | 移管した因果・境界 |
|---|---|---|
| 488〜495 発端・正本・cacheの捨て方 | [38a §2〜§3](../architecture/sync-and-cache/38a_shared-source-and-device-cache.md#2-共有の正本と端末cacheを分けた因果) | 共有の正本＝各環境のDrive／Sheets、端末cache＝複製。cacheは共有のマスター・リスト・確定済みの台帳の複製であり、作成中の下書き・未同期の確定データは11・ADR-0002に従う。一般マスターは固定TTLだけで捨てず、飛行リストは業務状態で整理 |
| 496〜505 正本確認・cache表示・offline・同期状態 | [38a §4](../architecture/sync-and-cache/38a_shared-source-and-device-cache.md#4-正本を確認する時点とcacheの表示) | 重要な時点の確認と変更のある台帳のみの再取得、cache先行表示、別端末追加の計画の反映、cacheあり／なし＋offlineの意味、新規登録前の確認。同期状態の判断の方向はCURRENT-PROPOSAL |
| 506〜512 入力保護・送信時点の分離 | [38b §2](../architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md#2-三つの時点に分けた因果) | ①計画確定・DIPS通報、②逐次保存、③最終送信の三時点、未同期の保持、KMLの再送と重複保存の防止、別系統の再試行。各時点の詳細は25e・35b・35d・27eに残し、複写していない |
| 513〜517 コスト | [37 §6](../architecture/drive-structure/37_environment-storage-responsibilities.md#6-保存の所有と費用の境界) | 中央ストレージへ集約せず各環境のDriveを使う、従量課金を必要機能に限定、DIPS用の小規模バックエンドのみ。地図APIの限定はCURRENT-PROPOSAL |
| 518〜521 未確定 | [38a §5](../architecture/sync-and-cache/38a_shared-source-and-device-cache.md#5-未確定確認待ちと再検討条件)・[38b §3](../architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md#3-中央のsyncqueue監査の未確定) | PENDING-S7E-CACHE-DETAIL・VERIFY-S7E-DEVICE-DIFF・PENDING-S7E-SYNCQUEUE-AUDIT。「競合解決」の未確定を根拠にA4採番へ排他制御を戻さない（35c §3.3を維持） |
| 決定の要約 | [ADR-0026](../decisions/ADR-0026-shared-source-confirmation-and-timing-separation.md)・[ADR-0027](../decisions/ADR-0027-storage-ownership-and-cost-boundary.md) | いずれもProposed。ADR-0026は0002・0003、ADR-0027は0001・0002・0018のClarifies。Accepted本文は不変 |

## 5. Responsibility Check・状態・旧設計の処置

共有正本と端末cache・正本確認・時点分離は、11（権威のライフサイクル）・14（キューの型・ストレージ保護）と、主責務（cacheの鮮度・正本確認の時点）・ライフサイクル（取得→表示→確認）・独立変更可能性が異なるため、新領域`sync-and-cache`を作り38a・38bに分けた。38aと38bは、対象（データの鮮度と、確定処理の時点）・変更理由が異なるため分けた。保存の所有と費用の境界は、37（Drive責任構造）の主責務（保存の置き場）に近く、新文書を作るほどの責任の差がないため、37 §6へ配置した。決定は、権威モデル（ADR-0002）に触れる38系と、費用・保存の所有（ADR-0001・0018）に触れる37 §6の変更理由が異なるため、ADR-0026とADR-0027に分けた。

| 観点 | 確認した境界 |
|---|---|
| 保守性・追加実装性 | 権威（11）・キュー（14）・画面（34a／34c）・リスト整理の意味（24b）の正本は保持し、cacheの鮮度・正本確認・時点分離を38a・38bへ分離。新しい共有データを足しても既存の責任を変えない |
| 堅牢性・障害復旧性 | 通信の状態が現場の記録を止めない時点分離。未同期のA4・KMLを保持して後続同期。DIPSの自動再POSTを禁止する33bを維持。端末のストレージ喪失の限界は19に従う |
| セキュリティ | 実Drive ID・実名・登録記号・個人情報を複写しない。DIPS用バックエンドを最小の責務に限定する16・33aを維持 |
| 検証可能性・監査性 | 実機差をVERIFYに、cache実装・中央の監査記録をPENDINGにし、決定を解決済みに見せない。既存のPENDINGを解決していない |
| 可観測性 | 同期状態の判断の方向（最終同期日時・未同期件数・最新確認済みか）をCURRENT-PROPOSALとして記録。監視基盤は追加しない |
| 複数ユーザー・複数組織 | 環境ごとの保存は31・37に従う。複数組織の物理的な所有・移管はPENDING-S6-DRIVE-PLACEMENT・PENDING-S2-OWNERSHIPのまま |

| 状態 | 対象 |
|---|---|
| CURRENT-ACCEPTED | 共有の正本＝各環境のDrive／Sheets、端末cache＝複製。一般マスターを固定TTLだけで捨てない、飛行リストは業務状態で整理、重要な時点の正本確認と変更台帳のみの再取得、cache先行表示、別端末追加の計画の反映、offlineの意味、三時点への分離、未同期の保持、別系統の再試行、中央ストレージへ集約しない費用の境界 |
| CURRENT-PROPOSAL | 同期状態の判断（最終同期日時・未同期件数・最新確認済みか）、地図等の従量APIを必要な場合に限定する方向 |
| PENDING | PENDING-S7E-CACHE-DETAIL（38a §5）、PENDING-S7E-SYNCQUEUE-AUDIT（38b §3）。ID索引は[04](../04_open-questions.md#step-7eの未確定検証先) |
| VERIFY | VERIFY-S7E-DEVICE-DIFF（38a §5） |
| HISTORICAL | 旧アプリの入力途中の端末保持と一括保存の思想（35dが正本）。旧06の叩き台（SyncQueue・AuditEvents・ExportJobs・ErrorLog）の構成。旧の費用分析（04_cost）は当時の構成・無料枠の記録 |
| EVIDENCE/EXAMPLE | 旧実装・旧の図・現場操作マニュアル・旧06の叩き台の実物。今回未再確認 |
| NEW-PROPOSAL | なし |

11・14・35d・25e・27e・24b・34a・34cの本文は保持し、削除・置換していない。追加したのは正本・cache・時点分離の記録、費用の境界、参照リンクである。

## 6. 変更ファイル・検査

| 種別 | 文書 | 主責任 |
|---|---|---|
| 新規 | [sync-and-cache README](../architecture/sync-and-cache/README.md) | 同期・cache設計群の入口 |
| 新規 | [38a](../architecture/sync-and-cache/38a_shared-source-and-device-cache.md) | 共有正本と端末cache・正本確認・offlineの意味 |
| 新規 | [38b](../architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md) | 確定・保存・外部反映の時点分離・中央SyncQueue未確定 |
| 新規 | [ADR-0026](../decisions/ADR-0026-shared-source-confirmation-and-timing-separation.md) | 共有正本・正本確認・時点分離の判断の要約（Proposed） |
| 新規 | [ADR-0027](../decisions/ADR-0027-storage-ownership-and-cost-boundary.md) | 保存の所有と費用の境界の判断の要約（Proposed） |
| 新規 | [本書](99-2-step-7e-causal-audit.md) | 移管・証拠・確認範囲の索引 |
| 変更 | 37 | §6（保存の所有と費用の境界）の追加 |
| 変更 | 10／11／14／24b／34c／35d | 38a・38b・37 §6への参照。本文の権威・キュー・画面・リスト整理・最終保存の定義は保持 |
| 変更 | 23／04 | Step 7eの範囲と接続、未確定の案内 |
| 変更 | decisions README／migration README／architecture README／00_index／AGENTS.md／README.md | 索引・停止位置 |

### 検査結果

- 検査はリポジトリ外の作業用ディレクトリに置いた読取専用スクリプトで実施した（リポジトリにはファイルを作らない）。過去Stepの件数とは数え方が異なるため、単純比較しない。
- Markdown 137文書（docs/ 134文書）、182表、52コードブロック、相対リンク1,960件（アンカー付き303件）を検査し、参照先ファイル・アンカー・表列数・閉じ忘れのエラー0、入口から到達できない文書0。
- 変更は上記21文書（変更15・新規6）のみで、削除0。削除された行は、日付・停止位置・表の行・文の書き換えだけで、11・14・35d・24b・34c・10の定義本文は、参照の追記を除いて保持した。差分を読み、Step 7e以外の変更が混入していないことを確認した。
- コード・設定の差分は0。`redo/99-2-causal-migration`は`01eeac3`、mainは`6344d7a…`のまま。99.2原本のSHA-256は`f31b4856…`で不変、Git管理外のまま。
- 追加した行と新規文書の全文を、個人名・メール・ユーザーパス・IPv4・登録記号・Drive ID風のトークン・画像やOffice文書のファイル名・秘密情報の語で走査し、実の該当0（相対リンクのファイル名・アンカーに反応した長い文字列のみ）。
- 責任重複: 新規のPENDING／VERIFYは38a §5と38b §3のみで定義し、他は参照。38a・38bは、11の権威、14のキューとストレージ保護、25e・27e・35b・35dの各時点、24bのリスト整理の意味、33bの再試行の定義を複写していない。37 §6は04_costの旧分析を現行の保証として使っていない。Accepted ADRの本文は不変。
- 複数ファイルで太字定義されるID 8件は過去Stepから存在するもので、Step 7eのIDは含まない。

これは文書移管・構造検査の完了であり、cache・同期の実装、実機でのcache挙動・iPhone／Androidの差の確認、中央SyncQueue・監査の要否の確定ではない。既存のPENDING／VERIFYを独自に解決していない。
