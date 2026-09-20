# 32e. BAT管理の適用範囲（機体単位の任意）と飛行記録の区切りとの分離

最終更新: 2026-09-20\
状態: CURRENT-ACCEPTED（オーナーが2026-09-20に明示した現在の設計ベースライン。最終確定ではなく、変更可能）を中心に、案・未確定を節内で区別\
主責務: BAT管理を使う範囲（機体単位のON／OFF）、OFFでも基本運用が完結する条件、BAT管理と飛行記録の区切りの分離、新品・中古と履歴の起点、中古機を管理対象にする時点の点検との関係。BATが機体の付属物でないこと・共用・履歴の責任分離は[32b](32b_battery-sharing-and-acquisition-history.md)、保存構造は[32f](32f_battery-storage-structure.md)、現場入力は[32g](32g_battery-field-input.md)、表示は[32d](32d_battery-ledger-and-status-design.md)\
由来: オーナーの2026-09-20の指示（会話。ファイルではない）。判断の要約は[ADR-0029](../../decisions/ADR-0029-battery-management-optional-per-aircraft.md)（Proposed）\
入口: [asset-management README](README.md)

## 1. 本書の位置づけ

BAT管理を「誰の・どの機体の・どの飛行から」使うかの意味を保持する。BAT個体が独立した物理個体であること（機体の付属物・固定所有にしない）は既存の[32b §1](32b_battery-sharing-and-acquisition-history.md#1-固定スロットから型式独立個体互換へ)と[ADR-0007](../../decisions/ADR-0007-normalized-masters-and-business-reporting.md)（Accepted）が正本で、本書は再定義しない。BAT個体管理は、法令上の必須記録ではなく、機材保全のためにアプリが独自に設ける管理機能（[法令8区分](../../guidelines/02_legal-and-operations-rules.md)の区分7）として扱う。個別の法令適合を新たに認定するものではない。

## 2. BAT管理を機体単位の任意にした因果

**当初状態**: 基準アプリはBAT個体管理をコアの強みとし（[03 §2](../../03_integrated-requirements.md)）、旧BAT_1〜BAT_7の資産を持つ（32b §1）。新アプリの要件も、飛行ごとに使用BAT個体を必須記録し、交換時にも最小の確認を行う形を置いていた。

**問題（オーナーの再検討）**: BAT個体管理を全利用者・全機体へ強制すると、次の場合に導入が負担になる。
- 中古機・中古BATで、過去の履歴が既に不明な場合。
- これまでBAT管理をしておらず、今後も望まない場合。
- 100g未満の機体など、BAT個体管理を必要としない場合（オーナーが挙げた例。法令上の要否の判断ではない）。

現場で迷わず入力でき、必要な記録だけが正しい保存先へ反映される「記入支援」（[00_goal §1.1](../../00_goal.md#11-記入支援を中心に置くまでの因果)）という目的にも、BAT管理の強制は合わない。

**現在の到達点（CURRENT-ACCEPTED）**:
- BAT管理を利用するかどうかは、機体単位で選べる。全利用者へ強制しない。
- BAT管理がOFFの機体でも、飛行記録・点検記録等の基本運用は完結できなければならない。

適用限界: 100g未満などの例は、ONかOFFかを法令上の要否で決めるという意味ではない。既存のBAT管理設計（32b・32d）は、ONの機体に適用する。

## 3. BAT管理と飛行記録の区切りを分ける因果

**当初状態・問題**: 1飛行は、途中着陸・BAT交換・再離陸を含めて集約でき、使用BATと交換は1飛行の内部明細として保持する（[35a §2](../operation-recording/35a_flexible-flight-and-details.md#2-現在の1飛行の意味)）。BAT管理の有無と、飛行を1件とみなす区切りを同じものにすると、BATを交換するたびに飛行記録が増えたり、BAT管理がOFFの機体の飛行記録が成り立たなくなったりする。

**現在の到達点（CURRENT-ACCEPTED）**:
- BAT管理のON／OFFは、飛行そのものの区切りとは別の責任である。
- 同じ1飛行の途中でBATを何回交換しても、BAT交換だけを理由として、「無人航空機・飛行記録・日常点検記録」（A4）の飛行記録を複数行へ分けない（A4の詳細は[35c](../operation-recording/35c_a4-operation-record.md)）。
- BAT管理がONの機体の場合だけ、その飛行の裏側にBAT使用履歴を関連付ける。

| BAT管理 | 飛行記録・点検記録 | BAT使用履歴 | BAT使用開始・交換時の入力 |
|---|---|---|---|
| OFF | 基本運用として完結する | 作らない・関連付けない | 求めない |
| ON | 同じ。BAT交換で行を分けない | 飛行の裏側に関連付けて保存（保存構造は32f） | [32g](32g_battery-field-input.md)の4項目 |

**内部の保持との関係**: 飛行由来の使用履歴を、別の表へ二重に保存しない既存の方針（ADR-0007）は維持する。BAT管理がOFFの機体の飛行には、BAT個体を持たない場合がある。Flightの`battery_id`を任意にするかなどのschemaは[12b §8](../domain-model/12b_aircraft-and-battery.md#8-業務上の状態と保存enumの対応pending-c1-schema)のPENDING-C1-SCHEMAに従い、ここで決めない。

## 4. 新品・中古と履歴の起点（CURRENT-ACCEPTED）

BAT管理は新品に限らない。中古でも、過去の履歴が不明なまま、管理開始時点以降を管理できる。不明な過去の飛行時間・使用履歴を推定して埋めない。取得時に確認できたサイクル数等があれば、その確認値を起点情報として保持し、それ以降の当方の管理実績を積み上げる。取得時の観測と現在累計の区別は[32b §3](32b_battery-sharing-and-acquisition-history.md#3-中古batの取得時確認とその後の履歴)、不明な過去を0:00から管理する考え方は[32a §2](32a_aircraft-acquisition-and-cumulative-time.md#2-不明な過去を推定せず0000から管理するまで)が正本で、本節は再定義しない。

## 5. 中古機を管理対象にする時点の点検との関係（CURRENT-PROPOSAL）

中古機を今後の管理対象にする場合、導入時点の点検内容を「無人航空機 点検整備記録」へ残す考えも出ている。これはBAT使用履歴そのものとは別の責任であり、機体の点検整備の責任領域に置く。取得時の短時間動作確認の記録意味は[32c](32c_acquisition-check-and-maintenance-actors.md)、05の機体別の整備記録は[36](../maintenance-storage/36_aircraft-maintenance-records.md)が正本で、本書は複写しない。BAT管理がOFFの機体でも、点検整備記録は残せる。取得時の確認との差と、導入時点の点検を必須にするかは未確定（PENDING-D-BAT-INTRO-INSPECTION）。

## 6. 未確定と再検討条件

- **PENDING-D-BAT-SWITCH**: ON／OFFを設定する場所と既定値、途中でON／OFFを切り替えた場合の扱い（OFFの間のBAT履歴は遡って作らない）。
- **PENDING-D-BAT-A4-COLUMN**: A4のBAT欄に、BAT管理がOFFの機体と、1飛行で複数のBATを使った場合をどう表記するか（35cのPENDING-S6-A4-DETAILに接続）。
- **PENDING-D-BAT-INTRO-INSPECTION**: §5の導入時点の点検の記録先・要否・既存の取得確認（32c）との関係。
- 既存のまま維持: PENDING-C1-SCHEMA、PENDING-S3-BATTERY-HISTORY、PENDING-S6-OPERATION-SCHEMA。

**再検討条件**: OFFの機体で基本運用が成り立たないと分かった場合、BAT管理をONにした後の追跡がOFF期間の欠落で運用に合わない場合、オーナーがON／OFFの単位を変える場合。

## 7. 根拠と確認範囲

根拠はオーナーの2026-09-20の指示で、実Driveの確認や実運用の観測ではない。実際のDriveの状態は[32f §6](32f_battery-storage-structure.md#6-driveの現在状態確認範囲)に区別して記す。
