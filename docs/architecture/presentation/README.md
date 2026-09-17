# プレゼンテーション層設計目次（presentation/README.md）

最終更新: 2026-09-18
状態: Phase C0完了・Phase C1未着手（99.2設計検討正本反映）
正本責任: Presentation / UI仕様・共通規約・ナビゲーション

---

## 1. プレゼンテーション層の役割と設計思想

本リポジトリにおけるプレゼンテーション層（`docs/architecture/presentation/`）は、**「現場スマートフォンで操作しやすく、操作数や誤操作を抑え、必要情報を確認しやすいUI」** を実現するための画面設計、ナビゲーション、および画面仕様記述規約を規定する専門の正本領域です。

単なるPC向けWeb管理画面やデスクトップ前提の画面遷移ではなく、ドローン運航の現場において操縦者や関係者が迷わず安全に操作できる画面体験を定義します。

---

## 2. 設計文書における状態タグ規約の参照

本領域を含むアーキテクチャ文書では、99.2検討正本からの段階的移植に伴い、各仕様・検討項目の状態を以下のタグで明示して管理します。
状態タグ体系の詳細および共通原則については、[アーキテクチャ設計目次（docs/architecture/README.md）](../README.md#2-設計文書における状態分類タグ体系) を参照してください。

- **`CURRENT-ACCEPTED`**: 現時点採用済み（現行の設計ベースライン。将来変更禁止を意味せず、合理的理由があれば変更可能）
- **`CURRENT-PROPOSAL`**: 現在案（現時点で有力な検討候補案）
- **`PENDING`**: 未確定・要検討（詳細設計や検証課題として留保されている事項）
- **`VERIFY`**: 外部確認待ち（外部API仕様・国交省通知等の確認待ち事項）
- **`HISTORICAL`**: 過去案・変更前案（検討途中で見送られた案・変更経緯）
- **`EVIDENCE/EXAMPLE`**: 観察事実・実例・設計根拠（実測値・観察事実）
- **`NEW-PROPOSAL`**: 新規提案（整合・標準化のために新たに起票された提案）

> [!NOTE]
> `CURRENT-ACCEPTED` は設計文書上の現時点の採用状態を示すものであり、ADRの正式ステータスである `Accepted`（オーナー承認済みの重要決定）とは区別されます。ADR-0011等はStep 8の全体監査まで `Proposed` を維持します。

---

## 3. 構成文書一覧

| 文書 | 主要責務 | 設計状態 |
|---|---|:---:|
| [30a. ホーム画面・全体ナビゲーション設計](30a_home-and-navigation.md) | ホーム4大入口の役割固定、ナビゲーション原則、運用環境表示・切替UI、マスターその場登録UX | `CURRENT-ACCEPTED` / 一部 `CURRENT-PROPOSAL` |
| [30b. 画面仕様共通記述規約](30b_screen-specification-standard.md) | 全画面を均一な粒度で記述・保守するための11標準項目テンプレート | `CURRENT-ACCEPTED` |
| [30c. 共有飛行リスト画面仕様](30c_shared-flight-list-ui.md) | 共有作業キュー画面仕様（30b規約準拠）、カード5項目、操作導線、非同期引継ぎ、Online/Offline境界 | `CURRENT-ACCEPTED` / 一部 `CURRENT-PROPOSAL`, `PENDING` |

---

## 4. 他レイヤーとの責務境界（二重定義の禁止）

Presentation層はユーザーインターフェースと画面遷移に特化し、他レイヤーの責務を侵食・重複定義しません。

1. **ドメインモデル（domain-model/）との境界**:
   - 飛行計画（`FlightPlan`）、DIPS通報（`DipsSubmission`）、機体・バッテリー等のEntityプロパティや保存スキーマは [domain-model](../domain-model/README.md) が正本です。Presentation層はUI上の表示項目と入力フォーマットのみを扱います。
2. **状態マシン（state-machines/）との境界**:
   - 現場運航状態（`13a_operation.md`）およびDIPS通報状態（`13b_dips-submission.md`）の遷移ロジックやガード条件はState Machinesが正本です。Presentation層はユーザー操作による状態遷移イベントのトリガー（ボタン押下等）と、現在の状態に応じた表示文言の提示のみを担当します。
3. **権限・アクセス制御（identity-and-access/）との境界**:
   - 業務役割（Operational Role）、アプリ機能権限（App functional permission）、Google Drive実アクセス権の三層定義は [identity-and-access](../identity-and-access/README.md) が正本です。Presentation層は権限に応じたUI要素の表示／非表示／非活性化ルールを記述しますが、三層の自動結合や権限判定ロジックの再定義は行いません。
4. **DIPS通報業務・台帳（dips-submission/）との境界**:
   - DIPS手動通報業務およびGoogle Sheets共有台帳の物理構造は [dips-submission](../dips-submission/README.md) が正本です。Presentation層は共有飛行リストを作業キューとして参照・表示するUI境界のみを規定します。
5. **出力・エクスポート（output/）との境界**:
   - PDF帳票、KMLエクスポート、Google Driveストレージ同期の物理生成仕様は [output](../output/README.md) が正本です。
