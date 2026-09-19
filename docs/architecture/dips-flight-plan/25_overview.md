# 25. DIPS Flight Plan設計の全体境界

最終更新: 2026-09-19\
状態: 設計整合（C1未着手）\
主責務: 入力済情報の再利用原則、Manual/APIの責務と読む順番\
入口: [DIPS Flight Plan設計群](README.md)

## 1. DIPS Submission Assistance Principle（通報入力支援原則）

本節を通報入力支援原則の正本とする。本アプリはDIPSそのものの完全複製を目的とせず、利用者が既に入力・選択したFlightPlan、Master、Preset、Permission、InsurancePolicy、Personnel、Aircraftを最大限再利用し、DIPS通報時の再入力・判断・画面往復を最小化する。

**Master / Preset / FlightPlan → 不変submission_snapshot → DipsManualEntryViewModel → DIPS Webで必要最小限の選択・入力・確認 → 通報確認記録**を標準経路とする。手動通報の利用者へAPI JSONの表示・作成・保存・コピーを要求しない。

正式なAPI利用承認・credential取得時のみ、同じsnapshotから **API Mapper → DIPS API内部JSON → DIPS API** の送信経路を追加する。APIの有無でFlightPlanや現場運航設計を作り直さない。ローカル不変保存とSheets同期ジョブ登録の業務フローは[24 Manual通報設計](../dips-submission/24_manual-submission.md)を参照する。

共通の源（FlightPlan・Geometry・不変Snapshot）から二経路を分ける因果、却下案、DIPS対象外との境界は[25e](25e_common-source-and-submission-boundaries.md)が詳細正本。本節は原則の正本である。

- **C6 Manualは第一級**: API JSON生成を前提とせず、オフラインで支援表示・コピーが可能。DIPS Webへの送信自体には通信が必要。
- **C7 APIはOptional**: 公式契約・資格情報を再確認してから実装する。未承認時にはMapper、API DTO、JSON serializerの実装は不要。
- **C1の範囲は変更しない**: 型・schemaの正本は[Domain設計群](../domain-model/README.md)。本再編でAPI通信、手動支援画面、地図エディタ、KML生成は実装しない。

## 2. 外部API DTOとCore Domainの分離設計（Anti-Corruption Layer）

DIPS APIのリクエストパラメータ名（例: `flightPurpose`, `flightAirspace`, `assistantsNumber`, `flyRoute` 等）や数値コード体系を、そのままCore Domainのエンティティ属性として直接混入させることを厳禁とします。

また、**手動通報支援経路**と**将来のAPI送信経路**を明確に分離します。

```text
┌────────────────────────────────────────────────────────┐
│ [Core Domain]                                          │
│  - FlightPlan (計画日時、意味論ベースの目的・空域・形態) │
│  - Aircraft, Personnel, Permission, Location, Preset   │
│  - InsurancePolicy (保険台帳)                          │
└───────────────────────────┬────────────────────────────┘
                            │ lockForSubmission()
                            ▼
┌────────────────────────────────────────────────────────┐
│ [不変提出Snapshot] submission_snapshot                 │
│  - 提出確定時点の意味論的通報データ (不変保持)         │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼ (手動 Web 通報支援経路: C6) │
┌───────────────────────────┐              │
│ DipsManualEntryViewModel  │              │
│  - DIPS Web実画面順配置   │              │
│  - 1タップコピー用テキスト│              │
│  - 登録済選択 vs 手入力   │              │
│  ※JSONシリアライズは不要 │              │
└───────────────────────────┘              │
                                           ▼ (API 自動通報経路: C7 Optional)
                              ┌───────────────────────────┐
                              │ DipsFlightPlanMapper      │
                              │  - FPR-API-1.9 コード変換 │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │ DipsFlightPlanPayloadDTO  │
                              │  - No.1〜88 準拠 DTO      │
                              │  - 内部JSONシリアライズ   │
                              │  - api_payload_snapshot   │
                              │    (POST送信時のみ記録)   │
                              └─────────────┬─────────────┘
                                            │ (HTTPS POST)
                                            ▼
                              ┌───────────────────────────┐
                              │ DIPS 2.0 FPR-API (外部)   │
                              └───────────────────────────┘
```
共通 `IDipsSubmissionAdapter` とManual/Mock/API戦略の正本は[15 DIPS Adapter](../15_dips-adapter.md)。

### 2.1. アプリ単体で完結する提供価値
国交省からAPI接続が承認されない場合や、個人利用でAPIが開放されない場合であっても、新アプリは以下の業務価値を完全に提供します：
1. **計画の事前作成・蓄積**: 電波のある場所やオフィスで事前に飛行計画を策定し、安全チェックを完了できる。
2. **手動入力の劇的省力化**: DIPS Web画面の配置順に整理されたコピー支援画面により、現場での手動通報にかかる時間を最小化。
3. **現場運航との完全バインド**: 作成した計画データ（機体、操縦者、高度、範囲、保険、許可等）が参照値として飛行前点検、離着陸記録、飛行後点検、バッテリー台帳、および飛行日誌（様式1〜3）へ自動引き継がれる。
4. **外部台帳二重化**: DIPS側の保存期間（保証・具体期間は未確認）に依存せず、自社のGoogleスプレッドシート「DIPS飛行計画台帳」へ全履歴を永続保管。

---

## 3. 正本関係と証拠の扱い

| 変更対象 | 正本 |
|---|---|
| 全No.1〜88の外部仕様参照 | [25a field catalog](25a_field-catalog.md) |
| 登録済Picker、checkbox、コピー、確認操作 | [25b manual web mapping](25b_manual-web-mapping.md) |
| API DTO、コード変換、exact outbound payload | [25c API payload mapping](25c_api-payload-mapping.md) |
| 3軸評価、値解決、validation、SUBMISSION_READY | [25d requirement validation](25d_requirement-validation.md) |
| DipsSubmissionと意味論的Snapshotの型 | [12d Domain](../domain-model/12d_flight-plan-and-dips.md) |
| Geometry一般仕様 | [17 Map / Geometry](../17_map-and-airspace.md) |
| 状態遷移・通報要否・離陸判断 | [状態設計群](../state-machines/README.md) |
| Webの観測・推論・未確認事項、実画面の証拠系列 | [26 実画面証拠](../26_dips-web-ui-verification.md) |
| 共通の源・Manual／API・DIPS対象外の境界の因果 | [25e](25e_common-source-and-submission-boundaries.md) |

26の `OBSERVED` は2026-09-14の観測範囲の事実、`OFFICIAL_SPEC` は記録された版の一次資料の仕様、`INFERRED` は推論、`PENDING` は未確認を表す。アプリが採用する設計要件とDIPS内部実装の事実は区別する。手動/API等価性は同じ意味論的Snapshotを起点にすることを意味し、未確認のWeb/API機能差まで同一と断定しない。
