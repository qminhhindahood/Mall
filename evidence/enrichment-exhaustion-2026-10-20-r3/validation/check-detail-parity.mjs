import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation',runs=[];
const acceptedDocument=JSON.parse(readFileSync('src/data/enrichment-accepted.json'));
const menuSentinels=[...new Set(acceptedDocument.records.filter(r=>r.destinationId.endsWith('meatmeet')).flatMap(r=>r.fields.filter(f=>f.field==='menu').map(f=>f.url)))];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
// Guidance has a deliberately client-only manual selector. Preserve exact parity
// for every pre-existing detail node; its static guidance is checked separately.
const essentialText=locator=>locator.evaluate(element=>{const clone=element.cloneNode(true);clone.querySelector('[data-indoor-guidance]')?.remove();return clone.textContent;});
for(const [mall,port] of [['saigon-centre',4431],['vincom-dong-khoi',4432]])for(const locale of ['en','vi'].filter(l=>!process.env.CHECK_LOCALE||l===process.env.CHECK_LOCALE)){
 const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`)),d=data.destinations.find(d=>d.id.endsWith('meatmeet'));
 const row={mall,locale,checks:[],failed:[]};runs.push(row);const assert=(v,label)=>{row.checks.push({label,pass:!!v});if(!v)throw Error(label);};
 const page=await browser.newPage({viewport:{width:locale==='vi'?390:1280,height:844},reducedMotion:'reduce'});
 const path=`/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${d.primaryFloor}`;
 try{
  await page.goto(`http://localhost:${port}${path}&view=discovery`);await ready(page);
  const body=page.locator('.discovery-glass .destination-details'),text=await essentialText(body);
  const acceptedMenu=acceptedDocument.records.find(r=>r.mallId===mall&&r.destinationId===d.id).fields.find(f=>f.field==='menu');
  assert(await body.locator(`[data-detail-field=menu] p:not(.detail-provenance) a[href="${acceptedMenu.url}"]`).count()===1,'Exact accepted official menu link, no copied prices');
  row.menuBranchScopeText=await body.locator('[data-detail-field=menu]').textContent();
  const scopeLabel=acceptedMenu.applicability==='branch'?(locale==='vi'?'Chi nhánh tại trung tâm này':'This mall branch'):(locale==='vi'?'Toàn thương hiệu; xác nhận thông tin chi nhánh':'Brand-wide; confirm branch information');
  assert(['branch','brand-wide'].includes(acceptedMenu.applicability)&&row.menuBranchScopeText.includes(scopeLabel)&&row.menuBranchScopeText.includes(acceptedMenu.uncertainty[locale]),'Menu scope and exact accepted uncertainty explicit');
  assert(await body.locator('.detail-proposals h4').textContent()===(locale==='vi'?'Thông tin khách tham quan đã xác minh':'Verified visitor information'),'Accepted information heading has exact localized Unicode');
  assert(!(await body.textContent()).includes('not owner approved') && !(await body.textContent()).includes('chưa được chủ dự án'),'Approved additions have no provisional owner warning');
  const acceptedPhone=JSON.parse(readFileSync('src/data/enrichment-accepted.json')).records.find(r=>r.mallId===mall&&r.destinationId===d.id).fields.find(f=>f.field==='phone');
  if(acceptedPhone)assert(await body.locator(`[data-detail-field=phone] a[href="tel:${acceptedPhone.value.en.replace(/[ ()-]/g,'')}"]`).count()===1,'Accepted branch telephone exact source value');
  else assert(await body.locator('[data-detail-field=phone] a[href^="tel:"]').count()===0,'Unaccepted telephone remains withheld');
  await body.locator('[data-detail-field=menu] p:not(.detail-provenance) a').scrollIntoViewIfNeeded();
  assert(await page.locator('.discovery-detail-header').evaluate(header=>{const content=header.nextElementSibling,button=header.querySelector('button'),title=header.querySelector('h3'),b=button.getBoundingClientRect(),h=header.getBoundingClientRect();return content.getBoundingClientRect().top>=h.bottom-1&&title.getBoundingClientRect().right<=b.left+1&&document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('button')===button;}),'Scrolling content cannot cover identity or close control');
  await page.screenshot({path:`${out}/frames/${mall}-${locale}-approved-menu.png`});
  const originalDetail=page.url();
  await body.locator(':scope >p >a[href*="view=map"]').click();await ready(page);
  assert(new URL(page.url()).searchParams.get('view')==='map','Detail View on map opens same identity');
  await page.goBack();await ready(page);
  assert(page.url()===originalDetail&&await essentialText(page.locator('.discovery-glass .destination-details'))===text,'Back restores Discovery detail URL and essential body');
  const failure=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await failure.route('**/*create-scene-runtime*.js',route=>route.abort());
  await failure.goto(`http://localhost:${port}${path}`);
  await failure.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('.error'),null,{timeout:45000});
  assert(await failure.locator('.static-guide .destination-details>p').first().textContent()===d.description[locale],'Failed 3D retains exact direct-store static description');
  await failure.close();
  await page.goto(`http://localhost:${port}${path}&view=map`);await ready(page);
  assert(await essentialText(page.locator('.destination .destination-details'))===text,'Map and Discovery essential detail bodies agree exactly');
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(`http://localhost:${port}${path}`);
  assert(await essentialText(nojs.locator('.static-guide .destination-details'))===text,'Static/noJS essential body agrees exactly');
  const staticGuidance=nojs.locator('.static-guide [data-indoor-guidance]');
  assert(await staticGuidance.count()===1&&await staticGuidance.locator('select').count()===0&&await staticGuidance.locator('[data-indoor-official-link]').count()===1,'NoJS guidance keeps native disclosure and official fallback without an inert selector');await nojs.close();
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
 for(const file of walk(dir).filter(f=>/\.(html|js)$/.test(f))){const content=readFileSync(file,'utf8');if(content.includes('Source checked; additions await owner approval.'))fields++;if(menuSentinels.some(url=>content.includes(url)))approvedMenuFiles++;}
 boundary.push({mall,mode,provisionalSourceValuesInOutput:fields,approvedMenuFiles,pass:fields===0&&(mode==="public"?approvedMenuFiles>0:approvedMenuFiles===0)});
}
writeFileSync(out+'/public-fixture-boundary.json',JSON.stringify(boundary,null,2));await browser.close();
console.log(JSON.stringify({cases:runs.length,checks:runs.reduce((n,r)=>n+r.checks.length,0),failures:runs.flatMap(r=>r.failed),boundary}));if(runs.some(r=>r.failed.length)||boundary.some(r=>!r.pass))process.exitCode=1;




