# 13c. 通報要否・障害例外・離陸前総合評価

最終更新: 2026-09-15\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: DipsReportingRequirement、TakeoffReadinessAssessment、離陸時監査イベント。既存法令判断を保持し、DIPS通信状態と安全評価を混同しない。

## 1. DIPS通報「要否」と「状態」の分離・評価モデル
「DIPS通報が完了していないこと」を短絡的に「離陸不合格」としてはなりません。航空法上、特定飛行を行う場合は通報が義務（航空法第132条の88）ですが、**非特定飛行の場合は通報義務がなく推奨扱い**です。また、**DIPSシステム障害時（公式通報要領の例外規定）には飛行開始後の事後通報が認められています**。\
したがって、以下の2軸を明確に分離して評価します。

### 1.1. A. DipsReportingRequirement（通報要否・義務度）
- **`REQUIRED`**: 今回の飛行は特定飛行に該当し、航空法上、事前の飛行計画通報が必須。
- **`NOT_REQUIRED`**: 非特定飛行（DID外・昼間・目視内・30m以上・催し外・危険物なし・物件投下なし）であり、法令上の通報義務なし（通報は推奨）。
- **`UNDETERMINED`**: 空域・飛行形態条件が未確定のため、要否判定が保留されている状態。

### 1.2. B. DipsReportingStatus（通報手続き状態）
表示用の `DipsReportingStatus` は [13bのDipsSubmissionStatus](13b_dips-submission.md) を参照し、独自のSubmission FSMを永続化しない。まだSubmissionがない時だけ `NOT_SUBMITTED`（Draft/スナップショット未生成）、`NOT_APPLICABLE`（通報不要かつ通報しない運用）の表示区分を導出する。`NOT_APPLICABLE` は未判定を意味せず、要否が未確定なら `UNDETERMINED` を保持する。`SYSTEM_OUTAGE_EXCEPTION` を含む起票後の手続き状態は13bが正本。

### 1.3. C. DIPSシステム障害時例外（SYSTEM_OUTAGE_EXCEPTION）の厳格な境界
- **法令根拠**: 国交省「無人航空機の飛行計画の通報要領」に基づき、通報システム障害等により飛行開始までに通報手段がない場合は、飛行開始後の事後通報が認められています。
- **自動判定の禁止**: アプリが勝手に「通信ができない＝障害例外成立」と自動判定することは厳禁とします（ユーザーの圏外、API設定ミス、端末オフラインとは厳格に区別）。操縦者が公認障害情報を確認の上で理由・メモを添えて記録した場合にのみ記録されます。
- **表示表現**: 「DIPS事前通報未確認（システム障害例外記録あり）」等と客観表示するに留め、「合法」「飛行許可」等の法的保証表示は行いません。

## 2. TakeoffReadinessAssessment（離陸前総合評価）とBlock/Warning設計
離陸可否判定を単純なAND条件（DIPS充足＋点検合格＋許可＋周囲安全）とせず、各チェック要素を独立して多軸評価します：

```typescript
export interface TakeoffReadinessAssessment {
  overall_status: 'READY' | 'WARNING_PRESENT' | 'BLOCKED';
  evaluated_at: string;

  // 各チェック要素の個別評価 (PASS / WARNING / BLOCKING / NOT_APPLICABLE / UNKNOWN)
  dips_reporting: {
    requirement: DipsReportingRequirement;
    status: DipsSubmissionStatus | 'NOT_SUBMITTED' | 'NOT_APPLICABLE'; // 読取表示用。別FSMを永続化しない
    result: 'PASS' | 'WARNING' | 'BLOCKING' | 'NOT_APPLICABLE';
    message: string;
  };
  permission: {
    result: 'PASS' | 'WARNING' | 'BLOCKING' | 'NOT_APPLICABLE';
    message: string;
  };
  preflight_inspection: {
    result: 'PASS' | 'BLOCKING';
    message: string;
  };
  airspace_and_site: {
    result: 'PASS' | 'WARNING' | 'UNKNOWN';
    message: string;
  };
  weather_condition: {
    result: 'PASS' | 'WARNING' | 'UNKNOWN';
    message: string;
  };
  operator_acknowledgement: {
    is_acknowledged: boolean;
    acknowledged_at?: string;
  };
}
```

- **判定区分とアプリの挙動**:
  1. **Application Hard Block（アプリ操作の物理阻止）**:
     - 飛行前日常点検（`PREFLIGHT_INSPECTION`）が未実施・不合格の場合。安全航行の物理的前提であるため、点検合格打刻なしには `TAKEOFF_READY` へ遷移させない。
  2. **Regulatory / Safety Warning（法令・安全上の警告表示）**:
     - `DipsReportingRequirement === 'REQUIRED'` かつ DIPS未確認（`SNAPSHOT_SAVED`, `MANUAL_SUBMIT_WAIT`, `FAILED` 等）の場合。画面上に黄色/赤色の警告バナーを表示し、操縦者の確認・了解を促す。
     - **非特定飛行（`NOT_REQUIRED`）の場合**: DIPS未通報であっても Warning/Blocking とせず、「非特定飛行（通報推奨）」と情報表示する。
     - **システム障害例外（`SYSTEM_OUTAGE_EXCEPTION`）の場合**: 「事前通報未完了（障害例外記録あり・着陸後速やかに通報してください）」と警告・ガイダンス表示する。
  3. **Operation FSMの記録保証**:
     - アプリが Warning を表示していても、**操縦者が物理的に離陸した場合、アプリはその離陸事実（Takeoff打刻）を絶対に拒否せず記録（IN_FLIGHT）する**。記録を停止して無記録飛行を生み出すことは安全・法令管理上最大の過失であるため。

## 3. 未確認離陸監査ログ（AuditEvent）の境界
- **記録条件**:
  - `DipsReportingRequirement === 'REQUIRED'` かつ DIPSが未確認のまま離陸打刻が行われた場合のみ、`AuditEvent`（`event_type: 'TAKEOFF_WITH_UNCONFIRMED_DIPS'`）を記録。
- **例外除外**:
  - **非特定飛行（`NOT_REQUIRED`）での離陸時**: 本監査イベントは発生させない（法令義務違反の疑いではないため）。
  - **システム障害例外（`SYSTEM_OUTAGE_EXCEPTION`）時**: `event_type: 'TAKEOFF_UNDER_SYSTEM_OUTAGE_EXCEPTION'` として区別記録し、通常の未確認離陸と明確に識別可能とする。

> [!IMPORTANT]
> **「DIPS通報成功確認済み」＝「飛行可能」ではありません。また「アプリで点検へ進める」＝「離陸してよい」でもありません。**
> DIPS通報の成功は飛行計画通報の法令要件を満たしたことを示すのみであり、実際の離陸には別途「許可承認の有効性」「空域の安全」「土地管理者承諾」「気象条件」「日常点検合格」の総合確認（TakeoffReadinessAssessment）が必要です。

## 4. 通報要否判定サービス（旧25 §9.6を統合）

`DipsFieldRequirementEngine` は項目ごとの要求度・適用性を扱い、本書の `DipsReportingRequirementEvaluator` は飛行全体の通報義務の要否を独立評価する。入力は [FlightPlan](../domain-model/12d_flight-plan-and-dips.md) の意味論的空域・方法・高度と確定状況、出力は `requirement: REQUIRED | NOT_REQUIRED | UNDETERMINED`、`is_specific_flight: boolean | null`（未確定時null）、`reasons: string[]`。旧サンプルのAPI数値コードをCoreで直接比較しない。

以下は従来13・25にある法令条件の移管であり、新たな法令適用を断定するものではない。法令8区分と正式記録全体の扱いは [運用規約](../../guidelines/02_legal-and-operations-rules.md) に従う。

| 判定対象 | 特定飛行の理由として保持する条件 | 旧サンプルの意味を保存する説明 |
|---|---|---|
| 空港等の周辺空域 | 該当 | 従来の空域APIコード3の意味。数値変換は25cへ分離 |
| 地表・水面から150m以上の空域 | 該当、または計画AGLが150m以上 | 旧本文の「以上」に揃える。旧 `> 150` サンプルとの不一致を解消 |
| 人口集中地区（DID）の上空 | 該当 | 従来の空域APIコード1の意味 |
| 夜間飛行 | 該当 | 従来の方法APIコード3の意味 |
| 目視外飛行 | 該当 | 従来の方法APIコード4の意味 |
| 人又は物件から30m未満の飛行 | 該当 | 従来の方法APIコード1の意味 |
| 多数の者の集合する催しの上空 | 該当 | 従来の方法APIコード2の意味 |
| 危険物の輸送 | 該当 | 従来の方法APIコード5の意味 |
| 物件投下 | 該当 | 従来の方法APIコード6の意味 |

1. 確定した該当条件があれば `REQUIRED` とし、該当理由を全件返す。
2. 該当条件がなく、判定に必要な空域・形態・高度の確定が不足する場合は `UNDETERMINED`。未入力を `0`、空配列を「非該当」と見なして `NOT_REQUIRED` にしない。
3. 必要条件がすべて確定し該当なしなら `NOT_REQUIRED`、理由は「非特定飛行（DID外・昼間・目視内・30m距離確保等）」とする。DIPS未通報でもBlocking/エラーにせず通報推奨の情報表示にする。
4. 国交省公式通報要領のシステム障害例外は、上記義務度とは別に記録する。例外記録は自動生成せず、事後通報の案内・監査記録へ接続する。

意味キーの全enum、入力確定状態のschemaおよび判定表の実装表現は **PENDING**。C1で法令判定コードを実装しない。実装時の境界検証では150mちょうど、未入力、確定非該当、複数理由、通常圏外と公式障害例外を区別する。
