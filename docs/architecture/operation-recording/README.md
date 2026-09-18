# 運航記録・通常操作・A4

最終更新: 2026-09-18

99.2 §5の因果と現在ベースラインの入口。[architecture正本表](../README.md#3-主要概念の正本)／[総合目次](../../00_index.md)から読む。状態は[規約03](../../guidelines/03_design-evidence-and-causality.md)。C1以降は未着手。

| 詳細正本 | 責任 |
|---|---|
| [35a](35a_flexible-flight-and-details.md) | 柔軟な1飛行、内部明細、交代文脈、旧schema候補、テスト除外 |
| [35b](35b_normal-operation-and-final-save.md) | 通常運航の画面責任と10項目仕様、入口・途中入力・最後の操作 |
| [35c](35c_a4-operation-record.md) | 旧A4から最新Drive実物への因果、固定7枠・日付連番シート・必要時PDF、観測値と未確定 |
| [35d](35d_operation-finalization-and-write-boundary.md) | 一括確定の意味、A4／BAT／点検／累計の更新責任、途中保護と同一運航再送 |

[13a](../state-machines/13a_operation.md)は論理状態、[12e](../domain-model/12e_operation-inspection-maintenance.md)はEntityと旧schema候補、[18](../18_reports.md)は帳票生成技術。[31c](../identity-and-access/31c_operational-actors.md)の人物、[32a〜32c](../asset-management/README.md)の機材・取得確認を複製しない。詳細整備は[36](../maintenance-storage/README.md)、保存領域は[37](../drive-structure/README.md)。

[ADR-0020](../../decisions/ADR-0020-flexible-flight-and-finalization.md)／[0021](../../decisions/ADR-0021-a4-record-layout-and-sheet-boundary.md)はProposed。[Step 6監査](../../migration/99-2-step-6-causal-audit.md)は移管先と検証範囲の索引であり、上表の因果の代替ではない。
