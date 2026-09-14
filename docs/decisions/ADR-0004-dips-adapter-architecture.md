# ADR-0004: DIPS 2.0 Adapter分離とバックエンド中継境界の採用

- **作成日**: 2026-09-14
- **ステータス**: **承認済み（Accepted / オーナー承認 2026-09-14・Phase B設計凍結）**
- **決定者**: オーナー（システム設計者）、AIアシスタント（技術検討パートナー）
- **関連ドキュメント**: [docs/architecture/15_dips-adapter.md](../architecture/15_dips-adapter.md), [docs/architecture/16_security.md](../architecture/16_security.md)

---

## 1. 背景と課題（Context）

国土交通省「DIPS 2.0」は外部接続インターフェースを提供しているが、以下の課題が存在する。
- 3つの業務（機体登録 DRS, 飛行許可承認 FPA, 飛行計画通報 FPR）で認証レルム（`drs-utm`, `drs-req`, `drs-fpl`）が分離している。
- 公式仕様としてOpenID Connect認可コードフローおよび `client_secret` が規定されており、ブラウザ直通信では機密情報の漏洩リスクおよびCORS制約がある。
- 一方で、API利用申請主体の要件（個人事業主や個人の利用条件等）やcredentialの発行単位について、一部未確認事項が残っている。

---

## 2. 検討した選択肢（Options Considered）

- **選択肢A: クライアント直接通信**: バックエンドを置かず、ブラウザからDIPSへ直接アクセスを試みる。
- **選択肢B: アプリ全体をDIPS仕様に密結合**: DIPSのデータ形式をそのままアプリの内部データモデルとする。
- **選択肢C: DIPS Multi-Adapter論理分離 ＋ バックエンド中継境界構成（推奨案）**:
  - クライアント内部に共通通報インターフェース `IDipsSubmissionAdapter` を定義。
  - **`ManualDipsAdapter`（第一級対応）**: DIPS API未取得時でも現場スマホ1台で手動通報（手動支援・コピー・通報記録・受付番号追記）を完全完結。
  - **`MockDipsAdapter`（検証用）**: 外部通信なしで擬似通報・エラー・照合の全フローを検証。
  - **`ApiDipsAdapter`（Optional）**: 利用申請承認・credential発行時のみCloudflare Workers中継プロキシを経由してDIPS 2.0 APIと通信。
  - DIPS二重通報防止のため、POST切断時の自動再送を禁止し、検索APIによる照合（Reconciliation）を必須化。

---

## 3. 提案内容（Proposed Decision）

**選択肢C（DIPS Multi-Adapter論理分離 ＋ バックエンド中継境界構成）** を推奨候補として提案する（オーナーレビュー承認待ち）。

1. クライアント側には `IDipsSubmissionAdapter` 共通インターフェースを定義し、UIや運航管理ロジックがDIPS APIの有無や生API仕様に直接依存しない構造とする。
2. 手動通報アダプターを正式サポートし、APIが取得できない場合でも主要機能の実装を完了し、実運用可能とする。
3. API利用時は DRS (`drs-utm`), FPA (`drs-req`), FPR (`drs-fpl`) を論理モジュールとして分離し、`client_secret` および動的OAuthトークンはバックエンド境界（Cloudflare Workers）で安全に隔離する。
4. 国交省APIが独自Idempotency-Keyヘッダをサポートしない前提に立ち、送信結果不明時は計画照合（Reconciliation）によって二重通報を防止する。

---

## 4. 影響と評価（Consequences）

- **メリット**:
  - DIPS APIの仕様変更やトラブルが発生しても、アプリ本体の飛行日誌・バッテリー管理機能は影響を受けず継続稼働できる（疎結合性・堅牢性）。
  - API資格情報の安全性およびOAuth 2.0 BCP準拠が担保される。
  - モックアダプターにより、正式申請前でも全画面の開発・検証が可能。
- **デメリット・留意点**:
  - バックエンドプロキシ（Workers）の構築・設定が軽微に必要となる。
