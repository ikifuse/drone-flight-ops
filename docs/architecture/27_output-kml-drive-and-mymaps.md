# 27. 出力・KML・Google Drive・My Maps連携設計（27_output-kml-drive-and-mymaps.md）

最終更新: 2026-09-15  
プロジェクト: `drone-flight-ops`  
フェーズ: Phase B2（詳細アーキテクチャ・外部連携・Geo Export設計）  
ステータス: **設計確定（Phase C 実装前仕様）**

---

## 1. 目的と出力・保存の3系統正式分離

本ドキュメントは、新アプリ `drone-flight-ops` において、飛行計画および現場運航記録を外部へ出力・可視化・長期保管するための「3系統の出力・保存パイプライン」と、KML生成、Google Drive自動保存、およびGoogle My Maps（マイマップ）連携の詳細仕様を定義します。

### 1.1 3大出力系統の役割分担とデータ権威

本システムでは、出力および保存の役割を以下の3系統に厳格に分離します。いずれかの導入・改定によって他の系統を廃止・縮小してはなりません。

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       アプリ内部 Domain Data (IndexedDB)                    │
│      (FlightPlan, Mission, Flight, Inspections, FlightAreaGeometry)         │
└──────┬───────────────────────────────┬───────────────────────────────┬──────┘
       │                               │                               │
       ▼ [系統 A]                      ▼ [系統 B]                      ▼ [系統 C]
┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Google Sheets (正規化台帳)  │ │ PDF / 印刷帳票              │ │ KML (Geo Export)            │
├─────────────────────────────┤ ├─────────────────────────────┤ ├─────────────────────────────┤
│ ・運航完了後の確定台帳権威  │ │ ・法的提出・紙面保管・監査  │ │ ・地図可視化・地理情報交換  │
│ ・長期保管・人間による修正  │ │ ・A4縦 統合運航帳票         │ │ ・Google My Mapsインポート  │
│ ・複数機体/BATの累計計算    │ │ ・国交省様式1・2・3         │ │ ・Google Earth / GIS閲覧    │
│ ・全運航データのマスターSST │ │ ・地図付き飛行計画書        │ │ ・実飛行GPSログとの重ね合わせ│
│ ※KML導入後も廃止・縮小禁止 │ │ ※KMLをPDFの代替にしない    │ │ ※KMLは台帳原本ではない      │
└─────────────────────────────┘ └─────────────────────────────┘ └─────────────────────────────┘
```

1. **【系統 A: Google Sheets】（長期台帳権威・原本）**:
   - 運航完了後の確定台帳権威は、既存の [11_data-authority.md](11_data-authority.md) に基づき Google Sheets が担います。
   - 飛行計画台帳、運航日誌、日常点検記録、点検整備台帳、機材台帳を正規化テーブルとして保持し、累計時間・サイクルの自動計算や、人間による事後補正（手修正上書き防止ルール適用）を可能にします。
2. **【系統 B: PDF / 印刷帳票】（法定・提出用派生帳票）**:
   - [18_reports.md](18_reports.md) に基づく派生帳票（A4縦 統合運航帳票、国交省様式1・2・3別紙、地図付き飛行計画書）。
   - 航空局への提出、立ち入り検査時の提示、コンビニ・現地印刷、紙面保管用。KMLをPDFの代替にすることはできません。
3. **【系統 C: KML】（地理的可視化・外部共有用派生 Geo Export）**:
   - 飛行計画の空域形状および運航結果を地図として視覚的に確認・保管するための派生ファイル。
   - 利用者が Google My Maps や Google Earth へ取り込んで確認するための地理情報交換フォーマットであり、台帳原本ではありません。

---

## 2. 1 FlightPlan = 1 KML 原則とファイル構造

### 2.1 単位原則
- **基本単位**: **1 FlightPlan = 1 KML ファイル**
- 特定飛行における実運用上は「1 DIPS飛行計画通報 ＝ 1 FlightPlan ＝ 1 KML」となります。
- ただし、DIPS通報が不要な非特定飛行（DID外・昼間・目視内・30m距離確保等）であっても、アプリ内で `FlightPlan` を作成するため、Domain上はDIPS通報有無に関わらず「1 FlightPlan」をKML生成の基本単位とします。

### 2.2 1ファイルへの統合構造
1つのKMLファイル内部に、計画情報・飛行範囲・現場点検・フライト実績を複数の `Folder`, `Placemark`, `ExtendedData` として階層的に構造化します。

```text
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>2026-10-20_金岡公園_FP-a1b2c3</name>
    <description>drone-flight-ops Flight Record</description>
    
    <!-- 1. 飛行範囲フォルダ -->
    <Folder>
      <name>Flight Area</name>
      <Placemark>
        <name>計画飛行範囲 (Polygon / Approximated Circle / Buffered Line)</name>
        <Polygon> ... </Polygon>
      </Placemark>
      <Placemark>
        <name>離着陸想定ポイント / 中心点</name>
        <Point> ... </Point>
      </Placemark>
    </Folder>

    <!-- 2. 計画・DIPS通報属性フォルダ -->
    <Folder>
      <name>Flight Plan Metadata</name>
      <Placemark>
        <name>運航概要・通報情報</name>
        <ExtendedData>
          <Data name="FlightPlanID"><value>...</value></Data>
          <Data name="Aircraft"><value>...</value></Data>
          <Data name="Pilot"><value>...</value></Data>
          <Data name="Purpose"><value>...</value></Data>
          <Data name="Airspace"><value>...</value></Data>
          <Data name="Methods"><value>...</value></Data>
          <Data name="Altitude"><value>100m AGL</value></Data>
          <Data name="DipsStatus"><value>DIPS_CONFIRMED</value></Data>
          <Data name="DipsPlanID"><value>...</value></Data>
        </ExtendedData>
      </Placemark>
    </Folder>

    <!-- 3. 現場運航実績フォルダ (Mission完了時追加) -->
    <Folder>
      <name>Operational Execution</name>
      <Placemark>
        <name>飛行前点検: 合格 (2026-10-20 09:15)</name>
      </Placemark>
      <Folder>
        <name>Flights</name>
        <Placemark>
          <name>Flight 1 (09:30 - 09:45, 15min, BAT-A01)</name>
        </Placemark>
        <Placemark>
          <name>Flight 2 (09:55 - 10:12, 17min, BAT-A02)</name>
        </Placemark>
      </Folder>
      <Placemark>
        <name>飛行後点検: 合格 (2026-10-20 10:20)</name>
      </Placemark>
    </Folder>
  </Document>
</kml>
```

※Google My Maps へインポートした際、`ExtendedData` や `Folder` 階層がどのようにUI表示・テーブル列化されるかは、実サービス検証前のため `PENDING-MYMAPS-01` として扱います。

---

## 3. FlightAreaGeometry から KML への変換仕様

アプリ内部の中立Domainモデル `FlightAreaGeometry`（[17_map-and-airspace.md](17_map-and-airspace.md)）を正本とし、`KmlExporter` がKML形式へ射影変換します。KML自体をDomain Modelに固定してはなりません。

### 3.1 幾何形状別の変換ルール
1. **`POLYGON`**:
   - `polygon_points[]`（WGS84 緯度・経度配列）をそのまま KML `<Polygon><outerBoundaryIs><LinearRing><coordinates>` へ変換。
   - 始点と終点を一致させてリングを閉じる。
2. **`CIRCLE`**:
   - KML標準にはネイティブなCircle幾何タグが存在しないため、中心点（`center`）と半径（`radius_meters`）から、測地線計算により一定刻み（例: 36分割/10度刻み、または72分割/5度刻み）の円周座標列を生成し、**近似 Polygon** として出力する。
   - 元の `center` および `radius_meters` は Domain 側に保持し、KMLの `<ExtendedData>` にも属性値として明記する。
3. **`BUFFERED_LINE`**:
   - Domain上は `path_points[]`（中心線）と `buffer_radius_meters`（幅/半径）を保持。
   - KML出力時は、用途に応じて以下のいずれかまたは両方を生成：
     - 中心線としての `<LineString>`
     - 中心線の左右にバッファ幅を持たせた**帯状 Polygon**
   - ※計算アルゴリズムおよび分割精度は実装Phaseで決定。

---

## 4. KMLに保持する計画情報と運航実績

### 4.1 計画確定時（Plan Snapshot）
- `FlightPlan ID`（UUID）および表示短縮ID
- 計画名称（`name`）
- 飛行予定日時（開始日時・終了日時）
- 飛行場所情報（場所名、住所/地名、中心緯度経度）
- 飛行目的（内部目的およびDIPS公式目的）
- 飛行空域（DID、空港周辺、150m以上、該当なし）
- 飛行方法（夜間、目視外、30m未満等）
- 予定機体（メーカー、型式、登録記号）
- 予定操縦者（氏名、技能証明区分）
- 計画高度（AGL / MSL）、巡航速度、予定航続時間
- 補助者人数（申告人数）
- 適用許可承認情報（許可番号、有効期間）
- 適用保険情報（保険会社名、商品名、対人対物補償限度）
- DIPS通報ステータス（`DIPS_CONFIRMED`, `MANUAL_SUBMITTED`, `NOT_REQUIRED` 等）およびDIPS計画番号
- 特記事項・備考
- 飛行範囲幾何データ（`FlightAreaGeometry`）

### 4.2 運航完了時（Operational Execution Snapshot）
運航完了時には、上記計画情報に加えて以下の実績情報が同一KMLへ追記されます：
- **飛行前点検（Preflight Inspection）**: 実施日時、点検実施者、判定結果（合格/不合格）、特記不具合
- **個別フライト実績（Flights）**: 各フライトの離陸日時、着陸日時、実飛行時間（分）、使用機体（機体交代対応）、使用バッテリー個体、操縦者、飛行所感・不具合記録
- **飛行後点検（Postflight Inspection）**: 実施日時、点検実施者、判定結果（合格/不合格）、特記不具合、処置内容

> [!IMPORTANT]
> **原本性・台帳権威の分離**:  
> KMLに運航実績や点検結果が含まれていても、KMLはこれらの法的原本・マスター台帳ではありません。正本はローカルDB（IndexedDB）および外部確定台帳（Google Sheets）です。KMLはその時点の可視化用スナップショットに過ぎません。

---

## 5. KMLライフサイクル（1計画1ファイルの更新モデル）

運航の進行に伴い、1つのFlightPlanに対応するKMLは以下のライフサイクルを辿ります。

```text
[FlightPlan 確定 (SUBMISSION_READY / SNAPSHOT_SAVED)]
  │
  ▼
【初回 KML 生成】
  ├─ 計画Geometry (Polygon / Approximated Circle / Buffered Line)
  ├─ 計画属性 (機体・操縦者・目的・空域・高度・許可・保険)
  └─ DIPS通報ステータス
  │
  ▼ (Google Drive の指定フォルダへ保存)
  │
[現場運航セッション (Mission 開始 〜 離着陸 〜 点検 〜 完了)]
  │ (ローカルDBおよびSheets台帳へ運航実績を逐次記録)
  │
[Mission 完了打刻]
  │
  ▼
【最終 KML 再生成（更新）】
  ├─ 計画情報（初回内容を維持）
  ├─ 飛行前点検結果
  ├─ 各フライト実績（離着陸時刻・飛行時間・使用機体・使用BAT）
  └─ 飛行後点検結果
  │
  ▼ (Google Drive 上の同一ファイルを更新 / またはRevision保存)
```

- **原則**: 「1 FlightPlan ＝ 1 KML」のIdentityを維持。
- **履歴管理方針**: KMLの過去版を法定監査原本として多重保持する要件は設けません（監査原本・履歴はDomain / Google Sheets / DipsSubmission Snapshot / ReportSnapshot で厳格に保持されるため）。
- Google Drive上で同名上書きするか、Revision付き別ファイル（`_rev2.kml`）とするかは、実装Phase前にStorage Policyとして決定します（`PENDING-MYMAPS-04`）。

---

## 6. Google Drive連携と自動保存

### 6.1 保存先設定（ExportDestination）
ユーザーがアプリ設定画面から、KMLの保存先となる Google Drive フォルダをあらかじめ指定します。毎回の保存時にフォルダ選択ダイアログを表示させず、現場での片手操作を阻害しません。

```typescript
export interface ExportDestinationConfig {
  provider: 'GOOGLE_DRIVE';
  folder_id: string;               // Google Drive フォルダID
  folder_display_path: string;     // 表示用パス (例: "マイドライブ/ドローン運航記録/飛行計画KML")
  auto_export_on_plan_locked: boolean; // 計画確定時に自動保存するか
  auto_export_on_mission_complete: boolean; // 運航完了時に自動更新するか
  enabled: boolean;
}
```

### 6.2 UI表示イメージ
```text
┌─────────────────────────────────────────────────────────────┐
│ 【KML・外部ストレージ設定】                                 │
│                                                             │
│  保存先ストレージ: Google Drive                             │
│  保存先フォルダ  : マイドライブ/ドローン関係/飛行計画KML    │
│  [ 保存先フォルダを変更 ]                                    │
│                                                             │
│  [✓] 飛行計画確定時にKMLを自動出力・Driveへ保存             │
│  [✓] 現場運航完了時に実績を含む最終KMLへ自動更新            │
│                                                             │
│  ※Google Drive連携にはGoogleアカウントの認証が必要です。   │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 オフライン現場での非同期同期
- 現場が完全圏外の場合でも、KMLファイルデータ自体はブラウザ内で即時生成可能です。
- Google Driveへのアップロードジョブは、既存の [14_offline-and-sync.md](14_offline-and-sync.md) に基づき `SyncQueue`（`target: 'google_drive_kml'`）へ投入されます。
- 電波復帰時にバックグラウンドで自動アップロードされます。Google Driveの通信失敗が現場の運航記録・離着陸打刻を妨げることは絶対にありません。

---

## 7. ファイル名規則（Filename Policy）

Google Drive上で人間が日付順に整列・検索しやすい命名規則を採用します。

### 7.1 推奨形式
```text
YYYY-MM-DD_<LocationName>_<FlightPlanShortId>.kml
```

例：
- `2026-10-20_金岡公園_FP-a1b2c3.kml`
- `2026-11-05_大野海岸_FP-f8e9d0.kml`

### 7.2 例外・エッジケース処理規則
1. **禁止文字のサニタイズ**: 場所名に含まれるファイル名禁止文字（`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`）はアンダースコア `_` へ自動置換。
2. **場所未設定時**: 場所名が空欄の場合は `NoLocation` を補完（例: `2026-10-20_NoLocation_FP-a1b2c3.kml`）。
3. **同名衝突防止**: 内部正本ID（UUID）の先頭短縮ハッシュ（例: `FP-a1b2c3`）を付与することで、同一日付・同一番地での複数計画のファイル名衝突を防止。
4. **複数日計画**: 主日程（開始日）を日付プレフィックスとし、ExtendedData内に全日程を保持。

---

## 8. Google My Maps 連携モデル

### 8.1 基本運用フロー（手動インポート前提）
現時点でGoogle My Mapsには一般公開された完全な地図作成・レイヤー編集REST APIが存在しないため、**「アプリによるMy Maps自動作成・自動レイヤー編集」を必須完成要件としません**。

実用的な基本運用は以下の通りとします：

```text
[drone-flight-ops]
       │
       ▼ (KML自動生成 ＆ Google Drive自動保存)
[Google Drive 指定フォルダ]
       │
       ▼ (利用者がブラウザまたはPCでGoogle My Mapsを開く)
[Google My Maps 操作]
  1. 「新しい地図を作成」をクリック
  2. レイヤーの「インポート」をクリック
  3. Google Driveから該当KML（例: 2026-10-20_金岡公園_FP-a1b2c3.kml）を選択
  4. 飛行範囲・計画属性・運航実績が地図上に自動展開
```

### 8.2 「1 FlightPlan = 1 My Map」推奨の理由
- **計画単位の完全分離**: 運航案件・計画ごとに地図が独立し、現場ごとの関係者共有（リンク共有）が容易。
- **レイヤー制約の回避**: My Mapsの1地図あたりレイヤー上限（通常10レイヤーまで）やフィーチャー数制限に抵触しない。
- **後続ログの追記容易性**: 同一マップに対して、後述の「機体GPS飛行ログ」を別レイヤーとして後から追加インポートしやすい。

---

## 9. 機体GPS実飛行ログとの統合（将来拡張）

将来的に、機体メーカーアプリ（Autel Sky / DJI Fly 等）からエクスポートされた実飛行GPSログ（CSV, GPX, KML）を取得できる場合の統合アーキテクチャを準備します。

```text
┌─────────────────────────────────────────────────────────────┐
│                    Google My Maps 上での統合                │
│                                                             │
│  [レイヤー 1: 計画飛行範囲 (Plan)]                          │
│   - アプリ出力KML: Polygon / Approximated Circle            │
│                                                             │
│  [レイヤー 2: 運航実績サマリー (Record)]                    │
│   - アプリ出力KML: 離着陸地点、点検合否、飛行時間           │
│                                                             │
│  [レイヤー 3: 実飛行GPS軌跡 (Actual Track)]                 │
│   - 機体ログ (CSV/GPX) からインポートした実際の飛行航跡     │
└─────────────────────────────────────────────────────────────┘
```

- **特定機種への依存排除**: 現在の特定機体・アプリで必ずCSV/GPXが取得できるとは断定しません。
- **概念ポート**: `AircraftFlightLogImportPort` を介して未加工の原本ログファイルを保存可能とし、必要に応じて正規化モデル `ActualFlightTrack` へ変換してKML/GeoJSON出力できる拡張境界を確保します。

---

## 10. アーキテクチャ・ポート設計と障害分離

### 10.1 責務分離とポート定義（概念設計）
KML生成およびDrive保存は、Domain層やSheets同期ロジックから完全に独立したポートとして定義します（※TypeScript実装は後続Phaseにて実施）。

```text
┌─────────────────────────────────────────────────────────────┐
│ Domain層 (FlightPlan, Mission, Inspections, Geometry)       │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │ GeoExportPort     │           │ LedgerSyncPort    │
     └─────────┬─────────┘           └─────────┬─────────┘
               │                               │
               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │ KmlExporter       │           │ GoogleSheetsAdapter│
     └─────────┬─────────┘           └───────────────────┘
               │
               ▼
     ┌───────────────────┐
     │CloudFileStoragePort│
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │GoogleDriveAdapter │
     └───────────────────┘
```

### 10.2 二重入力の完全禁止
- KML出力のために専用の入力画面を設けることは禁止します。
- 利用者はアプリの標準運航フロー（計画作成、点検、離着陸打刻）を一度入力するだけであり、同一のDomainデータから `GoogleSheetsAdapter`, `PdfReportGenerator`, `KmlExporter` がそれぞれ必要な射影を行います。

### 10.3 保存障害の完全分離（Fault Isolation）
- **Sheets同期成功 ＋ KML生成/Drive保存失敗**: 正式な運航記録・法定台帳保存は「成功」として扱います。KML保存エラーは非ブロッキングな警告ログとして記録し、再試行キューに留めます。
- **KML保存成功 ＋ Sheets同期失敗**: KMLがDriveに保存されても、台帳同期は `sync_pending` / `sync_failed` として追跡され、電波回復時に再同期されます。
- 各出力系統は独立したステータス（`ledger_sync_status`, `drive_kml_export_status`）を保持します。

---

## 11. プライバシー保護と出力プロファイル（Privacy Projection）

KMLは Google My Maps 等を通じて第三者や社外関係者へ共有される可能性があるため、個人情報・機密情報の出力を制御できるプロファイル構造を設計します。

| 出力プロファイル | 想定用途 | 出力内容 | 除外項目 |
|---|---|---|---|
| **`PRIVATE_FULL`** | 管理者・パイロット本人保管用 | 全計画属性、点検詳細、機材情報、DIPS通報情報 | パスワード、内部Secret、機密認証情報 |
| **`SHARE_SAFE` (既定)** | 発注者・土地所有者・関係者共有用 | 飛行範囲Geometry、日時、高度、機体型式、安全措置、飛行実績サマリー | パイロット個人住所、電話番号、メールアドレス、内部メモ |
| **`MINIMAL_MAP`** | 一般公開・近隣説明用 | 飛行範囲Geometry、飛行予定日、高度上限 | 全個人情報、機体個体番号、点検記録、内部ID |

※初期実装では `SHARE_SAFE` を既定とし、電話番号やメールアドレスをKMLへ無条件出力しない安全設計を徹底します。

---

## 12. My Maps 実機検証待ち事項（PENDING-MYMAPS）

Google My Maps の実際のインポート挙動・視覚化再現性を確認するため、以下の検証待ち事項を記録します。推測で断定せず、後日サンプルKMLを用いた実機検証を経て確定します。

- **`PENDING-MYMAPS-01: ExtendedData の表示挙動`**:
  - KMLの `<ExtendedData>` に格納したカスタム属性（DIPS通報ID、機体型式、高度等）が、My Mapsのテーブル表示（データ表）やクリックポップアップでどのように展開されるか。
- **`PENDING-MYMAPS-02: name / description / ExtendedData の最適マッピング`**:
  - My Mapsで最も一覧性が高く読みやすいバルーン表示を実現するための、タイトル（`<name>`）と本文（`<description>` HTML）の最適なフォーマット。
- **`PENDING-MYMAPS-03: 近似 Polygon / Buffered Line の描画再現性`**:
  - 円から近似生成したPolygonや、線形バッファPolygonが、My Maps上で破綻なく透過色付きで美しくレンダリングされるか。
- **`PENDING-MYMAPS-04: 同一KML再インポート時の更新/重複挙動`**:
  - 運航完了後に更新したKMLを同一マップへ再度インポートした際、既存レイヤーが上書き置換されるか、別レイヤーとして重複追加されるか。
- **`PENDING-MYMAPS-05: 機体ログ（CSV/GPX）重畳の実用性`**:
  - 計画範囲KMLと機体GPSログを同一My Map内に重ねた際の視認性とレイヤー操作性。
- **`PENDING-MYMAPS-06: スマートフォン（モバイルブラウザ/Google Mapsアプリ）での閲覧性`**:
  - インポート済みMy Mapが、現場のスマートフォン（iPhone Google Mapsアプリ / Android Google Mapsアプリ）からストレスなく確認できるか。

---

## 13. Phase C 実装への影響とロードマップ

### 13.1 Phase C1（ローカルDB・型定義）への影響
- **影響範囲は最小限**: C1でKML Export機能やDrive通信を実装してはなりません。
- **C1で担保すべき基礎**:
  - `FlightAreaGeometry` の中立Domainモデル（円・ポリゴン・線形バッファ）を維持すること。
  - `FlightPlan` のID体系（安定したUUID v4）を維持すること。
  - KML専用の表示用HTML文字列やDriveメタデータをDomain正本テーブルへ無秩序に追加しないこと。

### 13.2 ロードマップ配置
- KML生成エンジン（`KmlExporter`）および Google Drive自動保存は、**Phase C8（帳票・外部エクスポート）または Phase C5.x（地図・Geo Export拡張）**にて段階的に実装します。
- 既存のPhase C1（Schema基礎）、C2（現行運航再現）、C4（Sheets台帳同期）の完了を阻害せず、後続の独立モジュールとして組み込みます。
