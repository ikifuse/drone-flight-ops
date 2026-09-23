# 34f. 画面体系と遷移の俯瞰・設計の到達範囲

最終更新: 2026-09-23\
状態: 俯瞰の索引（既存の各画面仕様を並べたもの）。新しい画面仕様・業務ルールは決めない。未設計領域の`PENDING`と、進め方の`NEW-PROPOSAL`を含む\
主責務: アプリ全体の画面の並びと画面間の行き先、各画面の設計がどこまで進んでいるか、まだ設計されていない領域。各画面の中身と、画面ごとの遷移の正本は各画面仕様（項目6）\
入口: [Presentation設計の入口](README.md)

## 1. 本書の位置づけ

「ホームの次にどの画面へ進むのか」を一か所で追えるようにするための俯瞰。各画面の表示・操作・保存の詳細は、[30の10項目規約](30_screen-specification-standard.md)に沿った各画面仕様が正本で、本書は複写しない。行き先が本書と各画面仕様で食い違う場合は、各画面仕様を正とし、本書を直す。画面が増えたときは、先に各画面仕様、次に本書の順で更新する。

## 2. 画面の遷移（既存の正本から並べたもの）

```mermaid
flowchart TD
  FIRST["初回：直接はじめの登録（Googleアカウントの確認＋氏名［必須］＋任意項目を1画面。Google認証・許可・保存場所の作成は内部処理）"] --> HOME
  HOME --> ES["〜で使用中：現在地確認・環境シート"]
  ES -->|"複数なら切替"| HOME
  ES --> CO["会社・団体で新しく使い始める／すでに使っている会社・団体に参加する<br>（その会社で使うGoogleアカウントで認証）"] --> HOME
  START["通常起動（環境の選択・復帰詳細は未決）"] --> HOME["ホーム（4入口）"]
  HOME --> NEED{"飛行に必要な登録がある？"}
  NEED -->|"足りない"| SETUP["機体・操縦者の不足登録 → 同じ不足確認へ戻る"] --> NEED
  NEED -->|"そろっている"| NEW["新規飛行"]
  HOME --> LIST["飛行リスト"]
  HOME --> HIST["飛行履歴・出力"]
  HOME --> SET["各種設定・管理（機体管理の入口のみ案）"]
  SET --> AIR["機体管理（案）：機体一覧 → 追加・変更"]
  NEW --> PLAN["計画入力 → 飛行範囲の作成か選択 → 通報内容の確認"]
  PLAN --> SHORT["通報時の不足分だけ補完・保存 → 同じ計画へ復帰"]
  SHORT --> SEND["通報内容確認 → 通報する（モック内の正常受付）"]
  SEND -->|"API経路で正常受付・重複なし"| ACC["通報済み・KML保存済み・共有飛行リスト掲載"]
  SEND -->|"重複・調整／結果不明／エラー"| HOLD["停止・入力保持：再開方法は未決"]
  CONTENT -->|"重複・調整"| HOLD
  ACC -->|"飛行前点検へ"| PRE
  ACC -->|"後で飛行する"| HOME
  LIST -->|"カードを選ぶ"| CONTENT["DIPS通報内容"]
  CONTENT -->|"正常受付・重複なしのみ"| PRE["飛行前点検"]
  CONTENT -->|"飛行中止／削除"| CANCEL["取消（詳細は後続）"]
  PRE --> STBY["離陸待機"] --> FLY["飛行中"] --> LAND["着陸後入力 → 着陸内容を確定"]
  LAND -->|"続行"| STBY
  LAND -->|"BAT交換"| BAT["BAT交換・2項目簡易確認"] --> STBY
  LAND -->|"機体交代"| SWITCH["機体交代"]
  SWITCH -->|"未点検の機体"| PRE
  SWITCH -->|"点検済みの機体"| STBY
  LAND -->|"終了"| POST["飛行後点検"] --> FINAL["日常点検・飛行記録の最終確認 → 保存"]
  FINAL -->|"失敗：下書きを保持して再試行"| FINAL
  FINAL -->|"成功"| AFTER["運航完了：飛行記録・日常点検保存済み"]
  HIST --> DETAIL["飛行の詳細"] --> OUT["出力：KML／A4運航記録PDF／地図付きPDF"]
```

図の各行き先の根拠は§3の正本。Manualで通報した計画が飛行リストへ入る条件は、API経路と同じとは決まっていない（PENDING-S5-MANUAL-LIST、[34c §5](34c_shared-flight-worklist.md#5-未確定と適用限界)）。図の「離陸」と「着陸」は、それぞれ離陸待機・飛行中の画面内の打刻で、独立した画面ではない（[35b §2](../operation-recording/35b_normal-operation-and-final-save.md#2-現在の論理画面順)）。

## 3. 画面ごとの到達範囲

| 画面・領域 | 設計の状態 | 正本 |
|---|---|---|
| 初回・会社追加／参加 | 初回は直接はじめの登録→ホーム。環境シート経由の会社追加・参加まで接続済み。未記載の10項目詳細はPENDING | [34a §9](34a_setup-and-environment-entry.md#9-初回は個人環境から始め初回登録を1画面にまとめる2026-09-23) |
| 通常起動・使う先の選択 | ホームの環境ボタンとシートは確定。起動時の選択・復帰詳細はPENDING | [34a §5・§9.6](34a_setup-and-environment-entry.md#96-複数環境と切替) |
| ホーム | 4入口と10項目あり。環境操作入口を上部ボタンに統合 | [34b](34b_home-and-navigation.md) |
| 新規飛行（計画入力〜通報内容の確認） | Manual入力支援の画面とコピー導線は個別仕様がある（10項目の形式ではない）。飛行範囲の作成は機能の一覧まで。公式22項目順・不足補完・確認・疑似通報まで接続済み（§7）。Manual側の不足補完と外部操作は未決 | [25b](../dips-flight-plan/25b_manual-web-mapping.md)、[17 §2.2](../17_map-and-airspace.md) |
| 正常受付（重複なし） | 10項目あり | [34d §3](34d_dips-accepted-and-plan-content.md#3-正常受付重複なし画面の10項目) |
| DIPS通報内容 | 10項目あり。取消の詳細は後続 | [34d §4](34d_dips-accepted-and-plan-content.md#4-dips通報内容画面の10項目) |
| 飛行リスト | 10項目あり。絞り込み・共有反映などの詳細はPENDING | [34c §3](34c_shared-flight-worklist.md#3-飛行リスト画面の10項目) |
| 飛行前点検、離陸待機、飛行中、着陸後入力、BAT交換、機体交代、飛行後点検、最終送信・保存 | いずれも10項目あり。運航完了までモック接続済み（35b §13）。製品の詳細配置・復旧・部分成功UIは未確定 | [35b §3〜§10](../operation-recording/35b_normal-operation-and-final-save.md#3-飛行前点検の10項目) |
| 飛行履歴・出力 | 10項目あり。詳細画面・出力の実行画面・出力の単位は未確定 | [34e](34e_history-and-output.md) |
| 各種設定・管理 | 入口の意味と、機体管理の入口の流れ（案）まで。人員・BAT・場所・環境などの他の管理画面は未設計 | 34b、[34g §3](34g_settings-aircraft-management-and-context-display.md#3-各種設定管理から機体管理へ案)、下記PENDING-D-SETTINGS-SCREENS |
| 現在の運用環境と対象機体の表示 | 環境の表示・切替は既存（31a・34a）。対象機体の表示責任と対象画面を整理（案）。位置・固定表示は未確定 | [34g §2](34g_settings-aircraft-management-and-context-display.md#2-現在の運用環境の表示と対象機体の表示) |
| 利用者向けの表示名・文言（内部用語との分離） | 規約と対応表あり（個々の表示名は案。PENDING-U-WORDING） | [30 §4](30_screen-specification-standard.md#4-内部設計用語と利用者表示文言の分離)、[34h](34h_user-facing-wording-and-terminology.md) |
| 同期・オフライン・エラーの共通の表示 | 記録ごとの状態表示（[14 §3.4](../14_offline-and-sync.md)）と、鮮度の判断の方向（[38a §4](../sync-and-cache/38a_shared-source-and-device-cache.md#4-正本を確認する時点とcacheの表示)）はある。全画面に共通する見せ方は未設計 | 下記PENDING-D-STATUS-DISPLAY |

## 4. まだ設計されていない領域

コードを書かなくても決められる領域を、設計の対象として明示する。いずれも、既存のCURRENT-ACCEPTEDを変更せず、業務ルールを新たに決める場合はオーナーの確認を待つ。

- **PENDING-D-SETTINGS-SCREENS**: 各種設定・管理の画面体系（人員・機体・BAT・場所・プリセット・環境）。機体管理の入口の流れは[34g §3](34g_settings-aircraft-management-and-context-display.md#3-各種設定管理から機体管理へ案)（案）で、他の分類は未設計。ホームの4番目の入口から先の画面、一覧・登録・変更・状態の見せ方。既存の関連: 人員は[31](../identity-and-access/README.md)、機体・BATは[32b](../asset-management/32b_battery-sharing-and-acquisition-history.md)・[12b](../domain-model/12b_aircraft-and-battery.md)、内部分類はPENDING-S5-HOME-DETAIL（34b）。
- **PENDING-D-BAT-LEDGER**（オーナー方針を反映済み: BAT管理は機体単位の任意は[32e](../asset-management/32e_battery-management-scope-and-flight-separation.md)、保存は共用機体系ごとの1Spreadsheet・1物理BAT＝1シート・総合台帳なしは[32f](../asset-management/32f_battery-storage-structure.md)、現場入力は4項目は[32g](../asset-management/32g_battery-field-input.md)。表示の案は[32d](../asset-management/32d_battery-ledger-and-status-design.md)。未確定は各文書のPENDING）: 多数の機体・BATを共有して使う場合のBATの表示と状態、履歴、機体固定にしない共有運用、複数ユーザー・複数組織でも破綻しない管理。総合BAT台帳は置かず、一覧は各BATシートから導く表示にする。状態の値と導き方は業務ルールのため、オーナーが確認する（PENDING-D-BAT-STATES）。PENDING-S3-BATTERY-HISTORY（32b）に接続する。
- **PENDING-D-HUMAN-OUTPUT**: KMLに保存した内容を、人が閲覧・印刷するときの復元と構成。KMLの文字列を見せず、地図付きPDF・印刷物として、地図と通報情報をどう並べるか。PENDING-S7D-MAPPDF-DETAIL（[27f](../output/27f_derived-pdf-roles-and-map-pdf.md)）と、飛行履歴・出力のPENDING-S7D-HISTORY-*（34e）に接続する。
- **PENDING-D-NEW-FLIGHT-SCREENS**: 新規飛行の入力から通報内容の確認までの、Manual／API共通の画面の流れと、飛行範囲の作成画面。
- **PENDING-D-STATUS-DISPLAY**: オフライン・未同期・エラー・保存・確定・取消・戻るを、全画面で共通にどう見せ、どう操作するか。

## 5. 進める順序の案（NEW-PROPOSAL）

依存関係と、オーナーが挙げた優先の論点から、次の順を提案する。順序はオーナーが変えてよい。

1. **PENDING-D-BAT-LEDGER**（＋各種設定・管理のうち機体・BAT）: 3系統の優先記録の一つで、BAT交換の画面（35b §7）や飛行の明細（35a）の選択のしかたにも影響する。
2. **PENDING-D-HUMAN-OUTPUT**: 保存済みのKMLとA4記録を、人が使える形にする部分。BAT台帳とA4の出力を合わせて、帳票見本で確かめられる。
3. **PENDING-D-NEW-FLIGHT-SCREENS**: 通報までの入口。25bと17の画面を、ホームから通報内容の確認までの一本の流れにつなぐ。
4. **PENDING-D-STATUS-DISPLAY**: 1〜3の画面が揃ってから、共通の見せ方と操作を決める（先に決めると各画面の詳細に引きずられる）。
5. 残りの各種設定（人員・場所・プリセット・環境）と、飛行履歴・出力の詳細（34e）。

**適用限界**: 本書は設計の棚卸しで、実装の順序や着手を意味しない。C1を含む実装は、オーナーが明示的に実装開始を指示するまで凍結する。

## 6. モックで比較できる範囲の更新（2026-09-22）

新規飛行は[25b §7](../dips-flight-plan/25b_manual-web-mapping.md#7-スマートフォンの標準候補と比較案2026-09-22)のDIPS公式22項目順を標準候補とし、独自まとめ案を右側から比較できる。通常運航は[35b §12](../operation-recording/35b_normal-operation-and-final-save.md#12-旧現場uiを継承した設計候補2026-09-22)の旧現場UIを継承した候補へ更新した。どちらもCURRENT-PROPOSALで、PENDING-D-NEW-FLIGHT-SCREENS／PENDING-S6-OPERATION-UIは継続する。

通報結果と飛行リスト双方で、正常受付・重複なし以外は通常運航への接続を止める（[34d §7](34d_dips-accepted-and-plan-content.md#7-通常運航へ進めない結果のモック境界2026-09-22)）。停止後の調整・解除・再開方法は未決。画面の存在と製品仕様の確定を区別し、DIPS情報の保存方式・利用者文言のPENDINGも維持する。初回に何を登録するかは2026-09-23に確定した（[34a §9.3](34a_setup-and-environment-entry.md#93-初回登録は1画面にまとめる)）。はじめの登録の必須項目（氏名とGoogleアカウントの2つ）は2026-09-23同日中に確定した。残るPENDING-S5-INITIAL-REQUIREDは、飛行開始時の必須範囲だけである。任意にした項目が通報のときに足りなければ、不足分だけを補い、人物の連絡先は対象Personの人物情報へ、DIPSの認証情報はDIPSのログイン情報へ保存して元の飛行計画へ戻す（[25b §1.1](../dips-flight-plan/25b_manual-web-mapping.md#11-通報時に不足している登録情報を補う受け皿2026-09-23)・[34a §8.3](34a_setup-and-environment-entry.md#83-未登録のまま通報が必要になったとき通常の経路ではなく受け皿)）。

## 7. 動くモックと正式Docsの同期監査（2026-09-23）

**因果・採用範囲**: オーナーがローカルの動くモックを今回の同期元と指定した。画面の存在だけで製品仕様に昇格させず、明示された初回・環境入口・不足補完・正常運航の接続を各正本へCURRENT-ACCEPTEDとして同期した。外部認証・送信・保存成功はモック内の疑似状態（EVIDENCE/EXAMPLE）であり、本番契約を認定しない。図はこの主フローの俯瞰で、Manualの未決経路や異常系の全FSMではない。

| 配置した責任（Responsibility Check） | 正本と実物証拠 |
|---|---|
| 初回・環境シート・会社追加・登録後の戻り先 | [34a §9](34a_setup-and-environment-entry.md#9-初回は個人環境から始め初回登録を1画面にまとめる2026-09-23)。`core.js`、`onboarding.js`、`register.js`、`nf-need` |
| ホーム4入口と環境操作入口 | [34b](34b_home-and-navigation.md)。`home.js`、`envSwitchSheet` |
| 人物連絡先の不足補完・再利用 | [25b §1.1](../dips-flight-plan/25b_manual-web-mapping.md#11-通報時に不足している登録情報を補う受け皿2026-09-23)。`need-save`。DIPS登録情報は34a §8.3 |
| 通報確認・疑似受付・リスト掲載・後で再開 | [34d §8](34d_dips-accepted-and-plan-content.md#8-通報の実操作と疑似成功の境界2026-09-23)。`nf-submit`、`commitPlan`、`worklist.js` |
| 点検・離着陸・BAT／機体交代・日常点検・完了 | [35b §13](../operation-recording/35b_normal-operation-and-final-save.md#13-運航完了までの実操作接続2026-09-23)。`operation.js` |

いずれも既存の責務・ライフサイクル・外部依存・セキュリティ境界・Phaseに収まる。新しい詳細正本文書は増やさず、初回・環境の判断は既存ADR-0030（Proposed）へ追補した。Accepted ADR本文の変更・新規ADR・C1実装はない。

**監査の境界**: モックの `A`／`S` とroute・ACTS、関連テストを照合。登録済み情報の保持は同一セッション内であり、翌日・別端末・再起動後の永続復旧を検証していない。BAT交換・機体交代は着陸内容確定後に行い、飛行中の操作ゼロ思想を維持する。最終日常点検は既存の飛行後点検と最終確認に接続し、追加の独立画面を作ったものではない。

**検証（EVIDENCE/EXAMPLE）**: [関連テスト](../../../design-mock/app/tests/index.html)226件、失敗0、JSエラー0、左側UI禁止語違反0。[browser-flow](../../../design-mock/app/tests/browser-flow.cjs)はローカルHTTP配信のChromeで412／430／1320pxそれぞれ、初回から3飛行（BAT交換・機体交代を含む）の保存、会社新規・既存参加・同じ会社への再参加・個人への切替まで左画面の実クリックで確認する。外部通信0。実機Safariや本番APIの検証ではない。Docsのリンク・アンカー・表・到達性エラーは0。検査のprivacy候補3件はテスト用の例示メール2件とローカルHTTP確認用のループバックURL1件であり、文脈を確認して公開可能な例示値と分類した。

**今回の整合対象に残した未決**: 保存列・台帳schema、KML保存先／命名、PDFレイアウト、本番DIPS／Drive API、credential暗号化・token、My Drive／Shared Drive所有、root再発見、再送・復旧、会社参加手段、DIPSフリガナ要否。各正本と[04](../../04_open-questions.md)の既存PENDING／VERIFYを維持する。主フロー外の背景切替・詳細整備・印刷共有・Manual補助等に残る案内表示を、接続済みの証拠とは数えない。
