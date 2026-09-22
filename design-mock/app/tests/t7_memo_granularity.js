'use strict';
/* 右側（設計確認メモ）で、オーナーに何を聞くかの粒度を確かめる。
   一般的なUI・UX（並び・余白・改行・ボタン位置・「戻る」・説明文の置き場所・一覧の見せ方・
   意味が変わらない画面の分け方）は、AI側の標準案として置き、オーナー確認待ちにしない。
   オーナー判断としてお尋ねするのは、答えによって、アプリの意味・業務処理／責任主体／必須登録内容／
   保存する内容／権限／安全性／データの保持・削除・復旧／外部連携の意味や運用／記録として残す内容が
   変わるものだけ（オーナーの2026-09-22の指示。30 §5.2） */
suite('オーナーに聞く粒度（右側の設計確認メモ）',H=>{
  const {T,memo,q}=H;
  H.hash('');

  /* 一般的なUIの語。オーナー判断の欄に入っていてはいけない */
  const UIWORD=/並べ方|並び方|余白|改行|ボタンの位置|置き場所|どこに置くか|見せ方|情報量|何を並べるか|大きさ|まとめてよいか|この画面は必要か|導線/;
  const allAsk=()=>{
    const out=[];
    Object.keys(SCR).forEach(id=>(SCR[id].ask||[]).forEach(x=>out.push([id,x])));
    Object.keys(NFS).forEach(id=>(NFS[id].ask||[]).forEach(x=>out.push(['nf:'+id,x])));
    return out;
  };
  const allUi=()=>{
    let n=0;
    Object.keys(SCR).forEach(id=>{n+=(SCR[id].ui||[]).length});
    Object.keys(NFS).forEach(id=>{n+=(NFS[id].ui||[]).length});
    return n;
  };

  T('右側の説明に、一般的なUIはAI側の標準案として置く、という考え方が書いてある',()=>{
    const m=memo();
    return m.includes('一般的なスマートフォンUIに合わせた標準案')&&m.includes('一件ずつオーナー確認待ちにはしません')&&m.includes('触って違和感があれば、その場で直します');
  });
  T('右側の説明に、オーナー判断としてお尋ねする範囲が書いてある',()=>{
    const m=memo();
    return ['アプリの意味・業務処理','責任主体','必須登録内容','保存する内容','権限','安全性','データの保持・削除・復旧','外部連携の意味や運用','記録として残す内容'].every(k=>m.includes(k));
  });
  T('古い見出し「相談したい点（比較したい案・オーナー確認待ち）」は使っていない',()=>!memo().includes('相談したい点'));
  T('3つの区分の見出しが分かれている（オーナー判断／未決・仮置き／一般的なUI判断）',()=>{
    const m=memo();
    return m.includes('オーナー判断が必要な設計論点')&&m.includes('未決・仮置き（いま決めなくてよいこと）')&&m.includes('一般的なUI判断（AI側の標準案。オーナー確認待ちではありません）');
  });
  T('オーナー判断がない画面では、「いまオーナー判断が必要な点はありません」と出る',()=>{
    const m=memo();
    return m.includes('この画面に、いまオーナー判断が必要な点はありません');
  });
  T('一般的なUIの言葉が、オーナー判断の欄に残っていない',()=>{
    const bad=allAsk().filter(r=>UIWORD.test(r[1]));
    return bad.length?bad.map(r=>r[0]+'「'+r[1]+'」').join(' ／ '):true;
  });
  T('AI側の標準案（一般的なUI判断）が、全画面にわたって記録されている',()=>allUi()>=30||('ui件数 '+allUi()));
  T('オーナー判断は、全画面で絞り込まれている（整理前は約100件。30件以下に保つ）',()=>{
    const n=allAsk().length;return n<=30||('オーナー判断 '+n+'件');
  });
  T('最初の画面は、オーナー確認待ちを出さず、AI側の標準案を出す',()=>{
    H.hash('');const m=memo();
    return m.includes('この画面に、いまオーナー判断が必要な点はありません')&&m.includes('説明は1文ずつ改行し');
  });
  T('はじめの登録: 必須の範囲だけをオーナー判断として残し、並び・説明の位置はAI標準案にする',()=>{
    H.hash('');H.act('ob-start-new');H.act('gauth-done');H.act('consent-ok');
    if(H.route()!=='init-reg')return 'route '+H.route();
    const m=memo();
    return m.includes('オーナー判断が必要な設計論点')&&m.includes('何を必須にするか')&&m.includes('一般的なUI判断')&&m.includes('説明を入力欄の上に置き');
  });
  T('必須登録・保存・安全に関わる点は、オーナー判断として残っている',()=>{
    const t=allAsk().map(r=>r[1]).join(' ／ ');
    return ['最低限どの項目を登録させるか','何を必須にするか','記録として残すか','安全性','記録として残した値を書き換えられる'].every(k=>t.includes(k))||t;
  });
});
