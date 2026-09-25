'use strict';
/* A4の保存先（機体ごとの飛行記録ファイル・日付と次の空き連番のシート。35c §3）と、
   DIPS Webで通報・確認した計画から通常運航へ進めない理由の表示（34d §7）。
   シート名の割当はモック上の表現で、保存契約（PENDING-S6-FINAL-SAVE-CONTRACT）やC1 schemaの確定ではない。 */
suite('A4の保存先とDIPS Webで確認した計画',H=>{
  const {T,act,txt,route,q,A,E,S,memo}=H;
  const base=()=>window.a4Base(new Date());
  function runNoDips(ac,legs,switchTo){
    act('nf-new');act('start-nodips');
    const s=S();s.aircraft=[ac];s.pilots=['p1'];s.biz=['空撮'];s.air=['上記空域の飛行は行わない'];s.met=['上記方法の飛行は行わない'];s.geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};s.from='自宅';s.to='広場';
    window.nfGo('final');act('nf-nodips-go');
    act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');
    for(let i=0;i<legs;i++){act('op-takeoff');act('op-land');act('op-land-confirm');if(i<legs-1)act('op-continue')}
    if(switchTo){act('op-to-switch');act('op-switch-pick','[data-id='+switchTo+']');act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');act('op-takeoff');act('op-land');act('op-land-confirm')}
    act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    return E().flights[0];
  }
  H.hash('scn=personal');
  T('8明細目以降は、同じ機体のファイルで次の空き名のシートへ（YY.M.D と _2）',()=>{
    const f=runNoDips('a2',8);const want=[{ac:'a2',sheets:[base(),base()+'_2']}];
    return route()==='op-done'&&f.legs.length===8&&JSON.stringify(f.a4)===JSON.stringify(want)&&txt().includes('「'+base()+'_2」')||JSON.stringify(f.a4);
  });
  T('同じ日・同じ機体の次の運航は、既存のシートを確かめて _3',()=>{
    act('root','[data-s=home]');const f=runNoDips('a2',1);return JSON.stringify(f.a4)===JSON.stringify([{ac:'a2',sheets:[base()+'_3']}])||JSON.stringify(f.a4);
  });
  T('機体交代では交代後の機体のファイルへ。その機体でその日最初なら日付だけの名前',()=>{
    act('root','[data-s=home]');const f=runNoDips('a2',1,'a1');
    const ok=JSON.stringify(f.a4)===JSON.stringify([{ac:'a2',sheets:[base()+'_4']},{ac:'a1',sheets:[base()]}]);
    return ok&&memo().includes('決定済み（CURRENT-ACCEPTED）')&&memo().includes('PENDING-S6-FINAL-SAVE-CONTRACT')||JSON.stringify(f.a4);
  });
  T('飛行履歴の詳細にも、A4の飛行記録の保存先が出る',()=>{act('op-open-hist');return route()==='hist-detail'&&txt().includes('A4の飛行記録')&&txt().includes('「'+base()+'」')});
  T('保存に失敗したときは完了へ進まず、同じ運航をもう一度保存する（オフラインとは表示を分ける）',()=>{
    H.hash('scn=personal');A().ui.opSaveFail=true;
    const n=E().flights.length;act('nf-new');act('start-nodips');
    const s=S();s.aircraft=['a2'];s.pilots=['p1'];s.biz=['空撮'];s.air=['上記空域の飛行は行わない'];s.met=['上記方法の飛行は行わない'];s.geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};s.from='自宅';s.to='広場';
    window.nfGo('final');act('nf-nodips-go');act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    const failed=route()==='op-final'&&txt().includes('Google Driveに保存できませんでした')&&!txt().includes('オフラインです')&&E().flights.length===n;
    A().ui.opSaveFail=false;act('op-finalize');
    return failed&&route()==='op-done'&&E().flights.length===n+1&&E().flights[0].synced&&!!E().flights[0].a4;
  });
  T('飛行履歴の通報した内容に、通報時の通報者が出る。人員の名前を変えても書き換えない',()=>{
    H.hash('scn=personal');A().dips.registered=true;act('nf-new');act('nf-layout','[data-v=app]');act('start-new');
    S().aircraft=['a2'];S().pilots=['p1'];S().permit='none';S().biz=['空撮'];S().air=['上記空域の飛行は行わない'];S().met=['上記方法の飛行は行わない'];S().geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};S().from='a';S().to='b';window.nfGo('final');
    act('nf-send-go');if(route()!=='nf-send')return 'route '+route();act('nf-submit');act('nf-to-op');
    act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');
    act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    const me=E().people.find(x=>x.id===E().meId),before=me.name;me.name='名前を変えた本人';act('op-open-hist');act('hist-dips');
    const t=q('.sheet').innerText;return t.includes('通報者')&&t.includes(before)&&!t.includes('名前を変えた本人')||t.slice(0,80);
  });
  T('DIPS Webで確認した計画: 点検へ進めない理由を左側に出し、進める条件は右側でオーナー判断として示す',()=>{
    H.hash('scn=personal');act('nf-new');act('nf-layout','[data-v=app]');act('start-new');
    S().aircraft=['a1'];S().pilots=['p1'];S().permit='none';S().biz=['空撮'];S().air=['上記空域の飛行は行わない'];S().met=['上記方法の飛行は行わない'];S().geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};S().from='a';S().to='b';window.nfGo('final');
    A().apiOk=false;H.APP().render();act('nf-send-go');if(A().modal){act('dips-later')}act('nf-manual-go');act('nf-manual-done');act('nf-mconf','[data-v=list]');act('nf-mconf-ok');
    if(route()!=='nf-accepted')return 'route '+route();
    act('nf-open-list');const p=E().plans.find(x=>x.dips==='manual');act('plan-open','[data-id="'+p.id+'"]');
    return route()==='plan'&&!q('.phone [data-act=plan-to-op]')&&txt().includes('この画面から飛行前点検へは進めません')&&memo().includes('PENDING-S5-MANUAL-LIST')&&memo().includes('オーナー判断が必要な設計論点');
  });
});
