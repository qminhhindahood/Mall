import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evidence/continuation-2026-10-19-r2/validation',runs=[];
const accepted=JSON.parse(readFileSync('src/data/enrichment-accepted.json')).records;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
for(const [mall,port]of [['saigon-centre',4421],['vincom-dong-khoi',4422]])for(const locale of ['en','vi']){
 const row={mall,locale,checks:[],failed:[]};runs.push(row);
 const assert=(pass,label)=>{row.checks.push({label,pass:!!pass});if(!pass)throw Error(label);};
 const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
 const fieldFor=d=>accepted.find(r=>r.mallId===mall&&r.destinationId===d.id)?.fields.find(f=>f.field==='website');
 const non=data.destinations.find(d=>!d.categories.includes('category-1')&&d.cuisine&&fieldFor(d))??data.destinations.find(d=>!d.categories.includes('category-1')&&fieldFor(d));
 const dining=data.destinations.find(d=>d.categories.includes('category-1')&&d.cuisine&&fieldFor(d));
 const fallback=data.destinations.find(d=>d.website&&!fieldFor(d));
 const page=await browser.newPage({viewport:{width:locale==='vi'?390:1280,height:844},reducedMotion:'reduce'});
 try{
  assert(non&&dining,'Representative non-dining and dining records have cuisine and accepted website');
  for(const [d,isDining]of [[non,false],[dining,true]]){
   const path=`/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${d.primaryFloor}&view=discovery&collection=${d.categories[0]}`;
   await page.goto(`http://localhost:${port}${path}`);
   await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
   const body=page.locator('.discovery-glass .destination-details'),cuisine=locale==='vi'?'\u1ea8m th\u1ef1c':'Cuisine';
   assert((await body.locator(':scope >dl>dt').allTextContents()).includes(cuisine)===isDining,`${d.id}: hydrated cuisine restricted to dining`);
   const staticBody=page.locator('.static-guide .destination-details');
   assert((await staticBody.locator(':scope >dl>dt').allTextContents()).includes(cuisine)===isDining,`${d.id}: static cuisine restricted to dining`);
   const type=page.locator(`[data-discovery-result][data-destination-id="${d.id}"] .discovery-type`).first();
   const categoryNames=data.categories.filter(c=>d.categories.includes(c.id)).map(c=>c.name[locale]).join(' · ');
   assert(await type.count()>0&&(await type.textContent()).startsWith(isDining?d.cuisine[locale]:categoryNames),`${d.id}: Discovery cuisine metadata restricted to dining`);
   const field=fieldFor(d),node=body.locator('[data-detail-field=website]');
   assert(await node.locator('p:not(.detail-provenance) a').getAttribute('href')===field.url,'Accepted website replacement action exact');
   const scope=field.applicability==='branch'?(locale==='vi'?'Chi nh\u00e1nh t\u1ea1i trung t\u00e2m n\u00e0y':'This mall branch'):(locale==='vi'?'To\u00e0n th\u01b0\u01a1ng hi\u1ec7u; x\u00e1c nh\u1eadn th\u00f4ng tin chi nh\u00e1nh':'Brand-wide; confirm branch information');
   assert((await node.textContent()).includes(scope)&&(await node.textContent()).includes(field.uncertainty[locale]),'Accepted website scope and exact caveat preserved');
   assert(await node.locator('.detail-provenance a').getAttribute('href')===field.sourceUrl,'Accepted website source exact');
   assert(await body.locator(':scope >p >a[target=_blank]').count()===0,'Legacy basic website duplicate absent with accepted replacement');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  }
  row.legacyFallbackRepresentative=fallback?.id??'All legacy-website records have accepted replacements in this mall';
  if(fallback){
  await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${fallback.id}?floor=${fallback.primaryFloor}&view=discovery`);
  await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
  assert(await page.locator('.discovery-glass .destination-details >p >a[target=_blank]').getAttribute('href')===fallback.website,'Legacy website remains when no accepted website exists');
  }
 }catch(error){row.failed.push(error.message);}finally{await page.close();writeFileSync(`${out}/cuisine-website-results.json`,JSON.stringify(runs,null,2));}
}
await browser.close();console.log(JSON.stringify(runs));if(runs.some(r=>r.failed.length))process.exitCode=1;
