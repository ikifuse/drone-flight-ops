# ADR-0006: DIPS API非依存・手動通報フォールバック・飛行計画台帳の独立保持

- **作成日**: 2026-09-14
- **ステータス**: **提案中（オーナーレビュー待ち）**
- **決定者**: オーナー（システム設計者）、AIアシスタント（技術検討パートナー）
- **関連ドキュメント**: [docs/architecture/24_b2.2-dips-manual-fallback-and-ledger.md](../architecture/24_b2.2-dips-manual-fallback-and-ledger.md), [docs/architecture/11_data-authority.md](../architecture/11_data-authority.md), [docs/architecture/12_domain-model.md](../architecture/12_domain-model.md), [docs/architecture/13_state-machines.md](../architecture/13_state-machines.md), [docs/architecture/15_dips-adapter.md](../architecture/15_dips-adapter.md), [docs/architecture/23_implementation-roadmap.md](../architecture/23_implementation-roadmap.md)

---

## 1. 背景と課題（Context）

現在、国土交通省へDIPS 2.0 APIの利用申請を行っているが、以下の不確実性が存在する：
- 個人事業主・個人パイロットに対する利用承認の可否が未確定。
- 固定IPアドレス等のネットワーク要件や審査条件を満たせるか未確定。
- 正式なcredential（client_id, client_secret）の発行時期が未確定。

もし新アプリを「DIPS APIが利用できること」を前提に設計・実装した場合、APIが取得できなかった際にアプリ全体が未完成・利用不能に陥るリスクがある。
また、国交省DIPSサーバー側のデータ保持期間や将来の参照可能期間は利用規約上保証されておらず、DIPS側にしか履歴が残らない設計は利用者側の法令遵守・運航管理の観点から脆弱である。
さらに、飛行計画（FlightPlan）は後から日時や機体が変更される可能性があり、「現在の計画」のみを保存する構造では「過去にDIPSへ何を通報しようとし／通報したか」の証跡が失われてしまう。

---

## 2. 検討した選択肢（Options Considered）

- **選択肢A: DIPS API前提設計（API待機案）**: APIの承認が出るまで飛行計画機能を凍結、またはAPI必須として実装を進める。
- **選択肢B: 手動入力は暫定テキストメモ（アドホック案）**: API取得まではアプリ外でDIPSを入力し、アプリ内には備考欄程度しか残さない。
- **選択肢C: API非依存・手動第一級サポート・提出スナップショット＆独立台帳保持（推奨案）**:
  - DIPS通報前に、提出予定内容の不変 `payload_snapshot`（`DipsSubmission`）をローカル永続化し、Googleスプレッドシート「DIPS飛行計画台帳」へ非同期同期（Sheets同期完了はDIPS通報をブロックしない）。
  - 手動通報を「正式な第1級機能」として扱い、専用の手動入力支援画面（1タップコピーUI）と明確な通報打刻フローを実装。
  - 「操縦者による手動通報記録」と「DIPS通報確認（受付番号入力または一覧目視照合）」を厳格に区別する状態マシンを確立。
  - DIPS APIは「同一データモデル上で最後の送信経路だけを切り替えるOptional Integration」とし、APIがなくてもPhase C6で主要機能実装を完了できるロードマップを採用。

---

## 3. 提案内容（Proposed Decision）

**選択肢C（API非依存・手動第一級サポート・提出スナップショット＆独立台帳保持）** を推奨候補として提案する（オーナーレビュー承認待ち）。

1. **Googleスプレッドシート「DIPS飛行計画台帳」の論理保持**:
   - DIPSへの通報（API/手動問わず）前に、提出予定内容を端末内へ不変保存し、独立台帳へ非同期退避する（Sheets同期はDIPS通報を妨げない）。
   - DIPSサーバー側の保存期間に依存せず、過去の全通報履歴・改訂履歴を利用者側で長期保持する。
2. **不変スナップショット（`payload_snapshot`）による履歴保護と可変メタデータの管理**:
   - **不変なのは `payload_snapshot` のみ**。ライフサイクルメタデータ（ステータス、確認日時、受付番号等）は更新可能とし、`AuditEvent` で履歴を追跡する。
   - 計画が変更・再通報されても、過去に通報した内容は上書き破壊せず、新リビジョンとして追記し、`supersedes_id` / `superseded_by_id` で改訂履歴を追跡する。
3. **手動入力支援画面（1タップコピーUI）と柔軟な通報確認**:
   - スマホ1台で現場運用できるよう、DIPS入力に必要な全項目を整理表示し、1タップでクリップボードへコピー可能とする。
   - DIPS Web手動操作で受付番号が明示されない場合でも、飛行計画一覧の一致を目視確認することで `dips_plan_id: null` のまま `confirmation_method: 'flight_plan_list_match'` として `DIPS_CONFIRMED` を記録可能とする。
4. **状態管理における誤認防止（5大ルール）の徹底**:
   - 「ローカル保存済」≠「外部台帳同期済」≠「DIPS通報済」（3軸完全分離）
   - 「手動通報記録」≠「DIPS確認済み」
   - 「API受理確認」と「手動確認（番号入力または一覧照合）」の区別
   - 「Mock成功」≠「本番通報成功」
   - 「通報完了」≠「飛行可能」
5. **Phase C実装ロードマップの非依存化**:
   - Phase C6でDIPS API非依存の主要機能実装を完了させ（本番運用可能判定はC8帳票機能およびC9実機総合検証完了後）、Phase C7（実API中継）は承認時のみ着手するOptional扱いとする。

---

## 4. 影響と評価（Consequences）

- **メリット**:
  - DIPS APIの審査結果（承認・保留・却下）に関わらず、現場で実用可能なアプリとして主要機能を確実に完成できる。
  - 将来APIが承認された場合でも、データベースや台帳を作り直すことなく、`ApiDipsAdapter` を追加するだけでシームレスに自動化へ昇格できる。
  - 国交省サーバー停止時や完全電波圏外でも、独立台帳とローカルDBに過去の通報履歴が安全に保全される。
- **デメリット・留意点**:
  - 手動通報時はパイロット自身によるDIPS画面への転記と確認操作（受付番号入力または一覧照合）が必要となる（専用支援画面により負荷を極小化）。
