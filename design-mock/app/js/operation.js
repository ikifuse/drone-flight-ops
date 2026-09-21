'use strict';
/* ===================================================================
   通常運航（飛行前点検 → 離陸待機 → 飛行中 → 着陸後入力 → 続行／BAT交換／機体交代／終了 → 飛行後点検 → 最終送信・保存）
   設計の出典: 35b（10項目）／34f §2／34g §2（対象機体を取り違えない表示）／32d §5.3・32g（BAT交換）／13a・13c（現場の打刻・離陸前評価）／35d（最終保存）
   点検項目の中身・BATの状態確認の選択肢などは、既存の点検・各正本を参照する。ここは流れを確かめるための簡略版。
   =================================================================== */
const PRE_ITEMS=['機体の外観（破損・ひび割れがない）','プロペラ（取付状態・ネジの緩み・脱落がない）','モーター・アーム（作動・異音がない）','バッテリー（機体への取付・残量）','送信機・スマートフォン（接続・電池残量）','GPS・コンパス・カメラ（表示に異常がない）','リモートID（作動している）','周囲の安全（第三者・障害物・立入管理措置）'];
const POST_ITEMS=['機体の外観（破損・ひび割れがない）','プロペラ・モーター（異常がない）','バッテリーの取り外し・状態','飛行中の不具合・異常の有無を確認した'];
const opAc=()=>acOf(A.op.ac);
const opGo=id=>{A.stack=['home'];A.route=id;A.modal=null;render(false)};
function opTarget(){const a=opAc();const E=ENV();return '<div class="msg info" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span><b>対象機体</b> '+esc(a?a.model:'—')+' / <span class="mono">'+esc(a?a.mark:'')+'</span></span><span>操縦者: '+esc(plName(A.op.pilot))+(E.meId!==A.op.pilot?' ／ 記録者: '+esc(plName(E.meId)):'')+'</span></div>'}
function startOp(plan,s){
  const E=ENV();const sn=plan?plan.snap:clone(s);
  let ac=plan?plan.ac[0]:s.aircraft[0];if(!acOf(ac)||acOf(ac).dead){const a=E.aircraft.find(x=>!x.dead);ac=a?a.id:ac}
  const pilot=(plan?plan.pl[0]:s.pilots[0])||E.meId;
  A.op={planId:plan?plan.id:null,name:sn.planName,snap:sn,noDips:!plan,dips:plan?plan.dips:'none',kml:plan?plan.kml:'none',ac,acs:[ac],pilot,checked:{},pre:{},post:{},cur:{bat:null,offAt:null,extra:0},last:null,legs:[],ack:false,notes:''};
  S=null;A.nfResult=null;opGo('op-pre');
}
function readiness(){
  const op=A.op,s=op.snap,E=ENV();const R=[];
  if(op.noDips)R.push(['DIPS通報','info','通報しない飛行です（通報要否は別に判断します）']);
  else if(op.dips==='dup')R.push(['DIPS通報','warn','通報済みですが、他の計画と重複があります']);
  else R.push(['DIPS通報','ok',op.dips==='manual'?'Manualで通報を確認済みです':'通報済み・重複なし']);
  const need=needTags(s);
  if(!s.permit||s.permit==='none')R.push(['許可・承認',need.length?'warn':'na',need.length?'許可なしで「'+need.join('・')+'」を選んでいます':'許可なし（不要）']);
  else{const pm=E.permits.find(x=>x.id===s.permit);R.push(['許可・承認',pm&&daysTo(pm.to)>=0?'ok':'warn',pm?(daysTo(pm.to)>=0?'有効期間内です':'許可の期限が切れています'):'許可が見つかりません'])}
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
  if(!b)return '<div class="sec"><h3>使うBATを選ぶ <small>この機体に使用が許可されたBATだけ</small></h3><p class="note" style="margin:0 0 6px">使用許可: '+esc(g?g.name:'（グループ未設定）')+'。最終使用が古いものを上に並べています（案）。</p>'
    +(cands.length?cands.map(x=>'<button class="card" style="width:100%;margin-bottom:6px" data-act="op-bat-pick" data-id="'+x.id+'"><b>'+esc(x.label)+'</b><span>最終使用: '+(x.lastDays==null?'—':(x.lastDays===0?'今日':x.lastDays+'日前')+'・'+esc(acName(x.lastAc)))+' ／ 直近の状態確認: '+esc(x.check)+' ／ サイクル: '+(x.cycle==null?'未確認':x.cycle+'（'+esc(x.cycleAt)+'）')+'</span></button>').join(''):'<div class="empty"><b>この機体で使えるBATが登録されていません</b><br>その場で登録できます。</div>')
    +'<button class="card add" style="width:100%" data-act="op-bat-reg">＋ BATをここで登録する</button></div>';
  const bt=batOf(b.id);
  return '<div class="sec"><h3>使うBAT</h3><div class="msg ok"><b>'+esc(bt.label)+'</b>（'+esc(g?g.name:'')+'）</div>'
   +'<div class="row"><label>サイクル数</label><input class="in" type="number" data-bind="~cur.bat.cycle" data-num="1" value="'+esc(b.cycle)+'" placeholder="確認できたときだけ（任意）"></div>'
   +'<div class="grp">状態確認 <small>必須</small></div><div class="pills">'+BAT_CHECKS.map(c=>'<button class="pill'+(b.check===c?' sel':'')+'" data-act="op-bat-check" data-v="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div>'
   +(b.check&&b.check!=='異常なし'?'<div class="msg warn">異常が選ばれました。使用停止を促すかどうかは未確定です（PENDING-D-BAT-CHECK-UI）。実際に離陸した事実の記録は、拒否しません（13c）。</div>':'')
   +'<div class="row"><label>備考</label><textarea class="in" data-bind="~cur.bat.note" placeholder="任意">'+esc(b.note)+'</textarea></div>'
   +'<div class="row"><button class="btn sm" data-act="op-bat-clear">選び直す</button></div><p class="note">使用日時・機体・飛行時間・累計・使用回数は、自動で記録します（人が入力しません）。</p></div>';
}
const batReady=()=>{const a=opAc();return !a.batOn||(A.op.cur.bat&&A.op.cur.bat.check)};
const swText=()=>{const c=A.op.cur;const sec=Math.floor((Date.now()-c.offAt)/1000+c.extra*60);return pad(Math.floor(sec/3600))+':'+pad(Math.floor(sec%3600/60))+':'+pad(sec%60)};
let SWT=null;

def('op-pre',{t:'飛行前点検',st:()=>A.op.name,back:false,
  goal:'対象機体・操縦者と、必要な点検結果を確認する。点検が済むまで、離陸待機へは進めない。',
  doc:'35b §3（飛行前点検の10項目）／13c（飛行前日常点検が未実施・不合格なら、離陸待機へ進めない＝アプリの物理的な前提）／34g §2（対象機体を機種と登録記号で明示）／34d（通報内容から［飛行前点検へ］で接続。DIPS対象外も同じ点検以降へ合流できる）。',state:'spec',
  tmp:['点検項目の中身は仮（既存の点検・13cの正本を参照する）。実物のA4帳票の項目（プロペラ・モーターなど）に合わせている','戻る・中止の具体UIは未確定。「飛行0回の中止」と「実績がある運航の終了」を区別する（35b §3項目7）','入力途中は端末に保護し、この画面だけで正式なDrive記録は作らない（35b §3項目8）'],
  ask:['点検の入力のしかた（全部確認済みにする近道が要るか）','別人が点検した場合の入力'],
  body:()=>{
    const op=A.op,a=opAc();const pre=op.pre[a.id]||(op.pre[a.id]={});const done=PRE_ITEMS.every((_,i)=>pre[i]);
    return opTarget()+'<div class="sec"><h3>点検項目 '+tmpChip+'</h3>'+PRE_ITEMS.map((x,i)=>tgl('op-pre-tog','data-i="'+i+'"',x,!!pre[i])).join('')
     +'<div class="row"><button class="btn sm" data-act="op-pre-all">全部確認済みにする（モック）</button></div><p class="note">未実施を、正常として自動確定しません。</p></div>'
     +'<div class="msg '+(done?'ok':'warn')+'">'+(done?'点検が済んでいます。':'点検が済むまで、離陸待機へは進めません。')+'</div>'
     +(op.legs.length?'':'<p class="note">'+(op.noDips?'通報しない飛行として始めています。':'DIPS通報内容から、点検へ進みました。')+'</p>');
  },
  foot:()=>{const a=opAc();const pre=A.op.pre[a.id]||{};const done=PRE_ITEMS.every((_,i)=>pre[i]);return '<button class="btn" data-act="op-abort">運航をやめる</button><button class="btn primary" data-act="op-pre-done"'+(done?'':' disabled')+'>離陸待機へ</button>'}
});
def('op-standby',{t:'離陸待機',st:()=>A.op.name,back:false,
  goal:'次の離陸を記録する準備を整える（BAT管理ONの機体は、使うBATを選ぶ）。',
  doc:'35b §4（離陸待機の10項目：大きな離陸ボタン、対象機体・運航文脈の表示）／13c（離陸前の総合確認：警告は促すが、実際の離陸の記録は拒否しない）／32g・32h §8（BAT選択は対象機体に使用許可されたBATだけ）。',state:'spec',
  tmp:['最初のBAT選択をこの画面に置くのは仮（35b・32gは交換時の入力を主に書いている）','離陸前の確認の並び・表現は仮。アプリは法令上の離陸可否を保証しない（13c）','ボタン配置・再準備の見せ方は未確定（35b §4項目10）'],
  ask:['BATの選択を、離陸待機に含めるか、点検の直後に分けるか','警告があるときの「確認してから離陸」の見せ方'],
  body:()=>{
    const op=A.op;const R=readiness();
    return opTarget()+'<div class="sec"><h3>離陸前の確認</h3>'+R.map(r=>'<div class="rev"><div class="k">'+esc(r[0])+'</div><div class="v"><i class="chip '+RES[r[1]][0]+'">'+RES[r[1]][1]+'</i> '+esc(r[2])+'</div></div>').join('')
     +'<p class="note">アプリが操作できることと、法令上飛行できることは別です。通報が済んでいることは、飛行できることの保証ではありません（13c）。</p></div>'
     +batPicker()
     +(op.legs.length?'<p class="note">ここまでの飛行: '+op.legs.length+'回</p>':'');
  },
  foot:()=>'<button class="btn primary big" style="flex:1" data-act="op-takeoff"'+(batReady()?'':' disabled')+'>離陸</button>'
});
def('op-fly',{t:'飛行中',st:()=>A.op.name,back:false,
  goal:'飛行中の状態を保持し、着陸を記録する。',
  doc:'35b §5（飛行中の10項目）／13a（ストップウォッチ。画面中央に大きな着陸ボタン。イベントは端末に即時保護され、再起動しても直前の状態へ復帰する）。',state:'spec',
  tmp:['実際の現場では実時間で計る。モックでは「＋5分」で経過を早送りできる','戻る・中断・異常時の画面復帰は未確定（35b §5項目10）'],
  ask:['飛行中に見せたい情報（対象機体・BAT・経過時間のほかに何が要るか）'],
  body:()=>{const c=A.op.cur;const b=c.bat?batOf(c.bat.id):null;return opTarget()+'<div class="big-sw" id="sw">'+swText()+'</div><p class="note" style="text-align:center">離陸 '+hm(new Date(c.offAt))+(b?' ／ 使用BAT: '+esc(b.label):'')+'</p><div class="row" style="justify-content:center"><button class="btn sm" data-act="op-ff">＋5分（モックの早送り）</button></div><p class="note" style="text-align:center">画面を閉じても、端末に保護されているため、離陸した状態から続けられます。</p>'},
  foot:()=>'<button class="btn primary big" style="flex:1" data-act="op-land">着陸</button>',
  after:()=>{clearInterval(SWT);SWT=setInterval(()=>{const e=$('#sw');if(!e||A.route!=='op-fly'){clearInterval(SWT);return}e.textContent=swText()},500)}
});
def('op-landed',{t:'着陸後入力',st:()=>A.op.name,back:false,
  goal:'その区間の実績を確かめ、次の作業（続行／BAT交換／機体交代／終了）を選ぶ。',
  doc:'35b §6（着陸後入力と次の操作選択の10項目）。区間の実績は端末に保護し、この時点で正式なDrive記録は作らない。BAT交換だけで飛行明細の実績を増やさない。',state:'spec',
  tmp:['各欄の入力UI・確認方法は未確定（35b §6項目10）','「続行」の表示名は未確定','修正・戻る・明細の削除の条件は未確定'],
  ask:['次の作業の4択の並べ方・大きさ','安全に影響した事項の入力のしかた'],
  body:()=>{
    const op=A.op,l=op.last;
    return opTarget()+'<div class="sec"><h3>この区間 <small>'+l.n+'回目の飛行</small></h3><table class="kv"><tr><td>離陸 → 着陸</td><td>'+l.off+' → '+l.on+'</td></tr><tr><td>飛行時間</td><td>'+l.min+'分</td></tr><tr><td>使用BAT</td><td>'+esc(l.bat||'（BAT管理OFF）')+'</td></tr></table>'
     +'<div class="row"><label>場所</label><input class="in" data-bind="~last.place" value="'+esc(l.place)+'"></div><div class="row"><label>安全に影響した事項</label><input class="in" data-bind="~last.note" value="'+esc(l.note)+'" placeholder="なければ空のまま"></div></div>'
     +'<div class="sec"><h3>次の作業を選ぶ</h3><div class="actbar"><button class="btn big" style="font-size:16px;padding:16px 6px" data-act="op-continue">続行<br><small>もう一度離陸</small></button><button class="btn big" style="font-size:16px;padding:16px 6px" data-act="op-to-bat">BAT交換</button><button class="btn big" style="font-size:16px;padding:16px 6px" data-act="op-to-switch">機体交代</button><button class="btn big primary" style="font-size:16px;padding:16px 6px" data-act="op-to-post">終了<br><small>飛行後点検へ</small></button></div></div>'
     +(op.legs.length>1?'<div class="sec"><h3>これまでの飛行</h3>'+legTable(op.legs)+'</div>':'');
  }
});
function legTable(legs){return '<table class="kv grid"><tr><th>#</th><th>機体</th><th>BAT</th><th>離陸→着陸</th><th>時間</th></tr>'+legs.map(l=>'<tr><td>'+(l.n||'')+'</td><td>'+esc(acName(l.ac))+'</td><td>'+esc(l.bat||'—')+'</td><td>'+esc(l.off)+'→'+esc(l.on)+'</td><td>'+l.min+'分</td></tr>').join('')+'</table>'}
def('op-bat',{t:'BAT交換',st:()=>A.op.name,back:false,
  goal:'実際に使う次のBATを選び、同じ運航を続ける。',
  doc:'35b §7（BAT交換の10項目）／32d §5.3（交換時の選択UIの案）／32g（人の入力は管理ラベル・サイクル数（任意）・状態確認（必須）・備考（任意）の4項目）／32h §8（対象機体に使用許可されたBATだけ）。',state:'proposal',
  tmp:['個体選択UIは案（32d §5.3）','状態確認の選択肢・UIは未確定（PENDING-D-BAT-CHECK-UI）','交換中止・戻るUIは未確定'],
  ask:['候補の並び（最終使用が古い順）と、異常のあるBATの扱い（薄く表示するか、選べなくするか）'],
  body:()=>opTarget()+batPicker()+'<p class="note">対象機体を先に示し、その機体に使用が許可されたBATだけを出しています。BATを交換しただけでは、飛行の明細（A4の行）は増えません。</p>',
  foot:()=>'<button class="btn" data-act="op-bat-cancel">戻る</button><button class="btn primary" data-act="op-bat-done"'+(batReady()?'':' disabled')+'>離陸待機へ</button>'
});
def('op-switch',{t:'機体交代',st:()=>A.op.name,back:false,
  goal:'場所・目的・操縦者・許可等の文脈を引き継いで、別の機体に切り替える。',
  doc:'35b §8（機体交代の10項目）：未点検の機体は正式な飛行前点検へ、点検済みなら必要条件を確認して待機へ。過去の点検を別の機体へ転用しない。飛行済み機体の記録と終了点検を失わせない。',state:'spec',
  tmp:['Mission／Flightの境界・独立した交代イベントは未確定（35aのPENDING-S6-OPERATION-SCHEMA）','「点検済みにする」ボタンは、点検済みの分岐を見せるためのモックの操作','交代中止・戻るの具体UIは未確定'],
  ask:['交代先の候補に、何を出すか（点検状況・BAT管理の有無など）'],
  body:()=>{
    const op=A.op,E=ENV();const cands=E.aircraft.filter(a=>!a.dead&&a.id!==op.ac);
    return opTarget()+'<div class="msg info">これまでの場所・目的・操縦者・許可などを引き継ぎます。現在の機体の実績と、終了時の点検は、失われません。</div>'
     +(cands.length?cands.map(a=>'<div class="card" style="margin-bottom:8px"><b>'+esc(a.name)+'</b><span>'+esc(a.model)+' ／ <span class="mono">'+esc(a.mark)+'</span></span><span class="chips">'+(op.checked[a.id]?'<i class="chip ok">この運航で点検済み</i>':'<i class="chip warn">未点検</i>')+(a.batOn?'<i class="chip">BAT管理 ON</i>':'<i class="chip">BAT管理 OFF</i>')+'</span><div class="row"><button class="btn sm primary" data-act="op-switch-pick" data-id="'+a.id+'">この機体に交代</button>'+(op.checked[a.id]?'':'<button class="btn sm" data-act="op-switch-checked" data-id="'+a.id+'">点検済みにする（モック）</button>')+'</div></div>').join(''):'<div class="empty"><b>交代できる機体がありません</b><br>ほかの登録機体がない場合は、設定で機体を追加してください。<br><button class="btn sm" style="margin-top:8px" data-act="op-switch-reg">＋ 機体をここで登録する</button></div>');
  },
  foot:()=>'<button class="btn" data-act="op-bat-cancel">戻る</button>'
});
def('op-post',{t:'飛行後点検',st:()=>A.op.name,back:false,
  goal:'使用した機体の飛行後点検と、不具合・処置などを確認して、運航を締める。',
  doc:'35b §9（飛行後点検の10項目）。異常なしを未確認で確定しない。整備台帳の詳細入力フォームをここへ混ぜない（36）。入力を含む下書きは端末に保護し、最終確定の対象へ含める（35d）。',state:'spec',
  tmp:['使用機体ごとの画面構成は未確定（35b §9項目10）。ここでは機体ごとに並べている','点検項目の中身は仮'],
  ask:['複数機体を使ったときの飛行後点検の見せ方（機体ごとの画面か、1画面か）'],
  body:()=>{
    const op=A.op;
    return op.acs.map(id=>{const a=acOf(id);const p=op.post[id]||(op.post[id]={});return '<div class="sec"><h3>'+esc(a.name)+' <small class="mono">'+esc(a.mark)+'</small></h3>'+POST_ITEMS.map((x,i)=>tgl('op-post-tog','data-a="'+id+'" data-i="'+i+'"',x,!!p[i])).join('')+'</div>'}).join('')
     +'<div class="sec"><h3>記事・不具合・処置</h3><div class="row"><textarea class="in" data-bind="~notes" placeholder="不具合があれば、発生の事情と処置を書く（なければ空のまま）">'+esc(op.notes)+'</textarea></div><p class="note">詳しい点検整備の記録は、別の責任（05）で扱います。</p></div>'
     +'<div class="row"><button class="btn sm" data-act="op-post-all">全部確認済みにする（モック）</button></div>';
  },
  foot:()=>{const op=A.op;const ok=op.acs.every(id=>{const p=op.post[id]||{};return POST_ITEMS.every((_,i)=>p[i])});return '<button class="btn primary" data-act="op-to-final"'+(ok?'':' disabled')+'>最終送信・保存へ</button>'}
});
def('op-final',{t:'最終送信・保存',st:()=>A.op.name,back:false,
  goal:'運航全体の確定対象を保存し、未同期と反映済みを区別する。',
  doc:'35b §10（最終送信・保存の10項目）／35d（保存の対象・時点・再送を別運航にしない）／27e §4（未同期のKMLは、最後の送信のときにも再送する）。通信失敗や戻る操作で、完了データを消さない。',state:'spec',
  tmp:['完了・部分失敗の表示、戻り先、再送・確認のUIは未確定（35b §10項目10）','KMLの再送を最終保存の一部とするか、同じ操作で起動する独立した再送とするかは未確定（PENDING-S7C-KML-FINAL-SEND）'],
  ask:['保存に失敗したときの見せ方','保存後にどこへ戻すか（次の画面）'],
  body:()=>{
    const op=A.op;const kmlPend=op.kml==='pending';
    return '<div class="sec"><h3>確定する内容</h3><table class="kv"><tr><td>運航</td><td>'+esc(op.name)+'</td></tr><tr><td>機体</td><td>'+op.acs.map(id=>esc(acLabel(id))).join('<br>')+'</td></tr><tr><td>操縦者</td><td>'+esc(plName(op.pilot))+'</td></tr><tr><td>飛行前・飛行後点検</td><td>済み</td></tr><tr><td>飛行</td><td>'+op.legs.length+'回・合計'+op.legs.reduce((s,l)=>s+l.min,0)+'分</td></tr></table>'+legTable(op.legs)+(op.notes.trim()?'<p class="note">記事・不具合・処置: '+esc(op.notes)+'</p>':'')+'</div>'
     +(kmlPend?'<div class="msg warn">未同期のKMLがあります。'+(A.online?'この操作で、保存もやり直します。':'オフラインのため、いまは送れません。')+'</div>':'')
     +(A.online?'<div class="msg info">「送信・保存」で、運航記録（04）・BAT履歴・機体の累計へ反映します。</div>':'<div class="msg warn"><b>オフラインです。</b>保存の操作はできます。内容は端末に保護され、通信できるときに反映します（未同期として表示します）。反映済みとは表示しません。</div>');
  },
  foot:()=>'<button class="btn" data-act="op-to-post">戻る</button><button class="btn primary" data-act="op-finalize">送信・保存</button>'
});
def('op-done',{t:'保存しました',st:()=>A.opDone?A.opDone.name:'',back:false,
  goal:'保存の結果（反映済みか未同期か）を示し、次の行き先を選ぶ。',
  doc:'35b §10項目6（成功後の帰着画面・再送UIの詳細は未確定）／35d／34f §2（保存後の戻り先は未確定）。',state:'none',
  tmp:['保存後の戻り先は未確定。ここでは3つの行き先を並べて、選び方を試せるようにしている（仮）'],
  ask:['保存後は、ホームへ戻すか、履歴で結果を見せるか'],
  body:()=>{const d=A.opDone;
    return (d.synced?'<div class="msg ok big">✓ 保存しました</div><div class="msg ok">運航記録（04）・BAT履歴・機体の累計へ反映しました。</div>':'<div class="msg warn big">端末に保存しました（未同期）</div><div class="msg warn">通信できるときに、同じ内容として送ります。まだ反映済みではありません。</div>')
     +'<div class="sec"><h3>この飛行</h3><table class="kv"><tr><td>飛行</td><td>'+esc(d.name)+'</td></tr><tr><td>飛行回数</td><td>'+d.n+'回</td></tr><tr><td>KML</td><td>'+({saved:'保存済み（07）',pending:'未同期（端末に保持）',none:'なし（通報しない飛行）'})[d.kml]+'</td></tr><tr><td>PDF</td><td>自動では作りません。必要なときに［飛行履歴・出力］から作ります。</td></tr></table></div>'
     +'<div class="msg info">A4の運航記録は、この保存で04に自動で完成します。印刷やPDFが必要なときは、［飛行履歴・出力］から作れます。</div>';
  },
  foot:()=>'<button class="btn" data-act="root" data-s="home">ホームへ</button><button class="btn primary" data-act="op-open-hist">この飛行を履歴で見る</button>'
});

function finalizeOp(){
  const E=ENV(),op=A.op;
  const kml=op.noDips?'none':(op.kml==='pending'&&A.online?'saved':(op.kml||'saved'));
  const fl={id:uid('h'),label:op.name,date:new Date(),ac:op.acs.slice(),pl:[op.pilot],legs:op.legs.map(l=>({bat:l.bat||'—',off:l.off,on:l.on,min:l.min,place:l.place,note:l.note,ac:l.ac})),kml,synced:A.online,outs:{a4:false,map:false},snap:op.snap,notes:op.notes};
  E.flights.unshift(fl);
  if(op.planId)E.plans=E.plans.filter(p=>p.id!==op.planId);
  op.legs.forEach(l=>{
    const b=l.batId&&batOf(l.batId);if(!b)return;
    b.uses+=1;b.min+=l.min;b.lastDays=0;b.lastAc=l.ac;
    if(l.batInfo){if(l.batInfo.check)b.check=l.batInfo.check;if(l.batInfo.cycle!==''&&l.batInfo.cycle!=null){b.cycle=Number(l.batInfo.cycle);b.cycleAt='今日'}if(l.batInfo.note)b.note=l.batInfo.note}
    b.hist.unshift({d:slash(new Date()),ac:l.ac,min:l.min,chk:b.check});
  });
  A.ui.lastFlight=fl.id;A.opDone={fid:fl.id,name:op.name,n:op.legs.length,synced:A.online,kml};
  A.op=null;opGo('op-done');
}

Object.assign(ACTS,{
  'op-pre-tog':t=>{const p=A.op.pre[A.op.ac];const i=t.dataset.i;p[i]=!p[i];render()},
  'op-pre-all':()=>{const p=A.op.pre[A.op.ac]||(A.op.pre[A.op.ac]={});PRE_ITEMS.forEach((_,i)=>p[i]=true);render()},
  'op-pre-done':()=>{A.op.checked[A.op.ac]=true;opGo('op-standby')},
  'op-abort':()=>{
    if(A.op.legs.length){toast('飛行の実績があるため、やめることはできません。「終了」から飛行後点検へ進みます');return}
    openSheet(()=>'<h3>運航をやめますか（飛行0回）</h3><p>飛行の実績がないため、記録は作らずに戻ります。通報済みの計画は、飛行リストに残ります。</p><p class="note">飛行0回の中止と、実績がある運航の終了は区別します（35b §3項目7）。詳しい戻る操作は未確定です。</p><div class="row"><button class="btn" data-act="close">やめない</button><button class="btn danger" data-act="op-abort-ok">運航をやめる</button></div>');
  },
  'op-abort-ok':()=>{A.op=null;A.modal=null;root('home');toast('運航をやめました（記録は作っていません）')},
  'op-bat-pick':t=>{A.op.cur.bat={id:t.dataset.id,cycle:'',check:null,note:''};render()},
  'op-bat-clear':()=>{A.op.cur.bat=null;render()},
  'op-bat-check':t=>{A.op.cur.bat.check=t.dataset.v;render()},
  'op-bat-reg':()=>{const a=opAc();openReg('bat',{group:a.group,ret:{label:'BATの選択',apply:id=>{A.op.cur.bat={id,cycle:'',check:null,note:''}}}})},
  'op-takeoff':()=>{
    const w=readiness().some(r=>r[1]==='warn');
    const go=()=>{A.op.cur.offAt=Date.now();A.op.cur.extra=0;A.modal=null;opGo('op-fly')};
    if(w&&!A.op.ack){A.op._go=go;openSheet(()=>'<h3>警告があります</h3><ul style="padding-left:1.2em;font-size:14px">'+readiness().filter(r=>r[1]==='warn').map(r=>'<li>'+esc(r[0])+': '+esc(r[2])+'</li>').join('')+'</ul><p class="note">アプリは、離陸の事実の記録を拒否しません。法令上の離陸可否の判断は、操縦者の責任です（13c）。</p><div class="row"><button class="btn" data-act="close">戻る</button><button class="btn primary" data-act="op-takeoff-ok">確認して離陸を記録する</button></div>');return}
    go();
  },
  'op-takeoff-ok':()=>{A.op.ack=true;const g=A.op._go;A.op._go=null;if(g)g()},
  'op-ff':()=>{A.op.cur.extra+=5;const e=$('#sw');if(e)e.textContent=swText()},
  'op-land':()=>{
    const op=A.op,c=op.cur;const now=Date.now();const sec=(now-c.offAt)/1000+c.extra*60;const min=Math.max(1,Math.round(sec/60));
    const b=c.bat?batOf(c.bat.id):null;
    const leg={n:op.legs.length+1,ac:op.ac,bat:b?b.label:null,batId:b?b.id:null,batInfo:c.bat?clone(c.bat):null,off:hm(new Date(c.offAt)),on:hm(new Date(now)),min,place:op.snap.to||op.snap.from||'',note:''};
    op.legs.push(leg);op.last=leg;c.offAt=null;clearInterval(SWT);opGo('op-landed');
  },
  'op-continue':()=>{A.op.cur.offAt=null;A.op.cur.extra=0;opGo('op-standby');toast('同じBATで続行します（必要な準備をしてから、もう一度離陸を記録します）')},
  'op-to-bat':()=>{A.op.cur.bat=null;opGo('op-bat')},
  'op-bat-cancel':()=>opGo('op-landed'),
  'op-bat-done':()=>opGo('op-standby'),
  'op-to-switch':()=>opGo('op-switch'),
  'op-switch-checked':t=>{A.op.checked[t.dataset.id]=true;render()},
  'op-switch-pick':t=>{const id=t.dataset.id;const op=A.op;op.ac=id;if(!op.acs.includes(id))op.acs.push(id);op.cur.bat=null;opGo(op.checked[id]?'op-standby':'op-pre');toast(op.checked[id]?'点検済みの機体へ交代しました。離陸待機へ進みます':'未点検の機体です。飛行前点検へ進みます')},
  'op-switch-reg':()=>openReg('aircraft',{ret:{label:'機体交代',apply:()=>{}}}),
  'op-to-post':()=>opGo('op-post'),
  'op-post-tog':t=>{const p=A.op.post[t.dataset.a];const i=t.dataset.i;p[i]=!p[i];render()},
  'op-post-all':()=>{A.op.acs.forEach(id=>{const p=A.op.post[id]||(A.op.post[id]={});POST_ITEMS.forEach((_,i)=>p[i]=true)});render()},
  'op-to-final':()=>opGo('op-final'),
  'op-finalize':()=>{if(!canWrite())return;finalizeOp()},
  'op-open-hist':()=>{A.ui.hSel=A.ui.lastFlight;root('home');nav('hist');if(SCR['hist-detail'])nav('hist-detail')}
});
