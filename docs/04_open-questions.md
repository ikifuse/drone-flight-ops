# 未確認事項と将来の設計判断論点

最終更新: 2026-09-19
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
| PENDING-S2-IDENTITY / PENDING-S2-ENVIRONMENT-UI / VERIFY-S2-IDENTITY-EVIDENCE | [31a](architecture/identity-and-access/31a_person-account-and-environment.md)：組織・環境・ID・資格列・切替UI・試作確認 |
| PENDING-S2-ACCESS-DETAIL / VERIFY-S2-ACCESS-EVIDENCE | [31b](architecture/identity-and-access/31b_roles-and-access-control.md)：未定義の複合役割・機能詳細と実共有確認 |
| PENDING-S2-ACTOR-SCHEMA/UI / VERIFY-S2-ACTOR-EVIDENCE・代理通報範囲 | [31c](architecture/identity-and-access/31c_operational-actors.md)：担当の保持先・別人点検UI・観測証拠。基準C1 schema未確定へ接続 |
| PENDING-S2-MEMBERSHIP / PENDING-S2-OWNERSHIP | [31d](architecture/identity-and-access/31d_membership-lifecycle.md)：離任実行権限・UI・offline・履歴列・再所属形式・会社所有 |

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
| PENDING-S5-ROOT-DISCOVERY / INITIAL-REQUIRED | [34a](architecture/presentation/34a_setup-and-environment-entry.md)：root再発見方式、参加・中断復旧、初回機体／BAT等の必須範囲 |
| VERIFY-S5-SETUP-EVIDENCE / GOOGLE-CONTRACT | 34a：旧資料・実Driveとの対応、Google認証・認可・scopeの実装時確認 |
| PENDING-S5-HOME-DETAIL | [34b](architecture/presentation/34b_home-and-navigation.md)：設定管理分類、配置・権限／offline表現 |
| PENDING-S5-LIST-DETAIL / MANUAL-LIST、VERIFY-S5-LIST-EVIDENCE | [34c](architecture/presentation/34c_shared-flight-worklist.md)：絞り込み方向・共有反映・cache・Manual接続、1枚作業台帳の確認 |
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
