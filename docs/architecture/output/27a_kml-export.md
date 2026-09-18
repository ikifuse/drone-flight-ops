# 27a. KML生成・変換・出力プロファイル

最終更新: 2026-09-18\
状態: 設計確定（Phase C1 未着手。個別 `PENDING` は未決）\
主要責務: DomainからのKML射影、ファイル単位・命名・プライバシー\
入口: [出力設計目次](README.md)

---

## 1. 1 FlightPlan = 1 KML 原則とファイル構造

### 1.1 単位原則

- **基本単位**: **1 DIPS FlightPlan（または確定 `submission_snapshot`） = 1 KML ファイル**
- KMLのIdentityはFlightPlan単位です。1計画に複数の通報リビジョンが存在し得るため、「1通報リビジョン＝1計画」とは扱いません。過去の通報証跡はDipsSubmissionで保持します。
- **運航記録上の「柔軟な1飛行」との区別**:
  - Step 6で策定した現場運航日誌における「柔軟な1飛行（Flight）」と「DIPS FlightPlan」は別概念です。同義化したり混同してはなりません。
- DIPS通報が不要な非特定飛行でも、アプリ内で `FlightPlan` を作成した場合は、通報有無に関わらず「1 FlightPlan」をKML生成の基本単位とします。[計画なしのMission](../domain-model/12e_operation-inspection-maintenance.md)も引き続き許容し、KMLのために計画作成を強制しません。

### 1.2 1ファイルへの統合構造

1つのKMLファイル内部に、計画情報・飛行範囲を複数の `Folder`, `Placemark`, `ExtendedData` として階層的に構造化します（事後の運航実績や点検記録は含めません）。

```text
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>2026-10-20_サンプル公園_FP-a1b2c3</name>
    <description>drone-flight-ops Flight Plan</description>

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
        </ExtendedData>
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

## 3. KML射影の入力データ（DIPS通報内容基準・CURRENT-ACCEPTED）

KMLへ運航全データを詰めません。入力内容は「その飛行計画についてDIPSへ通報した確定内容（`submission_snapshot`）＋ その通報対象の共通Geometry（`FlightAreaGeometry`）」とし、KML独自の属性を再選定する設計を排除します。

### 3.1 含まれる計画属性（Plan Snapshot）
- 計画名称、飛行予定日時、飛行場所情報
- 飛行目的（DIPS公式目的）、飛行空域、飛行方法
- 予定機体、予定操縦者、計画高度、巡航速度、予定航続時間
- 補助者人数、適用許可承認情報、適用保険情報
- 飛行範囲幾何データ（`FlightAreaGeometry`）

### 3.2 含まれない事後データ（排除境界）
- **日常点検結果**: 飛行前点検・飛行後点検の結果や不具合処置はKMLへ入れない。
- **実飛行・バッテリー実績**: 各離着陸時刻、実飛行時間、バッテリー個体使用履歴はKMLへ入れない。
- **点検整備記録**: 機体の生涯点検整備台帳はKMLへ入れない。
- **行政側受付証跡**: DIPS送信後に得る受付結果・受付番号等は「通報した内容」ではないためKMLには含めず、`06_DIPS関連` へ別保持する。
- ※運航完了時に事後実績をKMLへ追記する旧案（旧3.2節）は、ADR-0013により正式に却下・除外（`HISTORICAL`）。

---

## 4. KMLライフサイクル（通報時確定生成モデル・ADR-0013準拠）

KMLは運航終了時ではなく、飛行計画を確定してDIPSへ通報する段階で確定生成します。

```text
[FlightPlan 確定・DIPS通報実施 (SUBMISSION_CONFIRMED / API_CONFIRMED)]
  │
  ▼
【KML 確定生成】
  ├─ 計画Geometry (Polygon / Approximated Circle / Buffered Line)
  └─ 計画属性 (機体・操縦者・目的・空域・高度・安全措置・許可・保険)
  │
  ▼ (Google Drive 07_出力_PDF・KML/KML/ [※サブ階層はCURRENT-PROPOSAL] へ保存試行)
  ├─ [成功]: 保存完了（同一計画の再生成・重複保存は行わない）
  └─ [失敗]: 未同期KMLとして端末保持（CURRENT-PROPOSAL / PENDING）
```

- **原則**: 「1 DIPS FlightPlan（または確定 `submission_snapshot`） ＝ 1 KML」のIdentityを維持。
- **保存先フォルダー階層**:
  - `07_出力_PDF・KML/KML/` の出力領域配置は確定（`CURRENT-ACCEPTED`）。
  - その配下の詳細サブフォルダー階層（例: `操縦者/年度/` 等）は構成確認用の例示（`CURRENT-PROPOSAL`）であり、最終的な詳細階層やファイル命名規則は実装Phaseの検討課題（`PENDING`）とします。
- **KML障害時のDIPS再通報・飛行リスト阻害の禁止**:
  - KMLの生成・Drive保存が失敗しても、DIPS通報状態をアプリ上で巻き戻さず、KML生成・保存失敗だけを理由にDIPSを再通報しません。
  - KML生成・保存失敗だけを理由に共有飛行リストへの登録を阻害しません。
- **未同期KMLの再送ライフサイクル（CURRENT-PROPOSAL / PENDING）**:
  - 通報時に保存失敗したKMLは端末側に未同期として保持され、通信復帰時の自動再送、または飛行後点検完了後の「操縦者の最後の確定送信」において、A4運航記録やBAT履歴等と同時にDrive保存を再試行する経路を検討候補（`CURRENT-PROPOSAL`）とします。
  - ※物理的なSyncQueue構造、端末内キャッシュ方式、および厳密な再送トリガーは、Step 8 / Phase C1の設計課題（`PENDING`）として留保します。
- Drive上の更新・Revision方針は [27b Drive Storage](27b_google-drive-storage.md) を参照します。My Mapsへのインポート挙動は [PENDING-MYMAPS-04](27c_google-mymaps-workflow.md#3-my-maps-実機検証待ち事項pending-mymaps) です。

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
