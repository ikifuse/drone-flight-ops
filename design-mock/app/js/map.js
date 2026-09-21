'use strict';
/* ===================================================================
   地図の作図（架空の地図）— 新規飛行の「飛行範囲」と、現場プリセットの登録で共用
   作図の操作（点をタップ→完了・1点戻す・編集）は、このモックの仮の操作です。
   DIPS iPhone実機の作図操作は未確認のため、DIPSの操作の再現ではありません。
   =================================================================== */
const MO=()=>A.route==='reg-preset'&&A.reg?A.reg.d:S;   /* 作図の対象（geom と layer を持つオブジェクト） */
const newGeom=w=>({kind:null,pts:[],r:0,width:w||10,done:false,editing:false});

function mapBase(){
  return '<rect width="360" height="260" fill="#e8efe3"/>'
  +'<path d="M-10 70C80 90 140 40 230 120S340 180 380 170L380 215C330 225 250 170 200 165S60 130 -10 120Z" fill="#cfe4f3"/>'
  +'<g stroke="#fff" stroke-width="6" fill="none"><path d="M0 200H360M60 0V260M250 0V260M0 40H360"/></g>'
  +'<g fill="#d8d8d0"><rect x="70" y="205" width="40" height="30"/><rect x="120" y="210" width="50" height="25"/><rect x="262" y="50" width="45" height="40"/><rect x="262" y="205" width="60" height="35"/><rect x="8" y="50" width="40" height="35"/></g>'
  +'<text x="10" y="253" font-size="10" fill="#5b6b5b">地図（イメージ）</text><text x="196" y="106" font-size="10" fill="#4b7ea3">○○川</text><text x="268" y="46" font-size="10" fill="#555">○○公園</text>'
  +'<line x1="292" y1="240" x2="312" y2="240" stroke="#333" stroke-width="2"/><text x="292" y="236" font-size="9" fill="#333">100m</text>';
}
function mapLayers(o){
  const g=o.geom;let s='';
  if(o.layer)s+='<polygon points="30,30 210,20 230,150 40,160" fill="rgba(255,120,150,.28)" stroke="rgba(230,70,110,.6)" stroke-width="1.5"/><text x="40" y="48" font-size="10" fill="#c4234f">人口集中地区（DID）</text>';
  const col='#e07b00';
  if(g.kind==='polygon'&&g.pts.length){
    const p=g.pts.map(q=>q.join(',')).join(' ');
    if(g.done)s+='<polygon points="'+p+'" fill="rgba(255,150,0,.32)" stroke="'+col+'" stroke-width="2"/>';
    else s+='<polyline points="'+p+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-dasharray="5 3"/>';
  }
  if(g.kind==='line'&&g.pts.length){
    const p=g.pts.map(q=>q.join(',')).join(' ');const w=Math.max(2,2*g.width/M_PER_PX);
    if(g.pts.length>1)s+='<polyline points="'+p+'" fill="none" stroke="rgba(255,150,0,.35)" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"/>';
    s+='<polyline points="'+p+'" fill="none" stroke="'+col+'" stroke-width="2"'+(g.done?'':' stroke-dasharray="5 3"')+'/>';
  }
  if(g.kind==='circle'&&g.pts.length){
    const c=g.pts[0];if(g.r)s+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+g.r+'" fill="rgba(255,150,0,.32)" stroke="'+col+'" stroke-width="2"/>';
    s+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="3" fill="'+col+'"/>';
  }
  g.pts.forEach(q=>{if(g.kind!=='circle')s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="3.5" fill="#fff" stroke="'+col+'" stroke-width="2"/>'});
  if(g.editing&&g.done){
    if(g.kind==='circle'){const c=g.pts[0];s+='<circle data-h="0" cx="'+c[0]+'" cy="'+c[1]+'" r="8" fill="#fff" stroke="#1f5fbf" stroke-width="3"/><circle data-h="r" cx="'+(c[0]+g.r)+'" cy="'+c[1]+'" r="8" fill="#1f5fbf" stroke="#fff" stroke-width="2"/>'}
    else g.pts.forEach((q,i)=>{s+='<circle data-h="'+i+'" cx="'+q[0]+'" cy="'+q[1]+'" r="8" fill="#fff" stroke="#1f5fbf" stroke-width="3"/>'});
  }
  return s;
}
/* 読み取り専用の小さい地図（確認・PDF見本用）。geomだけでも描ける */
function mapSvg(o,mini){return '<svg id="'+(mini?'mapmini':'map')+'" viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">'+mapBase()+'<g id="'+(mini?'mapgm':'mapg')+'">'+mapLayers(o)+'</g></svg>'}
function geomSummary(o){
  const g=o.geom;if(!g.kind)return '未作成';
  if(g.kind==='circle'){if(!g.pts.length)return '円: 中心を置いてください';if(!g.r)return '円: 中心のみ（外周をタップ）';return '円: 半径 約'+Math.round(g.r*M_PER_PX/10)*10+'m'}
  if(g.kind==='polygon'){const n=g.pts.length;if(!g.done)return '多角形: '+n+'点（作図中）';let a=0;for(let i=0;i<n;i++){const p=g.pts[i],q=g.pts[(i+1)%n];a+=p[0]*q[1]-q[0]*p[1]}a=Math.abs(a)/2*M_PER_PX*M_PER_PX;return '多角形: '+n+'点・面積 約'+(a/10000).toFixed(1)+'ha'}
  const n=g.pts.length;if(!g.done)return '線＋幅: '+n+'点（作図中）';let L=0;for(let i=1;i<n;i++)L+=Math.hypot(g.pts[i][0]-g.pts[i-1][0],g.pts[i][1]-g.pts[i-1][1]);return '線＋幅: '+n+'点・長さ 約'+Math.round(L*M_PER_PX)+'m・半径'+g.width+'m';
}
function geomHint(o){
  const g=o.geom;
  if(!g.kind)return '① 上の図形（多角形／円／線＋幅）を選びます。② 地図をタップして点を置きます。';
  if(g.done)return '作図できました。「編集」で点をドラッグして直せます。';
  if(g.kind==='polygon')return '地図をタップして頂点を置きます（3点以上で「完了」）。'+g.pts.length+'点';
  if(g.kind==='line')return '地図をタップして経路の点を置きます（2点以上で「完了」）。半径を選べます。'+g.pts.length+'点';
  return g.pts.length?'次に円の外周をタップします（半径が決まります）。':'円の中心をタップします。';
}
/* 作図の部品一式。o = {geom, layer, search, to}（新規飛行の状態 S、または現場プリセットの下書き） */
function mapEditor(o){
  const bp=o===S?'':'@d.';const g=o.geom;
  const tools=[['polygon','▱ 多角形'],['circle','○ 円'],['line','⌇ 線＋幅']].map(([k,l])=>'<button class="tool'+(g.kind===k?' on':'')+'" data-act="tool" data-k="'+k+'">'+l+'</button>').join('')
   +(g.kind==='line'?'<label class="note">半径 <select class="in" data-bind="'+bp+'geom.width" data-num="1" data-rerender="1">'+RADII.map(r=>'<option value="'+r+'"'+(g.width===r?' selected':'')+'>'+r+'m</option>').join('')+'</select></label>':'');
  const can=(g.kind==='polygon'&&g.pts.length>=3||g.kind==='line'&&g.pts.length>=2)&&!g.done;
  return '<div class="row"><input class="in" id="searchbox" data-keepfocus="1" data-bind="'+bp+'search" data-oninput="map-search" placeholder="場所を検索" value="'+esc(o.search||'')+'"></div><div id="sr">'+searchResults(o)+'</div>'
   +'<div class="tab">'+tools+'</div>'
   +'<div class="mapwrap">'+mapSvg(o)+'<div class="maptop"><button class="'+(o.layer?'on':'')+'" data-act="layer">規制空域 '+(o.layer?'表示中':'非表示')+'</button><button data-act="stub" data-t="背景の切り替え" data-m="背景地図の切り替えは、準備中です。">背景</button></div></div>'
   +'<div class="mapbar"><button class="btn sm" data-act="geom-done"'+(can?'':' disabled')+'>完了</button><button class="btn sm" data-act="geom-undo"'+((g.pts.length&&!g.done)||(g.kind==='circle'&&g.done)?'':' disabled')+'>1点戻す</button><button class="btn sm" data-act="geom-clear"'+(g.kind?'':' disabled')+'>やり直す</button><button class="btn sm" data-act="geom-edit"'+(g.done?'':' disabled')+'>'+(g.editing?'編集を終える':'編集')+'</button><button class="btn sm" data-act="geom-del"'+(g.done?'':' disabled')+'>削除</button></div>'
   +'<p class="note">'+geomHint(o)+'</p><div class="msg info">'+esc(geomSummary(o))+'</div>'
   +'<p class="note">地図をタップして点を置きます。範囲は、今回実際に飛ぶ経路に合わせて、必要なところだけに絞ってください。</p>';
}
function searchResults(o){
  const q=o.search||'';if(!q)return '';
  return FAKE_PLACES.filter(p=>p.indexOf(q)>=0).map(p=>'<button class="tgl" data-act="pick-place" data-v="'+esc(p)+'"><span>'+esc(p)+'</span></button>').join('');
}

/* ---------- 地図の操作 ---------- */
function mapTap(x,y){
  const o=MO();if(!o)return;const g=o.geom;
  if(g.editing)return;
  if(!g.kind){toast('先に図形の種類（多角形／円／線＋幅）を選んでください');return}
  if(g.done){toast('作図済みです。「やり直す」か「削除」で作り直せます');return}
  if(g.kind==='circle'){
    if(!g.pts.length){g.pts=[[x,y]]}
    else{g.r=Math.max(8,Math.round(Math.hypot(x-g.pts[0][0],y-g.pts[0][1])));g.done=true;if(o.auto)delete o.auto.area}
  }else g.pts.push([x,y]);
  render();
}
let DRAG=null;
function svgPoint(svg,e){const r=svg.getBoundingClientRect();return [Math.round((e.clientX-r.left)/r.width*360),Math.round((e.clientY-r.top)/r.height*260)]}
document.addEventListener('pointermove',e=>{
  if(!DRAG||!A)return;const svg=$('#map');if(!svg)return;const o=MO();const [x,y]=svgPoint(svg,e);const g=o.geom;
  if(g.kind==='circle'){if(DRAG==='r')g.r=Math.max(8,Math.round(Math.hypot(x-g.pts[0][0],y-g.pts[0][1])));else g.pts[0]=[x,y]}
  else g.pts[Number(DRAG)]=[x,y];
  const gm=$('#mapg');if(gm)gm.innerHTML=mapLayers(o);
});
document.addEventListener('pointerup',()=>{if(DRAG){DRAG=null;render()}});
document.addEventListener('pointerdown',e=>{if(!A)return;const h=e.target.closest&&e.target.closest('[data-h]');const o=MO();if(h&&o&&o.geom.editing){DRAG=h.dataset.h;e.preventDefault()}});

Object.assign(ACTS,{
  'tool':t=>{const o=MO();const k=t.dataset.k;if(o.geom.kind!==k){o.geom={kind:k,pts:[],r:0,width:o.geom.width||10,done:false,editing:false}}render()},
  'geom-done':()=>{const o=MO();const g=o.geom;if((g.kind==='polygon'&&g.pts.length>=3)||(g.kind==='line'&&g.pts.length>=2)){g.done=true;if(o.auto)delete o.auto.area;render()}},
  'geom-undo':()=>{const g=MO().geom;if(g.kind==='circle'&&g.done){g.done=false;g.r=0}else g.pts.pop();render()},
  'geom-clear':()=>{const o=MO();o.geom={kind:o.geom.kind,pts:[],r:0,width:o.geom.width||10,done:false,editing:false};render()},
  'geom-edit':()=>{const g=MO().geom;g.editing=!g.editing;render()},
  'geom-del':()=>openSheet(()=>'<h3>図形を削除しますか</h3><p>作った飛行範囲を削除します。</p><div class="row"><button class="btn" data-act="close">キャンセル</button><button class="btn primary" data-act="del-ok">削除する</button></div>'),
  'del-ok':()=>{MO().geom=newGeom();A.modal=null;render()},
  'layer':()=>{const o=MO();o.layer=!o.layer;render()},
  'map-search':t=>{const o=MO();o.search=t.value;const r=$('#sr');if(r)r.innerHTML=searchResults(o)},
  'pick-place':t=>{const o=MO();o.to=t.dataset.v;o.search='';toast('目的地に入れました');render()}
});
