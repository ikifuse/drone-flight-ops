'use strict';
/* ===================================================================
   はじめに（利用登録を始める／ログイン）／使い方の選択／Google Driveの許可／招待からの参加／使う場所の選択／自分の情報／DIPSのログイン情報（各種設定・管理から）
   設計の出典: 34a（§3 初回必須登録、§7 Googleアカウントから始める導線、§7.6 入口を1画面にまとめた訂正、§7.8 ホーム前を最小にした訂正、§8 DIPSログイン情報）／34h（表示名と文言の型）／30 §5（左右の役割）
   - 左側の画面は、実際のアプリとして利用者が見る画面の候補だけにする。
     テスト用のアカウント・状態の説明・確認用の注記・設計書の番号は出さない。
     それらは、右側の設計確認メモ（goal / doc / tmp / ask / mock）と、右側の状態切替にだけ置く。
   - Googleが表示する画面（アカウントの選択・Google Driveの許可）は、左側では「実際はGoogleが表示する」ことだけを示す。
   - 未決のもの（初回設定で何を必須にするか・DIPS設定の置き場所など）は完成品として決めず、右側に「未決」「比較したい案」を残す。
   =================================================================== */
function canWrite(){
  if(A.gAccess==='edit')return true;
  toast(A.gAccess==='view'?'保存できませんでした。この保存場所は、Google Driveで「閲覧のみ」になっています。入力した内容は画面に残っています。編集できるように、管理者に頼んでください。':'保存できませんでした。この保存場所が、あなたのGoogleアカウントに共有されていません。入力した内容は画面に残っています。管理者に、Google Driveで共有してもらってください。');
  return false;
}
function resetDrafts(){S=null;A.op=null;A.reg=null;A.nfResult=null;A.init=null;A.ui.hSel=null;A.dipsRet=null;A.ui.dform=null}
function switchEnv(id){A.cur=id;resetDrafts();root('home')}
function envRole(E){const p=E&&E.people.find(x=>x.id===E.meId);return p?(p.roles.length?p.roles.join('・'):'まだ決まっていません（管理者が決めます）'):'—'}
/* ログイン中のGoogleアカウントの表示。実際のアプリでは、利用者のメールアドレスが入る場所（ここでは薄い文字の例） */
const acctMail=()=>'<span class="ph">name@example.com</span>';
const bigCard=(act,title,sub,attrs)=>'<button class="card" style="width:100%;margin-bottom:8px" data-act="'+act+'" '+(attrs||'')+'><b>'+title+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</button>';

/* 右側の切替（Google認証のあとの状態）。gauth の確認用操作として出す */
function gstateMock(){
  const acc=ACCOUNTS.find(a=>a.id===A.ui.gState)||ACCOUNTS[0];const entry=A.entry==='login'?'ログイン':'利用登録を始める';
  const out={new:{new:'「どのように使いますか？」へ',login:'「ログインできませんでした」へ'},one:{new:'「すでに登録されています」へ',login:'そのままホームへ（使う場所が1つ）'},many:{new:'「すでに登録されています」へ',login:'「どこで使いますか？」へ（使う場所が複数）'}};
  const key=A.entry==='login'?'login':'new';
  return '<p class="note" style="margin:0 0 6px">左の［次へ］は、Googleの認証が終わってアプリに戻った状態を作るための、モック上の操作です。認証のあとの状態を選んでから押します。</p>'
   +'<div class="row"><label>認証のあとの状態</label>'+mockSeg('gstate',A.ui.gState,[['new','未登録'],['one','登録済み・個人だけ'],['many','登録済み・個人＋会社']])+'</div>'
   +'<p class="note" style="margin:0 0 4px">この状態で使う、架空のテスト用Googleアカウント: <span class="mono">'+esc(acc.email)+'</span></p>'
   +'<p class="note" style="margin:0">いまの入口: ［'+entry+'］ → この状態では、'+out[A.ui.gState][key]+'。</p>'
   +'<table style="margin-top:6px"><tr><th>状態</th><th>［利用登録を始める］から</th><th>［ログイン］から</th></tr>'
   +'<tr><td>未登録</td><td>使い方を選ぶ</td><td>ログインできませんでした</td></tr><tr><td>登録済み・個人だけ</td><td>すでに登録されています</td><td>ホーム</td></tr><tr><td>登録済み・個人＋会社</td><td>すでに登録されています</td><td>どこで使いますか？</td></tr></table>';
}

/* ---------- 最初の画面 ---------- */
def('boot',{t:'はじめに',st:'',back:false,env:false,
  goal:'完全な初回利用者が最初に見る画面。はじめて使う方は［利用登録を始める］、すでに登録済みの方は［ログイン］。説明だけの画面を別に置かず、この1画面にまとめ、それぞれのボタンの下に短い説明を置く。どちらを押しても、次はGoogleの認証・アカウント選択へ進む。',
  doc:'34a §7.2・§7.6（2026-09-22のオーナーの指示で、説明だけの画面を廃止し、初回の入口を1画面にまとめた）。内部では、この画面は未ログインの入口。認証済みを仮定した最初の画面、［新しい運用環境を作成］／［既存の運用環境に参加］の二択、説明だけの中間画面は、経緯（HISTORICAL）として34a §1・§7.6に残っている。',state:'proposal',
  tmp:['ボタンの文言（利用登録を始める／ログイン）と、その下の説明は、オーナーが2026-09-22に指示した文言そのもの（最終の製品用語ではない。PENDING-U-WORDING）','ログイン時に登録済みかを判定する方法は、Driveの保存場所の再発見方式に依存して未確定（PENDING-S5-ROOT-DISCOVERY）。アプリ独自の会員データベースを持つ決定ではない','「アカウント」という語と「利用登録」という語の使い分け（この画面のあとに出る「アカウントができました」など）は、今回の範囲外で未決'],
  ask:[],
  ui:['説明は1文ずつ改行し、それぞれのボタンのすぐ下に置いている','はじめて使う方を上、すでに登録済みの方を下に置き、色の付いた主ボタンは［利用登録を始める］だけにしている'],
  body:()=>'<div class="entry"><h2>はじめて使う方</h2><button class="btn primary wide" style="padding:16px 10px;font-size:16px" data-act="ob-start-new">利用登録を始める</button>'
   +'<p class="note">このアプリの利用登録を始めます。<br>お使いのGoogleアカウントで続けます。<br>新しいGoogleアカウントを作る必要はありません。<br>Googleのパスワードをこのアプリに入力することはありません。</p>'
   +'<h2 style="margin-top:26px">すでに登録済みの方</h2><button class="btn wide" style="padding:16px 10px;font-size:16px" data-act="ob-start-login">ログイン</button>'
   +'<p class="note">登録済みのGoogleアカウントで続けます。</p></div>'
});
def('gauth',{t:'Googleアカウントを選択します',st:'',env:false,
  goal:'Googleが表示する認証の画面。左側では、実際はGoogleが表示することだけを示し、アカウント選択の画面は再現しない。アプリはGoogleのパスワードを扱わない。',
  doc:'34a §7.2（順2）／§1・§6（Google公式の認証。サインインとAPI利用への同意は別）。',state:'accepted',
  tmp:['Googleの画面の再現は目的ではない。認証のあとの状態（未登録／登録済み・個人だけ／登録済み・個人＋会社）は、この右側の切替で選び、その状態で認証後のアプリ画面がどうなるかを確かめる','実際の画面・必要な権限の範囲は正式実装時にGoogleの仕様で確認（VERIFY-S5-GOOGLE-CONTRACT）'],
  ask:[],
  ui:['Googleの画面の前は入口の1画面、あとは認証の結果に応じた画面だけにして、間に確認の画面を足していない'],
  mock:gstateMock,
  body:()=>'<div class="gph"><b>Googleアカウントを選択します</b><span>実際の認証画面はGoogleが表示します。</span></div>',
  foot:()=>'<button class="btn" data-act="back">キャンセル</button><button class="btn primary" data-act="gauth-done">次へ</button>'
});
def('acct-exists',{t:'すでに登録されています',st:'',env:false,back:false,
  goal:'利用登録を始めようとしたGoogleアカウントが、すでに登録済みだったときの案内。',
  doc:'34a §7.2（案）。二重にアカウントを作らせない。',state:'proposal',tmp:['この分岐の文言は案。右側の切替（Google認証のあとの状態）を「登録済み」にして、［利用登録を始める］から進むと出る'],ask:[],ui:['問題→いまの状態→次の操作の順で1画面に出し、［ログインへ］を色の付いた主ボタンにしている'],
  body:()=>'<div class="msg warn big">すでに登録されています</div><p class="lead2">このGoogleアカウントは、すでにこのアプリで使っています。あらためて利用登録をする必要はありません。［ログイン］から進んでください。</p>',
  foot:()=>'<button class="btn" data-act="mk-reset">最初に戻る</button><button class="btn primary" data-act="ob-to-login">ログインへ</button>'
});
def('acct-none',{t:'ログインできませんでした',st:'',env:false,back:false,
  goal:'登録がないGoogleアカウントでログインしたときの案内。［利用登録を始める］へ誘導する。',
  doc:'34a §7.2（案）。問題／データ保護状態／次の操作の型（34h §6）。',state:'proposal',tmp:['この分岐の文言は案。右側の切替（Google認証のあとの状態）を「未登録」にして、［ログイン］から進むと出る'],ask:[],ui:['問題→いまの状態→次の操作の順で出し、［利用登録を始める］を色の付いた主ボタンにしている'],
  body:()=>'<div class="msg ng big">ログインできませんでした</div><p class="lead2">このGoogleアカウントでは、まだこのアプリを使い始めていません。まだ何も登録されていません。</p><p class="note">はじめて使う場合は、［利用登録を始める］から始めてください。</p>',
  foot:()=>'<button class="btn" data-act="mk-reset">最初に戻る</button><button class="btn primary" data-act="ob-to-new">利用登録を始める</button>'
});

/* ---------- 使い方の選択（アカウントを作ったあと） ---------- */
def('usage',{t:'どのように使いますか？',st:'',env:false,back:false,
  goal:'Googleアカウントの確認が終わったあと、個人で使うか、会社・団体で新しく使い始めるか、招待を受けているかを選ぶ。アプリ専用のIDやパスワードは作らない。',
  doc:'34a §7.2（順3）／§7.4（内部の対応：個人・会社団体の新規作成＝新規の運用環境の作成、招待＝既存の運用環境への所属の追加）／§7.7。最初に新しく作った人が最初の管理者になり、招待で参加しただけの人は自動では管理者にならない（31b）。2026-09-22にオーナーが確定：この画面では会社／スクール／臨時業務などの種類を分けて聞かず「会社・団体」にまとめる。招待で参加するときは参加先から分かるため、入口で種類を追加で尋ねない。3つの並びも現在のままとする。',state:'proposal',
  tmp:['3つの言葉（個人で使う／会社・団体で新しく使い始める／会社・団体から招待を受けている）はオーナー指示の例。最終の製品用語ではない（PENDING-U-WORDING）','内部では、個人・会社・スクール・臨時業務などを運用環境の種類として持つ（31a）。この画面で種類を聞かないことは、内部の区別をなくすことではない'],
  ask:[],
  ui:['「アカウントができました」ではなく「このGoogleアカウントで、このアプリを使い始めます」にしている。アプリ専用のIDを発行したように見せない（34a §7.8）','3つの並びは、個人で使う → 会社・団体で新しく使い始める → 会社・団体から招待を受けている（2026-09-22にオーナーが確定）','各ボタンの一言の説明の言い回し・改行・配置は、既存の画面に合わせた標準案','個人と会社・団体の両方を使う人は、あとから「どこで使いますか？」の画面の［＋ 会社・団体で新しく使い始める］で追加できる'],
  body:()=>'<p class="lead2">このGoogleアカウントで、このアプリを使い始めます。使い方を選んでください。</p>'
   +bigCard('us-personal','個人で使う','自分ひとりで使います')
   +bigCard('us-company','会社・団体で新しく使い始める','会社やスクールなどで使い始めます')
   +bigCard('us-invited','会社・団体から招待を受けている','すでに使っている会社・団体に参加します')
});
def('create-name',{t:'会社・団体の名前',st:'',env:false,
  goal:'新しく使い始める会社・団体の名前を決める。',
  doc:'34a §4・§7.2（順4）。同名の保存場所がDrive上にすでにないか確認する（root重複防止・再発見の方式は未確定＝PENDING-S5-ROOT-DISCOVERY）。',state:'proposal',
  tmp:['同じ名前の警告は、招待の一覧にある名前（○○株式会社）を入れると出る。見せ方は案','名前はあとから変えられる想定'],ask:[],ui:['名前は、Google Driveの許可を求める前に1画面で聞いている（何を作るのかが決まってから許可を求めるため）'],
  enter:()=>{if(!A.create||A.create.kind==='personal')A.create={kind:'company',name:''}},
  body:()=>{
    const c=A.create;const dup=JOINABLE.find(j=>j.name===c.name.trim());
    return '<div class="fld"><label>会社・団体名</label><input class="in" data-bind="&name" data-rerender="1" value="'+esc(c.name)+'" placeholder="例：○○株式会社"></div>'
     +(dup?'<div class="msg warn"><b>同じ名前の会社・団体が、すでにGoogle Driveにあるようです。</b>新しく作ると二重になります。招待を受けている場合は、招待から参加してください。<br><button class="btn sm" data-act="ob-join">招待を受けている会社・団体に参加する</button></div>':'');
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="cr-name-next">次へ</button>'
});
def('consent',{t:'Google Driveの許可',st:'',env:false,
  goal:'記録の保存場所を作るために、Google Driveの使用を許可してもらう。許可されなければ、何も作らない。左側は、実際はGoogleが許可の画面を表示することだけを示している。',
  doc:'34a §1・§7.2（順4）。新規作成では、Google公式の同意を経て必要な権限が許可された後に、保存構造を生成する。許可を拒否したとき・途中で失敗したときの戻り方と回復は未確定（34a §4項目7）。',state:'accepted',
  tmp:['許可されたときの結果は、この右側の切替（Google Driveの許可）で選ぶ。「許可しない」を選んで［許可して続ける］を押すと、拒否されたときの画面を確かめられる','実際の同意画面と必要な権限の範囲は、正式実装時にGoogleの仕様で確認（VERIFY-S5-GOOGLE-CONTRACT）','許可を求める時点（新しく始めるときのみか、招待で参加する人にも求めるか）は未確定',],
  ask:['Google Driveの許可が拒否された・途中で失敗したときに、作りかけの保存場所をどう扱い、どこから再開するか（34a §4項目7の未確定）'],
  ui:['拒否されたときは、同じ画面に問題→いまの状態（まだ何も作っていない）→次の操作の順で出している'],
  mock:()=>'<p class="note" style="margin:0 0 6px">Googleの許可の画面で選ばれる結果を選びます。</p><div class="row"><label>許可の結果</label>'+mockSeg('consentres',A.ui.consentOk?1:0,[[1,'許可する'],[0,'許可しない']])+'</div>',
  body:()=>{
    const c=A.create;const denied=A.ui.consentDenied;
    return '<p class="lead2">記録を保存するために、'+(c.kind==='personal'?'あなたの':'「'+esc(c.name)+'」の')+'Google Driveを使います。</p><p class="note">許可の画面は、Googleが表示します。</p>'
     +(denied?'<div class="msg ng"><b>保存場所を作れませんでした。</b>Google Driveの使用が許可されなかったためです。まだ何も作っていません。もう一度やり直すときは、［許可して続ける］を押してください。</div>':'');
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="consent-ok">許可して続ける</button>'
});
/* ---------- DIPSのログイン情報（はじめに登録／各種設定・管理から登録・変更／通報の直前にその場で登録） ---------- */
function dipsForm(){
  const d=A.ui.dform||(A.ui.dform={id:A.dips.id||'',pw:''});const show=!!A.ui.pwShow;const reg=A.dips.registered;
  return (A.dipsRet?'<div class="msg info"><b>「'+esc(A.dipsRet.label)+'」の途中です。</b>登録が終わると、元の画面に戻ります。</div>':'')
   +'<div class="fld"><label>DIPSログインID</label><input class="in" data-bind="#dform.id" autocomplete="off" inputmode="numeric" value="'+esc(d.id)+'" placeholder="例：1234567890"></div>'
   +'<div class="fld"><label>DIPSパスワード</label><div class="pwrow"><input class="in" data-bind="#dform.pw" autocomplete="new-password" type="'+(show?'text':'password')+'" value="'+esc(d.pw)+'" placeholder="'+(reg?'変更するときだけ入力':'パスワードを入力')+'"><button class="btn sm" data-act="dips-show">'+(show?'非表示':'表示')+'</button></div></div>'
   +(reg?'<p class="note">登録済みです。</p>':'');
}
const DIPS_MEMO={
  goal:'DIPSにログインするためのID・パスワードを、アプリに登録する。パスワードは伏字で、［表示］／［非表示］で切り替えられる。',
  doc:'34a §8（オーナーの2026-09-22の指示：DIPSログインID・パスワードをアプリに登録・保存できる方針）／34h §10（表示の案）。初回設定・各種設定・管理・通報の直前のその場登録の3か所から、同じ画面で登録・変更する。',state:'proposal',
  tmp:['保存する方針はオーナーの指示で、AIの判断では変えない。次は未決（PENDING-S5-DIPS-LOGIN-STORAGE）：どこへ保存するか／暗号化の方式／端末ごとか共有か／Google Drive・Sheetsへどう持つか／複数人が使うとき誰が見られるか／自動ログインに使うか／API認証との関係／削除・無効化の扱い／個人ごとか使う場所ごとか','このモックは、入力した内容を保存も送信もしない。登録したかどうかと、IDだけを覚えている。パスワードの文字は、登録した時点で消す。本物のID・パスワードは入れないこと','保存の可否は、Google Driveの共有状態（閲覧のみ・未共有）とは結び付けていない（保存先が未決のため）','AGENTS.md §6.3・16 §1（クライアントへ機密を出さない原則）との関係は、保存方式の決定まで未決。アプリ固有の機密（API client_secret）とは別の秘密として扱う'],
  ask:['DIPSのログインID・パスワードのほかに、何を登録させるか（DIPSのアカウント種別など）'],
  ui:['記入例は薄い文字（placeholder）で置き、パスワードは伏字にして［表示］／［非表示］で切り替えられるようにしている','登録の削除・変更は、各種設定・管理の同じ画面から行う形にしている']
};
/* ---------- 自分の情報（各種設定・管理から） ---------- */
def('set-me',{t:'自分の情報',st:'',
  goal:'自分の氏名・電話・操縦者かどうかを登録する。各種設定・管理から、必要になったときに登録できる。ホームへ入る前に求めない。',
  doc:'34a §3・§7.8（ホームへ入る前に一括の初期設定を置かない。事前登録は各種設定・管理から）／31a §2・31c（人物とGoogleアカウントは別。Googleで認証した人を自動で操縦者にしない）。',state:'proposal',
  tmp:['この画面の項目（氏名・電話・操縦者かどうか）は案','氏名の記入例（山田 太郎）は入力例であり、登録済みの値ではない'],
  ask:['氏名を必須にするか（あとの通報の連絡先などに使う）','電話番号を自分の情報として登録・保存するか（通報の連絡先に使うか）'],
  ui:['入力欄は、氏名 → 電話番号 → 操縦者としても登録する、の順に置いている'],
  enter:()=>{const E=ENV();const me=E.people.find(p=>p.id===E.meId);A.init={name:me?me.name:'',phone:me&&me.phone||'',isPilot:!!(me&&me.pilot)}},
  body:()=>{const i=A.init||(A.init={name:'',phone:'',isPilot:false});
    return '<div class="fld"><label>氏名</label><input class="in" data-bind="%name" value="'+esc(i.name)+'" placeholder="例：山田 太郎"></div>'
     +'<div class="fld"><label>電話番号（任意）</label><input class="in" data-bind="%phone" value="'+esc(i.phone)+'" placeholder="例：090-1234-5678"></div>'
     +'<button class="tgl'+(i.isPilot?' sel':'')+'" data-act="me-pilot"><span class="box">'+(i.isPilot?'✓':'')+'</span><span>操縦者としても登録する</span></button>';
  },
  foot:()=>'<button class="btn" data-act="me-cancel">キャンセル</button><button class="btn primary" data-act="me-save">登録する</button>'
});

/* ---------- 招待を受けている会社・団体に参加する（3画面） ---------- */
def('join1',{t:'招待を受けている会社・団体',st:'1/3',env:false,
  goal:'招待を受けている会社・団体を選んで参加する。新しく保存場所は作らない。',
  doc:'34a §1・§7.2（招待の場合）。既存の運用環境への参加では、新しい保存構造を作らず、参加者本人のGoogleアカウントを既存の環境へ結び付ける。招待の手段は選定していない（34a §4項目5）。',state:'spec',
  tmp:['招待の手段は未決（Drive共有から探す／招待コード／リンク）。ここでは「共有されている一覧から選ぶ」と「招待コードで探す」の2通りを並べて、比べられるようにしている','見つかる会社・団体は固定の仮データ（○○株式会社・○○スクール）。実際は、Googleアカウントに共有されているものが出る'],
  ask:['招待で参加する手段（Google Driveの共有から探す／招待コード／リンク）。誰が参加できるかの決まり方が変わる（34a §4項目5は未選定）'],
  ui:['いまは、共有された一覧と招待コードの両方を1画面に並べて比べられるようにしている'],
  enter:()=>{A.join={pick:null,env:null,code:'',me:null,newName:''}},
  body:()=>'<p class="lead2">参加する会社・団体を選んでください。</p>'
   +'<div class="cards">'+JOINABLE.map(j=>'<button class="card" data-act="ob-join-pick" data-id="'+j.id+'"><b>'+esc(j.name)+'</b><span>メンバー '+j.members+'人</span></button>').join('')+'</div>'
   +'<div class="fld" style="margin-top:14px"><label>招待コードで探す</label><div class="pwrow"><input class="in" data-bind="$code" placeholder="例：ABCD-1234" value=""><button class="btn sm" data-act="ob-join-code">探す</button></div></div>'
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
  tmp:['「どこで使いますか？」はオーナー指示の例。カードには個人／会社・団体の実際の名称を出す。カードの名称・役割は仮データ','専用の画面にするか、ホームの中に置くかは未決（PENDING-S2-ENVIRONMENT-UI）。意味は変わらないため、いまは専用の画面とホームの［切り替える］の両方を確認できるようにしている'],
  ask:['前回使った場所を自動で開くか、毎回選ばせるか（記録の保存先を取り違えないため）'],
  ui:['カードは実際の名称で並べ、前回使った場所に印を付けている'],
  body:()=>'<p class="lead2">今回使う場所を選んでください。</p>'+whereCards()
   +'<div class="row" style="margin-top:12px"><button class="btn sm" data-act="ob-create">＋ 会社・団体で新しく使い始める</button><button class="btn sm" data-act="ob-join">招待を受けている会社・団体に参加する</button></div>'
});
function envSwitchSheet(){
  return '<h3>どこで使いますか？</h3><p class="note">切り替えると、入力途中の内容は破棄され、選んだ場所のホームへ移ります。</p>'+whereCards()
   +'<div class="row"><button class="btn sm" data-act="ob-create">＋ 会社・団体で新しく使い始める</button><button class="btn sm" data-act="ob-join">招待を受けている会社・団体に参加する</button></div>'
   +'<div class="row"><button class="btn" data-act="close">閉じる</button></div>';
}

/* ---------- 操作 ---------- */
function afterLoginRegistered(){if(!A.ui.dipsSet)A.dips={registered:true,id:'1234567890'}}
Object.assign(ACTS,{
  'ob-start-new':()=>{A.entry='new';nav('gauth')},
  'ob-start-login':()=>{A.entry='login';nav('gauth')},
  'ob-to-login':()=>{A.entry='login';rep('gauth')},
  'ob-to-new':()=>{A.entry='new';rep('gauth')},
  /* Google認証が終わって戻った状態。どの状態かは、右側の切替（Google認証のあと）で選ぶ */
  'gauth-done':()=>{
    const acc=ACCOUNTS.find(a=>a.id===A.ui.gState)||ACCOUNTS[0];A.account=acc;
    if(A.entry!=='login'){
      if(acc.id==='new'){A.stack=['boot'];rep('usage')}else rep('acct-exists');
      return;
    }
    if(acc.id==='new'){rep('acct-none');return}
    A.envs=accountEnvs(acc);afterLoginRegistered();
    if(A.envs.length===1){A.cur=A.envs[0].id;resetDrafts();root('home');toast(envLabel(A.envs[0])+'で使用中です')}
    else{A.cur=null;root('where')}
  },
  'us-personal':()=>{A.create={kind:'personal',name:'個人'};A.ui.consentDenied=false;nav('consent')},
  'us-company':()=>{A.create={kind:'company',name:''};nav('create-name')},
  'us-invited':()=>nav('join1'),
  'cr-name-next':()=>{if(!A.create.name.trim()){toast('会社・団体の名前を入れてください');return}A.ui.consentDenied=false;nav('consent')},
  'consent-ok':()=>{
    if(!A.ui.consentOk){A.ui.consentDenied=true;render();return}
    const c=A.create;const E=emptyEnv(c.name.trim()||'個人',c.kind);
    const me=newPerson('',['管理者'],{account:(A.account&&A.account.email)||''});E.people.push(me);E.meId=me.id;
    A.envs.unshift(E);A.cur=E.id;A.ui.consentDenied=false;A.stack=[];resetDrafts();root('home');
    toast(c.kind==='personal'?'個人で使い始めました。記録の保存場所を、あなたのGoogle Driveに作りました':'「'+E.name+'」で使い始めました。あなたが最初の管理者です');
  },
  'ob-create':()=>{A.modal=null;A.create={kind:'company',name:''};nav('create-name')},
  'ob-join':()=>{A.modal=null;nav('join1')},
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
    if(me){me.name=i.name.trim();me.phone=i.phone;if(i.isPilot&&!me.roles.includes('操縦者'))me.roles.push('操縦者');if(!i.isPilot)me.roles=me.roles.filter(r=>r!=='操縦者');me.pilot=me.roles.includes('操縦者')}
    A.init=null;back();toast('自分の情報を登録しました');
  },
  'ob-join-pick':t=>{
    const j=JOINABLE.find(x=>x.id===t.dataset.id);A.join.pick=j;A.join.env=sampleCompanyEnv(j.name,j.kind,null);nav('join2');
  },
  'ob-join-code':()=>{const j=JOINABLE[0];A.join.pick=j;A.join.env=sampleCompanyEnv(j.name,j.kind,null);nav('join2')},
  'ob-join-go':()=>{if(A.gAccess==='none')return;nav('join3')},
  'ob-join-me':t=>{A.join.me=t.dataset.id;render()},
  'ob-join-done':()=>{
    const e=A.join.env;const m=A.join.me;const mail=(A.account&&A.account.email)||'';
    if(m==='__new'){const p=newPerson(A.join.newName||'',[],{account:mail});e.people.push(p);e.meId=p.id}
    else{e.meId=m;const p=e.people.find(x=>x.id===m);if(p&&!p.account)p.account=mail}
    A.envs.unshift(e);A.cur=e.id;A.join=null;A.stack=[];resetDrafts();root('home');
  },
  'env':()=>openSheet(envSwitchSheet),
  'env-pick':t=>{A.modal=null;switchEnv(t.dataset.id);toast(envLabel(ENV())+'で使用中です。入力途中の内容は破棄しました')}
});
