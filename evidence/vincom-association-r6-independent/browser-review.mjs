import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const out=new URL('./',import.meta.url);
const proposal=JSON.parse(await readFile(new URL('../../data/research/vincom-source-associations-2026-10-21-r1.json',out),'utf8'));
const cath=proposal.associations.find(a=>a.destinationId==='vincom-candidate-vd-b1-006');
const highlands=proposal.associations.find(a=>a.destinationId==='vincom-prototype-highlandscoffee');
const r={scope:'Activated built-preview task review: Vincom source-layout associations; existing Saigon smoke check. Installed headless Chrome CSS viewport emulation, reduced motion and no WebGL. Not physical/current-occupancy/production verification.',runs:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const check=(run,name,pass,detail)=>run.checks.push({name,pass:!!pass,...(detail?{detail}:{})});
async function shot(page,name){await page.screenshot({path:new URL(name,out).pathname.replace(/^\//,'')})}
try{
for(const width of[1280,390])for(const locale of['en','vi']){
 const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/.test(kind)?null:original.call(this,kind,...args)}});
 const page=await context.newPage(),run={width,locale,checks:[],errors:[]};r.runs.push(run);page.on('pageerror',e=>run.errors.push(e.message));
 try{
  const storePath=locale==='vi'?'cua-hang':'stores',atlasPath=locale==='vi'?'chi-duong':'directions';
  await page.goto(`http://127.0.0.1:4491/${locale}/${storePath}/${cath.destinationId}?floor=B1&view=discovery`,{waitUntil:'domcontentloaded'});
  const detail=page.locator('.detail-association-note[data-association-kind="partial-source-layout"]').first();await detail.waitFor();check(run,'Cath details explicitly label partial source area',(await detail.textContent()).trim()===cath.associationDetail.note[locale]);await detail.scrollIntoViewIfNeeded();await shot(page,`browser-${width}-${locale}-cath-detail.png`);
  await page.locator('[data-directions-handoff]').first().click();await page.locator('.atlas-association-notes').waitFor();
  check(run,'Directions handoff preserves Cath and manual origin',(await page.locator('.atlas-place').nth(1).innerText()).includes('Cath Kidston')&&await page.locator('.atlas-primary').isDisabled()&&await page.locator('.atlas-route').count()===0);
  for(const a of proposal.associations){
   await page.locator('.atlas-place').nth(1).click();const input=page.locator('.atlas-search-dialog input');await input.fill(a.name);const result=page.locator('.atlas-search-results button').filter({hasText:a.name}).first();await result.waitFor();
   const searchNote=await result.locator('.atlas-association-note').textContent();await result.click();
   await page.waitForFunction(name=>document.querySelectorAll('.atlas-place strong')[1]?.textContent===name,a.name);
   const selectedNote=await page.locator('.atlas-association-notes').innerText();const selectedPaths=await page.locator('.atlas-map-stage path[data-selected="true"]').count();
   check(run,`Association ${a.destinationId}: localized limitation, selection and region count`,searchNote?.trim()===a.associationDetail.note[locale]&&selectedNote.includes(a.associationDetail.note[locale])&&selectedPaths===a.regionIds.length,{selectedPaths,expected:a.regionIds.length});
  }
  // Return Cath to the destination, then use the actual keyboard-operable selected SVG area.
  await page.locator('.atlas-place').nth(1).click();await page.locator('.atlas-search-dialog input').fill('Cath Kidston');await page.locator('.atlas-search-results button').filter({hasText:'Cath Kidston'}).click();
  await page.locator('.atlas-map-stage path[role="button"][data-selected="true"]').first().press('Enter');const popup=page.locator('.atlas-area-selection');await popup.waitFor();
  check(run,'Map-area chooser retains explicit Cath partial limitation',(await popup.locator('[data-association-kind="partial-source-layout"]').textContent()).trim()===cath.associationDetail.note[locale]);
  await popup.scrollIntoViewIfNeeded();run.popup=await popup.evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,buttons:[...e.querySelectorAll('button')].map(b=>({text:b.textContent,rect:b.getBoundingClientRect().toJSON()}))}));await shot(page,`browser-${width}-${locale}-cath-popup.png`);
  await popup.locator('.atlas-area-close').click();
  // Manual reviewed landmark origin is chosen before the new Highlands frontage guidance appears.
  await page.goto(`http://127.0.0.1:4491/${locale}/${atlasPath}?to=${highlands.destinationId}&floor=B3`,{waitUntil:'domcontentloaded'});await page.locator('.atlas-association-notes').waitFor();check(run,'Highlands does not assume a user origin',await page.locator('.atlas-primary').isDisabled()&&await page.locator('.atlas-route').count()===0);
  await page.locator('.atlas-place').first().click();await page.locator('.atlas-search-dialog input').fill('B3-13');await page.locator('.atlas-search-results button').first().click();await page.waitForTimeout(150);
  check(run,'Explicit landmark enables reviewed Highlands frontage path',await page.locator('.atlas-primary').isEnabled()&&await page.locator('.atlas-route').count()===1);
  await page.locator('.atlas-primary').click();const step=await page.locator('.atlas-current-step').innerText();check(run,'Highlands guidance uses B3-11 frontage and manual progress',step.includes('B3-11'));
  await page.locator('.atlas-disclosure').click();run.highlandsDetails=await page.locator('.atlas-details').innerText();await page.locator('.atlas-current-step').scrollIntoViewIfNeeded();await shot(page,`browser-${width}-${locale}-highlands.png`);
  check(run,'No page errors',run.errors.length===0,run.errors);
  check(run,'No page horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }catch(e){run.failure=e.message}await writeFile(new URL('browser-receipt.json',out),JSON.stringify(r,null,2));console.log(JSON.stringify({width,locale,failure:run.failure,failed:run.checks.filter(c=>!c.pass)}));await context.close();
}
}finally{await writeFile(new URL('browser-receipt.json',out),JSON.stringify(r,null,2));await browser.close()}
