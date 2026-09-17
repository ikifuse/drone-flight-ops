# 12a. 組織・案件・人員と操作主体

最終更新: 2026-09-15\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: 組織・顧客・案件・人員マスター、SubmissionActor / Actual Pilot / Contactの概念境界。

## 1. Organization（運用主体・企業/個人事業主マスター）
- **ID**: `organization_id` (UUID v4)
- **分類**: **Master**
- **役割**: ドローン運航の所有・法的管理主体。C1初期は単一デフォルト組織（UUID固定値）で動作し、将来の複数組織・企業利用に備えたデータスコープ境界を提供する。
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
- **役割**: 操縦者、日常点検者、立入管理補助者等を1人物1レコードとして一元管理。
- **ユーザーアカウントとの分離原則**: 運航記録に登場する人物（`Personnel`）と、アプリを操作するログインアカウント（`UserAccount`）を概念上分離し、補助者や同行パイロットがアプリアカウントを持たない場合でも適正に記録可能とする。
- **主な属性**:
  - `name`: 氏名（漢字）
  - `kana`: フリガナ
  - `contact_phone`: 緊急連絡先電話番号
  - `contact_email`: 連絡先メール
  - `roles`: 担当可能役割配列（`['pilot', 'inspector', 'assistant', 'administrator', 'viewer']`）
  - **操縦者プロファイル（`roles` に `pilot` を含む場合のみ有効）**:
    - `license_number`: 技能証明書番号 / 技能認証番号
    - `certificate_type`: 区分（一等、二等、民間修了等）
    - `certificate_expires_at`: 有効期限 (ISO8601)
    - `warning_days`: 期限前警告日数（初期値: 30日）
  - `is_default_pilot`: 既定の主操縦者フラグ
  - `is_default_inspector`: 既定の日常点検者フラグ
  - `status`: 状態（`ACTIVE`, `INACTIVE`, `RETIRED`）

## 4. 業務利用における関係者の責務分離（SubmissionActor / Pilot / Contact）

法人・組織でのドローン運航管理を想定し、以下の関係者ロールを概念上明確に分離します：

```text
┌─────────────────────────────────────────────────────────────┐
│ [運航管理・事務担当] SubmissionActor (アプリアカウント/操作者) │
│  - オフィスのPCやスマホで飛行計画を作成・DIPS通報手続きを実行 │
└──────────────────────────────┬──────────────────────────────┘
                               │ 計画にアサイン
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ [現場パイロット] Pilot / Personnel (実運航操縦者)            │
│  - 現場で機体を操縦し、飛行前点検・離着陸打刻を実施          │
└──────────────────────────────┬──────────────────────────────┘
                               │ 連絡先として指定
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ [緊急時連絡窓口] EmergencyContactPerson (連絡先)             │
│  - 飛行中に近隣住民や関係機関からの連絡を受ける電話・メール   │
│  - 操縦者自身、運航管理者、または許可申請書記載窓口から選択 │
└─────────────────────────────────────────────────────────────┘
```

- **委任・代理通報に関する留意事項**:
  - DIPS Web画面において操縦者と連絡先が分離選択可能であることは `OBSERVED` ですが、「第三者による代理通報が法的にどの範囲で認められているか」は、国土交通省のDIPS利用規約および行政手続き法令に基づく確認を要します。
  - アプリ設計としては、属性を分離して保持できる柔軟なスキーマを用意し、法的な委任関係の成立可否は運用主体の責任において設定するものとします。

## 5. 役割の参照関係

`Pilot`、`Assistant`、`Inspector` は `Personnel.roles` と各記録の割当を表し、別人物マスターを作らない。`SubmissionActor` は操作した `UserAccount` を指し、実際に飛行した人物や緊急連絡先と同一とは限らない。`ContactPerson` / `EmergencyContactPerson` は連絡先として選択された役割名であり、新しい人物正本ではない。FlightPlanの `submitted_by_user_id`、`pilot_ids`、`contact_source` / `contact_person_id` の保持先は [12d](12d_flight-plan-and-dips.md)。UserAccountの認証・権限詳細は [Security](../16_security.md) に従い、C1で認証機能・複数組織UIを追加しない。
