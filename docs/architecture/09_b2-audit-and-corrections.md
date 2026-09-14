# 09. Phase B2.1 実装前アーキテクチャ監査・最終訂正記録（09_b2-audit-and-corrections.md）

最終更新: 2026-09-14  
プロジェクト: `ikifuse/drone-flight-ops`  
フェーズ: Phase B2.1（実装前アーキテクチャ監査・最終訂正）  
ステータス: **監査・訂正完了（Phase C実装着手前の最終確定状態）**

---

## 1. 監査の背景と目的

Phase B2において、詳細アーキテクチャ仕様（`10_system-boundaries.md` 〜 `23_implementation-roadmap.md`）およびADR（`ADR-0002` 〜 `ADR-0005`）が策定されました。システム境界、運航状態マシンとDIPS通報状態マシンの分離、ローカルファースト、DIPS Adapter、段階的ロードマップ（C0〜C9）等の大枠の骨格は極めて堅牢です。

しかし、Phase C（実装フェーズ）へ進む前に設計書群を全横断監査した結果、以下の24項目にわたる技術的・法令的・セキュリティ的な矛盾や不足が判明しました。

1. 法令条文番号の不整合（航空法第132条の89、施行規則第236条の84との不一致）
2. ADRが「提案中（オーナーレビュー待ち）」であるにもかかわらず、設計書内で「正式採用」「決定」と記述されていた矛盾
3. 「国交省様式100%準拠」「完全生成」といった実装前の過剰な断定
4. OAuth / DIPS トークン管理におけるブラウザIndexedDB保管リスクとBFF（Backend for Frontend）構成の未徹底
5. Cloudflare Workers Secrets（静的秘密情報）とユーザー動的トークン/セッションの混同、および「KMS」用語の誤用
6. DIPS FPR APIが利用側独自の `Idempotency-Key` ヘッダをサポートしているという誤った仮定
7. DIPS POST送信中切断時の結果不明状態（`SUBMISSION_UNCERTAIN`）の欠落と二重通報リスク
8. GoogleスプレッドシートとDIPSにおける重複防止・冪等性戦略の未分離
9. `updated_at` のみを冪等キーの版識別に使用していたことによる再送時キー変動問題
10. `window.addEventListener('online')` を実際の通信到達可能判定と誤認していた記述
11. ローカルDBドメインモデルにおける不足エンティティ（Pilot, Assistant, Permission, MaintenanceRecord, AuditEvent, AppSetting, AircraftSwitch）の未定義
12. 期限管理属性（機体登録、許可承認、技能証明、点検整備）のモデル欠落
13. `FlightPlan` の単一機体固定（複数機体運航への未対応）
14. `Battery` と `Aircraft` の1:N固定（互換バッテリー運用の阻害）
15. `Mission` の単一 `aircraft_id` の曖昧さ（機体交代との不整合）
16. 対地高度150mを既定の計画高度としていた誤り（規制境界値との混同）
17. 地図・空域データソースの確認状況（確認済み・候補・未確認）および国土地理院タイルキャッシュ規約の整理不足
18. 空域表示を「飛行可否判定」と誤認させるUIリスクの未対策
19. オフラインPDF生成における成立条件（帳票本文 vs 地図画像付き）の未分離
20. 「1ミリ秒」「絶対」「100%」「完全」「不具合ゼロ」等の過剰断定表現の再発
21. Phase C9の本番切替条件が「3回一致・不具合ゼロ」のみに過度に依存していた問題
22. 現行 `autel-evo-lite-flight-log` で確立された柔軟運用・手動補記思想の継承確認

本ドキュメントは、これらの課題に対して実施した監査結果および全設計書の訂正内容を正本として記録するものです。

---

## 2. 監査・訂正内容の総括マトリクス

| 監査項目 | 訂正前（B2時点） | 訂正後（B2.1完了時点） | 対象ファイル |
|---|---|---|---|
| **法令条文番号** | 航空法第132条の88、第132条の86、施行規則第236条の67等の不整合 | 航空法第132条の89、施行規則第236条の84、および「無人航空機の飛行日誌の取扱要領」に統一 | `03_integrated-requirements.md`<br>`13_state-machines.md`<br>`15_dips-adapter.md`<br>`18_reports.md` |
| **ADR承認状態** | 「モデルDを正式採用」「決定」 | 全ADRを「提案中（オーナーレビュー待ち）」とし、「B2提案」「推奨候補」へ適正化 | `11_data-authority.md`<br>`ADR-0001`〜`ADR-0005`<br>`README.md` |
| **帳票準拠表現** | 「国交省法定様式を100%充足」「完全準拠」 | 「国交省取扱要領で求められる記録項目を満たすことを目標とし、Phase Cで様式1〜3との項目照合テストを実施する」へ変更 | `03_integrated-requirements.md`<br>`18_reports.md`<br>`23_implementation-roadmap.md` |
| **OAuthトークン管理** | Refresh TokenをIndexedDBに保持する案 | 2026年OAuth BCP準拠のBFF（Backend for Frontend）を第一候補とし、トークンはWorkersが保持、ブラウザはHttpOnly Cookieのみを保持 | `16_security.md`<br>`ADR-0004` |
| **Cloudflare Secrets** | wrangler secretをユーザーToken保存やKMSと混同 | 静的アプリ秘密情報（Workers Secrets）と動的セッショントークン（暗号化Cookie/Workers KV）を明確に分離。KMS用語排除 | `10_system-boundaries.md`<br>`15_dips-adapter.md`<br>`16_security.md` |
| **DIPS二重通報防止** | 利用側独自の `Idempotency-Key` ヘッダで自動防止できると仮定 | 国交省FPR APIが独自重複防止ヘッダを解釈しない前提に立ち、POST切断時の自動再送を禁止 | `12_domain-model.md`<br>`14_offline-and-sync.md`<br>`15_dips-adapter.md` |
| **DIPS結果不明状態** | 成功、失敗、リトライ待ちのみ | `SUBMISSION_UNCERTAIN`（成否不明）および `RECONCILIATION_REQUIRED`（手動確認待ち）を追加し、計画検索API照合フローを設計 | `13_state-machines.md`<br>`14_offline-and-sync.md`<br>`ADR-0005` |
| **重複防止戦略の分離** | DIPSとスプレッドシートを同一SHA256ハッシュで処理 | スプレッドシート（自前列によるUPSERT方式）とDIPS（計画検索によるReconciliation方式）に戦略を分離 | `12_domain-model.md`<br>`14_offline-and-sync.md` |
| **冪等キーの生成元** | `updated_at` を含むSHA256ハッシュ | 再送時キー変動を防ぐため、不変の `operation_id`（UUID）および `sync_revision` をキー生成元に採用 | `12_domain-model.md`<br>`14_offline-and-sync.md` |
| **ネットワーク復帰判定** | `online` イベント検知で即座に通信可能と判定 | `online` は再試行候補トリガーとし、実際の接続成否はエンドポイントへのHTTPレスポンスで判定 | `13_state-machines.md`<br>`14_offline-and-sync.md` |
| **ドメインモデル充足** | Pilot, Assistant, Permission, Maintenance等が暗黙的 | Pilot, Assistant, Permission, MaintenanceRecord, AuditEvent, AppSetting, AircraftSwitch を独立エンティティとして明示定義 | `12_domain-model.md` |
| **期限管理モデル** | 期限管理の属性が未定義 | `registration_expires_at`, `permission_valid_to`, `certificate_expires_at`, `maintenance_due_date` 等を定義 | `12_domain-model.md` |
| **複数機体FlightPlan** | `aircraft_id: string`（単機固定） | `primary_aircraft_id` および `aircraft_ids: string[]` による複数機体紐付けに対応 | `12_domain-model.md` |
| **バッテリー・機体関連** | `aircraft_id` による1:N固定 | `compatible_aircraft_models: string[]` による互換シリーズ管理とし、実際の使用機体は実績側で紐付け | `12_domain-model.md` |
| **Missionの機体属性** | `aircraft_id: string`（意味が曖昧） | `initial_aircraft_id`（初期投入機体）と明記し、途中交代は `AircraftSwitch` エンティティで追跡 | `12_domain-model.md` |
| **高度データモデル** | `max_altitude_agl`（上限150m標準と誤記） | `planned_altitude_agl_meters`, `max_altitude_agl_meters`, `altitude_source` に分離。150mは規制判定側で評価 | `12_domain-model.md`<br>`17_map-and-airspace.md` |
| **地図データソース** | データソースが確定扱いで規約未整理 | 【確認済み】【候補】【未確認】の3区分に整理。国土地理院タイルの大量スクレイピング制限を注記 | `17_map-and-airspace.md` |
| **空域UI誤認防止** | 「飛行可否判定」と受け取られかねない記述 | 規制空域重なりなしでも「飛行可能」と断定せず、データ鮮度・情報源・要最終目視確認を常時明示するUI原則を確立 | `17_map-and-airspace.md` |
| **オフラインPDF条件** | 「完全オフライン生成」と一括記述 | 帳票本文PDF（事前キャッシュフォントで完全オフライン可）と地図付きPDF（タイル未キャッシュ時は座標リスト代替）を分離 | `18_reports.md` |
| **過剰断定表現** | 「1ミリ秒」「絶対」「100%」「完全」「不具合ゼロ」 | 「遅延なく」「確実に」「設計目標」「高い信頼性」「防止する」等へ全面的に適正化 | 全横断 |
| **Phase C9切替条件** | 「3回以上のフライトで完全一致・不具合ゼロ」 | 3回は一要素とし、自動テスト全合格、実機動作、完全圏外、クラッシュ復帰、BAT交換、機体交代、日跨ぎ、0飛行中止等11大基準を策定 | `22_migration-plan.md`<br>`23_implementation-roadmap.md` |

---

## 3. 各重要項目の詳細訂正記録

### 3.1 航空法・施行規則の根拠条文
国土交通省「無人航空機の飛行日誌の取扱要領」（国空無機第625号 / 国空検第458号）を一次資料として再確認しました。
- **飛行日誌の備え付け・記載義務**: 航空法 第132条の89
- **飛行日誌の具体的記載事項**: 航空法施行規則 第236条の84
- **飛行前確認事項**: 航空法 第132条の86
- **特定飛行の許可・承認**: 航空法 第132条の85（国空航第...）
誤記されていた「第132条の88」「施行規則第236条の67」等をすべて訂正しました。確証の持てない曖昧な条文番号の記載を排除し、「無人航空機の飛行日誌の取扱要領に基づく」という確実な公的資料名へ統一しました。

### 3.2 OAuth / DIPS Token管理のBFF（Backend for Frontend）再設計
2026年のOAuth 2.0 for Browser-Based Applications BCPに従い、ブラウザ環境（PWA）にOAuth Access TokenやRefresh Tokenを直接持たせる設計を全面的に撤回しました。
- **採用方式**: **案A: BFF方式 ＋ 暗号化Session Cookie (AES-GCM)**
  - Cloudflare WorkersがOAuth Confidential Clientとなり、国交省DIPS各レルムと直接トークン交換を実施。
  - ブラウザには `HttpOnly; Secure; SameSite=Strict` の暗号化Session Cookieのみを付与。
  - ブラウザJavaScriptからはOAuthトークンが一切参照できないため、XSS攻撃によるトークン奪取リスクを構造的に排除。
  - Workers Secretsに保持した鍵でCookieペイロードを暗号化・署名するため、サーバーレスDB不要・ステートレスで無料枠（10万リクエスト/日）に完全適合。

### 3.3 DIPS二重通報防止と結果不明（`SUBMISSION_UNCERTAIN`）状態の確立
国交省FPR APIガイドラインでは、利用側独自の `Idempotency-Key` ヘッダによる重複排除仕様は確認できません。
- **事故シナリオ**: POSTリクエストをDIPSへ送出した直後、電波圏外やタイムアウトが発生し、DIPS側では登録成功したもののクライアントに応答が届かない場合。
- **対策**:
  1. 送信中切断・タイムアウト時は自動再POSTを厳禁とし、ジョブを `SUBMISSION_UNCERTAIN` 状態に遷移。
  2. DIPS飛行計画検索APIを実行し、同一日時・機体記号・エリア座標の計画が既に受理されているか自動照合（Reconciliation）。
  3. 受理確認が取れれば既存計画IDを回収して成功（`SUCCESS_CONFIRMED`）とする。
  4. 明確に未登録であることが確認できた場合のみ再送。
  5. 照合不能時は `RECONCILIATION_REQUIRED` 状態とし、パイロットにDIPS Web画面での目視確認を要請。

### 3.4 Googleスプレッドシート vs DIPS の冪等性分離
- **Googleスプレッドシート**: 列定義を独自に管理できるため、各レコードに不変の `operation_id`（UUID）および `sync_revision` を書き込み、GAS側でUPSERT（存在すれば更新、なければ追加）を行う。
- **DIPS**: 独自ヘッダが使えないため、上記の計画検索照合（Reconciliation）によって重複を防ぐ。
両者を同一の合成ハッシュで同一視せず、バックエンド境界で明確に責務を分離しました。

### 3.5 ドメインモデルの独立エンティティ化と期限管理
現場運航で必須となる以下の要素を正式にモデル化しました。
- **`Pilot`**: 技能証明書番号、証明区分、`certificate_expires_at`、期限前警告日数（初期値30日）。
- **`Assistant`**: 立入管理措置補助者氏名、役割、連絡先。
- **`Permission`**: 許可承認番号、許可区分、`valid_from`, `valid_to`、付加条件。
- **`MaintenanceRecord`**: 点検整備種別、実施累計時間、交換部品、実施者氏名、次回点検目安時間。
- **`AuditEvent`**: 変更履歴、操作主体、差分サマリ。
- **`AppSetting`**: 警告閾値、既定機体・操縦者ID等のKey-Valueストア。
- **`AircraftSwitch`**: 現場での機体交代イベント（交代元・交代先機体ID、時刻、理由）。
- **期限管理**: `Aircraft` に `registration_expires_at` を追加し、全期限切れリスクに対してアプリ起動時・運航準備時に警告を発する構造を確立。

### 3.6 地図・空域データソースの確認状況
- **【確認済み】**: 国土地理院標準タイル/淡色地図/航空写真（オンラインAPI規約確認済、ブラウザキャッシュ利用可。※大量スクレイピングは制限あり）、国土数値情報DID人口集中地区（GISオープンデータ利用可）。
- **【候補】**: 空港等周辺空域（国土数値情報・航空局データからのGeoJSON変換・配信）。
- **【未確認】**: 進入表面・転移表面等の精密3D空域データの全国分無償一括API、オフラインアプリへの再配布条件、緊急用務空域の常設REST API。
- **表示原則**: 規制空域の重なりがない場合でも「飛行可能」と断定せず、データ鮮度・情報源・要最終目視確認を表示する安全UI原則を明記。

### 3.7 Phase C9 本番切替判定基準の総合化
単なる「実現場3回フライト」のみで安全性を断定せず、以下の11項目すべてをクリアすることを本番切替の必須条件としました。
1. 自動テスト全合格（単体・統合・計算・バリデーション）
2. iPhone 13（iOS Safari PWA）および Pixel 6a（Android Chrome PWA）での実機動作
3. 機内モードでの完全圏外動作（準備〜連続飛行〜BAT交換〜日誌確定）
4. 飛行中・入力中のブラウザ強制終了からの確実な状態復元
5. バッテリー交換および予備機への機体交代の正常記録
6. 日跨ぎ飛行における時間計算・日付記録の正確性
7. 飛行0回での現場中止（`ABORTED`）および8回以上の連続飛行の正常記録
8. Googleスプレッドシート側の手修正が後続同期で上書き破壊されないことの確認
9. IndexedDBクリア（Storage Eviction）を想定したスプレッドシート・JSONバックアップからのデータ復元
10. DIPS Mockエラーハンドリングおよび結果不明時照合（Reconciliation）フローの動作
11. 現行GASアプリとの実現場並行運用（Shadow Run）による3回以上のデータ整合性確認

---

## 4. ADR-0001〜0005の現在ステータス

すべてのADRは、現行ルールに従い**「提案中（オーナーレビュー待ち）」**を維持しています。

| ADR番号 | タイトル | ステータス | 提案内容の要点 |
|---|---|:---:|---|
| **ADR-0001** | 総合運航管理システムのアーキテクチャ選定 | **提案中（オーナーレビュー待ち）** | PWA ＋ Cloudflare Workers ＋ ローカルDB・スプレッドシート連携 |
| **ADR-0002** | ライフサイクル連動型ハイブリッド正本モデルと手動修正尊重 | **提案中（オーナーレビュー待ち）** | 現場運航中は端末一次権威、外部同期後はスプレッドシート台帳権威 |
| **ADR-0003** | ローカル永続化方式とWebKitストレージ自動削除への多層防御 | **提案中（オーナーレビュー待ち）** | IndexedDB ＋ Persistent Storage要求 ＋ シート二重化 ＋ JSON退避 |
| **ADR-0004** | DIPS 2.0 Adapter分離とバックエンド中継境界（BFF） | **提案中（オーナーレビュー待ち）** | 3系統アダプター分離 ＋ BFFトークン隠蔽 ＋ 計画検索照合 |
| **ADR-0005** | 運航状態マシンとDIPS通報状態マシンの分離と誤認防止 | **提案中（オーナーレビュー待ち）** | 現場作業FSMとDIPS FSMの分離 ＋ 結果不明照合状態 ＋ 安全確認UI |

オーナーから本Phase B2.1の報告に対して正式な承認（GOサイン）をいただいた段階で、これらを一括して「承認済み（Accepted）」へ遷移させます。

---

## 5. Phase C（実装フェーズ）開始準備の完了判定

本B2.1の横断監査および設計書修正により、以下の状態が達成されました。

- [x] 法令条文番号の根拠が公的資料（取扱要領）と完全に一致している。
- [x] 帳票準拠表現が過度な断定から検証志向へ適正化されている。
- [x] OAuth / DIPS トークン管理が最も安全なBFF構成として再設計されている。
- [x] DIPS二重通報事故を防止する状態マシン（`SUBMISSION_UNCERTAIN`）と照合手順が確立されている。
- [x] スプレッドシートとDIPSの重複防止戦略が明確に分離されている。
- [x] 不足していたドメインエンティティおよび期限管理モデルが網羅されている。
- [x] 複数機体計画、バッテリー互換、機体交代、高度モデルが現実の運用に合わせて適正化されている。
- [x] 地図・空域データの確認状況と利用規約上の制約が整理されている。
- [x] 過剰な断定表現（1ミリ秒、絶対、100%、完全、不具合ゼロ）が全横断で排除されている。
- [x] Phase C9の本番切替条件が多面的シナリオとして具体化されている。
- [x] 現行アプリ `autel-evo-lite-flight-log` の運用判断・手動補記思想が尊重・継承されている。
- [x] **実装コード（Phase C）には一切着手せず、設計・監査のみを厳格に完了している。**

**判定: Phase C実装開始に向けたアーキテクチャ設計・前提整理は完全に整いました。オーナーのレビュー・承認をお待ちします。**
