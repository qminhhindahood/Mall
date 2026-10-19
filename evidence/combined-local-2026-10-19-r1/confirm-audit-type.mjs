import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
const out='evidence/combined-local-2026-10-19-r1';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const rows=[];
for(const [mall,port] of [['saigon',4401],['vincom',4402]])for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
 await page.goto(`http://localhost:${port}/${width===390?'vi':'en'}?view=discovery`);
 await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
 const selectors=['#discovery-category-list a','.discovery-floors a','.discovery-search label','.discovery-type','.discovery-meta','.discovery-scope a','.discovery-map-context button'];
 const measured=await page.evaluate(selectors=>({overflow:document.documentElement.scrollWidth>innerWidth+1,measurements:selectors.map(selector=>{const el=document.querySelector(selector),style=el&&getComputedStyle(el),rect=el?.getBoundingClientRect();return{selector,fontSize:style?.fontSize,width:rect?.width,height:rect?.height,text:el?.textContent?.trim().slice(0,70)};})}),selectors);
 const row={mall,width,...measured,pass:!measured.overflow&&measured.measurements.every(m=>m.fontSize==='16px')};rows.push(row);
 await page.screenshot({path:`${out}/frames/impeccable-final-${mall}-${width}.png`});
 await page.close();
}
await browser.close();writeFileSync(`${out}/impeccable-type-final.json`,JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));if(rows.some(r=>!r.pass))process.exitCode=1;
