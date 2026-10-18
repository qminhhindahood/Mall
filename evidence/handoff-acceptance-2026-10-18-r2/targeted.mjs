import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const out='evidence/handoff-acceptance-2026-10-18-r2';await mkdir(`${out}/targeted`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={at:new Date().toISOString(),browser:browser.version(),profile:'Headless Chrome/SwiftShader,localhost,CSS viewports; not owner/native/production acceptance',runs:[]};
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
const check=(row,ok,label)=>(ok?row.checks:row.failed).push(label);
try{
 for(const [mall,port,count] of [['saigon',4333,8],['vincom',4334,7]])for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:800},reducedMotion:'no-preference'}),page=await context.newPage();const row={mall,width,kind:'slab-hover-focus',checks:[],failed:[]};results.runs.push(row);
  try{await page.goto(`http://localhost:${port}/en`);await ready(page);
   await page.evaluate(()=>scrollTo({top:(innerWidth<=700?document.querySelector('.registered-scene').offsetTop-116:0)+innerHeight,behavior:'instant'}));await page.waitForFunction(()=>!document.querySelector('.registered-floors').inert);
   await page.mouse.move(1,1);await page.evaluate(()=>document.activeElement?.blur());await page.waitForTimeout(160);
   const state=()=>page.evaluate(()=>{const selected=document.querySelector('.overview-stack>a.selected'),other=document.querySelector('.overview-stack>a[data-floor-id="L2"]');return{opacity:Number(getComputedStyle(selected).opacity),dim:selected.dataset.dim,selectedFill:getComputedStyle(selected.querySelector('.slab-top')).fill,otherFill:getComputedStyle(other.querySelector('.slab-top')).fill,preview:other.dataset.preview}});
   row.idle=await state();check(row,row.idle.opacity===1,'Idle selected floor retained');
   await page.locator('.floor-rail a[data-floor-id="L2"]').hover();await page.waitForTimeout(160);row.hover=await state();check(row,row.hover.dim==='true'&&row.hover.opacity===.15&&row.hover.preview==='true'&&row.hover.selectedFill!==row.hover.otherFill,'Hover another floor dims and neutralizes selected');
   await page.screenshot({path:`${out}/targeted/${mall}-${width}-hover.png`});
   await page.mouse.move(1,1);await page.waitForTimeout(160);row.restored=await state();check(row,row.restored.opacity===1&&row.restored.dim==='false','Leaving hover restores idle selection');
   await page.locator('.floor-rail a[data-floor-id="L2"]').focus();await page.waitForTimeout(160);row.focus=await state();check(row,row.focus.opacity===.15&&row.focus.preview==='true','Keyboard focus has same isolation');
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(160);check(row,(await state()).preview==='true','Reduced-motion change preserves focused preview');
   await page.evaluate(()=>document.activeElement?.blur());
   row.geometry=await page.locator('.overview-stack').evaluate(stack=>({slabs:stack.querySelectorAll('.floor-slab').length,zones:stack.querySelectorAll('.slab-reference-zone').length}));
   check(row,row.geometry.slabs===count,'Every floor uses its recovered slab');check(row,mall!=='vincom'||row.geometry.zones===107,'Vincom recovered source zones retained');
   // SVG viewBox inclusion is measured on each translated side; screenshots preserve actual presentation.
   const clipping=await page.locator('.overview-stack').evaluate(stack=>[...stack.querySelectorAll('svg')].filter(svg=>{const b=svg.querySelector('.slab-side').getBBox(),v=svg.viewBox.baseVal;return b.y+b.height+1.4>v.y+v.height+1e-6}).length);check(row,clipping===0,'All slab side bottoms fit SVG viewBox');
   await page.screenshot({path:`${out}/targeted/${mall}-${width}-restored.png`});
  }catch(e){row.failed.push(e.message)}finally{await context.close();await writeFile(`${out}/targeted-results.json`,JSON.stringify(results,null,2)+'\n')}
 }
 for(const [mall,port,geometryId,gapId,gapFloor] of [['saigon-centre',4355,'saigon-prototype-currencyexchangesimcard','saigon-prototype-optical88','L3'],['vincom-dong-khoi',4356,null,null,null]])for(const locale of ['vi','en']){
  const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'}),page=await context.newPage();const row={mall,locale,kind:'private-discovery',checks:[],failed:[]};results.runs.push(row);
  try{
   const geometry=await (await fetch(`http://localhost:${port}/data/floor-geometry.json`)).json();check(row,mall!=='saigon-centre'||geometry.floors.reduce((n,f)=>n+f.regions.filter(r=>r.id.startsWith('proposal-20261018-r4-')).length,0)===35,'Private research includes exact accepted35 candidate regions');
   await page.goto(`http://localhost:${port}/${locale}?view=discovery&floor=B2`);await ready(page);await page.waitForFunction(()=>!document.querySelector('#scene-discovery').inert);
   const notice=await page.locator('.discovery-notice').innerText();row.notice=notice;check(row,notice.includes(locale==='vi'?'chưa duyệt':'not approved'),'Private Discovery has localized pending-publication notice');check(row,await page.locator('[data-discovery-result]').count()>0,'Actual Discovery has research results');check(row,await page.locator('.discovery-glass img,[data-discovery-results] img').count()===0,'No unresolved photos appear');
   if(geometryId){
    await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${geometryId}?view=discovery&floor=B2`);await ready(page);await page.waitForSelector('.discovery-glass');
    check(row,await page.locator('.map-transform path[aria-pressed="true"]').count()>0,'Accepted geometry selection highlights real Discovery map');
    await page.screenshot({path:`${out}/targeted/${mall}-${locale}-accepted-discovery.png`});
    const candidate=JSON.parse(await readFile('docs/content-preparation/integration-candidate-2026-10-18-r2/saigon-centre.private.json','utf8'));const gap=candidate.records.find(r=>r.originalLocationGaps.length&&r.id!==geometryId);const existingResearch=JSON.parse(await readFile('data/research/saigon-centre.json','utf8'));const actualGap=candidate.records.find(r=>r.originalLocationGaps.length&&existingResearch.records.some(x=>x.id===r.id));const floor=actualGap.originalLocationGaps[0].floor;
    await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${actualGap.id}?view=discovery&floor=${floor}`);await ready(page);await page.waitForSelector('.discovery-glass');check(row,await page.locator('.map-transform path[aria-pressed="true"]').count()===0,'Unresolved location remains accessible with no selected precise marker');row.unmarkedId=actualGap.id;
   }else await page.screenshot({path:`${out}/targeted/${mall}-${locale}-discovery.png`});
  }catch(e){row.failed.push(e.message)}finally{await context.close();await writeFile(`${out}/targeted-results.json`,JSON.stringify(results,null,2)+'\n')}
 }
}finally{await browser.close()}
console.log(JSON.stringify(results.runs.map(r=>({mall:r.mall,width:r.width,locale:r.locale,checks:r.checks.length,failed:r.failed}))));if(results.runs.some(r=>r.failed.length))process.exitCode=1;
