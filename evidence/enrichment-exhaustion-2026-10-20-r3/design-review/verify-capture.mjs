import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/design-review';
const data=JSON.parse(readFileSync(out+'/results.json'));
const id=data.find(r=>r.mall==='vincom-dong-khoi').samples.find(s=>s.kind==='retail').id;
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const page=await b.newPage({viewport:{width:1280,height:844},reducedMotion:'reduce'});
await page.goto(`http://localhost:4432/vi/cua-hang/${id}?floor=L1&view=discovery`);
await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
await page.locator('.discovery-glass .indoor-guidance summary').click();
await page.locator('.discovery-glass .indoor-guidance select').selectOption('L1');
await page.locator('.discovery-glass .indoor-guidance select').selectOption('B3');
await page.locator('.discovery-glass .indoor-guidance select').focus();
const measured=await page.locator('.discovery-glass').evaluate(panel=>{
 const result={scrollX,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,panels:panel.scrollLeft,rows:[]};
 for(const el of [panel.querySelector('h3'),panel.querySelector('.destination-details>p')]){
  const text=[...el.childNodes].find(n=>n.nodeType===3),r=document.createRange();r.setStart(text,0);r.setEnd(text,1);const box=r.getBoundingClientRect();
  result.rows.push({text:el.textContent,firstCharacter:box.toJSON(),topElement:document.elementFromPoint(box.x+box.width/2,box.y+box.height/2)?.outerHTML.slice(0,200)});
 }
 return result;
});
await page.screenshot({path:out+'/frames/vincom-vi-1280-retail-guidance-verification.png'});
writeFileSync(out+'/capture-verification.json',JSON.stringify(measured,null,2));console.log(JSON.stringify(measured));await b.close();
