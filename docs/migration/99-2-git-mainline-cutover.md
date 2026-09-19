# Git本線の整理（旧mainから99.2再移植の本線へ）

最終更新: 2026-09-19

## 1. 目的と結論

`main`は、99.2の最初の移植作業（Codex）が積まれた古い状態だった。因果を保持して再移植し直した現在の設計は、別の系統（`redo/99-2-causal-migration`から続く`claude/99-2-continuation`）にある。この記録は、両者を内容と履歴の両面で比較し、`main`を現在の系統へ非破壊で整理した根拠と方法を残す。設計仕様の追加正本ではない。

結論: 現在の系統を新しい本線にする。旧mainを現在の系統へmergeして内容を混ぜることはしない。旧mainは、バックアップとして`archive/main-before-99-2-redo-20260919`（ブランチ）と`backup/main-6344d7a-20260919`（注釈付きタグ）に残す。履歴の書き換え（force push・reset）は行わない。

## 2. 整理前の状態

| 参照 | 位置 | 意味 |
|---|---|---|
| `main`／`origin/main` | `6344d7a0816eef4adc69d2cbe948dbefa4352019` | 旧移植（Step 1〜8）の結果。旧ADR-0010〜0014を含む |
| `redo/99-2-causal-migration` | `01eeac3b4625e75d6e67b3b438d49af589f5df22` | 因果を保持した再移植のStep 1〜6 |
| `claude/99-2-continuation` | `24c3e6392c82adb4aaaf3954a6f9c14c6aeab8d2` | 上記に続くStep 7a〜8。現在の設計の最新 |
| 共通の祖先 | `ea73d083f83f5bd58d9d78d930c0c860c038c849` | docs再編・整合完了時点 |

GitHubのリポジトリは公開、`main`に保護設定・PR・自動実行（Actions・Pages）はない。

## 3. 比較の結果

### 3.1 履歴

共通の祖先から、旧mainは19 commit、現在の系統は13 commit（`24c3e63`時点）が別々に進んだ。二つの系統は同じ祖先から別の作り直しをしたもので、片方がもう片方を含んでいない（早送りできない）。

### 3.2 内容

旧mainの変更はdocsのみ（42ファイル、新規19・変更23）で、コードの変更はない。`src`・`public`・設定を含め、docs以外は二つの系統で同一（差があるのはルートの`AGENTS.md`と`README.md`だけ）。ファイル単位では、旧mainだけに16件、現在の系統だけに59件、両方にあり内容が異なるものが51件ある。

**旧mainだけにあるもの（16件）と現在の扱い**

| 旧mainのファイル | 現在の本線での正本・扱い |
|---|---|
| ADR-0010〜0014（5件） | 対応するADR-0016・0019・0021／0022・0024・0018（いずれもProposed）が現在の系統にある。番号は再利用せず、0010〜0014は欠番として[decisions README](../decisions/README.md)に記録。旧本文はバックアップで読める |
| identity-and-access／01・02 | [31a〜31d](../architecture/identity-and-access/README.md) |
| presentation／30a〜30d（4件） | [34a〜34e](../architecture/presentation/README.md)と[30の10項目規約](../architecture/presentation/30_screen-specification-standard.md)。旧30bは「11項目」を確定として定めるが、99.2の規約は10項目で、本線と食い違う。旧30cが挙げた2論点は§3.3のとおり引き継いだ |
| dips-infrastructure／31 | [33a](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)・33b・[16](../architecture/16_security.md) |
| drive-storage-schema／29・README | [37](../architecture/drive-structure/37_environment-storage-responsibilities.md)と[35c](../architecture/operation-recording/35c_a4-operation-record.md)。旧29は`YYYY.M.D`・共通テンプレート複製のA4案で、2026-09-19の追補（機体別Spreadsheet・`YY.M.D`・次空き連番）と衝突するため、本線に載せない |
| 32_99-2-migration-and-audit | [Step 8監査](99-2-step-8-diff-audit.md)と[04](../04_open-questions.md)・[23](../architecture/23_implementation-roadmap.md)。旧32は全12節を「合格」「CURRENT-ACCEPTED」と分類する要約表で、原本全体のSHA-256は記録するが、節ごとの行範囲・確認の限界・実物確認の有無は記録していない |
| migration／99.2の移植元スナップショット | 現在の方針（99.2はGit管理外の参照専用）と異なるため、本線の木に含めない。公開リポジトリの旧mainの履歴とバックアップには残る |

旧mainの内容（00_goalの費用原則にある「Cloudflare Workers等を最大限に活用」、guidelines/01の「11標準項目」の確定記述など）は、現在の系統の記述（[ADR-0027](../decisions/ADR-0027-storage-ownership-and-cost-boundary.md)、10項目規約）と食い違う。

### 3.3 単純mergeを行わない理由

旧mainを現在の系統へmergeする試算（実際にはmergeしない）では、22ファイルで衝突する（うち3件は両方が新規に作ったREADME）。衝突しない箇所も、旧mainの00_goal・guidelines/01・14・12_overviewの変更が黙って混ざり、次が起きる。

- 同じ責任の文書が二重になる（identity-and-access、presentationの30a〜30dと34a〜34e、Drive構造の29と37）。
- 旧A4の命名（`YYYY.M.D`）や旧「11標準項目」、旧の費用原則が、CURRENT-ACCEPTEDの記述と並んで現れる。
- ADR-0010〜0014と、現在のADR-0015以降の番号・内容が混在する。

これらは「古い記述を根拠に旧仕様を実装しない」（99.2 §11）ことに反するため、内容は混ぜない。

**旧mainから現在も残すべきものの検討**: 旧mainの設計内容は、同じ99.2（同一のSHA-256）に基づく移植で、現在の系統はStep 8で99.2の全ての非空行が使用済みであることを確認している。旧main専用の文書のうち設計内容を持つ12件（ADR 5件、identity 2件、presentation 3件、dips-infrastructure・drive-storage-schemaの各1件）について、固有語の機械照合（旧文書自身の見出しや言い回しは現在の系統と表現が異なるため参考）に加え、主な概念（最後の1人の管理者、所属の自動終了の禁止、人物の二重作成、確定データの削除禁止、計画名の非表示、カードの基本項目、旧A4・費用原則の記述など）を個別に確かめ、対応する記述があることを確認した。全行を1行ずつ照合したわけではない。例外は次の3点で、いずれもオーナーの決定ではなく、旧mainを作ったAIの起案である。

- 旧30cの未整理の2論点（アプリ外でDIPS Webから直接作られた計画の扱い、同一計画への現場の二重着手）。99.2にも現在の系統にもなかったため、[34c §5](../architecture/presentation/34c_shared-flight-worklist.md#5-未確定と適用限界)へPENDING-S5-LIST-EXTERNAL-DIPS・PENDING-S5-LIST-CONCURRENT-STARTとして引き継いだ（決めていない）。
- 旧32の「Accepted候補判定条件」（ADRごとの承認基準）。現在のADRの「見直し条件」に相当する記述はあるが同じ形ではない。必要ならオーナー承認の基準として別途検討する。
- 旧30dの「履歴画面で確定データを削除しない」「A4の構造を変えない」は、現在の[34e](../architecture/presentation/34e_history-and-output.md)の「記録の削除は本画面の責任にしない」と[27f](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md)の派生PDFの位置づけと同じ方向で、追加の対応は不要と判断した。

## 4. 整理の方法（非破壊）

1. 旧mainをバックアップする。同じ位置（`6344d7a`）に、ブランチ`archive/main-before-99-2-redo-20260919`と注釈付きタグ`backup/main-6344d7a-20260919`を作り、GitHubへ送った（新しい名前の追加のみ。既存の履歴には触れない）。
2. 現在の系統に、参照の更新（旧mainの呼び方、実装凍結の明記、本記録）をcommitする。
3. 現在の系統の上で、旧mainを第2の親とする`ours`のmerge commitを作る。木（内容）は現在の系統と全く同じで、旧mainの内容は入らない。旧mainの全commitは、この本線の祖先として履歴に残る。
4. このcommitを`main`へ通常の（早送りの）pushで反映する。旧mainがこのcommitの祖先であるため、force pushは要らない。

作業用の複製で同じ手順を試し、次を確認した: 木が第1の親（`24c3e63`）と一致すること、旧mainが祖先であること、旧mainの内容へ戻す操作が成立すること。

## 5. 旧mainへ戻す方法

- 旧mainの内容・履歴を見る: `archive/main-before-99-2-redo-20260919`または`backup/main-6344d7a-20260919`を開く。
- `main`の内容を旧mainの内容へ戻す（履歴は消さない）: 本線化のmerge commitに対し`git revert -m 2 <そのcommit>`を実行し、通常のpushで反映する。試験で、旧mainの木と一致することを確認した。
- `main`の位置を`6344d7a`へ巻き戻す（履歴も戻す）: force pushが必要な操作であり、オーナーの明示承認の後にだけ行う。バックアップがあるため、行った場合も旧mainの内容は失われない。

## 6. 整理後の関係と運用

- `main`は、この記録を含む現在の系統のcommitを指す。`claude/99-2-continuation`は同じcommitを指し、`redo/99-2-causal-migration`はその祖先の系統としてそのまま残る。
- 今後の設計作業は`claude/99-2-continuation`で続け、意味のある設計のまとまりごとに`main`へ非破壊の早送りで反映する。履歴を書き換える操作は、オーナーの承認なしに行わない。
- 各監査記録が書く「main」「比較用main」は、この整理前の旧mainを指す。当時の記録として書き換えていない（[移植記録README](README.md)）。
- 実装（C1を含む）は凍結中で、この整理は実装開始の許可ではない。

## 7. 検査

- 整理前に、リポジトリ外の読取専用スクリプトでMarkdown 139文書（docs/ 136文書）、193表、相対リンク2,029件（アンカー付き315件）を検査し、参照先・アンカー・表列数・閉じ忘れ・到達性のエラーは0。追加した行の個人情報・秘密情報の走査で該当0。
- 本記録を含む変更は9文書（変更8・新規1）で、削除0、コード差分0。99.2原本は変更せず、Git管理外のまま（SHA-256は`f31b4856…`のまま）。
- バックアップの2つの参照が、GitHub上で`6344d7a…`を指すことを確認した。
- 整理後の`main`・作業ブランチ・バックアップの位置は、`git ls-remote origin`で確認できる。
