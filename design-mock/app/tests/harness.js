'use strict';
/* ===================================================================
   設計確認モックの自動検査の土台（本番のアプリの検査ではありません）
   - モックと同じページの中で、実際にボタンを押して確かめる
   - 合格 = true / undefined / 文字列以外の真の値。文字列（失敗の理由）・false・0・null・例外は不合格
   - 操作のたびに、左側の利用者画面（.phone）を検査する。文字に禁止語がないこと、確認用の部品（設計確認メモ・状態切替・注記）が左側に入っていないことを確かめる
   - 右側の設計確認メモ・アプリの枠の外の帯・設計確認用のシートは、文字の検査の対象外
   =================================================================== */
(function(){
  const R=[],ERR=[],VIOL=[];let SCANS=0;
  window.addEventListener('error',e=>ERR.push(e.message+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));

  /* 利用者向けの画面に出してはいけない言葉（内部の概念名・技術用語・設計書の番号・設計状態のラベルなど） */
  const BAN=[
    /OperationalEnvironment/i,/EnvironmentMembership/i,/MembershipRoles/i,/GoogleIdentity/i,/UserAccount/i,/\bPersonnel\b/,
    /\broot\b/i,/正本/,/\bcache\b/i,/SyncQueue/i,/ManualDipsAdapter/i,/\bpayload\b/i,/snapshot/i,/\bFSM\b/,/FlightLeg/,/\bMission\b/,/\bschema\b/i,/\bUUID\b/i,/IndexedDB/i,
    /PENDING/,/VERIFY/,/CURRENT-/,/HISTORICAL/,
    /§/,/\b(?:1[0-9]|2[0-9]|3[0-9])[a-h]\b/,
    /（\s*0[1-7]\s*）/,/(?<![A-Za-z0-9:-])0[1-7]\s*(?:人員|機体|バッテリー|運航記録|点検整備記録|DIPS関連|出力)/,
    /運用環境/,/環境(?!調査)/,
    /Network Error/,/Sync Error/,/Unsupported State/,/Data Corruption/,
    /モック/,/仮/,/案/,/サンプル/,/sample|test|dummy/i,/テスト用/,/example\.invalid/,/見本/,/未確定|未設計/,/未決/,/設計/,/ダミー/,/確認用/,
    /人物/,/紐付/,/アプリ管理者/,/\bManual\b/,/\bOptional\b/,
    /同期/,/反映/,/保護/,/台帳/,/作業リスト/,/DIPS対象外/
  ];
  /* 左側（アプリの枠）に入れてはいけない、確認用の部品 */
  const LEFT_MOCK='.mockonly,.mockctl,.mockbox,.mockbtn,.mocktag,.mockpanel,.mockbar,.mockov,.memo,.memohead,[data-act=map],[data-act=memo],[data-act=mclose]';
  function leftText(){
    let t='';const ph=document.querySelector('.phone');
    if(ph){
      // textContentに加え、属性ではなく現在のDOMプロパティを検査する。
      const c=ph.cloneNode(true);
      c.querySelectorAll('input,textarea,select').forEach(e=>e.remove());
      t+=c.textContent+' ';
      ph.querySelectorAll('input,textarea,select').forEach(e=>{
        if(e.type==='hidden'||!e.getClientRects().length)return;
        if(e.tagName==='SELECT')t+=Array.from(e.selectedOptions).map(o=>o.textContent).join(' ')+' ';
        else t+=e.value+' ';
      });
      ph.querySelectorAll('[title]').forEach(e=>{t+=e.title+' '});
      // placeholderは入力例。登録済みの値とは区別し、禁止語検査から除外する。
    }
    document.querySelectorAll('.toast:not(.mock)').forEach(e=>{t+=e.textContent+' '});
    return t;
  }
  function scan(ctx){
    SCANS++;const t=leftText();
    const ph0=document.querySelector('.phone');
    if(ph0){const bad=ph0.querySelector(LEFT_MOCK);if(bad)VIOL.push({ctx,term:'確認用の部品が左側にある',around:(bad.className||bad.tagName)+' '+(bad.getAttribute('data-act')||'')+' '+bad.textContent.slice(0,30)})}
    for(const re of BAN){const m=re.exec(t);if(m)VIOL.push({ctx,term:m[0],around:t.slice(Math.max(0,m.index-24),m.index+m[0].length+24).replace(/\s+/g,' ')})}
  }

  const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));
  const H={
    T:null,q,qa,$:q,$$:qa,scan,leftText,VIOL,ERR, banned:t=>BAN.some(re=>re.test(t)),
    APP:()=>window.APP,A:()=>window.APP.state(),S:()=>window.APP.nf(),
    E:()=>{const A=window.APP.state();return A.envs.find(e=>e.id===A.cur)},
    act:(n,attr)=>{const e=q('[data-act="'+n+'"]'+(attr||''));if(!e)throw new Error('no act '+n+(attr||''));e.click();scan('操作 '+n+(attr||''))},
    txt:()=>{const b=q('#body');return b?b.innerText:''},
    all:()=>{const p=q('.phone');return p?p.innerText:''},
    route:()=>window.APP.state().route,
    set:(sel,v,ev)=>{const e=q(sel);if(!e)throw new Error('no '+sel);e.value=v;e.dispatchEvent(new Event(ev||'change',{bubbles:true}));scan('入力 '+sel)},
    hash:h=>{location.hash=h;window.APP.init();scan('起動 '+h)},
    /* 画面の文字を確認するために、いま表示中の左側の文字を返す */
    left:leftText,
    /* 左側（アプリの枠の中）の要素だけを操作する。完全な初回利用者が、左側だけを見て進めるかを確かめるため */
    actL:(n,attr)=>{const e=q('.phone [data-act="'+n+'"]'+(attr||''));if(!e)throw new Error('左側に無い操作: '+n+(attr||''));e.click();scan('左側の操作 '+n+(attr||''))},
    setL:(sel,v,ev)=>{const e=q('.phone '+sel);if(!e)throw new Error('左側に無い入力欄: '+sel);e.value=v;e.dispatchEvent(new Event(ev||'input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));scan('左側の入力 '+sel)},
    memo:()=>{const m=q('#memo');return m?m.innerText:''}
  };
  window.H=H;

  const SUITES=[];window.SUITES=SUITES;
  window.suite=(name,fn)=>SUITES.push({name,fn});

  function record(name,fn){
    try{const v=fn();const ok=(v===true||v===undefined)||(typeof v!=='string'&&!!v);R.push({name,ok,detail:ok?'':String(v)})}
    catch(e){R.push({name,ok:false,detail:'EXC '+(e&&e.message)+' @'+((e&&e.stack)||'').split('\n')[1]})}
  }
  H.T=record;

  window.runAll=function(){
    const log=document.getElementById('log'),sum=document.getElementById('summary');
    for(const s of SUITES){
      const start=R.length;
      try{s.fn(H)}catch(e){R.push({name:s.name+'（実行できませんでした）',ok:false,detail:'EXC '+e.message})}
      R.slice(start).forEach(r=>{r.suite=s.name});
    }
    record('利用者向けの画面に、内部の用語・設計書の番号・設計状態のラベルが出ていない（全操作を検査: '+SCANS+'回）',()=>{
      if(!VIOL.length)return true;
      const seen={};VIOL.forEach(v=>{const k=v.term+'|'+v.ctx;if(!seen[k])seen[k]=v});
      return Object.values(seen).slice(0,12).map(v=>'「'+v.term+'」 @'+v.ctx+' …'+v.around+'…').join(' ／ ');
    });
    record('JSエラーがない',()=>ERR.length===0?true:ERR.join(' | '));
    const failed=R.filter(r=>!r.ok);
    if(sum){sum.className=failed.length?'ng':'ok';sum.textContent=(failed.length?'不合格: ':'合格: ')+R.length+'項目中 '+(R.length-failed.length)+'項目が合格'+(failed.length?'、'+failed.length+'項目が不合格':'')}
    if(log)log.innerHTML=R.map(r=>'<li class="'+(r.ok?'ok':'ng')+'">'+(r.ok?'✓ ':'✕ ')+(r.suite?'['+r.suite+'] ':'')+r.name+(r.ok?'':' — '+(r.detail||'').replace(/</g,'&lt;'))+'</li>').join('');
    const res=document.getElementById('result');
    if(res)res.textContent='RESULT_JSON:'+JSON.stringify({total:R.length,failed:failed.map(r=>({name:r.name,detail:r.detail,suite:r.suite})),errors:ERR,violations:VIOL.length,scans:SCANS,violList:(function(){const seen={},out=[];VIOL.forEach(v=>{const k=v.term+'|'+v.around;if(!seen[k]){seen[k]=1;out.push(v)}});return out.slice(0,300)})()});
    document.title=(failed.length?'不合格 ':'合格 ')+document.title;
  };
})();
