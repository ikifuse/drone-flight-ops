# ドキュメント総合目次

最終更新: 2026-09-24\
プロジェクト: `drone-flight-ops`

## 1. 役割・読み順・現在状態

本書は文書の所在・役割・状態・関連領域を案内する総合入口です。詳細ファイルは領域READMEへ登録し、本書で重複列挙しません。新設・移動・分割・廃止時は、対象READMEと本書の入口・状態を同時に確認・更新します。

`AGENTS → 00_index → 対象領域README → 正本詳細文書` の順に読みます。

- Phase A（要件整理・既存資料分析）、A.5（構造・案内・保守規約整備）、B1/B1.1/B1.2/B1.3（比較・再監査・最終整合）、B2/B2.1/B2.2/B2.3（詳細設計・実装前監査・手動台帳・凍結監査）、最終整合訂正パッチは完了。Phase B設計凍結。
- ADR-0001〜0007 Accepted（オーナー承認2026-09-14、正規化マスター・統合帳票設計反映）。2026-09-15のdocs再編指示に基づく部分置換はADR-0008/0009。
- **C0基盤・PWA Shell構築完了、C1設計準備完了。C1以降は未着手、C0受入確認・オーナーGO待ち。**
- **99.2再移植はStep 7a（§7の実画面確認・共通Geometry・submission_snapshot・Manual／API経路・DIPS対象外）・Step 7b（§7の06の記録責任・作業台帳・取消／リスト整理の境界）・Step 7c（KMLの位置づけ・単位・生成契機・内容・再送）・Step 7d（PDFの役割分離・生成契機、飛行履歴・出力の画面）・Step 7e（§9の正本・端末cache・時点分離・費用の境界）・Step 8（§11の差分監査）まで**。Step 1（§0・§1）・Step 2（§2）を保持し、人物領域は[identity-and-access](architecture/identity-and-access/README.md)、機材の取得・共用・履歴は[asset-management](architecture/asset-management/README.md)を詳細正本とする。[移植記録](migration/README.md)から確認範囲へ進む。Step 3の機材領域も保持する。Step 4は[dips-infrastructure](architecture/dips-infrastructure/README.md)と[16](architecture/16_security.md)へ配置。Step 5の画面・因果は[presentation](architecture/presentation/README.md)へ配置。Step 6は[operation-recording](architecture/operation-recording/README.md)／[maintenance-storage](architecture/maintenance-storage/README.md)／[drive-structure](architecture/drive-structure/README.md)へ§5・§6残り・§10を配置。Step 7aは[dips-flight-plan](architecture/dips-flight-plan/README.md)の[25e](architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md)へ共通の源・Manual／API・DIPS対象外の因果を、[26](architecture/26_dips-web-ui-verification.md)へ実画面の証拠系列を配置（判断は[ADR-0023](decisions/ADR-0023-common-source-and-derived-submission-paths.md) Proposed）。Step 7bは[dips-submission](architecture/dips-submission/README.md)の[24b](architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)へ06の記録責任・作業台帳・取消／整理の意味を配置（追補は[ADR-0022](decisions/ADR-0022-drive-responsibilities-and-human-records.md) Proposed）。Step 7cは[output](architecture/output/README.md)の[27e](architecture/output/27e_kml-generation-timing-and-content.md)へKMLの生成契機・内容・単位・再送を配置（判断は[ADR-0024](decisions/ADR-0024-kml-generated-at-plan-submission-from-report-content.md) Proposed）。Step 7dは[output](architecture/output/README.md)の[27f](architecture/output/27f_derived-pdf-roles-and-map-pdf.md)へPDFの役割・生成契機を、[presentation](architecture/presentation/README.md)の[34e](architecture/presentation/34e_history-and-output.md)へ飛行履歴・出力の画面を配置（判断は[ADR-0025](decisions/ADR-0025-derived-pdf-roles-and-on-demand-generation.md) Proposed）。Step 7eは[sync-and-cache](architecture/sync-and-cache/README.md)の38a・38bへ共有正本と端末cache・時点分離を、[37 §6](architecture/drive-structure/37_environment-storage-responsibilities.md#6-保存の所有と費用の境界)へ保存の所有と費用の境界を配置（判断は[ADR-0026](decisions/ADR-0026-shared-source-confirmation-and-timing-separation.md)・[ADR-0027](decisions/ADR-0027-storage-ownership-and-cost-boundary.md) Proposed）。§11の差分監査は[Step 8](migration/99-2-step-8-diff-audit.md)で実施した（語句検索と回収12項目・現状差分8項目の対照。実機・実Drive・旧資料の再確認ではない）。残る未確定は各正本のPENDING／VERIFYで、解決済みとは扱わない。依存実装は[23の開始ゲート](architecture/23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)に従う。
- **Git本線と実装凍結（2026-09-19）**: `main`を99.2再移植の本線（`claude/99-2-continuation`のStep 8完了時点）へ整理し、整理前の旧mainはバックアップに保全した（[記録](migration/99-2-git-mainline-cutover.md)）。オーナーが明示的に「実装開始」と指示するまで実装は凍結し、設計検討を継続する。
- **Git現在状態の訂正（2026-09-22）**: 最新モックを履歴ごとmainへ反映後、包含済み7 branchを削除し、GitHub上はmainのみ。旧mainの既存バックアップタグは保持（[記録§8](migration/99-2-git-mainline-cutover.md#8-mainへの集約と現在状態の訂正2026-09-22)）。通常はmainで作業し、Docs同期・必要な検査・commit・push後に停止する恒久ルールは[AGENTS](../AGENTS.md)。
- **BAT管理設計の更新（2026-09-20）**: オーナーの方針に基づき、BAT管理は機体単位の任意、保存は共用機体系ごとの1Spreadsheet・1物理BAT＝1シート・総合台帳なし、現場入力は4項目とした。[32e](architecture/asset-management/32e_battery-management-scope-and-flight-separation.md)・[32f](architecture/asset-management/32f_battery-storage-structure.md)・[32g](architecture/asset-management/32g_battery-field-input.md)へ配置し、判断は[ADR-0028](decisions/ADR-0028-battery-storage-by-shareable-aircraft-family.md)・[ADR-0029](decisions/ADR-0029-battery-management-optional-per-aircraft.md)（Proposed）。シートの中身・命名・状態確認等は未確定（[04](04_open-questions.md#bat管理設計の未確定検証先2026-09-20)）。
- **運用環境・登録機体・BAT共用グループの関係（2026-09-20）**: 機体・BATを現在の運用環境に属するデータとして扱う既存の原則を、02の登録済み実機、実機とBAT共用グループの関係（使用許可）、［各種設定・管理］の機体管理、対象機体の表示責任へ接続した。関係の意味は[32h](architecture/asset-management/32h_registered-aircraft-and-battery-group-relations.md)、画面責任は[34g](architecture/presentation/34g_settings-aircraft-management-and-context-display.md)（現在案）。ホーム4入口は変更しない。ADRは追加していない。未確定は[04](04_open-questions.md#運用環境登録機体bat共用グループの未確定検証先2026-09-20)。
- **利用者向けの表示名と初回導線の訂正（2026-09-21）**: 設計確認用モックの確認で、内部の概念名・技術用語・設計書番号が一般利用者向けの画面へ漏れていることが分かった。内部モデルと責務分離は変えず、利用者へ見せる言葉だけを分ける規約を[30 §4](architecture/presentation/30_screen-specification-standard.md#4-内部設計用語と利用者表示文言の分離)に追加し、対応表と文言の型を[34h](architecture/presentation/34h_user-facing-wording-and-terminology.md)へ置いた。初回導線はアカウントから始める形に訂正した（[34a §7](architecture/presentation/34a_setup-and-environment-entry.md#7-利用者向けの表示名と初回導線の訂正2026-09-21)。個々の表示名は案でPENDING-U-WORDING）。失敗の表示は[19 §1](architecture/19_failure-recovery.md)の表を問題・データ保護状態・次の操作の型に直した。
- **設計確認用モックの左右の役割とDIPSログイン情報（2026-09-22）**: 訂正後のモックでも、左側の利用者画面に、テスト用のアカウントや「確認用」の注記など設計確認の情報が混ざり、AIが未決を完成仕様のように埋めていた。左側は採用候補の画面だけ、右側は設計根拠・状態の切替・サンプル・未決とする規約を[30 §5](architecture/presentation/30_screen-specification-standard.md#5-設計確認用モックの左右の役割と未決事項の扱い)に追加し、置き場所の対応表を[34h §9](architecture/presentation/34h_user-facing-wording-and-terminology.md#9-サンプルと設計確認用の状態の置き場所2026-09-22)に置いた。あわせて、オーナーの指示でDIPSログインID・パスワードをアプリに登録・保存できる方針とし（[34a §8](architecture/presentation/34a_setup-and-environment-entry.md#8-dipsログイン情報の登録と初回設定の候補2026-09-22)・[16 §10](architecture/16_security.md#10-利用者自身のdipsログイン情報2026-09-22方針のみ)。保存先・暗号化などは未決のPENDING-S5-DIPS-LOGIN-STORAGE）、どこから登録するかは、2026-09-23に[34a §9.3](architecture/presentation/34a_setup-and-environment-entry.md#93-初回登録は1画面にまとめる)で「初回の『はじめの登録』で本人情報と同じ1画面（任意項目）」へ確定した（2026-09-22時点の「初回には求めない」案はHISTORICAL）。
- **初回利用フローと、オーナーに判断を求める粒度の整理（2026-09-22）**: 初めて使う人に、アプリの中身を見せる前から多数の初期設定を求めない構成へ変更した。初回の入口は説明専用画面を廃して1画面にまとめ（[34a §7.6](architecture/presentation/34a_setup-and-environment-entry.md#76-初回の入口を1画面にまとめた訂正2026-09-22)）、利用方法の選択では会社・団体の種類を分けて聞かないことを確定し（[§7.7](architecture/presentation/34a_setup-and-environment-entry.md#77-どのように使いますかで種類を分けて聞かないことの確定2026-09-22)）、ホームへ入る前の必須を最小にした（[§7.8](architecture/presentation/34a_setup-and-environment-entry.md#78-ホームへ入る前を最小にした訂正2026-09-22)）。完了通知だけの画面と一括の「はじめの設定」は置かず、事前登録は［各種設定・管理］から、不足は必要になった場面で案内してその場で登録し元の操作へ戻す。アプリ専用のアカウントを発行したように見える表示もやめた（[§7.9](architecture/presentation/34a_setup-and-environment-entry.md#79-利用登録とアカウントの表示の訂正2026-09-22)）。あわせて、設計確認メモでオーナー判断として尋ねる範囲を[30 §5.2](architecture/presentation/30_screen-specification-standard.md#52-オーナーに判断を求める粒度2026-09-22)に定め、一般的なUI・UXはAI側の標準案とした。**このうち、登録／ログインの二択入口（§7.6）、初回の3択（§7.7）と「本人情報・DIPSのログイン情報をホーム前から外す」（§7.8の一部）は、2026-09-23に置換した（下の「初回利用フローの確定」）。機体・許可承認・保険をホーム前に求めないこと、［各種設定・管理］からの事前登録、不足時のその場登録、オーナー判断の粒度は、現在も有効である。** ADRはこの時点では追加していない（2026-09-23にADR-0030を新設）。
- **初回利用フローの確定（2026-09-23）**: 飛行現場での実運用を優先し、初回に一度入力する手間より、毎回の飛行での入力・タップ・画面移動・設定不足による中断を減らすことを基準にした（[34a §9.1](architecture/presentation/34a_setup-and-environment-entry.md#91-発端と判断の基準)）。**初回は全員が自分の個人Googleアカウントで認証して個人環境を1つ作り**（初回の［個人／会社／招待］の3択は廃止）、**必須は氏名とGoogleアカウントの2つだけとし**、フリガナ・住所・電話番号・メールアドレス・DIPSログインID・パスワードは任意のまま同じ1画面（はじめの登録）に置いてホームへ入る（同日中の改訂で必須範囲を確定）。任意項目の上に、DIPS通報の仕様上必要な情報であること・いま入力しなくても進められること・以後の入力が減ることをやさしく説明する。Google公式のアカウント選択・Google Driveの許可・個人環境の作成は、独立した中継画面を置かず、この画面と会社・団体の名前の画面の内部処理へ統合した（「画面追加を最後の手段にする」基準を34a §9.1に明文化）。**会社・団体はホーム到達後に、その会社で使うGoogle／Workspaceアカウントで「新しく使い始める」「すでに使っている会社・団体に参加する」から追加**し、参加では新しいrootを作らない。登録済みの人物情報は飛行計画の連絡先として再利用する。判断は[ADR-0030（Proposed）](decisions/ADR-0030-personal-first-onboarding-and-single-screen-initial-registration.md)、正本は[34a §9](architecture/presentation/34a_setup-and-environment-entry.md#9-初回は個人環境から始め初回登録を1画面にまとめる2026-09-23)、人物・アカウント・環境の分離は[31a](architecture/identity-and-access/31a_person-account-and-environment.md)。会社環境のMy Drive／Shared Drive、所有権継承、DIPS認証情報の保存方式、通報権限モデルは未決のまま（[04](04_open-questions.md)）。
- **個人操縦者の初期値と履歴詳細の出口（2026-09-24）**: 2点限定のオーナー指示により、個人の登録済み本人を新規飛行の初期値にする条件・例外を[31c §6](architecture/identity-and-access/31c_operational-actors.md#6-個人環境の本人操縦者を新規飛行の初期値にする2026-09-24)、詳細最下部の［ホームに戻る］を[34e §5](architecture/presentation/34e_history-and-output.md#5-確認出力作業を終える出口2026-09-24)へ配置した。Responsibility Check・モック回帰の案内は[34f §9](architecture/presentation/34f_screen-map-and-design-coverage.md#9-個人操縦者の初期値と履歴詳細の出口2026-09-24)。新ADRは追加せず、Googleアカウント選択・会社の人物役割分離・C1凍結は維持する。
- **個人本人の人員登録・編集の追補（2026-09-24）**: 既知のGoogleアカウントを本人Personへ自動紐付けし、再入力欄を省略する。概念境界は[31a §6](architecture/identity-and-access/31a_person-account-and-environment.md#6-個人本人の既知googleアカウントを再入力させない2026-09-24)、限定した画面仕様とResponsibility Checkは[presentationの34i](architecture/presentation/34i_person-registration-and-account-linking.md)。他人・会社の任意欄、人物役割分離、既存PENDING、C1凍結を維持し、新ADRは追加しない。
- **Step 6追補（2026-09-19）**: A4の機体個体別保存・日付次空き連番の補正は[35c](architecture/operation-recording/35c_a4-operation-record.md)、重要判断は[ADR-0021（Proposed）](decisions/ADR-0021-a4-record-layout-and-sheet-boundary.md)、確認範囲は[追補監査](migration/99-2-step-6-causal-audit.md#7-step-6追補機体個体別保存と日付連番)。次Stepへの移行ではない。
- 状態は **確定**（承認済み基準）、**検討中**（判断待ち）、**調査**（観測・根拠・未検証）、**将来**（後続Phase）、**履歴**（当時の判断）、**移行案内**（詳細の移転入口）を区別します。文書の確定はアプリ実装・外部仕様の最新性の検証完了を意味しません。

上記は既存文書の案内区分です。99.2再移植の7状態とその意味は[設計証拠規約§3](guidelines/03_design-evidence-and-causality.md#3-状態ラベルと由来)を正本とし、CURRENT-ACCEPTEDをADR Acceptedや変更不可と同一視しません。

## 2. 要件・規約・設計への入口

| 文書 / 入口 | 役割・読む場面 | 状態 / 関連領域 |
|---|---|---|
| [AGENTS](../AGENTS.md) | AI案内・読み順・プロジェクト全体の禁止事項と、規約の所在（規約本文はguidelines／ADRが正本） | 確定 / 全体 |
| [CLAUDE.md](../CLAUDE.md) | AGENTSを取り込むだけの入口。プロジェクトルール本文は持たない | 確定 / 全体 |
| [共通規約・ルーティン](guidelines/README.md) | 全AI共通の規約一覧。[設計Docs更新ルーティン](guidelines/04_design-docs-update-workflow.md)で設計影響判定・Docs同期・Git現在状態の訂正・検査・保存を行う | 確定 / 設計Docs更新 |
| [root README](../README.md) | GitHubでの初期案内と現在の停止位置 | 確定 / 全体 |
| [アプリ概要](../01_アプリ概要.md) | 背景・現場一気通貫フロー・申し送り | 確定 / 全体 |
| [00_goal](00_goal.md) | 最終ゴール・運用思想・機能必要性の判断 | 確定 / 現場フロー・UI |
| [01_current-system-analysis](01_current-system-analysis.md) | 基準アプリの機能・強み・制約・採用理由 | 履歴 / バッテリー・点検・記録 |
| [02_reference-app-requirements](02_reference-app-requirements.md) | 参考アプリ公開情報と運用思想の比較 | 調査・履歴 / DIPS・地図・出力 |
| [03_integrated-requirements](03_integrated-requirements.md) | 統合機能要件・通報支援原則・受入目的 | 確定 / 計画・運航・同期・出力 |
| [04_open-questions](04_open-questions.md) | 未確認事項と過去論点の決定状況・PENDING入口 | 検討中 / C1前確認・後続Phase |
| [構造・分割・保守規約](guidelines/01_structure-and-maintenance-rules.md) | 9原則・Responsibility Check・レビュー手順 | 確定 / docs・source・変更管理 |
| [法令・運用規約](guidelines/02_legal-and-operations-rules.md) | 法令8区分・正式記録全体評価・柔軟運用 | 確定 / 法令・帳票・現場 |
| [設計証拠・因果規約](guidelines/03_design-evidence-and-causality.md) | 因果保持・7状態・実物証拠・質問と技術判断の境界 | CURRENT-ACCEPTED / 設計方法 |
| [移植記録README](migration/README.md) | 99.2再移植の対象・根拠・移管先・検査 | 監査記録 / Step 1〜8 |
| [architecture README](architecture/README.md) | 設計領域・概念正本・比較/監査履歴への入口 | 確定 / 全アーキテクチャ |
| [decisions README](decisions/README.md) | ADR運用・承認状態・部分置換範囲・決定履歴 | 確定 / 重要意思決定 |

## 3. ディレクトリ配置

```text
docs/
├── 00_index.md / 00_goal.md / 01〜04の要件・分析
├── guidelines/                 # 構造・保守、法令・運用、設計証拠・因果、共通更新ルーティン
├── migration/                  # 移管対応・証拠・検査の記録（仕様を複製しない）
├── decisions/
│   ├── README.md               # ADR-0000はこの中の運用決定（独立ファイルなし）
│   └── ADR-0001〜0009 / 0015〜0029 # 既存決定と再移植のProposed記録（0010〜0014はmainに保全）
└── architecture/
    ├── README.md               # 設計領域と概念の正本表
    ├── domain-model/           # C1のEntity / schema参照
    ├── identity-and-access/    # 人物・環境・権限・現場担当・離任（§2）
    ├── asset-management/       # 機材取得・共用・累計・取得確認Actor（§4と§6限定）、BAT管理の適用範囲・保存構造・現場入力（2026-09-20）
    ├── dips-infrastructure/    # 固定IP経路・API基盤・通信安全（§7限定）
    ├── presentation/           # 10項目規約・初回・ホーム・共有リスト・正常受付後・飛行履歴・出力・利用者向け表示名
    ├── operation-recording/    # 柔軟な1飛行・通常操作・A4実物・最終保存
    ├── maintenance-storage/    # 機体別整備媒体と原本コピー
    ├── drive-structure/        # 運用環境01〜07と旧配置からの因果・保存の所有と費用の境界
    ├── sync-and-cache/         # 共有正本と端末cache・正本確認・確定／保存／外部反映の時点分離（§9）
    ├── state-machines/         # 運航・通報・離陸評価
    ├── dips-submission/        # Manual業務 / Sheets Ledger / 06の記録責任・作業台帳
    ├── dips-flight-plan/       # カタログ / Manual UI / API / 入力評価 / 共通の源の因果（§7限定）
    ├── output/                 # 出力境界 / KML / KML生成契機・内容 / 派生PDF / Drive / My Maps / 機体ログ
    └── 単一責務設計・比較履歴・監査記録（architecture READMEから参照）
```

## 4. 外部正本・参照リポジトリ

1. **基準アプリ**: `ikifuse/autel-evo-lite-flight-log`。実装・法令運用判断の参照箇所は `01_ドローン運航記録_設計書/`、`docs/`、`src/`。旧物理構造を新アプリへ無条件にコピーしません。
2. **非公開調査メモ**: `ikifuse/autel-evo-lite-flight-log-private-notes`。DIPS調査・原本アーカイブ（`01_DIPS2.0_API調査.md`〜`10_ワンエビ原本アーカイブ保存状況.md`）。公開docsに私的URL・認証情報・個人情報を転記しません。

2026-09-22: [画面設計の到達範囲](architecture/presentation/34f_screen-map-and-design-coverage.md#6-モックで比較できる範囲の更新2026-09-22)に、DIPS公式順・重複時停止・旧現場UI継承のモック候補を反映。C1は未着手、各PENDINGは維持。

2026-09-23: ローカルの動くモックと正式Docsを同期。直接はじめの登録、単一環境でも押せる環境ボタン、不足登録からの復帰、通報・保存の疑似成功までの接続を[34f §7](architecture/presentation/34f_screen-map-and-design-coverage.md#7-動くモックと正式docsの同期監査2026-09-23)から辿れる。C1は未着手。
