# 設計文書移植の記録

最終更新: 2026-09-19

本領域は移植元の識別、対象範囲、因果の移管先、検査結果を案内する。設計仕様の追加正本ではない。詳細は[概念別正本表](../architecture/README.md#3-主要概念の正本)、記録方法は[設計証拠規約](../guidelines/03_design-evidence-and-causality.md)を参照する。

| 記録 | 範囲・停止位置 |
|---|---|
| [99.2 再移植 Step 1](99-2-step-1-causal-audit.md) | 基準ea73d08から§0・§1。完了commit cab30e4。監査は当時の範囲を保持 |
| [99.2 再移植 Step 2](99-2-step-2-causal-audit.md) | cab30e4から§2のみ。完了commit 7130f69。正式設計はidentity-and-access。監査は当時の範囲を保持 |
| [99.2 再移植 Step 3](99-2-step-3-causal-audit.md) | 7130f69から§4と取得確認・点検整備Actorに直接必要な§6の部分のみ。完了commit ed21ed4。正式設計はasset-management。監査は当時の範囲を保持 |
| [99.2 再移植 Step 4](99-2-step-4-causal-audit.md) | ed21ed4から§7のDIPS API基盤・固定IP・通信境界のみ。完了commit b2a7a94。正式設計はdips-infrastructure／16。監査は当時の範囲を保持 |
| [99.2 再移植 Step 5](99-2-step-5-causal-audit.md) | b2a7a94から§3全体と§7の正常受付後・共有リスト限定部分。完了commit 0a29251。正式設計はpresentation 34a〜34d。監査は当時の範囲を保持 |
| [99.2 再移植 Step 6](99-2-step-6-causal-audit.md) | 0a29251から§5・§6残り・§10、完了commit b1d5788。最新A4の直接確認。続く[追補監査](99-2-step-6-causal-audit.md#7-step-6追補機体個体別保存と日付連番)は機体別保存と命名のみ（完了commit 01eeac3）。詳細正本は35a〜35d／36／37。§7残り・§8・§9全体・§11は対象外 |
| [99.2 再移植 Step 7a](99-2-step-7a-causal-audit.md) | 01eeac3から§7の実画面確認・共通Geometry・submission_snapshot・Manual／API経路・DIPS対象外のみ（`claude/99-2-continuation`）。完了commit 1695c72。正式設計はdips-flight-planの25eと証拠記録26、判断はADR-0023（Proposed）。§7の残り・§8・§9全体・§11は対象外 |
| [99.2 再移植 Step 7b](99-2-step-7b-causal-audit.md) | 1695c72から§7の06の記録責任・作業台帳・取消／リスト整理の境界のみ（`claude/99-2-continuation`）。完了commit 48435d9。正式設計はdips-submissionの24b、追補はADR-0022（Proposed）。KML・§8・§9全体・§11は対象外 |
| [99.2 再移植 Step 7c](99-2-step-7c-causal-audit.md) | 48435d9から§7・§8・§9のKMLの位置づけ・単位・生成契機・内容・未同期の保持と再送のみ（`claude/99-2-continuation`）。完了commit 99b47b1。正式設計はoutputの27e、判断はADR-0024（Proposed）。PDF・履歴出力・§9のcache等・§11は対象外 |
| [99.2 再移植 Step 7d](99-2-step-7d-causal-audit.md) | 99b47b1から§8のPDFの役割分離・生成方針・地図付きPDFと、飛行履歴・出力の画面のみ（`claude/99-2-continuation`）。完了commit 41d0dd4。正式設計はoutputの27fとpresentationの34e、判断はADR-0025（Proposed）。§9のcache等・§11は対象外 |
| [99.2 再移植 Step 7e](99-2-step-7e-causal-audit.md) | 41d0dd4から§9の正本・端末cache・正本確認・確定／保存／外部反映の時点分離・費用の境界と未確定のみ（`claude/99-2-continuation`）。完了commit 15471f8。正式設計はsync-and-cacheの38a・38bと37 §6、判断はADR-0026・0027（Proposed）。§11は対象外 |
| [99.2 再移植 Step 8](99-2-step-8-diff-audit.md) | 15471f8から§11の差分監査のみ（`claude/99-2-continuation`）。現状差分8項目・旧案の残存・回収12項目・原本の行の使用状況を対照し、00_goalの旧記述を訂正。新しい設計判断・ADRなし。完了commitはGit履歴。PENDING／VERIFYの解決ではない |

99.2全文や旧Step 1〜8の移植結果をコピーしない。mainの旧成果は比較証拠として保存し、このブランチの移植元にはしない。
