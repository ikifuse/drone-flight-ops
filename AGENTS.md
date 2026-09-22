# AGENTS.md — 全AI共通の入口・基本ルール

最終更新: 2026-09-22
対象リポジトリ: `ikifuse/drone-flight-ops`

## 1. 目的と指示の構造

iPhone・Androidのスマートフォン1台で、DIPS確認・計画・地図・通報から点検・離着陸・BAT交換・機体交代・日誌保存・出力・オフライン同期まで扱う総合運航管理アプリを目指す。PCだけを完成形にしない。詳細は[00_goal](docs/00_goal.md)。

本書は全AI共通の入口。設計・仕様・規約・詳細ルーティンの正本は`docs/`に置く。AI固有の入口・Skillは共通正本への薄いアダプターに限定し、ルール本文を分岐・複製しない。

## 2. 安全ゲートと基本原則

- **実装凍結**: オーナーが明示的に「実装開始」と指示するまで、C1を含む本体実装（`src`・`public`・Dexie・IndexedDB・Domain型等）の作成・変更へ進まない。Docsやモックの完成は実装許可ではない。設計で決められる論点を実装後へ逃がさず、必要なモック・帳票例等で詰める。
- 現在のPhase・完了範囲は[総合目次](docs/00_index.md)、実装の依存条件は[23の開始ゲート](docs/architecture/23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)、移植履歴は[移植記録](docs/migration/README.md)を参照する。未確定事項は解消済みと扱わない。
- 未承認の仕様変更・技術選定を行わない。既存要件の意味・根拠・履歴を保持し、DIPS等の未確認事項は推測で確定しない。GASは必須ではない。採用済み構成と未選定部分は[architecture README](docs/architecture/README.md)・[ADR一覧](docs/decisions/README.md)・[DIPS基盤33a](docs/architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)に従う。
- 基準アプリ`ikifuse/autel-evo-lite-flight-log`は実運用・法令判断・保存復旧の知見を持つ資産。旧構造の無条件コピーも、理由を確かめない単純化・削除・置換も行わない。
- 法令の原則だけを一律の強制入力にしない。[法令・運用規約](docs/guidelines/02_legal-and-operations-rules.md)に従い、正式記録全体で評価する。確認済みの柔軟運用を一般論で未解決へ戻さない。
- 秘密情報・認証情報・個人情報をGitHubへcommitしない。クライアントへ秘密情報を漏洩させない。
- 既存の未commit差分・参照専用資料を保護する。参照資料を勝手に変更・削除・rename・追跡・ignore対象へ追加しない。説明できない変更が現れたら停止して報告する。

## 3. 最初に読む順番と範囲

`AGENTS.md → docs/00_index.mdの対象入口 → 対象領域のREADME → 必要な正本・直接の関連文書 → 必要なソース・テスト`。

全Docs・全コード・全Git履歴を毎回読み直さない。明示依頼のない全体横断監査・全履歴再調査は行わず、変更対象と直接関係する必要最小限の整合確認を行う。確認済みの恒久ルールを毎回ユーザーへ再入力・再確認させない。

## 4. 設計変更とDocs同期の3原則

1. **設計変更はDocs同期まで含めて1作業**。モック・コード・設定を変える場合も、設計への影響を判定 → 影響する現在有効な正本Docsを特定 → 変更物とDocsを同じ作業内で同期 → 必要な整合確認、まで行って完了とする。モック・コードだけで終了しない。
2. **役割を分離する**。GitHubのmainの最新commitはリポジトリ全体の現在状態、`docs/`配下の該当正本文書は現在有効な設計・仕様・規約、Git commit履歴は変更の証拠・履歴・復元点。**commit履歴は設計Docsの代わりではなく、commitしたことを理由にDocs同期を省略しない。**
3. **設計変更でないGit整理を区別する**。branch・tag等の整理だけなら設計仕様を書き換えない。ただし現在のbranch・作業先・Git状態を記録した運用文書やナビゲーションが古くなれば、「現在状態の記録訂正」として必要最小限更新する。過去の歴史的事実は消さない。

設計に影響する変更、Docsの追加・更新・整理、Git現在状態の記録訂正には、全AI共通の[設計Docs更新ルーティン](docs/guidelines/04_design-docs-update-workflow.md)を必要時に読み、適用する。個別の依頼文にDocs同期の指示がなくても適用する。

## 5. Git・作業完了の恒久ルール

- 通常作業はmainで行う。ユーザーが明示しない限り新しいbranchを作らない。保存・復元点はcommit履歴を使い、保存目的でbranchを増やさない。
- 開始時にbranch・HEAD・git statusを確認し、既存差分を捨てない。履歴の書換え・破壊的操作を独断で行わない。
- 変更に必要なテスト・整合確認 → 今回のdiffと公開内容の確認 → commit → mainへpush、までを完了作業とする。
- push後は停止し、ユーザーの画面確認・次の指示を待つ。勝手に次工程へ進まない。
- その作業についてユーザーが明示したbranch・対象範囲・保存方法等の別指示は、通常運用より優先する。

## 6. 詳細正本への案内

| 判断する内容 | 正本 |
|---|---|
| 構造・分割・保守、Responsibility Checkと正本の一元化 | [構造・保守規約](docs/guidelines/01_structure-and-maintenance-rules.md) §2〜§6 |
| 因果・7状態・実物証拠・質問と技術判断の境界 | [設計証拠・因果規約](docs/guidelines/03_design-evidence-and-causality.md) |
| 設計影響判定・Docs同期・検査・保存の共通手順 | [設計Docs更新ルーティン](docs/guidelines/04_design-docs-update-workflow.md) |
| 重要判断・承認済みADRの置換 | [ADR一覧・運用ルール](docs/decisions/README.md) |
| 概念ごとの正本・旧番号12／13／24／25／27からの案内 | [architecture README](docs/architecture/README.md) §3・§5（旧番号へ詳細を追記しない） |
| 未確定事項 | [未確認事項と論点](docs/04_open-questions.md) |

CURRENT-ACCEPTEDとADR Acceptedを同一視しない。規約一覧は[guidelines README](docs/guidelines/README.md)、Git整理の経緯は[移行記録](docs/migration/99-2-git-mainline-cutover.md)から辿る。
