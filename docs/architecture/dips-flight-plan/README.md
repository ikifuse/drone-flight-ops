# DIPS Flight Plan設計群

最終更新: 2026-09-15

手動入力支援はC6第一級、API送信はC7 Optional。まず[25 overview](25_overview.md)で通報入力支援原則と境界を読み、変更対象だけへ進む。

| 文書 | 主要責務 | 読む場面 |
|---|---|---|
| [25 overview](25_overview.md) | 入口・通報入力支援原則・正本関係 | 全体境界を確認 |
| [25a field catalog](25a_field-catalog.md) | No.1〜88の契約参照と意味対応 | 外部フィールドを調べる |
| [25b manual web mapping](25b_manual-web-mapping.md) | 登録Picker・checkbox・コピー・確認ViewModel | C6手動支援を変更 |
| [25c API payload mapping](25c_api-payload-mapping.md) | DTO・コード変換・内部JSON・送信証跡 | C7承認後にAPI契約を変更 |
| [25d requirement validation](25d_requirement-validation.md) | 3軸評価・有効値・入力充足 | 必須性・提出準備を変更 |

Geometry一般仕様は[17](../17_map-and-airspace.md)、Entity schemaは[Domain設計群](../domain-model/README.md)、Web観測・PENDINGは[26](../26_dips-web-ui-verification.md)。本READMEに詳細定義を追加しない。

上位入口: [architecture README](../README.md) → [docs index](../../00_index.md)。
