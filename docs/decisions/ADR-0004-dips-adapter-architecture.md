# ADR-0004: DIPS 2.0 Adapter分離とバックエンド中継境界の採用

- **作成日**: 2026-09-14
- **ステータス**: **提案中（オーナーレビュー待ち）**
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
- **選択肢C: DIPS Adapter論理分離 ＋ バックエンド中継境界・BFF構成（推奨案）**:
  - クライアント内部に3系統独立アダプター（DRS, FPA, FPR）を設置。
  - BFF（Backend for Frontend）パターンを採用し、`client_secret` 保持およびAccess/Refresh TokenはCloudflare Workers等のバックエンド境界で安全に保持。
  - DIPS二重通報防止のため、POST切断時の自動再送を禁止し、検索APIによる照合（Reconciliation）を必須化。
  - テスト用モック（`MockDipsAdapter`）を備え、API利用申請の審査中や障害時でもアプリ本体の機能の開発・動作検証を可能とする。

---

## 3. 提案内容（Proposed Decision）

**選択肢C（DIPS Adapter論理分離 ＋ バックエンド中継境界・BFF構成）** を推奨候補として提案する（オーナーレビュー承認待ち）。

1. クライアント側には `IDipsService` 抽象インターフェースを定義し、UIや運航管理ロジックがDIPSの生API仕様に直接依存しない構造とする。
2. DRS (`drs-utm`), FPA (`drs-req`), FPR (`drs-fpl`) を論理モジュールとして分離し、credentialが共通か個別かといった未確認仕様の判明時にもアダプター内部の変更のみで対応可能とする。
3. `client_secret` および動的OAuthトークンはバックエンド境界（Cloudflare Workers）で安全に隔離し、ブラウザへは直接露出させずセキュアCookieセッションで管理する。
4. 国交省APIが独自Idempotency-Keyヘッダをサポートしない前提に立ち、送信結果不明時は計画照合（Reconciliation）によって二重通報を防止する。

---

## 4. 影響と評価（Consequences）

- **メリット**:
  - DIPS APIの仕様変更やトラブルが発生しても、アプリ本体の飛行日誌・バッテリー管理機能は影響を受けず継続稼働できる（疎結合性・堅牢性）。
  - API資格情報の安全性およびOAuth 2.0 BCP準拠が担保される。
  - モックアダプターにより、正式申請前でも全画面の開発・検証が可能。
- **デメリット・留意点**:
  - バックエンドプロキシ（Workers）の構築・設定が軽微に必要となる。
