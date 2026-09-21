'use strict';
/* 飛行リスト・DIPS通報内容・通常運航（点検→離陸→着陸→BAT交換／機体交代→飛行後点検→保存） */
suite('飛行リスト・通常運航',H=>{
  const {T,act,txt,route,set,q,qa,A,E}=H;
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
  T('通報内容→飛行前点検。対象機体を機種と登録記号で表示',()=>{act('go','[data-s=list]');act('plan-open','[data-id="'+E().plans.find(p=>p.dips==='clean').id+'"]');act('plan-to-op');return route()==='op-pre'&&txt().includes('対象機体')&&txt().includes('JU-SAMPLE-K01')});
  T('点検が済むまで、離陸待機へ進めない',()=>q('[data-act=op-pre-done]').disabled);
  T('点検項目を1つずつ確認→全部済むと進める',()=>{for(let i=0;i<8;i++){qa('[data-act=op-pre-tog]')[i].click()}return !q('[data-act=op-pre-done]').disabled});
  T('離陸待機: 離陸前の確認（通報・許可・点検・空域・気象）',()=>{act('op-pre-done');return route()==='op-standby'&&txt().includes('離陸前の確認')&&txt().includes('通報済み・重複なし')&&txt().includes('アプリは判断しません')});
  T('BAT管理ONの機体は、BATを選ぶまで離陸できない',()=>{const dis=q('[data-act=op-takeoff]').disabled;return dis&&qa('[data-act=op-bat-pick]').length===3});
  T('BATを選ぶ→状態確認が必須→選ぶと離陸できる',()=>{act('op-bat-pick');const d1=q('[data-act=op-takeoff]').disabled;act('op-bat-check','[data-v=異常なし]');return d1&&!q('[data-act=op-takeoff]').disabled});
  T('離陸→飛行中（ストップウォッチ・着陸ボタン）',()=>{act('op-takeoff');return route()==='op-fly'&&!!q('#sw')&&!!q('[data-act=op-land]')});
  T('着陸→着陸後入力（区間の実績・次の作業の4択）',()=>{act('op-ff');act('op-land');return route()==='op-landed'&&OP().legs.length===1&&OP().legs[0].min>=5&&qa('.actbar .btn').length===4});
  T('続行: 同じBATで再離陸',()=>{act('op-continue');if(route()!=='op-standby'||q('[data-act=op-takeoff]').disabled)return 'BAT lost';act('op-takeoff');act('op-land');return OP().legs.length===2});
  T('BAT交換: 対象機体に使えるBATだけ。異常なら確認を促す',()=>{
    act('op-to-bat');if(route()!=='op-bat')return route();
    if(qa('[data-act=op-bat-pick]').length!==3)return 'cands';
    act('op-bat-pick','[data-id="'+E().bats[1].id+'"]');act('op-bat-check','[data-v=膨らみあり]');
    if(!txt().includes('このBATを使うかどうかは、よく確認して判断してください'))return 'no warn';
    act('op-bat-done');return route()==='op-standby'&&OP().cur.bat.id===E().bats[1].id;
  });
  T('離陸→着陸（3回目・交換後のBAT）',()=>{act('op-takeoff');act('op-land');return OP().legs.length===3&&OP().legs[2].batId===E().bats[1].id});
  T('機体交代: 未点検の機体は飛行前点検へ',()=>{act('op-to-switch');if(route()!=='op-switch')return route();act('op-switch-pick');return route()==='op-pre'&&OP().ac==='c2'&&q('[data-act=op-pre-done]').disabled});
  T('交代先: BAT管理OFFならBATの選択は不要',()=>{act('op-pre-all');act('op-pre-done');return route()==='op-standby'&&txt().includes('BAT管理がOFF')&&!q('[data-act=op-takeoff]').disabled});
  T('離陸→着陸→終了→飛行後点検（使用した2機分）',()=>{act('op-takeoff');act('op-land');act('op-to-post');return route()==='op-post'&&qa('.sec h3').length>=3&&q('[data-act=op-to-final]').disabled});
  T('飛行後点検→最終送信・保存の確認画面',()=>{act('op-post-all');set('[data-bind="~notes"]','不具合なし');act('op-to-final');return route()==='op-final'&&txt().includes('確定する内容')&&txt().includes('4回')&&!!q('[data-act=op-finalize]')&&q('[data-act=op-finalize]').textContent.includes('保存する')});
  T('保存（オンライン）→Google Driveに保存。履歴に増え、リストから外れ、BATの履歴が更新される',()=>{
    const nf=E().flights.length,np=E().plans.length,b=E().bats[1],u=b.uses;act('op-finalize');
    return route()==='op-done'&&txt().includes('保存しました')&&txt().includes('Google Driveに保存しました')&&E().flights.length===nf+1&&E().plans.length===np-1&&b.uses===u+1&&b.lastDays===0&&E().flights[0].legs.length===4&&A().op===null;
  });
  /* ---- オフライン保存・警告付き離陸・通報しない飛行 ---- */
  H.hash('scn=personal&online=0');
  T('オフラインで保存→この端末に保存された。まだGoogle Driveに保存されていない旨',()=>{
    act('go','[data-s=list]');act('plan-open');act('plan-to-op');
    act('op-pre-all');act('op-pre-done');act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-takeoff');act('op-land');act('op-to-post');act('op-post-all');act('op-to-final');
    const warn=txt().includes('オフラインです')&&txt().includes('この端末には保存され');act('op-finalize');
    return warn&&route()==='op-done'&&txt().includes('この端末に保存しました')&&txt().includes('まだGoogle Driveには保存されていません')&&E().flights[0].synced===false;
  });
  T('保存状態の画面に出て、通信が戻ると「もう一度保存する」で保存できる',()=>{
    A().online=true;H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-sync]');
    const has=txt().includes('保存されていません')&&txt().includes(E().flights[0].label);act('sync-now');return has&&E().flights.every(f=>f.synced);
  });
  H.hash('scn=company');
  T('重複ありの計画で離陸: 警告→確認して離陸を記録（拒否しない）',()=>{
    act('go','[data-s=list]');act('plan-open','[data-id="'+E().plans.find(p=>p.dips==='dup').id+'"]');act('plan-to-op');
    act('op-pre-all');act('op-pre-done');act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');
    act('op-takeoff');const sheet=!!q('.sheet')&&q('.sheet').innerText.includes('警告があります');act('op-takeoff-ok');return sheet&&route()==='op-fly';
  });
  T('運航をやめる（飛行0回のみ）',()=>{H.hash('scn=company');act('go','[data-s=list]');act('plan-open');act('plan-to-op');act('op-abort');act('op-abort-ok');return route()==='home'&&E().plans.length===3&&A().op===null});
  T('通報しない飛行: 新規飛行→点検→保存（KMLなし）',()=>{
    H.hash('scn=personal');act('nf-new');act('start-nodips');
    const s=H.S();s.aircraft=['a2'];s.pilots=['p1'];s.biz=['空撮'];s.air=['上記空域の飛行は行わない'];s.met=['上記方法の飛行は行わない'];s.geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};s.from='自宅';s.to='広場';
    window.nfGo('final');act('nf-nodips-go');if(route()!=='op-pre')return route();
    act('op-pre-all');act('op-pre-done');act('op-bat-pick');act('op-bat-check','[data-v=異常なし]');act('op-takeoff');act('op-land');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    const f=E().flights[0];return route()==='op-done'&&f.kml==='none'&&f.snap.noDips===true&&txt().includes('通報しない飛行');
  });
});
