# 共通規約と作業ルーティン

最終更新: 2026-09-22

全AIが[AGENTS.md](../../AGENTS.md)から必要な規約へ進む入口。AI固有領域に規約本文を複製しない。

| 正本 | 読む場面 |
|---|---|
| [01 構造・保守](01_structure-and-maintenance-rules.md) | 責任分離・分割・正本配置・Responsibility Check |
| [02 法令・運用](02_legal-and-operations-rules.md) | 法令根拠・正式記録全体・柔軟運用の評価 |
| [03 設計証拠・因果](03_design-evidence-and-causality.md) | 因果・状態・証拠・確認すべき判断 |
| [04 設計Docs更新ルーティン](04_design-docs-update-workflow.md) | 設計影響判定、モック・コード・設定とDocsの同期、Git現在状態の記録訂正、検査・保存 |

共通検査はリポジトリルートから `python3 scripts/check_docs.py` を実行する（[スクリプト](../../scripts/check_docs.py)）。[総合目次](../00_index.md)へ戻る。
