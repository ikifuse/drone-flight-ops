# 27c. Google My Maps運用・検証

最終更新: 2026-09-15\
状態: 設計確定（Phase C1 未着手。個別 `PENDING` は未決）\
主要責務: 利用者によるKMLインポート、表示確認、外部サービス固有の未決事項\
入口: [出力設計目次](README.md)

---

## 1. Google My Maps 連携モデル

### 1.1 基本運用フロー（手動インポート前提）

今回確認した公式資料の範囲では、採用可能なMy Maps地図作成・レイヤー編集REST APIの根拠は未確認です。そのため、**「アプリによるMy Maps自動作成・自動レイヤー編集」を必須完成要件としません**。

実用的な基本運用は以下の通りとします：

```text
[drone-flight-ops]
       │
       ▼ (KML自動生成 ＆ Google Drive自動保存)
[Google Drive 指定フォルダ]
       │
       ▼ (利用者がPC等の対応環境でGoogle My Mapsを開く)
[Google My Maps 操作]
  1. 「新しい地図を作成」をクリック
  2. レイヤーの「インポート」をクリック
  3. Google Driveから該当KML（例: 2026-10-20_サンプル公園_FP-a1b2c3.kml）を選択
  4. 飛行範囲・計画属性・運航実績の表示を確認（再現性は検証待ち）
```

### 1.2 「1 FlightPlan = 1 My Map」推奨の理由

- **計画単位の完全分離**: 運航案件・計画ごとに地図が独立し、現場ごとの関係者共有（リンク共有）が容易。
- **レイヤー制約の回避**: 計画単位で地図を分けることでレイヤーやフィーチャーの集中を抑えます。ただし1地図最大10レイヤー等の上限を自動的に満たす保証ではなく、生成物単位の容量・点数検証が必要です。
- **後続ログの追記容易性**: 同一マップに対して、後述の「機体GPS飛行ログ」を別レイヤーとして後から追加インポートしやすい。

---

## 2. 公式仕様の確認範囲と実機未検証の境界

2026-09-15に確認した公式情報を `OFFICIAL_SPEC` として区別します。このリポジトリのサンプルKMLで実機検証した `OBSERVED` ではありません。

- KML、KMZ、GPX、CSV等のインポートに対応します。KML/KMZは解凍後5 MBまで、2,000行を超えるファイルはインポートしないよう案内されています。FolderやHTMLを含む吹き出し等は全データが取り込まれない場合があります。[Google公式インポートヘルプ](https://support.google.com/mymaps/answer/3024836?hl=en&co=GENIE.Platform%3DDesktop)
- 1地図のレイヤーは最大10です。[Google公式レイヤーヘルプ](https://support.google.com/mymaps/answer/3024933?hl=en&co=GENIE.Platform%3DDesktop)
- 作成済みMy MapsのGoogle Mapsアプリでの閲覧は案内されています。対象KMLの属性再現性・iPhone/Androidでの現場操作性は第3節の `PENDING` を維持します。[iPhone/iPad公式ヘルプ](https://support.google.com/maps/answer/3045850?hl=en&co=GENIE.Platform%3DiOS)、[Android公式ヘルプ](https://support.google.com/maps/answer/3045850?hl=en&co=GENIE.Platform%3DAndroid)
- My MapsのWeb利用はオンラインを要します。アプリ本体のオフライン記録・KML生成とは別条件です。[Google公式モバイル利用案内](https://support.google.com/mymaps/answer/10656656?hl=en)
- My MapsのデータをKML/KMZとして取り出すData Portability仕様は存在しますが、地図作成・レイヤー編集APIの採用根拠ではありません。自動編集APIの不存在は断定しません。[Google公式My Maps Export Schema](https://developers.google.com/data-portability/schema-reference/mymaps)

My Mapsのインポートや再表示を現場の記録完了条件にせず、アプリ内の地図・記録・Sheets台帳・PDFで運用を継続します。公式ヘルプの再インポート説明にはSheets/CSV対象の記述があるため、KML更新時の上書き・重複挙動を確認済みとして扱いません。

---

## 3. My Maps 実機検証待ち事項（PENDING-MYMAPS）

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
