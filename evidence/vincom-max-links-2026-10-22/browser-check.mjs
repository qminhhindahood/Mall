import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evidence/vincom-max-links-2026-10-22';
const packet=JSON.parse(readFileSync('data/research/vincom-max-source-units-2026-10-22-r1.json','utf8'));
const site=JSON.parse(readFileSync(`${out}/runtime-after.json`,'utf8'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
const results=[];
try {
 for(const locale of ['en','vi'])for(const width of [1280,390]) {
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  for(const row of [...packet.associations,...packet.sharedAssociations]) {
   const result={locale,width,destinationId:row.destinationId,checks:[],errors:[]};results.push(result);
   const onError=e=>result.errors.push(e.message);page.on('pageerror',onError);
   try {
    const name=site.destinations.find(d=>d.id===row.destinationId).name[locale];
    await page.goto(`http://127.0.0.1:4621/${locale}/${locale==='vi'?'cua-hang':'stores'}/${row.destinationId}?floor=${row.floorId}`);
    const href=await page.locator(`a[href*="to=${row.destinationId}"]`).first().getAttribute('href');
    assert.ok(href.includes(`floor=${row.floorId}`));result.checks.push('Static detail retains destination and floor handoff');
    await page.goto(new URL(href,page.url()).href);
    await page.locator('astro-island:not([ssr])').waitFor();
    const selected=page.locator('.atlas-map-stage svg path[aria-pressed="true"]');
    await selected.first().waitFor({timeout:7000});assert.equal(await selected.count(),row.regionIds.length);
    assert.ok((await selected.first().getAttribute('aria-label')).includes(name));result.checks.push('Correct named source area highlights');
    assert.equal(await page.locator('.atlas-primary').isDisabled(),true);result.checks.push('No unsupported walking route added');
    await selected.first().focus();await page.keyboard.press('Enter');
    const popup=page.locator('.atlas-area-selection');await popup.waitFor();
    assert.ok((await popup.innerText()).includes(name));result.checks.push('Keyboard map selection lists requested destination');
    await page.locator('.atlas-disclosure').click();
    const note=page.locator('.atlas-details .atlas-association-note').filter({hasText:name});
    assert.ok((await note.innerText()).includes(row.associationDetail.note[locale]));result.checks.push('Full bilingual boundary/occupancy qualification available');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);result.checks.push('No horizontal overflow');
    assert.deepEqual(result.errors,[]);result.checks.push('No page errors');
    if(['vincom-prototype-matsuya','vincom-prototype-urbanrevivo'].includes(row.destinationId)&&width===390) await page.screenshot({path:`${out}/${row.destinationId}-${locale}-${width}.png`});
   } catch(error) {result.failure=String(error);result.url=page.url();}
   finally {page.off('pageerror',onError);}
   writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2)+'\n');
  }
  await page.close();
 }
}finally{await browser.close();writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2)+'\n');}
console.log(JSON.stringify({cases:results.length,passed:results.filter(r=>!r.failure).length,failures:results.filter(r=>r.failure)}));
if(results.some(r=>r.failure))process.exitCode=1;
