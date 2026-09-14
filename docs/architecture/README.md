# アーキテクチャ設計・詳細仕様（Phase B 目次・概要）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B（アーキテクチャ設計・正式凍結）/ Phase C0 開始

---

## 1. ディレクトリの構成と位置づけ

本ディレクトリは、新アプリ `drone-flight-ops`（現場でスマートフォン1台から準備〜DIPS通報〜飛行〜バッテリー交換〜日誌〜帳票出力までを一気通貫で行う総合運航管理アプリ）の**アーキテクチャ比較検討（Phase B1/B1.1/B1.2/B1.3）**および**詳細アーキテクチャ・実装前設計仕様（Phase B2）**を格納する正本設計書群です。

---

## 2. ドキュメント構成一覧

### Phase B1: 技術構成の比較検討・再監査・最終事実訂正
| ドキュメント | 主な内容 |
|---|---|
| [00_b1-audit-and-corrections.md](00_b1-audit-and-corrections.md) | **Phase B1.3 最終整合性修正・監査記録**（原本性表現の中立化・飛行可能誤認防止・DIPS表示整理） |
| [01_frontend-runtime-comparison.md](01_frontend-runtime-comparison.md) | アプリ実行方式の比較（PWA、Flutter、React Native/Expo、Capacitor、完全ネイティブ、GAS延長） |
| [02_backend-and-security-comparison.md](02_backend-and-security-comparison.md) | バックエンド候補とセキュリティ比較（Cloudflare Workers、Firebase、Supabase、GAS backend、自前サーバー） |
| [03_data-storage-and-sync-comparison.md](03_data-storage-and-sync-comparison.md) | データ保存方式・原本性比較（ローカルDB正本、スプレッドシート正本、クラウドDB、ハイブリッド） |
| [04_cost-and-operations-analysis.md](04_cost-and-operations-analysis.md) | 個人利用における費用比較（月額/年額、ストア費用、地図費用、運用リスク） |
| [05_recommended-architecture.md](05_recommended-architecture.md) | 総合評価・推奨アーキテクチャ（条件付き第一候補）、第2候補、不採用理由 |

### Phase B2 / B2.1: 詳細アーキテクチャ・監査・実装前設計書
| ドキュメント | 主な内容 |
|---|---|
| [09_b2-audit-and-corrections.md](09_b2-audit-and-corrections.md) | **Phase B2.1 実装前アーキテクチャ監査・最終訂正記録**（法令条文・BFF・DIPS照合・モデル改善） |
| [10_system-boundaries.md](10_system-boundaries.md) | システム境界・4大コンポーネント責務分離・Capacitor拡張ポート |
| [11_data-authority.md](11_data-authority.md) | 正本・データ権威モデル（モデルD推奨）・ライフサイクル・手動修正尊重 |
| [12_domain-model.md](12_domain-model.md) | 概念データモデル・主要エンティティ型定義・ID戦略（UUID v4）・冪等性 |
| [13_state-machines.md](13_state-machines.md) | 運航状態マシン ＆ DIPS通報状態マシンの分離と安全確認UI設計 |
| [14_offline-and-sync.md](14_offline-and-sync.md) | オフラインマトリクス・WebKit Persistent Storage多層防御・同期キュー |
| [15_dips-adapter.md](15_dips-adapter.md) | DIPS 2.0 Adapter境界（DRS/FPA/FPR分離・未確認事項吸収・Mock設計） |
| [16_security.md](16_security.md) | セキュリティ・client_secretエッジ秘匿・トークン管理・マスキング |
| [17_map-and-airspace.md](17_map-and-airspace.md) | 地図5層レイヤー・FlightArea（円/ポリゴン）・空域データソース選定 |
| [18_reports.md](18_reports.md) | 帳票生成パイプライン（PDF/CSV/Excel）・法令8区分とUI分離 |
| [19_failure-recovery.md](19_failure-recovery.md) | 10大エラー分類・現場障害フェイルセーフ・JSONバックアップ復旧 |
| [20_source-structure.md](20_source-structure.md) | ソースコードディレクトリ構造・オニオン依存方向ルール・禁止依存 |
| [21_testing-strategy.md](21_testing-strategy.md) | テスト戦略・Vitest単体/統合テスト・iPhone 13 / Pixel 6a実機検証 |
| [22_migration-plan.md](22_migration-plan.md) | 現行GASアプリ非破壊並行運用（Shadow Run）・資産継承・ロールバック |
| [23_implementation-roadmap.md](23_implementation-roadmap.md) | Phase C実装ロードマップ（C0〜C9マイルストーン・API非依存ルート） |
| [24_b2.2-dips-manual-fallback-and-ledger.md](24_b2.2-dips-manual-fallback-and-ledger.md) | **Phase B2.2 DIPS API非依存・手動通報フォールバック・飛行計画台帳詳細設計書** |
| [25_dips-flight-plan-field-mapping.md](25_dips-flight-plan-field-mapping.md) | **DIPS飛行計画通報フィールドマッピング・入力再利用・Geometry詳細設計書**（API 1.9 No.1〜88全件対応） |
| [26_dips-web-ui-verification.md](26_dips-web-ui-verification.md) | **DIPS Web飛行計画通報・実画面検証記録・API非依存計画作成**（OBSERVED/PENDING・FlightAreaGeometry・役割分離） |
| [27_output-kml-drive-and-mymaps.md](27_output-kml-drive-and-mymaps.md) | **出力・KML・Google Drive・My Maps連携設計**（3系統分離・1計画1KML・Drive自動保存・My Maps手動連携） |
| [../decisions/README.md](../decisions/README.md) | アーキテクチャ決定記録（ADR-0001〜ADR-0007: 正規化マスター・共用機材・業務利用拡張性・統合帳票） |
