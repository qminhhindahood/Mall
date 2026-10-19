import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
const out='evidence/combined-local-2026-10-19-r1',runs=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
for(const [mall,port] of [['saigon-centre',4401],['vincom-dong-khoi',4402]])for(const locale of ['en','vi']){
 const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`)),d=data.destinations.find(d=>d.id.endsWith('meatmeet'));
 const row={mall,locale,checks:[],failed:[]};runs.push(row);const assert=(v,label)=>{row.checks.push({label,pass:!!v});if(!v)throw Error(label);};
 const page=await browser.newPage({viewport:{width:locale==='vi'?390:1280,height:844},reducedMotion:'reduce'});
 const path=`/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${d.primaryFloor}`;
 try{
  await page.goto(`http://localhost:${port}${path}&view=discovery`);await ready(page);
  const body=page.locator('.discovery-glass .destination-details'),text=await body.textContent();
  assert(await body.locator('[data-detail-field=menu] p:not(.detail-provenance) a[href="https://meatandmeet.com.vn/vi/menu/"]').count()===1,'Official menu source link, no copied prices');
  assert((await body.locator('[data-detail-field=menu]').textContent()).includes(locale==='vi'?'toàn thương hiệu':'Brand-wide'),'Menu branch uncertainty explicit');
  assert(!(await body.textContent()).includes('not owner approved') && !(await body.textContent()).includes('chưa được chủ dự án'),'Approved additions have no provisional owner warning');
  if(mall==='vincom-dong-khoi')assert(await body.locator('[data-detail-field=phone] a[href^="tel:"]').count()===0,'Conflicting hotline withheld');
  else assert(await body.locator('a[href="tel:02866505058"]').count()===1,'Saigon branch telephone exact source value');
  await body.locator('[data-detail-field=menu] p:not(.detail-provenance) a').scrollIntoViewIfNeeded();
  assert(await page.locator('.discovery-detail-header').evaluate(header=>{const content=header.nextElementSibling,button=header.querySelector('button'),title=header.querySelector('h3'),b=button.getBoundingClientRect(),h=header.getBoundingClientRect();return content.getBoundingClientRect().top>=h.bottom-1&&title.getBoundingClientRect().right<=b.left+1&&document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('button')===button;}),'Scrolling content cannot cover identity or close control');
  await page.screenshot({path:`${out}/frames/${mall}-${locale}-approved-menu.png`});
  const originalDetail=page.url();
  await body.locator('a[href*="view=map"]').click();await ready(page);
  assert(new URL(page.url()).searchParams.get('view')==='map','Detail View on map opens same identity');
  await page.goBack();await ready(page);
  assert(page.url()===originalDetail&&await page.locator('.discovery-glass .destination-details').textContent()===text,'Back restores Discovery detail URL and body');
  const failure=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await failure.route('**/*create-scene-runtime*.js',route=>route.abort());
  await failure.goto(`http://localhost:${port}${path}`);
  await failure.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('.error'),null,{timeout:45000});
  assert(await failure.locator('.static-guide .destination-details>p').first().textContent()===d.description[locale],'Failed 3D retains exact direct-store static description');
  await failure.close();
  await page.goto(`http://localhost:${port}${path}&view=map`);await ready(page);
  assert(await page.locator('.destination .destination-details').textContent()===text,'Map and Discovery detail bodies agree exactly');
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(`http://localhost:${port}${path}`);
  assert(await nojs.locator('.static-guide .destination-details').textContent()===text,'Static/noJS body agrees exactly');await nojs.close();
  const held=data.destinations.find(d=>!d.description[locale]);await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${held.id}?view=discovery`);await ready(page);
  assert((await page.locator('#discovery-glass-description').textContent()).includes(locale==='vi'?'chờ duyệt':'awaiting editorial review'),'Missing-description hold remains useful basic listing');
  const long=[...data.destinations].sort((a,b)=>b.description[locale].length-a.description[locale].length)[0];await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${long.id}?view=discovery`);await ready(page);
  assert(await page.locator('#discovery-glass-description').textContent()===long.description[locale],'Longest approved description intact');
  await page.locator('.discovery-glass-content>button').scrollIntoViewIfNeeded();assert(await page.locator('.discovery-glass-content>button').isVisible(),'Long details scroll to final share control');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Long detail does not overflow page');
 }catch(e){row.failed.push(e.message);}finally{await page.close();writeFileSync(out+'/detail-parity-results.json',JSON.stringify(runs,null,2));}
}
// Publication boundary: local review switch and fixture isolation, checked in shipped HTML and JS.
const boundary=[];
for(const mall of ['saigon-centre','vincom-dong-khoi'])for(const mode of ['public','fixtures']){
 const dir=mode==="public"?`dist/${mall}`:`dist/fixtures/${mall}`;let fields=0,approvedMenuFiles=0;
 const walk=path=>readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path+'/'+e.name):[path+'/'+e.name]);
 for(const file of walk(dir).filter(f=>/\.(html|js)$/.test(f))){const content=readFileSync(file,'utf8');if(content.includes('Source checked; additions await owner approval.'))fields++;if(content.includes('https://meatandmeet.com.vn/vi/menu/'))approvedMenuFiles++;}
 boundary.push({mall,mode,provisionalSourceValuesInOutput:fields,approvedMenuFiles,pass:fields===0&&(mode==="public"?approvedMenuFiles>0:approvedMenuFiles===0)});
}
writeFileSync(out+'/public-fixture-boundary.json',JSON.stringify(boundary,null,2));await browser.close();
console.log(JSON.stringify({cases:runs.length,checks:runs.reduce((n,r)=>n+r.checks.length,0),failures:runs.flatMap(r=>r.failed),boundary}));if(runs.some(r=>r.failed.length)||boundary.some(r=>!r.pass))process.exitCode=1;



