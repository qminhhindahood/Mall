import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const out='evidence/discovery-handoff-2026-10-18-r5';await mkdir(`${out}/frames`,{recursive:true});
const sample=await readFile(`${out}/sample-transition.js`,'utf8');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={at:new Date().toISOString(),browser:browser.version(),profile:'Local Chrome/SwiftShader; exact CSS viewport verified; programmatic forward/reverse scrolling with scroll-event flush, not native-device smoothness acceptance',runs:[]};
try{for(const [mall,port]of[['saigon',4355],['vincom',4356]])for(const [width,height]of[[2000,792],[390,844]])for(const motion of['no-preference','reduce']){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:motion}),page=await context.newPage(),row={mall,width,height,motion,failed:[]};results.runs.push(row);
 try{
  await page.goto(`http://localhost:${port}/en?view=map`);await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
  const actual=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));if(actual.width!==width||actual.height!==height)throw Error('Viewport mismatch');
  Object.assign(row,await page.evaluate(sample));
  if(motion==='no-preference')for(const [label,target]of[['entry',height*.88],['settled',120]]){
   await page.evaluate(top=>{const s=document.querySelector('#scene-discovery');scrollTo({top:scrollY+s.getBoundingClientRect().top-top,behavior:'instant'});dispatchEvent(new Event('scroll'));},target);
   await page.waitForFunction(()=>!document.querySelector('.loading-screen'));await page.waitForTimeout(150);
   await page.screenshot({path:`${out}/frames/${mall}-${width}-${label}.png`});
  }
 }catch(error){row.failed.push(error.message)}finally{console.log(JSON.stringify({mall,width,height,motion,samples:row.samples?.length,failed:row.failed}));await context.close();await writeFile(`${out}/transition-results.json`,JSON.stringify(results,null,2)+'\n');}
}}finally{await browser.close()}
if(results.runs.some(r=>r.failed.length))process.exitCode=1;
