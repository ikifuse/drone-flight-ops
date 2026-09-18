# ドキュメント総合目次

最終更新: 2026-09-18\
プロジェクト: `drone-flight-ops`

## 1. 役割・読み順・現在状態

本書は文書の所在・役割・状態・関連領域を案内する総合入口です。詳細ファイルは領域READMEへ登録し、本書で重複列挙しません。新設・移動・分割・廃止時は、対象READMEと本書の入口・状態を同時に確認・更新します。

`AGENTS → 00_index → 対象領域README → 正本詳細文書` の順に読みます。

- Phase A/A.5、B1〜B2最終監査完了、Phase B設計凍結。
- ADR-0001〜0007 Accepted。2026-09-15のdocs再編指示に基づく部分置換はADR-0008/0009。
- **C0基盤・PWA Shell構築完了、C1設計準備完了。C1以降は未着手、C0受入確認・オーナーGO待ち。**
- **99.2再移植はStep 2（§2）まで**。Step 1の設計方法を維持し、人物・環境・権限・離任は[identity-and-access](architecture/identity-and-access/README.md)を詳細正本とする。[移植記録](migration/README.md)から確認範囲へ進む。§3以降は未移植で、既存詳細を99.2全体との監査済み仕様と扱わない。依存実装は[23の開始ゲート](architecture/23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)に従う。
- 状態は **確定**（承認済み基準）、**検討中**（判断待ち）、**調査**（観測・根拠・未検証）、**将来**（後続Phase）、**履歴**（当時の判断）、**移行案内**（詳細の移転入口）を区別します。文書の確定はアプリ実装・外部仕様の最新性の検証完了を意味しません。

上記は既存文書の案内区分です。99.2再移植の7状態とその意味は[設計証拠規約§3](guidelines/03_design-evidence-and-causality.md#3-状態ラベルと由来)を正本とし、CURRENT-ACCEPTEDをADR Acceptedや変更不可と同一視しません。

## 2. 要件・規約・設計への入口

| 文書 / 入口 | 役割・読む場面 | 状態 / 関連領域 |
|---|---|---|
| [AGENTS](../AGENTS.md) | AI案内・読み順・法令8区分・禁止事項・構造レビュー | 確定 / 全体 |
| [root README](../README.md) | GitHubでの初期案内と現在の停止位置 | 確定 / 全体 |
| [アプリ概要](../01_アプリ概要.md) | 背景・現場一気通貫フロー・申し送り | 確定 / 全体 |
| [00_goal](00_goal.md) | 最終ゴール・運用思想・機能必要性の判断 | 確定 / 現場フロー・UI |
| [01_current-system-analysis](01_current-system-analysis.md) | 基準アプリの機能・強み・制約・採用理由 | 履歴 / バッテリー・点検・記録 |
| [02_reference-app-requirements](02_reference-app-requirements.md) | 参考アプリ公開情報と運用思想の比較 | 調査・履歴 / DIPS・地図・出力 |
| [03_integrated-requirements](03_integrated-requirements.md) | 統合機能要件・通報支援原則・受入目的 | 確定 / 計画・運航・同期・出力 |
| [04_open-questions](04_open-questions.md) | 未確認事項と過去論点の決定状況・PENDING入口 | 検討中 / C1前確認・後続Phase |
| [構造・分割・保守規約](guidelines/01_structure-and-maintenance-rules.md) | 9原則・Responsibility Check・レビュー手順 | 確定 / docs・source・変更管理 |
| [法令・運用規約](guidelines/02_legal-and-operations-rules.md) | 法令8区分・正式記録全体評価・柔軟運用 | 確定 / 法令・帳票・現場 |
| [設計証拠・因果規約](guidelines/03_design-evidence-and-causality.md) | 因果保持・7状態・実物証拠・質問と技術判断の境界 | CURRENT-ACCEPTED / 設計方法 |
| [移植記録README](migration/README.md) | 99.2再移植の対象・根拠・移管先・検査 | 監査記録 / Step 1・Step 2 |
| [architecture README](architecture/README.md) | 設計領域・概念正本・比較/監査履歴への入口 | 確定 / 全アーキテクチャ |
| [decisions README](decisions/README.md) | ADR運用・承認状態・部分置換範囲・決定履歴 | 確定 / 重要意思決定 |

## 3. ディレクトリ配置

```text
docs/
├── 00_index.md / 00_goal.md / 01〜04の要件・分析
├── guidelines/                 # 構造・保守、法令・運用、設計証拠・因果
├── migration/                  # 移管対応・証拠・検査の記録（仕様を複製しない）
├── decisions/
│   ├── README.md               # ADR-0000はこの中の運用決定（独立ファイルなし）
│   └── ADR-0001〜0009 / 0015〜0016 # 既存決定と再移植のProposed記録（0010〜0014はmainに保全）
└── architecture/
    ├── README.md               # 設計領域と概念の正本表
    ├── domain-model/           # C1のEntity / schema参照
    ├── identity-and-access/    # 人物・環境・権限・現場担当・離任（§2）
    ├── presentation/           # 画面仕様の記録10項目（個別画面の再移植は後続）
    ├── state-machines/         # 運航・通報・離陸評価
    ├── dips-submission/        # Manual業務 / Sheets Ledger
    ├── dips-flight-plan/       # カタログ / Manual UI / API / 入力評価
    ├── output/                 # 出力境界 / KML / Drive / My Maps / 機体ログ
    └── 単一責務設計・比較履歴・監査記録（architecture READMEから参照）
```

## 4. 外部正本・参照リポジトリ

1. **基準アプリ**: `ikifuse/autel-evo-lite-flight-log`。実装・法令運用判断の参照箇所は `01_ドローン運航記録_設計書/`、`docs/`、`src/`。旧物理構造を新アプリへ無条件にコピーしません。
2. **非公開調査メモ**: `ikifuse/autel-evo-lite-flight-log-private-notes`。DIPS調査・原本アーカイブ（`01_DIPS2.0_API調査.md`〜`10_ワンエビ原本アーカイブ保存状況.md`）。公開docsに私的URL・認証情報・個人情報を転記しません。
