'use strict';
/* ===================================================================
   アプリ全体 設計確認用モック（低忠実度）— 共通基盤
   - 送信・保存・外部接続なし。ダミーデータのみ（再読み込みで最初に戻ります）。
   - 画面は def(id, {...}) で登録し、nav()/back()/root() で遷移する。
   =================================================================== */

/* ---------- ユーティリティ ---------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const TODAY=(()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const slash=d=>d.getFullYear()+'/'+pad(d.getMonth()+1)+'/'+pad(d.getDate());
const hm=d=>pad(d.getHours())+':'+pad(d.getMinutes());
const daysTo=d=>Math.round((d-TODAY)/86400000);
const clone=o=>JSON.parse(JSON.stringify(o));
let UID=100;const uid=p=>p+(++UID);
const tmpChip='';   /* 未確定の注記は設計メモへ。利用者画面には出さない */

/* ---------- アプリ全体の状態 ---------- */
let A=null;
let S=null;   /* 新規飛行の入力中の状態（newflight.js が使う） */
const ENV=()=>(A&&A.envs.find(e=>e.id===A.cur))||null;
const SCR={};   /* 画面レジストリ */
const ACTS={};  /* data-act の処理（各ファイルで追加する） */
const def=(id,d)=>{d.id=id;SCR[id]=d};

function freshApp(keep){
  const a={
    route:'boot',stack:[],modal:null,
    account:{email:'sample.user@example.invalid',name:'サンプル 太郎'},  /* Google認証済み（仮定）。アプリ独自の認証は作らない */
    envs:[],cur:null,
    online:true,apiOk:true,width:'phone',gAccess:'edit',
    reg:null,op:null,nfResult:null,init:null,join:null,create:null,
    ui:{plFilter:'all',hq:'',hAc:'',hPl:'',hPu:'',hSel:null,outSel:{a4:true,map:false}}
  };
  if(keep){a.online=keep.online;a.apiOk=keep.apiOk;a.width=keep.width;a.gAccess=keep.gAccess}
  return a;
}

/* ---------- 遷移 ---------- */
function enter(id){const d=SCR[id];if(d&&d.enter)d.enter()}
function nav(id){
  if(!SCR[id]){openStub('準備中です','この画面は、まだ用意できていません。');return}
  A.stack.push(A.route);A.route=id;A.modal=null;enter(id);render(false);
}
function rep(id){
  if(!SCR[id]){openStub('準備中です','この画面は、まだ用意できていません。');return}
  A.route=id;A.modal=null;enter(id);render(false);
}
function root(id){A.stack=[];A.route=id;A.modal=null;enter(id);render(false)}
function back(){
  const r=A.stack.pop();A.modal=null;
  if(r){A.route=r;render(false)}else root(A.cur?'home':'boot');
}

/* ---------- 描画 ---------- */
const val=x=>typeof x==='function'?x():x;
function shell(){
  const d=SCR[A.route];const E=ENV();
  const title=val(d.t),st=val(d.st)||'';
  const canBack=d.back!==false&&(A.stack.length>0||!!d.backAct);
  const chips=[];
  if(E&&d.env!==false)chips.push('<button class="chip" data-act="env">'+esc(envLabel(E))+'で使用中 ▾</button>');
  if(!A.online)chips.push('<i class="chip warn">オフライン</i>');
  if(A.gAccess==='view'&&E)chips.push('<i class="chip warn">Google Driveは閲覧のみ</i>');
  if(d.chips)chips.push(d.chips());
  const body=d.body();
  const foot=d.foot?d.foot():'';
  return '<div class="phone">'
   +'<header class="hd"><div class="hd1">'+(canBack?'<button class="ib" data-act="'+(d.backAct||'back')+'">←</button>':'')
   +'<div class="ttl">'+esc(title)+(st?'<small>'+esc(st)+'</small>':'')+'</div>'
   +(d.hbtn?d.hbtn():'')+'<button class="ib mockbtn" data-act="map">確認用：画面一覧</button><button class="ib mockbtn" data-act="memo">確認用：設計メモ</button></div>'
   +(chips.length?'<div class="hd2">'+chips.join('')+'</div>':'')+(d.prog?d.prog():'')+'</header>'
   +'<main class="body" id="body">'+body+'</main>'
   +(foot?'<footer class="ft">'+foot+'</footer>':'')
   +modalHtml()+'</div><aside class="memo" id="memo">'+memoHtml()+'</aside>';
}
function applyWidth(){document.documentElement.style.setProperty('--w',{phone:'430px',tab:'768px',pc:'1100px'}[A.width]||'430px')}
function render(keep){
  if(!A)return;
  const b=$('#body');const st=b&&keep!==false?b.scrollTop:0;
  const ae=document.activeElement;const aid=ae&&ae.id&&ae.dataset&&ae.dataset.keepfocus?ae.id:null;
  $('#root').innerHTML=shell();
  applyWidth();
  const nb=$('#body');if(nb)nb.scrollTop=keep===false?0:st;
  if(aid){const e=document.getElementById(aid);if(e&&e.focus)e.focus()}
  const d=SCR[A.route];if(d&&d.after)d.after();
}
function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}

/* ---------- シート（モーダル） ---------- */
function openSheet(fn,cls){A.modal={fn,cls:cls||''};render()}
function openStub(title,msg){openSheet(()=>'<h3>'+esc(title)+'</h3><p>'+esc(msg)+'</p><div class="row"><button class="btn" data-act="close">閉じる</button></div>')}
function modalHtml(){const m=A.modal;if(!m)return '';return '<div class="ov'+(m.cls?' '+m.cls:'')+'" data-act="ov"><div class="sheet" data-stop="1">'+m.fn()+'</div></div>'}

/* ---------- メモ欄（画面ごとの設計メモ） ---------- */
const STATE_LABEL={
  accepted:'決定済み（CURRENT-ACCEPTED）',
  proposal:'現在案（CURRENT-PROPOSAL）',
  spec:'画面の10項目あり（詳細な配置は未確定）',
  tmp:'仮（設計の個別仕様なし。たたき台）',
  none:'未設計（PENDING）'
};
const MEMO_HEAD='<div class="memohead"><b>設計確認メモ</b><br><small>この欄は、実際のアプリには表示されません。設計の出典・未確定事項・相談したい点を書いています。左のスマホ画面が、アプリの見え方です。</small></div>';
function memoHtml(){
  const d=SCR[A.route];if(!d)return '';
  let h=MEMO_HEAD+'<h4>いまの画面: '+esc(val(d.t))+'</h4>';
  if(d.memo)h+=d.memo();
  else{
    if(d.goal)h+='<p style="margin:0;font-size:13px">'+esc(d.goal)+'</p>';
    if(d.doc)h+='<h4>設計Docs上の位置づけ</h4><p style="margin:0;font-size:13px">'+esc(d.doc)+(d.state?'<br><span class="tag">'+esc(STATE_LABEL[d.state]||d.state)+'</span>':'')+'</p>';
    if(d.tmp&&d.tmp.length)h+='<h4>仮置き・未確定</h4><ul>'+d.tmp.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
    if(d.ask&&d.ask.length)h+='<h4>相談したい点</h4><ul>'+d.ask.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  }
  return h+(typeof controlsHtml==='function'?controlsHtml():'');
}

/* ---------- 入力の束縛（data-bind） ----------
   接頭辞なし = 新規飛行の状態 S / '@' = 登録フォーム A.reg / '~' = 運航 A.op / '#' = 画面の一時状態 A.ui / '%' = 初期設定 A.init / '&' = 作成中の環境 A.create / '$' = 参加中の環境 A.join */
function bindTarget(path){
  const c=path[0];let obj,p=path;
  if(c==='@'){obj=A.reg;p=path.slice(1)}
  else if(c==='~'){obj=A.op;p=path.slice(1)}
  else if(c==='#'){obj=A.ui;p=path.slice(1)}
  else if(c==='%'){obj=A.init;p=path.slice(1)}
  else if(c==='&'){obj=A.create;p=path.slice(1)}
  else if(c==='$'){obj=A.join;p=path.slice(1)}
  else obj=(typeof S!=='undefined'?S:null);
  const parts=p.split('.');let o=obj;for(let i=0;i<parts.length-1;i++)o=o[parts[i]];
  return [o,parts[parts.length-1]];
}
function setBind(t){
  const [o,k]=bindTarget(t.dataset.bind);let v=t.type==='checkbox'?t.checked:t.value;
  if(t.dataset.num)v=(v===''?'':Number(v));
  o[k]=v;
}

/* ---------- イベント ---------- */
document.addEventListener('click',e=>{
  if(!A)return;
  if(e.target.closest&&e.target.closest('#map')&&typeof mapTap==='function'){const svg=$('#map');const r=svg.getBoundingClientRect();mapTap(Math.round((e.clientX-r.left)/r.width*360),Math.round((e.clientY-r.top)/r.height*260));return}
  const t=e.target.closest&&e.target.closest('[data-act]');if(!t)return;
  if(t.dataset.stop)return;
  if(t.tagName==='INPUT'&&t.type==='checkbox')return;
  const fn=ACTS[t.dataset.act];
  if(fn)fn(t,e);
  else{console.warn('未実装の操作: '+t.dataset.act);openStub('準備中です','この操作は、まだ用意できていません。')}
});
document.addEventListener('change',e=>{
  if(!A)return;const t=e.target;
  if(t.tagName==='INPUT'&&t.type==='checkbox'&&t.dataset.act){const fn=ACTS[t.dataset.act];if(fn)fn(t,e);return}
  if(t.dataset&&t.dataset.bind){setBind(t);if(t.dataset.rerender)render()}
});
document.addEventListener('input',e=>{
  if(!A)return;const t=e.target;if(!(t.dataset&&t.dataset.bind))return;
  if(t.dataset.oninput){const fn=ACTS[t.dataset.oninput];if(fn){setBind(t);fn(t,e)}return}
  if(!t.dataset.rerender&&t.tagName!=='SELECT')setBind(t);
});

/* ---------- 共通の操作 ---------- */
Object.assign(ACTS,{
  'close':()=>{A.modal=null;render()},
  'ov':(t,e)=>{if(e.target===t)ACTS.close()},
  'back':()=>back(),
  'go':t=>nav(t.dataset.s),
  'root':t=>root(t.dataset.s),
  'stub':t=>openStub(t.dataset.t||'お知らせ',t.dataset.m||'この画面は準備中です'),
  'memo':()=>openSheet(()=>'<div class="memo" style="display:block;padding:0;border:0">'+memoHtml()+'</div><div class="row"><button class="btn" data-act="close">閉じる</button></div>','mockonly')
});
