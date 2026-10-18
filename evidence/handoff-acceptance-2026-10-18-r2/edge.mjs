import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out='D:/Midterm/implementation/mall-visitor/evidence/handoff-acceptance-2026-10-18-r2/suite';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={at:new Date().toISOString(),browser:browser.version(),runs:[]};
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&!!document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
const check=(condition,message)=>{if(!condition)throw Error(message);};
try {
 for(const [mall,port] of [['saigon-centre',4333],['vincom-dong-khoi',4334]])for(const test of ['background-reverse-pending-latest','pending-history-back','failure-context-retry','prepared-focus-history-pause']) {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  const page=await context.newPage(),r={mall,test,errors:[]};results.runs.push(r);page.on('pageerror',e=>r.errors.push(e.message));
  if(test==='background-reverse-pending-latest'||test==='pending-history-back')await page.addInitScript(()=>{
   const native=WebGL2RenderingContext.prototype.clientWaitSync;
   WebGL2RenderingContext.prototype.clientWaitSync=function(...args){
    if(!window.__fenceHeld&&document.querySelector('canvas[aria-hidden="false"]')){window.__fenceHeld=performance.now();window.__fenceUntil=performance.now()+6500;}
    return performance.now()<window.__fenceUntil?this.TIMEOUT_EXPIRED:native.apply(this,args);
   };
  });
  try {
   await page.goto(`http://localhost:${port}/en`);await ready(page);
   if(test==='background-reverse-pending-latest'||test==='pending-history-back') {
    await page.waitForFunction(()=>window.__fenceHeld);
    await page.evaluate(()=>{window.__edgeOverlays=[];window.__edgeObserver=new MutationObserver(()=>{if(document.querySelector('.loading-screen'))__edgeOverlays.push({at:performance.now(),href:location.href});});__edgeObserver.observe(document.body,{childList:true,subtree:true});});
    for(const y of [550,0,550,0]){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(80);}
    r.preparedDuringBusy=await page.evaluate(()=>({overlays:__edgeOverlays.length,holding:performance.now()<__fenceUntil,frame:document.querySelector('canvas').dataset.completeFrame}));
    check(r.preparedDuringBusy.holding,'Background hold finished before reversal');check(r.preparedDuringBusy.overlays===0,'Prepared reverse opened overlay during background GPU work');
    await page.evaluate(()=>{__edgeObserver.disconnect();document.querySelector('.floors a[href$="/L3"]').click();});
    await page.waitForTimeout(4200);
    r.pending=await page.evaluate(()=>({loading:!!document.querySelector('.loading-screen'),inert:document.querySelector('.visitor-guide').inert}));
    check(r.pending.loading&&r.pending.inert,'Genuinely unfinished requested work lost loading gate');
    if(test==='pending-history-back') {
     await page.evaluate(()=>document.querySelector('.floors a[href$="/L2"]').click());await page.waitForTimeout(50);await page.evaluate(()=>history.back());
     await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.activeElement.id==='scene-map'&&document.querySelector('canvas')?.dataset.sceneKey.endsWith(':map:L3'));
     await page.waitForTimeout(200);
     r.back=await page.evaluate(()=>({key:document.querySelector('canvas').dataset.sceneKey,href:location.href,y:scrollY}));
     check(r.back.key.endsWith(':map:L3')&&new URL(r.back.href).searchParams.get('view')==='map'&&r.back.y>844,'Back restored departure rather than pending destination');
    } else {
     for(const selector of ['.floors a[href$="/L2"]','.introduction-controls a[lang="vi"]','.journey-header a[href*="view=discovery"]']){await page.evaluate(s=>document.querySelector(s).click(),selector);await page.waitForTimeout(50);}
     await page.evaluate(()=>history.back());await page.waitForTimeout(70);await page.evaluate(()=>history.forward());await ready(page);
     await page.waitForFunction(()=>document.activeElement.id==='scene-discovery'&&document.querySelector('canvas')?.dataset.sceneKey.endsWith(':discovery:L2'));
     await page.waitForTimeout(200);
     r.latest=await page.evaluate(()=>({lang:document.documentElement.lang,key:document.querySelector('canvas').dataset.sceneKey,focus:document.activeElement.id,href:location.href,y:scrollY}));
     check(r.latest.lang==='vi'&&r.latest.key.endsWith(':discovery:L2'),'Stale work overwrote latest selection/locale');
    }
   } else if(test==='failure-context-retry') {
    const oldCanvas=await page.locator('canvas').elementHandle();
    await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(()=>!!document.querySelector('.error')&&!document.querySelector('.loading-screen')&&!document.querySelector('.static-guide').hidden);
    await page.locator('.error button').click();await ready(page);
    r.context=await page.locator('canvas').evaluate((canvas,old)=>({pass:canvas!==old&&document.querySelectorAll('canvas').length===1}),oldCanvas);check(r.context.pass,'Context retry did not replace lost canvas');
    await page.route('**/_astro/create-scene-runtime*.js',route=>route.fulfill({status:503,body:'Deliberate import failure'}));
    await page.goto(`http://localhost:${port}/en`);await page.waitForSelector('.error');
    check(await page.locator('.static-guide svg path').count()>0,'Import failure lost static map');
    check(!await page.locator('.loading-screen').count(),'Import failure kept loader');
    await page.unroute('**/_astro/create-scene-runtime*.js');
    await Promise.all([page.waitForNavigation(),page.locator('.error button').click()]);await ready(page);
   } else {
    await page.evaluate(()=>document.querySelector('.floors a[href$="/L2"]').click());await ready(page);await page.waitForFunction(()=>document.activeElement.id==='scene-map');
    await page.evaluate(()=>document.querySelector('.journey-header a[href*="view=discovery"]').click());await ready(page);await page.waitForFunction(()=>document.activeElement.id==='scene-discovery');
    await page.evaluate(()=>history.back());await ready(page);await page.waitForFunction(()=>document.activeElement.id==='scene-map');
    await page.evaluate(()=>history.forward());await ready(page);await page.waitForFunction(()=>document.activeElement.id==='scene-discovery');
    await page.evaluate(()=>document.querySelector('.wordmark').click());await ready(page);
    await page.waitForFunction(()=>document.querySelector('canvas').dataset.sceneKey.endsWith(':exterior:all'));
    await page.locator('.pause-control').click();await page.waitForTimeout(200);
    const frames=()=>page.evaluate(()=>Number(document.querySelector('canvas').dataset.renderedFrames));
    const start=await frames();await page.waitForTimeout(400);check(await frames()===start,'Pause failed');
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.pause-control').disabled);
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.querySelector('.pause-control').disabled);await page.locator('.pause-control').click();await page.waitForTimeout(300);check(await frames()>start,'Resume failed');
    r.focus=await page.evaluate(()=>document.activeElement.className);
   }
   check(r.errors.length===0,'Browser page errors');r.pass=true;
  }catch(e){r.pass=false;r.failure=e.message;await page.screenshot({path:`${out}/${mall}-${test}-failure.png`}).catch(()=>{});}
  finally{console.log(JSON.stringify(r));await context.close();await writeFile(`${out}/edge-results.json`,JSON.stringify(results,null,2)+'\n');}
 }
}finally{await browser.close();}
if(results.runs.some(r=>!r.pass))process.exitCode=1;
