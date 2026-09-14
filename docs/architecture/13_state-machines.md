# 13. 運航状態マシンとDIPS通報状態マシンの設計（13_state-machines.md）

最終更新: 2026-09-14
プロジェクト: `drone-flight-ops`
フェーズ: Phase B2（詳細アーキテクチャ・実装前設計）

---

## 1. 2つの独立した状態マシンの分離原則と接続Gate

本システムでは、**「現場の実際の運航・飛行を管理する状態マシン（Operation FSM）」**と、**「国土交通省DIPS 2.0への手続きを管理する状態マシン（DIPS FSM）」**を完全に分離して設計します。

```text
┌────────────────────────────────────────┐      ┌────────────────────────────────────────┐
│   運航状態マシン (Operation FSM)       │      │   DIPS通報状態マシン (DIPS FSM)        │
│                                        │      │                                        │
│  現場での物理的な作業・点検・飛行・交換 │ 独立 │  国交省サーバーとの電子的通報手続き    │
│  （通信不要・オフライン自律稼働）      │ ───  │  （通信依存・キュー管理・受付確認）    │
└────────────────────────────────────────┘      └────────────────────────────────────────┘
```

### 1.1 状態概念の4段階と保存・通報・運航Gate

計画作成から現場運航への流れにおいて、以下の4段階の状態概念およびGateを厳密に区別します。

```text
【計画作成】
  FlightPlan (plan_status: 'draft')  <-- 入力途中でも常時保存可能 (SAVE_DRAFT = always allowed)
    │
    ▼ DipsFieldRequirementEngine による評価
  SUBMISSION_READY                   <-- REQUIRED + 適用該当時のCONDITIONAL_REQUIRED 充足
    │
    ▼ 不変 submission_snapshot 生成 & ローカルDB保存
  SNAPSHOT_SAVED (DipsSubmission 起票)
    ├─────────────────────────────────────────┐
    ▼                                         ▼
【DIPS手続きライン (DIPS FSM)】         【アプリ現場運航ライン (Operation FSM)】
  SNAPSHOT_SAVED                            Mission: PREPARING (運航セッション開始)
    ├─ 手動: MANUAL_SUBMIT_WAIT               │
    │        ↓ MANUAL_SUBMITTED               ▼
    │        ↓ DIPS_CONFIRMED               PREFLIGHT_INSPECTION (飛行前日常点検)
    └─ API : SENDING                          │
             ↓ API_CONFIRMED / RETRY_WAIT     ▼
                                            ★【TAKEOFF READINESS ASSESSMENT (離陸前総合評価)】
                                              APPLICATION_FLOW_READY ≠ LEGAL_TAKEOFF_READY
                                              │ (DIPS要否/状態 + 点検合格 + 許可 + 周囲安全を独立評価)
                                              ▼
                                            TAKEOFF_READY (離陸待機)
                                              ↓ (実際の離陸打刻はブロックせず必ず記録)
                                            IN_FLIGHT (飛行中)
```

1. **① DRAFT（下書き）**:
   - 入力途中。必須項目が不足していても端末ローカルへ保存可能（`SAVE_DRAFT` は常に許可）。
   - ブラウザや端末を閉じても復元可能。
2. **② SUBMISSION_READY（通報準備完了）**:
   - `DipsFieldRequirementEngine` により、今回の飛行に適用される `REQUIRED` および該当する `CONDITIONAL_REQUIRED` がすべて充足された状態。
   - `OPTIONAL` や `NOT_APPLICABLE` の項目が空であっても提出準備完了を妨げない。
3. **③ SNAPSHOT_SAVED（提出スナップショット保存済）**:
   - `SUBMISSION_READY` の内容から、不変の `DipsSubmission.submission_snapshot`（意味論的通報スナップショット）を生成し、端末ローカルDBへ保存完了（API通報時は送信時に exact JSON を `api_payload_snapshot` へ記録）。
   - この時点で `DipsSubmission` レコードが起票され、DIPS FSMの初期状態となる。同時に外部台帳同期キューへ投入される（※Googleスプレッドシート同期完了は待たない）。
4. **④ 運航・離陸Gateの分離（Application Flow ≠ Legal Takeoff）**:
   - **`SNAPSHOT_SAVED` 以降、DIPS通報が未完了（`MANUAL_SUBMIT_WAIT`, `SENDING`, `FAILED`, `RETRY_WAIT`, `SUBMISSION_UNCERTAIN` 等）であっても、アプリの現場運航準備（`Mission` 作成、飛行前点検、現場記録画面）への遷移そのものをHard Blockしない**。
   - ただし、**「アプリで次工程へ進める（APPLICATION_FLOW_READY）」ことと「法令上離陸してよい（LEGAL_TAKEOFF_READY）」は全く別概念**である。
   - アプリは「未通報飛行を適法とみなす許可ボタン」を絶対に作成しない。実際の離陸可否は操縦者が法令・許可条件・安全状況を総合確認して判断する。

### 1.2 DIPS通報「要否」と「状態」の分離・評価モデル
「DIPS通報が完了していないこと」を短絡的に「離陸不合格」としてはなりません。航空法上、特定飛行を行う場合は通報が義務（航空法第132条の88）ですが、**非特定飛行の場合は通報義務がなく推奨扱い**です。また、**DIPSシステム障害時（公式通報要領の例外規定）には飛行開始後の事後通報が認められています**。  
したがって、以下の2軸を明確に分離して評価します。

#### A. DipsReportingRequirement（通報要否・義務度）
- **`REQUIRED`**: 今回の飛行は特定飛行に該当し、航空法上、事前の飛行計画通報が必須。
- **`NOT_REQUIRED`**: 非特定飛行（DID外・昼間・目視内・30m以上・催し外・危険物なし・物件投下なし）であり、法令上の通報義務なし（通報は推奨）。
- **`UNDETERMINED`**: 空域・飛行形態条件が未確定のため、要否判定が保留されている状態。

#### B. DipsReportingStatus（通報手続き状態）
既存の `DipsSubmission.status` をそのまま活用し、二重状態マシンの新設を避けます：
- `NOT_APPLICABLE`: 通報不要計画、または通報を行わない運用
- `NOT_SUBMITTED`: スナップショット未生成 / ドラフト段階
- `SNAPSHOT_SAVED`: 提出スナップショット保存済（未通報）
- `MANUAL_SUBMIT_WAIT`: 手動通報入力待機中
- `MANUAL_SUBMITTED`: 手動通報実施を記録（確認待ち）
- `SENDING`: API通信中
- `DIPS_CONFIRMED` / `API_CONFIRMED`: 通報確認完了（手動照合済 または API自動受理）
- `FAILED`: 通報失敗（恒久エラー）
- `RETRY_WAIT`: 一時エラー再試行待機
- `SUBMISSION_UNCERTAIN` / `RECONCILIATION_REQUIRED`: 結果不明・目視照合要
- `SYSTEM_OUTAGE_EXCEPTION`: **国交省公式通報システム障害例外の記録あり**

#### C. DIPSシステム障害時例外（SYSTEM_OUTAGE_EXCEPTION）の厳格な境界
- **法令根拠**: 国交省「無人航空機の飛行計画の通報要領」に基づき、通報システム障害等により飛行開始までに通報手段がない場合は、飛行開始後の事後通報が認められています。
- **自動判定の禁止**: アプリが勝手に「通信ができない＝障害例外成立」と自動判定することは厳禁とします（ユーザーの圏外、API設定ミス、端末オフラインとは厳格に区別）。操縦者が公認障害情報を確認の上で理由・メモを添えて記録した場合にのみ記録されます。
- **表示表現**: 「DIPS事前通報未確認（システム障害例外記録あり）」等と客観表示するに留め、「合法」「飛行許可」等の法的保証表示は行いません。

### 1.3 TakeoffReadinessAssessment（離陸前総合評価）とBlock/Warning設計
離陸可否判定を単純なAND条件（DIPS充足＋点検合格＋許可＋周囲安全）とせず、各チェック要素を独立して多軸評価します：

```typescript
export interface TakeoffReadinessAssessment {
  overall_status: 'READY' | 'WARNING_PRESENT' | 'BLOCKED';
  evaluated_at: string;
  
  // 各チェック要素の個別評価 (PASS / WARNING / BLOCKING / NOT_APPLICABLE / UNKNOWN)
  dips_reporting: {
    requirement: DipsReportingRequirement;
    status: DipsSubmissionStatus;
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

### 1.4 未確認離陸監査ログ（AuditEvent）の境界
- **記録条件**:
  - `DipsReportingRequirement === 'REQUIRED'` かつ DIPSが未確認のまま離陸打刻が行われた場合のみ、`AuditEvent`（`event_type: 'TAKEOFF_WITH_UNCONFIRMED_DIPS'`）を記録。
- **例外除外**:
  - **非特定飛行（`NOT_REQUIRED`）での離陸時**: 本監査イベントは発生させない（法令義務違反の疑いではないため）。
  - **システム障害例外（`SYSTEM_OUTAGE_EXCEPTION`）時**: `event_type: 'TAKEOFF_UNDER_SYSTEM_OUTAGE_EXCEPTION'` として区別記録し、通常の未確認離陸と明確に識別可能とする。

> [!IMPORTANT]
> **「DIPS通報成功確認済み」＝「飛行可能」ではありません。また「アプリで点検へ進める」＝「離陸してよい」でもありません。**
> DIPS通報の成功は飛行計画通報の法令要件を満たしたことを示すのみであり、実際の離陸には別途「許可承認の有効性」「空域の安全」「土地管理者承諾」「気象条件」「日常点検合格」の総合確認（TakeoffReadinessAssessment）が必要です。

---

## 2. 運航状態マシン（Operation State Machine）

現場での操縦者の操作負荷を極小化し、現行アプリ（`autel-evo-lite-flight-log`）の俊敏な現場打刻フローを完全に継承・強化した状態遷移を定義します。

### 2.1 状態遷移図（Mermaid）

```mermaid
stateDiagram-v2
    [*] --> PREPARING : 運航開始タップ
    
    PREPARING --> PREFLIGHT_INSPECTION : 準備完了・点検へ
    PREPARING --> ABORTED : 飛行中止(飛行0回)
    
    PREFLIGHT_INSPECTION --> TAKEOFF_READY : 日常点検完了(合格)
    PREFLIGHT_INSPECTION --> ABORTED : 点検不合格・中止
    
    TAKEOFF_READY --> IN_FLIGHT : 離陸打刻 (時刻記録)
    
    IN_FLIGHT --> LANDED : 着陸打刻 (時間計算)
    
    LANDED --> BATTERY_SWAP : BAT交換タップ
    LANDED --> AIRCRAFT_SWITCH : 機体交代タップ
    LANDED --> TAKEOFF_READY : 同一BATで再離陸
    LANDED --> POSTFLIGHT_INSPECTION : 本日運航終了
    
    BATTERY_SWAP --> TAKEOFF_READY : 新BAT装着完了
    AIRCRAFT_SWITCH --> PREFLIGHT_INSPECTION : 交代機体の点検へ
    
    POSTFLIGHT_INSPECTION --> MISSION_COMPLETED : 飛行後点検・所感入力完了
    
    ABORTED --> [*]
    MISSION_COMPLETED --> [*] : 同期キューへ登録
```

### 2.2 各状態の定義と現場操作

| 状態名 (State) | 説明・システム挙動 | 現場でのUI操作 | 保存されるデータ |
|---|---|---|---|
| **`PREPARING`** | 運航セッションの開始。機体・パイロット・現場天候・場所の確認。 | 機体選択、現場選択 | `Mission` レコード作成 |
| **`PREFLIGHT_INSPECTION`** | 航空法第132条の89、航空法施行規則第236条の84、および無人航空機の飛行日誌の取扱要領に基づく飛行前日常点検（航空法第132条の86の飛行前確認事項を含む）。 | チェック項目確認、「全項目正常」または異常メモ | `PreflightInspection` |
| **`TAKEOFF_READY`** | 離陸待機状態。画面中央に大きな「離陸」ボタンを配置。 | 片手タップで即離陸 | なし（画面待機） |
| **`IN_FLIGHT`** | 飛行中。ストップウォッチがカウントアップ。 | 画面中央に大きな「着陸」ボタン | `Flight` (離陸時刻) |
| **`LANDED`** | 着陸直後。飛行時間を自動計算表示。次アクション選択待機。 | 次飛行／BAT交換／終了 | `Flight` (着陸時刻・飛行時間) |
| **`BATTERY_SWAP`** | バッテリー交換。次スロットのバッテリーをワンタップ選択。 | BATボタン（1〜7）タップ | `BatteryUsage` 確定・切替 |
| **`AIRCRAFT_SWITCH`** | 機体交代。予備機または別機種へ切り替え。 | 機体選択タップ | `AircraftSwitch` 記録 |
| **`POSTFLIGHT_INSPECTION`** | 運航完了後の日常点検、機体清掃、総所感入力。 | 点検チェック、所感入力 | `PostflightInspection` |
| **`MISSION_COMPLETED`** | 本運航セッション確定。ローカル確定マーク付与。 | 「台帳同期」ボタン表示 | `Mission` (確定状態・同期ジョブ) |
| **`ABORTED`** | 天候悪化や機体異常による飛行0回での現場中止。 | 中止理由選択 | `Mission` (中止記録) |

### 2.3 特殊シナリオへの対応
1. **8回以上の連続飛行**: 配列構造として `Flight` を保持するため、8回、10回などの複数回飛行でも制限なく記録可能。
2. **日跨ぎ飛行**: 日時フィールドをISO8601（UTC+オフセット、秒・ミリ秒精度）で保持し、日付変更線を跨ぐ運航でも正確に飛行時間を算出。
3. **不意の強制終了・再起動**: すべてのイベント（離陸打刻、着陸打刻等）がIndexedDBに即時同期されるため、飛行中にブラウザが閉じても、再開時に直前の状態（`IN_FLIGHT` 等）へ確実に復帰。

---

## 3. DIPS通報状態マシン（DIPS Notification State Machine - B2.3改訂）

APIの有無（手動通報 / API自動通報）にかかわらず、提出予定スナップショットのローカル永続化、手動入力支援、送信成否、そして「操縦者による手動通報操作」と「DIPS側の登録確認」を明確に分離した状態追跡を行います。
また、**「DIPS通報状態（Submission State）」と「外部台帳同期状態（Ledger Sync State）」は直交する別軸として管理**し、スプレッドシート同期の完了有無がDIPS通報手続きをブロックしない設計とします。

### 3.1 状態遷移図（Mermaid）

```mermaid
stateDiagram-v2
    [*] --> SNAPSHOT_SAVED : 提出内容確定・不変スナップショット生成 (ローカルDB保存・台帳同期キュー投入)
    
    state "手動通報フロー (Manual)" as ManualFlow {
        SNAPSHOT_SAVED --> MANUAL_SUBMIT_WAIT : 手動通報モード選択 (手動支援画面表示)
        MANUAL_SUBMIT_WAIT --> MANUAL_SUBMITTED : 操縦者が「DIPSへ手動通報した」と記録
        MANUAL_SUBMITTED --> DIPS_CONFIRMED : 操縦者がDIPS画面で計画登録を確認 (一覧目視照合 または 受付番号入力)
    }
    
    state "API自動通報フロー (Optional API)" as ApiFlow {
        SNAPSHOT_SAVED --> SENDING : API通報開始 (ネットワーク到達確認)
        SENDING --> API_CONFIRMED : DIPS公式仕様に基づく成功レスポンス受領・検証 (計画ID等取得)
        SENDING --> FAILED : 認証エラー/バリデーションエラー(4xx)
        SENDING --> RETRY_WAIT : 一時通信エラー/サーバー5xxエラー
        SENDING --> SUBMISSION_UNCERTAIN : POST送信中切断/応答タイムアウト (成否不明)
        
        SUBMISSION_UNCERTAIN --> API_CONFIRMED : DIPS計画照合で登録確認
        SUBMISSION_UNCERTAIN --> RETRY_WAIT : DIPS計画照合で未登録確認済み
        SUBMISSION_UNCERTAIN --> RECONCILIATION_REQUIRED : 照合不能/要手動確認
        
        RECONCILIATION_REQUIRED --> DIPS_CONFIRMED : 操縦者がDIPS画面確認の上「登録確認」承認
        RECONCILIATION_REQUIRED --> RETRY_WAIT : 操縦者が「未登録」確認の上再送指定
        
        RETRY_WAIT --> SENDING : ネットワーク復帰・再送実行
    }
    
    FAILED --> [*] : 不変履歴として保存 (計画修正時はFlightPlan編集・新Submission起票)
    
    DIPS_CONFIRMED --> SUPERSEDED : 計画内容変更による新リビジョン作成
    API_CONFIRMED --> SUPERSEDED : 計画内容変更による新リビジョン作成
    DIPS_CONFIRMED --> CANCELLED : 計画取消 (DIPS側取消処理＋取消理由記録)
    API_CONFIRMED --> CANCELLED : 計画取消 (DIPS API取消または手動取消)
    
    DIPS_CONFIRMED --> [*]
    API_CONFIRMED --> [*]
    CANCELLED --> [*]
    SUPERSEDED --> [*]
```

### 3.2 各状態の定義と現場UI挙動

※飛行計画の作成・編集中は `FlightPlan.plan_status = 'draft'` で管理され、提出内容を確定して不変スナップショット（`submission_snapshot`）を生成した時点で初めて `DipsSubmission` が起票されます。したがって、Submission状態マシンは初期状態 **`SNAPSHOT_SAVED`** から始まります。

| 状態名 (State) | 説明 | ユーザーへのUI表示 | 次の遷移 |
|---|---|---|---|
| **`SNAPSHOT_SAVED`** | 提出不変スナップショット（`submission_snapshot`）が端末ローカルDBへ保存され、通報準備が完了した状態（同時に外部台帳同期キューへ投入）。※Google Sheets同期完了は待たない。 | **「通報準備完了（DIPS未通報）」** | 手動通報またはAPI通報へ |
| **`MANUAL_SUBMIT_WAIT`** | 手動入力支援画面を表示中。パイロットがDIPS Web/アプリへコピー＆ペースト入力を行っている待機状態。 | 「手動通報待機中（DIPSへ入力してください）」 | `MANUAL_SUBMITTED` |
| **`MANUAL_SUBMITTED`** | 操縦者がアプリ上で「DIPS手動通報を完了した」と記録打刻した状態。**※DIPS側の登録・受理確認ではない**。 | **「手動通報実施を記録（DIPS登録確認待ち）」** | `DIPS_CONFIRMED` |
| **`DIPS_CONFIRMED`** | 操縦者がDIPS画面で計画登録を確認した状態（飛行計画一覧との目視照合、または受付番号の確認入力）。 | **「DIPS通報確認完了（手動確認済）」** | 運航完了 / 取消 / 訂正 |
| **`SENDING`** | バックエンド経由で国交省DIPS APIとHTTP通信中。 | 「DIPS API通報中...（通信中）」 | 成功/失敗/結果不明 |
| **`API_CONFIRMED`** | DIPS公式API仕様で定義された成功レスポンスを受領し、受付番号/計画ID等の必要条件がシステム的に自動確認された状態。 | **「DIPS通報完了（API自動受理・受付番号: XXXXX）」** | 運航完了 / 取消 / 訂正 |
| **`SUBMISSION_UNCERTAIN`** | API送出後に通信切断・タイムアウトが発生し、登録成否が不明な状態。**自動再POSTは行わない**。 | 「通報結果照合中...（二重登録防止のため照合中）」 | DIPS計画検索照合へ |
| **`RECONCILIATION_REQUIRED`**| API照合でも成否を判定できず、操縦者によるDIPS Web画面での目視確認を要求する状態。 | 「要確認: DIPS登録状況を照合できません。DIPS画面で確認してください」 | 操縦者の確認入力 |
| **`FAILED`** | バリデーションエラーや恒久拒否（4xx）。不変履歴としてそのまま保存（下書きへの巻き戻しやpayload改変は不可）。 | 「通報失敗: 計画を修正して再作成してください」 | 履歴保存（FlightPlan修正・新Submission起票へ） |
| **`RETRY_WAIT`** | 通信圏外やDIPSサーバー障害による一時待機。 | 「一時通信エラー: 再送待機中」 | `SENDING` |
| **`SUPERSEDED`** | 時間変更や機体変更により、新しいリビジョンが起票され、旧提出スナップショットが無効化された状態。 | 「旧版（リビジョン更新により差し替え済み）」 | 履歴保持のみ |
| **`CANCELLED`** | 当該飛行計画を取り消した状態（DIPS側取消手続きと取消日時・理由記録）。 | 「計画取消済み（取消理由: XXXXX）」 | 履歴保持のみ |
| **`SYSTEM_OUTAGE_EXCEPTION`** | 国交省公式通報システム障害により、飛行開始前の通報が物理的に不可能な状況において、操縦者が障害例外事由・メモを添えて記録した状態（着陸後速やかに事後通報を行う）。※アプリによる自動判定は禁止。 | **「DIPS事前通報未完了（国交省システム障害例外記録あり・着陸後速やかに通報）」** | 運航完了後の事後通報へ |

> [!IMPORTANT]
> **状態と法的解釈の混同防止原則（5大ルール）**:
> 1. **「SNAPSHOT_SAVED（スナップショット保存済）」≠「DIPS通報済み」**: 端末ローカルDBやスプレッドシート台帳に保存されても、DIPSへは未提出です。また、台帳同期状態（`sync_status`）とDIPS通報状態（`status`）は別軸として画面上も区別表示します。
> 2. **「MANUAL_SUBMITTED（手動通報記録）」≠「DIPS確認済み」**: パイロットがボタンを押しただけではDIPS側の登録証明にはならず、一覧照合目視確認または受付番号確認（`DIPS_CONFIRMED`）を別ステップとして要求します。
> 3. **「API_CONFIRMED」と「DIPS_CONFIRMED」の区別**: システム自動検証（API）か人間による目視確認（手動）かを監査ログ・台帳上で明確に識別可能とします。
> 4. **「MOCK成功」≠「実通報成功」**: 開発・テスト用のMock DIPS Adapterで成功しても、本番通報済みとは表示せず、「[MOCK] 疑似通報完了」と画面上明記します。
> 5. **「通報完了」≠「飛行可能」**: DIPS通報はいかなる状態であっても飛行許可そのものではありません。「飛行計画通報完了。飛行前に周囲の安全・気象・許可条件を必ず確認してください」と表示します。
