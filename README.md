# drone-flight-ops

iPhone / Android向け 総合ドローン運航管理アプリ（C0 Shell構築済み・C1未着手）

---

## 概要

本リポジトリは、スマートフォン1台で現場での飛行準備からDIPS2.0飛行計画通報、飛行前点検、離着陸、バッテリー交換、機体交代、飛行後点検、飛行日誌保存、国交省標準様式出力までを一気通貫で行うための総合ドローン運航管理システムの要件定義および調査ドキュメントを管理しています。

現行の自作アプリ（`ikifuse/autel-evo-lite-flight-log`）の強みである「バッテリー個体管理」「現場重視の操作性」「データの透明性」を継承し、参考アプリ（DIPS Viewer ワンエビneo等）の機能を取り込んだ次期システムの基盤資料です。

`ea73d08`から99.2の因果を保持して再移植する作業は`redo/99-2-causal-migration`で進め、`01eeac3`から分岐した`claude/99-2-continuation`で継続しています。Step 1〜6を保持し、現在の範囲は**Step 7a（§7の実画面確認・共通Geometry・submission_snapshot・Manual／API経路・DIPS対象外）・Step 7b（§7の06の記録責任・作業台帳・取消／リスト整理の境界）・Step 7c（KMLの位置づけ・単位・生成契機・内容・再送）・Step 7d（PDFの役割分離・生成契機、飛行履歴・出力の画面）・Step 7e（§9の正本・端末cache・時点分離・費用の境界）**。共通の源とManual／APIの境界の因果を[25e](docs/architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md)、実画面の証拠系列を[26](docs/architecture/26_dips-web-ui-verification.md)、06の記録責任と作業台帳を[24b](docs/architecture/dips-submission/24b_dips-plan-records-and-worklist-lifecycle.md)、KMLの生成契機・内容・単位を[27e](docs/architecture/output/27e_kml-generation-timing-and-content.md)、PDFの役割・生成契機を[27f](docs/architecture/output/27f_derived-pdf-roles-and-map-pdf.md)、飛行履歴・出力の画面を[34e](docs/architecture/presentation/34e_history-and-output.md)、共有正本と端末cache・時点分離を[sync-and-cache](docs/architecture/sync-and-cache/README.md)へ移しました。§11の差分監査を続けます。C1実装には進みません。[移植・監査記録](docs/migration/README.md)を参照してください。mainの旧Step 1〜8は比較証拠として保存し、再利用していません。アプリの目的は[記入支援](docs/00_goal.md#11-記入支援を中心に置くまでの因果)、依存実装の着手条件は[23](docs/architecture/23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)にあります。

## ドキュメント一覧

- [AGENTS.md](AGENTS.md) - **AI向け開発憲法・案内（AIは最初にここを読む）**
- [docs/00_index.md](docs/00_index.md) - **ドキュメント総合目次（領域別の入口）**
- [01_アプリ概要.md](01_アプリ概要.md) - プロジェクト全体概要・申し送り
- [docs/00_goal.md](docs/00_goal.md) - 最終ゴール、iPhone/Android現場一気通貫フロー、設計原則
- [docs/01_current-system-analysis.md](docs/01_current-system-analysis.md) - 現行自作アプリの機能・強み・弱み分析
- [docs/02_reference-app-requirements.md](docs/02_reference-app-requirements.md) - 参考アプリ（ワンエビneo）の機能分析と重複整理
- [docs/03_integrated-requirements.md](docs/03_integrated-requirements.md) - 統合要件定義書（バッテリー、計画、DIPS、日誌、地図、オフライン、出力、監査）
- [docs/04_open-questions.md](docs/04_open-questions.md) - 未確認事項と将来の設計判断論点
- [docs/guidelines/01_structure-and-maintenance-rules.md](docs/guidelines/01_structure-and-maintenance-rules.md) - 構造・分割・保守運用規約
- [docs/guidelines/02_legal-and-operations-rules.md](docs/guidelines/02_legal-and-operations-rules.md) - 法令・実運用判断規約（法令8区分・柔軟運用）
- [docs/guidelines/03_design-evidence-and-causality.md](docs/guidelines/03_design-evidence-and-causality.md) - 因果・7状態・実物証拠・質問の境界
- [docs/decisions/README.md](docs/decisions/README.md) - アーキテクチャ決定記録（ADR）

- [docs/architecture/README.md](docs/architecture/README.md) - 領域別設計書と主要概念の正本
- [docs/architecture/identity-and-access/README.md](docs/architecture/identity-and-access/README.md) - 人物・環境・三層権限・運航担当・離任の因果と現在設計
- [docs/architecture/asset-management/README.md](docs/architecture/asset-management/README.md) - 機体取得と累計、BAT共用と個体履歴、取得確認と点検整備Actorの因果
- [docs/architecture/dips-infrastructure/README.md](docs/architecture/dips-infrastructure/README.md) - DIPS固定送信元IP経路・限定バックエンド・Manual独立・再試行境界
- [docs/architecture/presentation/README.md](docs/architecture/presentation/README.md) - 10項目規約と、初回・ホーム・共有飛行リスト・正常受付後の画面正本
- [運航記録・通常操作・A4](docs/architecture/operation-recording/README.md) - 35a〜35dの因果と現在設計
- [点検整備記録の媒体](docs/architecture/maintenance-storage/README.md) - 36の機体別記録・原本コピー
- [Drive責任構造](docs/architecture/drive-structure/README.md) - 37の01〜07・旧案からの変遷
- [docs/architecture/28_c1-docs-restructure-audit.md](docs/architecture/28_c1-docs-restructure-audit.md) - C1前docs再編・移行対照・最終監査

## 運用ルール

- **完成形は大前提として「iPhone / Android 両対応の現場用アプリ」です（単なるPC向けWebではありません）。**
- **PWA・IndexedDB／Google Sheets（Model D）を維持します。DIPS API用Workers経路からGoogle Cloud＋Cloud NATへの変更は33aとADR-0018（Proposed）を参照してください。出力・復旧と地図ライブラリの部分置換はADR-0008/0009を参照してください。**
- **Phase B設計凍結、Phase C0基盤・PWA Shell構築完了、C1設計準備完了。C1以降は未着手で、C0受入確認・オーナーGO待ちです。**
- C6 Manual DIPSを第一級機能とし、C7 API接続はOptional。C1前のdocs再編は実装開始を意味しません。
- ルールや規約の詳細は [AGENTS.md](AGENTS.md) を参照してください。
