'use strict';
/* ===================================================================
   飛行履歴・出力 — 設計の出典: 34e（画面の10項目）／27e（KML）／27f（A4運航記録PDFと地図付きPDF）／35c（A4）／18 §6（オフラインPDF）
   過去の完了した飛行を、人が読める条件で探して選び、必要な出力（KML・PDF）へ進む。内部の flight_id は見せない。
   PDF・KMLは実際には作らない（見本の表示だけ）。出力した後の画面の予定を確かめるためのモック。
   =================================================================== */
const flightOf=id=>{const E=ENV();return E&&E.flights.find(f=>f.id===id)};
const fPlace=f=>(f.legs[0]&&f.legs[0].place)||f.snap.to||f.snap.from||'—';
const fMin=f=>f.legs.reduce((s,l)=>s+l.min,0);
const fPurpose=f=>[].concat(f.snap.biz,f.snap.non).filter(Boolean);
const KML_TXT={saved:'保存済み',pending:'まだGoogle Driveに保存されていません',none:'なし'};
function histList(){
  const E=ENV(),u=A.ui;let L=E.flights.slice().sort((a,b)=>b.date-a.date);
  if(u.hq)L=L.filter(f=>(f.label+' '+fPlace(f)).indexOf(u.hq)>=0);
  if(u.hAc)L=L.filter(f=>f.ac.includes(u.hAc));
  if(u.hPl)L=L.filter(f=>f.pl.includes(u.hPl));
  if(u.hPu)L=L.filter(f=>fPurpose(f).includes(u.hPu));
  if(u.hDays)L=L.filter(f=>daysTo(f.date)>=-Number(u.hDays));
  return L;
}
function histCards(){
  const E=ENV();const L=histList();
  if(!E.flights.length)return '<div class="empty"><b>完了した飛行はまだありません</b><br>飛行を終えて［保存する］と、ここに出ます。<br><button class="btn sm" style="margin-top:8px" data-act="nf-new">新規飛行へ</button></div>';
  if(!L.length)return '<div class="empty">この条件に合う飛行はありません</div>';
  return L.map(f=>'<button class="card" style="width:100%;margin-bottom:8px" data-act="hist-open" data-id="'+f.id+'"><b>'+esc(f.label)+'</b><span>'+slash(f.date)+' ／ 📍 '+esc(fPlace(f))+'</span><span>✈ '+f.ac.map(id=>esc(savedAcName(f,id))).join('・')+' ／ 👤 '+f.pl.map(id=>esc(savedPerson(f,id))).join('・')+'</span><span>飛行 '+f.legs.length+'回・'+fMin(f)+'分 ／ '+esc(fPurpose(f).join('・')||'—')+'</span><span class="chips">'+(f.synced?'':'<i class="chip warn">未保存</i>')+(pendingPdfs(f).length?'<i class="chip warn">PDFは端末で作成済み・Drive未保存</i>':'')+(f.outs.a4?'<i class="chip ok">A4 PDF作成済み</i>':'')+(f.outs.map?'<i class="chip ok">地図付きPDF作成済み</i>':'')+(f.snap.noDips?'<i class="chip">通報なし</i>':'')+'</span></button>').join('');
}
def('hist',{t:'飛行履歴・出力',st:'完了した過去の飛行を探す',
  goal:'完了済みの過去の飛行を、人が読める条件で探して選び、その飛行の正式記録に基づく出力へ進む。',
  doc:'34e §1・§2（飛行履歴・出力画面の10項目）。日付・機体・場所や飛行名・目的・操縦者などの人が読める条件で探す。［飛行リスト］（これから扱う計画）とは別の目的。検索・詳細の表示は、記録を更新しない。',state:'spec',
  tmp:['検索条件の全項目・初期値・並び順・結果の見せ方は未確定（PENDING-S7D-HISTORY-DETAIL）。ここでは期間・機体・操縦者・目的・キーワードを仮に並べている','1つの飛行が複数のA4や複数機体にまたがる場合の出力単位は未確定（PENDING-S7D-HISTORY-OUTPUT-UNIT）','オフラインでは、端末に取得済みのデータの範囲に限られる（cacheの鮮度は未確定）'],
  ask:[],
  ui:['検索条件の並べ方と、一覧の各行に出す情報の量は標準案'],
  body:()=>{
    const E=ENV(),u=A.ui;const purposes=[...new Set(E.flights.flatMap(fPurpose))];
    const opt=(v,l,cur)=>'<option value="'+esc(v)+'"'+(String(v)===String(cur||'')?' selected':'')+'>'+esc(l)+'</option>';
    return '<div class="sec"><h3>探す</h3><div class="row"><input class="in" data-bind="#hq" data-oninput="hist-q" placeholder="場所や飛行名" value="'+esc(u.hq||'')+'"></div>'
     +'<div class="row"><select class="in" data-bind="#hDays" data-rerender="1">'+opt('','期間: すべて',u.hDays)+opt('30','過去30日',u.hDays)+opt('90','過去90日',u.hDays)+'</select><select class="in" data-bind="#hAc" data-rerender="1">'+opt('','機体: すべて',u.hAc)+E.aircraft.map(a=>opt(a.id,a.name,u.hAc)).join('')+'</select></div>'
     +'<div class="row"><select class="in" data-bind="#hPl" data-rerender="1">'+opt('','操縦者: すべて',u.hPl)+[...new Set(E.flights.flatMap(f=>f.pl))].map(id=>{const f=E.flights.find(f=>f.pl.includes(id));return opt(id,savedPerson(f,id),u.hPl)}).join('')+'</select><select class="in" data-bind="#hPu" data-rerender="1">'+opt('','目的: すべて',u.hPu)+purposes.map(x=>opt(x,x,u.hPu)).join('')+'</select></div></div>'
     +'<div id="hres">'+histCards()+'</div>'
     +'<p class="note">'+(A.online?'':'オフラインです。この端末に取得済みの飛行だけを表示しています。')+'日付・機体・場所・目的・操縦者で探せます。</p>';
  }
});

def('hist-detail',{t:()=>{const f=flightOf(A.ui.hSel);return f?f.label:'飛行の詳細'},st:'飛行の詳細と、必要な出力',
  goal:'選んだ飛行の内容を確かめ、必要な出力（A4運航記録PDF・地図付きPDF・KML）だけを選んで作る。',
  doc:'34e §1（対象の飛行を選んだ後に、A4運航記録PDF・地図付きPDF・両方作成のように必要な出力を選ぶ方式は第一候補＝CURRENT-PROPOSAL）／27f §3（PDFは飛行完了時に自動で作らず、必要なときだけ生成する）／27e（KMLは通報時に作成・保存済み。ここで作り直さない）。',state:'proposal',
  tmp:['出力を選ぶ方式は第一候補であり、確定した仕様ではない','出力後の表示・共有・保存先の確認の遷移は未確定（34e 項目6）','履歴からKMLを取得するときの、保存済みKMLへの案内・未同期・未生成の扱い、再生成の可否は未確定（PENDING-S7D-HISTORY-KML）','通報しない飛行は通報内容・KMLがないため、地図付きPDFとKMLは出さない（仮。PENDING-S7C-KML-UNIT-MAPPING）'],
  ask:[],
  ui:['出力はチェックして作る形にし、作ったあとは同じ画面に結果を出している'],
  body:()=>{
    const f=flightOf(A.ui.hSel);if(!f)return '<div class="empty">飛行が見つかりません</div>';
    const s=f.snap;const nd=!!s.noDips;const sel=A.ui.outSel;
    return '<div class="sec"><h3>この飛行</h3><table class="kv"><tr><td>日付</td><td>'+slash(f.date)+'</td></tr><tr><td>場所</td><td>'+esc(fPlace(f))+'</td></tr><tr><td>目的</td><td>'+esc(fPurpose(f).join('・')||'—')+'</td></tr><tr><td>機体</td><td>'+f.ac.map(id=>{const a=savedAc(f,id);return esc(a?a.name+'（'+a.mark+'）':id)}).join('<br>')+'</td></tr><tr><td>操縦者</td><td>'+f.pl.map(id=>esc(savedPerson(f,id))).join('、')+'</td></tr><tr><td>飛行</td><td>'+f.legs.length+'回・合計'+fMin(f)+'分</td></tr><tr><td>保存</td><td>'+(f.synced?'Google Driveに保存済み':'<i class="chip warn">未保存</i> この端末には保存されています')+'</td></tr></table></div>'
     +'<div class="sec"><h3>飛行の記録</h3><table class="kv grid"><tr><th>#</th><th>機体</th><th>BAT</th><th>離陸→着陸</th><th>時間</th></tr>'+f.legs.map((l,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(savedAcName(f,l.ac||f.ac[0]))+'</td><td>'+esc(l.bat)+'</td><td>'+esc(l.off)+'→'+esc(l.on)+'</td><td>'+l.min+'分</td></tr>').join('')+'</table>'+(f.notes?'<p class="note">記事・不具合・処置: '+esc(f.notes)+'</p>':'')
     +(nd?'':'<div class="row"><button class="btn sm" data-act="hist-dips">通報した内容を見る</button></div>')+'</div>'
     +'<div class="sec"><h3>出力 <small>必要なものだけ作ります</small></h3>'
     +tgl('out-tog','data-k="a4"','A4運航記録PDF',sel.a4,false,f.outs.a4?'<i class="chip ok">作成済み</i>':'')
     +tgl('out-tog','data-k="map"','地図付きPDF（通報内容＋地図）',sel.map&&!nd,nd,f.outs.map?'<i class="chip ok">作成済み</i>':'')
     +'<div class="row"><button class="btn sm" data-act="out-both">両方選ぶ</button><button class="btn primary sm" data-act="out-make"'+((sel.a4||(sel.map&&!nd))?'':' disabled')+'>選んだPDFを作る</button></div>'
     +'<p class="note">PDFは、飛行が終わったときに自動では作りません。印刷・提出・保存が必要なときだけ作ります（不要なファイルが増えないように）。A4の飛行記録は、最後の保存で自動的に出来上がっており、Google Sheetsの標準の印刷・PDF化もできます。'+(nd?' 通報しない飛行は、通報内容がないため地図付きPDFは作りません。':'')+'</p></div>'
     +'<div class="sec"><h3>KML（My Maps用）</h3><table class="kv"><tr><td>状態</td><td>'+(nd?'<i class="chip">この飛行にはありません</i>':f.kml==='saved'?'<i class="chip ok">'+KML_TXT.saved+'</i>':'<i class="chip warn">'+KML_TXT.pending+'</i>')+'</td></tr></table><p class="note">KMLは、通報したときに作成します。Google Driveへの保存状況は上の状態で確認できます。飛行のあとに作り直しません。</p><div class="row"><button class="btn sm" data-act="out-kml-open">KMLについて見る</button></div></div>'
     +'<div class="row"><button class="btn" data-act="root" data-s="home">ホームに戻る</button></div>';
  }
});

/* ---------- 出力の見本（PDF・KMLは実際には作らない） ---------- */
function a4Preview(f){
  return f.ac.map(id=>{
    const ac=savedAc(f,id),legs=f.legs.filter(l=>(l.ac||f.ac[0])===id);
    const chunks=Array.from({length:Math.max(1,Math.ceil(legs.length/7))},(_,i)=>legs.slice(i*7,i*7+7));
    const checks=kind=>{
      const c=f.inspections?.[kind]?.[id],items=kind==='pre'?PRE_ITEMS:POST_ITEMS;
      return '<table><tr><th colspan="2">'+(kind==='pre'?'飛行前':'飛行後')+'点検</th></tr>'
       +'<tr><td colspan="2">'+esc(c?savedPerson(f,c.person)+' ／ '+slash(c.at)+' ／ '+c.place:'記録を確認してください')+'</td></tr>'
       +items.map((x,i)=>'<tr><td>'+esc(x.split('（')[0])+'</td><td>'+((f[kind]?.[id]||{})[i]===true?'☑':(f[kind]?.[id]||{})[i]===false?'異常あり':'未記録')+'</td></tr>').join('')+'</table>';
    };
    return chunks.map((ls,page)=>'<div class="paper a4"><h5>無人航空機の飛行記録・日常点検記録</h5>'
      +'<table><tr><td>対象機体</td><td>'+esc(ac?ac.model+' / '+ac.mark:'—')+'</td><td>実施年月日</td><td>'+slash(f.date)+'</td></tr>'
      +'<tr><td>飛行目的</td><td colspan="3">'+esc(fPurpose(f).join('・'))+'</td></tr></table>'
      +'<div class="two">'+checks('pre')+checks('post')+'</div>'
      +'<table><tr><th>#</th><th>操縦者／記録者</th><th>BAT</th><th>離陸場所→着陸場所</th><th>離陸→着陸</th><th>時間</th><th>安全に影響した事項</th></tr>'
      +Array.from({length:7},(_,i)=>{const l=ls[i];return '<tr><td>'+(page*7+i+1)+'</td>'+(l?'<td>'+esc(savedPerson(f,l.pilot||f.pl[0]))+' / '+esc(savedPerson(f,l.recorder||l.pilot||f.pl[0]))+'</td><td>'+esc(l.bat)+'</td><td>'+esc(l.takeoffPlace||'')+'→'+esc(l.place)+'</td><td>'+esc(l.off)+'→'+esc(l.on)+'</td><td>'+l.min+'分</td><td>'+esc(l.note)+'</td>':'<td colspan="6"></td>')+'</tr>'}).join('')+'</table>'
      +'<table><tr><th>記事・不具合・処置</th></tr><tr><td>'+esc([f.preNotes?.[id],f.notes].filter(Boolean).join(' ／ '))+'</td></tr></table></div>').join('');
  }).join('');
}
function mapPdfPreview(f){
  const s=f.snap;const key=[1,4,5,6,7,8,17,18,21];const rest=DIPS_ITEMS.filter(x=>!key.includes(x.n));
  const row=n=>'<tr><td>'+esc(DNAME(n))+'</td><td>'+valueOf(n,s)+'</td></tr>';
  return '<div class="paper"><h5>飛行計画（地図付き）</h5><div class="mapdoc"><div>'+mapSvg(s,'mini')+'</div><div><table>'+key.map(row).join('')+'</table></div><div class="rest"><table>'+rest.map(x=>row(x.n)).join('')+'</table></div></div></div>';
}
def('out-pdf',{t:'出力：PDF',st:()=>{const f=flightOf(A.ui.hSel);return f?f.label:''},
  goal:'PDFを作った結果と、次にできること（保存・印刷・共有）を確かめる。',
  doc:'27f（A4運航記録PDFと地図付きPDFの役割分離。地図付きPDFは、地図を主な視覚要素とし、その右側または下側などにDIPSの通報項目を置く方向。最終レイアウトは1飛行のテストで確定）／18 §6（オフラインでも端末でPDF生成は成立する条件つき。地図タイルがない場合は座標・半径の印字）。',state:'proposal',
  tmp:['この画面は、出力後の遷移が未確定（34e 項目6）であることを見せるための仮の作り','A4・地図付きPDFのプレビューは、レイアウトを確かめるための粗い表示（実際のA4の書式は最新実物に合わせる。地図付きPDFの詳細レイアウトは未確定 PENDING-S7D-MAPPDF-DETAIL。最終のレイアウトは、1飛行のテストで確定する）','補助者への共有は、その1飛行のPDFなどを個別に共有する方向（補助者に元台帳の権限は与えない・31b §4）'],
  ask:[],
  ui:['出力後はまず保存先を示し、その下に次の操作を並べている'],
  body:()=>{
    const f=flightOf(A.ui.hSel);const m=A.ui.outMade||{a4:true,map:false};
    const saved=f.outputPending?!['a4','map'].some(k=>m[k]&&f.outputPending[k]):!!m.saved&&A.online&&A.gAccess==='edit';
    return (saved?'<div class="msg ok big">✓ PDFを作成しました</div><div class="msg ok">Google Driveの「出力」フォルダーに保存しました。</div>':'<div class="msg warn big">端末で作成しました</div><div class="msg warn"><b>まだGoogle Driveに保存されていません</b>。'+esc(driveSaveMessage()||'［各種設定・管理］の［保存状態］から保存できます。')+'地図が取得できない場合は、座標と半径を文字で入れて作成します。</div>')
     +(m.a4?'<div class="sec"><h3>A4運航記録PDF <small>プレビュー</small></h3>'+a4Preview(f)+'</div>':'')
     +(m.map?'<div class="sec"><h3>地図付きPDF <small>プレビュー</small></h3>'+mapPdfPreview(f)+'<p class="note">地図を左上に、DIPSの通報項目を右側と下側に置く配置です。</p></div>':'')
     +'<div class="sec"><h3>次にできること</h3><div class="actbar"><button class="btn" data-act="stub" data-t="端末に保存・印刷" data-m="保存・印刷する内容は上のプレビューで確認できます。この画面からファイル保存・印刷は実行しません。">端末に保存・印刷</button><button class="btn" data-act="stub" data-t="個別に共有" data-m="必要な1飛行のPDFだけを渡します。共有先と公開範囲を確認してください。この画面から相手への送信は行いません。">個別に共有</button></div></div>';
  },
  foot:()=>'<button class="btn" data-act="back">飛行の詳細へ戻る</button><button class="btn primary" data-act="root" data-s="home">ホームへ</button>'
});
def('out-kml',{t:'出力：KML',st:()=>{const f=flightOf(A.ui.hSel);return f?f.label:''},
  goal:'保存済みのKMLの状態と、My Mapsで見る方法を案内する。KMLの文字列は見せない。',
  doc:'27e（KMLは飛行計画の通報時に作成・保存。通信断のときは端末に未同期で保持し、通信復帰時と最後の送信のときに再送。飛行後に作り直さない）／27c（My Mapsへ手動でインポートして重ねて見る。実機検証待ち）／34f PENDING-D-HUMAN-OUTPUT（KMLに保存した内容を、人が閲覧・印刷するときの復元。KMLの文字列を見せず、地図付きPDFで見る）。',state:'proposal',
  tmp:['ファイル名・保存階層の規則は未確定（27e §3・37 §4）','My Mapsでの見え方は実機検証待ち（27c）','共有時に氏名・機体登録記号などを出さない安全側の設定（27a §6）と、通報内容を同じ意味で保持することの合成は未確定（PENDING-S7C-KML-SHARE-PROJECTION）','履歴からKMLを取得するときの案内・再生成の可否は未確定（PENDING-S7D-HISTORY-KML）'],
  ask:['未同期のKMLを、あとから履歴からも保存し直せるようにするか（記録の復旧）'],
  ui:['KMLの取得は、この画面と地図付きPDFの両方に入口を置いている'],
  body:()=>{
    const f=flightOf(A.ui.hSel);const nd=!!f.snap.noDips;
    if(nd)return '<div class="empty"><b>この飛行にはKMLがありません</b><br>通報しない飛行では、KMLは作られません。</div>';
    return '<div class="filebox"><span class="fi">🗺</span><span><b>この飛行のKML</b></span></div>'
     +(f.kml==='saved'?'<div class="msg ok">通報したときに作成し、Google Driveの「出力」フォルダーに<b>保存しました</b>。作り直しは不要です。</div>':'<div class="msg warn"><b>まだGoogle Driveに保存されていません</b>。この端末には保存されています。'+esc(driveSaveMessage()||'もう一度保存できます。')+'<br><button class="btn sm" style="margin-top:6px" data-act="out-kml-save"'+(A.online&&A.gAccess==='edit'?'':' disabled')+'>もう一度保存する</button>'+(A.online?'':' <span class="note">（オフライン）</span>')+'</div>')
     +'<div class="sec"><h3>My Mapsで見る（手順）</h3><ol style="margin:0;padding-left:1.3em;font-size:13px"><li>Google Driveの「出力」フォルダーから、この飛行のKMLを開く（または取得する）</li><li>Google My Mapsで、新しい地図に「インポート」する</li><li>ほかの飛行のKMLも同じ地図に重ねて見られる</li></ol><p class="note">KMLは、飛行の記録そのものではなく、地図で見るためのファイルです。飛行前後の点検やBATの実績は入っていません。</p></div>'
     +'<div class="sec"><h3>人が読む形で見るには</h3><p class="lead" style="margin:0 0 8px">KMLの中身の文字列は、そのままでは読みにくいため、見せません。地図と通報内容を1枚にまとめた「地図付きPDF」で見られます。</p><button class="btn" data-act="out-map-from-kml">地図付きPDFを作る</button></div>';
  },
  foot:()=>'<button class="btn" data-act="back">飛行の詳細へ戻る</button>'
});

Object.assign(ACTS,{
  'hist-q':t=>{A.ui.hq=t.value;const r=$('#hres');if(r)r.innerHTML=histCards()},
  'hist-open':t=>{A.ui.hSel=t.dataset.id;A.ui.outSel={a4:true,map:false};nav('hist-detail')},
  'hist-dips':()=>{const f=flightOf(A.ui.hSel);openSheet(()=>'<h3>通報した内容</h3>'+DIPS_ITEMS.map(x=>'<div class="rev"><div class="k">'+esc(x.name)+'</div><div class="v">'+valueOf(x.n,f.snap)+'</div></div>').join('')+'<div class="row"><button class="btn" data-act="close">閉じる</button></div>')},
  'out-tog':t=>{const k=t.dataset.k;const f=flightOf(A.ui.hSel);if(k==='map'&&f.snap.noDips){toast('通報しない飛行は、地図付きPDFを作りません');return}A.ui.outSel[k]=!A.ui.outSel[k];render()},
  'out-both':()=>{const f=flightOf(A.ui.hSel);A.ui.outSel={a4:true,map:!f.snap.noDips};render()},
  'out-make':()=>{
    const f=flightOf(A.ui.hSel);const sel=A.ui.outSel;const m={a4:!!sel.a4,map:!!sel.map&&!f.snap.noDips,saved:A.online&&A.gAccess==='edit'};
    if(!m.a4&&!m.map){toast('作るPDFを選んでください');return}
    f.outputPending=f.outputPending||{};['a4','map'].forEach(k=>{if(m[k]){f.outs[k]=true;f.outputPending[k]=!m.saved}});A.ui.outMade=m;nav('out-pdf');
  },
  'out-kml-open':()=>nav('out-kml'),
  'out-kml-save':()=>{if(!canWrite())return;if(!A.online){toast(driveSaveMessage());return}const f=flightOf(A.ui.hSel);f.kml='saved';render();toast('KMLをGoogle Driveに保存しました')},
  'out-map-from-kml':()=>{const f=flightOf(A.ui.hSel);if(f.snap.noDips)return;f.outs.map=true;const saved=A.online&&A.gAccess==='edit';f.outputPending=Object.assign({},f.outputPending,{map:!saved});A.ui.outMade={a4:false,map:true,saved};rep('out-pdf')}
});
