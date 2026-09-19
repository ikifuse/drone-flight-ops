# ADR-0023: FlightPlan・FlightAreaGeometry・不変submission_snapshotを共通の源とし、通報経路と出力を派生させる

- **作成日**: 2026-09-19
- **ステータス**: Proposed（未承認）。現在ベースラインの判断記録であり、ADR自体は未承認
- **関係性**: [ADR-0004](ADR-0004-dips-adapter-architecture.md)のAdapter分離、[ADR-0006](ADR-0006-dips-optional-and-manual-submission-ledger.md)のAPI非依存と提出Snapshot、[ADR-0009](ADR-0009-map-renderer-selection-deferred-to-c5.md)のGeometryの描画ライブラリ非依存をClarifiesし、飛行範囲を用途別に作らない判断とDIPS対象外との境界を加える。既存ADR本文やAccepted履歴は変更しない
- **決定者**: 99.2 §7の現在到達点を、オーナーのStep 7a指示に基づきClaudeが記録
- **詳細正本**: [25e](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md)。実画面の証拠系列は[26](../architecture/26_dips-web-ui-verification.md)、移管と確認範囲は[Step 7a監査](../migration/99-2-step-7a-causal-audit.md)

## 1. 背景と課題（Context）

DIPS通報には、機体・操縦者・目的・空域・方法に加えて、地図上の飛行範囲が要る。2026-09-14のDIPS Web実画面の確認記録は円・多角形・線＋幅の作図を示し、API側は`flyRoute`としてPolygon／Circleを受ける整理がある一方、線＋幅のAPI表現は未確認である。同じ範囲は、DIPSのManual支援、将来のAPI、KML、アプリ内表示のすべてで使う。用途ごとに範囲や計画を作り直すと、利用者に同じ範囲の再入力を強い、APIの有無で設計が分かれる。

## 2. 検討した選択肢（Options Considered）

- A. DIPS Web用とAPI用に別々の飛行計画を作る。
- B. 飛行範囲・経路をDIPS用・KML用・アプリ用に別々に作る。
- C. DIPS APIの形式をアプリの内部モデルにする（ADR-0004の選択肢Bとして既に却下）。
- D. 共通の源を持ち、Manual支援・API電文・派生出力を共通の源から作る。

## 3. 決定内容（Decision）

Dを現在ベースライン（CURRENT-ACCEPTED）として25eに記録する。

- FlightPlanと`FlightAreaGeometry`を共通の源とし、Manual支援・API電文・KML等は派生とする。
- 確定時点の意味論的内容を、APIの有無にかかわらず不変な`submission_snapshot`として保持する。API電文は`api_payload_snapshot`として別に保持し、利用者へ表示・編集・保存・出力させない。
- DIPS対象外の飛行でも内部の運航記録・日常点検は残せる。DIPS対象の飛行だけ通報証跡を追加する。通報要否の判定は13cが正本で、本ADRは再定義しない。

## 4. 採用理由と他案の却下理由（Rationale）

AとBは、99.2 §7が別々に作らないと明示した案で、用途ごとに同じ範囲を再入力させたくないため採らない。Aは、APIの有無で計画や現場運航の設計を作り直さないというADR-0006の決定にも反する。CはADR-0004で既に却下している。

## 5. メリット（Pros）

- 経路や出力を追加しても、飛行範囲の入力元は増えない。
- API未承認でも同じ設計で完結し、承認後は最後の送信経路だけを足せる。
- 提出当時の内容を後から再現でき、共通の源を後日編集しても過去の提出内容へ波及しない。

## 6. デメリット・トレードオフ（Cons / Trade-offs）

- 共通の源は、全経路が全形状を同じ形で表現できることを保証しない。`BUFFERED_LINE`はAPI表現が未確認で、API送信ではMANUAL_ONLYとして扱う。
- Snapshotへ提出内容を値として保持するため保持量が増える。セル容量を超える場合の物理保持はPENDING-LEDGER-SNAPSHOTである。
- 派生出力（KML等）の生成契機・内容・単位は本ADRで決めない。
- 「DIPS対象外／対象」が通報義務の有無か実際の通報かの定義は未確定（PENDING-S7A-NON-DIPS-SCOPE）。

## 7. 将来この決定を見直す条件（Re-evaluation Triggers）

- DIPS Webの保存済み飛行経路の再利用導線や内部形式が確認され、共通の源を介さない運用が有利になった場合（PENDING-WEB-06・07）。
- APIが線＋幅を受け付ける、または`flyRoute`の表現が確定してDomainの形状定義に影響する場合（PENDING-WEB-05、VERIFY-S7A-FLYROUTE-CONTRACT）。
- 手動とAPIで必要な提出内容が実際に異なると確認された場合。
- 通報要否の判定や対象外の運用が変わった場合。

本ADRは実装開始やAPI利用申請・DIPS操作の許可ではない。
