---
name: design-docs-update
description: 設計Docs（docs/配下の設計書・ADR・INDEX・README・open-questions）を追加・更新・整理するときの恒常ルーティン。読む正本の順序、Responsibility Check、因果・状態・証拠の扱い、正本の一元化、ADR判断、INDEX／README／相互参照の整合確認を、既存の正本Docsへの参照として毎回実行する。設計仕様・因果関係・未確定事項・保存構造・画面・帳票・BATなどの設計変更をDocsへ反映する依頼や、docs/配下のMarkdownを編集する依頼で使う。実装コード（src等）の変更には使わない。
---

# 設計Docs更新ルーティン

このSkillは実行手順だけを持つ。規約の本文は下記の正本にあり、ここへ複製しない。手順と正本が食い違うときは正本を優先し、このSkillを直す。

## 1. 着手前

1. 依頼範囲を確認する。設計Docsだけを扱い、実装コード（C1を含む）へ進まない（[AGENTS.md](../../../AGENTS.md) §2）。ブランチ・commit・push・mergeは依頼の指示に従う。
2. `git status`で既存の未commit変更を確認する。
3. Git管理外の参照資料（99.2原本など）は、変更せず、追跡にも加えない（[移植記録](../../../docs/migration/README.md)の各Step監査の扱い）。

## 2. 読む（入口から順に、必要な正本だけ）

1. [AGENTS.md](../../../AGENTS.md) → [docs/00_index.md](../../../docs/00_index.md) → 対象領域のREADME。
2. 対象の正本を[概念別正本表](../../../docs/architecture/README.md#3-主要概念の正本)で特定し、その文書と直接の関連文書を読む。
3. 規約を読む。
   - [構造・保守規約](../../../docs/guidelines/01_structure-and-maintenance-rules.md) §6（Responsibility Check）
   - [設計証拠・因果規約](../../../docs/guidelines/03_design-evidence-and-causality.md)
   - 法令・行政資料が根拠なら[法令・運用規約](../../../docs/guidelines/02_legal-and-operations-rules.md)
4. 既決・未確定を確認する: [04_open-questions](../../../docs/04_open-questions.md)、関係するADR（[ADR一覧](../../../docs/decisions/README.md)）。既存Docsで決着済みの点は再質問しない（設計証拠・因果規約 §5）。

## 3. 判断する（毎回行い、結果を報告に残す）

1. **Responsibility Check**: 構造・保守規約 §6に従って判定し、追記先（既存文書／サブ文書／新文書・新領域）を決める。
2. **正本の一元化**: 概念別正本表で正本を特定する。登録と他文書の扱いは構造・保守規約 §6に従う。
3. **因果・状態・証拠**: 設計証拠・因果規約の§2（因果）・§3（状態ラベルと由来）・§4（実物確認）を適用する。オーナーへ確認するか自分で決めるかは§5で判断する。
4. **ADR判断**: [ADR一覧・運用ルール](../../../docs/decisions/README.md)の記録対象と置換の規則に照らし、既存ADRで足りるか確認してから、追加・置換の要否を決める。

## 4. 反映する（この順）

1. 正本文書 → 関連文書の参照 → 領域README → 概念別正本表 → [00_index](../../../docs/00_index.md) → 04_open-questions（PENDING／VERIFYの所在）。実装開始ゲートに関わる場合は[23](../../../docs/architecture/23_implementation-roadmap.md)。
2. 新設・移動・分割・廃止では、領域READMEと上位目次を同時に更新する（構造・保守規約 §6）。
3. 更新した文書の「最終更新」日を直す。

## 5. 検査する

1. リポジトリのルートで `python3 .claude/skills/design-docs-update/scripts/check_docs.py` を実行する。相対リンクとアンカー、表の列数、fence、入口からの到達性、追加行の個人情報・秘密情報、文書以外の差分を検査する。エラーが出たら直して再実行する。
2. 構造・保守規約 §6末尾の最終確認項目のうち、スクリプトで見られないもの（二重正本、旧仕様と履歴の区別、Phase）を、`git diff`を読んで確認する。
3. 依頼範囲外の変更・削除、承認済みADR本文の変更がないことを、`git diff`で確認する。

## 6. 保存と報告

1. commit・pushは[AGENTS.md](../../../AGENTS.md) §4.1と依頼の指示に従う。
2. 報告に含める: どの責任をどの文書へ配置したか（Responsibility Checkの結果）／新規ADRの有無／状態区分／残った未確定／検査結果。
