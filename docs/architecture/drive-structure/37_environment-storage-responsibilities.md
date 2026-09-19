# 37. 運用環境のDrive責任構造と人間向け記録

最終更新: 2026-09-19\
由来: 99.2 §10、2026-09-19のオーナーによる04の機体別保存追補。Drive全体の配置責任と変遷の正本。各記録の詳細schema・KML階層を集約しない。

## 1. 一冊中心・技術分類から責任領域へ

**当初状態（HISTORICAL）**: 初期案はDroneOpsという一冊にマスターをまとめ、年別の飛行記録、PDF、KMLを置いた。その後、00〜06や90_PDF／91_KMLという技術寄りの案、旧00モック内の六冊案が試された。旧台帳にはOrganization、Personnel、機種・機体、BAT型式・個体・互換、Locations、Clients、Projects、Permissions、InsurancePoliciesがあり、後に運用環境・GoogleIdentity・Membership・役割・履歴・資格の概念も追加された。

**問題・調査**: 旧案と新案が同じ位置に残ると、どれを現行として読むかが曖昧になる。冊数を減らすこと、概念ごとに一冊にすることのどちらも、人が運用で辿る場所と責任分離を十分に表さない。99.2はDrive実物・構成図・旧モックを比較した経緯を記録している。今回その全Driveを再監査したとは扱わず、最新A4だけの直接確認は[35c](../operation-recording/35c_a4-operation-record.md)へ限定する。

**変更理由**: 2026-09-16の整理では「現在の設計資料」「現在の運用実物」「旧案・証拠」を分け、運用環境ルート直下には運用責任に沿う01〜07だけを置く方向へ到達した。番号自体や旧六冊を最終物理schemaとして固定するのではなく、利用者が読む記録の所在を明確にする。旧資料は判断の経緯として残し、現行配置の別正本にしない。

## 2. 01〜07の現在責任

**CURRENT-ACCEPTED**: 運用環境ごとのルートを入口とし、以下の七領域へ分ける。設計管理・移植監査資料を実運用ルートへ混在させない。環境とOrganization・所属・権限の意味は[31a〜31d](../identity-and-access/README.md)を維持する。

| 領域（責任の表記。製品フォルダー名の固定ではない） | 責任 | 詳細正本・境界 |
|---|---|---|
| 01 人員 | 人物・所属・役割・資格等の管理 | [31a〜31d](../identity-and-access/README.md)。論理概念ごとに別Spreadsheetを作る決定ではない |
| 02 機体 | 機体と取得・管理情報 | [32a](../asset-management/32a_aircraft-acquisition-and-cumulative-time.md)。累計・履歴の具体列は未確定 |
| 03 バッテリー | BAT個体・取得・共用と履歴 | [32b](../asset-management/32b_battery-sharing-and-acquisition-history.md)。機体別の見せ方は所有固定を意味しない |
| 04 運航記録 | 機体個体別の運航記録Spreadsheetに正式実飛行・日常点検のA4を保存 | 個体別保存・日付連番の詳細因果は[35c §3](../operation-recording/35c_a4-operation-record.md#3-その後の運用判断による現在ベースライン)。テストと正式記録を区別 |
| 05 点検整備記録 | 機体別の詳細点検整備 | [36](../maintenance-storage/36_aircraft-maintenance-records.md)。通常日常点検と分離 |
| 06 DIPS関連 | 運用環境の飛行計画と通報台帳。人が見る作業台帳と内部の履歴・証跡を分ける | [24b](../dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)（記録責任・作業台帳・取消／整理の意味）と[24a](../dips-submission/24a_submission-and-sheets-ledger.md)（提出台帳schema）。個人専用の手続き履歴に閉じない |
| 07 出力 PDF／KML | 派生出力（KMLは飛行計画の通報時、PDFは必要時） | [27](../output/27_output-boundaries.md)・[27e](../output/27e_kml-generation-timing-and-content.md)（KMLの生成契機・内容・単位）・[27f](../output/27f_derived-pdf-roles-and-map-pdf.md)（PDFの役割・生成契機）。04／06等の正式記録を代替しない |

これは責任と発見性の現在ベースラインである。個別ファイル数、全表・列・索引、ACL・所有権移管の手順を一括確定する表ではない。環境別の保存先を選んでから現場操作へ入る画面の因果は[34a](../presentation/34a_setup-and-environment-entry.md)と[34b](../presentation/34b_home-and-navigation.md)にあり、本書へ複製しない。

**04の追補**: オーナーが2026-09-19に提示した機体個体別の現Drive確認結果はEVIDENCE/EXAMPLE、その既存境界を使う判断はCURRENT-ACCEPTED。前回のA4一枚の直接観測から導いたものではない。機体交代時の保存先切替・次空き連番・高度な競合対策を採らない因果は35cへ一元化する。05の整備媒体を一般化して04へ適用した判断ではなく、01〜07の他領域の物理配置を確定するものでもない。

## 3. 内部正規化と物理シートを混同しない

**旧案**: ADR-0007 §2.8と24aは、個体や日付の増加に比例する物理タブの増殖を一律に避け、通常履歴を行追加型で扱った。これは検索・同期・モデル保守のための意図だった。

**さらに詰めた点**: 内部の行追加・正規化と、人間が直接読む記録媒体は同一ではない。§10は、04の固定A4日付・連番タブと、05の機体別原本コピーを明示している。一律禁止を維持すると、手作業で整えた読みやすさや機体の履歴を追う理由を失う。

**CURRENT-ACCEPTED**: 通常の内部履歴は行追加・正規化を基本とする。人間向け04の物理A4タブは35c、05の機体別Spreadsheet・記録タブは36の責任とする。両者を「実装しない表示ビューの案」と読んだり、点検整備だけが唯一の例外としたりしない。これは§5／§10の後続判断であり、A4実物1枚だけから一般化した結論ではない。旧No.1／No.2の左右構成を新A4へ戻さず、旧BAT_1〜BAT_7も復活させない。

二つの保存表現の存在を、同じ仕様・判断に二つの設計正本を持つ理由にしない。確定台帳・手修正尊重は[11](../11_data-authority.md)、運航全体の確定と重複防止の未決契約は[35d](../operation-recording/35d_operation-finalization-and-write-boundary.md)。媒体ごとの独立した値の再入力や別運航としての再送を当然の前提にしない。

## 4. 旧実物・サンプル・未確定の扱い

**EVIDENCE/EXAMPLE**: 旧FlightsからFlightLegs、FlightPersonnel、MaintenanceRecordsからAircraftMaintenanceIndex、FlightPlansへのDIPS関連情報追加等の変化は概念検証の履歴である。名前が存在しただけで採用済みテーブルとはしない。旧98系・99.1、機体別原本、BATスロット別試作も同じ位置付け。実物を先に再現して比較する原則は維持するが、古いコピーで最新実物を代替しない。

Locations／Clients／Projects／Permissions／InsurancePolicies等は、旧案から消す判断があったわけではない。どの責任領域へ置き、設定としてどう分類するかは**PENDING-S6-DRIVE-PLACEMENT**。01〜07の表に行がないことを、概念廃止の証拠にしない。

07配下の操縦者・年・飛行等の旧サンプルは**EVIDENCE/EXAMPLE**に留める。KMLの生成契機・単位・内容は[27e](../output/27e_kml-generation-timing-and-content.md)、命名・My Maps・ログ突合は既存の[output](../output/README.md)へ参照するだけとする。説明のために空フォルダーを大量生成したり、実Driveを再編したりしない。

**PENDING-S6-DRIVE-PLACEMENT**には具体的なschema／索引・更新責任の対応、未決領域のSpreadsheet配置、複数ユーザー・複数組織での所有とアクセスの物理契約も残る。到達済みの七責任、04の機体個体別保存と05の媒体を一般論で未決へ戻さない。04の長期／年度分割は35cのPENDINGを維持する。**VERIFY-S6-DRIVE-EVIDENCE**は01〜07全体・旧配置の再照合であり、前回の最新A4直接確認および今回のオーナーによる04確認報告を超える。

## 5. 分割・保守の確認点

配置を変更する際は、関係者が見付けられ、責任ごとに変更できること（保守性・追加実装性）、他領域の失敗が波及しないこと（堅牢性）、環境とGoogle実アクセスの境界（セキュリティ・複数ユーザー／複数組織）、記録と根拠・変更を辿れること（検証可能性・監査性）、部分失敗と復旧・反映状況が分かること（障害復旧性・可観測性）を確認する。具体的な仕組みを原本の根拠なしに採用済みへ昇格させず、各詳細正本の未確定事項を解決してから依存実装へ進む。

## 6. 保存の所有と費用の境界

**当初状態**: ADR-0001は無料枠を活用した低コスト運用を、ADR-0018はDIPS連携のバックエンドが全運航データを中央DBへ集約しないことを定めた。旧の費用分析（[04_cost-and-operations-analysis](../04_cost-and-operations-analysis.md)）は当時の構成・無料枠の記録で、現行のサービス条件の保証には使わない。

**現在の到達点（CURRENT-ACCEPTED。99.2 §9）**: 全利用者のデータを運営の中央サーバーへ集約せず、各環境のDrive容量を利用する。Webアプリ／PWA、Google認証、Drive／Sheets保存を基本構成とし、従量課金のサービスは必要な機能だけに限定する。運営側が全利用者の飛行記録・PDF・KMLの保存費を負担する中央ストレージ構造を、当然の前提にしない。DIPSのcredential上必要な場合は、DIPS用の小規模なバックエンドのみを検討する（[33a](../dips-infrastructure/33a_fixed-egress-and-api-connection.md)・[10 §2.2](../10_system-boundaries.md#22-dips連携バックエンド境界の責務)）。

**方向（CURRENT-PROPOSAL）**: Google Maps等の従量APIも、飛行場所の表示・検索等で必要な場合に限定し、利用量と無料枠を見ながら使う。

**未確定・限界**: 従量課金サービスの具体的な利用量・上限・監視は決めていない。複数組織での物理的な所有・移管はPENDING-S6-DRIVE-PLACEMENTと[31d](../identity-and-access/31d_membership-lifecycle.md)のPENDING-S2-OWNERSHIP。判断の要約は[ADR-0027](../../decisions/ADR-0027-storage-ownership-and-cost-boundary.md)（Proposed）。
