'use strict';
/* ===================================================================
   起動・初回（作成／参加）・環境の選択  — 設計の出典: 34a
   Googleの認証は済んでいるものと仮定（アプリ独自の認証処理は作らない）
   =================================================================== */
const KIND_DEFAULT={personal:'個人運用環境',company:'会社運用環境',school:'スクール運用環境',temp:'臨時業務の運用環境'};
function canWrite(){
  if(A.gAccess==='edit')return true;
  toast(A.gAccess==='view'?'この環境のGoogle Driveは「閲覧のみ」のため、保存できません（Google側の実アクセスは、アプリの権限とは別に効きます）':'この環境は、あなたのGoogleアカウントに共有されていないため、保存できません');
  return false;
}
function resetDrafts(){S=null;A.op=null;A.reg=null;A.nfResult=null;A.init=null;A.ui.hSel=null}
function switchEnv(id){A.cur=id;resetDrafts();root('home')}
function envRole(E){const p=E&&E.people.find(x=>x.id===E.meId);return p?(p.roles.length?p.roles.join('・'):'役割: 未設定（管理者が設定）'):'—'}

/* ---------- 起動：作成か参加か ---------- */
def('boot',{t:'はじめに',st:'初回の入口',back:false,env:false,
  goal:'初回は「新しい運用環境を作成」か「既存の運用環境に参加」から始める。',
  doc:'34a §1・§4（初回セットアップ画面の10項目）。Googleの認証は、アプリ独自の画面でメール・パスワードを入力させず、Google公式の認証・同意を使う。',state:'spec',
  tmp:['Googleの認証は済んだものと仮定して、このモックでは認証の画面を作らない','再ログイン・再インストール・端末変更で既存の環境がある場合の見せ方（root重複防止）は未確定（PENDING-S5-ROOT-DISCOVERY）'],
  ask:['この二択の見せ方でよいか','通常の起動（環境が既にある）とこの画面の分け方'],
  body:()=>'<div class="msg ok">Googleアカウントで<b>認証済み</b>として進みます（仮定）。<br><span class="mono">'+esc(A.account.email)+'</span><br><span class="note">アプリ独自のログイン画面（メール・パスワード入力）は作りません。</span></div>'
   +'<h2>はじめに</h2><p class="lead">どちらから始めますか？</p>'
   +'<button class="card" style="width:100%;margin-bottom:10px" data-act="ob-create"><b>＋ 新しい運用環境を作成</b><span>あなたのGoogle Driveに、運用の記録を入れるフォルダーを作ります。最初のアプリ管理者はあなたになります。</span></button>'
   +'<button class="card" style="width:100%;margin-bottom:10px" data-act="ob-join"><b>既存の運用環境に参加</b><span>会社などで、すでにある運用環境に加わります。新しくフォルダーは作りません。</span></button>'
   +'<div class="sec" style="margin-top:14px"><h3>すでに環境をお持ちの場合 '+tmpChip+'</h3><p class="lead" style="margin:0 0 8px">再起動・再ログインしたときは、作成ではなく「環境の選択」から入ります。その画面を確認できます。</p><button class="btn sm" data-act="ob-normal">通常の起動（環境を選ぶ）を見る</button></div>'
});

/* ---------- 新しい環境を作る（3画面） ---------- */
def('create1',{t:'新しい運用環境を作成',st:'1/3 種類と名前',env:false,
  goal:'どんな環境かと名前を決める。個人・会社・スクール・臨時業務など、同じアプリで切り替えて使う。',
  doc:'34a §4／31a §4（環境の種類と、環境ごとにroot・正本を切り替える）。',state:'spec',
  tmp:['環境名の初期値は原本に確定がない（種類ごとの仮の名前を入れている）','同じ名前の環境がすでにある場合の見せ方（root重複防止）は仮の表示'],
  ask:['環境の種類を最初に選ばせるか、名前だけでよいか'],
  enter:()=>{A.create={kind:'personal',name:KIND_DEFAULT.personal}},
  body:()=>{
    const c=A.create;const dup=JOINABLE.find(j=>j.name===c.name);
    return '<div class="sec"><h3>環境の種類</h3><div class="cards">'+KINDS.map(k=>'<button class="card'+(c.kind===k[0]?' sel':'')+'" data-act="cr-kind" data-k="'+k[0]+'"><b>'+(c.kind===k[0]?'✓ ':'')+esc(k[1])+'</b><span>'+esc(k[2])+'</span></button>').join('')+'</div></div>'
     +'<div class="sec"><h3>環境の名前</h3><div class="row"><input class="in" data-bind="&name" data-rerender="1" value="'+esc(c.name)+'"></div><p class="note">あとから変えられる想定です。同じ人が、個人用と会社用など複数の環境を持てます。</p>'
     +(dup?'<div class="msg warn"><b>同じ名前の環境が、すでにGoogle Driveにあります。</b>新しく作ると重複します。<br><button class="btn sm" data-act="ob-join">その環境へ参加する（作成しない）</button> '+tmpChip+'</div>':'<div class="msg info">同じ名前の環境がDrive上にないか確認します（確認方法は未確定・仮の表示）。</div>')+'</div>';
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-next-consent">次へ：Googleの許可</button>'
});
def('create2',{t:'Googleの許可',st:'2/3 Google公式の画面（仮の表示）',env:false,
  goal:'Google公式のアカウント選択・同意を経て、必要な権限が許可されたあとに、フォルダーを作る。',
  doc:'34a §1・§2（公式の認証・同意。アプリ独自画面でGoogleのメール・パスワードを入力させない）。',state:'accepted',
  tmp:['実際のGoogleの画面はGoogleが表示する。ここは「そういう画面が入る」ことを示す仮の表示','許可が拒否された場合・途中で失敗した場合の戻り方と回復は未確定（PENDING）','必要な権限の範囲（drive.fileが第一候補）は正式実装時に確認（VERIFY-S5-GOOGLE-CONTRACT）'],
  ask:['許可を拒否した場合に、何を見せて、どこへ戻すか'],
  body:()=>'<div class="gbox"><div class="gh">Googleアカウントで許可する内容（仮の表示）</div><p style="margin:0 0 6px">アカウント: <span class="mono">'+esc(A.account.email)+'</span></p><p style="margin:0 0 6px">このアプリに、次のことを許可しますか。</p><ul style="margin:0 0 6px;padding-left:1.2em"><li>このアプリが作った、Google Driveのフォルダーとファイルの作成・表示・編集</li></ul><p class="note" style="margin:0">Googleのパスワードは、このアプリには渡りません。</p></div>'
   +'<p class="note">許可すると、あなたのGoogle Driveに、この環境の記録用フォルダー（人員・機体・バッテリー・運航記録・点検整備記録・DIPS関連・出力）を作ります。「PWAをホーム画面へ追加しただけ」では作りません。</p>',
  foot:()=>'<button class="btn" data-act="ob-consent-no">許可しない</button><button class="btn primary" data-act="ob-consent-ok">許可して作成する</button>'
});
def('create3',{t:'環境を作成しました',st:'3/3 作成の結果',env:false,back:false,
  goal:'作成できたことと、最初のアプリ管理者が自分であることを示し、はじめの設定へ進む。',
  doc:'34a §1（新環境には本番rootと確定済み01〜07の構造を生成。一般利用者へ設計管理資料は生成しない）／31b §3（最初に認証して作成したアカウントが最初のアプリ管理者）。',state:'accepted',
  tmp:['作成の進み具合の見せ方（一括か、順に見せるか）は仮','フォルダー名（01〜07の表記）は責任領域の表記であり、製品名の確定ではない'],
  ask:['作成後に必ず「はじめの設定」を挟むか、すぐホームでよいか'],
  body:()=>{const E=ENV();return '<div class="msg ok big">✓ 「'+esc(E.name)+'」を作成しました</div>'
   +'<div class="sec"><h3>作られたフォルダー</h3>'+[['01','人員'],['02','機体'],['03','バッテリー'],['04','運航記録'],['05','点検整備記録'],['06','DIPS関連'],['07','出力（PDF・KML）']].map(x=>'<div class="step"><span class="n">✓</span><span><b>'+x[0]+'</b> '+x[1]+'</span></div>').join('')+'<p class="note">設計の管理用資料などは、利用者の環境には作りません。</p></div>'
   +'<div class="sec"><h3>最初のアプリ管理者</h3><p class="lead" style="margin:0"><b>'+esc(A.account.name)+'</b>（'+esc(A.account.email)+'）が、この環境の最初のアプリ管理者です。管理者の追加・解除は、管理者だけが行えます。</p></div>';},
  foot:()=>'<button class="btn primary" data-act="ob-to-init">はじめの設定へ</button>'
});

/* ---------- はじめの設定（何も必須にしない案） ---------- */
const INIT_ROWS=[['aircraft','✈','機体','あなたが飛ばす機体'],['permit','📄','許可・承認','包括許可・個別承認など'],['insurance','🛡','保険','賠償責任保険など'],['contact','☎','連絡先','DIPSに載せる連絡先'],['preset','📍','現場プリセット','よく行く現場の範囲・高度']];
const countOf=(E,t)=>({aircraft:E.aircraft.length,person:E.people.length,permit:E.permits.length,insurance:E.insurance?1:0,contact:E.contact?1:0,preset:E.presets.length,bat:E.bats.length})[t]||0;
def('init',{t:'はじめの設定',st:'あとでも、飛行の途中でも登録できます',env:false,back:false,
  goal:'最初に決めておくことを最小にして、ホームへ進む。機体・操縦者などは、飛行を始めるときにその場で登録できる。',
  doc:'34a §3。初回の操縦者登録は強制しない（CURRENT-ACCEPTED）。場所・機体・BATなども「まず選択→なければその場で新規登録→元の処理へ戻る」は候補（CURRENT-PROPOSAL）。初回に何を必須にするかはPENDING-S5-INITIAL-REQUIRED。',state:'proposal',
  tmp:['「何も必須にしない」案を見せている。最低1機を必須にする案・全マスター任意の案のどちらにするかは未確定（PENDING-S5-INITIAL-REQUIRED）','あなたの情報（氏名・電話）を最初に聞くかは仮','「操縦者でもある」は、Googleの認証者を自動で操縦者にしないための、明示の選択'],
  ask:['この画面は必要か（すぐホームでよいか）','登録しておくと便利なものの並びと、何を初回から見せるか'],
  enter:()=>{const E=ENV();const me=E.people.find(p=>p.id===E.meId);A.init={name:me?me.name:'',phone:me&&me.phone||'',isPilot:!!(me&&me.pilot)}},
  body:()=>{
    const E=ENV(),i=A.init;
    return '<div class="msg info">ここでの登録は、<b>すべて任意</b>です。何も登録せずホームへ進めます。飛行を始めるときに、足りないものをその場で登録できます。</div>'
     +'<div class="sec"><h3>あなた</h3><div class="row"><label>氏名</label><input class="in" data-bind="%name" value="'+esc(i.name)+'"></div><div class="row"><label>電話</label><input class="in" data-bind="%phone" value="'+esc(i.phone)+'" placeholder="任意"></div>'
     +'<button class="tgl'+(i.isPilot?' sel':'')+'" data-act="init-pilot" style="margin-top:6px"><span class="box">'+(i.isPilot?'✓':'')+'</span><span>私は操縦者でもある<br><small class="note">オンにすると、飛行を始めるときに毎回選ぶ手間が減ります。Google認証者が自動で操縦者になるわけではありません。</small></span></button></div>'
     +'<div class="sec"><h3>登録しておくと便利なもの <small>任意</small></h3>'+INIT_ROWS.map(r=>{const n=countOf(E,r[0]);return '<div class="li"><span class="ico">'+r[1]+'</span><span class="tx"><b>'+r[2]+'</b><small>'+r[3]+'</small></span>'+(n?'<i class="chip ok">登録済み '+n+'</i>':'<i class="chip">未登録</i>')+'<button class="btn sm" data-act="reg-open" data-t="'+r[0]+'" data-from="init">いま登録</button></div>'}).join('')+'<p class="note">あとから、ホームの［各種設定・管理］でも登録できます。</p></div>';
  },
  foot:()=>'<button class="btn primary" data-act="ob-init-done">ホームへ</button>'
});

/* ---------- 既存の環境に参加（3画面） ---------- */
def('join1',{t:'既存の運用環境に参加',st:'1/3 環境を探す',env:false,
  goal:'すでにある運用環境を選んで加わる。新しいフォルダー（root）は作らない。',
  doc:'34a §1・§4（既存環境への参加では新rootを作らず、参加者本人のGoogleアカウントを既存環境へ紐付ける）。参加の手段（招待コード等）は選定していない。',state:'spec',
  tmp:['参加の手段（Drive共有から探す／招待コード／リンク）は未選定。ここでは2通りを仮に並べている','見つかる環境は固定のダミー'],
  ask:['参加の入口は何が自然か（共有された環境の一覧／コード入力）'],
  enter:()=>{A.join={pick:null,env:null,code:'',me:null,newName:A.account.name}},
  body:()=>'<div class="sec"><h3>Google Driveで共有されている環境 '+tmpChip+'</h3><p class="lead">あなたのGoogleアカウントに共有されている環境の候補です。</p><div class="cards">'+JOINABLE.map(j=>'<button class="card" data-act="ob-join-pick" data-id="'+j.id+'"><b>'+esc(j.name)+'</b><span>'+esc(KIND_NAME(j.kind))+' ／ 管理者: '+esc(j.admin)+'</span><span>メンバー '+j.members+'人</span></button>').join('')+'</div></div>'
   +'<div class="sec"><h3>招待コードで探す '+tmpChip+'</h3><div class="row"><input class="in" data-bind="$code" placeholder="例: SAMPLE-CODE" value=""><button class="btn sm" data-act="ob-join-code">探す</button></div><p class="note">コードを入れると、上の候補の最初の環境が見つかります（モックの動き）。</p></div>'
   +'<div class="msg info">参加の方式から、Driveの自動共有や、アプリ独自の承認は決めていません。誰が何を操作できるかは、業務上の役割・アプリの権限・Google Driveの実アクセスの三層で別々に決まります（31b）。</div>'
});
def('join2',{t:'参加の確認',st:'2/3',env:false,
  goal:'参加する環境と、Google Driveの共有状態を確認する。',
  doc:'34a §1／31b §2・31d §3（アプリ内の所属とGoogle共有は別処理。所属できても、Google側に権限がなければ読み書きできない）。',state:'accepted',
  tmp:['Google側の共有状態の切替は、三層権限の違いを見るためのモックの操作','共有されていない場合の案内文は仮'],
  ask:['共有されていない環境を選んだときに、何を見せるか'],
  body:()=>{
    const j=A.join.pick;const g=A.gAccess;
    return '<div class="sec"><h3>'+esc(j.name)+'</h3><table class="kv"><tr><td>種類</td><td>'+esc(KIND_NAME(j.kind))+'</td></tr><tr><td>管理者</td><td>'+esc(j.admin)+'</td></tr><tr><td>メンバー</td><td>'+j.members+'人</td></tr></table><p class="note">新しくフォルダーは作りません。あなたのGoogleアカウントを、この環境に紐付けます。</p></div>'
     +'<div class="sec"><h3>Google Driveの共有状態 '+tmpChip+'</h3><p class="lead">（モックの操作）実際はGoogle側の共有設定で決まります。</p><div class="pills">'+[['edit','編集できる'],['view','閲覧のみ'],['none','共有されていない']].map(x=>'<button class="pill'+(g===x[0]?' sel':'')+'" data-act="gaccess" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'
     +(g==='none'?'<div class="msg ng">この環境のフォルダーは、あなたのGoogleアカウントに共有されていません。管理者に、Google Driveでの共有を依頼してください。（アプリ内の「参加」とGoogleの共有は別の操作です）</div>':g==='view'?'<div class="msg warn">閲覧のみです。参加はできますが、記録や登録の保存はできません。編集が必要なら、管理者にGoogle側の権限変更を依頼します。</div>':'<div class="msg ok">編集できます。</div>')+'</div>';
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-join-go"'+(A.gAccess==='none'?' disabled':'')+'>参加する</button>'
});
def('join3',{t:'あなたは誰ですか',st:'3/3 人物の紐付け',env:false,
  goal:'この環境の人員のうち、自分に当たる人を選ぶ。まだ登録がなければ新しい人物として登録する。',
  doc:'31a §2（人物とGoogleアカウントは別。アカウントのない補助者なども人物として登録される）／31b §3（役割・管理者は管理者が決める）。',state:'accepted',
  tmp:['役割（操縦者・補助者など）は、管理者が設定する想定。参加者自身で管理者にはなれない','人物の紐付けの画面構成は未確定（PENDING-S2-MEMBERSHIP）'],
  ask:['既存の人員から選ぶ／新しく登録、の見せ方'],
  body:()=>{
    const e=A.join.env;const m=A.join.me;
    return '<p class="lead">「'+esc(e.name)+'」に、すでに登録されている人員です。あなたに当たる人を選んでください。</p>'
     +'<div class="cards">'+e.people.map(p=>'<button class="card'+(m===p.id?' sel':'')+'" data-act="ob-join-me" data-id="'+p.id+'"><b>'+(m===p.id?'✓ ':'')+esc(p.name)+'</b><span>'+esc(p.roles.join('・')||'役割未設定')+'</span></button>').join('')
     +'<button class="card'+(m==='__new'?' sel':'')+'" data-act="ob-join-me" data-id="__new"><b>'+(m==='__new'?'✓ ':'')+'新しい人物として登録</b><span>まだ人員に登録されていない場合</span></button></div>'
     +(m==='__new'?'<div class="sec" style="margin-top:8px"><div class="row"><label>氏名</label><input class="in" data-bind="$newName" value="'+esc(A.join.newName)+'"></div><p class="note">役割は、あとで管理者が設定します。</p></div>':'')
     +'<div class="msg info">選んだ人物に、あなたのGoogleアカウント（'+esc(A.account.email)+'）を紐付けます。人物を選んでも、Driveの権限や管理者の権限は変わりません。</div>';
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="ob-join-done"'+(A.join.me?'':' disabled')+'>ホームへ</button>'
});

/* ---------- 通常起動：環境の選択（複数の環境に所属するとき） ---------- */
def('envsel',{t:'運用環境を選ぶ',st:'通常の起動',env:false,back:false,
  goal:'複数の環境に所属しているときに、今回使う環境を取り違えずに選ぶ。',
  doc:'34a §5／31a §4。前回使った環境を初期にする方向はCURRENT-PROPOSAL。専用の選択画面にするか、ホームの中に置くかは未確定（PENDING-S2-ENVIRONMENT-UI）。',state:'spec',
  tmp:['この専用画面案と、ホームの環境ボタンからの切替（もう一つの案）の両方を試せる','所属が1つだけの環境では、この画面を出さない（環境名の常時表示も省略できる）'],
  ask:['専用画面か、ホームの中か','前回の環境を自動で開くか、毎回選ぶか'],
  body:()=>'<p class="lead">所属している環境が複数あります。使う環境を選んでください。前回使った環境を初期の候補にします（案）。</p>'
   +A.envs.map((e,i)=>'<button class="li'+(i===0?' acc':'')+'" data-act="env-pick" data-id="'+e.id+'"><span class="ico">🏢</span><span class="tx"><b>'+esc(e.name)+'</b><small>'+esc(KIND_NAME(e.kind))+' ／ あなたの役割: '+esc(envRole(e))+'</small></span>'+(i===0?'<i class="chip info">前回使用</i>':'')+'<span class="go">›</span></button>').join('')
   +'<div class="sec" style="margin-top:12px"><h3>別の環境を追加</h3><div class="row"><button class="btn sm" data-act="ob-create">＋ 新しい運用環境を作成</button><button class="btn sm" data-act="ob-join">既存の運用環境に参加</button></div></div>'
});

/* ---------- 環境の切替（ホームのボタンなどから） ---------- */
function envSwitchSheet(){
  return '<h3>運用環境を切り替える</h3><p class="note">切り替えると、入力途中の内容は破棄され、選んだ環境のホームへ移ります（未保存の作業の扱いは未確定 — PENDING）。</p>'
   +A.envs.map(e=>'<button class="tgl'+(A.cur===e.id?' sel':'')+'" data-act="env-pick" data-id="'+e.id+'"><span class="box">'+(A.cur===e.id?'✓':'')+'</span><span><b>'+esc(e.name)+'</b><br><small class="note">'+esc(KIND_NAME(e.kind))+' ／ '+esc(envRole(e))+'</small></span></button>').join('')
   +'<div class="row"><button class="btn sm" data-act="ob-create">＋ 新しい運用環境を作成</button><button class="btn sm" data-act="ob-join">既存の運用環境に参加</button></div>'
   +'<div class="row"><button class="btn" data-act="close">閉じる</button></div>';
}

Object.assign(ACTS,{
  'ob-create':()=>{A.modal=null;nav('create1')},
  'ob-join':()=>{A.modal=null;nav('join1')},
  'ob-normal':()=>{const a=samplePersonalEnv(),b=sampleCompanyEnv('会社運用環境（サンプル）','company','q1');A.envs=[a,b];A.cur=null;root('envsel')},
  'cr-kind':t=>{const c=A.create;const wasDefault=Object.values(KIND_DEFAULT).includes(c.name);c.kind=t.dataset.k;if(wasDefault)c.name=KIND_DEFAULT[c.kind];render()},
  'ob-next-consent':()=>{if(!A.create.name.trim()){toast('環境の名前を入れてください');return}nav('create2')},
  'ob-consent-no':()=>{toast('許可しなかったため、作成を中止しました（この場合の戻り方は未確定・仮に戻します）');back()},
  'ob-consent-ok':()=>{
    const c=A.create;const E=emptyEnv(c.name.trim(),c.kind);
    const me=newPerson(A.account.name,['アプリ管理者'],{account:A.account.email});E.people.push(me);E.meId=me.id;
    A.envs.unshift(E);A.cur=E.id;A.stack=['boot'];rep('create3');
  },
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
    A.envs.unshift(e);A.cur=e.id;A.join=null;resetDrafts();root('home');
  },
  'env':()=>openSheet(envSwitchSheet),
  'env-pick':t=>{A.modal=null;switchEnv(t.dataset.id);toast('環境を切り替えました。入力途中の内容は破棄しました')}
});
