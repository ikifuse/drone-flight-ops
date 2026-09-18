# DIPS API接続基盤と通信境界

最終更新: 2026-09-18\
対象: 99.2再移植Step 4、§7の固定送信元IP・接続基盤・秘密情報・通信障害境界のみ

| 文書 | 唯一の詳細責任 |
|---|---|
| [33a 固定出口と接続方針](33a_fixed-egress-and-api-connection.md) | 旧GAS／Workersから航空局確認、Google Cloud＋Cloud NATへの因果、固定IP、限定バックエンド、実行基盤の未決 |
| [33b API可用性と再試行境界](33b_api-availability-and-retry-boundaries.md) | Manual独立、API障害の非波及、通常同期とDIPS POSTの違い・二重通報防止の因果 |

秘密情報の隔離理由・旧BFF／Cookie候補・正式認証の確認待ちは[16](../16_security.md)が詳細正本。33aは安全な送信経路、[15](../15_dips-adapter.md)はAdapter、[25c](../dips-flight-plan/25c_api-payload-mapping.md)はAPI電文変換、[13b](../state-machines/13b_dips-submission.md)は状態遷移、[14](../14_offline-and-sync.md)はキューの契約を扱う。相互に詳細を複製しない。

[architecture正本表](../README.md#3-主要概念の正本) → 本README → 該当正本の順に読む。[ADR-0018](../../decisions/ADR-0018-dips-fixed-egress-and-limited-backend.md)は重要判断と限定置換の記録（Proposed）、[Step 4監査](../../migration/99-2-step-4-causal-audit.md)は移管・証拠・検査の索引。[7状態規約](../../guidelines/03_design-evidence-and-causality.md)に従い、現在ベースライン・ADR承認・外部確認・実装完了を区別する。

§7全体を移植したものではない。Geometry・Manual UI・payload詳細・共有飛行リスト・正常応答後の遷移・重複調整・KML生成／保存／再送等は対象外。§3・§5・§6残り・§8以降も未移植。コード、Google Cloud設定、DIPS本番環境は変更せず、[23の開始ゲート](../23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)を維持する。

上記はStep 4時点の対象境界。Step 5で§3と§7の正常受付後・共有リストの限定部分を[Presentation 34a〜34d](../presentation/README.md)へ移管した。33a／33bの接続経路・認証VERIFY・通信安全の本文は保持し、UI文書でその詳細を再定義しない。
