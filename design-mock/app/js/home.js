'use strict';
/* ===================================================================
   ホーム（4入口） — 設計の出典: 34b（CURRENT-ACCEPTED）
   新規飛行／飛行リスト／飛行履歴・出力／各種設定・管理。すべて開ける。
   =================================================================== */
def('home',{t:'ホーム',back:false,
  goal:'新規計画、通報済み計画の続行、完了実績、設定管理を選び分ける。',
  doc:'34b §1・§2。ホームは4入口（新規飛行／飛行リスト／飛行履歴・出力／各種設定・管理）が決定済み。未完了件数などの常設表示は必須にしない。使っている場所の表示は「個人で使用中」のように名称で示す（34b §5・34h）。',state:'accepted',
  tmp:['ホームの画面としての10項目の仕様はない（4入口の役割まで）','使っている場所の表示位置と切替の形は未確定（PENDING-S2-ENVIRONMENT-UI）。ここでは上の「〜で使用中」のボタンと、下の［切り替える］にしている','空の状態のときのひとこと案内は案。左側の説明は最小にしている（機体・操縦者などは飛行の途中でもその場で登録できることは、ここには書いていない。案内が要るかは未決）','「Googleアカウント」の行に出している薄い文字は例。実際は、ログイン中のGoogleアカウントのメールアドレスが入る想定','DIPSのログイン情報が未登録のときの注意表示をホームに出すかは未決（いまは出していない）'],
  ask:['切り替えは、ホームのボタンでよいか（ログイン直後の専用画面案と比べたい）','初めて使うときの案内を、ホームに置くか'],
  body:()=>{
    const E=ENV();const empty=!E.aircraft.length&&!E.plans.length&&!E.flights.length;
    return '<div class="tiles">'
     +'<button class="tile primary" data-act="nf-new">✈ 新規飛行<small>飛行計画を作って通報する</small></button>'
     +'<button class="tile" data-act="go" data-s="list">📋 飛行リスト<small>通報済みの計画から選ぶ</small></button>'
     +'<button class="tile" data-act="go" data-s="hist">🗂 飛行履歴・出力<small>過去の飛行・KML・PDF</small></button>'
     +'<button class="tile" data-act="go" data-s="set">⚙ 各種設定・管理<small>機体・人員・BATなど</small></button>'
     +'</div>'
     +(empty?'<div class="msg info" style="margin-top:12px">まだ何も登録されていません。［新規飛行］から始められます。</div>':'')
     +'<div class="sec" style="margin-top:12px"><h3>'+esc(envLabel(E))+'で使用中</h3><table class="kv"><tr><td>あなたの役割</td><td>'+esc(envRole(E))+'</td></tr><tr><td>Googleアカウント</td><td>'+acctMail()+'</td></tr></table><div class="row"><button class="btn sm" data-act="env">切り替える</button></div></div>';
  }
});
Object.assign(ACTS,{
  'home':()=>root('home')
});
