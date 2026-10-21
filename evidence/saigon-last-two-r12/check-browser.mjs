import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';import assert from 'node:assert/strict';import fs from 'node:fs';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});const rows=[];
try{
for(const [locale,width] of [['en',1280],['vi',390]])for(const [floor,counter] of [['B2','Marou Station'],['B1','Rập'],['L1','Polo Ralph Lauren'],['L2','TWG Tea Salon'],['L3','Wilson']]){
 const p=await b.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4490/'+locale+'/'+(locale==='en'?'stores':'cua-hang')+'/saigon-prototype-takashimaya?floor='+floor+'&view=discovery');await p.locator('#discovery-glass-title').waitFor();await p.locator('.discovery-glass [data-directions-handoff]').click();await p.locator('.atlas-places').waitFor();
 assert.match(await p.locator('.atlas-place').last().innerText(),/Takashimaya/);assert.match(await p.locator('.atlas-floors [aria-pressed=true]').innerText(),new RegExp('^'+floor+'$'));
 assert.equal(await p.locator('path[data-selected=true]').count(),1);
 const shape=p.locator('path[role=button][aria-label*="Takashimaya" i]');assert.equal(await shape.count(),1);await shape.focus();await shape.press('Enter');await p.locator('.atlas-area-selection').waitFor();assert.ok(await p.locator('.atlas-area-selection [data-association-kind=partial-source-layout]').count());await p.locator('.atlas-area-selection>div>div>button').first().click();
 assert.match(await p.locator('.atlas-place').first().innerText(),/Takashimaya/);assert.ok(await p.locator('.atlas-primary').isDisabled());assert.equal(await p.locator('.atlas-route').count(),0);await p.locator('.atlas-disclosure').click();assert.match(await p.locator('.atlas-details').innerText(),new RegExp(counter));
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 if(locale==='vi'&&floor==='L1'){await p.locator('.atlas-map-stage').screenshot({path:'evidence/saigon-last-two-r12/takashimaya-partial-phone.png'});}
 rows.push({locale,width,floor,counter,detailHandoff:true,onePartialArea:true,keyboardAndManualOrigin:true,fullScopeVisible:true,noRouteInvented:true,errors});await p.close();
}
for(const [locale,width] of [['en',1280],['vi',390]]){
 const p=await b.newPage({viewport:{width,height:844},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4490/'+locale+'/'+(locale==='en'?'directions':'chi-duong')+'?to=saigon-prototype-matinkimvietnam&floor=L3');await p.locator('.atlas-places').waitFor();assert.equal(await p.locator('path[role=button][aria-label*="Matin Kim" i]').count(),0);assert.ok(await p.locator('.atlas-primary').isDisabled());assert.equal(await p.locator('path[role=button][aria-label*="Miana" i]').count(),1);assert.match(await p.locator('.atlas-place').last().innerText(),locale==='en'?/Floor confirmed only/:/Chỉ xác nhận tầng/);rows.push({locale,width,destination:'Matin Kim',floorOnlyPreserved:true,MianaPreserved:true});await p.close();
}
}finally{await b.close();}
fs.writeFileSync('evidence/saigon-last-two-r12/browser.json',JSON.stringify(rows,null,2));console.log(JSON.stringify({passed:rows.length,rows}));

