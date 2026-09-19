# 25c. DIPS API payload mapping（C7 Optional）

最終更新: 2026-09-19\
状態: 設計整合（C1未着手）\
主責務: API契約境界、コード変換、JSON serializationと送信証跡\
入口: [DIPS Flight Plan設計群](README.md)

## 1. 実装条件とデータ境界

本書は**Phase C7 Optional専用**。正式なAPI利用承認・credential取得前は実装不要とし、C1〜C6の完了条件にしない。Manual支援は[25b](25b_manual-web-mapping.md)に従って `submission_snapshot` から直接ViewModelを生成し、API DTOやJSON serializerを経由しない。

`DipsFlightPlanMapper` は確定Snapshotの意味論をAPI契約へ変換し、`DipsFlightPlanPayloadDTO` は操作別の契約に適合するoutbound objectを表す。`DipsCodeMapper` が版別の外部コード変換を担当する。通信・認証レルム・再照合は[15](../15_dips-adapter.md)、秘密情報は[16](../16_security.md)、入力充足判定は[25d](25d_requirement-validation.md)に従う。

### 1.1. バージョン管理されたコード値変換（Versioned Code Mapping）
DIPS APIでは、飛行目的（1〜16）、飛行空域（1: DID, 2: 150m以上, 3: 空港周辺等）、飛行方法（1: 30m未満, 2: イベント, 3: 夜間, 4: 目視外等）のように数値コードが多用されます。これらをUIやDomainにハードコードせず、`DipsCodeMapper(contract_version)` を介して変換します。

### 1.2. 意味論的スナップショット、exact outbound payload、および仕様バージョンメタデータの保持
[12d DipsSubmission](../domain-model/12d_flight-plan-and-dips.md)を利用する際の送信証跡の扱い：
- `dips_contract_version`: 生成基準となったAPI仕様バージョン（例: `"FPR-API-1.9"`）。
- `submission_snapshot`: 提出確定時点の**完全な意味論的通報スナップショット**。手動通報およびAPI通報の双方で必ず保持。
- `api_payload_snapshot`: 実際にDIPS APIへ送信した**完全な exact outbound payload（JSON文字列、Phase C7 Optional、nullable）**。手動通報時はnull。
後日マスター（機体、人員、保険、場所）が改定されたり、DIPS APIが2.0へ改版された場合でも、「提出当時に何を通報しようとし／通報したか」を後から再現・照合できる証跡を保持します。手動通報経路においてユーザーへJSONファイルを出力・要求することはありません。

---

## 2. API数値コードの投影と旧Core属性の対応

| 旧設計の取得元表記 | 中立Coreの正本属性 | API境界の変換先 |
|---|---|---|
| `flight_purpose_codes` | `flight_purposes`（内部目的の複数選択） | `flightPurpose` の外部数値配列 |
| `flight_airspace_codes` | `flight_airspaces`（空域の複数選択） | `flightAirspace` の外部数値配列 |
| `flight_type_codes` | `flight_methods`（方法の複数選択） | `flightType` の外部数値配列 |
| `onsite_control_code` | `onsite_control_measure`（立入管理措置の意味） | `riskMitigationOnsiteControl` |

`InternalFlightPurpose → DipsPurposeMapper → official purpose codes[]` は目的用の意味対応を示す。`DipsPurposeMapper` は `DipsCodeMapper` の目的変換責務であり、独立した重複コード表は保持しない。UIや通報要否判定は外部数値に依存しない。すべての意味値・外部値の完全enumは、確認済み範囲を超えて補完せず契約照合まで `PENDING` とする。

## 3. Insurance変換

### 3.1. DIPS APIとの境界マッピング規則
- **無制限の取り扱い**: Core Domainでは `bodily_injury_unlimited: true` として意味的に保持します。DIPS AdapterがAPIペイロードへ変換する際に、DIPS仕様の `-1` へマッピングします（Core Domainに `-1万円` という不自然な値を保持させない）。
保険の完全なDomain定義は[12d](../domain-model/12d_flight-plan-and-dips.md)、同期推奨の論理台帳は[Sheets Ledger](../dips-submission/24a_submission-and-sheets-ledger.md)を参照する。

---

## 4. GeometryのDIPS変換・機能差

一般Geometry型は[17](../17_map-and-airspace.md)を唯一の正本とする。本書ではDIPSへの変換可能性だけを扱う。

### 4.1. Web UI と API 1.9 の機能差
旧調査の `OFFICIAL_SPEC` と[26のWeb観測](../26_dips-web-ui-verification.md)に基づき、以下の差異が存在することを明記します。

| 形状 | DIPS Web UI | DIPS API 1.9 | アプリ内部Domain | API送信時の扱い | 手動Web支援時の扱い |
|---|:---:|:---:|:---:|---|---|
| **Polygon（多角形）** | ○ (描画・保存可) | ○ (`"Polygon"`) | サポート | 契約の座標・形状へ変換して送信 | 頂点座標列を提示・地図確認 |
| **Circle（円形）** | ○ (中心＋半径m) | ○ (`"Circle"`) | サポート | 契約の座標・形状へ変換して送信 | 中心座標・半径をワンタップコピー |
| **Buffered Line（バッファライン/経路）** | ○ (線分＋幅m) | **未確認 / 非推奨** | 保持可能 (`BUFFERED_LINE`) | **API直接送信禁止** (`MANUAL_ONLY` 判定) | Web画面で線分・バッファ幅を入力支援 |

> [!WARNING]
> **BUFFERED_LINE（バッファライン）を勝手にAPI対応済みとして扱ってはなりません。**\
> DIPS API 1.9仕様書の `flyRoute.type` に明記されているのは `"Polygon"` および `"Circle"` のみです。アプリ内部では将来のWeb入力支援のために `BUFFERED_LINE` を保持可能としますが、API送信時は `MANUAL_ONLY` として判定し、公式な変換受付仕様が確認されるまでPolygonへの勝手な自己流変換送信を禁止します。

## 5. JSONのライフサイクルとexact outbound payload

1. `lockForSubmission()` によって保持する意味論的Snapshotは、manual / api / mock全方式の提出確定時点の機体・操縦者・目的・空域・方法・高度・Geometry・保険・許可等を保存する。[12d](../domain-model/12d_flight-plan-and-dips.md)がその型と不変性の正本であり、Manual ViewModelとSheets台帳も同じSnapshotを使用する。
2. `ApiDipsAdapter` は送信操作と契約バージョンを選び、`DipsFlightPlanMapper → DipsCodeMapper → DipsFlightPlanPayloadDTO → JSON serializer` の順で国交省FPR API（[33aの現在接続経路](../dips-infrastructure/33a_fixed-egress-and-api-connection.md)で中継）へPOSTする直前の電文を生成する。具体エンドポイントは資格取得後の公式契約で確定し、旧27の `/api/v1/flight-plans` 例を確定endpointとして扱わない。
3. `api_payload_snapshot` は実際のoutbound JSON文字列を内部監査・照合用に記録する。API未利用時・手動時はnull。通信結果が不明でも送出した内容と試行を失わず、[状態設計](../state-machines/README.md)の照合へ進む。成功後にだけ履歴を作る設計にはしない。
4. 機密・認証トークンは[16](../16_security.md)の除外対象とする。Domainを内部でJSON型やシリアライズ形式に保存することと、ユーザー向けJSON exportは異なる。本電文はユーザーへ表示・作成・保存・コピー・アップロードを要求せず、端末ファイルやDriveへのエクスポート対象にしない。

```text
意味論的 submission_snapshot（全通報方式・必須）
  ├─ Manual ViewModel / Sheets台帳
  └─ C7利用承認時のみ API Mapper → DTO → serializer → FPR API
                                  └─ 実送出文字列 api_payload_snapshot（内部証跡）
```

## 6. C7契約再確認と検証

- [25a](25a_field-catalog.md)の88行の操作別送信/応答区分、各型・値域・null/省略規則、契約版、配列・日時・座標順序を公式原文へ突き合わせるまで、exact DTOを確定したと扱わない。
- Domainの `LatLngPoint` から外部の `[longitude, latitude]` 表現への変換はこの境界だけで行う。CircleはDIPS固有の形状表現であり、標準GeoJSON仕様にCircleがあるという意味ではない。
- `BUFFERED_LINE` は `PENDING-WEB-05` が解決するまで `MANUAL_ONLY`。KML向けの近似PolygonをDIPS APIへ転用しない。
- 版別Mapper検証では無制限保険、複数機体/操縦者、その他条件、未対応Geometry、送信DTOと記録した文字列の一致を確認する。これは将来C7の検証設計であり、本docs作業で実装しない。
- **VERIFY-S7A-FLYROUTE-CONTRACT**: `flyRoute`の表現。99.2 §7は過去調査の整理として「GeoJSON文字列」と記録し、[25a](25a_field-catalog.md)のNo.41は「Object（GeoJSON準拠）」と記録していて食い違う。どちらも今回は公式原文と突合していないため、文字列かObjectか、座標順序、Circleの表現は上記の契約再確認まで確定しない。証拠の系列と限界は[26 §1.3](../26_dips-web-ui-verification.md#13-証拠系列と回収範囲)、共通の源との関係は[25e](25e_common-source-and-submission-boundaries.md)。
