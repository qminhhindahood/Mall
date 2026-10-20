import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/design-review';
const enrichment=JSON.parse(readFileSync('src/data/enrichment-accepted.json')).records;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const rows=[];
try {
for(const [mall,port] of [['saigon-centre',4431],['vincom-dong-khoi',4432]]) {
 const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
 const records=enrichment.filter(r=>r.mallId===mall);
 const dining=records.filter(r=>r.fields.some(f=>f.field==='menu')).sort((a,b)=>JSON.stringify(b.fields).length-JSON.stringify(a.fields).length)[0];
 const retail=records.filter(r=>r.fields.some(f=>f.field==='catalog')).sort((a,b)=>JSON.stringify(b.fields).length-JSON.stringify(a.fields).length)[0];
 for(const locale of ['en','vi'])for(const width of [1280,390]) {
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce',isMobile:width===390,hasTouch:width===390});
  const row={mall,locale,width,checks:[],captures:[],samples:[],consoleErrors:[]};rows.push(row);
  page.on('pageerror',e=>row.consoleErrors.push(e.message));
  const check=(value,name)=>row.checks.push({name,pass:!!value});
  try {
  for(const [kind,r] of [['dining',dining],['retail',retail]]) {
   const d=data.destinations.find(d=>d.id===r.destinationId);
   row.samples.push({kind,id:d.id,fieldCount:r.fields.length,textLength:JSON.stringify(r.fields).length});
   await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${d.primaryFloor}&view=discovery`);
   await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
   const panel=page.locator('.discovery-glass');
   check(await panel.count()===1,`${kind}: detail opens`);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${kind}: document no overflow`);
   const frame=`frames/${mall}-${locale}-${width}-${kind}`;
   await page.screenshot({path:`${out}/${frame}-top.png`});row.captures.push(`${frame}-top.png`);
   const body=panel.locator('.destination-details');
   const summary=body.locator('.indoor-guidance summary');
   await summary.click();
   const selector=body.locator('.indoor-guidance select');
   await selector.selectOption(d.primaryFloor);
   check(await body.locator('[data-floor-relation]').getAttribute('data-floor-relation')==='same-floor',`${kind}: same floor comparison`);
   const alternative=data.floors?.find(f=>f.id!==d.primaryFloor)?.id??await selector.locator('option').evaluateAll((els,target)=>els.find(e=>e.value&&e.value!==target)?.value,d.primaryFloor);
   await selector.selectOption(alternative);
   check(await body.locator('[data-floor-relation]').getAttribute('data-floor-relation')==='different-floor',`${kind}: different floor comparison`);
   await selector.focus();
   await page.screenshot({path:`${out}/${frame}-guidance.png`});row.captures.push(`${frame}-guidance.png`);
   check(await body.locator('.indoor-guidance-limit').isVisible(),`${kind}: truthful route limitation in expanded disclosure`);
   await body.locator('.detail-field').last().scrollIntoViewIfNeeded();
   await page.screenshot({path:`${out}/${frame}-bottom.png`});row.captures.push(`${frame}-bottom.png`);
   row.samples[row.samples.length-1].measurements=await panel.evaluate(panel=>{
    const header=panel.querySelector('.discovery-detail-header'),close=header.querySelector('button'),content=panel.querySelector('.discovery-glass-content');
    const c=close.getBoundingClientRect(),h=header.getBoundingClientRect(),p=panel.getBoundingClientRect();
    const values=[...panel.querySelectorAll('.destination-details p,.destination-details dt,.destination-details dd,.destination-details a,.destination-details select,.destination-details summary')].map(e=>({font:parseFloat(getComputedStyle(e).fontSize),color:getComputedStyle(e).color,text:e.textContent.trim().slice(0,60)}));
    return {close:{width:c.width,height:c.height,visible:document.elementFromPoint(c.x+c.width/2,c.y+c.height/2)?.closest('button')===close},headerVisible:h.top>=0&&h.bottom<=innerHeight,withinViewport:p.left>=0&&p.right<=innerWidth&&p.bottom<=innerHeight,panelOverflow:panel.scrollWidth>panel.clientWidth+1,contentScrollable:content.scrollHeight>content.clientHeight,minFont:Math.min(...values.map(v=>v.font)),colors:[...new Set(values.map(v=>v.color))],background:getComputedStyle(panel).backgroundColor};
   });
   const m=row.samples[row.samples.length-1].measurements;
   check(m.close.visible&&m.close.width>=44&&m.close.height>=44&&m.headerVisible,`${kind}: persistent reachable close and identity`);
   check(m.withinViewport&&!m.panelOverflow&&m.contentScrollable,`${kind}: long detail contained and scrollable`);
   check(m.minFont>=16,`${kind}: sampled factual/control text minimum16px`);
   check(await body.locator(`[data-detail-field=${kind==='dining'?'menu':'catalog'}] p:not(.detail-provenance) a`).count()===1,`${kind}: accepted action link present`);
   await page.keyboard.press('Escape');
   check(await panel.count()===0,`${kind}: Escape dismisses long details`);
  }
  }catch(e){row.error=e.stack;}finally{await page.close();writeFileSync(`${out}/results.json`,JSON.stringify(rows,null,2));}
 }
}
}finally{await browser.close();}
console.log(JSON.stringify({cases:rows.length,checks:rows.flatMap(r=>r.checks).length,failures:rows.flatMap(r=>r.checks.filter(c=>!c.pass)),errors:rows.filter(r=>r.error).map(r=>r.error)}));
if(rows.some(r=>r.error||r.checks.some(c=>!c.pass)))process.exitCode=1;
