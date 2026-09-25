# 未確認事項と将来の設計判断論点

最終更新: 2026-09-25
プロジェクト: `drone-flight-ops`


**現在の区分**: 以下は未確認事項と当初の選択肢の記録です。Phase Bで既に決定した事項は再び承認待ちに戻しません。

| 当初の論点 | 現在の扱い / 正本 |
|---|---|
| クライアント・バックエンド選定 | ADR-0001のPWAを維持。DIPS用Workers経路からの変更は[33a](architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)／ADR-0018 Proposed。地図はADR-0009のC5留保を維持 |
| データ権威・同期 | ADR-0002 Model D採用済み。詳細は[11](architecture/11_data-authority.md)/[14](architecture/14_offline-and-sync.md) |
| 秘密情報保護 | ADR-0004の秘密隔離を維持。正式認証・credentialはVERIFY、保持方式はPENDING。[16](architecture/16_security.md) |
| API非依存・手動通報 | ADR-0006採用済み。C6 Manual第一級 / C7 Optional |
| 機材・人員・帳票 | ADR-0007正規化採用済み。詳細は[Domain](architecture/domain-model/README.md)/[Reports](architecture/18_reports.md) |
| JSON退避 | ADR-0008で利用者向けJSON廃止、全DB復旧形式はPENDING |

採用決定と限定置換の正確な範囲は [ADR一覧](decisions/README.md) を参照してください。以下§2の候補比較は当初の検討履歴であり、上表の決定と競合する現行案ではありません。

---

## 1. 未確認事項（推測で確定してはならない重要事項）

国土交通省 DIPS 2.0 APIの利用や外部連携について、現時点で公式資料から確定できていない事項です。
これらは推測で進めず、将来の実装検討時に国土交通省や公式ガイドラインで直接確認する必要があります。

### 1.1 DIPS 2.0 APIの利用申請主体と資格要件

**HISTORICAL**: 旧案内の法人・団体向け表記から、個人申請可能か、個人のシステムが対象となるかを未確認としていた。**99.2の確認記録**: 航空局照会で個人申請可能・専有固定IP条件を確認し、最終訂正版を送付済み。詳細因果は[33a](architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)。申請可能と承認済みを同一視せず、審査結果・設定通知・正式接続仕様はVERIFYとして残す。システム構成図、セキュリティ対策、データ保管体制、事故時の連絡体制等の個別審査要件や、個人用スタンドアロン構成の認可を推測で充足扱いにしない。

### 1.2 クライアントID・認証realmの具体的発行単位

旧DRS／FPA／FPRのrealm例は[15](architecture/15_dips-adapter.md)のHISTORICAL / EVIDENCE/EXAMPLE。credential共通／個別、SSO、endpoint、認証フローを現在契約として確定しない。接続システムURL／OIDCリダイレクトURLは原本時点で未確定、Client ID／Secret通知は未受領。確認と保持方式の詳細正本は[16 §9](architecture/16_security.md#9-step-4の認証確認と保持方式の未確定)。

### 1.3 通報API（FPR）の詳細制約とエラー仕様
- **リクエストレート制限（Rate Limit）**:
  - APIの呼び出し頻度制限（例: 1分あたり何回まで、同時接続数制限など）。
- **通報データの最小・最大制限**:
  - ポリゴン飛行範囲の頂点数の上限（例: 最大100頂点まで等）。
  - 飛行予定日時と事前通報タイミングの許容幅（何日前から何分前まで通報可能か）。
- **エラーコードの詳細な仕様書**:
  - 入力不備、空域重複警告、サーバー混雑時等の全レスポンスコード体系。

### 1.4 参考アプリ（ワンエビneo）の内部バックエンド構成
- **credentialの保管手法**:
  - ユーザーごとのトークンやアプリのclient_secretをどのように安全に保持しているか。
- **API通信の中継方式**:
  - クライアント端末から直接DIPSを叩いているのか、自前の中継サーバー（プロキシ）を経由しているのか。
  - ※他者の非公開仕様の推測や不正解析は行わず、自前実装時は公式仕様に基づいて独自設計する。

---

## 2. 将来の設計判断が必要な重要論点

要件定義を終え、将来のアーキテクチャ設計・実装段階に進む際に、オーナーと開発チームが合意・決定しなければならない主要な論点です。
（※本段階では判断を行わず、検討材料として整理します）

### 論点①: クライアント環境とバックエンド構成の選択
- **候補A: Web PWA（Progressive Web App）**
  - メリット: プラットフォームを選ばず（iMac / Pixel / iPhone）、ブラウザから即座に利用可能。インストール不要。
  - 課題: オフライン時のローカルデータ容量制限、バックグラウンド同期の制約（特にiOS Safari）。
- **候補B: ネイティブアプリ（Flutter / React Native等）**
  - メリット: 完全なオフライン動作、端末内データベース（SQLite等）による高速・大容量データ管理、GPSやカメラの完全制御。
  - 課題: iOS（TestFlight/App Store）およびAndroidでのビルド・配布・署名管理の手間。
- **候補C: サーバーレスバックエンド（Firebase / Cloudflare Workers等）＋フロント**
  - メリット: DIPS APIの `client_secret` やトークンを安全なサーバー側で隠蔽可能。マルチデバイス間での同期が容易。
  - 課題: クラウドインフラの運用・コスト・アカウント管理が発生。

### 論点②: 秘密情報（client_secret）の保護と個人運用の両立
- **課題の本質**:
  - DIPS APIの認可コードフローでは `client_secret` を用いてトークンを取得する。
  - これをクライアント端末（ブラウザのJavaScriptやスマホアプリ内部）に埋め込むと、リバースエンジニアリング等で漏洩するリスクがある。
- **検討方針**:
  - 個人専用の小規模バックエンド（またはローカルサーバー）を用意して秘匿するか。
  - または国交省側がPKCE（Proof Key for Code Exchange）等のパブリッククライアント向け認証をサポートしているかを確認するか。

### 論点③: スプレッドシート連携の継続 vs 専用データベース
- **選択肢1: スプレッドシートを正本として維持する**
  - 現行アプリの「人間が直接見て直せる」「印刷・共有が容易」という最大の安心感をそのまま維持。
  - ただし、通信処理のオーバーヘッドや複雑なリレーション検索（地図ポリゴン、バッテリー統計）には不向きな側面もある。
- **選択肢2: ローカル専用DB（SQLite/IndexedDB等）を正本とし、スプレッドシートは「エクスポート先（帳票）」とする**
  - アプリ内部では高速・高機能なデータ構造でオフライン完結運用。
  - 運航完了後、またはボタン1つでGoogleスプレッドシートへ自動反映・同期する。
  - 現行の透明性を保ちつつ、オフラインや高度なデータ処理を両立できる有力候補。

### 論点④: オフライン現場とDIPS事前通報の運用バランス
- **法律上の原則**: 航空法上、特定飛行を行う場合は「飛行前にあらかじめ」飛行計画を通報しなければならない。
- **現場の現実**: 山間部など完全圏外の現場では、現場に到着してからDIPS通報を行うことが物理的に不可能。
- **運用フローの設計**:
  - 「出発前（電波のある場所）に大まかな計画を通報しておく」→「現場で微調整・記録する」フロー。
  - または「通報済みの計画番号を現場で照合して記録する」フロー。
  - システムがどのように現場の実情に寄り添うかの運用ルールの決定が必要。

### 論点⑤: バッテリー個体管理のさらなる拡張可能性
- **スマートバッテリーのデータ連携**:
  - 機体メーカーのログ（Autel Skyの飛行ログ・バッテリー情報）から、サイクル数やセル電圧の生データをインポート・連携できるか。
- **寿命予測と交換アラート**:
  - 蓄積された飛行時間・内部抵抗・所感データから、「そろそろ廃棄・セル点検が必要」と操縦者に推奨するスマート保全機能の要否。


## 3. C1前docs再編で追跡するPENDING

| ID / 項目 | 未決内容 | 対応時点・正本 |
|---|---|---|
| PENDING-C0-ACCEPTANCE | iPhone/AndroidのC0受入確認とC1開始のオーナーGO | C1開始前。[23](architecture/23_implementation-roadmap.md) |
| PENDING-DOMAIN-SEMANTIC-KEYS | API数値に依存しない意味キー辞書の全定義、既存意味との対応確認。推測enumを実装しない | 該当C1型を固定する前。[12d](architecture/domain-model/12d_flight-plan-and-dips.md)/[25c](architecture/dips-flight-plan/25c_api-payload-mapping.md) |
| PENDING-C1-SCHEMA | `geometry` / 旧 `geometry_snapshot` の統合、状態の永続化表記、旧catalog取得元名とEntityの対応。Batteryの保管/点検/劣化/紛失の業務状態との対応、Flightごとの実操縦者、点検のMission参照/実施日時、UserAccount操作主体とPersonnel記録対象の監査接続。別正本・推測属性を増やさない | 該当型・schema固定前。[12b](architecture/domain-model/12b_aircraft-and-battery.md)/[12d](architecture/domain-model/12d_flight-plan-and-dips.md)/[12e](architecture/domain-model/12e_operation-inspection-maintenance.md)/[12f](architecture/domain-model/12f_common-lifecycle-id-and-audit.md)/[25a](architecture/dips-flight-plan/25a_field-catalog.md) |
| PENDING-LEDGER-SNAPSHOT | セル容量を超える全snapshotの格納・再構成・完全性確認、およびSubmissionに関連する複数Missionの物理表現。切捨て不可 | C4開始前。[24a](architecture/dips-submission/24a_submission-and-sheets-ledger.md) |
| PENDING-LOCAL-RESTORE | ローカルDB全量backup/restoreのユーザー向け形式、対象範囲、暗号化・競合・復旧検証 | C1のJSON実装には進まない。C9本番判定前に整理。[ADR-0008](decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) |
| PENDING-MAP-RENDERER | Leaflet / MapLibre GL JS等のiPhone/Android実機比較・決定 | C5開始時。[ADR-0009](decisions/ADR-0009-map-renderer-selection-deferred-to-c5.md) |
| DIPS Web / API | 既存のPENDING-WEB各項目、API申請主体・credential・contractの操作別適用。Web観測をAPI事実に変換しない | [26証拠記録](architecture/26_dips-web-ui-verification.md)、[25a](architecture/dips-flight-plan/25a_field-catalog.md)、C6/C7の該当実装前 |
| My Maps / Drive / 機体ログ | 既存PENDING-MYMAPS各項目、実KML表示・Drive更新方針・機体ログ取得形式 | [Output README](architecture/output/README.md)。C8および将来拡張 |

既知の未決事項を明示することと、今回の文書構造の不整合を放置することは区別します。後続Phaseの未検証事項を解決済みとは報告しません。

## 4. 99.2再移植Step 1の確認境界

§0・§1で到達した設計方法はCURRENT-ACCEPTEDとして保持し、§3の既存PENDING/WARNは解消しない。新たな詳細定義を本書へ複製せず、次の正本へ案内する。

| 識別子・対象 | 詳細正本 |
|---|---|
| 後続の移植・確認範囲（PENDINGへの再分類ではない） | [23の開始ゲート](architecture/23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)。依存する保存・出力・操作・権限の個別内容について、本Stepでは後続章の移植・確認を完了していない |
| VERIFY-S1-EVIDENCE | [設計証拠規約§4](guidelines/03_design-evidence-and-causality.md#4-実物確認と設計への反映)。99.2が参照する実Drive・旧資料を今回の直接検証済みとしない |
| 個別画面の未確定・実機確認 | [画面記録規約§3](architecture/presentation/30_screen-specification-standard.md#3-未確定と証拠の扱い)。10項目規約の成立で画面内容を埋めない |

この一覧は後続章の既決内容をPENDINGへ降格するものではない。状態の意味とADR承認の区別は[設計証拠規約§3](guidelines/03_design-evidence-and-causality.md#3-状態ラベルと由来)を参照する。

## 5. 99.2再移植Step 2の未確定と確認境界

§2の到達済み設計を未決へ戻さず、個別の判断・実物確認を次の正本へ残す。前節はStep 1時点、本節はStep 2時点の確認境界である。現在の移植済み範囲は[総合INDEX](00_index.md)を参照する。既存PENDING / WARNは解消していない。

| 対象 | 詳細正本 |
|---|---|
| PENDING-S2-IDENTITY / PENDING-S2-ENVIRONMENT-UI / VERIFY-S2-IDENTITY-EVIDENCE | [31a](architecture/identity-and-access/31a_person-account-and-environment.md)：組織・環境・ID・資格列・起動／復帰／失効時の切替詳細・試作確認（ホームの環境ボタンとシートは34a §9.6で確定） |
| PENDING-S2-ACCESS-DETAIL / VERIFY-S2-ACCESS-EVIDENCE | [31b](architecture/identity-and-access/31b_roles-and-access-control.md)：未定義の複合役割・機能詳細と実共有確認 |
| PENDING-S2-ACTOR-SCHEMA/UI / VERIFY-S2-ACTOR-EVIDENCE・代理通報範囲 | [31c](architecture/identity-and-access/31c_operational-actors.md)：担当の保持先・別人点検UI・観測証拠。基準C1 schema未確定へ接続。個人の登録済み本人操縦者の初期選択は31c §6でCURRENT-ACCEPTED（2026-09-24） |
| PENDING-S2-MEMBERSHIP | [31d §3](architecture/identity-and-access/31d_membership-lifecycle.md#3-再所属とgoogle共有を別に扱う)：①離任の操作面（離任UI、実行できる役割、offline反映）と、②所属の物理schema（履歴列、再有効化、Person／UserAccount／Environmentとの対応ID・基数）。①は後続の画面・権限の判断、②はC1の該当型固定前の技術設計であり、1つの質問にまとめない。離任＝所属終了・過去記録の保持・同じPersonでの再所属・旧役割を自動復活させないことは到達済み |
| PENDING-S2-OWNERSHIP | [31d §4](architecture/identity-and-access/31d_membership-lifecycle.md#4-組織所有と事業継続の未確定境界)：会社環境のMy Drive／Shared Driveの物理方式と、会社アカウント廃止・Workspace／ドメイン移行・Shared Drive移行・合併・事業譲渡等の事業継続時の承継。会社データを会社で使うアカウント側へ置くこと、一般参加者の離任・アプリ管理者の交代が所有者交代でないことは到達済み |

## 6. 99.2再移植Step 3の未確定と確認境界

§4および取得確認・点検整備Actorに直接必要な§6の到達済み設計を未決へ戻さず、具体化待ちと実物照合を区別する。既存PENDING / WARNは解消していない。

| 対象 | 詳細正本 |
|---|---|
| PENDING-S3-AIRCRAFT-HISTORY / VERIFY-S3-AIRCRAFT-EVIDENCE | [32a](architecture/asset-management/32a_aircraft-acquisition-and-cumulative-time.md)：前歴・管理累計・後日継承の物理保持／表示、旧資料・実物照合 |
| PENDING-S3-BATTERY-HISTORY / VERIFY-S3-BATTERY-EVIDENCE | [32b](architecture/asset-management/32b_battery-sharing-and-acquisition-history.md)：取得時観測・個体履歴の表／行、共用表示と実物対応 |
| PENDING-S3-MAINTENANCE-ACTOR / PENDING-S3-ACQUISITION-RECORD / VERIFY-S3-MAINTENANCE-EVIDENCE | [32c](architecture/asset-management/32c_acquisition-check-and-maintenance-actors.md)：実施者／転記者・取得確認の具体FK／保存／UIと原本照合 |
| 後続の移植範囲（設計状態を降格しない） | [移植記録](migration/README.md)：§3・§5・§6の残り・§7以降。整備全体・保存構造の既存Docsとの相違を本Stepで解消していない |

## 7. 99.2再移植Step 4の未確定と確認境界

| 対象 | 詳細正本 |
|---|---|
| PENDING-C7-INFRA / VERIFY-S4-APPLICATION-EVIDENCE | [33a](architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)：実行基盤・VPC／NAT経路・IP維持／復旧・費用／監視、原回答／申請・実環境照合 |
| VERIFY-S4-API-CONTRACT / PENDING-S4-SESSION | [16 §9](architecture/16_security.md#9-step-4の認証確認と保持方式の未確定)：正式認証・通知・URL、最小一時状態とToken／Session保持 |
| API非依存と結果不明時の安全境界 | [33b](architecture/dips-infrastructure/33b_api-availability-and-retry-boundaries.md)：到達済み境界を維持し、具体照合契約・UIを先取りしない |

§7の固定IP／API基盤／通信境界のみ移管した。既存WARNや他領域のPENDINGは解消していない。対象外の移植待ちと、設計自体の未確定を区別する。

## 8. 99.2再移植Step 5の未確定と確認境界

| 対象 | 詳細正本 |
|---|---|
| PENDING-S5-ROOT-DISCOVERY | [34a §2](architecture/presentation/34a_setup-and-environment-entry.md#2-再起動とroot重複防止)：再ログイン・再インストール・端末変更等で、同じ環境／rootをどう再発見するか。会社の既存環境をどう見つけて参加するか（下記の参加手段）とは別の論点 |
| 会社既存環境の参加手段（ID未付与の既存PENDING） | [34a §7.5・§9.4](architecture/presentation/34a_setup-and-environment-entry.md#75-未確定)：既存の会社・団体環境をどう特定・発見するか（Drive共有からの検出・招待コード・リンク等）。C1開始を止めない後続の未決。初回を個人環境とし、会社・団体をホームから新規作成／既存参加の別処理で追加し、参加では新rootを作らないことはCURRENT-ACCEPTED |
| 認証中断・権限拒否・部分生成・offline・アクセス喪失からの復帰 | [34a §4項目7・9](architecture/presentation/34a_setup-and-environment-entry.md#4-初回セットアップ画面の10項目)（PENDING-S5-ENTRY-SCREENS）、通常起動時・offline・失効時の選択と復帰は[31a §4](architecture/identity-and-access/31a_person-account-and-environment.md#4-会社利用と環境切替へ詰めた内容)（PENDING-S2-ENVIRONMENT-UI）。後続の接続・復帰処理の未決 |
| PENDING-S5-INITIAL-REQUIRED | [34a §3](architecture/presentation/34a_setup-and-environment-entry.md#3-初回必須登録を見直した経緯)：**飛行を始める時点で**機体・BAT等をどこまで必須にするか（最低1機案を含む）だけ。2026-09-23に、**初回は全員が個人環境から始め、氏名とGoogleアカウントの2つだけを必須として1画面（はじめの登録）で登録し、フリガナ・住所・電話番号・メールアドレス・DIPSログインID・パスワードは任意のまま同じ画面に置いてホームへ入る**ことを、同日中の改訂を経て確定した（[§9](architecture/presentation/34a_setup-and-environment-entry.md#9-初回は個人環境から始め初回登録を1画面にまとめる2026-09-23)・[ADR-0030](decisions/ADR-0030-personal-first-onboarding-and-single-screen-initial-registration.md)）。**はじめの登録の必須項目はこれで確定し、PENDINGから外れた。** INITIAL-REQUIREDの残りは、**飛行を始めるときに何を必須にするか**（最低1機案を含む）だけである。機体・許可承認・保険の事前登録は［各種設定・管理］から。任意にした項目が通報時に不足していたら、不足分だけ補い、人物の連絡先は対象Personの人物情報へ、DIPSの認証情報はDIPSのログイン情報へ保存して元の飛行計画へ戻す（[25b §1.1](architecture/dips-flight-plan/25b_manual-web-mapping.md#11-通報時に不足している登録情報を補う受け皿2026-09-23)・[34a §8.3](architecture/presentation/34a_setup-and-environment-entry.md#83-未登録のまま通報が必要になったとき通常の経路ではなく受け皿)） |
| PENDING-S5-DIPS-LOGIN-STORAGE | [34a §8](architecture/presentation/34a_setup-and-environment-entry.md#8-dipsログイン情報の登録と初回設定の候補2026-09-22)・[§9.3](architecture/presentation/34a_setup-and-environment-entry.md#93-初回登録は1画面にまとめる)・[16 §10](architecture/16_security.md#10-利用者自身のdipsログイン情報2026-09-22方針のみ)：DIPSログインID・パスワードの保存先・暗号化方式・端末ごと／共有・Google Drive／Sheetsでの持ち方・複数人利用時の閲覧・自動ログインに使うか・API認証との関係・DIPS公式ログイン画面への自動入力の可否。**方針は「アプリに登録・保存できる」「初回のはじめの登録でも任意で登録できる」（オーナーの指示。CURRENT-ACCEPTED）で、AIの判断で変えない**。保存方式の詳細は未決。DIPS APIの正式認証仕様はVERIFY-S4-API-CONTRACT、Token／Session保持はPENDING-S4-SESSION（いずれも[16 §9](architecture/16_security.md#9-step-4の認証確認と保持方式の未確定)）で、本IDへ混ぜない |
| PENDING-S2-OWNERSHIP（会社・団体環境の所有） | [31d §4](architecture/identity-and-access/31d_membership-lifecycle.md#4-組織所有と事業継続の未確定境界)・[34a §9.4](architecture/presentation/34a_setup-and-environment-entry.md#94-会社団体はホームからその会社で使うgoogleアカウントで追加する)：2026-09-23に、会社・団体環境は**その会社で使うGoogle／Workspaceアカウント側の保存領域へ作る**ことを確定した（参加者個人の私用Driveを会社データの正本にしない）。**未決はMy DriveかShared Driveかという物理方式と、会社アカウント廃止・Workspace／ドメイン移行・Shared Drive移行・合併・事業譲渡等の事業継続時の承継**。一般参加者の離任（31d §1）・アプリ管理者の交代（31b §3）はこの所有者交代に含めない |
| PENDING-WEB-CONTACT-SOURCE / VERIFY-WEB-CONTACT-KANA | [25b §1.1](architecture/dips-flight-plan/25b_manual-web-mapping.md#11-通報時に不足している登録情報を補う受け皿2026-09-23)：環境に登録された連絡先と人物情報の重複・優先関係（どちらを正とするか）は未決。フリガナがDIPS側で必要かは未確認のため、DIPSの必須としては扱わず、人物基本情報として同じ受け皿で補う。Manual経路（DIPS Webで通報する）側で不足をどう扱うかも未決 |
| PENDING-S5-ENTRY-SCREENS | [34a §7.5・§9](architecture/presentation/34a_setup-and-environment-entry.md#75-未確定)：現行のはじめの登録・会社追加／参加・通常起動の選択の未記載10項目詳細。二択入口・独立したGoogle選択／Drive許可画面はHISTORICALで、復活させる意味ではない。初回順・必須2項目・ホームの環境シートは確定済み。root再発見・再認証の詳細はPENDING-S5-ROOT-DISCOVERYに残す |
| PENDING-U-WORDING | [34h §8](architecture/presentation/34h_user-facing-wording-and-terminology.md#8-未確定と確定してはならないこと)：利用者向けの表示名・文言の最終形（オーナー指示の例と、[§10](architecture/presentation/34h_user-facing-wording-and-terminology.md#10-dipsログイン情報の表示案2026-09-22)のDIPSログイン情報の表示を含め案）。「保存・同期」の言い換え、「離任」の表記、BATを共用する機体のグループの名称など |
| VERIFY-S5-SETUP-EVIDENCE / GOOGLE-CONTRACT | 34a：旧資料・実Driveとの対応、Google認証・認可・scopeの実装時確認 |
| PENDING-S5-HOME-DETAIL | [34b](architecture/presentation/34b_home-and-navigation.md)：設定管理分類、配置・権限／offline表現 |
| PENDING-S5-LIST-DETAIL / MANUAL-LIST、VERIFY-S5-LIST-EVIDENCE | [34c](architecture/presentation/34c_shared-flight-worklist.md)：絞り込み方向・共有反映・cache・Manual接続、1枚作業台帳の確認 |
| PENDING-S5-LIST-EXTERNAL-DIPS / LIST-CONCURRENT-START | 34c §5：旧mainが起案した論点（99.2に記述なし）。アプリ外で作られたDIPS計画の扱い、同一計画への現場の二重着手。2026-09-19のGit本線の整理で引き継いだ（[記録](migration/99-2-git-mainline-cutover.md)） |
| PENDING-S5-ACCEPTED-UI / VERIFY-S5-RESPONSE-EVIDENCE | [34d](architecture/presentation/34d_dips-accepted-and-plan-content.md)：通常画面の残る詳細、原本が参照した正常応答資料の照合 |

前回環境の初期選択、drive.file、場所／機体／BATの選択時登録、リスト絞り込みは各正本のCURRENT-PROPOSAL。4入口やAPI正常受付時の掲載はCURRENT-ACCEPTEDであり、上記の未確定と混同しない。Step 1〜4のPENDING／WARN、DIPS認証VERIFYを解消したとは扱わない。

## Step 6の未確定・検証先

詳細理由を本書へ複製せず、各正本へ進む。到達済みの意味と未検証を混同しない。

| ID | 詳細正本 |
|---|---|
| PENDING-S6-OPERATION-SCHEMA / VERIFY-S6-OPERATION-EVIDENCE | [35a](architecture/operation-recording/35a_flexible-flight-and-details.md) |
| PENDING-S6-OPERATION-UI | [35b](architecture/operation-recording/35b_normal-operation-and-final-save.md) |
| PENDING-S6-A4-DETAIL / VERIFY-S6-A4-PRINT | [35c](architecture/operation-recording/35c_a4-operation-record.md) |
| PENDING-S6-FINAL-SAVE-CONTRACT / VERIFY-S6-FINAL-SAVE-EVIDENCE | [35d](architecture/operation-recording/35d_operation-finalization-and-write-boundary.md) |
| PENDING-S6-MAINTENANCE-PHYSICAL / VERIFY-S6-MAINTENANCE-EVIDENCE | [36](architecture/maintenance-storage/36_aircraft-maintenance-records.md) |
| PENDING-S6-DRIVE-PLACEMENT / VERIFY-S6-DRIVE-EVIDENCE | [37](architecture/drive-structure/37_environment-storage-responsibilities.md) |

CURRENT-PROPOSALの機体交代時の新Flight接続を最終schemaとしない。固定7枠は現在99.2と最新実物に基づく到達点。2026-09-19のオーナー追補による機体個体別Spreadsheet、`YY.M.D`と同日次空き連番、交代時の保存先切替はCURRENT-ACCEPTEDとして[35c §3](architecture/operation-recording/35c_a4-operation-record.md#3-その後の運用判断による現在ベースライン)へ記録した。高度な同時競合対策の意図的非採用を未解決の必須対策としない。場所変更の厳密条件・柔軟な1飛行との境界・最終schema、年度／長期分割、複製・通常再送の詳細は各正本のPENDINGを維持する。前回のA4印刷VERIFYは変更しない。

## Step 7aの未確定・検証先

詳細理由を本書へ複製せず、各正本へ進む。到達済みの意味と未検証を混同しない。

| ID | 詳細正本 |
|---|---|
| PENDING-S7A-DRAW-OPERATION / VERIFY-S7A-EVIDENCE | [26 §1.3](architecture/26_dips-web-ui-verification.md#13-証拠系列と回収範囲)：作図操作の未回収、PC版・スマホ版の証拠系列の再確認と相違比較 |
| VERIFY-S7A-FLYROUTE-CONTRACT | [25c §6](architecture/dips-flight-plan/25c_api-payload-mapping.md#6-c7契約再確認と検証)：`flyRoute`の表現の相違と公式原文との突合 |
| PENDING-S7A-NON-DIPS-SCOPE | [25e §6](architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md#6-未確定確認待ちと再検討条件)：「DIPS対象外／対象」の定義と、任意に通報した場合の扱い |

共通の源、不変`submission_snapshot`、Manual／API経路の責任境界、DIPS対象外との境界の意味はCURRENT-ACCEPTED（詳細は[25e](architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md)、判断の要約は[ADR-0023](decisions/ADR-0023-common-source-and-derived-submission-paths.md) Proposed）。既存のPENDING-WEB-05〜07、PENDING-C1-SCHEMA（`geometry`と旧`geometry_snapshot`の統合）、PENDING-LEDGER-SNAPSHOT、API契約のVERIFYは解消していない。§7の残り（KMLの生成・保存・再送、06の保存構造、取消・重複あり調整・リスト自動整理）、§8、§9全体、§11は未移植であり、その既存詳細を99.2全体との監査済み仕様と扱わない。

## Step 7bの未確定・検証先

Step 7a節が挙げる未移植のうち、06の保存構造と、取消・重複あり調整・リスト整理は本節で扱った。詳細理由を本書へ複製せず、各正本へ進む。

| ID | 詳細正本 |
|---|---|
| PENDING-S7B-FLIGHT-KEY / PENDING-S7B-CLEANUP-CONDITION / PENDING-S7B-DUPLICATE-ADJUST | [24b §5](architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md#5-未確定確認待ちと再検討条件)：06の結合キー、作業対象でなくなる正確な時点・条件、重複あり調整 |

06の記録責任、人が見る作業台帳と内部の履歴・証跡の分離、取消・整理の意味はCURRENT-ACCEPTED（[24b](architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)、追補は[ADR-0022](decisions/ADR-0022-drive-responsibilities-and-human-records.md) Proposed）。既存のPENDING-S5-LIST-DETAIL、VERIFY-S5-LIST-EVIDENCE、PENDING-LEDGER-SNAPSHOT、PENDING-S6-DRIVE-PLACEMENTは解消していない。

## Step 7cの未確定・検証先

Step 7a節が挙げる未移植のうち、KMLの位置づけ・単位・生成契機・内容・再送は本節で扱った。詳細理由を本書へ複製せず、各正本へ進む。

| ID | 詳細正本 |
|---|---|
| PENDING-S7C-KML-UNIT-MAPPING / PENDING-S7C-KML-SHARE-PROJECTION | [27e §6](architecture/output/27e_kml-generation-timing-and-content.md#6-未確定確認待ちと再検討条件)：意味上の1飛行と計画・改訂・複数日・複数機体・DIPS対象外の対応、共有時の秘匿投影との合成 |
| PENDING-S7C-KML-DESTINATION | [27b §1.1](architecture/output/27b_google-drive-storage.md#11-保存先設定exportdestination)：利用者指定フォルダーの旧設定と、環境root下の07配置 |
| PENDING-S7C-KML-FINAL-SEND | [35d §4](architecture/operation-recording/35d_operation-finalization-and-write-boundary.md#4-検証と残る範囲)：最後の送信での再送を最終保存契約の一部とするか、独立した再送とするか |

KMLの生成契機（飛行計画の通報時）・内容（通報内容と共通Geometry、運航後情報を含めない）・単位（意味上の1飛行）・未同期の保持と最後の送信時の再送はCURRENT-ACCEPTED（[27e](architecture/output/27e_kml-generation-timing-and-content.md)、判断の要約は[ADR-0024](decisions/ADR-0024-kml-generated-at-plan-submission-from-report-content.md) Proposed）。旧「運航完了時に実績を追記して更新」「1 FlightPlan = 1 KML」はHISTORICAL。99.2が具体表現を未確定とするファイル名・XML構造・Geometry変換（27a）はCURRENT-PROPOSAL、既存のPENDING-MYMAPS-01〜06（27c）は解消していない。

## Step 7dの未確定・検証先

Step 7a・7c節が挙げる未移植のうち、PDFの役割分離・生成方針と、飛行履歴・出力の画面は本節で扱った。詳細理由を本書へ複製せず、各正本へ進む。

| ID | 詳細正本 |
|---|---|
| PENDING-S7D-MAPPDF-DETAIL / VERIFY-S7D-MAPPDF-REGEN / PENDING-S7D-MAPPDF-SCOPE | [27f §4](architecture/output/27f_derived-pdf-roles-and-map-pdf.md#4-地図付きpdfの配置の方向と未確定)：詳細レイアウト・命名・生成画面、同じ正本・Geometryから再生成できる範囲の実物確認、旧「地図付き飛行計画書」との関係 |
| PENDING-S7D-HISTORY-DETAIL / PENDING-S7D-HISTORY-OUTPUT-UNIT / PENDING-S7D-HISTORY-KML | [34e §3](architecture/presentation/34e_history-and-output.md#3-未確定確認待ちと適用限界)：履歴画面の詳細と出力選択方式（詳細最下部のホーム出口は34e §5で2026-09-24に確定）、複数シートにまたがる飛行の出力単位、履歴からのKML取得 |

A4運航記録PDFと地図付きPDFの役割分離、PDFを必要な時だけ生成する方針、［飛行履歴・出力］から対象の飛行を選んで出力へ進む導線はCURRENT-ACCEPTED（[27f](architecture/output/27f_derived-pdf-roles-and-map-pdf.md)・[34e](architecture/presentation/34e_history-and-output.md)、判断の要約は[ADR-0025](decisions/ADR-0025-derived-pdf-roles-and-on-demand-generation.md) Proposed）。出力選択の方式（［A4運航記録PDF］［地図付きPDF］［両方作成］）は99.2が第一候補とするCURRENT-PROPOSAL。既存のPENDING-S5-HOME-DETAIL（各種設定・管理の分類等）、PENDING-S6-A4-DETAIL、VERIFY-S6-A4-PRINTは解消していない。

## Step 7eの未確定・検証先

Step 7a節が挙げる未移植のうち、§9の正本・端末cache・正本確認、確定・保存・外部反映の時点分離、費用の境界は本節で扱った。詳細理由を本書へ複製せず、各正本へ進む。

| ID | 詳細正本 |
|---|---|
| PENDING-S7E-CACHE-DETAIL / VERIFY-S7E-DEVICE-DIFF | [38a §5](architecture/sync-and-cache/38a_shared-source-and-device-cache.md#5-未確定確認待ちと再検討条件)：cacheの具体実装・retryの回数と間隔・競合の解決方針・backgroundの挙動・UI、iPhone／Androidの実機差 |
| PENDING-S7E-SYNCQUEUE-AUDIT | [38b §3](architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md#3-中央のsyncqueue監査の未確定)：06または別の領域にSyncQueue・監査・エラーの記録を残すか |

共有データの正本とcache、cacheの捨て方、正本確認の時点、三つの時点への分離、保存の所有と費用の境界はCURRENT-ACCEPTED（[38a](architecture/sync-and-cache/38a_shared-source-and-device-cache.md)・[38b](architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md)・[37 §6](architecture/drive-structure/37_environment-storage-responsibilities.md#6-保存の所有と費用の境界)、判断の要約は[ADR-0026](decisions/ADR-0026-shared-source-confirmation-and-timing-separation.md)・[ADR-0027](decisions/ADR-0027-storage-ownership-and-cost-boundary.md) Proposed）。同期状態の判断の方向と従量APIの限定はCURRENT-PROPOSAL。既存のPENDING-S5-LIST-DETAIL、PENDING-S6-FINAL-SAVE-CONTRACT、PENDING-S7C-KML-FINAL-SEND、PENDING-LOCAL-RESTORE、PENDING-S6-DRIVE-PLACEMENTは解消していない。

## Step 8の差分監査と残る未確定

§11の差分監査を[Step 8監査](migration/99-2-step-8-diff-audit.md)で行った。原本の現状差分8項目の対照、旧案（Workers前提・KML運航実績追記・KML属性未確定・自動ページネーション・「設計確定」表記）の残存、回収した12項目の所在、原本の全行の使用状況を確かめ、00_goalの旧記述を訂正した。新しい未確定は追加せず、既存のPENDING／VERIFYを解決していない。

残る未確定の定義は各正本にあり、所在の索引は[Step 8監査 §9](migration/99-2-step-8-diff-audit.md#9-残る未確定と着手前の照合の索引)。C1の開始は、本書 §3のPENDING-C0-ACCEPTANCE（C0受入確認とオーナーGO）を待つ。該当のC1型・schemaを固定する前に、PENDING-DOMAIN-SEMANTIC-KEYS・PENDING-C1-SCHEMAと、対象領域のPENDINGを照合する（[23 §1.2](architecture/23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)）。

## 設計検討フェーズの未設計領域

実装凍結中の設計検討で、コードを書かなくても決められる領域を[34f](architecture/presentation/34f_screen-map-and-design-coverage.md)で棚卸しした。ここでは所在だけを示し、定義は34f §4に置く。

| ID | 領域 |
|---|---|
| PENDING-D-SETTINGS-SCREENS | 各種設定・管理の画面体系（人員・機体・BAT・場所・プリセット・環境）。機体管理の入口の流れは[34g](architecture/presentation/34g_settings-aircraft-management-and-context-display.md)（案）、他の分類は未設計 |
| PENDING-D-BAT-LEDGER | 多数の機体・BATの共有運用、BATの表示と状態、履歴。方針は[32e](architecture/asset-management/32e_battery-management-scope-and-flight-separation.md)〜[32g](architecture/asset-management/32g_battery-field-input.md)（オーナー方針）、表示の案は[32d](architecture/asset-management/32d_battery-ledger-and-status-design.md)。未確定は下記「BAT管理設計の未確定・検証先」 |
| PENDING-D-HUMAN-OUTPUT | KMLの内容を人が閲覧・印刷するための復元と構成（地図付きPDF・印刷物） |
| PENDING-D-NEW-FLIGHT-SCREENS | 新規飛行の入力から通報内容の確認までの共通の画面の流れ、飛行範囲の作成画面 |
| PENDING-D-STATUS-DISPLAY | オフライン・未同期・エラー・保存・確定・取消・戻るの共通の見せ方と操作 |

進める順序の案は34f §5（NEW-PROPOSAL）。既存のPENDINGを解決したものではない。

## BAT管理設計の未確定・検証先（2026-09-20）

オーナーの2026-09-20の指示に基づくBAT管理設計（[32e](architecture/asset-management/32e_battery-management-scope-and-flight-separation.md)・[32f](architecture/asset-management/32f_battery-storage-structure.md)・[32g](architecture/asset-management/32g_battery-field-input.md)、[ADR-0028](decisions/ADR-0028-battery-storage-by-shareable-aircraft-family.md)・[ADR-0029](decisions/ADR-0029-battery-management-optional-per-aircraft.md)）の未確定を、所在だけ示す。定義は各正本に置き、本書では複製しない。既存のPENDING-S3-BATTERY-HISTORY・PENDING-C1-SCHEMAは解消していない。

| ID | 詳細正本 |
|---|---|
| PENDING-D-BAT-SWITCH / -A4-COLUMN / -INTRO-INSPECTION | [32e §6](architecture/asset-management/32e_battery-management-scope-and-flight-separation.md#6-未確定と再検討条件)：ON／OFFの設定と切替、A4のBAT欄の表記、中古機導入時の点検 |
| PENDING-D-BAT-FILE-NAMING / -SHEET-TOP / -HISTORY-COLUMNS / -FAMILY-BOUNDARY / -AUTHORITY-MAP / -CONCURRENT-WRITE / -OUTPUT、VERIFY-D-BAT-SCALE / -DRIVE-STATE | [32f §4・§7](architecture/asset-management/32f_battery-storage-structure.md#7-未確定確認待ちと十観点の確認)：ファイル名・シート名、シートの上部・履歴の列、機体系の境界、正本の関係、同時書き込み、出力単位、規模、Driveの現在状態（オーナー報告のみ） |
| PENDING-D-BAT-CHECK-UI / -LABEL-RULE / -CYCLE-DISPLAY / -LEGACY-CHECKS | [32g §4・§6](architecture/asset-management/32g_battery-field-input.md#6-未確定と再検討条件)：状態確認の選択肢とUI、管理ラベルの規則、サイクル数の見せ方、旧要件の残量・最小確認の扱い |
| PENDING-D-BAT-STATES / -SET-VIEW / -CROSS-ENV | [32d §4・§9](architecture/asset-management/32d_battery-ledger-and-status-design.md#9-未確定オーナー確認事項)：現在状態の値と導き方、機体セット表示の要否、環境をまたぐBAT |

BAT管理を機体単位の任意にすること、保存を共用機体系ごとの1Spreadsheet・1物理BAT＝1シート・総合台帳なしとすること、現場入力を4項目に絞ることは、現在の設計ベースライン（CURRENT-ACCEPTED。最終確定ではなく変更可能）。シートの上部・履歴の列・状態確認の選択肢・ファイル名は`CURRENT-PROPOSAL`／`PENDING`。

## 運用環境・登録機体・BAT共用グループの未確定・検証先（2026-09-20）

オーナーの2026-09-20の検討内容（[32h](architecture/asset-management/32h_registered-aircraft-and-battery-group-relations.md)・[34g](architecture/presentation/34g_settings-aircraft-management-and-context-display.md)）の未確定を、所在だけ示す。定義は各正本に置き、本書では複製しない。既存のPENDING-S2-ENVIRONMENT-UI・PENDING-D-BAT-SWITCH・PENDING-S2-ACCESS-DETAIL・PENDING-S6-DRIVE-PLACEMENT・PENDING-C1-SCHEMAは解消していない。

| ID | 詳細正本 |
|---|---|
| PENDING-D-AC-REGISTRY-STORAGE / -GROUP-NAMING / -PERMITTED-DISPLAY / -UNLINKED-EXCEPTION / -PERMISSION | [32h](architecture/asset-management/32h_registered-aircraft-and-battery-group-relations.md)：02機体管理の物理構成と全項目、BAT共用グループの名称・schema名とSpreadsheetの対応、互換機種と使用許可機体の表示、未紐付けでBATを使えない場合の例外（誤登録・解除・緊急時）、機体管理の権限 |
| PENDING-D-AC-CONTEXT-DISPLAY / -SCREENS | [34g](architecture/presentation/34g_settings-aircraft-management-and-context-display.md)：対象機体の表示位置・固定表示（ホームの現在機体の常時表示を含む）、機体追加・変更・BAT共用グループ設定の画面レイアウト |

現在の運用環境に機体・BATが属すること、環境の表示・切替、ホーム4入口、現在の環境と対象機体が別の情報であること、BAT管理が機体単位の任意であることは、既存の設計ベースラインへの接続（CURRENT-ACCEPTED）。02での登録機体の管理、実機とBAT共用グループの関係、使用許可機体の表示、機体を追加する流れ、紐付けのない機体でのBAT選択制限、各種設定・管理を機体管理の入口とする流れ、対象機体の表示は`CURRENT-PROPOSAL`。

## 2026-09-22 設計モック修正後も維持する未決

- **PENDING-D-NEW-FLIGHT-SCREENS**: [25b §7](architecture/dips-flight-plan/25b_manual-web-mapping.md#7-スマートフォンの標準候補と比較案2026-09-22)のDIPS公式22項目順を標準候補にした。独自まとめ案・selectorの形・地図の入口と詳細操作は比較中。新規のDIPS実画面調査ではない。
- **PENDING-S7B-DUPLICATE-ADJUST**: 結果画面とリストで通常運航への接続を止めたが、調整後の再開条件・解除方法・状態名は未決（34d §7）。
- **PENDING-S6-OPERATION-UI**: [35b §12](architecture/operation-recording/35b_normal-operation-and-final-save.md#12-旧現場uiを継承した設計候補2026-09-22)の旧UI継承、操作ゼロ、BAT交換2項目、保存失敗再試行、実機確認を申告した後だけ［全て正常］を使える点検候補（未確認を一括で正常にする仕様ではない）はモックの候補。製品の詳細UI・永続復旧・実通信の保証を確定していない。
- **PENDING-S5-DIPS-LOGIN-STORAGE**: 保存できる方針は維持。保存先・暗号化・端末／共有・Drive／Sheets・閲覧者・自動ログイン・API認証・削除無効化は未決（34a §8）。
- **PENDING-U-WORDING**: 空欄表示とサンプル漏れを訂正したが、個々の製品用語を確定しない（34h §10）。

今回のモック・自動テスト・3幅画像の検証はEVIDENCE/EXAMPLEであり、上記をCURRENT-ACCEPTEDへ昇格させない。新規ADRなし、C1開始の許可なし。

## 2026-09-23 動くモック同期後の未決境界

初回二択入口はHISTORICAL。ホームの［〜で使用中］ボタンと環境シートは単一環境でも有効と確定した（[34a §9.6](architecture/presentation/34a_setup-and-environment-entry.md#96-複数環境と切替)）。PENDING-S2-ENVIRONMENT-UIは削除せず、通常起動時の選択・復帰、未保存作業、offline・権限失効時の詳細へ限定する。

機体・操縦者の不足登録から同じ作業へ戻れることは、飛行開始時の全必須条件を確定しない（PENDING-S5-INITIAL-REQUIRED）。運航完了と保存済み表示まで接続しても、PENDING-S6-OPERATION-UIの詳細復旧・部分成功UI、本番schema・保存列・KML配置／命名・PDF詳細は維持する。DIPS／Driveの実API、credential暗号化・token、PENDING-S2-OWNERSHIP、PENDING-S5-ROOT-DISCOVERY、会社参加方式、VERIFY-WEB-CONTACT-KANA、VERIFY-S4-API-CONTRACT、VERIFY-S5-GOOGLE-CONTRACTを解消しない。主フローの実物証拠と採用範囲は[34f §7](architecture/presentation/34f_screen-map-and-design-coverage.md#7-動くモックと正式docsの同期監査2026-09-23)。


**2026-09-24の人員画面追補**: 個人本人のGoogleアカウント再入力の省略・既知アカウントの自動紐付けのみを[31a §6](architecture/identity-and-access/31a_person-account-and-environment.md#6-個人本人の既知googleアカウントを再入力させない2026-09-24)・[34i](architecture/presentation/34i_person-registration-and-account-linking.md)でCURRENT-ACCEPTEDとして記録した。PENDING-S2-IDENTITY／MEMBERSHIP／ACCESS-DETAIL、PENDING-D-SETTINGS-SCREENSの物理schema・権限・人員管理画面の残りは維持する。初回Googleアカウント選択は変更しない。初回の人物登録だけで操縦者役割も付与するかという既存の未決は今回解消せず、Google認証だけで役割を付与しない境界を維持する。

## C1開始条件・該当型固定前のschema課題・後続PENDINGの区別（2026-09-25）

2026-09-25の監査で、会社参加・会社データ所有・権限と離任・DIPS認証情報・Manual確認と再開・飛行開始時の必須と点検・連絡先と保険・帳票PDFの各論点を正式Docsと照合した。粗い見出しを新しいPENDINGとして追加せず、既存の正式ID（ID未付与の既存PENDINGを含む）を以下の区分で案内する。定義・因果は各正本に置き、本表は複製しない。

| 区分 | 該当 | 意味 |
|---|---|---|
| C1全体の開始条件 | PENDING-C0-ACCEPTANCE（§3）と、オーナーの明示的な「実装開始」 | これ以外の後続PENDINGが残っていることを理由に、C1全体の開始を止めない。今回の照合範囲で、C1全体の開始前に回答が必要なオーナー質問は0件 |
| C1の該当型を固定する前の技術設計（schema整合） | PENDING-C1-SCHEMA、PENDING-DOMAIN-SEMANTIC-KEYS（§3）、PENDING-S2-IDENTITY（Person／UserAccount／Environmentの対応ID）、PENDING-S2-MEMBERSHIPの物理schema部分（所属履歴・再有効化・基数。[31d §3](architecture/identity-and-access/31d_membership-lifecycle.md#3-再所属とgoogle共有を別に扱う)）、PENDING-S2-ACTOR-SCHEMA/UIの保持先部分（Flight単位の実操縦者、Recorder・点検実施者の参照。[31c §2](architecture/identity-and-access/31c_operational-actors.md#2-現場役割の現在到達点)・[12e §8](architecture/domain-model/12e_operation-inspection-maintenance.md#8-実績と点検の未定義参照pending-c1-schema)）、PENDING-S6-OPERATION-SCHEMA（[35a §5](architecture/operation-recording/35a_flexible-flight-and-details.md#5-未確定と検証境界)）、PENDING-S7B-FLIGHT-KEY（[24b §5](architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md#5-未確定確認待ちと再検討条件)） | 対象のDomain型・DB schemaを固定する前にAI側が技術設計として照合する。オーナーの業務判断と混同しない。C1の他の型の着手を一律に止める意味ではない |
| 後続Phaseの判断・詳細（C1を止めない） | 会社既存環境の参加手段、PENDING-S5-ROOT-DISCOVERY、PENDING-S5-ENTRY-SCREENS／PENDING-S2-ENVIRONMENT-UIの復帰詳細、PENDING-S2-OWNERSHIP、PENDING-S2-ACCESS-DETAIL、PENDING-D-AC-PERMISSION、PENDING-S2-MEMBERSHIPの操作面（離任UI・実行できる役割・offline）、PENDING-S5-DIPS-LOGIN-STORAGE、PENDING-S4-SESSION、PENDING-S7B-DUPLICATE-ADJUST、PENDING-S7B-CLEANUP-CONDITION、PENDING-S5-MANUAL-LIST、PENDING-S5-INITIAL-REQUIRED（飛行開始時の必須範囲のみ）、PENDING-S6-OPERATION-UI、PENDING-WEB-CONTACT-SOURCE、25b §1.1のManual経路の不足処理、PENDING-S7D-HISTORY-OUTPUT-UNIT、PENDING-S7D-MAPPDF-SCOPE、PENDING-S7D-MAPPDF-DETAIL、PENDING-S7D-HISTORY-DETAIL | 画面・権限・認証・外部通信・帳票詳細の未決。該当Phaseの実装前に各正本で決める。C1開始条件へ昇格させない |
| 外部・実物の確認待ち | VERIFY-S5-GOOGLE-CONTRACT、VERIFY-S4-API-CONTRACT（照合APIの利用条件を含む）、VERIFY-WEB-CONTACT-KANA、VERIFY-S7D-MAPPDF-REGEN | 設計判断ではなく、公式仕様・実環境・実物で確認する |

**保険**: [12d §2](architecture/domain-model/12d_flight-plan-and-dips.md#2-insurancepolicy保険台帳マスター)の`InsurancePolicy`は組織・複数機材で再利用する独立マスターで、複数の契約を保持できる。FlightPlanは`insurance_policy_id`で適用保険を参照し、今回値をoverrideできる。「1計画へ複数の保険契約を同時に適用する」必要を扱う既存PENDINGは正式Docsに存在しないため、新しいPENDINGを作らない。

到達済みの内容（初回は個人環境、会社・団体の新規作成と既存参加の分離、三層権限、離任＝所属終了、DIPSログイン情報を保存できる方針、Manual確認2方式と結果不明時の自動再POST禁止、初回登録の必須2項目、A4の機体別保存・固定7明細・次空き連番等）は各正本のCURRENT-ACCEPTEDのままで、本表によってPENDINGへ戻さない。
