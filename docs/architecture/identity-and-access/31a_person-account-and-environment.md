# 31a. 人物・Googleアカウント・運用環境

最終更新: 2026-09-24\
由来: 99.2 §2【発端・問題】【人物・所属の現在案】【会社利用】【画面/保存への反映】、基準Docs `ea73d08`（Step 1終了`cab30e4`でも同内容）。\
主要責務: 人物同一性、アカウントとの対応、環境・所属・資格の概念境界。入口は[README](README.md)。状態は節内で区別する。

## 1. 人物本体へ集約していた設計からの変化

**当初状態（HISTORICAL）**: `5d51315`の旧12 §2.8と[ADR-0007 §2.3](../../decisions/ADR-0007-normalized-masters-and-business-reporting.md)は、複数役割を兼ねる人物を一元化し、アカウントを持たない同行者も記録するためPersonnelとUserAccountを分離した。`ea73d08`の12aはこれを保持し、Personnelに`roles`配列（pilot / inspector / assistant / administrator / viewer）、pilot時のみ有効な資格プロファイル、既定操縦者・点検者フラグ、ACTIVE / INACTIVE / RETIREDを置いた。既存の氏名・フリガナ・緊急連絡先も人物の基本情報である。旧属性名は`name / kana / contact_phone / contact_email`、資格は`license_number / certificate_type / certificate_expires_at / warning_days`（期限前警告の初期値30日）、既定値は`is_default_pilot / is_default_inspector`であった。これらは出発点の情報要求として保持し、同じ物理配置を現行schemaとして固定しない。

**問題・検討案**: 99.2は同じPWAを個人、会社、スクール、臨時業務で使い、同じ人物が環境ごとに異なる立場になる場面を挙げた。人物をGoogleログインそのものとする案では、Googleアカウントのない補助者・外部点検者を扱いにくい。Pilot / Assistant / Inspectorを別人物マスターにする案では、氏名・連絡先・技能証明を重複管理する。これらは99.2が比較した案であり、基準Docsが両案を採用していたという意味ではない。

**変更理由・さらに詰めた内容**: 既存の「1人物を一元管理しUserAccountと分ける」意図を維持し、人物本体に環境を問わない役割・離任状態を置く方式を具体化し直す。人物、Google認証アカウント、利用する環境、その環境への所属、その所属内の役割を分けることで、同じ人物の兼務・別環境・複数アカウントを同一人物のまま扱う。資格と所属終了の進展はそれぞれ§3と[31d](31d_membership-lifecycle.md)に保持する。

## 2. 現在の概念境界とOrganization

以下は**CURRENT-ACCEPTED**（99.2の現在到達点）。表の概念名は物理テーブル名・確定列定義ではない。

| 概念 | 保持する意味 |
|---|---|
| Personnel | 実在人物。Googleアカウントがなくても運航・点検等の記録対象になれる。氏名・連絡先等の人物基本情報を役割別に複製しない |
| GoogleIdentity / UserAccount | Google認証アカウント。実在人物と分離し、個人環境の個人アカウントと会社で要求される別Google / Workspaceアカウントを同じ人物へ紐付けられる。**環境ごとに使うアカウントが異なってよく、個人環境と会社環境で同じアカウントを使う前提にしない**（2026-09-23。[34a §9.4](../presentation/34a_setup-and-environment-entry.md#94-会社団体はホームからその会社で使うgoogleアカウントで追加する)） |
| OperationalEnvironment | 個人・会社・スクール・臨時業務等、同じPWAで切り替えて利用する運用環境。環境ごとにroot / 正本を切り替える |
| EnvironmentMembership | 人物の対象環境への所属。同一人物は複数環境へ所属できる。終了・再有効化の詳細は31d |
| MembershipRoles | 対象環境の所属における役割の組合せ。環境ごとに異なってよい。機能権限との関係は[31b](31b_roles-and-access-control.md)、飛行ごとの担当は[31c](31c_operational-actors.md) |

**Organizationとの関係（既存設計の維持とPENDING-S2-IDENTITY）**: [12a](../domain-model/12a_organization-and-personnel.md)のOrganizationは運航の所有・法的管理主体、Client / Projectは業務案件の概念である。ADR-0007 §2.4の複数組織へ拡張可能にする意図は維持する。基準ERの`Organization → Personnel`だけでは、99.2の複数環境所属を表現しきれないため、これを人物の単一組織所有という現行制約にはしない。一方、99.2 §2にはOrganizationとOperationalEnvironmentの同一性・関連基数・キー移行の確定記述がない。両者を同一視したり、全`organization_id`を機械的に置換したりしない。組織・環境間の正確な関連と人物IDの環境をまたぐ対応方式は未確定である。

**個人の本人操縦者の初期値（2026-09-24）**: 認証済みアカウントと本人Personの対応、および環境内の操縦者登録を照合して初期選択するUI規則は[31c §6](31c_operational-actors.md#6-個人環境の本人操縦者を新規飛行の初期値にする2026-09-24)。本節の概念を統合したり、ログインだけで操縦者役割を付与したりしない。

## 3. 資格の分離と確認用5タブ

**当初状態・問題（HISTORICAL）**: 基準12aでは資格をpilot役割に付属するPersonnel属性としていた。99.2が記録する旧技術モックでもPersonnelにroles / qualificationを直接持つ形を検討したが、人物基本情報、環境内役割、技能証明・限定事項を混同しないことが必要になった。

**調査・検討の進展（EVIDENCE/EXAMPLE）**: 原本は、Qualificationsを`person_id`へ紐付ける技術モックの構成確認、さらに実Driveの「01_人員管理 / 人員管理」で「人員一覧」「Googleアカウント」「所属・役割」「資格・技能証明」「退職・離任履歴」の5タブを実物確認した経緯を記録する。個人環境の本人はアプリ管理者＋操縦者、検証用人物IDは`P-001`、技能証明は未発行の事実を未発行のまま保持した例である。公開Docsには実名・私的Drive識別子を複写しない。

**現在到達点（CURRENT-ACCEPTED）**: 資格を人物基本情報・環境内役割と分け、人物へ関連付けて扱う。未発行を推測の番号や取得済状態で埋めない。5タブはこの分離を人が確認できる形にした証拠であり、列名やタブ数を永久固定する仕様ではない。旧資格プロファイルを同時にもう一つの現行正本として残さない。

**人物基本情報の範囲（2026-09-23）**: 人物は、人物IDのほか氏名・フリガナ・住所・電話番号・メールアドレス等を保持できる。これはDIPSの飛行計画の連絡先として再利用するためであり（[34a §9.3・§9.5](../presentation/34a_setup-and-environment-entry.md#93-初回登録は1画面にまとめる)・[25b](../dips-flight-plan/25b_manual-web-mapping.md)）、役割別に人物を複製しない原則（§2）は変わらない。列名・物理配置は下記PENDINGのまま。

**未確定（PENDING-S2-IDENTITY）**: `qualification_class / certificate_number / status`等の列は法令仕様と合わせて決める。基準の`personnel_id`（UUID v4。共通方針は[12f](../domain-model/12f_common-lifecycle-id-and-audit.md)）、モックの`person_id`、検証用`P-001`の対応・表示ID方式を今回確定しない。既存の氏名・連絡先・資格・既定値の情報要求を失わず、人物／資格／所属／画面初期値のどこへ保持するかをschema確定前に照合する。

**VERIFY-S2-IDENTITY-EVIDENCE**: 上記は99.2による観測記録であり、今回Drive・旧モック・旧99.1 §2 / 98.2 / 旧99を直接再検証したものではない。各実物の版、5タブと概念の対応、既知の実例を依存設計の確認時に照合する。未再検証だけを理由に上記の到達済み設計をPENDINGへ戻さない。

## 4. 会社利用と環境切替へ詰めた内容

**発端・選択理由**: 個人私用アカウントへの所有依存を会社運用へ持ち込まないため、99.2は組織管理Googleアカウントを使う方向を示した（当時**CURRENT-PROPOSAL**）。会社のWorkspaceアカウントを使うことと別の人物を作ることを結び付けず、§2の同一人物への複数アカウント紐付けで扱う。

**2026-09-23の確定（CURRENT-ACCEPTED。オーナーの指示。[ADR-0030](../../decisions/ADR-0030-personal-first-onboarding-and-single-screen-initial-registration.md)）**: どのGoogleアカウントを使うかについては、**個人環境は本人の個人Googleアカウント、会社・団体環境はその会社・団体で使うGoogle / Workspaceアカウント**とする。会社・団体環境は、そのアカウントに対応する保存領域へ作る。初回は全員が個人環境から始め、会社・団体はホームから追加する（[34a §9.2・§9.4](../presentation/34a_setup-and-environment-entry.md#9-初回は個人環境から始め初回登録を1画面にまとめる2026-09-23)）。**採用する物理所有方式（My Drive / Shared Drive、所有権の継承、法人での所有主体）は確定しない**（[31d §4](31d_membership-lifecycle.md#4-組織所有と事業継続の未確定境界)のPENDING-S2-OWNERSHIPのまま）。

**採らない案（CURRENT-ACCEPTED）**: 共有パスワードで1アカウントを複数人が使う運用は採用しない。原本は会社所有への依存問題と人物・アカウント分離の検討の中でこの結論を明記するが、パスワード共有単独の比較試験・詳細な却下理由までは記録していない。一般的なセキュリティ理由を当時調査済みの根拠として補わない。秘密の取り扱いは[16](../16_security.md)を参照する。

**現在の画面・保存境界（CURRENT-ACCEPTED）**: 環境の取り違えを防ぐ。ホームの表示・入口の正本は[34a §9.6](../presentation/34a_setup-and-environment-entry.md#96-複数環境と切替)。単一環境でも［〜で使用中］ボタンから現在地確認と会社追加のシートを開き、複数の場合だけ切替候補を示す。**HISTORICAL**: 単一環境なら常時表示を省略できる／切替操作を隠すという記述を、ホームの操作入口を省略する根拠にはしない。2026-09-23のモック同期で明確化した。切替時は環境ごとのroot / 正本を切り替え、設定・管理は[31b](31b_roles-and-access-control.md)の権限に従って人員・環境・マスターを扱う。ホームのボタン・シート以外の配置、通常起動・未保存作業・offline・失効時の切替詳細、root対応の物理schemaは**PENDING-S2-ENVIRONMENT-UI**であり、[30の10項目](../presentation/30_screen-specification-standard.md)を推測で埋めない。認証実装や全Drive階層の設計移植は本書の範囲外。機体・BATも現在の環境に属するデータで、環境を切り替えると参照する正本も切り替わる（[32h §2](../asset-management/32h_registered-aircraft-and-battery-group-relations.md#2-運用環境に属するデータの連鎖既存の原則との接続)）。現在の環境の表示と、飛行で扱う対象機体の表示は別の責任（[34g §2](../presentation/34g_settings-aircraft-management-and-context-display.md#2-現在の運用環境の表示と対象機体の表示)）。画面に出す表示名は、これらの内部の概念名（OperationalEnvironment・Personnel・GoogleIdentity・Membershipなど）をそのまま使わず、「個人で使用中」「登録されている人」のように分ける（2026-09-21。内部の概念と責務分離は変えない。[34h](../presentation/34h_user-facing-wording-and-terminology.md)）。

## 5. 実装・検証で照合する境界

同じ人物がGoogleアカウントなし／複数アカウント／複数環境で記録されても、人物・資格が役割別に複製されないこと、環境別役割を取り違えないこと、試作の列やIDを固定仕様に昇格させていないことを照合する。これは上記設計の検証観点であり、新しいschemaではない。[ADR-0016](../../decisions/ADR-0016-environment-membership-and-access-separation.md)は変更理由の記録、[移植監査](../../migration/99-2-step-2-causal-audit.md)は原本の識別と対応索引。詳細因果は本書を正本とする。
