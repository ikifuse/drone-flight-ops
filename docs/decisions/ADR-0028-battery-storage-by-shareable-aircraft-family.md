# ADR-0028: BATの保存正本を、同じBATを共用できる機体系ごとに1つとし、1物理BAT＝1シートで管理する

- **作成日**: 2026-09-20
- **ステータス**: Proposed（未承認）。現在の設計ベースラインの判断記録であり、ADR自体は未承認
- **関係性**: [ADR-0007](ADR-0007-normalized-masters-and-business-reporting.md)の独立した物理個体・N:M共用と、[ADR-0017](ADR-0017-asset-acquisition-history-and-cumulative-scope.md)の「機体セット表示を固定所有にしない」をClarifiesする。Partially Supersedesとして、ADR-0007 §2.8の物理シート全面禁止を、04・05に続いてBATの人間向け媒体にも限定範囲で置換する（[ADR-0021](ADR-0021-a4-record-layout-and-sheet-boundary.md)・[ADR-0022](ADR-0022-drive-responsibilities-and-human-records.md)と同じ扱い）。ADR-0022の「通常BAT・DIPS履歴へ例外を広げない」は、BATについては、内部履歴には広げない意味に限り読み直す（追補を0022へ記録）。Accepted本文は変更しない
- **決定者**: オーナーの2026-09-20の指示を、Claudeが記録
- **詳細正本**: [32f](../architecture/asset-management/32f_battery-storage-structure.md)。適用範囲は[32e](../architecture/asset-management/32e_battery-management-scope-and-flight-separation.md)、ADR-0029

## 1. 背景と課題（Context）

BAT管理の途中案は、機体個体ごとにDriveのフォルダーを作り、各Spreadsheetに「バッテリー台帳」とBAT個別シートを置いていた。しかし実運用では、EVO LiteとEVO Lite+が同じ物理BAT7本を共用している。物理BAT⑤を両方の機体で使うのに機体別のSpreadsheetへ分けると、同じ物理BATの履歴・現在状態・累計値が複数箇所に存在し、正本の重複、更新の不整合、履歴の分断が起こる。

## 2. 検討した選択肢（Options Considered）

- A. 機体ごとのSpreadsheetに、BAT台帳とBAT個別シートを置く（旧の途中案）。
- B. 機体を問わない別の総合BAT台帳を置き、BATごとのシートと併存させる。
- C. 同じBATを共用できる機体系ごとに1つのSpreadsheetを持ち、物理BAT1本につき1シートとし、別の総合台帳を置かない。

## 3. 決定内容（Decision）

Cを現在の設計ベースライン（CURRENT-ACCEPTED）として32fに記録する。

- BAT保存正本の単位は、機体ではなく「同じBATを共用できる機体系」とする。
- `03_バッテリー管理`の直下に、機体系ごとに1つのSpreadsheetを置く。現在は、EVO LiteとEVO Lite+の共用系の1つ。全く別のBATを使う別の機体系は、別のSpreadsheetを並べる。
- Spreadsheetには、別の総合BAT台帳を置かず、物理BAT1本につき1シートとする。BATが増えたらシートを追加する。
- 同じ物理BATの履歴・現在状態・累計値の保存正本は、そのBATのシート1か所とする。

物理BATを機体の所有物として固定しないことは、既存のADR-0007 §2.2（Accepted。「バッテリーは特定機体の所有物にしない」）が定めており、本ADRは繰り返さない。1つのシートの上部・履歴の項目、ファイル名の規則、30本・50本での運用性は決めていない（`PENDING`／`VERIFY`）。

## 4. 採用理由と他案の却下理由（Rationale）

Aは、共用BATの履歴・現在状態・累計値が複数箇所に存在し、正本が重複するため採らない。Bは、BATシートの上部にある個体情報・現在値と、総合台帳の内容が二重になるため採らない（設計上の帰結。オーナーは総合台帳を置かない構成を採用している）。Cは、正本を物理BAT1本につき1か所にでき、人が1本のBATの履歴を直接追える。

## 5. メリット（Pros）

- 共用BATの履歴が分断されず、正本が1か所になる。
- BATの追加がシートの追加で済み、機体を増やしてもBATの正本は増えない。
- 機体系ごとに独立し、他の機体系への障害の波及を抑えられる。人が直接読み、手修正できる。

## 6. デメリット・トレードオフ（Cons / Trade-offs）

- 同じBATシートへの複数人・複数端末の同時書き込みの扱いは未確定（PENDING-D-BAT-CONCURRENT-WRITE）。
- 30本・50本になった時に、総合台帳なしで運用に耐えるかは未検証（VERIFY-D-BAT-SCALE）。
- 「同じBATを共用できる機体系」の決め方（互換が一部だけ重なる場合等）は未確定（PENDING-D-BAT-FAMILY-BOUNDARY）。
- 1物理BAT＝1シートは、シートの増殖という旧案の欠点を再び持ち得る。人が読む媒体に限り、内部の履歴は行追加・正規化を基本とする。
- 旧の論理台帳案（24aのNo.6・No.7）とは異なる。

## 7. 将来この決定を見直す条件（Re-evaluation Triggers）

- 総合台帳なしでは運用できないと実運用で分かった場合。
- 機体系の境界が運用に合わない場合、または複数組織での所有・移管で支障が出る場合。
- 同時書き込みで履歴が壊れる場合。

本ADRは実装開始・Drive変更の許可ではない。実際のDriveの状態は、オーナーの報告に基づく（32f §6）。
