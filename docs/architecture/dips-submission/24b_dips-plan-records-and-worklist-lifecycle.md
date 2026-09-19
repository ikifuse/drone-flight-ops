# 24b. 06の記録責任と作業台帳のライフサイクル

最終更新: 2026-09-19\
状態: CURRENT-ACCEPTED（現在の設計ベースライン。C1未着手。個別の`PENDING`／`VERIFY`は未確定・未確認）\
主責務: 06_DIPS関連が持つ記録の責任、人が見る作業台帳と内部の履歴・証跡の分離、計画が作業対象でなくなる意味（取消・整理）。提出台帳の列と同期順序、画面、通報状態は各正本\
由来: 99.2 §7の06への保存・取消・リスト整理・1枚台帳、§9のリスト整理の意味（Step 7b）。判断の要約は[ADR-0022](../../decisions/ADR-0022-drive-responsibilities-and-human-records.md)（Proposed）の追補、移管と確認範囲は[Step 7b監査](../../migration/99-2-step-7b-causal-audit.md)\
入口: [Manual通報・Sheets台帳設計群](README.md)

## 1. 06が持つ記録と持たない記録

**当初状態（既存Docs）**: 37は01〜07のうち06を「運用環境の飛行計画と通報台帳」とし、詳細を24aへ委ねた。24aはDIPS飛行計画台帳を、提出試行ごとに1行、不変Snapshotと通報履歴を保持する台帳（SSoT）として定めた。34cは、これから扱う計画を共有する軽量な作業リストを、別の正本として置いた。

**現在の到達点（CURRENT-ACCEPTED。99.2 §7）**: DIPS通報内容・Geometry・受付や通報の証跡の正本責務は06にあり、実際に飛行した記録は04の運航記録・日常点検、派生のKMLは07に置く。この分離は既存のものを維持する。99.2は、06の計画・Snapshot・Geometry・通報／受付の証跡を`flight_id`で保持するとするが、既存のDomainは`flight_plan_id`と`submission_id`で結んでいる。`flight_id`との対応（柔軟な1飛行との関係）は未確定である（PENDING-S7B-FLIGHT-KEY）。

## 2. 人が見る作業台帳と内部の履歴・証跡を分けた因果

**当初状態（HISTORICAL）**: 確認用の叩き台には、利用者が見る作業台帳の1シートのほかに、技術用の複数タブ（00_README、FlightPlans、FlightPlanAircraft、FlightPlanPilots、PlannedOccurrences、DipsSubmissions、DipsNotifications、GeometrySnapshots等）を置いた時期がある。

**問題・調査**: 技術用の複数タブは、利用者が確認する1枚の台帳という前提と違った。99.2は、そのため削除したと記録する。

**現在の到達点（CURRENT-ACCEPTED）**: 人が見る作業台帳は1シートで成立させ、予定日時・飛行場所・機体・操縦者／通報者・DIPS状態を確認できるものとする（表示の意味は[34c §2](../presentation/34c_shared-flight-worklist.md#2-カードの情報と絞り込み)）。技術用の複数タブを利用者向けの台帳として復活させない。内部の保持方法は、人が見る台帳を複数タブへ分割する理由にしない。内部の履歴・証跡は、作業台帳とは別の責任として保持する。

**24aとの関係**: [24a §2](24a_submission-and-sheets-ledger.md#2-googleスプレッドシートdips飛行計画台帳仕様)のDIPS飛行計画台帳は、履歴・証跡の論理schemaである。作業台帳と同じ保存物だとは確定せず（[24a §1.5](24a_submission-and-sheets-ledger.md#15-共有作業リストとの責任分離)）、履歴の列をそのまま作業台帳の列にしない（[34c §5](../presentation/34c_shared-flight-worklist.md#5-未確定と適用限界)）。履歴・証跡の物理保存は、PENDING-LEDGER-SNAPSHOT（24a §3）とPENDING-S6-DRIVE-PLACEMENT（[37](../drive-structure/37_environment-storage-responsibilities.md#4-旧実物サンプル未確定の扱い)）に従う。

**EVIDENCE/EXAMPLE**: 実Driveの1シートの台帳と削除の経緯は99.2の記録で、今回再確認していない（VERIFY-S5-LIST-EVIDENCE）。タブ名が存在した・しなかったことだけで、内部schemaの採用・不採用を決めない。

## 3. 計画が作業対象でなくなる意味（取消・整理）

**当初状態**: 12dは、運航中止等で計画を取り消す場合に、操縦者がDIPS側で取消手続きを行い、アプリ側で取消を打刻し、過去のSnapshotを削除しないと定めた（[12d §7](../domain-model/12d_flight-plan-and-dips.md#7-不変提出スナップショットと改訂取消)）。34c・34dは、取消とリスト整理を後続に残していた。

**問題**: 事故・急病・通信不能等で、予定時刻までにDIPS側の操作ができない現実がある。取消できなかった計画を、アプリの作業リストへ永久に残す理由にはならない（99.2 §7）。

**現在の到達点（CURRENT-ACCEPTED）**:

- 飛行を中止するときは、制度上可能な範囲でDIPS側の取消を行う。
- 飛行完了・中止・予定日時経過で作業対象でなくなった計画は、共有飛行リストとその端末cacheから整理・削除できる設計にする。
- 飛行リストは過去通報の監査台帳にしない。
- 整理はリスト表示とcacheの整理であり、06の提出履歴・Snapshot・受付証跡や04の実飛行記録の削除ではない（12d §7の過去Snapshot保持と、正本責務が06にあることからの帰結）。
- 業務状態に基づく整理は、一般のマスターcacheを固定TTLだけで捨てる扱いとは別で、混同しない。cacheの方針は§9の再移植へ残す。

**適用条件**: 取消の手続き・打刻・状態は[12d](../domain-model/12d_flight-plan-and-dips.md)・[13b](../state-machines/13b_dips-submission.md)が正本で、本書は再定義しない。DIPS側の取消の可否と範囲は制度と実画面に依存し、本書では確定しない。

## 4. 重複あり時の調整

99.2は、重複ありの調整フローを通常系と混ぜず、別論点として保持し、回収継続とする。34cは「通報済み・重複あり」の表示までを保持する。調整の操作、重複の意味、取消や再通報との関係は、原本も回収できていないため推測で埋めない（PENDING-S7B-DUPLICATE-ADJUST）。

## 5. 未確定・確認待ちと再検討条件

| ID | 内容 |
|---|---|
| PENDING-S7B-FLIGHT-KEY | 06の記録を結ぶキー。99.2の`flight_id`と、既存Domainの`flight_plan_id`・`submission_id`、柔軟な1飛行（[35a](../operation-recording/35a_flexible-flight-and-details.md)）、複数Missionとの対応。新しいIDを本書で追加しない |
| PENDING-S7B-CLEANUP-CONDITION | 作業対象でなくなる正確な時点・条件（完了・中止・予定日時経過のそれぞれ）、取消できなかった場合の記録、共有リストとcacheの整理の実行契機 |
| PENDING-S7B-DUPLICATE-ADJUST | 重複あり時の調整フロー。新規のDIPS実画面の確認が要る |

既存のまま維持: PENDING-S5-LIST-DETAIL（作業リストの物理保持・共有反映・cache、34c）、VERIFY-S5-LIST-EVIDENCE、PENDING-LEDGER-SNAPSHOT、PENDING-S6-DRIVE-PLACEMENT。

**再検討条件**: 作業台帳が1シートで成立しない件数・列の実態が確認された場合、履歴・証跡の物理保存が決まった場合、複数ユーザー・複数組織で共有範囲や権限が変わる場合。共有範囲は[34c §1](../presentation/34c_shared-flight-worklist.md#1-保存済み計画の選択から共有作業リストへ)と[31b](../identity-and-access/31b_roles-and-access-control.md)に従い、環境や利用者をまたいで無制限に公開しない。
