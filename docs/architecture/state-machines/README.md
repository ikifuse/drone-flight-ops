# 状態管理・離陸評価設計群

最終更新: 2026-09-15\
状態: Phase C0完了・Phase C1未着手（docs再編）

運航の物理進行、提出の外部手続き、安全評価は異なるPhaseと責務で変更される。13_overviewから変更対象だけを読む。

## 1. 文書と正本

| 文書 | 主要責務 |
|---|---|
| [13_overview.md](13_overview.md) | 分離原則と保存/提出/運航の接続 |
| [13a_operation.md](13a_operation.md) | Operation FSM |
| [13b_dips-submission.md](13b_dips-submission.md) | DipsSubmissionStatus・結果不明照合・誤認防止 |
| [13c_takeoff-readiness.md](13c_takeoff-readiness.md) | DipsReportingRequirement・TakeoffReadinessAssessment・離陸監査 |

## 2. 読み順と変更境界

[architecture README](../README.md) → 本README → 対象文書。新しい詳細仕様をREADMEへ追記しない。Phase C0完了・C1未着手。各Phaseの範囲は [23](../23_implementation-roadmap.md)。
