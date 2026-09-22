# DIPS Flight Plan設計群

最終更新: 2026-09-22

手動入力支援はC6第一級、API送信はC7 Optional。まず[25 overview](25_overview.md)で通報入力支援原則と境界を読み、変更対象だけへ進む。共通の源からManual／APIを分ける因果は25eに置く。

| 文書 | 主要責務 | 読む場面 |
|---|---|---|
| [25 overview](25_overview.md) | 入口・通報入力支援原則・正本関係 | 全体境界を確認 |
| [25a field catalog](25a_field-catalog.md) | No.1〜88の契約参照と意味対応 | 外部フィールドを調べる |
| [25b manual web mapping](25b_manual-web-mapping.md) | 登録Picker・checkbox・コピー・確認ViewModel | C6手動支援を変更 |
| [25c API payload mapping](25c_api-payload-mapping.md) | DTO・コード変換・内部JSON・送信証跡 | C7承認後にAPI契約を変更 |
| [25d requirement validation](25d_requirement-validation.md) | 3軸評価・有効値・入力充足 | 必須性・提出準備を変更 |
| [25e common source and boundaries](25e_common-source-and-submission-boundaries.md) | 共通の源（計画・Geometry・不変Snapshot）、Manual／API経路、DIPS対象外の境界の因果・却下案・再検討条件 | 経路・出力・対象外の扱いを変更する前に理由を確認 |

Geometry一般仕様は[17](../17_map-and-airspace.md)、Entity schemaは[Domain設計群](../domain-model/README.md)、Web観測・PENDINGは[26](../26_dips-web-ui-verification.md)。本READMEに詳細定義を追加しない。

上位入口: [architecture README](../README.md) → [docs index](../../00_index.md)。

API電文をどの経路から送るかは[dips-infrastructure](../dips-infrastructure/README.md)、正式認証の確認待ちは[16](../16_security.md)。本領域のMapper／DTO／Snapshot詳細をインフラ正本へ移さない。

2026-09-22: [設計モックへの反映と未決の境界](25b_manual-web-mapping.md)を更新。標準候補と比較案を区別し、実装凍結を維持する。
