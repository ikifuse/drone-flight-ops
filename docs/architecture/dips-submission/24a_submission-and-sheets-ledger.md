# 24a. 正規化Sheets台帳とDIPS提出台帳

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: Sheets論理台帳群、DIPS台帳の列・完全性・同期利用・実績逆引き。Entity、FSM、同期キュー、Data Authorityの詳細を再定義しない。

## 1. Googleスプレッドシート論理台帳構成

### 1.1. 内部台帳の正規化と人間向け媒体

旧案は「個体数・日数に比例する物理シートの増殖」を絶対禁止していた（HISTORICAL）。内部履歴の行追加・正規化という意図は維持するが、04の固定A4日付連番シートと05の機体別整備原本コピーは現在の意図的な媒体設計である。変更理由と七領域の責任は[37](../drive-structure/37_environment-storage-responsibilities.md)、詳細は[35c](../operation-recording/35c_a4-operation-record.md)／[36](../maintenance-storage/36_aircraft-maintenance-records.md)を正本とする。本書のDIPS台帳の行追加方式へ両例外を拡張しない。

### 1.2. シート分類と推奨構成
以下は既存の論理台帳案。内部データの意味を示し、04のA4実物と別の必須物理台帳群を一括確定する表ではない。運航明細・媒体との対応は35a／35d／37のPENDINGに従う。

| No | 論理台帳名（シート名） | 役割・格納データ | 独立Sheet推奨 | 同期・管理方針 |
|:--:|---|---|:--:|:--:|
| 1 | **`DIPS飛行計画台帳`** | DIPS提出不変スナップショット・通報履歴（SSoT） | **YES** | **必須同期**（法的監査最重要） |
| 2 | **`運航実績台帳`** | 全フライトの離着陸実績（時刻、実時間、機体ID、BAT-ID、残量、所感） | **YES** | **必須同期**（全機体共通の行追加型） |
| 3 | **`日常点検台帳`** | 飛行前・飛行後日常点検記録（日付、機体ID、点検者、合否、処置） | **YES** | **必須同期**（全機体共通の行追加型） |
| 4 | **`点検整備台帳`** | 旧: 全機体共通の行追加台帳（HISTORICAL） | 現行媒体は36 | 05の機体別Spreadsheet・手動コピーへ具体化。中央表を別途必須としない |
| 5 | **`機体台帳`** | 機種（Model）情報および機体個別情報（登録記号、製造番号、累計） | **YES** | **同期推奨**（行更新型マスター） |
| 6 | **`バッテリー台帳`** | バッテリー型式および個体情報（シリアル、互換機種、累計サイクル、時間） | **YES** | **同期推奨**（行更新型マスター） |
| 7 | **`バッテリー使用履歴`** | バッテリー個体ごとの使用実績（飛行時間、放電、所感） | **NO** (派生View) | **派生View**（`運航実績台帳` から数式・QUERY等で自動参照表示） |
| 8 | **`人員・場所台帳`** | 人員（Personnel）、場所（Location）、許可承認（Permission） | **YES** | **任意同期**（1シートにまとめるかタブ分け） |
| 9 | **`保険台帳`** | ドローン賠償責任保険（`InsurancePolicy`）情報（会社名、証券、限度額） | **YES** | **同期推奨**（行更新型マスター） |
| 10 | **`案件台帳`** | 顧客（Client）、案件（Project）マスター | **YES** (業務利用時) | **任意同期**（個人利用時は省略可） |
| 11 | **`プリセット・テンプレート`** | 飛行範囲、目的、安全措置Preset、運航テンプレート | **NO** (ローカル優先) | **ローカル中心**（長期退避対象・方式はPENDING。ユーザー向けJSONファイル出力は行わない） |
| 12 | **`帳票発行台帳`** | 発行された統合A4帳票等のメタデータ・履歴（`ReportSnapshot`） | **YES** (監査用) | **任意同期**（監査用メタデータ行追加） |

### 1.3. 人員領域の正本との関係

§1の人員・場所台帳は基準の論理台帳案であり、人物・アカウント・所属・資格・離任履歴の物理構造を確定しない。99.2 §2に記録された人員管理5タブの実例と、そこに至る分離理由・未確定は[31a §3](../identity-and-access/31a_person-account-and-environment.md#3-資格の分離と確認用5タブ)に置く。Step 2当時はDrive全体を対象外とした。Step 6の現行配置責任は37へ接続する。

### 1.4. 機材取得履歴の正本との関係

Step 3の機体・BAT取得履歴と共用の意味は[asset-management](../asset-management/README.md)に置く。上表は基準の論理台帳案であり、取得前履歴・取得時サイクル数の新しい物理列を確定しない。BAT使用履歴の飛行由来の射影と非飛行イベントの責任は[32b §4](../asset-management/32b_battery-sharing-and-acquisition-history.md#4-飛行実績と非飛行履歴の責任を保持する)に従い、最終的な表・行対応の未確定を上表だけで解消しない。Step 3で留保した§6残りの媒体・通常整備との分離はStep 6の36へ移管した。BATの具体的な物理保持先は未確定を維持する。

### 1.5. 共有作業リストとの責任分離

Step 5の[34c](../presentation/34c_shared-flight-worklist.md)は、これから扱う通報済み計画を共有する軽量な作業リストと画面の正本。本書の提出試行・Snapshot・履歴保持と同じ保存物だと確定しない。画面→06側の責任接続は[34b](../presentation/34b_home-and-navigation.md)、正式掲載契機は[34d](../presentation/34d_dips-accepted-and-plan-content.md)。本書の履歴列をそのままカード必須項目へ増やさず、物理シート・保存関係の詳細は後続へ残す。

## 2. Googleスプレッドシート「DIPS飛行計画台帳」仕様

新アプリの正規化された論理台帳群の一つとして「DIPS飛行計画台帳」シートを設けます（旧GASのBAT個別シート等の増殖型シートは廃止し、正規化された独立シートとして管理）。1つの提出試行（スナップショット）ごとに1行が記録され、通報の履歴、改訂、取消、および実運航日誌との紐付けを網羅します。

### 2.1. 論理スキーマ・列定義一覧

| 列番号 | 列物理名 | 列論理名 | 型・形式 | 説明・必須区分 |
|:---:|---|---|---|---|
| A | `submission_id` | 提出ID | UUID v4 | 1つの通報試行・スナップショットの一意識別子（主キー） |
| B | `flight_plan_id` | 飛行計画ID | UUID v4 | 内部飛行計画の一意識別子 |
| C | `revision` | 計画リビジョン | 整数 (1, 2, ...) | 計画変更ごとにインクリメントされる版数 |
| D | `created_at` | 計画作成日時 | ISO8601 | 計画が最初に起票された日時 |
| E | `snapshot_created_at` | 提出確定日時 | ISO8601 | 提出スナップショットが確定された日時 |
| F | `planned_start_time` | 飛行予定開始日時 | ISO8601 | 飛行予定開始時刻 |
| G | `planned_end_time` | 飛行予定終了日時 | ISO8601 | 飛行予定終了時刻 |
| H | `location_name` | 飛行場所名称 | 文字列 | 現場地点名 |
| I | `shape_type` | 飛行範囲形状 | Geometry kind | [17](../17_map-and-airspace.md) の `POLYGON` / `CIRCLE` / `BUFFERED_LINE` を表示。旧小文字例を現行enumにしない |
| J | `center_coordinates` | 計画中心座標 | 緯度,経度 | 円形中心等の表示用。中立Geometryは名前付き座標を保持し、この文字列を形状正本にしない |
| K | `radius_meters` | 半径(m) | 数値 | 円形時の半径 |
| L | `geojson_geometry` | GeoJSON形状（派生列） | 内部直列化文字列 | 旧列の用途を保持する描画/互換参照用。形状正本はAFのSnapshot内FlightAreaGeometry。BUFFERED_LINEを未確認API形式へ自動変換しない |
| M | `planned_altitude_agl` | 計画高度(AGL m) | 数値 | 計画対地高度（例: 30, 50） |
| N | `aircraft_model` | 使用機体型式 | 文字列 | 例: "EVO Lite Series" |
| O | `registration_mark` | 機体登録記号 | 文字列 | 例: "JU324XXXXXXX" |
| P | `pilot_name` | 操縦者氏名 | 文字列 | 操縦者名 |
| Q | `pilot_license_number`| 技能証明番号 | 文字列 | 技能証明等番号 |
| R | `flight_purpose` | 飛行目的 | 文字列 | 空撮、点検、測量等 |
| S | `flight_type` | 飛行形態 | 文字列 | 目視内/目視外、30m等 |
| T | `permission_number` | 許可承認番号 | 文字列 | 包括許可等の番号 |
| U | `submission_method` | 通報方式 | `manual` / `api` / `mock` | 手動通報かAPI通報かモックか |
| V | `submission_status` | 通報状態 | 文字列 | [13b](../state-machines/13b_dips-submission.md) の全状態を表現。列側で状態一覧を再定義しない |
| W | `confirmation_method`| 確認方法区分 | 文字列(nullable) | `flight_plan_list_match` / `displayed_id` / `api_response` |
| X | `dips_plan_id` | DIPS計画番号/受付番号 | 文字列(任意) | 手動入力またはAPIで受領した番号（未確認時は空文字/null） |
| Y | `submitted_at` | 通報実施日時 | ISO8601 | 手動記録またはAPI送信打刻（未通報時はnull） |
| Z | `confirmed_at` | 受理確認日時 | ISO8601 | 受付番号確認または一覧照合打刻（未確認時はnull） |
| AA| `supersedes_id` | 訂正前提出ID | UUID v4 | 本版が差し替えた旧提出ID（訂正履歴） |
| AB| `superseded_by_id` | 訂正後提出ID | UUID v4 | 本版を差し替えた新提出ID |
| AC| `cancellation_info` | 取消情報 | 文字列 | 取消日時および理由（取消時） |
| AD| `linked_mission_id` | 紐付運航実績ID（代表表示） | UUID v4(任意) | 関連Missionの代表を表示する旧列。全件関係はMission.planned_submission_idから逆引きし、1件へ切り捨てない |
| AE| `notes` | 備考・エラーログ | 文字列 | 通報時メモ、エラー所感、手動追記事項 |

## 3. 全提出内容の保持と表示列の役割

A〜AEの日時・機体・操縦者等は検索・人間確認に用いる列であり、複数機体・複数操縦者・複数日・保険・線形バッファ等を単一表示列へ潰して保存しない。履歴の完全性を支えるのは [12d](../domain-model/12d_flight-plan-and-dips.md) の不変意味論Snapshotであり、次の保持項目を論理スキーマに含める。

| 列番号 | 列物理名 | 役割・保持条件 |
|---|---|---|
| AF | `submission_snapshot` | 提出確定時点の全意味論Snapshot。全機体/人員/複数日/保険/許可/連絡先と中立Geometryの完全な値を内部直列化して保持する。計画属性の表示列F〜Tをここから導出する（ライフサイクル列は下記の別由来） |
| AG | `api_payload_snapshot` | API送出時のみexact outbound JSONを保持（C7 Optional、Manualではnull）。ユーザー向けファイル出力ではない |
| AH | `sync_status` | ローカル保存/同期待ち/同期中/同期済/同期失敗の台帳同期軸。DIPS通報状態V列とは独立 |
| AI | `dips_contract_version` | 提出当時の要求度評価・API変換に参照した契約バージョン |

列の由来を分離する。A〜Eは提出ID・計画ID・revision・作成/確定日時、F〜Tは不変Snapshotの計画属性、Uは提出方式、V〜ACは可変ライフサイクルメタデータ、ADは関連Missionからの派生参照、AEは追記可能な提出メモである。可変列を古いSnapshotから復元して上書きしない。完全Snapshotとその計画検索列が矛盾する場合はサイレント上書きせず検出する。セル容量を超えるSnapshotの物理的保持方法は **PENDING（C4開始前）**。内容の切捨て、部分Snapshotでの同期済み扱い、KMLによる代替保管は禁止する。物理分割が必要でも提出IDによる再構成と完全性確認を要し、件数比例のシート複製は行わない。

JSON等の内部直列化/Sheets通信を、利用者向けDB backup/import/export形式と混同しない。[ADR-0008](../../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) に従い、全量DB復旧のユーザー形式はPENDING、KMLは地図表示用であって全量バックアップではない。

## 4. 更新権威と3つの保存表示

Data Authorityは [11](../11_data-authority.md) が正本。現場ではローカル一次権威、同期後はSheets確定台帳となり、人の手修正を古い端末値で上書きしない。提出Snapshotは不変、status/confirmed_at等のライフサイクルメタデータは監査イベント付きで更新する（[12d](../domain-model/12d_flight-plan-and-dips.md)）。

表示軸を「ローカル保存済」「外部台帳同期待ち/同期済」「DIPS通報確認」に分ける。既存の同期表示値 `local_saved` / `sync_pending` / `syncing` / `synced` / `sync_failed` は台帳への保存進行を表し、13bのSubmission状態ではない。同期ジョブ本体の型/再試行/競合は [14](../14_offline-and-sync.md)、冪等IDは [12f](../domain-model/12f_common-lifecycle-id-and-audit.md) を参照する。

## 5. 実運航（Mission / Flight / 飛行日誌）との紐付け設計

飛行計画（予定）と実際の飛行日誌（実績）を結合し、後からの監査や運航分析を可能にします。

1. **現場運航開始時の計画選択**:
   - 基準では保存済み計画から現場の対象を選ぶ設計だった。通報済み共有計画の現在の入口とカード選択は[34c](../presentation/34c_shared-flight-worklist.md)から通報内容確認へ接続する。計画なし運航の既存境界は[13_overview](../state-machines/13_overview.md)に維持し、下記のID紐付けを今回再設計しない。
2. **ID紐付け**:
   - `Mission.planned_flight_plan_id` に飛行計画IDを格納。
   - `Mission.planned_submission_id` に、その飛行に適用されたDIPS提出スナップショットIDを格納。
3. **台帳側の逆引き**:
   - Submissionから複数Missionへ関連し得るため、全件は `Mission.planned_submission_id` のFKから逆引きする。Googleスプレッドシート「DIPS飛行計画台帳」の旧 `linked_mission_id` 列は代表表示に限定し、全件関係の正本にしない。全件を外部台帳で保持/表示する具体的な関連テーブル・列形式は **PENDING（C4開始前）** とし、単一IDへの切捨てを禁止する。
4. **監査対比**:
   - 「計画した飛行日時・範囲・高度」と「実際の離着陸時刻・飛行時間・点検結果」をワンクリックで対比・確認可能。

---

## 6. オフライン現場での自律動作と同期順序

山間部や海岸線などの完全電波圏外（機内モード）であっても、運航業務が停止しない自律オフライン設計を徹底します。

### 6.1. 処理順序とキューイング
1. **計画作成**: オフラインで地図・範囲・日時を入力。
2. **提出確定**: IndexedDBへ不変 `submission_snapshot` を即時永続化（`SNAPSHOT_SAVED`）。
3. **台帳同期ジョブ登録**: `SyncQueue` に `target: 'spreadsheet_dips_ledger'` の同期ジョブ（`SyncQueue.status: 'pending'`）を登録。対象Entityの `sync_status: 'sync_pending'` とジョブの実行状態を区別する。
   - 圏外時はキュー待機のまま。**Sheets同期完了を待たずにステップ4へ進むことが可能**。
4. **手動通報**: 手動入力支援画面はオフラインでも動作（端末内スナップショットから表示・コピー）。DIPS Web等への実通報・登録確認は通信可能な時に行い、通報打刻および確認記録（受付番号入力または一覧照合）を実施。Sheets同期の待機とDIPSへの到達可否は独立する。
5. **電波復帰時のフラッシュ同期**:
   - 通信が回復した時点で、`SyncQueue` のジョブが順次実行され、Googleスプレッドシートの「DIPS飛行計画台帳」へスナップショット、確認ステータス、確認方法、受付番号が一括反映されます。
