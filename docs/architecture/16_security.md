# 16. セキュリティ・秘密情報・トークン管理設計（16_security.md）

最終更新: 2026-09-18
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2 / B2.1（詳細アーキテクチャ・監査・実装前設計）

---

## 1. セキュリティ設計の根本原則

1. **クライアント完全非保持原則**: DIPS APIの `client_secret`、固定バックエンドAPIキー等のアプリケーション機密は、ブラウザ（JavaScript）やクライアントストレージに配置・送信しない設計を徹底する。
2. **バックエンドでの秘密隔離**: 99.2 §7の限定バックエンドを維持し、API秘密情報・固定IP用の秘密設定をPWAへ置かない。現在経路とその因果は[33a](dips-infrastructure/33a_fixed-egress-and-api-connection.md)。旧BFF／Confidential Client／Cookieの具体案は下記のHISTORICALであり、正式認証契約・トークン保持方式は§9のVERIFY／PENDING。
3. **監査ログ・バックアップへの機密混入防止**: トークンや認証鍵は、コンソールログ、エラーログ、内部送信証跡・将来の復旧用データ、GitHubコミットから確実にマスキング・除外する。

---

## 2. OAuth / DIPS トークン管理方式の比較と選定

**HISTORICAL / EVIDENCE/EXAMPLE**。`0211a9a`〜`3d2ed14`のB2／B2.1で、DIPSの資格情報をブラウザJSへ直接渡す懸念に対し、以下を比較しました。表のWorkers経路・CORS前提・Cookieは当時の候補であり、現在の固定IP経路や確定認証仕様ではありません。

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
当時は機微な運航データを扱うこととトークンのJS露出を避けることから案Aを選びました。この隔離の理由を維持し、Workers製品指定は99.2の固定IP要件により過去の経路として扱います。正式契約の未受領は§9、旧保持案の検証不足は§4へ残し、BFFという名前から認可コード・Cookie方式まで確定しません。

---

## 3. 秘密情報の階層別管理と役割分離

アプリ固定秘密と動的トークン／セッションを混同しない責任は維持します。**次の図はHISTORICALなWorkers構成**であり、製品・鍵名・Cookie属性・配置は現在の採用指定ではありません。現在の秘密隔離は§1・§7、保持方法の未決は§9、通信経路は33aを参照します。

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

**HISTORICAL / EVIDENCE/EXAMPLE**。BFF方式におけるユーザーAccess Token / Refresh Tokenの保持先候補を比較検討した当時の表と選定方針です。無料枠・課金条件は履歴として保持し、現行サービス条件の保証には用いません。C7着手時に公式料金・制限・トークン実サイズ・失効要件を再確認して確定します。

| 保存先候補 | セキュリティ | 無料枠・コスト | 復旧性・耐久性 | 期限管理(TTL) | 評価 |
|---|:---:|:---:|:---:|:---:|:---:|
| **① 暗号化Cookie (AES-GCM)** | **◎ (Workers秘密鍵で暗号化)** | **◎ (DB呼出ゼロ・完全無料)** | **◎ (ブラウザ内保持)** | **◎ (Cookie Max-Age)** | **【第一候補】** |
| **② Workers KV** | ◎ (サーバー側保管) | ◯ (1,000 write/日 無料) | ◯ (結果整合性) | ◎ (Expiration TTL) | 第二候補 |
| **③ Cloudflare D1** | ◎ (SQL管理) | ◯ (50,000 write/日 無料) | ◎ (強整合性) | △ (手動クリーンアップ) | 代替候補 |
| **④ Durable Objects** | ◎ (強整合性) | ✕ (有料プラン必須) | ◎ (高信頼) | ◯ (Alarm API) | 不採用(費用) |

### 【当時の選定方針（HISTORICAL）】
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

**HISTORICAL**。以下は旧Cookie／Workers案の手順であり、現在の実行手順ではありません。鍵をクライアントから隔離して更新する目的は維持しますが、Google Cloud側の具体保管サービス・失効手順は§9の未確定です。

- **即時ログアウト**: パイロットがログアウトを実行した際、セッションCookieを即時破棄（Max-Age=0）し、DIPS側のRevocation Endpoint（規定されている場合）へ失効通知を発行。
- **credentialローテーション**: 国交省側で `client_secret` が更新された場合、`npx wrangler secret put DIPS_CLIENT_SECRET` を実行するだけで、クライアントアプリの再配布・再ビルドなしに即座に新キーへ移行可能。

## 7. 機密境界の適用範囲

固定 `client_secret` 等のアプリ秘密情報はバックエンドの機密境界からクライアントへ出さない。旧設計の動的TokenのJS露出回避という意図を保持し、§4の暗号化Cookie案とサーバーストア＋不透明Session ID案の違いを消さない。いずれも現在の正式認証方式ではなく、§9の確認・選定後に具体化する。ブラウザ直結を採らない現在の理由は33aの固定出口と秘密隔離であり、CORS不許可が確認済みだとはしない。

運航人員の実名・電話・メール・住所・機体登録記号等は業務上の機微データとして扱うが、本リポジトリの設計例へ実値を含めない。DIPS入力支援に必要な表示と、共有用KMLの最小情報化は異なる目的であり、[KML SHARE_SAFE](output/27a_kml-export.md)の除外方針を維持する。

実固定IP、GCP Project ID、Client ID、Client Secret、Access／Refresh Token、非公開URL・Drive ID・個人情報を公開Docsやログ例へ入れない。固定IPは`<DIPS_FIXED_EGRESS_IP>`等で示し、航空局への登録が必要という設計意味は33aに保持する。

## 8. 人物・アプリ機能権限とGoogle実アクセスへの接続

Step 2では業務権限の詳細正本を[31b](identity-and-access/31b_roles-and-access-control.md)とする。人物・アカウント・環境は[31a](identity-and-access/31a_person-account-and-environment.md)、離任・Google共有残存・物理所有の未確定は[31d](identity-and-access/31d_membership-lifecycle.md)。共有設定をアプリ管理者の根拠にしない因果、初期管理者・最後の1人保護、設定権限は31bだけに定義する。本書のBFF・DIPSトークン保管を、そのままGoogle認証方式や業務権限実装として確定しない。

## 9. Step 4の認証確認と保持方式の未確定

**発端・現在の確認範囲**: 旧Docsには認可コード・realm・Token Endpoint・Cookieの具体例があった。しかし99.2 §7では、接続システムURLとOIDCリダイレクトURLを開発中・未確定として申請し、Client ID／Client Secret等の設定通知も未受領と記録する。過去公式資料の例と、この接続システムが受領した正式契約は同一ではない。未受領値を推測で埋める案を採らない。

- **VERIFY-S4-API-CONTRACT**: 利用承認・設定通知・正式接続仕様、認証方式、realm、Authorization／Token等のendpoint、credentialの発行単位・SSO・失効条件、重複防止／照合APIの利用条件。接続URL／OIDCリダイレクトURLの確定・登録も照合する。URLそのものの選定は未確定で、OIDCという申請欄から詳細フローを自動確定しない。認証が未受領でも、99.2が到達したGoogle Cloud＋Cloud NAT接続方針を未決へ戻さない。
- **PENDING-S4-SESSION**: 正式契約を確認した後の最小一時状態・Token／Session保存先・寿命・失効・ローテーション・クライアントとの具体通信方式。旧AES-GCM Cookie／Workers KV案をGoogle Cloudへ名前だけ変えて採用しない。中央運航DB非採用から一時状態も保持禁止という仕様は導かない。
- **CORSの扱い**: 旧比較に存在した仮定をHISTORICALとして残すが、今回その実仕様を確認していない。通信方式に依存する箇所は正式仕様照合のVERIFYとし、固定IP変更の確定根拠を増やさない。

バックエンドの限定責務と申請根拠は33a、未承認・障害時のManual独立とPOST結果不明の安全境界は[33b](dips-infrastructure/33b_api-availability-and-retry-boundaries.md)。Google認証・人物・所属のStep 2設計や、Drive／ローカルの正本をここで変更しない。
