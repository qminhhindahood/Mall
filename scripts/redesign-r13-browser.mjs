import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const phase=process.argv[2]||'before';
const dir=`evidence/home-discovery-r13/${phase}`;
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
const report=[];
for(const [mall,port] of [['saigon',4490],['vincom',4491]])for(const [device,width,height] of [['desktop',1440,1000],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 for(const view of ['home','discovery']){
  await page.goto(`http://127.0.0.1:${port}/en${view==='discovery'?(phase==='before'?'?view=discovery':'/discovery'):''}`,{waitUntil:'networkidle'});
  await page.locator('.scene-loading-status').waitFor({state:'hidden',timeout:90000});
  await page.waitForTimeout(250);
  if(view==='home')await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:`${dir}/${mall}-${device}-${view}.png`,fullPage:true});
  await page.screenshot({path:`${dir}/${mall}-${device}-${view}-viewport.png`});
  report.push({mall,device,view,url:page.url(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  if(view==='discovery'){
   await page.locator('.visitor-highlights a').first().click();
   await page.locator('[role=dialog]').waitFor();
   await page.screenshot({path:`${dir}/${mall}-${device}-details.png`});
  }
 }
 await page.close();
}
await fs.writeFile(`${dir}/report.json`,JSON.stringify(report,null,2));
await browser.close();
