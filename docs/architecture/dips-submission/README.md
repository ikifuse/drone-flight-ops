# Manual通報・Sheets台帳設計群

最終更新: 2026-09-15\
状態: Phase C0完了・Phase C1未着手（docs再編）

C6の通報支援とC4の外部台帳を分離する。画面入力の詳細は25b、状態は13、Entityは12d、Data Authorityは11、SyncQueueは14を参照する。

## 1. 文書と正本

| 文書 | 主要責務 |
|---|---|
| [24_manual-submission.md](24_manual-submission.md) | API非依存・入力再利用原則・Manual業務フロー |
| [24a_submission-and-sheets-ledger.md](24a_submission-and-sheets-ledger.md) | 全Sheets論理台帳・提出台帳schema・実績逆引き・同期利用 |

## 2. 読み順と変更境界

[architecture README](../README.md) → 本README → 対象文書。新しい詳細仕様をREADMEへ追記しない。Phase C0完了・C1未着手。各Phaseの範囲は [23](../23_implementation-roadmap.md)。

API未承認・接続基盤障害時もManualが独立する因果は[dips-infrastructure](../dips-infrastructure/README.md)。固定IP経路を本領域へ複製せず、手動UI・台帳列は各正本に維持する。

Step 5の共有作業リストと通常受付画面は[Presentation](../presentation/README.md)の34c／34d。24aの履歴保存を作業リストと同一視せず、Manualの確認方式・番号任意性は維持する。
