import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out='evidence/journey-layout-2026-10-18-r3';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={at:new Date().toISOString(),browser:browser.version(),runs:[]};
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen'),null,{timeout:45000});
const check=(row,ok,label)=>{if(!ok)throw Error(label);row.checks.push(label)};
try{for(const [mall,publicPort,fixturePort,researchPort]of[['saigon',4333,4337,4355],['vincom',4334,4338,4356]])for(const locale of ['en','vi']){
 for(const mode of ['no-js','import-failure','direct-details']){
  const context=await browser.newContext({javaScriptEnabled:mode!=='no-js',reducedMotion:'reduce',viewport:{width:1280,height:900}}),page=await context.newPage();
  const row={mall,locale,mode,checks:[],failed:[]};results.runs.push(row);
  try{
   const floorPath=locale==='vi'?'tang':'floors',storePath=locale==='vi'?'cua-hang':'stores';
   if(mode==='no-js'){
    const response=await page.goto(`http://localhost:${publicPort}/${locale}/${floorPath}/L2`);
    check(row,response.status()===200,'Static localized floor route returns 200');
    check(row,await page.locator('.static-guide svg').count()>0,'No-JavaScript guide retains source map');
    check(row,await page.locator('.static-guide a').count()>0,'No-JavaScript guide retains ordinary floor navigation');
    check(row,await page.locator('.static-guide article').count()===0,'Public static guide invents no unapproved destination');
   }else if(mode==='import-failure'){
    await page.route(/\/_astro\/create-scene-runtime.*\.js/,route=>route.abort());
    await page.goto(`http://localhost:${researchPort}/${locale}/${floorPath}/L2`);await ready(page);await page.waitForSelector('.error');
    check(row,await page.locator('.map-transform svg').count()>0,'SVG map survives unavailable 3D');
    await page.locator('.map-floor-rail [data-floor-id=L1]').click();await ready(page);
    check(row,new URL(page.url()).searchParams.get('floor')==='L1','Vertical map rail works after module failure');
    await page.locator('.discovery-entry').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.locator('.discovery-entry').click();await ready(page);
    check(row,new URL(page.url()).searchParams.get('view')==='discovery','Invitation enters usable Discovery after module failure');
    check(row,await page.locator('[data-discovery-result]').count()>0,'Discovery listings survive unavailable 3D');
   }else{
    await page.goto(`http://localhost:${fixturePort}/${locale}/${storePath}/loading-test-store?floor=L2&view=map`);await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame&&document.activeElement?.classList.contains('destination'),null,{timeout:45000});
    check(row,await page.locator('.persistent-map [data-floor]').getAttribute('data-floor')==='L2','Direct destination link retains its requested floor');
    check(row,await page.locator('.destination nav a').count()===2,'Compact details retain verified multi-floor choices');
    check(row,await page.locator('#scene-map .directory-search,#scene-map details').count()===0,'Direct details do not restore removed map clutter');
    await page.locator('.destination nav a[href*="floor=L1"]').click();await ready(page);
    check(row,new URL(page.url()).searchParams.get('floor')==='L1','Compact destination details switch verified floors');
    await page.locator('.destination button').first().click();await ready(page);
    check(row,await page.locator('.destination').count()===0,'Compact destination details close normally');
   }
  }catch(error){row.failed.push(error.message)}finally{console.log(JSON.stringify(row));await context.close();await writeFile(`${out}/boundary-results.json`,JSON.stringify(results,null,2)+'\n');}
 }
}}finally{await browser.close()}
if(results.runs.some(r=>r.failed.length))process.exitCode=1;
