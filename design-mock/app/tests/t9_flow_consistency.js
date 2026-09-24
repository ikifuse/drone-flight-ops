'use strict';
/* 既存仕様の境界を主フローの前後でも守る。外部通信・本番権限表は扱わない。 */
suite('下書き・保存状態・記録の一貫性',H=>{
 const {T,A,E,S,act,set,q,txt,route}=H;
 const app=()=>H.APP(),me=()=>E().people.find(p=>p.id===E().meId);
 const members=()=>{app().root('home');act('go','[data-s=set]');act('go','[data-s=set-members]')};
 const edit=id=>act('reg-open','[data-t=person][data-id="'+id+'"]');
 T('明示保存した飛行計画はホームから入力位置・内容を再開できる',()=>{
  H.hash('scn=personal');act('nf-new');act('start-new');S().to='継続する現場';S().geom={kind:'circle',pts:[[40,50]],r:100,done:true};
  S().cur='final';app().render();const before=JSON.stringify(S());act('nf-draft');
  if(route()!=='home')return false;act('nf-new');act('nf-resume-draft');return route()==='nf'&&JSON.stringify(S())===before;
 });
 T('下書き取消のキャンセルは内容を残し、明示取消だけが新規へ戻す',()=>{
  const plans=JSON.stringify(E().plans);app().root('home');act('nf-new');act('nf-discard-draft');act('close');
  const kept=!!E().planDraft;act('nf-new');act('nf-discard-draft');act('nf-discard-draft-ok');return kept&&!E().planDraft&&S().cur==='start'&&JSON.stringify(E().plans)===plans;
 });
 T('他の利用先で個人の保存下書きを開かない',()=>{
  H.hash('scn=company');const first=E();first.planDraft=app().mk.blankNF(first);first.planDraft.to='個別現場';
  const other=app().mk.samplePersonalEnv(A().account);A().envs.push(other);act('env');act('env-pick','[data-id="'+other.id+'"]');act('nf-new');
  const ok=!q('[data-act=nf-resume-draft]');app().root('home');act('env');act('env-pick','[data-id="'+first.id+'"]');app().root('home');act('nf-new');act('nf-resume-draft');return ok&&S().to==='個別現場';
 });
 T('別の通報済み計画を開始しても新規計画の保存下書きを消さない',()=>{
  H.hash('scn=personal');E().planDraft=app().mk.blankNF(E());E().planDraft.to='後で計画する現場';act('go','[data-s=list]');act('plan-open');act('plan-to-op');return route()==='op-pre'&&!!E().planDraft&&E().planDraft.to==='後で計画する現場';
 });
 T('本人編集から最後の管理者を解除できず、入力は残る',()=>{
  H.hash('scn=personal');members();edit(E().meId);act('reg-tog','[data-v=管理者]');act('reg-save');return route()==='reg-person'&&me().roles.includes('管理者')&&!A().reg.d.roles.includes('管理者');
 });
 T('最後の管理者を離任させない',()=>{
  act('reg-cancel');edit(E().meId);act('person-leave');act('person-leave-ok');return me().active!==false&&!!A().modal;
 });
 T('別の管理者を登録後なら本人の管理者解除ができる',()=>{
  act('close');act('reg-cancel');act('reg-open','[data-t=person]:not([data-id])');set('[data-bind="@d.name"]','別の管理担当');act('reg-tog','[data-v=管理者]');act('reg-save');
  edit(E().meId);act('reg-tog','[data-v=管理者]');act('reg-save');return route()==='set-members'&&!me().roles.includes('管理者');
 });
 T('Google編集権限だけで管理者へ自己昇格できない',()=>{
  edit(E().meId);act('reg-tog','[data-v=管理者]');act('reg-save');return route()==='reg-person'&&!me().roles.includes('管理者');
 });
 T('再所属は同じ人物・過去実績を維持し、以前の役割を復活させない',()=>{
  H.hash('scn=personal');const p=E().people.find(x=>x.id!==E().meId&&x.pilot);const id=p.id,fl=JSON.stringify(E().flights);members();edit(id);act('person-leave');act('person-leave-ok');edit(id);act('person-rejoin');
  return p.id===id&&p.active&&p.roles.length===0&&!p.pilot&&JSON.stringify(E().flights)===fl;
 });
 for(const access of ['view','none'])T('Drive書込不可で本人編集・離任・再所属の保存を迂回できない: '+access,()=>{
  H.hash('scn=personal');members();const p=E().people.find(x=>x.id!==E().meId);edit(p.id);A().gAccess=access;
  const before=JSON.stringify(p);app().ACTS['person-leave-ok']();app().ACTS['person-rejoin']();
  const unchanged=JSON.stringify(p)===before;app().root('home');act('go','[data-s=set]');act('go','[data-s=set-me]');const name=me().name;set('[data-bind="%name"]','変更途中');act('me-save');return unchanged&&me().name===name&&A().init.name==='変更途中';
 });
 T('出力は作成済みとDrive保存済みを分け、権限不足を通信断と表示しない',()=>{
  H.hash('scn=personal');act('go','[data-s=hist]');act('hist-open');A().gAccess='view';act('out-both');act('out-make');
  return txt().includes('閲覧のみ')&&!txt().includes('通信できないため')&&E().flights[0].outputPending.a4&&E().flights[0].outputPending.map;
 });
 T('PDF未保存は保存状態に残り、通信断と権限不足で成功扱いにしない',()=>{
  const f=E().flights[0];app().root('home');act('go','[data-s=set]');act('go','[data-s=set-sync]');const shown=txt().includes('A4運航記録PDF')&&txt().includes('地図付きPDF');
  app().ACTS['sync-now']();if(!f.outputPending.a4)return false;A().gAccess='edit';A().online=false;app().ACTS['sync-now']();return shown&&f.outputPending.a4;
 });
 T('通信・Drive編集権限が戻ると同じPDFを保存し、飛行記録を増やさない',()=>{
  const before=E().flights.length;A().online=true;app().render();act('sync-now');const ok=!Object.values(E().flights[0].outputPending).some(Boolean);act('back');act('back');act('go','[data-s=hist]');act('hist-open');return ok&&E().flights.length===before;
 });
 T('KMLの保存処理を直接呼んでも通信断・権限不足を迂回しない',()=>{
  const f=E().flights[0];f.kml='pending';act('out-kml-open');A().online=false;app().ACTS['out-kml-save']();if(f.kml!=='pending')return false;
  A().online=true;A().gAccess='none';app().ACTS['out-kml-save']();return f.kml==='pending';
 });
 T('記録当時の機体・操縦者名で履歴を表示し、役割解除後も検索できる',()=>{
  H.hash('scn=personal');const f=E().flights[0],aid=f.ac[0],pid=f.pl[0];f.masters={aircraft:{[aid]:{name:'当時の機体',mark:'JU000000000001'}},people:{[pid]:{name:'当時の操縦者'}}};
  E().aircraft.find(a=>a.id===aid).name='変更後の機体';const p=E().people.find(p=>p.id===pid);p.name='変更後の氏名';p.pilot=false;p.active=false;
  act('go','[data-s=hist]');const card=q('[data-act=hist-open][data-id="'+f.id+'"]');const shown=card.textContent.includes('当時の機体');set('[data-bind="#hPl"]',pid);act('hist-open','[data-id="'+f.id+'"]');
  return shown&&txt().includes('当時の操縦者')&&!txt().includes('変更後の機体');
 });
 T('飛行リストの通報者・操縦者・機体も通報時の情報を表示する',()=>{
  H.hash('scn=personal');const p=E().plans[0];p.snap.masters={aircraft:{[p.ac[0]]:{name:'通報時の機体'}},people:{[p.rep]:{name:'通報時の担当'}}};
  act('go','[data-s=list]');return txt().includes('通報時の機体')&&txt().includes('通報時の担当');
 });
 T('BAT状態確認中にDrive権限を失った場合も更新しない',()=>{
  H.hash('scn=personal');act('go','[data-s=set]');act('go','[data-s=set-bat]');act('bat-open');act('bat-check');
  const b=E().bats.find(b=>b.id===A().ui.batId),before=JSON.stringify(b);A().gAccess='view';act('bat-check-set','[data-v=膨らみあり]');return JSON.stringify(b)===before;
 });
 T('既決の警告時記録・補助者個別共有を再質問しない',()=>!app().SCR['op-standby'].ask.length&&!app().SCR['out-pdf'].ask.length);
});
