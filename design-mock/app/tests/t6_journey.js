'use strict';
/* 完全な初回利用者の通し: ボタンだけで、利用登録を始めるところから、飛行の保存・出力・2回目の飛行まで歩く */
suite('初回利用者の通し',H=>{
  const {T,act,txt,route,set,q,qa,A,E,S}=H;
  H.hash('');
  T('1 最初の画面: 利用登録を始める／ログイン',()=>route()==='boot'&&txt().includes('利用登録を始める'));
  T('2 利用登録を始める→Googleアカウント選択（うすいシート）→そのまま「はじめの登録」。保存場所はまだない',()=>{
    act('ob-start-new');act('gauth-done');
    return route()==='init-reg'&&A().envs.length===0&&txt().includes('Googleアカウント')&&txt().includes('氏名');
  });
  T('3 必須の氏名だけ入れて［登録してホームへ］（任意項目はすべて空のまま）→ホーム（「個人で使用中」）',()=>{
    set('[data-bind="%name"]','通し氏名','input');
    act('init-reg-done');
    const me=E().people.find(p=>p.id===E().meId);
    return route()==='home'&&E().name==='個人'&&E().aircraft.length===0&&!A().dips.registered
      &&me.name==='通し氏名'&&!me.addr&&!me.phone&&!me.email&&!me.kana
      &&txt().includes('まだ何も登録されていません')&&q('.hd2').innerText.includes('個人で使用中');
  });
  T('4 飛行リスト・履歴・設定が、空でも開ける',()=>{const ok=[];for(const s of ['list','hist','set']){act('go','[data-s='+s+']');ok.push(route()===s);H.APP().back()}return ok.every(Boolean)&&route()==='home'});
  T('5 新規飛行: 足りない設定の案内→［このまま進む］→使うもの',()=>{act('nf-new');if(route()!=='nf-need')return 'need '+route();act('nf-need-go');act('nf-layout','[data-v=app]');act('start-new');return route()==='nf'&&S().cur==='use'});
  T('6 その場で機体を登録して戻る',()=>{act('nf-reg','[data-t=aircraft]');set('[data-bind="@d.mark"]','JU-JOURNEY-01');set('[data-bind="@d.name"]','通し機');act('reg-save');return route()==='nf'&&S().aircraft.length===1});
  T('7 自分を操縦者にして選ぶ／許可なし',()=>{act('nf-me-pilot');act('pick-pm','[data-id=none]');return S().pilots.length===1&&S().permit==='none'});
  T('8 飛行の内容を選ぶ',()=>{act('nf-next');act('tog-purpose','[data-g=biz][data-v=空撮]');act('tog-air','[data-v="上記空域の飛行は行わない"]');act('tog-met','[data-v="上記方法の飛行は行わない"]');return S().cur==='content'});
  T('9 飛行範囲: 円を作図→出発地・目的地',()=>{act('nf-next');act('tool','[data-k=circle]');window.mapTap(180,130);window.mapTap(240,130);set('[data-bind=from]','事務所');set('[data-bind=to]','通し現場');return S().geom.done&&S().geom.kind==='circle'});
  T('10 保険をその場で登録。連絡先は、はじめの登録の氏名だけが自動で入っている（住所・電話・メールは空）',()=>{
    act('nf-next');act('nf-next');act('nf-reg','[data-t=insurance]');set('[data-bind="@d.company"]','通し保険');act('reg-save');
    const c=S().contact;
    return S().cur==='master'&&!!E().insurance&&S().ins.mode==='auto'&&c.src==='self'&&c.name==='通し氏名'&&!c.addr&&!c.phone&&!c.email;
  });
  T('11 内容確認→通報の直前。連絡先が足りないことは、ここでも分かる',()=>{
    act('nf-next');const okR=S().cur==='review'&&txt().includes('連絡先');act('nf-next');
    return okR&&S().cur==='final';
  });
  T('12 通報しようとすると、足りない連絡先とDIPSのログイン情報を、1回の案内でまとめて示す',()=>{
    act('nf-send-go');const sh=q('.phone .sheet');
    if(route()!=='nf'||!sh)return 'no sheet '+route();
    const t=sh.innerText;
    return t.includes('通報に必要な情報が足りません')&&t.includes('足りないものだけ入れてください')
      &&t.includes('フリガナ')&&t.includes('住所')&&t.includes('電話番号')&&t.includes('メールアドレス')
      &&t.includes('DIPSのログイン情報')&&t.includes('あとで行う');
  });
  T('13 不足分だけ入力→［保存して続ける］→人物情報（人員台帳）へ保存され、この飛行の連絡先にも入る',()=>{
    set('[data-bind="#needForm.kana"]','トオシシメイ','input');set('[data-bind="#needForm.addr"]','○○県○○市1-2-3','input');
    set('[data-bind="#needForm.phone"]','09000000001','input');set('[data-bind="#needForm.email"]','name@example.com','input');
    act('need-save');
    const me=E().people.find(p=>p.id===E().meId);const c=S().contact;
    return me.kana==='トオシシメイ'&&me.addr==='○○県○○市1-2-3'&&me.phone==='09000000001'&&me.email==='name@example.com'
      &&c.addr==='○○県○○市1-2-3'&&c.phone==='09000000001'&&c.email==='name@example.com'
      &&route()==='nf'&&S().cur==='final';
  });
  T('14 残ったDIPSのログイン情報を［今設定する］→登録→元の飛行計画（通報の直前）へ戻る',()=>{
    const sh=q('.phone .sheet');if(!sh||!sh.innerText.includes('DIPSのログイン情報'))return 'no dips part';
    act('dips-now');if(route()!=='set-dipscred')return 'route '+route();
    set('[data-bind="#dform.id"]','1234567890','input');set('[data-bind="#dform.pw"]','Abc-123-xyz','input');act('dips-save');
    return route()==='nf'&&S().cur==='final'&&A().dips.registered&&!q('.phone .sheet');
  });
  T('15 もう一度［アプリからDIPSへ送信する］→止まらずに送信→正常受付・重複なし→飛行リストに載る',()=>{
    act('nf-send-go');
    if(q('.phone .sheet'))return 'まだ止まる';
    if(route()!=='nf-send')return 'send '+route();
    act('nf-result','[data-k=clean]');return route()==='nf-accepted'&&txt().includes('通報完了・重複なし')&&E().plans.length===1});
  T('16 後で飛行する→飛行リストのカード→通報内容',()=>{act('nf-later');act('go','[data-s=list]');const c=qa('[data-act=plan-open]').length;act('plan-open');return c===1&&route()==='plan'&&qa('.rev').length>=23});
  T('17 飛行前点検へ（新しく登録した機体。BAT管理OFF）',()=>{act('plan-to-op');return route()==='op-pre'&&txt().includes('JU-JOURNEY-01')});
  T('18 点検→離陸待機→離陸→着陸→終了→飛行後点検→保存',()=>{
    act('op-pre-all');act('op-pre-done');if(!txt().includes('BAT管理がOFF'))return 'BAT';
    act('op-takeoff');act('op-ff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    return route()==='op-done'&&txt().includes('保存しました')&&E().flights.length===1&&E().plans.length===0;
  });
  T('19 履歴に1件→詳細→PDF（A4＋地図付き）→KML',()=>{
    act('op-open-hist');if(route()!=='hist-detail')return 'route '+route();
    act('out-both');act('out-make');const pdf=!!q('.paper.a4')&&!!q('.mapdoc');act('back');act('out-kml-open');
    return pdf&&route()==='out-kml'&&txt().includes('保存しました');
  });
  T('20 飛行リストは空に戻る（終わった計画はリストから外れる）',()=>{H.APP().root('home');act('go','[data-s=list]');return txt().includes('通報済みの計画はまだありません')});
  T('21 設定に、途中で登録したものが並んでいる。通報のときに補った連絡先は、自分の情報に入っている',()=>{
    H.APP().root('home');act('go','[data-s=set]');const dp=qa('.li').find(x=>x.textContent.includes('DIPSのログイン情報')).textContent.includes('登録済み');act('go','[data-s=set-aircraft]');const a=txt().includes('通し機')&&dp;H.APP().back();
    act('go','[data-s=set-members]');const p=txt().includes('操縦者');H.APP().back();act('go','[data-s=set-docs]');const d=txt().includes('通し保険');H.APP().back();
    act('go','[data-s=set-me]');
    const me=q('.phone [data-bind="%addr"]').value==='○○県○○市1-2-3'&&q('.phone [data-bind="%phone"]').value==='09000000001'&&q('.phone [data-bind="%email"]').value==='name@example.com'&&q('.phone [data-bind="%kana"]').value==='トオシシメイ';
    H.APP().back();return a&&p&&d&&me;
  });
  T('22 2回目: 履歴から複製して新規飛行',()=>{H.APP().root('home');act('nf-new');act('nf-layout','[data-v=app]');act('start-past');return S().cur==='use'&&S().aircraft.length===1&&S().geom.done&&S().auto.aircraft.includes('前回')});
  T('22.1 2回目は、一度補った連絡先を聞き直さない（人物情報から自動で入る）',()=>{
    const c=S().contact;
    if(!(c.name==='通し氏名'&&c.addr==='○○県○○市1-2-3'&&c.phone==='09000000001'&&c.email==='name@example.com'))return '自動で入っていない';
    window.nfGo('final');act('nf-send-go');
    const stopped=!!q('.phone .sheet');
    if(stopped)return 'また聞かれた';
    const ok=route()==='nf-send';act('nf-send-back');return ok;
  });
  T('23 設定で先に機体を追加（BAT管理ON・新しいBATグループ）',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-aircraft]');act('reg-open','[data-t=aircraft]:not([data-id])');
    set('[data-bind="@d.mark"]','JU-JOURNEY-02');set('[data-bind="@d.name"]','通し機2');act('reg-set','[data-k=batOn][data-v=true]');set('[data-bind="@d.newGroup"]','通しBAT');act('reg-save');
    const a=E().aircraft.find(x=>x.mark==='JU-JOURNEY-02');return route()==='set-aircraft'&&!!a&&a.batOn&&E().batGroups.length===1;
  });
  T('24 BATがない機体で運航→BATをその場で登録→戻って選ぶ',()=>{
    H.APP().root('home');act('nf-new');act('start-nodips');const s=S();const a2=E().aircraft.find(x=>x.mark==='JU-JOURNEY-02');
    s.aircraft=[a2.id];s.pilots=[E().meId];s.biz=['空撮'];s.air=['上記空域の飛行は行わない'];s.met=['上記方法の飛行は行わない'];s.geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};s.from='a';s.to='b';
    window.nfGo('final');act('nf-nodips-go');act('op-pre-all');act('op-pre-done');
    if(!txt().includes('使えるBATが登録されていません'))return 'no empty state';
    act('op-bat-reg');if(route()!=='reg-bat'||!txt().includes('BATの選択'))return 'reg '+route();
    set('[data-bind="@d.label"]','BAT A');act('reg-save');
    return route()==='op-pre'&&!!A().op.cur.bat&&E().bats.length===1&&E().bats[0].label==='BAT A'&&E().bats[0].group===a2.group;
  });
  T('25 状態確認を選んで離陸→着陸→保存→BATの履歴に載る',()=>{
    act('op-bat-check','[data-v=異常なし]');act('op-pre-done');act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    const b=E().bats[0];return route()==='op-done'&&b.uses===1&&b.lastDays===0&&E().flights.length===2&&E().flights[0].kml==='none';
  });
  T('26 BAT一覧・詳細に反映されている',()=>{H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-bat]');const t1=txt().includes('BAT A');act('bat-open');return t1&&route()==='bat-detail'&&txt().includes('使用履歴')});
});
