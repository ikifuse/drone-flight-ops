# Identity & Access 設計目次

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編・Step 2正本化）

## 1. 本サブシステムの役割と読み順

本ディレクトリは、ドローン運航管理における「三層権限モデル（業務役割・アプリ機能権限・外部ストレージ実アクセス権）」、「運用環境と論理所属境界」、および「人員と認証アカウントの分離」に関する**詳細仕様の唯一の正本（Single Source of Truth: SSOT）**です。

[アーキテクチャ目次](../README.md) または [総合目次](../../00_index.md) から本書へ進み、以下の順序で詳細仕様を参照します。

```text
README.md（本目次：全体像・読み順・境界原則）
   ↓
01_three-tier-permissions-and-roles.md（三層権限・業務役割・アプリ機能権限・制約ルール）
   ↓
02_environment-and-personnel-lifecycle.md（運用環境・アカウント・所属・離任・再所属）
```

## 2. 文書と正本一覧

| 文書 | 主要責務 |
|---|---|
| [README.md](README.md) | サブシステムの全体像、概念マップ、正本一覧、他設計との境界 |
| [01_three-tier-permissions-and-roles.md](01_three-tier-permissions-and-roles.md) | 三層権限の完全分離、業務上の役割（Pilot/Submitter/Recorder/Assistant）、アプリ機能権限、層間制約ルール、管理者交代 |
| [02_environment-and-personnel-lifecycle.md](02_environment-and-personnel-lifecycle.md) | PersonnelとUserAccountの分離、複数アカウント紐付け、OrganizationとOperationalEnvironmentの境界、所属ライフサイクル意味論（所属中／所属終了／再所属） |

## 3. 他設計領域との責務境界（二重正本の防止）

- **インフラ・通信セキュリティ（[16_security.md](../16_security.md)）との境界**:
  - `16_security.md` は BFF、Workers Secrets、暗号化Session Cookie、OAuth Token隠蔽、ログマスキング等のインフラ・通信セキュリティのSSOTです。
  - `16_security.md` には三層権限の「境界原則（レイヤー分離）」のみを要約として残し、詳細な業務役割定義、機能認可ルール、所属ライフサイクルの正本は本ディレクトリに集約します。
- **ドメインマスター（[domain-model/12a_organization-and-personnel.md](../domain-model/12a_organization-and-personnel.md)）との境界**:
  - `12a` は人物（Personnel）および実在組織（Organization）の基本属性・資格証明プロファイルのSSOTです。
  - `Personnel.roles` は業務役割（第1層）のみを保持し、アプリ機能権限（第2層）や所属状態（Membership）は本ディレクトリを参照します。
- **運航・点検実績（[domain-model/12e_operation-inspection-maintenance.md](../domain-model/12e_operation-inspection-maintenance.md)）との境界**:
  - `12e` は各運航・点検記録における実施主体（Actor）を保持します。Personnelの業務役割（Role）と、個別記録における実際のActorは概念上厳格に分離され、Roleから今回のActorを自動推測しません。
- **外部ストレージ（Google Drive / Sheets）との境界**:
  - Google Drive / Sheets の実ファイルアクセス権（Viewer/Editor/Owner）は Google 側が正本です。本システムからDrive権限の自動変更・二重管理は行いません。
