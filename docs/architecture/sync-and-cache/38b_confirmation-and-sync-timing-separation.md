# 38b. 確定・保存・外部反映の時点分離

最終更新: 2026-09-19\
状態: CURRENT-ACCEPTED（現在の設計ベースライン。C1未着手）。個別の`PENDING`／`VERIFY`は未確定・未確認\
主責務: 計画の確定・逐次保存・最終送信という別の時点に確定処理を分ける意味、未同期の保持、別系統の再試行の整理、中央SyncQueue・監査の未確定。各時点の詳細は25e・35b・35d・27e、キューは14\
由来: 99.2 §9の入力保護と送信時点の分離、未確定（Step 7e）。判断の要約は[ADR-0026](../../decisions/ADR-0026-shared-source-confirmation-and-timing-separation.md)（Proposed）、移管と確認範囲は[Step 7e監査](../../migration/99-2-step-7e-causal-audit.md)\
入口: [同期・cache設計群](README.md)

## 1. 本書の位置づけ

本書は、確定処理を別の時点に分ける意味を一か所で追えるようにする入口で、各時点の詳細は複製しない。①の不変Snapshotは[25e §3](../dips-flight-plan/25e_common-source-and-submission-boundaries.md#3-不変submission_snapshotをapiの有無に関わらず持つ理由)と[14](../14_offline-and-sync.md)の§3.4、KMLは[27e §4](../output/27e_kml-generation-timing-and-content.md#4-生成契機保存未同期保持再送)、②③の途中保護と最終保存は[35b](../operation-recording/35b_normal-operation-and-final-save.md)・[35d](../operation-recording/35d_operation-finalization-and-write-boundary.md)、DIPSの再試行は[33b](../dips-infrastructure/33b_api-availability-and-retry-boundaries.md)が正本。

## 2. 三つの時点に分けた因果

**当初状態（旧アプリ）**: 旧アプリは、通常の飛行操作を都度外部へ送らず、入力の途中を端末に保持し、飛行後点検後の一括保存が成功するまで下書きを消さなかった。保存の失敗・再読込・応答だけが失われた場合も、同じ運航を復元・再送して重複を防いだ。詳細と現在への継承は[35d §1〜§3](../operation-recording/35d_operation-finalization-and-write-boundary.md)。

**現在の到達点（CURRENT-ACCEPTED。99.2 §9）**: 新アプリはこの思想を拡張し、確定処理を三つの別の時点に分ける。

| 時点 | 端末での扱い | 外部への反映 | 詳細正本 |
|---|---|---|---|
| ① 飛行計画の確定・DIPS通報時 | `submission_snapshot`と共通Geometryを先行して確定し、不変に保存する | 同じ通報内容とGeometryのKMLを生成して07への保存を試みる。台帳同期ジョブを登録するが、Sheets同期はDIPS通報の前提にしない | 25e §3、14 §3.4、27e §4 |
| ② 飛行前点検から飛行後点検まで | 飛行前点検・離陸・着陸・BAT交換・再飛行・飛行後点検を、端末へ逐次保存する | 04・BAT・累計の外部への確定保存は③で行う | 35b、35d §2 |
| ③ 飛行後点検後の最終送信 | 操縦者の最終送信で、04のA4日付・連番シート、BAT履歴、機体累計等を確定保存する | 同じ利用者操作で、①で未同期のKMLも再送する（PENDING-S7C-KML-FINAL-SEND、35d） | 35c、35d、27e §4 |

**通信できない場合**: 最終送信のときも通信できなければ、A4側の確定記録とKMLの未同期の状態をそれぞれ保持して、後続の同期を行う。すでに07へ保存済みのKMLは、最終送信で重複して保存しない。

**別系統の再試行**: Sheets・KMLの再同期とDIPS通報の再試行は別系統とし、DIPSだけは結果不明のときに自動で再POSTしない（33b）。

**三つの時点を混同しない**: KMLの内容確定と初回生成は①、未同期KMLの再送機会の一つは③、A4運航記録の内容確定は飛行後点検後である（27e §4）。

## 3. 中央のSyncQueue・監査の未確定

**当初状態（EVIDENCE/EXAMPLE）**: 旧の叩き台には、SyncQueue、AuditEvents、ExportJobs、ErrorLogを置いて実物で確認した時期がある。未同期データの本体は端末側に保持する一方、06側のSyncQueueを監査・診断用に残すかは未確定としていた。現在の運用環境の01〜07には、この領域はない（[37 §2](../drive-structure/37_environment-storage-responsibilities.md#2-0107の現在責任)）。

**現在の到達点**: 「端末へ先に保持してから同期する」という方針から、中央のSyncQueueを恒久的に保持することまでを自動的には決めない。監査・診断に本当に必要かは、実装時に再評価する。

- **PENDING-S7E-SYNCQUEUE-AUDIT**: 06または別の領域に、SyncQueue・監査・エラーの記録を残すか。端末側のSyncQueue（14）と、AuditEventの記録（[12f](../domain-model/12f_common-lifecycle-id-and-audit.md)）との関係。

## 4. 未確定・関連

既存のまま維持: PENDING-S6-FINAL-SAVE-CONTRACT・PENDING-S7C-KML-FINAL-SEND（35d）、PENDING-LOCAL-RESTORE（04）。cacheの具体実装・retryの回数と間隔・競合の解決方針・backgroundの挙動・UI・実機差は[38a §5](38a_shared-source-and-device-cache.md#5-未確定確認待ちと再検討条件)。端末のストレージを失った場合の限界は[19](../19_failure-recovery.md)に従う。

**再検討条件**: 実運用で、①〜③の分け方が現場の操作や復旧に合わないと確認された場合、中央の監査・診断の記録が必要と実証された場合。
