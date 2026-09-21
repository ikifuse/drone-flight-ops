'use strict';
/* ===================================================================
   各種設定・管理 — 設計の出典: 34b／34g（機体管理はCURRENT-PROPOSAL）／32d（BAT一覧・詳細は案）
   ここから事前に登録する経路。分類そのものは未確定（PENDING-S5-HOME-DETAIL）で、このモックの並びは仮。
   =================================================================== */
const li=(ico,title,sub,right,act,attrs)=>'<button class="li" data-act="'+act+'" '+(attrs||'')+'><span class="ico">'+ico+'</span><span class="tx"><b>'+title+'</b><small>'+sub+'</small></span>'+(right||'')+'<span class="go">›</span></button>';
const cnt=(n,unit,warnZero)=>n?'<i class="chip ok">'+n+unit+'</i>':(warnZero?'<i class="chip warn">未登録</i>':'<i class="chip">なし</i>');

def('set',{t:'各種設定・管理',st:()=>{const E=ENV();return E?E.name+' を対象':''},
  goal:'現在の運用環境の、人員・機体・BAT・許可承認・保険・連絡先・現場などのマスターや設定を扱う。',
  doc:'34b §1（ホーム4入口の1つ。内部分類は未確定）／34g §3・§4（機体管理の入口の流れはCURRENT-PROPOSAL。各種設定・管理は現在の運用環境を対象にする）。人員・BAT・場所・環境などの他の管理画面は、個別の画面設計がない（34f PENDING-D-SETTINGS-SCREENS）。',state:'proposal',
  tmp:['この一覧の分類・並び順・名称は、このモックの仮（PENDING-S5-HOME-DETAIL）','許可・承認／保険／連絡先を設定のどこに置くかは未確定（PENDING-S6-DRIVE-PLACEMENT）','誰がどの項目を変更できるかは未確定（PENDING-D-AC-PERMISSION／PENDING-S2-ACCESS-DETAIL）。このモックでは制限していない'],
  ask:['設定の分類の仕方（この9項目でよいか）','未登録のものをここで目立たせるか（登録漏れを減らすため）'],
  body:()=>{
    const E=ENV();
    return '<p class="lead">現在の運用環境「'+esc(E.name)+'」の設定です。ここで先にまとめて登録もできますが、<b>飛行の途中でその場で登録することもできます</b>。</p>'
     +li('🏢','運用環境','環境の切替・新規作成・参加',cnt(A.envs.length,'つ'),'go','data-s="set-env"')
     +li('👥','人員・権限','人員一覧・役割・離任',cnt(E.people.filter(p=>p.active!==false).length,'人'),'go','data-s="set-members"')
     +li('✈','機体管理','登録機体・BAT管理のON／OFF',cnt(E.aircraft.length,'機',true),'go','data-s="set-aircraft"')
     +li('🔋','BAT管理','BATの一覧・状態・履歴',cnt(E.bats.length,'本'),'go','data-s="set-bat"')
     +li('📄','許可・承認／保険／連絡先','DIPSの入力に使う登録済み情報',(E.permits.length&&E.insurance&&E.contact?'<i class="chip ok">登録済み</i>':'<i class="chip warn">未登録あり</i>'),'go','data-s="set-docs"')
     +li('📍','現場プリセット','よく行く現場の範囲・高度',cnt(E.presets.length,'件'),'go','data-s="set-presets"')
     +li('🔌','DIPS連携','APIの利用状況・Manual',A.apiOk?'<i class="chip">API利用可（仮）</i>':'<i class="chip warn">Manualのみ（仮）</i>','go','data-s="set-dips"')
     +li('🔧','点検整備記録','機体別の詳細な点検整備',tmpChip,'go','data-s="set-maint"')
     +li('🔄','保存・同期','未同期の確認',unsynced()?'<i class="chip warn">未同期 '+unsynced()+'</i>':'<i class="chip ok">同期済み</i>','go','data-s="set-sync"');
  }
});

/* ---------- 運用環境 ---------- */
def('set-env',{t:'運用環境',st:'現在の環境と切替',
  goal:'今どの環境を操作しているかを確かめ、切り替える・新しく作る・既存へ参加する。',
  doc:'31a §4／34a §5／34g §2・§4（現在の運用環境の表示。環境の切替で、参照する機体・BAT・人員の正本も切り替わる）。Googleアカウントは環境や人物そのものではない。',state:'accepted',
  tmp:['この画面の並びは仮。環境の表示位置と切替UIの形は未確定（PENDING-S2-ENVIRONMENT-UI）','環境名の変更はモックの動作のみ'],ask:['環境の切替は、ここ・ホーム・通常起動画面のどれを主にするか'],
  body:()=>{
    const E=ENV();const admins=E.people.filter(p=>p.roles.includes('アプリ管理者')).map(p=>p.name);
    return '<div class="sec"><h3>現在の運用環境</h3><table class="kv"><tr><td>名前</td><td>'+esc(E.name)+'</td></tr><tr><td>種類</td><td>'+esc(KIND_NAME(E.kind))+'</td></tr><tr><td>アプリ管理者</td><td>'+esc(admins.join('、')||'—')+'</td></tr><tr><td>あなたの役割</td><td>'+esc(envRole(E))+'</td></tr></table></div>'
     +'<div class="sec"><h3>使用中のGoogleアカウント</h3><p class="lead" style="margin:0"><span class="mono">'+esc(A.account.email)+'</span></p><p class="note">Googleアカウントは、環境や人物そのものではありません。同じ人が、個人用と会社用など別のアカウント・別の環境を使うことがあります（31a）。</p></div>'
     +'<div class="sec"><h3>環境の切替・追加</h3>'+A.envs.map(e=>'<button class="tgl'+(A.cur===e.id?' sel':'')+'" data-act="env-pick" data-id="'+e.id+'"><span class="box">'+(A.cur===e.id?'✓':'')+'</span><span><b>'+esc(e.name)+'</b><br><small class="note">'+esc(KIND_NAME(e.kind))+'</small></span></button>').join('')
     +'<div class="row"><button class="btn sm" data-act="ob-create">＋ 新しい運用環境を作成</button><button class="btn sm" data-act="ob-join">既存の運用環境に参加</button></div></div>';
  }
});

/* ---------- 人員・権限 ---------- */
def('set-members',{t:'人員・権限',st:'人員一覧',
  goal:'この環境の人員を一覧し、追加・変更・離任を行う。',
  doc:'31a §2・§3（人物・所属・役割・資格を分ける。実Driveでは「人員一覧／Googleアカウント／所属・役割／資格・技能証明／退職・離任履歴」の5タブで確認）／31b（三層権限）／31d（離任・再所属）。人員の画面は、個別には設計されていない。',state:'tmp',
  tmp:['一覧・詳細の構成は、このモックの仮（5タブの概念を1つの詳細に集約している）','設定変更ができる人は、操縦者またはアプリ管理者（31b §4）。人員管理の権限は未確定','離任のUI・実行できる人は未確定（PENDING-S2-MEMBERSHIP）'],ask:['人員の一覧に、Googleアカウントの有無・資格の期限をどこまで見せるか'],
  body:()=>{
    const E=ENV();
    return (E.people.length?E.people.map(p=>'<button class="li" data-act="reg-open" data-t="person" data-id="'+p.id+'" style="'+(p.active===false?'opacity:.55':'')+'"><span class="ico">👤</span><span class="tx"><b>'+esc(p.name)+(p.id===E.meId?'（あなた）':'')+'</b><small>'+esc(p.roles.join('・')||'役割未設定')+(p.pilot?' ／ 技能証明: '+esc(p.lic):'')+'</small></span>'+(p.account?'<i class="chip info">Google</i>':'<i class="chip">アカウントなし</i>')+(p.active===false?'<i class="chip ng">離任</i>':'')+'<span class="go">›</span></button>').join(''):'<div class="empty">人員が登録されていません</div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="person">＋ 人員を追加</button>'
     +'<p class="note">Googleアカウントを持たない補助者・外部点検者も、人物として登録できます。権限は、業務上の役割・アプリの機能権限・Google Driveの実アクセスの三層で別々に決まります（31b）。</p>';
  }
});

/* ---------- 機体管理（34g §3.1 機体一覧） ---------- */
def('set-aircraft',{t:'機体管理',st:'登録済み実機の一覧',
  goal:'現在の運用環境に登録された実機を確認し、追加・変更へ進む。',
  doc:'34g §3.1・§3.2（機体一覧・機体の追加・変更。CURRENT-PROPOSAL）／32h §3・§6（登録済み実機と、新しい機体を追加する流れ）。',state:'proposal',
  tmp:['一覧の列・並びは未確定（PENDING-D-AC-SCREENS）','機体の退役・削除の扱いは未確定（PENDING-C1-SCHEMA）。一覧から消して過去の運航記録を失わせる設計にはしない','機体管理の権限は未確定（PENDING-D-AC-PERMISSION）'],
  ask:['一覧に出す情報（BAT管理のON/OFF・共用グループ・登録期限）でよいか'],
  body:()=>{
    const E=ENV();
    return '<p class="lead">「'+esc(E.name)+'」に登録された、登録記号を持つ実際の1機の一覧です。</p>'
     +(E.aircraft.length?E.aircraft.map(a=>{const g=groupOf(a.group);return '<button class="li" data-act="reg-open" data-t="aircraft" data-id="'+a.id+'" style="'+(a.dead?'opacity:.55':'')+'"><span class="ico">✈</span><span class="tx"><b>'+esc(a.name)+'</b><small>'+esc(a.model)+' ／ <span class="mono">'+esc(a.mark)+'</span></small><small>'+(a.batOn?'BAT管理 ON ／ '+esc(g?g.name:'グループ未設定'):'BAT管理 OFF')+'</small></span>'+(a.dead?'<i class="chip ng">抹消</i>':(a.expiry&&daysTo(a.expiry)<=30?'<i class="chip warn">期限まで'+daysTo(a.expiry)+'日</i>':''))+'<span class="go">›</span></button>'}).join(''):'<div class="empty"><b>登録された機体がありません</b><br>ここで追加するか、新規飛行の途中で「機体を選ぶ」ときにその場で登録できます。</div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="aircraft">＋ 機体を追加</button>'
     +'<p class="note">追加すると、裏側の02（登録機体）と、BAT共用グループとの関係が更新されます。利用者はDriveのファイル名やセルの位置を知らなくても操作できます（34g §3）。</p>';
  }
});

/* ---------- BAT管理（32d §5.1 一覧・§5.2 詳細） ---------- */
const BAT_FILTERS=[['all','すべて'],['abn','状態確認に異常あり'],['cyc','サイクル数が未確認'],['old','1週間以上使っていない']];
function batPass(b){const f=A.ui.batF||'all';return f==='all'||(f==='abn'&&b.check!=='異常なし')||(f==='cyc'&&b.cycle==null)||(f==='old'&&(b.lastDays==null||b.lastDays>=7))}
def('set-bat',{t:'BAT管理',st:'BATの一覧（各BATシートから導く表示）',
  goal:'BAT管理をONにした機体で使うBATの、最終使用・状態確認・累計を見て、追加・詳細へ進む。',
  doc:'32d §5.1・§6（BAT一覧の案。多数の機体・BATでも状態が分かる）／32e（BAT管理は機体単位の任意）／32f（総合BAT台帳は置かず、一覧は各BATシートから導く）／32h（使用許可機体）。',state:'proposal',
  tmp:['32dは「表示の案（オーナー確認待ち）」。現在状態（保管・充電など）の値は未確定で、ここには出していない（PENDING-D-BAT-STATES）','BATを新しく登録する画面は個別には設計されていない。ここでは登録の入口だけ置いた（仮）','件数が多いときの見せ方は未検証（VERIFY-D-BAT-SCALE）'],
  ask:['一覧の列は、管理ラベル・最終使用・状態確認・サイクル・累計でよいか','「機体セット別」の表示は要るか（PENDING-D-BAT-SET-VIEW）'],
  body:()=>{
    const E=ENV();const onAc=E.aircraft.filter(a=>a.batOn);
    if(!onAc.length)return '<div class="empty"><b>BAT管理をONにした機体がありません</b><br>BAT管理は機体ごとの任意です（OFFでも飛行記録は最後まで完結します）。使う場合は、［機体管理］で機体のBAT管理をONにします。</div><button class="btn" style="width:100%" data-act="go" data-s="set-aircraft">機体管理へ</button>';
    const list=E.bats.filter(batPass);
    const cnts=[['今日使ったBAT',E.bats.filter(b=>b.lastDays===0).length],['状態確認に異常あり',E.bats.filter(b=>b.check!=='異常なし').length],['サイクル数が未確認',E.bats.filter(b=>b.cycle==null).length],['1週間以上使っていない',E.bats.filter(b=>b.lastDays==null||b.lastDays>=7).length]];
    return E.batGroups.map(g=>'<div class="sec"><h3>'+esc(g.name)+'</h3><p class="note" style="margin:0">使用許可機体: '+(E.aircraft.filter(a=>a.group===g.id).map(a=>esc(a.name)+'（'+esc(a.mark)+'）').join('、')||'なし')+'</p></div>').join('')
     +'<div class="sec"><h3>集計</h3><div class="pills">'+cnts.map(c=>'<span class="chip">'+c[0]+' '+c[1]+'</span>').join('')+'</div></div>'
     +'<div class="filters">'+BAT_FILTERS.map(f=>'<button class="pill'+((A.ui.batF||'all')===f[0]?' sel':'')+'" data-act="bat-filter" data-v="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>'
     +(list.length?'<div class="sec" style="padding:4px 8px"><table class="kv grid"><tr><th>ラベル</th><th>状態確認</th><th>サイクル</th><th>累計</th><th>最終使用</th></tr>'+list.map(b=>'<tr data-act="bat-open" data-id="'+b.id+'" style="cursor:pointer"><td><b>'+esc(b.label)+'</b></td><td>'+(b.check==='異常なし'?esc(b.check):'<i class="chip ng">'+esc(b.check)+'</i>')+'</td><td>'+(b.cycle==null?'未確認':b.cycle+'（'+esc(b.cycleAt)+'）')+'</td><td>'+Math.floor(b.min/60)+':'+pad(b.min%60)+'</td><td>'+(b.lastDays==null?'—':(b.lastDays===0?'今日':b.lastDays+'日前')+'・'+esc(acName(b.lastAc)))+'</td></tr>').join('')+'</table></div>':'<div class="empty">この条件に合うBATはありません</div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="bat">＋ BATを追加</button>';
  }
});
def('bat-detail',{t:()=>{const b=batOf(A.ui.batId);return b?b.label:'BAT'},st:'BAT詳細と履歴',
  goal:'1本のBATの上部の情報と使用履歴を確かめ、必要なら状態確認を更新する。',
  doc:'32d §5.2（BAT詳細と履歴の案）／32b §3（中古BATの取得時確認）／32f §4。履歴は飛行の記録から自動で並ぶ。',state:'proposal',
  tmp:['履歴の列は未確定（PENDING-D-BAT-HISTORY-COLUMNS）','現在状態（保管・充電など）は出していない（PENDING-D-BAT-STATES）'],ask:['詳細に出す項目と、更新できる項目'],
  body:()=>{
    const E=ENV();const b=batOf(A.ui.batId);if(!b)return '<div class="empty">BATが見つかりません</div>';const g=groupOf(b.group);
    return '<div class="sec"><h3>上部の情報</h3><table class="kv"><tr><td>型式</td><td>'+esc(b.model)+'</td></tr><tr><td>共用グループ</td><td>'+esc(g?g.name:'—')+'</td></tr><tr><td>使用許可機体</td><td>'+(E.aircraft.filter(a=>a.group===b.group).map(a=>esc(a.name)).join('、')||'—')+'</td></tr><tr><td>取得</td><td>'+(b.source==='used'?'中古（取得時の状態として区別して表示）':'新品')+'</td></tr><tr><td>累計飛行時間</td><td>'+Math.floor(b.min/60)+'時間'+pad(b.min%60)+'分</td></tr><tr><td>使用回数</td><td>'+b.uses+'</td></tr><tr><td>最終使用</td><td>'+(b.lastDays==null?'—':(b.lastDays===0?'今日':b.lastDays+'日前')+'・'+esc(acName(b.lastAc)))+'</td></tr><tr><td>最新サイクル数</td><td>'+(b.cycle==null?'未確認':b.cycle+'（'+esc(b.cycleAt)+'に確認）')+'</td></tr><tr><td>直近の状態確認</td><td>'+esc(b.check)+'</td></tr></table>'
     +'<div class="row"><button class="btn sm" data-act="bat-check">状態確認を更新</button><button class="btn sm" data-act="reg-open" data-t="bat" data-id="'+b.id+'">情報を変更</button></div></div>'
     +'<div class="sec"><h3>使用履歴 <small>新しい順・飛行の記録から自動</small></h3>'+(b.hist.length?'<table class="kv grid"><tr><th>日付</th><th>機体</th><th>飛行</th><th>状態確認</th></tr>'+b.hist.map(h=>'<tr><td>'+esc(h.d)+'</td><td>'+esc(h.ac?acName(h.ac):'—')+'</td><td>'+h.min+'分</td><td>'+esc(h.chk)+'</td></tr>').join('')+'</table>':'<div class="empty">履歴はまだありません</div>')+'<p class="note">履歴は消しません。訂正は、訂正した事実を残す形にする案です。</p></div>'
     +(A.gAccess==='view'?'<div class="msg warn">Google側が閲覧のみのため、更新はできません（表示のみ）。</div>':'');
  }
});

/* ---------- 許可・承認／保険／連絡先 ---------- */
def('set-docs',{t:'許可・承認／保険／連絡先',st:'DIPSの入力に使う登録済み情報',
  goal:'新規飛行の「許可番号」「保険」「連絡先」に自動で入る、登録済み情報を管理する。',
  doc:'25b／26（DIPSの入力項目）。置き場所と分類は未確定（PENDING-S6-DRIVE-PLACEMENT。旧案のPermissions／InsurancePoliciesなどをどの責任領域へ置くかは未決）。',state:'tmp',
  tmp:['3つを1画面にまとめる分類は仮','許可承認は「複数」、保険と連絡先は「1つ」としているのも仮'],ask:['3つを別々の設定項目にするか、まとめるか'],
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
  tmp:['一覧と登録画面は仮。プリセットは新規飛行の飛行範囲の画面からも保存できる想定'],ask:['現場（場所）と範囲プリセットを、別の設定項目に分けるか'],
  body:()=>{
    const E=ENV();
    return (E.presets.length?E.presets.map(p=>'<button class="li" data-act="reg-open" data-t="preset" data-id="'+p.id+'"><span class="ico">📍</span><span class="tx"><b>'+esc(p.name)+'</b><small>高度 '+p.alt+'m ／ '+esc(p.to||'—')+'</small></span><span class="go">›</span></button>').join(''):'<div class="empty">現場プリセットはまだありません。新規飛行の飛行範囲の画面から「プリセットとして保存」もできます。</div>')
     +'<button class="card add" style="width:100%" data-act="reg-open" data-t="preset">＋ 現場プリセットを追加</button>';
  }
});

/* ---------- DIPS連携・点検整備・同期（個別の画面設計がないため簡略） ---------- */
def('set-dips',{t:'DIPS連携',st:'APIの利用状況',
  goal:'DIPS APIが使えるかどうかの状態と、Manual（DIPS Webへ転記）が常に使えることを示す。',
  doc:'33b（API未承認・credential未発行・接続不能でも、Manual経路とAPI非依存の計画・現場記録は独立して成立する）／24（Manualを第一級とする）。この設定画面自体は、個別には設計されていない。',state:'none',
  tmp:['この画面の存在自体が仮。API利用可否の切替は、モックの操作（実際は審査結果・接続状態で決まる）'],ask:['API利用の状態を、利用者に見せる必要があるか'],
  body:()=>'<div class="sec"><h3>DIPS API '+tmpChip+'</h3><div class="row"><span class="seg"><button class="'+(A.apiOk?'on':'')+'" data-act="api" data-v="1">利用できる（仮）</button><button class="'+(!A.apiOk?'on':'')+'" data-act="api" data-v="0">利用できない（仮）</button></span></div>'
   +'<p class="note">'+(A.apiOk?'APIが使える場合は、新規飛行の最後で「アプリからDIPSへ送信」を選べます。':'APIが使えない場合でも、DIPS Webへ転記して通報する経路（Manual）で、最後まで飛行できます。')+'</p></div>'
   +'<div class="sec"><h3>Manual（DIPS Webへ転記）</h3><p class="lead" style="margin:0">常に使えます。APIの承認状況にかかわらず、現場での運用を止めません。</p></div>'
});
def('set-maint',{t:'点検整備記録',st:'機体別の詳細な点検整備',
  goal:'機体ごとの詳細な点検整備の記録（通常の日常点検とは別の責任）への入口。',
  doc:'36（機体別の詳細な点検整備は05に置く。通常の日常点検と分離）。この入口の画面は未設計。整備台帳の詳細入力フォームを、通常運航の画面へ混ぜない（35b §9）。',state:'none',
  tmp:['入口だけ置いた仮の画面。中身は未設計'],ask:['点検整備記録を、設定の中に置くか、機体の詳細から開くか'],
  body:()=>{const E=ENV();return '<div class="empty"><b>設計未着手</b><br>機体別の点検整備記録（05）の画面は、まだ設計していません。</div>'+E.aircraft.map(a=>'<button class="li" data-act="stub" data-t="'+esc(a.name)+'の点検整備記録" data-m="機体別の点検整備記録の画面は未設計です（36）。通常の日常点検とは別に扱います。"><span class="ico">🔧</span><span class="tx"><b>'+esc(a.name)+'</b><small class="mono">'+esc(a.mark)+'</small></span><span class="go">›</span></button>').join('')}
});
function unsynced(){const E=ENV();if(!E)return 0;return E.flights.filter(f=>!f.synced).length+E.flights.filter(f=>f.kml==='pending').length+E.plans.filter(p=>p.kml==='pending').length}
def('set-sync',{t:'保存・同期',st:'未同期の確認',
  goal:'端末に保護されていて、まだGoogle Drive／Sheetsへ反映されていないものを確認し、通信できるときに反映する。',
  doc:'14 §3.4（記録ごとの状態表示）／38a §4（正本を確認する時点とcacheの表示）／27e §4（未同期のKMLを保持し、通信復帰時と最後の送信時に再送）。全画面に共通する見せ方は未設計（34f PENDING-D-STATUS-DISPLAY）。',state:'none',
  tmp:['この画面自体が仮。オフライン・未同期・エラーの共通の見せ方は未設計'],ask:['未同期の状態を、各画面のどこにどう見せるか'],
  body:()=>{
    const E=ENV();const n=unsynced();
    return '<div class="sec"><h3>通信の状態 '+tmpChip+'</h3><div class="row"><span class="seg"><button class="'+(A.online?'on':'')+'" data-act="online" data-v="1">オンライン</button><button class="'+(!A.online?'on':'')+'" data-act="online" data-v="0">オフライン</button></span></div><p class="note">（モックの操作）オフラインにすると、通報・保存・出力の画面が「通信できない」場合の表示に変わります。</p></div>'
     +'<div class="sec"><h3>未同期</h3>'+(n?'<ul style="margin:0;padding-left:1.2em;font-size:13px">'+E.flights.filter(f=>!f.synced).map(f=>'<li>運航記録「'+esc(f.label)+'」（端末に保護中。Sheetsへ未反映）</li>').join('')+E.flights.filter(f=>f.kml==='pending').map(f=>'<li>KML「'+esc(f.label)+'」（Driveへ未保存）</li>').join('')+E.plans.filter(p=>p.kml==='pending').map(p=>'<li>KML「'+esc(p.name)+'」（Driveへ未保存）</li>').join('')+'</ul><button class="btn" style="margin-top:8px" data-act="sync-now"'+(A.online?'':' disabled')+'>今すぐ反映する（モック）</button>'+(A.online?'':'<p class="note">オフラインのため反映できません。通信できるときに、同じ内容として送ります。</p>'):'<div class="msg ok">未同期のものはありません。</div>')+'</div>';
  }
});

Object.assign(ACTS,{
  'bat-filter':t=>{A.ui.batF=t.dataset.v;render()},
  'bat-open':t=>{A.ui.batId=t.dataset.id;nav('bat-detail')},
  'bat-check':()=>{
    if(!canWrite())return;
    openSheet(()=>'<h3>状態確認を更新</h3><div class="pills">'+BAT_CHECKS.map(c=>'<button class="pill" data-act="bat-check-set" data-v="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div><p class="note">選択肢の一覧・複数選択かどうか・異常時に使用停止を促すかは未確定です（PENDING-D-BAT-CHECK-UI）。</p><div class="row"><button class="btn" data-act="close">閉じる</button></div>');
  },
  'bat-check-set':t=>{const b=batOf(A.ui.batId);b.check=t.dataset.v;b.hist.unshift({d:slash(TODAY),ac:b.lastAc,min:0,chk:b.check+'（手入力）'});A.modal=null;render();toast('状態確認を更新しました（履歴に残ります）')},
  'api':t=>{A.apiOk=t.dataset.v==='1';render()},
  'online':t=>{A.online=t.dataset.v==='1';render()},
  'sync-now':()=>{const E=ENV();E.flights.forEach(f=>{f.synced=true;if(f.kml==='pending')f.kml='saved'});E.plans.forEach(p=>{if(p.kml==='pending')p.kml='saved'});render();toast('未同期のものを反映しました（モック）')}
});
