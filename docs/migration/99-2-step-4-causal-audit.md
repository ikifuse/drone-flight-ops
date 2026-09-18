# 99.2 因果を保持する再移植 — Step 4 対照・監査

確認日: 2026-09-18\
対象: §7のDIPS API基盤・固定送信元IP・Google Cloud／Cloud NAT・秘密情報・通信障害境界のみ\
役割: 移管対応・証拠・確認範囲・検査の索引。詳細因果の正本は33a／33b／16。

## 1. 基準と対象境界

- 開始ブランチ: `redo/99-2-causal-migration`。開始HEAD / origin同ブランチ: `ed21ed4a604d14d1ec0c3d00ab40b40ec3a1bf89`。開始時working treeはclean。
- [Step 1](99-2-step-1-causal-audit.md)、[Step 2](99-2-step-2-causal-audit.md)、[Step 3](99-2-step-3-causal-audit.md)は完了済み。再移植の基準`ea73d083f83f5bd58d9d78d930c0c860c038c849`から継承した現ブランチDocsを読む。
- main / origin/mainの保存対象: `6344d7a0816eef4adc69d2cbe948dbefa4352019`。旧mainのStep成果・ADR-0014・旧接続基盤文書をコピー・転用・cherry-pickしない。
- §7全体の移植ではない。Geometry詳細、Manual UI、submission_snapshot全体、API payload詳細、共有飛行リスト、正常応答後の画面遷移、重複調整UI、KML生成／保存／再送、飛行履歴／出力は対象外。
- §3・§5・§6の残り・§8以降、コード、Phase C1〜C7実装、Google Cloudコンソール・DIPS本番設定の変更は対象外。99.2原本も変更しない。

## 2. 証拠と今回の確認範囲

| 証拠 | 確認した内容と限界 |
|---|---|
| 99.2原本 | §7の333〜424行を直接読み、対象と除外を識別。全文SHA-256 `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358`。§7部分は `2fe751a18934d16dee503fb3ab1eeee537619c135cb787c388db39b34d9cb81b`。いずれもUTF-8・元改行 |
| 基準Docs・Git履歴 | 10／15／16／19／23、13b、14、24、25c、要件、ADR-0001／0004／0006を照合。`0211a9a`の中継・秘密隔離から`3d2ed14`のBFF／保持候補、基準commitの領域分離へ続く同じ論点として読む。旧比較02等は当時の費用・保守評価として参照 |
| 航空局照会・申請 | 99.2の381〜384行に確認・最終訂正版送付の記録がある。原メール、申請xlsx、設定通知、Cloudコンソール、実際の送信元IPは今回再確認していない。原本の到達点と新規実証を区別する |
| 過去エージェント履歴 | ctxの索引を更新せず、DIPS・固定IP・Cloud NAT、航空局・再割当で検索。本判断の原照会を直接裏付ける結果は検索範囲で見つからなかった。49失敗単位を含む部分的索引であり、履歴全体に存在しないとはしない |
| Google公式資料の補助確認 | 2026-09-18にCloud NATの責任、手動／自動IP割当の違いを読解。[33a §5](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md#5-補助確認と未確定事項)に公式リンクと適用限界を保持。実構成・審査条件の充足確認やcompute選定ではない |
| 国交省の公開入口 | [DIPS関連資料の公式入口](https://www.mlit.go.jp/koku/koku_ua_dips.html)も確認したが、公開入口の読解で個別照会回答を再証明したとは扱わない。最新認証契約の再認定は行っていない |
| 旧main | ADR番号一覧・履歴の衝突を確認した。旧ADR-0014や旧dips-infrastructure本文を移管元として読解・コピーしていない |

移管した原本の中心断片は以下。原本の非公開値は転記せず、固定IPは`<DIPS_FIXED_EGRESS_IP>`とする。

| 原本位置 | 移管する意味 | SHA-256（元UTF-8・改行込み） |
|---|---|---|
| 381〜384行 | 個人申請・専有固定IP条件、旧経路からの変更、最終訂正版送付、URL未確定・通知未受領、限定バックエンド | `e39dc634af69c56b84263c5dbba9471b255355b004949a46435c8e904fedfaee` |
| 389行 | 通常保存とDIPS正式通報のretryを分ける | `3f64f3d215f793e7205d4f79710bc079b23d441de9b38255ac26aec5a218ee61` |
| 393〜394行 | 結果不明POSTの盲目的再送を防ぐ。Sheets／KML失敗でDIPSを再通報しない | `913f982b9a0833d2eae01510541014c00cc06bae804e79634cd080eef91aabbc` |
| 363行の「結果確認が必要な状態として保持し」以降だけ | 同じPOSTを盲目的に再実行しない安全境界。前半の正常応答後の画面仕様は移管しない | `7a7c318be918e046008f0587b332b0090fb3870811dfe2cbc8ffbf52ef30c3f6` |

376〜377行のManual経路、379〜380行のAPI電文、414行の未確定一覧、421行の申請証拠入口は境界識別の参考とした。今回扱う通信・認証の未確定を除き、UI・payload・他の未決・申請原ファイルの詳細は移植しない。対象外の到達済み設計をPENDINGへ降格したという意味ではない。

## 3. 対象論点と詳細正本

以下の正式設計に当初状態→問題→確認・根拠→検討案→変更・却下理由→現在到達点→例外・未確定を保持する。本表は配置の索引であり、因果の全文を複写しない。

| 論点 | 維持・変更する境界 | 詳細正本 |
|---|---|---|
| GAS／Workers採用と当時の理由 | 低い運用負担・秘密隔離・Adapterの理由を残し、Workers製品指定をHISTORICALへ | [33a §1](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md#1-当初の中継設計と維持する理由) |
| 航空局照会・個人申請・申請準備 | 個人申請不明という旧状態から照会記録へ。申請可能と承認を分ける | [33a §2](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md#2-航空局確認によって不足が明らかになった条件) |
| 非再割当・停止／再作成時維持・専有固定IP登録 | 秘密隔離だけでは登録IP条件を満たさないことを接続変更の発端として保持 | 33a §2 |
| Google Cloudバックエンド・Cloud NAT・固定出口 | API処理とNATの責任を分け、詳細経路図は一つにする | [33a §3](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md#3-現在の通信境界) |
| コンピュート・VPC・NATまでの具体接続 | 採用方針と構成選定を分離。Cloud Run等を決めない | [33a §5](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md#5-補助確認と未確定事項) |
| バックエンド限定責務・中央DB非採用 | API電文の通過と全運航データの正式保管を分け、一時状態まで禁止しない | [33a §4](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md#4-バックエンドを中央運航dbにしない理由) |
| client_secret・秘密設定・ブラウザ境界 | 当時のトークンJS露出回避の理由を維持。CORS不許可を新しい根拠にしない | [16 §1・§2・§7](../architecture/16_security.md) |
| BFF・Cookie・Token保存候補とrealm／endpoint | 旧候補・例を保持し、正式通知未受領と未選定を区別 | [16 §2〜§4・§6・§9](../architecture/16_security.md#9-step-4の認証確認と保持方式の未確定)。15はAdapterの参照例 |
| 最終訂正版送付・URL未確定・Client ID／Secret未受領 | 送付済みを認証契約確定・接続成功へ昇格しない | 33a §2、16 §9 |
| Manual独立・C6／C7分離 | API基盤不在／障害をアプリの必須起動条件にしない | [33b §1](../architecture/dips-infrastructure/33b_api-availability-and-retry-boundaries.md#1-api基盤をアプリ全体の起動条件にしない) |
| DIPS結果不明と通常同期のretry | 二重通報を防ぐ因果、未登録確認後だけ再送、別保存失敗との切断を保持 | [33b §2](../architecture/dips-infrastructure/33b_api-availability-and-retry-boundaries.md#2-通常同期とdips正式通報を分けた因果)。13b／14は詳細の既存正本 |
| payload責任・UI／FSMの対象外 | 33aにMapper・DTO・No.1〜88の詳細を増設せず、[25c](../architecture/dips-flight-plan/25c_api-payload-mapping.md)へ参照。詳細FSM／UIは再移植しない | 33a §4、33b §2 |

## 4. Responsibility Checkと正本分担

ネットワーク出口は、システム全体の境界10・Adapter契約15・秘密情報16とは主責務、外部依存、セキュリティ境界、独立変更範囲が異なる。固定IPと申請・構成の因果を33a、API不在と結果不明時の通信安全を33bへ分離し、既存16の秘密／認証候補は移動・複製しない。文書分割であり、将来のsourceモジュールやクラウド製品を選定するものではない。

| 観点 | 点検した責任境界 |
|---|---|
| 保守性・追加実装性 | 経路を変える際にpayload表や人物・機材正本を改変しない。10／15／23は要約参照 |
| 堅牢性 | API基盤と現場運航・Manualを切り離し、結果不明POSTを通常retryへ混入させない |
| セキュリティ | クライアントへ秘密を置かず、公開文書に実IP・credential・個人実値を入れない。CORS等の仮定を確定しない |
| 検証可能性・監査性 | 到達済み方針と未検証の実構成・契約を分け、因果を正式Docsで追える。原本の範囲をhashで識別 |
| 障害復旧性 | 結果不明の確認を飛ばさず、登録IP維持・復旧手順の未決を残す。新しい全FSMは作らない |
| 可観測性 | API登録結果と保存結果を分ける意味を保持し、監視・ログ・ネットワーク復旧の具体構成はPENDINGへ残す |
| 複数ユーザー・複数組織 | 限定バックエンドから中央運航DB化やtenant別資格構成を推定しない。31a〜31d・Drive正本・所属設計を変更しない |

[ADR-0018](../decisions/ADR-0018-dips-fixed-egress-and-limited-backend.md)をProposedで新設した。旧mainの0010〜0014と現ブランチ0015〜0017の番号を確認し、未使用18を利用。0001 §3／0004 §2・§3項3のDIPS用Workers指定だけをPartially Supersedesの関係として記録する。旧ADR本文・Accepted履歴を変更せず、Proposedを正式承認済みの上書きと扱わない。

## 5. 状態と残す事項

| 状態 | 扱い |
|---|---|
| CURRENT-ACCEPTED | 99.2のGoogle Cloud＋Cloud NAT＋専有固定IP方針、限定バックエンド、秘密隔離、Manual独立、結果不明POSTの安全境界。変更可能な現在ベースライン |
| CURRENT-PROPOSAL | 今回、具体実行基盤・保持方式をこの状態へ昇格していない。旧候補の存在を現行採用と混同しない |
| PENDING | PENDING-C7-INFRA（33a）：compute・VPC／NAT具体経路・IP維持／復旧・費用／監視。PENDING-S4-SESSION（16）：最小一時状態・Token／Sessionの保持・寿命・失効・具体通信 |
| VERIFY | VERIFY-S4-API-CONTRACT（16）：正式仕様・認証・credential通知・URL確定／登録・照合契約。VERIFY-S4-APPLICATION-EVIDENCE（33a）：原回答・申請・IP実環境との照合 |
| HISTORICAL | Workers経路、BFF／Cookie／KV等の具体候補、個人申請未確認という過去状態。当時の理由を保持し、現行経路と並立させない |
| EVIDENCE/EXAMPLE | 99.2が記録した照会・申請送付、過去公式調査のrealm／endpoint例、今回Google公式資料で補助確認したNATの責任。証拠ごとの時点・限界を明記 |
| NEW-PROPOSAL | 新規技術・業務仕様の追加なし。責任分割と参照整備を、原本にない技術選定として扱わない |

接続URL／OIDCリダイレクトURLは原本時点で未確定、Client ID／Secret等の通知は未受領。詳細の唯一の入口は[04 §7](../04_open-questions.md#7-992再移植step-4の未確定と確認境界)から各正本へ接続する。Step 1〜3や他領域のPENDING／WARNは解消しない。

## 6. 変更ファイルと責任

新規5件・既存更新20件、削除0件。

| 種別 | ファイル | 責任・変更 |
|---|---|---|
| 更新 | [AGENTS.md](../../AGENTS.md) | 現在停止位置とDIPS用Workersの過去化 |
| 更新 | [README.md](../../README.md) | Step 4範囲と新領域の入口 |
| 更新 | [00_index.md](../00_index.md) | 総合入口・配置・状態範囲 |
| 更新 | [03_integrated-requirements.md](../03_integrated-requirements.md) | 接続経路・認証候補の参照と状態 |
| 更新 | [04_open-questions.md](../04_open-questions.md) | 個人申請の旧状態から現在への接続・PENDING／VERIFY索引 |
| 更新 | [10_system-boundaries.md](../architecture/10_system-boundaries.md) | 四境界を維持し、現在経路・限定責任の要約参照 |
| 更新 | [14_offline-and-sync.md](../architecture/14_offline-and-sync.md) | キュー契約を維持し、結果不明POSTと保存retryの因果へ参照 |
| 更新 | [15_dips-adapter.md](../architecture/15_dips-adapter.md) | Adapter分離を維持。経路変更・旧認証例とVERIFY |
| 更新 | [16_security.md](../architecture/16_security.md) | 秘密隔離の理由、旧BFF／Token候補、現在の正式認証確認・保持未決の詳細正本 |
| 更新 | [19_failure-recovery.md](../architecture/19_failure-recovery.md) | API基盤障害の非波及とDIPS再送例外への接続 |
| 更新 | [23_implementation-roadmap.md](../architecture/23_implementation-roadmap.md) | 停止位置とC7接続指定。開始ゲート・他Phase配分は保持 |
| 更新 | [architecture/README.md](../architecture/README.md) | 領域入口・概念の唯一の詳細正本 |
| 更新 | [25a_field-catalog.md](../architecture/dips-flight-plan/25a_field-catalog.md) | 77番の旧Workers注入指定のみ正式認証VERIFY参照へ変更 |
| 更新 | [25c_api-payload-mapping.md](../architecture/dips-flight-plan/25c_api-payload-mapping.md) | 中継先の旧Workers指定のみ33aへ接続。payload詳細は保持 |
| 更新 | [dips-flight-plan/README.md](../architecture/dips-flight-plan/README.md) | API電文と送信経路の責任分担 |
| 更新 | [24_manual-submission.md](../architecture/dips-submission/24_manual-submission.md) | 個人申請・固定IPの旧確認待ちと現在記録を区別。Manual独立参照 |
| 更新 | [dips-submission/README.md](../architecture/dips-submission/README.md) | ManualとAPI基盤の境界入口 |
| 更新 | [13b_dips-submission.md](../architecture/state-machines/13b_dips-submission.md) | 通信安全の因果参照だけを追加。詳細FSMは保持 |
| 新規 | [dips-infrastructure/README.md](../architecture/dips-infrastructure/README.md) | 新領域の責任・読む順番・範囲 |
| 新規 | [33a_fixed-egress-and-api-connection.md](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md) | 固定IP・接続経路・限定バックエンド・実行基盤未決の詳細因果 |
| 新規 | [33b_api-availability-and-retry-boundaries.md](../architecture/dips-infrastructure/33b_api-availability-and-retry-boundaries.md) | Manual独立と結果不明時retryの詳細因果 |
| 新規 | [ADR-0018](../decisions/ADR-0018-dips-fixed-egress-and-limited-backend.md) | 重要判断・限定置換関係・却下理由・見直し条件（Proposed） |
| 更新 | [decisions/README.md](../decisions/README.md) | 番号履歴・承認状態・限定置換の案内 |
| 新規 | [本Step 4監査](99-2-step-4-causal-audit.md) | 移管対応・証拠・確認範囲・検査索引 |
| 更新 | [migration/README.md](README.md) | Step 1〜3の監査を保持しStep 4へ案内 |

## 7. 最終検査

2026-09-18に次を確認した。実装・外部環境の受入完了とは区別する。

- 文書変更25件（既存20・新規5）、削除0、非文書変更0。src／public／packageを含むコード変更0、Phase C1〜C7実装未着手。
- 全100文書をMarkdown parserで処理し、101表・50 code fence・相対リンク1,115件の対象ファイル／見出し、表の列数、fenceの閉じ忘れを検査。エラー0。総合INDEXから100/100文書へ到達。
- 原本§7から上記対象断片と12論点群を照合し、33a／33b／16の正式設計で因果を追跡できることを点検。旧Workers採用理由を残し、現行経路と並立させていない。比較・過去監査・過去ADRに残るWorkersは当時の記録として読む。
- 固定出口の詳細構成は33a、通信安全の因果は33b、秘密・旧認証候補と正式契約確認は16に一本化。10の責務図や15のAdapter図は参照に留め、API payloadの詳細正本を増設していない。INDEX・root／領域README・概念正本表・利用側参照を照合した。
- 00_goal、guidelines/03、presentation/30、identity-and-access全5文書、asset-management全4文書、ADR-0015〜0017、Step 1〜3の監査は開始HEADとバイト一致。23の§1.1・§1.2開始ゲートとC0〜C6／C8〜C9の実装配分は一致。C7は接続指定と未確定の参照のみ更新した。
- 13bのFSM本文は開始HEADと一致。25aは77番の旧中継指定、25cは旧Workers経路の参照だけの変更で、残る本文は一致。16のStep 2権限接続節も一致。
- ADR-0001〜0009本文は開始HEADと一致。0018は番号衝突なし、Proposedを維持。旧mainの移植本文のコピー・転用はしていない。
- 99.2全文・§7・対象断片のhashは開始時と一致。§3・§5・§6残り・§7対象外・§8以降を移植せず、Google Cloud／DIPS本番設定を変更していない。
- `git diff --check`はエラー0。commit前のremote照会でmainは保存SHA、作業ブランチは開始SHAと一致し、別のremote更新なし。
- 公開対象25文書を本文・差分とprivacy scannerで確認し、検出なし（SAFE）。原本の実IP・識別子候補との照合でも非公開値の一致なし。長い文字列の一致は既存公開リポジトリ名と文書名に限る。実固定IP・credential・Project ID・非公開URL・個人実値・private Drive IDを持ち込まず、自動検出を網羅保証とはしない。
- 基準PENDING／WARNは保持。原メール・申請原ファイル・実IP設定・credential通知は未再確認、実通信試験・アプリテストは未実施。文書検査の成功を実装・接続成功とは報告しない。

Step 4を単一のatomic commitとして指定ブランチへpushした後に停止する。commit SHAとpush結果はGit記録と完了報告で示す。次Stepへは進まない。
