# 99.2再移植 Step 6 — 通常運航・A4・点検整備・Drive責任の監査

最終更新: 2026-09-19

§1〜§6は初回Step 6（完了commit `b1d5788`）時点の監査記録を保持する。2026-09-19の機体別保存・命名の補正と確認範囲は[§7](#7-step-6追補機体個体別保存と日付連番)。現在仕様はリンク先の正式正本を読む。

## 1. 対象と基準点

- ブランチ: `redo/99-2-causal-migration`。
- 開始HEAD: `0a292519032c0dd18a31e3bfc4d85e3928570335`。開始時working treeはclean。
- 比較用main／origin/main: `6344d7a0816eef4adc69d2cbe948dbefa4352019`。変更・push先にしない。
- 原本: 現在の「99.2_設計検討メモ_全論点・根拠・因果統合正本.md」を直接読んだ。原本を変更・追跡追加しない。
- 移管: §5全体、§6のStep 3未移植部分、§10の責任構造・変遷。§6の取得確認・算入判断・Actorは32cへ参照し、全文複製しない。

本書は対応・証拠・確認範囲の索引。設計理由の詳細正本は[35a〜35d](../architecture/operation-recording/README.md)、[36](../architecture/maintenance-storage/README.md)、[37](../architecture/drive-structure/README.md)。旧mainのStep成果・ADRのコピー／cherry-pick／転用は行っていない。

## 2. 原本の識別と追加指示

行番号は1始まり、SHA-256はUTF-8元バイト列・改行込み。将来改訂版の固定位置を意味しない。

| 対象 | 行 | SHA-256 |
|---|---|---|
| 全文の同一性 | 全文（全章移植ではない） | `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358` |
| §5 | 239〜308 | `de317dc46fc9c59aa7a74214a5027a8042365771900e1ffd0b7d5c5b2e488583` |
| §6 | 309〜332 | `9802470dc10e821bcdbf78252ddfde9bc69a4394fb480f098a5d33fb3ee86b0f` |
| §10 | 530〜585 | `18fa9379124a5c873c3b2c3a4aae6cd4e3541e610ef280e83fabb4e5a830cbb1` |

当初Step 6依頼には物理タブ／ビューとPage 2の方式を未確定とする表現があったが、現在原本§5の272・285・297、§10の561〜564は、固定7明細・日付連番物理シートを現在到達点と明記していた。初回の照合で相違を示した後、オーナーの追加訂正は**指定した最新Drive実物を直接確認し、現在99.2の後続判断とGitの旧設計を合わせること**を指示した。今回の移管はその指示に従う。実物1枚から生成条件を推論して確定したものではない。

§10の566〜570はStep 5の画面正本への接続に限定。555と578のKMLサンプル階層は証拠の境界として扱い、578に含まれる生成タイミング等のKML仕様は明示対象外として移管しない。§7残り・§8・§9全体・§11、Geometry、重複調整・取消、KML／My Maps詳細へ進んでいない。

## 3. 証拠経路と直接確認の範囲

| 証拠経路 | 今回確認した内容 | 限界 |
|---|---|---|
| 現在99.2 | §5・§6・§10を直接読み、過去・現在・未確定と対象外を対照 | 原本に記録された全実物を今回操作したわけではない |
| 最新Google Drive A4実物 | 「無人航空機・飛行記録・日常点検記録_確認用_1飛行」を検索・識別し、SheetsメタデータとA1:AM36のセル・書式を直接取得。同じ実ファイルの今回取得XLSXで列幅・行高・結合・pageSetup、PDF全1ページを描画して目視確認 | ブラウザー環境が利用できずSheets印刷プレビュー・実紙印刷は未確認。実飛行を記入した全入力長や自動複製の試験ではない |
| 実物の観測事項 | 上部基本情報、左右の前後点検、行24〜30の固定7枠、記事・不具合・処置、文字サイズ・明示改行・列幅・行高。整備サマリー欄がないこと。寸法・位置の詳細は[35c §2](../architecture/operation-recording/35c_a4-operation-record.md#2-最新実物から直接確認したこと) | シート命名・8行目以降・機体／場所切替・自動複製は1枚から確認できず、§5の後続判断と分離 |
| 実物の同一性・非編集 | 更新時刻2026-09-16 04:31:07.725 UTCを取得前後で確認。実物の編集APIは呼ばず、検索・メタデータ・セル読取・取得のみ | 読取履歴とファイル変更を混同しない。第三者の全操作監査ではない |
| 旧GASコード | 基準アプリcommit `e8560b03e1220cb3b38e927190bdcb03191ddc57`の保存計画・各割当への帳票記入・Web最終保存入口をローカル同版で読解。参照先と意味は[35d](../architecture/operation-recording/35d_operation-finalization-and-write-boundary.md) | 静的読解。実GAS再実行・旧マニュアル実機・全復旧経路の再検証ではない |
| Git履歴・既存設計 | `5d51315`の18とADR-0007、開始commitの18／12e／13a／24a等を比較。旧ページネーション・整備サマリー・単一離着陸Flight・全面タブ禁止を確認 | 旧mainのADRは番号・履歴対応を確認。本文を移管元にしない |
| 既存Docs | 11／14／18／19／23、Domain、32a〜32c、presentation、output、24a、10／20／21／22、規約と目次を責任別に照合 | 99.2の対象外章との全体整合監査ではない。KML等の既存仕様の最新性を再認定しない |
| 過去エージェント履歴 | ctx読取検索。「原本_点検整備記録」「buildFixedCommitPlan_」「柔軟な取扱い」の絞込では検索した範囲に該当なし。広い検索結果を判断根拠にしない | inventoryに取得失敗49件があり、全履歴の不存在とはいわない |
| 05・01〜07全体・旧モック | 原本内の確認記録をEVIDENCE/EXAMPLEとして参照 | 今回の直接Drive確認は最新A4に限定。整備原本や全フォルダーの再監査はVERIFYに残す |

今回取得PDFは1ページだがMediaBoxはLetter。XLSXのA4縦設定とオーナー指定を保持し、印刷経路差はVERIFY-S6-A4-PRINTへ記録した。A4縦1枚を未確定へ戻す理由にも、実紙印刷を確認済みとする理由にもしない。

## 4. 論点ごとの詳細正本

| 原本の位置・論点 | 唯一の詳細正本 | 移管した因果・境界 |
|---|---|---|
| §5 241〜245 柔軟な1飛行 | [35a §1・§2](../architecture/operation-recording/35a_flexible-flight-and-details.md#1-旧運用と既存domainを同じ論点として読む) | 旧運用と単一離着陸型→連続条件→集約と明細保持。原本にない時間・距離条件は追加しない |
| §5 249〜254・262 交代と旧schema | [35a §3](../architecture/operation-recording/35a_flexible-flight-and-details.md#3-機体交代で引き継ぐ文脈と未確定のデータ境界) | 文脈継承／同一機体条件→新Flightの可能性→独立Switch・Mission分担は未確定 |
| §5 247〜248・255〜264 通常運航 | [35b](../architecture/operation-recording/35b_normal-operation-and-final-save.md) | 下書き・現場順序を継承→Step 5の入口→8論理画面の10項目。画面数・配置の先行確定を避ける |
| §5 266〜280・301〜307 旧A4と現在実物 | [35c §1・§2](../architecture/operation-recording/35c_a4-operation-record.md#1-旧帳票から最新実物へ至った理由) | 旧横No.1／No.2→旧18案→人による最新実物調整→現在レイアウト。実物と運用の出典を分離 |
| §5 271〜274・282・285・291〜299 A4保存・未決 | [35c §3・§4](../architecture/operation-recording/35c_a4-operation-record.md#3-その後の運用判断による現在ベースライン) | 固定7枠・日付連番・各分割先の点検→04の印刷可能Sheets→必要時07 PDF→細部・長期分割・印刷VERIFY |
| §5 283〜290 最終確定・一括保存 | [35d](../architecture/operation-recording/35d_operation-finalization-and-write-boundary.md) | 旧固定保存計画→途中保護と確定の区別→A4・BAT・点検・累計を落とさない→同一運航再送・方式PENDING。§9全体は移さない |
| §5 294〜295 正式0件・テスト | [35a §4](../architecture/operation-recording/35a_flexible-flight-and-details.md#4-正式実飛行とテストを混同しない) | 原本時点の状態とテスト非加算。32cの個別取得確認と分離 |
| §6 311〜319 日常点検との分離・媒体・自動範囲 | [36 §1〜§3](../architecture/maintenance-storage/36_aircraft-maintenance-records.md#1-通常の日常点検から分離する理由) | 通常入力へ詳細整備を混ぜない→機体別媒体→アプリの3準備物→操縦者の手動コピー |
| §6 320〜321・326 Actor・取得確認 | [32c](../architecture/asset-management/32c_acquisition-check-and-maintenance-actors.md) | Step 3正本を保持。36から参照し因果全文を複製しない |
| §6 323〜324・328〜331 意図的例外・根拠 | [36 §2・§4・§5](../architecture/maintenance-storage/36_aircraft-maintenance-records.md#2-1機体1フォルダー1spreadsheetに至る因果) | 一律タブ回避→機体別履歴の追いやすさ→例外維持、他領域への一般化禁止、物理詳細PENDING |
| §10 532〜538 旧一冊・技術分類・冊数・概念 | [37 §1・§4](../architecture/drive-structure/37_environment-storage-responsibilities.md#1-一冊中心技術分類から責任領域へ) | 旧案併存の誤認→責任単位を比較→旧概念を消さず物理配置を未決に残す |
| §10 540〜560・581〜584 整理・01〜07 | [37 §1・§2](../architecture/drive-structure/37_environment-storage-responsibilities.md#2-0107の現在責任) | 設計／実物／旧証拠の分離→七責任。個人Drive名を製品名へ固定しない |
| §10 561〜564 正規化と人間向け媒体 | [37 §3](../architecture/drive-structure/37_environment-storage-responsibilities.md#3-内部正規化と物理シートを混同しない) | 内部履歴と04物理A4の共存。詳細A4は35c、整備は36 |
| §10 566〜570 画面との接続 | [34a〜34d](../architecture/presentation/README.md) | 既存Step 5の因果を保持。37は参照だけ |
| §10 572〜579 旧実物・再現・空フォルダー | [37 §4](../architecture/drive-structure/37_environment-storage-responsibilities.md#4-旧実物サンプル未確定の扱い) | 存在≠最終仕様、旧実物を比較、抽象モックの先行確定・空階層の量産を避ける。KML詳細は除外 |

## 5. Responsibility Check・状態・旧設計の処置

主要責務・ライフサイクル・外部依存・独立変更可能性が異なるため、運航の意味／画面／A4／最終保存を35a〜35d、整備媒体を36、配置責任を37へ分けた。コードモジュールは作成しない。

| 観点 | 確認した境界 |
|---|---|
| 保守性・追加実装性 | A4実物改訂を通常操作・整備媒体の全文変更にしない。内部schemaと媒体を分ける |
| 堅牢性・障害復旧性 | 途中保護・最終確定・外部反映を区別し、部分失敗／重複防止の契約をPENDINGへ残す |
| セキュリティ | 31bの三層権限を参照。実人物・個別Drive ID・登録記号を公開しない |
| 検証可能性・監査性 | 実物観測、原本の後続判断、旧Git設計を別出典で追跡。因果は正式詳細文書に保持 |
| 可観測性 | 画面上の完了と外部保存成功を同一視しない。ログ方式を未承認追加しない |
| 複数ユーザー・複数組織 | 31a〜31dの環境境界を維持。所有・配置・長期分割を一人用実物から確定しない |

18の旧サマリー・自動続紙はHISTORICAL、3層生成責任は維持。12eの旧単一離着陸Flight・AircraftSwitch属性は旧候補として保持し、現在schemaではない。24aの全面タブ禁止を限定更新し、DIPS提出列・取消詳細は保持。32cのActor正本を複製していない。

| 状態 | 対象 |
|---|---|
| CURRENT-ACCEPTED | 柔軟な1飛行の意味・明細、通常順序と途中保護／最終保存、最新A4を基準とした固定7枠・物理シート運用、詳細整備の分離と媒体、七責任領域 |
| CURRENT-PROPOSAL | 文脈を継承した機体交代で新Flightへ切り替える接続候補（35a） |
| PENDING | schema、詳細UI、自動複製契約・補助者0人表示、年度／長期分割、最終保存契約、整備索引・物理配置。ID索引は[04](../04_open-questions.md#step-6の未確定検証先) |
| VERIFY | A4印刷経路、旧実機操作・保存の動作、05／環境全体の実物照合。今回の直接確認済み範囲は上表と35cに限定 |
| HISTORICAL | 旧No.1／No.2、旧18サマリー・続紙、旧schema候補、一冊・技術分類・全面タブ禁止 |
| EVIDENCE/EXAMPLE | 指定最新Drive実物、今回取得の書式・PDF、旧コード静的読解、原本内の旧資料確認記録 |
| NEW-PROPOSAL | 新規設計の採用なし。未確定の方式をAI一般論で確定しない |

ADR-0020〜0022を**Proposed**で新設。0019までの現ブランチと、旧mainの0010〜0014の番号対応を確認した。0007 §2.8／§2.9の限定置換を記録し、Accepted本文は変更しない。CURRENT-ACCEPTEDとADR Acceptedは別軸。

## 6. 変更ファイル・検査

変更一覧と検査範囲は以下のとおり。

既存変更36、新規13、削除0。すべてMarkdown文書。

| 種別 | 文書 | 主責任 |
|---|---|---|
| 変更 | [AGENTS.md](../../AGENTS.md) | 停止位置・正本の入口 |
| 変更 | [README.md](../../README.md) | Step 6範囲と利用者向け入口 |
| 変更 | [docs/00_index.md](../00_index.md) | 総合目次・範囲・領域配置 |
| 変更 | [docs/03_integrated-requirements.md](../03_integrated-requirements.md) | A4要件の整合と詳細参照 |
| 変更 | [docs/04_open-questions.md](../04_open-questions.md) | 未確定・検証先の索引 |
| 変更 | [docs/architecture/10_system-boundaries.md](../architecture/10_system-boundaries.md) | システム境界と責務分離設計 |
| 変更 | [docs/architecture/11_data-authority.md](../architecture/11_data-authority.md) | データ正本・権威・ライフサイクル設計 |
| 変更 | [docs/architecture/14_offline-and-sync.md](../architecture/14_offline-and-sync.md) | オフラインファースト・同期キュー・ストレージ保護設計 |
| 変更 | [docs/architecture/18_reports.md](../architecture/18_reports.md) | 旧A4の処置と帳票生成技術 |
| 変更 | [docs/architecture/19_failure-recovery.md](../architecture/19_failure-recovery.md) | エラー分類・障害フェイルセーフ・復旧設計 |
| 変更 | [docs/architecture/20_source-structure.md](../architecture/20_source-structure.md) | ソースコード構造とモジュール依存関係設計 |
| 変更 | [docs/architecture/21_testing-strategy.md](../architecture/21_testing-strategy.md) | テスト戦略・検証境界・テスト自動化設計 |
| 変更 | [docs/architecture/22_migration-plan.md](../architecture/22_migration-plan.md) | 現行システムからのデータ移行・並行運用・ロールバック設計 |
| 変更 | [docs/architecture/23_implementation-roadmap.md](../architecture/23_implementation-roadmap.md) | C4／C8の対象仕様接続。開始ゲートは保持 |
| 変更 | [docs/architecture/README.md](../architecture/README.md) | 領域と唯一の詳細正本表 |
| 変更 | [docs/architecture/asset-management/32b_battery-sharing-and-acquisition-history.md](../architecture/asset-management/32b_battery-sharing-and-acquisition-history.md) | 既存因果本文を保持しStep 6参照を追加 |
| 変更 | [docs/architecture/asset-management/32c_acquisition-check-and-maintenance-actors.md](../architecture/asset-management/32c_acquisition-check-and-maintenance-actors.md) | 既存因果本文を保持しStep 6参照を追加 |
| 変更 | [docs/architecture/asset-management/README.md](../architecture/asset-management/README.md) | 担当領域の正本・相互参照の案内 |
| 変更 | [docs/architecture/dips-submission/24a_submission-and-sheets-ledger.md](../architecture/dips-submission/24a_submission-and-sheets-ledger.md) | 正規化Sheets台帳とDIPS提出台帳 |
| 変更 | [docs/architecture/dips-submission/README.md](../architecture/dips-submission/README.md) | 担当領域の正本・相互参照の案内 |
| 変更 | [docs/architecture/domain-model/12_overview.md](../architecture/domain-model/12_overview.md) | Domain Modelの全体構造と正本 |
| 変更 | [docs/architecture/domain-model/12b_aircraft-and-battery.md](../architecture/domain-model/12b_aircraft-and-battery.md) | 機種・機体・バッテリーと互換関係 |
| 変更 | [docs/architecture/domain-model/12e_operation-inspection-maintenance.md](../architecture/domain-model/12e_operation-inspection-maintenance.md) | 運航・飛行・点検・整備と帳票発行記録 |
| 変更 | [docs/architecture/domain-model/12f_common-lifecycle-id-and-audit.md](../architecture/domain-model/12f_common-lifecycle-id-and-audit.md) | 共通ライフサイクル・ID・監査と一括登録準備 |
| 変更 | [docs/architecture/domain-model/README.md](../architecture/domain-model/README.md) | 担当領域の正本・相互参照の案内 |
| 新規 | [docs/architecture/drive-structure/37_environment-storage-responsibilities.md](../architecture/drive-structure/37_environment-storage-responsibilities.md) | 運用環境のDrive責任構造と人間向け記録 |
| 新規 | [docs/architecture/drive-structure/README.md](../architecture/drive-structure/README.md) | 担当領域の正本・相互参照の案内 |
| 新規 | [docs/architecture/maintenance-storage/36_aircraft-maintenance-records.md](../architecture/maintenance-storage/36_aircraft-maintenance-records.md) | 機体別点検整備記録と原本コピー運用 |
| 新規 | [docs/architecture/maintenance-storage/README.md](../architecture/maintenance-storage/README.md) | 担当領域の正本・相互参照の案内 |
| 新規 | [docs/architecture/operation-recording/35a_flexible-flight-and-details.md](../architecture/operation-recording/35a_flexible-flight-and-details.md) | 柔軟な取扱いの1飛行と明細・機体交代 |
| 新規 | [docs/architecture/operation-recording/35b_normal-operation-and-final-save.md](../architecture/operation-recording/35b_normal-operation-and-final-save.md) | 通常運航の画面と現場記録 |
| 新規 | [docs/architecture/operation-recording/35c_a4-operation-record.md](../architecture/operation-recording/35c_a4-operation-record.md) | A4運航・日常点検記録の実物と生成単位 |
| 新規 | [docs/architecture/operation-recording/35d_operation-finalization-and-write-boundary.md](../architecture/operation-recording/35d_operation-finalization-and-write-boundary.md) | 運航の最終確定と一括保存の責任 |
| 新規 | [docs/architecture/operation-recording/README.md](../architecture/operation-recording/README.md) | 担当領域の正本・相互参照の案内 |
| 変更 | [docs/architecture/output/27_output-boundaries.md](../architecture/output/27_output-boundaries.md) | 出力・データ連携の境界 |
| 変更 | [docs/architecture/output/27b_google-drive-storage.md](../architecture/output/27b_google-drive-storage.md) | Google Drive保存 |
| 変更 | [docs/architecture/output/README.md](../architecture/output/README.md) | 担当領域の正本・相互参照の案内 |
| 変更 | [docs/architecture/presentation/34a_setup-and-environment-entry.md](../architecture/presentation/34a_setup-and-environment-entry.md) | 既存因果本文を保持しStep 6参照を追加 |
| 変更 | [docs/architecture/presentation/34b_home-and-navigation.md](../architecture/presentation/34b_home-and-navigation.md) | 既存因果本文を保持しStep 6参照を追加 |
| 変更 | [docs/architecture/presentation/34d_dips-accepted-and-plan-content.md](../architecture/presentation/34d_dips-accepted-and-plan-content.md) | 既存因果本文を保持しStep 6参照を追加 |
| 変更 | [docs/architecture/presentation/README.md](../architecture/presentation/README.md) | 担当領域の正本・相互参照の案内 |
| 変更 | [docs/architecture/state-machines/13a_operation.md](../architecture/state-machines/13a_operation.md) | 現場運航状態マシン |
| 変更 | [docs/architecture/state-machines/README.md](../architecture/state-machines/README.md) | 担当領域の正本・相互参照の案内 |
| 新規 | [docs/decisions/ADR-0020-flexible-flight-and-finalization.md](../decisions/ADR-0020-flexible-flight-and-finalization.md) | 柔軟な1飛行と運航全体の最終確定を保持する（Proposed） |
| 新規 | [docs/decisions/ADR-0021-a4-record-layout-and-sheet-boundary.md](../decisions/ADR-0021-a4-record-layout-and-sheet-boundary.md) | 最新A4実物と固定明細シートによる運航記録（Proposed） |
| 新規 | [docs/decisions/ADR-0022-drive-responsibilities-and-human-records.md](../decisions/ADR-0022-drive-responsibilities-and-human-records.md) | Driveの七責任領域と人間向け記録媒体を分離する（Proposed） |
| 変更 | [docs/decisions/README.md](../decisions/README.md) | 担当領域の正本・相互参照の案内 |
| 新規 | [docs/migration/99-2-step-6-causal-audit.md](99-2-step-6-causal-audit.md) | 本Stepの移管・証拠・確認範囲の索引 |
| 変更 | [docs/migration/README.md](README.md) | 担当領域の正本・相互参照の案内 |

### 検査結果

- Markdown 119文書、138表、52コードブロック、相対リンク1,508件を検査し、ファイル／見出し参照・表列数・閉じ忘れのエラー0。INDEXから119文書へ到達。
- 画面表はStep 5の6画面とStep 6の8論理画面、計14表。それぞれ30の番号・項目名と一致する10項目。
- 保護対象44文書を開始commitとバイト比較して同一。guidelines/03、30、31a〜31d、32a、33a／33b、34c、16／17、既存ADR、Step 1〜5監査、DIPS項目・Manual・FSM／離陸評価、KML／My Maps／ログ詳細を保持。
- 32b／32c、34a／34b／34d、11／14／19、27bの9文書は元本文を保持した末尾参照追加のみ。23の§1.1／§1.2開始ゲートと、24aの§2以降のDIPS提出台帳詳細を保持。C0〜C9の配分は変更せず、C4／C8の今回対象仕様だけを接続。
- source 99.2全体と対象3節のハッシュは開始時と一致。src／public／package関連を含むコード変更0件。新規実装・C1着手・DIPS操作・Cloud設定変更なし。
- 公開予定49文書を秘密情報スキャナーと内容で検査し、SAFE（findings 0、unknowns 0）。実名・個別登録記号・Drive ID・ユーザーパスの原本照合でも混入なし。最新実物の生データ・画像・取得XLSX／PDF・私的識別情報はGitへ含めない。commit直前はstaged snapshotを再検査する。
- 正本の重複は概念対応表と参照先で確認。正式Docs内に詳細因果を置き、ADRは重要判断の要約、migrationは対応索引とする。Actor詳細は32c、画面入口は34a〜34dに維持。
- main／origin/mainは開始値を保持。push先は作業ブランチのみ。commit SHA・remote一致・最終working tree状態はcommit／push後にチャットで報告し、その後は停止する。

これは文書移管・構造検査の完了であり、未確定schema、長期運用、実機・印刷・保存実装の受入完了ではない。既存PENDING／WARNを独自解決していない。

## 7. Step 6追補：機体個体別保存と日付連番

### 7.1 基準と証拠の区別

開始HEADは`b1d57880aa7f6438b1d2683372f193d9b99f3dfd`、作業ブランチは`redo/99-2-causal-migration`、開始working treeはclean。対象はStep 6のA4保存先・命名・特殊競合の因果のみ。§7以降の新規移植、コード・C1実装、Drive操作、99.2原本変更は行わない。mainの開始値は§1と同じ。

| 証拠・判断 | 確認範囲と出典 |
|---|---|
| オーナーの2026-09-19追補指示 | 04の機体個体別フォルダー／Spreadsheetを実物確認結果として提示。EVIDENCE/EXAMPLEはオーナーの報告であり、今回エージェントがDriveを直接再取得した事実とはしない |
| 同指示で到達した判断 | 機体別保存、2桁年の日付・次空き連番、交代時の保存先切替、高度な特殊競合対策の非採用と再検討条件。CURRENT-ACCEPTEDは今回の追加判断に由来し、元の99.2に既に書かれていたとは扱わない |
| 現在原本・Git基準 | 99.2 §5と開始commitの35c等を直接照合。原本の`YYYY.M.D`と機体交代のまとめ方を過去の状態として追跡し、原本を変更せず正式Docsの因果へ補正を保持 |
| 前回の最新A4直接確認 | §3・35c §2の記録を保持。レイアウト再調査は行わず、今回の機体別構造の確認報告と混同しない |
| 既存正本・参照 | 35c／35d／37／18／ADR-0021／04／本監査と、docs内の命名・分割条件参照を照合。ADR-0021は同じ責任のProposedなので追補し、新ADRを作らない |
| 過去エージェント履歴 | ctxは読取専用、取得失敗49件のため部分的。対象語「同じ機体 次の空き連番」「操縦者コード」は検索範囲で該当なし。今回の判断根拠はオーナー指示と現Docsであり、履歴の不存在を断定しない |

### 7.2 詳細正本と状態の処置

| 論点 | 詳細正本・処置 |
|---|---|
| 機体別実物→旧解釈の問題→個体境界を使う理由 | [35c §3.1](../architecture/operation-recording/35c_a4-operation-record.md#31-機体個体別の保存先を確認したことによる補正)。旧解釈はHISTORICAL、現在の境界はCURRENT-ACCEPTED |
| 日付・次空き連番、機体交代、同一機体の追加A4 | [35c §3.2](../architecture/operation-recording/35c_a4-operation-record.md#32-機体内の日付と次空き連番)。操縦者コードや新ID体系を追加しない |
| 競合の成立条件・稀とする判断・非採用・再検討 | [35c §3.3](../architecture/operation-recording/35c_a4-operation-record.md#33-特殊な同時競合を検討したうえで簡素な方式を選ぶ理由)。頻度はオーナーの運用判断であって実測値ではない。詳細を本監査へ複製しない |
| 通常再送と新規A4採番の違い | [35d §3](../architecture/operation-recording/35d_operation-finalization-and-write-boundary.md#3-保存に到達できない場合と重複防止)。既存の保持・冪等性要件を維持。PENDINGを特殊競合向け高度機構の必須実装と読まない |
| Drive責任・帳票生成との接続 | [37](../architecture/drive-structure/37_environment-storage-responsibilities.md)・[18](../architecture/18_reports.md)は要約と35c参照。七領域全体や3層Report Modelを再設計しない |
| 残る未確定 | 場所の厳密な区切り・柔軟な1飛行との関係・最終schema、長期／年度分割、複製・通常再送等の詳細はPENDINGを保持。A4印刷VERIFYと対象外のPENDING／WARNは解消しない |

Responsibility Checkでは、追加対象は既存A4保存・命名の主要責務と同じで、ライフサイクル・外部依存・セキュリティ境界・Phaseも増えないと判断した。新文書へ分割せず35cへ詳細を置き、ADRは重要判断の要約、37は全体配置、35dは保存・再送契約に留める。保守性・追加実装性は単一正本、堅牢性・障害復旧性は再送要件と再検討条件、セキュリティ・複数ユーザー／複数組織対応は既存環境・個体境界、検証可能性・監査性・可観測性は出典主体の区別と実際に観測された競合による再検討で確認した。監視基盤や新モジュールは追加しない。

### 7.3 追補の変更ファイルと検査

| 変更文書 | 追補の責任 |
|---|---|
| [35c](../architecture/operation-recording/35c_a4-operation-record.md) | 保存先・命名・競合非採用の詳細因果、旧解釈の履歴化 |
| [35d](../architecture/operation-recording/35d_operation-finalization-and-write-boundary.md) | 通常再送と新規採番の境界・PENDINGの限定 |
| [37](../architecture/drive-structure/37_environment-storage-responsibilities.md) | 04の保存境界と詳細正本への接続 |
| [18](../architecture/18_reports.md) | 生成先と旧分割解釈の参照訂正 |
| [ADR-0021](../decisions/ADR-0021-a4-record-layout-and-sheet-boundary.md) | 同一判断領域の追補。Proposedを維持 |
| [04_open-questions](../04_open-questions.md) | 到達点と残るPENDINGの案内 |
| [00_index](../00_index.md) | 追補の入口 |
| [architecture README](../architecture/README.md) | 概念別正本の範囲 |
| [operation-recording README](../architecture/operation-recording/README.md) | 保存・命名の詳細入口 |
| [drive-structure README](../architecture/drive-structure/README.md) | 04追補への案内 |
| [decisions README](../decisions/README.md) | ADR-0021追補の案内 |
| 本監査 | 証拠主体・修正対応・確認範囲の索引 |
| [migration README](README.md) | 初回完了点と追補への入口 |

- 変更は上記既存13文書のみ、新規・削除0。差分を読み、A4保存・命名の補正とその参照・監査以外へ拡張していないことを確認した。
- Markdown 119文書・141表・52コードブロック・相対リンク1,540件を検査し、参照先・アンカー・表列・閉じ忘れのエラー0。INDEXから119文書へ到達する。
- 35cの旧帳票経緯・直接実物確認（§1・§2）と印刷VERIFY、初回Step 6監査本文（§1〜§6）を開始commitと比較して保持。最終schemaの35a、Step 1〜5、23開始ゲート、他ADRを含む変更一覧外の追跡ファイルは不変。
- 99.2原本のSHA-256は`f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358`で開始時と一致。コード変更0、Drive操作・編集0、§7以降の追加移植0。
- 公開予定13文書の秘密情報スキャナーはSAFE（findings 0、unknowns 0）。差分の文脈確認でも実名・実登録記号・非公開Drive IDを追加していない。commit直前にステージ内容の一致と公開対象を再検査する。

commit／push後のSHA・remote一致・working tree状態はチャットで報告し、そこで停止する。
