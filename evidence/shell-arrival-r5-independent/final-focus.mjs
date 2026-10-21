import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out=new URL('./',import.meta.url),r={scope:'Final rebuild focused confirmation only; earlier 12-case receipt retained separately.',cases:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
try{
for(const [mall,port,width,failed]of[['saigon',4490,1280,true],['vincom',4491,390,true],['saigon',4490,390,false],['vincom',4491,1280,false]]){
const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});const page=await context.newPage(),run={mall,width,mode:failed?'noWebGL':'actual-model',checks:[],errors:[]};r.cases.push(run);page.on('pageerror',e=>run.errors.push(e.message));
if(failed)await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/.test(kind)?null:original.call(this,kind,...args)}});
try{
await page.goto(`http://127.0.0.1:${port}/en`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.completeFrame||document.querySelector('.error'),null,{timeout:90000});await page.waitForTimeout(400);
if(failed){run.alert=await page.locator('.error').evaluate(e=>{const p=e.querySelector('p').getBoundingClientRect(),h=document.querySelector('.journey-header').getBoundingClientRect();return{text:e.textContent,paragraph:p.toJSON(),header:h.toJSON(),visible:p.y>=h.bottom&&p.bottom<innerHeight}});run.checks.push({name:'Failure explanation below fixed header and in viewport',pass:run.alert.visible})}
else{run.palette=await page.evaluate(()=>({paper:getComputedStyle(document.querySelector('.visitor-guide')).getPropertyValue('--paper'),canvas:document.querySelector('canvas').getBoundingClientRect().toJSON()}));run.checks.push({name:'Actual model complete frame present',pass:await page.locator('canvas').evaluate(e=>!!e.dataset.completeFrame)});}
await page.screenshot({path:new URL(`final-${mall}-${width}-${run.mode}.png`,out).pathname.replace(/^\//,'')});
await page.locator('.primary-navigation a').nth(2).click();await page.waitForFunction(()=>document.querySelector('.visitor-guide')?.dataset.view==='map');await page.waitForTimeout(400);
run.mapControls=await page.locator('.introduction-controls').evaluate(e=>({visibility:getComputedStyle(e).visibility,display:getComputedStyle(e).display}));run.checks.push({name:'Exterior controls hidden in Map',pass:run.mapControls.visibility==='hidden'||run.mapControls.display==='none'});
await page.locator('.primary-navigation a').nth(1).click();await page.waitForFunction(()=>document.querySelector('.visitor-guide')?.dataset.view==='discovery');await page.waitForTimeout(250);
run.discoveryControls=await page.locator('.introduction-controls').evaluate(e=>({visibility:getComputedStyle(e).visibility,display:getComputedStyle(e).display}));run.checks.push({name:'Exterior controls hidden in Discovery',pass:run.discoveryControls.visibility==='hidden'||run.discoveryControls.display==='none'});
run.checks.push({name:'No page errors',pass:!run.errors.length});
}catch(e){run.failure=e.message}await context.close();console.log(JSON.stringify(run));
}
}finally{await writeFile(new URL('final-focus.json',out),JSON.stringify(r,null,2));await browser.close()}
