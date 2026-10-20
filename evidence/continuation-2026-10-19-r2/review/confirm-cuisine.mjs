import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
const out='evidence/continuation-2026-10-19-r2/review';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const receipt={source:'3e505fb',capturedAt:new Date().toISOString(),browser:browser.version(),runs:[]};
for(const [locale,width] of [['en',1280],['vi',390]])for(const [id,floor,dining] of [['vincom-prototype-shiseido','L1',false],['vincom-prototype-gogihouse','B3',true]]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),row={locale,width,id,checks:[]};receipt.runs.push(row);
 try{
  await page.goto(`http://127.0.0.1:4422/${locale}/${locale==='vi'?'cua-hang':'stores'}/${id}?floor=${floor}&view=discovery`);
  await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
  const panel=page.locator('.discovery-glass');
  const label=panel.locator('.destination-details>dl>dt').filter({hasText:locale==='vi'?'Ẩm thực':'Cuisine'});
  row.checks.push({label:'Cuisine appears only for dining',pass:(await label.count()>0)===dining});
  if(!dining){await panel.locator('[data-indoor-guidance] summary').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/frames/vincom-${locale}-${width}-cuisine-confirmed.png`});}
 }catch(error){row.error=error.message;}finally{await page.close();}
}
await browser.close();writeFileSync(`${out}/cuisine-confirmation.json`,JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));if(receipt.runs.some(r=>r.error||r.checks.some(c=>!c.pass)))process.exitCode=1;
