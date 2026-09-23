'use strict';
suite('入力の時点・再利用・記録への引継ぎ',H=>{
 const {T,act,set,A,E,S,q,route}=H;
 const direct=(name,data={})=>H.APP().ACTS[name]({dataset:data});
 const fresh=()=>H.hash('scn=company');
 const nf=()=>{fresh();act('nf-new');act('fill')};
 T('下書きは空欄で移動可能、通報操作では既存不足を飛ばせない',()=>{
   fresh();act('nf-new');act('start-new');window.nfGo('final');act('nf-send-go');
   return route()==='nf'&&S().cur==='review'&&E().plans.length===3;
 });
 T('通報確認を開いたあとでも空欄にすると送信成功しない',()=>{
   nf();window.nfGo('final');act('nf-send-go');S().aircraft=[];direct('nf-submit');return route()==='nf'&&E().plans.length===3;
 });
 T('目的その他の説明は該当時だけ。製造番号を毎回要求しない',()=>{
   nf();S().biz=['その他'];S().otherBiz='';window.nfGo('final');act('nf-send-go');const blocked=route()==='nf';
   S().otherBiz='現況記録';window.nfGo('final');act('nf-send-go');return blocked&&route()==='nf-send'&&!q('.phone [data-bind*="serial"]');
 });
 T('製造番号は設定で後補完し、空欄でも機体登録できる',()=>{
   fresh();window.openReg('aircraft',{});set('[data-bind="@d.mark"]','JU000000008001');act('reg-save');const a=E().aircraft.at(-1);
   window.openReg('aircraft',{id:a.id});set('[data-bind="@d.serial_number"]','機体固定番号A');act('reg-save');return a.serial_number==='機体固定番号A'&&a.prior_minutes===null;
 });
 T('現場の機体登録では製造番号欄を出さず、元の計画に戻る',()=>{
   nf();const before=S().planName;direct('nf-reg',{t:'aircraft'});const noField=!q('.phone [data-bind="@d.serial_number"]');set('[data-bind="@d.mark"]','JU000000008002');act('reg-save');return noField&&route()==='nf'&&S().planName===before;
 });
 T('許可の日付を勝手に今日・1年後へ補わない',()=>{
   fresh();window.openReg('permit',{});set('[data-bind="@d.no"]','国空航第000001号');act('reg-save');const p=E().permits.at(-1);return p.issued===null&&p.from===null&&p.to===null;
 });
 T('人員の連絡先を事前登録し操縦者選択で再利用できる',()=>{
   fresh();window.openReg('person',{});set('[data-bind="@d.name"]','連絡担当');set('[data-bind="@d.addr"]','○○市');set('[data-bind="@d.email"]','name@example.com');act('reg-save');const p=E().people.at(-1);return p.addr==='○○市'&&p.email==='name@example.com';
 });
 T('連絡先の情報源を往復しても申請書側の入力が消えない',()=>{
   nf();window.nfGo('master');direct('contact-src',{v:'application'});set('[data-bind="contact.name"]','申請連絡担当');set('[data-bind="contact.addr"]','○○市');direct('contact-src',{v:'self'});direct('contact-src',{v:'application'});return S().contact.name==='申請連絡担当'&&S().contact.addr==='○○市';
 });
 T('環境別Contactの不足を本人Personへ誤保存しない',()=>{
   nf();E().contact.addr='';S().contact.addr='';const p=E().people.find(x=>x.id===E().meId),before=p.addr;
   window.openNeedSheet();set('[data-bind="#needForm.addr"]','連絡先住所');act('need-save');return p.addr===before&&E().contact.addr==='連絡先住所';
 });
 T('不足の途中でDIPS登録へ行って戻っても未保存入力を保持',()=>{
   nf();A().dips.registered=false;S().contact.phone='';window.openNeedSheet();set('[data-bind="#needForm.phone"]','09000000000');act('dips-now');act('dips-cancel');window.openNeedSheet();return q('[data-bind="#needForm.phone"]').value==='09000000000';
 });
 T('手動通報の番号は再描画で残り、空欄では番号確認を完了しない',()=>{
   nf();direct('nf-manual-go');direct('nf-manual-done');act('nf-mconf','[data-v=num]');direct('nf-mconf-ok');const blocked=route()==='nf-manual-confirm';set('[data-bind="#mnum"]','受付番号001');H.APP().render();const retained=q('[data-bind="#mnum"]').value==='受付番号001';act('nf-mconf-ok');return blocked&&retained&&E().plans[0].confirmation.number==='受付番号001';
 });
 T('通報確定後にマスターを変更しても通報済み表示を改変しない',()=>{
   nf();window.nfGo('final');act('nf-send-go');act('nf-submit');const p=E().plans[0],before=window.valueOf(4,p.snap);E().aircraft[0].name='変更後';return window.valueOf(4,p.snap)===before;
 });
 T('環境切替で入力途中を消さず、別環境と混ぜない',()=>{
   H.hash('scn=normal');direct('env-pick',{id:A().envs[0].id});act('nf-new');const env=E().id;S().planName='途中の計画';const other=A().envs.find(e=>e.id!==env);direct('env-pick',{id:other.id});const distinct=!S();direct('env-pick',{id:env});return distinct&&S().planName==='途中の計画';
 });
 T('BAT状態は正常を仮定せず、状態確認後だけ保存。サイクル空欄は許容',()=>{
   fresh();window.openReg('bat',{group:E().batGroups[0].id});const n=E().bats.length;act('reg-save');const blocked=E().bats.length===n;set('[data-bind="@d.check"]','異常なし');act('reg-save');return blocked&&E().bats.length===n+1&&E().bats.at(-1).cycle===null;
 });
 T('BATの負サイクルは記録にせず、空欄なら継続できる',()=>{
   fresh();window.openReg('bat',{group:E().batGroups[0].id});set('[data-bind="@d.check"]','異常なし');set('[data-bind="@d.cycle"]','-1');const n=E().bats.length;act('reg-save');const blocked=E().bats.length===n;set('[data-bind="@d.cycle"]','');act('reg-save');return blocked&&E().bats.length===n+1;
 });
 T('計画取消でも通報内容と受付証跡を保持する',()=>{
   fresh();act('go','[data-s=list]');const p=E().plans[0],before=JSON.stringify(p.snap);act('plan-open');act('plan-cancel');act('plan-cancel-ok');return E().cancelledPlans.length===1&&JSON.stringify(E().cancelledPlans[0].snap)===before&&!!E().cancelledPlans[0].cancelledAt;
 });
 T('計画の機体が無効でも別の機体へ勝手に置換しない',()=>{
   fresh();act('go','[data-s=list]');const p=E().plans[0];E().aircraft.find(a=>a.id===p.ac[0]).dead=true;act('plan-open');act('plan-to-op');return route()==='plan'&&!A().op;
 });
 T('初回のDIPS IDだけでは認証設定済みにしないがホームへ進める',()=>{
   H.hash('');act('init-reg-gaccount');act('gauth-change');set('[data-bind="%name"]','確認担当');set('[data-bind="%dipsId"]','1234567890');act('init-reg-done');return route()==='home'&&!A().dips.registered&&A().dips.id==='1234567890';
 });
 T('申請書の連絡先を本人情報として登録しない',()=>{
   nf();window.nfGo('master');direct('contact-src',{v:'application'});const before=JSON.stringify(E().contact);return !q('.phone [data-act=nf-save-contact]')&&(direct('nf-save-contact'),JSON.stringify(E().contact)===before);
 });
 let saved,prior;
 T('BAT OFFは通報用の地図・空域・連絡先なしでも通常運航へ進める',()=>{
   fresh();act('nf-new');act('start-nodips');Object.assign(S(),{aircraft:['c2'],pilots:['q2'],biz:['空撮'],from:'離陸場所',to:'着陸場所'});window.nfGo('final');act('nf-nodips-go');prior=E().aircraft.find(a=>a.id==='c2').managedMinutes||0;
   return route()==='op-pre'&&!q('.phone [data-act=op-bat-pick]');
 });
 T('点検の実施者を変えられ、操縦者と記録者は同じが既定',()=>{
   set('[data-bind="~inspections.pre.c2.person"]','q1');act('op-pre-all');act('op-pre-done');act('op-takeoff');act('op-land');set('[data-bind="~last.min"]','4');act('op-land-confirm');return A().op.legs[0].pilot==='q2'&&A().op.legs[0].recorder==='q2'&&!!A().op.legs[0].offAt&&!!A().op.inspections.pre.c2.at;
 });
 T('未確定の実績は最終保存しない。修正後に点検・実績・累計を接続',()=>{
   act('op-to-post');act('op-post-all');act('op-to-final');A().op.last.confirmed=false;const n=E().flights.length;direct('op-finalize');const blocked=E().flights.length===n;A().op.last.confirmed=true;act('op-finalize');saved=E().flights[0];
   return blocked&&saved.inspections.pre.c2.person==='q1'&&saved.inspections.pre.c2.place==='着陸場所'&&saved.inspections.post.c2.person==='q2'&&E().aircraft.find(a=>a.id==='c2').managedMinutes===prior+4&&saved.legs[0].bat==='—';
 });
 T('帳票は保存した担当・点検異常を使い、ログイン中の人へ置換しない',()=>{
   saved.post.c2[0]=false;E().people.find(p=>p.id==='q2').name='変更された氏名';const html=window.a4Preview(saved);return html.includes('会社操縦者2')&&!html.includes('変更された氏名')&&html.includes('異常あり');
 });
 T('複数機体・8明細以上の出力見本が記録を落とさない',()=>{
   const f=JSON.parse(JSON.stringify(saved));f.ac.push('c1');f.legs=Array.from({length:9},(_,i)=>Object.assign({},f.legs[0],{note:'記録'+i,ac:i===8?'c1':'c2'}));const html=window.a4Preview(f);return (html.match(/class="paper a4"/g)||[]).length===3&&html.includes('記録8')&&html.includes('記録7');
 });
 T('点検整備は対象機体のSheetsへの引渡し。通常運航へ整備フォームを混ぜない',()=>{
   H.APP().go('set-maint');act('maintenance-open','[data-id=c2]');return H.all().includes('原本_点検整備記録')&&H.all().includes('JU000000000005')&&!q('.phone .sheet input');
 });
});
