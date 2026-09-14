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
| [decisions/ADR-0001-architecture-selection.md](decisions/ADR-0001-architecture-selection.md) | ADR-0001: アーキテクチャ選定 | PWA ＋ Cloudflare Workers ＋ ローカルDB・スプレッドシートハイブリッド構成の選定理由 | 技術スタック検討時、決定根拠の確認時 | **確定** | システム全体構成 |
| [architecture/README.md](architecture/README.md) | アーキテクチャ設計目次 | Phase B1（比較検討）および Phase B2/B2.1（詳細設計・監査）の概要・構成 | アーキテクチャ全体の把握時 | **確定** | アーキテクチャ設計 |
| [architecture/00_b1-audit-and-corrections.md](architecture/00_b1-audit-and-corrections.md) | B1.3最終整合性修正・監査記録 | 原本性表現の中立化・飛行可能誤認防止・DIPS表示整理（Phase B1.3） | 技術選定の前提確認時 | **確定** | アーキテクチャ全体、監査 |
| [architecture/01_frontend-runtime-comparison.md](architecture/01_frontend-runtime-comparison.md) | アプリ実行方式の比較 | PWA、Flutter、React Native/Expo、Capacitor、完全ネイティブ、GASの比較 | クライアント技術選定時 | **確定** | フロントエンド、UI実行環境 |
| [architecture/02_backend-and-security-comparison.md](architecture/02_backend-and-security-comparison.md) | バックエンド・セキュリティ比較 | Cloudflare Workers、Firebase、Supabase、GAS等の比較、DIPS秘密情報保護 | サーバー選定時、DIPSプロキシ設計時 | **確定** | バックエンド、APIプロキシ、セキュリティ |
| [architecture/03_data-storage-and-sync-comparison.md](architecture/03_data-storage-and-sync-comparison.md) | データ保存方式・同期比較 | スプレッドシート正本、ローカルDB正本、クラウドDB、ハイブリッド連携の比較 | データモデリング時、同期方式検討時 | **確定** | データ永続化、オフライン、スプレッドシート |
| [architecture/04_cost-and-operations-analysis.md](architecture/04_cost-and-operations-analysis.md) | 費用・個人運用負荷分析 | 初期・月額・年額費用（0円運用）、Apple Developer費用回避、地図API費用 | コスト見積もり時、運用設計時 | **確定** | 運用コスト、インフラ維持 |
| [architecture/05_recommended-architecture.md](architecture/05_recommended-architecture.md) | 推奨構成と総合評価 | 条件付き第一候補（PWA+Workers+Hybrid）、第2候補、不採用理由 | アーキテクチャ確定時 | **確定** | アーキテクチャ全体 |
| [architecture/09_b2-audit-and-corrections.md](architecture/09_b2-audit-and-corrections.md) | **B2.1アーキテクチャ監査・最終訂正記録** | 法令条文統一・BFF再設計・DIPS結果不明照合・不足モデル補全（Phase B2.1） | 実装前最終前提の確認時 | **確定** | アーキテクチャ全体、監査 |
| [architecture/10_system-boundaries.md](architecture/10_system-boundaries.md) | システム境界・モジュール責務 | 4大コンポーネントの厳格な責務境界、将来Capacitor拡張ポート設計 | Phase C実装時、境界確認時 | **確定** | システムアーキテクチャ |
| [architecture/11_data-authority.md](architecture/11_data-authority.md) | データ正本・権威・ライフサイクル | モデルD（ハイブリッド）提案、手修正尊重、競合防止プロトコル | データフロー設計時、同期実装時 | **確定** | データ権威、同期、台帳 |
| [architecture/12_domain-model.md](architecture/12_domain-model.md) | 概念データモデル・型定義・ID戦略 | 全主要エンティティ仕様、期限管理、複数機体対応、UUID v4戦略、冪等性 | スキーマ実装時、エンティティ設計時 | **確定** | ドメインモデル、DB設計 |
| [architecture/13_state-machines.md](architecture/13_state-machines.md) | 運航状態・DIPS通報状態マシン | 2つの独立状態マシン設計、結果不明照合（Reconciliation）、誤認防止UI | 状態管理実装時、UIフロー設計時 | **確定** | 運航制御、DIPS連携 |
| [architecture/14_offline-and-sync.md](architecture/14_offline-and-sync.md) | オフライン・同期・ストレージ保護 | オフラインマトリクス、重複防止戦略分離（シートUPSERT vs DIPS照合） | オフライン実装時、キュー設計時 | **確定** | オフライン、ストレージ保護 |
| [architecture/15_dips-adapter.md](architecture/15_dips-adapter.md) | DIPS 2.0 Adapter境界設計 | DRS/FPA/FPR論理分離、計画検索照合、未確認事項吸収、Mock設計 | DIPS連携実装時、テスト時 | **確定** | DIPS連携、外部API |
| [architecture/16_security.md](architecture/16_security.md) | セキュリティ・BFF・トークン管理 | BFF方式によるトークン隠蔽、Workers Secrets、暗号化Session Cookie | セキュリティレビュー時、認証実装時 | **確定** | セキュリティ、認証 |
| [architecture/17_map-and-airspace.md](architecture/17_map-and-airspace.md) | 地図・FlightArea・空域データ | 地図5層レイヤー、高度モデル、データソース確認区分、安全支援UI原則 | 地図機能実装時、空域判定時 | **確定** | 地図、空域規制 |
| [architecture/18_reports.md](architecture/18_reports.md) | 帳票生成・法令UI分離 | 国交省取扱要領準拠、3層パイプライン、オフライン成立条件、法令8区分 | 帳票実装時、PDF生成時 | **確定** | 帳票出力、法令遵守 |
| [architecture/19_failure-recovery.md](architecture/19_failure-recovery.md) | エラー分類・フェイルセーフ・復旧 | 10大エラー分類、現場障害耐性、JSONバックアップ復旧 | エラー処理実装時、耐障害設計時 | **確定** | 障害復旧、耐障害性 |
| [architecture/20_source-structure.md](architecture/20_source-structure.md) | ソースコード構造・依存ルール | モジュールツリー、オニオン単方向依存ルール、禁止依存関係 | Phase C開始時、リファクタリング時 | **確定** | プロジェクト構造、モジュール |
| [architecture/21_testing-strategy.md](architecture/21_testing-strategy.md) | テスト戦略・検証境界 | テストピラミッド、Vitest単体/統合テスト、iPhone/Pixel実機検証 | テストコード作成時、CI構築時 | **確定** | テスト、品質保証 |
| [architecture/22_migration-plan.md](architecture/22_migration-plan.md) | 現行システム移行・並行運用 | 現行GAS非破壊並行記録（Shadow Run）、データ継承、ロールバック | 移行テスト時、本番切替時 | **確定** | 移行計画、運用切替 |
| [architecture/23_implementation-roadmap.md](architecture/23_implementation-roadmap.md) | Phase C 実装ロードマップ | C0〜C9インクリメンタル実装手順、API非依存ルート、本番切替12大総合判定基準 | Phase C推進時、進捗管理時 | **確定** | 実装計画、マイルストーン |
| [architecture/24_b2.2-dips-manual-fallback-and-ledger.md](architecture/24_b2.2-dips-manual-fallback-and-ledger.md) | **DIPS API非依存・手動フォールバック・台帳設計** | 手動通報第一級対応、DIPS飛行計画台帳仕様、不変スナップショット、誤認防止5大ルール | DIPS連携設計時、台帳設計時 | **確定** | DIPS連携、外部台帳、手動支援 |
| [architecture/25_dips-flight-plan-field-mapping.md](architecture/25_dips-flight-plan-field-mapping.md) | **DIPS飛行計画通報フィールドマッピング・入力再利用・Geometry詳細設計** | API 1.9 No.1〜88全件マッピング、新設InsurancePolicy、Geometry Web/API差異、手動入力支援 | 通報機能実装時、スキーマ設計時 | **確定** | dips, flight-plan, schema |
| [architecture/26_dips-web-ui-verification.md](architecture/26_dips-web-ui-verification.md) | **DIPS Web飛行計画通報・実画面検証記録・API非依存計画作成** | 実画面操作観測(OBSERVED)、証拠レベル分類、API非依存計画作成機能、FlightAreaGeometry、役割分離 | 通報機能実装時、地図エディタ設計時、手動通報支援時 | **確定** | dips, web-ui, verification, flight-area, roles |
| [decisions/ADR-0006-dips-optional-and-manual-submission-ledger.md](decisions/ADR-0006-dips-optional-and-manual-submission-ledger.md) | ADR-0006: DIPS API非依存・手動通報・台帳独立保持 | API非依存完結、手動入力支援第一級サポート、提出不変スナップショットと台帳先行保存 | DIPS戦略検討時、意思決定確認時 | **確定** | DIPS連携、データ権威、ロードマップ |
| [decisions/ADR-0007-normalized-masters-and-business-reporting.md](decisions/ADR-0007-normalized-masters-and-business-reporting.md) | ADR-0007: 正規化マスター体系・共用機材・業務拡張・統合帳票 | 機種/機体分離、バッテリー共用、人員一元化、場所/空域分離、A4統合帳票(3領域) | データ設計時、帳票設計時、業務拡張時 | **確定** | ドメインモデル、帳票、台帳同期 |
| [decisions/README.md](decisions/README.md) | ADR（意思決定記録）目次 | アーキテクチャ決定記録の運用ルールおよび ADR-0000〜0007 一覧 | 技術的意思決定の確認時 | **確定** | アーキテクチャ選定全般 |

---

## 3. 正本ドキュメント・ディレクトリ配置

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
│   ├── ADR-0000-xxx.md 〜 ADR-0007-xxx.md
│   └── (ADR-0001〜0007: 承認済み・設計凍結)
└── architecture/                      # Phase B 設計書群
    ├── README.md                      # アーキテクチャ全体目次
    ├── 00_b1-audit-and-corrections.md # B1再監査・最終事実訂正
    ├── 01_frontend-runtime-comparison.md 〜 05_recommended-architecture.md
    └── 10_system-boundaries.md 〜 26_dips-web-ui-verification.md (Phase B2詳細設計・DIPS詳細マッピング・実画面検証)
```

---

## 4. 外部正本・参照リポジトリ

1. **基準アプリ（実装・法令運用判断の正本）**:
   - リポジトリ: `ikifuse/autel-evo-lite-flight-log`
   - 参照箇所: `01_ドローン運航記録_設計書/`, `docs/`, `src/`
2. **非公開調査メモ（DIPS調査・原本アーカイブ）**:
   - リポジトリ: `ikifuse/autel-evo-lite-flight-log-private-notes`
   - 参照箇所: `01_DIPS2.0_API調査.md` 〜 `10_ワンエビ原本アーカイブ保存状況.md`
