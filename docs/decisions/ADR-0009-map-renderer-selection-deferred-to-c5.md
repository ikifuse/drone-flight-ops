# ADR-0009: 地図描画ライブラリの選定をPhase C5実機評価へ留保

- **作成日**: 2026-09-15
- **ステータス**: **承認済み（Accepted）**
- **決定者**: オーナー（2026-09-15のPhase C1前docs構造再編依頼における明示方針）
- **関連設計**: [17 地図・空域](../architecture/17_map-and-airspace.md)、[23 実装ロードマップ](../architecture/23_implementation-roadmap.md)
- **Partially Supersedes**: [ADR-0001](ADR-0001-architecture-selection.md) §3の **地図描画ライブラリをMapLibre GL JSに固定する部分のみ**。
- **置換しない部分**: PWA・Workers・IndexedDB・Sheetsの構成、国土地理院等の地図ソースの利用条件確認、地図Adapter境界、中立Geometry。

## 1. 背景と課題（Context）

ADR-0001にはMapLibre GL JSを使う記述が残っています。一方、現在の設計方針と2026-09-15のオーナー依頼は、Leaflet / MapLibre GL JS等をPhase C5開始時にiPhone・Android実機で比較し、必要ならADRで決定するものです。Accepted文書の固定記述を黙って書き換えず、選定時点を変更する範囲を記録します。

## 2. 検討した選択肢（Options Considered）

- **A: MapLibre GL JSの固定を維持する**。
- **B: 今回のdocs再編で別ライブラリへ決定する**。
- **C: ライブラリの決定をC5開始時の実機評価へ留保する**。

## 3. 決定内容（Decision）

選択肢Cを採用します。Leaflet / MapLibre GL JS等を候補とし、Phase C5開始時にiPhoneとAndroidで地図表示、タッチ操作、Geometry編集、オフライン条件、性能・メモリ、利用条件と保守性を検証します。その根拠に基づき必要なADRを作成して採用を決定します。今回の再編では特定ライブラリを選定しません。

`FlightAreaGeometry` の `POLYGON` / `CIRCLE` / `BUFFERED_LINE` とDomain上の座標・高度は描画ライブラリに依存させません。地図ライブラリや内部GeoJSONへの変換はAdapter境界に置きます。C1のスキーマ定義を特定地図エンジンの型で固定しません。

## 4. 採用理由と他案の却下理由（Rationale）

スマートフォン両対応での現場操作を評価してから選ぶことがオーナー指定の方針です。Aはこの方針と矛盾し、Bはdocs-only再編の範囲と検証根拠を超えます。Cにより現在の未選定状態と後続の判断時点を明確にできます。

## 5. メリット（Pros）

機体・運航・台帳の設計を地図エンジンに結合させず、実機で確認した使い勝手と運用条件を選定根拠にできます。

## 6. デメリット・トレードオフ（Cons / Trade-offs）

地図実装に入る前に比較検証と選定が必要です。候補名の例示は採用決定や同等性能の保証を意味しません。

## 7. 将来この決定を見直す条件（Re-evaluation Triggers）

Phase C5開始時の実機検証・ライブラリ選定時に、採用内容と却下理由を新ADRへ記録します。Phase C1以降のコード実装開始は本ADRで許可しません。
