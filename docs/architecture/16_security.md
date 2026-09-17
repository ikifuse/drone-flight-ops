# 16. セキュリティ・秘密情報・トークン管理設計（16_security.md）

最終更新: 2026-09-15
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2 / B2.1（詳細アーキテクチャ・監査・実装前設計）

---

## 1. セキュリティ設計の根本原則

1. **クライアント完全非保持原則**: DIPS APIの `client_secret`、固定バックエンドAPIキー等のアプリケーション機密は、ブラウザ（JavaScript）やクライアントストレージに配置・送信しない設計を徹底する。
2. **BFF（Backend for Frontend）によるトークン隠蔽**: 従来のOAuth Browser-Based Applicationsの調査方針に基づき（C7で公式文書を再確認）、ブラウザへOAuth Access Token / Refresh Tokenを直接露出させず、バックエンド（Cloudflare Workers）がConfidential Clientとしてトークンを管理する。
3. **監査ログ・バックアップへの機密混入防止**: トークンや認証鍵は、コンソールログ、エラーログ、内部送信証跡・将来の復旧用データ、GitHubコミットから確実にマスキング・除外する。

---

## 2. OAuth / DIPS トークン管理方式の比較と選定

ブラウザ環境（PWA）におけるDIPS API認可情報の取り扱いについて、以下の2方式を比較検討しました。

| 評価項目 | 案A: BFF方式（推奨候補） | 案B: Token-mediating backend方式 |
|---|---|---|
| **アーキテクチャ** | WorkersがOAuth Confidential Clientとして平文Access/Refresh Tokenを管理。保持方式は§4の候補比較を参照。ブラウザとはHttpOnly Cookieで通信。 | WorkersがRefresh Tokenを保持し、短命なAccess TokenのみをブラウザJSへ渡す。 |
| **ブラウザの露出** | **平文のJS露出なし**（暗号化Cookie候補では暗号文はブラウザに存在） | 短命Access Tokenがブラウザメモリに露出（XSS時に奪取リスク） |
| **DIPS API通信経路** | ブラウザ → Workers Proxy → DIPS API | ブラウザ → DIPS API 直接呼び出し（CORS対応前提） |
| **セキュリティ強度** | 高（平文トークンのJS露出を抑制） | 高（Refresh Token漏洩は防止） |
| **オフライン時の影響** | DIPS通信はそもそもオンライン必須のため支障なし。 | 同様。 |
| **個人運用の実装複雑度** | 中（Proxyエンドポイントが必要） | 中（Token中継＋CORS考慮が必要） |
| **総合判定** | **【B2.1第一候補として採用】** | 代替候補（DIPSがCORSを全面許容する場合のみ検討） |

### 【選定結果】
本アプリでは操縦者の実名、機体情報、飛行計画座標等の機微な運航データを扱うため、**「案A: BFF方式」**を採用する設計です。具体的な動的Session保存先は以下の候補をC7開始時に検証します。

---

## 3. 秘密情報の階層別管理と役割分離

「アプリケーション固定シークレット」と「ユーザー・セッションごとに動的変化するトークン」を厳格に分離して管理します。

```text
┌─────────────────────────────────────────────────────────────┐
│ [階層1] GitHubリポジトリ（正本コード）                      │
│  - 秘密情報は1行たりともコミットしない (.gitignore徹底)     │
│  - 環境変数テンプレート (.env.example) のみを配置           │
└──────────────────────────────┬──────────────────────────────┘
                               │ (デプロイ時CI)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ [階層2] アプリ固定シークレット（Cloudflare Workers Secrets） │
│  - DIPS_DRS_CLIENT_SECRET, DIPS_FPR_CLIENT_SECRET 等        │
│  - wrangler secret put / Cloudflare Secrets Store による保存 │
│  - Workers実行時のみ環境変数バインディングとしてメモリ展開   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (動的セッション管理)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ [階層3] ユーザー動的トークン・セッションストア              │
│  - Access Token / Refresh Token / Session State             │
│  - ※wrangler secretには保存しない（用途が異なるため）       │
│  - 暗号化Session Cookie (AES-GCM) または Workers KV を利用  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (HttpOnly / Secure / SameSite=Strict)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ [階層4] クライアント環境（ブラウザ / PWA）                  │
│  - セッションCookieのみを保持（JSからの直接参照不可）       │
│  - IndexedDBにはOAuthトークンを一切保存しない               │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 動的ユーザーToken / セッション保存先の比較

BFF方式におけるユーザーAccess Token / Refresh Tokenの保持先候補を比較検討した当時の表です。無料枠・課金条件は履歴として保持し、現行サービス条件の保証には用いません。C7着手時に公式料金・制限・トークン実サイズ・失効要件を再確認して確定します。

| 保存先候補 | セキュリティ | 無料枠・コスト | 復旧性・耐久性 | 期限管理(TTL) | 評価 |
|---|:---:|:---:|:---:|:---:|:---:|
| **① 暗号化Cookie (AES-GCM)** | **◎ (Workers秘密鍵で暗号化)** | **◎ (DB呼出ゼロ・完全無料)** | **◎ (ブラウザ内保持)** | **◎ (Cookie Max-Age)** | **【第一候補】** |
| **② Workers KV** | ◎ (サーバー側保管) | ◯ (1,000 write/日 無料) | ◯ (結果整合性) | ◎ (Expiration TTL) | 第二候補 |
| **③ Cloudflare D1** | ◎ (SQL管理) | ◯ (50,000 write/日 無料) | ◎ (強整合性) | △ (手動クリーンアップ) | 代替候補 |
| **④ Durable Objects** | ◎ (強整合性) | ✕ (有料プラン必須) | ◎ (高信頼) | ◯ (Alarm API) | 不採用(費用) |

### 【選定方針】
1. **第一候補: 暗号化Session Cookie (AES-GCM)**:
   - Workers Secretに保持した暗号化キーを用い、Access/Refresh Tokenを含むペイロードをサーバー側で暗号化・署名し、`HttpOnly; Secure; SameSite=Strict` Cookieとして発行。
   - サーバーレスDBのリクエスト数制限を受けず、ステートレスで高速に動作し、Cookie上限内に暗号化後のTokenとメタデータが収まるか、実際の発行値で検証する必要があります。収容可能性は未確認であり、無料枠最適化の候補です。
2. **第二候補: Workers KV（セッションID Cookie方式）**:
   - TokenサイズがCookie上限を超える場合や、サーバー側での即時強制失効（Revoke）を重視する場合のフォールバックとして設計します。

---

## 5. ログ・エクスポートからの機密マスキング

- ログ出力ラッパー（`LoggerService`）により、`token`, `secret`, `authorization`, `password`, `key`, `cookie` を含むオブジェクトフィールドを自動的に `***MASKED***` に置換。
- 認証情報・セッション情報は内部送信証跡、Sheets、PDF、KMLおよび将来検討するDBバックアップから明示的に除外（Filter-out）する。旧 `exportBackupJson()` は実装要件から外れた。[ADR-0008](../decisions/ADR-0008-user-facing-export-and-recovery-boundaries.md)に従い、ユーザー向けJSON import/exportは提供せず、ローカルDB全量復旧形式はPENDINGとする。

---

## 6. 資格情報失効・ローテーション手順

- **即時ログアウト**: パイロットがログアウトを実行した際、セッションCookieを即時破棄（Max-Age=0）し、DIPS側のRevocation Endpoint（規定されている場合）へ失効通知を発行。
- **credentialローテーション**: 国交省側で `client_secret` が更新された場合、`npx wrangler secret put DIPS_CLIENT_SECRET` を実行するだけで、クライアントアプリの再配布・再ビルドなしに即座に新キーへ移行可能。

## 7. 機密境界の適用範囲

固定 `client_secret` は暗号化Cookieへも含めず、Workersの機密保管境界から出さない。OAuth Access/Refresh Tokenについては「ブラウザへ平文を渡さず、JavaScriptから読めない」が境界である。§4の暗号化Cookie案は暗号文をブラウザに保持する候補であり、サーバーストア＋不透明Session ID案と物理保持先が異なる。どちらの候補も本docs再編で新たに実装確定しない。

運航人員の実名・電話・メール・住所・機体登録記号等は業務上の機微データとして扱うが、本リポジトリの設計例へ実値を含めない。DIPS入力支援に必要な表示と、共有用KMLの最小情報化は異なる目的であり、[KML SHARE_SAFE](output/27a_kml-export.md)の除外方針を維持する。
