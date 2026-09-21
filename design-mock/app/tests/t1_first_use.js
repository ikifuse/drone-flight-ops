'use strict';
/* 初回導線: 完全な初回／登録済みのログイン（使う場所が1つ・複数）／登録のないアカウント／招待を受けた人 */
suite('はじめて使う・ログイン',H=>{
  const {T,act,txt,route,set,q,qa,A,E,all}=H;
  const start=()=>H.hash('');
  const google=(entry,acc)=>{act(entry);act('ob-google');act('gauth-pick','[data-id='+acc+']')};

  /* ---- 完全な初回 ---- */
  start();
  T('最初の画面: 「アカウントを作る」と「ログイン」。認証済みを前提にしない',()=>route()==='boot'&&txt().includes('はじめて使う方')&&txt().includes('アカウントを作る')&&txt().includes('すでに登録済みの方')&&txt().includes('ログイン')&&!txt().includes('認証済み')&&!q('.hd2'));
  T('「アカウントを作る」: Googleアカウントを使う説明。新しいGoogleアカウントを作るわけではない',()=>{
    act('ob-start-new');
    return route()==='acct-new'&&txt().includes('Googleアカウントを使って、このアプリのアカウントを作ります')&&txt().includes('新しいGoogleアカウントを作るわけではありません')&&txt().includes('Googleのパスワードを、このアプリに入力する必要はありません')&&q('[data-act=ob-google]').textContent.includes('Googleアカウントで続ける');
  });
  T('Google公式の画面（見本）: アカウントを選ぶ。アプリはパスワードを入力させない',()=>{
    act('ob-google');
    return route()==='gauth'&&txt().includes('Googleアカウントの選択')&&qa('[data-act=gauth-pick]').length===3&&!q('input[type=password]')&&qa('.mockbox').length===4;
  });
  T('登録のないアカウントを選ぶ→「どのように使いますか？」（3つの選択肢）',()=>{
    act('gauth-pick','[data-id=new]');
    return route()==='usage'&&txt().includes('アカウントができました')&&txt().includes('個人で使う')&&txt().includes('会社・団体で新しく使い始める')&&txt().includes('会社・団体から招待を受けている');
  });
  T('個人で使う→Google Driveの許可。許可しないと何も作られず、次の操作が示される',()=>{
    act('us-personal');if(route()!=='consent')return 'route '+route();
    act('consent-no');
    return txt().includes('保存場所を作れませんでした')&&txt().includes('まだ何も作っていません')&&txt().includes('許可して続ける')&&route()==='consent'&&A().envs.length===0;
  });
  T('許可→「準備ができました」。フォルダーは番号なし。あなたが管理者',()=>{
    act('consent-ok');
    const t=txt();
    return route()==='created'&&t.includes('個人で使う準備ができました')&&t.includes('人員')&&t.includes('運航記録')&&!/0[1-7]/.test(t)&&t.includes('管理者です')&&E().kind==='personal'&&E().name==='個人'&&E().people[0].roles.includes('管理者')&&E().meId===E().people[0].id;
  });
  T('はじめの設定（すべて任意）→ホーム。「個人で使用中」',()=>{
    act('ob-to-init');if(route()!=='init')return 'route '+route();
    if(q('[data-act=ob-init-done]').disabled)return 'blocked';
    act('ob-init-done');
    return route()==='home'&&q('.hd2').innerText.includes('個人で使用中')&&txt().includes('個人で使用中')&&qa('[data-act=env]').some(b=>b.textContent.trim()==='切り替える');
  });
  T('ホーム: 4入口がすべて開ける（「対象外」の表示なし）',()=>qa('.tile').length===4&&!all().includes('対象外'));

  /* ---- 会社・団体で新しく使い始める ---- */
  start();
  T('会社・団体で新しく使い始める: 名前が必須。同じ名前の警告',()=>{
    google('ob-start-new','new');act('us-company');
    if(route()!=='create-name')return 'route '+route();
    act('cr-name-next');const stay=route()==='create-name';
    set('[data-bind="&name"]','サンプル株式会社');const warn=txt().includes('同じ名前の会社・団体が、すでにGoogle Driveにあるようです');
    return stay&&warn;
  });
  T('名前を入れて許可→作成。あなたが最初の管理者。「○○で使用中」',()=>{
    set('[data-bind="&name"]','テスト株式会社');act('cr-name-next');
    if(route()!=='consent'||!txt().includes('テスト株式会社'))return 'consent '+route();
    act('consent-ok');
    const ok1=route()==='created'&&txt().includes('「テスト株式会社」を使い始める準備ができました')&&txt().includes('最初の管理者')&&E().kind==='company'&&E().name==='テスト株式会社'&&E().people[0].roles.includes('管理者');
    act('ob-to-init');act('ob-init-done');
    return ok1&&q('.hd2').innerText.includes('テスト株式会社で使用中');
  });

  /* ---- ログイン ---- */
  start();
  T('ログイン→Google公式の画面→使う場所が1つならそのままホーム',()=>{
    act('ob-start-login');if(route()!=='acct-login'||!txt().includes('Googleアカウントでログイン'))return 'login '+route();
    act('ob-google');act('gauth-pick','[data-id=one]');
    return route()==='home'&&A().envs.length===1&&q('.hd2').innerText.includes('個人で使用中');
  });
  start();
  T('ログイン（使う場所が複数）→「どこで使いますか？」→ 個人／会社の名称のカード',()=>{
    google('ob-start-login','many');
    const cards=qa('[data-act=env-pick]');
    return route()==='where'&&q('.ttl').innerText.includes('どこで使いますか？')&&cards.length===2&&cards[0].textContent.includes('個人')&&cards[1].textContent.includes('サンプル株式会社')&&txt().includes('前回使用');
  });
  T('会社を選ぶ→ホーム「サンプル株式会社で使用中」。［切り替える］で個人へ',()=>{
    qa('[data-act=env-pick]')[1].click();
    if(route()!=='home'||!q('.hd2').innerText.includes('サンプル株式会社で使用中'))return 'home '+route();
    act('env');const sheet=q('.sheet').innerText.includes('どこで使いますか？');
    qa('.sheet [data-act=env-pick]')[0].click();
    return sheet&&route()==='home'&&q('.hd2').innerText.includes('個人で使用中')&&!txt().includes('運用環境');
  });
  start();
  T('登録のないGoogleアカウントでログイン→「ログインできませんでした」（何が起きたか／次の操作）',()=>{
    google('ob-start-login','new');
    const t=txt();
    if(route()!=='acct-none')return 'route '+route();
    if(!(t.includes('ログインできませんでした')&&t.includes('まだこのアプリのアカウントがありません')&&t.includes('まだ何も登録されていません')))return 'text';
    act('ob-to-new');return route()==='acct-new';
  });
  start();
  T('登録済みのGoogleアカウントで「アカウントを作る」→「すでに登録されています」→ログインへ',()=>{
    google('ob-start-new','one');
    if(route()!=='acct-exists'||!txt().includes('すでに登録されています'))return 'route '+route();
    act('ob-to-login');return route()==='acct-login';
  });

  /* ---- 招待を受けた人 ---- */
  start();
  T('招待を受けている会社・団体→一覧',()=>{
    google('ob-start-new','new');act('us-invited');
    return route()==='join1'&&q('.ttl').innerText.includes('招待を受けている会社・団体')&&txt().includes('サンプル株式会社')&&txt().includes('サンプルスクール');
  });
  T('参加の確認: 共有されていないと参加できない（何が起きたか／残っている内容／次の操作）',()=>{
    act('ob-join-pick','[data-id=j1]');act('gaccess','[data-v=none]');
    const t=txt();
    return route()==='join2'&&q('[data-act=ob-join-go]').disabled&&t.includes('参加できません')&&t.includes('まだ何も登録されていません')&&t.includes('共有してもらってください')&&t.includes('新しく保存場所は作りません');
  });
  T('閲覧のみなら参加できるが、保存はできない旨を伝える',()=>{act('gaccess','[data-v=view]');return !q('[data-act=ob-join-go]').disabled&&txt().includes('閲覧のみ')&&txt().includes('保存や登録はできません')});
  T('「あなたの名前を選んでください」。「人物」「紐付け」の言葉を使わない',()=>{
    act('gaccess','[data-v=edit]');act('ob-join-go');
    const t=txt();
    return route()==='join3'&&q('.ttl').innerText.includes('あなたの名前を選んでください')&&!t.includes('人物')&&!t.includes('紐付')&&q('[data-act=ob-join-done]').disabled;
  });
  T('名前を選んでホームへ。新しい保存場所を作らず、管理者にもならない',()=>{
    act('ob-join-me','[data-id=q1]');act('ob-join-done');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='home'&&A().envs.length===1&&E().name==='サンプル株式会社'&&E().aircraft.length===2&&E().plans.length===3&&me.id==='q1'&&!me.roles.includes('管理者')&&q('.hd2').innerText.includes('サンプル株式会社で使用中');
  });
  T('参加した人の役割が表示される（管理者が決めた役割）',()=>txt().includes('操縦者'));
  T('招待で参加: 名前が一覧にないときは、新しく追加。役割はまだ決まっていない',()=>{
    start();google('ob-start-new','new');act('us-invited');act('ob-join-pick','[data-id=j2]');act('ob-join-go');act('ob-join-me','[data-id=__new]');
    set('[data-bind="$newName"]','新しい参加者');act('ob-join-done');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='home'&&E().name==='サンプルスクール'&&me.name==='新しい参加者'&&me.roles.length===0&&txt().includes('まだ決まっていません')&&!me.roles.includes('管理者');
  });
  T('Google Driveが閲覧のみ: 保存や登録はできない（入力した内容は残る旨）',()=>{
    A().gAccess='view';act('go','[data-s=set]');act('go','[data-s=set-docs]');act('reg-open','[data-t=contact]');act('reg-save');
    const stay=route()==='reg-contact';const msg=qa('.toast').some(t=>t.textContent.includes('閲覧のみ')&&t.textContent.includes('入力した内容は画面に残っています'));
    act('reg-cancel');A().gAccess='edit';return stay&&msg;
  });

  /* ---- 確認用の部品が、本番の画面と区別されている ---- */
  start();
  T('ヘッダーの確認用ボタン: 「確認用：画面一覧」「確認用：設計メモ」',()=>{
    const b=qa('.mockbtn').map(x=>x.textContent);return b.includes('確認用：画面一覧')&&b.includes('確認用：設計メモ');
  });
  T('右側の「設計確認メモ」に、実際のアプリには表示されない旨',()=>{const m=q('#memo').textContent;return m.includes('設計確認メモ')&&m.includes('この欄は、実際のアプリには表示されません')});
  T('スマホ幅の設計メモも、実際のアプリには無いと分かる（点線の見出しと注記）',()=>{
    act('memo');const ov=q('.ov.mockonly');const ok=!!ov&&ov.textContent.includes('実際のアプリには表示されません');act('close');return ok;
  });
  T('画面一覧（確認用）が開き、実際のアプリにはない旨',()=>{act('map');const ov=q('.ov.mockonly');const ok=!!ov&&ov.textContent.includes('実際のアプリにはありません');act('close');return ok});
  T('設計メモには、内部用語・設計書番号・状態ラベルを残せる（設計確認メモ側）',()=>{
    H.hash('scn=personal');const m=q('#memo').textContent;return /34b|34a|34h/.test(m)&&/CURRENT-|PENDING/.test(m);
  });
});
