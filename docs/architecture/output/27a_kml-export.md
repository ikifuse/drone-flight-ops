# 27a. KML生成・変換・出力プロファイル

最終更新: 2026-09-15\
状態: 設計確定（Phase C1 未着手。個別 `PENDING` は未決）\
主要責務: DomainからのKML射影、ファイル単位・命名・プライバシー\
入口: [出力設計目次](README.md)

---

## 1. 1 FlightPlan = 1 KML 原則とファイル構造

### 1.1 単位原則

- **基本単位**: **1 FlightPlan = 1 KML ファイル**
- KMLのIdentityはFlightPlan単位です。1計画に複数の通報リビジョンが存在し得るため、「1通報リビジョン＝1計画」とは扱いません。過去の通報証跡はDipsSubmissionで保持します。
- DIPS通報が不要な非特定飛行でも、アプリ内で `FlightPlan` を作成した場合は、通報有無に関わらず「1 FlightPlan」をKML生成の基本単位とします。[計画なしのMission](../domain-model/12e_operation-inspection-maintenance.md)も引き続き許容し、KMLのために計画作成を強制しません。

### 1.2 1ファイルへの統合構造

1つのKMLファイル内部に、計画情報・飛行範囲・現場点検・フライト実績を複数の `Folder`, `Placemark`, `ExtendedData` として階層的に構造化します。

```text
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>2026-10-20_サンプル公園_FP-a1b2c3</name>
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

※このXMLは生成物の構造例です。My Mapsで全属性・Folder階層がそのまま表示される保証ではありません。表示・テーブル列化は [27cのPENDING-MYMAPS-01](27c_google-mymaps-workflow.md#3-my-maps-実機検証待ち事項pending-mymaps) を参照します。

---

## 2. FlightAreaGeometry から KML への変換仕様

アプリ内部の中立Domainモデル `FlightAreaGeometry`（[17_map-and-airspace.md](../17_map-and-airspace.md)）を正本とし、`KmlExporter` がKML形式へ射影変換します。KML自体をDomain Modelに固定してはなりません。

### 2.1 幾何形状別の変換ルール

1. **`POLYGON`**:
   - `polygon_points[]`（WGS84 緯度・経度配列）をそのまま KML `<Polygon><outerBoundaryIs><LinearRing><coordinates>` へ変換。
   - 始点と終点を一致させてリングを閉じる。
2. **`CIRCLE`**:
   - KML標準にはネイティブなCircle幾何タグが存在しないため、中心点（`center`）と半径（`radius_meters`）から、測地線計算により一定刻み（例: 36分割/10度刻み、または72分割/5度刻み）の円周座標列を生成し、**近似 Polygon** として出力する。
   - 元の `center` および `radius_meters` は Domain 側に保持し、KMLの `<ExtendedData>` にも属性値として明記する。
3. **`BUFFERED_LINE`**:
   - Domain上は `path_points[]`（中心線）と `buffer_radius_meters`（中心線から片側境界までの距離。全幅は2倍）を保持。
   - KML出力時は、用途に応じて以下のいずれかまたは両方を生成：
     - 中心線としての `<LineString>`
     - 中心線の左右それぞれに `buffer_radius_meters` の距離を持たせた**帯状 Polygon**
   - ※計算アルゴリズムおよび分割精度は実装Phaseで決定。

---

## 3. KML射影の入力候補となる計画情報と運航実績

以下はDomainから参照できる属性カタログです。全項目を無条件出力する指示ではありません。実際のXML・name・description・ExtendedData・ファイル名は第6節のプロファイルにより選別し、既定の `SHARE_SAFE` を適用します。

### 3.1 計画確定時（Plan Snapshot）

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

### 3.2 運航完了時（Operational Execution Snapshot）

運航完了時には、上記計画情報に加えて以下の実績情報が同一KMLへ追記されます：
- **飛行前点検（Preflight Inspection）**: 実施日時、点検実施者、判定結果（合格/不合格）、特記不具合
- **個別フライト実績（Flights）**: 各フライトの離陸日時、着陸日時、実飛行時間（分）、使用機体（機体交代対応）、使用バッテリー個体、操縦者、飛行所感・不具合記録
- **飛行後点検（Postflight Inspection）**: 実施日時、点検実施者、判定結果（合格/不合格）、特記不具合、処置内容

> [!IMPORTANT]
> **原本性・台帳権威の分離**:\
> KMLに運航実績や点検結果が含まれていても、KMLはこれらの法的原本・マスター台帳ではありません。正本はローカルDB（IndexedDB）および外部確定台帳（Google Sheets）です。KMLはその時点の可視化用スナップショットに過ぎません。

---

## 4. KMLライフサイクル（1計画1ファイルの更新モデル）

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
- Drive上の更新・Revision方針は [27b Drive Storage](27b_google-drive-storage.md) を参照します。My Mapsへの再インポート挙動は [PENDING-MYMAPS-04](27c_google-mymaps-workflow.md#3-my-maps-実機検証待ち事項pending-mymaps) です。

---

## 5. ファイル名規則（Filename Policy）

Google Drive上で人間が日付順に整列・検索しやすい命名規則を採用します。

### 5.1 推奨形式

```text
YYYY-MM-DD_<LocationName>_<FlightPlanShortId>.kml
```

例：
- `2026-10-20_サンプル公園_FP-a1b2c3.kml`
- `2026-11-05_サンプル海岸_FP-f8e9d0.kml`

### 5.2 例外・エッジケース処理規則

1. **禁止文字のサニタイズ**: 場所名に含まれるファイル名禁止文字（`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`）はアンダースコア `_` へ自動置換。
2. **場所未設定時**: 場所名が空欄の場合は `NoLocation` を補完（例: `2026-10-20_NoLocation_FP-a1b2c3.kml`）。
3. **同名衝突防止**: 内部正本ID（UUID）の先頭短縮ハッシュ（例: `FP-a1b2c3`）を付与することで、同一日付・同一場所での複数計画を区別。短縮IDの衝突時は桁数拡張等で一意化し、UUID正本自体を短縮IDへ置き換えない。
4. **複数日計画**: 主日程（開始日）を日付プレフィックスとし、ExtendedData内に全日程を保持。

---

## 6. プライバシー保護と出力プロファイル（Privacy Projection）

KMLは Google My Maps 等を通じて第三者や社外関係者へ共有される可能性があるため、個人情報・機密情報の出力を制御できるプロファイル構造を設計します。

| 出力プロファイル | 想定用途 | 出力内容 | 除外項目 |
|---|---|---|---|
| **`PRIVATE_FULL`** | 管理者・パイロット本人保管用 | 全計画属性、点検詳細、機材情報、DIPS通報情報 | パスワード、内部Secret、機密認証情報 |
| **`SHARE_SAFE` (既定)** | 発注者・土地所有者・関係者共有用 | 飛行範囲Geometry、日時、高度、機体型式、安全措置、飛行実績サマリー | パイロット個人住所、電話番号、メールアドレス、内部メモ |
| **`MINIMAL_MAP`** | 一般公開・近隣説明用 | 飛行範囲Geometry、飛行予定日、高度上限 | 全個人情報、機体個体番号、点検記録、内部ID |

※初期実装では `SHARE_SAFE` を既定とし、電話番号やメールアドレスをKMLへ無条件出力しない安全設計を徹底します。

---

### 6.1 プロファイル適用範囲

- `SHARE_SAFE` の出力内容欄を許可対象とし、元のカタログにある氏名、連絡先、機体登録記号、DIPS計画番号、保険・許可の詳細、内部メモを無条件で流出させません。
- `MINIMAL_MAP` はファイル名を含む全出力から内部ID・機体個体番号・個人情報を除外します。第5節の通常ファイル名はプロファイルによる除外より優先しません。
- 共有前に対象プロファイルと出力内容を確認できるようにし、`PRIVATE_FULL` への変更を暗黙に行いません。認証情報はどのプロファイルにも含めません。全般の秘密情報境界は [16 Security](../16_security.md) が正本です。
