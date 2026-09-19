# 99.2再移植 Step 7b — 06の記録責任・作業台帳・取消／リスト整理の監査

最終更新: 2026-09-19

## 1. 対象と基準点

- 作業ブランチ: `claude/99-2-continuation`。開始HEADは[Step 7a](99-2-step-7a-causal-audit.md)の完了commit `1695c72e2ddae1d32b3908c26293fdd1e01ec2e1`、開始時working treeはclean。
- 保全: `redo/99-2-causal-migration`（`01eeac3`）と比較用main／origin/main（`6344d7a0816eef4adc69d2cbe948dbefa4352019`）は変更・push先にしない。
- 原本: 現在の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。Git管理外のローカルファイルで、変更・追跡追加しない。SHA-256は開始時から不変。
- 移管範囲: §7の06への保存責任、取消とリスト整理の意味、1枚の作業台帳と技術用複数タブの経緯、重複あり調整の位置づけ。§9のリスト整理の意味（業務状態による整理）。
- 対象外: KMLの生成・保存・再送、§8、§9のcache・正本確認・同期・コスト、§11、コード・C1実装、DIPS操作、Drive操作。

本書は対応・証拠・確認範囲の索引。詳細理由の正本は[24b](../architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)。旧mainのStep成果・ADRのコピー／cherry-pick／転用は行っていない。2026-09-19の追補（A4の機体別保存・命名）は範囲外で変更していない。

## 2. 原本の識別と範囲の切り出し

UTF-8の元バイト列（各行末の改行を含む）のSHA-256。行番号は今回の同一原本に対する1始まりの位置であり、将来版への固定参照ではない。

| 検査対象 | 行・範囲 | SHA-256 |
|---|---|---|
| 原本全体 | 全文の同一性（620行）。全文を今回移植する意味ではない | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| 保存への反映（06） | 395〜396。397〜401はStep 5で移管済み | `9ab62cab6d6adcb61728f8f008eeca52c1c5844bbbd342baa1b00ca310802e70` |
| 取消・リスト整理・既存分離 | 402〜404 | `7631bb5f82806cf61bf940d3b54486dd6f41a4c38908072818fa020ec7aa1cc9` |
| 1枚の作業台帳の実物確認 | 410〜412。Step 5は一覧の見え方の証拠に限定して使用。今回は責任と経緯を移管 | `ba2dc804302868d96a5bc9996d1b3e04acdd3e20ccbf44b5c22ada6a4c814af2` |
| 未確定・回収継続 | 413〜414のうち重複あり調整・自動整理の時点。作図・API表現の部分はStep 7aで移管済み | `c25c7dc8bb963d2fdcdb82a48b2106b631ee606e570e3af76d24a8f6115c90ca` |
| リスト整理と一般cacheの区別 | §9の494〜495。cacheと正本確認の方針は対象外 | `31e511fda203fc0f4b881c562def06773a418b89c448a4f26aad35643f923492` |

405〜409（KML）、§9の他の行、§8、§11は今回の対象外で、読んで境界を確認したことと再移植したことを区別する。

## 3. 証拠経路と直接確認の範囲

| 証拠経路 | 今回確認した内容 | 限界 |
|---|---|---|
| 99.2原本 | 対象範囲（上表）を直接読み、他Step・後続への境界を識別 | 原本が記録する実Drive・削除の経緯を今回確認したわけではない |
| 現在の正式Docs | 24a（§1〜§3・§5・§6）、34c・34d、37、12d（§4・§7）、35a・12e（`flight_id`）、ADR-0022・decisions README、dips-submission README、Step 5監査 | 全設計領域を99.2全文と対照した監査ではない |
| Git履歴 | 開始commit `1695c72`、Step 5〜6の該当記述を対照 | 旧mainのADR・Step成果は本文を移管元にしていない |
| 実Drive・DIPS実画面 | 今回アクセス・操作していない | 既存のVERIFY-S5-LIST-EVIDENCEに接続 |

実Drive ID・実名・登録記号を正式Docsへ複写せず、証拠の種類と確認限界を残す。

## 4. 論点ごとの詳細正本

| 原本の論点 | 詳細正本 | 移管した因果・境界 |
|---|---|---|
| 396・404 06が持つ記録 | [24b §1](../architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md#1-06が持つ記録と持たない記録) | 通報内容・Geometry・受付証跡は06、実飛行は04、派生KMLは07。結び付けキーは`flight_id`だが既存Domainと食い違い、PENDING-S7B-FLIGHT-KEYとして保持 |
| 410〜412 作業台帳と技術用複数タブ | [24b §2](../architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md#2-人が見る作業台帳と内部の履歴証跡を分けた因果) | 1シートの作業台帳、技術用タブを復活させない、内部の保持方法を分割理由にしない。24aの履歴schemaとの関係 |
| 402・403・494〜495 取消・整理 | [24b §3](../architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md#3-計画が作業対象でなくなる意味取消整理) | 制度上可能な範囲での取消、作業対象でなくなった計画の整理・削除、監査台帳にしない、整理は履歴の削除ではない、固定TTLとの区別 |
| 414 重複あり調整・自動整理の時点 | 24b §4・§5 | PENDING-S7B-DUPLICATE-ADJUST、PENDING-S7B-CLEANUP-CONDITION |
| 決定の要約 | [ADR-0022](../decisions/ADR-0022-drive-responsibilities-and-human-records.md)追補 | Proposedのまま追補。新規ADRは作らない |

## 5. Responsibility Check・状態・旧設計の処置

06の記録責任と作業台帳の分離は、24aの提出台帳schema・34cの作業リスト画面・37のDrive全体責任と、主要責務・ライフサイクル（作業リストの整理は日常的、履歴は恒久）・独立変更可能性が異なるため、既存のdips-submission領域へ新文書24bを追加した。新しい責任領域は作らない。判断はADR-0022と同じ「人間向け記録媒体を内部の保持から分ける」領域のため新ADRを作らず追補とした。

| 観点 | 確認した境界 |
|---|---|
| 保守性・追加実装性 | 24aの列、34cの画面、37の配置は変えず、責任の境界を24bへ集約。履歴の列を作業台帳へ流用しない |
| 堅牢性・障害復旧性 | 整理は表示とcacheの整理で提出履歴・証跡・実飛行記録を削除しない。取消できなかった場合も作業リストへ永久に残さない |
| セキュリティ | 作業台帳は環境単位で共有し、環境や利用者をまたいで無制限に公開しない（34c・31b）。実Drive ID・実名を複写しない |
| 検証可能性・監査性 | 作業リストを監査台帳にせず、履歴・証跡を別責任に保つ。実物・原本・設計採用を別出典で追跡 |
| 可観測性 | 新しい監視・ログ基盤を追加しない |
| 複数ユーザー・複数組織 | 共有範囲・権限は31b・34cに従う。個人環境の実例を固定しない |

| 状態 | 対象 |
|---|---|
| CURRENT-ACCEPTED | 06の記録責任、1シートの作業台帳と内部の履歴・証跡の分離、技術用複数タブを利用者向けに復活させないこと、取消と整理の意味 |
| PENDING | PENDING-S7B-FLIGHT-KEY、PENDING-S7B-CLEANUP-CONDITION、PENDING-S7B-DUPLICATE-ADJUST（24bが保持）。既存のPENDING-S5-LIST-DETAIL、PENDING-LEDGER-SNAPSHOT、PENDING-S6-DRIVE-PLACEMENTは解消していない |
| VERIFY | 既存のVERIFY-S5-LIST-EVIDENCE（実Drive・削除の経緯）。新規なし |
| HISTORICAL | 技術用の複数タブ構成（叩き台の一時期） |
| EVIDENCE/EXAMPLE | 実Driveの1シートの台帳。今回未再確認 |
| CURRENT-PROPOSAL・NEW-PROPOSAL | なし |

24aの提出台帳schema、34cの画面仕様、37の七責任は保持し、削除・置換していない。追加したのは責任の境界・因果・未確定と参照リンクである。

## 6. 変更ファイル・検査

既存変更15、新規2、削除0。すべてMarkdown文書。

| 種別 | 文書 | 主責任 |
|---|---|---|
| 新規 | [24b](../architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md) | 06の記録責任、作業台帳と履歴・証跡の分離、取消・整理の意味 |
| 新規 | [本書](99-2-step-7b-causal-audit.md) | 移管・証拠・確認範囲の索引 |
| 変更 | [ADR-0022](../decisions/ADR-0022-drive-responsibilities-and-human-records.md) | 06の作業台帳の追補（Proposedのまま） |
| 変更 | 24a／34c／34d／37／12d／dips-submission README | 24bへの参照・登録（本文の型・手順・画面・七責任は不変） |
| 変更 | decisions README／migration README／architecture README／00_index／04／23／AGENTS.md／README.md | 索引・停止位置・未確定の案内 |

### 検査結果

- 検査はリポジトリ外の作業用ディレクトリに置いた読取専用スクリプトで実施した（リポジトリにはファイルを作らない）。過去Stepの件数とは数え方が異なるため、単純比較しない。
- Markdown 124文書（docs/ 121文書）、157表、52コードブロック、相対リンク1,683件（アンカー付き241件）を検査し、参照先ファイル・アンカー・表列数・閉じ忘れのエラー0、入口から到達できない文書0。
- 変更は上記17文書（変更15・新規2）のみで、削除0。削除された行は、日付・停止位置・表の行・文の書き換えだけで、24aの列定義・34cの画面仕様・37の七責任・12dの取消手続きの本文は削除していない。差分を読み、Step 7b以外の変更が混入していないことを確認した。
- コード・設定の差分は0。`redo/99-2-causal-migration`は`01eeac3`、mainは`6344d7a…`のまま。99.2原本のSHA-256は`f31b4856…`で不変、Git管理外のまま。
- 追加した行と新規文書の全文（189行）を、個人名・メール・ユーザーパス・IPv4・登録記号・Drive ID風のトークン・画像やOffice文書のファイル名・秘密情報の語で走査し、該当0。
- 責任重複: 新規のPENDING-S7B-*は24b §5のみで定義し、他は参照。24bは24a・34c・37・12d・13bの列・画面・七責任・取消手続きの定義を複写していない。Accepted ADRの本文は不変。ADR-0022（Proposed）は追補のみ。

これは文書移管・構造検査の完了であり、06の結合キー・整理の条件・重複あり調整・物理保存の確定、実Drive・実画面の受入完了ではない。既存のPENDING／VERIFYを独自に解決していない。
