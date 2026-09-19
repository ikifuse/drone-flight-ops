# 27. 出力・データ連携の境界

最終更新: 2026-09-19\
状態: 設計整合（Phase C1 未着手）。KMLの単位・生成契機・内容は[27e](27e_kml-generation-timing-and-content.md)。個別 `PENDING` は未決\
主要責務: Sheets・帳票・KML・内部通信の役割分担、ポートと障害の独立性\
入口: [出力設計目次](README.md)

---

## 1. 目的と出力・データ連携の4大境界

本書は飛行計画・現場運航記録の4大データ境界を定義します。KML生成、Drive保存、My Maps操作、機体ログ取込の詳細は [出力設計目次](README.md) から各正本を参照してください。

### 1.1 4大データ境界の役割分担

本システムでは、データの出力・連携境界を以下の4つに厳格に分離・限定します。**ユーザー向けにJSONファイルの出力を要件とせず、ユーザーへJSONの作成・編集・保存・アップロードを要求しません**。

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           アプリ内部 Domain Data (IndexedDB)                            │
│          (FlightPlan, Mission, Flight, Inspections, FlightAreaGeometry)                 │
└──────┬───────────────────────────┬───────────────────────────┬──────────────────────────┘
       │                           │                           │
       ▼ [境界 A: 台帳]            ▼ [境界 B: 帳票]            ▼ [境界 C: 地図出力]
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ Google Sheets (確定台帳)│ │ PDF / 印刷帳票          │ │ KML (ユーザー向け地図)  │
├─────────────────────────┤ ├─────────────────────────┤ ├─────────────────────────┤
│ ・確定台帳権威 (原本)   │ │ ・法的提出・紙面保管    │ │ ・ユーザー向けGeo Export│
│ ・長期保管・手動修正    │ │ ・A4縦 統合運航帳票     │ │ ・Google Drive自動保存  │
│ ・複数機体/BAT累計計算  │ │ ・国交省様式1・2・3     │ │ ・Google My Mapsインポート│
│ ・PDF生成元・検索・集計 │ │ ・人間向け印刷フォーマット│ │ ・1飛行1KML・視覚的確認 │
│ ※原本はSheetsに帰属    │ │ ※KMLをPDF代替にしない  │ │ ※台帳原本ではない      │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                                                                   ▲
                                                                   │ (完全分離)
                                                                   ▼
                                                        ┌─────────────────────────┐
                                                        │ [境界 D: 内部通信]      │
                                                        │ DIPS API JSON (内部電文)│
                                                        ├─────────────────────────┤
                                                        │ ・DIPS API内部通信限定  │
                                                        │ ・User-facing Export禁止│
                                                        │ ・正式credential取得時  │
                                                        │   (Phase C7 Optional)   │
                                                        │ ・API未取得時は生成不要 │
                                                        └─────────────────────────┘
```

1. **【境界 A: Google Sheets】（確定台帳権威・原本 - Ledger Authority）**:
   - 外部同期完了後の確定台帳権威は、 [11_data-authority.md](../11_data-authority.md) に基づき Google Sheets が担います。
   - 内部履歴・機材等の正規化と、人間向け04のA4／05の機体別整備媒体を[37](../drive-structure/37_environment-storage-responsibilities.md)に従って区別し、累計時間・サイクルの自動計算や、人間による事後補正（手修正上書き防止ルール適用）を可能にします。
2. **【境界 B: PDF / 印刷帳票】（人間向け印刷帳票 - Human-readable Report）**:
   - [18_reports.md](../18_reports.md)に基づく生成技術と、[35c](../operation-recording/35c_a4-operation-record.md)のA4実物・必要時PDF。A4はSheets標準印刷／PDFの経路も残す。国交省様式1・2・3別紙、地図付き飛行計画書とは区別する。
   - 航空局への提出、立ち入り検査時の提示、コンビニ・現地印刷、紙面保管用。KMLをPDFの代替にすることはできません。
3. **【境界 C: KML】（ユーザー向け地図出力 - User-facing Geo Export）**:
   - 飛行計画の通報内容と共通Geometryを地図として視覚的に確認・保管するための派生ファイル（運航結果は含めない。[27e](27e_kml-generation-timing-and-content.md)）。
   - 利用者が Google My Maps や Google Earth へ取り込んで確認するための地理情報交換フォーマットであり、台帳原本ではありません。
4. **【境界 D: DIPS API JSON】（DIPS API内部通信限定 - Internal DIPS API Transport）**:
   - 国交省 DIPS 2.0 飛行計画通報API（FPR）との通信時にのみ `ApiDipsAdapter` 内部で生成される内部電文。
   - **ユーザー向けのファイル出力・エクスポート機能としては一切提供しません**。
   - 正式なAPI利用資格・credentialが取得された場合のみ Phase C7（Optional Integration）で実装され、API未取得時や手動通報時には生成自体が不要です。

---

## 2. ユーザー向け出力と内部JSON・復旧の境界

一般利用者へAPI仕様の複雑なJSONを保存・確認・アップロードさせる設計は、現場操作の負担と誤認につながります。ユーザー向け地図出力はKML、確定台帳はSheets、提出・提示帳票はPDF（表形式出力はCSV/Excel）とし、ユーザーへJSONの作成・編集・保存・コピー・取込を要求しません。

- **DIPS API JSON**: C7 Optionalの内部transportです。API未利用時・手動通報時は生成不要です。生成、exact outbound payload、監査保存は [25c API Payload Mapping](../dips-flight-plan/25c_api-payload-mapping.md) と [15 DIPS Adapter](../15_dips-adapter.md) を正本とします。
- **Submission Snapshot**: 通報方式に関係なく保持する意味論的不変記録です。内部DBのシリアライズ形式をユーザー向けJSON出力と混同しません。型は [12d FlightPlan / DipsSubmission](../domain-model/12d_flight-plan-and-dips.md)、利用方法は [25c](../dips-flight-plan/25c_api-payload-mapping.md) を参照します。
- **全量DB復旧**: [ADR-0008](../../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md) により、旧ユーザー向けJSON backup/export/importは置換されます。将来のユーザー向け全量バックアップ/restore形式は `PENDING` です。**KMLはfull database backupではなく、DB復旧の代替にしません**。Sheetsの確定台帳・長期外部保管は維持します。

---

## 3. アーキテクチャ・ポート設計と障害分離

### 3.1 責務分離とポート定義（概念設計）

KML生成およびDrive保存は、Domain層やSheets同期ロジックから完全に独立したポートとして定義します（※TypeScript実装は後続Phaseにて実施）。

```text
┌─────────────────────────────────────────────────────────────┐
│ Domain層 (FlightPlan, Mission, Inspections, Geometry)       │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │ GeoExportPort     │           │ LedgerSyncPort    │
     └─────────┬─────────┘           └─────────┬─────────┘
               │                               │
               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │ KmlExporter       │           │ GoogleSheetsAdapter│
     └─────────┬─────────┘           └───────────────────┘
               │
               ▼
     ┌───────────────────┐
     │CloudFileStoragePort│
     └─────────┬─────────┘
               │
               ▼
     ┌───────────────────┐
     │GoogleDriveAdapter │
     └───────────────────┘
```

### 3.2 二重入力の完全禁止

- KML出力のために専用の入力画面を設けることは禁止します。
- 利用者はアプリの標準運航フロー（計画作成、点検、離着陸打刻）を一度入力するだけであり、同一のDomainデータから `GoogleSheetsAdapter`, `PdfReportGenerator`, `KmlExporter` がそれぞれ必要な射影を行います。

### 3.3 保存障害の完全分離（Fault Isolation）

- **Sheets同期成功 ＋ KML生成/Drive保存失敗**: 正式な運航記録・法定台帳保存は「成功」として扱います。KML保存エラーは非ブロッキングな警告ログとして記録し、再試行キューに留めます。
- **KML保存成功 ＋ Sheets同期失敗**: KMLがDriveに保存されても、台帳同期は `sync_pending` / `sync_failed` として追跡され、電波回復時に再同期されます。
- 各出力系統は独立したステータス（`ledger_sync_status`, `drive_kml_export_status`）を保持します。
- 未同期KMLの端末保持と、飛行後点検後の最後の送信時の再送の意味は[27e §4](27e_kml-generation-timing-and-content.md#4-生成契機保存未同期保持再送)。

---

## 4. Phase C 実装への影響とロードマップ

### 4.1 Phase C1（ローカルDB・型定義）への影響

- **影響範囲は最小限**: C1でKML Export機能やDrive通信を実装してはなりません。
- **C1で担保すべき基礎**:
  - `FlightAreaGeometry` の中立Domainモデル（円・ポリゴン・線形バッファ）を維持すること。
  - `FlightPlan` のID体系（安定したUUID v4）を維持すること。
  - KML専用の表示用HTML文字列やDriveメタデータをDomain正本テーブルへ無秩序に追加しないこと。

### 4.2 ロードマップ配置

- KML生成エンジン（`KmlExporter`）および Google Drive自動保存は、[23 実装ロードマップ](../23_implementation-roadmap.md) を正本として **Phase C8（帳票・外部エクスポート）** に配置します。旧C5.x（地図・Geo Export拡張）案は配置検討の履歴として保持し、前倒しは別途スコープ変更の承認を要します。
- 既存のPhase C1（Schema基礎）、C2（現行運航再現）、C4（Sheets台帳同期）の完了を阻害せず、後続の独立モジュールとして組み込みます。

C1ではユーザー向けJSON import/export、API通信、KML生成、Drive通信を実装しません。Phase範囲の正本は [23 実装ロードマップ](../23_implementation-roadmap.md) です。
