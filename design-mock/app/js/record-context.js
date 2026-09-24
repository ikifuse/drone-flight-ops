'use strict';
/* モック専用の入力→確定値の接続。12b/12d/31c/35b/35d。
   本番schema・API validation・帳票の最終レイアウトは決定しない。 */
function planReady(){
  const missing=issues().filter(x=>x.lv==='ng');
  if(!missing.length)return true;
  if(A.route==='nf-send')back();
  nfGo('review');toast(missing[0].text);return false;
}
function recordMasters(acs,people){
  const select=(ids,find)=>Object.fromEntries([...new Set(ids)].map(id=>[id,clone(find(id)||{id,name:'—'})]));
  return {aircraft:select(acs,acOf),people:select(people,plOf)};
}
function actorSelect(bind,current,options){
  return '<select class="in" data-bind="~'+bind+'">'+options.map(p=>'<option value="'+esc(p.id)+'"'+(p.id===current?' selected':'')+'>'+esc(pnm(p))+'</option>').join('')+'</select>';
}
function operationActors(){
  const op=A.op,people=ENV().people.filter(p=>p.active!==false);
  return '<details class="sec actor-fields"><summary>担当者（変更するときだけ）</summary><label>操縦者</label>'+actorSelect('pilot',op.pilot,people.filter(p=>p.pilot))+'<label>記録者</label>'+actorSelect('recorder',op.recorder||'', [{id:'',name:'操縦者と同じ'},...people])+'<p class="note">記録者が別の人のときだけ変更してください。</p></details>';
}
function inspectionContext(kind,id){
  const op=A.op;op.inspections=op.inspections||{pre:{},post:{}};
  if(!op.inspections[kind][id])op.inspections[kind][id]={person:'',place:'',at:null};
  const ctx=op.inspections[kind][id],bind='inspections.'+kind+'.'+id;
  return '<details class="sec actor-fields"><summary>点検した人・場所（変更するときだけ）</summary><label>点検した人</label>'+actorSelect(bind+'.person',ctx.person,[{id:'',name:'操縦者と同じ'},...ENV().people.filter(p=>p.active!==false)])+'<label>点検場所</label><input class="in" data-bind="~'+bind+'.place" value="'+esc(ctx.place)+'" placeholder="空欄なら離着陸場所を使います"><p class="note">点検日時は完了時に記録します。</p></details>';
}
function stampInspection(kind,id){
  const op=A.op;inspectionContext(kind,id);const c=op.inspections[kind][id];
  if(!c.at)c.at=new Date().toISOString();
  if(!c.person)c.person=kind==='post'?(op.legs.filter(l=>l.ac===id).at(-1)?.pilot||op.pilot):op.pilot;
}
function finalRecordsReady(){
  return A.op.legs.length>0&&A.op.legs.every(l=>l.confirmed&&l.place.trim()&&Number.isFinite(l.min)&&l.min>0);
}
function savedAc(f,id){return (f.masters||f.snap?.masters)?.aircraft[id]||acOf(id)}
function savedAcName(f,id){return savedAc(f,id)?.name||'登録情報なし'}
function savedPerson(f,id){return (f.masters||f.snap?.masters)?.people[id]?.name||plName(id)}

/* 固定機体情報は設定から後補完する。現場の機体選択・交代では要求しない。 */
const AIRCRAFT_DETAILS=[['serial_number','製造番号'],['manufacturer','メーカー'],['aircraft_type','機体の種類'],['management_start_date','管理開始日','date'],['prior_minutes','取得前の飛行時間（分）','number'],['prior_count','取得前の飛行回数','number']];
function aircraftDetails(){
  const d=A.reg.d;
  if(A.reg.ret)return '';
  return '<details class="sec"><summary>固定情報・管理開始時の情報</summary><p class="note">確認できたものを登録してください。普段は登録記号で機体を選びます。取得前の履歴が分からない場合は空欄のままにします。</p>'+AIRCRAFT_DETAILS.map(([key,label,type])=>fRow(label,fIn(key,d[key]??'','あとから入力できます',type))).join('')+'</details>';
}
ACTS['maintenance-open']=t=>{
  const a=acOf(t.dataset.id);if(!a)return;
  openSheet(()=>'<h3>'+esc(a.name)+'の点検整備記録</h3><p>'+esc(a.model)+' ／ '+esc(a.mark)+'</p>'
    +'<p>Google Sheetsで「原本_点検整備記録」をコピーし、日付の名前を付けます。同じ日の2件目以降は末尾に _02、_03 を付けます。</p>'
    +'<p>実施年月日、点検・整備の理由と内容、必要な部品・処置、実施者を記入します。転記する人が実施者と違う場合は、実際に整備した人を残してください。</p>'
    +'<p>機体の固定情報は登録済みの情報を使います。製造番号: '+esc(a.serial_number||'機体の登録情報であとから補えます')+'</p>'
    +'<p>このアプリで記録した飛行時間: '+Number(a.managedMinutes||0)+'分（取得前の履歴を含む総飛行時間とは別です）。</p>'
    +'<button class="btn" data-act="close">閉じる</button>');
};
