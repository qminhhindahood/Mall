import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
const out='evidence/vincom-plan-labels-2026-10-22';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});
try{
 for(const [locale,width] of [['en',1280],['vi',390]]){
  const p=await b.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  await p.goto(`http://127.0.0.1:4621/${locale}/${locale==='vi'?'cua-hang':'stores'}/vincom-prototype-pnj?floor=B2`);
  await p.locator('.static-guide .detail-location-summary').waitFor();
  await p.locator('.static-guide .detail-location-summary').scrollIntoViewIfNeeded();
  await p.screenshot({path:`${out}/pnj-detail-${locale}-${width}.png`,fullPage:false});
  await p.goto(`http://127.0.0.1:4621/${locale}/${locale==='vi'?'chi-duong':'directions'}?to=vincom-prototype-pnj&floor=B2`);
  await p.locator('.atlas-map-stage svg path[aria-pressed="true"]').first().waitFor();
  await p.screenshot({path:`${out}/pnj-map-${locale}-${width}.png`,fullPage:false});
  await p.goto(`http://127.0.0.1:4621/${locale}/${locale==='vi'?'kham-pha':'discovery'}?floor=B2&collectionQ=PNJ`);
  const result=p.locator('[data-discovery-result][data-destination-id="vincom-prototype-pnj"]').first();
  await result.waitFor();
  await result.scrollIntoViewIfNeeded();
  await p.screenshot({path:`${out}/pnj-discovery-${locale}-${width}.png`,fullPage:false});
  await p.close();
 }
}finally{await b.close();}
console.log('captured');
