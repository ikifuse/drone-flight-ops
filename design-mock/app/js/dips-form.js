'use strict';
/* 26・25bの既存観測と今回のオーナー指示を反映する設計確認用の入力ビュー。
   既存のアプリ別まとめ案と状態を共有する。公式項目順とモバイルの選択操作が責務。
   DIPSの実通信・認証・未確認の地図操作は実装しない。 */
function dipsMemo(){
  return '<h4>基準と現在案</h4><p>A. DIPS iPhone実画面が基準。22項目の名称・順序はdata.js、26 §1.3のスマホ系列と25bを参照。PCの左右分割は採らない。</p><p>C. ワンエビ™️のスマホUIを参考：押しやすい操作、placeholder、選択済み表示、次の操作を明示。ブランド・色・固有デザインは複製しない。</p><p>D. 新アプリで必要な接続画面：始め方、地図への移動、内容確認、通報直前。E. 未決・比較中：PENDING-D-NEW-FLIGHT-SCREENS。右側で「アプリでまとめた案」に切り替え可能。完成仕様ではない。</p>'
   +'<h4>選択画面の根拠と比較</h4><p>26 §2.1・2.2・2.10／25bの登録済み一覧から選択して元へ反映する構造。全画面型selectorは新アプリの比較候補。DIPS iPhoneのピクセル単位の再現ではない。sheet／modalとの比較・オーナー確認待ち。</p>'
   +'<h4>地図：確認範囲を分離</h4><ul><li>DIPSで確認済み：3図形・編集・削除の観測記録（26 §2.7）。スマホとPCの系列が特定されていない操作はスマホ確認済みとはしない。</li><li>新アプリの仮操作：22項目の後に独立した大きな地図を開く、点をタップ、完了、1点戻す。架空の背景と座標。</li><li>未確認：正確なタップ数、円の中心決定、線＋幅、保存経路再利用（PENDING-S7A-DRAW-OPERATION／PENDING-WEB-05〜07）。地図の入口位置もオーナー確認待ち。</li></ul>'
   +'<h4>仮データ</h4><p>登録記号・許可番号・連絡先・計画IDは設計確認用の仮データ。実在の登録情報ではない。</p>';
}
function dipsInput(key,type,placeholder,extra){
  const v=key.split('.').reduce((o,k)=>o[k],S);
  return '<input class="in" data-bind="'+key+'" type="'+(type||'text')+'" value="'+esc(v)+'" placeholder="'+esc(placeholder||'')+'" '+(extra||'')+'>';
}
function dipsField(n){
  const choice=(act,values,selected,attrs)=>'<div class="dips-choices">'+values.map((v,i)=>tgl(act,attrs?attrs(v,i):'data-v="'+esc(v)+'"',v,selected(v,i))).join('')+'</div>';
  const duration=(h,m)=>'<div class="row">'+sel(h,durHOpts,S[h],'data-rerender="1"')+sel(m,minOpts,S[m],'data-rerender="1"')+'</div>';
  switch(n){
    case 1:return dipsInput('planName','text','飛行計画名称');
    case 2:case 4:case 5:return '<button class="btn select-open" data-act="dips-picker" data-n="'+n+'">登録済み一覧から選ぶ</button><div class="selected-summary">'+valueOf(n)+'</div>';
    case 3:return '<select class="in" data-bind="savedRoute"><option value="">なし</option></select>';
    case 6:return '<div class="grp">業務</div>'+choice('tog-purpose',BIZ,v=>S.biz.includes(v),v=>'data-g="biz" data-v="'+esc(v)+'"')+(S.biz.includes('その他')?dipsInput('otherBiz','text','その他の内容'):'')+'<div class="grp">業務以外</div>'+choice('tog-purpose',NON,v=>S.non.includes(v),v=>'data-g="non" data-v="'+esc(v)+'"')+(S.non.includes('その他')?dipsInput('otherNon','text','その他の内容'):'');
    case 7:return choice('tog-air',AIR,v=>S.air.includes(v));
    case 8:return choice('tog-met',MET,v=>S.met.includes(v));
    case 9:return vMaster('insurance');
    case 10:return choice('tog-tsu',TSU,(_,i)=>S.tsu[i],(_,i)=>'data-i="'+i+'"');
    case 11:return '<div class="pills">'+pill('tether','data-v="yes"','はい',S.tether==='yes')+pill('tether','data-v="no"','いいえ',S.tether==='no')+'</div>';
    case 12:return dipsInput('assist','number','','min="0" data-num="1"')+' 人';
    case 13:return dipsInput('from','text','例：事務所');
    case 14:return dipsInput('to','text','例：河川敷');
    case 15:return duration('maxH','maxM');
    case 16:return duration('durH','durM');
    case 17:return '<div class="row">'+dipsInput('startDate','date','','data-rerender="1"')+sel('startH',hourOpts,S.startH,'data-rerender="1"')+sel('startM',minOpts,S.startM,'data-rerender="1"')+'</div>';
    case 18:return '<output>'+esc(fmtDT(endDT(),startDT()))+'</output><p class="note">開始日時と所要時間から自動計算</p>';
    case 19:return '<button class="btn" data-act="cal">カレンダーで日を選ぶ</button><p>'+valueOf(19)+'</p>';
    case 20:return dipsInput('speed','number','','min="1" data-num="1"')+' km/h';
    case 21:return dipsInput('alt','number','','min="1" data-num="1"')+' m';
    case 22:return vMaster('contact');
  }
}
function vDips(){return '<div class="dips-form">'+DIPS_ITEMS.map(x=>'<section class="dips-field" data-dips-item="'+x.n+'"><h3>'+esc(x.name)+'</h3>'+dipsField(x.n)+'</section>').join('')+'</div>'}
function vDipsMap(){return '<div class="dips-map"><h3>飛行範囲</h3>'+mapEditor(S)+'<p>'+esc(geomSummary(S))+'</p><button class="btn" data-act="nf-save-preset"'+(S.geom.done?'':' disabled')+'>この範囲を現場プリセットとして保存</button></div>'}

function dipsPickerHtml(){
  const d=A.ui.dipsPick,n=d.n,E=ENV();
  const list=n===4?E.aircraft:n===5?E.people.filter(p=>p.active!==false):E.permits;
  const rows=list.map(x=>{
    const disabled=n===4?x.dead:n===5?!x.pilot:daysTo(x.to)<0;
    const on=n===2?d.selected===x.id:d.selected.includes(x.id);
    const name=n===2?x.label:x.name;
    const detail=n===4?x.mark+' ／ '+x.model+' ／ '+x.cert:n===5?(x.lic||'未発行')+' ／ '+(x.link?x.link.map(acName).join('・'):'登録機体全般'):x.no+' ／ '+slash(x.issued)+' ／ '+slash(x.from)+'〜'+slash(x.to)+' ／ カテゴリー'+x.cat;
    return '<button class="tgl'+(on?' sel':'')+'" data-act="dips-pick" data-id="'+x.id+'"'+(disabled?' disabled':'')+'><span class="box">'+(on?'✓':'')+'</span><span><b>'+esc(name)+'</b><br><small>'+esc(detail)+'</small>'+(disabled?'<br><small>選択できません</small>':'')+'</span></button>';
  }).join('');
  const type=n===4?'aircraft':n===5?'person':'permit';
  return '<h3>'+DNAME(n)+'</h3><p>登録済み一覧から選んでください。</p>'+(rows||'<p>登録された情報がありません。</p>')+(n===2?'<button class="tgl" data-act="dips-pick" data-id="none">'+(d.selected==='none'?'✓ ':'')+'許可・承認なし</button>':'')+'<button class="btn" data-act="nf-reg" data-t="'+type+'">ここで登録する</button><div class="selector-footer"><button class="btn" data-act="close">キャンセル</button><button class="btn primary" data-act="dips-pick-done">選択して戻る</button></div>';
}
Object.assign(ACTS,{
  'dips-picker':t=>{const n=Number(t.dataset.n);A.ui.dipsPick={n,selected:n===2?S.permit:(n===4?S.aircraft:S.pilots).slice()};openSheet(dipsPickerHtml,'selector')},
  'dips-pick':t=>{const d=A.ui.dipsPick,id=t.dataset.id;if(d.n===2)d.selected=id;else{const i=d.selected.indexOf(id);if(i<0)d.selected.push(id);else d.selected.splice(i,1)}render()},
  'dips-pick-done':()=>{const d=A.ui.dipsPick;S[d.n===2?'permit':d.n===4?'aircraft':'pilots']=d.selected;A.modal=null;A.ui.dipsPick=null;render()}
});
