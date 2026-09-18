# 33b. DIPS API可用性と再試行の通信境界

最終更新: 2026-09-18\
由来: 99.2 §7の再試行原則、基準DocsのManual独立・API Optional。詳細FSMや画面遷移の再移植は対象外。

## 1. API基盤をアプリ全体の起動条件にしない

**当初状態・問題**: 旧15／19／24と[ADR-0006](../../decisions/ADR-0006-dips-optional-and-manual-submission-ledger.md)は、申請の可否・審査の長期化・credential未発行・API障害がアプリ完成と現場記録を止める問題に対して、ManualDipsAdapterを第一級とした。接続基盤を[33a](33a_fixed-egress-and-api-connection.md)へ変更しても、この問題は残る。

**検討・現在到達点（CURRENT-ACCEPTED）**: Google Cloudバックエンドや固定IP経路が使えない場合も、手動通報支援とAPI非依存の計画・現場記録は独立して成立させる。API未承認、credential未発行、接続不能、バックエンド障害をアプリ必須起動条件にしない。C6のManualとC7のAPI統合を分ける理由は、API取得成否で完成を阻害せず後から経路を追加できるためである。99.2 §7の手動／API経路の分離とも整合するが、今回そのUI・Snapshot詳細は再移植しない。

**適用条件**: 手動入力支援が利用できることは、完全圏外やDIPS Web自体の停止中にも正式通報できるという保証ではない。DIPS Webへの通報・確認にはその通信が必要である（[24](../dips-submission/24_manual-submission.md)）。API結果不明の提出を、確認なくManualで再提出する扱いにも広げない。現場記録の継続と法的な離陸可否は[13c](../state-machines/13c_takeoff-readiness.md)の別責任である。

## 2. 通常同期とDIPS正式通報を分けた因果

**当初状態**: [14](../14_offline-and-sync.md)は外部送信をSyncQueueで保持する一方、Sheets等とDIPSの重複防止を分けていた。[13b](../state-machines/13b_dips-submission.md)には結果不明・照合待ちがあり、[ADR-0004](../../decisions/ADR-0004-dips-adapter-architecture.md)にもPOST切断時の再送を避ける理由がある。単一の汎用retryへ統合する設計ではない。

**問題・99.2で詰めた内容**: §7は、Drive／Sheets保存、KML保存、DIPS正式通報を同じretryにしないと明示する。DIPSへの送信途中で切断すると、端末側の失敗だけではDIPS側が登録したか分からない。同じPOSTを内容確認なしに繰り返すと二重通報になり得るため、通常保存の再送可能性をDIPSへ流用できない。

**検討・現在到達点（CURRENT-ACCEPTED）**: 登録成否が不明なら、その結果不明を保持する。DIPS側との照合・利用者確認等を経て未登録と確認できた場合だけ再送し、同じPOSTを盲目的に自動実行しない。SheetsやKMLの保存失敗を契機にDIPSへ再通報しない。旧15の「Idempotency-Keyを解釈しない」という仕様断定を今回再認定するのではなく、未確認の重複防止保証へ依存しない境界として保持する。

**変更しない詳細正本**: 本書は通信安全境界の因果を定める。状態名・全遷移・照合UIは13b、キューの型・通常同期の再試行は14、APIの照合契約は15のVERIFYへ接続する。新しいUNKNOWN状態・endpoint・自動照合条件を追加しない。KMLの生成・保存・最終送信時再送、共有飛行リスト、正常応答後・重複あり時のUIは後続の§7再移植へ残す。

## 3. 未確定と検証観点

- **VERIFY-S4-API-CONTRACT**（詳細正本[16](../16_security.md#9-step-4の認証確認と保持方式の未確定)）: 正式APIの認証・照合・重複防止契約。現在の未受領状態から検索APIの利用条件や結果判定を確定しない。
- **PENDING-C7-INFRA**（詳細正本33a）: 障害監視・ネットワーク復旧の具体構成。**PENDING-S4-SESSION**（詳細正本16）: 最小一時状態・セッション・トークンの保持方式。中央DB非採用から状態保持禁止を導かない。
- **受入時に追う意味**: API基盤なしでもManual支援・現場記録が起動すること。DIPS POSTの結果不明が通常同期の再送へ混入しないこと。別保存の失敗でDIPS通報を重複させないこと。これらは後続実装の検証観点であり、本Stepで実装・実通信試験を行ったという記録ではない。
