import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out=new URL('./',import.meta.url);
const receipt={profile:'Installed Chrome headless; CSS viewport emulation; SwiftShader for WebGL. Not physical-device or production acceptance.',cases:[],findings:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const save=()=>writeFile(new URL('receipt.json',out),JSON.stringify(receipt,null,2));
async function measure(page){return page.evaluate(()=>{
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,visible:r.bottom>0&&r.y<innerHeight&&r.width>0&&r.height>0}};
 return {url:location.href,view:document.querySelector('.visitor-guide')?.dataset.view,width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,header:box('.journey-header'),model:box('.scene-host-exterior'),actions:box('.arrival-actions'),map:box('.persistent-map'),controls:box('.map-controls'),nav:[...document.querySelectorAll('.primary-navigation a')].map(a=>({text:a.textContent,current:a.getAttribute('aria-current')})),canvas:document.querySelector('canvas')?{...document.querySelector('canvas').dataset}:null};
})}
async function shell(page){await page.locator('.journey-header .primary-navigation a').nth(4).waitFor();await page.waitForTimeout(700)}
async function navigate(page,index,view){await page.locator('.primary-navigation a').nth(index).click();if(view)await page.waitForFunction(v=>document.querySelector('.visitor-guide')?.dataset.view===v,view,{timeout:12000});await page.waitForTimeout(250)}
try{
 for(const [mall,port]of[['saigon',4490],['vincom',4491]])for(const width of[1280,390])for(const locale of['en','vi']){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
  await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/.test(kind)?null:original.call(this,kind,...args)}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const run={mall,width,locale,mode:'noWebGL+reducedMotion',checks:[],errors};receipt.cases.push(run);
  try{
   await page.goto(`http://127.0.0.1:${port}/${locale}`,{waitUntil:'domcontentloaded'});await shell(page);run.home=await measure(page);run.checks.push({name:'five shell navigation links visible without WebGL',pass:await page.locator('.primary-navigation a').count()===5});
   await page.screenshot({path:new URL(`${mall}-${width}-${locale}-home-fallback.png`,out).pathname.replace(/^\//,'')});
   await navigate(page,1,'discovery');run.discovery=await measure(page);run.checks.push({name:'Discovery usable without WebGL',pass:await page.locator('#scene-discovery').isVisible()});
   await page.screenshot({path:new URL(`${mall}-${width}-${locale}-discovery.png`,out).pathname.replace(/^\//,'')});
   await navigate(page,2,'map');run.map=await measure(page);run.checks.push({name:'Map usable without WebGL',pass:await page.locator('.map-transform svg').isVisible()});
   await page.screenshot({path:new URL(`${mall}-${width}-${locale}-map.png`,out).pathname.replace(/^\//,'')});
   await navigate(page,4);await page.waitForTimeout(400);run.visit=await measure(page);run.checks.push({name:'Visit target reached',pass:await page.locator('#visit').evaluate(e=>{const r=e.getBoundingClientRect();return r.y<innerHeight&&r.bottom>0})});
   await navigate(page,0,'exterior');run.checks.push({name:'Home navigation returns exterior',pass:true});
   await page.locator('.shell-language').click();await page.waitForTimeout(600);run.language=await measure(page);run.checks.push({name:'Language switch preserves Home',pass:new URL(page.url()).pathname.startsWith(locale==='en'?'/vi':'/en')&&run.language.view==='exterior'});
   await navigate(page,3);await page.locator('.atlas-app').waitFor();await page.waitForTimeout(500);run.directions=await page.evaluate(()=>({url:location.href,status:document.querySelector('.atlas-status')?.textContent,disabled:document.querySelector('.atlas-primary')?.disabled,route:!!document.querySelector('.atlas-route')}));run.checks.push({name:'Directions asks for explicit start',pass:run.directions.disabled&&!run.directions.route});
   run.checks.push({name:'No horizontal overflow in shell/tasks',pass:[run.home,run.discovery,run.map,run.visit,run.language].every(x=>x.overflow<=1)});
  }catch(e){run.failure=e.message}await save();console.log(JSON.stringify({mall,width,locale,failure:run.failure,failed:run.checks.filter(c=>!c.pass)}));await context.close();
 }
 for(const [mall,port]of[['saigon',4490],['vincom',4491]])for(const width of[1280,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'no-preference'});const page=await context.newPage();const run={mall,width,locale:width===390?'vi':'en',mode:'actual-model',samples:[],checks:[]};receipt.cases.push(run);
  try{
   await page.goto(`http://127.0.0.1:${port}/${run.locale}`,{waitUntil:'domcontentloaded'});await shell(page);
   await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.completeFrame||document.querySelector('.error'),null,{timeout:90000});run.ready=await measure(page);
   await page.screenshot({path:new URL(`${mall}-${width}-actual-home.png`,out).pathname.replace(/^\//,'')});
   await page.locator('.exterior-controls-toggle').click();await page.waitForTimeout(300);run.controls=await page.locator('.exterior-controls-panel').evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),buttons:[...e.querySelectorAll('button')].map(b=>({label:b.getAttribute('aria-label')||b.textContent,rect:b.getBoundingClientRect().toJSON()}))}));
   await page.screenshot({path:new URL(`${mall}-${width}-actual-controls.png`,out).pathname.replace(/^\//,'')});
   run.checks.push({name:'exterior panel stays within viewport horizontally',pass:run.controls.rect.x>=0&&run.controls.rect.right<=width});
  }catch(e){run.failure=e.message}await save();console.log(JSON.stringify({mall,width,mode:run.mode,failure:run.failure,failed:run.checks.filter(c=>!c.pass)}));await context.close();
 }
}finally{await save();await browser.close()}
