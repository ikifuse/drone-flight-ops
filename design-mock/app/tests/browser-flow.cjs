/* モック専用。ローカルHTTP配信を、左画面の実クリックだけで通す。
   MOCK_URL（既定 localhost:8765）と、Playwrightの実行環境を指定して実行する。 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 let checks=0;const errors=[],requests=[];
 try{for(const width of [412,430,1320]){
  const p=await browser.newPage({viewport:{width,height:900}});
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1'&&u.hostname!=='localhost'){requests.push(u.origin);return route.abort()}return route.continue()});
  p.setDefaultTimeout(5000);
  const click=async(act,extra='')=>{await p.locator('.phone [data-act="'+act+'"]'+extra).first().click();checks++};
  const fill=async(bind,value)=>{await p.locator('.phone [data-bind="'+bind+'"]').fill(value)};
  const state=()=>p.evaluate(()=>({route:A.route,env:ENV(),account:A.account,op:A.op,done:A.opDone,plan:S}));
  const expectRoute=async r=>assert.equal((await state()).route,r);
  await p.goto(process.env.MOCK_URL||'http://127.0.0.1:8765/');
  await expectRoute('init-reg');
  assert.equal(await p.locator('.phone [data-act=init-reg-gaccount]').innerText(),'Googleアカウントを選択');
  await fill('%name','確認担当');await click('init-reg-gaccount');await click('gauth-change');
  assert.equal(await p.locator('.phone [data-bind="%name"]').inputValue(),'確認担当');
  await click('init-reg-done');await expectRoute('home');
  assert.equal(await p.locator('.phone [data-act=ob-co-new]').count(),0);
  await click('env');assert.match(await p.locator('.phone .sheet').innerText(),/現在の利用先/);await click('close');
  await click('nf-new');await expectRoute('nf-need');
  await click('nf-need-set');await expectRoute('reg-aircraft');
  await fill('@d.mark','JU000000009901');await fill('@d.name','確認機');
  await click('reg-set','[data-k=batOn][data-v=true]');await fill('@d.newGroup','共用BAT');await click('reg-save');
  await expectRoute('nf-need');assert.equal((await state()).env.aircraft.length,1);
  await click('nf-need-set');await expectRoute('reg-person');await fill('@d.name','操縦担当');await click('reg-save');
  await expectRoute('nf-need');await click('nf-need-go');await click('start-new');
  for(const n of [2,4,5]){await click('dips-picker','[data-n="'+n+'"]');const item=p.locator('.phone [data-act=dips-pick]'+(n===2?'[data-id=none]':':not([disabled])')).first();if(!(await item.getAttribute('class')).includes('sel'))await item.click();await click('dips-pick-done')}
  await click('tog-purpose','[data-v=空撮]');await click('tog-air','[data-v="上記空域の飛行は行わない"]');await click('tog-met','[data-v="上記方法の飛行は行わない"]');
  await fill('from','事務所');await fill('to','飛行現場');await click('nf-next');await click('tool','[data-k=circle]');
  await p.locator('#map').click({position:{x:100,y:100}});await p.locator('#map').click({position:{x:150,y:100}});
  await click('nf-next');await click('nf-next');
  const before=(await state()).plan;await click('nf-send-go');
  assert.equal(await p.locator('.phone .sheet [data-bind="#needForm.name"]').count(),0);
  for(const [k,v] of Object.entries({kana:'カクニン',addr:'○○市1-2-3',phone:'09000000000',email:'name@example.com'}))await fill('#needForm.'+k,v);
  await click('need-save');await click('dips-now');await fill('#dform.id','1234567890');await fill('#dform.pw','local-only');await click('dips-save');
  assert.equal((await state()).plan.planName,before.planName);assert.deepEqual((await state()).plan.geom,before.geom);
  await click('nf-send-go');await expectRoute('nf-send');await click('nf-submit');await expectRoute('nf-accepted');
  let st=await state();assert.equal(st.env.plans[0].dips,'clean');assert.equal(st.env.plans[0].kml,'saved');
  await click('nf-later');await expectRoute('home');await click('go','[data-s=list]');await click('plan-open');await click('plan-to-op');await expectRoute('op-pre');
  const bat=async label=>{await click('op-bat-reg');await fill('@d.label',label);await click('reg-save');await click('op-bat-check','[data-v="異常なし"]')};
  const pre=async()=>{for(let i=0;i<11;i++)await click('op-pre-tog','[data-i="'+i+'"]');await click('op-pre-done')};
  const fly=async()=>{await click('op-takeoff');await expectRoute('op-fly');await click('op-land');await fill('~last.min','3');await click('op-land-confirm')};
  await bat('BAT A');await pre();await fly();
  await click('op-to-bat');await bat('BAT B');
  for(let i=0;i<2;i++)await click('op-simple','[data-i="'+i+'"]');
  await click('op-bat-done');st=await state();assert.equal(st.env.bats.find(b=>b.id===st.op.cur.bat.id).label,'BAT B');
  await fly();await click('op-to-switch');await click('op-switch-reg');await fill('@d.mark','JU000000009902');await fill('@d.name','交代機');await click('reg-save');await click('op-switch-pick');await expectRoute('op-pre');await pre();await fly();
  await click('op-to-post');
  const post=await p.locator('.phone [data-act=op-post-tog]').count();
  for(let i=0;i<post;i++)await p.locator('.phone [data-act=op-post-tog]').nth(i).click();
  await click('op-to-final');await click('op-finalize');await expectRoute('op-done');
  st=await state();assert.equal(st.env.flights.length,1);assert.equal(st.env.flights[0].legs.length,3);assert.equal(st.env.flights[0].dailySaved,true);assert.equal(st.done.dips,'clean');
  assert.match(await p.locator('.phone').innerText(),/運航完了/);assert.match(await p.locator('.phone').innerText(),/日常点検/);
  const personal=st.env.id;
  await click('root','[data-s=home]');await click('env');await click('ob-co-new');await click('gauth-done');await fill('&name','確認株式会社');await click('cr-name-next');
  await expectRoute('home');assert.match(await p.locator('.hd2').innerText(),/確認株式会社で使用中/);
  let joined;
  for(let i=0;i<2;i++){
    await click('env');await click('ob-co-join');await click('gauth-done');await click('ob-join-pick','[data-id=j1]');await click('ob-join-go');await click('ob-join-me','[data-id=q1]');await click('ob-join-done');
    await expectRoute('home');const current=await state();if(i)assert.equal(current.env.id,joined);else joined=current.env.id;
  }
  await click('env');await click('env-pick','[data-id="'+personal+'"]');assert.equal((await state()).env.flights.length,1);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  console.log(JSON.stringify({width,complete:true,legs:st.env.flights[0].legs.length,company:true}));await p.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);console.log(JSON.stringify({clicks:checks,errors,externalRequests:requests}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
