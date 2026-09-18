# 20. ソースコード構造とモジュール依存関係設計（20_source-structure.md）

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`
フェーズ: Phase B設計凍結 / C0 Shell構築完了 / C1未着手

---

## 1. ディレクトリ構造設計（Phase C 実装基準）

現在のC0は `src/main.ts`、`app/App.ts`、`app/service-worker-reg.ts`、`presentation/styles/` によるVanilla TypeScriptです。下記は後続Phaseの責務配置案を含み、全ディレクトリが実装済みという意味ではありません。React/TSX導入は決定していません。

設計を決める順序は[記入支援の目的](../00_goal.md#11-記入支援を中心に置くまでの因果)と[23の開始ゲート](23_implementation-roadmap.md#12-保存出力を確かめてから依存実装へ進むゲート)に従う。下記のモジュール配置があることを、出力先が未確定でもコードを先に作ってよい根拠にしない。画面仕様の記録単位は[Presentation](presentation/README.md)を参照する。今回のStep 1で下記のsource構造やコードを変更しない。

`docs/guidelines/01_structure-and-maintenance-rules.md` で定めた構造設計9原則（堅牢性、セキュリティ、追加実装性、責務分離、保守性、テスト容易性、変更影響最小化、可読性、分割しすぎない）に基づき、以下のモジュールツリーを策定します。

```text
src/
├── app/                        # アプリ全体基盤・ルーター・初期化
│   ├── routes.ts               # 画面ルーティング
│   ├── App.ts                  # C0のAppShell（Vanilla TypeScript）
│   └── service-worker-reg.ts   # PWA Service Worker登録・更新検知
│
├── domain/                     # 純粋なビジネスロジック・エンティティ（外部非依存）
│   ├── organization/           # 組織・顧客(Client)・案件(Project)マスター
│   ├── personnel/              # 人員(Personnel)・Actor/Pilot/Contact意味論（認証処理は別）
│   ├── aircraft/               # 機種型式(AircraftModel)・機体個体(Aircraft)・累計計算
│   ├── battery/                # バッテリー型式・適合性・個体・ライフサイクル台帳
│   ├── location/               # 現場場所(Location)・飛行範囲プリセット(FlightAreaPreset)
│   ├── preset/                 # 飛行目的・安全措置・運航テンプレート(OperationTemplate)
│   ├── flight-log/             # 運航セッション・離着陸・日常点検・点検整備サマリー
│   ├── flight-plan/            # FlightPlan・Permission・InsurancePolicy（外部API数値コード非依存）
│   ├── report/                 # 統合運航帳票(IntegratedOperationReport)・ReportUnit・Snapshot
│   └── dips/                   # DipsSubmission・意味論snapshot・通報要否（通信なし）
│
├── usecases/                   # アプリケーション固有の業務ユースケース
│   ├── operations/             # 運航状態マシン制御（離陸、着陸、BAT交換等）
│   ├── sync/                   # 同期キュー実行・競合解決ユースケース
│   ├── dips/                   # Manual支援・要件評価・通報照会（C7 APIのみOptional）
│   └── reports/                # 帳票生成データ組み立て
│
├── infrastructure/             # 外部システム接続・ブラウザAPI実装
│   ├── storage/                # Dexie.js (IndexedDB) 実装、マイグレーション
│   ├── dips/                   # DIPS Adapter (DRS, FPA, FPR, Mock)
│   ├── sheets/                 # 正規化台帳同期（Sheets API / GAS利用時の接続）
│   ├── drive/                  # ファイル保存・更新（GoogleDriveAdapter）
│   ├── map/                    # 地図レンダリングラッパー・タイルキャッシュ
│   ├── export/                 # 用途別生成Adapter
│   │   ├── pdf/                # 人間向け帳票レンダリング
│   │   ├── kml/                # ユーザー向け地図出力
│   │   └── tabular/            # CSV / Excel（DB全量restore仕様とは別）
│   └── device/                 # Geolocation, Storage API (persist)
│
├── presentation/               # UIコンポーネント・画面（C0: Vanilla TypeScript）
│   ├── pages/                  # 画面単位（Home, Operation, Plan, Log, Settings）
│   ├── components/             # 共通高コントラストUIパーツ（Button, Timer, Map）
│   └── state/                  # UIステート・イベント管理（React hooksを前提にしない）
│
└── shared/                     # 共通型定義・ユーティリティ
    ├── types/                  # 共通DTO、UUID、Result型
    ├── utils/                  # 日時計算、数値フォーマッター
    └── logger/                 # マスキング対応ロガー
```

---

## 2. レイヤード・アーキテクチャと依存方向ルール

システムの依存関係は、**オニオンアーキテクチャ／クリーンアーキテクチャ**の原則に従い、常に**「外側から内側への単方向依存」**を厳守します。

```text
[Presentation (UI)]
       │
       ▼
[Usecases (Application)]
       │
       ▼
[Domain (Entities & Rules)] ◄─── (最も内側・外部依存ゼロ)
       ▲
       │ (Interfaces / Ports 実装)
[Infrastructure (Adapters)]
```

### 2.1 厳格な禁止依存ルール
1. **Domain層の純粋性**: `src/domain/` は、React、Dexie、MapLibre、Cloudflare、Google API、DOM API等の一切の外部ライブラリをインポートしてはならない（純粋なTypeScriptのみ）。
2. **UIからのインフラ直叩き禁止**: `presentation/` のコンポーネントが、直接 `infrastructure/storage/` や `infrastructure/dips/` を呼び出してはならない。必ず `usecases/` を経由する。
3. **循環依存の禁止**: モジュール間の循環参照（A -> B -> A）はLintツール（ESLint `import/no-cycle`）で機械的に防止する。


## 3. 外部責務とPhaseの対応

| 境界 | 責務と正本 | 実装Phase |
|---|---|---|
| Domain / storage | [Domain](domain-model/README.md)のschema/type、IndexedDB永続化。Geometryは[17](17_map-and-airspace.md) | C1（高度CRUD・map・export・通信は含めない） |
| Sheets | [Sheets Ledger](dips-submission/24a_submission-and-sheets-ledger.md)の台帳保存。[Data Authority](11_data-authority.md)と[SyncQueue](14_offline-and-sync.md)に従う | C4 |
| Map | [17](17_map-and-airspace.md)の中立Geometryと描画Adapter。Leaflet / MapLibre GL JS等は実機比較後に選定 | C5 |
| Manual DIPS | [25b](dips-flight-plan/25b_manual-web-mapping.md)のViewModelと[24](dips-submission/24_manual-submission.md)の通報確認フロー | C6 |
| API DIPS | [15](15_dips-adapter.md)の通信境界、[25c](dips-flight-plan/25c_api-payload-mapping.md)のDTO/code mapping/serialization | C7 Optional |
| PDF / KML / Drive | [Reports](18_reports.md)と[Output](output/README.md)。生成とアップロードは独立し、失敗を運航に波及させない | C8 |

- バックエンド認証・secret・セッションは[16_security](16_security.md)の境界で扱い、フロント`infrastructure/`へ平文秘密情報を配置しない。
- 旧`spreadsheet/`のSheets・Drive・GAS一括配置案を、台帳同期とファイル保存に分けた。GASはSheets接続に用いる場合の実装選択肢であり、新アプリ全体の必須基盤ではない。
- API contract-awareなRequirement EngineはApplication側と契約定義の境界で扱い、Coreへ公式API数値コードやtransport DTOを持ち込まない。
- KMLはDB backupではない。全量restoreの形式・実装は[ADR-0008](../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md)でPENDING。C1で新しいexport/import実装を追加しない。

Step 2の人物・環境・権限・離任の概念は[identity-and-access](identity-and-access/README.md)を参照する。本書のpersonnel配置に認証・Google共有・業務権限の詳細を集約せず、具体的モジュール配置はschema・保存・権限の未確定と開始ゲートを確認して判断する。今回コードおよびsourceツリー案の追加は行わない。
