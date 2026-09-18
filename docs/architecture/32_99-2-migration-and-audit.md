# 32. 99.2設計検討正本 最終移植・状態分類・横断差分監査正本（32_99-2-migration-and-audit.md）

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`
フェーズ: Phase B設計凍結 / Step 8（99.2最終移植・差分監査完了）
文書種別: 設計移植監査正本（Audit Ledger）

---

## 1. 本文書の役割と監査基準点

### 1.1 文書の位置づけ

本文書は、非公開の検討正本（`99.2_設計検討メモ_全論点・根拠・因果統合正本`）に蓄積された全12セクション（§0〜§11）の設計検討論点・根拠・因果関係が、公開リポジトリ（GitHub）の `docs/architecture/` 配下の各正式設計正本へどのように移植され、どの設計状態として位置づけられたかを網羅的に記録・証明する **最終移植監査正本（SSOT of Migration Audit）** です。

> [!IMPORTANT]
> **本文書の解釈原則**
> 1. **99.2の役割**: 99.2は完成仕様書ではなく、「設計検討の過程で何を問題と考え、どの案を検討し、なぜ現在案になり、何が未確定かを保持する検討正本」です。したがって「99.2に記載されていること」は自動的に確定仕様（CURRENT-ACCEPTED）を意味しません。
> 2. **「移植完了」の意味**: 本監査における「移植完了」とは、すべての設計項目が確定・凍結されたという意味ではありません。`CURRENT-PROPOSAL`、`PENDING`、`VERIFY` として留保されるべき課題が、正当な理由と因果を伴って正式文書へ正確に位置づけられていることをもって「移植完了」と判定します。
> 3. **原本との独立性**: 99.2そのものを置き換えるものではなく、正式設計書群とのトレーサビリティを永久に保証するための監査台帳です。

### 1.2 監査対象と基準コミット

- **監査対象原本**: `99.2_設計検討メモ_全論点・根拠・因果統合正本.md`（§0〜§11 全12セクション）
- **公開照合スナップショット**: `docs/migration/99.2_設計検討正本_移植元スナップショット.md`
- **原本SHA-256照合結果**:
  - ローカル生99.2の実測SHA-256: `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358`
  - 公開スナップショットヘッダー記録値: `f31b4856ad4a35e643df46f17f257ef4d16be8484b67f0f10e4dc65ddc03f358`
  - 照合判定: **完全一致**（スナップショット作成時からローカル原本に一切の変更がなく、同一の正本から差分監査が行われたことを確認）。
- **Step 8 開始基準点**: `c29ab7187b92da10baff1a7e00f7aa38daae9d05`
- **Step 8 Commit 1 基準点**: `fb324438cc2c83429bab94808cb31940731aaeef`（`11_data-authority.md` および `14_offline-and-sync.md` の境界是正）
- **監査実施対象文書群**: Step 1〜7で正式化された全文書 ＋ Step 8 Commit 1で更新された2文書

---

## 2. §0〜§11（全12セクション）トレーサビリティ・マトリクス

99.2検討正本の全12セクションが、各正式正本へどのような設計状態で位置づけられたかを下表に示します。

| 99.2 セクション | 主な論点と決定事項 | 移植先正式文書 | 設計状態分類 | 監査判定 | 残保留・留保事項（PENDING / VERIFY） |
|---|---|---|:---:|:---:|---|
| **§0. この文書の役割と整理原則** | ・記入支援Webアプリとしての目的<br>・A4運航帳票・点検整備・BAT管理を優先<br>・人の運用に合わせた設計逆算 | [00_goal](../00_goal.md)<br>[10_system-boundaries](10_system-boundaries.md) | `CURRENT-ACCEPTED` | 合格 | なし（基本思想として確定） |
| **§1. 全体方針・実装開始ゲート** | ・Phase C1開始前のdocs再編と監査ゲート<br>・旧GAS運用資産の尊重 | [23_implementation-roadmap](23_implementation-roadmap.md)<br>[AGENTS](../../AGENTS.md) | `CURRENT-ACCEPTED` | 合格 | C1実装開始ゲート（オーナー承認待ち） |
| **§2. 運用環境・人物・Googleアカウント・役割・権限・離任** | ・運用環境（Organization / Individual）分離<br>・三層権限（管理者・運航管理者・操縦者/補助者）<br>・Googleアカウント認証境界<br>・所属ライフサイクルと離任時データ保全 | [identity-and-access/README](identity-and-access/README.md)<br>[12a_organization-and-personnel](domain-model/12a_organization-and-personnel.md) | `CURRENT-ACCEPTED`<br>(ADR-0010 Proposed) | 合格 | 複数環境所属時のアクティブ切替UI詳細（`PENDING-C1-UI`） |
| **§3. 初回セットアップ・通常起動・ホーム** | ・ホーム4大入口（新規飛行・飛行リスト・飛行履歴/出力・各種設定/管理）<br>・通常起動とオフライン起動のUX<br>・マスターその場登録UX（運航停止防止） | [30a_home-and-navigation](presentation/30a_home-and-navigation.md)<br>[30b_screen-specification-standard](presentation/30b_screen-specification-standard.md) | `CURRENT-ACCEPTED`<br>(ADR-0011 Proposed) | 合格 | 各種設定・管理の第2階層詳細画面（`PENDING-C1-UI`） |
| **§4. 機体・バッテリー・中古EVO Lite+** | ・機体とBATの多対多管理（所有固定化の回避）<br>・中古機体取得時の「取得時状態確認」履歴分離<br>・BAT個別生涯履歴（サイクル数・状態） | [12b_aircraft-and-battery](domain-model/12b_aircraft-and-battery.md)<br>[12e_operation-inspection](domain-model/12e_operation-inspection-maintenance.md) | `CURRENT-ACCEPTED` | 合格 | 機体・BATの物理DBスキーマ（`PENDING-C1-SCHEMA`） |
| **§5. 柔軟な取扱いの1飛行・通常運航フロー・A4帳票** | ・DIPS FlightPlanと運航上のFlightの分離<br>・BAT交換・継続運航を含む柔軟な1 Flight運用<br>・機体交代の非固定化（状況に応じた扱い）<br>・A4縦・1ページ1シート・最大7明細・超過時 `_2` 連番複製 | [12e_operation-inspection](domain-model/12e_operation-inspection-maintenance.md)<br>[13a_operation](state-machines/13a_operation.md)<br>[18_reports](18_reports.md)<br>[29_drive-folder](drive-storage-schema/29_drive-folder-and-sheets-structure.md) | `CURRENT-ACCEPTED`<br>(ADR-0012 Proposed) | 合格 | 印刷マージン等のCSS実機微調整（`PENDING-C1-PRINT`） |
| **§6. 点検整備記録** | ・05フォルダー配下の機体別独立フォルダー・シート管理<br>・日常点検と点検整備記録の明確な責務分離<br>・実施者Actorと記録作成者/転記者Actorの分離 | [12e_operation-inspection](domain-model/12e_operation-inspection-maintenance.md)<br>[29_drive-folder](drive-storage-schema/29_drive-folder-and-sheets-structure.md) | `CURRENT-ACCEPTED` | 合格 | 外部整備業者報告書のPDF添付保存方式（`PENDING-C1-STORAGE`） |
| **§7. DIPS・Geometry・手動通報/API・証跡** | ・中立Geometry（POLYGON / CIRCLE / BUFFERED_LINE）<br>・手動通報支援画面と独立Sheets台帳<br>・DIPS結果UNKNOWN時の照合（Reconciliation）<br>・Google Cloud NAT固定Egress IPゲートウェイ | [17_map-and-airspace](17_map-and-airspace.md)<br>[24_manual-submission](dips-submission/24_manual-submission.md)<br>[24a_submission-ledger](dips-submission/24a_submission-and-sheets-ledger.md)<br>[31_dedicated-egress-ip](dips-infrastructure/31_dedicated-egress-ip-gateway.md) | `CURRENT-ACCEPTED`<br>(ADR-0014 Proposed) | 合格 | 地図描画ライブラリ選定（ADR-0009によりC5実機評価へ留保） |
| **§8. KML・My Maps/Google Earth・PDF・飛行履歴/出力** | ・通報時に生成し、`07_出力_PDF・KML/KML/` への保存を試みる<br>・1 DIPS FlightPlan / finalized submission_snapshot につき1 KML（事後実績追記の排除）<br>・飛行履歴・出力画面（オンデマンド出力）<br>・KMLサブフォルダー（`操縦者/年度`）案 | [27_output-boundaries](output/27_output-boundaries.md)<br>[27a_kml-export](output/27a_kml-export.md)<br>[27b_google-drive-storage](output/27b_google-drive-storage.md)<br>[30d_history-and-export-ui](presentation/30d_history-and-export-ui.md) | `CURRENT-ACCEPTED`<br>一部 `CURRENT-PROPOSAL`<br>(ADR-0013 Proposed) | 合格 | KML詳細サブフォルダーおよび最終ファイル名命名規則（PENDING） |
| **§9. Drive/Sheets正本・端末cache・同期・低コスト** | ・正本権威はアプリ管理データの範囲に限定<br>・端末側一時保持の cache と draft の概念分離<br>・入力保護と3段階確定分離（通報時、運航中、最終送信）<br>・障害分離境界（Sheets/KML失敗でDIPS再通報しない、共有飛行リスト登録非ブロッキング）<br>・一般cache非固定TTL破棄禁止、飛行リストは共有作業キュー | [11_data-authority](11_data-authority.md)<br>[14_offline-and-sync](14_offline-and-sync.md) | `CURRENT-ACCEPTED`<br>一部 `CURRENT-PROPOSAL`<br>一部 `PENDING` | 合格 | 端末保存具体技術（IndexedDB等）、SyncQueue物理実装、飛行リストauto-cleanタイミング（`PENDING-C1-FLIGHTLIST-CLEANUP`） |
| **§10. Drive現在構造と旧構造からの変遷** | ・現行 01〜07 物理フォルダー構造の確立<br>・旧90台帳・旧モックからの退避・変遷履歴の保持<br>・実Driveに存在するだけで最終仕様としない原則 | [29_drive-folder](drive-storage-schema/29_drive-folder-and-sheets-structure.md)<br>[drive-storage-schema/README](drive-storage-schema/README.md) | `CURRENT-ACCEPTED` | 合格 | 各マスターSpreadsheetの物理カラム定義（`PENDING-C1-SCHEMA`） |
| **§11. 正式設計書への移植・差分監査・旧資料の扱い** | ・因果・理由・未確定事項を保持した移植規約<br>・旧案払拭の確認（Cloudflare Workers、KML事後追記、A4旧ページネーション等）<br>・本32番による網羅的監査と状態維持 | [32_99-2-migration-and-audit](32_99-2-migration-and-audit.md)（本書）<br>[architecture/README](README.md) | `CURRENT-ACCEPTED` | 合格 | 本監査完了後のオーナー最終承認ゲート |

---

## 3. Step 1〜8 横断監査結果（重要設計境界の検証）

Step 1〜7で整備された正式設計文書群、およびStep 8 Commit 1で更新された `11_data-authority.md`, `14_offline-and-sync.md` を対象として、横断的な監査を実施しました。

### 3.1 監査検証項目と判定

| 監査項目 | 監査判定 | 検証内容・根拠 |
|---|:---:|---|
| **1. 不適切なCURRENT-ACCEPTED昇格の有無** | **合格 (0件)** | 99.2の例示（KML配下の `操縦者/年度` 階層案等）や検討案（SyncJobスキーマ等）が誤ってCURRENT-ACCEPTEDに昇格していないことを確認。 |
| **2. CURRENT-PROPOSAL / NEW-PROPOSALの混同** | **合格 (0件)** | 99.2由来の有力案（未同期KML再送案等）が `CURRENT-PROPOSAL`、新規提案が `NEW-PROPOSAL` として正確に分離されていることを確認。 |
| **3. PENDINGの消失・先行固定の有無** | **合格 (0件)** | DB物理スキーマ、具体的ID型、SyncQueue物理実装、全量DB復旧形式（`PENDING-LOCAL-RESTORE-01`）、飛行リストauto-clean具体タイミング（`PENDING-C1-FLIGHTLIST-CLEANUP`）が正しく留保されていることを確認。 |
| **4. HISTORICAL案の誤認復活の有無** | **合格 (0件)** | 旧A4のNo.1/No.2左右2ブロック案、旧ユーザー向け全量JSON入出力復旧案、旧Mission完了時KML追記案等の過去却下案が本文に混入していないことを確認。 |
| **5. Cloudflare Workers前提の残存有無** | **合格 (0件)** | ADR-0001およびADR-0007に準拠し、Cloudflare Workersが必須前提であるかのような記述が排除されていることを確認。 |
| **6. 画面仕様規約の整合性** | **合格 (0件)** | 旧10項目テンプレートの残存はなく、30bで定義された標準11項目テンプレートおよび30aホーム4大入口に完全に整合していることを確認。 |
| **7. DIPS FlightPlan と 運航上の柔軟なFlightの分離** | **合格 (0件)** | 航空法上の通報単位（FlightPlan）と現場の柔軟な運航（Flight）が別概念として厳格に分離されていることを確認。 |
| **8. KML生成仕様・障害分離境界の維持** | **合格 (0件)** | 1 DIPS FlightPlan / finalized submission_snapshot につき1 KML、通報内容＋Geometryで通報時に生成し、07_出力_PDF・KML/KML/ への保存を試みる、事後実績追記なし、Drive/Sheets/KML側の同期失敗だけを理由にDIPS再通報しない境界、共有飛行リスト登録の非ブロッキング境界が完全堅持されていることを確認。 |
| **9. 未同期KML再送案の状態分類** | **合格 (0件)** | 最終送信時または通信復帰時の再送案は `CURRENT-PROPOSAL` に留まり、具体的retry/sync方式は `PENDING-C1-SYNC` として保護されていることを確認。 |
| **10. A4運航記録原本の正確な仕様** | **合格 (0件)** | 単純な「1飛行1シート」ではなく、「A4縦・1ページ1物理シート・最大7明細・8明細目から `YYYY.M.D_2` 連番複製」として正確に規定されていることを確認。 |
| **11. 柔軟なFlightと機体交代の非固定化** | **合格 (0件)** | BAT交換を含む継続運航を柔軟に1 Flightとして扱える一方、機体交代は状況次第で新Flightになる場合もあり、「常に同一」「常に別」のいずれにも固定されていないことを確認。 |
| **12. 05点検整備台帳と日常点検の分離** | **合格 (0件)** | 点検整備記録が05フォルダー配下の機体別独立フォルダー・シートで管理され、日常点検と混同されていないことを確認。 |
| **13. Data Authorityの範囲と cache / draft 分離** | **合格 (0件)** | 正本権威が「アプリ管理データ」に限定され、DIPS外部客観的事実を除外。端末側一時保持が `cache / replica`（確定マスター）と `draft / local work state`（現場未送信データ）に概念分離されていることを確認。 |
| **14. IndexedDB等の具体技術の非確定化** | **合格 (0件)** | 端末側入力保護が技術中立な原則として規定され、IndexedDB等の具体技術が `PENDING-C1-SYNC` / `PENDING-C1-SCHEMA` に留保されていることを確認。 |
| **15. DIPS UNKNOWN時の盲目的再POST禁止** | **合格 (0件)** | 結果不明時に自動再POSTを行わず、照合（Reconciliation）または目視確認へ進む原則が完全堅持されていることを確認。 |

---

## 4. ADR-0010〜0014 の対応関係と Accepted 候補判定条件

本移植監査完了時点において、ADR-0010〜0014 はすべて **提案中（Proposed）** を維持しています。各ADRの対応Step、対応正式文書、およびオーナーによるAccepted承認に向けた判定条件は以下のとおりです。

| ADR番号・名称 | 対応Step | 対応正式文書 | Step 8 監査結果 | Accepted候補判定条件（オーナー承認基準） |
|---|:---:|---|:---:|---|
| **ADR-0010**<br>三層権限・運用環境境界の採用 | **Step 2** | [identity-and-access/README](identity-and-access/README.md)<br>[11_data-authority](11_data-authority.md) | **整合確認済** | 運用環境分離、三層権限、Googleアカウント境界、所属・離任ライフサイクルが、Step 8で限定したアプリ管理データのData Authorityと完全に整合し、矛盾がないこと。 |
| **ADR-0011**<br>共有飛行リストを用いた非同期運航引継ぎ方式の採用 | **Step 5** | [30a_home-and-navigation](presentation/30a_home-and-navigation.md)<br>[30c_shared-flight-list-ui](presentation/30c_shared-flight-list-ui.md)<br>[11_data-authority](11_data-authority.md) | **整合確認済** | ホーム4大入口、共有飛行リスト（通報済み計画の別端末引継ぎ・共有作業キュー）、マスターその場登録UXが、Step 8の飛行リストキャッシュ整理（auto-clean timingはPENDING）と完全に整合していること。 |
| **ADR-0012**<br>統合帳票における固定1枚テンプレート日付複製方式の採用 | **Step 6** | [18_reports](18_reports.md)<br>[29_drive-folder](drive-storage-schema/29_drive-folder-and-sheets-structure.md)<br>[11_data-authority](11_data-authority.md) | **整合確認済** | A4縦・1ページ1物理シート・最大7明細・超過時 `_2` 連番シート複製による日常点検・飛行記録の原本保護、および機体別点検整備記録の独立管理が、Step 8の確定台帳権威と完全に整合していること。 |
| **ADR-0013**<br>飛行計画確定・DIPS通報時のKML生成・保存 | **Step 7** | [27_output-boundaries](output/27_output-boundaries.md)<br>[27a_kml-export](output/27a_kml-export.md)<br>[14_offline-and-sync](14_offline-and-sync.md) | **整合確認済** | KML生成タイミングが「DIPS通報時（finalized submission_snapshot確定時）」に生成し07_出力_PDF・KML/KML/への保存を試みること、中立Geometry＋通報内容で完結し事後実績を含まないこと、Drive/Sheets/KML側の同期失敗だけを理由にDIPS再通報しないこと、KML失敗が飛行リスト登録を阻害しないことが、Step 8の障害分離境界と完全に整合していること（※最終送信時再送案はCURRENT-PROPOSAL維持）。 |
| **ADR-0014**<br>専用Egress IPゲートウェイによるDIPS API接続構成の採用 | **Step 4** | [31_dedicated-egress-ip](dips-infrastructure/31_dedicated-egress-ip-gateway.md)<br>[14_offline-and-sync](14_offline-and-sync.md)<br>[15_dips-adapter](15_dips-adapter.md) | **整合確認済** | DIPS API接続における固定送信元IP要件、Google Cloud NAT / VPC Egressゲートウェイによる秘密情報隔離、およびDIPS結果UNKNOWN時の照合（Reconciliation）原則が、Step 8の障害分離境界と完全に整合していること。 |

---

## 5. C1実装へ引き継ぐ前提条件と保留課題一覧（PENDING / VERIFY）

本移植監査の完了により、99.2検討正本の全論点が正式文書群へ整理されましたが、以下の実装課題は意図的に未確定事項（PENDING / VERIFY）としてC1以降の開発へ引き継ぎます。

1. **`PENDING-C1-SYNC`**:
   - 端末側一時保持の具体実装技術（IndexedDB、localStorage、あるいはそのラッパーライブラリ）。
   - 同期キュー（SyncQueue）の物理テーブル構造、具体的キュー永続化方式。
   - 指数バックオフの秒数・最大リトライ回数・間隔等の具体的リトライパラメータ。
   - 未同期KMLの具体的retry/sync実装方式、および保存済みKMLの重複回避の物理判定方式。
2. **`PENDING-C1-SCHEMA`**:
   - 各Entity（人員、機体、バッテリー、運航記録、点検記録等）の物理DBスキーマおよびSpreadsheet上の具体的物理カラム配置。
   - 具体的ID型（UUID v4、サロゲートキー等の型定義）。
   - Flight単位の実操縦者参照の具体的FK保持形式。
3. **`PENDING-C1-FLIGHTLIST-CLEANUP`**:
   - 共有飛行リストにおける自動クリーンアップの具体的実行タイミング（予定日時から何時間/日、完了時即時/当日残置、中止計画の除外条件等）。
4. **KML詳細サブフォルダーおよび最終ファイル名命名規則（PENDING）**:
   - KML保存先における最終ファイル名規則、および `操縦者/年度/...` などの詳細サブフォルダー階層の採用是非（※Step 8監査上の整理項目。99.2および27aでは実装Phaseの検討課題としてPENDING留保）。
5. **`PENDING-AUDIT-QUEUE`**:
   - 06_DIPS関連台帳側における中央監査用SyncQueueの恒久保持是非。
6. **`PENDING-LOCAL-RESTORE-01`**:
   - 端末ローカル全量DB backup / restore の将来ユーザー形式・検証/暗号化・競合処理。
7. **`VERIFY-C5-MAP`**:
   - 中立FlightAreaGeometryを描画・編集するためのオフライン地図ライブラリ選定（ADR-0009によりPhase C5の実機評価へ留保）。

---

## 6. 監査総括

- 99.2検討正本（§0〜§11 全12セクション）の全論点は、因果関係・判断理由・例外・未確定事項を完全に保持した状態で、各担当正式文書へ網羅的に移植されました。
- Step 1〜7およびStep 8 Commit 1の正式文書群との横断照合において、**未解決の不整合・矛盾・不適切な確定昇格は0件** であることを確認しました。
- 本監査記録をもって、**Step 8 99.2移植・差分監査の完了** と判定します。
