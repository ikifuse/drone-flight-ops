'use strict';
/* 完全な初回利用者の通し: ボタンだけで、利用登録を始めるところから、飛行の保存・出力・2回目の飛行まで歩く */
suite('初回利用者の通し',H=>{
  const {T,act,txt,route,set,q,qa,A,E,S}=H;
  H.hash('');
  T('1 最初の画面: 利用登録を始める／ログイン',()=>route()==='boot'&&txt().includes('利用登録を始める'));
  T('2 利用登録を始める→Google公式の画面→個人で使う→許可→準備ができました',()=>{
    act('ob-start-new');act('gauth-done');act('us-personal');act('consent-ok');
    return route()==='created'&&E().name==='個人'&&txt().includes('個人で使う準備ができました');
  });
  T('3 DIPSのログイン情報は［あとで設定する］。はじめの設定も何も登録せずホームへ（「個人で使用中」）',()=>{act('ob-after-created');if(route()!=='dips-init')return route();act('dips-skip');act('ob-init-done');return route()==='home'&&E().aircraft.length===0&&!A().dips.registered&&txt().includes('まだ何も登録されていません')&&q('.hd2').innerText.includes('個人で使用中')});
  T('4 飛行リスト・履歴・設定が、空でも開ける',()=>{const ok=[];for(const s of ['list','hist','set']){act('go','[data-s='+s+']');ok.push(route()===s);H.APP().back()}return ok.every(Boolean)&&route()==='home'});
  T('5 新規飛行: 何も登録せずに開始→使うもの',()=>{act('nf-new');act('nf-layout','[data-v=app]');act('start-new');return route()==='nf'&&S().cur==='use'});
  T('6 その場で機体を登録して戻る',()=>{act('nf-reg','[data-t=aircraft]');set('[data-bind="@d.mark"]','JU-JOURNEY-01');set('[data-bind="@d.name"]','通し機');act('reg-save');return route()==='nf'&&S().aircraft.length===1});
  T('7 自分を操縦者にして選ぶ／許可なし',()=>{act('nf-me-pilot');act('pick-pm','[data-id=none]');return S().pilots.length===1&&S().permit==='none'});
  T('8 飛行の内容を選ぶ',()=>{act('nf-next');act('tog-purpose','[data-g=biz][data-v=空撮]');act('tog-air','[data-v="上記空域の飛行は行わない"]');act('tog-met','[data-v="上記方法の飛行は行わない"]');return S().cur==='content'});
  T('9 飛行範囲: 円を作図→出発地・目的地',()=>{act('nf-next');act('tool','[data-k=circle]');window.mapTap(180,130);window.mapTap(240,130);set('[data-bind=from]','事務所');set('[data-bind=to]','通し現場');return S().geom.done&&S().geom.kind==='circle'});
  T('10 保険と連絡先をその場で登録',()=>{
    act('nf-next');act('nf-next');act('nf-reg','[data-t=insurance]');set('[data-bind="@d.company"]','通し保険');act('reg-save');
    set('[data-bind="contact.name"]','通し連絡先');set('[data-bind="contact.phone"]','09000000001');act('nf-save-contact');
    return S().cur==='master'&&!!E().insurance&&!!E().contact&&S().ins.mode==='auto';
  });
  T('11 内容確認→通報の直前（足りない項目なし）',()=>{act('nf-next');const okR=S().cur==='review';act('nf-next');return okR&&S().cur==='final'&&!txt().includes('足りない項目が')});
  T('12 通報の直前でDIPSのログイン情報が未登録→その場で登録→元の飛行計画へ戻る→送信→正常受付・重複なし→飛行リストに載る',()=>{
    act('nf-send-go');if(!q('.phone .sheet')||!q('.phone .sheet').innerText.includes('DIPSのログイン情報がまだ登録されていません'))return 'no prompt';
    act('dips-now');set('[data-bind="#dform.id"]','1234567890','input');set('[data-bind="#dform.pw"]','Abc-123-xyz','input');act('dips-save');
    if(route()!=='nf'||S().cur!=='final'||!A().dips.registered)return 'back '+route();
    act('nf-send-go');if(route()!=='nf-send')return 'send '+route();act('nf-result','[data-k=clean]');return route()==='nf-accepted'&&txt().includes('通報完了・重複なし')&&E().plans.length===1});
  T('13 後で飛行する→飛行リストのカード→通報内容',()=>{act('nf-later');act('go','[data-s=list]');const c=qa('[data-act=plan-open]').length;act('plan-open');return c===1&&route()==='plan'&&qa('.rev').length>=23});
  T('14 飛行前点検へ（新しく登録した機体。BAT管理OFF）',()=>{act('plan-to-op');return route()==='op-pre'&&txt().includes('JU-JOURNEY-01')});
  T('15 点検→離陸待機→離陸→着陸→終了→飛行後点検→保存',()=>{
    act('op-pre-all');act('op-pre-done');if(!txt().includes('BAT管理がOFF'))return 'BAT';
    act('op-takeoff');act('op-ff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    return route()==='op-done'&&txt().includes('保存しました')&&E().flights.length===1&&E().plans.length===0;
  });
  T('16 履歴に1件→詳細→PDF（A4＋地図付き）→KML',()=>{
    act('op-open-hist');if(route()!=='hist-detail')return 'route '+route();
    act('out-both');act('out-make');const pdf=!!q('.paper.a4')&&!!q('.mapdoc');act('back');act('out-kml-open');
    return pdf&&route()==='out-kml'&&txt().includes('保存しました');
  });
  T('17 飛行リストは空に戻る（終わった計画はリストから外れる）',()=>{H.APP().root('home');act('go','[data-s=list]');return txt().includes('通報済みの計画はまだありません')});
  T('18 設定に、途中で登録したものが並んでいる',()=>{
    H.APP().root('home');act('go','[data-s=set]');const dp=qa('.li').find(x=>x.textContent.includes('DIPSのログイン情報')).textContent.includes('登録済み');act('go','[data-s=set-aircraft]');const a=txt().includes('通し機')&&dp;H.APP().back();
    act('go','[data-s=set-members]');const p=txt().includes('操縦者');H.APP().back();act('go','[data-s=set-docs]');const d=txt().includes('通し保険')&&txt().includes('通し連絡先');return a&&p&&d;
  });
  T('19 2回目: 履歴から複製して新規飛行',()=>{H.APP().root('home');act('nf-new');act('nf-layout','[data-v=app]');act('start-past');return S().cur==='use'&&S().aircraft.length===1&&S().geom.done&&S().auto.aircraft.includes('前回')});
  T('20 設定で先に機体を追加（BAT管理ON・新しいBATグループ）',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-aircraft]');act('reg-open','[data-t=aircraft]:not([data-id])');
    set('[data-bind="@d.mark"]','JU-JOURNEY-02');set('[data-bind="@d.name"]','通し機2');act('reg-set','[data-k=batOn][data-v=true]');set('[data-bind="@d.newGroup"]','通しBAT');act('reg-save');
    const a=E().aircraft.find(x=>x.mark==='JU-JOURNEY-02');return route()==='set-aircraft'&&!!a&&a.batOn&&E().batGroups.length===1;
  });
  T('21 BATがない機体で運航→BATをその場で登録→戻って選ぶ',()=>{
    H.APP().root('home');act('nf-new');act('start-nodips');const s=S();const a2=E().aircraft.find(x=>x.mark==='JU-JOURNEY-02');
    s.aircraft=[a2.id];s.pilots=[E().meId];s.biz=['空撮'];s.air=['上記空域の飛行は行わない'];s.met=['上記方法の飛行は行わない'];s.geom={kind:'circle',pts:[[180,130]],r:60,width:10,done:true,editing:false};s.from='a';s.to='b';
    window.nfGo('final');act('nf-nodips-go');act('op-pre-all');act('op-pre-done');
    if(!txt().includes('使えるBATが登録されていません'))return 'no empty state';
    act('op-bat-reg');if(route()!=='reg-bat'||!txt().includes('BATの選択'))return 'reg '+route();
    set('[data-bind="@d.label"]','BAT A');act('reg-save');
    return route()==='op-pre'&&!!A().op.cur.bat&&E().bats.length===1&&E().bats[0].label==='BAT A'&&E().bats[0].group===a2.group;
  });
  T('22 状態確認を選んで離陸→着陸→保存→BATの履歴に載る',()=>{
    act('op-bat-check','[data-v=異常なし]');act('op-pre-done');act('op-takeoff');act('op-land');act('op-land-confirm');act('op-to-post');act('op-post-all');act('op-to-final');act('op-finalize');
    const b=E().bats[0];return route()==='op-done'&&b.uses===1&&b.lastDays===0&&E().flights.length===2&&E().flights[0].kml==='none';
  });
  T('23 BAT一覧・詳細に反映されている',()=>{H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-bat]');const t1=txt().includes('BAT A');act('bat-open');return t1&&route()==='bat-detail'&&txt().includes('使用履歴')});
});
