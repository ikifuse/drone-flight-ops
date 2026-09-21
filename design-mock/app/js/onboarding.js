'use strict';
/* ===================================================================
   はじめて使う方／ログイン／使い方の選択／招待からの参加／使う場所の選択
   設計の出典: 34a（§7で、アカウントから始める導線と利用者向けの表示名に訂正）／34h（表示名と文言の型）
   - 左側の画面（利用者が見る言葉）には、内部の概念名・設計書の番号・状態ラベルを出さない。
     それらは、右側の設計確認メモ（goal / doc / tmp / ask）にだけ書く。
   - Googleの認証は「Google公式の画面（仮の表示）」で表す。アプリ独自のパスワードは作らない。
   =================================================================== */
function canWrite(){
  if(A.gAccess==='edit')return true;
  toast(A.gAccess==='view'?'保存できませんでした。この保存場所は、Google Driveで「閲覧のみ」になっています。入力した内容は画面に残っています。編集できるように、管理者に頼んでください。':'保存できませんでした。この保存場所が、あなたのGoogleアカウントに共有されていません。管理者に、Google Driveで共有してもらってください。');
  return false;
}
function resetDrafts(){S=null;A.op=null;A.reg=null;A.nfResult=null;A.init=null;A.ui.hSel=null}
function switchEnv(id){A.cur=id;resetDrafts();root('home')}
function envRole(E){const p=E&&E.people.find(x=>x.id===E.meId);return p?(p.roles.length?p.roles.join('・'):'まだ決まっていません（管理者が決めます）'):'—'}
const accLine=()=>A.account?esc(A.account.name)+'（<span class="mono">'+esc(A.account.email)+'</span>）':'';

/* ---------- 最初の画面 ---------- */
def('boot',{t:'はじめに',st:'',back:false,env:false,
  goal:'完全な初回利用者が最初に見る画面。はじめて使う方は［アカウントを作る］、すでに登録済みの方は［ログイン］。',
  doc:'34a §7.2（アカウントから始める初回導線。2026-09-21にオーナーの指示で訂正）。内部では、この画面は未ログインの入口。これまでの「認証済みを仮定した最初の画面」と［新しい運用環境を作成］／［既存の運用環境に参加］の二択は、経緯（HISTORICAL）として34a §1に残っている。',state:'proposal',
  tmp:['「アカウントを作る」「ログイン」の言葉は、オーナーが指示した表示の例（最終の製品用語ではない。PENDING-U-WORDING）','ログイン時に登録済みかを判定する方法は、Driveの保存場所の再発見方式に依存して未確定（PENDING-S5-ROOT-DISCOVERY）。アプリ独自の会員データベースを持つ決定ではない'],
  ask:['この二択の並べ方と、それぞれの一言説明'],
  body:()=>'<h2>はじめて使う方</h2>'
   +'<button class="card" style="width:100%;margin-bottom:6px" data-act="ob-start-new"><b>アカウントを作る</b><span>このアプリを使うための、あなたのアカウントを作ります。</span></button>'
   +'<h2 style="margin-top:22px">すでに登録済みの方</h2>'
   +'<button class="card" style="width:100%" data-act="ob-start-login"><b>ログイン</b><span>以前に作ったアカウントで、続きから使います。</span></button>'
});
def('acct-new',{t:'アカウントを作る',st:'',env:false,
  goal:'Googleアカウントを使って、このアプリのアカウントを作ることを伝える。新しいGoogleアカウントを作るという意味に誤解させない。',
  doc:'34a §7.2（順2）。アプリ独自のパスワードは作らず、Google公式の認証を使う。Googleのパスワードはアプリに入力させない（34a §1）。',state:'proposal',
  tmp:['文言はオーナー指示の例（「Googleアカウントを使って、このアプリのアカウントを作ります」）を土台にした案','「アカウント」の実体（アプリ側に何を持つか）は未確定。中央の会員データベースは持たない方針（37）'],
  ask:['説明の言い方（新しいGoogleアカウントを作ると思われないか）'],
  body:()=>'<h2>Googleアカウントで作ります</h2><p class="lead">Googleアカウントを使って、このアプリのアカウントを作ります。</p>'
   +'<div class="sec"><ul style="margin:0;padding-left:1.2em;font-size:14px"><li>Googleのパスワードを、このアプリに入力する必要はありません。</li><li>新しいGoogleアカウントを作るわけではありません。いつも使っているGoogleアカウントを使えます。</li></ul></div>',
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-google">Googleアカウントで続ける</button>'
});
def('acct-login',{t:'ログイン',st:'',env:false,
  goal:'アカウントを作ったときと同じGoogleアカウントで、ログインする。',
  doc:'34a §7.2（ログイン）。登録済みの方は、Google公式の認証のあと、使う場所が1つならそのままホーム、複数なら「どこで使いますか？」へ進む。',state:'proposal',
  tmp:['登録がないGoogleアカウントでログインしたときの案内は案（34a §7.2）'],ask:['再ログイン・端末変更のときの見せ方'],
  body:()=>'<h2>Googleアカウントでログイン</h2><p class="lead">アカウントを作ったときと同じGoogleアカウントで、ログインします。</p>'
   +'<div class="sec"><p class="lead" style="margin:0">Googleのパスワードは、このアプリには入力しません。</p></div>',
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-google">Googleアカウントで続ける</button>'
});
def('gauth',{t:'Googleアカウントの選択',st:'',env:false,
  goal:'Google公式のアカウント選択の画面。実際の画面はGoogleが表示し、アプリはGoogleのパスワードを扱わない。',
  doc:'34a §7.2（順3）／§1・§6（Google公式の認証。サインインとAPI利用への同意は別）。ここは「そういう画面が入る」ことを示す仮の表示。',state:'accepted',
  tmp:['アカウントごとの「確認用」の説明は、ログインの分岐（登録の有無・使う場所が1つか複数か）を確かめるための、モック専用の表示','実際の画面・必要な権限の範囲は正式実装時にGoogleの仕様で確認（VERIFY-S5-GOOGLE-CONTRACT）'],
  ask:['Googleの画面の前後に、アプリ側で何を見せるか'],
  body:()=>'<div class="mockbox" style="margin-top:0"><div class="mocktag">確認用（本番の画面にはありません）</div>実際は、Googleが表示する画面です。この画面は見本です。</div><div class="gbox"><div class="gh">Googleアカウントの選択</div><p class="note" style="margin:0 0 8px">このアプリに、あなたの名前とメールアドレスを知らせます。Googleのパスワードは、このアプリには渡りません。</p>'
   +ACCOUNTS.map(a=>'<button class="tgl" data-act="gauth-pick" data-id="'+a.id+'"><span class="ico" style="font-size:22px">👤</span><span><b>'+esc(a.name)+'</b><br><small class="note mono">'+esc(a.email)+'</small></span></button><div class="mockbox" style="margin:-2px 0 8px"><div class="mocktag">確認用の説明（本番の画面にはありません）</div>'+esc(a.state)+'</div>').join('')+'</div>',
  foot:()=>'<button class="btn" data-act="back">キャンセル</button>'
});
def('acct-exists',{t:'すでに登録されています',st:'',env:false,back:false,
  goal:'アカウントを作ろうとしたGoogleアカウントが、すでに登録済みだったときの案内。',
  doc:'34a §7.2（案）。二重にアカウントを作らせない。',state:'proposal',tmp:['この分岐の文言は案'],ask:['二重に作ろうとしたときの案内'],
  body:()=>'<div class="msg warn big">すでに登録されています</div><p class="lead">このGoogleアカウント（'+accLine()+'）では、すでにこのアプリを使っています。アカウントは作らず、［ログイン］から進んでください。入力した内容はありません。</p>',
  foot:()=>'<button class="btn" data-act="mk-reset">最初に戻る</button><button class="btn primary" data-act="ob-to-login">ログインへ</button>'
});
def('acct-none',{t:'ログインできませんでした',st:'',env:false,back:false,
  goal:'登録がないGoogleアカウントでログインしたときの案内。［アカウントを作る］へ誘導する。',
  doc:'34a §7.2（案）。問題／データ保護状態／次の操作の型（34h §6）。',state:'proposal',tmp:['この分岐の文言は案'],ask:['登録のないアカウントでログインしたときの案内'],
  body:()=>'<div class="msg ng big">ログインできませんでした</div><p class="lead">このGoogleアカウント（'+accLine()+'）では、まだこのアプリのアカウントがありません。まだ何も登録されていません。はじめて使う場合は、［アカウントを作る］から始めてください。</p>',
  foot:()=>'<button class="btn" data-act="mk-reset">最初に戻る</button><button class="btn primary" data-act="ob-to-new">アカウントを作る</button>'
});

/* ---------- 使い方の選択（アカウントを作ったあと） ---------- */
def('usage',{t:'どのように使いますか？',st:'',env:false,back:false,
  goal:'アカウントができたあと、個人で使うか、会社・団体で新しく使い始めるか、招待を受けているかを選ぶ。',
  doc:'34a §7.2（順4）／§7.4（内部の対応：個人・会社団体の新規作成＝新規の運用環境の作成、招待＝既存の運用環境への所属の追加）。最初に新しく作った人が最初の管理者になり、招待で参加しただけの人は自動では管理者にならない（31b）。',state:'proposal',
  tmp:['3つの言葉（個人で使う／会社・団体で新しく使い始める／会社・団体から招待を受けている）はオーナー指示の例。最終の製品用語ではない（PENDING-U-WORDING）','会社・団体の種類（会社／スクール／臨時業務）を分けて聞くかは未確定。ここでは「会社・団体」にまとめている'],
  ask:['3つの選択肢の並べ方と説明','個人と会社・団体の両方を使う人には、あとから追加できると案内するか'],
  body:()=>'<div class="msg ok">アカウントができました。<br><span class="note">'+accLine()+'</span></div>'
   +'<h2>どのように使いますか？</h2>'
   +'<button class="card" style="width:100%;margin-bottom:8px" data-act="us-personal"><b>個人で使う</b><span>自分ひとりで使います。あなたのGoogle Driveに、記録の保存場所を作ります。</span></button>'
   +'<button class="card" style="width:100%;margin-bottom:8px" data-act="us-company"><b>会社・団体で新しく使い始める</b><span>会社やスクールなどで、これから使い始めます。保存場所を作り、あなたが最初の管理者になります。</span></button>'
   +'<button class="card" style="width:100%" data-act="us-invited"><b>会社・団体から招待を受けている</b><span>すでに使っている会社・団体に、招待されて参加します。新しく保存場所は作りません。</span></button>'
});
def('create-name',{t:'会社・団体の名前',st:'',env:false,
  goal:'新しく使い始める会社・団体の名前を決める。',
  doc:'34a §4・§7.2（順5）。同名の保存場所がDrive上にすでにないか確認する（root重複防止・再発見の方式は未確定＝PENDING-S5-ROOT-DISCOVERY）。',state:'proposal',
  tmp:['同じ名前が既にあるときの見せ方は案','名前はあとから変えられる想定'],ask:['名前の入力を最初に求めてよいか'],
  enter:()=>{if(!A.create||A.create.kind==='personal')A.create={kind:'company',name:''}},
  body:()=>{
    const c=A.create;const dup=JOINABLE.find(j=>j.name===c.name.trim());
    return '<div class="sec"><h3>会社・団体の名前</h3><div class="row"><input class="in" data-bind="&name" data-rerender="1" value="'+esc(c.name)+'" placeholder="例: ○○株式会社"></div><p class="note">あとから変えられます。個人としても使う場合は、あとから追加できます。</p>'
     +(dup?'<div class="msg warn"><b>同じ名前の会社・団体が、すでにGoogle Driveにあるようです。</b>新しく作ると二重になります。招待を受けている場合は、招待から参加してください。<br><button class="btn sm" data-act="ob-join">招待を受けている会社・団体に参加する</button></div>':'')+'</div>';
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="cr-name-next">次へ</button>'
});
def('consent',{t:'Google Driveの許可',st:'',env:false,
  goal:'記録の保存場所を作るために、Google Driveの使用を許可してもらう。許可されなければ、何も作らない。',
  doc:'34a §1・§7.2（順5）。新規作成では、Google公式の同意を経て必要な権限が許可された後に、保存構造を生成する。許可を拒否したとき・途中で失敗したときの戻り方と回復は未確定（34a §4項目7）。',state:'accepted',
  tmp:['実際の同意画面と必要な権限の範囲は、正式実装時にGoogleの仕様で確認（VERIFY-S5-GOOGLE-CONTRACT）','許可を求める時点（新しく始めるときのみか、招待で参加する人にも求めるか）は未確定','拒否したときの文言は、問題／データ保護状態／次の操作の型の案'],
  ask:['許可されなかったときに、どこへ戻すか'],
  body:()=>{
    const c=A.create;const denied=A.ui.consentDenied;
    return '<div class="mockbox" style="margin-top:0"><div class="mocktag">確認用（本番の画面にはありません）</div>実際は、Googleが表示する画面です。この画面は見本です。</div><div class="gbox"><div class="gh">Google Driveの使用の許可</div><p style="margin:0 0 6px">アカウント: '+accLine()+'</p><p style="margin:0 0 6px">このアプリに、次のことを許可しますか。</p><ul style="margin:0 0 6px;padding-left:1.2em"><li>このアプリが作った、Google Driveのフォルダーとファイルの作成・表示・編集</li></ul><p class="note" style="margin:0">Googleのパスワードは、このアプリには渡りません。</p></div>'
     +'<p class="note">許可すると、'+(c.kind==='personal'?'あなたの':'「'+esc(c.name)+'」の')+'記録の保存場所（人員・機体・バッテリー・運航記録・点検整備記録・DIPS関連・出力のフォルダー）を、あなたのGoogle Driveに作ります。</p>'
     +(denied?'<div class="msg ng"><b>保存場所を作れませんでした。</b>Google Driveの使用が許可されなかったためです。まだ何も作っていません。もう一度やり直すときは、［許可して続ける］を押してください。</div>':'');
  },
  foot:()=>'<button class="btn" data-act="consent-no">許可しない</button><button class="btn primary" data-act="consent-ok">許可して続ける</button>'
});
def('created',{t:'準備ができました',st:'',env:false,back:false,
  goal:'保存場所ができたことと、自分が管理者であることを伝え、はじめの設定へ進む。',
  doc:'34a §1・§7.2（順5）／31b §3（新しく作った人が最初のアプリ管理者）。生成するのは利用者の記録の保存場所のみで、設計管理の資料は作らない（34a §1）。',state:'accepted',
  tmp:['作成の進み具合の見せ方（一括か、順に見せるか）は案','フォルダー名は内部の責任領域の表記であり、名称の確定ではない'],
  ask:['作成後に必ず「はじめの設定」を挟むか、すぐホームでよいか'],
  body:()=>{const E=ENV();const personal=E.kind==='personal';return '<div class="msg ok big">✓ '+(personal?'個人で使う準備ができました':'「'+esc(E.name)+'」を使い始める準備ができました')+'</div>'
   +'<div class="sec"><h3>作られた保存場所（フォルダー）</h3>'+['人員','機体','バッテリー','運航記録','点検整備記録','DIPS関連','出力（PDF・KML）'].map(x=>'<div class="step"><span class="n">✓</span><span>'+x+'</span></div>').join('')+'<p class="note">あなたのGoogle Driveの中に作りました。</p></div>'
   +'<div class="sec"><h3>管理者</h3><p class="lead" style="margin:0"><b>'+esc(A.account.name)+'</b>さんが、'+(personal?'管理者です。':'最初の管理者です。管理者は、人員や機体の登録などを行えます。')+'</p></div>';},
  foot:()=>'<button class="btn primary" data-act="ob-to-init">はじめの設定へ</button>'
});

/* ---------- はじめの設定（何も必須にしない案） ---------- */
const INIT_ROWS=[['aircraft','✈','機体','あなたが飛ばす機体'],['permit','📄','許可・承認','包括許可・個別承認など'],['insurance','🛡','保険','賠償責任保険など'],['contact','☎','連絡先','DIPSに載せる連絡先'],['preset','📍','現場プリセット','よく行く現場の範囲・高度']];
const countOf=(E,t)=>({aircraft:E.aircraft.length,person:E.people.length,permit:E.permits.length,insurance:E.insurance?1:0,contact:E.contact?1:0,preset:E.presets.length,bat:E.bats.length})[t]||0;
def('init',{t:'はじめの設定',st:'あとでも、飛行の途中でも登録できます',env:false,back:false,
  goal:'最初に決めておくことを最小にして、ホームへ進む。機体・操縦者などは、飛行を始めるときにその場で登録できる。',
  doc:'34a §3。初回の操縦者登録は強制しない（CURRENT-ACCEPTED）。場所・機体・BATなども「まず選択→なければその場で新規登録→元の処理へ戻る」は候補（CURRENT-PROPOSAL）。初回に何を必須にするかはPENDING-S5-INITIAL-REQUIRED。',state:'proposal',
  tmp:['「何も必須にしない」案を見せている。最低1機を必須にする案・全部を任意にする案のどちらにするかは未確定（PENDING-S5-INITIAL-REQUIRED）','あなたの情報（氏名・電話）を最初に聞くかは案','「操縦者でもある」は、Googleの認証者を自動で操縦者にしないための、明示の選択'],
  ask:['この画面は必要か（すぐホームでよいか）','登録しておくと便利なものの並びと、何を初回から見せるか'],
  enter:()=>{const E=ENV();const me=E.people.find(p=>p.id===E.meId);A.init={name:me?me.name:'',phone:me&&me.phone||'',isPilot:!!(me&&me.pilot)}},
  body:()=>{
    const E=ENV(),i=A.init;
    return '<div class="msg info">ここでの登録は、<b>すべて任意</b>です。何も登録せずホームへ進めます。飛行を始めるときに、足りないものをその場で登録できます。</div>'
     +'<div class="sec"><h3>あなたの情報</h3><div class="row"><label>氏名</label><input class="in" data-bind="%name" value="'+esc(i.name)+'"></div><div class="row"><label>電話</label><input class="in" data-bind="%phone" value="'+esc(i.phone)+'" placeholder="任意"></div>'
     +'<button class="tgl'+(i.isPilot?' sel':'')+'" data-act="init-pilot" style="margin-top:6px"><span class="box">'+(i.isPilot?'✓':'')+'</span><span>私は操縦者でもある<br><small class="note">オンにすると、飛行を始めるときに毎回選ぶ手間が減ります。</small></span></button></div>'
     +'<div class="sec"><h3>登録しておくと便利なもの <small>任意</small></h3>'+INIT_ROWS.map(r=>{const n=countOf(E,r[0]);return '<div class="li"><span class="ico">'+r[1]+'</span><span class="tx"><b>'+r[2]+'</b><small>'+r[3]+'</small></span>'+(n?'<i class="chip ok">登録済み '+n+'</i>':'<i class="chip">未登録</i>')+'<button class="btn sm" data-act="reg-open" data-t="'+r[0]+'" data-from="init">いま登録</button></div>'}).join('')+'<p class="note">あとから、ホームの［各種設定・管理］でも登録できます。</p></div>';
  },
  foot:()=>'<button class="btn primary" data-act="ob-init-done">ホームへ</button>'
});

/* ---------- 招待を受けている会社・団体に参加する（3画面） ---------- */
def('join1',{t:'招待を受けている会社・団体',st:'1/3',env:false,
  goal:'招待を受けている会社・団体を選んで参加する。新しく保存場所は作らない。',
  doc:'34a §1・§7.2（招待の場合）。既存の運用環境への参加では、新しい保存構造を作らず、参加者本人のGoogleアカウントを既存の環境へ結び付ける。招待の手段は選定していない（34a §4項目5）。',state:'spec',
  tmp:['招待の手段（Drive共有から探す／招待コード／リンク）は未選定。ここでは2通りを並べている','見つかる会社・団体は固定のダミー'],
  ask:['招待の入口は何が自然か（共有された一覧から選ぶ／コードを入れる）'],
  enter:()=>{A.join={pick:null,env:null,code:'',me:null,newName:A.account?A.account.name:''}},
  body:()=>'<p class="lead">あなたのGoogleアカウントに、招待や共有が届いている会社・団体です。参加するところを選んでください。</p>'
   +'<div class="cards">'+JOINABLE.map(j=>'<button class="card" data-act="ob-join-pick" data-id="'+j.id+'"><b>'+esc(j.name)+'</b><span>管理者: '+esc(j.admin)+'</span><span>メンバー '+j.members+'人</span></button>').join('')+'</div>'
   +'<div class="sec" style="margin-top:12px"><h3>招待コードで探す</h3><div class="row"><input class="in" data-bind="$code" placeholder="例: SAMPLE-CODE" value=""><button class="btn sm" data-act="ob-join-code">探す</button></div></div>'
   +'<p class="note">参加しても、管理者になるわけではありません。何ができるかは、管理者が決めた役割と、Google Driveの共有の状態で決まります。</p>'
});
def('join2',{t:'参加の確認',st:'2/3',env:false,
  goal:'参加する会社・団体と、Google Driveの共有状態を確認する。',
  doc:'34a §1・§7.2／31b §2・31d §3（アプリ内の所属とGoogle共有は別の操作。所属できても、Google側に権限がなければ読み書きできない）。',state:'accepted',
  tmp:['Google Driveの共有状態の切替は、「業務上の役割」「アプリの権限」「Google Driveの実アクセス」の三層の違いを確かめるための、モック専用の操作','共有されていないときの案内文は案'],
  ask:['共有されていない会社・団体を選んだときに、何を見せるか'],
  body:()=>{
    const j=A.join.pick;const g=A.gAccess;
    return '<div class="sec"><h3>'+esc(j.name)+'</h3><table class="kv"><tr><td>種類</td><td>'+esc(KIND_NAME(j.kind))+'</td></tr><tr><td>管理者</td><td>'+esc(j.admin)+'</td></tr><tr><td>メンバー</td><td>'+j.members+'人</td></tr></table><p class="note">新しく保存場所は作りません。あなたのGoogleアカウントで、この会社・団体の記録を使えるようにします。</p></div>'
     +(g==='none'?'<div class="msg ng"><b>参加できません。</b>この会社・団体の保存場所が、まだあなたのGoogleアカウントに共有されていません。まだ何も登録されていません。管理者に、Google Driveで共有してもらってください。</div>':g==='view'?'<div class="msg warn">Google Driveは<b>閲覧のみ</b>です。参加はできますが、保存や登録はできません。編集したいときは、管理者に、編集できるようにしてもらってください。</div>':'<div class="msg ok">Google Driveの共有: 編集できます。</div>')
     +'<div class="mockbox"><div class="mocktag">確認用の操作（本番の画面にはありません）</div><p class="note" style="margin:0 0 6px">Google Driveの共有の状態を切り替えて、表示を確かめます。</p><div class="pills">'+[['edit','編集できる'],['view','閲覧のみ'],['none','共有されていない']].map(x=>'<button class="pill'+(g===x[0]?' sel':'')+'" data-act="gaccess" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></div>';
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-join-go"'+(A.gAccess==='none'?' disabled':'')+'>参加する</button>'
});
def('join3',{t:'あなたの名前を選んでください',st:'3/3',env:false,
  goal:'その会社・団体に登録されている人の中から、自分を選ぶ。まだ登録がなければ、新しく追加する。',
  doc:'34a §7.2（招待の場合）／31a §2（人物とGoogleアカウントは別。アカウントのない補助者なども人物として登録される）／31b §3（役割・管理者は管理者が決める。参加しただけでは管理者にならない）。',state:'accepted',
  tmp:['「あなたは誰ですか」「人物の紐付け」のような設計寄りの表現は使わず、実際の操作（名前を選ぶ）を表す言い方にした（PENDING-U-WORDING）','人物とアカウントの対応づけの画面構成は未確定（PENDING-S2-MEMBERSHIP）'],
  ask:['既存の人員から選ぶ／新しく追加、の見せ方'],
  body:()=>{
    const e=A.join.env;const m=A.join.me;
    return '<p class="lead">「'+esc(e.name)+'」に登録されている人の中から、あなたの名前を選んでください。</p>'
     +'<div class="cards">'+e.people.map(p=>'<button class="card'+(m===p.id?' sel':'')+'" data-act="ob-join-me" data-id="'+p.id+'"><b>'+(m===p.id?'✓ ':'')+esc(p.name)+'</b><span>'+esc(p.roles.join('・')||'役割はまだ決まっていません')+'</span></button>').join('')
     +'<button class="card'+(m==='__new'?' sel':'')+'" data-act="ob-join-me" data-id="__new"><b>'+(m==='__new'?'✓ ':'')+'名前がない（新しく追加する）</b><span>まだ登録されていない場合</span></button></div>'
     +(m==='__new'?'<div class="sec" style="margin-top:8px"><div class="row"><label>あなたの名前</label><input class="in" data-bind="$newName" value="'+esc(A.join.newName)+'"></div><p class="note">役割は、あとで管理者が決めます。</p></div>':'')
     +'<div class="msg info">選んだ名前は、このGoogleアカウント（'+accLine()+'）でログインしたときの、あなたの名前として使われます。管理者の権限や、Google Driveの権限は変わりません。</div>';
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
  tmp:['「どこで使いますか？」はオーナー指示の例。カードには個人／会社・団体の実際の名称を出す','この専用画面案と、ホームの［切り替える］からの切替（もう一つの案）の両方を確認できる'],
  ask:['専用画面か、ホームの中か','前回使った場所を自動で開くか、毎回選ぶか'],
  body:()=>'<p class="lead">ログインできました。今回使う場所を選んでください。</p>'+whereCards()
   +'<div class="sec" style="margin-top:12px"><h3>ほかの場所を追加する</h3><div class="row"><button class="btn sm" data-act="ob-create">＋ 会社・団体で新しく使い始める</button><button class="btn sm" data-act="ob-join">招待を受けている会社・団体に参加する</button></div></div>'
});
function envSwitchSheet(){
  return '<h3>どこで使いますか？</h3><p class="note">切り替えると、入力途中の内容は破棄され、選んだ場所のホームへ移ります。</p>'+whereCards()
   +'<div class="row"><button class="btn sm" data-act="ob-create">＋ 会社・団体で新しく使い始める</button><button class="btn sm" data-act="ob-join">招待を受けている会社・団体に参加する</button></div>'
   +'<div class="row"><button class="btn" data-act="close">閉じる</button></div>';
}

Object.assign(ACTS,{
  'ob-start-new':()=>{A.entry='new';nav('acct-new')},
  'ob-start-login':()=>{A.entry='login';nav('acct-login')},
  'ob-google':()=>nav('gauth'),
  'ob-to-login':()=>{A.entry='login';rep('acct-login')},
  'ob-to-new':()=>{A.entry='new';rep('acct-new')},
  'gauth-pick':t=>{
    const acc=ACCOUNTS.find(a=>a.id===t.dataset.id);
    if(A.entry==='new'){
      A.account=acc;
      if(acc.id==='new'){A.stack=['boot'];rep('usage')}else{A.account=acc;rep('acct-exists')}
      return;
    }
    A.account=acc;
    if(acc.id==='new'){rep('acct-none');return}
    A.envs=accountEnvs(acc);
    if(A.envs.length===1){A.cur=A.envs[0].id;resetDrafts();root('home');toast(envLabel(A.envs[0])+'で使用中です')}
    else{A.cur=null;root('where')}
  },
  'us-personal':()=>{A.create={kind:'personal',name:'個人'};A.ui.consentDenied=false;nav('consent')},
  'us-company':()=>{A.create={kind:'company',name:''};nav('create-name')},
  'us-invited':()=>nav('join1'),
  'cr-name-next':()=>{if(!A.create.name.trim()){toast('会社・団体の名前を入れてください');return}A.ui.consentDenied=false;nav('consent')},
  'consent-no':()=>{A.ui.consentDenied=true;render()},
  'consent-ok':()=>{
    const c=A.create;const E=emptyEnv(c.name.trim()||'個人',c.kind);
    const me=newPerson(A.account.name,['管理者'],{account:A.account.email});E.people.push(me);E.meId=me.id;
    A.envs.unshift(E);A.cur=E.id;A.ui.consentDenied=false;A.stack=[];rep('created');
  },
  'ob-create':()=>{A.modal=null;A.create={kind:'company',name:''};nav('create-name')},
  'ob-join':()=>{A.modal=null;nav('join1')},
  'ob-normal':()=>{A.account=ACCOUNTS[2];A.envs=accountEnvs(A.account);A.cur=null;A.stack=[];resetDrafts();root('where')},
  'ob-to-init':()=>nav('init'),
  'init-pilot':()=>{A.init.isPilot=!A.init.isPilot;render()},
  'ob-init-done':()=>{
    const E=ENV();const me=E.people.find(p=>p.id===E.meId);const i=A.init;
    if(me){me.name=i.name||me.name;me.phone=i.phone;if(i.isPilot&&!me.roles.includes('操縦者'))me.roles.push('操縦者');if(!i.isPilot)me.roles=me.roles.filter(r=>r!=='操縦者');me.pilot=me.roles.includes('操縦者')}
    A.init=null;root('home');
  },
  'ob-join-pick':t=>{
    const j=JOINABLE.find(x=>x.id===t.dataset.id);A.join.pick=j;A.join.env=sampleCompanyEnv(j.name,j.kind,null);nav('join2');
  },
  'ob-join-code':()=>{const j=JOINABLE[0];A.join.pick=j;A.join.env=sampleCompanyEnv(j.name,j.kind,null);nav('join2')},
  'gaccess':t=>{A.gAccess=t.dataset.v;render()},
  'ob-join-go':()=>{if(A.gAccess==='none')return;nav('join3')},
  'ob-join-me':t=>{A.join.me=t.dataset.id;render()},
  'ob-join-done':()=>{
    const e=A.join.env;const m=A.join.me;
    if(m==='__new'){const p=newPerson(A.join.newName||A.account.name,[],{account:A.account.email});e.people.push(p);e.meId=p.id}
    else{e.meId=m;const p=e.people.find(x=>x.id===m);if(p&&!p.account)p.account=A.account.email}
    A.envs.unshift(e);A.cur=e.id;A.join=null;A.stack=[];resetDrafts();root('home');
  },
  'env':()=>openSheet(envSwitchSheet),
  'env-pick':t=>{A.modal=null;switchEnv(t.dataset.id);toast(envLabel(ENV())+'で使用中です。入力途中の内容は破棄しました')}
});
