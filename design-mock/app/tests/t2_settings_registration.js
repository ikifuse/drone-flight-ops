'use strict';
/* 各種設定・管理から事前に登録する経路（機体・BAT・人員・許可・保険・連絡先・現場プリセット） */
suite('設定・登録',H=>{
  const {T,act,txt,all,route,set,q,qa,A,E}=H;
  H.hash('scn=empty');
  T('初回の設定: 何も必須にせず、その場で機体を登録して戻れる',()=>{
    H.APP().go('init');if(route()!=='init')return 'route '+route();
    if(q('[data-act=ob-init-done]').disabled)return 'blocked';
    act('init-pilot');if(A().init.isPilot!==true)return 'pilot';
    act('reg-open','[data-t=aircraft]');if(route()!=='reg-aircraft')return 'route '+route();
    if(!txt().includes('途中です'))return 'no banner';
    set('[data-bind="@d.mark"]','JU-TEST-001');set('[data-bind="@d.name"]','テスト機1');act('reg-save');
    return route()==='init'&&E().aircraft.length===1&&txt().includes('登録済み 1');
  });
  T('初回の設定: キャンセルでは登録されない。完了でホームへ（操縦者にもなる）',()=>{
    act('reg-open','[data-t=permit]');act('reg-cancel');if(route()!=='init'||E().permits.length!==0)return 'cancel';
    act('ob-init-done');return route()==='home'&&qa('.tile').length===4&&E().people[0].roles.includes('操縦者');
  });
  T('設定メニュー→機体管理（登録済みが並ぶ）',()=>{act('go','[data-s=set]');if(route()!=='set'||!txt().includes('機体管理')||!txt().includes('BAT管理'))return 'menu';act('go','[data-s=set-aircraft]');return route()==='set-aircraft'&&txt().includes('テスト機1')});
  T('機体を追加（BAT管理ON→新しいBATグループ）',()=>{
    act('reg-open','[data-t=aircraft]:not([data-id])');if(route()!=='reg-aircraft')return 'route';
    set('[data-bind="@d.mark"]','JU-TEST-002');set('[data-bind="@d.name"]','テスト機2');
    act('reg-set','[data-k=batOn][data-v=true]');if(!txt().includes('BATグループ'))return 'no group select';
    set('[data-bind="@d.newGroup"]','テストBATグループ');act('reg-save');
    const a=E().aircraft.find(x=>x.mark==='JU-TEST-002');
    return route()==='set-aircraft'&&!!a&&a.batOn&&E().batGroups.length===1&&E().batGroups[0].name==='テストBATグループ'&&a.group===E().batGroups[0].id;
  });
  T('BAT管理: BATを登録（中古・サイクル数）',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-bat]');
    if(!txt().includes('テストBATグループ'))return 'no group';
    act('reg-open','[data-t=bat]');set('[data-bind="@d.label"]','BAT 1');act('reg-set','[data-k=source][data-v=used]');set('[data-bind="@d.cycle"]','30');act('reg-save');
    return route()==='set-bat'&&E().bats.length===1&&E().bats[0].source==='used'&&E().bats[0].cycle===30&&txt().includes('BAT 1');
  });
  T('BAT詳細（このBATを使える機体）と状態確認の更新（履歴に残る）',()=>{
    act('bat-open');if(route()!=='bat-detail'||!txt().includes('このBATを使える機体')||!txt().includes('テスト機2'))return 'detail';
    act('bat-check');act('bat-check-set','[data-v=膨らみあり]');return E().bats[0].check==='膨らみあり'&&E().bats[0].hist[0].chk.includes('手入力');
  });
  T('人員: 補助者を追加→離任→再び参加',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-members]');
    act('reg-open','[data-t=person]:not([data-id])');set('[data-bind="@d.name"]','テスト補助者');act('reg-tog','[data-k=roles][data-v=補助者]');act('reg-save');
    const p=E().people.find(x=>x.name==='テスト補助者');if(route()!=='set-members'||!p||!p.roles.includes('補助者')||p.pilot)return 'add';
    act('reg-open','[data-t=person][data-id='+p.id+']');act('person-leave');
    if(!all().includes('離任にしますか')||!all().includes('過去の飛行・点検・記録は残ります'))return 'sheet';
    act('person-leave-ok');if(p.active!==false)return 'not left';
    act('reg-open','[data-t=person][data-id='+p.id+']');act('person-rejoin');return p.active===true;
  });
  T('許可・保険・連絡先を登録',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-docs]');
    act('reg-open','[data-t=permit]:not([data-id])');set('[data-bind="@d.no"]','国空航第TEST号');act('reg-tog','[data-k=cover][data-v=DID]');act('reg-save');
    act('reg-open','[data-t=insurance]');set('[data-bind="@d.company"]','テスト保険');act('reg-save');
    act('reg-open','[data-t=contact]');set('[data-bind="@d.phone"]','09011112222');act('reg-save');
    return route()==='set-docs'&&E().permits.length===1&&E().permits[0].cover.includes('DID')&&E().insurance.company==='テスト保険'&&E().contact.phone==='09011112222';
  });
  T('現場プリセット: 範囲を作らないと保存できない。地図で作って保存',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-presets]');
    act('reg-open','[data-t=preset]');set('[data-bind="@d.name"]','テスト現場');act('reg-save');if(route()!=='reg-preset')return 'saved without geom';
    act('tool','[data-k=polygon]');window.mapTap(80,90);window.mapTap(240,80);window.mapTap(265,165);act('geom-done');
    if(!txt().includes('多角形: 3点'))return 'summary';
    act('reg-save');return route()==='set-presets'&&E().presets.length===1&&E().presets[0].geo.pts.length===3;
  });
  T('個人・会社・団体の切り替え／DIPSへの通報方法／点検整備記録／保存状態が開く',()=>{
    H.APP().root('home');act('go','[data-s=set]');
    for(const id of ['set-env','set-dips','set-maint','set-sync']){act('go','[data-s='+id+']');if(route()!==id)return 'route '+id;H.APP().back()}
    return true;
  });
  T('保存状態: オフラインにするとヘッダーに表示される（確認用の切替）',()=>{act('go','[data-s=set-sync]');act('online','[data-v="0"]');const ok=q('.hd2').innerText.includes('オフライン');act('online','[data-v="1"]');return ok});
  T('DIPSへの通報方法: 送信できる／できないで案内が変わる',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-dips]');const a=txt().includes('いま、アプリからDIPSへ送信できます');act('api','[data-v="0"]');const b=txt().includes('いまは、アプリからDIPSへ送信できません')&&txt().includes('DIPS Webで通報する');act('api','[data-v="1"]');return a&&b;
  });
  T('切り替えのシート（使う場所が1つ）',()=>{H.APP().root('home');act('env');return !!q('.sheet')&&q('.sheet').innerText.includes('どこで使いますか？')});
  T('画面一覧（確認用）から設定の画面へ移動できる',()=>{act('close');act('map');const many=qa('[data-act=mk-goto]').length>30;act('mk-goto','[data-s=set-aircraft]');return many&&route()==='set-aircraft'});
  /* サンプルの投入とBATの一覧 */
  H.hash('scn=empty');
  T('空の状態にサンプルを入れる（二重には入れない）',()=>{
    if(E().aircraft.length)return 'not empty';act('mk-sample');const ok=E().aircraft.length===3&&E().plans.length===1&&E().flights.length===3&&E().bats.length===7;act('mk-sample');return ok&&E().aircraft.length===3;
  });
  T('BAT一覧: 絞り込み（状態確認に異常あり）／BAT管理OFFだけなら案内',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-bat]');act('bat-filter','[data-v=abn]');
    const one=qa('tr[data-act=bat-open]').length===1&&txt().includes('膨らみあり');
    E().aircraft.forEach(a=>{a.batOn=false});H.APP().render();
    return one&&txt().includes('BAT管理をONにした機体がありません');
  });
});
