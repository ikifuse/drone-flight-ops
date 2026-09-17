# 27b. Google Drive保存

最終更新: 2026-09-15\
状態: 設計確定（Phase C1 未着手。個別 `PENDING` は未決）\
主要責務: KML保存先設定、CloudFileStoragePort、非同期アップロードと更新方針\
入口: [出力設計目次](README.md)

---

## 1. Google Drive連携と自動保存

### 1.1 保存先設定（ExportDestination）

ユーザーがアプリ設定画面から、KMLの保存先となる Google Drive フォルダをあらかじめ指定します。毎回の保存時にフォルダ選択ダイアログを表示させず、現場での片手操作を阻害しません。

```typescript
export interface ExportDestinationConfig {
  provider: 'GOOGLE_DRIVE';
  folder_id: string;               // Google Drive フォルダID
  folder_display_path: string;     // 表示用パス (例: "マイドライブ/ドローン運航記録/飛行計画KML")
  auto_export_on_plan_locked: boolean; // 計画確定時に自動保存するか
  auto_export_on_mission_complete: boolean; // 運航完了時に自動更新するか
  enabled: boolean;
}
```

### 1.2 UI表示イメージ

```text
┌─────────────────────────────────────────────────────────────┐
│ 【KML・外部ストレージ設定】                                 │
│                                                             │
│  保存先ストレージ: Google Drive                             │
│  保存先フォルダ  : マイドライブ/ドローン関係/飛行計画KML    │
│  [ 保存先フォルダを変更 ]                                    │
│                                                             │
│  [✓] 飛行計画確定時にKMLを自動出力・Driveへ保存             │
│  [✓] 現場運航完了時に実績を含む最終KMLへ自動更新            │
│                                                             │
│  ※Google Drive連携にはGoogleアカウントの認証が必要です。   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 オフライン現場での非同期同期

- 現場が完全圏外の場合でも、KMLファイルデータ自体はブラウザ内で即時生成可能です。
- Google Driveへのアップロードジョブは、既存の [14_offline-and-sync.md](../14_offline-and-sync.md) に基づき `SyncQueue`（`target: 'google_drive_kml'`）へ投入されます。
- 電波復帰時に実行環境が利用可能ならキューを再試行し、アプリ再開時にも再開します。モバイルOSによるアプリ停止中のバックグラウンド実行は保証しません。Google Driveの通信失敗が現場の運航記録・離着陸打刻を妨げることは絶対にありません。

---

## 2. 更新・Revision方針と独立ステータス

「1 FlightPlan＝1 KML」のIdentityは [27a KML](27a_kml-export.md) が定義します。Google Drive上で同一ファイルを更新するか、Revision付き別ファイル（`_rev2.kml`）として保存するかは、実装Phase前にStorage Policyとして決定します（`PENDING-MYMAPS-04` の再インポート挙動とも関連）。My Maps側の更新挙動とDriveのファイル保存方針は別の検証事項です。

`CloudFileStoragePort` / `GoogleDriveAdapter` は生成済みファイルの保管を担当します。KML内容・命名・プロファイルは [27a](27a_kml-export.md)、認証・秘密情報は [16](../16_security.md)、SyncQueue型・再試行は [14](../14_offline-and-sync.md) が正本です。全体のポート図は [27 出力境界](27_output-boundaries.md) を参照します。

`drive_kml_export_status` は `ledger_sync_status` と独立します。KML/Drive失敗でSheets保存・離着陸・運航確定を止めず、Drive成功によってSheets同期待ちを同期済みにしません。Drive認証切れ・容量超過等は当該ジョブの手動解決として表示し、一般的な一時通信エラーは14の再試行規則に従います。全量DB backupの保存先・形式は [ADR-0008](../../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) で `PENDING` です。

関連する再インポート検証は [27c My Maps](27c_google-mymaps-workflow.md) を参照してください。
