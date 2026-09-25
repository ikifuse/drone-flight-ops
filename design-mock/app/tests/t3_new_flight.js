'use strict';
/* 新規飛行: 何も登録がない状態から、その場で登録して進む。送信の結果・DIPS Webでの通報・通報しない飛行 */
suite('新規飛行',H=>{
  const {T,act,txt,all,route,set,q,qa,A,E,S,memo}=H;
  const page=()=>S()&&S().cur;
  const next=()=>act('nf-next');
  H.hash('scn=empty');
  T('ホーム→新規飛行（何も登録がない状態）: まず足りない設定を示す',()=>{
    act('nf-new');
    return route()==='nf-need'&&txt().includes('飛行を始めるために必要な設定がまだありません');
  });
  T('［このまま進む］で新規飛行へ。過去の飛行・現場プリセットの空の案内',()=>{act('nf-need-go');return route()==='nf'&&page()==='start'&&txt().includes('複製できる過去の飛行がまだありません')&&txt().includes('現場プリセットはまだありません')});
  T('使うもの: 機体・操縦者・許可の未登録の案内と、その場で登録するボタン',()=>{act('nf-layout','[data-v=app]');act('start-new');return page()==='use'&&txt().includes('登録された機体がありません')&&txt().includes('操縦者として登録された人がいません')&&qa('[data-act=nf-reg]').length===3});
  T('事前に設定へ行かなくても、次へ進める',()=>!q('[data-act=nf-next]').disabled);
  T('その場で機体を登録→元の新規飛行へ戻り、選ばれた状態',()=>{
    act('nf-reg','[data-t=aircraft]');if(route()!=='reg-aircraft')return 'route '+route();
    if(!txt().includes('新規飛行')||!txt().includes('途中です'))return 'banner';
    set('[data-bind="@d.mark"]','JU-NF-001');set('[data-bind="@d.name"]','その場の機体');act('reg-save');
    return route()==='nf'&&page()==='use'&&S().aircraft.length===1&&E().aircraft.length===1&&txt().includes('その場の機体')&&qa('.card.sel').length>=1;
  });
  T('その場で操縦者を登録（役割は操縦者が初期値）',()=>{
    act('nf-reg','[data-t=person]');if(route()!=='reg-person'||!A().reg.d.roles.includes('操縦者'))return 'form';
    set('[data-bind="@d.name"]','その場の操縦者');act('reg-save');
    return route()==='nf'&&S().pilots.length===1&&E().people.length===2&&E().people.find(p=>p.name==='その場の操縦者').pilot;
  });
  T('自分を操縦者にして選ぶ（明示の操作）',()=>{const before=E().people.find(p=>p.id===E().meId).pilot;act('nf-me-pilot');return before===false&&E().people.find(p=>p.id===E().meId).pilot&&S().pilots.length===2});
  T('その場で許可を登録（機体が初期選択）',()=>{
    act('nf-reg','[data-t=permit]');if(!A().reg.d.aircraft.length)return 'aircraft not prefilled';
    set('[data-bind="@d.no"]','国空航第NF号');act('reg-tog','[data-k=cover][data-v=DID]');act('reg-save');
    return route()==='nf'&&S().permit===E().permits[0].id&&E().permits.length===1;
  });
  T('キャンセルすると新規飛行に戻り、何も増えない',()=>{act('nf-reg','[data-t=aircraft]');act('reg-cancel');return route()==='nf'&&page()==='use'&&E().aircraft.length===1});
  T('飛行の内容: 選択と排他（DIPSの表記どおり）',()=>{
    next();if(page()!=='content')return 'page '+page();
    act('tog-purpose','[data-g=biz][data-v=空撮]');act('tog-air','[data-v="上記空域の飛行は行わない"]');act('tog-met','[data-v="上記方法の飛行は行わない"]');act('tog-met','[data-v=夜間飛行]');
    const s=S();return s.biz.includes('空撮')&&s.air.length===1&&s.met.includes('夜間飛行')&&!s.met.includes('上記方法の飛行は行わない')&&['飛行目的','飛行空域','飛行方法','立入管理措置','係留飛行','補助者人数'].every(x=>txt().includes(x));
  });
  T('飛行範囲: 作図→完了→出発地・目的地。DIPSの項目名のまま',()=>{
    next();if(page()!=='area')return 'page '+page();
    act('tool','[data-k=polygon]');window.mapTap(80,90);window.mapTap(240,80);window.mapTap(265,165);act('geom-done');
    set('[data-bind=from]','事務所');set('[data-bind=to]','現場A');return S().geom.done&&txt().includes('多角形: 3点')&&txt().includes('出発地')&&txt().includes('目的地');
  });
  T('範囲の画面から現場プリセットとして保存→戻る',()=>{
    act('nf-save-preset');if(route()!=='reg-preset'||!A().reg.d.geom.done)return 'form';
    set('[data-bind="@d.name"]','その場のプリセット');act('reg-save');
    return route()==='nf'&&page()==='area'&&E().presets.length===1&&txt().includes('その場のプリセット');
  });
  T('日時・高度: 終了日時は自動計算（DIPSの項目名）',()=>{
    next();if(page()!=='time')return 'page';const before=q('input[disabled]').value;set('[data-bind=durH]','2');
    return q('input[disabled]').value!==before&&['開始日時','終了日時','所要時間','飛行速度','飛行高度','最大飛行時間'].every(x=>txt().includes(x));
  });
  T('登録済み情報: 保険・連絡先が未登録の案内。保険をその場で登録',()=>{
    next();if(page()!=='master'||!txt().includes('保険が未登録です')||!txt().includes('連絡先が未登録です'))return 'text';
    act('nf-reg','[data-t=insurance]');set('[data-bind="@d.company"]','その場の保険');act('reg-save');
    return route()==='nf'&&S().ins.mode==='auto'&&E().insurance.company==='その場の保険'&&txt().includes('保険に関する情報');
  });
  T('連絡先: 入力して登録しておく→次回から自動入力',()=>{
    set('[data-bind="contact.name"]','その場の連絡先');set('[data-bind="contact.phone"]','09012345678');
    set('[data-bind="contact.addr"]','○○県○○市1-2-3');set('[data-bind="contact.email"]','name@example.com');
    act('nf-save-contact');
    return !!E().contact&&E().contact.name==='その場の連絡先'&&E().contact.addr==='○○県○○市1-2-3'&&txt().includes('連絡先');
  });
  T('内容確認: 計画名称・DIPS項目が並び、DIPS項目順にも切り替えられる',()=>{
    next();if(page()!=='review'||!txt().includes('計画名称')||!txt().includes('飛行許可番号'))return 'text';
    act('rv','[data-v=dips]');const n=qa('.rev .k').length;act('rv','[data-v=screen]');return n>=22;
  });
  T('通報の直前: 通報の主操作は「アプリからDIPSへ送信する」と「DIPS Webで通報する」',()=>{
    next();if(page()!=='final')return 'page';
    const a=q('[data-act=nf-send-go]').textContent,b=q('[data-act=nf-manual-go]').textContent;
    return a.includes('アプリからDIPSへ送信する')&&b.includes('DIPS Webで通報する')&&!/\bManual\b/.test(a+b)&&!/\bOptional\b/.test(a+b);
  });
  /* ---- 送信の結果 ---- */
  T('DIPSのログイン情報が未登録: ［アプリからDIPSへ送信する］→ 足りないものを補う案内。入力した飛行計画は残っている',()=>{
    if(A().dips.registered)return 'already registered';
    const name=S().planName;act('nf-send-go');const sh=q('.phone .sheet');
    return route()==='nf'&&!!sh&&sh.innerText.includes('通報に必要な情報が足りません')&&sh.innerText.includes('DIPSのログイン情報')&&sh.innerText.includes('まだ登録されていません')
      &&sh.innerText.includes('入力した飛行計画は、そのまま残っています')&&sh.innerText.includes('今設定する')&&sh.innerText.includes('あとで行う')&&S().planName===name
      &&!sh.innerText.includes('住所');
  });
  T('［あとで行う］→ 通報の直前へ戻る。飛行計画はそのまま残る（行き止まりにしない）',()=>{
    const n=S().aircraft.length;act('dips-later');return route()==='nf'&&page()==='final'&&!q('.phone .sheet')&&S().aircraft.length===n&&!!q('[data-act=nf-manual-go]');
  });
  T('［今設定する］→ その場で登録 → 元の飛行計画（通報の直前）へ戻る。登録後は送信へ進める',()=>{
    act('nf-send-go');act('dips-now');
    if(route()!=='set-dipscred'||!txt().includes('「新規飛行」の途中です')||!q('.phone [data-act=dips-save]').textContent.includes('登録して戻る'))return 'form '+route();
    set('[data-bind="#dform.id"]','1234567890','input');set('[data-bind="#dform.pw"]','Abc-123-xyz','input');act('dips-save');
    if(route()!=='nf'||page()!=='final'||!A().dips.registered||S().aircraft.length!==1)return 'back '+route()+' '+page();
    act('nf-send-go');return route()==='nf-send';
  });
  T('通報内容確認→左側の通報操作で正常受付へ進める。異常系の切替は右側',()=>{
    return route()==='nf-send'&&!!q('.phone [data-act=nf-submit]')&&qa('.phone [data-act=nf-result]').length===0&&qa('#memo [data-act=nf-result]').length===4&&memo().includes('DIPSが返す結果');
  });
  T('通報確認から直す→同じ計画へ戻り、再度通報確認できる',()=>{
    const name=S().planName;act('jump');const ok=route()==='nf'&&S().planName===name;
    window.nfGo('final');act('nf-send-go');return ok&&route()==='nf-send';
  });
  T('正常受付・重複なし→通報完了。飛行リストに載る。KMLはGoogle Driveに保存',()=>{
    const n=E().plans.length;act('nf-result','[data-k=clean]');const pl=E().plans[0];
    return route()==='nf-accepted'&&txt().includes('通報完了・重複なし')&&E().plans.length===n+1&&pl.dips==='clean'&&pl.kml==='saved'&&txt().includes('「出力」フォルダーに保存しました')&&!!q('[data-act=nf-later]')&&!!q('[data-act=nf-to-op]');
  });
  T('後で飛行する→ホーム（計画はリストに残る）',()=>{act('nf-later');return route()==='home'&&E().plans.length===1});
  /* 結果不明の通報が残っているときは、新規飛行でまず確認を促す（33b）。ここでは［新しい飛行計画を作る］で進む */
  function newNf(){act('nf-new');if(q('[data-act=nf-new][data-skip]'))act('nf-new','[data-skip]')}
  function toFinal(){newNf();act('nf-layout','[data-v=app]');act('start-new');S().aircraft=[E().aircraft[0].id];S().pilots=[E().people.find(p=>p.pilot).id];S().permit='none';S().biz=['空撮'];S().air=['上記空域の飛行は行わない'];S().met=['上記方法の飛行は行わない'];S().geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};S().from='a';S().to='b';window.nfGo('final')}
  T('重複あり→通報済み・重複あり（調整はまだできない旨）',()=>{toFinal();act('nf-send-go');act('nf-result','[data-k=dup]');return txt().includes('通報済み・重複あり')&&txt().includes('重複の調整は、この画面ではまだできません')&&E().plans[0].dips==='dup'});
  T('結果不明→通常の通報済みにしない。自動で再送しない。次の操作が分かる',()=>{
    const n=E().plans.length;H.APP().root('home');toFinal();act('nf-send-go');act('nf-result','[data-k=unknown]');
    const t=txt();return t.includes('結果不明')&&t.includes('自動で再送もしません')&&t.includes('DIPS Webの飛行計画一覧で、登録されているか確認する')&&E().plans.length===n;
  });
  /* 13b・33b: 結果不明のあとは、DIPS Webで確かめた結果（登録されていた／いなかった）を記録する。手動通報の入力支援へは送らない */
  T('結果不明→DIPS Webで確かめた結果を選ぶ（登録されていた／いなかった）。手動通報の画面へは進まない',()=>!!q('.phone [data-act=nf-recon][data-v=reg]')&&!!q('.phone [data-act=nf-recon][data-v=none]')&&!q('.phone [data-act=nf-manual-go]')&&!!q('.phone [data-act=nf-open-dips]'));
  T('エラー→内容を直して再送（確認画面へ戻る）。内容は残っている旨',()=>{
    H.APP().root('home');toFinal();act('nf-send-go');act('nf-result','[data-k=err]');
    const ok=txt().includes('受け付けられませんでした')&&txt().includes('内容を直して、もう一度送信してください');act('nf-fix');return ok&&route()==='nf'&&page()==='review';
  });
  /* ---- DIPS Webで通報する ---- */
  T('アプリから送信できないとき: DIPS Webで通報する（DIPSの入力順・22項目・地図）',()=>{
    H.APP().root('home');toFinal();A().apiOk=false;H.APP().render();
    act('nf-send-go');const stay=route()==='nf';act('nf-manual-go');
    return stay&&route()==='nf-manual'&&qa('.rev').length>=23&&txt().includes('コピーして貼る')&&q('.ttl').innerText.includes('DIPS Webで通報する');
  });
  T('「手動通報した」と「DIPSで確認できた」を別々に記録→計画が飛行リストへ',()=>{
    const n=E().plans.length;act('nf-manual-done');if(route()!=='nf-manual-confirm')return 'route';
    if(!q('[data-act=nf-mconf-ok]').disabled)return 'enabled before choice';
    act('nf-mconf','[data-v=list]');act('nf-mconf-ok');
    return route()==='nf-accepted'&&txt().includes('通報確認済み')&&E().plans.length===n+1&&E().plans[0].dips==='manual';
  });
  T('オフライン: 送信できない。DIPS Webを開けない。通報の内容は端末に残っている旨',()=>{
    H.APP().root('home');toFinal();A().apiOk=true;A().online=false;H.APP().render();
    const warn=txt().includes('オフラインです')&&txt().includes('通報の内容は、この端末に残っています');act('nf-send-go');const stay=route()==='nf';
    act('nf-manual-go');const dis=q('[data-act=nf-open-dips]').disabled;A().online=true;return warn&&stay&&route()==='nf-manual'&&dis;
  });
  T('Google Driveが閲覧のみ: 送信できない',()=>{H.APP().root('home');toFinal();A().gAccess='view';H.APP().render();act('nf-send-go');const stay=route()==='nf';A().gAccess='edit';return stay});
  /* ---- 通報しない飛行 ---- */
  T('通報しない飛行: 日時・保険・連絡先を飛ばし、通報の選択肢がない',()=>{
    H.APP().root('home');newNf();act('start-nodips');
    const ps=window.pages().map(p=>p.key);const skip=S().noDips&&!ps.includes('time')&&!ps.includes('master')&&ps.includes('review');
    window.nfGo('final');return skip&&txt().includes('DIPSへ通報しません')&&!txt().includes('アプリからDIPSへ送信する')&&!!q('[data-act=nf-nodips-go]');
  });
  T('DIPSの22項目は、各画面にちょうど1回ずつ割り当てられている',()=>{const c=window.coverage();return c.ok===22&&c.missing.length===0&&c.dup.length===0});
  /* ---- 既存の機能 ---- */
  H.hash('scn=personal');
  T('過去の飛行を複製／現場プリセットから始める',()=>{
    newNf();act('nf-layout','[data-v=app]');act('start-past');const a=page()==='use'&&S().aircraft.length===1&&S().auto.aircraft.includes('前回')&&S().geom.done;
    H.APP().root('home');newNf();act('nf-layout','[data-v=app]');act('start-preset');return a&&page()==='use'&&S().auto.area==='現場プリセット'&&S().alt===30;
  });
  T('抹消済み機体・期限切れ許可は選べない。許可の照合の目安が出る',()=>{
    act('pick-ac','[data-id=a3]');act('pick-pm','[data-id=m0]');const blocked=!S().aircraft.includes('a3')&&S().permit!=='m0';
    act('pick-ac','[data-id=a1]');act('pick-pm','[data-id=m2]');next();act('tog-met','[data-v=夜間飛行]');
    return blocked&&txt().includes('許可書を確認してください');
  });
  T('並び替え（設計確認用。右側から開く）: 順序・まとめる・省く',()=>{
    act('flow');const b=qa('.mockov [data-act=mv]').length;const inPhone=!!q('.phone .mockov');act('mv','[data-i="0"][data-d="1"]');const first=S().flow[0].id;act('sk','[data-i="4"]');act('mclose');
    const ps=window.pages().map(p=>p.key);const ok=b>0&&!inPhone&&first==='content'&&!ps.includes('master');act('flow');act('flow-reset');act('mclose');return ok;
  });
  T('カレンダー（複数日）／仮データで全部埋める（右側の操作）',()=>{
    window.nfGo('time');act('cal');act('cal-day','[data-d]:not([disabled])');const ok=S().multi.length===1;act('close');
    H.APP().root('home');newNf();act('fill');return ok&&page()==='review'&&txt().includes('大きな不足はありません');
  });
  T('使う場所を切り替えると、入力途中の内容は破棄される',()=>{H.APP().ACTS['ob-normal']();qa('[data-act=env-pick]')[1].click();return route()==='home'&&S()===null});
});

suite('DIPS iPhone基準候補',H=>{
 const {T,act,q,qa,S,A,E}=H;
 H.hash('scn=personal');act('nf-new');act('start-new');
 T('標準はDIPS順の22項目・白地縦1列。計画名称は先頭',()=>S().cur==='dips'&&qa('[data-dips-item]').map(e=>+e.dataset.dipsItem).join(',')===Array.from({length:22},(_,i)=>i+1).join(',')&&q('[data-dips-item="1"] input').value===S().planName);
 for(const n of [2,4,5])T('登録済み一覧を開き、選択して元へ反映 '+n,()=>{
   act('dips-picker','[data-n="'+n+'"]');const before=JSON.stringify([S().permit,S().aircraft,S().pilots]);act('dips-pick',':not([disabled])');const deferred=JSON.stringify([S().permit,S().aircraft,S().pilots])===before;act('dips-pick-done');return deferred&&!q('.phone .sheet')&&S().cur==='dips'&&q('[data-dips-item="'+n+'"] .selected-summary').textContent.trim()!=='';
 });
 T('選択のキャンセルは元の値を変えない',()=>{const before=S().aircraft.slice();act('dips-picker','[data-n="4"]');act('dips-pick',':not([disabled])');act('close');return JSON.stringify(S().aircraft)===JSON.stringify(before)});
 T('比較は右側だけにあり、入力値を引き継ぐ',()=>{const name=S().planName;act('nf-layout','[data-v=app]');const a=S().layout==='app'&&!q('.phone [data-act=nf-layout]');act('nf-layout','[data-v=dips]');act('start-new');return a&&S().planName===name&&S().cur==='dips'});
 T('地図を独立した画面で開き、次の確認画面へ戻る',()=>{act('nf-next');const a=S().cur==='area'&&!!q('.dips-map #map');act('tool','[data-k=polygon]');window.mapTap(60,60);window.mapTap(240,60);window.mapTap(180,180);act('geom-done');act('nf-next');return a&&S().cur==='review'&&S().geom.done});
 for(const kind of ['clean','dup','unknown','err','manual'])T('通常運航への接続を受付結果で制限 '+kind,()=>{
   H.hash('scn=personal');act('nf-new');act('fill');window.nfGo('final');act('nf-send-go');
   if(kind==='manual'){act('nf-send-back');act('nf-manual-go');act('nf-manual-done');act('nf-mconf','[data-v=list]');act('nf-mconf-ok')}else act('nf-result','[data-k='+kind+']');
   const before=JSON.stringify(S());const show=!!q('.phone [data-act=nf-to-op]');H.APP().ACTS['nf-to-op']();
   return kind==='clean'?show&&A().route==='op-pre':!show&&!A().op&&JSON.stringify(S())===before;
 });
});


suite('個人の本人操縦者の初期値',H=>{
 const {T,act,S,A,E,q}=H;
 const start=()=>{act('nf-new');act('start-new')};
 T('個人・登録済み本人は自動選択。選択画面を開かず次へ進める',()=>{
  H.hash('scn=personal');start();
  const ok=S().pilots.join()===E().meId&&q('[data-dips-item="5"]').textContent.includes('操縦者を変更する')&&!A().modal;
  act('nf-next');return ok&&S().cur==='area'&&!window.issues().some(x=>x.text==='操縦者が選ばれていません');
 });
 T('別人に変更でき、再描画・前後移動で本人へ戻さない',()=>{
  window.nfGo('dips');act('dips-picker','[data-n="5"]');act('dips-pick','[data-id="'+E().meId+'"]');act('dips-pick','[data-id=p2]');act('dips-pick-done');
  act('nf-next');act('nf-back');H.APP().render();return S().pilots.join()==='p2'&&!S().auto.pilots;
 });
 T('次の新規飛行でも本人を自動選択し、毎回の明示選択を要求しない',()=>{
  H.APP().root('home');start();return S().pilots.join()===E().meId&&!A().modal;
 });
 for(const condition of ['未登録','無効','本人不明','アカウント不一致','未ログイン'])T('本人を自動選択しない: '+condition,()=>{
  H.hash('scn=personal');const me=E().people.find(p=>p.id===E().meId);
  if(condition==='未登録'){me.pilot=false;me.roles=['管理者']}
  if(condition==='無効')me.active=false;
  if(condition==='本人不明')E().meId=null;
  if(condition==='アカウント不一致')me.account='other@example.invalid';
  if(condition==='未ログイン')A().account=null;
  start();const ok=S().pilots.length===0;
  act('dips-picker','[data-n="5"]');act('dips-pick','[data-id=p2]');act('dips-pick-done');
  return ok&&S().pilots.join()==='p2'&&(condition!=='未登録'||!me.pilot);
 });
 for(const kind of ['company','school'])T('会社・団体は本人が操縦者でも自動選択せず別人を選べる: '+kind,()=>{
  H.hash('scn=company');E().kind=kind;start();const ok=S().pilots.length===0;
  act('dips-picker','[data-n="5"]');act('dips-pick','[data-id=q2]');act('dips-pick-done');return ok&&S().pilots.join()==='q2'&&E().meId==='q1';
 });
 T('個人の事務担当は操縦者役割を付与されず、実操縦者を選べる',()=>{
  H.hash('scn=personal');const me=E().people.find(p=>p.id===E().meId);me.pilot=false;me.roles=['管理者'];start();
  act('dips-picker','[data-n="5"]');act('dips-pick','[data-id=p2]');act('dips-pick-done');return !me.pilot&&S().pilots.join()==='p2'&&E().meId!==S().pilots[0];
 });
 T('比較レイアウトでも初期選択を表示し、別人に変更できる',()=>{
  H.hash('scn=personal');start();act('nf-layout','[data-v=app]');act('start-new');
  const ok=!!q('[data-act=pick-pl][data-id=p1].sel');act('pick-pl','[data-id=p1]');act('pick-pl','[data-id=p2]');return ok&&S().pilots.join()==='p2';
 });
});
