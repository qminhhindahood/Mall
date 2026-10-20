import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const out='evidence/continuation-2026-10-19-r2/review';mkdirSync(`${out}/frames`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const receipt={source:'7ce14e29b48f451515792d28e4583ec387d9f986',capturedAt:new Date().toISOString(),browser:browser.version(),runs:[]};
for(const [mall,port,id] of [['saigon-centre',4421,'saigon-prototype-louisvuitton'],['vincom-dong-khoi',4422,'vincom-prototype-shiseido']])for(const [locale,width] of [['en',1280],['vi',390]]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),row={mall,id,locale,width,checks:[],errors:[]};receipt.runs.push(row);
 const check=(pass,label)=>{row.checks.push({label,pass:!!pass});if(!pass)throw Error(label);};
 try{
  const d=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`)).destinations.find(d=>d.id===id);
  await page.goto(`http://127.0.0.1:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${id}?floor=${d.primaryFloor}&view=discovery`);
  await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
  const panel=page.locator('.discovery-glass'),guide=panel.locator('[data-indoor-guidance]');
  await guide.locator('summary').scrollIntoViewIfNeeded();await guide.locator('summary').focus();await page.keyboard.press('Enter');
  await guide.locator('select').selectOption(d.primaryFloor);await guide.locator('select').scrollIntoViewIfNeeded();
  check(await guide.locator('[data-floor-relation=same-floor]').count()===1,'Manual starting floor compares against selected target');
  check(await guide.locator('select').evaluate(e=>{const s=getComputedStyle(e);return parseFloat(s.fontSize)>=16&&e.getBoundingClientRect().height>=44;}),'Select retains 16px text and 44px target');
  const readable=()=>panel.locator('.discovery-detail-header').evaluate(header=>{const button=header.querySelector('button'),r=button.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===button;});
  check(await readable(),'Expanded guidance keeps fixed close control reachable');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Expanded guidance has no page overflow');
  await page.screenshot({path:`${out}/frames/${mall}-${locale}-${width}-guidance.png`});
  await guide.locator('[data-indoor-official-link]').scrollIntoViewIfNeeded();check(await readable(),'Official fallback remains scroll-reachable with close control');
  await panel.locator('[data-detail-field]').last().scrollIntoViewIfNeeded();
  check(await panel.locator('[data-detail-field]').count()>=5,'Long accepted detail record exercises five fields');
  check(await readable(),'Long accepted fields keep fixed close control reachable');
  await page.screenshot({path:`${out}/frames/${mall}-${locale}-${width}-accepted.png`});
  await panel.locator('.discovery-glass-content>button').scrollIntoViewIfNeeded();check(await panel.locator('.discovery-glass-content>button').isVisible(),'Final share action remains reachable');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Long accepted information has no page overflow');
 }catch(error){row.errors.push(error.message);}finally{await page.close();writeFileSync(`${out}/rendered-review-results.json`,JSON.stringify(receipt,null,2));}
}
await browser.close();console.log(JSON.stringify(receipt));if(receipt.runs.some(r=>r.errors.length))process.exitCode=1;
