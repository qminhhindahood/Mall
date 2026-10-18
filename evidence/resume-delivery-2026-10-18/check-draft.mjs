import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='evidence/resume-delivery-2026-10-18';mkdirSync(out+'/frames',{recursive:true});
const packetPath='docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json';
const packet=JSON.parse(readFileSync(packetPath));
const receipt={at:new Date().toISOString(),packetSha256:createHash('sha256').update(readFileSync(packetPath)).digest('hex'),scope:'Private draft wording and preserved selected-detail controls; no owner/public approval',static:[],browser:[],failed:[]};
for(const mall of ['saigon-centre','vincom-dong-khoi']) {
 const input=JSON.parse(readFileSync(`data/research/${mall}.json`));
 const records=packet.records.filter(r=>r.mall===mall);let drafts=0,holds=0;
 for(const row of input.records) {
  const draft=records.find(r=>r.id===row.id);if(!draft)throw Error('Missing draft '+row.id);
  const held=draft.proposedDescription?.vi===null;held?holds++:drafts++;
  for(const locale of ['vi','en']) {
   const html=readFileSync(`dist/research/${mall}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${row.id}/index.html`,'utf8');
   const expected=held?(locale==='vi'?'Nội dung giới thiệu đang chờ duyệt.':'Introduction awaiting editorial review.'):draft.proposedDescription[locale];
   const decoded=html.replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
   if(!decoded.includes(expected))receipt.failed.push(`${mall}/${locale}/${row.id}: draft missing from generated HTML`);
  }
 }
 const publicSnapshot=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
 if(publicSnapshot.approval!=='pending'||publicSnapshot.destinations.length)receipt.failed.push('Public snapshot changed '+mall);
 if(existsSync(`dist/${mall}/en/stores/${input.records[0].id}/index.html`))receipt.failed.push('Research route leaked public '+mall);
 receipt.static.push({mall,roster:input.records.length,drafts,holds,publicSnapshotApproval:publicSnapshot.approval,publicResearchRouteAbsent:true});
}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
for(const [mall,port] of [['saigon-centre',4355],['vincom-dong-khoi',4356]])for(const width of [1280,390])for(const locale of ['vi','en']) {
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'});
 const row={mall,width,locale,checks:[],failed:[],pageErrors:[]};receipt.browser.push(row);page.on('pageerror',e=>row.pageErrors.push(e.message));
 const assert=(value,label)=>{row.checks.push({label,pass:!!value});if(!value)throw Error(label);};
 try {
  const input=JSON.parse(readFileSync(`data/research/${mall}.json`));
  const id=mall==='saigon-centre'?'saigon-prototype-annamgourmet':'vincom-prototype-haidilao';
  const destination=input.records.find(r=>r.id===id),draft=packet.records.find(r=>r.id===id);
  const url=`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${id}?view=discovery&floor=${destination.floors[0]}`;
  await page.goto(url);await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,{timeout:30000});
  await page.locator('#discovery-glass-description').waitFor();
  assert(await page.locator('#discovery-glass-description').textContent()===draft.proposedDescription[locale],'Current bilingual informative draft shown');
  assert((await page.locator('.discovery-notice').textContent()).includes(locale==='vi'?'chưa duyệt':'not approved'),'Private draft notice retained');
  await page.waitForTimeout(400);
  const deepBefore=page.url();await page.locator('.map-controls button').nth(1).click();
  await page.waitForTimeout(100);
  assert(page.url()===deepBefore&&await page.locator('.discovery-glass').count()===1,'Direct Discovery store link retains visible details through Zoom');
  // Reuse the accepted root-Discovery -> real shop click sequence for controls.
  await page.goto(`http://localhost:${port}/${locale}?view=discovery`);
  await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame);
  await page.locator('[data-discovery-result]').first().click();
  assert((await page.locator('#discovery-glass-description').textContent()).length>0,'Shop pointer opens draft detail');
  await page.waitForTimeout(400);
  const before=page.url(),floor=await page.locator('.scene-host-map').getAttribute('data-floor');
  await page.locator('.map-controls button').nth(1).click();
  row.controlDiagnostics={before,after:page.url(),floor,afterFloor:await page.locator('.scene-host-map').getAttribute('data-floor'),details:await page.locator('.discovery-glass').count()};
  assert(page.url()===before&&await page.locator('.discovery-glass').count()===1&&await page.locator('.scene-host-map').getAttribute('data-floor')===floor,'Zoom retains selection and detail');
  await page.locator('.discovery-map-context button').click();
  assert(await page.locator('.persistent-map').getAttribute('data-expanded')==='true','Phone/desktop Expand remains reachable');
  await page.locator('.discovery-map-context button').click();
  const rect=await page.locator('.discovery-glass').boundingBox();
  assert(rect&&rect.x>=-1&&rect.x+rect.width<=width+1,'Detail within viewport horizontally');
  await page.screenshot({path:`${out}/frames/${mall}-${width}-${locale}.png`});
  await page.keyboard.press('Escape');assert(await page.locator('.discovery-glass').count()===0,'Escape closes details');
  const held=input.records.find(r=>packet.records.find(p=>p.id===r.id)?.proposedDescription?.vi===null);
  await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${held.id}?view=discovery&floor=${held.floors[0]}`);
  await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame);
  assert(await page.locator('#discovery-glass-description').textContent()===(locale==='vi'?'Nội dung giới thiệu đang chờ duyệt.':'Introduction awaiting editorial review.'),'Explicit source/identity hold uses pending fallback');
  assert(row.pageErrors.length===0,'No browser page errors');
 }catch(e){row.failed.push(e.message);receipt.failed.push(`${mall}/${width}/${locale}: ${e.message}`);}
 await page.close();writeFileSync(out+'/draft-results.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({mall,width,locale,passed:row.checks.length,failed:row.failed}));
}
await browser.close();writeFileSync(out+'/draft-results.json',JSON.stringify(receipt,null,2)+'\n');if(receipt.failed.length)process.exitCode=1;
