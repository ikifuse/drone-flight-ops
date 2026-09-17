# drone-flight-ops

iPhone / Android向け 総合ドローン運航管理アプリ（C0 Shell構築済み・C1未着手）

---

## 概要

本リポジトリは、スマートフォン1台で現場での飛行準備からDIPS2.0飛行計画通報、飛行前点検、離着陸、バッテリー交換、機体交代、飛行後点検、飛行日誌保存、国交省標準様式出力までを一気通貫で行うための総合ドローン運航管理システムの要件定義および調査ドキュメントを管理しています。

現行の自作アプリ（`ikifuse/autel-evo-lite-flight-log`）の強みである「バッテリー個体管理」「現場重視の操作性」「データの透明性」を継承し、参考アプリ（DIPS Viewer ワンエビneo等）の機能を取り込んだ次期システムの基盤資料です。

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
- [docs/decisions/README.md](docs/decisions/README.md) - アーキテクチャ決定記録（ADR）

- [docs/architecture/README.md](docs/architecture/README.md) - 領域別設計書と主要概念の正本
- [docs/architecture/28_c1-docs-restructure-audit.md](docs/architecture/28_c1-docs-restructure-audit.md) - C1前docs再編・移行対照・最終監査

## 運用ルール

- **完成形は大前提として「iPhone / Android 両対応の現場用アプリ」です（単なるPC向けWebではありません）。**
- **PWA ＋ Cloudflare Workers ＋ IndexedDB・Google Sheets（Model D）はADR-0001〜0007に基づく採用済み設計です。出力・復旧と地図ライブラリの部分置換はADR-0008/0009を参照してください。**
- **Phase B設計凍結、Phase C0基盤・PWA Shell構築完了、C1設計準備完了。C1以降は未着手で、C0受入確認・オーナーGO待ちです。**
- C6 Manual DIPSを第一級機能とし、C7 API接続はOptional。C1前のdocs再編は実装開始を意味しません。
- ルールや規約の詳細は [AGENTS.md](AGENTS.md) を参照してください。
