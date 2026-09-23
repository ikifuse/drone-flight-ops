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
const slash=d=>{if(!d)return '未入力';d=new Date(d);return Number.isNaN(+d)?'未入力':d.getFullYear()+'/'+pad(d.getMonth()+1)+'/'+pad(d.getDate())};
const hm=d=>pad(d.getHours())+':'+pad(d.getMinutes());
const daysTo=d=>d?Math.round((new Date(d)-TODAY)/86400000):NaN;
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
    route:'init-reg',stack:[],modal:null,
    account:null,   /* Googleで認証したアカウント。アプリ独自の認証は作らない。画面には出さない */
    envs:[],cur:null,mockModal:null,
    online:true,apiOk:true,width:'phone',gAccess:'edit',
    dips:{registered:false,id:''},dipsRet:null,
    reg:null,op:null,nfResult:null,init:null,join:null,create:{kind:'personal',name:'個人'},
    ui:{plFilter:'all',hq:'',hAc:'',hPl:'',hPu:'',hSel:null,outSel:{a4:true,map:false},
      /* 設計確認用の切替（右側で選ぶ）。左側の画面には出さない */
      gState:'new',consentOk:true}
  };
  if(keep){a.online=keep.online;a.apiOk=keep.apiOk;a.width=keep.width;a.gAccess=keep.gAccess;a.ui.gState=keep.ui.gState;a.ui.consentOk=keep.ui.consentOk}
  return a;
}

/* ---------- 遷移 ---------- */
function enter(id){const d=SCR[id];if(d&&d.enter)d.enter()}
function nav(id){
  if(!SCR[id]){openStub('準備中です','この画面は、まだ用意できていません。');return}
  A.stack.push(A.route);A.route=id;A.modal=null;A.mockModal=null;enter(id);render(false);
}
function rep(id){
  if(!SCR[id]){openStub('準備中です','この画面は、まだ用意できていません。');return}
  A.route=id;A.modal=null;A.mockModal=null;enter(id);render(false);
}
function root(id){A.stack=[];A.route=id;A.modal=null;A.mockModal=null;enter(id);render(false)}
function back(){
  const r=A.stack.pop();A.modal=null;A.mockModal=null;
  if(r){A.route=r;render(false)}else root(A.cur?'home':'init-reg');
}

/* ---------- 描画 ---------- */
const val=x=>typeof x==='function'?x():x;
function shell(){
  const d=SCR[A.route];const E=ENV();
  const title=val(d.t),st=val(d.st)||'';
  const canBack=d.back!==false&&(A.stack.length>0||!!d.backAct);
  const chips=[];
  /* ホームでは単一環境でも、現在地確認と会社追加のシートを開く。 */
  if(E&&d.env!==false&&A.route!=='op-fly')chips.push((A.envs.length>1||A.route==='home')?'<button class="chip" data-act="env">'+esc(envLabel(E))+'で使用中</button>':'<i class="chip">'+esc(envLabel(E))+'で使用中</i>');
  if(!A.online)chips.push('<i class="chip warn">オフライン</i>');
  if(A.gAccess==='view'&&E)chips.push('<i class="chip warn">Google Driveは閲覧のみ</i>');
  if(A.gAccess==='none'&&E)chips.push('<i class="chip warn">Google Driveに保存できません</i>');
  if(d.chips)chips.push(d.chips());
  const body=d.body();
  const foot=d.foot?d.foot():'';
  /* 設計確認用の帯（アプリの画面ではない。スマホ幅のときだけ、アプリの枠の外に出る） */
  const bar='<div class="mockbar"><b>設計確認用</b><span class="sp">アプリの画面ではありません</span>'
    +'<button data-act="map">画面一覧</button><button data-act="memo"'+(d.mock?' class="hot"':'')+'>'+(d.mock?'この画面の確認用操作':'設計確認メモ・状態切替')+'</button></div>';
  return bar+'<div class="phone">'
   +'<header class="hd"><div class="hd1">'+(canBack?'<button class="ib" data-act="'+(d.backAct||'back')+'">←</button>':'')
   +'<div class="ttl">'+esc(title)+(st?'<small>'+esc(st)+'</small>':'')+'</div>'
   +(d.hbtn?d.hbtn():'')+'</div>'
   +(chips.length?'<div class="hd2">'+chips.join('')+'</div>':'')+(d.prog?d.prog():'')+'</header>'
   +'<main class="body" id="body">'+body+'</main>'
   +(foot?'<footer class="ft">'+foot+'</footer>':'')
   +modalHtml()+'</div><aside class="memo" id="memo">'+memoHtml()+'</aside>'+mockModalHtml();
}
function applyWidth(){document.documentElement.style.setProperty('--w',{phone:'430px',tab:'768px',pc:'1100px'}[A.width]||'430px')}
function render(keep){
  if(!A)return;
  const b=$('#body');const st=b&&keep!==false?b.scrollTop:0;
  const mm=$('#memo');const mst=mm&&keep!==false?mm.scrollTop:0;
  const ae=document.activeElement;const aid=ae&&ae.id&&ae.dataset&&ae.dataset.keepfocus?ae.id:null;
  $('#root').innerHTML=shell();
  applyWidth();
  const nb=$('#body');if(nb)nb.scrollTop=keep===false?0:st;
  const nm=$('#memo');if(nm)nm.scrollTop=keep===false?0:mst;
  if(aid){const e=document.getElementById(aid);if(e&&e.focus)e.focus()}
  const d=SCR[A.route];if(d&&d.after)d.after();
}
function toast(m,mock){const d=document.createElement('div');d.className='toast'+(mock?' mock':'');d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
/* 設計確認用の操作（右側）で出す通知。アプリの通知とは見た目を変える */
const mtoast=m=>toast(m,true);

/* ---------- シート（モーダル） ---------- */
function openSheet(fn,cls){A.modal={fn,cls:cls||''};render()}
function openStub(title,msg){openSheet(()=>'<h3>'+esc(title)+'</h3><p>'+esc(msg)+'</p><div class="row"><button class="btn" data-act="close">閉じる</button></div>')}
/* 設計確認用のシート（画面一覧・設計メモ・並べ替えなど）。アプリの枠の外に出す */
function openMock(fn){A.mockModal={fn};render()}
function mockModalHtml(){const m=A.mockModal;if(!m)return '';return '<div class="mockov" data-act="mov"><div class="msheet" data-stop="1">'+m.fn()+'</div></div>'}
function modalHtml(){const m=A.modal;if(!m)return '';return '<div class="ov'+(m.cls?' '+m.cls:'')+'" data-act="ov"><div class="sheet" data-stop="1">'+m.fn()+'</div></div>'}

/* ---------- メモ欄（画面ごとの設計メモ） ---------- */
const STATE_LABEL={
  accepted:'決定済み（CURRENT-ACCEPTED）',
  proposal:'現在案（CURRENT-PROPOSAL）',
  spec:'画面の10項目あり（詳細な配置は未確定）',
  tmp:'仮（設計の個別仕様なし。たたき台）',
  none:'未設計（PENDING）'
};
const MEMO_HEAD='<div class="memohead"><b>設計確認メモ</b><br><small>この欄は、実際のアプリには表示されません。設計の根拠、状態の切替、テスト条件、未決の点、オーナー判断が必要な点を置いています。左のスマホ画面が、アプリの見え方です。</small></div>'
 +'<div class="memohead"><b>この欄でお尋ねすること</b><br><small>選択肢の一般的な並び、余白、改行、ボタンの位置、「戻る」の配置と動き、説明文をどこに置くか、一覧に何をどの順で見せるか、意味や処理が変わらない画面の分け方——こうした<b>一般的なUI・UXは、AI側が既存の画面と一般的なスマートフォンUIに合わせた標準案を置いています</b>。一件ずつオーナー確認待ちにはしません。実際に触って違和感があれば、その場で直します。<br>オーナー判断としてお尋ねするのは、答えによって<b>アプリの意味・業務処理／責任主体／必須登録内容／保存する内容／権限／安全性／データの保持・削除・復旧／外部連携の意味や運用／記録として残す内容</b>のどれかが変わるものだけです。</small></div>';
/* 設計確認用の切替の部品（右側・アプリの枠の外だけで使う） */
const mockSeg=(act,cur,opts)=>'<span class="seg">'+opts.map(o=>'<button class="'+(String(cur)===String(o[0])?'on':'')+'" data-act="'+act+'" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</span>';
function designBasis(){
  const r=A.route;
  const basis=r.startsWith('op-')?'B. 旧運航記録アプリが基準（Pixel6a版 v2026.09.05.4・35b）。E. 未決・比較中：詳細配置と復帰UI。':r==='nf'?'A. DIPS iPhone実画面が基準。C. ワンエビ™️のスマホUIを参考。E. 未決・比較中：入力の画面分け。':r.startsWith('nf-')||r==='plan'||r==='list'?'D. 新アプリで必要な接続画面。E. 未決・比較中：受付結果・調整後の再開。':'D. 新アプリで必要な接続画面。C. ワンエビ™️のスマホUIを参考（大きい操作・入力例・次の操作）。E. 未決・比較中：画面の分類・文言。';
  return '<h4>設計根拠の分類</h4><p>'+basis+'</p>'+(r==='gauth'||r==='consent'?'<p>左側は外部のGoogle画面を表すモック上の中継表示です。本番アプリ自身がアカウント選択UIを描画する設計ではありません。認証後の状態だけを右で切り替えます。</p>':'');
}
/* 右側の3区分。オーナー判断が必要な設計論点／未決・仮置き／一般的なUI判断（AI標準案）を混ぜない。
   一般的なUI・UX（並び・余白・改行・ボタン位置・「戻る」・説明文の置き場所・一覧の見せ方・意味が変わらない画面の分け方）は、
   AI側が標準案を置き、オーナー確認待ちにしない。触って違和感があれば直す。 */
function memoBuckets(ask,tmp,ui){
  const li=a=>'<ul>'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  let h='<h4>オーナー判断が必要な設計論点</h4>'
   +((ask&&ask.length)?li(ask):'<p class="note" style="margin:0">この画面に、いまオーナー判断が必要な点はありません。</p>');
  if(tmp&&tmp.length)h+='<h4>未決・仮置き（いま決めなくてよいこと）</h4>'+li(tmp);
  if(ui&&ui.length)h+='<h4>一般的なUI判断（AI側の標準案。オーナー確認待ちではありません）</h4>'+li(ui);
  return h;
}
function memoHtml(){
  const d=SCR[A.route];if(!d)return '';
  let h=MEMO_HEAD+designBasis()+'<h4>いまの画面: '+esc(val(d.t))+'</h4>';
  if(d.mock)h+='<div class="mockpanel"><h4>この画面の確認用操作</h4>'+d.mock()+'</div>';
  if(d.memo)h+=d.memo();
  else{
    if(d.goal)h+='<p style="margin:0;font-size:13px">'+esc(d.goal)+'</p>';
    if(d.doc)h+='<h4>設計Docs上の位置づけ</h4><p style="margin:0;font-size:13px">'+esc(d.doc)+(d.state?'<br><span class="tag">'+esc(STATE_LABEL[d.state]||d.state)+'</span>':'')+'</p>';
    h+=memoBuckets(d.ask,d.tmp,d.ui);
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
/* 入力欄のblur/changeでボタンを作り直すと、続くclickが消える。
   ボタンを押している間だけ再描画を待ち、入力値は先に状態へ反映する。 */
let actionPress=false,changeRenderPending=false;
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest&&e.target.closest('button[data-act]');actionPress=!!b&&!b.disabled;
});
const releaseActionPress=()=>setTimeout(()=>{
  actionPress=false;if(changeRenderPending){changeRenderPending=false;render()}
},0);
document.addEventListener('pointerup',releaseActionPress);
document.addEventListener('pointercancel',releaseActionPress);
document.addEventListener('click',e=>{
  if(!A)return;
  if(e.target.closest&&e.target.closest('#map')&&typeof mapTap==='function'){const svg=$('#map');const r=svg.getBoundingClientRect();mapTap(Math.round((e.clientX-r.left)/r.width*360),Math.round((e.clientY-r.top)/r.height*260));return}
  const t=e.target.closest&&e.target.closest('[data-act]');if(!t)return;
  if(t.dataset.stop)return;
  if(t.tagName==='INPUT'&&t.type==='checkbox')return;
  const pending=changeRenderPending;actionPress=false;changeRenderPending=false;
  const fn=ACTS[t.dataset.act];
  if(fn)fn(t,e);
  else{console.warn('未実装の操作: '+t.dataset.act);openStub('準備中です','この操作は、まだ用意できていません。')}
  if(pending)render();
});
document.addEventListener('change',e=>{
  if(!A)return;const t=e.target;
  if(t.tagName==='INPUT'&&t.type==='checkbox'&&t.dataset.act){const fn=ACTS[t.dataset.act];if(fn)fn(t,e);return}
  if(t.dataset&&t.dataset.bind){setBind(t);if(t.dataset.rerender){if(actionPress)changeRenderPending=true;else render()}}
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
  'memo':()=>openMock(()=>'<div class="memo" style="display:block;padding:0;border:0">'+memoHtml()+'</div><div class="row"><button class="btn" data-act="mclose">閉じる</button></div>'),
  'mclose':()=>{A.mockModal=null;render()},
  'mov':(t,e)=>{if(e.target===t)ACTS.mclose()}
});
