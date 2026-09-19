# Presentation設計の入口

最終更新: 2026-09-19\
範囲: Step 1の10項目規約、Step 2の人物・環境・権限への接続、Step 5の§3と§7の通常画面・共有リスト限定部分、Step 7dの飛行履歴・出力。C1未着手。

| 正本 | 責任 |
|---|---|
| [30_screen-specification-standard](30_screen-specification-standard.md) | 画面ごとの記録10項目、導入理由、保存先・権限・通信状態との対応の記録方法 |
| [34a 初回・環境への入口](34a_setup-and-environment-entry.md) | 作成／参加、root重複防止、初回必須登録の変化、通常起動・環境選択 |
| [34b ホーム4入口](34b_home-and-navigation.md) | 2→3→4入口の因果、入口ごとの役割、画面→01〜07の責任接続 |
| [34c 共有飛行リスト](34c_shared-flight-worklist.md) | 軽量作業リスト、カード5系統、絞り込み方向、通報内容への直接導線 |
| [34d DIPS正常受付後・通報内容](34d_dips-accepted-and-plan-content.md) | 正式掲載契機、後で飛行する、重複なし通常画面の主操作 |
| [34e 飛行履歴・出力](34e_history-and-output.md) | 過去の飛行の検索・選択、必要な出力（KML・PDF）への導線、出力選択方式の位置づけ |
| [34f 画面体系と遷移の俯瞰](34f_screen-map-and-design-coverage.md) | ホームから先の画面の並びと行き先、各画面の設計の到達範囲、未設計領域（設計検討フェーズの入口） |

[architecture README](../README.md) → 本書 → 30の規約と対象画面の正本の順に読む。個別画面の仕様は担当領域の正本に置き、10項目の規約本文を複製しない。既存の[DIPS手動画面](../dips-flight-plan/25b_manual-web-mapping.md)も個別仕様の正本を維持する。

画面の実装前提は[23の開始ゲート](../23_implementation-roadmap.md)、因果・状態の共通定義は[設計証拠規約](../../guidelines/03_design-evidence-and-causality.md)。Step 2の環境表示・切替は[31a §4](../identity-and-access/31a_person-account-and-environment.md#4-会社利用と環境切替へ詰めた内容)、機能権限は[31b](../identity-and-access/31b_roles-and-access-control.md)、人物初期値・通報者と操縦者の一覧識別は[31c](../identity-and-access/31c_operational-actors.md)、離任UIの未確定は[31d](../identity-and-access/31d_membership-lifecycle.md)を参照する。人物・環境・権限の詳細を本領域へ複製せず、Step 5ではその正本を参照して画面を具体化する。

34a〜34dは実装ではなく因果と画面仕様の移管である。Geometry、API payload、重複調整、取消詳細、KML、通常運航全体、A4帳票、Drive全体構造、§8以降は対象外。[ADR-0019](../../decisions/ADR-0019-home-entry-and-shared-plan-handoff.md)はProposed、[Step 5監査](../../migration/99-2-step-5-causal-audit.md)は証拠・移管・検査の索引。

Step 6で通常運航の10項目画面仕様を[35b](../operation-recording/35b_normal-operation-and-final-save.md)へ追加した。34dから点検以降へ接続し、Drive全体は[37](../drive-structure/37_environment-storage-responsibilities.md)が正本。上の「対象外」はStep 5の確認範囲を表す。Step 7dで［飛行履歴・出力］の画面仕様を[34e](34e_history-and-output.md)へ追加した。
