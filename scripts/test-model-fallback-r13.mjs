import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const rows=[];
for(const [mall,port] of [['saigon',4490],['vincom',4491]])for(const reduced of [false,true]){
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:reduced?'reduce':'no-preference'});const row={mall,reduced,checks:[]};rows.push(row);const check=(ok,name)=>{row.checks.push({name,pass:!!ok});if(!ok)throw Error(name)};
 try{
  await p.goto(`http://127.0.0.1:${port}/en`,{waitUntil:'networkidle'});await p.waitForFunction(()=>!document.querySelector('.exterior-controls-toggle')?.disabled,{timeout:90000});
  check(await p.locator('canvas[data-complete-frame]').count()===1,'actual model complete');
  if(!reduced){await p.locator('.replay-control').click();await p.waitForFunction(()=>document.querySelector('canvas')?.dataset.arrivalStage==='facade');check(await p.locator('.arrival-stage-caption').innerText()==='A closer look at the podium','stage-synced introduction');await p.keyboard.press('ArrowLeft');const n=await p.locator('canvas').getAttribute('data-arrival-progress');await p.waitForTimeout(220);check(await p.locator('canvas').getAttribute('data-arrival')==='stopped'&&await p.locator('canvas').getAttribute('data-arrival-progress')===n,'first input freezes arrival')}else{check(await p.locator('canvas').getAttribute('data-arrival-progress')==='1','reduced motion final pose')}
  await p.locator('.exterior-controls-toggle').click();
  for(const [name,key] of [['Rotate right','data-exterior-rotate'],['Look up','data-exterior-look'],['Zoom in','data-exterior-zoom']]){await p.getByRole('button',{name,exact:true}).click();check((await p.locator('canvas').getAttribute(key))!==null,`${name} changes model`)}
  await p.getByRole('button',{name:'Reset view',exact:true}).click();check(await p.locator('canvas').getAttribute('data-exterior-zoom')==='1','reset neutral');
 }catch(e){row.failure=e.message}await p.close();
}
for(const [mall,port] of [['saigon',4490],['vincom',4491]]){
 const p=await b.newPage({viewport:{width:390,height:844}});const row={mall,mode:'no-webgl',checks:[]};rows.push(row);
 await p.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:get.call(this,type,...args)}});
 await p.goto(`http://127.0.0.1:${port}/en/discovery`,{waitUntil:'networkidle'});await p.locator('.scene-loading-status').waitFor({state:'hidden',timeout:90000});
 row.checks.push({name:'Discovery remains usable without WebGL',pass:await p.locator('.visitor-highlights a').first().isVisible()});await p.locator('.visitor-highlights a').first().click();row.checks.push({name:'fallback details open',pass:await p.locator('[role=dialog]').isVisible()});await p.close();
 const plain=await b.newPage({javaScriptEnabled:false});await plain.goto(`http://127.0.0.1:${port}/vi/kham-pha`);rows.push({mall,mode:'no-js',checks:[{name:'static Discovery and real links',pass:await plain.locator('.visitor-highlights a').count()===6},{name:'translated alternate',pass:(await plain.locator('link[rel=alternate]').getAttribute('href')).includes('/en/discovery')}]});await plain.close();
}
await fs.writeFile('evidence/home-discovery-r13/model-fallback.json',JSON.stringify(rows,null,2));await b.close();console.log(JSON.stringify(rows,null,2));if(rows.some(r=>r.failure||r.checks.some(c=>!c.pass)))process.exitCode=1;
