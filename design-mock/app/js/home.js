'use strict';
/* ===================================================================
   ホーム（4入口） — 設計の出典: 34b（CURRENT-ACCEPTED）
   新規飛行／飛行リスト／飛行履歴・出力／各種設定・管理。すべて開ける。
   =================================================================== */
def('home',{t:'ホーム',back:false,
  goal:'新規計画、通報済み計画の続行、完了実績、設定管理を選び分ける。',
  doc:'34b §1・§2。ホームは4入口（新規飛行／飛行リスト／飛行履歴・出力／各種設定・管理）が決定済み。未完了件数などの常設表示は必須にしない。環境の選択・表示は入口を増減しない（34a §5）。',state:'accepted',
  tmp:['ホームの画面としての10項目の仕様はない（4入口の役割まで）','環境名の表示位置と切替の形は未確定（PENDING-S2-ENVIRONMENT-UI）。ここでは上の環境ボタンにしている','空の状態のときのひとこと案内は仮'],
  ask:['環境の切替は、ホームの環境ボタンでよいか（通常起動の専用画面案と比べたい）','初めて使うときの案内を、ホームに置くか'],
  body:()=>{
    const E=ENV();const empty=!E.aircraft.length&&!E.plans.length&&!E.flights.length;
    return '<div class="tiles">'
     +'<button class="tile primary" data-act="nf-new">✈ 新規飛行<small>飛行計画を作って通報する</small></button>'
     +'<button class="tile" data-act="go" data-s="list">📋 飛行リスト<small>通報済みの計画から選ぶ</small></button>'
     +'<button class="tile" data-act="go" data-s="hist">🗂 飛行履歴・出力<small>過去の飛行・KML・PDF</small></button>'
     +'<button class="tile" data-act="go" data-s="set">⚙ 各種設定・管理<small>機体・人員・環境など</small></button>'
     +'</div>'
     +(empty?'<div class="msg info" style="margin-top:12px"><b>まだ何も登録されていません。</b><br>［新規飛行］から始めると、機体や操縦者などは、必要になったところで<b>その場で登録</b>できます。先に［各種設定・管理］でまとめて登録することもできます。 '+tmpChip+'</div>':'')
     +'<div class="sec" style="margin-top:12px"><h3>今の運用環境</h3><table class="kv"><tr><td>環境</td><td>'+esc(E.name)+'（'+esc(KIND_NAME(E.kind))+'）</td></tr><tr><td>あなたの役割</td><td>'+esc(envRole(E))+'</td></tr><tr><td>Googleアカウント</td><td class="mono">'+esc(A.account.email)+'</td></tr></table><p class="note">機体・操縦者・許可承認・保険・連絡先は、この環境の登録から選びます。環境を切り替えると、選べる内容も変わります。</p></div>';
  }
});
Object.assign(ACTS,{
  'home':()=>root('home')
});
