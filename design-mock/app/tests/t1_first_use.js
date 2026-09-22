'use strict';
/* 初回導線。左側（アプリの画面）だけを見て、完全な初回利用者が最後まで進めるかを確かめる。
   右側（設計確認）の切替は、状態を変えて試すときだけ使う。 */
suite('はじめて使う（左側だけで進める）',H=>{
  const {T,act,actL,setL,txt,route,q,qa,A,E,all,memo}=H;
  const start=()=>H.hash('');
  const toast=()=>qa('.toast:not(.mock)').map(t=>t.textContent).join(' ');
  const dummyId='1234567890',dummyPw='Abc-123-xyz';

  /* ---- 完全な初回利用者: 左側の操作だけで、ホームまで ---- */
  start();
  T('最初の画面: 「利用登録を始める」と「ログイン」の2つだけ。認証済みを前提にしない',()=>route()==='boot'&&txt().includes('はじめて使う方')&&txt().includes('利用登録を始める')&&txt().includes('すでに登録済みの方')&&txt().includes('ログイン')&&!txt().includes('認証済み')&&!q('.hd2')&&qa('.phone [data-act]').length===2);
  T('最初の画面: それぞれのボタンの下に説明がある（説明だけの画面を別に置かない）',()=>{
    const t=txt();
    return t.includes('このアプリの利用登録を始めます')&&t.includes('お使いのGoogleアカウントで続けます')&&t.includes('新しいGoogleアカウントを作る必要はありません')&&t.includes('Googleのパスワードをこのアプリに入力することはありません')&&t.includes('登録済みのGoogleアカウントで続けます');
  });
  T('最初の画面の左側に、サンプル・確認用の文字がない',()=>!/サンプル|確認用|テスト|設計|モック/.test(all()));
  T('「利用登録を始める」: 説明だけの画面を挟まず、そのままGoogleの画面へ進む。左側は「実際の認証画面はGoogleが表示します」だけ。アカウントの一覧も、入力欄もない',()=>{
    actL('ob-start-new');
    return route()==='gauth'&&q('.ttl').innerText.includes('Googleアカウントを選択します')&&txt().includes('実際の認証画面はGoogleが表示します')&&qa('.phone [data-act=gauth-pick]').length===0&&!q('.phone input')&&!/@/.test(all())&&!/花子|太郎/.test(all());
  });
  T('Googleの画面の状態（未登録・登録済み）は、右側の切替で選ぶ。テスト用アカウントは右側にだけある',()=>{
    const m=memo();return qa('#memo [data-act=gstate]').length>=3&&m.includes('架空のテスト用Googleアカウント')&&m.includes('test.new@example.invalid')&&!all().includes('test.new@example.invalid');
  });
  T('認証のあと（未登録）→「どのように使いますか？」。3つの選択',()=>{
    actL('gauth-done');
    return route()==='usage'&&txt().includes('アカウントができました')&&txt().includes('個人で使う')&&txt().includes('会社・団体で新しく使い始める')&&txt().includes('会社・団体から招待を受けている')&&qa('.phone [data-act]').length===3;
  });
  T('個人で使う→Google Driveの許可。左側は説明と2つのボタンだけ',()=>{
    actL('us-personal');
    return route()==='consent'&&txt().includes('記録を保存するために、あなたのGoogle Driveを使います')&&txt().includes('許可の画面は、Googleが表示します')&&!!q('.phone [data-act=consent-ok]')&&!q('.phone [data-act=consent-no]');
  });
  T('許可されなかったとき（右側で選ぶ）: 何も作られず、次の操作が示される',()=>{
    act('consentres','[data-v="0"]');actL('consent-ok');
    const ok=txt().includes('保存場所を作れませんでした')&&txt().includes('まだ何も作っていません')&&txt().includes('許可して続ける')&&route()==='consent'&&A().envs.length===0;
    act('consentres','[data-v="1"]');return ok;
  });
  T('許可→「準備ができました」。保存場所の一覧や管理者の名前は左側に出さない',()=>{
    actL('consent-ok');const t=txt();
    return route()==='created'&&t.includes('個人で使う準備ができました')&&!t.includes('運航記録')&&!t.includes('人員')&&!/0[1-7]/.test(t)&&E().kind==='personal'&&E().name==='個人'&&E().people[0].roles.includes('管理者')&&E().meId===E().people[0].id&&memo().includes('運航記録');
  });
  T('DIPSのログイン情報: 説明は一行。IDの記入例は薄い文字。パスワードは伏字',()=>{
    actL('ob-after-created');
    const id=q('.phone [data-bind="#dform.id"]'),pw=q('.phone [data-bind="#dform.pw"]');
    return route()==='dips-init'&&q('.ttl').innerText.includes('DIPSのログイン情報')&&txt().includes('DIPSにログインするための情報を登録します')&&txt().includes('DIPSログインID')&&txt().includes('DIPSパスワード')
      &&id.value===''&&id.getAttribute('placeholder')==='例：1234567890'&&pw.type==='password'&&pw.value===''&&pw.getAttribute('placeholder')==='パスワードを入力'
      &&!!q('.phone [data-act=dips-skip]')&&!!q('.phone [data-act=dips-save]')&&q('.phone [data-act=dips-skip]').textContent.includes('あとで設定する')&&q('.phone [data-act=dips-save]').textContent.includes('登録する');
  });
  T('パスワードは［表示］／［非表示］で切り替えられる',()=>{
    actL('dips-show');const a=q('.phone [data-bind="#dform.pw"]').type==='text'&&q('.phone [data-act=dips-show]').textContent.includes('非表示');
    actL('dips-show');return a&&q('.phone [data-bind="#dform.pw"]').type==='password'&&q('.phone [data-act=dips-show]').textContent.includes('表示');
  });
  T('空のまま［登録する］: 何が足りないかが分かり、画面は進まない',()=>{
    actL('dips-save');const a=toast().includes('DIPSログインIDを入れてください')&&route()==='dips-init';
    setL('[data-bind="#dform.id"]',dummyId);actL('dips-save');return a&&toast().includes('DIPSパスワードを入れてください')&&route()==='dips-init';
  });
  T('IDとパスワードを入れて［登録する］→はじめの設定。登録の状態だけ覚え、パスワードの文字は残さない',()=>{
    setL('[data-bind="#dform.pw"]',dummyPw);actL('dips-save');
    return route()==='init'&&A().dips.registered===true&&A().dips.id===dummyId&&A().ui.dform===null&&!JSON.stringify(A()).includes(dummyPw);
  });
  T('はじめの設定: 項目・登録の状態・ボタンだけ。何も必須にしていない',()=>{
    const t=txt();const rows=qa('.phone .li').map(x=>x.querySelector('b').textContent);
    return JSON.stringify(rows)==='["自分の情報","機体","許可・承認","保険","連絡先"]'&&!t.includes('必須')&&!q('.phone [data-act=ob-init-done]').disabled&&qa('.phone [data-act=init-open]').length===5;
  });
  T('はじめの設定の説明は最小（あとからでも登録できます）。設計上の未決は右側にある',()=>{
    const m=memo();return txt().includes('あとからでも登録できます')&&m.includes('この画面で何を必須にするかは未決')&&m.includes('画面を分けるか未決')&&m.includes('オーナー判断が必要な設計論点')&&m.includes('何を必須にするか')&&!m.includes('項目の並びと、必須／任意の分け方');
  });
  T('［ホームへ］→ホーム。「個人で使用中」。4入口がすべて開ける',()=>{
    actL('ob-init-done');
    return route()==='home'&&q('.hd2').innerText.includes('個人で使用中')&&qa('[data-act=env]').some(b=>b.textContent.trim()==='切り替える')&&qa('.tile').length===4&&!all().includes('対象外');
  });

  /* ---- DIPS設定を飛ばす・置き方を変える・必須にする（右側の切替で比べる） ---- */
  start();
  T('［あとで設定する］→はじめの設定へ。DIPSは未登録のまま',()=>{
    actL('ob-start-new');actL('gauth-done');actL('us-personal');actL('consent-ok');actL('ob-after-created');
    actL('dips-skip');return route()==='init'&&A().dips.registered===false;
  });
  start();
  T('案B（はじめの設定の一項目）: 独立したDIPS画面を挟まず、一覧からその場で登録して戻る',()=>{
    act('initlayout','[data-v=inline]');
    actL('ob-start-new');actL('gauth-done');actL('us-personal');actL('consent-ok');actL('ob-after-created');
    if(route()!=='init')return 'route '+route();
    const rows=qa('.phone .li b').map(x=>x.textContent);if(!rows.includes('DIPSのログイン情報'))return '一覧にDIPSがない';
    actL('init-open','[data-t=dips]');if(route()!=='set-dipscred'||!txt().includes('「はじめの設定」の途中です'))return 'route '+route();
    setL('[data-bind="#dform.id"]',dummyId);setL('[data-bind="#dform.pw"]',dummyPw);
    if(!q('.phone [data-act=dips-save]').textContent.includes('登録して戻る'))return 'label';
    actL('dips-save');
    const row=qa('.phone .li').find(x=>x.textContent.includes('DIPSのログイン情報'));
    return route()==='init'&&A().dips.registered&&row.textContent.includes('登録済み');
  });
  T('必須にした項目: 「必須」の印が出て、登録するまで［ホームへ］が押せない',()=>{
    H.hash('');
    act('reqtog','[data-k=aircraft]');
    actL('ob-start-new');actL('gauth-done');actL('us-personal');actL('consent-ok');actL('ob-after-created');actL('dips-skip');
    const dis=q('.phone [data-act=ob-init-done]').disabled&&txt().includes('必須の項目が、まだ登録されていません');
    const badge=qa('.phone .li').find(x=>x.textContent.includes('機体')).textContent.includes('必須');
    actL('init-open','[data-t=aircraft]');setL('[data-bind="@d.mark"]','JU000000000011');actL('reg-save');
    return dis&&badge&&route()==='init'&&!q('.phone [data-act=ob-init-done]').disabled&&!txt().includes('必須の項目が、まだ');
  });
  T('DIPSを必須にすると、DIPSの画面に［あとで設定する］が出ない',()=>{
    H.hash('');act('reqtog','[data-k=dips]');
    actL('ob-start-new');actL('gauth-done');actL('us-personal');actL('consent-ok');actL('ob-after-created');
    return route()==='dips-init'&&!q('.phone [data-act=dips-skip]')&&!!q('.phone [data-act=dips-save]');
  });
  T('自分の情報: 氏名の記入例は薄い文字。氏名が空なら登録できない。操縦者としても登録できる',()=>{
    H.hash('');actL('ob-start-new');actL('gauth-done');actL('us-personal');actL('consent-ok');actL('ob-after-created');actL('dips-skip');
    actL('init-open','[data-t=me]');
    const n=q('.phone [data-bind="%name"]'),ph=q('.phone [data-bind="%phone"]');
    if(route()!=='init-me'||n.value!==''||n.getAttribute('placeholder')!=='例：山田 太郎'||ph.getAttribute('placeholder')!=='例：090-1234-5678')return 'form';
    actL('init-me-save');if(route()!=='init-me'||!toast().includes('氏名を入れてください'))return 'empty name';
    setL('[data-bind="%name"]','テスト氏名');actL('init-pilot');actL('init-me-save');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='init'&&me.name==='テスト氏名'&&me.pilot&&qa('.phone .li').find(x=>x.textContent.includes('自分の情報')).textContent.includes('登録済み');
  });

  /* ---- 会社・団体で新しく使い始める ---- */
  start();
  T('会社・団体で新しく使い始める: 名前は必須。記入例は薄い文字。同じ名前の警告',()=>{
    actL('ob-start-new');actL('gauth-done');actL('us-company');
    if(route()!=='create-name')return 'route '+route();
    const inp=q('.phone [data-bind="&name"]');if(inp.value!==''||inp.getAttribute('placeholder')!=='例：○○株式会社')return 'placeholder';
    actL('cr-name-next');const stay=route()==='create-name';
    setL('[data-bind="&name"]','○○株式会社','change');const warn=txt().includes('同じ名前の会社・団体が、すでにGoogle Driveにあるようです');
    return stay&&warn;
  });
  T('名前を入れて許可→作成。あなたが最初の管理者。「○○で使用中」',()=>{
    setL('[data-bind="&name"]','テスト株式会社','change');actL('cr-name-next');
    if(route()!=='consent'||!txt().includes('「テスト株式会社」のGoogle Driveを使います'))return 'consent '+route();
    actL('consent-ok');
    const ok1=route()==='created'&&txt().includes('「テスト株式会社」を使い始める準備ができました')&&txt().includes('あなたが最初の管理者です')&&E().kind==='company'&&E().name==='テスト株式会社'&&E().people[0].roles.includes('管理者');
    actL('ob-after-created');actL('dips-skip');actL('ob-init-done');
    return ok1&&q('.hd2').innerText.includes('テスト株式会社で使用中');
  });

  /* ---- ログイン（状態は右側の切替で選ぶ） ---- */
  const login=(state)=>{start();act('gstate','[data-v='+state+']');actL('ob-start-login');if(route()!=='gauth')throw new Error('login '+route());actL('gauth-done')};
  T('ログイン（登録済み・個人だけ）→使う場所が1つならそのままホーム',()=>{
    login('one');return route()==='home'&&A().envs.length===1&&q('.hd2').innerText.includes('個人で使用中');
  });
  T('ログイン（登録済み・個人＋会社）→「どこで使いますか？」→ 個人／会社の名称のカード',()=>{
    login('many');const cards=qa('.phone [data-act=env-pick]');
    return route()==='where'&&q('.ttl').innerText.includes('どこで使いますか？')&&cards.length===2&&cards[0].textContent.includes('個人')&&cards[1].textContent.includes('○○株式会社')&&txt().includes('前回使用');
  });
  T('会社を選ぶ→ホーム「○○株式会社で使用中」。［切り替える］で個人へ',()=>{
    qa('.phone [data-act=env-pick]')[1].click();
    if(route()!=='home'||!q('.hd2').innerText.includes('○○株式会社で使用中'))return 'home '+route();
    actL('env');const sheet=q('.phone .sheet').innerText.includes('どこで使いますか？');
    qa('.phone .sheet [data-act=env-pick]')[0].click();
    return sheet&&route()==='home'&&q('.hd2').innerText.includes('個人で使用中')&&!txt().includes('運用環境');
  });
  T('ログイン（未登録）→「ログインできませんでした」。何が起きたか・次の操作が分かる',()=>{
    login('new');const t=txt();
    if(route()!=='acct-none')return 'route '+route();
    if(!(t.includes('ログインできませんでした')&&t.includes('まだこのアプリのアカウントがありません')&&t.includes('まだ何も登録されていません')&&t.includes('利用登録を始める')))return 'text';
    actL('ob-to-new');return route()==='gauth';
  });
  T('利用登録を始める（登録済みのGoogleアカウント）→「すでに登録されています」→ログインへ',()=>{
    start();act('gstate','[data-v=one]');actL('ob-start-new');actL('gauth-done');
    if(route()!=='acct-exists'||!txt().includes('すでに登録されています'))return 'route '+route();
    actL('ob-to-login');return route()==='gauth';
  });
  T('認証のあとの状態は、右側の表で、入口ごとの行き先が分かる',()=>{
    start();actL('ob-start-new');const m=memo();
    return route()==='gauth'&&m.includes('［利用登録を始める］から')&&m.includes('［ログイン］から')&&m.includes('どこで使いますか？')&&m.includes('すでに登録されています');
  });

  /* ---- 招待を受けた人 ---- */
  T('招待を受けている会社・団体→一覧（仮データ）',()=>{
    start();actL('ob-start-new');actL('gauth-done');actL('us-invited');
    return route()==='join1'&&q('.ttl').innerText.includes('招待を受けている会社・団体')&&txt().includes('○○株式会社')&&txt().includes('○○スクール')&&q('.phone [data-bind="$code"]').getAttribute('placeholder')==='例：ABCD-1234';
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
  T('名前を選んでホームへ。新しい保存場所を作らず、管理者にもならない',()=>{
    actL('ob-join-me','[data-id=q1]');actL('ob-join-done');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='home'&&A().envs.length===1&&E().name==='○○株式会社'&&E().aircraft.length===2&&E().plans.length===3&&me.id==='q1'&&!me.roles.includes('管理者')&&q('.hd2').innerText.includes('○○株式会社で使用中');
  });
  T('参加した人の役割が表示される（管理者が決めた役割）',()=>txt().includes('操縦者'));
  T('招待で参加: 名前が一覧にないときは新しく追加（記入例は薄い文字）。役割はまだ決まっていない',()=>{
    start();actL('ob-start-new');actL('gauth-done');actL('us-invited');actL('ob-join-pick','[data-id=j2]');actL('ob-join-go');actL('ob-join-me','[data-id=__new]');
    const inp=q('.phone [data-bind="$newName"]');if(inp.value!==''||inp.getAttribute('placeholder')!=='例：山田 太郎')return 'placeholder';
    setL('[data-bind="$newName"]','新しい参加者');actL('ob-join-done');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='home'&&E().name==='○○スクール'&&me.name==='新しい参加者'&&me.roles.length===0&&txt().includes('まだ決まっていません')&&!me.roles.includes('管理者');
  });
  T('Google Driveが閲覧のみ: 保存や登録はできない（入力した内容は残る旨）',()=>{
    act('gaccess','[data-v=view]');actL('go','[data-s=set]');actL('go','[data-s=set-docs]');actL('reg-open','[data-t=contact]');actL('reg-save');
    const stay=route()==='reg-contact';const msg=qa('.toast').some(t=>t.textContent.includes('閲覧のみ')&&t.textContent.includes('入力した内容は画面に残っています'));
    actL('reg-cancel');act('gaccess','[data-v=edit]');return stay&&msg;
  });

  /* ---- 設計確認の部品は、左側の外にある ---- */
  start();
  T('アプリの枠の外の帯（画面幅が狭いとき）に、「画面一覧」と「設計確認メモ・状態切替」がある。左側には無い',()=>{
    const bar=q('.mockbar');return !!bar&&bar.textContent.includes('画面一覧')&&bar.textContent.includes('設計確認メモ・状態切替')&&!q('.phone .mockbar')&&!q('.phone [data-act=map]')&&!q('.phone [data-act=memo]')&&!q('.phone .mockbtn');
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
