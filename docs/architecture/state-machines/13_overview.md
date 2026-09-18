# 13. 運航・提出・離陸評価の独立性と接続

最終更新: 2026-09-15\
状態: Phase C0完了・Phase C1未着手（docs再編）

主要責務: 独立した状態管理の接続。DIPS・Sheets・現場記録を同じ状態で表さない。

## 1. 2つの独立した状態マシンの分離原則と接続Gate

本システムでは、**「現場の実際の運航・飛行を管理する状態マシン（Operation FSM）」**と、**「国土交通省DIPS 2.0への手続きを管理する状態マシン（DIPS FSM）」**を完全に分離して設計します。

```text
┌────────────────────────────────────────┐      ┌────────────────────────────────────────┐
│   運航状態マシン (Operation FSM)       │      │   DIPS通報状態マシン (DIPS FSM)        │
│                                        │      │                                        │
│  現場での物理的な作業・点検・飛行・交換 │ 独立 │  国交省サーバーとの電子的通報手続き    │
│  （通信不要・オフライン自律稼働）      │ ───  │  （手動記録はローカル・外部確認を分離）│
└────────────────────────────────────────┘      └────────────────────────────────────────┘
```

### 1.1. 状態概念の4段階と保存・通報・運航Gate

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

## 2. 正本の分担

[13a](13a_operation.md) は現場運航FSM、[13b](13b_dips-submission.md) はDIPS提出FSM、[13c](13c_takeoff-readiness.md) は通報要否・障害例外・離陸総合評価を定義する。本書のフローは接続説明であり、各状態や判定ルールの重複正本ではない。通報なし・計画なしで開始する運航も [12e](../domain-model/12e_operation-inspection-maintenance.md) に従う。SUBMISSION_READYの全判定条件は [25d](../dips-flight-plan/25d_requirement-validation.md)。

Step 5の人間向け入口・正常受付後の導線は[Presentation 34b〜34d](../presentation/README.md)。本書の状態分離・接続Gateをホームの画面遷移と同一視しない。API正常受付経路の具体化によって、Manual・通報対象外・結果不明時の現場記録の境界を変更しない。
