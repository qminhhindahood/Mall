import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation',runs=[];
const accepted=JSON.parse(readFileSync('src/data/enrichment-accepted.json')).records;
mkdirSync(`${out}/cuisine-frames`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
for(const [mall,port]of [['saigon-centre',4431],['vincom-dong-khoi',4432]])for(const locale of ['en','vi'])for(const javaScriptEnabled of [true,false]){
 const row={mall,locale,javaScriptEnabled,checks:[],failed:[]};runs.push(row);
 const assert=(pass,label)=>{row.checks.push({label,pass:!!pass});if(!pass)throw Error(label);};
 const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
 const diningIds=data.categories.filter(c=>c.name.en==='Dining').map(c=>c.id);
 const isDining=d=>d.categories.some(c=>diningIds.includes(c));
 const fieldFor=d=>accepted.find(r=>r.mallId===mall&&r.destinationId===d.id)?.fields.find(f=>f.field==='cuisine');
 const enriched=data.destinations.find(d=>isDining(d)&&fieldFor(d));
 const legacy=data.destinations.find(d=>isDining(d)&&d.cuisine&&!fieldFor(d));
 const non=data.destinations.find(d=>!isDining(d)&&d.cuisine)??data.destinations.find(d=>!isDining(d));
 const page=await browser.newPage({javaScriptEnabled,viewport:{width:locale==='vi'?390:1280,height:844},reducedMotion:'reduce'});
 const visit=async(d,view='discovery')=>{await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${d.primaryFloor}&view=${view}&collection=${d.categories[0]}`);if(javaScriptEnabled)await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});return page.locator(javaScriptEnabled?(view==='discovery'?'.discovery-glass .destination-details':'.map-detail .destination-details'):'.static-guide .destination-details');};
 const cuisineLabel=locale==='vi'?'\u1ea8m th\u1ef1c':'Cuisine';
 try{
  assert(enriched&&legacy&&non,'Accepted cuisine, baseline cuisine, and non-Dining representatives exist');
  row.representatives={enriched:enriched.id,legacy:legacy.id,nonDining:non.id};
  const field=fieldFor(enriched),body=await visit(enriched),node=body.locator('[data-detail-field=cuisine]');
  assert(await node.count()===1,'Accepted cuisine rendered once');
  assert(await node.locator(':scope > p').first().textContent()===field.value[locale],'Accepted localized cuisine exact');
  assert(!(await body.locator(':scope >dl>dt').allTextContents()).includes(cuisineLabel),'No duplicate baseline cuisine');
  const scope=field.applicability==='branch'?(locale==='vi'?'Chi nhánh tại trung tâm này':'This mall branch'):(locale==='vi'?'Toàn thương hiệu; xác nhận thông tin chi nhánh':'Brand-wide; confirm branch information');
  const scopeNode=node.locator(':scope > p').nth(1);
  assert(['branch','brand-wide'].includes(field.applicability)&&await scopeNode.isVisible()&&await scopeNode.textContent()===scope,'Cuisine applicability scope visible and exact');
  assert(await node.locator('.detail-provenance a').getAttribute('href')===field.sourceUrl,'Cuisine source exact');
  assert(await node.locator('time').getAttribute('datetime')===field.checkedAt&&(await node.textContent()).includes(field.uncertainty[locale]),'Cuisine checked date and caveat exact');
  if(javaScriptEnabled){
   const type=page.locator(`[data-discovery-result][data-destination-id="${enriched.id}"] .discovery-type`).first();
   assert((await type.textContent()).startsWith(field.value[locale]),'Discovery listing uses accepted cuisine overlay');
   const staticNode=page.locator('.static-guide [data-detail-field=cuisine]');
   assert(await staticNode.textContent()===await node.textContent(),'Static and hydrated shared cuisine details exact');
  }
  await page.screenshot({path:`${out}/cuisine-frames/${mall}-${locale}-${javaScriptEnabled?'hydrated':'no-js'}.png`});
  const legacyBody=await visit(legacy);
  assert((await legacyBody.locator(':scope >dl>dt').allTextContents()).includes(cuisineLabel)&&(await legacyBody.locator(':scope >dl>dd').allTextContents()).includes(legacy.cuisine[locale]),'Legacy cuisine fallback preserved');
  assert(await legacyBody.locator('[data-detail-field=cuisine]').count()===0,'No invented accepted cuisine for legacy fallback');
  const nonBody=await visit(non);
  assert(!(await nonBody.locator(':scope >dl>dt').allTextContents()).includes(cuisineLabel)&&await nonBody.locator('[data-detail-field=cuisine]').count()===0,'Non-Dining cuisine absent');
  if(javaScriptEnabled)assert(!(await page.locator(`[data-discovery-result][data-destination-id="${non.id}"] .discovery-type`).first().textContent()).startsWith(non.cuisine?.[locale]??'__no-cuisine__'),'Non-Dining listing ignores legacy cuisine');
 }catch(error){row.failed.push(error.message);}finally{await page.close();writeFileSync(`${out}/accepted-cuisine-results.json`,JSON.stringify(runs,null,2)+'\n');}
}
await browser.close();console.log(JSON.stringify(runs));if(runs.some(r=>r.failed.length))process.exitCode=1;
