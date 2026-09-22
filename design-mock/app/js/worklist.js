'use strict';
/* ===================================================================
   飛行リスト（共有の作業リスト）とDIPS通報内容 — 設計の出典: 34c／34d §4／24b §3
   ［飛行リスト］はDIPS正常受付済みで、これから実飛行または中止等を扱う計画。完了済みFlightを探す［飛行履歴・出力］とは別。
   =================================================================== */
const PL_FILTERS=[['all','すべて'],['pilot','自分が操縦'],['rep','自分が通報'],['dup','重複あり']];
const dipsLabel=p=>p.dips==='dup'?'通報済み・重複あり':p.dips==='manual'?'通報確認済み':'通報済み・重複なし';
const planOf=id=>{const E=ENV();return E&&E.plans.find(p=>p.id===id)};

def('list',{t:'飛行リスト',st:'これから扱う、通報済みの計画',
  goal:'共有された通報済み計画から、これから自分が扱う対象を選ぶ。',
  doc:'34c §2・§3（飛行リスト画面の10項目）。カードは5系統（予定日時／飛行場所／機体／操縦者・通報者／DIPS状態）が決定済み。上部の絞り込み［すべて／自分が操縦／自分が通報／重複あり］は現在案（CURRENT-PROPOSAL）。カードを選ぶと、中間の詳細画面を挟まず「DIPS通報内容」へ直接進む（§4）。',state:'spec',
  tmp:['絞り込みの初期選択・複数条件・件数の見せ方・並び順は未確定（PENDING-S5-LIST-DETAIL）。並びは予定日時順にしている（仮）','飛行計画名・検索欄・警告件数などは、カードの必須項目にしない（34c §2）','アプリを使わずDIPS Webで直接通報された計画がリストに出るか（PENDING-S5-LIST-EXTERNAL-DIPS）、同じ計画を複数人が同時に開いた場合（PENDING-S5-LIST-CONCURRENT-START）は未決','リストの物理保存・共有反映・cacheは未確定。オフライン時の鮮度の見せ方も未確定'],
  ask:['予定日時が過ぎた計画を、いつまで残し、どう整理するか（記録として残すか、消すか）'],
  ui:['カードは決定済みの5系統に絞り、絞り込みは「すべて」を初期選択にしている','絞り込みの並べ方と件数の見せ方は標準案'],
  body:()=>{
    const E=ENV();const f=A.ui.plFilter||'all';
    let L=E.plans.slice().sort((a,b)=>a.start-b.start);
    const total=L.length;
    if(f==='pilot')L=L.filter(p=>p.pl.includes(E.meId));
    if(f==='rep')L=L.filter(p=>p.rep===E.meId);
    if(f==='dup')L=L.filter(p=>p.dips==='dup');
    const chips='<div class="filters">'+PL_FILTERS.map(x=>'<button class="pill'+(f===x[0]?' sel':'')+'" data-act="pl-filter" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
    const cards=L.map(p=>'<button class="card" style="width:100%;margin-bottom:8px" data-act="plan-open" data-id="'+p.id+'"><b>'+esc(fmtDT(p.start))+'</b><span>📍 '+esc(p.place)+'</span><span>✈ '+p.ac.map(id=>esc(acName(id))).join('・')+'</span><span>👤 操縦者: '+p.pl.map(id=>esc(plName(id))).join('・')+'　／　通報者: '+esc(plName(p.rep))+'</span><span class="chips"><i class="chip '+(p.dips==='dup'?'warn':'ok')+'">'+dipsLabel(p)+'</i>'+(p.kml==='pending'?'<i class="chip warn">KMLは未保存</i>':'')+'</span></button>').join('');
    return '<p class="lead">通報が正常に受け付けられ、これから実飛行（または中止など）を扱う計画です。過去に完了した飛行は［飛行履歴・出力］にあります。</p>'+(total?chips:'')
     +(cards||(total?'<div class="empty">この条件に合う計画はありません</div>':'<div class="empty"><b>通報済みの計画はまだありません</b><br>［新規飛行］で計画を作って通報すると、ここに載ります。<br><button class="btn sm" style="margin-top:8px" data-act="nf-new">新規飛行へ</button></div>'))
     +'<p class="note">'+(A.online?'みんなで共有している飛行リストを表示しています。':'オフラインです。この端末に取得済みの内容を表示しています。最新でないことがあります。')+'</p>';
  }
});
def('plan',{t:'DIPS通報内容',st:()=>{const p=planOf(A.ui.planId);return p?p.name:''},
  goal:'選んだ計画のDIPS通報内容を確認して、飛行前点検、または中止側の操作へ進む。',
  doc:'34d §4（DIPS通報内容画面の10項目）／34c §4（通報内容へ直接進む。ローカルだけを変える大きな［編集］ボタンは置かない）／24b §3（取消・整理の意味）。',state:'spec',
  tmp:['全表示項目はここで新規定義しない（既存の計画・提出記録を参照）。ここではDIPSの22項目と地図を、通報した内容として表示','日時・場所などの変更は、DIPS側の変更／再通報を伴う別処理（後続）。入口の見せ方は仮','中止／削除の確認画面・戻り方は未確定。DIPS取消は制度上可能な範囲で行う（24b §3）','重複ありの調整は未設計（PENDING-S7B-DUPLICATE-ADJUST）','飛行の中止・計画の削除をしたときに、記録として何を残すかと、DIPS側の取消との対応は、後続の設計で未整理（34f）'],
  ask:[],
  ui:['中止・削除は画面の下にまとめ、主操作から離して置いている（誤操作を避けるため）','通報内容は全項目を出している。要約にするかどうかも見せ方の調整'],
  chips:()=>{const p=planOf(A.ui.planId);return p?'<i class="chip '+(p.dips==='dup'?'warn':'ok')+'">'+dipsLabel(p)+'</i>':''},
  body:()=>{
    const p=planOf(A.ui.planId);if(!p)return '<div class="empty">計画が見つかりません</div>';
    const s=p.snap;
    return (p.dips==='dup'?'<div class="msg warn">他の計画と重複しています。重複の調整は、この画面ではまだできません。DIPS Webで確認してください。</div>':'')
     +'<div class="msg info">これは、DIPSへ<b>通報した内容</b>です。通報した内容は、あとから黙って書き換えません。日時・場所を変えるときは、DIPS側の変更／再通報を伴う別の手続きになります。</div>'
     +'<div class="sec"><h3>通報の情報</h3><table class="kv"><tr><td>通報者</td><td>'+esc(plName(p.rep))+'</td></tr><tr><td>操縦者</td><td>'+p.pl.map(id=>esc(plName(id))).join('、')+'</td></tr><tr><td>DIPS状態</td><td>'+esc(dipsLabel(p))+'</td></tr><tr><td>KML</td><td>'+(p.kml==='saved'?'保存済み':'まだGoogle Driveに保存されていません')+'</td></tr></table></div>'
     +'<div class="sec"><h3>DIPSに通報した内容</h3>'+DIPS_ITEMS.map(x=>'<div class="rev"><div class="k">'+esc(x.name)+'</div><div class="v">'+valueOf(x.n,s)+'</div></div>').join('')+'<div class="rev"><div class="k">飛行範囲（地図）</div><div class="v">'+esc(geomSummary(s))+'<div class="mapwrap" style="margin-top:6px">'+mapSvg(s,'mini')+'</div></div></div></div>'
     +'<p class="note"><button class="chip" data-act="stub" data-t="日時・場所の変更（別処理）" data-m="通報した内容の変更は、DIPS側の変更や再通報を伴う、別の手続きになります。この手続きは、準備中です。">日時・場所を変えたい場合</button> '+tmpChip+'</p>';
  },
  foot:()=>'<button class="btn danger" data-act="plan-cancel">飛行中止／削除</button>'+(planOf(A.ui.planId)?.dips==='clean'?'<button class="btn primary" data-act="plan-to-op">飛行前点検へ</button>':'')
});

Object.assign(ACTS,{
  'pl-filter':t=>{A.ui.plFilter=t.dataset.v;render()},
  'plan-open':t=>{A.ui.planId=t.dataset.id;nav('plan')},
  'plan-to-op':()=>{const p=planOf(A.ui.planId);if(p&&p.dips==='clean'&&typeof startOp==='function')startOp(p,null);else toast('DIPSで受付と重複の状態を確認してください')},
  'plan-cancel':()=>openSheet(()=>'<h3>この飛行を中止・削除しますか</h3><ul style="padding-left:1.2em;font-size:14px"><li>制度上可能な範囲で、DIPS側の取消を行います（DIPS側の取消は、アプリの外の手続きです）。</li><li>アプリ側では取消を記録し、この計画を<b>飛行リストから外します</b>。</li><li>これまでの通報履歴・受付の証跡は、消えません。</li></ul><p class="note">事故・急病・通信できないなどで、DIPS側の取消ができなかった場合でも、飛行リストからは外せます。</p><div class="row"><button class="btn" data-act="close">やめる</button><button class="btn danger" data-act="plan-cancel-ok">中止する</button></div>'),
  'plan-cancel-ok':()=>{if(!canWrite())return;const E=ENV();E.plans=E.plans.filter(p=>p.id!==A.ui.planId);A.ui.planId=null;A.modal=null;back();toast('計画を中止し、飛行リストから外しました。通報の履歴は残ります')}
});
