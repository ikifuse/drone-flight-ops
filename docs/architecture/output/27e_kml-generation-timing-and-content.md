# 27e. KMLの生成契機・内容・単位（因果）

最終更新: 2026-09-19\
状態: CURRENT-ACCEPTED（現在の設計ベースライン。C1未着手。個別の`PENDING`／`VERIFY`は未確定・未確認）\
主責務: KMLの位置づけ（正本と派生）、単位、生成契機、保存失敗時の未同期保持と最終送信時の再送、内容の確定境界。ファイル形式・Geometry変換・命名・共有プロファイルは27a、Drive保存は27b、My Maps運用は27c\
由来: 99.2 §8のKML、§7・§9のKML生成・保存・再送、§10のKMLサンプルの位置づけ（Step 7c）。判断の要約は[ADR-0024](../../decisions/ADR-0024-kml-generated-at-plan-submission-from-report-content.md)（Proposed）、移管と確認範囲は[Step 7c監査](../../migration/99-2-step-7c-causal-audit.md)\
入口: [出力設計目次](README.md)

## 1. 本書の位置づけ

本書は「KMLをいつ・何を・どの単位で作り、保存に失敗したらどうするか」の意味を保持する。形式・Geometry変換・命名・共有プロファイルは[27a](27a_kml-export.md)、Driveへの保存設定と更新方針は[27b](27b_google-drive-storage.md)、My Mapsの操作と実機検証待ちは[27c](27c_google-mymaps-workflow.md)、出力全体の境界は[27](27_output-boundaries.md)、キューの型と再試行は[14](../14_offline-and-sync.md)が正本。旧27a・27b・03・23のC8にあった「運航完了時に実績を追記して更新する」モデルと「1 FlightPlan = 1 KML」は、本書の到達点によりHISTORICAL（旧案）とする。

## 2. 正本と派生の境界

**当初状態（既存Docs）**: 27の境界Cは、KMLをユーザー向けの地図出力で台帳原本ではないとし、ADR-0008はKMLをDB復旧の代替にしないと決めた。27aは、運航実績がKMLに含まれても法的原本ではないと注記していた。

**発端・現在の到達点（CURRENT-ACCEPTED。99.2 §8）**: DIPS用に作った飛行範囲・経路を、KMLや地図付き資料のために再入力せず後から使いたい。そのため、DIPS通報内容とGeometryは06側の正本とし、KMLは同じGeometryをMy Maps・Google Earth等へ持ち出す地理可視化・交換用の派生物とする。KMLは飛行記録の正本でも、正式なDIPS証拠でもない。正式な受付・計画番号等は06へ別に保持し、飛行と関連付ける（結び付けキーはPENDING-S7B-FLIGHT-KEY、[24b](../dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)）。

**飛行リストとの関係**: ［飛行リスト］はKMLを走査して作るものではなく、DIPS正常受付を受けて06側の共有作業リストへ反映したデータを表示する（[34c](../presentation/34c_shared-flight-worklist.md)）。KML保存の成否と飛行リストへの掲載可否を結び付けず、KML保存だけが未同期でも、DIPS正常受付済みの計画は飛行リストへ表示できる。

## 3. 単位（1飛行につき1KML）と階層

**当初状態（HISTORICAL）**: 27aと27cは「1 FlightPlan = 1 KML」「1 FlightPlan = 1 My Map」を単位とした。

**現在の到達点（CURRENT-ACCEPTED。99.2 §8）**: 柔軟な運用上の1飛行につき1つの独立したKMLとする。必要な飛行だけを、My Maps・Google Earthへ手動でインポートして重ねて見る。APIが利用可能になってもKMLの役割は残る。この単位は、[35a](../operation-recording/35a_flexible-flight-and-details.md)が`flight_id`・帳票と並べてKMLの基本単位とする現在案と一致する。

**階層・命名の位置づけ**: 99.2は基本階層として「07_出力_PDF・KML / KML / 操縦者 / 年度 / 1飛行」を挙げるが、実Driveの操縦者・年度フォルダー等のサンプルは構成確認用（EVIDENCE/EXAMPLE）で、KMLを飛行計画通報時に生成・保存するタイミングは確定していても、最終ファイル名や具体階層名の確定ではない（[37 §4](../drive-structure/37_environment-storage-responsibilities.md#4-旧実物サンプル未確定の扱い)）。この操縦者の軸は、A4の名称に操縦者コードを付けない判断（[35c §3.2](../operation-recording/35c_a4-operation-record.md#32-機体内の日付と次空き連番)）とは別のスコープである。

## 4. 生成契機・保存・未同期保持・再送

**当初状態（HISTORICAL）**: 旧27aは、計画確定時に初回のKMLを生成し、Mission完了打刻の後に運航実績（飛行前点検・各飛行の実績・飛行後点検）を追記した最終KMLへ再生成して更新するライフサイクルを置いた。27bには運航完了時の自動更新の設定があり、03・23もこれに従っていた。

**現在の到達点（CURRENT-ACCEPTED。99.2 §7・§8・§9）**:

1. KMLは運航終了時ではなく、飛行計画を確定してDIPSへ通報する段階で生成し、通常はその時点で07へ保存する。
2. 源は`submission_snapshot`と共通Geometryであり、飛行前点検・飛行後点検・離着陸実績・BAT実績等の後発の運航データを待たず、後から運航実績をKMLへ追記する前提にしない。
3. オンラインでDriveへの保存まで完了できれば、その場でKML保存済みとし、飛行後に作り直さない。
4. 通信断・Drive到達失敗等でKMLだけ外部保存できなかった場合は、KML本体または同一内容を再生成できる不変の源と保存状態を、端末に未同期として保持する。通信復帰を検知した安全な同期機会にも再送する。
5. その後の実飛行を止めず、KML保存の失敗を理由にDIPS通報をやり直さない。
6. 飛行後点検を終えた操縦者が最後の送信を行うとき、未同期のKMLが残っていれば、04の運航記録・BAT履歴・機体累計等の確定保存と同じ利用者操作でKMLの保存も再実行する。
7. すでに07へ正常保存済みのKMLは、最後の送信で重複して生成・保存しない。
8. 最後の送信でも通信できなければ、KMLも04側の確定記録もそれぞれ未同期の状態を保持し、次回到達可能時に同一内容として再送する。

**三つの時点を混同しない**: KMLの内容確定と初回生成は飛行計画通報時、未同期KMLの再送機会の一つは飛行後点検後の最後の送信時、A4運航記録の内容確定は飛行後点検後である。

**適用条件**: KML・Driveの障害は正式な運航記録の保存や現場の離着陸を止めない（[19 §2.6](../19_failure-recovery.md#26-kml生成google-drive保存障害の完全隔離fault-isolation)・[27 §3.3](27_output-boundaries.md#33-保存障害の完全分離fault-isolation)）。Sheets／KMLの再同期とDIPS通報の再試行は別系統で、SheetsやKMLの失敗でDIPSを再通報しない（[33b](../dips-infrastructure/33b_api-availability-and-retry-boundaries.md)）。再送の型と再試行は14が正本で、同一内容の再送は既存の冪等キーに従い、KML固有の新しいID体系は本書で追加しない。最後の送信との関係は[35d](../operation-recording/35d_operation-finalization-and-write-boundary.md)の最終保存契約に接続し、KMLの再送を最終保存の一部とするか、同じ操作で起動する独立した再送とするかは未確定（PENDING-S7C-KML-FINAL-SEND、35d）。

## 5. 内容の確定境界

**当初状態（HISTORICAL）**: 27aはKMLへ飛行前後の点検や運航実績まで含める案と、日時・操縦者・機体・目的等を候補として列挙して最終的な属性一覧は今後確定するとする記述を持っていた。99.2は、これを現在の決定と矛盾する古い保留表現と明記する。

**現在の到達点（CURRENT-ACCEPTED。99.2 §8）**: KMLへ運航の全データを詰めない。内容は、その飛行についてDIPSへ通報する内容と、その通報対象の共通Geometryと確定しており、KMLだけの独自の属性一覧を選び直す設計にしない。`submission_snapshot`に確定した各提出項目はKML側にも同じ意味内容として保持し、飛行範囲・経路は同じGeometryから表現する。飛行前点検、飛行後点検、離着陸実績、BAT実績、点検整備、修理記録等の運航後の情報は入れない。DIPS送信後に得る受付結果・受付番号等の行政側の証跡は「通報した内容」ではないため、KMLの内容に混ぜず、06へ別に保持する。

**共有時の秘匿との関係（PENDING-S7C-KML-SHARE-PROJECTION）**: 99.2は共有時の投影に言及していない。27a §6は、氏名・連絡先・機体登録記号等を無条件に出さないプロファイル（既定`SHARE_SAFE`）を持つ。「提出項目を同じ意味内容としてKMLに保持する」ことと「共有向けに一部を出さない」ことをどう合成するかは未確定で、現時点では27a §6の安全側の制限を緩めない（個人情報・秘密情報の保護は[16](../16_security.md)）。

## 6. 未確定・確認待ちと再検討条件

### 6.1 本書が保持する未確定

- **PENDING-S7C-KML-UNIT-MAPPING**: 意味上の1飛行と、FlightPlan・DipsSubmissionのrevision・複数日・複数機体・複数Missionとの対応。計画を改訂して再通報した場合に新しいKMLを作るか、DIPS対象外の飛行や計画なしの運航にKMLがあるかは、原本が述べておらず決めない（35aのPENDING-S6-OPERATION-SCHEMAと、24bのPENDING-S7B-FLIGHT-KEYに接続）。
- **PENDING-S7C-KML-SHARE-PROJECTION**: §5のとおり。

### 6.2 他の正本に置く関連事項

- 保存先: 利用者指定フォルダーの旧設定と環境rootの下の07配置との関係は[27b](27b_google-drive-storage.md)（PENDING-S7C-KML-DESTINATION）。
- 最後の送信との関係は[35d](../operation-recording/35d_operation-finalization-and-write-boundary.md)（PENDING-S7C-KML-FINAL-SEND）。
- 99.2が具体表現を未確定とするもの: ファイル名の規則、内部のPlacemark／ExtendedDataの配置、円と線＋幅のKML表現、My Maps・Google Earthでの表示名と見え方、既存KMLを修正した場合の上書き・版管理。これらは確定済みの通報内容とGeometryを、どうKMLで表現・管理するかの実装詳細で、何を入れるかの未確定ではない。27aの§2（Geometry変換）・§5（命名）・XML構造は提案として保持し、27cのPENDING-MYMAPSで実機検証する。

### 6.3 再検討条件

- 運航実績を地図上で確認する必要が現場で実証された場合（実績の可視化は、将来の機体ログ重畳（[27d](27d_aircraft-flight-log-import.md)）との分担を含めて再検討する）。
- My Mapsの実機検証で、通報内容の表現が成立しない、または再インポートの挙動が運用に合わないと確認された場合。
- 意味上の1飛行の定義が確定し、計画とKMLの対応が変わる場合。
