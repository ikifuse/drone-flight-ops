# 25e. 共通源とManual／API・DIPS対象外の境界（因果）

最終更新: 2026-09-19\
状態: CURRENT-ACCEPTED（現在の設計ベースライン。C1未着手。個別の`PENDING`／`VERIFY`は未確定・未確認）\
主責務: DIPS実画面の観測から、FlightPlan・FlightAreaGeometry・不変`submission_snapshot`を共通の源とし、Manual／API経路とDIPS対象外を分けた因果、却下案、限界、再検討条件\
由来: 99.2 §7の実画面確認・共通源・Manual／API経路・DIPS対象外（Step 7a）。[ADR-0004](../../decisions/ADR-0004-dips-adapter-architecture.md)・[ADR-0006](../../decisions/ADR-0006-dips-optional-and-manual-submission-ledger.md)（Accepted）の決定は変更しない。決定の要約は[ADR-0023（Proposed）](../../decisions/ADR-0023-common-source-and-derived-submission-paths.md)、移管と確認範囲は[Step 7a監査](../../migration/99-2-step-7a-causal-audit.md)\
入口: [DIPS Flight Plan設計群](README.md)

## 1. 本書の位置づけ

本書は「なぜ共通の源を置き、経路と出力を派生させるのか」「観測から設計へ何を採用し、何を採用していないのか」を保持する。型・手順・電文・判定の定義は複製せず、各正本に従う。正本関係は[25 overview §3](25_overview.md#3-正本関係と証拠の扱い)、通報要否と離陸評価は[13c](../state-machines/13c_takeoff-readiness.md)、DIPS状態は[13b](../state-machines/13b_dips-submission.md)、通信可用性と再試行は[33b](../dips-infrastructure/33b_api-availability-and-retry-boundaries.md)、提出台帳は[24a](../dips-submission/24a_submission-and-sheets-ledger.md)。

## 2. 実画面の観測から共通Geometryへ至った因果

**当初状態（既存Docs）**: 26は、2026-09-14にオーナー本人がDIPS Web「飛行計画 新規作成」を最終通報の実行前まで操作した観測（99.2はPC版の実操作として記録する）を、OBSERVED／INFERRED／PENDINGで保持した（`05c7852`）。17はその観測を根拠に、元形状を保って各境界で変換する中立の`FlightAreaGeometry`を型正本とした。25 overview（旧25を`ea73d08`で分割）は、入力済みの情報を最大限再利用し、APIの有無でFlightPlanや現場運航設計を作り直さないという通報入力支援原則を置いた。一方、飛行範囲をDIPS用・KML用・アプリ用に別々に作らない要求と、それが計画・提出Snapshot・経路の分岐へ連なる因果、および二系統ある実画面証拠の区別は、詳細正本として保持されていなかった。

**確認した事実（EVIDENCE/EXAMPLE。今回は再確認していない）**: 99.2 §7は、PC版の実操作（最終送信直前まで）、別証拠として保持するスマホ版の画面、円・多角形・線＋幅の作図と編集・削除・半径10mの選択まで実操作した流れを過去会話から回収した記録、および過去調査によるAPI側の整理（Polygon／Circle、`flyRoute`）を挙げる。証拠系列の区別・確認範囲・未回収事項は[26 §1.3](../26_dips-web-ui-verification.md#13-証拠系列と回収範囲)に置く。本書は、そこから設計へ何を採用したかだけを扱う。

**問題**: 実画面には地図上で円・多角形・線＋幅を描く操作があり、同じ飛行範囲はDIPS通報だけでなくKMLやアプリ内表示にも使う。99.2は、用途ごとに同じ範囲を再入力させたくないことを、共通の構造へ進んだ理由として挙げる。

**検討案と却下理由**:

| 案 | 判断 | 理由・出典 |
|---|---|---|
| A. DIPS Web用とAPI用に別々の飛行計画を作る | 採らない | 99.2 §7が明示。ADR-0006も、APIは同じデータモデル上で最後の送信経路だけを切り替えるOptionalとする |
| B. 飛行範囲・経路をDIPS用・KML用・アプリ用に別々に作る | 採らない | 99.2 §7が明示。用途ごとに同じ範囲を再入力させたくない |
| C. DIPS API専用の形式をアプリの内部モデルにする | 既決の却下 | ADR-0004の選択肢B。本書で再判断しない |
| D. 共通の`FlightAreaGeometry`を作成・編集・保存・再利用でき、Manual／API／KMLへ同じ地理情報を渡す | **採用** | 99.2 §7の「共通地理情報源」 |

**現在の到達点（CURRENT-ACCEPTED）**: FlightPlanと`FlightAreaGeometry`を共通の源とし、Manual支援・API電文・KML等は共通の源から派生する。型とプリセットのコピー原則は[17 §2](../17_map-and-airspace.md#2-飛行範囲flightareageometryの中立domainモデル)、編集UIの実装はC5。

**適用条件・限界**:

- 共通の源とは「別々に入力しない」ことであり、全経路が全形状を同じ形で表現できるという意味ではない。`BUFFERED_LINE`はAPI 1.9での表現が未確認でMANUAL_ONLY、KML向けの近似PolygonをDIPS APIへ転用しない（[25c §4](25c_api-payload-mapping.md#4-geometryのdips変換機能差)・[§6](25c_api-payload-mapping.md#6-c7契約再確認と検証)）。
- 共通の源を後から編集しても、提出済みのSnapshotは変わらない。提出確定後の形状はSnapshot内へディープコピーして保持されるため（[12d](../domain-model/12d_flight-plan-and-dips.md)・[24a §3](../dips-submission/24a_submission-and-sheets-ledger.md#3-全提出内容の保持と表示列の役割)）。計画Draft側の`geometry`と旧`geometry_snapshot`の統合方法はPENDING-C1-SCHEMAに従う。
- KML・PDF等の出力側は、共通の源から作るという一般原則までを本書が受け持つ。生成契機・内容・単位・保存は本書の対象外で、現行の27a等の記述と99.2 §8の照合は§7の残り・§8の再移植へ残す。

## 3. 不変submission_snapshotをAPIの有無に関わらず持つ理由

**当初状態（既存決定）**: ADR-0006は、DIPSへ通報する前に提出予定内容の不変Snapshot（当時名`payload_snapshot`、`9a2fb26`）をローカルへ保存し、Sheets同期を通報の前提にしないと決めた。現行名は`submission_snapshot`と、送出電文を別に持つ`api_payload_snapshot`（`84ae73b`）。型と不変性は[12d](../domain-model/12d_flight-plan-and-dips.md)、保存順序は[14](../14_offline-and-sync.md)の§3.4が正本。

**現在の到達点（CURRENT-ACCEPTED。99.2 §7）**: 飛行計画確定時点の意味論的内容を`submission_snapshot`として、APIの有無にかかわらず必須に保持し、`SNAPSHOT_SAVED`時に端末へ不変保存する。

**共通の源との連なり**: 共通の源（§2）から複数の経路へ同じ内容を渡すには、確定時点の内容を固定する起点が要る。Manual ViewModel、API Mapper、台帳保存は同じSnapshotから作る（25 overview §2）。手動とAPIの等価性は、同じ意味論的Snapshotを起点にすることを意味し、未確認のWeb／API機能差まで同一とは断定しない（25 overview §3）。

**境界**:

- 不変なのはSnapshot本文であり、状態・確認日時・受付番号等のライフサイクルメタデータは監査イベント付きで更新できる（[12d §7](../domain-model/12d_flight-plan-and-dips.md#7-不変提出スナップショットと改訂取消)）。
- `api_payload_snapshot`は実際に送出したJSONの別保持で、手動・API未利用時はnull。利用者へ表示・編集・保存・出力させない（[25c §5](25c_api-payload-mapping.md#5-jsonのライフサイクルとexact-outbound-payload)）。
- セル容量を超えるSnapshotの物理保持はPENDING-LEDGER-SNAPSHOT、計画Draftの`geometry`の統合はPENDING-C1-SCHEMA（[04 §3](../../04_open-questions.md#3-c1前docs再編で追跡するpending)）。状態遷移は13b。

## 4. Manual経路とAPI経路の責任境界

**当初状態**: ADR-0004・0006は、API未承認・credential未発行でもアプリを完成させるためにManualを第一級とし、APIは最後の送信経路だけを切り替えるOptionalとした。25 overviewが共通の入口と二経路の図を持つ。

**現在の到達点（CURRENT-ACCEPTED。99.2 §7）**: 共通の源から確定したSnapshotまでは、経路で分岐しない。以降の責任は次のとおり分かれる。

- **共通**: 何を通報するか（提出内容の意味）、その確定、不変Snapshot。
- **Manual経路**: Snapshotから`DipsManualEntryViewModel`を作り、DIPS Web実画面の順に提出内容（例: 日時・高度・登録記号・座標）を転記しやすく示す。選択操作（登録済みの機体・操縦者の選択等）や地図作図をテキスト貼付だけで代替しない（[24 §3](../dips-submission/24_manual-submission.md#3-manualと現場記録外部台帳の並行フロー)・[25b](25b_manual-web-mapping.md)）。API JSONは作らず、`api_payload_snapshot`はnull。通報後は受付・計画識別情報等を証跡として保存し、「手動通報した」打刻とDIPS確認は別に記録する（24 §3）。
- **API経路（C7 Optional）**: 同じSnapshotから`DipsFlightPlanMapper`→`DipsFlightPlanPayloadDTO`→JSONへ変換して送信し、実送出内容を`api_payload_snapshot`として別に保持する。利用者にJSONを直接編集・保存させない。APIが未接続のときに`api_payload_snapshot`を無理に作らない。
- **経路を変えても変えないもの**: FlightPlan、現場運航の設計、提出台帳（ADR-0006、25 overview §1）。

**適用条件**: 経路の通信可用性、結果不明時の再送禁止、SheetsやKMLの失敗でDIPSを再通報しない境界は33b・13bが正本で、本書は再定義しない。99.2の項目例（日時・高度・登録記号・座標）は例示であり、コピー対象の全一覧は25bが決める。

## 5. DIPS対象外飛行との境界

**現在の到達点（CURRENT-ACCEPTED。99.2 §7）**: DIPS対象外の飛行でも、内部の運航記録と日常点検は残せる。DIPS対象の飛行だけ、内部の記録へ正式な通報証跡を追加する。

**因果と境界**: 内部の記録（運航・点検・BAT等）は通報の有無と独立に成立し、通報証跡（提出Snapshot、通報・確認の状態、受付・計画識別情報）は通報を行った飛行にだけ付く。前者の詳細と保存先・命名は[operation-recording](../operation-recording/README.md)と[35c](../operation-recording/35c_a4-operation-record.md)、後者は12d・13b・24aに従う。既存の[12e](../domain-model/12e_operation-inspection-maintenance.md)も計画なし運航を許容し（Mission schemaは35aのPENDINGに従う）、通常運航の入口でもDIPS対象外は必要な飛行情報を確定して同じ点検以降へ合流する（[35b](../operation-recording/35b_normal-operation-and-final-save.md)）。

**判定は別正本**: 通報が必要かどうかは13cの通報要否評価（`REQUIRED`／`NOT_REQUIRED`／`UNDETERMINED`）が正本で、本書は再定義しない。99.2は「対象外／対象」の判定条件を定義していない。「対象外」を法令上飛行してよいという意味にしない（通報状況と離陸可否は別、13c）。

## 6. 未確定・確認待ちと再検討条件

### 6.1 本書が保持する未確定

**PENDING-S7A-NON-DIPS-SCOPE**: 99.2の「DIPS対象外／対象」が、通報義務の有無を指すのか、実際に通報した飛行を指すのかは原本に定義がない。通報が推奨にとどまる飛行（`NOT_REQUIRED`）を利用者が任意に通報した場合に、通報証跡を内部記録へ付ける扱いは決めない。対象外飛行で派生出力（KML等）を作るかどうかも、原本が述べておらず、§8の再移植へ残す。

### 6.2 他の正本に置く関連事項

- 作図操作の未回収と実画面証拠の再確認: [26 §1.3](../26_dips-web-ui-verification.md#13-証拠系列と回収範囲)（PENDING-S7A-DRAW-OPERATION／VERIFY-S7A-EVIDENCE）。
- `flyRoute`の表現の相違と公式原文との突合: [25c §6](25c_api-payload-mapping.md#6-c7契約再確認と検証)（VERIFY-S7A-FLYROUTE-CONTRACT）。
- 既存のまま維持: PENDING-WEB-05〜07（線＋幅のAPI表現・DIPS内部のGeometry形式・保存済み経路の再利用）は26、PENDING-C1-SCHEMA・PENDING-LEDGER-SNAPSHOTは04 §3、API契約の確認待ちは25cと[16](../16_security.md)。

### 6.3 再検討条件

- DIPS Webの保存済み飛行経路の再利用導線や内部形式が確認され、共通の源を介さない運用が有利になった場合。
- APIが線＋幅を受け付ける、または`flyRoute`の表現が確定し、Domainの形状定義に影響する場合。
- 手動とAPIで必要な提出内容が実際に異なると確認された場合。
- 通報要否の判定や対象外の運用が、13cの改訂等で変わった場合。
