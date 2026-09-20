# CLAUDE.md — Claude Code 用の入口

@AGENTS.md

上の取り込み（`AGENTS.md`）が、プロジェクトの目的・現在のPhase・読み順・全体ルールの正本で、他のAIと共有する。このファイルは、Claude Code に固有の追加事項だけを置く。詳細規約は複製せず、正本のDocsを参照する。

## 設計Docsを追加・更新・整理するとき

- `docs/`配下の設計書・ADR・INDEX・README・open-questions を追加・更新・整理する作業では、依頼文に設計原則が書かれていなくても、必ず Skill `design-docs-update`（[SKILL.md](.claude/skills/design-docs-update/SKILL.md)）の手順に従う。
- Skill は、読む正本・確認項目・反映の順序だけを持つ。規約の本文は`docs/guidelines/`・`docs/decisions/README.md`・`docs/architecture/README.md`が正本で、Skill や本書へ複製しない。
- 依頼文がブランチ・commit・push・merge・対象範囲を指示している場合は、その指示に従う。
