# DIPS 接続インフラ・固定IPゲートウェイ設計群

最終更新: 2026-09-18\
状態: 設計整合（C1未着手・C7 Optional基盤）\
主責務: DIPS API接続におけるネットワーク境界、Google Cloud NAT専用固定送信元IPゲートウェイ、認証情報隔離。

## 1. 目的と位置づけ

本書群は、国土交通省のドローン情報基盤システム（DIPS 2.0）APIとの連携において要件とされる**専用固定送信元IPアドレス要件**および**機密情報（Client Secret / 認証情報）の保護**を充足するための接続インフラストラクチャを規定します。

本インフラは **Phase C7 Optional** に属し、Phase C6までのコア機能（手動通報支援、現場運航管理、飛行日誌、日常点検、点検整備履歴、A4運航帳票出力、Google Drive保存）から独立して動作可能な境界を設けます。API接続インフラの稼働状況や申請審査状況が、非API機能の現場運用を阻害することはありません。

## 2. 文書一覧と責務

| 文書 | 主要責務 | 読む場面 |
|---|---|---|
| [README.md](README.md) | サブシステムの全体像、責任境界、他領域との関係 | 最初に読む |
| [31_dedicated-egress-ip-gateway.md](31_dedicated-egress-ip-gateway.md) | Google Cloud NAT固定送信元IPゲートウェイの論理構成、認証情報隔離、障害分離、外部仕様検証 | 詳細インフラ設計時 |

## 3. 他専門領域との責任境界（二重正本の排除）

本サブシステムは「接続インフラ・通信経路・機密隔離」に特化し、業務ロジックやデータ定義は各専門領域のSSOTを参照します。

- **空域・幾何モデル（Geometry）**: [17_map-and-airspace.md](../17_map-and-airspace.md) が唯一の正本（POLYGON, CIRCLE, BUFFERED_LINE）。
- **DIPS手動通報業務・台帳保存**: [dips-submission/](../dips-submission/README.md) が唯一の正本（[24 手動通報](../dips-submission/24_manual-submission.md)、[24a Sheets台帳](../dips-submission/24a_submission-and-sheets-ledger.md)）。
- **DIPS入力項目・APIペイロード変換**: [dips-flight-plan/](../dips-flight-plan/README.md) が唯一の正本（[25a カタログ](../dips-flight-plan/25a_field-catalog.md)、[25c API payload mapping](../dips-flight-plan/25c_api-payload-mapping.md)）。本書は変換結果電文の安全な送出のみを担い、変換マッピング規則を所有しない。
- **DIPS通報状態機械（FSM）**: [state-machines/13b_dips-submission.md](../state-machines/13b_dips-submission.md) が状態遷移および照合フローの正本。
- **KML生成・外部保存**: [output/27a_kml-export.md](../output/27a_kml-export.md) が通報時生成および未同期再送の正本。
- **全社セキュリティ原則**: [16_security.md](../16_security.md) が三層権限および機微情報非公開の基本原則。

上位入口: [architecture README](../README.md) → [docs index](../../00_index.md)。
