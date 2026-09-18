# 12a. 組織・案件・人員と操作主体

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: 組織・顧客・案件マスターと、人物・環境・運航担当の外部正本への接続。

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

## 3. 人物・アカウント・環境の外部正本

Step 2で99.2 §2の因果を[31a](../identity-and-access/31a_person-account-and-environment.md)へ移管した。基準の1人物一元管理・UserAccount分離を維持し、人物に直接寄せたroles・資格・退職状態から、環境別所属・役割、独立した資格、所属終了へ具体化した経緯も同書と[31d](../identity-and-access/31d_membership-lifecycle.md)で読める。旧属性表をもう一つの現行schemaとして残さない。Organization / Client / Projectの上記定義は維持し、OrganizationとOperationalEnvironmentの関連・ID対応は31aのPENDINGを参照する。

## 4. 運航関係者と権限への接続

Pilot、Assistant、日常点検実施者、Submitter / SubmissionActor、Recorder、Contactの意味・分離理由・初期値は[31c](../identity-and-access/31c_operational-actors.md)を唯一の詳細正本とする。第三者代理通報の法的範囲という基準の未確認も同書で保持する。計画の保持先は[12d](12d_flight-plan-and-dips.md)、実績・点検は[12e](12e_operation-inspection-maintenance.md)、操作アカウントとの監査接続は[12f](12f_common-lifecycle-id-and-audit.md)。

アプリの業務権限・管理者・設定変更は[31b](../identity-and-access/31b_roles-and-access-control.md)、秘密・認証機構は[16](../16_security.md)。C1で認証・複数環境UIを追加実装する指示ではない。新しい型・schemaは未確定の対応を解消し、[23の開始ゲート](../23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)を満たしてから扱う。
