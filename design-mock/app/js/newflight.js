'use strict';
/* ===================================================================
   新規飛行（入力〜DIPSへ通報する直前）
   既存の新規飛行モック（design-mock/new-flight）を、アプリ全体版へ移植して拡張したもの。
   拡張点: ① 機体・操縦者・許可・保険・連絡先が未登録でも、その場で登録して元の入力へ戻れる
           ② 現場プリセットを飛行範囲の画面から保存できる ③ 通報の直前から先（送信・Manual・結果）の画面
   DIPS22項目の対応は NFS[*].dips に持つ（画面上の番号表示はメモ欄のみ）。
   =================================================================== */
const NFS={
 start:{t:'始め方',dips:[],
  goal:'新しく作る／過去の飛行を複製／現場プリセットから、のどこから始めるかを選ぶ。',
  reuse:['過去の飛行（複製）','現場プリセット'],
  tmp:['3つの入口のうち何を置くかは仮','「通報しない飛行（DIPS対象外）」は、既存設計の分岐（35b §1）を見せるための仮置き'],
  ask:['過去の飛行を複製したとき、どこまで自動で引き継ぐか（前の飛行の内容が、そのまま新しい通報の記録になるため）'],
  ui:['3つの入口を1画面に並べるか、「新しく作る」だけにするかは標準案']},
 use:{t:'使うもの',sub:'機体・操縦者・許可',dips:[2,4,5],
  goal:'この飛行で使う機体・操縦者・許可承認を、登録済みから選ぶ。なければその場で登録する。',
  reuse:['運用環境の登録実機','人員（操縦者）','許可承認の登録'],
  tmp:['カードに出す情報（期限・DIPS登録済みなど）は仮','許可と機体・空域・方法の照合ヒントは、仮の判定（実際の判定ルールではない）','その場で登録するときの入力項目は最小にしている（仮）'],
  ask:[],
  ui:['機体・操縦者・許可を1画面にまとめるか分けるか、操縦者と連絡先の距離は標準案']},
 content:{t:'飛行の内容',sub:'目的・空域・方法・安全措置',dips:[6,7,8,10,11,12],
  goal:'飛行目的・空域・方法と、立入管理措置・係留・補助者人数を選ぶ。',
  reuse:['前回／プリセットの選択内容'],
  tmp:['選択肢の表記はDIPS Web（PC/iPhone観測）に合わせた','立入管理措置・係留・補助者人数をここに置くのは仮'],
  ask:[],
  ui:['安全措置（立入管理・係留・補助者）をこの画面に置くか分けるか、「行わない」を選んだときの見せ方は標準案']},
 area:{t:'飛行範囲',sub:'地図・出発地・目的地',dips:[3,13,14],map:true,
  goal:'地図で飛行範囲（多角形・円・線＋幅）を作り、出発地と目的地を入れる。作った範囲は現場プリセットとして保存できる。',
  reuse:['現場プリセット（範囲を呼び出す）'],
  tmp:['作図の操作（点をタップ→「完了」・1点戻す・編集）は、このモックの仮の操作。DIPS iPhone実機の作図操作は未確認なので、DIPSの再現ではない','地図は架空。実際の地図ライブラリは未選定','検索・規制空域の表示は位置を見せるだけの仮'],
  ask:['DIPSに保存してある経路を、このアプリから参照・利用するか（DIPS側のデータをどこまで扱うか）'],
  ui:['地図を独立した画面にするか、出発地・目的地をどこに置くかは標準案']},
 time:{t:'日時・高度',sub:'日時・所要時間・速度・高度',dips:[15,16,17,18,19,20,21],
  goal:'開始日時・所要時間を入れ、終了日時は自動計算で確認。速度・高度を入れる。',
  reuse:['プリセット／前回の高度・所要時間'],
  tmp:['終了日時は自動計算（DIPSと同じ考え方）','最大飛行時間は意味がDIPS側で未確認のため位置も仮','複数日はカレンダーで日を選ぶ仮の作り'],
  ask:[],
  ui:['最大飛行時間の位置と、複数日指定の入口は標準案']},
 master:{t:'登録済み情報の確認',sub:'保険・連絡先',dips:[9,22],
  goal:'保険と連絡先を、登録済みの内容で自動入力して確認する（変えたいときだけ開く）。未登録ならその場で登録できる。',
  reuse:['保険の登録','連絡先（自アカウントの情報。初回登録した本人情報から自動で入る）','操縦者を選んだときの人物情報'],
  tmp:['毎回変わらない情報を1画面にまとめる案。DIPSの順序（保険は途中、連絡先は最後）からは動かしている','連絡先は、初回登録した本人情報（氏名・住所・電話・メール）から自動で入る。操縦者を選んだときは、その人物の登録情報を使う（34a §9.5）','人物情報のどの列をDIPSのどの欄に対応させるかの最終形は未確定（PENDING-S2-IDENTITY）'],
  ask:['保険を、登録済みの内容からどこまで自動で埋めるか（そのまま通報の記録になる値）'],
  ui:['この画面を独立させるか、確認画面にまとめるかは標準案']},
 review:{t:'内容確認',dips:[1],
  goal:'入力した内容を確認し、計画名称を確認・修正する。足りない項目を見つける。',
  reuse:['計画名称の自動生成（仮ルール）'],
  tmp:['「画面ごと」と「DIPS項目順」の2通りの見せ方を切り替えられる','未入力・要確認の判定は仮'],
  ask:[],
  ui:['確認画面の並べ方と、足りない項目の見せ方・直し方は標準案']},
 final:{t:'通報の直前',dips:[],
  goal:'DIPSへ通報する直前。通報の方法（APIで送信／DIPS Webへ転記）を選ぶ。',
  reuse:[],
  tmp:['APIが使えるかどうかで見え方が変わる（メモ欄で切替）','「下書きとして保存」の置き場所は未確定','はじめの登録で任意にした項目（フリガナ・住所・電話番号・メールアドレス・DIPSのログイン情報）が足りないときは、ここで不足分だけ補う。人物の連絡先は対象Personの人物情報へ、DIPSの認証情報はDIPSのログイン情報へ保存し、元の飛行計画へ戻る（25b §1.1・34a §8.3）','申請書記載を情報源に選んだときは人物に紐づかないため、Personへは保存しない（25b §1.1）','［DIPS Webで通報する］側で不足をどう扱うかは未決'],
  ask:[],
  ui:['通報方法を選ぶ位置と、「下書きとして保存」の置き場所は標準案']}
};
const NF_ORDER=['start','use','content','area','time','master','review','final'];
NFS.dips={t:'飛行計画',dips:[],goal:'DIPS実画面順で入力する',reuse:[],tmp:[],ask:[],ui:[]};
const nfName=k=>NFS[k].t;
function coverage(){
  const cnt={};DIPS_ITEMS.forEach(x=>cnt[x.n]=0);
  Object.values(NFS).forEach(s=>s.dips.forEach(n=>{cnt[n]=(cnt[n]||0)+1}));
  return {missing:DIPS_ITEMS.filter(x=>cnt[x.n]===0).map(x=>x.n),dup:DIPS_ITEMS.filter(x=>cnt[x.n]>1).map(x=>x.n),ok:DIPS_ITEMS.filter(x=>cnt[x.n]===1).length};
}
const AUTOKEY={2:'permit',4:'aircraft',5:'pilots',6:'purpose',7:'air',8:'met',13:'from',14:'to',16:'dur',21:'alt',20:'speed',9:'ins',22:'contact'};

/* ---------- 画面の並び（順序入れ替え・統合・省略を試せる） ---------- */
function pages(){
  if(S.layout!=='app'&&!S.noDips)return ['start','dips','area','review','final'].map(key=>({key,ids:[key]}));
  const vis=S.flow.filter(f=>!f.skip&&!(S.noDips&&(f.id==='time'||f.id==='master')));const mids=[];let i=0;
  while(i<vis.length){
    const ids=[vis[i].id];
    while(vis[i].merge&&i+1<vis.length){i++;ids.push(vis[i].id)}
    i++;mids.push({key:ids[0],ids});
  }
  return [{key:'start',ids:['start']},...mids,{key:'review',ids:['review']},{key:'final',ids:['final']}];
}
const curPage=()=>{const ps=pages();return ps.find(p=>p.key===S.cur)||ps.find(p=>p.ids.includes(S.cur))||ps[0]};
const pageTitle=p=>p.ids.map(nfName).join('＋');
function nfGo(key,noScroll){
  if(S.layout!=='app'&&!S.noDips&&['use','content','time','master'].includes(key))key='dips';
  const ps=pages();const p=ps.find(x=>x.key===key)||ps.find(x=>x.ids.includes(key));
  S.cur=p?p.key:'start';A.modal=null;render(!!noScroll);
  const b=$('#body');if(b&&!noScroll)b.scrollTop=0;
}
function nfStep(d){const ps=pages();const i=ps.findIndex(p=>p.key===curPage().key);const j=Math.min(ps.length-1,Math.max(0,i+d));nfGo(ps[j].key)}

/* ---------- 補助ロジック ---------- */
function needTags(s){s=s||S;const t=[];if(s.air.includes(AIR[2]))t.push('DID');if(s.met.includes(MET[0]))t.push('夜間');if(s.met.includes(MET[1]))t.push('目視外');if(s.met.includes(MET[2]))t.push('30m未満');return t}
function permitHints(){
  const E=ENV();const out=[];const m=E.permits.find(x=>x.id===S.permit);const need=needTags();
  if(S.permit&&S.permit!=='none'&&m){
    const unc=S.aircraft.filter(a=>!m.aircraft.includes(a));
    if(unc.length)out.push('この許可は、選んだ機体（'+unc.map(acName).join('、')+'）を対象にしていない可能性があります。許可書を確認してください');
    const miss=need.filter(t=>!m.cover.includes(t));
    if(miss.length)out.push('この許可には、「'+miss.join('・')+'」が含まれていない可能性があります。許可書を確認してください');
  }
  if(S.permit==='none'&&need.length)out.push('「'+need.join('・')+'」を選んでいますが、許可・承認が「なし」になっています。確認してください');
  return out;
}
function startDT(s){s=s||S;return new Date(s.startDate+'T'+pad(s.startH)+':'+pad(s.startM)+':00')}
function endDT(s){s=s||S;return new Date(startDT(s).getTime()+(s.durH*60+s.durM)*60000)}
function fmtDT(d,ref){const s=slash(d)+' '+pad(d.getHours())+':'+pad(d.getMinutes());return ref&&ymd(d)!==ymd(ref)?s+'（翌日以降）':s}
function issues(){
  const E=ENV();const L=[];const add=(lv,text,scr)=>L.push({lv,text,scr});
  if(!S.aircraft.length)add('ng','機体が選ばれていません','use');
  S.aircraft.forEach(id=>{const a=E.aircraft.find(x=>x.id===id);if(a&&a.dead)add('ng',a.name+'は抹消・期限切れです','use');else if(a&&a.expiry&&daysTo(a.expiry)<=30)add('warn',a.name+'の登録期限が近いです（'+daysTo(a.expiry)+'日）','use')});
  if(!S.pilots.length)add('ng','操縦者が選ばれていません','use');
  if(S.permit===null)add('warn','許可・承認が未選択です（不要なら「なし」を選ぶ）','use');
  permitHints().forEach(h=>add('warn',h,'use'));
  if(!S.biz.length&&!S.non.length)add('ng','飛行目的が選ばれていません','content');
  if((S.biz.includes('その他')&&!S.otherBiz.trim())||(S.non.includes('その他')&&!S.otherNon.trim()))add('warn','目的「その他」の内容が空です','content');
  if(!S.air.length)add('ng','飛行空域が未選択です（該当しない場合は「上記空域の飛行は行わない」）','content');
  if(!S.met.length)add('ng','飛行方法が未選択です（該当しない場合は「上記方法の飛行は行わない」）','content');
  if(!S.geom.done)add('ng','飛行範囲が完成していません','area');
  if(!S.from.trim())add('warn','出発地が空です','area');
  if(!S.to.trim())add('warn','目的地が空です','area');
  if(!S.noDips){
    if(S.durH*60+S.durM<=0)add('ng','所要時間が0です','time');
    if(startDT()<new Date())add('warn','開始日時が過去です','time');
    if(!(S.speed>0))add('ng','飛行速度が正しくありません','time');
    if(!(S.alt>0))add('ng','飛行高度が正しくありません','time');
    if(S.ins.mode==='unreg')add('warn','保険が未登録です（登録するか、この飛行だけ入力するか、加入していないを選ぶ）','master');
    if(S.ins.mode==='none'&&!S.ins.ability)add('warn','保険に加入していない場合は、賠償能力を選んでください','master');
    if(S.contact.src==='pilot'&&!S.contact.pilotId)add('warn','連絡先の操縦者が選ばれていません','master');
    if(!S.contact.name.trim()||!S.contact.phone.trim())add('warn','連絡先の氏名・電話が空です','master');
  }
  return L;
}
function insSummary(s){
  s=s||S;const i=s.ins;if(i.mode==='none')return '保険に加入していない（賠償能力: '+(i.ability==='yes'?'はい':i.ability==='no'?'いいえ':'未選択')+'）';
  if(i.mode==='unreg')return '未登録';
  const amt=(u,a)=>u==='yes'?'無制限':(a?Number(a).toLocaleString()+'円':'未入力');
  return (i.company||'—')+' / '+(i.product||'—')+' / 対人 '+amt(i.pUnl,i.pAmt)+' / 対物 '+amt(i.oUnl,i.oAmt);
}
function contactSummary(s){s=s||S;const c=s.contact;const srcs={self:'自アカウントの情報',application:'申請書記載の情報',pilot:'操縦者（'+(c.pilotId?plName(c.pilotId):'未選択')+'）'};return srcs[c.src]+' / '+(c.name||'（氏名なし）')+' / '+(c.phone||'（電話なし）')+' / '+(c.email||'（メールなし）')}
function valueOf(n,s){
  s=s||S;const E=ENV();
  switch(n){
   case 1:return esc(s.planName);
   case 2:{const m=E.permits.find(x=>x.id===s.permit);return s.permit==='none'?'許可・承認なし':m?esc(m.no):'<i class="chip warn">未選択</i>'}
   case 3:return s.savedRoute?esc(s.savedRoute):'なし';
   case 4:return s.aircraft.length?s.aircraft.map(id=>{const a=acOf(id);return a?esc(a.name)+'（'+esc(a.mark)+'）':esc(id)}).join('<br>'):'<i class="chip ng">未選択</i>';
   case 5:return s.pilots.length?s.pilots.map(id=>esc(plName(id))).join('、'):'<i class="chip ng">未選択</i>';
   case 6:{const b=s.biz.map(x=>x==='その他'?'その他（'+esc(s.otherBiz)+'）':esc(x));const o=s.non.map(x=>x==='その他'?'その他（'+esc(s.otherNon)+'）':esc(x));return (b.length?'業務: '+b.join('、'):'')+(b.length&&o.length?'<br>':'')+(o.length?'業務以外: '+o.join('、'):'')||'<i class="chip ng">未選択</i>'}
   case 7:return s.air.length?s.air.map(esc).join('<br>'):'<i class="chip ng">未選択</i>';
   case 8:return s.met.length?s.met.map(esc).join('<br>'):'<i class="chip ng">未選択</i>';
   case 9:return esc(insSummary(s));
   case 10:return s.tsu.map((v,i)=>v?esc(TSU[i]):null).filter(Boolean).join('<br>')||'なし';
   case 11:return s.tether==='yes'?'はい':'いいえ';
   case 12:return s.assist+'人';
   case 13:return s.from?esc(s.from):'<i class="chip warn">空</i>';
   case 14:return s.to?esc(s.to):'<i class="chip warn">空</i>';
   case 15:return s.maxH+'時間'+pad(s.maxM)+'分';
   case 16:return s.durH+'時間'+pad(s.durM)+'分';
   case 17:return fmtDT(startDT(s));
   case 18:return fmtDT(endDT(s),startDT(s))+' <i class="chip auto">自動計算</i>';
   case 19:return s.multi.length?s.multi.length+'日（'+s.multi.slice().sort().map(d=>d.slice(5).replace('-','/')).join('、')+'）':'単日';
   case 20:return s.speed+' km/h（'+(s.speed/1.852).toFixed(1)+' kt）';
   case 21:return s.alt+' m';
   case 22:return esc(contactSummary(s));
  }
  return '';
}

/* ---------- 複製・プリセット・仮データでの一括入力（設計確認用） ---------- */
const liveAc=id=>{const a=acOf(id);return !!a&&!a.dead};
const livePl=id=>{const p=plOf(id);return !!p&&p.active!==false};
function applyGeo(g){S.geom={kind:g.kind,pts:g.pts.map(p=>p.slice()),r:g.r,width:g.width||10,done:true,editing:false}}
function applyPreset(p){
  applyGeo(p.geo);S.alt=p.alt;S.from=p.from;S.to=p.to;S.biz=p.biz.slice();S.non=[];S.durH=p.dur[0];S.durM=p.dur[1];
  ['area','alt','from','to','purpose','dur'].forEach(k=>S.auto[k]='現場プリセット');
  S.start={mode:'preset',label:p.name};
}
function applyPast(fl){
  const s=fl.snap;
  S.aircraft=s.aircraft.filter(liveAc);S.pilots=s.pilots.filter(livePl);S.permit=s.permit;S.biz=s.biz.slice();S.non=s.non.slice();S.air=s.air.slice();S.met=s.met.slice();
  S.tsu=s.tsu.slice();S.tether=s.tether;S.assist=s.assist;applyGeo(s.geom);S.from=s.from;S.to=s.to;S.durH=s.durH;S.durM=s.durM;S.alt=s.alt;S.speed=s.speed;
  ['aircraft','pilots','permit','purpose','air','met','area','from','to','dur','alt'].forEach(k=>S.auto[k]='前回（'+fl.label+'）から');
  S.start={mode:'past',label:fl.label};
}
function fillSample(){
  const E=ENV();
  if(!E.aircraft.length||!E.people.some(p=>p.pilot)||!E.presets.length){if(!seedSample(E)){mtoast('すでに登録があるため、仮データは入れられません。手で入力してください');return false}mtoast('仮データの登録を入れました')}
  const a=E.aircraft.find(x=>!x.dead),p=E.people.find(x=>x.pilot&&x.active!==false);
  S.aircraft=[a.id];S.pilots=[p.id];S.permit=E.permits.length?E.permits[0].id:'none';
  applyPreset(E.presets[0]);S.air=[AIR[3]];S.met=[MET[6]];
  ['aircraft','pilots','permit','air','met'].forEach(k=>S.auto[k]='登録済みの情報');
  S.start={mode:'fill',label:'新しく作る'};return true;
}

/* ---------- 部品 ---------- */
const autoChip=k=>S.auto[k]?'<i class="chip auto">自動入力: '+esc(S.auto[k])+'</i>':'';
function sel(name,opts,cur,extra){return '<select class="in" data-bind="'+name+'" data-num="1" '+(extra||'')+'>'+opts.map(o=>'<option value="'+o[0]+'"'+(String(o[0])===String(cur)?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>'}
const hourOpts=Array.from({length:24},(_,i)=>[i,i+'時']);
const minOpts=Array.from({length:12},(_,i)=>[i*5,pad(i*5)+'分']);
const durHOpts=Array.from({length:13},(_,i)=>[i,i+'時間']);
function tgl(act,attrs,label,on,dim,extra){return '<button class="tgl'+(on?' sel':'')+(dim?' dim':'')+'" data-act="'+act+'" '+attrs+'><span class="box">'+(on?'✓':'')+'</span><span>'+esc(label)+'</span>'+(extra||'')+'</button>'}
function pill(act,attrs,label,on){return '<button class="pill'+(on?' sel':'')+'" data-act="'+act+'" '+attrs+'>'+esc(label)+'</button>'}
const addCard=(t,label)=>'<button class="card add" data-act="nf-reg" data-t="'+t+'">＋ '+label+'</button>';

/* ===== 画面: 始め方 ===== */
function vStart(){
  const E=ENV();const past=E.flights.filter(f=>f.snap&&!f.snap.noDips);
  return '<h2>新規飛行</h2><p class="lead">どこから始めますか？ 選んだ内容は次の画面から「自動入力」として入ります。</p>'
   +'<div class="sec"><h3>新しく作る</h3><button class="tgl" data-act="start-new"><span class="box"></span><span><b>まっさらから作る</b><br><small class="note">既定値だけが入ります</small></span></button></div>'
   +'<div class="sec"><h3>過去の飛行を複製 '+tmpChip+'</h3><p class="lead">日時以外を引き継ぎます。日時は次の画面で入れ直します。</p>'+(past.length?past.map(h=>'<button class="tgl" data-act="start-past" data-id="'+h.id+'"><span class="box"></span><span><b>'+esc(h.label)+'</b><br><small class="note">'+slash(h.date)+' ／ '+h.ac.map(acName).join('・')+'</small></span></button>').join(''):'<div class="empty">複製できる過去の飛行がまだありません。飛行が終わると、ここに出ます。</div>')+'</div>'
   +'<div class="sec"><h3>現場プリセットから '+tmpChip+'</h3><p class="lead">よく行く現場の範囲・高度・出発地/目的地などを呼び出します。</p>'+(E.presets.length?E.presets.map(p=>'<button class="tgl" data-act="start-preset" data-id="'+p.id+'"><span class="box"></span><span><b>'+esc(p.name)+'</b><br><small class="note">高度 '+p.alt+'m ／ '+esc(p.to)+'</small></span></button>').join(''):'<div class="empty">現場プリセットはまだありません。飛行範囲の画面から保存できます。</div>')+'</div>'
   +'<p class="note"><button class="chip" data-act="start-nodips">通報しない飛行を記録する</button> '+tmpChip+'</p>';
}

/* ===== 画面: 使うもの（機体・操縦者・許可）— 未登録ならその場で登録 ===== */
function vUse(){
  const E=ENV();const soon=a=>!a.dead&&a.expiry&&daysTo(a.expiry)<=30;
  const me=E.people.find(p=>p.id===E.meId);
  const ac=E.aircraft.length?E.aircraft.map(a=>{const on=S.aircraft.includes(a.id);
    return '<button class="card'+(on?' sel':'')+(a.dead?' dead':'')+'" data-act="pick-ac" data-id="'+a.id+'"><b>'+(on?'✓ ':'')+esc(a.name)+'</b><span>'+esc(a.model)+'</span><span class="mono">'+esc(a.mark)+'</span><span class="chips">'+(a.dips?'<i class="chip ok">DIPS登録済み</i>':'')+(soon(a)?'<i class="chip warn">登録期限まで'+daysTo(a.expiry)+'日</i>':'')+(a.dead?'<i class="chip ng">抹消・期限切れ</i>':'')+'</span></button>'}).join('')
   :'<div class="empty"><b>登録された機体がありません</b><br>事前に設定へ行かなくても、ここで登録できます。</div>';
  const people=E.people.filter(p=>p.active!==false);
  const pl=people.map(p=>{const on=S.pilots.includes(p.id);const linked=!S.aircraft.length||!p.link||S.aircraft.every(a=>p.link.includes(a));
    return '<button class="card'+(on?' sel':'')+(!p.pilot?' dead':'')+'" data-act="pick-pl" data-id="'+p.id+'"><b>'+(on?'✓ ':'')+esc(p.name)+'</b><span>'+esc(p.roles.join('・')||'役割未設定')+'</span><span class="chips">'+(p.pilot?(p.dips===true?'<i class="chip ok">DIPS登録操縦者</i>':p.dips===false?'<i class="chip warn">DIPS未登録</i>':''):'<i class="chip">操縦者ではない</i>')+(p.pilot&&!linked?'<i class="chip warn">選んだ機体では未登録の可能性</i>':'')+'</span></button>'}).join('');
  const noPilot=!people.some(p=>p.pilot);
  const pm=E.permits.map(m=>{const exp=daysTo(m.to)<0;const on=S.permit===m.id;
    return '<button class="card'+(on?' sel':'')+(exp?' dead':'')+'" data-act="pick-pm" data-id="'+m.id+'"><b>'+(on?'✓ ':'')+esc(m.label)+'</b><span class="mono">'+esc(m.no)+'</span><span>有効: '+slash(m.from)+'〜'+slash(m.to)+'</span><span class="chips">'+m.cover.map(c=>'<i class="chip">'+esc(c)+'</i>').join('')+(exp?'<i class="chip ng">期限切れ</i>':'')+'</span></button>'}).join('')
    +'<button class="card'+(S.permit==='none'?' sel':'')+'" data-act="pick-pm" data-id="none"><b>'+(S.permit==='none'?'✓ ':'')+'許可・承認なし</b><span>許可番号を入れない</span></button>';
  const cur=E.permits.find(x=>x.id===S.permit);
  const detail=cur?'<table class="kv"><tr><td>飛行許可番号</td><td class="mono">'+esc(cur.no)+'</td></tr><tr><td>許可書発行日</td><td>'+slash(cur.issued)+'</td></tr><tr><td>許可等の期間</td><td>'+slash(cur.from)+' 〜 '+slash(cur.to)+'</td></tr><tr><td>カテゴリー</td><td>'+esc(cur.cat)+'</td></tr></table><p class="note">DIPSの入力欄（番号・発行日・期間・カテゴリー）に当たる内容を、登録済みの許可から自動で表示します。</p>':'';
  const hints=permitHints().map(h=>'<div class="msg warn">'+esc(h)+'</div>').join('');
  return '<div class="sec"><h3>機体 <small>複数選べます</small> '+autoChip('aircraft')+'</h3><div class="cards">'+ac+addCard('aircraft','機体をここで登録する')+'</div></div>'
   +'<div class="sec"><h3>操縦者 <small>複数選べます</small> '+autoChip('pilots')+'</h3>'+(noPilot?'<div class="empty"><b>操縦者として登録された人がいません</b><br>飛行を始めるときに、その場で登録できます。</div>':'')+'<div class="cards">'+pl
   +(me&&!me.pilot?'<button class="card add" data-act="nf-me-pilot">自分（'+esc(me.name)+'）を操縦者にして選ぶ</button>':'')+addCard('person','操縦者をここで登録する')+'</div><p class="note">DIPSに登録されている操縦者かどうかを、目安として表示します。</p></div>'
   +'<div class="sec"><h3>許可・承認 '+autoChip('permit')+'</h3><div class="cards">'+pm+addCard('permit','許可・承認をここで登録する')+'</div>'+detail+hints+'</div>';
}

/* ===== 画面: 飛行の内容（目的・空域・方法・安全措置） ===== */
function vContent(){
  const bizP=BIZ.map(v=>pill('tog-purpose','data-g="biz" data-v="'+esc(v)+'"',v,S.biz.includes(v))).join('');
  const nonP=NON.map(v=>pill('tog-purpose','data-g="non" data-v="'+esc(v)+'"',v,S.non.includes(v))).join('');
  const other=(g,key,label)=>(g.includes('その他')?'<div class="row"><label>その他の内容</label><input class="in" data-bind="'+key+'" placeholder="'+label+'" value="'+esc(S[key])+'"></div>':'');
  const airNone=S.air.includes(AIR[3]);const metNone=S.met.includes(MET[6]);
  const airR=AIR.map((v,i)=>tgl('tog-air','data-v="'+esc(v)+'"',v,S.air.includes(v),airNone&&i<3,i===0?'<i class="chip">ⓘ</i>':'')).join('');
  const metR=MET.map((v,i)=>tgl('tog-met','data-v="'+esc(v)+'"',v,S.met.includes(v),metNone&&i<6)).join('');
  const tsuR=TSU.map((v,i)=>tgl('tog-tsu','data-i="'+i+'"',v,S.tsu[i])).join('');
  const hints=permitHints().map(h=>'<div class="msg warn">'+esc(h)+'</div>').join('');
  return '<div class="sec"><h3>飛行目的 <small>複数選べます</small> '+autoChip('purpose')+'</h3><div class="grp">業務</div><div class="pills">'+bizP+'</div>'+other(S.biz,'otherBiz','内容')+'<div class="grp">業務以外</div><div class="pills">'+nonP+'</div>'+other(S.non,'otherNon','内容')+'</div>'
   +'<div class="sec"><h3>飛行空域 '+autoChip('air')+'</h3>'+airR+'<p class="note">「上記空域の飛行は行わない」を選ぶと、他の項目は外れます（DIPS Webと同じ考え方）。</p></div>'
   +'<div class="sec"><h3>飛行方法 '+autoChip('met')+'</h3>'+metR+'<p class="note">「上記方法の飛行は行わない」を選ぶと、他の項目は外れます。</p>'+hints+'</div>'
   +'<div class="sec"><h3>安全措置・体制 '+tmpChip+'</h3><div class="grp">立入管理措置（複数選べます）</div>'+tsuR
   +'<div class="grp">係留飛行を行いますか</div><div class="pills">'+pill('tether','data-v="yes"','はい',S.tether==='yes')+pill('tether','data-v="no"','いいえ',S.tether==='no')+'</div>'
   +'<div class="grp">補助者人数</div><div class="row"><button class="btn sm" data-act="assist" data-d="-1">−</button><b style="min-width:2.5em;text-align:center">'+S.assist+'人</b><button class="btn sm" data-act="assist" data-d="1">＋</button></div><p class="note">ここでは補助者の人数だけを入れます。誰が補助者かは、運航の記録で選びます。</p></div>';
}

/* ===== 画面: 飛行範囲（地図） ===== */
function vArea(){
  const E=ENV();
  return '<div class="sec"><h3>飛行範囲 '+autoChip('area')+'</h3>'+mapEditor(S)
   +'<div class="grp">現場プリセット</div>'+(E.presets.length?'<div class="pills">'+E.presets.map(p=>pill('use-preset','data-id="'+p.id+'"',p.name,false)).join('')+'</div>':'<p class="note" style="margin:0">現場プリセットはまだありません。</p>')
   +'<div class="row"><button class="btn sm" data-act="nf-save-preset"'+(S.geom.done?'':' disabled')+'>この範囲を現場プリセットとして保存</button></div><p class="note">保存すると、次からは「始め方」や上のボタンで呼び出せます。</p></div>'
   +'<div class="sec"><h3>場所 <small>出発地・目的地</small></h3><div class="row"><label>出発地</label><input class="in" data-bind="from" value="'+esc(S.from)+'" placeholder="例: 事務所"> '+autoChip('from')+'</div><div class="row"><label>目的地</label><input class="in" data-bind="to" value="'+esc(S.to)+'" placeholder="例: 現場名"> '+autoChip('to')+'</div></div>'
   +'<div class="sec"><h3>DIPSの保存済み経路 <small>参照・任意</small> '+tmpChip+'</h3><div class="row"><select class="in" data-bind="savedRoute" style="flex:1"><option value="">なし</option></select></div><p class="note">DIPSに保存してある経路の名前を選ぶ項目です。いまは候補がありません。</p></div>';
}

/* ===== 画面: 日時・高度 ===== */
function vTime(){
  const s=startDT(),e=endDT();
  return '<div class="sec"><h3>開始日時</h3><div class="row"><input class="in" type="date" data-bind="startDate" data-rerender="1" min="'+ymd(TODAY)+'" value="'+S.startDate+'">'+sel('startH',hourOpts,S.startH,'data-rerender="1"')+sel('startM',minOpts,S.startM,'data-rerender="1"')+'</div><p class="note">分は5分刻み。初期値は「いまから約10分後」。</p>'
   +'<h3 style="margin-top:10px">所要時間 '+autoChip('dur')+'</h3><div class="row">'+sel('durH',durHOpts,S.durH,'data-rerender="1"')+sel('durM',minOpts,S.durM,'data-rerender="1"')+'</div>'
   +'<h3 style="margin-top:10px">終了日時 <i class="chip auto">自動計算</i></h3><div class="row"><input class="in" disabled value="'+esc(fmtDT(e,s))+'"></div><p class="note">開始日時＋所要時間で自動計算されます（直接は入力しません）。</p></div>'
   +'<div class="sec"><h3>定期・複数日指定</h3><div class="row"><button class="btn sm" data-act="cal">カレンダーで日を選ぶ</button><span class="note">'+(S.multi.length?S.multi.length+'日選択中':'単日')+'</span></div></div>'
   +'<div class="sec"><h3>速度・高度</h3><div class="row"><label>飛行速度</label><input class="in" type="number" min="1" step="1" data-bind="speed" data-num="1" data-rerender="1" value="'+S.speed+'"><span>km/h</span><span class="note">'+(S.speed/1.852).toFixed(1)+' kt（自動）</span> '+autoChip('speed')+'</div>'
   +'<div class="row"><label>飛行高度</label><input class="in" type="number" min="1" step="1" data-bind="alt" data-num="1" data-rerender="1" value="'+S.alt+'"><span>m</span> '+autoChip('alt')+'</div></div>'
   +'<div class="sec"><h3>最大飛行時間 '+tmpChip+'</h3><div class="row">'+sel('maxH',durHOpts,S.maxH)+sel('maxM',minOpts,S.maxM)+'</div><p class="note">DIPSにある、所要時間とは別の項目です。</p></div>';
}

/* ===== 画面: 登録済み情報の確認（保険・連絡先）— 未登録ならその場で登録 ===== */
function vMaster(part){
  const E=ENV();const i=S.ins,c=S.contact;
  const amt=(ku,ka,label)=>'<div class="row"><label>'+label+'</label><div class="pills">'+pill('ins-set','data-k="'+ku+'" data-v="yes"','無制限：はい',i[ku]==='yes')+pill('ins-set','data-k="'+ku+'" data-v="no"','無制限：いいえ',i[ku]==='no')+'</div></div><div class="row"><label></label><input class="in" type="number" data-bind="ins.'+ka+'" data-num="1" '+(i[ku]==='yes'?'disabled':'')+' value="'+esc(i[ka])+'" placeholder="金額"><span>円</span></div>';
  const insForm=i.mode==='custom'?'<div class="row"><label>保険会社名</label><input class="in" data-bind="ins.company" value="'+esc(i.company)+'"></div><div class="row"><label>商品名</label><input class="in" data-bind="ins.product" value="'+esc(i.product)+'"></div>'+amt('pUnl','pAmt','対人')+amt('oUnl','oAmt','対物'):'';
  const abil=i.mode==='none'?'<div class="grp">賠償能力（保険に入っていない場合の支払能力に関する項目）</div><div class="pills">'+pill('ins-set','data-k="ability" data-v="yes"','はい',i.ability==='yes')+pill('ins-set','data-k="ability" data-v="no"','いいえ',i.ability==='no')+'</div>':'';
  const src=[['self','自アカウントの情報'],['application','申請書記載の情報'],['pilot','操縦者']];
  const pilotSel=c.src==='pilot'?'<div class="row"><label>操縦者</label><select class="in" data-bind="contact.pilotId" data-rerender="1" style="flex:1"><option value="">選択してください</option>'+S.pilots.map(id=>'<option value="'+id+'"'+(c.pilotId===id?' selected':'')+'>'+esc(plName(id))+'</option>').join('')+'</select></div>':'';
  const noC=!E.contact;
  const insurance='<div class="sec"><h3>保険に関する情報 '+autoChip('ins')+'</h3>'
   +(i.mode==='unreg'?'<div class="msg warn"><b>保険が未登録です。</b>ここで登録するか、この飛行だけ入力するか、加入していないを選びます。</div><div class="pills"><button class="pill" data-act="nf-reg" data-t="insurance">保険をここで登録する</button>'+pill('ins-mode','data-v="custom"','この飛行だけ入力',false)+pill('ins-mode','data-v="none"','保険に加入していない',false)+'</div>'
     :'<div class="msg ok">'+esc(insSummary())+'</div><div class="pills">'+(E.insurance?pill('ins-mode','data-v="auto"','登録済みのまま',i.mode==='auto'):'')+pill('ins-mode','data-v="custom"','この飛行だけ変更',i.mode==='custom')+pill('ins-mode','data-v="none"','保険に加入していない',i.mode==='none')+'</div>')+insForm+abil+'</div>'
;
  const contact='<div class="sec"><h3>連絡先 '+autoChip('contact')+'</h3>'+(noC?'<div class="msg warn"><b>連絡先が未登録です。</b>ここに入力してください。「連絡先として登録しておく」で、次回から自動入力になります。</div>':'')
   +'<div class="pills">'+src.map(([k,l])=>pill('contact-src','data-v="'+k+'"',l,c.src===k)).join('')+'</div>'+pilotSel
   +(noC?'<div class="row"><label>氏名</label><input class="in" data-bind="contact.name" value="'+esc(c.name)+'"></div><div class="row"><label>住所</label><input class="in" data-bind="contact.addr" value="'+esc(c.addr)+'" placeholder="任意"></div>'
        :'<table class="kv" style="margin-top:8px"><tr><td>氏名</td><td>'+esc(c.name)+'</td></tr><tr><td>国/地域・都道府県</td><td>'+esc(c.country)+' / '+esc(c.pref)+'</td></tr><tr><td>住所</td><td>'+esc(c.addr)+'</td></tr></table><p class="note">氏名・住所は連絡先の情報源から自動（読み取り専用）。</p>')
   +'<div class="row"><label>電話</label><input class="in" data-bind="contact.cc" value="'+esc(c.cc)+'" style="max-width:9em"><input class="in" data-bind="contact.phone" placeholder="例：090-1234-5678" value="'+esc(c.phone)+'"></div><div class="row"><label>メール</label><input class="in" data-bind="contact.email" placeholder="例：name@example.com" value="'+esc(c.email)+'"></div><div class="row"><label>その他情報</label><textarea class="in" data-bind="contact.other">'+esc(c.other)+'</textarea></div>'
   +(noC?'<div class="row"><button class="btn sm" data-act="nf-save-contact">この内容を連絡先として登録しておく</button></div>':'')+'</div>'
   +'<p class="note">毎回ほとんど変わらない情報です。登録しておくと、次から自動で入ります。</p>';
  return part==='insurance'?insurance:part==='contact'?contact:insurance+contact;
}

/* ===== 画面: 内容確認 ===== */
function vReview(){
  const L=issues();const ng=L.filter(x=>x.lv==='ng').length,wn=L.filter(x=>x.lv==='warn').length;
  const banner=L.length?'<div class="msg '+(ng?'ng':'warn')+'"><b>'+(ng?'足りない項目があります: '+ng+'件':'確認したい点があります')+(wn?'（要確認 '+wn+'件）':'')+'</b>'+L.map(x=>'<div>・'+esc(x.text)+' <button class="chip" data-act="jump" data-s="'+x.scr+'">直す</button></div>').join('')+'</div>':'<div class="msg ok"><b>大きな不足はありません</b></div>';
  const rowHtml=(n,scr)=>'<div class="rev"><div class="k">'+esc(DNAME(n))+'</div><div class="v">'+valueOf(n)+' '+(AUTOKEY[n]&&S.auto[AUTOKEY[n]]?'<i class="chip auto">自動</i>':'')+'</div><div class="e"><button class="chip" data-act="jump" data-s="'+scr+'">直す</button></div></div>';
  const owner={};Object.keys(NFS).forEach(k=>NFS[k].dips.forEach(n=>owner[n]=k));
  const groups=['use','content','area','time','master'].filter(k=>!(S.noDips&&(k==='time'||k==='master')));
  let list='';
  if(S.reviewView==='dips'&&!S.noDips){list=DIPS_ITEMS.map(x=>rowHtml(x.n,owner[x.n])).join('')}
  else{list=groups.filter(k=>NFS[k].dips.length).map(k=>'<div class="sec"><h3>'+esc(nfName(k))+'</h3>'+NFS[k].dips.map(n=>rowHtml(n,k)).join('')+(k==='area'?'<div class="rev"><div class="k">飛行範囲（地図）</div><div class="v">'+esc(geomSummary(S))+'<div class="mapwrap" style="margin-top:6px">'+mapSvg(S,'mini')+'</div></div><div class="e"><button class="chip" data-act="jump" data-s="area">直す</button></div></div>':'')+'</div>').join('')}
  return banner
   +'<div class="sec"><h3>計画名称 <small>DIPSでは最初の項目</small> '+tmpChip+'</h3><div class="row"><input class="in" data-bind="planName" value="'+esc(S.planName)+'"></div><p class="note">名称は自動で付きます（DIPSと同じ形式）。上の計画名からも直せます。</p></div>'
   +(S.noDips?'<div class="msg info">通報しない飛行のため、日時・保険・連絡先は入力しません。</div>':'<h3>内容</h3>')
   +(S.reviewView==='dips'&&!S.noDips?'<div class="sec">'+list+'<div class="rev"><div class="k">飛行範囲（地図）</div><div class="v">'+esc(geomSummary(S))+'</div><div class="e"><button class="chip" data-act="jump" data-s="area">直す</button></div></div></div><p class="note">「DIPS項目順」は、DIPS Webに入力するときの並びです。</p>':list)
   +(S.noDips?'':'<div class="sec"><h3>カテゴリー</h3><p class="lead" style="margin:0">DIPSが判定して表示します（登録前は空欄）。アプリ側では入力しません。</p></div>');
}

/* ===== 画面: 通報の直前 ===== */
function vFinal(){
  const L=issues();const ng=L.filter(x=>x.lv==='ng').length;
  const off=!A.online;
  if(S.noDips)return '<div class="msg info"><b>この飛行は、DIPSへ通報しません。</b>運航の記録だけを残します。</div>'
   +(ng?'<div class="msg ng">足りない項目が'+ng+'件あります。 <button class="chip" data-act="jump" data-s="review">確認画面へ</button></div>':'')
   +'<div class="sec"><h3>この飛行</h3><table class="kv"><tr><td>計画名称</td><td>'+esc(S.planName)+'</td></tr><tr><td>機体</td><td>'+valueOf(4)+'</td></tr><tr><td>操縦者</td><td>'+valueOf(5)+'</td></tr><tr><td>範囲</td><td>'+esc(geomSummary(S))+'</td></tr></table><p class="note">通報が不要な飛行でも、離陸前の確認は行います。</p></div>'
   +'<div class="row"><button class="btn sm" data-act="jump" data-s="review">戻って直す</button><button class="btn primary" data-act="nf-nodips-go"'+(ng?' disabled':'')+'>飛行前点検へ進む</button></div>';
  return (off?'<div class="msg warn"><b>オフラインです。</b>DIPSへ送信することも、DIPS Webで通報することも、いまはできません。通報の内容は、この端末に残っています。通信できる場所で、続きから進めてください。</div>':'')
   +(ng?'<div class="msg ng">足りない項目が'+ng+'件あります。通報の前に直す想定です。 <button class="chip" data-act="jump" data-s="review">確認画面へ</button></div>':'')
   +'<div class="sec"><h3>通報する内容（要約）</h3><table class="kv"><tr><td>計画名称</td><td>'+esc(S.planName)+'</td></tr><tr><td>日時</td><td>'+esc(valueOf(17))+' 〜 '+valueOf(18)+'</td></tr><tr><td>機体</td><td>'+valueOf(4)+'</td></tr><tr><td>操縦者</td><td>'+valueOf(5)+'</td></tr><tr><td>範囲</td><td>'+esc(geomSummary(S))+'</td></tr><tr><td>高度</td><td>'+valueOf(21)+'</td></tr></table><p class="note">通報するとDIPSに新しい飛行計画が登録されます。通報完了は、飛行できることの保証ではありません。</p></div>'
   +'<div class="sec"><h3>通報の方法を選ぶ '+tmpChip+'</h3>'
   +'<button class="card'+(A.apiOk&&!off?' sel':' dead')+'" style="width:100%;margin-bottom:8px" data-act="nf-send-go"><b>アプリからDIPSへ送信する</b><span>'+(!A.apiOk?'いまは、アプリからDIPSへ送信できません。DIPS Webで通報してください。':off?'オフラインのため、送信できません。':'アプリから、そのままDIPSへ送ります。（DIPSのAPIを使います）')+'</span></button>'
   +'<button class="card'+(!A.apiOk?' sel':'')+'" style="width:100%" data-act="nf-manual-go"><b>DIPS Webで通報する</b><span>DIPSの入力順に、この画面で確認しながら、DIPS Webに入力します。いつでも使えます。</span></button>'
   +'</div>'
   +'<div class="row"><button class="btn sm" data-act="nf-draft">下書きとして保存</button><button class="btn sm" data-act="jump" data-s="review">戻って直す</button><button class="btn sm" data-act="nf-restart">最初からやり直す</button></div>';
}
const VIEW={start:vStart,use:vUse,content:vContent,area:vArea,time:vTime,master:vMaster,review:vReview,final:vFinal};

/* ---------- 新規飛行の画面（メイン） ---------- */
function nfMemo(){
  if(S.layout!=='app'&&!S.noDips)return dipsMemo();
  const cv=coverage();const cur=curPage().ids;
  const blocks=cur.map(id=>{const s=NFS[id];
    return '<h4>いまの画面: '+esc(s.t)+(s.sub?'（'+esc(s.sub)+'）':'')+'</h4><p style="margin:0;font-size:13px">'+esc(s.goal)+'</p>'
    +'<h4>対応するDIPS項目</h4>'+(s.dips.length?'<div>'+s.dips.map(n=>'<span class="tag">#'+n+' '+esc(DNAME(n))+'</span>').join('')+(s.map?'<span class="tag">地図（飛行経路／飛行範囲）</span>':'')+'</div>':'<p class="note" style="margin:0">なし</p>')
    +(s.reuse.length?'<h4>登録済み情報の再利用</h4><ul>'+s.reuse.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')
    +memoBuckets(s.ask,s.tmp,s.ui)}).join('');
  const table='<table><tr><th>画面</th><th>DIPS項目</th></tr>'+NF_ORDER.filter(k=>NFS[k].dips.length).map(k=>'<tr class="'+(cur.includes(k)?'cur':'')+'"><td>'+esc(NFS[k].t)+'</td><td>'+NFS[k].dips.map(n=>'#'+n+' '+esc(DNAME(n))).join('、')+(NFS[k].map?'、地図':'')+'</td></tr>').join('')+'</table>';
  return '<p class="note" style="margin:0">設計Docs上の位置づけ: 新規飛行の流れは、34d・34fの流れ図（新規飛行→計画入力→飛行範囲→通報内容確認→送信）まで。<b>入力〜通報内容の確認の画面の分け方は、Docs上は未整理（PENDING-D-NEW-FLIGHT-SCREENS）</b>で、ここはオーナーが操作して決めるための、たたき台です。不足する登録情報をその場で追加する流れは34a §3（CURRENT-PROPOSAL）。</p>'+blocks
   +'<h4>DIPS22項目の対応</h4><p class="note" style="margin:0 0 4px">'+(cv.missing.length||cv.dup.length?'漏れ: '+cv.missing.join(',')+' 重複: '+cv.dup.join(','):'22項目すべてが、ちょうど1つの画面に割り当てられています（'+cv.ok+'/22）。')+'</p>'+table
   +'<h4>DIPSから変えたところ（たたき台）</h4><ul><li>機体・操縦者・許可を最初にまとめた（DIPSでは許可が2番目、機体・操縦者が続く）</li><li>計画名称は最後の確認画面（DIPSは最初）。ヘッダーからも直せる</li><li>参照経路・出発地・目的地は地図の画面へ（DIPSは別の位置）</li><li>保険は連絡先と一緒に「登録済み情報の確認」へ（DIPSは途中）</li><li>選択肢の名称は、DIPS Webの表記のまま</li></ul>'
   +'<h4>試せること</h4><ul><li>画面の順序入れ替え・次の画面と1画面にまとめる・省く（下の［全体の流れを並べ替える・省く］）</li><li>内容確認: 「画面ごと／DIPS項目順」の切替</li><li>未登録の機体・操縦者・許可・保険・連絡先を、その場で登録して戻る</li><li>DIPSのログイン情報が未登録のまま通報の直前で［アプリからDIPSへ送信する］を押し、その場で登録して元の飛行計画へ戻る</li></ul>'
   +'<h4>未決</h4><ul><li>入力〜通報内容の確認の画面の分け方（PENDING-D-NEW-FLIGHT-SCREENS）。この画面順は、オーナーが操作して決めるためのたたき台</li><li>［DIPS Webで通報する］の側で、DIPSのログイン情報を求めるか（自動ログイン・入力補助に使うか）は未決（PENDING-S5-DIPS-LOGIN-STORAGE）</li></ul>';
}
def('nf',{
  t:'新規飛行',st:()=>pageTitle(curPage()),backAct:'nf-back',memo:nfMemo,
  mock:()=>'<div class="row">'+mockSeg('rv',S.reviewView,[['dips','確認もDIPS項目順'],['screen','確認を画面ごと']])+'</div><div class="row">'+mockSeg('nf-layout',S.layout||'dips',[['dips','DIPS基準案'],['app','アプリでまとめた案']])+'</div><div class="row"><button class="btn sm" data-act="flow">全体の流れを並べ替える・省く</button><button class="btn sm" data-act="fill">仮データで全部埋めて確認画面へ</button><button class="btn sm" data-act="nf-restart">最初からやり直す</button></div>'
   +'<div class="row"><label>DIPSログイン情報</label>'+mockSeg('dipsstate',A.dips.registered?1:0,[[1,'登録済み'],[0,'未登録']])+'</div><p class="note" style="margin:0">未登録にして、通報の直前で［アプリからDIPSへ送信する］を押すと、その場で登録して元の飛行計画へ戻る流れを確かめられます。</p>',
  chips:()=>S.cur==='start'?'':'<button class="chip" data-act="rename">計画名: '+esc(S.planName)+' ✎</button>'+(S.start?'<i class="chip tmp">始め方: '+esc(S.start.label)+'</i>':'')+(S.noDips?'<i class="chip warn">通報しない飛行</i>':''),
  prog:()=>{if(S.cur==='start')return '';const ps=pages();const idx=ps.findIndex(p=>p.key===curPage().key);return '<div class="prog">'+ps.slice(1).map((p,i)=>'<i class="'+(i+1<idx?'done':i+1===idx?'cur':'')+'"></i>').join('')+'</div>'},
  body:()=>curPage().ids.map(id=>id==='dips'?vDips():id==='area'&&S.layout!=='app'&&!S.noDips?vDipsMap():VIEW[id]()).join('<div style="height:6px"></div>'),
  foot:()=>{const ps=pages();const idx=ps.findIndex(p=>p.key===curPage().key);const next=ps[idx+1];
    if(!next)return '<button class="btn" data-act="nf-back">戻る</button>';
    return '<button class="btn" data-act="nf-back">戻る</button><button class="btn primary" data-act="nf-next">次へ：'+esc(pageTitle(next))+'</button>'}
});

/* ---------- 通報の直前で、登録情報が足りないとき（不足分だけ補い、正本へ保存して、元の飛行計画へ戻る）
   はじめの登録で任意にした項目（34a §9.3）が未登録のまま来ることがある。保存先は不足の種類で分ける。
   ・人物の連絡先（フリガナ・住所・電話番号・メールアドレス）→ 対象Personの人物情報（25b §1.1）
   ・DIPSの認証情報（ログインID・パスワード）→ DIPSのログイン情報（34a §8.3）
   別々の案内に分けず、1回の「足りないものを補う」流れとして出す。新しい独立画面は作らない（34a §9.1）。 ---------- */
function contactPerson(){
  const E=ENV();if(!E||!S)return null;const c=S.contact;
  if(c.src==='self')return E.people.find(p=>p.id===E.meId)||null;
  if(c.src==='pilot')return c.pilotId?plOf(c.pilotId):null;
  return null; /* 申請書記載は人物に紐づかない。Personへ保存しない（25b §1.1） */
}
const NEED_FIELDS=[
  {k:'kana',label:'フリガナ',ph:'例：ヤマダ タロウ',personOnly:true},
  {k:'addr',label:'住所',ph:'例：○○県○○市1-2-3'},
  {k:'phone',label:'電話番号',ph:'例：090-1234-5678'},
  {k:'email',label:'メールアドレス',ph:'例：name@example.com'}
];
/* 通報に足りない人物の連絡先。受け皿には、空いているものをまとめて出す。
   フリガナは人物情報だけが持ち、DIPS側の要否は未確認（VERIFY-WEB-CONTACT-KANA）なので、
   受け皿を出すきっかけ（needContactOpen）には数えず、出たときに一緒に補えるようにする。 */
function needContact(){
  if(!S)return [];
  const p=contactPerson();
  return NEED_FIELDS.filter(f=>f.personOnly?(p?!(p[f.k]||'').trim():false):!(S.contact[f.k]||'').trim());
}
/* きっかけになるのは、DIPSの連絡先として観測済みの項目（26 §2.13）だけ。
   どれがDIPS側で必須かは未確認のため、「空のまま送らせない」ではなく「補う機会を出す」扱いにする（25b §1.1） */
const needContactOpen=()=>needContact().filter(f=>!f.personOnly);
const needDips=()=>!A.dips.registered;
const needAny=()=>needContactOpen().length>0||needDips();
function openNeedSheet(){
  A.ui.needForm={};needContact().forEach(f=>{A.ui.needForm[f.k]=''});
  openSheet(needSheetHtml);
}
function needSheetHtml(){
  const miss=needContact();const f=A.ui.needForm||{};const who=contactPerson();
  let h='<h3>通報に必要な情報が足りません</h3><p class="note" style="font-size:14px">足りないものだけ入れてください。入力した飛行計画は、そのまま残っています。</p>';
  if(miss.length){
    h+='<div class="sec"><h3>連絡先'+(who&&who.name?'（'+esc(pnm(who))+'）':'')+'</h3>'
     +miss.map(x=>'<div class="fld"><label>'+esc(x.label)+'</label><input class="in" data-bind="#needForm.'+x.k+'" value="'+esc(f[x.k]||'')+'" placeholder="'+esc(x.ph)+'"></div>').join('')
     +'<p class="note">'+(who?'登録されている人の情報として保存します。':'この飛行の連絡先として使います。')+'次の飛行からは、入れ直さずに使えます。</p>'
     +'<div class="row"><button class="btn primary wide" data-act="need-save">保存して続ける</button></div></div>';
  }
  if(needDips()){
    h+='<div class="sec"><h3>DIPSのログイン情報</h3><p class="note" style="margin:0 0 8px">まだ登録されていません。</p>'
     +'<div class="row"><button class="btn primary wide" data-act="dips-now">今設定する</button></div></div>';
  }
  return h+'<div class="row"><button class="btn wide" data-act="dips-later">あとで行う</button></div>';
}

/* ---------- 通報後の画面（送信・Manual・結果） ---------- */
const planLink=()=>{const E=ENV();return E.plans.find(p=>p.id===(A.nfResult&&A.nfResult.planId))};
function commitPlan(dips){
  const E=ENV();const snap=clone(S);
  const pl={id:uid('pl'),name:S.planName,snap,start:startDT(),place:S.to||S.from||'（場所未入力）',ac:S.aircraft.slice(),pl:S.pilots.slice(),rep:E.meId,dips,kml:A.online?'saved':'pending'};
  E.plans.unshift(pl);return pl;
}
def('nf-send',{t:'DIPSへ送信',st:'アプリからDIPSへ送信する',env:false,back:false,
  goal:'送信して、DIPSからの応答（正常受付・重複の有無・結果不明・エラー）を待つ。',
  doc:'34d §2（送信開始と正常受付は別。正常応答で計画IDと重複有無を確定した時点が、共有飛行リストへの掲載契機）／33b（通信断で登録成否が不明なときは、通常の通報済みとして扱わず、盲目的に再送しない）。',state:'accepted',
  tmp:['この画面の見せ方は仮。DIPSの応答は、右側の「この画面の確認用操作」で選ぶ（実際はDIPSが返す）','応答契約・検証項目は正式API仕様の確認待ち（VERIFY-S5-RESPONSE-EVIDENCE／VERIFY-S4-API-CONTRACT）'],
  ask:[],
  ui:['送信中の表示と待ち方、取消できないことの伝え方は標準案'],
  mock:()=>'<p class="note" style="margin:0 0 6px">実際はDIPSが返す結果です。どの結果のときにどの画面になるかを確かめるため、ここで選びます。</p>'
   +[['clean','正常受付・重複なし','計画IDが返り、他の計画と重複しない（通常の場合）'],['dup','正常受付・重複あり','登録されたが、他の計画と重複している'],['unknown','通信が途切れた（結果不明）','登録されたかどうかが分からない'],['err','入力内容が受け付けられなかった','エラー（内容を直して再送）']].map(r=>'<button class="card" style="width:100%;margin-bottom:6px" data-act="nf-result" data-k="'+r[0]+'"><b>'+r[1]+'</b><span>'+r[2]+'</span></button>').join(''),
  body:()=>'<div class="msg info"><span class="spin"></span> DIPSへ送信しています…</div>',
  foot:()=>'<button class="btn" data-act="nf-send-back">戻る</button>'
});
def('nf-manual',{t:'DIPS Webで通報する',st:'DIPSの入力順に確認しながら入力します',
  goal:'DIPS Webを別画面で開き、DIPSの入力順に、コピー・選択・照合しながら転記する。',
  doc:'24 §3・25b（Manual入力支援はDIPS実画面順。文字はコピー、機体・操縦者・許可はDIPS側の一覧から選ぶ、目的・空域・方法はチェック、地図は作図して照合）。Manualは第一級の経路（API非依存）。',state:'accepted',
  tmp:['画面の細部（コピーの単位・並びの見せ方）は個別仕様を参照。ここは流れを見せるための簡略版','DIPS Webを開く操作はモックでは行わない'],
  ask:[],
  ui:['転記中に、入力した項目へ印を付けていけるようにするかは標準案'],
  body:()=>{
    const E=ENV();const off=!A.online;
    const kind={1:'copy',3:'copy',13:'copy',14:'copy',15:'copy',16:'copy',17:'copy',20:'copy',21:'copy',22:'copy',2:'pick',4:'pick',5:'pick',6:'chk',7:'chk',8:'chk',9:'form',10:'chk',11:'chk',12:'num',18:'auto',19:'btn'};
    const how={copy:'コピーして貼る',pick:'DIPSの一覧から選ぶ',chk:'チェックを入れる',form:'欄に入力する',num:'人数を入れる',auto:'自動計算（照合のみ）',btn:'ボタンから選ぶ'};
    return (off?'<div class="msg warn"><b>オフラインです。</b>この画面の表示とコピーは使えます。DIPS Webを開いて通報するには、通信が必要です。通報の内容は、この端末に残っています。</div>':'')
     +'<div class="msg info">上から順にDIPS Webへ入力します。並びはDIPSの画面と同じです。</div>'
     +DIPS_ITEMS.map(x=>'<div class="rev"><div class="k">'+x.n+'. '+esc(x.name)+'<br><span class="rtag">'+how[kind[x.n]]+'</span></div><div class="v">'+valueOf(x.n)+'</div><div class="e">'+(kind[x.n]==='copy'?'<button class="chip" data-act="stub" data-t="コピーしました" data-m="この項目の値をコピーしました。DIPS Webの入力欄に貼り付けてください。">コピー</button>':'')+'</div></div>').join('')
     +'<div class="rev"><div class="k">地図（飛行範囲）</div><div class="v">'+esc(geomSummary(S))+'<div class="mapwrap" style="margin-top:6px">'+mapSvg(S,'mini')+'</div><span class="note">DIPS Webの地図に同じ形を作図して照合します（コピーでは代替できません）。</span></div><div class="e"></div></div>';
  },
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn" data-act="nf-open-dips"'+(A.online?'':' disabled')+'>DIPS Webを開く</button><button class="btn primary" data-act="nf-manual-done">手動通報した</button>'
});
def('nf-manual-confirm',{t:'通報後の確認',st:'DIPSで登録を確認する',
  goal:'「手動通報した」と、「DIPSで確認できた」を、別の操作として記録する。',
  doc:'24 §3-4／13b（「手動通報ボタンを押したこと」と「DIPS側の通報確認」を混同しない）。番号を取得できない場合は、日時・機体・範囲の一覧照合も認める。',state:'accepted',
  tmp:['確認画面の見せ方は仮','Manualで通報した計画が飛行リストへ入る条件は、API経路と同じとは決まっていない（PENDING-S5-MANUAL-LIST）'],
  ask:['DIPS Webで通報したあと、受付番号の入力を必須にするか、目視での照合だけでよいか（記録として何を残すか）'],
  ui:['入力欄と照合の並べ方は標準案'],
  body:()=>'<div class="msg ok">「手動通報した」を記録しました（'+hm(new Date())+'）。<span class="note">これは、DIPSに登録されたことの確認ではありません。</span></div>'
   +'<div class="sec"><h3>DIPSで確認しましたか？</h3><p class="lead">DIPS Webの飛行計画一覧で、登録されていることを確認してください。</p>'
   +'<button class="tgl'+(A.ui.mconf==='num'?' sel':'')+'" data-act="nf-mconf" data-v="num"><span class="box">'+(A.ui.mconf==='num'?'✓':'')+'</span><span><b>受付番号で確認した</b></span></button>'
   +(A.ui.mconf==='num'?'<div class="row"><label>番号</label><input class="in" data-bind="#mnum" placeholder="DIPSの計画ID（任意）"></div>':'')
   +'<button class="tgl'+(A.ui.mconf==='list'?' sel':'')+'" data-act="nf-mconf" data-v="list"><span class="box">'+(A.ui.mconf==='list'?'✓':'')+'</span><span><b>一覧で、日時・機体・範囲を照合した</b><br><small class="note">番号を取得できない場合はこちら</small></span></button></div>',
  foot:()=>'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="nf-mconf-ok"'+(A.ui.mconf?'':' disabled')+'>DIPSで確認できた</button>'
});
def('nf-accepted',{t:()=>({clean:'通報完了・重複なし',dup:'通報済み・重複あり',manual:'通報確認済み',unknown:'結果不明',err:'受け付けられませんでした'})[(A.nfResult||{}).kind]||'通報の結果',
  st:'DIPSからの結果',env:false,back:false,
  goal:'正常受付と重複の有無を確認し、今から点検するか、あとで続けるか選ぶ。結果不明・エラーは、通常の通報済みとして扱わない。',
  doc:'34d §3（正常受付・重複なし画面の10項目）／§2（正常応答時点が共有リストへの掲載契機。［後で飛行する］は掲載済み計画を残してホームへ戻る操作）／33b・24b §4（結果不明・重複ありは通常系と混ぜない）。',state:'spec',
  tmp:['受付ID等の詳細配置は未確定（34d §3項目3）','PENDING: 重複・調整後にどう再開するか（PENDING-S7B-DUPLICATE-ADJUST）。状態名・解除方法・調整完了方法はオーナー確認待ち。Manual確認だけで重複なしとは扱わない','KMLの状態行は、27eの生成契機（通報時に作成・保存）を見せるための表示（仮）'],
  ask:[],
  ui:['正常受付の画面に出す情報の量と、［後で飛行する］のあとの戻り先は標準案'],
  body:()=>{
    const r=A.nfResult||{kind:'clean'};const pl=planLink();
    const sum=pl?'<div class="sec"><h3>登録された計画</h3><table class="kv"><tr><td>計画名称</td><td>'+esc(pl.name)+'</td></tr><tr><td>日時</td><td>'+esc(fmtDT(pl.start))+'</td></tr><tr><td>機体</td><td>'+pl.ac.map(id=>esc(acLabel(id))).join('<br>')+'</td></tr><tr><td>操縦者</td><td>'+pl.pl.map(id=>esc(plName(id))).join('、')+'</td></tr>'+(r.kind!=='manual'?'<tr><td>DIPS計画ID</td><td class="mono">000000-'+pl.id.replace(/\D/g,'')+'</td></tr>':'')+'</table></div>':'';
    const kml=pl?'<div class="sec"><h3>KML（My Maps用）</h3><p class="lead" style="margin:0">'+(pl.kml==='saved'?'通報したときに作成し、Google Driveの「出力」フォルダーに<b>保存しました</b>。飛行のあとに作り直す必要はありません。':'作成しましたが、通信できず、<b>まだGoogle Driveに保存されていません</b>。この端末には保存されています。通信が戻ったら、自動で保存します。')+'</p></div>':'';
    if(r.kind==='clean'||r.kind==='manual')return '<div class="msg ok big">'+(r.kind==='manual'?'✓ 通報確認済み':'✓ 通報完了・重複なし')+'</div>'+sum+kml
      +'<div class="msg info">通報完了は、飛行できることの保証ではありません（離陸前の確認は別に行います）。この計画は、共有の飛行リストに載りました。'+(r.kind==='manual'?'':'')+'</div>';
    if(r.kind==='dup')return '<div class="msg warn big">通報済み・重複あり</div>'+sum+kml+'<div class="msg warn">ここで運航への移行を止めます。他の計画と重複しています。飛行リストには「通報済み・重複あり」で載ります。<b>重複の調整は、この画面ではまだできません。</b>DIPS Webで確認してください。</div>';
    if(r.kind==='unknown')return '<div class="msg ng big">結果不明</div><div class="msg ng">通信が途切れ、DIPSに登録されたかどうかが分かりません。<b>通常の「通報済み」として扱わず、同じ内容を自動で再送もしません</b>（二重通報を避けるため）。</div>'
      +'<div class="sec"><h3>次にすること</h3><ul style="margin:0;padding-left:1.2em;font-size:13px"><li>DIPS Webの飛行計画一覧で、登録されているか確認する</li><li>登録されていれば、「DIPS Webで確認する」から、確認できたことを記録する</li><li>登録されていなければ、確認したうえで送信し直す</li></ul></div>';
    return '<div class="msg ng big">DIPSに受け付けられませんでした</div><div class="msg ng">内容に問題があります（例: 許可の期間外・必須項目の不足）。内容を直して、もう一度送信してください。</div>';
  },
  foot:()=>{
    const r=A.nfResult||{kind:'clean'};
    if(r.kind==='clean')return '<button class="btn" data-act="nf-later">後で飛行する</button><button class="btn primary" data-act="nf-to-op">飛行前点検へ</button>';
    if(r.kind==='manual')return '<button class="btn" data-act="nf-open-list">飛行リストで確認</button>';
    if(r.kind==='dup')return '<button class="btn" data-act="root" data-s="home">ホームへ</button><button class="btn primary" data-act="nf-open-list">飛行リストで確認</button>';
    if(r.kind==='unknown')return '<button class="btn" data-act="root" data-s="home">ホームへ（あとで確認）</button><button class="btn primary" data-act="nf-manual-go">DIPS Webで確認する</button>';
    return '<button class="btn primary" data-act="nf-fix">内容を直す（確認画面へ）</button>';
  }
});

/* ---------- モーダル ---------- */
function flowHtml(){
  const rows=S.flow.map((f,i)=>'<div class="fl"><b>'+esc(nfName(f.id))+'<br><small class="note">'+esc(NFS[f.id].sub||'')+'</small></b><button class="btn sm" data-act="mv" data-i="'+i+'" data-d="-1"'+(i===0?' disabled':'')+'>▲</button><button class="btn sm" data-act="mv" data-i="'+i+'" data-d="1"'+(i===S.flow.length-1?' disabled':'')+'>▼</button><label class="note"><input type="checkbox" data-act="mg" data-i="'+i+'"'+(f.merge?' checked':'')+(i===S.flow.length-1?' disabled':'')+'> 次と1画面に</label><label class="note"><input type="checkbox" data-act="sk" data-i="'+i+'"'+(f.skip?' checked':'')+'> 省く</label></div>').join('');
  return '<h3>全体の流れ（設計確認用。試してみる）</h3><p class="note">順序の入れ替え・次の画面とのまとめ・省略を試せます。省いた画面の項目は、自動入力や既定値のまま進みます（確認画面には必ず出ます）。</p>'
   +'<div class="fl"><b>始め方</b><span class="note">固定</span></div>'+rows+'<div class="fl"><b>内容確認 → 通報の直前</b><span class="note">固定</span></div>'
   +'<div class="row"><button class="btn" data-act="flow-reset">元の並びに戻す</button><button class="btn primary" data-act="mclose">閉じる</button></div>';
}
function calHtml(){
  const y=S.cal.y,m=S.cal.m;const first=new Date(y,m,1);const last=new Date(y,m+1,0).getDate();
  let cells='';['日','月','火','水','木','金','土'].forEach(d=>cells+='<b>'+d+'</b>');
  for(let i=0;i<first.getDay();i++)cells+='<span></span>';
  for(let d=1;d<=last;d++){const dt=new Date(y,m,d);const k=ymd(dt);const past=dt<TODAY;cells+='<button data-act="cal-day" data-d="'+k+'"'+(past?' disabled':'')+(S.multi.includes(k)?' class="on"':'')+'>'+d+'</button>'}
  return '<h3>定期・複数日指定 '+tmpChip+'</h3><div class="row" style="justify-content:space-between"><button class="btn sm" data-act="cal-nav" data-d="-1">◀</button><b>'+y+'年'+(m+1)+'月</b><button class="btn sm" data-act="cal-nav" data-d="1">▶</button></div><div class="cal">'+cells+'</div><p class="note">選んだ日: '+(S.multi.length?S.multi.slice().sort().join('、'):'なし')+'</p><div class="row"><button class="btn" data-act="cal-clear">クリア</button><button class="btn primary" data-act="close">OK</button></div>';
}
function togExcl(arr,val,none){const i=arr.indexOf(val);if(val===none)return i>=0?[]:[none];const a=arr.filter(x=>x!==none);return i>=0?a.filter(x=>x!==val):a.concat(val)}

/* ---------- 操作 ---------- */
const NF_LABEL={aircraft:'使うもの',person:'使うもの',permit:'使うもの',insurance:'登録済み情報の確認',contact:'登録済み情報の確認'};
/* 新規飛行を始めるのに足りない登録。条件そのものは既存の確定設計から取る
   （34a §3: 飛行を始める際に操縦者を選ぶ／25b・26: DIPSの通報に機体と操縦者が要る）。ここで新しい必須条件を足さない */
function nfMissing(){
  const E=ENV();if(!E)return [];
  const out=[];
  if(!E.aircraft.length)out.push({type:'aircraft',label:'機体',sub:'この飛行で飛ばす機体'});
  if(!E.people.some(p=>p.active!==false&&p.roles.includes('操縦者')))out.push({type:'person',label:'操縦者',sub:'この飛行を操縦する人'});
  return out;
}
def('nf-need',{t:'新規飛行',st:'必要な設定',
  goal:'新規飛行を押したときに、飛行に必要な登録が足りなければ、何が足りないかを示して、その場で登録へ進めるようにする。単にエラーで止めない。登録が終わると、ここへ戻る。',
  doc:'34a §3（飛行を始める際に操縦者を選び、未登録ならその場で登録して元のフローへ戻る。CURRENT-ACCEPTED）／§9.3（機体・許可承認・保険はホーム前に必須にせず、必要になった場面で案内する）／25b・26（DIPSの通報には機体と操縦者が要る）。ここで新しい必須条件は足していない。',state:'proposal',
  tmp:['機体・BAT等を、どこまで飛行開始の必須にするかは未決（PENDING-S5-INITIAL-REQUIRED の残り。最低1機案を含む）','足りないまま進んだときに、どの画面で止めるかは、内容確認・通報の直前の判定（34d）に従う'],
  ask:['足りないときに、ここで止めるか、そのまま進めて途中で登録できるようにするか（いまは34a §3に従って、どちらも選べるようにしている）'],
  ui:['足りないものだけを並べ、［必要な設定をする］を色の付いた主ボタンにしている','足りないものが複数あるときは、1つ登録するたびにこの画面へ戻り、残りが分かるようにしている'],
  body:()=>{
    const m=nfMissing();
    if(!m.length)return '<div class="msg ok">必要な設定がそろいました。</div>';
    return '<div class="msg warn"><b>飛行を始めるために必要な設定がまだありません。</b>下の設定を登録すると、飛行を始められます。</div>'
     +m.map(x=>'<div class="li"><span class="tx"><b>'+esc(x.label)+'</b><small>'+esc(x.sub)+'</small></span><i class="chip warn">未登録</i></div>').join('')
     +'<p class="note">あとから登録することもできます。その場合は、飛行の途中で登録する画面が出ます。</p>';
  },
  foot:()=>{
    const m=nfMissing();
    return m.length
     ?'<button class="btn" data-act="nf-need-go">このまま進む</button><button class="btn primary" data-act="nf-need-set">必要な設定をする</button>'
     :'<button class="btn" data-act="back">戻る</button><button class="btn primary" data-act="nf-need-go">新規飛行を始める</button>';
  }
});

const NF_RET={
  aircraft:id=>{if(!S.aircraft.includes(id))S.aircraft.push(id);delete S.auto.aircraft},
  person:id=>{if(!S.pilots.includes(id))S.pilots.push(id);delete S.auto.pilots},
  permit:id=>{S.permit=id;delete S.auto.permit},
  insurance:()=>{const i=ENV().insurance;S.ins={mode:'auto',company:i.company,product:i.product,pUnl:i.pUnl,pAmt:i.pAmt,oUnl:i.oUnl,oAmt:i.oAmt,ability:''}}
};
Object.assign(ACTS,{
  'nf-new':()=>{if(nfMissing().length){nav('nf-need');return}S=blankNF(ENV());S.cur='start';nav('nf')},
  'nf-need-set':()=>{const m=nfMissing();if(!m.length){ACTS['nf-need-go']();return}const o={ret:{label:'新規飛行',apply:()=>{}}};if(m[0].type==='person')o.roles=['操縦者'];openReg(m[0].type,o)},
  'nf-need-go':()=>{S=blankNF(ENV());S.cur='start';rep('nf')},
  'nf-back':()=>{if(S.cur==='start')back();else nfStep(-1)},
  'nf-next':()=>{if(S.cur==='start'&&!S.start)S.start={mode:'new',label:'新しく作る'};nfStep(1)},
  'nf-restart':()=>{A.modal=null;S=blankNF(ENV());S.cur='start';render(false)},
  'nf-layout':t=>{S.layout=t.dataset.v;S.cur='start';render()},
  'flow':()=>{S.layout='app';openMock(flowHtml)},
  'rename':()=>openSheet(()=>'<h3>計画名称</h3><div class="row"><input class="in" data-bind="planName" value="'+esc(S.planName)+'"></div><p class="note">DIPSでは最初の項目です。自動で付いた名前を、変えられます。</p><div class="row"><button class="btn primary" data-act="close">OK</button></div>'),
  'start-new':()=>{S.start={mode:'new',label:'新しく作る'};nfGo(pages()[1].key)},
  'start-past':t=>{applyPast(ENV().flights.find(h=>h.id===t.dataset.id));nfGo(pages()[1].key)},
  'start-preset':t=>{applyPreset(ENV().presets.find(p=>p.id===t.dataset.id));nfGo(pages()[1].key)},
  'start-nodips':()=>{S.noDips=true;S.start={mode:'nodips',label:'通報しない飛行'};nfGo(pages()[1].key)},
  'pick-ac':t=>{const a=acOf(t.dataset.id);if(a.dead){toast('抹消・期限切れの機体は選べません');return}const i=S.aircraft.indexOf(a.id);if(i>=0)S.aircraft.splice(i,1);else S.aircraft.push(a.id);delete S.auto.aircraft;render()},
  'pick-pl':t=>{const p=plOf(t.dataset.id);if(!p.pilot){toast('操縦者ではない人は選べません');return}const i=S.pilots.indexOf(p.id);if(i>=0)S.pilots.splice(i,1);else S.pilots.push(p.id);delete S.auto.pilots;render()},
  'pick-pm':t=>{const id=t.dataset.id;if(id!=='none'){const m=ENV().permits.find(x=>x.id===id);if(daysTo(m.to)<0){toast('期限切れの許可は選べません');return}}S.permit=id;delete S.auto.permit;render()},
  'nf-reg':t=>{
    const type=t.dataset.t;const o={ret:{label:'新規飛行の「'+NF_LABEL[type]+'」',apply:NF_RET[type]}};
    if(type==='person')o.roles=['操縦者'];
    if(type==='permit')o.aircraft=S.aircraft.slice();
    openReg(type,o);
  },
  'nf-me-pilot':()=>{const E=ENV();const me=E.people.find(p=>p.id===E.meId);if(!me)return;if(!me.roles.includes('操縦者'))me.roles.push('操縦者');me.pilot=true;if(!S.pilots.includes(me.id))S.pilots.push(me.id);delete S.auto.pilots;render();toast('自分を操縦者として登録し、選びました')},
  'nf-save-preset':()=>openReg('preset',{prefill:{name:'',geom:clone(S.geom),alt:S.alt,from:S.from,to:S.to,biz:S.biz.slice(),durH:S.durH,durM:S.durM},ret:{label:'新規飛行の「飛行範囲」',apply:()=>{}}}),
  'nf-save-contact':()=>{
    if(!canWrite())return;const c=S.contact;if(!c.name.trim()){toast('氏名を入れてください');return}
    ENV().contact={name:c.name,country:c.country,pref:c.pref,addr:c.addr,cc:c.cc,phone:c.phone,email:c.email};render();toast('連絡先として登録しました。次回から自動入力されます');
  },
  'tog-purpose':t=>{const k=t.dataset.g,v=t.dataset.v;const a=S[k];const i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);delete S.auto.purpose;render()},
  'tog-air':t=>{S.air=togExcl(S.air,t.dataset.v,AIR[3]);delete S.auto.air;render()},
  'tog-met':t=>{S.met=togExcl(S.met,t.dataset.v,MET[6]);delete S.auto.met;render()},
  'tog-tsu':t=>{const i=Number(t.dataset.i);S.tsu[i]=!S.tsu[i];render()},
  'tether':t=>{S.tether=t.dataset.v;render()},
  'assist':t=>{S.assist=Math.max(0,S.assist+Number(t.dataset.d));render()},
  'use-preset':t=>{applyPreset(ENV().presets.find(p=>p.id===t.dataset.id));toast('プリセットから範囲・高度・場所などを入れました');render()},
  'cal':()=>openSheet(calHtml),
  'cal-day':t=>{const k=t.dataset.d;const i=S.multi.indexOf(k);if(i>=0)S.multi.splice(i,1);else S.multi.push(k);render()},
  'cal-nav':t=>{let m=S.cal.m+Number(t.dataset.d),y=S.cal.y;if(m<0){m=11;y--}if(m>11){m=0;y++}S.cal={y,m};render()},
  'cal-clear':()=>{S.multi=[];render()},
  'ins-mode':t=>{S.ins.mode=t.dataset.v;if(t.dataset.v==='auto'&&ENV().insurance){const i=ENV().insurance;Object.assign(S.ins,{company:i.company,product:i.product,pUnl:i.pUnl,pAmt:i.pAmt,oUnl:i.oUnl,oAmt:i.oAmt})}render()},
  'ins-set':t=>{S.ins[t.dataset.k]=t.dataset.v;render()},
  'contact-src':t=>{const src=t.dataset.v;S.contact.src=src;const E=ENV();const c0=selfContact(E);
    if(src==='self'){if(c0)Object.assign(S.contact,{name:c0.name,country:c0.country,pref:c0.pref,addr:c0.addr,phone:c0.phone,email:c0.email})}
    else if(src==='application'){Object.assign(S.contact,{name:'',addr:'',phone:'',email:''})}
    else{Object.assign(S.contact,{name:S.contact.pilotId?plName(S.contact.pilotId):'（操縦者を選択）',phone:'',email:''})}
    render()},
  'jump':t=>nfGo(t.dataset.s),
  'rv':t=>{S.reviewView=t.dataset.v;render()},
  'nf-draft':()=>openStub('下書きとして保存','入力途中の内容は、この端末に残っています。あとから、続きの入力ができます。'),
  'nf-send-go':()=>{
    if(!A.online){toast('オフラインのため送信できません。通報の内容は、この端末に残っています。通信できる場所で、もう一度送信してください');return}
    if(!A.apiOk){toast('いまは、アプリからDIPSへ送信できません。［DIPS Webで通報する］を選んでください');return}
    if(!canWrite())return;
    if(needAny()){openNeedSheet();return}
    nav('nf-send');
  },
  'dips-now':()=>{A.modal=null;A.dipsRet={label:'新規飛行'};nav('set-dipscred')},
  /* 不足している人物の連絡先を、その場で補う。人物情報（人員台帳）へ保存し、この飛行の連絡先にも反映する */
  'need-save':()=>{
    if(!canWrite())return;
    const f=A.ui.needForm||{};const p=contactPerson();let n=0;
    needContact().forEach(x=>{
      const v=(f[x.k]||'').trim();if(!v)return;
      n++;
      if(p)p[x.k]=v;                    /* 対象Personの人物情報へ保存（25b §1.1） */
      if(!x.personOnly)S.contact[x.k]=v; /* この飛行の連絡先にも反映 */
    });
    if(!n){toast('入力してください');return}
    A.ui.needForm=null;
    if(!needAny())A.modal=null;else{A.ui.needForm={};needContact().forEach(x=>{A.ui.needForm[x.k]=''})}
    render();toast(p?'登録されている人の情報として保存しました。次の飛行からは、入れ直さずに使えます':'連絡先を保存しました');
  },
  'dips-later':()=>{A.modal=null;render();toast('飛行計画は、そのまま残っています')},
  'nf-send-back':()=>back(),
  'nf-result':t=>{
    const k=t.dataset.k;
    if(k==='clean'||k==='dup'){const pl=commitPlan(k);A.nfResult={kind:k,planId:pl.id}}
    else A.nfResult={kind:k};
    rep('nf-accepted');
  },
  'nf-manual-go':()=>{A.ui.mconf=null;A.ui.mnum='';nav('nf-manual')},
  'nf-open-dips':()=>openSheet(()=>'<h3>DIPS Webを開く</h3><p>DIPS Webを別のタブで開き、この画面と見比べながら入力します。</p><div class="row"><button class="btn" data-act="close">閉じる</button></div>'),
  'nf-manual-done':()=>{A.ui.mconf=null;nav('nf-manual-confirm')},
  'nf-mconf':t=>{A.ui.mconf=t.dataset.v;render()},
  'nf-mconf-ok':()=>{if(!canWrite())return;const pl=commitPlan('manual');A.nfResult={kind:'manual',planId:pl.id};rep('nf-accepted')},
  'nf-later':()=>{toast('計画は飛行リストに残しました。あとから、本人または権限のある人が続けられます');S=null;A.nfResult=null;root('home')},
  'nf-open-list':()=>{root('home');nav('list')},
  'nf-fix':()=>{A.nfResult=null;back();nfGo('review')},
  'nf-nodips-go':()=>{if(typeof startOp==='function')startOp(null,S);else openStub('準備中です','飛行前点検以降の画面は、まだ用意できていません。')},
  'nf-to-op':()=>{
    if(!A.nfResult||A.nfResult.kind!=='clean')return;
    const pl=planLink();
    if(typeof startOp==='function')startOp(pl,S);else openStub('準備中です','飛行前点検以降の画面は、まだ用意できていません。');
  },
  'fill':()=>{if(fillSample())nfGo('review')},
  'mv':t=>{const i=Number(t.dataset.i),d=Number(t.dataset.d),j=i+d;if(j<0||j>=S.flow.length)return;const f=S.flow;[f[i],f[j]]=[f[j],f[i]];render()},
  'mg':t=>{S.flow[Number(t.dataset.i)].merge=t.checked;render()},
  'sk':t=>{S.flow[Number(t.dataset.i)].skip=t.checked;render()},
  'flow-reset':()=>{S.flow=['use','content','area','time','master'].map(id=>({id,skip:false,merge:false}));render()}
});
