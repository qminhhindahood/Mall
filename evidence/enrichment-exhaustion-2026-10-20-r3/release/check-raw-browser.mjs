import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/release';
const provenance=JSON.parse(readFileSync(`${out}/package/provenance.json`));
const snapshot=JSON.parse(readFileSync(provenance.inputSnapshot));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
if(hash(readFileSync(provenance.inputSnapshot))!==provenance.inputSnapshotSha256)throw Error('Package input snapshot changed');
for(const path of ['src/data/enrichment-accepted.json','data/malls/saigon-centre/directory.json','data/malls/vincom-dong-khoi/directory.json']){
 const frozen=snapshot.files.find(f=>f.path===path);
 if(!frozen||hash(readFileSync(path))!==frozen.sha256)throw Error(`Expected source changed since package freeze: ${path}`);
}
const accepted=JSON.parse(readFileSync('src/data/enrichment-accepted.json')).records;
mkdirSync(`${out}/raw-package-frames`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const receipt={at:new Date().toISOString(),sourceCheckpoint:provenance.sourceHead,browser:browser.version(),scope:'Four bounded direct-destination browser cases on final raw package previews without acceptance injection; separate from the180-case acceptance-server regression.',runs:[]};
for(const [mall,port]of [['saigon-centre',4441],['vincom-dong-khoi',4442]])for(const locale of ['en','vi']){
 const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
 const d=data.destinations.find(d=>accepted.find(r=>r.mallId===mall&&r.destinationId===d.id)?.fields.some(f=>f.field==='cuisine'));
 if(!d)throw Error(`${mall}: no accepted cuisine representative in frozen source`);
 const row={mall,port,locale,width:locale==='vi'?390:1280,destinationId:d.id,checks:[],failed:[],pageErrors:[],acceptanceRequests:[]};receipt.runs.push(row);
 const assert=(pass,label)=>{row.checks.push({label,pass:!!pass});if(!pass)throw Error(label);};
 const page=await browser.newPage({viewport:{width:row.width,height:844},reducedMotion:'reduce'});
 page.on('pageerror',error=>row.pageErrors.push(error.message));
 page.on('request',request=>{if(request.url().includes('/__acceptance/'))row.acceptanceRequests.push(request.url());});
 try{
  const response=await page.goto(`http://127.0.0.1:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${d.primaryFloor}&view=discovery`);
  assert(response.status()===200,'Raw packaged direct destination returns200');
  assert(!(await response.text()).includes('/__acceptance/'),'Raw HTML has no acceptance helper injection');
  await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:60000});
  const body=page.locator(`.discovery-glass [data-destination-details="${d.id}"]`);
  assert(await body.isVisible(),'Hydrated direct destination details usable');
  assert((await body.locator(':scope >p').first().textContent())===d.description[locale],'Localized destination description exact');
  const fields=accepted.find(r=>r.mallId===mall&&r.destinationId===d.id).fields;
  for(const field of fields){
   const node=body.locator(`[data-detail-field="${field.field}"]`);
   assert(await node.count()===1,`${field.field}: one accepted detail`);
   assert(!field.url||await node.locator('p:not(.detail-provenance) a').getAttribute('href')===field.url,`${field.field}: exact action`);
   assert(!field.value||(await node.locator(':scope >p').first().textContent())===field.value[locale],`${field.field}: exact localized value`);
   assert(await node.locator('.detail-provenance a').getAttribute('href')===field.sourceUrl&&(await node.textContent()).includes(field.uncertainty[locale]),`${field.field}: exact source and caveat`);
   const scope=field.applicability==='branch'?(locale==='vi'?'Chi nhánh tại trung tâm này':'This mall branch'):(locale==='vi'?'Toàn thương hiệu; xác nhận thông tin chi nhánh':'Brand-wide; confirm branch information');
   const scopeNode=node.locator(':scope >p').nth(1);
   assert(['branch','brand-wide'].includes(field.applicability)&&await scopeNode.isVisible()&&await scopeNode.textContent()===scope,`${field.field}: applicability scope visible and exact`);
   assert(await node.locator('time').getAttribute('datetime')===field.checkedAt,`${field.field}: checked date`);
  }
  assert(!(await body.locator(':scope >dl>dt').allTextContents()).includes(locale==='vi'?'\u1ea8m th\u1ef1c':'Cuisine'),'Accepted cuisine has no duplicate baseline detail');
  assert((await page.locator(`[data-discovery-result][data-destination-id="${d.id}"] .discovery-type`).first().textContent()).startsWith(fields.find(f=>f.field==='cuisine').value[locale]),'Raw listing uses accepted cuisine');
  const guide=body.locator('[data-indoor-guidance]');
  await guide.locator('summary').focus();await page.keyboard.press('Enter');
  assert(await guide.getAttribute('open')!==null,'Native guidance disclosure opens by keyboard');
  const select=guide.locator('select');await select.waitFor();
  assert(await select.inputValue()==='','Fresh raw browser starts with unknown manual floor');
  const before=page.url();await select.selectOption(d.primaryFloor);
  await guide.locator('[data-floor-relation=same-floor]').waitFor();
  assert(await select.inputValue()===d.primaryFloor,'Packaged manual floor selector changes successfully');
  assert(page.url()===before,'Manual floor comparison preserves destination URL and selected target');
  assert(await page.evaluate(key=>sessionStorage.getItem(key),`mall-guide:starting-floor:${mall}`)===d.primaryFloor,'Manual starting floor persists in raw browser session');
  assert(await guide.locator('[data-indoor-official-link]').count()===1&&(await guide.locator('.indoor-guidance-limit').textContent()).length>50,'Official fallback and unsupported-route limitation remain useful');
  assert(await page.locator('script[src*="/__acceptance/"]').count()===0&&row.acceptanceRequests.length===0,'No acceptance helper loaded or requested');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal document overflow');
  assert(row.pageErrors.length===0,'No uncaught raw package browser errors');
  await guide.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/raw-package-frames/${mall}-${locale}.png`});
 }catch(error){row.failed.push(error.message);}finally{await page.close();writeFileSync(`${out}/raw-package-browser-smoke.json`,JSON.stringify(receipt,null,2)+'\n');}
}
await browser.close();receipt.complete=receipt.runs.length===4&&receipt.runs.every(r=>r.failed.length===0);receipt.cases=receipt.runs.length;receipt.assertions=receipt.runs.reduce((n,r)=>n+r.checks.length,0);writeFileSync(`${out}/raw-package-browser-smoke.json`,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));if(!receipt.complete)process.exitCode=1;
