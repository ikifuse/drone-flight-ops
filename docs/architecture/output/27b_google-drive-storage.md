# 27b. Google Drive保存

最終更新: 2026-09-18\
状態: 設計確定（Phase C1 未着手。個別 `PENDING` は未決）\
主要責務: KML保存先設定、CloudFileStoragePort、非同期アップロードと更新方針\
入口: [出力設計目次](README.md)

---

## 1. Google Drive連携と自動保存

### 1.1 保存先設定（ExportDestination）

KMLの保存先フォルダーは、[29_drive-folder-and-sheets-structure.md](../drive-storage-schema/29_drive-folder-and-sheets-structure.md) で定義された運用環境ルート配下の `07_出力_PDF・KML/KML/` を確定領域（`CURRENT-ACCEPTED`）とします。

その配下の詳細サブフォルダー階層（例: `操縦者/年度/`）は、99.2 §8に基づく構成確認用の例示・有力案（`CURRENT-PROPOSAL`）として位置づけ、最終的な詳細階層の物理構造やファイル名規則は実装Phaseの検討課題（`PENDING`）とします。毎回の保存時にフォルダ選択ダイアログを表示させず、現場での片手操作を阻害しません。

```typescript
export interface ExportDestinationConfig {
  provider: 'GOOGLE_DRIVE';
  root_folder_id: string;          // 運用環境ルートフォルダID
  folder_display_path: string;     // 表示用パス (例: "07_出力_PDF・KML/KML/<PilotName>/<FiscalYear>/") [CURRENT-PROPOSAL]
  auto_export_on_plan_submission: boolean; // DIPS飛行計画通報時に自動保存するか（既定: true）
  enabled: boolean;
}
```

※旧案にあった運航完了時の自動更新（`auto_export_on_mission_complete`）は、ADR-0013（通報時確定生成・事後実績排除）により廃止・却下（`HISTORICAL`）されました。

### 1.2 UI表示イメージ

```text
┌─────────────────────────────────────────────────────────────┐
│ 【KML・外部ストレージ設定】                                 │
│                                                             │
│  保存先ストレージ: Google Drive                             │
│  保存先フォルダ  : 07_出力_PDF・KML/KML/ (確定)             │
│                    └ <操縦者>/<年度>/ (検討案: PROPOSAL)    │
│                                                             │
│  [✓] DIPS飛行計画通報時にKMLを確定生成・Driveへ保存         │
│                                                             │
│  ※Google Drive連携にはGoogleアカウントの認証が必要です。   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 オフライン現場での非同期同期と再送（CURRENT-PROPOSAL / PENDING）

- **現場での生成**: 現場が完全圏外の場合でも、KMLファイルデータ自体はブラウザ内で通報データ（`submission_snapshot` ＋ 共通Geometry）から即時生成可能です。
- **未同期KMLの保持**: 通報時に通信断やGoogle Drive障害等でKMLの外部保存のみが失敗した場合、実飛行を止めず、DIPSの再通報も行いません。KMLは端末内に「未同期KML」として安全に保持されます。
- **再送ライフサイクル（CURRENT-PROPOSAL / PENDING）**:
  - 通信復帰時の自動再送に加え、飛行後点検完了後に操縦者が行う「最後の確定送信」において、A4運航記録やバッテリー履歴等の外部保存処理と合わせてKML保存も再試行する経路を検討候補（`CURRENT-PROPOSAL`）とします。
  - ※物理的なSyncQueue型定義、端末内キャッシュ方式、および厳密な再送トリガーは、Step 8 / Phase C1の設計課題（`PENDING`）として留保します。
- Google Driveの通信失敗が現場の運航記録・離着陸打刻・共有飛行リスト登録を妨げることは絶対にありません。

---

## 2. 更新・Revision方針と独立ステータス

「1 DIPS FlightPlan＝1 KML」のIdentityは [27a KML](27a_kml-export.md) が定義します。計画修正やリビジョン変更が発生した場合に、Google Drive上で同一ファイルを更新するか、Revision付き別ファイル（`_rev2.kml`）として保存するかは、実装Phase前にStorage Policyとして決定します（`PENDING-MYMAPS-04` の再インポート挙動とも関連）。My Maps側の更新挙動とDriveのファイル保存方針は別の検証事項です。

`CloudFileStoragePort` / `GoogleDriveAdapter` は生成済みファイルの保管を担当します。KML内容・命名・プロファイルは [27a](27a_kml-export.md)、認証・秘密情報は [16](../16_security.md)、SyncQueue型・再試行は [14](../14_offline-and-sync.md) が正本です。全体のポート図は [27 出力境界](27_output-boundaries.md) を参照します。

`drive_kml_export_status` は `ledger_sync_status` と独立します。KML/Drive失敗でSheets保存・離着陸・運航確定を止めず、Drive成功によってSheets同期待ちを同期済みにしません。Drive認証切れ・容量超過等は当該ジョブの手動解決として表示し、一般的な一時通信エラーは14の再試行規則に従います。全量DB backupの保存先・形式は [ADR-0008](../../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) で `PENDING` です。

関連する再インポート検証は [27c My Maps](27c_google-mymaps-workflow.md) を参照してください。
