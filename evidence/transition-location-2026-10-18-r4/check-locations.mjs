import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const out='evidence/transition-location-2026-10-18-r4';
const candidate=JSON.parse(await readFile('docs/content-preparation/integration-candidate-2026-10-18-r2/saigon-centre.private.json','utf8'));
const parents=candidate.records.flatMap(r=>r.geometryCandidates.filter(a=>a.sharedAreaRole==='shared-parent-area').map(a=>({id:r.id,floor:a.floor,region:a.regionId})));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const result={at:new Date().toISOString(),browser:browser.version(),parents,unitHold:'L5-05',runs:[]};
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
const check=(row,ok,label)=>{if(!ok)throw Error(label);row.checks.push(label)};
try{for(const [mall,port]of[['saigon-centre',4355],['vincom-dong-khoi',4356]])for(const locale of ['en','vi']){
 const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:900}}),page=await context.newPage();
 const row={mall,locale,checks:[],failed:[]};result.runs.push(row);
 try{
  await page.goto(`http://localhost:${port}/${locale}?view=discovery`);await ready(page);await page.waitForFunction(()=>document.activeElement?.id==='scene-discovery');
  check(row,await page.locator('.discovery-highlights').count()===1,'Dedicated Highlights section exists alongside the complete collection');
  check(row,await page.locator('.discovery-highlights a').count()===0,'No unapproved restaurant/shop recommendations invented');
  check(row,(await page.locator('.discovery-highlights p').innerText()).includes(locale==='vi'?'Chưa có':'No recommended'),'Empty recommendation state is localized and truthful');
  const spacing=await page.evaluate(()=>{const overview=document.querySelector('.exterior-floor-journey'),map=document.querySelector('.map-reading'),invite=document.querySelector('.discovery-introduction');return{overviewGap:parseFloat(getComputedStyle(overview).marginBottom),mapHeight:map.getBoundingClientRect().height,before:parseFloat(getComputedStyle(invite).marginTop),after:parseFloat(getComputedStyle(invite).marginBottom),h:innerHeight}});
  row.spacing=spacing;
  check(row,spacing.overviewGap>=spacing.h&&spacing.mapHeight>=spacing.h*1.4&&spacing.before>=spacing.h*.3&&spacing.after>=spacing.h*.3,'Expanded scroll space separates overview, map, invitation and Discovery');
  if(mall==='saigon-centre'){
   const geometry=await (await fetch(`http://localhost:${port}/data/floor-geometry.json`)).json();
   check(row,!geometry.floors.some(f=>f.regions.some(r=>parents.some(p=>p.region===r.id))),'Four ambiguous parent polygons omitted from the effective private map');
   check(row,geometry.floors.flatMap(f=>f.regions).filter(r=>r.id.startsWith('proposal-20261018-r4-')).length===31,'Other independent accepted candidate regions retained');
   for(const item of [...parents,{id:'saigon-prototype-yakinikulike',floor:'L5'}]){
    await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${item.id}?view=discovery&floor=${item.floor}`);await ready(page);await page.waitForSelector('.discovery-glass');
    check(row,await page.locator('.map-transform path[data-selected=true]').count()===0,`${item.id}: no false precise-area highlight`);
    check(row,(await page.locator('.discovery-glass').innerText()).includes(item.floor),`${item.id}: floor/card access retained`);
   }
   await page.screenshot({path:`${out}/frames/saigon-${locale}-held-unit.png`});
  }
 }catch(error){row.failed.push(error.message)}finally{console.log(JSON.stringify(row));await context.close();await writeFile(`${out}/location-results.json`,JSON.stringify(result,null,2)+'\n');}
}}finally{await browser.close()}
if(result.runs.some(r=>r.failed.length))process.exitCode=1;
