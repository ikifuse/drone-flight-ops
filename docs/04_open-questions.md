# 未確認事項と将来の設計判断論点

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`


**現在の区分**: 以下は未確認事項と当初の選択肢の記録です。Phase Bで既に決定した事項は再び承認待ちに戻しません。

| 当初の論点 | 現在の扱い / 正本 |
|---|---|
| クライアント・バックエンド選定 | ADR-0001によりPWA / Workers採用済み。地図ライブラリはADR-0009によりC5評価へ留保 |
| データ権威・同期 | ADR-0002 Model D採用済み。詳細は[11](architecture/11_data-authority.md)/[14](architecture/14_offline-and-sync.md) |
| 秘密情報保護 | ADR-0004のBFF境界採用済み。具体的なC7認証検証・credentialはPENDING、[16](architecture/16_security.md) |
| API非依存・手動通報 | ADR-0006採用済み。C6 Manual第一級 / C7 Optional |
| 機材・人員・帳票 | ADR-0007正規化採用済み。詳細は[Domain](architecture/domain-model/README.md)/[Reports](architecture/18_reports.md) |
| JSON退避 | ADR-0008で利用者向けJSON廃止、全DB復旧形式はPENDING |

採用決定と限定置換の正確な範囲は [ADR一覧](decisions/README.md) を参照してください。以下§2の候補比較は当初の検討履歴であり、上表の決定と競合する現行案ではありません。

---

## 1. 未確認事項（推測で確定してはならない重要事項）

国土交通省 DIPS 2.0 APIの利用や外部連携について、現時点で公式資料から確定できていない事項です。
これらは推測で進めず、将来の実装検討時に国土交通省や公式ガイドラインで直接確認する必要があります。

### 1.1 DIPS 2.0 APIの利用申請主体と資格要件
- **個人・個人事業主での申請可否**:
  - 国交省の案内資料では「運航管理システム等を整備する法人・団体」向けとして案内されている箇所がある。
  - 個人、個人事業主、あるいは趣味・個人業務での利用目的で `client_id` および `client_secret` が正式に発行されるか未確認。
- **申請時に求められる審査基準**:
  - システム構成図、セキュリティ対策基準、データ保管体制、事故時の連絡体制など、どのような運用体制の審査があるのか。
  - 公開Webアプリではなく、個人運航用のスタンドアロンツールでも認可対象になるのか。

### 1.2 クライアントID・認証realmの具体的発行単位
- **3系統の認証realmとcredentialの対応関係**:
  - DIPS 2.0には、機体登録（`drs-utm`）、飛行許可承認（`drs-req`）、飛行計画通報（`drs-fpl`）の3つの異なるrealmが存在する。
  - 申請書（`DIPS2.0_API_Application_Forms.xlsx`）提出後、1つの `client_id` / `client_secret` で3系統すべてにアクセスできるのか、realmごとに個別のcredentialが発行されるのか未確認。
  - 実際の「DIPS 2.0 API設定通知書」を受領・確認するまで断定しない。

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

§2の到達済み設計を未決へ戻さず、個別の判断・実物確認を次の正本へ残す。前節はStep 1時点の記録であり、現在の移植済み範囲は§2まで。既存PENDING / WARNは解消していない。

| 対象 | 詳細正本 |
|---|---|
| PENDING-S2-IDENTITY / PENDING-S2-ENVIRONMENT-UI / VERIFY-S2-IDENTITY-EVIDENCE | [31a](architecture/identity-and-access/31a_person-account-and-environment.md)：組織・環境・ID・資格列・切替UI・試作確認 |
| PENDING-S2-ACCESS-DETAIL / VERIFY-S2-ACCESS-EVIDENCE | [31b](architecture/identity-and-access/31b_roles-and-access-control.md)：未定義の複合役割・機能詳細と実共有確認 |
| PENDING-S2-ACTOR-SCHEMA/UI / VERIFY-S2-ACTOR-EVIDENCE・代理通報範囲 | [31c](architecture/identity-and-access/31c_operational-actors.md)：担当の保持先・別人点検UI・観測証拠。基準C1 schema未確定へ接続 |
| PENDING-S2-MEMBERSHIP / PENDING-S2-OWNERSHIP | [31d](architecture/identity-and-access/31d_membership-lifecycle.md)：離任実行権限・UI・offline・履歴列・再所属形式・会社所有 |
