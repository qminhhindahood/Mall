import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const out='evidence/vincom-final-review-2026-10-22';
const id='vincom-prototype-innisfree';
const results=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
try {
 for(const locale of ['en','vi'])for(const width of [1280,390]) {
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  const row={locale,width,checks:[],errors:[]};results.push(row);
  page.on('pageerror',e=>row.errors.push(e.message));
  try {
   // An old saved L1 query must still hand off to the corrected B1 location.
   await page.goto(`http://127.0.0.1:4621/${locale}/${locale==='en'?'stores':'cua-hang'}/${id}?floor=L1`);
   const href=await page.locator(`a[href*="to=${id}"]`).first().getAttribute('href');
   assert.ok(href.includes('floor=B1'));row.checks.push('Old L1 detail query hands off to B1');
   await page.goto(new URL(href,page.url()).href);
   await page.locator('astro-island:not([ssr])').waitFor();
   const target=page.locator('.atlas-place').last();
   await target.filter({hasText:'Innisfree'}).waitFor();
   assert.ok((await target.innerText()).includes('B1'));row.checks.push('Directions retains Innisfree on B1');
   assert.ok((await target.innerText()).includes(locale==='en'?'Floor confirmed only':'Chỉ xác nhận tầng'));row.checks.push('Floor-only precision remains visible');
   assert.equal(await page.locator('.atlas-map-stage svg path[aria-pressed="true"]').count(),0);row.checks.push('No invented area highlight');
   assert.equal(await page.locator('.atlas-primary').isDisabled(),true);row.checks.push('No invented walking route');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);row.checks.push('No horizontal overflow');
   assert.deepEqual(row.errors,[]);row.checks.push('No page errors');
  }catch(e){row.failure=String(e);}finally{await page.close();}
 }
}finally{await browser.close();writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2)+'\n');}
console.log(JSON.stringify({cases:results.length,passed:results.filter(r=>!r.failure).length,failures:results.filter(r=>r.failure)}));
if(results.some(r=>r.failure))process.exitCode=1;
