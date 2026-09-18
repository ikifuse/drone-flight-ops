# 33a. 固定送信元IPとDIPS API接続方針

最終更新: 2026-09-18\
由来: 99.2 §7のAPI経路のうち航空局照会・申請・限定バックエンド。状態は各節で区別する。

## 1. 当初の中継設計と、維持する理由

**当初状態（HISTORICAL）**: 基準アプリはGASであり、新アプリのPhase Bは[バックエンド比較02](../02_backend-and-security-comparison.md)、[ADR-0001](../../decisions/ADR-0001-architecture-selection.md)を通じてPWAとWorkersによる軽量中継を選んだ。当時は低い運用費、標準Fetchによる実装、保守負担の小ささ、秘密をクライアントから隔離できることを評価した。料金・性能の評価は当時の証拠であり、現在の費用保証ではない。

`0211a9a`の10／15／16、`3d2ed14`のB2.1では、DIPS認証情報をPWAへ置かず、外部APIの違いをAdapterとBFFで隔離する設計を具体化した。[ADR-0004](../../decisions/ADR-0004-dips-adapter-architecture.md)のこの責任分離と、[ADR-0006](../../decisions/ADR-0006-dips-optional-and-manual-submission-ledger.md)のAPI Optional／Manual第一級は現在も維持する。旧Workersという実行製品名を変えることは、秘密情報保護やクライアントの自律性を捨てることではない。

旧資料にあるCORS回避・認可コード・realm・Cookieの記述は、今回の固定IP判断と同じ確度ではない。認証候補の来歴・現在のVERIFYは[16](../16_security.md)、Adapterの過去公式仕様参照は[15](../15_dips-adapter.md)で扱う。CORSの未確認条件を新しい採用理由として補わない。

## 2. 航空局確認によって不足が明らかになった条件

**問題・確認経緯**: 旧Docsは個人申請やネットワーク審査条件を未確認としていた。99.2 §7は、航空局DIPS担当への照会で個人申請が可能であることと、次のアクセス元IP条件を確認したと記録している（原本に記録済みのEVIDENCE/EXAMPLE）。

- 利用中に第三者へ再割当されない。
- サーバー停止・再作成等でも同じIPを維持する。
- 契約環境に専有される固定IPを少なくとも1つ登録する。

**再検討理由**: 秘密情報をサーバーへ隔離できるだけでは、登録する固定送信元IPの条件を満たしたことにならない。99.2はこの確認を受け、旧GAS／Cloudflare Workers前提のDIPS経路を変更したと記録する。旧想定のまま接続条件を充足扱いにする案を採らない。全てのGAS／Cloudflare製品や将来の別契約が技術的に不可能という一般論を、原本にない理由として付け足さない。

**さらに詰めた内容**: Google Cloud上のDIPS連携バックエンドとCloud NATを通る固定送信元IPを記載し、`drone-flight-ops`を接続システムとする最終訂正版のAPI利用申請書を航空局へ送付済み、というところまで99.2は到達している。送付済みと利用承認・設定通知受領・接続成功は異なる。担当者との原メールや申請ファイルを今回再確認したとは報告しない。

## 3. 現在の通信境界

**CURRENT-ACCEPTED（99.2の現在到達点。変更可能な設計ベースライン）**:

```text
PWA / Browser
  ↓ DIPS連携要求（API利用可能時のみ）
Google Cloud上のDIPS連携バックエンド
  ↓ 固定出口へ到達するネットワーク経路（具体構成はPENDING）
Google Cloud Cloud NAT
  ↓ 契約環境に専有される固定送信元IP <DIPS_FIXED_EGRESS_IP>
DIPS API
```

バックエンドはAPI秘密情報とDIPS API通信を扱い、Cloud NATは外向き通信の送信元アドレスを担う。Cloud NAT自体をアプリの実行サービスや認証処理とみなさない。契約環境の固定IPを航空局へ登録する意味は保持し、実値は公開Docsへ記載しない。これはクライアント端末のIPや、ブラウザが開く接続システムURLを固定するという設計ではない。

旧Workers経路は§1・§2のHISTORICALな状態であり、現行DIPS経路として併用しない。PWAのホスティング、Google Drive／Sheets正本、IndexedDB、人物・機材の設計はこの変更の対象ではない。限定置換は[ADR-0018](../../decisions/ADR-0018-dips-fixed-egress-and-limited-backend.md)に記録するが、そのProposed状態を承認済みADRの正式な上書きと扱わない。

## 4. バックエンドを中央運航DBにしない理由

**当初状態・検討**: 旧02には将来のデータ共有ハブという広い役割もあった。一方、10のバックエンド境界は、プライバシー保護と当時の0円運用目標を理由にエッジをステートレスとし、恒常的な飛行実績の保管を避けていた。[11](../11_data-authority.md)はローカルと外部台帳の権威を分けていた。この理由は履歴として保持するが、Google Cloud側の無料保証や全ての一時状態の保持禁止には読み替えない。固定IPのためにGoogle Cloudへ移ることを、全利用者のデータを集約する理由にはできない。

**現在到達点（CURRENT-ACCEPTED、99.2 §7）**: DIPS連携バックエンドはAPI秘密情報と固定IP通信のための限定責務とし、全運航データを中央DBへ集約しない。全利用者の運航記録・飛行日誌・BAT履歴・PDF・KML・全Driveデータをここへ移管する案は採らない。必要なAPI電文が中継を通ることと、そのデータの正式な保管先になることは別である。

**例外・未決の境界**: 中央運航DBを持たないことから、セッション・トークン・通信結果等の必要最小限の一時状態も全て禁止するとは導かない。保持方式・寿命・失効等は[16のPENDING／VERIFY](../16_security.md#9-step-4の認証確認と保持方式の未確定)へ残す。API電文の意味変換・`DipsFlightPlanMapper`・DTO・送信証跡の詳細は[25c](../dips-flight-plan/25c_api-payload-mapping.md)に留め、ネットワーク正本にNo.1〜88の表を作らない。

## 5. 補助確認と未確定事項

**今回の公式補助確認（2026-09-18）**: [Google CloudのCloud NAT概要](https://docs.cloud.google.com/nat/docs/overview)は外向き通信のアドレス変換と、手動割当による共通の送信元IPの利用を説明する。[NAT IP割当資料](https://docs.cloud.google.com/nat/docs/ports-and-addresses)は自動割当と手動割当を区別し、宛先が既知のIPを必要とする場合の注意を示す。この確認はNATの責任を理解する補助証拠であり、申請先の個別要件や実環境の設定成功を証明しない。割当・予約・変更手順を今回実装確定するものでもない。

- **PENDING-C7-INFRA**: 実行コンピュート、VPC接続方法、NATまでの具体経路、IP予約・維持・変更／復旧手順、費用・監視の具体構成。Cloud Run、App Engine、Functions、コンテナ、Serverless VPC Access／VPC Connector等の採否は未決。Cloud NAT採用だけから選定しない。
- **VERIFY-S4-APPLICATION-EVIDENCE**: 航空局の回答・最終訂正版申請の原資料と、登録対象IPの専有・停止／再作成時維持の実環境照合。今回再確認していないことを理由に、原本の確認記録や現在接続方針をPENDINGへ戻さない。
- **VERIFY-S4-API-CONTRACT**: 接続システムURL・OIDCリダイレクトURLの確定／登録、正式接続仕様・利用承認・Client ID／Secret等の設定通知。原本時点の未確定／未受領を保持。詳細は16。
- **受入時の確認境界**: 承認済み契約・登録情報と実際の出口が一致し、停止・再作成時も登録IPを維持できることを証拠で確認する。秘密をクライアントへ出さず、障害時の独立性と結果不明の扱いを[33b](33b_api-availability-and-retry-boundaries.md)へ照合する。現時点で接続試験完了や実装着手を宣言しない。
