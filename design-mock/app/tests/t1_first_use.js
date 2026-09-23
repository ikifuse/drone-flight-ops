'use strict';
/* 初回導線。左側（アプリの画面）だけを見て、完全な初回利用者が最後まで進めるかを確かめる。
   Googleのアカウント選択は、独立した画面ではなく「うすいシート」として重なるだけなので、
   route()はそのまま（init-reg／home など）で、シートの有無は q('.phone .sheet') で確かめる（2026-09-23改訂）。
   右側（設計確認）の切替は、状態を変えて試すときだけ使う。 */
suite('はじめて使う（左側だけで進める）',H=>{
  const {T,act,actL,setL,txt,route,q,qa,A,E,all,memo}=H;
  const start=()=>H.hash('');
  const toast=()=>qa('.toast:not(.mock)').map(t=>t.textContent).join(' ');
  const dummyId='1234567890',dummyPw='Abc-123-xyz';
  const sheetText=()=>{const s=q('.phone .sheet');return s?s.textContent:''};

  /* ---- 完全な初回利用者: 左側の操作だけで、ホームまで ---- */
  start();
  T('初回起動は未認証のまま「はじめの登録」を直接表示',()=>route()==='init-reg'&&q('.ttl').textContent.includes('はじめの登録')&&!A().account&&txt().includes('未選択'));
  T('利用登録を始める／ログインの入口が左画面にない',()=>!qa('.phone button').some(b=>/利用登録を始める|ログイン/.test(b.textContent)));
  T('Google未選択では氏名があってもホームへ進めない',()=>{
    setL('[data-bind="%name"]','入力中の氏名');actL('init-reg-done');return route()==='init-reg'&&!A().envs.length&&toast().includes('Googleアカウントを選択してください');
  });
  T('登録欄からだけGoogle選択シートを開き、キャンセルしても登録欄を保持',()=>{
    actL('init-reg-gaccount');const ok=route()==='init-reg'&&sheetText().includes('Googleアカウントを選択します');actL('close');return ok&&!A().account&&q('.phone [data-bind="%name"]').value==='入力中の氏名';
  });
  T('Google選択後も同じ登録画面に戻り、入力中の氏名を保持',()=>{
    actL('init-reg-gaccount');actL('gauth-change');const ok=route()==='init-reg'&&!!A().account&&!q('.phone .sheet')&&q('.phone [data-bind="%name"]').value==='入力中の氏名'&&qa('.phone [data-act=init-reg-gaccount]').length===1&&txt().includes('name@example.com');setL('[data-bind="%name"]','');return ok;
  });
  T('はじめの登録: Googleアカウントの表示・変更が画面の最上部にある',()=>{
    return q('.phone h3').textContent.includes('Googleアカウント')&&!!q('.phone [data-act=init-reg-gaccount]')&&q('.phone [data-act=init-reg-gaccount]').textContent.includes('変更する');
  });
  T('はじめの登録: 必須はGoogleアカウントと氏名。フリガナ・住所・電話・メール・DIPSは「任意」と分かる',()=>{
    const labels=qa('.phone .fld label').map(x=>x.textContent);
    return JSON.stringify(labels)==='["氏名【必須】","フリガナ","住所","電話番号","メールアドレス","DIPSログインID","DIPSパスワード"]'
      &&txt().includes('連絡先（任意）')&&txt().includes('DIPSのログイン情報（任意）')
      &&q('.phone [data-bind="%dipsPw"]').type==='password'
      &&q('.phone [data-bind="%name"]').getAttribute('placeholder')==='例：山田 太郎'
      &&q('.phone [data-act=init-reg-done]').textContent.includes('登録してホームへ');
  });
  T('任意項目の上に、DIPSのために登録すること・いま入力しなくても進めること・以後は再利用することを説明する',()=>{
    const t=txt();
    return t.includes('国土交通省')&&t.includes('DIPS')&&t.includes('いま入力しなくても進められます')&&t.includes('DIPSへ通報するときに未登録の項目は入力が必要になります')&&t.includes('一度登録した情報は、以後の通報で再利用します');
  });
  T('氏名が空のまま［登録してホームへ］: 進めない',()=>{
    actL('init-reg-done');return route()==='init-reg'&&toast().includes('氏名を入れてください')&&A().envs.length===0;
  });
  T('Google Driveの許可が下りなかったとき: 何も作られず、はじめの登録にとどまり、入力した氏名は残る',()=>{
    setL('[data-bind="%name"]','テスト氏名');
    act('consentres','[data-v="0"]');actL('init-reg-done');
    const ok=route()==='init-reg'&&txt().includes('保存場所を作れませんでした')&&txt().includes('まだ何も作っていません')&&A().envs.length===0&&q('.phone [data-bind="%name"]').value==='テスト氏名';
    act('consentres','[data-v="1"]');return ok;
  });
  T('DIPSパスワードは表示／非表示を切り替えられる',()=>{
    setL('[data-bind="%dipsPw"]',dummyPw);
    actL('dips-show');const shown=q('.phone [data-bind="%dipsPw"]').type==='text';
    actL('dips-show');return shown&&q('.phone [data-bind="%dipsPw"]').type==='password';
  });
  T('フリガナ・住所・電話・メール・DIPSを空のままでも［登録してホームへ］でホームへ進める（任意項目は必須にしない）',()=>{
    setL('[data-bind="%dipsPw"]','');
    actL('init-reg-done');
    return route()==='home'&&E().kind==='personal'&&E().name==='個人'&&E().people[0].roles.includes('管理者')&&E().meId===E().people[0].id
      &&E().people[0].name==='テスト氏名'&&!A().dips.registered;
  });
  T('ホームに着いた時点で、ほかの一括設定は求められていない',()=>{
    const t=txt();
    return route()==='home'&&!t.includes('はじめの設定')&&!t.includes('運航記録')&&!/0[1-7]/.test(t)&&qa('.tile').length===4&&q('.hd2').innerText.includes('個人で使用中');
  });
  T('使う場所が1つだけのときは、ホームに［切り替える］を出さない',()=>!!q('.phone [data-act=env]')&&!qa('.phone button').some(b=>b.textContent==='切り替える')&&A().envs.length===1);
  T('ホームに会社利用の常設ブロックはなく、単一環境でも現在地ボタンから追加・参加へ進める',()=>{
    const clean=!q('.phone [data-act=ob-co-new]')&&!txt().includes('あなたの役割');actL('env');
    const ok=clean&&sheetText().includes('現在の利用先')&&!!q('.phone .sheet [data-act=ob-co-new]')&&!!q('.phone .sheet [data-act=ob-co-join]')&&!q('.phone .sheet [data-act=env-pick]');actL('close');return ok;
  });
  T('ホームの4入口がすべて開ける',()=>{
    const ok=[];for(const sc of ['list','hist','set']){actL('go','[data-s='+sc+']');ok.push(route()===sc);H.APP().back()}
    return ok.every(Boolean)&&route()==='home'&&!all().includes('対象外');
  });

  /* ---- 登録済みの本人情報が、飛行計画の連絡先へ自動で入る ---- */
  T('新規飛行の連絡先に、はじめの登録の内容が自動で入る（再入力させない）',()=>{
    actL('nf-new');if(route()==='nf-need')actL('nf-need-go');
    const c=H.APP().nf().contact;
    return c.src==='self'&&c.name==='テスト氏名';
  });

  /* ---- あとから直す（各種設定・管理） ---- */
  T('各種設定・管理に、自分の情報とDIPSのログイン情報の入口がある。DIPSは未登録のまま',()=>{
    H.APP().root('home');actL('go','[data-s=set]');const rows=qa('.phone .li b').map(x=>x.textContent);
    return route()==='set'&&rows.includes('自分の情報')&&rows.includes('DIPSのログイン情報')&&rows.includes('機体管理')&&txt().includes('未登録');
  });
  T('自分の情報: はじめの登録と同じ項目で、登録済みの値が出る。操縦者としても登録できる',()=>{
    actL('go','[data-s=set-me]');
    const labels=qa('.phone .fld label').map(x=>x.textContent);
    if(route()!=='set-me'||JSON.stringify(labels)!=='["氏名","フリガナ","住所","電話番号","メールアドレス"]')return 'form';
    if(q('.phone [data-bind="%name"]').value!=='テスト氏名')return 'value';
    actL('me-pilot');actL('me-save');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='set'&&me.pilot&&qa('.phone .li').find(x=>x.textContent.includes('自分の情報')).textContent.includes('登録済み');
  });
  T('DIPSのログイン情報: 各種設定・管理からその場で登録できる（未登録のまま進んだ人の受け皿）',()=>{
    actL('dips-open');if(route()!=='set-dipscred')return 'route '+route();
    setL('[data-bind="#dform.id"]',dummyId);setL('[data-bind="#dform.pw"]',dummyPw);actL('dips-save');
    return route()==='set'&&A().dips.registered&&A().dips.id===dummyId&&!JSON.stringify(A()).includes(dummyPw);
  });

  /* ---- 設定が足りないまま［新規飛行］を押したとき ---- */
  start();
  const registerPersonal=(name)=>{actL('init-reg-gaccount');actL('gauth-change');setL('[data-bind="%name"]',name||'テスト氏名');actL('init-reg-done')};
  T('設定が足りないまま［新規飛行］→ エラーで止めず、足りないものを示す',()=>{
    registerPersonal();
    actL('nf-new');const t=txt();
    return route()==='nf-need'&&t.includes('飛行を始めるために必要な設定がまだありません')&&t.includes('機体')&&t.includes('操縦者')
      &&!!q('.phone [data-act=nf-need-set]')&&!!q('.phone [data-act=nf-need-go]');
  });
  T('［必要な設定をする］→機体を登録→元の新規飛行へ戻り、残りが分かる',()=>{
    actL('nf-need-set');if(route()!=='reg-aircraft')return 'route '+route();
    if(!txt().includes('「新規飛行」の途中です'))return 'banner';
    setL('[data-bind="@d.mark"]','JU000000000011');setL('[data-bind="@d.name"]','はじめの機体');actL('reg-save');
    const rows=qa('.phone .li b').map(x=>x.textContent);
    return route()==='nf-need'&&E().aircraft.length===1&&JSON.stringify(rows)==='["機体","操縦者"]'&&qa('.phone .li')[0].textContent.includes('登録済み')&&qa('.phone .li')[1].textContent.includes('未登録');
  });
  T('操縦者も登録すると、そのまま新規飛行を始められる',()=>{
    actL('nf-need-set');if(route()!=='reg-person'||!A().reg.d.roles.includes('操縦者'))return 'form '+route();
    setL('[data-bind="@d.name"]','はじめの操縦者');actL('reg-save');
    if(route()!=='nf-need'||!txt().includes('必要な設定がそろいました'))return 'need '+route();
    actL('nf-need-go');
    return route()==='nf'&&H.APP().nf().cur==='start';
  });

  /* ---- ホームから、会社・団体で新しく使い始める（会社のGoogleアカウントで認証する） ---- */
  start();
  T('会社・団体で新しく使い始める: ホームのまま、会社・団体で使うGoogleアカウントの選択がうすいシートで重なる',()=>{
    registerPersonal();actL('env');actL('ob-co-new');
    return route()==='home'&&sheetText().includes('会社・団体で使うGoogleアカウントを選択します')&&sheetText().includes('個人で使っているアカウントとは別に選べます')&&!/@/.test(sheetText());
  });
  T('認証のあと→会社・団体の名前。名前は必須。同じ名前の警告',()=>{
    actL('gauth-done');if(route()!=='create-name')return 'route '+route();
    const inp=q('.phone [data-bind="&name"]');if(inp.value!==''||inp.getAttribute('placeholder')!=='例：○○株式会社')return 'placeholder';
    actL('cr-name-next');const stay=route()==='create-name';
    setL('[data-bind="&name"]','○○株式会社','change');const warn=txt().includes('同じ名前の会社・団体が、すでにGoogle Driveにあるようです');
    return stay&&warn;
  });
  T('許可が下りなかったとき: 同じ画面にとどまり、何も作られない',()=>{
    setL('[data-bind="&name"]','テスト株式会社','change');
    act('consentres','[data-v="0"]');actL('cr-name-next');
    const ok=route()==='create-name'&&txt().includes('保存場所を作れませんでした')&&txt().includes('まだ何も作っていません')&&A().envs.length===1;
    act('consentres','[data-v="1"]');return ok;
  });
  T('許可が下りると、Google Driveの許可の画面を挟まず、そのまま会社・団体のホームへ。個人とは別の場所として増える',()=>{
    actL('cr-name-next');
    const co=E();
    return route()==='home'&&toast().includes('あなたが最初の管理者です')&&A().envs.length===2&&co.kind==='company'&&co.name==='テスト株式会社'
      &&co.gaccount==='test.company@example.invalid'&&A().envs.find(x=>x.kind==='personal').gaccount==='test.new@example.invalid'
      &&q('.hd2').innerText.includes('テスト株式会社で使用中');
  });
  T('使う場所が2つになったので、上部の［〜で使用中］から切り替えられる',()=>!!q('.phone [data-act=env]'));

  /* ---- ホームから、すでに使っている会社・団体に参加する ---- */
  start();
  T('参加も、まずホームのまま会社・団体で使うGoogleアカウントの選択→次へで参加する会社・団体の一覧',()=>{
    registerPersonal();actL('env');actL('ob-co-join');
    if(route()!=='home'||!sheetText().includes('会社・団体で使うGoogleアカウントを選択します'))return 'sheet '+route();
    actL('gauth-done');
    return route()==='join1'&&q('.ttl').innerText.includes('参加する会社・団体')&&txt().includes('新しい保存場所は作りません')&&txt().includes('○○株式会社')&&txt().includes('○○スクール');
  });
  T('参加の確認: 共有されていないと参加できない（右側の切替で状態を選ぶ）',()=>{
    actL('ob-join-pick','[data-id=j1]');act('gaccess','[data-v=none]');
    const t=txt();
    return route()==='join2'&&q('.phone [data-act=ob-join-go]').disabled&&t.includes('参加できません')&&t.includes('まだ何も登録されていません')&&t.includes('共有してもらってください')&&t.includes('新しく保存場所は作りません')&&!q('.phone [data-act=gaccess]');
  });
  T('閲覧のみなら参加できるが、保存はできない旨を伝える',()=>{act('gaccess','[data-v=view]');return !q('.phone [data-act=ob-join-go]').disabled&&txt().includes('閲覧のみ')&&txt().includes('保存や登録はできません')});
  T('「あなたの名前を選んでください」。「人物」「紐付け」の言葉を使わない',()=>{
    act('gaccess','[data-v=edit]');actL('ob-join-go');
    const t=txt();
    return route()==='join3'&&q('.ttl').innerText.includes('あなたの名前を選んでください')&&!t.includes('人物')&&!t.includes('紐付')&&q('.phone [data-act=ob-join-done]').disabled;
  });
  T('名前を選んで会社・団体のホームへ。新しい保存場所を作らず、管理者にもならない。個人環境は残る',()=>{
    actL('ob-join-me','[data-id=q1]');actL('ob-join-done');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='home'&&A().envs.length===2&&E().name==='○○株式会社'&&E().gaccount==='test.company@example.invalid'
      &&E().aircraft.length===2&&E().plans.length===3&&me.id==='q1'&&!me.roles.includes('管理者')
      &&A().envs.some(x=>x.kind==='personal')&&q('.hd2').innerText.includes('○○株式会社で使用中');
  });
  T('ホームに役割とGoogleアカウントの情報カードを表示しない',()=>!q('.phone table.kv')&&!txt().includes('あなたの役割'));
  T('同じ会社へ再度参加しても、既存の機体・計画を保持し、別環境を増やさない',()=>{
    const id=E().id,plans=E().plans.map(p=>p.id).join(',');
    actL('env');actL('ob-co-join');actL('gauth-done');actL('ob-join-pick','[data-id=j1]');actL('ob-join-go');actL('ob-join-me','[data-id=q1]');actL('ob-join-done');
    return route()==='home'&&E().id===id&&A().envs.length===2&&E().plans.map(p=>p.id).join(',')===plans;
  });
  T('参加: 名前が一覧にないときは新しく追加（記入例は薄い文字）。役割はまだ決まっていない',()=>{
    start();registerPersonal();actL('env');actL('ob-co-join');actL('gauth-done');actL('ob-join-pick','[data-id=j2]');actL('ob-join-go');actL('ob-join-me','[data-id=__new]');
    const inp=q('.phone [data-bind="$newName"]');if(inp.value!==''||inp.getAttribute('placeholder')!=='例：山田 太郎')return 'placeholder';
    setL('[data-bind="$newName"]','新しい参加者');actL('ob-join-done');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='home'&&E().name==='○○スクール'&&me.name==='新しい参加者'&&me.roles.length===0&&!me.roles.includes('管理者');
  });
  T('Google Driveが閲覧のみ: 保存や登録はできない（入力した内容は残る旨）',()=>{
    act('gaccess','[data-v=view]');actL('go','[data-s=set]');actL('go','[data-s=set-docs]');actL('reg-open','[data-t=contact]');actL('reg-save');
    const stay=route()==='reg-contact';const msg=qa('.toast').some(t=>t.textContent.includes('閲覧のみ')&&t.textContent.includes('入力した内容は画面に残っています'));
    actL('reg-cancel');act('gaccess','[data-v=edit]');return stay&&msg;
  });

  T('単一環境でも上部に個人で使用中ボタンを表示し、別の切替ボタンはない',()=>{
    H.hash('scn=personal');return !!q('.hd2 button')&&q('.hd2 button').textContent==='個人で使用中'&&!!q('.phone [data-act=env]')&&!qa('.phone button').some(b=>b.textContent==='切り替える');
  });
  T('複数環境では会社で使用中ボタンから個人へ切替できる',()=>{
    H.hash('scn=normal');qa('.phone [data-act=env-pick]')[1].click();
    const button=q('.hd2 [data-act=env]');if(!button||!button.textContent.includes('○○株式会社で使用中'))return false;
    button.click();qa('.phone .sheet [data-act=env-pick]')[0].click();return route()==='home'&&q('.hd2').textContent.includes('個人で使用中');
  });
  T('ホーム4入口の意味と並びを維持',()=>{
    return JSON.stringify(qa('.phone .tile').map(b=>b.dataset.act==='nf-new'?'nf-new':b.dataset.s))==='["nf-new","list","hist","set"]';
  });
  T('Googleアカウントを変更しても登録画面のまま',()=>{
    start();actL('init-reg-gaccount');actL('gauth-change');act('gstate','[data-v=one]');actL('init-reg-gaccount');actL('gauth-change');return route()==='init-reg'&&A().account.id==='one'&&txt().includes('personal@example.com')&&!A().envs.length;
  });

  /* ---- 設計確認の部品は、左側の外にある ---- */
  start();
  T('アプリの枠の外の帯（画面幅が狭いとき）に、「画面一覧」がある。左側には無い',()=>{
    const bar=q('.mockbar');return !!bar&&bar.textContent.includes('画面一覧')&&(bar.textContent.includes('設計確認メモ・状態切替')||bar.textContent.includes('この画面の確認用操作'))&&!q('.phone .mockbar')&&!q('.phone [data-act=map]')&&!q('.phone [data-act=memo]')&&!q('.phone .mockbtn');
  });
  T('右側の「設計確認メモ」に、実際のアプリには表示されない旨と、状態の切替',()=>{const m=memo();return m.includes('設計確認メモ')&&m.includes('この欄は、実際のアプリには表示されません')&&m.includes('設計確認用の状態切替')&&m.includes('Google認証のあと')});
  T('スマホ幅の設計メモ（アプリの枠の外のシート）にも、同じ内容がある',()=>{
    act('memo');const ov=q('.mockov');const ok=!!ov&&ov.textContent.includes('実際のアプリには表示されません')&&!q('.phone .mockov')&&!q('.phone .sheet');act('mclose');return ok&&!q('.mockov');
  });
  T('画面一覧（設計確認用）が、アプリの枠の外に開く',()=>{act('map');const ov=q('.mockov');const ok=!!ov&&ov.textContent.includes('実際のアプリにはありません')&&qa('.mockov [data-act=mk-goto]').length>30&&!q('.phone .mockov');act('mclose');return ok});
  T('設計メモには、内部用語・設計書番号・状態ラベルを残せる（右側）',()=>{
    H.hash('scn=personal');const m=memo();return /34b|34a|34h/.test(m)&&/CURRENT-|PENDING/.test(m);
  });
});
