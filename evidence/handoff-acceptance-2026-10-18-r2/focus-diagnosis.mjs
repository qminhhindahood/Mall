import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({reducedMotion:'reduce'});
 await page.goto('http://localhost:4337/en?view=discovery&collection=cafes');
 await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('[data-discovery-results] a'));
 const result=await page.evaluate(async()=>{
  const wait=async fn=>{const start=Date.now();while(!fn()){if(Date.now()-start>5000)throw Error('Timeout');await new Promise(r=>setTimeout(r,20));}};
  const link=document.querySelector('[data-discovery-results] a');link.click();await wait(()=>document.querySelector('.discovery-glass'));
  const locale=document.querySelector('.journey-header a[lang]');locale.click();await wait(()=>document.documentElement.lang==='vi');
  document.querySelector('[data-close-discovery]').click();await wait(()=>!document.querySelector('.discovery-glass'));
  const state=()=>({same:document.activeElement===link,connected:link.isConnected,active:document.activeElement.outerHTML.slice(0,400)});
  const immediate=state();await wait(()=>!document.querySelector('.loading-screen')&&document.activeElement===link);return {immediate,settled:state()};
 });
 console.log(JSON.stringify(result));await writeFile('evidence/handoff-acceptance-2026-10-18-r2/focus-diagnosis.json',JSON.stringify(result,null,2)+'\n');
}finally{await browser.close();}
