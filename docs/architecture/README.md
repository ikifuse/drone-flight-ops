# アーキテクチャ検討（Phase B1 目次・概要）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B1（技術構成の比較・検討と推奨アーキテクチャの提示）

---

## 1. Phase B1の目的と位置づけ

本ディレクトリは、新アプリ `drone-flight-ops`（現場でスマートフォン1台から準備〜DIPS通報〜飛行〜バッテリー交換〜日誌〜帳票出力までを一気通貫で行う総合運航管理アプリ）を実現するために、**「どの技術構成で作るのが最も適切か」をゼロベースで比較・検討した結果**をまとめた設計検討資料群です。

### B1で決めること
- 推奨するアプリ実行方式（PWA、クロスプラットフォーム、Capacitor、ネイティブ等）
- 推奨するフロントエンドの方向性
- 推奨するバックエンド・秘密情報管理の方向性（DIPS連携境界）
- 推奨するデータ保存方式（原本性、ローカルDB、スプレッドシート連携）
- 個人利用を前提とした費用・運用の実現性評価

### B1ではまだ決めないこと（B2以降へ持ち越す事項）
- 詳細なDBテーブル定義・スキーマ
- 詳細なAPI schema・エンドポイント設計
- DIPSの未確認ペイロード確定
- 詳細な画面UI・レイアウトコード
- 具体的なソースコード実装・インフラデプロイ

---

## 2. ドキュメント構成

| ドキュメント | 主な内容 |
|---|---|
| [00_b1-audit-and-corrections.md](00_b1-audit-and-corrections.md) | **Phase B1.2 最終事実訂正・監査記録**（DIPS公式仕様・申請主体・Workers制限・オフライン通報・正本モデル等の整理） |
| [01_frontend-runtime-comparison.md](01_frontend-runtime-comparison.md) | アプリ実行方式の比較（PWA、Flutter、React Native/Expo、Capacitor、完全ネイティブ、GAS延長） |
| [02_backend-and-security-comparison.md](02_backend-and-security-comparison.md) | バックエンド候補とセキュリティ比較（Cloudflare Workers、Firebase、Supabase、GAS backend、自前サーバー） |
| [03_data-storage-and-sync-comparison.md](03_data-storage-and-sync-comparison.md) | データ保存方式・原本性比較（ローカルDB正本、スプレッドシート正本、クラウドDB、ハイブリッド） |
| [04_cost-and-operations-analysis.md](04_cost-and-operations-analysis.md) | 個人利用における費用比較（月額/年額、ストア費用、地図費用、運用リスク） |
| [05_recommended-architecture.md](05_recommended-architecture.md) | 総合評価・推奨アーキテクチャ、第2候補、不採用理由、B2設計課題 |
| [../decisions/ADR-0001-architecture-selection.md](../decisions/ADR-0001-architecture-selection.md) | B1アーキテクチャ選定のADR（意思決定提案記録） |
