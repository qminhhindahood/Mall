import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const out='D:/Midterm/.scratch/combined-discovery-motion-2026-10-19/evidence/combined-local-2026-10-19-r1';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={browser:browser.version(),revision:'mall-motion-refinement-2026-10-19-r1',runs:[]};
const assert=(row,pass,label)=>(pass?row.checks:row.failed).push(label);
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&(document.querySelector('canvas')?.dataset.completeFrame||document.querySelector('.error')),null,{timeout:45000});
try {
 for(const [mall,port,defaultFloor,count]of[['saigon',4401,'L5',8],['vincom',4402,'B2',7]])for(const locale of ['vi','en'])for(const mode of ['reduced-motion','no-javascript','import-fail','context-loss']){
  if(process.env.ONLY&&`${mall}-${locale}-${mode}`!==process.env.ONLY)continue;
  const row={mall,locale,mode,checks:[],failed:[]};results.runs.push(row);
  const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-javascript',reducedMotion:'reduce'});const page=await context.newPage();
  if(mode==='import-fail')await page.route('**/*create-scene-runtime*.js',route=>route.abort());
  try {
   await page.goto(`http://localhost:${port}/${locale}${mode==='import-fail'?'?__scenario=import-fail':''}`);
   if(mode==='no-javascript'){
    assert(row,await page.locator('.registered-floors .floor-rail a').count()===count,'NoJS all floor links');
    for(const a of await page.locator('.registered-floors .floor-rail a').all()){
     const url=await a.getAttribute('href');const response=await context.request.get(`http://localhost:${port}${url}`);const html=await response.text();assert(row,response.status()===200&&html.includes('static-guide')&&html.includes('<path'),`NoJS static SVG ${url}`);
    }
    const bad=await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/nonexistent`);assert(row,bad.status()===404,'Unknown destination remains truthful404');
   }else{
    await ready(page);
    if(mode==='context-loss'){
     await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForSelector('.error');
    }
    if(mode==='import-fail'||mode==='context-loss')assert(row,await page.locator('.static-guide').isVisible()&&!await page.locator('.loading-screen').count(),'3D failure releases practical SVG guide');
    await page.locator('.skip-introduction').focus();await page.keyboard.press('Enter');await ready(page);await page.waitForTimeout(100);
    assert(row,await page.locator('.persistent-map [data-floor]').getAttribute('data-floor')===defaultFloor,'Keyboard skip enters default map');
    assert(row,await page.locator('#scene-map').evaluate(e=>e===document.activeElement),'Practical map receives keyboard focus');
    await page.locator('.map-floor-rail a').filter({hasText:/^L2$/}).click();await ready(page);
    assert(row,new URL(page.url()).searchParams.get('floor')==='L2','Floor selection remains usable');
    await page.locator('.journey-header a[lang]').click();await ready(page);await page.waitForTimeout(100);
    assert(row,new URL(page.url()).searchParams.get('floor')==='L2'&&await page.locator('html').getAttribute('lang')!==(locale),'Locale retains selected floor');
    const before=page.url();await page.locator('.skip-discovery').click();await ready(page);
    assert(row,new URL(page.url()).searchParams.get('view')==='discovery'&&await page.locator('#scene-discovery').evaluate(e=>e===document.activeElement),'Discovery skip works with focus');
    await page.goBack();await ready(page);await page.waitForFunction(()=>document.activeElement?.id==='scene-map');assert(row,page.url()===before,'Back restores map and locale');
    if(mode==='reduced-motion'){
     assert(row,await page.locator('.travelling-floor').isHidden(),'Reduced motion uses direct equivalent');
     await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(150);
     const revealMiddle=await page.evaluate(()=>{const h=document.querySelector('#scene-exterior'),v=document.querySelector('.registered-scene');return h.offsetTop+h.offsetHeight+parseFloat(getComputedStyle(v).marginTop)-116+innerHeight*.75});await page.evaluate(y=>window.scrollTo(0,y),revealMiddle);await ready(page);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
     row.liveMotionState=await page.evaluate(()=>({scrollY,heroHeight:document.querySelector('#scene-exterior').offsetHeight,heroTop:document.querySelector('#scene-exterior').getBoundingClientRect().top,stageTop:document.querySelector('.exterior-floor-journey').offsetTop,motion:matchMedia('(prefers-reduced-motion: reduce)').matches,opacity:Number(getComputedStyle(document.querySelector('.registered-floors')).opacity),reveal:document.querySelector('.exterior-floor-journey').style.getPropertyValue('--floor-reveal'),pause:document.querySelector('.pause-control').textContent,url:location.href,focus:document.activeElement?.id}));
     assert(row,row.liveMotionState.opacity>0&&row.liveMotionState.opacity<1,'Live reduced-motion change restores progressive reveal');
    }
   }
  }catch(error){row.failed.push(error.message);}finally{console.log(JSON.stringify({mall,locale,mode,checks:row.checks.length,failed:row.failed}));await context.close();await writeFile(`${out}/fallback-results.json`,JSON.stringify(results,null,2)+'\n');}
 }
}finally{await browser.close();}if(results.runs.some(r=>r.failed.length))process.exitCode=1;

