# 20. ソースコード構造とモジュール依存関係設計（20_source-structure.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計）

---

## 1. ディレクトリ構造設計（Phase C 実装基準）

`docs/guidelines/01_structure-and-maintenance-rules.md` で定めた構造設計9原則（堅牢性、セキュリティ、追加実装性、責務分離、保守性、テスト容易性、変更影響最小化、可読性、分割しすぎない）に基づき、以下のモジュールツリーを策定します。

```text
src/
├── app/                        # アプリ全体基盤・ルーター・初期化
│   ├── routes.ts               # 画面ルーティング
│   ├── App.tsx                 # ルートコンポーネント
│   └── service-worker-reg.ts   # PWA Service Worker登録・更新検知
│
├── domain/                     # 純粋なビジネスロジック・エンティティ（外部非依存）
│   ├── organization/           # 組織・顧客(Client)・案件(Project)マスター
│   ├── personnel/              # 人員(Personnel)一元化マスター・権限
│   ├── aircraft/               # 機種型式(AircraftModel)・機体個体(Aircraft)・累計計算
│   ├── battery/                # バッテリー型式・適合性・個体・ライフサイクル台帳
│   ├── location/               # 現場場所(Location)・飛行範囲プリセット(FlightAreaPreset)
│   ├── preset/                 # 飛行目的・安全措置・運航テンプレート(OperationTemplate)
│   ├── flight-log/             # 運航セッション・離着陸・日常点検・点検整備サマリー
│   ├── flight-plan/            # 飛行計画・DipsSubmission・許可承認(Permission)
│   ├── report/                 # 統合運航帳票(IntegratedOperationReport)・ReportUnit・Snapshot
│   └── dips/                   # DIPS通報ドメインモデル
│
├── usecases/                   # アプリケーション固有の業務ユースケース
│   ├── operations/             # 運航状態マシン制御（離陸、着陸、BAT交換等）
│   ├── sync/                   # 同期キュー実行・競合解決ユースケース
│   ├── dips/                   # DIPS通報・照会オーケストレーション
│   └── reports/                # 帳票生成データ組み立て
│
├── infrastructure/             # 外部システム接続・ブラウザAPI実装
│   ├── storage/                # Dexie.js (IndexedDB) 実装、マイグレーション
│   ├── dips/                   # DIPS Adapter (DRS, FPA, FPR, Mock)
│   ├── spreadsheet/            # Google Sheets API / GAS連携アダプター
│   ├── map/                    # MapLibre GL JS ラッパー・タイルキャッシュ
│   ├── export/                 # pdf-lib, CSV, Excel 生成エンジン
│   └── device/                 # Geolocation, Storage API (persist)
│
├── presentation/               # UIコンポーネント・画面（React/Vanilla）
│   ├── pages/                  # 画面単位（Home, Operation, Plan, Log, Settings）
│   ├── components/             # 共通高コントラストUIパーツ（Button, Timer, Map）
│   └── hooks/                  # UIステート・イベントフック
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
