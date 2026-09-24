'use strict';
/* ===================================================================
   はじめの登録（Googleアカウント・本人情報・DIPS情報を1画面）／
   会社・団体で新しく使い始める・すでに使っている会社・団体に参加する（ホームから）／使う場所の選択／自分の情報
   設計の出典: 34a §9（2026-09-23。§9.3を同日中に更新：必須は氏名とGoogleアカウントの2つだけ、残りは任意。
   個人環境の作成・Google認証／同意は、画面を分けず［登録してホームへ］の内部処理として扱う）／
   34a §7（入口の訂正の経緯）／31a §2・§4（人物・Googleアカウント・運用環境を分ける）／34h（表示名と文言の型）／30 §5（左右の役割）
   - 左側の画面は、実際のアプリとして利用者が見る画面の候補だけにする。
     テスト用のアカウント・状態の説明・確認用の注記・設計書の番号は出さない。
     それらは、右側の設計確認メモ（goal / doc / tmp / ask / mock）と、右側の状態切替にだけ置く。
   - Googleが表示する画面（アカウントの選択・Google Driveの許可）は独立した中継用の画面にしない。
     「次にGoogleの画面が出ます」とだけ説明する画面は置かず、うすいシート（Googleに一時的に処理を渡すことを示す最小限の表示）として、
     はじめの登録・会社団体名の画面から呼び出す。実際の判断・入力は「はじめの登録」（Googleアカウントの表示・変更、氏名ほかの入力）に集約する。
   - 未決のもの（飛行開始時の必須範囲など）は完成品として決めず、右側に「未決」として残す。
   =================================================================== */
function canWrite(){
  if(A.gAccess==='edit')return true;
  toast(A.gAccess==='view'?'保存できませんでした。この保存場所は、Google Driveで「閲覧のみ」になっています。入力した内容は画面に残っています。編集できるように、管理者に頼んでください。':'保存できませんでした。この保存場所が、あなたのGoogleアカウントに共有されていません。入力した内容は画面に残っています。管理者に、Google Driveで共有してもらってください。');
  return false;
}
function resetDrafts(){S=null;A.op=null;A.reg=null;A.nfResult=null;A.init=null;A.ui.hSel=null;A.dipsRet=null;A.ui.dform=null}
/* いま使っている場所のGoogleアカウント（個人用と会社用は別でよい。31a §2） */
const envAccount=E=>(E&&E.gaccount)||'';
function switchEnv(id){
  if(id===A.cur)return render();
  A.envDrafts=A.envDrafts||{};
  if(A.cur)A.envDrafts[A.cur]={S,op:A.op,reg:A.reg,nfResult:A.nfResult,init:A.init,ui:A.ui,route:A.route,stack:A.stack.slice()};
  A.cur=id;const saved=A.envDrafts[id];resetDrafts();
  if(saved){S=saved.S;['op','reg','nfResult','init','ui','route','stack'].forEach(k=>A[k]=saved[k]);render(false)}
  else{A.ui=Object.assign({},freshApp().ui,{gState:A.ui.gState,consentOk:A.ui.consentOk});root('home')}
}
function envRole(E){const p=E&&E.people.find(x=>x.id===E.meId);return p?(p.roles.length?p.roles.join('・'):'まだ決まっていません（管理者が決めます）'):'—'}
/* ログイン中のGoogleアカウントの表示。実際のアプリでは、利用者のメールアドレスが入る場所（ここでは薄い文字の例） */
const acctMail=()=>A.account?'<span class="ph">'+esc(({new:'name',one:'personal',many:'member'}[A.account.id]||'name')+'@example.com')+'</span>':'<span>未選択</span>';
const bigCard=(act,title,sub,attrs)=>'<button class="card" style="width:100%;margin-bottom:8px" data-act="'+act+'" '+(attrs||'')+'><b>'+title+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</button>';
const isCo=()=>A.entry==='co-new'||A.entry==='co-join';

/* ---------- Googleアカウントの選択（実際はGoogleが表示する）。うすいシートとして重ねるだけにし、
   「次にGoogleの画面が出ます」という独立した中継用の画面は置かない（2026-09-23の訂正）。
   mode='change' は、はじめの登録の中からアカウントだけ選び直すときに使う。 ---------- */
function gauthSheet(mode){
  const isC=isCo();
  const title=isC?'会社・団体で使うGoogleアカウントを選択します':'Googleアカウントを選択します';
  const note=isC?'個人で使っているアカウントとは別に選べます。':'';
  return '<h3>'+esc(title)+'</h3><p class="note">実際の認証画面はGoogleが表示します。'+note+'</p>'
   +'<div class="row"><button class="btn" data-act="close">キャンセル</button><button class="btn primary" data-act="'+(mode==='change'?'gauth-change':'gauth-done')+'">次へ</button></div>';
}
/* ---------- 初回登録（Googleアカウント・本人情報・DIPSのログイン情報を1画面。2026-09-23）
   必須は氏名とGoogleアカウントの2つだけ。残りは任意で、未登録でもホームへ進める（同日中に確定・PENDING-S5-INITIAL-REQUIREDから除外）。
   個人の保存場所の作成・Google Driveの許可は、画面を分けず［登録してホームへ］の内部処理で行う。 ---------- */
def('init-reg',{t:'はじめの登録',st:'',env:false,back:false,
  goal:'Googleアカウントを確認し、氏名を登録するだけでホームへ進める。フリガナ・住所・電話番号・メールアドレス・DIPSのログイン情報は、いま入力しなくても進める。個人の保存場所の作成・Googleの許可は、この画面の内部処理として行い、別画面には分けない。',
  doc:'34a §9.2・§9.3（2026-09-23同日中に改訂。必須は氏名とGoogleアカウントの2つ。残りは任意）／§9.5（登録した人物情報を飛行計画で再利用する）／25b（DIPSの連絡先は自アカウント情報・操縦者から自動入力できる）／31a §2（人物とGoogleアカウントは別。ここで登録するのは人物の情報）。DIPSログイン情報を保存できる方針は34a §8.1（オーナー指示）。',state:'proposal',
  tmp:['DIPSログイン情報の保存先・暗号化・端末ごとか共有か・複数人が使うときの閲覧・自動ログインに使うか・API認証との関係・削除や無効化は未決（PENDING-S5-DIPS-LOGIN-STORAGE）','このモックは入力した内容を保存も送信もしない。DIPSパスワードの文字は、登録した時点で消している。本物のID・パスワードは入れないこと','住所・都道府県・国などの項目の分け方は、DIPSの連絡先の項目に合わせるところまでで、最終の列は未確定','初回の人物登録だけで操縦者役割も付与するかは未決。今回も役割を自動付与しない。既に操縦者登録済みの個人本人を新規飛行で自動選択することは決定済み（31c §6）'],
  ask:[],
  ui:['Googleアカウントの表示・変更を画面の最上部に置き、続けて氏名（必須）、その下に任意項目、最後にDIPSのログイン情報を並べている','任意項目には、なぜ登録するのかの説明を項目のすぐ上に置いている','DIPSパスワードは伏字にして、［表示］／［非表示］で切り替えられる'],
  enter:()=>{A.init={name:'',kana:'',addr:'',phone:'',email:'',dipsId:'',dipsPw:''};A.ui.pwShow=false;A.ui.consentDenied=false},
  body:()=>{
    const i=A.init||(A.init={name:'',kana:'',addr:'',phone:'',email:'',dipsId:'',dipsPw:''});const show=!!A.ui.pwShow;const denied=A.ui.consentDenied;
    return '<div class="sec"><h3>Googleアカウント【必須】</h3><p class="note">現在選択中のGoogleアカウント</p><div class="row" style="justify-content:space-between;align-items:center">'+acctMail()+'<button class="btn sm" data-act="init-reg-gaccount">'+(A.account?'変更する':'Googleアカウントを選択')+'</button></div></div>'
     +(denied?'<div class="msg ng"><b>保存場所を作れませんでした。</b>Google Driveの使用が許可されなかったためです。まだ何も作っていません。もう一度［登録してホームへ］を押してください。</div>':'')
     +'<div class="fld"><label>氏名【必須】</label><input class="in" data-bind="%name" value="'+esc(i.name)+'" placeholder="例：山田 太郎"></div>'
     +'<p class="note">DIPSは国土交通省の飛行計画通報の仕組みで、通報には氏名・住所・電話番号・メールアドレスなどの連絡先が必要です。いま入力しなくても進められますが、DIPSへ通報するときに未登録の項目は入力が必要になります。一度登録した情報は、以後の通報で再利用します。</p>'
     +'<div class="sec"><h3>連絡先（任意）</h3>'
     +'<div class="fld"><label>フリガナ</label><input class="in" data-bind="%kana" value="'+esc(i.kana)+'" placeholder="例：ヤマダ タロウ"></div>'
     +'<div class="fld"><label>住所</label><input class="in" data-bind="%addr" value="'+esc(i.addr)+'" placeholder="例：○○県○○市1-2-3"></div>'
     +'<div class="fld"><label>電話番号</label><input class="in" data-bind="%phone" value="'+esc(i.phone)+'" placeholder="例：090-1234-5678"></div>'
     +'<div class="fld"><label>メールアドレス</label><input class="in" data-bind="%email" value="'+esc(i.email)+'" placeholder="例：name@example.com"></div></div>'
     +'<div class="sec"><h3>DIPSのログイン情報（任意）</h3><p class="note" style="margin:0 0 8px">アプリからDIPSへ飛行計画を送るときに使います。</p>'
     +'<div class="fld"><label>DIPSログインID</label><input class="in" data-bind="%dipsId" autocomplete="off" inputmode="numeric" value="'+esc(i.dipsId)+'" placeholder="例：1234567890"></div>'
     +'<div class="fld"><label>DIPSパスワード</label><div class="pwrow"><input class="in" data-bind="%dipsPw" autocomplete="new-password" type="'+(show?'text':'password')+'" value="'+esc(i.dipsPw)+'" placeholder="パスワードを入力"><button class="btn sm" data-act="dips-show">'+(show?'非表示':'表示')+'</button></div></div></div>'
     +'<p class="note">あとから［各種設定・管理］で登録・変更できます。</p>';
  },
  foot:()=>'<button class="btn primary wide" data-act="init-reg-done">登録してホームへ</button>'
});

/* ---------- 会社・団体で新しく使い始める（ホームから。会社のGoogleアカウントで認証したあと） ---------- */
def('create-name',{t:'会社・団体の名前',st:'',env:false,
  goal:'新しく使い始める会社・団体の名前を決める。名前を入れて［作成してホームへ］を押すと、Googleの許可・保存場所の作成まで内部処理し、そのままホームへ進む。',
  doc:'34a §4・§9.4（会社・団体の環境は、ホームから、その会社で使うGoogleアカウントで認証したあとに作る）／§9.3改訂（Google Driveの許可・保存場所の作成は、この画面を分けず内部処理する）。同名の保存場所がDrive上にすでにないか確認する（root重複防止・再発見の方式は未確定＝PENDING-S5-ROOT-DISCOVERY）。',state:'proposal',
  tmp:['同じ名前の警告は、招待の一覧にある名前（○○株式会社）を入れると出る。見せ方は案','名前はあとから変えられる想定','許可を求める時点（新しく始めるときのみか、招待で参加する人にも求めるか）は未確定'],
  ask:['Google Driveの許可が拒否された・途中で失敗したときに、作りかけの保存場所をどう扱い、どこから再開するか（34a §4項目7の未確定）'],
  ui:['名前の入力と、許可・作成の内部処理を同じ画面・同じボタンにまとめている。拒否されたときは、同じ画面に問題→いまの状態→次の操作の順で出す'],
  enter:()=>{if(!A.create||A.create.kind==='personal')A.create={kind:'company',name:''};A.create.account=(A.coAccount&&A.coAccount.email)||'';A.ui.consentDenied=false},
  body:()=>{
    const c=A.create;const dup=JOINABLE.find(j=>j.name===c.name.trim());const denied=A.ui.consentDenied;
    return '<div class="fld"><label>会社・団体名</label><input class="in" data-bind="&name" data-rerender="1" value="'+esc(c.name)+'" placeholder="例：○○株式会社"></div>'
     +(dup?'<div class="msg warn"><b>同じ名前の会社・団体が、すでにGoogle Driveにあるようです。</b>新しく作ると二重になります。すでに使っている場合は、参加から進んでください。<br><button class="btn sm" data-act="ob-co-join">すでに使っている会社・団体に参加する</button></div>':'')
     +(denied?'<div class="msg ng"><b>保存場所を作れませんでした。</b>Google Driveの使用が許可されなかったためです。まだ何も作っていません。もう一度［作成してホームへ］を押してください。</div>':'');
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="cr-name-next">作成してホームへ</button>'
});
/* ---------- DIPSのログイン情報（はじめの登録・各種設定・管理から登録・変更／通報の直前にその場で登録） ---------- */
function dipsForm(){
  const d=A.ui.dform||(A.ui.dform={id:A.dips.id||'',pw:''});const show=!!A.ui.pwShow;const reg=A.dips.registered;
  return (A.dipsRet?'<div class="msg info"><b>「'+esc(A.dipsRet.label)+'」の途中です。</b>登録が終わると、元の画面に戻ります。</div>':'')
   +'<div class="fld"><label>DIPSログインID</label><input class="in" data-bind="#dform.id" autocomplete="off" inputmode="numeric" value="'+esc(d.id)+'" placeholder="例：1234567890"></div>'
   +'<div class="fld"><label>DIPSパスワード</label><div class="pwrow"><input class="in" data-bind="#dform.pw" autocomplete="new-password" type="'+(show?'text':'password')+'" value="'+esc(d.pw)+'" placeholder="'+(reg?'変更するときだけ入力':'パスワードを入力')+'"><button class="btn sm" data-act="dips-show">'+(show?'非表示':'表示')+'</button></div></div>'
   +(reg?'<p class="note">登録済みです。</p>':'');
}
const DIPS_MEMO={
  goal:'DIPSにログインするためのID・パスワードを、アプリに登録する。パスワードは伏字で、［表示］／［非表示］で切り替えられる。',
  doc:'34a §8.1（DIPSログインID・パスワードをアプリに登録・保存できる方針。CURRENT-ACCEPTED）／§9.3（はじめの登録の任意項目。未登録でもホームへ進める）／§8.2・§8.3（各種設定・管理からの変更と、未登録のまま進んだときの受け皿）／34h §10（表示の案）。',state:'proposal',
  tmp:['保存する方針はオーナーの指示で、AIの判断では変えない。次は未決（PENDING-S5-DIPS-LOGIN-STORAGE）：どこへ保存するか／暗号化の方式／端末ごとか共有か／Google Drive・Sheetsへどう持つか／複数人が使うとき誰が見られるか／自動ログインに使うか／API認証との関係／削除・無効化の扱い／個人ごとか使う場所ごとか','このモックは、入力した内容を保存も送信もしない。登録したかどうかと、IDだけを覚えている。パスワードの文字は、登録した時点で消す。本物のID・パスワードは入れないこと','保存の可否は、Google Driveの共有状態（閲覧のみ・未共有）とは結び付けていない（保存先が未決のため）','AGENTS.md §6.3・16 §1（クライアントへ機密を出さない原則）との関係は、保存方式の決定まで未決。アプリ固有の機密（API client_secret）とは別の秘密として扱う'],
  ask:['DIPSのログインID・パスワードのほかに、何を登録させるか（DIPSのアカウント種別など）'],
  ui:['記入例は薄い文字（placeholder）で置き、パスワードは伏字にして［表示］／［非表示］で切り替えられるようにしている','登録の削除・変更は、各種設定・管理の同じ画面から行う形にしている']
};

/* ---------- 自分の情報（各種設定・管理から） ---------- */
def('set-me',{t:'自分の情報',st:'',
  goal:'初回に登録した自分の情報を、あとから確かめて直す。DIPSの飛行計画の連絡先として使う。',
  doc:'34a §9.2・§9.5（初回登録と同じ項目をここから変更できる）／31a §2・31c（人物とGoogleアカウントは別。Google認証だけで操縦者役割を付与しない。個人本人のアカウント再入力は省く（31a §6・34i）。登録済みの個人本人の初期選択は31c §6）。',state:'proposal',
  tmp:['項目は初回登録（はじめの登録）と同じにしている。最終の列は未確定（PENDING-S2-IDENTITY）'],
  ask:['操縦者としての登録を、この画面で行うか、人員・役割の画面で行うか（人物と役割を分ける設計のため、どちらでも成り立つ）'],
  ui:['初回登録と同じ並びにして、どこを直せばよいか迷わないようにしている'],
  enter:()=>{const E=ENV();const me=E.people.find(p=>p.id===E.meId)||{};A.init={name:me.name||'',kana:me.kana||'',addr:me.addr||'',phone:me.phone||'',email:me.email||'',account:personalSelfAccount(E,E.meId)||me.account||'',isPilot:!!me.pilot}},
  body:()=>{const i=A.init||(A.init={name:'',kana:'',addr:'',phone:'',email:'',isPilot:false});
    return '<div class="fld"><label>氏名</label><input class="in" data-bind="%name" value="'+esc(i.name)+'" placeholder="例：山田 太郎"></div>'
     +'<div class="fld"><label>フリガナ</label><input class="in" data-bind="%kana" value="'+esc(i.kana)+'" placeholder="例：ヤマダ タロウ"></div>'
     +'<div class="fld"><label>住所</label><input class="in" data-bind="%addr" value="'+esc(i.addr)+'" placeholder="例：○○県○○市1-2-3"></div>'
     +'<div class="fld"><label>電話番号</label><input class="in" data-bind="%phone" value="'+esc(i.phone)+'" placeholder="例：090-1234-5678"></div>'
     +'<div class="fld"><label>メールアドレス</label><input class="in" data-bind="%email" value="'+esc(i.email)+'" placeholder="例：name@example.com"></div>'
     +'<button class="tgl'+(i.isPilot?' sel':'')+'" data-act="me-pilot"><span class="box">'+(i.isPilot?'✓':'')+'</span><span>操縦者としても登録する</span></button>';
  },
  foot:()=>'<button class="btn" data-act="me-cancel">キャンセル</button><button class="btn primary" data-act="me-save">保存する</button>'
});

/* ---------- すでに使っている会社・団体に参加する（ホームから。会社のGoogleアカウントで認証したあと） ---------- */
def('join1',{t:'参加する会社・団体',st:'1/3',env:false,
  goal:'すでにある会社・団体の保存場所に参加する。新しく保存場所は作らない。会社・団体で使うGoogleアカウントで認証したあとに、そのアカウントから見える保存場所を選ぶ。',
  doc:'34a §9.4（会社・団体の既存環境への参加。新しいrootや運用環境を作らない）／§1・§7.2（参加の場合）／31a §2（同じ人物へ個人用と会社用の複数アカウントを紐付ける）。参加の手段は選定していない（34a §4項目5）。',state:'spec',
  tmp:['招待の手段は未決（Drive共有から探す／招待コード／リンク）。ここでは「共有されている一覧から選ぶ」と「招待コードで探す」の2通りを並べて、比べられるようにしている','見つかる会社・団体は固定の仮データ（○○株式会社・○○スクール）。実際は、Googleアカウントに共有されているものが出る'],
  ask:['招待で参加する手段（Google Driveの共有から探す／招待コード／リンク）。誰が参加できるかの決まり方が変わる（34a §4項目5は未選定）'],
  ui:['いまは、共有された一覧と招待コードの両方を1画面に並べて比べられるようにしている'],
  enter:()=>{A.join={pick:null,env:null,code:'',me:null,newName:''}},
  body:()=>'<p class="lead2">参加する会社・団体を選んでください。</p><p class="note">新しい保存場所は作りません。</p>'
   +'<div class="cards">'+JOINABLE.map(j=>'<button class="card" data-act="ob-join-pick" data-id="'+j.id+'"><b>'+esc(j.name)+'</b><span>メンバー '+j.members+'人</span></button>').join('')+'</div>'
   +'<div class="fld" style="margin-top:14px"><label>招待コードで探す</label><div class="pwrow"><input class="in" data-bind="$code" placeholder="例：ABCD-1234" value="'+esc(A.join.code||'')+'"><button class="btn sm" data-act="ob-join-code">探す</button></div></div>'
});
def('join2',{t:'参加の確認',st:'2/3',env:false,
  goal:'参加する会社・団体と、Google Driveの共有状態を確認する。',
  doc:'34a §1・§7.2／31b §2・31d §3（アプリ内の所属とGoogle共有は別の操作。所属できても、Google側に権限がなければ読み書きできない）。',state:'accepted',
  tmp:['Google Driveの共有の状態は、この右側の切替（Google Drive）で選ぶ。「業務上の役割」「アプリの権限」「Google Driveの実アクセス」の三層の違いを確かめるための操作','共有されていないときの案内文は案'],
  ask:[],
  ui:['共有されていないときは、問題→いまの状態→次の操作（管理者に共有してもらう）の順で出し、［参加する］を押せなくしている。参加できないという決まりそのものは31b・31dで決定済み'],
  mock:()=>'<p class="note" style="margin:0 0 6px">Google Driveの共有の状態を選んで、左側の表示を確かめます。</p><div class="row"><label>Google Drive</label>'+mockSeg('gaccess',A.gAccess,[['edit','編集できる'],['view','閲覧のみ'],['none','共有されていない']])+'</div>',
  body:()=>{
    const j=A.join.pick;const g=A.gAccess;
    return '<div class="sec"><h3>'+esc(j.name)+'</h3><table class="kv"><tr><td>種類</td><td>'+esc(KIND_NAME(j.kind))+'</td></tr><tr><td>メンバー</td><td>'+j.members+'人</td></tr></table></div>'
     +(g==='none'?'<div class="msg ng"><b>参加できません。</b>この会社・団体の保存場所が、まだあなたのGoogleアカウントに共有されていません。まだ何も登録されていません。管理者に、Google Driveで共有してもらってください。新しく保存場所は作りません。</div>':g==='view'?'<div class="msg warn">Google Driveは<b>閲覧のみ</b>です。参加はできますが、保存や登録はできません。編集したいときは、管理者に、編集できるようにしてもらってください。</div>':'');
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-join-go"'+(A.gAccess==='none'?' disabled':'')+'>参加する</button>'
});
def('join3',{t:'あなたの名前を選んでください',st:'3/3',env:false,
  goal:'その会社・団体に登録されている人の中から、自分を選ぶ。まだ登録がなければ、新しく追加する。',
  doc:'34a §7.2（招待の場合）／31a §2（人物とGoogleアカウントは別。アカウントのない補助者なども人物として登録される）／31b §3（役割・管理者は管理者が決める。参加しただけでは管理者にならない）。',state:'accepted',
  tmp:['「あなたは誰ですか」「人物の紐付け」のような設計寄りの表現は使わず、実際の操作（名前を選ぶ）を表す言い方にした（PENDING-U-WORDING）','人物とアカウントの対応づけの画面構成は未確定（PENDING-S2-MEMBERSHIP）','一覧の中の名前・役割は仮データ'],
  ask:[],
  ui:['登録されている人をカードで並べ、最後に「名前がない（新しく追加する）」を置いている'],
  body:()=>{
    const e=A.join.env;const m=A.join.me;
    return '<p class="lead2">「'+esc(e.name)+'」に登録されている人の中から、あなたの名前を選んでください。</p>'
     +'<div class="cards">'+e.people.map(p=>'<button class="card'+(m===p.id?' sel':'')+'" data-act="ob-join-me" data-id="'+p.id+'"><b>'+(m===p.id?'✓ ':'')+esc(pnm(p))+'</b><span>'+esc(p.roles.join('・')||'役割はまだ決まっていません')+'</span></button>').join('')
     +'<button class="card'+(m==='__new'?' sel':'')+'" data-act="ob-join-me" data-id="__new"><b>'+(m==='__new'?'✓ ':'')+'名前がない（新しく追加する）</b><span>まだ登録されていない場合</span></button></div>'
     +(m==='__new'?'<div class="fld" style="margin-top:10px"><label>あなたの名前</label><input class="in" data-bind="$newName" value="'+esc(A.join.newName)+'" placeholder="例：山田 太郎"><p class="note">役割は、あとで管理者が決めます。</p></div>':'');
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-join-done"'+(A.join.me?'':' disabled')+'>ホームへ</button>'
});

/* ---------- どこで使いますか？（使う場所が複数のとき・切り替えるとき） ---------- */
function whereCards(){
  return A.envs.map((e,i)=>'<button class="li'+(i===0?' acc':'')+'" data-act="env-pick" data-id="'+e.id+'"><span class="tx"><b>'+esc(envLabel(e))+'</b><small>'+esc(KIND_NAME(e.kind))+' ／ あなたの役割: '+esc(envRole(e))+'</small></span>'+(i===0?'<i class="chip info">前回使用</i>':'')+(A.cur===e.id?'<i class="chip ok">使用中</i>':'')+'<span class="go">›</span></button>').join('');
}
def('where',{t:'どこで使いますか？',st:'',env:false,back:false,
  goal:'個人用と会社用など、使う場所が複数あるとき、今回使う場所を取り違えずに選ぶ。',
  doc:'34a §5・§7.3／31a §4。前回使ったものを初期の候補にする方向はCURRENT-PROPOSAL。専用の選択画面にするか、ホームの中に置くかは未確定（PENDING-S2-ENVIRONMENT-UI）。使う場所が1つだけなら、この画面を出さずそのままホームへ進める。',state:'proposal',
  tmp:['「どこで使いますか？」はオーナー指示の例。カードには個人／会社・団体の実際の名称を出す。カードの名称・役割は仮データ','専用の画面にするか、ホームの中に置くかは未決（PENDING-S2-ENVIRONMENT-UI）。意味は変わらないため、いまは専用の画面とホームの［〜で使用中］の両方を確認できるようにしている'],
  ask:['前回使った場所を自動で開くか、毎回選ばせるか（記録の保存先を取り違えないため）'],
  ui:['カードは実際の名称で並べ、前回使った場所に印を付けている'],
  body:()=>'<p class="lead2">今回使う場所を選んでください。</p>'+whereCards()
   +'<div class="row" style="margin-top:12px"><button class="btn sm" data-act="ob-co-new">＋ 会社・団体で新しく使い始める</button><button class="btn sm" data-act="ob-co-join">すでに使っている会社・団体に参加する</button></div>'
});
function envSwitchSheet(){
  return '<h3>どこで使いますか？</h3><p>現在の利用先：<b>'+esc(envLabel(ENV()))+'で使用中</b></p>'+(A.envs.length>1?'<p class="note">切り替えると、入力途中の内容は破棄され、選んだ場所のホームへ移ります。</p>'+whereCards():'')
   +'<div class="row"><button class="btn sm" data-act="ob-co-new">＋ 会社・団体で新しく使い始める</button><button class="btn sm" data-act="ob-co-join">すでに使っている会社・団体に参加する</button></div>'
   +'<div class="row"><button class="btn" data-act="close">閉じる</button></div>';
}

/* ---------- 操作 ---------- */
function afterLoginRegistered(){if(!A.ui.dipsSet)A.dips={registered:true,id:'1234567890'}}
/* Google Driveの許可・環境の作成。個人・会社・団体で共通の内部処理（2026-09-23。34a §9.3改訂）。
   許可が下りなければ何も作らず、呼び出し元の画面にとどまって、その場で示す（A.ui.consentDenied）。 */
function tryCreateEnv(){
  if(!A.ui.consentOk){A.ui.consentDenied=true;return null}
  const c=A.create;const E=emptyEnv(c.name.trim()||'個人',c.kind);
  const mail=c.kind==='personal'?((A.account&&A.account.email)||''):((A.coAccount&&A.coAccount.email)||'');
  E.gaccount=mail;
  const src=c.kind!=='personal'?(A.envs.find(x=>x.kind==='personal')||null):null;
  const src_me=src?src.people.find(p=>p.id===src.meId):null;
  const me=newPerson(src_me?src_me.name:'',['管理者'],{account:mail,kana:src_me?src_me.kana:'',addr:src_me?src_me.addr:'',phone:src_me?src_me.phone:'',email:src_me?src_me.email:''});
  E.people.push(me);E.meId=me.id;
  A.envs.unshift(E);A.cur=E.id;A.ui.consentDenied=false;
  return E;
}
Object.assign(ACTS,{
  /* Google認証が終わって戻った状態。どの状態かは、右側の切替（Google認証のあと）で選ぶ */
  'gauth-done':()=>{
    A.modal=null;
    /* 会社・団体で使うGoogleアカウントでの認証（ホームから追加するとき） */
    if(A.entry==='co-new'){A.coAccount=CO_ACCOUNT;A.create={kind:'company',name:'',account:CO_ACCOUNT.email};A.ui.consentDenied=false;nav('create-name');return}
    if(A.entry==='co-join'){A.coAccount=CO_ACCOUNT;nav('join1');return}
    ACTS['gauth-change']();
  },
  /* はじめの登録内で選択し、入力内容を保って同じ画面に戻る */
  'init-reg-gaccount':()=>{A.entry='new';openSheet(()=>gauthSheet('change'))},
  'gauth-change':()=>{const acc=ACCOUNTS.find(a=>a.id===A.ui.gState)||ACCOUNTS[0];A.account=acc;A.modal=null;render()},
  /* ホームから会社・団体を追加する。どちらも、その会社・団体で使うGoogleアカウントでの認証から始める */
  'ob-co-new':()=>{A.modal=null;A.entry='co-new';A.create={kind:'company',name:''};openSheet(()=>gauthSheet())},
  'ob-co-join':()=>{A.modal=null;A.entry='co-join';openSheet(()=>gauthSheet())},
  'cr-name-next':()=>{
    if(!A.create.name.trim()){toast('会社・団体の名前を入れてください');return}
    const E=tryCreateEnv();
    if(!E){render();return}
    resetDrafts();root('home');toast('「'+E.name+'」で使い始めました。あなたが最初の管理者です');
  },
  /* 初回登録（Googleアカウント・本人情報・DIPSのログイン情報を1画面。必須は氏名とGoogleアカウントだけ） */
  'init-reg-done':()=>{
    const i=A.init;
    if(!i.name.trim()){toast('氏名を入れてください');return}
    if(!A.account){toast('Googleアカウントを選択してください');return}
    const E=tryCreateEnv();
    if(!E){render();return}
    const me=E.people.find(p=>p.id===E.meId);
    me.name=i.name.trim();me.kana=i.kana.trim();me.addr=i.addr.trim();me.phone=i.phone.trim();me.email=i.email.trim();
    if(i.dipsId.trim()){A.dips={registered:!!i.dipsPw.trim(),id:i.dipsId.trim()};A.ui.dipsSet=true}
    resetDrafts();root('home');
    toast(A.dips.registered?'登録しました。飛行計画では、この情報を自動で使います':'登録しました。あとから登録した情報は、次回以降の飛行計画で使います');
  },
  'ob-create':()=>ACTS['ob-co-new'](),
  'ob-join':()=>ACTS['ob-co-join'](),
  'ob-normal':()=>{A.account=ACCOUNTS[2];A.envs=accountEnvs(A.account);A.cur=null;A.stack=[];resetDrafts();afterLoginRegistered();root('where')},
  /* DIPSのログイン情報 */
  'dips-show':()=>{A.ui.pwShow=!A.ui.pwShow;render()},
  'dips-save':()=>{
    const d=A.ui.dform;const had=A.dips.registered;
    if(!d.id.trim()){toast('DIPSログインIDを入れてください');return}
    if(!d.pw&&!had){toast('DIPSパスワードを入れてください');return}
    A.dips={registered:true,id:d.id.trim()};A.ui.dipsSet=true;A.ui.dform=null;A.ui.pwShow=false;
    const ret=A.dipsRet;A.dipsRet=null;
    back();toast('DIPSのログイン情報を'+(had?'更新':'登録')+'しました'+(ret?'。'+ret.label+'に戻りました':''));
  },
  'dips-cancel':()=>{const r=A.dipsRet;A.ui.dform=null;A.ui.pwShow=false;A.dipsRet=null;back();if(r)toast('登録せずに戻りました')},
  /* 自分の情報（各種設定・管理から） */
  'me-pilot':()=>{A.init.isPilot=!A.init.isPilot;render()},
  'me-cancel':()=>{A.init=null;back()},
  'me-save':()=>{
    const E=ENV();const me=E.people.find(p=>p.id===E.meId);const i=A.init;
    if(!i.name.trim()){toast('氏名を入れてください');return}
    if(me){me.name=i.name.trim();me.kana=i.kana.trim();me.addr=i.addr.trim();me.phone=i.phone.trim();me.email=i.email.trim();
      const account=personalSelfAccount(E,me.id);if(account)me.account=account;
      if(i.isPilot&&!me.roles.includes('操縦者'))me.roles.push('操縦者');if(!i.isPilot)me.roles=me.roles.filter(r=>r!=='操縦者');me.pilot=me.roles.includes('操縦者')}
    A.init=null;back();toast('自分の情報を保存しました');
  },
  'ob-join-pick':t=>{
    const j=JOINABLE.find(x=>x.id===t.dataset.id);A.join.pick=j;A.join.env=A.envs.find(e=>e.joinSource===j.id)||Object.assign(sampleCompanyEnv(j.name,j.kind,null),{joinSource:j.id});nav('join2');
  },
  'ob-join-code':()=>{const j=JOINABLE[0];A.join.pick=j;A.join.env=A.envs.find(e=>e.joinSource===j.id)||Object.assign(sampleCompanyEnv(j.name,j.kind,null),{joinSource:j.id});nav('join2')},
  'ob-join-go':()=>{if(A.gAccess==='none')return;nav('join3')},
  'ob-join-me':t=>{A.join.me=t.dataset.id;render()},
  'ob-join-done':()=>{
    const e=A.join.env;const m=A.join.me;const mail=(A.coAccount&&A.coAccount.email)||(A.account&&A.account.email)||'';
    if(!m||(m==='__new'&&!A.join.newName.trim())){toast('氏名を選ぶか入力してください');return}
    e.gaccount=mail;
    if(m==='__new'){const p=newPerson(A.join.newName||'',[],{account:mail});e.people.push(p);e.meId=p.id}
    else{e.meId=m;const p=e.people.find(x=>x.id===m);if(p&&!p.account)p.account=mail}
    if(!A.envs.some(x=>x.id===e.id))A.envs.unshift(e);A.cur=e.id;A.join=null;A.stack=[];resetDrafts();root('home');
  },
  'env':()=>openSheet(envSwitchSheet),
  'env-pick':t=>{A.modal=null;switchEnv(t.dataset.id);toast(envLabel(ENV())+'で使用中です。入力途中の内容は残っています')}
});
