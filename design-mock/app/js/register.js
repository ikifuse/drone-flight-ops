'use strict';
/* ===================================================================
   登録フォーム（機体・人員・許可承認・保険・連絡先・現場プリセット・BAT）
   ★ 同じフォームを2つの経路で使う:
     (1)［各種設定・管理］から事前に登録する経路（登録後は一覧へ戻る）
     (2) 新規飛行・BAT交換などの途中で、足りないものを「その場で」登録する経路
         （登録後は元の操作へ戻り、登録したものが選ばれた状態になる）
   設計の出典: 34a §3（選択時にその場で登録→元の処理へ戻る。CURRENT-PROPOSAL）／34g §3.2（機体の追加・変更）
   =================================================================== */
const REG_TITLE={aircraft:'機体',person:'人員',permit:'許可・承認',insurance:'保険',contact:'連絡先',preset:'現場プリセット',bat:'BAT'};
const REG_META={
  aircraft:{doc:'34g §3.2（機体の追加・変更）／32h §6（新しい機体を追加する流れ）。機種・登録記号・BAT管理のON／OFF・使用するBAT共用グループが機体設定の候補。',state:'proposal',
    tmp:['項目の最終形は未確定（機体設定の項目は「等」）','BAT管理の既定値は未確定（PENDING-D-BAT-SWITCH）','BAT共用グループの名称・作り方は未確定（PENDING-D-AC-GROUP-NAMING）','機体管理を誰が行えるかは未確定（PENDING-D-AC-PERMISSION）'],ask:['機体の登録時に、BAT管理のON／OFFを決めさせるか（その機体でBATの記録を残すかどうかが変わる）'],ui:['BAT共用グループの設定を、この画面に含めるか別画面にするかは標準案']},
  person:{doc:'31a §2・§3（人物・所属・役割・資格を分ける。アカウントを持たない補助者も人物として登録できる）／31d（離任は人物の削除ではなく、この環境との所属の終了）。',state:'accepted',
    tmp:['入力項目の列・画面構成は未確定（PENDING-S2-IDENTITY／PENDING-S2-MEMBERSHIP）','技能証明は「未発行のまま」保持できる','離任の画面・実行できる人は未確定（PENDING-S2-MEMBERSHIP）'],ask:['新規飛行の途中で登録するときに、最低限どの項目を登録させるか（氏名と資格だけ、など）'],ui:['入力欄の並びと、変更のときの見せ方は標準案']},
  permit:{doc:'25b／26（DIPSの飛行許可番号・発行日・期間・カテゴリー）。許可承認を設定のどこに置くか・どの責任領域に保存するかは未確定（PENDING-S6-DRIVE-PLACEMENT）。',state:'tmp',
    tmp:['設定の分類（許可承認・保険・連絡先を1つにまとめる）は仮','許可の適用範囲（DID・夜間など）と機体の対応を持たせるのは、照合ヒントを見せるための仮の対応'],ask:['許可承認は、機体ごと・操縦者ごと・使う場所ごとのどれで持つか'],ui:['1画面に収める並べ方は標準案']},
  insurance:{doc:'25b／26（DIPSの保険に関する情報：会社名・商品名・対人／対物の無制限／金額）。設定のどこに置くかは未確定（PENDING-S6-DRIVE-PLACEMENT）。',state:'tmp',
    tmp:['環境に1つだけ持つ形は仮（機体ごと・複数契約もあり得る）','「賠償能力」は保険加入と同一視できない項目のため、登録には含めない'],ask:['保険は使う場所に1つか、複数持てるか'],ui:['入力欄の並びは標準案']},
  contact:{doc:'25b／31c（DIPSの連絡先：自アカウント・申請書記載・操縦者から選ぶ）。設定のどこに置くかは未確定。',state:'tmp',
    tmp:['この登録は「自アカウントの情報」の既定値になる想定（仮）'],ask:['連絡先は使う場所に1つか、人ごとに持つか'],ui:['入力欄の並びは標準案']},
  preset:{doc:'12c（場所・飛行範囲プリセット。新規計画へ値を複製する規則）。設定画面の体系は未設計（PENDING-D-SETTINGS-SCREENS）。',state:'tmp',
    tmp:['場所（Location）と範囲プリセットを1画面で扱う簡略版','作図の操作は仮（DIPS iPhone実機の作図操作は未確認）'],ask:[],ui:['現場プリセットを、飛行範囲の画面から保存する形にするか、設定からも作れるようにするかは標準案']},
  bat:{doc:'32g（現場入力4項目）／32b（中古BATの取得時確認）／34a §3（BAT等も、選択時にその場で新規登録する案）。',state:'proposal',
    tmp:['管理ラベルの一意性の範囲・命名は未確定（PENDING-D-BAT-LABEL-RULE）','BATを登録する画面そのものは、これまで個別に設計されていない（32d §5は一覧・詳細・交換時の選択）'],ask:[],ui:['BATの新規登録の入口を、設定とBAT交換の途中のどちらから主に使わせるかは標準案']}
};

/* ---------- 開く・閉じる ---------- */
function openReg(type,o){
  o=o||{};
  A.reg={type,id:o.id||null,ret:o.ret||null,d:regInit(type,o)};
  if(type==='aircraft'){const a=acOf(o.id);AIRCRAFT_DETAILS.forEach(([k])=>A.reg.d[k]=a?.[k]??'')}
  nav('reg-'+type);
}
function regBanner(){
  const r=A.reg&&A.reg.ret;
  return r?'<div class="msg info"><b>「'+esc(r.label)+'」の途中です。</b>登録が終わると、元の画面に戻ります。登録したものは選ばれた状態になります。</div>':'';
}
function finishReg(id,msg){
  const r=A.reg&&A.reg.ret;const t=A.reg.type;
  if(r&&r.apply)r.apply(id);
  A.reg=null;back();
  toast(msg||(REG_TITLE[t]+'を登録しました'+(r?'。'+r.label+'に戻りました':'')));
}

/* ---------- 部品 ---------- */
const fRow=(label,inner)=>'<div class="row"><label>'+label+'</label>'+inner+'</div>';
const fIn=(k,v,ph,type)=>'<input class="in" '+(type?'type="'+type+'" ':'')+'data-bind="@d.'+k+'" value="'+esc(v)+'" placeholder="'+esc(ph||'')+'">';
const fSel=(k,opts,cur,rr)=>'<select class="in" data-bind="@d.'+k+'" '+(rr?'data-rerender="1" ':'')+'style="flex:1">'+opts.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+(String(v)===String(cur)?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select>';
const fSeg=(k,opts,cur)=>'<span class="seg">'+opts.map(o=>'<button class="'+(String(cur)===String(o[0])?'on':'')+'" data-act="reg-set" data-k="'+k+'" data-v="'+esc(o[0])+'">'+esc(o[1])+'</button>').join('')+'</span>';
const fPills=(k,opts,arr)=>'<div class="pills">'+opts.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<button class="pill'+(arr.includes(v)?' sel':'')+'" data-act="reg-tog" data-k="'+k+'" data-v="'+esc(v)+'">'+esc(l)+'</button>'}).join('')+'</div>';
const dstr=d=>d?ymd(d):'';
const dparse=s=>s?new Date(s+'T00:00:00'):null;

function regInit(t,o){
  const E=ENV();const ex=o.id?(({aircraft:E.aircraft,person:E.people,permit:E.permits,preset:E.presets,bat:E.bats})[t]||[]).find(x=>x.id===o.id):null;
  const me=E.people.find(p=>p.id===E.meId);
  switch(t){
   case 'aircraft':return ex?{name:ex.name,model:MODELS.includes(ex.model)?ex.model:'その他（手入力）',modelOther:MODELS.includes(ex.model)?'':ex.model,mark:ex.mark,cert:ex.cert||'なし',expiry:dstr(ex.expiry),batOn:!!ex.batOn,group:ex.group||'',newGroup:''}
     :{name:'',model:'EVO Lite+',modelOther:'',mark:'',cert:'なし',expiry:'',batOn:false,group:'',newGroup:''};
   case 'person':return ex?{name:ex.name,kana:ex.kana||'',roles:ex.roles.slice(),lic:ex.lic||'未発行',licNo:ex.licNo||'',account:ex.account||'',phone:ex.phone||'',addr:ex.addr||'',email:ex.email||''}
     :{name:o.name||'',kana:'',roles:(o.roles||[]).slice(),lic:'未発行',licNo:'',account:'',phone:'',addr:'',email:''};
   case 'permit':return ex?{no:ex.no,label:ex.label,issued:dstr(ex.issued),from:dstr(ex.from),to:dstr(ex.to),cat:ex.cat,cover:ex.cover.slice(),aircraft:ex.aircraft.slice()}
     :{no:'',label:'',issued:'',from:'',to:'',cat:'II',cover:[],aircraft:(o.aircraft||[]).slice()};
   case 'insurance':return E.insurance?Object.assign({},E.insurance):{company:'',product:'',pUnl:'yes',pAmt:'',oUnl:'yes',oAmt:'',ability:''};
   case 'contact':return E.contact?Object.assign({},E.contact):Object.assign({name:'',country:'日本/Japan',pref:'',addr:'',cc:'日本/Japan(81)',phone:'',email:''},selfContact(E)||{});
   case 'preset':return ex?{name:ex.name,geom:{kind:ex.geo.kind,pts:ex.geo.pts.map(p=>p.slice()),r:ex.geo.r,width:ex.geo.width||10,done:true,editing:false},layer:false,search:'',alt:ex.alt,from:ex.from,to:ex.to,biz:ex.biz.slice(),durH:ex.dur[0],durM:ex.dur[1]}
     :Object.assign({name:'',geom:newGeom(),layer:false,search:'',alt:30,from:'',to:'',biz:[],durH:0,durM:30},o.prefill||{});
   case 'bat':return ex?{label:ex.label,model:ex.model,group:ex.group||'',newGroup:'',source:ex.source||'new',cycle:ex.cycle==null?'':ex.cycle,check:ex.check,note:ex.note||''}
     :{label:'BAT '+(E.bats.length+1),model:'',group:o.group||(E.batGroups[0]?E.batGroups[0].id:''),newGroup:'',source:'new',cycle:'',check:'',note:''};
  }
}

/* ---------- 各フォームの本体 ---------- */
function formAircraft(){
  const E=ENV(),d=A.reg.d;const newG=d.batOn&&(d.group==='__new'||!E.batGroups.length);
  const gsel=d.batOn?fRow('BATグループ',fSel('group',E.batGroups.map(g=>[g.id,g.name]).concat([['__new','＋ 新しいグループを作る']]),newG?'__new':d.group||E.batGroups[0].id,true)):'';
  return '<div class="sec"><h3>機体の情報</h3>'
   +fRow('機種',fSel('model',MODELS,d.model,true))+(d.model==='その他（手入力）'?fRow('機種名',fIn('modelOther',d.modelOther,'例：○○○')):'')
   +fRow('登録記号',fIn('mark',d.mark,'例：JU-○○○○'))+fRow('名称',fIn('name',d.name,'例：1号機（任意）'))
   +fRow('機体認証',fSel('cert',CERTS,d.cert))+fRow('登録の期限',fIn('expiry',d.expiry,'','date'))
   +'<p class="note">登録するのは「機種」ではなく、登録記号のある実際の1機です。</p></div>'
   +aircraftDetails()+'<div class="sec"><h3>BAT管理 '+tmpChip+'</h3><div class="row">'+fSeg('batOn',[['false','OFF'],['true','ON']],String(d.batOn))+'</div>'
   +'<p class="note">OFFの機体でも、飛行記録・点検記録は最後まで残せます。ONにすると、この機体で使うBATのグループを決めます。</p>'
   +gsel+(newG?fRow('グループ名',fIn('newGroup',d.newGroup,'例：EVO Lite系のBATグループ')):'')
   +(d.batOn?'<p class="note">同じBATを共用できる機体は、同じグループにします。グループに入れると、その機体でグループのBATを選べるようになります。</p>':'')+'</div>';
}
function formPerson(){
  const d=A.reg.d;const isPilot=d.roles.includes('操縦者');const E=ENV();
  const ex=A.reg.id?E.people.find(p=>p.id===A.reg.id):null;
  return '<div class="sec"><h3>名前など</h3>'+fRow('氏名',fIn('name',d.name,'例：山田 太郎'))+fRow('フリガナ',fIn('kana',d.kana,'例：ヤマダ タロウ（任意）'))+fRow('電話',fIn('phone',d.phone,'例：090-1234-5678（任意）'))+fRow('住所',fIn('addr',d.addr,'あとから入力できます'))+fRow('連絡用メール',fIn('email',d.email,'あとから入力できます'))
   +'<div class="row"><button class="btn sm" data-act="reg-self">自分の情報を使う</button><span class="note">操縦者になるかどうかは、下の役割で選びます。</span></div></div>'
   +'<div class="sec"><h3>役割 <small>複数選べます</small></h3>'+fPills('roles',ROLES,d.roles)
   +'<p class="note">役割は、ここでの立場です。飛行ごとの担当（操縦者・通報者・記録者）とは別です。</p></div>'
   +(isPilot?'<div class="sec"><h3>技能証明</h3>'+fRow('種別',fSel('lic',LICS,d.lic))+fRow('証明番号',fIn('licNo',d.licNo,'未発行なら空のまま'))+'<p class="note">まだ発行されていないときは、番号を空のままにしてください。</p></div>':'')
   +'<div class="sec"><h3>Googleアカウント <small>任意</small></h3>'+fRow('メール',fIn('account',d.account,'例：name@example.com'))+'</div>'
   +(ex?'<div class="sec"><h3>参加の状態</h3>'+(ex.active!==false?'<p class="lead" style="margin:0 0 8px">参加しています。</p><button class="btn danger sm" data-act="person-leave">離任にする…</button>':'<p class="lead" style="margin:0 0 8px">離任しています（過去の記録は残っています）。</p><button class="btn sm" data-act="person-rejoin">再び参加にする</button>')+'</div>':'');
}
function formPermit(){
  const E=ENV(),d=A.reg.d;
  return '<div class="sec"><h3>許可・承認</h3>'+fRow('許可番号',fIn('no',d.no,'例：国空航第○○号'))+fRow('名称',fIn('label',d.label,'例：包括許可'))
   +fRow('発行日',fIn('issued',d.issued,'','date'))+fRow('期間（自）',fIn('from',d.from,'','date'))+fRow('期間（至）',fIn('to',d.to,'','date'))
   +fRow('カテゴリー',fSel('cat',['II','III','—'],d.cat))+'</div>'
   +'<div class="sec"><h3>適用範囲 '+tmpChip+'</h3>'+fPills('cover',COVERS,d.cover)+'<p class="note">この許可で飛べる飛行の種類です。新規飛行で、選んだ内容と合っているかの目安に使います。</p></div>'
   +'<div class="sec"><h3>対象の機体</h3>'+(E.aircraft.length?fPills('aircraft',E.aircraft.map(a=>[a.id,a.name]),d.aircraft):'<div class="empty">登録された機体がありません</div>')+'</div>';
}
function insAmt(k,ku,ka,label){const d=A.reg.d;return '<div class="row"><label>'+label+'</label>'+fSeg(ku,[['yes','無制限：はい'],['no','無制限：いいえ']],d[ku])+'</div><div class="row"><label></label><input class="in" type="number" data-bind="@d.'+ka+'" data-num="1" '+(d[ku]==='yes'?'disabled':'')+' value="'+esc(d[ka])+'" placeholder="金額"><span>円</span></div>'}
function formInsurance(){
  const d=A.reg.d;
  return '<div class="sec"><h3>保険</h3>'+fRow('保険会社名',fIn('company',d.company,'例：○○損害保険'))+fRow('商品名',fIn('product',d.product,'例：賠償責任保険'))+insAmt('p','pUnl','pAmt','対人')+insAmt('o','oUnl','oAmt','対物')+'<p class="note">DIPSの「保険に関する情報」に当たる内容です。</p></div>';
}
function formContact(){
  const d=A.reg.d;
  return '<div class="sec"><h3>連絡先</h3>'+fRow('氏名',fIn('name',d.name,'例：山田 太郎'))+fRow('国/地域',fIn('country',d.country))+fRow('都道府県',fIn('pref',d.pref,'例：○○県'))+fRow('住所',fIn('addr',d.addr,'例：○○市1-2-3'))
   +'<div class="row"><label>電話</label><input class="in" data-bind="@d.cc" value="'+esc(d.cc)+'" style="max-width:9em"><input class="in" data-bind="@d.phone" value="'+esc(d.phone)+'" placeholder="例：090-1234-5678"></div>'+fRow('メール',fIn('email',d.email,'例：name@example.com'))+'</div>';
}
function formPreset(){
  const d=A.reg.d;
  return '<div class="sec"><h3>現場の名前</h3>'+fRow('名前',fIn('name',d.name,'例：河川敷Aの現場'))+'</div>'
   +'<div class="sec"><h3>飛行範囲</h3>'+mapEditor(d)+'</div>'
   +'<div class="sec"><h3>既定の値</h3>'+fRow('高度（m）','<input class="in" type="number" data-bind="@d.alt" data-num="1" value="'+esc(d.alt)+'">')+fRow('出発地',fIn('from',d.from))+fRow('目的地',fIn('to',d.to))
   +'<div class="grp">飛行目的（任意）</div>'+fPills('biz',BIZ.slice(0,12),d.biz)+'<p class="note">新規飛行でこのプリセットを呼び出すと、範囲・高度・出発地/目的地・目的が自動入力されます。</p></div>';
}
function formBat(){
  const E=ENV(),d=A.reg.d;const newG=d.group==='__new'||!E.batGroups.length;
  return '<div class="sec"><h3>BATの情報</h3>'+fRow('管理ラベル',fIn('label',d.label,'例：BAT 1'))
   +'<p class="note">管理ラベルは、実物のBATにも貼っておく名前です。</p>'
   +fRow('型式',fIn('model',d.model,'例：型式X（任意）'))
   +fRow('BATグループ',fSel('group',E.batGroups.map(g=>[g.id,g.name]).concat([['__new','＋ 新しいグループを作る']]),newG?'__new':d.group,true))+(newG?fRow('グループ名',fIn('newGroup',d.newGroup,'例：EVO Lite系のBATグループ')):'')+'</div>'
   +'<div class="sec"><h3>取得 '+tmpChip+'</h3><div class="row">'+fSeg('source',[['new','新品'],['used','中古']],d.source)+'</div>'
   +(d.source==='used'?'<p class="note">中古のときは、取得したときに確認したサイクル数と状態から、記録を始めます。それ以前の履歴は記録しません。</p>':'')
   +'<div class="row"><label>サイクル数</label><input class="in" type="number" data-bind="@d.cycle" data-num="1" value="'+esc(d.cycle)+'" placeholder="確認できたときだけ（任意）"></div>'
   +fRow('状態確認',fSel('check',[['','選択してください'],...BAT_CHECKS],d.check))+'<div class="row"><label>備考</label><textarea class="in" data-bind="@d.note">'+esc(d.note)+'</textarea></div></div>';
}
const FORMS={aircraft:formAircraft,person:formPerson,permit:formPermit,insurance:formInsurance,contact:formContact,preset:formPreset,bat:formBat};

/* ---------- 保存 ---------- */
function ensureGroup(E,d,model){
  const exists=E.batGroups.some(g=>g.id===d.group);
  if(exists)return d.group;
  const g={id:uid('g'),name:(d.newGroup||'').trim()||'新しいBATグループ',models:model?[model]:[]};E.batGroups.push(g);return g.id;
}
const SAVE={
  aircraft(E,d,id){
    if(!d.mark.trim()){toast('登録記号を入れてください');return null}
    const model=d.model==='その他（手入力）'?d.modelOther.trim():d.model;
    if(!model){toast('機種名を入れてください');return null}
    const obj={name:d.name.trim()||model,model,mark:d.mark.trim(),cert:d.cert,expiry:dparse(d.expiry),batOn:!!d.batOn,group:null};
    for(const [k,,type] of AIRCRAFT_DETAILS){if(d[k]==null)continue;if(type==='number'&&d[k]!==''&&(!Number.isFinite(Number(d[k]))||Number(d[k])<0)){toast('取得前の履歴を確認してください');return null}obj[k]=d[k]===''?null:type==='number'?Number(d[k]):d[k]}
    if(d.batOn)obj.group=ensureGroup(E,d,model);
    if(id){Object.assign(E.aircraft.find(a=>a.id===id),obj);return id}
    Object.assign(obj,{id:uid('a'),dips:null,dead:false});E.aircraft.push(obj);return obj.id;
  },
  person(E,d,id){
    if(!d.name.trim()){toast('氏名を入れてください');return null}
    const obj={name:d.name.trim(),kana:d.kana,roles:d.roles.slice(),pilot:d.roles.includes('操縦者'),lic:d.lic,licNo:d.licNo,account:d.account,phone:d.phone,addr:d.addr||'',email:d.email||''};
    if(id){Object.assign(E.people.find(p=>p.id===id),obj);return id}
    const p=newPerson(obj.name,obj.roles,obj);E.people.push(p);return p.id;
  },
  permit(E,d,id){
    if(!d.no.trim()){toast('許可番号を入れてください');return null}
    const obj={no:d.no.trim(),label:d.label.trim()||'許可・承認',issued:dparse(d.issued),from:dparse(d.from),to:dparse(d.to),cat:d.cat,cover:d.cover.slice(),aircraft:d.aircraft.slice()};
    if(id){Object.assign(E.permits.find(p=>p.id===id),obj);return id}
    obj.id=uid('m');E.permits.push(obj);return obj.id;
  },
  insurance(E,d){
    if(!d.company.trim()){toast('保険会社名を入れてください');return null}
    E.insurance=Object.assign({},d);return 'insurance';
  },
  contact(E,d){
    if(!d.name.trim()){toast('氏名を入れてください');return null}
    E.contact=Object.assign({},d);return 'contact';
  },
  preset(E,d,id){
    if(!d.name.trim()){toast('現場の名前を入れてください');return null}
    if(!d.geom.done){toast('飛行範囲を作ってください（完了まで）');return null}
    const obj={name:d.name.trim(),geo:{kind:d.geom.kind,pts:d.geom.pts.map(p=>p.slice()),r:d.geom.r,width:d.geom.width||10},alt:d.alt===''?30:Number(d.alt),from:d.from,to:d.to,biz:d.biz.slice(),dur:[Number(d.durH)||0,Number(d.durM)||0]};
    if(id){Object.assign(E.presets.find(p=>p.id===id),obj);return id}
    obj.id=uid('pr');E.presets.push(obj);return obj.id;
  },
  bat(E,d,id){
    if(!d.label.trim()){toast('管理ラベルを入れてください');return null}
    if(!BAT_CHECKS.includes(d.check)){toast('状態を確認してください');return null}
    if(d.cycle!==''&&(!Number.isInteger(Number(d.cycle))||Number(d.cycle)<0)){toast('サイクル数を確認してください');return null}
    const gid=ensureGroup(E,d,d.model);
    const obj={label:d.label.trim(),model:d.model||'型式（未入力）',group:gid,source:d.source,cycle:d.cycle===''?null:Number(d.cycle),cycleAt:d.cycle===''?null:'今日',check:d.check,note:d.note};
    if(id){Object.assign(E.bats.find(b=>b.id===id),obj);return id}
    Object.assign(obj,{id:uid('b'),min:0,uses:0,lastDays:null,lastAc:null,hist:[{d:slash(TODAY),ac:null,min:0,cycle:obj.cycle,note:d.note,chk:d.check+'（取得時）'}]});E.bats.push(obj);return obj.id;
  }
};

/* ---------- 画面の登録 ---------- */
Object.keys(REG_TITLE).forEach(t=>{
  const m=REG_META[t];
  def('reg-'+t,{
    t:()=>REG_TITLE[t]+(A.reg&&A.reg.id?'を変更':'を登録'),
    st:()=>A.reg&&A.reg.ret?A.reg.ret.label+'の途中':'',
    goal:'登録して、'+REG_TITLE[t]+'の一覧（または元の操作）へ戻る。設定から事前に登録する経路と、途中でその場で登録する経路の、両方で同じ画面を使う。',
    doc:m.doc,state:m.state,tmp:m.tmp,ask:m.ask,ui:m.ui,
    body:()=>regBanner()+FORMS[t](),
    foot:()=>'<button class="btn" data-act="reg-cancel">キャンセル</button><button class="btn primary" data-act="reg-save">保存'+(A.reg&&A.reg.ret?'して戻る':'')+'</button>'
  });
});

Object.assign(ACTS,{
  'reg-open':t=>{
    const type=t.dataset.t;const o={id:t.dataset.id||null};
    if(t.dataset.from==='init')o.ret={label:'はじめの設定',apply:()=>{}};
    openReg(type,o);
  },
  'reg-cancel':()=>{const r=A.reg&&A.reg.ret;A.reg=null;back();if(r)toast('登録せずに戻りました')},
  'reg-save':()=>{
    if(!canWrite())return;
    const E=ENV();const id=SAVE[A.reg.type](E,A.reg.d,A.reg.id);if(!id)return;
    finishReg(id,A.reg.id?REG_TITLE[A.reg.type]+'を更新しました':null);
  },
  'reg-set':t=>{
    const d=A.reg.d;const k=t.dataset.k;let v=t.dataset.v;if(v==='true')v=true;else if(v==='false')v=false;d[k]=v;
    if(A.reg.type==='aircraft'&&k==='batOn'&&v){const E=ENV();if(!d.group)d.group=E.batGroups.length?E.batGroups[0].id:'__new'}
    render();
  },
  'reg-tog':t=>{const d=A.reg.d;const k=t.dataset.k,v=t.dataset.v;const i=d[k].indexOf(v);if(i>=0)d[k].splice(i,1);else d[k].push(v);render()},
  'reg-self':()=>{const d=A.reg.d;const E=ENV();const me=E.people.find(p=>p.id===E.meId);d.name=me?me.name:'';['kana','phone','addr','email'].forEach(k=>{if(me&&me[k])d[k]=me[k]});render();toast('自分の情報を入れました')},
  'person-leave':()=>openSheet(()=>'<h3>離任にしますか</h3><p>離任は、この人を、<b>この会社・団体（または個人）を離れた人</b>にすることです。人員を消すわけではなく、過去の飛行・点検・記録は残ります。これからの飛行の候補からは外れます。</p><p class="note">アプリで離任にしても、Google Driveの共有は、そのままです。共有が残っていると、Google Driveから見られることがあります。共有をやめるときは、Google Driveで設定してください。</p><div class="row"><button class="btn" data-act="close">やめる</button><button class="btn danger" data-act="person-leave-ok">離任にする</button></div>'),
  'person-leave-ok':()=>{const E=ENV();const p=E.people.find(x=>x.id===A.reg.id);if(p){p.active=false;p.left=slash(TODAY)}A.modal=null;A.reg=null;back();toast('離任にしました。過去の記録は残ります')},
  'person-rejoin':()=>{const E=ENV();const p=E.people.find(x=>x.id===A.reg.id);if(p){p.active=true;p.left=null}A.reg=null;back();toast('再び参加にしました。役割は、あらためて決めてください（以前の役割は自動では戻りません）')}
});
