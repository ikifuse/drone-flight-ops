# 出力・外部保存設計 目次

最終更新: 2026-09-19。C1では以下の出力・通信機能を実装しません。

| 正本文書 | 主要責務 | 読む場面 |
|---|---|---|
| [27 出力境界](27_output-boundaries.md) | Sheets/PDF/KML/JSON内部通信の役割とポート・障害独立 | 出力全体の判断、変更影響確認 |
| [27a KML生成](27a_kml-export.md) | ファイル単位・XML・Geometry変換・属性・命名・SHARE_SAFE | KML生成・プライバシー変更 |
| [27b Drive保存](27b_google-drive-storage.md) | 保存先設定・非同期保存・更新方針 | Drive Adapter変更 |
| [27c My Maps運用](27c_google-mymaps-workflow.md) | 手動インポート・公式確認・実機検証待ち | My Mapsの操作・再現性確認 |
| [27d 機体ログ取込](27d_aircraft-flight-log-import.md) | メーカー原本ログ・実軌跡の将来拡張 | 機体ログ取込の検討 |
| [27e KML生成契機・内容](27e_kml-generation-timing-and-content.md) | 位置づけ・単位（1飛行1KML）・飛行計画通報時の生成・未同期の保持と最後の送信時の再送・内容の確定境界 | KMLの生成契機・内容・単位の変更前に理由を確認 |
| [27f 派生PDFの役割・生成契機](27f_derived-pdf-roles-and-map-pdf.md) | A4運航記録PDFと地図付きPDFの役割分離・必要な時だけ生成する方針・地図付きPDFの配置の方向と未確定 | PDFの役割・生成契機・地図付きPDFの変更前に理由を確認 |

最初に27で境界を確認し、変更対象の詳細1冊へ進みます。Geometryは [17](../17_map-and-airspace.md)、Data Authorityは [11](../11_data-authority.md)、SyncQueueは [14](../14_offline-and-sync.md)、Reportsは [18](../18_reports.md)、Securityは [16](../16_security.md) が正本です。API JSONの詳細は [25c](../dips-flight-plan/25c_api-payload-mapping.md) へ進みます。

全量DB backup/restore形式は [ADR-0008](../../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) により `PENDING`。KMLをバックアップ代替にしません。上位入口は [architecture/README](../README.md)、総合入口は [docs/00_index](../../00_index.md) です。

Step 5の［飛行履歴・出力］という入口と、04／06を源に07へ接続する画面責任は[34b](../presentation/34b_home-and-navigation.md)。本領域のKMLの生成契機・保存・再送・内容はStep 7cで27eへ配置した（ホーム入口の追加から内容・タイミングを変更しない）。PDFの役割分離・生成契機はStep 7dで27f、［飛行履歴・出力］の画面は[34e](../presentation/34e_history-and-output.md)へ配置した。

Step 6のA4実物・印刷可能Sheets・必要時PDFは[35c](../operation-recording/35c_a4-operation-record.md)、運用環境全体のDrive配置責任は[37](../drive-structure/37_environment-storage-responsibilities.md)。27bはKML保存だけを担当し、生成契機・単位・内容は27e、My Mapsは27cが担当する。
