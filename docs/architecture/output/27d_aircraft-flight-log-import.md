# 27d. 機体GPS実飛行ログ取込の拡張境界

最終更新: 2026-09-19\
状態: 設計整合（Phase C1 未着手）。レイヤー2の運航実績サマリーKMLは旧構想でHISTORICAL（現在のKMLは運航後情報を含めない。[27e](27e_kml-generation-timing-and-content.md)）。個別 `PENDING` は未決\
主要責務: メーカー由来原本ログとActualFlightTrackへの変換・重畳（将来）\
入口: [出力設計目次](README.md)

---

## 1. 機体GPS実飛行ログとの統合（将来拡張）

将来的に、機体メーカーアプリ（Autel Sky / DJI Fly 等）からエクスポートされた実飛行GPSログ（CSV, GPX, KML）を取得できる場合の統合アーキテクチャを準備します。

```text
┌─────────────────────────────────────────────────────────────┐
│                    Google My Maps 上での統合                │
│                                                             │
│  [レイヤー 1: 計画飛行範囲 (Plan)]                          │
│   - アプリ出力KML: Polygon / Circle / Buffered Line        │
│                                                             │
│  [レイヤー 2: 運航実績サマリー（旧構想・採らない）]         │
│   - 旧: アプリ出力KML（現在は運航後情報を含めない）         │
│                                                             │
│  [レイヤー 3: 実飛行GPS軌跡 (Actual Track)]                 │
│   - 機体ログ (CSV/GPX) からインポートした実際の飛行航跡     │
└─────────────────────────────────────────────────────────────┘
```

- **旧構想の扱い（HISTORICAL）**: レイヤー2のアプリ出力KMLは、運航後の情報を含めない現在のKML（[27e §5](27e_kml-generation-timing-and-content.md#5-内容の確定境界)）と両立しないため採らない。運航実績を地図で見る方法は、実軌跡の重畳を含めて将来拡張であり未確定。
- **特定機種への依存排除**: 現在の特定機体・アプリで必ずCSV/GPXが取得できるとは断定しません。
- **概念ポート**: `AircraftFlightLogImportPort` を介して未加工の原本ログファイルを保存可能とし、必要に応じて正規化モデル `ActualFlightTrack` へ変換する拡張境界を確保します。ユーザー向け地図出力はKMLとし、GeoJSONは地図Adapter等の内部交換形式として扱います。旧構想のKML/GeoJSONへの射影可能性は保持しますが、ユーザー向けGeoJSON出力は今回の実装要件に追加しません。

---

## 2. 計画・運航打刻・GPS実軌跡の独立

メーカー原本ログを取得できること、GPS時刻・座標・高度の意味が検証できることを取込の前提とします。特定機種の形式・出力可否は `PENDING` とし、計画Geometryや離着陸打刻だけから実飛行GPS軌跡を作成したと扱いません。原本ログ保管と正規化変換を分離し、メーカー固有仕様は `AircraftFlightLogImportPort` 配下に局所化します。

計画範囲の一般仕様は [17 Geometry](../17_map-and-airspace.md)、KMLへの射影は [27a](27a_kml-export.md)、My Mapsでの重畳検証は [27c PENDING-MYMAPS-05](27c_google-mymaps-workflow.md) を参照します。将来拡張であり、C1の機能範囲に取込処理を追加しません。
