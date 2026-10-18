import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
const out='evidence/motion-highlights-2026-10-19-r1',runs=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
for(const [mall,port] of [['saigon-centre',4337],['vincom-dong-khoi',4338]])for(const [locale,width] of [['en',1280],['vi',390]]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'}),row={mall,locale,width,checks:[],failed:[]};runs.push(row);
 const assert=(ok,label)=>{row.checks.push({label,pass:!!ok});if(!ok)throw Error(label)};
 try{
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
 }catch(e){row.failed.push(e.message)}await page.close();writeFileSync(out+'/fixture-results.json',JSON.stringify(runs,null,2)+'\n');console.log(JSON.stringify(row));
}
await browser.close();if(runs.some(r=>r.failed.length))process.exitCode=1;
