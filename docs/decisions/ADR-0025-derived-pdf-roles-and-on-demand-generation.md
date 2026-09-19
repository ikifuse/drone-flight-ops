# ADR-0025: 派生PDFを役割で分け、必要な時だけ生成する

- **作成日**: 2026-09-19
- **ステータス**: Proposed（未承認）。現在ベースラインの判断記録であり、ADR自体は未承認
- **関係性**: [ADR-0021](ADR-0021-a4-record-layout-and-sheet-boundary.md)のA4運航記録と必要時PDF、[ADR-0023](ADR-0023-common-source-and-derived-submission-paths.md)の共通の源、[ADR-0024](ADR-0024-kml-generated-at-plan-submission-from-report-content.md)のKMLの生成契機をClarifiesし、PDFの役割分離と生成方針を加える。Accepted ADRの本文は変更しない
- **決定者**: 99.2 §8の現在到達点を、オーナーのStep 7d指示に基づきClaudeが記録
- **詳細正本**: [27f](../architecture/output/27f_derived-pdf-roles-and-map-pdf.md)。画面は[34e](../architecture/presentation/34e_history-and-output.md)、移管と確認範囲は[Step 7d監査](../migration/99-2-step-7d-causal-audit.md)

## 1. 背景と課題（Context）

DIPS用に作った飛行範囲・経路を、再入力せず後から使いたい。一方、毎飛行でPDFを自動生成すると、不要なファイルが増える。PC版のDIPS画面では地図と入力項目が並んで確認できるが、その関係を人が追いやすい資料にする出力は、A4運航記録とは源も目的も違う。

## 2. 検討した選択肢（Options Considered）

- A. 飛行完了時に、毎飛行のPDFを無条件で自動生成する。
- B. 運航記録と、DIPS通報内容・地図を1つのPDFにまとめる。
- C. KMLファイルを、通常のA4帳票として直接印刷する導線にする。
- D. PDFを二つに分けて役割を混ぜず、印刷・提出・保存が必要な時だけ生成する。

## 3. 決定内容（Decision）

Dを現在ベースライン（CURRENT-ACCEPTED）として27fに記録する。

- A4運航記録PDF（04の確定運航記録が源）と、地図付きPDF（06の通報内容と共通Geometryが源）に分け、役割を混ぜない。二つを同じ飛行へ紐づけ、合わせて「計画・地理」から「実施・点検」を追えるようにする。
- PDFは飛行完了時に無条件で自動生成せず、必要な時だけ07のPDF側へ生成する。A4のSpreadsheetは、Google Sheets標準の印刷・PDF化もできるようにし、アプリだけを唯一の印刷手段にしない。
- KMLを帳票として直接印刷する導線にしない。用途別のPDFは、06と04の正本から再生成する。
- 対象の飛行を選んだ後に、必要な出力を選ぶ方式を、飛行履歴・出力の画面の第一候補とする（確定ではない）。

## 4. 採用理由と他案の却下理由（Rationale）

Aは、毎飛行でPDFを自動生成すると不要なファイルが増えるため採らない。Bは、二つのPDFの役割を混ぜないという方針に反する。Cは、KMLを帳票として直接印刷する導線にしないという方針に反する。

## 5. メリット（Pros）

- 不要なPDFが増えず、必要な時に必要な出力だけを作れる。
- 役割ごとに源が明確で、A4運航記録は04、地図付きPDFは06を基準に再生成できる。
- Sheets標準の印刷・PDF化が残り、アプリの状態に依存しない印刷経路がある。

## 6. デメリット・トレードオフ（Cons / Trade-offs）

- 地図付きPDFの詳細レイアウト・命名・生成画面は未確定で、1飛行のテストで確認する（PENDING-S7D-MAPPDF-DETAIL、VERIFY-S7D-MAPPDF-REGEN）。
- 既存の「地図付き飛行計画書」（周辺注意事項・関係者提出用）との関係は未確定（PENDING-S7D-MAPPDF-SCOPE）。
- 二つのPDFを結ぶ`flight_id`と、1つの飛行が複数のA4シートにまたがる場合の出力単位は未確定。

## 7. 将来この決定を見直す条件（Re-evaluation Triggers）

- 1飛行のテストで、通報内容と地図が1枚で読めないと確認された場合。
- 通報内容以外の項目が必要と確認され、PDFの役割分離を見直す場合。
- 意味上の1飛行の定義が確定し、二つのPDFの紐づけが変わる場合。

本ADRは実装開始・Drive操作の許可ではない。
