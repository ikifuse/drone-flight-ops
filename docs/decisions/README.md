# アーキテクチャ決定記録（ADR: Architecture Decision Records）

最終更新: 2026-09-19
プロジェクト: `drone-flight-ops`

---

## 1. ADRの導入目的と運用ルール

プロジェクトが進行するにつれ、「なぜその技術を選んだのか」「なぜ別の方法を採用しなかったのか」という重要な設計理由が時間とともに失われがちです。
本リポジトリでは、将来のアーキテクチャ設計（Phase B以降）や重要技術の決定において、必ずADRを作成して保存します。

### 運用ルール

- **ファイル命名規則**: `docs/decisions/ADR-XXXX-title.md`（4桁連番、ケバブケース）
- **意思決定の記録対象**:
  - クライアント実行形態（PWA、クロスプラットフォーム、ネイティブ等の比較選定）
  - バックエンド構成・認証アーキテクチャ（サーバーレス、自前API、ローカル完結等）
  - データストア選定（SQLite、IndexedDB、スプレッドシートの役割分担等）
  - 地図ライブラリ・空域ポリゴン描画エンジンの選定
  - DIPS 2.0 API 通信アダプターの設計方式
  - オフライン同期・ローカルファースト永続化の設計方式
  - PDF/Excel/CSV 帳票生成エンジンの選定
  - 秘密情報（client_secret）の保護方式
- **一度承認されたADRの改ざん禁止**:
  - 過去の決定を変更・破棄する場合は、過去のADRを上書きせず、新しいADRを作成して「ADR-XXXX を置換（Supersedes）」または「指定部分のみ置換（Partially Supersedes）」と記録します。対象の章・決定項目、置換しない範囲、新決定の根拠を明記してください。
  - 承認済み文書の誤記・残存状態文言を訂正する場合は、採用判断を変えないことを確認し、訂正日・根拠・変更範囲を記録します。設計変更を誤記訂正として扱ってはいけません。

---

## 2. ADR標準テンプレート

新しい決定を行う際は、以下のフォーマットをそのまま使用してください。

```markdown
# ADR-XXXX: [決定の簡潔なタイトル]

- **作成日**: YYYY-MM-DD
- **ステータス**: 提案中 / 承認済み / 一部置換済み / 置換済み / 破棄
- **関係性**: Supersedes / Partially Supersedes / Clarifies と、対象ADR・章・範囲（該当時）
- **決定者**: [オーナー名、AIエージェント名など]
- **関連要件**: [docs/03_integrated-requirements.md の該当セクションなど]

## 1. 背景と課題（Context）

どのような課題を解決するためにこの決定が必要になったのか、前提条件や制約事項を記載します。

## 2. 検討した選択肢（Options Considered）

- 選択肢A: [概要]
- 選択肢B: [概要]
- 選択肢C: [概要]

## 3. 決定内容（Decision）

何を採用することに決めたかを明確に記載します。

## 4. 採用理由と他案の却下理由（Rationale）

- なぜその選択肢を採用したのか？
- 他の選択肢はなぜ採用しなかったのか（デメリット、制約、オーバースペック等）？

## 5. メリット（Pros）

この決定によって得られる具体的な利点。

## 6. デメリット・トレードオフ（Cons / Trade-offs）

この決定によって生じる制約、新たな課題、負債リスク。

## 7. 将来この決定を見直す条件（Re-evaluation Triggers）

どのような前提条件が崩れた場合（例: API仕様変更、利用者急増、技術成熟等）に再検討すべきか。
```

---

## 3. ADR履歴一覧

| 番号 | タイトル | ステータス | 決定日 | 概要 |
|---|---|---|---|---|
| ADR-0000（本README内の運用決定。独立ファイルなし） | ADRの導入と運用ルールの策定 | **承認済み** | 2026-09-14 | 技術的意思決定の透明性と追跡性を確保するためADRを導入 |
| [ADR-0001](ADR-0001-architecture-selection.md) | 総合運航管理システムのアーキテクチャ選定 | **承認済み・一部置換** | 2026-09-14 | PWA/Hybridは維持。DIPS用Workers変更は0018 Proposed、JSONは0008、地図は0009を参照 |
| [ADR-0002](ADR-0002-data-authority-and-sync.md) | ライフサイクル連動型ハイブリッド正本モデルと手動修正尊重の採用 | **承認済み** | 2026-09-14 | 現場端末一次権威と外部台帳確定、手修正上書き防止の採用 |
| [ADR-0003](ADR-0003-offline-storage-and-eviction-defense.md) | ローカル永続化方式とWebKitストレージ自動削除への多層防御 | **承認済み・一部置換** | 2026-09-14 | IndexedDB/persist/Sheetsは維持。ユーザーJSON backup/export/import部分のみ0008で置換 |
| [ADR-0004](ADR-0004-dips-adapter-architecture.md) | DIPS 2.0 Adapter分離とバックエンド中継境界の採用 | **承認済み** | 2026-09-14 | Adapter・秘密隔離を維持。Workers指定の変更記録は0018 Proposed、正式認証は16のVERIFY |
| [ADR-0005](ADR-0005-state-machine-separation.md) | 運航状態マシンとDIPS通報状態マシンの厳格分離および飛行可能誤認防止 | **承認済み** | 2026-09-14 | 現場物理運航と電子手続き通報の完全分離、安全確認UIの徹底 |
| [ADR-0006](ADR-0006-dips-optional-and-manual-submission-ledger.md) | DIPS API非依存・手動通報フォールバック・飛行計画台帳の独立保持 | **承認済み** | 2026-09-14 | API非依存完結、手動入力支援第一級サポート、提出不変スナップショットと台帳先行保存 |
| [ADR-0007](ADR-0007-normalized-masters-and-business-reporting.md) | 正規化マスター体系・共有機材モデル・業務利用拡張性・再利用プリセットおよび統合帳票境界の策定 | **承認済み** | 2026-09-14 | 機種/機体分離、バッテリー型式/個体分離・共有(N:M)、人員/場所マスター、プリセット・運航テンプレート、組織/案件拡張性、旧シート増殖禁止・A4続紙は0021／0022 Proposedの限定置換記録へ |
| [ADR-0008](ADR-0008-user-facing-export-and-recovery-boundaries.md) | ユーザー向けJSON出力廃止と出力・復旧境界の再定義 | **承認済み** | 2026-09-15 | 0003のuser-facing JSON部分と0001の同一JSON退避条項を部分置換。全量DB復旧形式はPENDING、KML代替禁止 |
| [ADR-0009](ADR-0009-map-renderer-selection-deferred-to-c5.md) | 地図描画ライブラリの選定をPhase C5実機評価へ留保 | **承認済み** | 2026-09-15 | 0001のMapLibre固定のみ部分置換。今回はライブラリ未選定 |
| [ADR-0015](ADR-0015-record-first-design-and-implementation-gate.md) | 記録・保存先から設計し、差分監査後に依存実装へ進む | **提案中（Proposed）** | 未承認（記録2026-09-18） | 99.2 §0・§1の設計順序と理由を記録。詳細ゲートは23 |
| [ADR-0016](ADR-0016-environment-membership-and-access-separation.md) | 人物・環境所属と三層権限の分離、離任の所属終了化 | **提案中（Proposed）** | 未承認（記録2026-09-18） | 0007 §2.3の役割・資格の部分置換を記録。詳細は31a〜31d |
| [ADR-0017](ADR-0017-asset-acquisition-history-and-cumulative-scope.md) | 機材取得履歴・管理累計の意味と点検整備Actorを分ける | **提案中（Proposed）** | 未承認（記録2026-09-18） | 0007の型式／個体・互換と0002の累計基点を具体化。詳細は32a〜32c |
| [ADR-0018](ADR-0018-dips-fixed-egress-and-limited-backend.md) | DIPS APIの専有固定IP経路・限定バックエンド | **提案中（Proposed）** | 未承認（記録2026-09-18） | 0001／0004のDIPS用Workers指定の限定置換を記録。詳細は33a／33b／16 |
| [ADR-0019](ADR-0019-home-entry-and-shared-plan-handoff.md) | ホーム4入口と共有計画の引継ぎ | **提案中（Proposed）** | 未承認（記録2026-09-18） | 0005の独立した手続き／現場状態を入口・通常画面に具体化。詳細は34a〜34d |
| [ADR-0020](ADR-0020-flexible-flight-and-finalization.md) | 柔軟な1飛行と最終確定 | **提案中（Proposed）** | 未承認（記録2026-09-18） | 意味とschemaを分ける。詳細は35a／35b／35d |
| [ADR-0021](ADR-0021-a4-record-layout-and-sheet-boundary.md) | 最新A4実物・固定明細・物理シート | **提案中（Proposed）** | 未承認（記録2026-09-18） | 0007 §2.9の限定置換記録。2026-09-19に機体別保存・次空き連番・特殊競合の非採用を追補。詳細は35c |
| [ADR-0022](ADR-0022-drive-responsibilities-and-human-records.md) | 七責任領域と人間向け04／05媒体 | **提案中（Proposed）** | 未承認（記録2026-09-18） | 0007 §2.8の全面禁止の限定置換記録。2026-09-19に06の作業台帳と履歴・証跡の分離を追補。詳細は36／37／24b |
| [ADR-0023](ADR-0023-common-source-and-derived-submission-paths.md) | 共通の源（計画・Geometry・不変Snapshot）と派生する通報経路・出力 | **提案中（Proposed）** | 未承認（記録2026-09-19） | 0004／0006／0009のClarifies。飛行範囲を用途別に作らない判断とDIPS対象外との境界を記録。詳細は25e |
| [ADR-0024](ADR-0024-kml-generated-at-plan-submission-from-report-content.md) | KMLは飛行計画通報時に通報内容と共通Geometryから生成し、運航実績を含めない | **提案中（Proposed）** | 未承認（記録2026-09-19） | 0008／0023のClarifies。旧27a等の運航実績追記案を現在ベースライン上で置換。詳細は27e |
| [ADR-0025](ADR-0025-derived-pdf-roles-and-on-demand-generation.md) | 派生PDFを役割で分け、必要な時だけ生成する | **提案中（Proposed）** | 未承認（記録2026-09-19） | 0021／0023／0024のClarifies。A4運航記録PDFと地図付きPDFの役割分離、毎飛行の自動生成をしない方針。詳細は27f／34e |
| [ADR-0026](ADR-0026-shared-source-confirmation-and-timing-separation.md) | 共有データの正本とcache、正本確認、確定処理の三時点への分離 | **提案中（Proposed）** | 未承認（記録2026-09-19） | 0002／0003のClarifies。重要な時点で正本を確認し、確定処理を計画確定・逐次保存・最終送信に分ける。詳細は38a／38b |
| [ADR-0027](ADR-0027-storage-ownership-and-cost-boundary.md) | 各環境のDriveを保存先とし、中央ストレージへ集約せず、従量課金を必要機能に限定 | **提案中（Proposed）** | 未承認（記録2026-09-19） | 0001／0002／0018のClarifies。保存の所有と費用の境界。詳細は37 §6 |

ADR-0010〜0014は整理前の旧main（`6344d7a`。バックアップ`archive/main-before-99-2-redo-20260919`／タグ`backup/main-6344d7a-20260919`）にProposedとして存在する。本線はその作成前の`ea73d08`から再移植しており、旧Step成果をコピーしないため収録しない（対応関係は[Git本線の整理](../migration/99-2-git-mainline-cutover.md)）。番号を再利用せずStep 1で0015、Step 2で0016、Step 3で0017、Step 4で0018、Step 5で0019、Step 6で0020〜0022、Step 7aで0023、Step 7cで0024、Step 7dで0025、Step 7eで0026・0027を新設した。旧mainの0010〜0014をAcceptedへ変更していない。

CURRENT-ACCEPTEDは現在の設計ベースラインを表し、ADRの承認ではない。[7状態の正本](../guidelines/03_design-evidence-and-causality.md#3-状態ラベルと由来)に従う。0015がProposedであることを理由に、99.2 §0・§1で到達した設計方法を未決へ戻さない。

## 4. 承認時点・履歴と現行仕様の読み方

ADR-0001〜0006は承認コミット `00bd729`（2026-09-14）でAcceptedになりました。本文中に残るProposal・推奨候補・承認待ちは承認前の記述であり、現在の承認状態を示しません。ADR-0002のみ今回、依頼された状態文言を意味不変訂正し、本文末へ根拠を記録しました。ADR-0001/0003/0004/0005/0006/0007本文は保持しています。

| 履歴上の記述 | 現行解釈・正本 |
|---|---|
| 0001の正本モデルB2未定 | 0002のModel D採用、0007の正規化台帳で具体化。詳細は [11](../architecture/11_data-authority.md) |
| 0001/0003のJSON手動退避 | 0008の限定範囲で部分置換。全量DB復旧形式は `PENDING-LOCAL-RESTORE-01` |
| 0001のMapLibre GL JS固定 | 0009によりC5実機評価へ留保。現時点では未選定 |
| 0005の初期DIPS状態名 | 0006でManual第一級・確認方法・3保存軸を拡張。現行状態は [13 状態管理設計](../architecture/state-machines/README.md) |
| 0006の `payload_snapshot` | 意味論的提出記録の設計意図を維持し、現行型は `submission_snapshot`、API exact payloadは任意の `api_payload_snapshot` に分離。[12d](../architecture/domain-model/12d_flight-plan-and-dips.md) / [25c](../architecture/dips-flight-plan/25c_api-payload-mapping.md) |
| 0007 §2.3の人物直下役割・資格、§2.4の組織境界、§2.7のLifecycle | 99.2 §2の現在到達点を[31a〜31d](../architecture/identity-and-access/README.md)へ移管。役割・資格の部分置換と所属終了の具体化は[0016（Proposed）](ADR-0016-environment-membership-and-access-separation.md)に記録。0007の承認履歴と0016の未承認を区別 |
| 0007 §2.8全面的タブ禁止・§2.9整備サマリーと自動続紙 | 現在99.2と最新A4直接確認に基づく限定置換を[0021](ADR-0021-a4-record-layout-and-sheet-boundary.md)／[0022](ADR-0022-drive-responsibilities-and-human-records.md) Proposedへ記録。現行詳細は35c／36／37。Accepted本文の承認履歴は保持 |
| 0007の円/ポリゴン例示 | Geometryの全形状定義ではない。正本 [17](../architecture/17_map-and-airspace.md) はPOLYGON / CIRCLE / BUFFERED_LINE |

0008/0009は2026-09-15のオーナー依頼で明示された方針を記録したAccepted ADRです。どちらもPhase C1の開始を許可せず、既存実装の変更を含みません。旧ADRから現行詳細へ辿る際は、この表と後続ADRの限定範囲を先に確認してください。

0016がProposedであることを理由に、§2の到達済み設計をPENDINGへ戻さない。反対に離任UI・処理権限・offline・物理所有等の未確定をADR追加によって採用済みにしない。

0017は0007の機材正規化と0002の累計基点の意味をClarifiesとして記録する。32a〜32cの現在設計ベースラインとADR Proposedを区別し、承認済みADRの正式な上書きや、§6全体・保存構造の移植完了とは扱わない。

0018は0001 §3のDIPS用Workers境界、0004 §2・§3項3のWorkers指定について、現在ベースライン上の限定置換をPartially Supersedesとして記録する。0018はProposedであり、0001／0004の承認履歴を正式承認済みの新決定で上書きしたとは扱わない。現在経路の詳細は[33a](../architecture/dips-infrastructure/33a_fixed-egress-and-api-connection.md)、旧認証候補とVERIFYは[16](../architecture/16_security.md)。

0019は0005のDIPS手続きと現場運航の分離を、ホーム入口と日付・担当者をまたぐ共有計画の引継ぎへ具体化するClarifies。Proposedであり、既存Accepted本文や状態遷移・離陸評価を変更しない。画面の詳細因果・未確定は[Presentation](../architecture/presentation/README.md)へ保持する。

Step 6の0020〜0022もProposed。現在ベースラインへの移管とADR正式承認を同一視しない。0007の内部正規化・機材共用・人物等の未置換範囲を維持する。

Step 7aの0023は、0004のAdapter分離、0006のAPI非依存と提出Snapshot、0009のGeometryの描画ライブラリ非依存をClarifiesとして記録する。Proposedであり、Accepted本文や状態遷移・通報要否の判定を変更しない。判断の詳細因果・限界・未確定は[25e](../architecture/dips-flight-plan/25e_common-source-and-submission-boundaries.md)へ保持し、KMLの生成契機・内容・単位や§7の残りへ本判断を拡張しない。

Step 7cの0024は、0008のKMLの位置づけと0023の共通の源をClarifiesとして記録し、KMLの生成契機・内容・単位を加える。Proposedであり、Accepted本文を変更しない。旧設計文書（27a・27b・03・23）の運航実績追記案は、ADRに記録されていなかったため、Supersedesではなく設計文書側のHISTORICAL化として扱った。詳細因果・限界・未確定は[27e](../architecture/output/27e_kml-generation-timing-and-content.md)へ保持し、PDF・履歴出力や§9へ本判断を拡張しない。

Step 7dの0025は、0021のA4運航記録と必要時PDF、0023の共通の源、0024のKMLの生成契機をClarifiesとして記録し、PDFの役割分離と必要な時だけ生成する方針を加える。Proposedであり、Accepted本文を変更しない。詳細因果・限界・未確定は[27f](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md)へ保持し、画面の詳細（[34e](../architecture/presentation/34e_history-and-output.md)）や§9へ本判断を拡張しない。

Step 7eの0026は、0002のライフサイクル連動型ハイブリッド正本モデルと0003のローカル永続化をClarifiesとして記録し、共有データのcacheと正本確認、確定処理の時点分離を加える。cacheは共有のマスター・リスト・確定済みの台帳の複製を指し、現場で作成中の下書きと未同期の確定データは0002・11のライフサイクル権威に従うため、0002の決定は変更しない。0027は0001の低コスト運用、0002のSheets台帳、0018の中央運航DB非採用をClarifiesとして記録し、保存の所有と費用の境界を加える。いずれもProposedであり、Accepted本文を変更しない。詳細因果・限界・未確定は[38a](../architecture/sync-and-cache/38a_shared-source-and-device-cache.md)・[38b](../architecture/sync-and-cache/38b_confirmation-and-sync-timing-separation.md)・[37 §6](../architecture/drive-structure/37_environment-storage-responsibilities.md#6-保存の所有と費用の境界)へ保持する。
