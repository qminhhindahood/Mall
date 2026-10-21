import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});const rows=[];
try{for(const [locale,width] of [['en',1280],['vi',390]])for(const [id,name] of [['saigon-prototype-oedoalley','Oedo Alley'],['saigon-prototype-asiancorner','Asian Corner']]){
const p=await b.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:4490/'+locale+'/'+(locale==='en'?'stores':'cua-hang')+'/'+id+'?floor=L5&view=discovery');
await p.locator('#discovery-glass-title').waitFor();assert.match(await p.locator('#discovery-glass-title').innerText(),new RegExp(name,'i'));
await p.locator('.discovery-glass [data-directions-handoff]').click();await p.locator('.atlas-places').waitFor();
assert.match(await p.locator('.atlas-place').last().innerText(),new RegExp(name,'i'));assert.ok(await p.locator('.atlas-primary').isDisabled());assert.equal(await p.locator('.atlas-route').count(),0);
assert.ok(await p.locator('[data-association-kind="partial-source-layout"]').count());
const highlighted=await p.locator('path[data-selected="true"]').count();assert.equal(highlighted,name==='Oedo Alley'?2:1);
const shape=p.locator('path[role="button"][aria-label*="'+name+'" i]').first();await shape.focus();await shape.press('Enter');await p.locator('.atlas-area-selection').waitFor();
const row=p.locator('.atlas-area-selection>div').filter({has:p.locator('strong').filter({hasText:new RegExp('^'+name+'$','i')})});assert.equal(await row.count(),1);await row.locator('button').first().click();
assert.match(await p.locator('.atlas-place').first().innerText(),new RegExp(name,'i'));assert.ok(await p.locator('.atlas-primary').isDisabled());assert.equal(await p.locator('.atlas-route').count(),0);
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
rows.push({id,locale,width,detailHandoff:true,keyboardMapSelection:true,originSelection:true,noRouteInvented:true,highlighted,overflow:false,errors});await p.close();
}}finally{await b.close();}
fs.writeFileSync('evidence/saigon-remaining-r11/shared-band-browser.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
