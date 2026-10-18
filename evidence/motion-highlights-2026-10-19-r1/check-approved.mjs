import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='evidence/motion-highlights-2026-10-19-r1';mkdirSync(out+'/frames',{recursive:true});
const packet=JSON.parse(readFileSync('docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json'));
const input=mall=>JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
const receipt={at:new Date().toISOString(),scope:'Owner-approved content in local PUBLIC output; no deployment/release approval',static:[],runs:[],failed:[]};
const excludes=['vincom-prototype-cara','vincom-prototype-lizdnamat','vincom-prototype-mujoshtedbaker'];
for(const [mall,port] of [['saigon-centre',4363],['vincom-dong-khoi',4364]]){
 const data=input(mall),old=JSON.parse(readFileSync(`data/research/${mall}.json`)).records,original=new Set(old.map(r=>r.id));
 const row={mall,records:data.destinations.length,expanded:data.destinations.filter(r=>!original.has(r.id)).length,checks:0,held:[]};receipt.static.push(row);
 const geometry=JSON.parse(readFileSync(`dist/${mall}/data/floor-geometry.json`));
 for(const d of data.destinations){
  const p=packet.records.find(p=>p.id===d.id);if(!p)throw Error('Unexpected identity '+d.id);
  const held=p.proposedDescription?.vi===null;if(held)row.held.push(d.id);
  if(data.approval!=='approved'||d.fixture||d.description.vi!==(p.proposedDescription.vi??'')||d.description.en!==(p.proposedDescription.en??''))receipt.failed.push('Approved wording mismatch '+d.id);
  for(const l of d.locations)for(const id of l.areaIds){const area=data.areas.find(a=>a.id===id);if(!area||area.regionIds.some(r=>!geometry.floors.find(f=>f.id===l.floorId)?.regions.some(g=>g.id===r)))receipt.failed.push('Transport/location mismatch '+d.id);}
  for(const locale of ['vi','en']){
   const path=`/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}`;
   const r=await fetch(`http://localhost:${port}${path}`),html=await r.text();
   const text=html.replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
   const expected=held?(locale==='vi'?'Nội dung giới thiệu đang chờ duyệt.':'Introduction awaiting editorial review.'):d.description[locale];
   if(r.status!==200||!text.includes(expected)||!html.includes('static-guide'))receipt.failed.push('Shipped approved route missing '+path);row.checks++;
  }
 }
 for(const id of [...excludes,'loading-test-store'])for(const locale of ['vi','en']){
  const response=await fetch(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${id}`);
  if(response.status!==404)receipt.failed.push('Excluded/fixture must404 '+mall+'/'+id);row.checks++;
 }
 if(data.highlights.length||data.facilities.length)receipt.failed.push('Unexpected unapproved editorial content '+mall);
 row.directorySha256=createHash('sha256').update(readFileSync(`data/malls/${mall}/directory.json`)).digest('hex');
}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
for(const [mall,port] of [['saigon-centre',4363],['vincom-dong-khoi',4364]])for(const width of [1280,390])for(const locale of ['vi','en']){
 const data=input(mall),old=new Set(JSON.parse(readFileSync(`data/research/${mall}.json`)).records.map(r=>r.id));
 const expanded=data.destinations.find(d=>!old.has(d.id)&&d.description[locale]&&!d.locations.some(l=>l.areaIds.length));
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},reducedMotion:locale==='vi'?'reduce':'no-preference'});
 const row={mall,width,locale,expandedId:expanded.id,checks:[],failed:[],pageErrors:[]};receipt.runs.push(row);page.on('pageerror',e=>row.pageErrors.push(e.message));
 const assert=(ok,label)=>{row.checks.push({label,pass:!!ok});if(!ok)throw Error(label);};
 const storeUrl=d=>`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${d.primaryFloor}&view=discovery&collection=${d.categories[0]}`;
 try{
  await page.goto(storeUrl(expanded));await ready(page);await page.locator('.discovery-glass').waitFor();
  assert(await page.locator('#discovery-glass-description').textContent()===expanded.description[locale],'Expanded approved identity exact bilingual offering');
  assert(await page.locator('.discovery-notice').count()===0,'Public output contains no private/pending directory notice');
  assert(await page.locator('.discovery-glass img').count()===0,'No unverified destination photo');
  assert(await page.locator('.map-transform path[data-selected=true]').count()===0,'Floor-only expanded entry has no marker');
  const before=page.url();await page.locator('.map-controls button').nth(1).click();await page.waitForTimeout(100);
  assert(page.url()===before&&await page.locator('.discovery-glass').count()===1,'Expanded deep link retains detail through map controls');
  await page.locator('.discovery-map-context button').click();assert(await page.locator('.persistent-map').getAttribute('data-expanded')==='true','Phone/desktop Expand works');await page.locator('.discovery-map-context button').click();
  await page.screenshot({path:`${out}/frames/${mall}-${width}-${locale}-approved.png`});
  await page.keyboard.press('Escape');assert(await page.locator('.discovery-glass').count()===0,'Escape closes approved detail');
  await page.goBack();await ready(page);await page.waitForTimeout(100);assert(await page.locator('.discovery-glass').count()===1,'Back restores approved detail');
  const other=locale==='vi'?'en':'vi';await page.locator(`.journey-header a[lang=${other}]`).click();await page.waitForTimeout(200);
  assert(await page.locator('#discovery-glass-description').textContent()===expanded.description[other],'Locale preserves identity and accepted alternate wording');
  const held=data.destinations.find(d=>!d.description.vi);await page.goto(storeUrl(held));await ready(page);
  assert(await page.locator('#discovery-glass-description').textContent()===(locale==='vi'?'Nội dung giới thiệu đang chờ duyệt.':'Introduction awaiting editorial review.'),'Offering hold remains accessible with pending description');
  await page.goto(`http://localhost:${port}/${locale}?view=discovery`);await ready(page);
  const counted=await page.locator('#discovery-category-list a').evaluateAll(as=>as.map(a=>({id:new URL(a.href).searchParams.get('collection'),count:Number(a.querySelector('small').textContent)})));
  assert(counted.length===data.categories.length&&counted.every(c=>c.count===data.destinations.filter(d=>d.categories.includes(c.id)).length),'All category counts reflect complete approved roster');
  assert(await page.locator('.discovery-highlights a').count()===0,'Unapproved Highlights remain empty');
  const first=page.locator('[data-discovery-result]').first();await first.click();await page.waitForTimeout(100);
  const id=new URL(page.url()).pathname.split('/').at(-1),selected=data.destinations.find(d=>d.id===id);
  assert(await page.locator('#discovery-glass-description').textContent()===(selected.description[locale]||(locale==='vi'?'Nội dung giới thiệu đang chờ duyệt.':'Introduction awaiting editorial review.')),'Real list pointer opens approved offering');
  const selectedFloor=await page.locator('.scene-host-map').getAttribute('data-floor');await page.locator('.map-controls button').nth(1).click();assert(await page.locator('.discovery-glass').count()===1&&await page.locator('.scene-host-map').getAttribute('data-floor')===selectedFloor,'Map controls preserve actual selected identity/floor');
  await page.keyboard.press('Escape');assert(await first.evaluate(e=>e===document.activeElement),'Close returns keyboard focus to originating listing');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  assert(row.pageErrors.length===0,'No page errors');
 }catch(e){row.failed.push(e.message);receipt.failed.push(`${mall}/${width}/${locale}: ${e.message}`);}
 await page.close();writeFileSync(out+'/approved-results.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({mall,width,locale,checks:row.checks.length,failed:row.failed}));
}
await browser.close();writeFileSync(out+'/approved-results.json',JSON.stringify(receipt,null,2)+'\n');if(receipt.failed.length)process.exitCode=1;
