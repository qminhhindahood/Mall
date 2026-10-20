import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
const out='evidence/continuation-2026-10-19-r2/validation',runs=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
for(const [mall,port] of [['saigon-centre',4423],['vincom-dong-khoi',4424]])for(const [locale,width] of [['en',1280],['vi',390]]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'}),row={mall,locale,width,checks:[],failed:[]};runs.push(row);
 const assert=(ok,label)=>{row.checks.push({label,pass:!!ok});if(!ok)throw Error(label)};
 try{
  // Add an alias only to the synthetic fixture identity in the intercepted document.
  await page.route('**/*',async route=>{
   if(route.request().resourceType()!=='document'){await route.continue();return;}
   const response=await route.fetch(),html=await response.text();
   const injected=html.replace(/(&quot;id&quot;:\[0,&quot;loading-test-store&quot;\].*?&quot;aliases&quot;:\[1,)\[\]/gs,'$1[[0,&quot;Điểm hẹn thử nghiệm&quot;]]');
   await route.fulfill({response,body:injected});
  });
  await page.goto(`http://localhost:${port}/${locale}?view=discovery&floor=L1&collection=cafes`);await ready(page);
  const ids=await page.locator('[data-discovery-result]').evaluateAll(as=>[...new Set(as.map(a=>a.dataset.destinationId))]);
  assert(ids.length===3&&ids.every(id=>['test-cafe','test-coffee','test-unknown'].includes(id)),'Fixture snapshot replaces approved data and preserves deterministic cafe collection');
  await page.goto(`http://localhost:${port}/${locale}?view=discovery&floor=L1&collection=cafes&area=shared-test-area`);await ready(page);await page.locator('.discovery-glass').waitFor();
  assert(await page.locator('.discovery-glass li').count()===2,'Shared mapped area exposes both independent fixture identities');
  await page.locator('.discovery-glass a[href*=loading-test-store]').click();await ready(page);
  assert(await page.locator('.discovery-glass nav a').count()===2,'Multi-floor destination exposes both verified floors');
  await page.locator('.discovery-glass nav a').filter({hasText:'L2'}).click();await ready(page);
  assert(new URL(page.url()).searchParams.get('floor')==='L2','Multi-floor switch opens verified alternate floor');
  await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/test-unknown?floor=L2&view=discovery&collection=cafes`);await ready(page);
  assert(await page.locator('.map-transform path[data-selected=true]').count()===0,'Unmapped fixture destination never invents highlight');
  await page.goto(`http://localhost:${port}/${locale}?view=discovery&floor=L1&collection=cafes&collectionQ=diem%20hen%20thu%20nghiem`);await ready(page);
  assert(await page.locator('[data-discovery-result][data-destination-id="loading-test-store"]').count()===2,'Synthetic alias finds destination across category and both floors, accent-insensitively');
  await page.goto(`http://localhost:${port}/${locale}?view=discovery&floor=L1&collection=cafes&collectionQ=Donh`);await ready(page);
  assert(await page.locator('[data-discovery-result]').count()===0&&await page.locator('.discovery-collection').getByText(locale==='vi'?'Cà phê Đồng thử nghiệm':'Dong test café',{exact:true}).count()>0&&await page.locator('.discovery-glass').count()===0,'Bounded typo suggestion never auto-selects');
  await page.goto(`http://localhost:${port}/${locale}?view=discovery&floor=L1&collection=empty`);await ready(page);
  assert(await page.locator('[data-discovery-result]').count()===0&&await page.locator('.discovery-empty').isVisible(),'Empty fixture category has truthful recovery');
 }catch(e){row.failed.push(e.message)}await page.close();writeFileSync(out+'/fixture-results.json',JSON.stringify(runs,null,2)+'\n');console.log(JSON.stringify(row));
}
await browser.close();if(runs.some(r=>r.failed.length))process.exitCode=1;


