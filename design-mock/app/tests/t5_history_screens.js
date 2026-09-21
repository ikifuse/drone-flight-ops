'use strict';
/* 飛行履歴・出力、と、全画面の表示の検査（画面一覧の全画面を、いくつもの状況で開いて、利用者向けの文字を検査する） */
suite('履歴・出力',H=>{
  const {T,act,txt,all,route,set,q,qa,A,E}=H;
  H.hash('scn=empty');
  T('履歴（空）: 案内と新規飛行への導線',()=>{act('go','[data-s=hist]');return route()==='hist'&&txt().includes('完了した飛行はまだありません')&&!!q('[data-act=nf-new]')});
  H.hash('scn=personal');
  T('履歴: 完了した飛行が並ぶ（内部のIDは見せない）',()=>{act('go','[data-s=hist]');return route()==='hist'&&qa('[data-act=hist-open]').length===3&&!/\bh\d{3}\b/.test(txt())&&!/flight_id/.test(txt())});
  T('検索: キーワード',()=>{set('[data-bind="#hq"]','河川敷','input');const n=qa('[data-act=hist-open]').length;set('[data-bind="#hq"]','','input');return n===1&&qa('[data-act=hist-open]').length===3});
  T('検索: 機体・操縦者・目的・期間',()=>{
    const cnt=()=>qa('[data-act=hist-open]').length;const res=[];
    set('[data-bind="#hAc"]','a2');res.push(cnt());set('[data-bind="#hAc"]','');set('[data-bind="#hPl"]','p2');res.push(cnt());set('[data-bind="#hPl"]','');
    set('[data-bind="#hPu"]','趣味');res.push(cnt());set('[data-bind="#hPu"]','');set('[data-bind="#hDays"]','30');res.push(cnt());set('[data-bind="#hDays"]','');
    return JSON.stringify(res)==='[1,1,1,2]'?true:JSON.stringify(res);
  });
  T('条件に合う飛行がないとき',()=>{set('[data-bind="#hq"]','存在しない','input');const ok=txt().includes('この条件に合う飛行はありません');set('[data-bind="#hq"]','','input');return ok});
  T('飛行を選ぶ→詳細（記録・出力の選び方・KML）。PDFは自動では作らない',()=>{act('hist-open');return route()==='hist-detail'&&txt().includes('飛行の記録')&&txt().includes('A4運航記録PDF')&&txt().includes('地図付きPDF')&&txt().includes('KML（My Maps用）')&&txt().includes('自動では作りません')});
  T('通報した内容を見る（22項目）',()=>{act('hist-dips');const n=qa('.sheet .rev').length;act('close');return n===22?true:'n='+n});
  T('A4だけ作る→PDFの画面（見本・Google Driveに保存）',()=>{act('out-make');return route()==='out-pdf'&&!!q('.paper.a4')&&!q('.mapdoc')&&txt().includes('Google Driveの「出力」フォルダーに保存しました')&&E().flights[0].outs.a4===true&&E().flights[0].outs.map===false});
  T('地図付きも選んで両方作る（地図を左上・通報項目を右と下）',()=>{act('back');const a=txt().includes('作成済み');act('out-both');act('out-make');return a&&route()==='out-pdf'&&!!q('.mapdoc')&&!!q('.paper.a4')&&E().flights[0].outs.map===true});
  T('出力後の行き先（端末に保存・印刷／個別に共有）',()=>!!q('[data-act=stub][data-t="端末に保存・印刷"]')&&!!q('[data-act=stub][data-t="個別に共有"]'));
  T('一覧に「作成済み」の印が出る',()=>{H.APP().root('home');act('go','[data-s=hist]');return txt().includes('A4 PDF作成済み')&&txt().includes('地図付きPDF作成済み')});
  T('通報しない飛行: 地図付きPDF・KMLは作らない',()=>{
    const id=E().flights.find(f=>f.snap.noDips).id;act('hist-open','[data-id="'+id+'"]');
    act('out-tog','[data-k=map]');const a4=A().ui.outSel.map===false;act('out-both');const both=A().ui.outSel.map===false&&A().ui.outSel.a4===true;
    act('out-kml-open');return a4&&both&&route()==='out-kml'&&txt().includes('この飛行にはKMLがありません');
  });
  T('KML: 保存済み。My Mapsの手順と、地図付きPDFへの案内（KMLの文字列は見せない）',()=>{
    H.APP().root('home');act('go','[data-s=hist]');act('hist-open','[data-id="'+E().flights.find(f=>!f.snap.noDips).id+'"]');act('out-kml-open');
    return txt().includes('保存しました')&&txt().includes('My Mapsで見る')&&txt().includes('地図付きPDF')&&!/<kml|<Placemark/.test(all());
  });
  T('KML: 未保存（オフライン）→保存できない。オンラインで保存',()=>{
    const f=E().flights.find(x=>x.id===A().ui.hSel);f.kml='pending';A().online=false;H.APP().render();
    const dis=q('[data-act=out-kml-save]').disabled&&txt().includes('まだGoogle Driveに保存されていません');A().online=true;H.APP().render();act('out-kml-save');return dis&&f.kml==='saved';
  });
  T('KMLから、人が読める地図付きPDFを作る',()=>{act('out-map-from-kml');return route()==='out-pdf'&&!!q('.mapdoc')});
  T('オフラインでPDFを作る→この端末で作成。Google Driveへは戻ってから',()=>{
    H.APP().root('home');act('go','[data-s=hist]');act('hist-open');A().online=false;H.APP().render();act('out-make');
    const ok=route()==='out-pdf'&&txt().includes('端末で作成しました')&&txt().includes('まだGoogle Driveに保存されていません');A().online=true;return ok;
  });
  T('Google Driveが閲覧のみ: 作成はできるが、Google Driveには保存されない',()=>{A().gAccess='view';H.APP().root('home');act('go','[data-s=hist]');act('hist-open');act('out-make');const ok=txt().includes('端末で作成しました');A().gAccess='edit';return ok});
});

suite('全画面の表示',H=>{
  const {T,route,q,A}=H;
  const map=()=>window.eval('SCREEN_MAP');
  const skip=['where'];
  /* 画面一覧の全画面を開き、開けること・題名と本文があること・利用者向けの文字に禁止語がないことを確かめる */
  function openAll(label){
    const bad=[];let n=0;const total=map().reduce((s,g)=>s+g[1].length,0)-skip.length;
    for(const g of map()){for(const s of g[1]){
      const id=s[0];if(skip.includes(id))continue;
      A().modal=null;
      try{window.gotoScreen(id)}catch(e){bad.push(id+' 例外 '+e.message);continue}
      n++;H.scan(label+' '+id);
      const b=q('#body');const base=id.split(':')[0];const r=route();
      if(q('.phone .mockbox,.phone .mockctl,.phone .mockbtn,.phone .mocktag,.phone .mockbar,.phone .mockov'))bad.push(id+' 確認用の部品が左側にある');
      if(!b||b.innerText.trim().length<5)bad.push(id+' 本文なし');
      else if(base==='nf'?r!=='nf':r!==base)bad.push(id+' 移動先='+r);
      if(!q('.hd .ttl')||!q('.hd .ttl').innerText.trim())bad.push(id+' 題名なし');
    }}
    if(bad.length)return label+': '+bad.join(' | ');
    return n===total?true:label+': '+n+'/'+total+'画面';
  }
  H.hash('scn=personal');
  T('全画面（個人・サンプルあり）',()=>openAll('個人'));
  H.hash('scn=company');
  T('全画面（会社・団体・サンプルあり）',()=>openAll('会社'));
  H.hash('scn=personal');
  T('全画面（オフライン）',()=>{A().online=false;const r=openAll('オフライン');A().online=true;return r});
  T('全画面（Google Driveが閲覧のみ）',()=>{A().gAccess='view';const r=openAll('閲覧のみ');A().gAccess='edit';return r});
  T('全画面（アプリからDIPSへ送信できない）',()=>{A().apiOk=false;const r=openAll('送信不可');A().apiOk=true;return r});
  T('使う場所の選択（どこで使いますか？）を開く',()=>{window.gotoScreen('where');return route()==='where'&&H.qa('[data-act=env-pick]').length===2});
  T('全画面: 右側の設計確認メモに、設計書上の位置づけが出る',()=>{
    H.hash('scn=company');const none=[];
    for(const g of map()){for(const s of g[1]){const id=s[0];if(id==='where'||id.indexOf('nf:')===0)continue;window.gotoScreen(id);const m=q('#memo');if(!m||!m.innerText.includes('設計Docs上'))none.push(id)}}
    return none.length===0?true:none.join(',');
  });
  /* 通報の結果・保存の結果など、状況で見え方が変わる画面 */
  T('通報の結果の全種類（正常・重複・結果不明・エラー・DIPS Webで確認）',()=>{
    H.hash('scn=personal');
    for(const k of ['clean','dup','unknown','err']){
      H.hash('scn=personal');window.gotoScreen('nf-send');A().modal=null;
      H.APP().ACTS['nf-result']({dataset:{k}});H.scan('通報の結果 '+k);
      if(route()!=='nf-accepted')return k+' route '+route();
    }
    window.gotoScreen('nf-manual-confirm');H.APP().ACTS['nf-mconf']({dataset:{v:'list'}});H.APP().ACTS['nf-mconf-ok']();H.scan('通報の結果 manual');
    return route()==='nf-accepted';
  });
  T('保存後の画面（オンライン・オフライン）',()=>{
    H.hash('scn=personal');window.gotoScreen('op-final');H.APP().ACTS['op-finalize']();H.scan('保存後 オンライン');const a=route()==='op-done';
    H.hash('scn=personal&online=0');window.gotoScreen('op-final');H.APP().ACTS['op-finalize']();H.scan('保存後 オフライン');
    return a&&route()==='op-done';
  });
  T('参加の確認（共有の状態3種）と、ログインできない場合の画面',()=>{
    H.hash('');window.gotoScreen('join2');for(const v of ['edit','view','none']){A().gAccess=v;H.APP().render();H.scan('参加 '+v)}A().gAccess='edit';
    window.gotoScreen('acct-none');H.scan('acct-none');window.gotoScreen('acct-exists');H.scan('acct-exists');
    window.gotoScreen('consent');A().ui.consentOk=false;H.APP().ACTS['consent-ok']();H.scan('許可しない');A().ui.consentOk=true;
    return true;
  });
});
