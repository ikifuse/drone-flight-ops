# 32f. BATの保存構造（共用機体系ごとに1Spreadsheet・1物理BAT＝1シート）

最終更新: 2026-09-20\
状態: 保存の単位・1BAT1シート・総合台帳なしは現在の設計ベースライン（CURRENT-ACCEPTED。最終確定ではなく変更可能）。シートの中身・命名・規模への拡張は`CURRENT-PROPOSAL`／`PENDING`／`VERIFY`\
主責務: BATの人間向け保存媒体（03_バッテリー管理）の単位・構造、機体別分割を退けた因果、正本を1か所にする整理、Driveの現在状態の確認範囲。BATの意味は[32b](32b_battery-sharing-and-acquisition-history.md)、適用範囲は[32e](32e_battery-management-scope-and-flight-separation.md)、現場入力は[32g](32g_battery-field-input.md)、Drive全体の責任は[37](../drive-structure/37_environment-storage-responsibilities.md)\
由来: オーナーの2026-09-20の指示（会話。ファイルではない）。判断の要約は[ADR-0028](../../decisions/ADR-0028-battery-storage-by-shareable-aircraft-family.md)（Proposed）\
入口: [asset-management README](README.md)

## 1. 本書の位置づけ

BATの履歴・現在状態・累計値を、Driveのどこに・どの単位で・どの形で保存するかを保持する。物理BATが独立した個体で共用できること（32b、ADR-0007）を前提に、その保存先を決める。内部の正規化した履歴・schemaは[12b](../domain-model/12b_aircraft-and-battery.md)・[12e](../domain-model/12e_operation-inspection-maintenance.md)が正本で、本書は物理schemaを決めない（PENDING-C1-SCHEMA）。

## 2. 機体別Spreadsheet案を退けた因果

**当初状態（HISTORICAL／EVIDENCE/EXAMPLE）**: 基準アプリはBAT_1〜BAT_7の資産を持つ（32b §1）。03_バッテリー管理の途中案は、機体個体ごとにDriveのフォルダー（機体名と登録記号）を作り、各フォルダーのSpreadsheet（バッテリー管理_機体名）に「バッテリー台帳」とBAT個別シートを置く構成だった。機体ごとのセット別表示は、この時の見せ方である（32b §2）。

**問題（実運用の再検討）**: EVO LiteとEVO Lite+は、同じ物理BAT7本を共用している。物理BAT⑤をどちらの機体でも使うのに、機体別のSpreadsheetへ分割すると、同じ物理BATの履歴・現在状態・累計値が複数の場所に存在する。その結果、正本が重複し、更新が食い違い、1本のBATの履歴が分断される。

**変更理由と現在の到達点（CURRENT-ACCEPTED）**: BATは機体の付属物ではなく独立した物理個体である。保存正本の単位を、機体ではなく「同じBATを共用できる機体系」にする。

**退けた案**: (1) 機体ごとのSpreadsheet（共用BATの重複・不整合・分断のため。旧方式は現行の検討場所から退避済み、§6）。(2) 別の総合BAT台帳を置く案。BATシートの上部に個体情報と現在値を置く構成で、総合台帳を置くとBATごとの情報が二重になる（設計上の帰結。オーナーは総合台帳を置かない構成を採用している）。

## 3. 現在の保存構造

| 項目 | 現在の内容 | 状態 |
|---|---|---|
| 保存正本の単位 | 同じBATを共用できる機体系ごと | CURRENT-ACCEPTED |
| Spreadsheet | `03_バッテリー管理`の直下に、機体系ごとに1つ。現在は「バッテリー管理_EVO Lite・EVO Lite+_確認用」の1つ | CURRENT-ACCEPTED（現在の確認用構成） |
| シート | 物理BAT1本につき1シート。現在はBAT_1〜BAT_7の7シート | 同上 |
| 総合BAT台帳 | 置かない | 同上 |
| BATが増えた場合 | シートを追加する。30本・50本になっても、別の総合台帳を必須にしない方向 | CURRENT-PROPOSAL（検討方向。規模はVERIFY-D-BAT-SCALE） |
| 全く別のBATを使う別の機体系 | 機体系ごとのSpreadsheetを`03_バッテリー管理`直下へ並べる（例: バッテリー管理_機体A系、機体B系、機体C系） | CURRENT-PROPOSAL |
| ファイル名・シート名の規則 | 未確定（PENDING-D-BAT-FILE-NAMING） | PENDING |

BAT管理がOFFの機体（32e）は、この保存の対象にならない。

## 4. 1つのBATシートの構造（CURRENT-PROPOSAL）

1つのBATシートは、上部にその物理BATの個体情報・現在値をまとめ、下部に、使用のたびに履歴が1行ずつ増える構造を現在案とする。上部の最終構成と履歴の列は確定しておらず、今後オーナーと1項目ずつ必要性を検討する。下表は検討中の候補で、確定仕様ではない。

**上部（個体情報・現在値）の候補**

| 項目 | 記録のしかた | 12bとの関係（目安） |
|---|---|---|
| 管理ラベル | 人が付ける。実物のBATにも貼る（[32g](32g_battery-field-input.md)） | `display_name` |
| 個体番号 | 人が登録する | `serial_number` |
| 新品／中古 | 人が登録する | `condition_at_start` |
| 入手元 | 人が登録する | 対応する属性なし（PENDING-C1-SCHEMA） |
| 互換機種 | 互換の設定から | `BatteryCompatibility` |
| 最新サイクル数 | 人が確認した時だけ | `cumulative_cycle_count`との意味の対応は未確定 |
| 当方管理開始後の累計飛行時間 | 自動集計 | `cumulative_flight_minutes`（管理開始後） |
| 使用回数 | 自動集計 | 対応する属性なし |
| 最終使用日 | 自動 | 履歴から導出 |
| 現在状態 | 値は未確定（PENDING-D-BAT-STATES、[32d](32d_battery-ledger-and-status-design.md)） | `status`（PENDING-C1-SCHEMA） |
| 備考 | 人が任意で記入 | `last_health_note`に近い |

**下部（使用履歴）の候補**: 使用日時（自動）、実際に使用した機体（自動）、今回の飛行時間（自動）、確認できたサイクル数（人・任意）、状態確認（人・必須。[32g](32g_battery-field-input.md)）、備考（人・任意）。

**自動記録の方針（CURRENT-ACCEPTED）**: 使用日時、使用した機体、飛行時間、当方管理開始後の累計飛行時間、使用回数、最終使用日など、アプリ自身が知ることができる値は、原則として人に再入力させず、自動で記録・集計する。使用回数からサイクル数を推定して加算しない。

- **PENDING-D-BAT-SHEET-TOP**: 上部項目の最終構成。
- **PENDING-D-BAT-HISTORY-COLUMNS**: 履歴の列の最終構成。

## 5. 正本を1か所にする整理と、既存の記述との関係

**正本**: 同じ物理BATの履歴・現在状態・累計値の保存正本は、そのBATのシート1か所とする。機体別・機体系別にコピーを作らない。端末のcacheは複製であり（[38a](../sync-and-cache/38a_shared-source-and-device-cache.md)）、手修正は尊重する（[11](../11_data-authority.md)）。総合台帳がないため、BATの一覧は各シートから導く表示にする（[32d](32d_battery-ledger-and-status-design.md)）。

**既存の「復活させない」との関係**: 旧BAT_1〜BAT_7の固定所有・7本の上限・機体別の配置を復活させないという既存の記述（[37 §3](../drive-structure/37_environment-storage-responsibilities.md#3-内部正規化と物理シートを混同しない)、[35b §7](../operation-recording/35b_normal-operation-and-final-save.md#7-bat交換の10項目)、[35d](../operation-recording/35d_operation-finalization-and-write-boundary.md)）は維持する。1物理BAT＝1シートは、機体系ごとに共有し、上限なくシートを追加する点で、機体別の固定配置とは異なる。人が1本のBATの履歴を直接追うための媒体であり、内部の履歴は、行追加・正規化を基本とする既存の方針のままである。ADR-0007 §2.8の全面的な物理タブ禁止を、04・05の人間向け媒体（ADR-0021・0022）に続いてBATの人間向け媒体にも限定して置換する判断は、[ADR-0028](../../decisions/ADR-0028-battery-storage-by-shareable-aircraft-family.md)に記録する。

**旧の論理台帳案**: [24a](../dips-submission/24a_submission-and-sheets-ledger.md)のNo.6「バッテリー台帳」・No.7「バッテリー使用履歴」は、旧の論理台帳案（HISTORICAL）で、BATの保存構造は本書に従う。内部の同期対象としてのBAT個体マスターとの対応はPENDINGとする（PENDING-D-BAT-AUTHORITY-MAP）。

## 6. Driveの現在状態（確認範囲）

**EVIDENCE/EXAMPLE（オーナー確認済みの現在状態。Claudeは実Driveを直接確認していない）**: 2026-09-20時点で、オーナーとの検討により旧BAT方式を現行の検討場所から退避した。個人運用環境（叩き台）の`03_バッテリー管理`には、「バッテリー管理_EVO Lite・EVO Lite+_確認用」だけを置いている。旧方式の、機体個体ごとのフォルダー2つ（フォルダー名は機体名と登録記号）と、「バッテリー管理_確認用_共用管理」は、削除せず、`90_旧設計資料・照合証拠_20260916/03_バッテリー管理_旧方式_20260920`へ退避した。実名・登録記号・Drive IDは本書へ複写しない。この状態は、オーナーの報告に基づき、設計上の証拠として扱う（VERIFY-D-BAT-DRIVE-STATE）。

## 7. 未確定・確認待ちと十観点の確認

- **PENDING-D-BAT-FILE-NAMING**: Spreadsheetのファイル名・シート名の規則（シート名を管理ラベルにするか等）。
- **PENDING-D-BAT-FAMILY-BOUNDARY**: 「同じBATを共用できる機体系」の決め方。互換が一部だけ重なる場合、新しい機体を加えた場合、機体系を統合・分割する場合の移行。
- **PENDING-D-BAT-AUTHORITY-MAP**: BATシートの履歴行・累計値と、Flight明細・A4・端末内履歴との関係、再送での二重計上防止（[35d](../operation-recording/35d_operation-finalization-and-write-boundary.md)のPENDING-S6-FINAL-SAVE-CONTRACTに接続）。
- **PENDING-D-BAT-CONCURRENT-WRITE**: 同じBATシートへ、複数の人・端末が同時に履歴を追記した場合の扱い。A4の採番で簡素な方式を選んだ判断（[35c §3.3](../operation-recording/35c_a4-operation-record.md#33-特殊な同時競合を検討したうえで簡素な方式を選ぶ理由)）を、そのまま適用するとは決めていない。
- **VERIFY-D-BAT-SCALE**: 30本・50本になった時、総合台帳なしで、見やすさ・集計・並びが運用に耐えるか、Google Sheetsの規模の限界に当たらないか。
- **VERIFY-D-BAT-DRIVE-STATE**: §6のDriveの状態は、オーナーの報告のみを根拠とする。
- **PENDING-D-BAT-OUTPUT**: BATの出力（PDF等）の単位。総合台帳がないため、BATごとか機体系ごとかは未確定（[18](../18_reports.md)）。
- 既存のまま維持: PENDING-S3-BATTERY-HISTORY、PENDING-C1-SCHEMA、PENDING-S6-DRIVE-PLACEMENT（複数ユーザー・組織での所有と物理配置）。

**十観点の確認**（[37 §5](../drive-structure/37_environment-storage-responsibilities.md#5-分割保守の確認点)に従う）: 追加実装性はBATの追加をシートの追加で行えること、堅牢性は機体系ごとに独立して他系へ障害が波及しないこと、検証可能性・監査性は履歴が1行ずつ追記されて変更を辿れること、障害復旧性は人が直接読んで手修正でき（11）、端末の未同期を保持できること（[38b](../sync-and-cache/38b_confirmation-and-sync-timing-separation.md)）。セキュリティ・複数ユーザー／組織は環境のDriveとGoogleの実アクセスに従う（[31b](../identity-and-access/31b_roles-and-access-control.md)）。同時書き込みと規模は上記の未確定に残す。

**再検討条件**: 実運用で、総合台帳なしでは運用できないと分かった場合、機体系の境界が運用に合わない場合、同時書き込みで履歴が壊れる場合。
