# ADR-0018: DIPS APIを専有固定IP経路と限定バックエンドへ移す

- **作成日**: 2026-09-18
- **ステータス**: 提案中（Proposed）。現在設計ベースラインの変更記録であり、ADR承認済みではない
- **関係性**: Partially Supersedesとして[ADR-0001 §3](ADR-0001-architecture-selection.md)のDIPS API用Workers境界と、[ADR-0004 §2・§3項3](ADR-0004-dips-adapter-architecture.md)のWorkers中継指定の置換を記録する。秘密情報隔離・Adapter分離・API Optional・二重通報防止は維持。旧ADRの本文・承認履歴は変更せず、本Proposed ADRが正式承認済みで上書きしたとは扱わない
- **決定者**: 99.2の現在到達点をオーナーのStep 4指示に基づきCodexが記録。ADR自体は未承認
- **関連要件**: [統合要件](../03_integrated-requirements.md)、99.2 §7の固定IP／API基盤／通信境界。詳細正本は[dips-infrastructure](../architecture/dips-infrastructure/README.md)と[16](../architecture/16_security.md)

## 1. 背景と課題（Context）

当初は運用費・保守負担を抑え、秘密をPWAから隔離してDIPS依存を閉じ込めるためWorkers中継を選んだ。99.2は、その後の航空局照会で専有固定IPと利用中の非再割当・停止／再作成時の維持が必要と確認し、接続経路を変更した経緯を記録している。詳細因果と証拠の限界は[33a §1・§2](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)。

## 2. 検討した選択肢（Options Considered）

- 旧GAS／Workers前提の接続経路をそのまま使う。
- Google Cloud上のDIPS連携バックエンドとCloud NATによる専有固定送信元IP経路へ移す。
- 移行に合わせ全運航データを中央DBへ集約する。

## 3. 決定内容（Decision）

99.2に記録された現在ベースラインとしてGoogle Cloud＋Cloud NAT＋登録する専有固定送信元IPの経路を採る。バックエンドはAPI秘密情報とDIPS通信の限定責務とする。通信経路の詳細は33aに一本化する。実行コンピュート・VPC接続方法はPENDING、正式認証契約・設定通知はVERIFYとし、Cloud Run等を自動選定しない。

## 4. 採用理由と他案の却下理由（Rationale）

旧経路は秘密を隔離する設計だけでは固定IPの条件を満たせず、99.2は最終訂正版申請の接続経路を変更した。中央運航DBへの集約は固定IP通信の目的を越えるため採らない。ブラウザへ秘密を渡さない理由、旧Cookie等の候補と正式契約の区別は16に保持する。CORS未確認を今回の変更理由に追加しない。

ManualはAPI未承認・障害時にも独立する。通常保存とDIPS POSTを同じretryにせず、結果不明なら未登録の確認前に再POSTしない。因果と適用条件は[33b](../architecture/dips-infrastructure/33b_api-availability-and-retry-boundaries.md)を正本とする。

## 5. メリット（Pros）

航空局確認で具体化した接続条件と秘密情報保護を同じ経路で追跡できる。現場記録・台帳・Manualをネットワーク基盤へ従属させず、API電文変換とも責任を分けられる。

## 6. デメリット・トレードオフ（Cons / Trade-offs）

固定IPの維持・構成・障害復旧・費用・監視の具体化が必要となる。旧無料枠の評価をGoogle Cloudの費用保証へ流用できない。申請送付だけではAPI利用承認・設定通知・接続試験の完了にならない。

## 7. 将来この決定を見直す条件（Re-evaluation Triggers）

正式回答・設定通知・接続仕様や固定IP条件が変わる、実構成が条件を満たさない、運用上の前提が変わる場合に、33a／16の証拠と因果を保って見直す。PWA、人物・機材、Drive正本、ローカル保存、API payload詳細を本ADRで変更しない。ADR-0015〜0017と実装開始ゲートを維持する。
