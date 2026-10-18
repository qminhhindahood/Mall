import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const out='evidence/discovery-handoff-2026-10-18-r5';await mkdir(`${out}/frames`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={at:new Date().toISOString(),browser:browser.version(),profile:'Local Chrome/SwiftShader; CSS desktop and phone viewports, not physical devices',runs:[]};
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
const check=(row,pass,label)=>{(pass?row.checks:row.failed).push(label);if(!pass)throw Error(label)};
const settle=page=>page.waitForTimeout(350);
try{
 for(const [mall,port] of [['saigon-centre',4355],['vincom-dong-khoi',4356]].filter(([mall])=>!process.env.CHECK_MALL||mall===process.env.CHECK_MALL))for(const locale of ['en','vi'])for(const width of [1440,390]){
  const reducedMotion=locale==='vi'?'reduce':'no-preference';
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion}),page=await context.newPage();
  const row={mall,locale,width,reducedMotion,checks:[],failed:[]};results.runs.push(row);
  try{
   await page.goto(`http://localhost:${port}/${locale}`);await ready(page);await settle(page);
   check(row,await page.locator('.introduction-bottom').evaluate(e=>getComputedStyle(e).visibility!=='hidden'&&e.getBoundingClientRect().top<innerHeight),'Hero scroll guide initially visible');
   await page.evaluate(()=>{const stage=document.querySelector('.exterior-floor-journey'),hero=document.querySelector('#scene-exterior');const start=stage.offsetTop+(innerWidth<=700?hero.offsetTop+hero.offsetHeight+24-116:0);scrollTo({top:start+innerHeight+24,behavior:'instant'});});
   await page.waitForFunction(()=>!document.querySelector('.registered-floors').inert);await ready(page);await settle(page);
   check(row,await page.locator('.introduction-bottom').evaluate(e=>e.inert&&getComputedStyle(e).visibility==='hidden'),'First-section guide hidden and inert after overview reveal');
   row.overview=await page.locator('.registered-floors').evaluate(e=>{const r=e.getBoundingClientRect(),h=e.querySelector('.overview-caption').getBoundingClientRect(),s=e.querySelector('.overview-stack').getBoundingClientRect();return{left:r.left,right:r.right,center:(r.left+r.right)/2,headingCenter:(h.left+h.right)/2,stackCenter:(s.left+s.right)/2,viewport:innerWidth}});
   check(row,Math.abs(row.overview.center-width/2)<8&&Math.abs(row.overview.headingCenter-width/2)<8&&Math.abs(row.overview.stackCenter-width/2)<8,'Overview graphic and caption share the page center');
   check(row,await page.locator('#scene-overview .disclosure').count()===0,'No obsolete left-column overview paragraphs');
   const rail=page.locator('.registered-floors .floor-rail');
   row.floors=await rail.locator('a').allTextContents();check(row,row.floors.length===(mall==='saigon-centre'?8:7),'Every supported floor remains in the vertical overview rail');
   const selected=await rail.locator('[aria-current=page]').getAttribute('data-floor-id');
   const other=selected==='L2'?'L1':'L2';await rail.locator(`[data-floor-id="${other}"]`).hover();await settle(page);
   row.hover=await page.evaluate(id=>{const slab=document.querySelector(`.overview-stack>a[data-floor-id="${id}"]`),label=document.querySelector(`.registered-floors .floor-rail a[data-floor-id="${id}"]`);return{slab:Number(getComputedStyle(slab).opacity),label:Number(getComputedStyle(label).opacity),shadow:getComputedStyle(label).boxShadow}},selected);
   check(row,row.hover.slab===.15&&row.hover.label===.15&&row.hover.shadow==='none','Floor identity fades and loses its selected outline together with its slab');
   if(locale==='en')await page.screenshot({path:`${out}/frames/${mall}-${width}-overview-hover.png`});
   await page.mouse.move(1,1);await rail.locator(`[data-floor-id="${selected}"]`).evaluate(e=>e.blur());await settle(page);
   await rail.locator('[data-floor-id="L2"]').click();await ready(page);
   await page.waitForFunction(()=>document.activeElement?.id==='scene-map');await settle(page);
   check(row,new URL(page.url()).searchParams.get('floor')==='L2','Overview floor selection enters the requested map');
   check(row,await page.locator('#scene-map .area-link,#scene-map .directory-search,#scene-map .directory-results,#scene-map details,#scene-map .fixture-notice').count()===0,'Map contains none of the removed directory, search, facilities, reference or banner blocks');
   check(row,await page.locator('#scene-map>.floors').count()===0,'Horizontal floor button row removed');
   row.mapRail=await page.locator('.map-floor-rail a').evaluateAll(links=>links.map(e=>{const r=e.getBoundingClientRect();return{label:e.textContent,x:r.x,y:r.y,width:r.width,height:r.height}}));
   check(row,row.mapRail.every((r,i)=>r.height>=44&&Math.abs(r.x-row.mapRail[0].x)<1&&(!i||r.y>row.mapRail[i-1].y)),'Map floor rail stays vertical with 44px targets and the same floor order');
   check(row,JSON.stringify(row.mapRail.map(r=>r.label))===JSON.stringify(row.floors),'Map and overview preserve identical descending floor labels');
   check(row,await page.locator('.map-floor-rail [data-floor-id=L2]').getAttribute('aria-current')==='page','Map floor rail retains selected identity');
   check(row,await page.locator('.map-floor-rail').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}),'Entire vertical map rail fits the viewport');
   check(row,await page.locator('.map-floor-rail [data-floor-id=L1]').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('a')===e}),'Vertical map controls receive pointer input including reduced motion');
   if(locale==='en')await page.screenshot({path:`${out}/frames/${mall}-${width}-map.png`});
   const map=await page.locator('.persistent-map').elementHandle();
   await page.locator('.map-floor-rail [data-floor-id=L1]').click();await ready(page);await page.waitForFunction(()=>document.querySelector('.persistent-map [data-floor]')?.dataset.floor==='L1');
   check(row,true,'Vertical rail switches the actual floor map');
   await page.locator('.discovery-introduction').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-100,behavior:'instant'}));await settle(page);
   check(row,await page.locator('.discovery-introduction').evaluate(e=>{const map=document.querySelector('#scene-map'),discovery=document.querySelector('#scene-discovery');return map.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING&&e.compareDocumentPosition(discovery)&Node.DOCUMENT_POSITION_FOLLOWING}),'Discovery invitation is a separate section between map and Discovery');
   check(row,await page.locator('.persistent-map').evaluate(e=>Number(getComputedStyle(e).opacity)<.01&&e.inert),'Map clears before the invitation reading surface');
   check(row,await page.locator('.discovery-entry').innerText()===(locale==='vi'?'Khám phá ngay':'Explore Discovery'),'Invitation has the localized Discovery action');
   if(locale==='en')await page.screenshot({path:`${out}/frames/${mall}-${width}-invitation.png`});
   await page.locator('.discovery-entry').click();await ready(page);await page.waitForFunction(()=>document.activeElement?.id==='scene-discovery');await settle(page);
   check(row,new URL(page.url()).searchParams.get('view')==='discovery','Invitation action enters Discovery with correct URL and focus');
   check(row,await map.evaluate(e=>e===document.querySelector('.persistent-map')),'Same map element persists through invitation into Discovery');
   check(row,await page.locator('.map-transform').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.top<innerHeight&&!!document.elementFromPoint(r.x+r.width/2,r.y+Math.min(r.height/2,120))?.closest('.persistent-map')}),'Discovery map remains visible above phone reading content');
   check(row,await page.locator('[data-discovery-result]').count()>0,'Discovery retains complete research listings');
   check(row,await page.locator('.map-floor-rail').evaluate(e=>getComputedStyle(e).visibility==='hidden'),'Map rail recedes in Discovery instead of covering collection controls');
   const first=page.locator('[data-discovery-result]').first();if(width===390)await first.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight+120,behavior:'instant'}));await first.click();await ready(page);await page.waitForSelector('.discovery-glass');
   check(row,new URL(page.url()).searchParams.get('view')==='discovery','Store selection keeps the floating card and retained map in Discovery');
   await page.locator('[data-close-discovery]').click();await ready(page);await page.waitForFunction(()=>!document.querySelector('.discovery-glass')&&document.activeElement?.hasAttribute('data-discovery-result'));
   check(row,true,'Closing Discovery details restores listing focus');
   if(locale==='en')await page.screenshot({path:`${out}/frames/${mall}-${width}-discovery.png`});
   check(row,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow across the revised journey');
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>new URL(location.href).searchParams.get('view')==='exterior');await ready(page);
   check(row,new URL(page.url()).searchParams.get('floor')==='L1','Reverse scrolling returns to exterior without losing selected floor');
   check(row,await page.locator('.introduction-bottom').evaluate(e=>!e.inert&&getComputedStyle(e).visibility==='visible'),'Returning to the hero restores its guide');
  }catch(error){row.failed.push(error.message)}finally{console.log(JSON.stringify({mall,locale,width,checks:row.checks.length,failed:row.failed}));await context.close();await writeFile(`${out}/browser-results.json`,JSON.stringify(results,null,2)+'\n');}
 }
}finally{await browser.close();}
if(results.runs.some(r=>r.failed.length))process.exitCode=1;
