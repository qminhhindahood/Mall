import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const out='evidence/continuation-2026-10-19-r2/validation',runs=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=p=>p.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
try{
 for(const [mall,port]of[['saigon',4421],['vincom',4422]])for(const [locale,width]of[['en',1920],['vi',390]]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1080},hasTouch:width===390,reducedMotion:'no-preference'}),page=await context.newPage(),row={mall,locale,width,checks:[],failed:[]};runs.push(row);
  const check=(ok,label)=>{row.checks.push({label,pass:!!ok});if(!ok)throw Error(label)};
  try{
   await page.goto(`http://localhost:${port}/${locale}`);await ready(page);
   const pause=page.locator('.pause-control');await pause.click();
   check(await pause.getAttribute('aria-pressed')==='true','Pause control acknowledges stopped automatic motion');
   await page.reload();await ready(page);check(await pause.getAttribute('aria-pressed')==='true','Pause choice survives refresh');
   await pause.click();check(await pause.getAttribute('aria-pressed')==='false','Resume restores automatic presentation');
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.pause-control')?.disabled&&document.querySelector('.pause-control')?.getAttribute('aria-pressed')==='true');check(await pause.isDisabled()&&await pause.getAttribute('aria-pressed')==='true','Live reduced motion stops presentation and disables Resume');
   await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.querySelector('.pause-control')?.disabled);check(!await pause.isDisabled(),'Live motion preference restores usable Pause/Resume');
   await page.evaluate(()=>{const stage=document.querySelector('.exterior-floor-journey'),destination=document.querySelector('.map-discovery-journey'),map=document.querySelector('.persistent-map');const start=stage.offsetTop+stage.offsetHeight-innerHeight,end=destination.offsetTop-(parseFloat(getComputedStyle(map).top)||0);scrollTo({top:start+Math.max(innerHeight*.45,end-start)*.5,behavior:'instant'})});
   await page.waitForTimeout(200);await ready(page); row.travelGeometry=await page.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,left:r.left,width:r.width,height:r.height,style:e.getAttribute('style')}};return {scrollY,viewport:{width:innerWidth,height:innerHeight},layer:q('.travelling-floor'),target:q('.map-transform'),source:q('.registered-floors'),progress:document.querySelector('.exterior-floor-journey')?.style.getPropertyValue('--floor-travel'),map:q('.persistent-map')}});
   await page.screenshot({path:`${out}/frames/${mall}-${locale}-${width}-selected-floor-travel.png`});
   check(await page.locator('.travelling-floor').isVisible(),'Selected floor remains visible during intermediate travel');
   const floorPath=locale==='en'?'floors':'tang';
   await page.goto(`http://localhost:${port}/${locale}/${floorPath}/L2`);await ready(page);await page.waitForFunction(()=>document.activeElement?.id==='scene-map');
   check(await page.locator('.map-floor-rail [data-floor-id=L2]').getAttribute('aria-current')==='page','Direct floor entry bypasses presentation into L2');
   await page.reload();await ready(page);await page.waitForFunction(()=>document.activeElement?.id==='scene-map');
   check(await page.locator('.map-floor-rail [data-floor-id=L2]').getAttribute('aria-current')==='page','Direct floor refresh retains L2 and map focus');
   await page.locator('.skip-discovery').click();await ready(page);
   const first=page.locator('[data-discovery-result]').first();await first.focus();await page.keyboard.press('Enter');await page.locator('.discovery-glass').waitFor();const direct=page.url();
   await page.reload();await ready(page);await page.locator('.discovery-glass').waitFor();
   check(page.url()===direct,'Direct store refresh retains exact destination/floor/locale');
   await page.keyboard.press('Escape');await page.goBack();await ready(page);await page.locator('.discovery-glass').waitFor();check(true,'Back restores selected store');
   await page.goForward();await ready(page);check(await page.locator('.discovery-glass').count()===0,'Forward restores closed-store state');
  }catch(e){row.failed.push(e.message)}
  finally{await context.close();await writeFile(`${out}/entry-controls-results.json`,JSON.stringify(runs,null,2)+'\n');console.log(JSON.stringify(row))}
 }
}finally{await browser.close()}
if(runs.some(r=>r.failed.length))process.exitCode=1;




