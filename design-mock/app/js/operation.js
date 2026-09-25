'use strict';
/* ===================================================================
   通常運航（飛行前点検 → 離陸待機 → 飛行中 → 着陸後入力 → 続行／BAT交換／機体交代／終了 → 飛行後点検 → 最終送信・保存）
   設計の出典: 35b（10項目）／34f §2／34g §2（対象機体を取り違えない表示）／32d §5.3・32g（BAT交換）／13a・13c（現場の打刻・離陸前評価）／35d（最終保存）
   点検項目の中身・BATの状態確認の選択肢などは、既存の点検・各正本を参照する。ここは流れを確かめるための簡略版。
   =================================================================== */
const PRE_ITEMS=['機体全般（取付状態・ネジの緩み・登録記号）','プロペラ・フレーム（損傷・亀裂・ゆがみ）','通信系統（機体とプロポの通信状態）','推進系統（モーターの作動・異音）','電源系統（機体電源・警告表示）','自動制御系統（GPS・コンパス等の表示）','バッテリー（装着・残量・温度）','操縦装置（プロポの作動・電池残量）','灯火（作動状態）','カメラ（取付・作動状態）','リモートID（作動状態）'];
const POST_ITEMS=['機体全般（損傷・異常）','プロペラ・フレーム（損傷・緩み）','発熱（機体・モーター・BAT）','その他（飛行中の不具合・異常）'];
const flownAcs=()=>[...new Set(A.op.legs.map(l=>l.ac))];
const preReady=()=>PRE_ITEMS.every((_,i)=>(A.op.pre[A.op.ac]||{})[i]===true)&&batReady();
const postReady=()=>flownAcs().length>0&&flownAcs().every(id=>POST_ITEMS.every((_,i)=>typeof (A.op.post[id]||{})[i]==='boolean'))&&(flownAcs().every(id=>POST_ITEMS.every((_,i)=>A.op.post[id][i]))||!!A.op.notes.trim());
const simpleReady=()=>A.op.cur.simple&&A.op.cur.simple.every(Boolean);
function simpleChecks(){return '<div class="sec"><h3>離陸前の簡易確認</h3>'+['装着・ロック','残量・温度・警告表示'].map((x,i)=>tgl('op-simple','data-i="'+i+'"',x,!!(A.op.cur.simple||[])[i])).join('')+'</div>'}
function actualCheckButton(kind){const op=A.op;const key=kind==='pre'?'preObserved':'postObserved';return '<label class="tgl"><input type="checkbox" data-bind="~'+key+'" data-rerender="1"'+(op[key]?' checked':'')+'> '+(kind==='pre'?'この機体の11項目を実機で確認しました':'今回飛ばした全機体を実機で確認しました')+'</label><button class="btn" data-act="op-normal" data-k="'+kind+'"'+(op[key]?'':' disabled')+'>全て正常（実機確認済み）</button>'}
const opAc=()=>acOf(A.op.ac);
const opGo=id=>{A.stack=['home'];A.route=id;A.modal=null;render(false)};
function opTarget(){const a=opAc();const E=ENV();return '<div class="msg info" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span><b>対象機体</b> '+esc(a?a.model:'—')+' / <span class="mono">'+esc(a?a.mark:'')+'</span></span><span>操縦者: '+esc(plName(A.op.pilot))+(A.op.recorder&&A.op.recorder!==A.op.pilot?' ／ 記録者: '+esc(plName(A.op.recorder)):'')+'</span></div>'}
function makeOp(plan,s){
  const E=ENV();const sn=clone(plan?plan.snap:s);
  let ac=plan?plan.ac[0]:s.aircraft[0];if(!acOf(ac)||acOf(ac).dead){const a=E.aircraft.find(x=>!x.dead);ac=a?a.id:ac}
  const pilot=(plan?plan.pl[0]:s.pilots[0])||E.meId;
  return {submission:plan?clone(plan):null,planId:plan?plan.id:null,name:sn.planName,snap:sn,noDips:!plan,dips:plan?plan.dips:'none',kml:plan?plan.kml:'none',ac,acs:[ac],pilot,recorder:'',inspections:{pre:{},post:{}},checked:{},pre:{},post:{},preNotes:{},preObserved:false,postObserved:false,cur:{bat:null,offAt:null,extra:0,simple:[false,false],takeoffPlace:sn.to||sn.from||''},last:null,legs:[],ack:false,notes:''};
}
function startOp(plan,s){if(plan&&plan.dips!=='clean'){toast('DIPSで受付と重複の状態を確認してください');return}const selected=plan?plan.ac[0]:s.aircraft[0];if(!acOf(selected)||acOf(selected).dead){toast('対象機体の登録情報を確認してください');return}A.op=makeOp(plan,s);if(!plan)delete ENV().planDraft;S=null;A.nfResult=null;opGo('op-pre')}
/* 画面一覧から、途中の画面へ直接飛ぶときの準備（仮データの運航を自動で整える。設計確認用） */
function opPrep(id){
  const E=ENV();
  if(id==='op-done'){
    if(!A.opDone){const f=E.flights[0];if(!f){mtoast('完了した飛行がありません。仮データを入れるか、飛行を完了させてください');return false}A.opDone={fid:f.id,name:f.label,n:f.legs.length,synced:f.synced,kml:f.kml,dips:f.dips,dailySaved:f.dailySaved}}
    return true;
  }
  if(!A.op){
    const pl=E.plans[0];
    if(pl)A.op=makeOp(pl,null);
    else{const a=E.aircraft.find(x=>!x.dead);if(!a){mtoast('機体がありません。仮データを入れるか、機体を登録してください');return false}
      const sn=blankNF(E);sn.aircraft=[a.id];sn.pilots=[E.meId];sn.to='現場';A.op=makeOp(null,sn)}
  }
  const op=A.op,a=opAc();
  if(id!=='op-pre'){op.checked[a.id]=true;op.pre[a.id]={};PRE_ITEMS.forEach((_,i)=>op.pre[a.id][i]=true)}
  if(['op-standby','op-fly'].includes(id)){
    if(a.batOn&&!op.cur.bat){const b=E.bats.find(x=>x.group===a.group);if(b)op.cur.bat={id:b.id,cycle:'',check:'異常なし',note:''}}
    if(id==='op-fly')op.cur.offAt=op.cur.offAt||Date.now()-90000;
  }
  if(['op-landed','op-next','op-bat','op-switch','op-post','op-final'].includes(id)&&!op.legs.length){
    const b=a.batOn?E.bats.find(x=>x.group===a.group):null;
    const leg={n:1,ac:a.id,bat:b?b.label:null,batId:b?b.id:null,batInfo:b?{id:b.id,cycle:'',check:'異常なし',note:''}:null,off:'10:00',on:'10:12',min:12,place:op.snap.to||'現場',note:''};
    op.legs.push(leg);op.last=leg;
  }
  if((id==='op-landed'||id==='op-next')&&!op.last)op.last=op.legs[op.legs.length-1];
  if(id==='op-bat'||id==='op-switch')op.cur.bat=null;
  if(['op-next','op-final'].includes(id)&&op.last)op.last.confirmed=true;
  if(id==='op-final')flownAcs().forEach(aid=>{op.post[aid]={};POST_ITEMS.forEach((_,i)=>op.post[aid][i]=true)});
  return true;
}
function readiness(){
  const op=A.op,s=op.snap,E=ENV();const R=[];
  if(op.noDips)R.push(['DIPS通報','info','通報しない飛行です（通報要否は別に判断します）']);
  else if(op.dips==='dup')R.push(['DIPS通報','warn','通報済みですが、他の計画と重複があります']);
  else R.push(['DIPS通報','ok',op.dips==='manual'?'DIPS Webで通報し、確認済みです':'通報済み・重複なし']);
  const need=needTags(s);
  if(!s.permit||s.permit==='none')R.push(['許可・承認',need.length?'warn':'na',need.length?'許可なしで「'+need.join('・')+'」を選んでいます':'許可なし（不要）']);
  else{const pm=E.permits.find(x=>x.id===s.permit);R.push(['許可・承認',pm&&daysTo(pm.to)>=0?'ok':'warn',pm?(!pm.to?'許可の期間を確認してください':daysTo(pm.to)>=0?'有効期間内です':'許可の期限が切れています'):'許可が見つかりません'])}
  R.push(['飛行前点検',op.checked[op.ac]?'ok':'ng',op.checked[op.ac]?'済み':'未実施（離陸待機へ進めません）']);
  R.push(['空域・現場','unk','この場で確認してください（アプリは判断しません）']);
  R.push(['気象','unk','この場で確認してください（アプリは判断しません）']);
  return R;
}
const RES={ok:['ok','✓ 問題なし'],warn:['warn','⚠ 警告'],unk:['','未確認'],ng:['ng','✕ 要対応'],info:['info','情報'],na:['','対象外']};

/* BATの選択と4項目の入力（離陸待機・BAT交換で共通。32d §5.3／32g） */
function batPicker(){
  const op=A.op,E=ENV(),a=opAc();
  if(!a.batOn)return '<div class="sec"><h3>BAT</h3><p class="lead" style="margin:0">この機体は<b>BAT管理がOFF</b>です。個体のBATを選ぶ・入力する必要はありません（飛行記録・点検記録は最後まで完結します）。</p></div>';
  const g=groupOf(a.group);const cands=E.bats.filter(b=>b.group===a.group).sort((x,y)=>(y.lastDays==null?999:y.lastDays)-(x.lastDays==null?999:x.lastDays));
  const b=op.cur.bat;
  if(!b)return '<div class="sec"><h3>使うBATを選ぶ <small>この機体に使用が許可されたBATだけ</small></h3><p class="note" style="margin:0 0 6px">使用許可: '+esc(g?g.name:'（グループ未設定）')+'。最後に使ったのが古いものを、上に並べています。</p>'
    +(cands.length?cands.map(x=>'<button class="card" style="width:100%;margin-bottom:6px" data-act="op-bat-pick" data-id="'+x.id+'"><b>'+esc(x.label)+'</b><span>最終使用: '+(x.lastDays==null?'—':(x.lastDays===0?'今日':x.lastDays+'日前')+'・'+esc(acName(x.lastAc)))+' ／ 直近の状態確認: '+esc(x.check)+' ／ サイクル: '+(x.cycle==null?'未確認':x.cycle+'（'+esc(x.cycleAt)+'）')+'</span></button>').join(''):'<div class="empty"><b>この機体で使えるBATが登録されていません</b><br>その場で登録できます。</div>')
    +'<button class="card add" style="width:100%" data-act="op-bat-reg">＋ BATをここで登録する</button></div>';
  const bt=batOf(b.id);
  return '<div class="sec"><h3>使うBAT</h3><div class="msg ok"><b>'+esc(bt.label)+'</b>（'+esc(g?g.name:'')+'）</div>'
   +'<div class="row"><label>サイクル数</label><input class="in" type="number" data-bind="~cur.bat.cycle" data-num="1" value="'+esc(b.cycle)+'" placeholder="確認できたときだけ（任意）"></div>'
   +'<div class="grp">状態確認 <small>必須</small></div><div class="pills">'+BAT_CHECKS.map(c=>'<button class="pill'+(b.check===c?' sel':'')+'" data-act="op-bat-check" data-v="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div>'
   +(b.check&&b.check!=='異常なし'?'<div class="msg warn">異常が選ばれました。このBATを使うかどうかは、よく確認して判断してください。離陸した事実は、そのまま記録できます。</div>':'')
   +'<div class="row"><label>備考</label><textarea class="in" data-bind="~cur.bat.note" placeholder="任意">'+esc(b.note)+'</textarea></div>'
   +'<div class="row"><button class="btn sm" data-act="op-bat-clear">選び直す</button></div><p class="note">使用日時・機体・飛行時間・累計・使用回数は、自動で記録します（人が入力しません）。</p></div>';
}
const batReady=()=>{const a=opAc();return !a.batOn||(A.op.cur.bat&&batOf(A.op.cur.bat.id)?.group===a.group&&BAT_CHECKS.includes(A.op.cur.bat.check)&&(A.op.cur.bat.cycle===''||(Number.isInteger(Number(A.op.cur.bat.cycle))&&Number(A.op.cur.bat.cycle)>=0)))};
const swText=()=>{const c=A.op.cur;const sec=Math.floor((Date.now()-c.offAt)/1000+c.extra*60);return pad(Math.floor(sec/3600))+':'+pad(Math.floor(sec%3600/60))+':'+pad(sec%60)};
let SWT=null;

def('op-pre',{t:'飛行前点検',st:()=>A.op.name,back:false,
  goal:'対象機体・操縦者と、必要な点検結果を確認する。点検が済むまで、離陸待機へは進めない。',
  doc:'35b §3（飛行前点検の設計整理10項目。実機点検は11項目）／13c（飛行前日常点検が未実施・不合格なら、離陸待機へ進めない＝アプリの物理的な前提）／34g §2（対象機体を機種と登録記号で明示）／34d（通報内容から［飛行前点検へ］で接続。DIPS対象外も同じ点検以降へ合流できる）。',state:'spec',
  tmp:['旧アプリの11項目を復元。8項目に簡略化していた履歴を訂正。装着BATを先に確認し、サイクル数は任意。BAT管理OFFは32eに従い個体選択を強制しない','戻る・中止の具体UIは未確定。「飛行0回の中止」と「実績がある運航の終了」を区別する（35b §3項目7）','入力途中は端末に保護し、この画面だけで正式なDrive記録は作らない（35b §3項目8）'],
  ask:['飛行前点検で、11項目を実機で確認したと申告した後にだけ［全て正常］を使える候補を採るか（点検記録の意味・安全性が変わる。未確認のまま一括で正常にする近道ではない。PENDING-S6-OPERATION-UI）'],
  ui:['項目の並び、チェックの形、進み具合の見せ方は標準案','点検担当の変更欄は必要な場合だけ開く。既定の実施者は31cを維持する'],
  mock:()=>'<p class="note" style="margin:0 0 6px">点検項目を1つずつ押す代わりに、全部を確認済みにして、次の画面を確かめます。</p><button class="btn sm" data-act="op-pre-all">全部確認済みにする</button>',
  body:()=>{
    const op=A.op,a=opAc();const pre=op.pre[a.id]||(op.pre[a.id]={});const done=preReady();
    return opTarget()+operationActors()+inspectionContext('pre',a.id)+batPicker()+'<p>装着・電源投入後、実機を見て11項目を確認してください。</p><div class="sec"><h3>点検項目 '+tmpChip+'</h3>'+PRE_ITEMS.map((x,i)=>tgl('op-pre-tog','data-i="'+i+'"',x,!!pre[i])).join('')
     +actualCheckButton('pre')+'<div class="fld"><label>異常箇所の特記事項</label><textarea class="in" data-bind="~preNotes.'+a.id+'" placeholder="異常項目はチェックを外し、内容・処置を入力">'+esc(op.preNotes[a.id]||'')+'</textarea></div><p class="note">未確認の項目は正常になりません。異常がある場合は飛行を止め、必要な点検・整備を行ってください。</p></div>'
     +'<div class="msg '+(done?'ok':'warn')+'">'+(done?'点検が済んでいます。':'点検が済むまで、離陸待機へは進めません。')+'</div>'
     +(op.legs.length?'':'<p class="note">'+(op.noDips?'通報しない飛行として始めています。':'DIPS通報内容から、点検へ進みました。')+'</p>');
  },
  foot:()=>{const a=opAc();const pre=A.op.pre[a.id]||{};const done=preReady();return '<button class="btn" data-act="op-abort">運航をやめる</button><button class="btn primary" data-act="op-pre-done"'+(done?'':' disabled')+'>離陸待機へ</button>'}
});
def('op-standby',{t:'離陸待機',st:()=>A.op.name,back:false,
  goal:'次の離陸を記録する準備を整える（BAT管理ONの機体は、使うBATを選ぶ）。',
  doc:'35b §4（離陸待機の10項目：大きな離陸ボタン、対象機体・運航文脈の表示）／13c（離陸前の総合確認：警告は促すが、実際の離陸の記録は拒否しない）／32g・32h §8（BAT選択は対象機体に使用許可されたBATだけ）。',state:'spec',
  tmp:['旧アプリ基準でBATは飛行前点検の先頭で選択。ここは点検済みBAT・離陸場所・対象機体を表示する。確認表は補助として折り畳む','離陸前の確認の並び・表現は仮。アプリは法令上の離陸可否を保証しない（13c）','ボタン配置・再準備の見せ方は未確定（35b §4項目10）'],
  ask:[],
  ui:['BATの選択を離陸待機の画面に含めるか分けるか、警告の出し方は標準案'],
  body:()=>{
    const op=A.op;const R=readiness();
    const b=op.cur.bat?batOf(op.cur.bat.id):null;
    return opTarget()+operationActors()+'<div class="sec"><h3>点検済みBAT</h3><p>'+esc(b?b.label:(opAc().batOn?'BAT未選択':'BAT管理がOFF'))+'</p><label>離陸場所</label><input class="in" data-bind="~cur.takeoffPlace" value="'+esc(op.cur.takeoffPlace)+'" placeholder="離陸する場所"></div>'
     +(op.checked[op.ac]&&op.cur.needsSimple?batPicker()+simpleChecks():'')
     +'<details class="sec"><summary>離陸前の確認</summary>'+R.map(r=>'<p><b>'+esc(r[0])+'</b> '+esc(r[2])+'</p>').join('')+'<p class="note">アプリは飛行可否を判断しません。</p></details>'
     +'<button class="btn" data-act="op-to-switch">離陸前に機体交代</button>';

  },
  foot:()=>'<button class="btn primary big" style="flex:1" data-act="op-takeoff"'+(batReady()&&(!A.op.cur.needsSimple||simpleReady())?'':' disabled')+'>離陸開始</button>'
});
def('op-fly',{t:'飛行中',st:'',back:false,env:false,
  goal:'飛行中の状態を保持し、着陸を記録する。',
  doc:'35b §5（飛行中の10項目）／13a（ストップウォッチ。画面中央に大きな着陸ボタン。イベントは端末に即時保護され、再起動しても直前の状態へ復帰する）。',state:'spec',
  tmp:['実際の現場では実時間で計る。右側の「この画面の確認用操作」で、経過を早送りできる','戻る・中断・異常時の画面復帰は未確定（35b §5項目10）'],
  ask:[],
  ui:['飛行中に出す情報（対象機体・BAT・経過時間）と、操作を着陸完了だけにする置き方は標準案'],
  mock:()=>'<p class="note" style="margin:0 0 6px">実際の現場では、実時間で計ります。経過を早送りして、着陸後の画面を確かめます。</p><button class="btn sm" data-act="op-ff">＋5分（早送り）</button>',
  body:()=>{const c=A.op.cur;const b=c.bat?batOf(c.bat.id):null;return opTarget()+'<div class="big-sw" id="sw">'+swText()+'</div><p class="note" style="text-align:center">離陸 '+hm(new Date(c.offAt))+(b?' ／ 使用BAT: '+esc(b.label):'')+'</p><p class="flight-focus">飛行中は画面操作をせず、操縦と周囲確認に集中してください。</p>'},
  foot:()=>'<button class="btn primary big" style="flex:1" data-act="op-land">着陸完了（プロペラ停止後）</button>',
  after:()=>{clearInterval(SWT);SWT=setInterval(()=>{const e=$('#sw');if(!e||A.route!=='op-fly'){clearInterval(SWT);return}e.textContent=swText()},500)}
});
def('op-landed',{t:'着陸後入力',st:()=>A.op.name,back:false,
  goal:'その区間の実績を確かめ、次の作業（続行／BAT交換／機体交代／終了）を選ぶ。',
  doc:'35b §6（着陸後入力と次の操作選択の10項目）。区間の実績は端末に保護し、この時点で正式なDrive記録は作らない。BAT交換だけで飛行明細の実績を増やさない。',state:'spec',
  tmp:['各欄の入力UI・確認方法は未確定（35b §6項目10）','「続行」の表示名は未確定','修正・戻る・明細の削除の条件は未確定'],
  ask:['安全に影響した事項を、何をどこまで記録として残すか'],
  ui:['次の作業の4択の並べ方・大きさは標準案'],
  body:()=>{
    const op=A.op,l=op.last;
    return opTarget()+'<div class="sec"><h3>'+l.n+'回目の飛行</h3><p>離陸 '+l.off+' → 着陸 '+l.on+'</p>'
     +'<details class="actor-fields"><summary>離陸場所・担当者を訂正</summary><label>離陸場所</label><input class="in" data-bind="~last.takeoffPlace" value="'+esc(l.takeoffPlace||'')+'"><label>操縦者</label>'+actorSelect('last.pilot',l.pilot,ENV().people.filter(p=>p.pilot))+'<label>記録者</label>'+actorSelect('last.recorder',l.recorder||'',[{id:'',name:'操縦者と同じ'},...ENV().people])+'</details>'
     +'<div class="fld"><label>着陸場所</label><input class="in" data-bind="~last.place" value="'+esc(l.place)+'"></div>'
     +'<div class="fld"><label>実飛行時間（分）</label><input class="in" type="number" min="1" data-num="1" data-bind="~last.min" value="'+l.min+'"><p class="note">送信機の実飛行時間を確認し、必要なら訂正してください。</p></div>'
     +'<div class="fld"><label>安全に影響した事項</label><input class="in" data-bind="~last.note" value="'+esc(l.note)+'" placeholder="なければ空のまま"></div>'
     +(l.batInfo?'<div class="fld"><label>BAT所感（任意）</label><textarea class="in" data-bind="~last.batInfo.note" placeholder="気付いたことがあれば入力">'+esc(l.batInfo.note||'')+'</textarea></div>':'')+'</div>';
  },
  foot:()=>'<button class="btn primary big" data-act="op-land-confirm">着陸内容を確定して次へ</button>'
});
def('op-next',{t:'着陸記録完了',st:()=>A.op.name,back:false,
 goal:'着陸内容を確定後、続行・BAT交換・機体交代・終了を選ぶ。',
 doc:'旧アプリ35_web_flight.jsの着陸後選択画面／35b §6。',state:'proposal',
 tmp:['旧アプリの入力と次操作の分離を継承する確認候補。PENDING-S6-OPERATION-UIは維持'],
 body:()=>opTarget()+'<p>'+A.op.legs.length+'回の飛行を記録しました。</p><div class="next-actions"><button class="btn big" data-act="op-continue">同じ機体・BATで続行</button><button class="btn big" data-act="op-to-bat">BAT交換</button><button class="btn big" data-act="op-to-switch">機体交代</button><button class="btn primary big" data-act="op-to-post">終了・飛行後点検へ</button></div>'
});

function legTable(legs){return '<table class="kv grid"><tr><th>#</th><th>機体</th><th>BAT</th><th>離陸→着陸</th><th>時間</th></tr>'+legs.map(l=>'<tr><td>'+(l.n||'')+'</td><td>'+esc(acName(l.ac))+'</td><td>'+esc(l.bat||'—')+'</td><td>'+esc(l.off)+'→'+esc(l.on)+'</td><td>'+l.min+'分</td></tr>').join('')+'</table>'}
def('op-bat',{t:'BAT交換',st:()=>A.op.name,back:false,
  goal:'実際に使う次のBATを選び、同じ運航を続ける。',
  doc:'35b §7（BAT交換の10項目）／32d §5.3（交換時の選択UIの案）／32g（人の入力は管理ラベル・サイクル数（任意）・状態確認（必須）・備考（任意）の4項目）／32h §8（対象機体に使用許可されたBATだけ）。',state:'proposal',
  tmp:['個体選択UIは案（32d §5.3）','状態確認の選択肢・UIは未確定（PENDING-D-BAT-CHECK-UI）','交換中止・戻るUIは未確定'],
  ask:['異常のあるBATを選べなくするか、警告のうえ選べるようにするか（安全性）'],
  ui:['候補は最終使用が古い順に並べている'],
  body:()=>opTarget()+batPicker()+simpleChecks()+'<p class="note">対象機体を先に示し、その機体に使用が許可されたBATだけを出しています。BATを交換しただけでは、飛行の明細（A4の行）は増えません。</p>',
  foot:()=>'<button class="btn" data-act="op-bat-cancel">戻る</button><button class="btn primary" data-act="op-bat-done"'+(batReady()&&simpleReady()?'':' disabled')+'>離陸待機へ</button>'
});
def('op-switch',{t:'機体交代',st:()=>A.op.name,back:false,
  goal:'場所・目的・操縦者・許可等の文脈を引き継いで、別の機体に切り替える。',
  doc:'35b §8（機体交代の10項目）：未点検の機体は正式な飛行前点検へ、点検済みなら必要条件を確認して待機へ。過去の点検を別の機体へ転用しない。飛行済み機体の記録と終了点検を失わせない。',state:'spec',
  tmp:['Mission／Flightの境界・独立した交代イベントは未確定（35aのPENDING-S6-OPERATION-SCHEMA）','点検済みの分岐は、右側の「この画面の確認用操作」で「点検済みにする」を押すと確かめられる','交代中止・戻るの具体UIは未確定'],
  ask:[],
  ui:['交代先の候補に出す情報（点検状況・BAT管理の有無など）は標準案'],
  mock:()=>{const op=A.op,E=ENV();const c=E.aircraft.filter(a=>!a.dead&&a.id!==op.ac&&!op.checked[a.id]);return '<p class="note" style="margin:0 0 6px">未点検の機体を「この運航で点検済み」にして、点検済みの機体へ交代する分岐を確かめます。</p>'+(c.length?c.map(a=>'<button class="btn sm" data-act="op-switch-checked" data-id="'+a.id+'">'+esc(a.name)+'を点検済みにする</button>').join(' '):'<p class="note" style="margin:0">未点検の機体はありません。</p>')},
  body:()=>{
    const op=A.op,E=ENV();const cands=E.aircraft.filter(a=>!a.dead&&a.id!==op.ac);
    return opTarget()+'<div class="msg info">これまでの場所・目的・操縦者・許可などを引き継ぎます。現在の機体の実績と、終了時の点検は、失われません。</div>'
     +(cands.length?cands.map(a=>'<div class="card" style="margin-bottom:8px"><b>'+esc(a.name)+'</b><span>'+esc(a.model)+' ／ <span class="mono">'+esc(a.mark)+'</span></span><span class="chips">'+(op.checked[a.id]?'<i class="chip ok">この運航で点検済み</i>':'<i class="chip warn">未点検</i>')+(a.batOn?'<i class="chip">BAT管理 ON</i>':'<i class="chip">BAT管理 OFF</i>')+'</span><div class="row"><button class="btn sm primary" data-act="op-switch-pick" data-id="'+a.id+'">この機体に交代</button>'+'</div></div>').join(''):'<div class="empty"><b>交代できる機体がありません</b><br>ほかの登録機体がない場合は、設定で機体を追加してください。<br><button class="btn sm" style="margin-top:8px" data-act="op-switch-reg">＋ 機体をここで登録する</button></div>');
  },
  foot:()=>'<button class="btn" data-act="op-bat-cancel">戻る</button>'
});
def('op-post',{t:'飛行後点検',st:()=>A.op.name,back:false,
  goal:'使用した機体の飛行後点検と、不具合・処置などを確認して、運航を締める。',
  doc:'35b §9（飛行後点検の10項目）。異常なしを未確認で確定しない。整備台帳の詳細入力フォームをここへ混ぜない（36）。入力を含む下書きは端末に保護し、最終確定の対象へ含める（35d）。',state:'spec',
  tmp:['使用機体ごとの画面構成は未確定（35b §9項目10）。ここでは機体ごとに並べている','旧アプリの機体全般／プロペラ・フレーム／発熱／その他の4項目を継承。全て正常は全機体の実機確認を明示した後だけ。異常はチェックを外して記事へ記録'],
  ask:[],
  ui:['複数機体を使ったときの飛行後点検を、機体ごとの画面にするか1画面にするかは標準案。実際に飛ばした全機体を点検する決まりは変えない'],
  mock:()=>'<p class="note" style="margin:0 0 6px">点検項目を1つずつ押す代わりに、全部を確認済みにして、次の画面を確かめます。</p><button class="btn sm" data-act="op-post-all">全部確認済みにする</button>',
  body:()=>{
    const op=A.op;
    return flownAcs().map(id=>{const a=acOf(id);const p=op.post[id]||(op.post[id]={});return '<div class="sec"><h3>'+esc(a.name)+' <small class="mono">'+esc(a.mark)+'</small></h3>'+inspectionContext('post',id)+POST_ITEMS.map((x,i)=>tgl('op-post-tog','data-a="'+id+'" data-i="'+i+'"',x,!!p[i])).join('')+'</div>'}).join('')
     +actualCheckButton('post')+'<div class="sec"><h3>記事・不具合・処置</h3><div class="row"><textarea class="in" data-bind="~notes" data-rerender="1" placeholder="不具合があれば、発生の事情と処置を書く（なければ空のまま）">'+esc(op.notes)+'</textarea></div><p class="note">詳しい点検整備の記録は、［各種設定・管理］の［点検整備記録］で扱います。</p></div>'
;
  },
  foot:()=>{const op=A.op;const ok=postReady();return '<button class="btn primary" data-act="op-to-final"'+(ok?'':' disabled')+'>最終送信・保存へ</button>'}
});
def('op-final',{t:'最終送信・保存',st:()=>A.op.name,back:false,
  goal:'運航全体の確定対象を保存し、未同期と反映済みを区別する。',
  doc:'35b §10（最終送信・保存の10項目）／35d（保存の対象・時点・再送を別運航にしない）／27e §4（未同期のKMLは、最後の送信のときにも再送する）。通信失敗や戻る操作で、完了データを消さない。',state:'spec',
  tmp:['完了・部分失敗の表示、戻り先、再送・確認のUIは未確定（35b §10項目10）','KMLの再送を最終保存の一部とするか、同じ操作で起動する独立した再送とするかは未確定（PENDING-S7C-KML-FINAL-SEND）'],
  mock:()=>mockSeg('op-save-fail',A.ui.opSaveFail?1:0,[[0,'保存成功'],[1,'通信失敗']]),
  ask:[],
  ui:['保存に失敗したときの見せ方と、保存後の戻り先は標準案。入力内容を失わない決まりは変えない'],
  body:()=>{
    const op=A.op;const kmlPend=op.kml==='pending';
    return '<div class="sec"><h3>確定する内容</h3><table class="kv"><tr><td>運航</td><td>'+esc(op.name)+'</td></tr><tr><td>機体</td><td>'+flownAcs().map(id=>esc(acLabel(id))).join('<br>')+'</td></tr><tr><td>操縦者</td><td>'+esc(plName(op.pilot))+'</td></tr><tr><td>日常点検（飛行前・飛行後）</td><td>済み</td></tr><tr><td>飛行</td><td>'+op.legs.length+'回・合計'+op.legs.reduce((s,l)=>s+l.min,0)+'分</td></tr></table>'+legTable(op.legs)+(op.notes.trim()?'<p class="note">記事・不具合・処置: '+esc(op.notes)+'</p>':'')+'</div>'
     +(kmlPend?'<div class="msg warn">まだGoogle Driveに保存されていないKMLがあります。'+(A.online?'この操作で、あわせて保存します。':'いまはオフラインのため保存できません。通信が戻ったら、自動で保存します。')+'</div>':'')
     +(op.saveError?'<div class="msg ng">保存できませんでした。下書きはこの端末に残っています。通信回復後、もう一度保存してください。</div>':'')
     +(A.online?'<div class="msg info">［保存する］で、飛行記録・BATの使用履歴・機体の飛行時間の合計を、Google Driveに保存します。</div>':'<div class="msg warn"><b>オフラインです。</b>いまはGoogle Driveに保存できません。この端末には保存されている下書きを残し、通信が戻ったら［保存する］で再度保存できます。</div>');
  },
  foot:()=>'<button class="btn" data-act="op-to-post">戻る</button><button class="btn primary" data-act="op-finalize">保存する</button>'
});
def('op-done',{t:'運航完了',st:()=>A.opDone?A.opDone.name:'',back:false,
  goal:'保存の結果（反映済みか未同期か）を示し、次の行き先を選ぶ。',
  doc:'35b §10項目6（成功後の帰着画面・再送UIの詳細は未確定）／35d／34f §2（保存後の戻り先は未確定）。',state:'none',
  tmp:['保存後の戻り先は未確定。ここでは3つの行き先を並べて、選び方を試せるようにしている（仮）'],
  ask:[],
  ui:['保存後にホームへ戻すか、履歴で結果を見せるかは標準案'],
  body:()=>{const d=A.opDone;
    return (d.synced?'<div class="msg ok big">✓ 運航完了・保存しました</div><div class="msg ok">飛行記録・BATの使用履歴・機体の飛行時間の合計を、Google Driveに保存しました。</div>':'<div class="msg warn big">この端末に保存しました</div><div class="msg warn">まだGoogle Driveには保存されていません。通信が戻ったら、自動で保存します。</div>')
     +'<div class="sec"><h3>保存結果</h3><table class="kv"><tr><td>飛行計画</td><td>'+({clean:'通報済み',manual:'通報確認済み',none:'通報しない飛行'}[d.dips]||'記録を確認してください')+'</td></tr><tr><td>飛行記録</td><td>'+(d.synced?'保存済み':'未同期')+'</td></tr><tr><td>日常点検</td><td>'+(d.dailySaved?'保存済み':'記録を確認してください')+'</td></tr></table></div>'
     +'<div class="sec"><h3>この飛行</h3><table class="kv"><tr><td>飛行</td><td>'+esc(d.name)+'</td></tr><tr><td>飛行回数</td><td>'+d.n+'回</td></tr><tr><td>KML</td><td>'+({saved:'保存済み',pending:'まだGoogle Driveに保存されていません',none:'なし（通報しない飛行）'})[d.kml]+'</td></tr><tr><td>PDF</td><td>自動では作りません。必要なときに［飛行履歴・出力］から作ります。</td></tr></table></div>'
     +'<div class="msg info">A4の飛行記録は、この保存で自動的に出来上がります。印刷やPDFが必要なときは、［飛行履歴・出力］から作れます。</div>';
  },
  foot:()=>'<button class="btn" data-act="root" data-s="home">ホームへ</button><button class="btn primary" data-act="op-open-hist">この飛行を履歴で見る</button>'
});

function finalizeOp(){
  const E=ENV(),op=A.op;
  if(!A.online||A.ui.opSaveFail){op.saveError=true;render();return}
  const kml=op.noDips?'none':(op.kml==='pending'&&A.online?'saved':(op.kml||'saved'));
  const fl={id:uid('h'),label:op.name,date:new Date(op.legs[0].offAt||Date.now()),ac:flownAcs(),pre:clone(op.pre),post:clone(op.post),preNotes:clone(op.preNotes),pl:[...new Set(op.legs.map(l=>l.pilot||op.pilot))],legs:op.legs.map(l=>Object.assign({},clone(l),{pilot:l.pilot||op.pilot,recorder:l.recorder||l.pilot||op.pilot,bat:l.bat||'—'})),kml,dips:op.dips,dailySaved:true,submission:clone(op.submission),synced:A.online,outs:{a4:false,map:false},snap:op.snap,notes:op.notes};
  fl.inspections=clone(op.inspections);
  ['pre','post'].forEach(kind=>fl.ac.forEach(id=>{
    const c=fl.inspections[kind][id];if(!c)return;
    const leg=kind==='pre'?fl.legs.find(l=>l.ac===id):fl.legs.filter(l=>l.ac===id).at(-1);
    c.place=c.place||(kind==='pre'?leg.takeoffPlace:leg.place)||'';
  }));
  fl.masters=recordMasters(fl.ac,[...fl.pl,...fl.legs.map(l=>l.recorder),...Object.values(fl.inspections.pre).map(c=>c.person),...Object.values(fl.inspections.post).map(c=>c.person)]);
  fl.ac.forEach(id=>{const a=acOf(id),legs=fl.legs.filter(l=>l.ac===id);a.managedMinutes=(a.managedMinutes||0)+legs.reduce((sum,l)=>sum+l.min,0);a.managedCount=(a.managedCount||0)+legs.length});
  E.flights.unshift(fl);
  if(op.planId)E.plans=E.plans.filter(p=>p.id!==op.planId);
  op.legs.forEach(l=>{
    const b=l.batId&&batOf(l.batId);if(!b)return;
    b.uses+=1;b.min+=l.min;b.lastDays=0;b.lastAc=l.ac;
    if(l.batInfo){if(l.batInfo.check)b.check=l.batInfo.check;if(l.batInfo.cycle!==''&&l.batInfo.cycle!=null){b.cycle=Number(l.batInfo.cycle);b.cycleAt='今日'}if(l.batInfo.note)b.note=l.batInfo.note}
    b.hist.unshift({d:slash(new Date(l.offAt||Date.now())),ac:l.ac,min:l.min,chk:l.batInfo?.check||'',cycle:l.batInfo?.cycle===''?null:l.batInfo?.cycle,note:l.batInfo?.note||''});
  });
  A.ui.lastFlight=fl.id;A.opDone={fid:fl.id,name:op.name,n:op.legs.length,synced:A.online,kml,dips:op.dips,dailySaved:true};
  A.op=null;opGo('op-done');
}

Object.assign(ACTS,{
  'op-pre-tog':t=>{const p=A.op.pre[A.op.ac];const i=t.dataset.i;p[i]=!p[i];render()},
  'op-pre-all':()=>{const p=A.op.pre[A.op.ac]||(A.op.pre[A.op.ac]={});PRE_ITEMS.forEach((_,i)=>p[i]=true);render()},
  'op-pre-done':()=>{if(!preReady())return;A.op.checked[A.op.ac]=true;stampInspection('pre',A.op.ac);opGo('op-standby')},
  'op-abort':()=>{
    if(A.op.legs.length){toast('飛行の実績があるため、やめることはできません。「終了」から飛行後点検へ進みます');return}
    openSheet(()=>'<h3>運航をやめますか（飛行0回）</h3><p>飛行の実績がないため、記録は作らずに戻ります。通報済みの計画は、飛行リストに残ります。</p><p class="note">飛行の実績がある場合は、やめることはできません。［終了］から飛行後点検へ進みます。</p><div class="row"><button class="btn" data-act="close">やめない</button><button class="btn danger" data-act="op-abort-ok">運航をやめる</button></div>');
  },
  'op-abort-ok':()=>{A.op=null;A.modal=null;root('home');toast('運航をやめました（記録は作っていません）')},
  'op-bat-pick':t=>{A.op.cur.bat={id:t.dataset.id,cycle:'',check:null,note:''};render()},
  'op-bat-clear':()=>{A.op.cur.bat=null;render()},
  'op-bat-check':t=>{A.op.cur.bat.check=t.dataset.v;render()},
  'op-bat-reg':()=>{const a=opAc();openReg('bat',{group:a.group,ret:{label:'BATの選択',apply:id=>{A.op.cur.bat={id,cycle:'',check:null,note:''}}}})},
  'op-takeoff':()=>{
    if(!A.op.checked[A.op.ac]||!batReady()||(A.op.cur.needsSimple&&!simpleReady()))return;
    const w=readiness().some(r=>r[1]==='warn');
    const go=()=>{A.op.cur.offAt=Date.now();A.op.cur.extra=0;A.modal=null;opGo('op-fly')};
    if(w&&!A.op.ack){A.op._go=go;openSheet(()=>'<h3>警告があります</h3><ul style="padding-left:1.2em;font-size:14px">'+readiness().filter(r=>r[1]==='warn').map(r=>'<li>'+esc(r[0])+': '+esc(r[2])+'</li>').join('')+'</ul><p class="note">アプリは、離陸の事実の記録を拒否しません。法令上、離陸してよいかどうかの判断は、操縦者の責任です。</p><div class="row"><button class="btn" data-act="close">戻る</button><button class="btn primary" data-act="op-takeoff-ok">確認して離陸を記録する</button></div>');return}
    go();
  },
  'op-takeoff-ok':()=>{A.op.ack=true;const g=A.op._go;A.op._go=null;if(g)g()},
  'op-ff':()=>{A.op.cur.extra+=5;const e=$('#sw');if(e)e.textContent=swText()},
  'op-land':()=>{
    const op=A.op,c=op.cur;const now=Date.now();const sec=(now-c.offAt)/1000+c.extra*60;const min=Math.max(1,Math.round(sec/60));
    const b=c.bat?batOf(c.bat.id):null;
    const leg={n:op.legs.length+1,ac:op.ac,bat:b?b.label:null,batId:b?b.id:null,batInfo:c.bat?clone(c.bat):null,pilot:op.pilot,recorder:op.recorder||op.pilot,offAt:new Date(c.offAt).toISOString(),onAt:new Date(now).toISOString(),off:hm(new Date(c.offAt)),on:hm(new Date(now)),min,place:op.cur.takeoffPlace||op.snap.to||op.snap.from||'',takeoffPlace:op.cur.takeoffPlace,note:'',confirmed:false};
    op.legs.push(leg);op.last=leg;c.offAt=null;clearInterval(SWT);opGo('op-landed');
  },
  'op-land-confirm':()=>{const l=A.op.last;if(!l.place.trim()||!Number.isFinite(l.min)||l.min<1){toast('着陸場所と実飛行時間を確認してください');return}l.confirmed=true;opGo('op-next')},
  'op-simple':t=>{const c=A.op.cur;c.simple=c.simple||[false,false];c.simple[+t.dataset.i]=!c.simple[+t.dataset.i];render()},
  'op-normal':t=>{const k=t.dataset.k;if(k==='pre'&&A.op.preObserved)ACTS['op-pre-all']();if(k==='post'&&A.op.postObserved)ACTS['op-post-all']()},
  'op-save-fail':t=>{A.ui.opSaveFail=t.dataset.v==='1';render()},
  'op-continue':()=>{if(!A.op.last?.confirmed)return;A.op.cur.offAt=null;A.op.cur.extra=0;opGo('op-standby');toast('同じBATで続行します（必要な準備をしてから、もう一度離陸を記録します）')},
  'op-to-bat':()=>{if(!A.op.last?.confirmed)return;A.op.batBefore=clone(A.op.cur);A.op.cur.bat=null;A.op.cur.simple=[false,false];opGo('op-bat')},
  'op-bat-cancel':()=>{if(A.route==='op-bat'){if(A.op.batBefore)A.op.cur=A.op.batBefore;delete A.op.batBefore;opGo('op-next')}else opGo(A.op.switchFrom||'op-next')},
  'op-bat-done':()=>{if(!batReady()||!simpleReady())return;delete A.op.batBefore;A.op.cur.needsSimple=false;opGo('op-standby')},
  'op-to-switch':()=>{if(A.route!=='op-standby'&&!A.op.last?.confirmed)return;A.op.switchFrom=A.route;opGo('op-switch')},
  'op-switch-checked':t=>{A.op.checked[t.dataset.id]=true;render()},
  'op-switch-pick':t=>{const id=t.dataset.id;const op=A.op;op.ac=id;if(!op.acs.includes(id))op.acs.push(id);op.cur.bat=null;op.cur.simple=[false,false];op.cur.needsSimple=!!op.checked[id];op.preObserved=false;opGo(op.checked[id]?'op-standby':'op-pre');toast(op.checked[id]?'点検済みの機体へ交代しました。離陸待機へ進みます':'未点検の機体です。飛行前点検へ進みます')},
  'op-switch-reg':()=>openReg('aircraft',{ret:{label:'機体交代',apply:()=>{}}}),
  'op-to-post':()=>{if(A.route==='op-final'||A.op.last?.confirmed)opGo('op-post')},
  'op-post-tog':t=>{const p=A.op.post[t.dataset.a];const i=t.dataset.i;p[i]=!p[i];render()},
  'op-post-all':()=>{flownAcs().forEach(id=>{const p=A.op.post[id]||(A.op.post[id]={});POST_ITEMS.forEach((_,i)=>p[i]=true)});render()},
  'op-to-final':()=>{if(postReady()){flownAcs().forEach(id=>stampInspection('post',id));opGo('op-final')}},
  'op-finalize':()=>{if(!A.op||!postReady()||!finalRecordsReady()||!canWrite())return;finalizeOp()},
  'op-open-hist':()=>{A.ui.hSel=A.ui.lastFlight;root('home');nav('hist');if(SCR['hist-detail'])nav('hist-detail')}
});
