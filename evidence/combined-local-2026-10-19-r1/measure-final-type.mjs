import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const rows=[];
for(const width of [1280,390]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
 await page.goto('http://localhost:4401/en?view=discovery');
 await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
 const selectors=['#discovery-category-list a','.discovery-floors a','.discovery-search label','.discovery-type','.discovery-meta','.discovery-scope a','.discovery-map-context button','.discovery-collection-heading h3'];
 rows.push({width,measurements:await page.evaluate(selectors=>selectors.map(selector=>{const el=document.querySelector(selector),style=el&&getComputedStyle(el),rect=el?.getBoundingClientRect();return{selector,fontSize:style?.fontSize,width:rect?.width,height:rect?.height,text:el?.textContent?.trim().slice(0,70)};}),selectors)});
 await page.close();
}
await browser.close();writeFileSync('evidence/combined-local-2026-10-19-r1/impeccable-final-type-measurements.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify(rows));

