# ドキュメント総合目次（docs/00_index.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`

---

## 1. 本目次の役割と利用ルール

本書は、`drone-flight-ops` プロジェクト内のすべての仕様書、要件定義書、設計書、調査資料、ADR（意思決定記録）の所在・役割・状態・関連実装領域を網羅する**総合マスター目次**です。

### 利用ルール
- **AIおよび開発者は、まず本書を参照して目的のドキュメントを特定してください。**
- `docs/` 配下に新しい文書を追加、移動、分割、または廃止した場合は、**必ず本書（00_index.md）を同時に更新**してください。
- 各文書の状態は以下のように厳格に区分します。
  - **確定**: オーナー承認済みで、開発・設計の基準となる文書。
  - **検討中**: 提案中、またはレビュー待ちの文書。
  - **調査**: 技術検証・公開情報の調査メモ。
  - **将来**: 次期フェーズ以降で検討する構想資料。
  - **廃止候補**: 旧仕様や統合により将来削除・アーカイブ予定の文書。

---

## 2. ドキュメント一覧マトリクス

| 文書名（リンク） | 役割 | 主な内容 | どんな時に読むか | 状態 | 関連する実装領域 |
|---|---|---|---|---|---|
| [AGENTS.md](../AGENTS.md) | AI案内・開発規約 | プロジェクト大前提、AI読み順、法令8区分、分割・保守原則、禁止事項 | 作業開始時、迷った時、Phase開始前 | **確定** | 全領域（プロジェクト横断） |
| [01_アプリ概要.md](../01_アプリ概要.md) | 主役ファイル・概要 | プロジェクト目的、一気通貫フロー、ドキュメント構成、申し送り | 背景把握時、他AIへの引き継ぎ時 | **確定** | 全領域（プロジェクト横断） |
| [README.md](../README.md) | リポジトリ案内 | リポジトリの基本情報、目次リンク、運用方針 | GitHub初期アクセス時 | **確定** | 全領域 |
| [00_goal.md](00_goal.md) | ゴール・設計原則 | スマホ1台での現場一気通貫フロー、運用思想、設計原則 | 全体目標の確認時、新機能の必要性判断時 | **確定** | 全業務フロー・UI/UX |
| [01_current-system-analysis.md](01_current-system-analysis.md) | 現行自作システム分析 | 現行アプリ（EVO Lite運航記録）の機能一覧、独自の強み、現状の弱み | 既存機能の確認時、新アプリで踏襲すべき強みの確認時 | **確定** | バッテリー管理、現場状態遷移、帳票原本 |
| [02_reference-app-requirements.md](02_reference-app-requirements.md) | 参考アプリ機能分析 | ワンエビneoの公開機能、自作アプリとの重複・差異、運用思想比較 | DIPS連携や地図機能の要件検討時 | **確定** | DIPS連携、地図・ポリゴン、様式出力 |
| [03_integrated-requirements.md](03_integrated-requirements.md) | 統合要件定義書 | 8大機能要件（バッテリー、計画、DIPS、日誌、地図、オフライン、出力、監査） | 仕様詳細の確認時、データモデリング時、機能設計時 | **確定** | flight-plan, dips, map, flight-log, battery, offline, export |
| [04_open-questions.md](04_open-questions.md) | 未確認事項・設計論点 | DIPS API未確認仕様（申請主体等）、将来の設計判断論点（PWA vs Native等） | Phase Bアーキテクチャ検討時、国交省確認時 | **検討中** | アーキテクチャ、認証、データストア |
| [guidelines/01_structure-and-maintenance-rules.md](guidelines/01_structure-and-maintenance-rules.md) | 構造・分割・保守規約 | 9大分割原則、「大きくなってから分割」の禁止、定期構造レビュー手順 | モジュール分割時、リファクタリング検討時、Phase境界 | **確定** | ディレクトリ構造、モジュール設計、CI/CD |
| [guidelines/02_legal-and-operations-rules.md](guidelines/02_legal-and-operations-rules.md) | 法令・運用判断規約 | 法令8区分、柔軟運用の尊重、正式記録全体の評価、基準アプリの継承 | 入力欄設計時、帳票設計時、法令変更時 | **確定** | 法令判定、飛行日誌、日常点検、整備記録 |
| [decisions/README.md](decisions/README.md) | ADR（意思決定記録）目次 | アーキテクチャ決定記録（ADR）の運用ルール、フォーマット、決定履歴 | 技術選定時、過去の決定理由の調査時 | **確定** | アーキテクチャ選定、技術スタック全般 |
| [decisions/ADR-0001-architecture-selection.md](decisions/ADR-0001-architecture-selection.md) | ADR-0001: アーキテクチャ選定 | PWA ＋ Cloudflare Workers ＋ ローカルDB・スプレッドシートハイブリッド構成の選定理由 | 技術スタック検討時、決定根拠の確認時 | **検討中** | システム全体構成 |
| [architecture/README.md](architecture/README.md) | アーキテクチャ検討目次 | Phase B1/B1.1（技術構成比較・再監査）の概要・目的・ドキュメント構成 | B1/B1.1全体の把握時、B2着手前 | **確定** | アーキテクチャ設計 |
| [architecture/00_b1-audit-and-corrections.md](architecture/00_b1-audit-and-corrections.md) | B1再監査・訂正記録 | 断定過剰・未確認事項・正本矛盾の再検証と客観的根拠の整理（Phase B1.1） | 技術選定の前提確認時、B2設計着手前 | **確定** | アーキテクチャ全体、監査 |
| [architecture/01_frontend-runtime-comparison.md](architecture/01_frontend-runtime-comparison.md) | アプリ実行方式の比較 | PWA、Flutter、React Native/Expo、Capacitor、完全ネイティブ、GASの比較 | クライアント技術選定時 | **確定** | フロントエンド、UI実行環境 |
| [architecture/02_backend-and-security-comparison.md](architecture/02_backend-and-security-comparison.md) | バックエンド・セキュリティ比較 | Cloudflare Workers、Firebase、Supabase、GAS等の比較、DIPS秘密情報保護 | サーバー選定時、DIPSプロキシ設計時 | **確定** | バックエンド、APIプロキシ、セキュリティ |
| [architecture/03_data-storage-and-sync-comparison.md](architecture/03_data-storage-and-sync-comparison.md) | データ保存方式・同期比較 | スプレッドシート正本、ローカルDB正本、クラウドDB、ハイブリッド連携の比較 | データモデリング時、同期方式検討時 | **確定** | データ永続化、オフライン、スプレッドシート |
| [architecture/04_cost-and-operations-analysis.md](architecture/04_cost-and-operations-analysis.md) | 費用・個人運用負荷分析 | 初期・月額・年額費用（0円運用）、Apple Developer費用回避、地図API費用 | コスト見積もり時、運用設計時 | **確定** | 運用コスト、インフラ維持 |
| [architecture/05_recommended-architecture.md](architecture/05_recommended-architecture.md) | 推奨構成と総合評価 | 最有力推奨構成（PWA+Workers+Hybrid）、第2候補、不採用理由、B2課題 | アーキテクチャ確定時、B2設計着手時 | **確定** | アーキテクチャ全体 |

---

## 3. 将来の設計書（Phase B以降）配置計画

Phase B（アーキテクチャ設計）以降で順次作成される設計書群は、1つの巨大ファイルにまとめず、以下の階層構造で独立管理します。各フォルダ内には必ずローカル目次（`README.md` または `00_index.md`）を配置します。

```text
docs/
├── 00_index.md                        # 本ファイル（総合目次）
├── 00_goal.md                         # 最終ゴール・ビジョン
├── 01_current-system-analysis.md      # 現行システム分析
├── 02_reference-app-requirements.md   # 参考アプリ分析
├── 03_integrated-requirements.md      # 統合要件定義
├── 04_open-questions.md               # 未確認事項・設計論点
├── guidelines/                        # 開発・運用ガイドライン
│   ├── 01_structure-and-maintenance-rules.md
│   └── 02_legal-and-operations-rules.md
├── decisions/                         # ADR（アーキテクチャ決定記録）
│   ├── README.md
│   └── ADR-0001-xxx.md
└── architecture/                      # Phase B以降で作成する詳細設計書群
    ├── README.md                      # アーキテクチャ全体目次
    ├── 01_system-overview.md          # システム全体構成（フロント/バックエンド）
    ├── 02_dips-adapter.md             # DIPS API連携仕様・通信設計
    ├── 03_map-flight-plan.md          # 地図・空域ポリゴン・計画作成仕様
    ├── 04_flight-log-state.md         # 現場状態遷移・飛行日誌・点検仕様
    ├── 05_battery-aircraft-data.md    # バッテリー個体管理・機体台帳データ仕様
    ├── 06_offline-sync.md             # オフライン永続化・同期キュー設計
    ├── 07_export-import.md            # 国交省様式PDF/Excel/CSV出力設計
    └── 08_security-auth.md            # 認証・トークン管理・秘密情報保護設計
```

---

## 4. 外部正本・参照リポジトリ

1. **基準アプリ（実装・法令運用判断の正本）**:
   - リポジトリ: `ikifuse/autel-evo-lite-flight-log`
   - 参照箇所: `01_ドローン運航記録_設計書/`, `docs/`, `src/`
2. **非公開調査メモ（DIPS調査・原本アーカイブ）**:
   - リポジトリ: `ikifuse/autel-evo-lite-flight-log-private-notes`
   - 参照箇所: `01_DIPS2.0_API調査.md` 〜 `10_ワンエビ原本アーカイブ保存状況.md`
