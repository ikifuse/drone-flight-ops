# 設計文書移植の記録

最終更新: 2026-09-18

本領域は移植元の識別、対象範囲、因果の移管先、検査結果を案内する。設計仕様の追加正本ではない。詳細は[概念別正本表](../architecture/README.md#3-主要概念の正本)、記録方法は[設計証拠規約](../guidelines/03_design-evidence-and-causality.md)を参照する。

| 記録 | 範囲・停止位置 |
|---|---|
| [99.2 再移植 Step 1](99-2-step-1-causal-audit.md) | 基準ea73d08から§0・§1。完了commit cab30e4。監査は当時の範囲を保持 |
| [99.2 再移植 Step 2](99-2-step-2-causal-audit.md) | cab30e4から§2のみ。完了commit 7130f69。正式設計はidentity-and-access。監査は当時の範囲を保持 |
| [99.2 再移植 Step 3](99-2-step-3-causal-audit.md) | 7130f69から§4と取得確認・点検整備Actorに直接必要な§6の部分のみ。正式設計はasset-management。§3・§5・§6残り・§7以降は未移植 |

99.2全文や旧Step 1〜8の移植結果をコピーしない。mainの旧成果は比較証拠として保存し、このブランチの移植元にはしない。
