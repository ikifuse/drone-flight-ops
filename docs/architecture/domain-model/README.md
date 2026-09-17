# Domain Model設計群

最終更新: 2026-09-15\
状態: Phase C0完了・Phase C1未着手（docs再編）

個別Entityの属性を正本として管理する。C1のschema/typeを調べる時は12_overviewから該当領域と12fを読む。

## 1. 文書と正本

| 文書 | 主要責務 |
|---|---|
| [12_overview.md](12_overview.md) | 関連図・責務と外部正本 |
| [12a_organization-and-personnel.md](12a_organization-and-personnel.md) | 組織・顧客・案件・人員マスター、Role/Actor境界（権限・所属・環境は [identity-and-access](../identity-and-access/README.md)） |
| [12b_aircraft-and-battery.md](12b_aircraft-and-battery.md) | 機種/機体・バッテリー型式/個体・互換・非飛行イベント |
| [12c_location-and-presets.md](12c_location-and-presets.md) | 場所・範囲/目的/安全Preset・運航Template |
| [12d_flight-plan-and-dips.md](12d_flight-plan-and-dips.md) | 許可・保険・計画・不変DipsSubmission |
| [12e_operation-inspection-maintenance.md](12e_operation-inspection-maintenance.md) | Mission/Flight・点検・整備・帳票発行 |
| [12f_common-lifecycle-id-and-audit.md](12f_common-lifecycle-id-and-audit.md) | 共通分類・監査・ID・一括登録準備 |

## 2. 読み順と変更境界

[architecture README](../README.md) → 本README → 対象文書。新しい詳細仕様をREADMEへ追記しない。Phase C0完了・C1未着手。各Phaseの範囲は [23](../23_implementation-roadmap.md)。
