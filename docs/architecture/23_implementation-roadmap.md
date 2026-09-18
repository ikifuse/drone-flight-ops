# 23. Phase C 実装ロードマップとマイルストーン（23_implementation-roadmap.md）

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`
フェーズ: Phase B設計凍結（ADR-0001〜0007承認済、追加部分置換ADR-0008/0009）/ C0構築完了・C1設計準備完了・C1未着手

---

**現在の停止位置**: C0受入確認・オーナーGO待ち。99.2再移植はStep 1（§0・§1）、Step 2（§2）、Step 3（§4と取得確認・点検整備Actorに直接必要な§6の部分）、Step 4（§7のDIPS API基盤・固定IP・通信境界のみ）、Step 5（§3と§7の正常受付後・共有リストに必要な限定部分）、Step 6（§5・§6残り・§10）まで。C1前docs再編・本Stepの完了は後続コードの着手承認ではありません。以下§1.2の開始ゲートも適用します。

## 1. 実装の基本方針（安全な段階的積み上げ）

一度に巨大なアプリケーションを構築するのではなく、**「各段階で必ず動作するアプリが存在し、テストをパスしながら機能を拡張する」**インクリメンタルなロードマップを策定します。

```text
C0: 基盤・PWA Shell 構築
 └─► C1: ローカルDB (Dexie.js) & ドメイン層 (FlightPlan, DipsSubmission)
      └─► C2: 現行運航フロー再現 (点検〜離着陸〜BAT交換)
           ├─► C3: バッテリー台帳 & 機体累計管理
           ├─► C4: スプレッドシート外部台帳同期 & DIPS飛行計画台帳新設
           └─► C5: 地図・FlightArea (描画ライブラリ未選定 / FlightAreaGeometry)
                └─► C6: DIPS手動入力支援・Manual/Mock Adapter & 通報状態管理
                     │   ★【DIPS API非依存の主要機能実装完了】
                     ├─► C7: 【Optional】DIPS実API接続中継 (DIPS連携バックエンド / API JSON / 審査承認時)
                     ├─► C8: 国交省様式 PDF/CSV 帳票出力 & KML/Google Drive自動保存
                     └─► C9: オフライン強化 & 実機総合検証 (本番運用可能判定)
```

---

### 1.1 実装計画に開始ゲートを明示するまで

**当初の状態（HISTORICAL）**: `0211a9a`では動く基盤を段階的に積むためC1にDB/Domain、C8に帳票生成実装を置いた。`5d51315`では[ADR-0007](../decisions/ADR-0007-normalized-masters-and-business-reporting.md)の拡張性を反映しC1のマスター基礎を具体化し、`ea73d08`ではC0構築完了・受入/GO待ち・C1未着手を整合させた。これは実装の依存順序であり、帳票・保存先の設計確認をC8まで後回しにしてよいと決めた記録ではない。

**問題・検討の進展**: 99.2 §1は、AI実装が使用量制限で追いつかない間にも会話の設計を失わない作業台が必要になり、保存・出力構造が未確定のまま実装すると、モデル、保存、同期、帳票、テスト、移行へ連鎖修正が生じると整理した。そこで、何がフォルダー・Spreadsheet・シート・行・PDF・KMLとして増えるかを見える化し、保存先・出力単位・権限・運用構造を詰める方法へ到達した。

**現在の到達点（CURRENT-ACCEPTED）**: 実Driveで確認し、論点単位で正式Docsへ因果とともに移植し、差分監査後に依存部分を実装する。確認用実物は採用の自動証明にはしない。判断理由・未確定のまま先行実装する案を採らない理由は[ADR-0015](../decisions/ADR-0015-record-first-design-and-implementation-gate.md)、実物と設計状態の区別は[設計証拠規約](../guidelines/03_design-evidence-and-causality.md)を参照する。

### 1.2 保存・出力を確かめてから依存実装へ進むゲート

**CURRENT-ACCEPTED / 99.2 §0・§1由来**。各依存部分のコード着手前に、その責任領域の正本で次を追跡可能にする。

| 確かめる事項 | 詳細正本に残す内容 |
|---|---|
| 人が必要とする記録 | 何を記録として残し、どの帳票・台帳で確認・利用するか |
| 保存先と増える単位 | フォルダー、ファイル、Spreadsheet、シート、列・行、PDF、KMLのどこへ書き、何が増えるか |
| 操作と更新時点 | どの操作・時点で更新するか。端末下書き、Drive、DIPSを混同しない |
| 記録間の流れ | どの記録からどの台帳・帳票が更新されるか |
| 利用・運用境界 | 出力単位、権限、運用構造が必要な記録・保存先と対応するか |
| 実物と差分監査 | 確認用実物で何を確かめ、なぜ採用・変更したか。正式Docsの状態・根拠・例外・未確定を照合したか |

この流れが固まってから画面・保存処理・内部実装を安定させる。出力先が未確定なら、その出力先に依存するコードへ進まない。後続Phaseに残る未決事項を全件解消しなければ独立した設計検討もできないという意味ではない。画面の記録粒度は[Presentationの10項目規約](presentation/30_screen-specification-standard.md)へ接続する。

**Step 1時点の未移植・未監査の範囲（設計状態ではない）**: §0・§1は上記の決め方を示す。個々の保存先・列・更新タイミング・出力単位・権限構造について、同節だけでは後続章の到達点まで対照できない。該当論点の正式Docsと実物を照合する作業は、§2以降の指示されたStepへ残す。後続節で到達済みの内容を未確定へ戻す判断ではなく、本Stepではその移植・監査を完了していないという境界である。

**VERIFY-S1-EVIDENCE**は[設計証拠規約§4](../guidelines/03_design-evidence-and-causality.md#4-実物確認と設計への反映)を正本とする。C0実機受入・オーナーGO、[既存PENDING](../04_open-questions.md#3-c1前docs再編で追跡するpending)も未解決のまま保持する。

Step 2で§2の人物・環境・権限・離任を[identity-and-access](identity-and-access/README.md)へ再移植した。§2の物理schema・UI・所有等のPENDINGと実物VERIFYは同領域に保持し、上記ゲートを完了したとは扱わない。

Step 3の§4と§6の取得確認・点検整備Actor部分は[asset-management](asset-management/README.md)へ再移植した。C1の型・C3の累計管理に接続する意味を同領域で確認する。取得前履歴、取得時BAT状態、Actorの具体FK・列・UI等はPENDINGであり、依存実装の着手条件を満たしたとは扱わない。

Step 4では[DIPS接続基盤](dips-infrastructure/README.md)と[16](16_security.md)へ§7の限定部分を移した。接続方針は到達済みだが、実行基盤・VPC経路・認証契約・credentialは未確定／確認待ちで、実装や本番設定を開始しない。

Step 5では[presentation](presentation/README.md)へ§3と§7の正常受付後・共有リスト限定部分を移した。初回必須範囲、root再発見、詳細UI・共有反映等は未確定であり、画面仕様の記録をゲート通過・実装開始と扱わない。

以下のC0〜C9は実装配分を保持し、C7のStep 4接続先指定も維持する。Step 6の通常運航・A4は[35a〜35d](operation-recording/README.md)、整備媒体は[36](maintenance-storage/README.md)、Drive責任は[37](drive-structure/README.md)。§7対象外・§8・§9全体・§11の再移植は未完了である。対象領域のゲートを通過する前に、列挙された型やシート方針をそのまま実装開始の許可として使わない。

---

## 2. 実装フェーズ詳細仕様

### Phase C0: 基盤・PWA Shell 構築
- **状態**: Vanilla TypeScriptによる構築完了。受入確認・C1開始GO待ち。以下の完了条件は実機受入の基準であり、今回のdocs監査で実機検証したという意味ではない。
- **目的**: Vite + TypeScript + PWA の最小実行可能スケルトンを構築。
- **実装範囲**: プロジェクト初期化、PWA Service Worker登録、基本レイアウト、高コントラストCSSトークン。
- **完了条件**: iPhone SafariおよびPixel Chromeでホーム画面追加ができ、フルスクリーンオフライン起動すること。

### Phase C1: ローカルDB & ドメインモデル実装（正規化マスター基礎確立）
- **状態**: 未着手。schema/typeの入口は [domain-model README](domain-model/README.md)。Geometryは[17](17_map-and-airspace.md)、要件エンジン型は[25d](dips-flight-plan/25d_requirement-validation.md)、状態/離陸評価は[state-machines README](state-machines/README.md)が正本。
- **目的**: 現場自律稼働と将来の業務利用・複数機材共用に耐えるデータ永続化基盤を確立。
- **実装範囲**:
  - `src/domain/` の型定義およびDexie.js（IndexedDB）スキーマ定義:
    - **機材系**: `AircraftModel`, `Aircraft`, `BatteryModel`, `BatteryCompatibility`, `Battery`
    - **人員・組織系**: `Organization`, `Personnel`, `Client`, `Project`。人物・アカウント・環境・所属・資格・担当の意味は[31a〜31d](identity-and-access/README.md)を参照する。旧Personnel直下のRole配列を現行schemaとして実装せず、環境・ID・操作主体の未確定を該当型の固定前に照合する
    - **現場・プリセット系**: `Location`, `FlightAreaGeometry`（`POLYGON` / `CIRCLE` / `BUFFERED_LINE` の中立Domainモデル型）, `FlightAreaPreset`, `InternalFlightPurpose`（内部目的定義）, `FlightPurposePreset`, `SafetyMeasurePreset`, `OperationTemplate`（Copy Source原則、`default_aircraft_id` nullable）
    - **法務・計画・保険系**: `Permission`（包括許可）, `InsurancePolicy`（ドローン賠償責任保険台帳）, `FlightPlan`（複数機体・複数操縦者・総重量・航続時間・FlightAreaGeometryスナップショット対応、複数日指定拡張 `planned_occurrences` 互換フィールド、`draft`/`submission_ready`状態、`effective_value`/`override_value`セマンティクス）, `DipsSubmission`（`dips_contract_version`, 不変の意味論的 `submission_snapshot` 保持, `api_payload_snapshot` [nullable]）
    - **通報要件・離陸評価型**: `DipsFieldRequirementEngine` インターフェース、`DipsReportingRequirementEvaluator`（特定飛行/非特定飛行要否判定）、`DipsContractRequirement`, `DipsFieldApplicability`, `DipsInputResponsibility`, `DipsFieldValidationResult`, `DipsSubmissionReadiness`, `TakeoffReadinessAssessment`（離陸前多軸評価）型定義
    - **運航・記録系**: `Mission`, `Flight`, `DailyInspection`, `MaintenanceRecord`, `BatteryUsage`（非飛行イベント専用）
    - **監査・帳票系**: `AuditEvent`（`TAKEOFF_WITH_UNCONFIRMED_DIPS`, `TAKEOFF_UNDER_SYSTEM_OUTAGE_EXCEPTION` 等の安全監査イベント境界定義）, `ReportSnapshot`
  - 共通監査メタデータ（`created_at`, `updated_at`, `created_by`, `updated_by`, `version`）の基盤組み込み
  - Storage API（`persist()`）要求。※会社利用等のバルク移行が必要な場合はCSV/Sheets連携を第一候補とし、ユーザー向けJSONファイルのエクスポート/インポートは要求しない。
  - ※Phase C1ではデータベーススキーマ、エンティティ層、および通報判定エンジン型の確立を主目的とし、全マスターの高度な管理UI（CRUD・検索Picker等）、地図エディタUI、外部Exporter、DIPS通信、およびユーザー認証は後続Phaseで実装する。
- **完了条件**: ブラウザリロード後も作成したデータが確実に維持・復元されること。設計された全自動テストが合格すること。

### Phase C2: 現行運航フローの再現
- **目的**: 現行GASアプリのコア運航体験（準備→飛行前点検→離陸→着陸→BAT交換→飛行後点検→完了）を再現。
- **実装範囲**: `OperationStateMachine`、片手打刻UI、タイマー計測、8回以上フライト対応、新マスター（Location, Personnel, Aircraft, Battery）からの選択UI。
- **完了条件**: 通信なしの状態で、離着陸・BAT交換を連続して行い、フライトログが正確に記録できること。

### Phase C3: バッテリー共用台帳 & 機体累計管理
- **目的**: バッテリー型式・個体の共用管理と機体累計自動加算の確立。
- **実装範囲**: 複数機体間でのバッテリー共用選択、非飛行イベント（充電・保管・点検）記録（`BatteryUsage`）、累積サイクル計算、機体累計時間自動合算、手動補正追従。
- **完了条件**: フライト完了ごとに各機体およびバッテリーの累積時間・回数が正確に加算・表示されること。

### Phase C4: Googleスプレッドシート外部同期 & 論理台帳新設
- **目的**: 運航記録の外部台帳二重化と、内部正規化と人間向け媒体を分けた台帳への安全同期（37、最終保存35dの未確定契約に従う）。
- **実装範囲**: `SyncQueue`、Google Sheets API/GAS連携、手修正上書き防止ロジック、再送冪等性、通常内部履歴の正規化と04／05の媒体例外（37）。具体的な保存対象・再送契約は35dのPENDINGを解消してから実装する。
- **完了条件**: 電波復帰時にワンタップで同期され、スプレッドシートの手修正が上書きされないこと。

### Phase C5: 地図・飛行範囲エディタ（Flight Area Editor）
- **目的**: 国土地理院タイルを用いた現場飛行範囲作成・編集・再利用機能の実装（DIPS Web同等操作性）。
- **実装範囲**:
  - レイヤー構造: 国土地理院BaseLayer（© 国土地理院）、規制空域レイヤー（DID、空港等周辺、緊急用務空域）、作図レイヤーの分離。
  - 図形作成・編集機能: `POLYGON`（多角形）、`CIRCLE`（中心＋半径）、`BUFFERED_LINE`（中心線＋幅/半径）の作成・頂点編集・削除。
  - プリセット管理: `FlightAreaPreset` 保存・読込、飛行計画への適用（Override対応）。
  - 中立Domainの維持: `FlightAreaGeometry` を正本とし、Map描画ライブラリが要求する場合のみ内部AdapterでGeoJSONへ変換。ユーザー向けGeo Exportの第一形式はKML（生成・Drive保存の実装はC8。[出力境界](output/27_output-boundaries.md)参照）。
  - キャッシュ機構: オフライン時の事前キャッシュ地図表示。
  - ※レンダリングライブラリ（Leaflet / MapLibre GL JS等）はC5開始時に実機検証し、採用決定をADRで記録する（[ADR-0009](../decisions/ADR-0009-map-renderer-selection-deferred-to-c5.md)）。現時点では固定しない。
- **完了条件**: 現場予定エリアを画面上に描画（円・ポリゴン・線形バッファ）・保存・プリセット再利用でき、オフライン時でも事前キャッシュ地図が表示されること。

### Phase C6: DIPS手動入力支援・Manual/Mock Adapter & 通報状態管理
- **目的**: DIPS API未取得・審査中でも現場で実運用可能な「手動通報フロー」と「通報状態管理」の実装。**【本フェーズ完了の定義: DIPS API非依存の主要機能実装完了】**（※本番運用可能判定は、C8の帳票機能およびC9の実機・オフライン・Shadow Run等の総合検証を完了した後に行う）。
- **実装範囲**: `ManualDipsAdapter`、手動入力支援画面（1タップコピーUI、DIPS Webリンク）、`MockDipsAdapter`、DIPS通報状態マシン（`SNAPSHOT_SAVED`, `MANUAL_SUBMIT_WAIT`, `MANUAL_SUBMITTED`, `DIPS_CONFIRMED` 等と、直交する台帳同期状態 `sync_status` の分離）、確認方法（`flight_plan_list_match` / `displayed_id`）対応、誤認防止安全UI。※手動通報支援ではAPI用JSONシリアライズは行わない。
- **完了条件**: DIPS APIキーが一切存在しなくても、計画作成→ローカル不変スナップショット保存→手動コピー画面→手動通報打刻→通報確認記録（受付番号入力または一覧目視照合）までが正常に動作し、「手動通報記録」と「DIPS確認済み」、および「台帳同期状態」が明確に区別されること。

### Phase C7: 【Optional Integration】DIPS 2.0 実API中継（接続基盤33a・API電文25c）
- **目的**: 国交省審査を通過し、正式なcredential（client_id, client_secret）が発行された場合のみ追加する拡張統合機能。**（※審査未完了・API拒否時でも本フェーズをスキップしてC8・C9へ進むことができ、アプリ完成のブロッカーとならない）**
- **実装範囲**: [33a](dips-infrastructure/33a_fixed-egress-and-api-connection.md)のDIPS連携バックエンドと固定出口経路、`ApiDipsAdapter`、FPR API電文・`api_payload_snapshot`（[25c](dips-flight-plan/25c_api-payload-mapping.md)）、照合（[13b](state-machines/13b_dips-submission.md)）。実行コンピュート／VPCはPENDING-C7-INFRA、認証フロー・credential・具体照合APIは[16](16_security.md)のVERIFY。旧Workers OIDC指定からの変更理由は33aへ保持し、型・payload・FSM詳細の追加確定や実装開始を意味しない。
- **完了条件**: DIPSテスト環境または本番環境との間でトークン取得・JSON計画通報・計画ID自動回収が成立すること。

### Phase C8: 統合A4運航帳票・国交省様式 PDF/CSV 出力 & KML Geo Export
- **目的**: 実務用「A4縦 統合運航帳票」（最新A4実物の飛行記録・日常点検・記事等、詳細は35c）、法定飛行日誌（様式1・2・3別）、DIPS飛行計画台帳の出力、および Google My Maps 連携用 KML エクスポート・Google Drive 自動保存機能の確立。
- **実装範囲**:
  - `pdf-lib`によるA4出力を[35c](operation-recording/35c_a4-operation-record.md)の実物・現在運用へ合わせる。固定7枠とDomain明細を区別し、旧自動続紙は採用しない。必要時PDFとGoogle Sheets標準印刷の検証も35cへ接続する。
  - 国交省標準様式1（飛行記録）、様式2（日常点検記録）、様式3（点検整備記録）の個別PDF/CSV出力。
  - DIPS飛行計画台帳のエクスポート機能。
  - **KML Geo Export & Google Drive自動保存（詳細は [output README](output/README.md) 参照）**:
    - `KmlExporter`: `FlightAreaGeometry`（Polygon, 近似Circle, Buffered Line）および計画属性・運航実績を「1 FlightPlan = 1 KML」形式で生成。
    - `GoogleDriveAdapter`: 設定された保存先フォルダへKMLを自動保存（計画確定時・運航完了時更新）。オフライン時は `SyncQueue` 経由で電波復帰時に非同期アップロード。
    - プライバシー保護プロファイル（`SHARE_SAFE` 既定による個人連絡先除外）。
  - 帳票発行時点の不変スナップショット保存（`ReportSnapshot`）。
- **完了条件**: オフライン環境でもブラウザ内で必要項目を満たしたPDFが生成・保存でき、KMLがGoogle Driveへ自動保存（または圏外時キューイング）されGoogle My Mapsへの手動インポートにより視覚的確認ができること。DIPS通報履歴が監査用に出力できること。

### Phase C9: オフライン強化 & iPhone/Android実機総合検証・本番切替判定
- **目的**: 現場本番運用に向けた実機総合検証と多面的信頼性確認、および本番切替判定。
- **実装範囲**: 実機での電波遮断テスト、強制終了復帰テスト、並行運用テスト（Shadow Run）。
- **本番切替完了条件（総合判定基準）**:
  単なる「3フライト確認」のみに依存せず、C8の帳票機能完了を踏まえ、以下の全検証シナリオをクリアすることをもって本番切替承認とする。
  1. **自動テスト全合格**: ドメインロジック・時間計算・状態遷移・バリデーションの単体/統合テスト全通過。
  2. **実機動作検証**: iPhone 13（iOS Safari PWA）および Pixel 6a（Android Chrome PWA）の双方で主要UI・打刻・表示が正常動作。
  3. **オフライン（圏外）動作**: 機内モード状態で、飛行前点検〜連続離着陸〜BAT交換〜飛行後点検〜ローカル確定まで一切中断なく完了可能。
  4. **クラッシュ・強制終了復旧**: 飛行中（`IN_FLIGHT`）および入力中にブラウザを強制終了しても、再起動時に直前状態へ確実に復帰すること。
  5. **バッテリー交換・機体交代**: 現場での連続BATスロット切替および予備機への途中交代が正しく記録されること。
  6. **日跨ぎ飛行**: 日付変更線を跨ぐ夜間・未明フライトで時間計算・日付記録が正確であること。
  7. **特殊運航シナリオ**: 飛行0回での現場中止（`ABORTED`）および8回以上の連続飛行が制限なく正常記録できること。
  8. **スプレッドシート競合保護**: スプレッドシート側のセル直接編集が、アプリからの後続同期で上書き破壊されないこと。
  9. **ストレージEviction想定復旧**: 同期済み確定台帳の再取得・競合検証が成立すること。未同期データ・設定・全ローカルDBの復旧まで保証しない。全量backup/restore形式・範囲・検証はPENDING（[ADR-0008](../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md)）としてC9の本番判定前に解決または残存リスクの明示的判断を要する。KMLでDB復旧しない。
  10. **DIPS Mockエラー・照合処理**: 4xxエラー時の入力修正誘導、およびPOST切断時の照合（Reconciliation）フローが意図通り動作すること。
  11. **DIPS手動通報・飛行計画台帳の自律検証**: DIPS API接続が一切ない環境でも、計画作成・不変スナップショット保存・手動支援コピー・手動通報打刻・確認記録（受付番号または一覧目視照合）・スプレッドシート台帳同期の全プロセスが正常完了すること。
  12. **実現場並行運用（Shadow Run）**: 現行GASアプリと並行運用し、3回以上の実際の飛行セッションで記録内容の整合性を確認すること。
