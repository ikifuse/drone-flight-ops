'use strict';
/* ===================================================================
   起動・右側（設計確認）の状態切替・画面マップ
   左側のアプリ画面には、確認用の部品を出さない。状態の切替・画面一覧は、右側（スマホ幅では、アプリの枠の外の帯）に置く。
   =================================================================== */

/* 画面マップ（アプリ全体の画面一覧。ここからどの画面へも飛べる） */
const SCREEN_MAP=[
  ['はじめて使う・ログイン',[['boot','はじめに（アカウントを作る／ログイン）'],['acct-new','アカウントを作る'],['acct-login','ログイン'],['gauth','Googleアカウントを選択します（Googleが表示）'],['acct-exists','すでに登録されています'],['acct-none','ログインできませんでした'],['usage','どのように使いますか？'],['create-name','会社・団体の名前'],['consent','Google Driveの許可（Googleが表示）'],['created','準備ができました'],['dips-init','DIPSのログイン情報（はじめに登録）'],['init','はじめの設定'],['init-me','自分の情報'],['join1','招待を受けている会社・団体'],['join2','参加の確認'],['join3','あなたの名前を選んでください'],['where','どこで使いますか？']]],
  ['ホーム',[['home','ホーム（4入口）']]],
  ['新規飛行',[['nf:start','始め方'],['nf:dips','飛行計画（DIPS基準案）'],['nf:use','使うもの（機体・操縦者・許可）'],['nf:content','飛行の内容'],['nf:area','飛行範囲（地図）'],['nf:time','日時・高度'],['nf:master','登録済み情報の確認（保険・連絡先）'],['nf:review','内容確認'],['nf:final','通報の直前'],['nf:dipsneed','通報の直前：DIPSのログイン情報が未登録のとき'],['nf-send','DIPSへ送信（アプリから）'],['nf-manual','DIPS Webで通報する（転記）'],['nf-manual-confirm','DIPS Webで通報したあとの確認'],['nf-accepted','通報の結果（正常受付・重複・結果不明・エラー）']]],
  ['飛行リスト',[['list','飛行リスト'],['plan','DIPS通報内容']]],
  ['通常運航',[['op-pre','飛行前点検'],['op-standby','離陸待機'],['op-fly','飛行中'],['op-landed','着陸後入力'],['op-bat','BAT交換'],['op-switch','機体交代'],['op-post','飛行後点検'],['op-final','最終送信・保存'],['op-done','保存後']]],
  ['飛行履歴・出力',[['hist','飛行履歴・出力（検索）'],['hist-detail','飛行の詳細'],['out-pdf','出力：PDF'],['out-kml','出力：KML']]],
  ['各種設定・管理',[['set','各種設定・管理（メニュー）'],['set-env','個人・会社・団体の切り替え'],['set-members','人員・役割'],['set-aircraft','機体管理'],['reg-aircraft','機体の登録（追加・変更）'],['set-bat','BAT管理'],['bat-detail','BAT詳細と履歴'],['reg-bat','BATの登録'],['set-docs','許可・承認／保険／連絡先'],['reg-permit','許可・承認の登録'],['reg-insurance','保険の登録'],['reg-contact','連絡先の登録'],['set-presets','現場プリセット'],['reg-preset','現場プリセットの登録'],['reg-person','人員の登録・変更'],['set-dipscred','DIPSのログイン情報'],['set-dips','DIPSへの通報方法'],['set-maint','点検整備記録'],['set-sync','保存状態']]]
];
function mapHtml(){
  const E=ENV();
  return '<h3>画面一覧 <small>設計確認用。押すとその画面へ移動します</small></h3><p class="note">この一覧は、実際のアプリにはありません。いまの画面: <b>'+esc(val(SCR[A.route].t))+'</b>。飛ぶ先の画面は、必要な準備（仮データの計画など）を自動で整えます。'+(E?'':'（まだ使い始めていないので、はじめての画面だけ開けます）')+'</p>'
   +SCREEN_MAP.map(g=>'<div class="grp">'+esc(g[0])+'</div><div class="pills">'+g[1].map(s=>{const cur=(s[0]===A.route)||(A.route==='nf'&&S&&s[0]==='nf:'+S.cur);return '<button class="pill'+(cur?' sel':'')+'" data-act="mk-goto" data-s="'+s[0]+'">'+esc(s[1])+'</button>'}).join('')+'</div>').join('')
   +'<div class="row"><button class="btn" data-act="mclose">閉じる</button></div>';
}
const PRE_ENV=['boot','acct-new','acct-login','gauth','acct-exists','acct-none','usage','create-name','consent','created','dips-init','init','init-me','join1','join2','join3','where'];
function gotoScreen(id){
  A.modal=null;A.mockModal=null;const E=ENV();
  const base=id.split(':')[0];
  if(!PRE_ENV.includes(base)&&!E){mtoast('まず個人か会社・団体で使い始めてください');render();return}
  if(PRE_ENV.includes(base)&&!A.account)A.account=ACCOUNTS.find(a=>a.id===A.ui.gState)||ACCOUNTS[0];
  if((id==='consent')&&!A.create)A.create={kind:'personal',name:'個人'};
  if(id==='create-name'&&(!A.create||A.create.kind==='personal'))A.create={kind:'company',name:''};
  if((id==='join2'||id==='join3')&&(!A.join||!A.join.pick)){const j=JOINABLE[0];A.join={pick:j,env:sampleCompanyEnv(j.name,j.kind,null),me:null,code:'',newName:''}}
  if((id==='created'||id==='init'||id==='init-me'||id==='dips-init')&&!E){mtoast('まず個人か会社・団体で使い始めてください');render();return}
  if(id==='where'&&A.envs.length<2){ACTS['ob-normal']();return}
  if(typeof prepScreen==='function'&&prepScreen(id)===false){render();return}
  A.stack=id==='home'||PRE_ENV.includes(base)?[]:(id.indexOf('reg-')===0?['set']:['home']);
  if(id.indexOf(':')>0){const pg=id.split(':')[1];if(pg==='dipsneed'){if(!S){S=blankNF(E);if(!fillSample())return}S.cur='final';A.dips={registered:false,id:''};A.ui.dipsSet=true;A.route='nf';A.modal=null;render(false);openDipsNeed();return}if(!S)S=blankNF(E);if(['use','content','time','master'].includes(pg))S.layout='app';S.cur=pg;A.route='nf';A.modal=null;render(false);return}
  A.route=id;enter(id);render(false);
}

/* 画面マップから、文脈が要る画面へ飛ぶときの準備（足りない材料を自動で整える） */
function prepScreen(id){
  const E=ENV();if(!E)return true;
  const base=id.split(':')[0];
  const ensureNF=(page)=>{if(!S){S=blankNF(E);if(!fillSample())return false}S.cur=page||S.cur||'final';return true};
  if(base.indexOf('reg-')===0){const t=base.slice(4);if(!A.reg||A.reg.type!==t)A.reg={type:t,id:null,ret:null,d:regInit(t,{})};return true}
  switch(base){
    case 'plan':if(!E.plans.length){mtoast('通報済みの計画がありません。仮データを入れるか、新規飛行で通報してください');return false}if(!planOf(A.ui.planId))A.ui.planId=E.plans[0].id;return true;
    case 'bat-detail':if(!E.bats.length){mtoast('BATがありません。仮データを入れるか、BATを登録してください');return false}if(!batOf(A.ui.batId))A.ui.batId=E.bats[0].id;return true;
    case 'hist-detail':case 'out-pdf':case 'out-kml':
      if(!E.flights.length){mtoast('完了した飛行がありません。仮データを入れるか、飛行を完了させてください');return false}
      if(!flightOf(A.ui.hSel))A.ui.hSel=E.flights[0].id;
      if(base==='out-pdf')A.ui.outMade={a4:true,map:true,saved:A.online};
      return true;
    case 'nf-send':case 'nf-manual':case 'nf-manual-confirm':return ensureNF('final');
    case 'nf-accepted':
      if(!A.nfResult){if(!ensureNF('final'))return false;const pl=commitPlan('clean');A.nfResult={kind:'clean',planId:pl.id}}
      return true;
    default:
      if(base.indexOf('op-')===0)return opPrep(base);
      return true;
  }
}

/* 右側の下部：設計確認用の状態切替（設計ではなく、確認のための操作。左側のアプリ画面には出さない） */
const REQ_ITEMS=[['me','自分の情報'],['dips','DIPSのログイン情報'],['aircraft','機体'],['permit','許可・承認'],['insurance','保険'],['contact','連絡先']];
function controlsHtml(){
  const E=ENV();const u=A.ui;
  const row=(label,inner)=>'<div class="row"><label>'+label+'</label>'+inner+'</div>';
  const acc=ACCOUNTS.find(a=>a.id===u.gState)||ACCOUNTS[0];
  return '<h4>設計確認用の状態切替（実際のアプリにはありません）</h4>'
   +'<p class="note" style="margin:0 0 4px">ここで選んだ状態で、左のアプリ画面がどう変わるかを確かめます。</p>'
   +'<div class="row"><button class="btn sm" data-act="mk-reset">最初から（完全な初回利用者）</button><button class="btn sm" data-act="ob-normal">ログイン済みで起動（使う場所が複数）</button></div>'
   +row('Google認証のあと',mockSeg('gstate',u.gState,[['new','未登録'],['one','登録済み・個人だけ'],['many','登録済み・個人＋会社']]))
   +'<p class="note" style="margin:0 0 6px">この状態で使う、架空のテスト用Googleアカウント: <span class="mono">'+esc(acc.email)+'</span>（'+esc(acc.state)+'）</p>'
   +row('Google Driveの許可',mockSeg('consentres',u.consentOk?1:0,[[1,'許可する'],[0,'許可しない']]))
   +row('Google Drive',mockSeg('gaccess',A.gAccess,[['edit','編集できる'],['view','閲覧のみ'],['none','共有されていない']]))
   +row('通信',mockSeg('online',A.online?1:0,[[1,'オンライン'],[0,'オフライン']]))
   +row('DIPSへ送信',mockSeg('api',A.apiOk?1:0,[[1,'できる'],[0,'できない']]))
   +row('DIPSログイン情報',mockSeg('dipsstate',A.dips.registered?1:0,[[1,'登録済み'],[0,'未登録']]))
   +'<h4>初回設定で比較したいこと（未決）</h4>'
   +row('DIPS設定の置き方',mockSeg('initlayout',u.initLayout,[['sep','独立した画面（案A）'],['inline','はじめの設定の一項目（案B）']]))
   +'<div class="grp" style="margin:6px 0 4px">必須にする項目（何も選ばなければ、すべて任意）</div><div class="pills">'+REQ_ITEMS.map(r=>'<button class="pill'+(u.req[r[0]]?' sel':'')+'" data-act="reqtog" data-k="'+r[0]+'">'+r[1]+'</button>').join('')+'</div>'
   +'<p class="note">何を必須にするか、順番、同じ画面に置くか分けるかは、オーナーがモックを見ながら決めます。ここで選んだものは、決定ではなく、比較のための切替です。</p>'
   +'<h4>そのほかの操作</h4>'
   +'<div class="row"><button class="btn sm" data-act="map">画面一覧を開く</button>'+(E?'<button class="btn sm" data-act="mk-sample">この使う場所に仮データを入れる</button>':'')+'</div>'
   +row('画面幅',mockSeg('width',A.width,[['phone','スマホ'],['tab','タブレット'],['pc','PC']]))
   +'<p class="note">このモックは設計確認用です。送信・保存・DIPS/Google Drive接続はありません。データはすべて仮で、新しいデータ構造や業務ルールを決めるものではありません。<b>本物のIDやパスワードは入れないでください。</b>再読み込みで最初に戻ります。</p>';
}

Object.assign(ACTS,{
  'map':()=>openMock(mapHtml),
  'mk-goto':t=>gotoScreen(t.dataset.s),
  'mk-reset':()=>{S=null;A=freshApp(A);render(false);mtoast('最初の状態に戻しました')},
  'mk-sample':()=>{const E=ENV();if(seedSample(E)){render();mtoast('仮の機体・操縦者・許可・BAT・計画・履歴を入れました')}},
  'width':t=>{A.width=t.dataset.v;render()},
  'gaccess':t=>{A.gAccess=t.dataset.v;render()},
  'gstate':t=>{A.ui.gState=t.dataset.v;render()},
  'consentres':t=>{A.ui.consentOk=t.dataset.v==='1';A.ui.consentDenied=false;render()},
  'dipsstate':t=>{const on=t.dataset.v==='1';A.dips={registered:on,id:on?'1234567890':''};A.ui.dipsSet=true;render()},
  'initlayout':t=>{A.ui.initLayout=t.dataset.v;render()},
  'reqtog':t=>{const k=t.dataset.k;A.ui.req[k]=!A.ui.req[k];render()}
});

/* ---------- 起動 ---------- */
function init(){
  A=freshApp();S=null;
  const h=(location.hash||'').replace(/^#/,'');
  const q=Object.fromEntries(h.split('&').filter(Boolean).map(x=>x.split('=')));
  if(q.width)A.width=q.width;
  if(q.online==='0')A.online=false;
  if(q.api==='0')A.apiOk=false;
  if(q.gstate&&ACCOUNTS.some(a=>a.id===q.gstate))A.ui.gState=q.gstate;
  if(q.layout==='inline')A.ui.initLayout='inline';
  if(q.dips==='0')A.dips={registered:false,id:''};
  const scn=q.scn;
  if(scn==='personal'||scn==='company'||scn==='empty'){
    let E;
    if(scn==='personal'){A.account=ACCOUNTS[1];E=samplePersonalEnv(A.account);A.dips={registered:true,id:'1234567890'}}
    else if(scn==='company'){A.account=ACCOUNTS[2];E=sampleCompanyEnv('○○株式会社','company','q1',A.account);A.dips={registered:true,id:'1234567890'}}
    else{A.account=ACCOUNTS[0];E=emptyEnv('個人','personal');const me=newPerson('',['管理者'],{account:A.account.email});E.people.push(me);E.meId=me.id}
    A.envs=[E];A.cur=E.id;A.route='home';
  }
  if(scn==='normal'){ACTS['ob-normal']();return}
  if(q.sample&&ENV())seedSample(ENV());
  if(q.go){gotoScreen(decodeURIComponent(q.go));if(q.sheet==='map'){A.mockModal={fn:mapHtml};render()}else if(q.sheet==='memo')ACTS.memo();return}
  if(q.sheet==='map')A.mockModal={fn:mapHtml};
  render(false);
  if(q.sheet==='memo')ACTS.memo();
}
window.APP={state:()=>A,nf:()=>S,setNF:v=>{S=v},go:nav,root,back,render,ACTS,SCR,init,seedSample,gotoScreen,mk:{blankNF,emptyEnv,samplePersonalEnv,sampleCompanyEnv,newPerson}};
init();
