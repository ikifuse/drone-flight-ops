# 12a. 組織・案件・人員と操作主体

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（Step 2正本化）

主要責務: 組織・顧客・案件・人員マスター、業務上の役割（Role）と実施者（Actor）の概念境界。権限・所属・環境の詳細は [identity-and-access](../identity-and-access/README.md) を参照。

## 1. Organization（運用主体・企業/個人事業主マスター）
- **ID**: `organization_id` (UUID v4)
- **分類**: **Master**
- **役割**: ドローン運航の所有・法的管理主体（実世界に実在する法人、個人事業主、自治体等）。C1初期は単一デフォルト組織（UUID固定値）で動作し、将来の複数組織・企業利用に備えたデータスコープ境界を提供する。
- **運用環境（OperationalEnvironment）との責任境界**:
  - `Organization` は実社会に実在する法的管理主体を表します。一方、アプリケーション上の運用・データスコープの境界は `OperationalEnvironment` として分離して扱います（詳細は [02. 運用環境・アカウント・所属ライフサイクル設計](../identity-and-access/02_environment-and-personnel-lifecycle.md) を参照）。
  - 個人運用においては、`Organization` を持たない `OperationalEnvironment` も成立可能です。両者の多重度や物理外部キー設計は `PENDING-C1-SCHEMA` とします。
- **主な属性**:
  - `name`: 組織・事業者名称（例: "架空事業者A", "〇〇建設株式会社"）
  - `operator_code`: DIPS事業者コード / 法人番号（任意）
  - `contact_email`: 代表連絡先メールアドレス
  - `contact_phone`: 代表緊急連絡先
  - `status`: 状態（`ACTIVE`, `INACTIVE`）
  - 共通監査メタデータ（`created_at`, `updated_at`, `version`）

## 2. Client & Project（顧客・案件マスター - 業務利用対応）
- **Client ID**: `client_id` (UUID v4) / **Project ID**: `project_id` (UUID v4)
- **分類**: **Master**（業務利用任意マスター）
- **役割**: 商業空撮・測量・点検業務における発注元顧客および案件管理。個人練習時は未入力可。
- **主な属性 (Client)**:
  - `name`: 顧客企業名・個人名（例: "〇〇建設株式会社"）
  - `contact_person`: 担当者名
  - `contact_phone`: 連絡先
- **主な属性 (Project)**:
  - `client_id`: 発注顧客ID
  - `name`: 案件名称（例: "架空現場A 進捗空撮"）
  - `start_date` / `end_date`: 案件期間
  - `notes`: 案件特記事項
- **リレーション**: `FlightPlan`, `Mission`, `OperationTemplate` から任意参照。

## 3. Personnel（人員マスター）& ユーザーアカウント分離
- **ID**: `personnel_id` (UUID v4)
- **分類**: **Master**
- **役割**: 操縦者、通報者、記録者、補助者等の実在人物を1人物1レコードとして一元管理。
- **ユーザーアカウントとの分離原則**: 運航記録に登場する実在人物（`Personnel`）と、アプリを操作するログインアカウント（`UserAccount`）を概念上分離し、補助者や同行パイロットがGoogleアカウントを持たない場合でも適正に記録可能とします（詳細は [02](../identity-and-access/02_environment-and-personnel-lifecycle.md)）。
- **業務役割（第1層: Operational Roles）の環境依存性と意味論**:
  - 運航業務における担当役割の意味論は、`pilot`（操縦者）、`submitter`（通報者）、`recorder`（記録者）、`assistant`（補助者）の4つとして定義します。
  - 同一人物が複数の運用環境（OperationalEnvironment）に異なる立場で関与する場合があるため、業務役割はPersonnelの全環境共通の恒常属性とは限らず、環境ごとの所属（EnvironmentMembership）または役割割当（Role Assignment）に紐づく可能性があります。物理的な保持構造は `PENDING-C1-SCHEMA` とします。
  - ※アプリ管理者（`administrator`）や閲覧者（`viewer`）は第2層のアプリ機能権限であり、業務役割から完全に分離（[01](../identity-and-access/01_three-tier-permissions-and-roles.md)）。
  - ※点検・整備者（Inspector）は恒常的なPersonnel Roleとはせず、各点検・整備記録における実施者Actor参照（`inspector_id`）として扱います（点検・整備記録上、実施者をPersonnelとして特定・追跡可能）。
- **主な属性**:
  - `name`: 氏名（漢字）
  - `kana`: フリガナ
  - `contact_phone`: 緊急連絡先電話番号
  - `contact_email`: 連絡先メール
  - **操縦者プロファイル（操縦資格を持つ場合のみ有効）**:
    - `license_number`: 技能証明書番号 / 技能認証番号
    - `certificate_type`: 区分（一等、二等、民間修了等）
    - `certificate_expires_at`: 有効期限 (ISO8601)
    - `warning_days`: 期限前警告日数（初期値: 30日）
  - `is_default_pilot`: 既定の主操縦者フラグ
  - `is_default_inspector`: 既定の日常点検者フラグ
  - `status`: 人物マスター状態（`ACTIVE`, `INACTIVE`, `RETIRED`）
- **所属ライフサイクル**:
  - 人物の物理削除は禁止。運用環境への所属関係は「所属中／所属終了／再所属」の意味論に基づき管理し、物理状態値は `PENDING-C1-SCHEMA` とします（詳細は [02](../identity-and-access/02_environment-and-personnel-lifecycle.md)）。

## 4. 業務利用における関係者の責務分離（Actor・Pilot・Contactの概念境界）

法人・組織でのドローン運航管理を想定し、以下の関係者ロール・操作主体を概念上明確に分離します。Personnel側の業務役割（Role）と、個別運航・通報・点検における実際の実施者（Actor）を厳格に分離し、Roleから今回のActorを自動推測しません。

```text
┌─────────────────────────────────────────────────────────────┐
│ [通報操作者] SubmissionActor (UserAccount / 操作主体)       │
│  - アプリを操作してDIPS通報手続きを実行したログインアカウント│
│  - submitted_by_user_id として記録                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ 計画に指定
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ [実運航操縦者] Pilot / Personnel (実運航操縦Actor)          │
│  - 現場で機体を実際に操縦し、日常点検を実施                  │
│  - primary_pilot_id / pilot_ids として記録                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ 連絡先として指定
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ [緊急時連絡窓口] EmergencyContactPerson (連絡先)             │
│  - 飛行中に近隣住民や関係機関からの連絡を受ける電話・メール   │
│  - 操縦者自身、運航管理者、または許可申請書記載窓口から選択 │
│  - contact_source / contact_person_id として保持            │
└─────────────────────────────────────────────────────────────┘
```

- **現場入力担当者（RecorderActor）と現場補助員（AssistantActor）**:
  - 現場でアプリへ飛行実績・日常点検結果を打刻・入力する者（`RecorderActor`）は、操縦者選択時に同一人物が初期設定され、別人入力時のみ変更可能です。操縦者と別欄で保持します。
  - 周囲警戒・安全確保を補助する者（`AssistantActor`）は、計画および実績において `selected_assistant_person_ids` 等で割り当てられ、原本台帳への恒常アクセスは持ちません。
- **委任・代理通報に関する留意事項**:
  - DIPS Web画面において操縦者と連絡先が分離選択可能であることは `OBSERVED` ですが、「第三者による代理通報が法的にどの範囲で認められているか」は、国土交通省のDIPS利用規約および行政手続き法令に基づく確認を要します。
  - アプリ設計としては、属性を分離して保持できる柔軟なスキーマを用意し、法的な委任関係の成立可否は運用主体の責任において設定するものとします。

## 5. 役割の参照関係

`Pilot`、`Submitter`、`Recorder`、`Assistant` は業務役割（Role）の意味論を表し、別人物マスターを作りません。点検・整備記録の実施者は `inspector_id`（Personnel参照）として特定・追跡します。`SubmissionActor` は操作した `UserAccount` を指し、通報業務を担当するPersonnel（Submitter）や実際に飛行した人物（Pilot）、緊急連絡先（ContactPerson）と同一とは限りません。`EmergencyContactPerson` は連絡先として選択された情報源・役割名であり、新しい人物正本ではありません。FlightPlanの `submitted_by_user_id`、`pilot_ids`、`contact_source` / `contact_person_id` の保持先は [12d](12d_flight-plan-and-dips.md)。三層権限・アプリ機能権限・所属ライフサイクルの詳細は [identity-and-access](../identity-and-access/README.md) に従います。
