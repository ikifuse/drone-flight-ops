'use strict';
/* ===================================================================
   各種設定・管理 — 設計の出典: 34b／34g（機体管理は案）／32d（BAT一覧・詳細は案）
   ここから事前に登録する経路。分類そのものは未確定で、この並びは案。
   左側の画面には、内部の用語・設計書の番号・状態ラベル・確認用の部品を出さない（それらは右側の設計確認メモにだけ書く）。
   =================================================================== */
const li=(ico,title,sub,right,act,attrs)=>'<button class="li" data-act="'+act+'" '+(attrs||'')+'><span class="ico">'+ico+'</span><span class="tx"><b>'+title+'</b><small>'+sub+'</small></span>'+(right||'')+'<span class="go">›</span></button>';
const cnt=(n,unit,warnZero)=>n?'<i class="chip ok">'+n+unit+'</i>':(warnZero?'<i class="chip warn">未登録</i>':'<i class="chip">なし</i>');
const pendingPdfs=f=>['a4','map'].filter(k=>f.outputPending?.[k]);
const pdfLabel=k=>k==='a4'?'A4運航記録PDF':'地図付きPDF';
function driveSaveMessage(){return !A.online?'通信できません。通信できる場所で、もう一度保存してください。':A.gAccess==='view'?'Google Driveが閲覧のみのため保存できません。管理者に編集権限を確認してください。':A.gAccess==='none'?'Google Driveの保存場所にアクセスできません。管理者に共有を確認してください。':''}
function unsynced(){const E=ENV();if(!E)return 0;return E.flights.filter(f=>!f.synced).length+E.flights.filter(f=>f.kml==='pending').length+E.plans.filter(p=>p.kml==='pending').length+E.flights.reduce((n,f)=>n+pendingPdfs(f).length,0)}

def('set',{t:'各種設定・管理',st:()=>{const E=ENV();return E?envLabel(E)+'で使用中':''},
  goal:'使っている場所（個人・会社・団体）の、自分の情報・人員・機体・BAT・許可承認・保険・連絡先・現場・DIPSのログイン情報などを、必要になる前に登録しておく入口。ホームへ入る前に一括で登録させない。',
  doc:'34a §9.3（機体・許可承認・保険の事前登録はここから。ホーム前に求めるのは、はじめの登録の本人情報とDIPSのログイン情報だけ）／§9.4（会社・団体の追加・切替もここから）／34b §1（ホーム4入口の1つ。内部の分類は未確定）／34g §3・§4（機体管理の入口の流れはCURRENT-PROPOSAL。各種設定・管理は、いま使っている場所を対象にする）。人員・BAT・場所・環境などの他の管理画面は、個別の画面設計がない（34f PENDING-D-SETTINGS-SCREENS）。',state:'proposal',
  tmp:['この一覧の分類・並び順・名称は案（PENDING-S5-HOME-DETAIL）','「DIPSのログイン情報」を設定のどこに置くか（この一覧の1項目か、DIPS関連の中か）は未決。2026-09-22のオーナー指示で候補に加えた（PENDING-S5-DIPS-LOGIN-STORAGE）','左側の案内文（「飛行の途中でその場で登録することもできます」）は、説明を最小にするため置いていない。要るかどうかは未決','「保存状態」は、以前の「保存・同期」を平易にした案（PENDING-U-WORDING）','許可・承認／保険／連絡先を設定のどこに置くかは未確定（PENDING-S6-DRIVE-PLACEMENT）','誰がどの項目を変更できるかは未確定（PENDING-D-AC-PERMISSION／PENDING-S2-ACCESS-DETAIL）。このモックでは31bの確定済み管理者境界とGoogle書込可否だけを確認し、全機能の許否は決めない'],
  ask:[],
  ui:['設定の分類と並び、未登録のものの目立たせ方は標準案'],
  body:()=>{
    const E=ENV();const n=unsynced();const me=E.people.find(p=>p.id===E.meId);
    return li('🏢','個人・会社・団体の切り替え','使う場所を切り替える・新しく追加する',cnt(A.envs.length,'か所'),'go','data-s="set-env"')
     +li('👤','自分の情報','氏名・電話・操縦者としての登録',(me&&me.name?'<i class="chip ok">登録済み</i>':'<i class="chip warn">未登録</i>'),'go','data-s="set-me"')
     +li('👥','人員・役割','人員の一覧・役割・離任',cnt(E.people.filter(p=>p.active!==false).length,'人'),'go','data-s="set-members"')
     +li('✈','機体管理','登録している機体・BAT管理の設定',cnt(E.aircraft.length,'機',true),'go','data-s="set-aircraft"')
     +li('🔋','BAT管理','BATの一覧・状態・使用履歴',cnt(E.bats.length,'本'),'go','data-s="set-bat"')
     +li('📄','許可・承認／保険／連絡先','DIPSの入力に自動で入る、登録済みの情報',(E.permits.length&&E.insurance&&E.contact?'<i class="chip ok">登録済み</i>':'<i class="chip warn">未登録あり</i>'),'go','data-s="set-docs"')
     +li('📍','現場プリセット','よく行く現場の範囲・高度',cnt(E.presets.length,'件'),'go','data-s="set-presets"')
     +li('🔑','DIPSのログイン情報','DIPSログインID・パスワード',A.dips.registered?'<i class="chip ok">登録済み</i>':'<i class="chip warn">未登録</i>','dips-open')
     +li('🔌','DIPSへの通報方法','アプリから送信／DIPS Webで通報',A.apiOk?'<i class="chip">アプリから送信できます</i>':'<i class="chip warn">DIPS Webで通報</i>','go','data-s="set-dips"')
     +li('🔧','点検整備記録','機体ごとの詳しい点検整備の記録','','go','data-s="set-maint"')
     +li('🔄','保存状態','Google Driveへの保存の状況',n?'<i class="chip warn">未保存 '+n+'件</i>':'<i class="chip ok">保存済み</i>','go','data-s="set-sync"');
  }
});

/* ---------- 個人・会社・団体の切り替え ---------- */
def('set-env',{t:'個人・会社・団体の切り替え',st:'使う場所を切り替える',
  goal:'いま使っている場所（個人・会社・団体）を確かめ、切り替える・会社・団体で新しく使い始める・すでに使っている会社・団体に参加する。会社・団体は、その会社・団体で使うGoogleアカウントで続ける（34a §9.4）。',
  doc:'31a §4／34a §5・§7.3／34g §2・§4（内部では運用環境の表示・切替。切り替えると、参照する機体・BAT・人員の正本も切り替わる）。Googleアカウントは、運用環境や人物そのものではない。',state:'accepted',
  tmp:['この画面の並びは案。使っている場所の表示位置と切替の形は未確定（PENDING-S2-ENVIRONMENT-UI）','名前の変更は、このモックでは動かない'],ask:[],ui:['この画面での切り替えの見せ方は標準案。どこを主な入口にするかは、上の未決（PENDING-S2-ENVIRONMENT-UI）のまま'],
  body:()=>{
    const E=ENV();const admins=E.people.filter(p=>p.roles.includes('管理者')).map(p=>pnm(p));
    return '<div class="sec"><h3>いま使っている場所</h3><table class="kv"><tr><td>名前</td><td>'+esc(envLabel(E))+'</td></tr><tr><td>種類</td><td>'+esc(KIND_NAME(E.kind))+'</td></tr><tr><td>管理者</td><td>'+esc(admins.join('、')||'—')+'</td></tr><tr><td>あなたの役割</td><td>'+esc(envRole(E))+'</td></tr></table></div>'
     +'<div class="sec"><h3>ログイン中のGoogleアカウント</h3><p class="lead" style="margin:0">'+acctMail()+'</p></div>'
     +'<div class="sec"><h3>切り替える・追加する</h3>'+A.envs.map(e=>'<button class="tgl'+(A.cur===e.id?' sel':'')+'" data-act="env-pick" data-id="'+e.id+'"><span class="box">'+(A.cur===e.id?'✓':'')+'</span><span><b>'+esc(envLabel(e))+'</b><br><small class="note">'+esc(KIND_NAME(e.kind))+'</small></span></button>').join('')
     +'<div class="row"><button class="btn sm" data-act="ob-co-new">＋ 会社・団体で新しく使い始める</button><button class="btn sm" data-act="ob-co-join">すでに使っている会社・団体に参加する</button></div>'
     +'<p class="note">会社・団体で使うときは、その会社・団体で使うGoogleアカウントで続けます。</p></div>';
  }
});

/* ---------- 人員・役割 ---------- */
def('set-members',{t:'人員・役割',st:'人員の一覧',
  goal:'この会社・団体（または個人）の人員を一覧し、追加・変更・離任を行う。',
  doc:'31a §2・§3（人物・所属・役割・資格を分ける。実Driveでは「人員一覧／Googleアカウント／所属・役割／資格・技能証明／退職・離任履歴」の5タブで確認）／31b（三層権限）／31d（離任・再所属）。人員の画面は、個別には設計されていない。',state:'tmp',
  tmp:['一覧・詳細の構成は案（5タブの概念を1つの詳細に集約している）','設定変更ができる人は、操縦者または管理者（31b §4）。人員管理の権限は未確定','離任のUI・実行できる人は未確定（PENDING-S2-MEMBERSHIP）'],ask:[],ui:['一覧に出す情報（Googleアカウントの有無・資格の期限など）と並びは標準案'],
  body:()=>{
    const E=ENV();
    return (E.people.length?E.people.map(p=>'<button class="li" data-act="reg-open" data-t="person" data-id="'+p.id+'" style="'+(p.active===false?'opacity:.55':'')+'"><span class="ico">👤</span><span class="tx"><b>'+esc(pnm(p))+(p.id===E.meId?'（あなた）':'')+'</b><small>'+esc(p.roles.join('・')||'役割はまだ決まっていません')+(p.pilot?' ／ 技能証明: '+esc(p.lic):'')+'</small></span>'+(p.account?'<i class="chip info">Googleアカウントあり</i>':'<i class="chip">Googleアカウントなし</i>')+(p.active===false?'<i class="chip ng">離任</i>':'')+'<span class="go">›</span></button>').join(''):'<div class="empty">人員が登録されていません</div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="person">＋ 人員を追加</button>'
     ;
  }
});

/* ---------- 機体管理 ---------- */
def('set-aircraft',{t:'機体管理',st:'登録している機体の一覧',
  goal:'いま使っている場所に登録された機体を確かめ、追加・変更へ進む。',
  doc:'34g §3.1・§3.2（機体一覧・機体の追加・変更。CURRENT-PROPOSAL）／32h §3・§6（登録済み実機と、新しい機体を追加する流れ）。',state:'proposal',
  tmp:['一覧の列・並びは未確定（PENDING-D-AC-SCREENS）','機体の退役・削除の扱いは未確定（PENDING-C1-SCHEMA）。一覧から消して過去の運航記録を失わせる設計にはしない','機体管理の権限は未確定（PENDING-D-AC-PERMISSION）'],
  ask:[],
  ui:['一覧に出す情報（BAT管理のON/OFF・BATグループ・登録期限）は標準案'],
  body:()=>{
    const E=ENV();
    return (E.aircraft.length?E.aircraft.map(a=>{const g=groupOf(a.group);return '<button class="li" data-act="reg-open" data-t="aircraft" data-id="'+a.id+'" style="'+(a.dead?'opacity:.55':'')+'"><span class="ico">✈</span><span class="tx"><b>'+esc(a.name)+'</b><small>'+esc(a.model)+' ／ <span class="mono">'+esc(a.mark)+'</span></small><small>'+(a.batOn?'BAT管理 ON（'+esc(g?g.name:'BATグループ未設定')+'）':'BAT管理 OFF')+'</small></span>'+(a.dead?'<i class="chip ng">抹消</i>':(a.expiry&&daysTo(a.expiry)<=30?'<i class="chip warn">期限まで'+daysTo(a.expiry)+'日</i>':''))+'<span class="go">›</span></button>'}).join(''):'<div class="empty"><b>登録された機体がありません</b></div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="aircraft">＋ 機体を追加</button>';
  }
});

/* ---------- BAT管理 ---------- */
const BAT_FILTERS=[['all','すべて'],['abn','状態確認に異常あり'],['cyc','サイクル数が未確認'],['old','1週間以上使っていない']];
function batPass(b){const f=A.ui.batF||'all';return f==='all'||(f==='abn'&&b.check!=='異常なし')||(f==='cyc'&&b.cycle==null)||(f==='old'&&(b.lastDays==null||b.lastDays>=7))}
def('set-bat',{t:'BAT管理',st:'BATの一覧',
  goal:'BAT管理をONにした機体で使うBATの、最終使用・状態確認・累計を見て、追加・詳細へ進む。',
  doc:'32d §5.1・§6（BAT一覧の案。多数の機体・BATでも状態が分かる）／32e（BAT管理は機体単位の任意）／32f（総合BAT台帳は置かず、一覧は各BATシートから導く）／32h（使用許可機体）。',state:'proposal',
  tmp:['32dは「表示の案（オーナー確認待ち）」。現在状態（保管・充電など）の値は未確定で、ここには出していない（PENDING-D-BAT-STATES）','BATを新しく登録する画面は個別には設計されていない。ここでは登録の入口だけ置いた（案）','件数が多いときの見せ方は未検証（VERIFY-D-BAT-SCALE）','「機体セット別」の表示を置くかは未決（PENDING-D-BAT-SET-VIEW）'],
  ask:[],
  ui:['一覧の列（管理ラベル・最終使用・状態確認・サイクル・累計）は標準案'],
  body:()=>{
    const E=ENV();const onAc=E.aircraft.filter(a=>a.batOn);
    if(!onAc.length)return '<div class="empty"><b>BAT管理をONにした機体がありません</b><br>BAT管理は、機体ごとに選べます（OFFでも、飛行記録は最後まで残せます）。使う場合は、［機体管理］で機体のBAT管理をONにします。</div><button class="btn" style="width:100%" data-act="go" data-s="set-aircraft">機体管理へ</button>';
    const list=E.bats.filter(batPass);
    const cnts=[['今日使ったBAT',E.bats.filter(b=>b.lastDays===0).length],['状態確認に異常あり',E.bats.filter(b=>b.check!=='異常なし').length],['サイクル数が未確認',E.bats.filter(b=>b.cycle==null).length],['1週間以上使っていない',E.bats.filter(b=>b.lastDays==null||b.lastDays>=7).length]];
    return E.batGroups.map(g=>'<div class="sec"><h3>'+esc(g.name)+'</h3><p class="note" style="margin:0">このBATを使える機体: '+(E.aircraft.filter(a=>a.group===g.id).map(a=>esc(a.name)+'（'+esc(a.mark)+'）').join('、')||'なし')+'</p></div>').join('')
     +'<div class="sec"><h3>集計</h3><div class="pills">'+cnts.map(c=>'<span class="chip">'+c[0]+' '+c[1]+'</span>').join('')+'</div></div>'
     +'<div class="filters">'+BAT_FILTERS.map(f=>'<button class="pill'+((A.ui.batF||'all')===f[0]?' sel':'')+'" data-act="bat-filter" data-v="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>'
     +(list.length?'<div class="sec" style="padding:4px 8px"><table class="kv grid"><tr><th>ラベル</th><th>状態確認</th><th>サイクル</th><th>累計</th><th>最終使用</th></tr>'+list.map(b=>'<tr data-act="bat-open" data-id="'+b.id+'" style="cursor:pointer"><td><b>'+esc(b.label)+'</b></td><td>'+(b.check==='異常なし'?esc(b.check):'<i class="chip ng">'+esc(b.check)+'</i>')+'</td><td>'+(b.cycle==null?'未確認':b.cycle+'（'+esc(b.cycleAt)+'）')+'</td><td>'+Math.floor(b.min/60)+':'+pad(b.min%60)+'</td><td>'+(b.lastDays==null?'—':(b.lastDays===0?'今日':b.lastDays+'日前')+'・'+esc(acName(b.lastAc)))+'</td></tr>').join('')+'</table></div>':'<div class="empty">この条件に合うBATはありません</div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="bat">＋ BATを追加</button>';
  }
});
def('bat-detail',{t:()=>{const b=batOf(A.ui.batId);return b?b.label:'BAT'},st:'BATの詳細と使用履歴',
  goal:'1本のBATの情報と使用履歴を確かめ、必要なら状態確認を更新する。',
  doc:'32d §5.2（BAT詳細と履歴の案）／32b §3（中古BATの取得時確認）／32f §4。履歴は飛行の記録から自動で並ぶ。',state:'proposal',
  tmp:['履歴の列は未確定（PENDING-D-BAT-HISTORY-COLUMNS）','現在状態（保管・充電など）は出していない（PENDING-D-BAT-STATES）'],ask:['BATのどの項目を、あとから更新できるようにするか（記録として残した値を書き換えられるか）'],ui:['詳細に並べる項目と順は標準案'],
  body:()=>{
    const E=ENV();const b=batOf(A.ui.batId);if(!b)return '<div class="empty">BATが見つかりません</div>';const g=groupOf(b.group);
    return '<div class="sec"><h3>BATの情報</h3><table class="kv"><tr><td>型式</td><td>'+esc(b.model)+'</td></tr><tr><td>BATグループ</td><td>'+esc(g?g.name:'—')+'</td></tr><tr><td>このBATを使える機体</td><td>'+(E.aircraft.filter(a=>a.group===b.group).map(a=>esc(a.name)).join('、')||'—')+'</td></tr><tr><td>取得</td><td>'+(b.source==='used'?'中古（取得したときの状態から、記録を始めています）':'新品')+'</td></tr><tr><td>累計飛行時間</td><td>'+Math.floor(b.min/60)+'時間'+pad(b.min%60)+'分</td></tr><tr><td>使用回数</td><td>'+b.uses+'</td></tr><tr><td>最終使用</td><td>'+(b.lastDays==null?'—':(b.lastDays===0?'今日':b.lastDays+'日前')+'・'+esc(acName(b.lastAc)))+'</td></tr><tr><td>最新のサイクル数</td><td>'+(b.cycle==null?'未確認':b.cycle+'（'+esc(b.cycleAt)+'に確認）')+'</td></tr><tr><td>直近の状態確認</td><td>'+esc(b.check)+'</td></tr></table>'
     +'<div class="row"><button class="btn sm" data-act="bat-check">状態確認を更新</button><button class="btn sm" data-act="reg-open" data-t="bat" data-id="'+b.id+'">情報を変更</button></div></div>'
     +'<div class="sec"><h3>使用履歴 <small>新しい順・飛行の記録から自動で並びます</small></h3>'+(b.hist.length?'<table class="kv grid"><tr><th>日付</th><th>機体</th><th>飛行</th><th>状態確認</th></tr>'+b.hist.map(h=>'<tr><td>'+esc(h.d)+'</td><td>'+esc(h.ac?acName(h.ac):'—')+'</td><td>'+h.min+'分</td><td>'+esc(h.chk)+'</td></tr>').join('')+'</table>':'<div class="empty">履歴はまだありません</div>')+'<p class="note">履歴は消えません。間違いを直したときも、直した記録が残ります。</p></div>'
     +(A.gAccess==='view'?'<div class="msg warn">Google Driveが閲覧のみのため、更新はできません（見るだけです）。</div>':'');
  }
});

/* ---------- 許可・承認／保険／連絡先 ---------- */
def('set-docs',{t:'許可・承認／保険／連絡先',st:'DIPSの入力に自動で入る情報',
  goal:'新規飛行の「飛行許可番号」「保険に関する情報」「連絡先」に自動で入る、登録済みの情報を管理する。',
  doc:'25b／26（DIPSの入力項目）。置き場所と分類は未確定（PENDING-S6-DRIVE-PLACEMENT。旧案のPermissions／InsurancePoliciesなどをどの責任領域へ置くかは未決）。',state:'tmp',
  tmp:['3つを1画面にまとめる分類は案','許可承認は「複数」、保険と連絡先は「1つ」としているのも案'],ask:[],ui:['許可・承認／保険／連絡先を1つの設定項目にまとめるか分けるかは標準案'],
  body:()=>{
    const E=ENV();
    return '<div class="sec"><h3>許可・承認</h3>'+(E.permits.length?E.permits.map(m=>{const exp=daysTo(m.to);return '<button class="li" data-act="reg-open" data-t="permit" data-id="'+m.id+'"><span class="ico">📄</span><span class="tx"><b>'+esc(m.label)+'</b><small class="mono">'+esc(m.no)+'</small><small>有効: '+slash(m.from)+'〜'+slash(m.to)+' ／ '+m.cover.map(esc).join('・')+'</small></span>'+(exp<0?'<i class="chip ng">期限切れ</i>':exp<=30?'<i class="chip warn">あと'+exp+'日</i>':'')+'<span class="go">›</span></button>'}).join(''):'<div class="empty">登録された許可・承認はありません（許可なしの飛行なら不要です）</div>')+'<button class="card add" style="width:100%" data-act="reg-open" data-t="permit">＋ 許可・承認を追加</button></div>'
     +'<div class="sec"><h3>保険</h3>'+(E.insurance?'<button class="li" data-act="reg-open" data-t="insurance"><span class="ico">🛡</span><span class="tx"><b>'+esc(E.insurance.company)+'</b><small>'+esc(E.insurance.product)+'</small></span><span class="go">›</span></button>':'<div class="empty">保険は未登録です</div><button class="card add" style="width:100%" data-act="reg-open" data-t="insurance">＋ 保険を登録</button>')+'</div>'
     +'<div class="sec"><h3>連絡先</h3>'+(E.contact?'<button class="li" data-act="reg-open" data-t="contact"><span class="ico">☎</span><span class="tx"><b>'+esc(E.contact.name)+'</b><small>'+esc(E.contact.phone)+' ／ '+esc(E.contact.email)+'</small></span><span class="go">›</span></button>':'<div class="empty">連絡先は未登録です</div><button class="card add" style="width:100%" data-act="reg-open" data-t="contact">＋ 連絡先を登録</button>')+'</div>';
  }
});

/* ---------- 現場プリセット ---------- */
def('set-presets',{t:'現場プリセット',st:'よく行く現場の範囲・高度',
  goal:'よく行く現場の飛行範囲・高度・出発地/目的地などを登録し、新規飛行で呼び出せるようにする。',
  doc:'12c（場所・飛行範囲プリセット。新規計画へ値を独立して複製する）。設定画面としては未設計（34f PENDING-D-SETTINGS-SCREENS）。',state:'tmp',
  tmp:['一覧と登録画面は案。プリセットは新規飛行の飛行範囲の画面からも保存できる想定'],ask:[],ui:['現場（場所）と範囲プリセットを1画面で扱うか分けるかは標準案'],
  body:()=>{
    const E=ENV();
    return (E.presets.length?E.presets.map(p=>'<button class="li" data-act="reg-open" data-t="preset" data-id="'+p.id+'"><span class="ico">📍</span><span class="tx"><b>'+esc(p.name)+'</b><small>高度 '+p.alt+'m ／ '+esc(p.to||'—')+'</small></span><span class="go">›</span></button>').join(''):'<div class="empty">現場プリセットはまだありません。新規飛行の飛行範囲の画面から「現場プリセットとして保存」もできます。</div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="preset">＋ 現場プリセットを追加</button>';
  }
});

/* ---------- DIPSへの通報方法・点検整備・保存状態（個別の画面設計がないため簡略） ---------- */
def('set-dips',{t:'DIPSへの通報方法',st:'アプリから送信／DIPS Webで通報',
  goal:'アプリからDIPSへ送信できるかどうかの状態と、DIPS Webで通報する方法がいつでも使えることを示す。',
  doc:'33b（API未承認・credential未発行・接続不能でも、Manual経路とAPI非依存の計画・現場記録は独立して成立する）／24（Manualを第一級とする）。この設定画面自体は、個別には設計されていない。',state:'none',
  tmp:['この画面の存在自体が案','「送信できる／できない」は、実際は審査結果・接続状態で決まる。右側の切替（DIPSへ送信）で状態を選ぶ'],ask:[],ui:['アプリから送信できるかどうかの状態の見せ方は標準案。送信できないときもDIPS Webで通報できる決まりは変えない'],
  body:()=>'<div class="sec"><h3>アプリからDIPSへ送信する</h3><p class="lead" style="margin:0">'+(A.apiOk?'いま、アプリからDIPSへ送信できます。':'いまは、アプリからDIPSへ送信できません。［DIPS Webで通報する］で、最後まで進められます。')+'</p></div>'
   +'<div class="sec"><h3>DIPS Webで通報する</h3><p class="lead" style="margin:0">いつでも使えます。</p></div>'
});
/* ---------- DIPSのログイン情報（各種設定・管理から登録・変更／はじめの設定の一項目／通報の直前のその場登録） ---------- */
def('set-dipscred',Object.assign({t:'DIPSのログイン情報',st:()=>A.dips.registered?'登録済み':'',backAct:'dips-cancel',
  enter:()=>{A.ui.dform={id:A.dips.id||'',pw:''};A.ui.pwShow=false},
  body:()=>dipsForm(),
  foot:()=>'<button class="btn" data-act="dips-cancel">キャンセル</button><button class="btn primary" data-act="dips-save">'+(A.dipsRet?'登録して戻る':(A.dips.registered?'保存する':'登録する'))+'</button>'
},DIPS_MEMO,{tmp:['通常は、初回の「はじめの登録」で本人情報と同じ1画面で登録する（34a §9.3）。この画面は、そのあとの確認・変更と、未登録のまま通報の直前まで来たときの受け皿（34a §8.3）で使う'].concat(DIPS_MEMO.tmp)}));
def('set-maint',{t:'点検整備記録',st:'機体ごとの詳しい点検整備',
  goal:'機体ごとの詳しい点検整備の記録（通常の日常点検とは別）への入口。',
  doc:'36（機体別の詳細な点検整備は05に置く。通常の日常点検と分離）。この入口の画面は未設計。整備台帳の詳細入力フォームを、通常運航の画面へ混ぜない（35b §9）。',state:'none',
  tmp:['Google Sheetsへの引渡しをシートで示す。実通信・原本コピー・整備記録作成はしない。通常運航へ整備フォームを追加しない'],ask:[],ui:['点検整備記録を設定の中に置くか、機体の詳細から開くかは標準案'],
  body:()=>{const E=ENV();return '<p>機体を選び、Google Sheetsの点検整備記録を開きます。原本をコピーして、実際の整備内容を記入してください。</p>'+E.aircraft.map(a=>'<button class="li" data-act="maintenance-open" data-id="'+a.id+'"><span class="ico">🔧</span><span class="tx"><b>'+esc(a.name)+'</b><small class="mono">'+esc(a.mark)+'</small></span><span class="go">›</span></button>').join('')}

});
def('set-sync',{t:'保存状態',st:'Google Driveへの保存の状況',
  goal:'この端末には保存されているが、まだGoogle Driveに保存されていないものを確認し、通信できるときに保存する。',
  doc:'14 §3.4（記録ごとの状態表示）／38a §4（正本を確認する時点とcacheの表示）／27e §4（未保存のKMLを端末に保持し、通信復帰時と最後の保存のときに再送）。全画面に共通する見せ方は未設計（34f PENDING-D-STATUS-DISPLAY）。設定名は、以前の「保存・同期」を平易にした案。',state:'none',
  tmp:['この画面自体が案。オフライン・未保存・エラーの共通の見せ方は未設計','設定名「保存状態」の最終形はPENDING-U-WORDING','通信の状態（オンライン／オフライン）は、右側の切替（通信）で選ぶ'],ask:[],ui:['未保存の状態を各画面のどこに出すかは標準案'],
  body:()=>{
    const E=ENV();const n=unsynced();
    return '<div class="sec"><h3>まだGoogle Driveに保存されていないもの</h3>'+(n?'<ul style="margin:0;padding-left:1.2em;font-size:13px">'+E.flights.filter(f=>!f.synced).map(f=>'<li>飛行記録「'+esc(f.label)+'」: この端末には保存されています。まだGoogle Driveには保存されていません。</li>').join('')+E.flights.filter(f=>f.kml==='pending').map(f=>'<li>KML「'+esc(f.label)+'」: まだGoogle Driveに保存されていません。</li>').join('')+E.flights.flatMap(f=>pendingPdfs(f).map(k=>'<li>'+pdfLabel(k)+'「'+esc(f.label)+'」: この端末で作成済み。Google Driveには未保存です。</li>')).join('')+E.plans.filter(p=>p.kml==='pending').map(p=>'<li>KML「'+esc(p.name)+'」: まだGoogle Driveに保存されていません。</li>').join('')+'</ul><button class="btn" style="margin-top:8px" data-act="sync-now"'+(A.online&&A.gAccess==='edit'?'':' disabled')+'>もう一度保存する</button>'+(driveSaveMessage()?'<p class="note">'+driveSaveMessage()+'</p>':''):'<div class="msg ok">まだ保存されていないものは、ありません。</div>')+'</div>'
;
  }
});

Object.assign(ACTS,{
  'bat-filter':t=>{A.ui.batF=t.dataset.v;render()},
  'bat-open':t=>{A.ui.batId=t.dataset.id;nav('bat-detail')},
  'bat-check':()=>{
    if(!canWrite())return;
    openSheet(()=>'<h3>状態確認を更新</h3><div class="pills">'+BAT_CHECKS.map(c=>'<button class="pill" data-act="bat-check-set" data-v="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div><div class="row"><button class="btn" data-act="close">閉じる</button></div>');
  },
  'bat-check-set':t=>{if(!canWrite())return;const b=batOf(A.ui.batId);b.check=t.dataset.v;b.hist.unshift({d:slash(TODAY),ac:b.lastAc,min:0,chk:b.check+'（手入力）'});A.modal=null;render();toast('状態確認を更新しました。履歴に残ります')},
  'api':t=>{A.apiOk=t.dataset.v==='1';render()},
  'dips-open':()=>{A.dipsRet=null;nav('set-dipscred')},
  'online':t=>{A.online=t.dataset.v==='1';render()},
  'sync-now':()=>{if(!canWrite())return;if(!A.online){toast(driveSaveMessage());return}const E=ENV();E.flights.forEach(f=>{f.synced=true;if(f.kml==='pending')f.kml='saved';f.outputPending={}});E.plans.forEach(p=>{if(p.kml==='pending')p.kml='saved'});render();toast('Google Driveに保存しました')}
});
