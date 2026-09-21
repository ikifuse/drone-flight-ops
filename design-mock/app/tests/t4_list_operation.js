'use strict';
/* 飛行リスト・DIPS通報内容・通常運航（点検→離陸→着陸→BAT交換／機体交代→飛行後点検→保存） */
suite('飛行リスト・通常運航',H=>{
  const {T,act,txt,route,set,q,qa,A,E,memo}=H;
  const OP=()=>A().op;
  H.hash('scn=empty');
  T('飛行リスト（空）: 案内と新規飛行への導線',()=>{act('go','[data-s=list]');return route()==='list'&&txt().includes('通報済みの計画はまだありません')&&!!q('[data-act=nf-new]')});
  H.hash('scn=company');
  T('飛行リスト: カード（日時・場所・機体・操縦者／通報者・DIPS状態）',()=>{act('go','[data-s=list]');return qa('[data-act=plan-open]').length===3&&txt().includes('操縦者')&&txt().includes('通報者')&&txt().includes('通報済み・重複なし')&&txt().includes('通報済み・重複あり')});
  T('絞り込み: 自分が操縦=2／自分が通報=1／重複あり=1／すべて=3',()=>{
    const n=f=>{act('pl-filter','[data-v='+f+']');return qa('[data-act=plan-open]').length};
    const r=[n('pilot'),n('rep'),n('dup'),n('all')];return JSON.stringify(r)==='[2,1,1,3]'?true:JSON.stringify(r);
  });
  T('カード→DIPS通報内容へ直接（中間の画面なし・大きな［編集］なし）',()=>{act('plan-open');return route()==='plan'&&qa('.rev').length>=23&&txt().includes('DIPSに通報した内容')&&!q('[data-act=edit]')&&!!q('[data-act=plan-to-op]')&&!!q('[data-act=plan-cancel]')});
  T('中止・削除: 確認→飛行リストから外す（通報の履歴は残る）',()=>{const n=E().plans.length;act('plan-cancel');const s=q('.sheet').innerText.includes('DIPS側の取消')&&q('.sheet').innerText.includes('消えません');act('plan-cancel-ok');return s&&route()==='list'&&E().plans.length===n-1});
  T('重複ありの計画: 警告と、調整はまだできない旨',()=>{act('plan-open','[data-id="'+E().plans.find(p=>p.dips==='dup').id+'"]');return txt().includes('重複の調整は、この画面ではまだできません')});
  /* ---- 通常運航（会社: 機体c1はBAT管理ON、c2はOFF） ---- */
  H.hash('scn=company');
  T('通報内容→飛行前点検。対象機体を機種と登録記号で表示',()=>{act('go','[data-s=list]');act('plan-open','[data-id="'+E().plans.find(p=>p.dips==='clean').id+'"]');act('plan-to-op');return route()==='op-pre'&&txt().includes('対象機体')&&txt().includes('JU000000000004')});
  T('点検が済むまで、離陸待機へ進めない。「全部確認済みにする」は右側にあり、左側にはない',()=>q('[data-act=op-pre-done]').disabled&&!q('.phone [data-act=op-pre-all]')&&!!q('#memo [data-act=op-pre-all]'));
  T('11項目を確認しても装着BAT未確認では進めない',()=>{for(let i=0;i<11;i++){qa('[data-act=op-pre-tog]')[i].click()}return qa('[data-act=op-pre-tog]').length===11&&q('[data-act=op-pre-done]').disabled});
  T('装着BATは点検項目より先に表示される',()=>{const a=q('[data-act=op-bat-pick]'),b=q('[data-act=op-pre-tog]');return !!a&&!!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)});
  T('BAT管理ONの機体は、BATを選ぶまで離陸できない',()=>{const dis=q('[data-act=op-pre-done]').disabled;return dis&&qa('[data-act=op-bat-pick]').length===3});
  T('BATを選ぶ→状態確認が必須→選ぶと離陸できる',()=>{act('op-bat-pick');const d1=q('[data-act=op-pre-done]').disabled;act('op-bat-check','[data-v=異常なし]');act('op-pre-done');q('details').open=true;return d1&&route()==='op-standby'&&txt().includes('離陸前の確認')&&txt().includes('通報済み・重複なし')&&!q('[data-act=op-takeoff]').disabled});
  T('離陸→飛行中（ストップウォッチ・着陸ボタン）',()=>{act('op-takeoff');return route()==='op-fly'&&!!q('#sw')&&!!q('[data-act=op-land]')});
  T('着陸→着陸後入力（区間の実績・次の作業の4択）',()=>{act('op-ff');act('op-land');return route()==='op-landed'&&OP().legs.length===1&&OP().legs[0].min>=5&&!!q('[data-act=op-land-confirm]')&&!q('[data-act=op-continue]')});
  T('続行: 同じBATで再離陸',()=>{act('op-land-confirm');act('op-continue');if(route()!=='op-standby'||q('[data-act=op-takeoff]').disabled)return 'BAT lost';act('op-takeoff');act('op-land');return OP().legs.length===2});
  T('BAT交換: 対象機体に使えるBATだけ。異常なら確認を促す',()=>{
    act('op-land-confirm');act('op-to-bat');if(route()!=='op-bat')return route();
    if(qa('[data-act=op-bat-pick]').length!==3)return 'cands';
    act('op-bat-pick','[data-id="'+E().bats[1].id+'"]');act('op-bat-check','[data-v=膨らみあり]');
    if(!txt().includes('このBATを使うかどうかは、よく確認して判断してください'))return 'no warn';
    act('op-simple','[data-i="0"]');act('op-simple','[data-i="1"]');act('op-bat-done');return route()==='op-standby'&&OP().cur.bat.id===E().bats[1].id;
  });
  T('離陸→着陸（3回目・交換後のBAT）',()=>{act('op-takeoff');act('op-land');return OP().legs.length===3&&OP().legs[2].batId===E().bats[1].id});
  T('機体交代: 未点検の機体は飛行前点検へ',()=>{act('op-land-confirm');act('op-to-switch');if(route()!=='op-switch')return route();act('op-switch-pick');return route()==='op-pre'&&OP().ac==='c2'&&q('[data-act=op-pre-done]').disabled});
  T('交代先: BAT管理OFFならBATの選択は不要',()=>{act('op-pre-all');act('op-pre-done');return route()==='op-standby'&&txt().includes('BAT管理がOFF')&&!q('[data-act=op-takeoff]').disabled});
  T('離陸→着陸→終了→飛行後点検（使用した2機分）',()=>{act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');return route()==='op-post'&&qa('.sec h3').length>=3&&q('[data-act=op-to-final]').disabled});
  T('飛行後点検→最終送信・保存の確認画面',()=>{act('op-post-all');set('[data-bind="~notes"]','不具合なし');act('op-to-final');return route()==='op-final'&&txt().includes('確定する内容')&&txt().includes('4回')&&!!q('[data-act=op-finalize]')&&q('[data-act=op-finalize]').textContent.includes('保存する')});
  T('保存（オンライン）→Google Driveに保存。履歴に増え、リストから外れ、BATの履歴が更新される',()=>{
    const nf=E().flights.length,np=E().plans.length,b=E().bats[1],u=b.uses;act('op-finalize');
    return route()==='op-done'&&txt().includes('保存しました')&&txt().includes('Google Driveに保存しました')&&E().flights.length===nf+1&&E().plans.length===np-1&&b.uses===u+1&&b.lastDays===0&&E().flights[0].legs.length===4&&A().op===null;
  });
  /* ---- オフライン保存・警告付き離陸・通報しない飛行 ---- */
  H.hash('scn=personal&online=0');
  T('オフラインで保存→この端末に保存された。まだGoogle Driveに保存されていない旨',()=>{
    act('go','[data-s=list]');act('plan-open');act('plan-to-op');
    act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');
    const warn=txt().includes('オフラインです')&&txt().includes('この端末には保存され');act('op-finalize');
    return warn&&route()==='op-final'&&txt().includes('下書きはこの端末に残っています')&&!!OP()&&E().flights.length===3;
  });
  T('通信が戻ると同じ下書きで再度保存でき、重複行を作らない',()=>{
    const op=OP(),legs=op.legs.length;A().online=true;H.APP().render();act('op-finalize');return route()==='op-done'&&E().flights.length===4&&E().flights[0].legs.length===legs&&E().flights[0].synced;
  });
  H.hash('scn=company');
  T('重複ありの計画はリストでも通常運航へ進めず、内容を保持する',()=>{
    act('go','[data-s=list]');const p=E().plans.find(p=>p.dips==='dup');act('plan-open','[data-id="'+p.id+'"]');
    const hidden=!q('.phone [data-act=plan-to-op]');H.APP().ACTS['plan-to-op']();return hidden&&route()==='plan'&&!A().op&&E().plans.includes(p);
  });
  T('運航をやめる（飛行0回のみ）',()=>{H.hash('scn=company');act('go','[data-s=list]');act('plan-open');act('plan-to-op');act('op-abort');act('op-abort-ok');return route()==='home'&&E().plans.length===3&&A().op===null});
  T('通報しない飛行: 新規飛行→点検→保存（KMLなし）',()=>{
    H.hash('scn=personal');act('nf-new');act('start-nodips');
    const s=H.S();s.aircraft=['a2'];s.pilots=['p1'];s.biz=['空撮'];s.air=['上記空域の飛行は行わない'];s.met=['上記方法の飛行は行わない'];s.geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};s.from='自宅';s.to='広場';
    window.nfGo('final');act('nf-nodips-go');if(route()!=='op-pre')return route();
    act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-pre-all');act('op-pre-done');act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    const f=E().flights[0];return route()==='op-done'&&f.kml==='none'&&f.snap.noDips===true&&txt().includes('通報しない飛行');
  });
});

suite('旧運航UIの継承と保存失敗',H=>{
 const {T,act,q,qa,set,A,E}=H;
 const clickInput=sel=>{q(sel).click();H.scan('実機確認の申告')};
 H.hash('scn=company');act('go','[data-s=list]');act('plan-open');act('plan-to-op');
 T('未確認11項目、実機確認前は全て正常が使えない',()=>qa('[data-act=op-pre-tog]').length===11&&Object.keys(A().op.pre.c1).length===0&&q('.phone [data-act=op-normal]').disabled);
 T('装着BAT・任意サイクル→実機確認→全て正常。異常を外すと待機を止める',()=>{
   act('op-bat-pick','[data-id="'+E().bats[0].id+'"]');act('op-bat-check','[data-v=異常なし]');clickInput('[data-bind="~preObserved"]');act('op-normal','[data-k=pre]');
   const ready=!q('[data-act=op-pre-done]').disabled;act('op-pre-tog','[data-i="2"]');set('[data-bind="~preNotes.c1"]','通信状態を再確認');const blocked=q('[data-act=op-pre-done]').disabled;act('op-pre-tog','[data-i="2"]');act('op-pre-done');return ready&&blocked&&A().route==='op-standby'&&A().op.cur.bat.cycle==='';
 });
 T('離陸前に機体交代し、点検済みへ戻ると正式点検を繰り返さず簡易確認',()=>{
   const before=JSON.stringify(A().op.pre.c1);act('op-to-switch');act('op-switch-pick','[data-id=c2]');const uninspected=A().route==='op-pre';act('op-pre-all');act('op-pre-done');act('op-to-switch');act('op-switch-pick','[data-id=c1]');
   const branch=A().route==='op-standby'&&q('[data-act=op-takeoff]').disabled&&JSON.stringify(A().op.pre.c1)===before;
   act('op-bat-pick','[data-id="'+E().bats[0].id+'"]');act('op-bat-check','[data-v=異常なし]');act('op-simple','[data-i="0"]');const one=q('[data-act=op-takeoff]').disabled;act('op-simple','[data-i="1"]');return uninspected&&branch&&one&&!q('[data-act=op-takeoff]').disabled;
 });
 T('飛行中の利用者ボタンは着陸完了だけ。操作ゼロの案内',()=>{set('[data-bind="~cur.takeoffPlace"]','河川敷');act('op-takeoff');return qa('.phone button').length===1&&q('.phone button').dataset.act==='op-land'&&H.txt().includes('画面操作をせず')});
 T('着陸後に時間訂正・安全影響・BAT所感を入力し、確定して次操作へ',()=>{act('op-land');set('[data-bind="~last.min"]','7');set('[data-bind="~last.place"]','広場');set('[data-bind="~last.note"]','突風あり');set('[data-bind="~last.batInfo.note"]','残量を確認');const before=!q('[data-act=op-to-post]');act('op-land-confirm');return before&&A().route==='op-next'&&A().op.last.min===7&&A().op.last.takeoffPlace==='河川敷'&&qa('.next-actions button').length===4});
 T('BAT交換は2項目の簡易確認を両方行うまで待機に戻れない',()=>{act('op-to-bat');act('op-bat-pick','[data-id="'+E().bats[0].id+'"]');act('op-bat-check','[data-v=異常なし]');const zero=q('[data-act=op-bat-done]').disabled;act('op-simple','[data-i="0"]');const one=q('[data-act=op-bat-done]').disabled;act('op-simple','[data-i="1"]');act('op-bat-done');return zero&&one&&A().route==='op-standby'&&A().op.legs.length===1});
 T('飛行後点検は実際に飛ばした機体だけ。未飛行の交代先を含めない',()=>{act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');return qa('[data-act=op-post-tog]').length===4&&qa('[data-act=op-post-tog][data-a=c2]').length===0&&q('[data-act=op-to-final]').disabled&&q('[data-act=op-normal]').disabled});
 T('全機体の実機確認後だけ全て正常。異常は特記事項を付けて保持',()=>{clickInput('[data-bind="~postObserved"]');act('op-normal','[data-k=post]');act('op-post-tog','[data-a=c1][data-i="2"]');const blocked=q('[data-act=op-to-final]').disabled;set('[data-bind="~notes"]','1号機の発熱を確認。冷却して保管');act('op-to-final');return blocked&&A().route==='op-final'&&A().op.post.c1[2]===false});
 T('途中では履歴・BAT履歴に書き込まない。失敗時は全下書きが残る',()=>{
   const n=E().flights.length,u=E().bats[0].uses,draft=A().op;act('op-save-fail','[data-v="1"]');act('op-finalize');return E().flights.length===n&&E().bats[0].uses===u&&A().op===draft&&draft.legs.length===2&&draft.saveError;
 });
 T('再試行は最後の1操作で各飛行行・BAT履歴・点検を保存する',()=>{const n=E().flights.length,u=E().bats[0].uses;act('op-save-fail','[data-v="0"]');act('op-finalize');const f=E().flights[0];H.APP().ACTS['op-finalize']();return E().flights.length===n+1&&E().bats[0].uses===u+2&&f.legs.length===2&&f.legs[0].min===7&&f.legs[0].batInfo.note==='残量を確認'&&f.post.c1[2]===false&&!A().op});
});
