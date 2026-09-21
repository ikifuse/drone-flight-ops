'use strict';
/* ===================================================================
   定数・ダミーデータ（すべて架空。新しいデータ構造や業務ルールの確定ではありません）
   =================================================================== */

/* DIPS公式 新規飛行計画22項目（PC/iPhoneで同じ順序。実地調査・実画面の観測） */
const DIPS_ITEMS=[[1,'飛行計画名称'],[2,'飛行許可番号'],[3,'参照飛行経路保存名称'],[4,'機体情報'],[5,'操縦者情報'],[6,'飛行目的'],[7,'飛行空域'],[8,'飛行方法'],[9,'保険に関する情報'],[10,'立入管理措置'],[11,'係留飛行'],[12,'補助者人数'],[13,'出発地'],[14,'目的地'],[15,'最大飛行時間'],[16,'所要時間'],[17,'開始日時'],[18,'終了日時'],[19,'定期・複数日指定'],[20,'飛行速度'],[21,'飛行高度'],[22,'連絡先']].map(([n,name])=>({n,name}));
const DNAME=n=>DIPS_ITEMS.find(x=>x.n===n).name;
/* DIPS Webに表示される選択肢（PC/iPhoneの観測どおりの表記） */
const BIZ=['空撮','報道取材','警備','農林水産業','測量','環境調査','設備メンテナンス','インフラ点検・保守','資材管理','輸送・宅配','自然観測','事故・災害対応','その他'];
const NON=['趣味','研究開発','その他'];
const AIR=['空港等周辺','地表・水面から150m以上の高さの空域','人・家屋の密集地域の上空','上記空域の飛行は行わない'];
const MET=['夜間飛行','目視外飛行','人・家屋等から30m未満','催し場所上空','危険物輸送','物件投下','上記方法の飛行は行わない'];
const TSU=['立入管理区画の設定','立入管理区画の設定(レベル3飛行)','立入管理区画の設定(レベル3.5飛行関連)','立入禁止区画の設定'];
const RADII=[10,20,50,100];
const M_PER_PX=5; /* 架空地図: 1px = 5m */
const MODELS=['EVO Lite+','EVO Lite','EVO Lite 6K Enterprise','サンプルQ3','サンプルX2','その他（手入力）'];
const CERTS=['なし','第二種機体認証','第一種機体認証'];
const KINDS=[['personal','個人','自分ひとりで使います'],['company','会社・団体','会社やスクールなどで、複数人で使います'],['school','スクール','スクールで使います'],['temp','臨時業務','一時的な業務・案件で使います']];
const KIND_NAME=k=>(KINDS.find(x=>x[0]===k)||[0,'—'])[1];
const ROLES=['操縦者','補助者','点検者','管理者','閲覧'];
const LICS=['未発行','二等無人航空機操縦士','一等無人航空機操縦士'];
const COVERS=['DID','夜間','目視外','30m未満','催し上空','危険物','物件投下'];
const BAT_CHECKS=['異常なし','膨らみあり','異常な発熱あり','その他の異常'];
const GEO={
 river:{kind:'polygon',pts:[[80,90],[240,80],[265,165],[105,185]],r:0,width:10},
 park:{kind:'circle',pts:[[180,130]],r:60,width:10},
 line:{kind:'line',pts:[[60,200],[150,120],[300,150]],r:0,width:20}
};
const FAKE_PLACES=['サンプル駅前','サンプル公園','サンプル川の河川敷','サンプル工場'];

/* ---------- 新規飛行の状態の初期値（サンプルの計画にも使う） ---------- */
function nowStart(){const d=new Date(Date.now()+10*60000);d.setMinutes(Math.ceil(d.getMinutes()/5)*5,0,0);return d}
function blankNF(env){
  const st=nowStart();const n=new Date();const i=env&&env.insurance,c=env&&env.contact;
  return {
    cur:'start',flow:['use','content','area','time','master'].map(id=>({id,skip:false,merge:false})),
    start:null,noDips:false,
    planName:'FlightPlan-'+n.getFullYear()+pad(n.getMonth()+1)+pad(n.getDate())+pad(n.getHours())+pad(n.getMinutes()),
    aircraft:[],pilots:[],permit:null,
    biz:[],non:[],otherBiz:'',otherNon:'',air:[],met:[],
    tsu:[true,false,false,false],tether:'no',assist:0,
    geom:{kind:null,pts:[],r:0,width:10,done:false,editing:false},layer:false,search:'',savedRoute:'',from:'',to:'',
    startDate:ymd(st),startH:st.getHours(),startM:st.getMinutes(),
    durH:0,durM:30,maxH:0,maxM:0,multi:[],speed:10,alt:30,
    ins:i?{mode:'auto',company:i.company,product:i.product,pUnl:i.pUnl,pAmt:i.pAmt,oUnl:i.oUnl,oAmt:i.oAmt,ability:i.ability}
         :{mode:'unreg',company:'',product:'',pUnl:'yes',pAmt:'',oUnl:'yes',oAmt:'',ability:''},
    contact:c?{src:'self',pilotId:'',name:c.name,country:c.country,pref:c.pref,addr:c.addr,cc:c.cc,phone:c.phone,email:c.email,other:''}
             :{src:'self',pilotId:'',name:'',country:'日本/Japan',pref:'',addr:'',cc:'日本/Japan(81)',phone:'',email:'',other:''},
    auto:{},reviewView:'screen',cal:{y:st.getFullYear(),m:st.getMonth()}
  };
}
const at=(days,h,m)=>{const d=addDays(TODAY,days);d.setHours(h,m||0,0,0);return d};
function snapOf(env,o){
  const s=blankNF(env);
  s.aircraft=o.ac.slice();s.pilots=o.pl.slice();s.permit=o.pm;s.biz=(o.biz||[]).slice();s.non=(o.non||[]).slice();s.air=o.air.slice();s.met=o.met.slice();
  s.geom={kind:o.geo.kind,pts:o.geo.pts.map(p=>p.slice()),r:o.geo.r,width:o.geo.width||10,done:true,editing:false};
  s.from=o.from;s.to=o.to;s.durH=o.dur[0];s.durM=o.dur[1];s.alt=o.alt;s.planName=o.name;
  const sd=o.startAt||at(0,10,0);s.startDate=ymd(sd);s.startH=sd.getHours();s.startM=sd.getMinutes();
  s.noDips=!!o.noDips;
  return s;
}

/* ---------- 使う場所（個人・会社・団体。内部名は運用環境） ---------- */
function emptyEnv(name,kind){
  return {id:uid('env'),name,kind,meId:null,people:[],aircraft:[],permits:[],insurance:null,contact:null,presets:[],batGroups:[],bats:[],plans:[],flights:[]};
}
const acOf=id=>{const E=ENV();return E&&E.aircraft.find(x=>x.id===id)};
const plOf=id=>{const E=ENV();return E&&E.people.find(x=>x.id===id)};
const acName=id=>{const a=acOf(id);return a?a.name:id};
const acMark=id=>{const a=acOf(id);return a?a.mark:''};
const acLabel=id=>{const a=acOf(id);return a?a.name+'（'+a.mark+'）':id};
const plName=id=>{const p=plOf(id);return p?p.name:(id||'—')};
const meName=()=>{const E=ENV();return E&&E.meId?plName(E.meId):'（未設定）'};

function newPerson(name,roles,o){
  return Object.assign({id:uid('p'),name,kana:'',roles:roles.slice(),pilot:roles.includes('操縦者'),dips:null,link:null,lic:'未発行',licNo:'',account:'',phone:'',active:true},o||{});
}
function batOf(id){const E=ENV();return E&&E.bats.find(b=>b.id===id)}
function groupOf(id){const E=ENV();return E&&E.batGroups.find(g=>g.id===id)}

/* ---------- サンプルデータの投入 ---------- */
function mkBats(group,model,n0,defs){
  return defs.map((d,i)=>({id:uid('b'),label:'BAT '+(n0+i),model,group,check:d[0],cycle:d[1],cycleAt:d[2],min:d[3],uses:d[4],lastDays:d[5],lastAc:d[6],source:'new',note:'',
    hist:[{d:slash(addDays(TODAY,-d[5])),ac:d[6],min:29,chk:d[0]},{d:slash(addDays(TODAY,-d[5]-6)),ac:d[6],min:31,chk:'異常なし'}]}));
}
function legsOf(list){return list.map(l=>({bat:l[0],off:l[1],on:l[2],min:l[3],place:l[4],note:l[5]||''}))}
function seedPersonal(env){
  const me=env.people.find(p=>p.id===env.meId);
  if(me){me.pilot=true;if(!me.roles.includes('操縦者'))me.roles.push('操縦者');me.dips=true;me.link=null}
  const P1=env.meId;
  env.people.push(newPerson('サンプル操縦者B',['操縦者'],{id:'p2',dips:true,lic:'二等無人航空機操縦士',link:['a1']}),newPerson('サンプル補助者C',['補助者'],{id:'p3'}));
  env.aircraft.push(
   {id:'a1',name:'デモ機A',model:'EVO Lite+',mark:'JU-SAMPLE-A01',cert:'第二種機体認証',expiry:addDays(TODAY,900),dips:true,dead:false,batOn:true,group:'g1'},
   {id:'a2',name:'デモ機B',model:'EVO Lite',mark:'JU-SAMPLE-B02',cert:'なし',expiry:addDays(TODAY,20),dips:true,dead:false,batOn:true,group:'g1'},
   {id:'a3',name:'デモ機C（抹消済み）',model:'サンプルQ3',mark:'JU-SAMPLE-C03',cert:'なし',expiry:addDays(TODAY,-30),dips:true,dead:true,batOn:false,group:null});
  env.permits.push(
   {id:'m1',no:'国空航第SAMPLE-001号',label:'包括許可（サンプル）',issued:addDays(TODAY,-200),from:addDays(TODAY,-200),to:addDays(TODAY,165),cat:'II（サンプル値）',cover:['DID','夜間','目視外'],aircraft:['a1','a2']},
   {id:'m2',no:'国空航第SAMPLE-002号',label:'個別承認（サンプル）',issued:addDays(TODAY,-60),from:addDays(TODAY,-60),to:addDays(TODAY,300),cat:'II（サンプル値）',cover:['30m未満'],aircraft:['a1']},
   {id:'m0',no:'国空航第SAMPLE-000号',label:'旧包括許可（サンプル）',issued:addDays(TODAY,-500),from:addDays(TODAY,-500),to:addDays(TODAY,-10),cat:'II（サンプル値）',cover:['DID'],aircraft:['a1']});
  env.insurance={company:'サンプル損害保険',product:'サンプル賠償責任保険',pUnl:'yes',pAmt:'',oUnl:'no',oAmt:'10000000',ability:''};
  env.contact={name:'サンプル 太郎',country:'日本/Japan',pref:'サンプル県',addr:'サンプル市サンプル1-2-3',cc:'日本/Japan(81)',phone:'09000000000',email:'sample@example.invalid'};
  env.presets.push(
   {id:'pr1',name:'河川敷Aの現場',geo:GEO.river,alt:30,from:'事務所（サンプル）',to:'河川敷A（サンプル）',biz:['空撮'],dur:[0,30]},
   {id:'pr2',name:'公園Bの定期点検',geo:GEO.park,alt:20,from:'事務所（サンプル）',to:'公園B（サンプル）',biz:['インフラ点検・保守'],dur:[1,0]});
  env.batGroups.push({id:'g1',name:'EVO Lite系のBATグループ',models:['EVO Lite','EVO Lite+']});
  env.bats=mkBats('g1','型式X',1,[['異常なし',41,'今日',760,45,0,'a1'],['異常なし',38,'先週',665,40,0,'a1'],['異常なし',null,null,560,33,1,'a2'],['異常なし',12,'今月',230,14,3,'a2'],['膨らみあり',60,'先月',1110,70,7,'a1'],['異常なし',null,null,370,22,1,'a2'],['異常なし',5,'先月',100,6,14,'a1']]);
  const v=(o)=>snapOf(env,o);
  env.plans.push({id:uid('pl'),name:'河川敷Aの空撮（明日）',snap:v({name:'河川敷Aの空撮（明日）',ac:['a1'],pl:[P1],pm:'m1',biz:['空撮'],air:[AIR[3]],met:[MET[6]],geo:GEO.river,from:'事務所（サンプル）',to:'河川敷A（サンプル）',dur:[0,30],alt:30,startAt:at(1,10,0)}),
    start:at(1,10,0),place:'河川敷A（サンプル）',ac:['a1'],pl:[P1],rep:P1,dips:'clean',kml:'saved'});
  const F=(label,d,ac,pl,legs,o,kml)=>({id:uid('h'),label,date:addDays(TODAY,-d),ac,pl,legs:legsOf(legs),kml,synced:true,outs:{a4:false,map:false},snap:v(Object.assign({name:label,ac,pl,dur:[0,30],alt:30},o))});
  env.flights.push(
   F('河川敷Aの空撮',14,['a1'],[P1],[['BAT 1','10:02','10:31',29,'河川敷A（サンプル）'],['BAT 2','10:50','11:22',32,'河川敷A（サンプル）','風がやや強い']],{pm:'m1',biz:['空撮'],air:[AIR[3]],met:[MET[6]],geo:GEO.river,from:'事務所（サンプル）',to:'河川敷A（サンプル）',startAt:at(-14,10,0)},'saved'),
   F('公園Bの点検（夜間なし）',30,['a2'],['p2'],[['BAT 4','14:05','14:58',53,'公園B（サンプル）']],{pm:'m1',biz:['インフラ点検・保守'],air:[AIR[2]],met:[MET[1]],geo:GEO.park,from:'事務所（サンプル）',to:'公園B（サンプル）',dur:[1,0],alt:20,startAt:at(-30,14,0)},'saved'),
   F('練習飛行（通報なし）',45,['a1'],[P1],[['BAT 3','16:10','16:25',15,'広場（サンプル）']],{pm:'none',non:['趣味'],air:[AIR[3]],met:[MET[6]],geo:GEO.line,from:'自宅（サンプル）',to:'広場（サンプル）',dur:[0,15],alt:10,noDips:true,startAt:at(-45,16,0)},'none'));
}
function seedCompany(env){
  const me=env.people.find(p=>p.id===env.meId);
  if(me){me.pilot=true;if(!me.roles.includes('操縦者'))me.roles.push('操縦者');me.dips=true;me.link=null}
  const P1=env.meId||'q1';
  if(!env.meId)env.people.push(newPerson('会社操縦者1',['操縦者'],{id:'q1',dips:true,lic:'二等無人航空機操縦士',link:['c1','c2']}));
  env.people.push(
   newPerson('会社事務担当（サンプル）',['管理者'],{id:'q0',account:'office.admin@example.invalid'}),
   newPerson('会社操縦者2',['操縦者'],{id:'q2',dips:false,lic:'未発行',link:['c1']}),
   newPerson('会社補助者3',['補助者'],{id:'q3'}));
  env.aircraft.push(
   {id:'c1',name:'会社機1',model:'サンプルQ3',mark:'JU-SAMPLE-K01',cert:'第二種機体認証',expiry:addDays(TODAY,700),dips:true,dead:false,batOn:true,group:'g2'},
   {id:'c2',name:'会社機2',model:'サンプルX2',mark:'JU-SAMPLE-K02',cert:'なし',expiry:addDays(TODAY,25),dips:true,dead:false,batOn:false,group:null});
  env.permits.push({id:'n1',no:'国空航第SAMPLE-101号',label:'会社の包括許可（サンプル）',issued:addDays(TODAY,-100),from:addDays(TODAY,-100),to:addDays(TODAY,265),cat:'II（サンプル値）',cover:['DID','夜間','目視外','30m未満'],aircraft:['c1','c2']});
  env.insurance={company:'会社契約損保（サンプル）',product:'会社包括賠償（サンプル）',pUnl:'yes',pAmt:'',oUnl:'yes',oAmt:'',ability:''};
  env.contact={name:'会社担当者（サンプル）',country:'日本/Japan',pref:'サンプル府',addr:'サンプル区サンプル7-8-9',cc:'日本/Japan(81)',phone:'0600000001',email:'office@example.invalid'};
  env.presets.push({id:'pr3',name:'工場屋根の点検',geo:GEO.park,alt:25,from:'本社（サンプル）',to:'工場（サンプル）',biz:['インフラ点検・保守'],dur:[1,30]});
  env.batGroups.push({id:'g2',name:'サンプルQ3のBATグループ',models:['サンプルQ3']});
  env.bats=mkBats('g2','型式Y',1,[['異常なし',20,'今週',300,25,0,'c1'],['異常なし',null,null,210,17,2,'c1'],['異常なし',8,'先月',90,9,9,'c1']]);
  const v=o=>snapOf(env,o);
  const P=(name,d,h,ac,pl,rep,dips,o)=>({id:uid('pl'),name,snap:v(Object.assign({name,ac,pl,pm:'n1',biz:['インフラ点検・保守'],air:[AIR[3]],met:[MET[6]],geo:GEO.park,from:'本社（サンプル）',dur:[1,0],alt:25,startAt:at(d,h,0)},o)),start:at(d,h,0),place:o.to,ac,pl,rep,dips,kml:'saved'});
  env.plans.push(
   P('サンプル工場の屋根点検',1,10,['c1'],[P1],'q0','clean',{to:'サンプル工場'}),
   P('サンプル現場の進捗空撮',2,14,['c2'],['q2'],'q0','clean',{to:'サンプル現場',biz:['空撮']}),
   P('工場敷地の測量',3,9,['c1'],[P1],P1,'dup',{to:'サンプル工場敷地',biz:['測量']}));
  env.flights.push({id:uid('h'),label:'工場屋根の点検',date:addDays(TODAY,-20),ac:['c1'],pl:[P1],legs:legsOf([['BAT 1','09:40','10:22',42,'サンプル工場'],['BAT 2','10:40','11:15',35,'サンプル工場']]),kml:'saved',synced:true,outs:{a4:false,map:false},
    snap:v({name:'工場屋根の点検',ac:['c1'],pl:[P1],pm:'n1',biz:['インフラ点検・保守'],air:[AIR[2]],met:[MET[6]],geo:GEO.park,from:'本社（サンプル）',to:'サンプル工場',dur:[1,30],alt:25,startAt:at(-20,9,30)})});
}
function seedSample(env){
  if(env.plans.length||env.aircraft.length){toast('すでに登録があるため、サンプルは追加しません');return false}
  if(env.kind==='personal'||env.kind==='temp')seedPersonal(env);else seedCompany(env);
  return true;
}
function samplePersonalEnv(acc){
  acc=acc||ACCOUNTS[1];
  const env=emptyEnv('個人','personal');
  const me=newPerson(acc.name,['管理者','操縦者'],{id:'p1',account:acc.email,phone:'09000000000'});
  env.people.push(me);env.meId='p1';seedPersonal(env);return env;
}
function sampleCompanyEnv(name,kind,meId,acc){
  const env=emptyEnv(name||'サンプル株式会社',kind||'company');
  seedCompany(env);
  if(meId){env.meId=meId;const p=env.people.find(x=>x.id===meId);if(p&&acc)p.account=acc.email}
  return env;
}
/* 表示用の名称: 個人は「個人」、会社・団体は実際の名称 */
const envLabel=E=>E.kind==='personal'?'個人':E.name;
/* ログインの確認用アカウント（Google公式の画面で選ぶ。実際はGoogleが決める）。state はこのモックの確認用の説明 */
const ACCOUNTS=[
  {id:'new',email:'sample.new@example.invalid',name:'サンプル 花子',state:'まだこのアプリの登録がないアカウント'},
  {id:'one',email:'sample.user@example.invalid',name:'サンプル 太郎',state:'登録済みで、個人だけで使っているアカウント'},
  {id:'many',email:'sample.multi@example.invalid',name:'サンプル 太郎',state:'登録済みで、個人と会社の両方で使っているアカウント'}
];
/* ログインしたアカウントが使える場所（個人・会社・団体）を返す */
function accountEnvs(acc){
  if(acc.id==='one')return [samplePersonalEnv(acc)];
  if(acc.id==='many')return [samplePersonalEnv(acc),sampleCompanyEnv('サンプル株式会社','company','q1',acc)];
  return [];
}
/* 招待を受けている会社・団体（Google Driveで共有されているもの。確認用の固定の候補） */
const JOINABLE=[
  {id:'j1',name:'サンプル株式会社',kind:'company',admin:'会社事務担当（サンプル）',members:4},
  {id:'j2',name:'サンプルスクール',kind:'school',admin:'スクール管理者（サンプル）',members:4}
];
