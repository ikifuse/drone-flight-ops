# アーキテクチャ設計目次

最終更新: 2026-09-15\
状態: Phase B設計凍結 / C0 Shell構築完了・C1設計準備完了 / C1未着手（C0受入確認・オーナーGO待ち）

## 1. 本目次の役割と読み順

[総合目次](../00_index.md)から本書へ進み、対象領域のREADMEと正本詳細文書を読みます。ここには仕様本文を複製せず、責務・正本・状態・履歴を案内します。C1ではまずDomain READMEから必要なschema/typeへ進みます。採用根拠と部分置換は [ADR一覧](../decisions/README.md)（ADR-0001〜0007、追加ADR-0008/0009）を参照してください。

## 2. 現行設計の入口

| 入口 / 文書 | 主責務・読む場面 |
|---|---|
| [domain-model README](domain-model/README.md) | ER・領域別Entity・共通ライフサイクル/ID/監査。C1型・schema実装の入口 |
| [state-machines README](state-machines/README.md) | Operation FSM / DIPS FSM / 法令・安全総合評価。C2/C6/C7の独立状態管理 |
| [dips-submission README](dips-submission/README.md) | Manual通報業務と独立Sheets台帳。C4/C6の境界 |
| [dips-flight-plan README](dips-flight-plan/README.md) | 公式88項目、Manual Web UI、C7 payload、要件エンジンの責務分離 |
| [dips-infrastructure README](dips-infrastructure/README.md) | DIPS API接続インフラ・固定送信元IPゲートウェイ・秘密情報保護。C7インフラ境界 |
| [output README](output/README.md) | JSON/KML/Sheets/PDF境界、KML生成、Drive保存、My Maps操作、将来機体ログ |
| [identity-and-access README](identity-and-access/README.md) | 三層権限・業務役割・アプリ機能権限・運用環境・所属ライフサイクル |
| [10_system-boundaries](10_system-boundaries.md) | システム間責務・障害境界・将来ネイティブ拡張ポート |
| [11_data-authority](11_data-authority.md) | Model Dのライフサイクル別権威・確定台帳・手修正保護 |
| [14_offline-and-sync](14_offline-and-sync.md) | オフライン成立条件・Storage保護・SyncQueue・再試行 |
| [15_dips-adapter](15_dips-adapter.md) | Manual / Mock / Optional APIの共通Adapter・DRS/FPA/FPR・結果不明照合 |
| [16_security](16_security.md) | BFF・秘密情報・セッション・マスキング・開示境界（三層権限概要） |
| [17_map-and-airspace](17_map-and-airspace.md) | 中立Geometry・地図層・編集・空域情報・データ鮮度・ライブラリ留保 |
| [18_reports](18_reports.md) | 帳票パイプライン・ReportUnit・スナップショット・区切り・続紙・法令UI分離 |
| [19_failure-recovery](19_failure-recovery.md) | 障害分類・業務継続・復旧できる範囲・未決の全DB復旧 |
| [20_source-structure](20_source-structure.md) | C0実装との関係・将来source責務配置・依存方向 |
| [21_testing-strategy](21_testing-strategy.md) | 単体/統合/実機の検証境界・Manual/API別シナリオ |
| [22_migration-plan](22_migration-plan.md) | 旧GAS非破壊移行・Shadow Run・資産継承・切替/復帰 |
| [23_implementation-roadmap](23_implementation-roadmap.md) | C0〜C9の範囲・受入基準・C7スキップ経路・現在の停止位置 |
| [26_dips-web-ui-verification](26_dips-web-ui-verification.md) | OBSERVED / OFFICIAL_SPEC / INFERRED / PENDINGを保つ実画面の証拠資料 |
| [28_c1-docs-restructure-audit](28_c1-docs-restructure-audit.md) | 今回の全docs責務監査・移行対照・整合修正・最終検査記録 |
| [31_dedicated-egress-ip-gateway](dips-infrastructure/31_dedicated-egress-ip-gateway.md) | Google Cloud NAT・VPC Egress・固定IP・認証トークン隔離詳細 |

設計の基準は確定でも、PENDINGは未解決です。26番は証拠資料であり、現行型・UI契約は上表の対応する設計正本に置きます。

## 3. 主要概念の正本

| 概念 | 唯一の詳細正本 | 他文書で扱う範囲 |
|---|---|---|
| FlightAreaGeometry | [17](17_map-and-airspace.md) | 12は型参照、25cはDIPS変換、27aはKML変換 |
| Personnel / Actor / Pilot / Contact | [12a](domain-model/12a_organization-and-personnel.md) | 26は観測/未確認、25bは選択UI、権限・所属はidentity-and-access |
| 三層権限 / 業務役割 / 運用環境・所属 | [identity-and-access](identity-and-access/README.md) | 16は境界原則のみ、12aは業務役割参照 |
| Aircraft / Battery / Compatibility | [12b](domain-model/12b_aircraft-and-battery.md) | 18/24aは射影・外部保存 |
| Location / Preset / Template | [12c](domain-model/12c_location-and-presets.md) | 17はGeometry参照、25は再利用方法 |
| FlightPlan / DipsSubmission / semantic snapshot | [12d](domain-model/12d_flight-plan-and-dips.md) | 状態全値は13b、API電文は25c、24aは台帳への保存 |
| Mission / Flight / Inspection / Maintenance | [12e](domain-model/12e_operation-inspection-maintenance.md) | 13aは状態、18は帳票射影 |
| 共通Lifecycle / ID / AuditEvent | [12f](domain-model/12f_common-lifecycle-id-and-audit.md) | 各領域は利用する監査イベント・制約だけ |
| Operation FSM | [13a](state-machines/13a_operation.md) | Missionのデータ項目は12e |
| DipsSubmission status / lifecycle | [13b](state-machines/13b_dips-submission.md) | DipsSubmissionの保存schemaは12d |
| DipsReportingRequirement / TakeoffReadinessAssessment | [13c](state-machines/13c_takeoff-readiness.md) | 25dの入力完備性と混同しない |
| DipsFieldRequirement / validation / SUBMISSION_READY | [25d](dips-flight-plan/25d_requirement-validation.md) | 25aは公式カタログの要約タグ |
| DIPS No.1〜88 | [25a](dips-flight-plan/25a_field-catalog.md) | API操作ごとの未精査箇所はPENDING |
| Manual DIPS業務 | [24](dips-submission/24_manual-submission.md) | 15はAdapter呼出、25bは画面・ViewModel |
| Manual Web mapping / Assistance ViewModel | [25b](dips-flight-plan/25b_manual-web-mapping.md) | 24は通報記録フローのみ |
| DIPS Submission Assistance Principle | [25 overview](dips-flight-plan/25_overview.md) | 要件と24は要約/リンク |
| Data Authority | [11](11_data-authority.md) | 台帳/同期/出力はこの権威分担に従う |
| SyncQueue | [14](14_offline-and-sync.md) | 各Adapterは対象ジョブ・失敗処理を参照 |
| Sheets Ledger | [24a](dips-submission/24a_submission-and-sheets-ledger.md) | 12にSheets列を重複定義しない |
| DIPS API JSON | [25c](dips-flight-plan/25c_api-payload-mapping.md) | 通信Adapterは15、27は内部transportという境界のみ |
| DIPS API接続インフラ / 固定送信元IP | [dips-infrastructure](dips-infrastructure/README.md) | 10は全体境界、16はセキュリティ境界、31は詳細設計、25cはAPI payload |
| 出力・復旧の形式境界 | [27](output/27_output-boundaries.md) | ADR-0008は決定理由、全量restoreはPENDING |
| KML | [27a](output/27a_kml-export.md) | Drive/My Mapsは保存・利用のみ |
| Drive Storage | [27b](output/27b_google-drive-storage.md) | 14はキュー共通契約、KML生成とは別 |
| My Maps | [27c](output/27c_google-mymaps-workflow.md) | 実アカウントの表示検証はPENDING |
| Aircraft flight-log import | [27d](output/27d_aircraft-flight-log-import.md) | 将来入力境界、Flight実績の自動確定ではない |
| Reports / ReportUnit / ReportSnapshot | [18](18_reports.md) | 12はEntity参照・FK、27は形式境界 |
| Security | [16](16_security.md) | KMLの具体的な開示プロファイルは27a |

## 4. 比較・監査の履歴

以下は当時の比較・監査記録です。本文の旧提案を現行契約として再採用しません。最新の採用範囲はADRと§2/§3の設計を読みます。

| 文書 | 保存する検討・証拠 |
|---|---|
| [00_b1-audit-and-corrections](00_b1-audit-and-corrections.md) | B1.3最終整合・事実訂正・当時の未確認事項 |
| [01_frontend-runtime-comparison](01_frontend-runtime-comparison.md) | PWA / Flutter / React Native / Capacitor / Native / GAS比較 |
| [02_backend-and-security-comparison](02_backend-and-security-comparison.md) | Workers / Firebase / Supabase / GAS等の費用・秘密境界比較 |
| [03_data-storage-and-sync-comparison](03_data-storage-and-sync-comparison.md) | ローカル・Sheets・クラウドの保存/権威候補 |
| [04_cost-and-operations-analysis](04_cost-and-operations-analysis.md) | 当時の規模・無料枠・費用・個人運用負荷の評価 |
| [05_recommended-architecture](05_recommended-architecture.md) | B1の第一候補・代替案・却下理由・見直し条件 |
| [09_b2-audit-and-corrections](09_b2-audit-and-corrections.md) | B2.1の状態・法令・認証・データモデル訂正履歴 |

## 5. 旧番号からの移行案内

旧文書はリンク履歴を保つための案内だけを残します。詳細仕様の追記先にせず、§2の領域READMEから正本へ進んでください。

| 旧入口 | 現在の領域 |
|---|---|
| [12_domain-model](12_domain-model.md) | domain-model |
| [13_state-machines](13_state-machines.md) | state-machines |
| [24_b2.2-dips-manual-fallback-and-ledger](24_b2.2-dips-manual-fallback-and-ledger.md) | dips-submission |
| [25_dips-flight-plan-field-mapping](25_dips-flight-plan-field-mapping.md) | dips-flight-plan |
| [27_output-kml-drive-and-mymaps](27_output-kml-drive-and-mymaps.md) | output |
