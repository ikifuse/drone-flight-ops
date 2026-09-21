'use strict';
/* 各種設定・管理から事前に登録する経路（機体・BAT・人員・許可・保険・連絡先・現場プリセット） */
suite('設定・登録',H=>{
  const {T,act,txt,all,route,set,q,qa,A,E}=H;
  H.hash('scn=empty');
  T('はじめの設定: 何も必須にせず、その場で機体を登録して戻れる',()=>{
    H.APP().go('init');if(route()!=='init')return 'route '+route();
    if(q('[data-act=ob-init-done]').disabled)return 'blocked';
    act('init-open','[data-t=aircraft]');if(route()!=='reg-aircraft')return 'route '+route();
    if(!txt().includes('途中です'))return 'no banner';
    set('[data-bind="@d.mark"]','JU000000000011');set('[data-bind="@d.name"]','テスト機1');act('reg-save');
    return route()==='init'&&E().aircraft.length===1&&txt().includes('登録済み 1');
  });
  T('はじめの設定: キャンセルでは登録されない。自分の情報で操縦者にもなれる。完了でホームへ',()=>{
    act('init-open','[data-t=permit]');act('reg-cancel');if(route()!=='init'||E().permits.length!==0)return 'cancel';
    act('init-open','[data-t=me]');set('[data-bind="%name"]','設定テスト氏名','input');act('init-pilot');act('init-me-save');
    if(route()!=='init'||!E().people[0].roles.includes('操縦者'))return 'me';
    act('ob-init-done');return route()==='home'&&qa('.tile').length===4;
  });
  T('設定メニュー→機体管理（登録済みが並ぶ）',()=>{act('go','[data-s=set]');if(route()!=='set'||!txt().includes('機体管理')||!txt().includes('BAT管理'))return 'menu';act('go','[data-s=set-aircraft]');return route()==='set-aircraft'&&txt().includes('テスト機1')});
  T('機体を追加（BAT管理ON→新しいBATグループ）',()=>{
    act('reg-open','[data-t=aircraft]:not([data-id])');if(route()!=='reg-aircraft')return 'route';
    set('[data-bind="@d.mark"]','JU000000000012');set('[data-bind="@d.name"]','テスト機2');
    act('reg-set','[data-k=batOn][data-v=true]');if(!txt().includes('BATグループ'))return 'no group select';
    set('[data-bind="@d.newGroup"]','テストBATグループ');act('reg-save');
    const a=E().aircraft.find(x=>x.mark==='JU000000000012');
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
    act('reg-open','[data-t=permit]:not([data-id])');set('[data-bind="@d.no"]','国空航第000011号');act('reg-tog','[data-k=cover][data-v=DID]');act('reg-save');
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
  T('DIPSのログイン情報: 設定・管理から登録できる（未登録の表示→登録済みの表示）',()=>{
    H.APP().root('home');act('go','[data-s=set]');
    const before=txt().includes('DIPSのログイン情報')&&qa('.li').find(x=>x.textContent.includes('DIPSのログイン情報')).textContent.includes('未登録');
    act('dips-open');if(route()!=='set-dipscred'||txt().includes('途中です'))return 'route '+route();
    set('[data-bind="#dform.id"]','1234567890','input');set('[data-bind="#dform.pw"]','Abc-123-xyz','input');act('dips-save');
    if(route()!=='set'||!A().dips.registered)return 'saved '+route();
    return before&&qa('.li').find(x=>x.textContent.includes('DIPSのログイン情報')).textContent.includes('登録済み');
  });
  T('DIPSのログイン情報: 変更できる（IDは入っている・パスワードは変更するときだけ入力）。キャンセルで変わらない',()=>{
    act('dips-open');const id=q('.phone [data-bind="#dform.id"]'),pw=q('.phone [data-bind="#dform.pw"]');
    if(id.value!=='1234567890'||pw.value!==''||pw.getAttribute('placeholder')!=='変更するときだけ入力'||!txt().includes('登録済みです'))return 'form';
    set('[data-bind="#dform.id"]','9999999999','input');act('dips-cancel');if(route()!=='set'||A().dips.id!=='1234567890')return 'cancel';
    act('dips-open');set('[data-bind="#dform.id"]','9999999999','input');act('dips-save');return route()==='set'&&A().dips.id==='9999999999';
  });
  T('保存状態: オフラインにするとヘッダーに表示される（右側の切替）',()=>{act('go','[data-s=set-sync]');act('online','[data-v="0"]');const ok=q('.hd2').innerText.includes('オフライン');act('online','[data-v="1"]');return ok});
  T('DIPSへの通報方法: 送信できる／できないで案内が変わる（右側の切替）',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-dips]');const a=txt().includes('いま、アプリからDIPSへ送信できます');act('api','[data-v="0"]');const b=txt().includes('いまは、アプリからDIPSへ送信できません')&&txt().includes('DIPS Webで通報する');act('api','[data-v="1"]');return a&&b;
  });
  T('切り替えのシート（使う場所が1つ）',()=>{H.APP().root('home');act('env');return !!q('.sheet')&&q('.sheet').innerText.includes('どこで使いますか？')});
  T('画面一覧（設計確認用）から設定の画面へ移動できる',()=>{act('close');act('map');const many=qa('[data-act=mk-goto]').length>30;act('mk-goto','[data-s=set-aircraft]');return many&&route()==='set-aircraft'});
  /* サンプルの投入とBATの一覧 */
  H.hash('scn=empty');
  T('空の状態に仮データを入れる（右側の操作。二重には入れない）',()=>{
    if(E().aircraft.length)return 'not empty';act('mk-sample');const ok=E().aircraft.length===3&&E().plans.length===1&&E().flights.length===3&&E().bats.length===7;act('mk-sample');return ok&&E().aircraft.length===3;
  });
  T('BAT一覧: 絞り込み（状態確認に異常あり）／BAT管理OFFだけなら案内',()=>{
    H.APP().root('home');act('go','[data-s=set]');act('go','[data-s=set-bat]');act('bat-filter','[data-v=abn]');
    const one=qa('tr[data-act=bat-open]').length===1&&txt().includes('膨らみあり');
    E().aircraft.forEach(a=>{a.batOn=false});H.APP().render();
    return one&&txt().includes('BAT管理をONにした機体がありません');
  });
});

suite('表示値検査とパスワードの回帰',H=>{
  const {T}=H;
  T('英字の大小文字・混在、設計専用語を検出する',()=>['sample','SAMPLE','SaMpLe','test','TEST','dummy','DUMMY','仮','未決','未確定','設計','案'].every(H.banned));
  T('属性でなく入力の現在値・textarea・選択中の表示値を検査し、placeholderは許可する',()=>{
    H.hash('scn=personal');const host=document.createElement('div');document.querySelector('.phone').append(host);
    host.innerHTML='<input placeholder="例：sample@example.com"><textarea></textarea><select><option>通常</option><option>SAMPLE</option></select>';
    const input=host.querySelector('input'),area=host.querySelector('textarea'),select=host.querySelector('select');
    const clean=!H.banned(H.leftText());input.value='DUMMY';const a=H.banned(H.leftText());input.value='';area.value='TEST';const b=H.banned(H.leftText());area.value='';select.selectedIndex=1;const c=H.banned(H.leftText());host.remove();return clean&&a&&b&&c;
  });
  T('未登録は空欄と自然なplaceholder、入力後だけ伏字・表示切替',()=>{
    H.hash('scn=empty');H.APP().gotoScreen('set-dipscred');const sel='.phone [data-bind="#dform.pw"]';
    let pw=H.q(sel);if(pw.value!==''||pw.placeholder!=='パスワードを入力'||pw.type!=='password')return '初期表示';
    H.set(sel,'Abc-123-xyz','input');if(H.q(sel).type!=='password')return '伏字';
    H.act('dips-show');if(H.q(sel).value!=='Abc-123-xyz'||H.q(sel).type!=='text')return '表示';
    H.act('dips-show');return H.q(sel).type==='password';
  });
});
