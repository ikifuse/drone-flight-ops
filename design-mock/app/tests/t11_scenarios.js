'use strict';
/* 主要シナリオの端から端までの確認（2026-09-25）。
   6: API疑似経路の結果不明→照合（13b・33b）／3: 設定の変更が利用側へ反映／8: 端末保存→再保存で二重にしない／9: 履歴詳細の保存時の担当・点検。
   モック上の疑似動作であり、保存契約（PENDING-S6-FINAL-SAVE-CONTRACT）・C1 schema・DIPS API契約（VERIFY-S4-API-CONTRACT）の確定ではない。 */
suite('主要シナリオの通し確認',H=>{
  const {T,act,txt,route,q,qa,set,A,E,S,memo}=H;
  function toFinal(ac){act('nf-new');if(A().modal&&q('[data-act=nf-new][data-skip]'))act('nf-new','[data-skip]');act('nf-layout','[data-v=app]');act('start-new');S().aircraft=[ac||'a1'];S().pilots=['p1'];S().permit='none';S().biz=['空撮'];S().air=['上記空域の飛行は行わない'];S().met=['上記方法の飛行は行わない'];S().geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};S().from='a';S().to='b';window.nfGo('final')}
  function noDips(ac){
    act('nf-new');act('start-nodips');
    const s=S();s.aircraft=[ac];s.pilots=['p1'];s.biz=['空撮'];s.air=['上記空域の飛行は行わない'];s.met=['上記方法の飛行は行わない'];s.geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};s.from='自宅';s.to='広場';
    window.nfGo('final');act('nf-nodips-go');
  }
  /* ---- シナリオ6: 結果不明→照合 ---- */
  H.hash('scn=personal');A().dips.registered=true;
  T('結果不明: 計画は通報済みにならず、自動で再送しない。この端末に残る',()=>{
    const n=E().plans.length;toFinal('a1');act('nf-send-go');act('nf-result','[data-k=unknown]');
    return route()==='nf-accepted'&&E().plans.length===n&&!!E().unknownPlan&&txt().includes('自動で再送もしません');
  });
  T('あとで確認: ホームへ戻っても、新規飛行から確認の画面へ戻れる。新しい計画も作れる',()=>{
    act('root','[data-s=home]');act('nf-new');const sheet=!!q('.sheet')&&q('.sheet').innerText.includes('結果が分からない通報があります');
    act('nf-new','[data-skip]');const fresh=route()==='nf'&&!!E().unknownPlan;H.APP().root('home');
    act('nf-new');act('nf-resume-unknown');return sheet&&fresh&&route()==='nf-accepted'&&txt().includes('DIPS Webで確かめた結果');
  });
  T('登録されていなかった→確認した上でだけ送信し直す→正常受付で計画が載り、結果不明は消える',()=>{
    const n=E().plans.length;act('nf-recon','[data-v=none]');act('nf-recon-resend');const onSend=route()==='nf-send'&&E().plans.length===n;
    act('nf-submit');return onSend&&route()==='nf-accepted'&&E().plans.length===n+1&&E().plans[0].dips==='clean'&&!E().unknownPlan;
  });
  T('登録されていた→一覧照合（番号なし）で確認できた→通報確認済み。点検へは進めない',()=>{
    H.APP().root('home');toFinal('a2');act('nf-send-go');act('nf-result','[data-k=unknown]');
    act('nf-recon','[data-v=reg]');const off=q('[data-act=nf-recon-ok]').disabled;act('nf-mconf','[data-v=list]');act('nf-recon-ok');
    const p=E().plans[0];const ok=off&&route()==='nf-accepted'&&p.dips==='manual'&&p.confirmation.method==='list'&&p.confirmation.number===null&&!E().unknownPlan;
    act('nf-open-list');act('plan-open','[data-id="'+p.id+'"]');return ok&&route()==='plan'&&!q('.phone [data-act=plan-to-op]');
  });
  T('結果不明の画面の設計メモに、照合APIはVERIFY、進める条件はPENDINGとして残る',()=>{
    H.APP().root('home');toFinal('a1');act('nf-send-go');act('nf-result','[data-k=unknown]');const m=memo();return m.includes('VERIFY-S4-API-CONTRACT')&&m.includes('PENDING-S5-MANUAL-LIST');
  });
  /* ---- シナリオ3: 設定の変更が利用側へ反映。過去の記録は保存時の値のまま ---- */
  T('機体名を設定で変えると新規飛行に反映し、過去の履歴は保存時の名前のまま',()=>{
    H.hash('scn=personal');const old=E().aircraft.find(a=>a.id==='a2').name;
    noDips('a2');act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');const fid=E().flights[0].id;
    act('root','[data-s=home]');act('go','[data-s=set]');act('go','[data-s=set-aircraft]');act('reg-open','[data-t=aircraft][data-id=a2]');set('[data-bind="@d.name"]','名前を変えた2号機','input');act('reg-save');
    const now=E().aircraft.find(a=>a.id==='a2').name==='名前を変えた2号機';H.APP().root('home');
    act('nf-new');act('start-new');S().aircraft=['a2'];window.nfGo('review');const used=txt().includes('名前を変えた2号機');H.APP().root('home');
    act('go','[data-s=hist]');act('hist-open','[data-id="'+fid+'"]');return now&&used&&txt().includes(old)&&!txt().includes('名前を変えた2号機');
  });
  /* ---- シナリオ8: 最初からオフライン→端末に保存→再保存でも二重にしない ---- */
  T('オフラインで運航完了→保存状態から2回保存しても、飛行行・A4シート・BAT履歴・機体累計が増えない',()=>{
    H.hash('scn=personal');A().online=false;noDips('a1');
    act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');
    for(let i=0;i<2;i++){act('op-takeoff');act('op-land');act('op-land-confirm');if(!i)act('op-continue')}
    act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    const f=E().flights[0],ac=E().aircraft.find(a=>a.id==='a1'),b=E().bats.find(x=>x.id===f.legs[0].batId);
    const snap=()=>JSON.stringify({n:E().flights.length,legs:f.legs.length,min:ac.managedMinutes,cnt:ac.managedCount,uses:b.uses,hist:b.hist.length,sheets:(ac.a4Sheets||[]).length});
    const before=snap();const device=route()==='op-done'&&!f.synced&&!f.a4;
    A().online=true;act('root','[data-s=home]');act('go','[data-s=set]');act('go','[data-s=set-sync]');act('sync-now');const once=snap();H.APP().ACTS['sync-now']();const twice=snap();
    const b1=JSON.parse(before),o=JSON.parse(once);
    return device&&f.synced&&o.sheets===b1.sheets+1&&o.n===b1.n&&o.legs===b1.legs&&o.min===b1.min&&o.cnt===b1.cnt&&o.uses===b1.uses&&o.hist===b1.hist&&twice===once||before+' / '+once+' / '+twice;
  });
  /* ---- シナリオ9: 履歴詳細に保存時の操縦者・記録者・点検者・点検結果 ---- */
  T('別の記録者・別の点検者・飛行後の異常が、履歴詳細に保存時の値で出る',()=>{
    H.hash('scn=personal');noDips('a2');
    set('[data-bind="~inspections.pre.a2.person"]','p3');act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');
    set('[data-bind="~recorder"]','p2');act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');
    act('op-post-all');act('op-post-tog','[data-a=a2][data-i="2"]');set('[data-bind="~notes"]','発熱あり。冷却して保管');act('op-to-final');act('op-finalize');
    const names={p1:E().people.find(p=>p.id==='p1').name,p2:E().people.find(p=>p.id==='p2').name,p3:E().people.find(p=>p.id==='p3').name};
    E().people.find(p=>p.id==='p2').name='名前を変えた記録者';act('op-open-hist');const t=txt();
    return route()==='hist-detail'&&t.includes(names.p1+'／'+names.p2)&&t.includes(names.p3)&&t.includes('異常あり 1項目')&&t.includes('日常点検')&&!t.includes('名前を変えた記録者')||t.slice(0,400);
  });
});
