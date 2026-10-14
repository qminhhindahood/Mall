// Browser-only visual receipts. Public outputs and the approved throwaway reference.
import {chromium} from '../../../.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const round=process.argv[2]??'before';
const root=new URL(`../evidence/visual-acceptance/${round}/`,import.meta.url);
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={base:'c15e421',round,browser:browser.version(),profile:'Localhost Chrome / SwiftShader; CSS viewport emulation; no physical-device or production benchmark',runs:[]};
const ready=async page=>{await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&!!document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);};
const capture=async(page,prefix,state)=>{await page.screenshot({path:fileURLToPath(new URL(`${prefix}-${state}.png`,root))});};
try{
for(const [mall,port,referenceMall]of [['saigon',4213,'sc'],['vincom',4214,'vc']])for(const [width,height]of [[1280,800],[820,1180],[390,844]])for(const locale of ['vi','en']){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});const page=await context.newPage();
 const prefix=`${mall}-${width}-${locale}`;const run={mall,width,height,locale,checks:[],failed:[],screens:[],errors:[]};results.runs.push(run);page.on('pageerror',e=>run.errors.push(e.message));
 await page.goto(`http://localhost:${port}/${locale}`);await ready(page);
 run.headerHidden=await page.locator('header').evaluate(e=>e.inert&&getComputedStyle(e).visibility==='hidden');
 await capture(page,prefix,'introduction');
 await page.locator('.scroll-guide').click();await ready(page);
 run.headerAfterCue=await page.locator('header').evaluate(e=>!e.inert);
 // Retain this baseline defect; use ordinary wheel input to continue the review.
 if(!run.headerAfterCue){await page.mouse.wheel(0,200);await page.waitForTimeout(450);}
 await capture(page,prefix,'overview');
 run.rail=await page.locator('.floor-rail').evaluate(e=>({count:e.children.length,rect:e.getBoundingClientRect().toJSON(),font:getComputedStyle(e.firstElementChild).fontSize}));
 if(round==='after'){
  run.overview=await page.evaluate(()=>({selectedInk:getComputedStyle(document.querySelector('.floor-rail [aria-current=page]')).color,selectedBackground:getComputedStyle(document.querySelector('.overview-stack [aria-current=page]')).backgroundColor,layers:document.querySelectorAll('.overview-stack a svg').length}));
  for(const [value,label]of [[run.overview.selectedInk==='rgb(35, 28, 23)','Selected rail label uses dark ink'],[run.overview.selectedBackground==='rgba(0, 0, 0, 0)','Selection colors polygons rather than an invented rectangle'],[run.overview.layers===run.rail.count,'Each source floor has a separated layer']])(value?run.checks:run.failed).push(label);
 }
 await page.locator('header nav a').first().click();await ready(page);await capture(page,prefix,'map');
 run.map=await page.evaluate(()=>{const control=document.querySelector('.map-controls'),map=document.querySelector('.map-transform svg');return{control:control.getBoundingClientRect().toJSON(),map:map.getBoundingClientRect().toJSON(),glass:getComputedStyle(control).backdropFilter,background:getComputedStyle(control).backgroundColor,disclosureClear:document.querySelector('.persistent-map .disclosure').getBoundingClientRect().top>=document.querySelector('.persistent-map .scene-host').getBoundingClientRect().bottom};});
 if(round==='after'){
  (run.map.disclosureClear?run.checks:run.failed).push('Source certainty disclosure clears the painted scene');
  run.contrast=await page.evaluate(()=>[document.querySelector('.map-controls>span'),...document.querySelectorAll('.map-controls button'),...document.querySelectorAll('header a')].map(e=>({rect:e.getBoundingClientRect().toJSON(),color:getComputedStyle(e).color,disabled:e.disabled??false})));
  const style=await page.addStyleTag({content:'.map-controls>span,.map-controls button,.journey-header a{color:transparent!important}.map-control-icon path{stroke:transparent!important}'});
  await capture(page,prefix,'glass-background');await style.evaluate(e=>e.remove());
  await page.locator('.map-controls button').nth(1).focus();await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  run.focus=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return{label:e.title,outline:s.outline,shadow:s.boxShadow,pressed:e.getAttribute('aria-pressed'),height:e.getBoundingClientRect().height};});
  await capture(page,prefix,'focus-selected');await page.locator('.map-controls button').last().click();
 }
 await page.locator('header nav a').nth(1).click();await ready(page);await capture(page,prefix,'discovery');
 run.discovery=await page.evaluate(()=>({scrollY,heading:document.querySelector('#scene-discovery h2').getBoundingClientRect().toJSON(),persistent:document.querySelector('.persistent-map').getBoundingClientRect().toJSON(),progress:document.querySelector('.map-discovery-journey').style.getPropertyValue('--discovery-progress'),overflow:document.documentElement.scrollWidth>innerWidth,pending:document.querySelector('.directory-panel').innerText,canvasKey:document.querySelector('canvas')?.dataset.sceneKey}));
 for(const [value,label]of [[run.headerHidden,'Introduction header hidden/inert'],[run.headerAfterCue,'Overview cue reaches header timing boundary'],[!run.discovery.overflow,'No horizontal overflow'],[run.discovery.pending.includes(locale==='vi'?'chờ duyệt':'pending'),'Public content pending'],[run.rail.count===(mall==='saigon'?8:7),'All floors in vertical rail'],[run.errors.length===0,'No page exceptions']]) (value?run.checks:run.failed).push(label);
 if(round==='after')for(const [value,label]of [[run.focus.pressed==='true'&&run.focus.outline.startsWith('rgb(35, 28, 23) solid 3px'),'Selected control retains dark keyboard focus'],[run.focus.height>=44,'44px map control targets'],[width>700||run.discovery.heading.top>=run.discovery.persistent.bottom,'Phone Discovery content clears sticky preview']])(value?run.checks:run.failed).push(label);
 await context.close();
 if(round==='before'){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});const ref=await ctx.newPage();await ref.goto('http://localhost:4215/mall-style-porcelain-prototype.html');await ref.selectOption('#mall-switch',referenceMall);await ref.locator(`.hero [data-lang=${locale}]`).click();await ref.evaluate(()=>document.fonts.ready);
  for(const state of ['hero','overview','map','discovery']){await ref.evaluate(id=>{document.getElementById(id).scrollIntoView({behavior:'instant',block:'start'});},state);await ref.waitForTimeout(450);await capture(ref,`reference-${prefix}`,state);}
  await ctx.close();
 }
 console.log(JSON.stringify({mall,width,locale,checks:run.checks.length,failed:run.failed,errors:run.errors}));
}
}finally{await writeFile(new URL('results.json',root),JSON.stringify(results,null,2));await browser.close();}
if(round==='after'&&results.runs.some(r=>r.failed.length||r.errors.length))process.exitCode=1;
