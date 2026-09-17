# 出力・外部保存設計 目次

最終更新: 2026-09-15。C1では以下の出力・通信機能を実装しません。

| 正本文書 | 主要責務 | 読む場面 |
|---|---|---|
| [27 出力境界](27_output-boundaries.md) | Sheets/PDF/KML/JSON内部通信の役割とポート・障害独立 | 出力全体の判断、変更影響確認 |
| [27a KML生成](27a_kml-export.md) | ファイル単位・XML・Geometry変換・属性・命名・SHARE_SAFE | KML生成・プライバシー変更 |
| [27b Drive保存](27b_google-drive-storage.md) | 保存先設定・非同期保存・更新方針 | Drive Adapter変更 |
| [27c My Maps運用](27c_google-mymaps-workflow.md) | 手動インポート・公式確認・実機検証待ち | My Mapsの操作・再現性確認 |
| [27d 機体ログ取込](27d_aircraft-flight-log-import.md) | メーカー原本ログ・実軌跡の将来拡張 | 機体ログ取込の検討 |

最初に27で境界を確認し、変更対象の詳細1冊へ進みます。Geometryは [17](../17_map-and-airspace.md)、Data Authorityは [11](../11_data-authority.md)、SyncQueueは [14](../14_offline-and-sync.md)、Reportsは [18](../18_reports.md)、Securityは [16](../16_security.md) が正本です。API JSONの詳細は [25c](../dips-flight-plan/25c_api-payload-mapping.md) へ進みます。

全量DB backup/restore形式は [ADR-0008](../../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) により `PENDING`。KMLをバックアップ代替にしません。上位入口は [architecture/README](../README.md)、総合入口は [docs/00_index](../../00_index.md) です。
