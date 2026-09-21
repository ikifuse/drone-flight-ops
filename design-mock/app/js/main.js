'use strict';
/* ===================================================================
   起動・メモ欄の操作・画面マップ
   =================================================================== */

/* 画面マップ（アプリ全体の画面一覧。ここからどの画面へも飛べる） */
const SCREEN_MAP=[
  ['起動・初回',[['boot','はじめに（作成か参加か）'],['create1','作成 1/3 種類と名前'],['create2','作成 2/3 Googleの許可'],['create3','作成 3/3 作成の結果'],['init','はじめの設定'],['join1','参加 1/3 環境を探す'],['join2','参加 2/3 参加の確認'],['join3','参加 3/3 人物の紐付け'],['envsel','通常起動：環境の選択']]],
  ['ホーム',[['home','ホーム（4入口）']]],
  ['新規飛行',[['nf:start','始め方'],['nf:use','使うもの（機体・操縦者・許可）'],['nf:content','飛行の内容'],['nf:area','飛行範囲（地図）'],['nf:time','日時・高度'],['nf:master','登録済み情報の確認（保険・連絡先）'],['nf:review','内容確認'],['nf:final','通報の直前'],['nf-send','DIPSへ送信（API）'],['nf-manual','DIPS Webへ転記（Manual）'],['nf-manual-confirm','Manual：通報後の確認'],['nf-accepted','通報の結果（正常受付・重複・結果不明・エラー）']]],
  ['飛行リスト',[['list','飛行リスト'],['plan','DIPS通報内容']]],
  ['通常運航',[['op-pre','飛行前点検'],['op-standby','離陸待機'],['op-fly','飛行中'],['op-landed','着陸後入力'],['op-bat','BAT交換'],['op-switch','機体交代'],['op-post','飛行後点検'],['op-final','最終送信・保存'],['op-done','保存後']]],
  ['飛行履歴・出力',[['hist','飛行履歴・出力（検索）'],['hist-detail','飛行の詳細'],['out-pdf','出力：PDF'],['out-kml','出力：KML']]],
  ['各種設定・管理',[['set','各種設定・管理（メニュー）'],['set-env','運用環境'],['set-members','人員・権限'],['set-aircraft','機体管理'],['reg-aircraft','機体の登録（追加・変更）'],['set-bat','BAT管理'],['bat-detail','BAT詳細と履歴'],['reg-bat','BATの登録'],['set-docs','許可・承認／保険／連絡先'],['reg-permit','許可・承認の登録'],['reg-insurance','保険の登録'],['reg-contact','連絡先の登録'],['set-presets','現場プリセット'],['reg-preset','現場プリセットの登録'],['reg-person','人員の登録・変更'],['set-dips','DIPS連携'],['set-maint','点検整備記録'],['set-sync','保存・同期']]]
];
function mapHtml(){
  const E=ENV();
  return '<h3>画面マップ <small>アプリ全体の画面一覧。押すとその画面へ移動します</small></h3><p class="note">いまの画面: <b>'+esc(val(SCR[A.route].t))+'</b>。飛ぶ先の画面は、必要な準備（サンプルの計画など）を自動で整えます。'+(E?'':'（環境がまだないので、起動・初回の画面だけ開けます）')+'</p>'
   +SCREEN_MAP.map(g=>'<div class="grp">'+esc(g[0])+'</div><div class="pills">'+g[1].map(s=>{const cur=(s[0]===A.route)||(A.route==='nf'&&S&&s[0]==='nf:'+S.cur);return '<button class="pill'+(cur?' sel':'')+'" data-act="mk-goto" data-s="'+s[0]+'">'+esc(s[1])+'</button>'}).join('')+'</div>').join('')
   +'<div class="row"><button class="btn" data-act="close">閉じる</button></div>';
}
const PRE_ENV=['boot','create1','create2','create3','init','join1','join2','join3','envsel'];
function gotoScreen(id){
  A.modal=null;const E=ENV();
  const base=id.split(':')[0];
  if(!PRE_ENV.includes(base)&&!E){toast('まず運用環境を作成するか、参加してください');render();return}
  if(id==='create2'&&!A.create)A.create={kind:'personal',name:KIND_DEFAULT.personal};
  if((id==='join2'||id==='join3')&&(!A.join||!A.join.pick)){const j=JOINABLE[0];A.join={pick:j,env:sampleCompanyEnv(j.name,j.kind,null),me:null,code:'',newName:A.account.name}}
  if((id==='create3'||id==='init')&&!E){toast('まず運用環境を作成してください');render();return}
  if(id==='envsel'&&A.envs.length<2){ACTS['ob-normal']();return}
  if(typeof prepScreen==='function'&&prepScreen(id)===false){render();return}
  A.stack=id==='home'||PRE_ENV.includes(id)?[]:(id.indexOf('reg-')===0?['set']:['home']);
  if(id.indexOf(':')>0){const pg=id.split(':')[1];if(!S)S=blankNF(E);S.cur=pg;A.route='nf';A.modal=null;render(false);return}
  A.route=id;enter(id);render(false);
}

/* メモ欄の下部：モックの操作（設計の一部ではありません） */
function controlsHtml(){
  const seg=(act,cur,opts)=>'<span class="seg">'+opts.map(o=>'<button class="'+(String(cur)===String(o[0])?'on':'')+'" data-act="'+act+'" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</span>';
  const E=ENV();
  return '<h4>モックの操作（設計ではなく、確認のための操作）</h4>'
   +'<div class="row"><button class="btn sm" data-act="mk-reset">最初から（完全な初回利用者）</button><button class="btn sm" data-act="ob-normal">通常起動から</button></div>'
   +(E?'<div class="row"><button class="btn sm" data-act="mk-sample">この環境にサンプルを入れる</button><button class="btn sm" data-act="map">画面マップ</button></div>':'')
   +'<div class="row"><label style="min-width:auto">通信</label>'+seg('online',A.online?1:0,[[1,'オンライン'],[0,'オフライン']])+'</div>'
   +'<div class="row"><label style="min-width:auto">DIPS API</label>'+seg('api',A.apiOk?1:0,[[1,'利用できる（仮）'],[0,'利用できない（仮）']])+'</div>'
   +'<div class="row"><label style="min-width:auto">Google側</label>'+seg('gaccess',A.gAccess,[['edit','編集できる'],['view','閲覧のみ']])+'</div>'
   +'<div class="row"><label style="min-width:auto">画面幅</label>'+seg('width',A.width,[['phone','スマホ'],['tab','タブレット'],['pc','PC']])+'</div>'
   +'<p class="note">このモックは設計確認用です。送信・保存・DIPS/Google Drive接続はありません。データはすべてダミーで、新しいデータ構造や業務ルールを決めるものではありません。再読み込みで最初に戻ります。</p>';
}

Object.assign(ACTS,{
  'map':()=>openSheet(mapHtml),
  'mk-goto':t=>gotoScreen(t.dataset.s),
  'mk-reset':()=>{S=null;A=freshApp(A);render(false);toast('最初の状態に戻しました')},
  'mk-sample':()=>{const E=ENV();if(seedSample(E)){render();toast('サンプルの機体・操縦者・許可・BAT・計画・履歴を入れました')}},
  'width':t=>{A.width=t.dataset.v;render()},
  'gaccess':t=>{A.gAccess=t.dataset.v;render()}
});

/* ---------- 起動 ---------- */
function init(){
  A=freshApp();S=null;
  const h=(location.hash||'').replace(/^#/,'');
  const q=Object.fromEntries(h.split('&').filter(Boolean).map(x=>x.split('=')));
  if(q.width)A.width=q.width;
  if(q.online==='0')A.online=false;
  if(q.api==='0')A.apiOk=false;
  const scn=q.scn;
  if(scn==='personal'||scn==='company'||scn==='empty'){
    let E;
    if(scn==='personal')E=samplePersonalEnv();
    else if(scn==='company')E=sampleCompanyEnv('会社運用環境（サンプル）','company','q1');
    else{E=emptyEnv('個人運用環境','personal');const me=newPerson(A.account.name,['アプリ管理者'],{account:A.account.email});E.people.push(me);E.meId=me.id}
    A.envs=[E];A.cur=E.id;A.route='home';
  }
  if(scn==='normal'){ACTS['ob-normal']();return}
  if(q.sample&&ENV())seedSample(ENV());
  if(q.go){gotoScreen(decodeURIComponent(q.go));return}
  render(false);
}
window.APP={state:()=>A,nf:()=>S,setNF:v=>{S=v},go:nav,root,back,render,ACTS,SCR,init,seedSample,gotoScreen,mk:{blankNF,emptyEnv,samplePersonalEnv,sampleCompanyEnv,newPerson}};
init();
