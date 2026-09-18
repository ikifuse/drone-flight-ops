# Drive Storage Schema 設計目次

最終更新: 2026-09-18\
状態: Phase C0完了・Phase C1未着手（docs再編・Step 6正本化）\
主責務: 運用環境（OperationalEnvironment）におけるGoogle Driveルート配下の 01〜07 物理フォルダー・Spreadsheet配置および保存先構造の規定。

---

## 1. 本サブシステムの目的と位置づけ

本ディレクトリは、ドローン運航管理における各運用環境のルートストレージ（Google Drive）配下に展開される**「01〜07 物理フォルダー構造」「Spreadsheetおよび原本テンプレートの配置」「運航記録・点検整備記録の保存先物理構造」**に関する詳細仕様の正本（Single Source of Truth: SSOT）です。

[アーキテクチャ目次](../README.md) または [総合目次](../../00_index.md) から本書へ進み、以下の順序で詳細仕様を参照します。

```text
README.md（本目次：全体像・読み順・責任境界）
   ↓
29_drive-folder-and-sheets-structure.md（01〜07物理階層ツリー・台帳配置・保存先構造）
```

---

## 2. 文書一覧と主要責務

| 文書 | 主要責務 |
|---|---|
| [README.md](README.md) | サブシステムの全体像、概念マップ、文書一覧、他設計領域との境界 |
| [29_drive-folder-and-sheets-structure.md](29_drive-folder-and-sheets-structure.md) | 01〜07物理フォルダー階層ツリー、各フォルダーの台帳配置、04_運航記録のA4原本複製・8明細目連番シート配置、05_点検整備記録の機体別フォルダー・Spreadsheet配置、中央集約DB不保持方針 |

---

## 3. 他専門領域との責任境界（二重正本の排除）

本サブシステムは「Google Drive上の物理ストレージ・フォルダー階層・台帳配置」に特化し、業務ロジックや同期・データ権限は各専門領域の正本を参照します。

- **データ権限・正本性（[11_data-authority.md](../11_data-authority.md)）との境界**:
  - `11_data-authority.md` は、Drive/Sheets・端末ローカル・外部API間のデータ権限優先順位、手動補記の受容ルール、正本性定義のSSOTです。
  - 本ディレクトリは「どのフォルダー・ファイルに物理配置されるか」を規定し、Authorityの論理判定ロジックを再定義しません（Step 8にて最終整合）。
- **オフライン・同期制御（[14_offline-and-sync.md](../14_offline-and-sync.md)）との境界**:
  - `14_offline-and-sync.md` は、同期キュー、リトライ間隔、競合解決、未同期保護のSSOTです。
  - 本ディレクトリは端末キャッシュとDrive正本との物理的な対応関係を参照するにとどめ、同期エンジンの詳細仕様を奪いません（Step 8にて最終整合）。
- **ドメインマスター（[domain-model/](../domain-model/README.md)）との境界**:
  - 人員・機体・バッテリー・運航実績・点検整備のエンティティ意味論は `domain-model/` が唯一の正本です。
  - 本ディレクトリは、それらのエンティティが 01〜07 のどのフォルダー・台帳へ物理的に割り当てられるかを規定します。
- **帳票出力（[18_reports.md](../18_reports.md)）との境界**:
  - A4縦1枚統合運航帳票のレイアウト、項目構成、印刷整合性は `18_reports.md` がSSOTです。
  - 本ディレクトリは、04_運航記録における原本テンプレート（`原本_日常点検・飛行記録`）の配置と、日付・連番シート（`YYYY.M.D`, `YYYY.M.D_2`...）の物理シート生成を規定します。
- **派生出力（[output/](../output/README.md)）との境界**:
  - KMLの生成・命名・構造は `27a_kml-export.md`、PDF/KML等の出力境界は `27_output-boundaries.md` がSSOTです。
  - 本ディレクトリは、07_出力_PDF・KML 配下のフォルダー配置を規定します。
- **アクセス権限（[identity-and-access/](../identity-and-access/README.md)）との境界**:
  - Google Drive上の実ファイルアクセス権（Viewer/Editor）はGoogle側が正本であり、アプリからの自動結合は行いません。
