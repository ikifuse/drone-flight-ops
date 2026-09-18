# 99.2 因果を保持する再移植 — Step 2 対照・監査

確認日: 2026-09-18\
対象: 99.2 §2「運用環境・人物・Googleアカウント・役割・権限・離任」のみ\
役割: 移管対応・出典・確認範囲・検査の索引。設計因果は各正式設計書を詳細正本とする。

## 1. 基準と境界

- 開始ブランチ: `redo/99-2-causal-migration`。開始HEAD / origin同ブランチ: `cab30e460ba39094c74af5ff7d97217dcae8058a`。開始時working treeはclean。
- [Step 1](99-2-step-1-causal-audit.md)は完了済み。再移植全体の基準は`ea73d083f83f5bd58d9d78d930c0c860c038c849`。既存12a / 16等はStep 1で業務内容を変更していない。
- main / origin/mainの保存対象: `6344d7a0816eef4adc69d2cbe948dbefa4352019`。mainの旧Step成果をコピー・cherry-pick・転用しない。
- 変更は§2の正式Docsと必要な相互参照・現在位置・未確定の案内。§3以降の移植、コード、Driveへの書込み、C1着手は対象外。

## 2. 証拠と確認範囲

| 証拠 | 今回確認したこと・限界 |
|---|---|
| ユーザー提供99.2原本（2026-09-17更新） | §2の61〜144行を直接読んだ。全体SHA-256 `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358`、§2部分 `058f63f725a9d8627a58381863539417ac28eac42af213cb3e644774ad8e813a`（UTF-8・原改行・§3見出し直前まで） |
| 基準Docs・履歴 | 12a〜12f・概要、16、23、関連DIPS・台帳・帳票・要件・ADRを確認。`5d51315`旧12 §2.8の人物集約と`ea73d08`の分割後設計を照合。旧案は31a〜31d内でHISTORICALとして保持 |
| 過去エージェント履歴 | ctxで99.2／人物／所属・writersCanShareを検索し、検索範囲で結果なし。索引49失敗単位、検索時更新の権限エラーもあり既存索引は部分的。網羅的不在や原操作の再検証とはしない |
| 旧mainのADR | 0010〜0014の番号・表題・Proposed状態を比較。現ブランチの0015を維持し0016を新設。旧本文からの自動転用なし |
| Google公式 | 2026-09-18に共有単位・継承、保護範囲、Shared Drive所有を補助照合。直接リンクと結果は[31b §1](../architecture/identity-and-access/31b_roles-and-access-control.md#1-二重権限管理を採らないまでの因果)。実Driveでのアクセス試験ではない |
| 国交省公式 | 掲載入口から飛行日誌取扱要領の操縦者・日常点検実施者を補助照合。範囲とリンクは[31c §1](../architecture/identity-and-access/31c_operational-actors.md#1-固定役割案を実画面帳票から見直す)。代理通報の法的可否や全法令の再監査ではない |
| 原本に挙げられた実物・旧資料 | 人員管理5タブ、旧技術モック、旧99.1 §2・98.2・旧99、旧GAS、DIPS PC/スマホ操作と13:04 / 13:31 / 14:12:54付近のスクリーンショットは未再検証。各詳細正本のVERIFYに保持し、原本の観測と今回の直接確認を区別 |

公開するのは非識別化した設計と上記出典識別。原本そのもの、実名、私的Drive識別子、ローカル履歴・設定はcommit対象にしない。

## 3. §2各論点の移管対応

すべてのリンク先で、当初状態→問題→確認・検討→変更理由→現在到達点→例外・未確定を追える。以下は要約索引であり、設計理由の唯一の保存先ではない。

| 原本の論点 | 既存との関係 | 詳細正本・因果の所在 |
|---|---|---|
| 実在人物、アカウントなし、役割別人物の重複 | 既存のPersonnel / UserAccount分離を維持・具体化 | [31a §1・§2](../architecture/identity-and-access/31a_person-account-and-environment.md#1-人物本体へ集約していた設計からの変化) |
| GoogleIdentity、複数Googleアカウント、組織管理アカウント、パスワード共有不採用 | 私用所有依存という発端。共有パスワード単独の詳細理由は原本の記録限界を明示 | [31a §2・§4](../architecture/identity-and-access/31a_person-account-and-environment.md#4-会社利用と環境切替へ詰めた内容) |
| OperationalEnvironment、Organization、Membership、所属内役割、複数環境 | 旧組織スコープを環境と同一視せず、対応schemaは未確定 | [31a §2](../architecture/identity-and-access/31a_person-account-and-environment.md#2-現在の概念境界とorganization) |
| 資格分離、技術モック、5タブ、実例、未発行、ID・列の未確定 | Personnel付属資格から分離。実物と最終schemaを区別 | [31a §3](../architecture/identity-and-access/31a_person-account-and-environment.md#3-資格の分離と確認用5タブ) |
| 現在環境、切替、使用アカウント、単一環境表示省略、root / 正本 | §2の表示・保存境界まで。全体のDrive構造を先取りしない | [31a §4](../architecture/identity-and-access/31a_person-account-and-environment.md#4-会社利用と環境切替へ詰めた内容) |
| Drive実仕様、三層、Editor承認・自動共有不採用、直接記録と代行入力 | 基準の役割配列とSecurity参照を具体化 | [31b §1・§2](../architecture/identity-and-access/31b_roles-and-access-control.md#1-二重権限管理を採らないまでの因果) |
| 初期管理者、追加・解除、最後の1人、操縦者だけの昇格不可、writersCanShare案 | 基準の確認範囲では旧詳細なし。Drive保護案の却下理由を保持 | [31b §3](../architecture/identity-and-access/31b_roles-and-access-control.md#3-初期管理者追加解除最後の1人) |
| 設定権限、記録者のみ不可、兼務、環境台帳役割 | 飛行時の担当と環境の機能権限を分離 | [31b §4](../architecture/identity-and-access/31b_roles-and-access-control.md#4-設定補助者viewerへ具体化した境界) |
| 補助者アクセス、1飛行PDF共有、旧Viewer制限 | 旧制限の目的を保持し、Google可視性とアプリ機能を区別。全権限表は未確定 | [31b §4・§5](../architecture/identity-and-access/31b_roles-and-access-control.md#4-設定補助者viewerへ具体化した境界) |
| 固定役割案、Pilot、Assistant 0人以上、立入管理措置 | DIPS・旧GAS・日誌の確認経緯から人物と措置を分離 | [31c §1・§2](../architecture/identity-and-access/31c_operational-actors.md#1-固定役割案を実画面帳票から見直す) |
| Recorder初期値・変更、帳票別欄、法定欄との区別、日常点検者 | 既存Inspector参照の保持と毎回別選択を要求しない理由 | [31c §1・§2](../architecture/identity-and-access/31c_operational-actors.md#2-現場役割の現在到達点) |
| Submitter、事前通報、会社事務・現場引継ぎ、一覧の人物識別 | 既存SubmissionActorを実送信者へ具体化し、Recorderと区別 | [31c §3](../architecture/identity-and-access/31c_operational-actors.md#3-さらに通報者と操縦者を分離した理由) |
| 退職・離任、物理削除禁止、過去実績、新規候補除外、非活動だけで退職しない | 共通の履歴保持を維持し、終了対象を所属へ限定 | [31d §1](../architecture/identity-and-access/31d_membership-lifecycle.md#1-人物の退職状態から環境への所属終了へ) |
| 離任履歴候補、再所属、同一人物ID、役割再設定、Drive解除・再共有 | 履歴を分断せず、Google共有を別処理として保持 | [31d §2・§3](../architecture/identity-and-access/31d_membership-lifecycle.md#2-履歴の内容を詰めた経緯) |
| 所有者交代／Shared Drive、離任UI・実行権限・offline | 未確定を独自解消しない | [31d §3・§4](../architecture/identity-and-access/31d_membership-lifecycle.md#4-組織所有と事業継続の未確定境界) |

## 4. 配置とResponsibility Check

人物同一性・所属の概念（31a）、権限判定とGoogle外部依存（31b）、飛行時割当・帳票への意味（31c）、所属終了と再所属のライフサイクル（31d）は、主責務・ライフサイクル・外部依存・セキュリティ境界・独立変更範囲で分離が必要である。基準のDomain / Security / Presentationへ全論点を詰め込まず、READMEで正本を一意に案内する。

| 観点 | 配置で守る境界 |
|---|---|
| 保守性・追加実装性 | 役割・資格・所属・機能権限を独立して読め、Domainや画面に同じ因果を複製しない |
| 堅牢性・障害復旧性 | 所属終了とGoogle失効・物理所有・復旧を区別し、未確定のoffline保証を追加しない |
| セキュリティ | Google実アクセスを第二正本にしない。アプリ管理者・秘密管理は異なる責任として接続 |
| 検証可能性・監査性 | 各正本内に旧設計・根拠・現在案・未確定・検証観点を保持。監査表は索引に限定 |
| 可観測性 | 操作者・記録対象・所属履歴・当時把握したアクセスを区別し、保存形式未確定を明示。新しいログ機構は決定しない |
| 複数ユーザー・複数組織 | 同一人物の複数環境・アカウントを扱い、Organizationとの未定義関連を推測で固定しない |

[ADR-0016](../decisions/ADR-0016-environment-membership-and-access-separation.md)は0007 §2.3の役割・資格の部分置換と§2.4 / §2.7の具体化の判断記録。運用規則は31a〜31dへ参照する。0016はProposed、0001〜0009と0015の本文は保持する。

## 5. 状態と残す事項の入口

| 状態 | 今回の扱い・詳細正本 |
|---|---|
| CURRENT-ACCEPTED | §2が到達した分離、三層、管理者、現場担当、所属終了・再所属の意味。31a〜31dの該当節 |
| CURRENT-PROPOSAL | 組織管理アカウントを使う方向（31a §4）、権限者の明示的離任処理の方向・履歴列候補（31d §1・§2） |
| PENDING | PENDING-S2-IDENTITY / ENVIRONMENT-UI（31a）、ACCESS-DETAIL（31b）、ACTOR-SCHEMA/UI（31c）、MEMBERSHIP / OWNERSHIP（31d）。基準PENDING-C1-SCHEMAとの接続はDomain各文書 |
| VERIFY | 31a / 31b / 31cの実物・旧資料の再確認、基準の代理通報範囲。外部公式文書の補助照合で全て確認済みとはしない |
| HISTORICAL | 旧人物属性、旧固定役割、旧Viewer整理、旧共有制御案等を、理由のある過去状態として保持 |
| EVIDENCE/EXAMPLE | 5タブ、資格モック、匿名化したP-001、DIPS観測。仕様の自動確定に使わない |
| NEW-PROPOSAL | 新たな業務仕様なし。文書分割・参照の整備と、原本に根拠のないschema・UI提案を区別 |

状態規約は[guidelines/03](../guidelines/03_design-evidence-and-causality.md)のみ。既存PENDING / WARNは[04](../04_open-questions.md)に保持し、解消していない。Step 1の設計思想・開始ゲート・10項目規約を変更しない。

## 6. 変更ファイルと責任

新規7件・既存更新22件。削除0件。以下はファイル単位の対応で、同じ設計本文を重複管理する一覧ではない。

| 種別 | ファイル | 主な責任・変更 |
|---|---|---|
| 更新 | [AGENTS.md](../../AGENTS.md) | AIの停止位置と§2の入口 |
| 更新 | [README.md](../../README.md) | ブランチの範囲と利用者向け入口 |
| 更新 | [docs/00_index.md](../00_index.md) | 総合入口・配置・現在の移植範囲 |
| 更新 | [docs/03_integrated-requirements.md](../03_integrated-requirements.md) | 人員要件から詳細正本への参照 |
| 更新 | [docs/04_open-questions.md](../04_open-questions.md) | 既存未決を保持し、§2の未確定・VERIFYの入口を追加 |
| 更新 | [docs/architecture/16_security.md](../architecture/16_security.md) | 秘密・認証と業務権限の責任境界 |
| 更新 | [docs/architecture/18_reports.md](../architecture/18_reports.md) | 人物欄の意味論への参照。帳票方式は保持 |
| 更新 | [docs/architecture/20_source-structure.md](../architecture/20_source-structure.md) | 将来sourceの人物領域と新正本の接続。コード変更なし |
| 更新 | [docs/architecture/23_implementation-roadmap.md](../architecture/23_implementation-roadmap.md) | 停止位置・§2の参照更新。開始ゲートとPhase配分は保持 |
| 更新 | [docs/architecture/README.md](../architecture/README.md) | 責任領域と唯一の詳細正本の対応表 |
| 更新 | [docs/architecture/dips-flight-plan/25a_field-catalog.md](../architecture/dips-flight-plan/25a_field-catalog.md) | 資格の旧取得元名と新正本の接続。API契約は不変 |
| 更新 | [docs/architecture/dips-flight-plan/25b_manual-web-mapping.md](../architecture/dips-flight-plan/25b_manual-web-mapping.md) | 人物役割の参照先更新。DIPS画面契約は保持 |
| 更新 | [docs/architecture/dips-submission/24a_submission-and-sheets-ledger.md](../architecture/dips-submission/24a_submission-and-sheets-ledger.md) | 人員の論理台帳案と5タブ実例の境界 |
| 更新 | [docs/architecture/domain-model/12_overview.md](../architecture/domain-model/12_overview.md) | ERの旧単一所属表現と新概念正本の接続 |
| 更新 | [docs/architecture/domain-model/12a_organization-and-personnel.md](../architecture/domain-model/12a_organization-and-personnel.md) | 組織・案件を保持し、人物の詳細は31a〜31dへ委譲 |
| 更新 | [docs/architecture/domain-model/12d_flight-plan-and-dips.md](../architecture/domain-model/12d_flight-plan-and-dips.md) | Submitterの意味の訂正と計画の保持先 |
| 更新 | [docs/architecture/domain-model/12e_operation-inspection-maintenance.md](../architecture/domain-model/12e_operation-inspection-maintenance.md) | 現場担当・複数補助者・点検実施者の参照とschema未決 |
| 更新 | [docs/architecture/domain-model/12f_common-lifecycle-id-and-audit.md](../architecture/domain-model/12f_common-lifecycle-id-and-audit.md) | 所属終了と共通Lifecycle・ID・操作主体監査との接続 |
| 更新 | [docs/architecture/domain-model/README.md](../architecture/domain-model/README.md) | Domainから人物領域への案内 |
| 新規 | [docs/architecture/identity-and-access/31a_person-account-and-environment.md](../architecture/identity-and-access/31a_person-account-and-environment.md) | 人物・アカウント・環境・所属概念・資格・切替の因果 |
| 新規 | [docs/architecture/identity-and-access/31b_roles-and-access-control.md](../architecture/identity-and-access/31b_roles-and-access-control.md) | 三層権限・管理者・設定・補助者アクセスの因果 |
| 新規 | [docs/architecture/identity-and-access/31c_operational-actors.md](../architecture/identity-and-access/31c_operational-actors.md) | 操縦・通報・記録・補助・日常点検の担当分離の因果 |
| 新規 | [docs/architecture/identity-and-access/31d_membership-lifecycle.md](../architecture/identity-and-access/31d_membership-lifecycle.md) | 離任・履歴・再所属・Google共有・物理所有の因果 |
| 新規 | [docs/architecture/identity-and-access/README.md](../architecture/identity-and-access/README.md) | 新責任領域の入口と詳細正本表 |
| 更新 | [docs/architecture/presentation/README.md](../architecture/presentation/README.md) | 既存10項目を維持し、環境表示・初期値・離任UIへ案内 |
| 新規 | [docs/decisions/ADR-0016-environment-membership-and-access-separation.md](../decisions/ADR-0016-environment-membership-and-access-separation.md) | 重要な部分置換・却下理由・見直し条件（Proposed） |
| 更新 | [docs/decisions/README.md](../decisions/README.md) | 0016 Proposed・旧ADRとの関係と番号履歴 |
| 新規 | [docs/migration/99-2-step-2-causal-audit.md](99-2-step-2-causal-audit.md) | 移管対応・証拠・確認範囲・ファイル責任・検査の索引 |
| 更新 | [docs/migration/README.md](README.md) | Step 1の記録保持とStep 2の索引 |

## 7. 最終検査

2026-09-18に次を確認した。コード受入・実物再検証の完了とは区別する。

- 変更はMarkdown 29件（既存22・新規7）、削除0。src / public / packageを含む非文書変更0。C1未着手。
- 全89文書をMarkdown parserで処理し、84表・49 code fence・相対リンク865件の対象ファイルと見出し、表列数・fenceの閉じ忘れを確認。エラー0、総合INDEXから89/89文書へ到達。
- §2の全文と§3の15論点群を対照し、31a〜31d内で因果・根拠の限界・現在到達点・例外・未確定を確認。詳細因果をmigrationにだけ置く論点はなく、旧人物属性を別の現行正本として残していない。INDEX・領域README・概念正本表・利用側参照を照合した。
- Step 1のguidelines/03、presentation/30、ADR-0015、移植監査、00_goalは開始HEADとバイト一致。23の§1.1と開始ゲートの規則本文も一致。23のPhase詳細は人員・組織系の正本参照だけを更新し、実装範囲を拡大していない。
- ADR-0001〜0009の本文は開始HEADと一致。0010〜0014はmain上のProposedを保持。0016もProposedであり、CURRENT-ACCEPTEDとの混同なし。
- 原本の全体・§2 hashは開始時と一致。§3以降の原本も変更なし。§3以降を根拠とする設計移植、旧Step成果の転用、Drive変更、コード実装は行っていない。
- `git diff --check`はエラー0。commit前のremote照会でmainは保存SHA、作業ブランチは開始SHAと一致し、別のremote更新なし。
- 公開対象29文書を本文・差分読解とprivacy scannerで確認。検出1件は既存25bの架空例「操縦者A」であり、実名ではなく変更対象の値でもないと確認し、今回の公開範囲をSAFEと判断した。非公開原本・個人実値・私的Drive URL・ローカルパスは対象へ持ち込んでいない。自動検出を網羅保証とはしない。
- 実Drive・旧試作品・旧GAS・DIPS実画面の再操作、アプリ動作テストは未実施。各VERIFYと基準PENDING / WARNを解消したとは報告しない。

Step 2のatomic commitを指定ブランチへpushした後に停止する。commit SHAとpush結果はGit記録と完了報告で示す。§3以降は着手しない。
