import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evidence/combined-local-2026-10-19-r1';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const runs=[];
const ready=p=>p.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
for(const [mall,port] of [['saigon-centre',4401],['vincom-dong-khoi',4402]])for(const locale of ['en','vi'])for(const width of [1280,390]){
 const row={mall,locale,width,checks:[],failed:[]};runs.push(row);
 const assert=(v,label)=>{row.checks.push({label,pass:!!v});if(!v)throw Error(label);};
 const p=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
 try{
  const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
  const target=data.destinations.find(d=>d.name.en===(mall==='saigon-centre'?'NIKE':'Sony'));
  const dining=data.categories.find(c=>c.name.en==='Dining');
  await p.goto(`http://localhost:${port}/${locale}?view=discovery&collection=${dining.id}&collectionQ=${encodeURIComponent(target.name.en)}&collectionScope=category`);await ready(p);
  assert(await p.locator('[data-discovery-result]').count()===0,'Direct URL respects category restriction');
  await p.locator('.discovery-collection a').filter({hasText:locale==='vi'?'Xem kết quả ở danh mục khác':'Show matches in other categories'}).click();
  assert(!new URL(p.url()).searchParams.has('collectionScope'),'Outside-category recovery serializes global scope');
  assert(await p.locator(`[data-destination-id="${target.id}"]`).count()>0,'Retail result found from dining category');
  await p.goBack();assert(await p.locator('[data-discovery-result]').count()===0,'Back restores restricted results');
  await p.goForward();await p.locator(`[data-destination-id="${target.id}"]`).first().waitFor();
  await p.reload();await ready(p);assert(await p.locator(`[data-destination-id="${target.id}"]`).count()>0,'Refresh restores global scope');
  await p.locator('.journey-header a[lang]').click();await ready(p);
  assert(new URL(p.url()).searchParams.get('collectionQ')===target.name.en&&!new URL(p.url()).searchParams.has('collectionScope'),'Locale preserves global query and scope');
  await p.locator(`[data-destination-id="${target.id}"]`).first().click();
  await p.locator('.discovery-glass .destination-details').waitFor();
  const small=await p.locator('.discovery-glass .destination-details').evaluate(e=>[...e.querySelectorAll('p,dt,dd,a')].filter(n=>parseFloat(getComputedStyle(n).fontSize)<16).map(n=>({text:n.textContent,font:getComputedStyle(n).fontSize})));
  assert(!small.length,'Rich body, actions and provenance meet 16px minimum');
  row.practicalTypography=await p.evaluate(()=>[...document.querySelectorAll('#discovery-category-list a,.discovery-floors a,.discovery-search label,.discovery-type,.discovery-meta,.discovery-scope a,.discovery-map-context button,.discovery-collection-heading p,.discovery-intro p')].map(e=>({text:e.textContent?.trim().slice(0,60),fontSize:parseFloat(getComputedStyle(e).fontSize)})));
  assert(row.practicalTypography.length>0&&row.practicalTypography.every(e=>e.fontSize>=16),'Practical category, floor, scope, metadata and map controls meet 16px minimum');
  await p.locator('.discovery-glass-content>button').scrollIntoViewIfNeeded();
  assert(await p.locator('.discovery-detail-header button').evaluate(b=>{const r=b.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===b;}),'Close remains hit-testable after enlarged long body scroll');
  if(width===390){
   await p.locator('.discovery-map-context button').click();
   assert(await p.locator('.scene-host-map').isVisible(),'Expanded map remains reachable with detail open');
   assert(await p.locator('.discovery-map-context button').evaluate(b=>parseFloat(getComputedStyle(b).fontSize)>=16),'Mobile map expansion control meets 16px minimum');
   await p.locator('.map-controls button').nth(1).click();
   assert(await p.locator('.discovery-glass').count()===1,'Map tools retain detail with larger type');
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  row.renderedLocale=await p.locator('html').getAttribute('lang');row.screenshot=`${mall}-${row.renderedLocale}-${width}.png`;
  await p.screenshot({path:`${out}/${row.screenshot}`});
 }catch(e){row.failed.push(e.message);}finally{await p.close();writeFileSync(out+'/review-results.json',JSON.stringify(runs,null,2));}
}
await browser.close();console.log(JSON.stringify({cases:runs.length,assertions:runs.reduce((n,r)=>n+r.checks.length,0),failed:runs.flatMap(r=>r.failed)}));
if(runs.some(r=>r.failed.length))process.exitCode=1;

