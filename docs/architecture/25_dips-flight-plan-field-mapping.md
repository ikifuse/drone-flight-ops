# 25. DIPS Flight Plan設計の移行案内

最終更新: 2026-09-15

本書の詳細は責務別に[DIPS Flight Plan設計群](dips-flight-plan/README.md)へ移行した。旧リンク・Accepted ADRの参照継続のため入口を残す。

- [全体境界・通報入力支援原則](dips-flight-plan/25_overview.md)
- [No.1〜88フィールドカタログ](dips-flight-plan/25a_field-catalog.md)
- [Manual Web入力支援](dips-flight-plan/25b_manual-web-mapping.md)
- [C7 Optional API payload](dips-flight-plan/25c_api-payload-mapping.md)
- [3軸要件・validation](dips-flight-plan/25d_requirement-validation.md)

保険・計画・提出Entityは[12d](domain-model/12d_flight-plan-and-dips.md)、Geometryは[17](17_map-and-airspace.md)、通報要否・離陸判断は[13c](state-machines/13c_takeoff-readiness.md)、観測/PENDINGは[26](26_dips-web-ui-verification.md)を正本とする。旧章の詳細定義は本書へ戻さない。
