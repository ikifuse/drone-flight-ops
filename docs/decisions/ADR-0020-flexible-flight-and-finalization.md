# ADR-0020: 柔軟な1飛行と運航全体の最終確定を保持する

- **作成日**: 2026-09-18
- **ステータス**: Proposed（未承認）
- **関係性**: Clarifies ADR-0002の端末一次権威と確定台帳、ADR-0005の現場状態分離。両Accepted本文は変更しない。
- **決定者**: オーナーの99.2 §5とStep 6指示を基に記録。ADR承認は別。
- **関連要件・詳細正本**: [35a](../architecture/operation-recording/35a_flexible-flight-and-details.md)／[35b](../architecture/operation-recording/35b_normal-operation-and-final-save.md)／[35d](../architecture/operation-recording/35d_operation-finalization-and-write-boundary.md)

## 1. 背景と課題（Context）

旧GASの途中着陸・BAT交換を含む運用に対し、旧DomainのFlightは離陸〜着陸単位だった。画面や旧型名を優先すると、一続きの運用と個々の事実を両立できず、最終保存で完成していた記録も分断される。

## 2. 検討した選択肢（Options Considered）

- 毎回の離着陸を意味上も別Flightとする旧候補。
- 作業全体を無条件に1Flightへ集約し、内部明細を省く案。
- 条件を満たす柔軟な1飛行と内部明細を分け、途中保護と最後の確定を両立する現在到達点。

## 3. 決定内容（Decision）

99.2で到達した意味をCURRENT-ACCEPTEDとして35aへ、通常操作を35bへ、最終保存の更新責任と重複防止を35dへ保持する。新Flightへの交代接続はCURRENT-PROPOSAL、Mission／Flight／FlightLeg／AircraftSwitchの最終schemaはPENDINGを維持する。具体的な保存計画方式を本ADRで追加採用しない。

## 4. 採用理由と他案の却下理由（Rationale）

同一機体・エリア・目的の連続性を残しながら離着陸・BAT使用の事実を消さず、飛行後の転記負荷を増やさないため。無条件集約も旧表の自動復活も、この境界を表せない。詳細因果・旧コード確認範囲は上記正本に一元化する。

## 5. メリット（Pros）

操作、明細、帳票、履歴・累計の責任を分けて追跡でき、印刷枠をDomainの上限にしない。

## 6. デメリット・トレードオフ（Cons / Trade-offs）

集約と明細、機体交代、複数保存先の完了証明の契約を依存実装前に詰める必要がある。行UPSERTだけで全体の冪等性を実現したとはいえない。

## 7. 将来この決定を見直す条件（Re-evaluation Triggers）

集約条件・実運用・保存媒体が変わる場合は35a／35dの因果と実物を再確認する。ProposedをAcceptedと同一視せず、逆に未承認を理由に意味の現在到達点を未決へ戻さない。
