# 人物・運用環境・権限の設計入口

最終更新: 2026-09-18\
範囲: 99.2 §2の再移植（Step 2）。C1未着手。

[総合INDEX](../../00_index.md) → [architecture](../README.md) → 本書 → 対象正本の順に読む。各文書が当初状態・問題・確認・検討案・変更理由・到達点・例外を保持する。[移植監査](../../migration/99-2-step-2-causal-audit.md)は対応索引であり、理由を読むための必須経路にしない。

| 詳細正本 | 唯一の主要責務 | 利用側の境界 |
|---|---|---|
| [31a 人物・アカウント・環境](31a_person-account-and-environment.md) | Personnel、GoogleIdentity/UserAccount、OperationalEnvironment、所属・役割の概念、Organizationとの関係、資格、環境切替 | Domainは参照、Presentationは表示要件を参照。物理schema・ID対応は未確定 |
| [31b 権限・管理者](31b_roles-and-access-control.md) | 業務役割／アプリ機能／Google実アクセスの三層、管理者、設定、補助者・Viewerの操作境界 | Securityは秘密・認証機構、Driveは保存処理。業務権限表を再定義しない |
| [31c 運航時の人物役割](31c_operational-actors.md) | Pilot / Submitter / Recorder / Assistant / 日常点検実施者の意味・初期値・分離理由 | 計画・運航Entityは記録の保持先、帳票は射影、DIPSは外部入力との対応 |
| [31d 所属終了・再所属](31d_membership-lifecycle.md) | 離任の対象、履歴保持・候補除外・再所属、Google共有と物理所有の境界 | 共通LifecycleとAuditを利用。離任UI・権限・offlineは未確定 |

設計状態は[7状態規約](../../guidelines/03_design-evidence-and-causality.md#3-状態ラベルと由来)に従う。到達済みの内容はCURRENT-ACCEPTED、検討方向はCURRENT-PROPOSAL、列・UI等の未決はPENDING、証拠の確認待ちはVERIFYとする。原本が記録する観測はEVIDENCE/EXAMPLEであり、今回の直接再検証と区別する。重要な置換判断の記録は[ADR-0016（Proposed）](../../decisions/ADR-0016-environment-membership-and-access-separation.md)。

本領域は[構造規約](../../guidelines/01_structure-and-maintenance-rules.md#6-docs変更時のresponsibility-check)に従い、人物同一性、権限判定、運航時割当、所属ライフサイクルという独立した変更理由で分けた。将来のコードの分割・認証方式・保存テーブルをこの目次から確定しない。[実装開始ゲート](../23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)は継続する。

Step 5の利用側画面は[34a](../presentation/34a_setup-and-environment-entry.md)の初回・環境入口、[34c](../presentation/34c_shared-flight-worklist.md)の共有リストへ接続する。31a〜31dの人物・所属・権限・Actorの詳細と未確定は変更せず、画面から別の環境モデルを作らない。
