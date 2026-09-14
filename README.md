# drone-flight-ops

次世代 総合ドローン運航管理システム 要件定義・設計準備プロジェクト

---

## 概要

本リポジトリは、スマートフォン1台で現場での飛行準備からDIPS2.0飛行計画通報、飛行前点検、離着陸、バッテリー交換、機体交代、飛行後点検、飛行日誌保存、国交省標準様式出力までを一気通貫で行うための総合ドローン運航管理システムの要件定義および調査ドキュメントを管理しています。

現行の自作アプリ（`ikifuse/autel-evo-lite-flight-log`）の強みである「バッテリー個体管理」「現場重視の操作性」「データの透明性」を継承し、参考アプリ（DIPS Viewer ワンエビneo等）の機能を取り込んだ次期システムの基盤資料です。

## ドキュメント一覧

- [01_アプリ概要.md](01_アプリ概要.md) - プロジェクトの全体像と申し送り事項
- [docs/00_goal.md](docs/00_goal.md) - 最終ゴール、一気通貫フロー、設計原則
- [docs/01_current-system-analysis.md](docs/01_current-system-analysis.md) - 現行自作アプリの機能・強み・弱み分析
- [docs/02_reference-app-requirements.md](docs/02_reference-app-requirements.md) - 参考アプリ（ワンエビneo）の機能分析と重複整理
- [docs/03_integrated-requirements.md](docs/03_integrated-requirements.md) - 統合要件定義書（バッテリー、計画、DIPS、日誌、地図、オフライン、出力、監査）
- [docs/04_open-questions.md](docs/04_open-questions.md) - 未確認事項と将来の設計判断論点

## 運用ルール

- 本フェーズでは**実装・技術選定・アーキテクチャ確定は行いません**。
- 要件・データ・運用フローの整理のみを厳密に行っています。
