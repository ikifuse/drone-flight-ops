# 同期・cache設計群

最終更新: 2026-09-19\
範囲: Step 7eの99.2 §9（正本と端末cache、正本確認、確定・保存・外部反映の時点分離、未確定）。C1未着手。

| 正本 | 責任 |
|---|---|
| [38a 共有正本と端末cache](38a_shared-source-and-device-cache.md) | 共有の正本と端末cacheの関係、cacheの捨て方、正本を確認する時点、offlineの意味、同期状態の判断の方向 |
| [38b 確定・保存・外部反映の時点分離](38b_confirmation-and-sync-timing-separation.md) | 計画確定・逐次保存・最終送信の三時点、未同期の保持、別系統の再試行、中央SyncQueue・監査の未確定 |

[architecture README](../README.md) → 本書 → 対象文書の順に読む。権威のライフサイクルと手修正の保護は[11](../11_data-authority.md)、同期キューの型・再試行・ストレージ保護は[14](../14_offline-and-sync.md)、障害時の限界は[19](../19_failure-recovery.md)が正本で、本領域は再定義しない。保存の所有と費用の境界は[37 §6](../drive-structure/37_environment-storage-responsibilities.md#6-保存の所有と費用の境界)。

判断は[ADR-0026](../../decisions/ADR-0026-shared-source-confirmation-and-timing-separation.md)（Proposed）、移管と確認範囲は[Step 7e監査](../../migration/99-2-step-7e-causal-audit.md)。Step 7eは文書の移管であり、cache・同期の実装ではない。
