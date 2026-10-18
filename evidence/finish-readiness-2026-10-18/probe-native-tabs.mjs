// One bounded genuine headed-browser tab visibility probe. No visibility/CDP lifecycle spoof.
import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out='evidence/finish-readiness-2026-10-18/native-tab-capability.json';
const result={at:new Date().toISOString(),profile:'Owned headed installed Chrome, starts minimized/offscreen via hidden Node helper; no OS restore, injected visibility or lifecycle override',attempts:1,samples:[],events:[],actualNativeCycle:false,cleanup:false};
let browser;
const timer=setTimeout(()=>{void browser?.close();},20000);
try{
 browser=await chromium.launch({headless:false,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--start-minimized','--window-position=-32000,-32000','--window-size=1280,800','--enable-unsafe-swiftshader'],timeout:10000});
 result.browser=browser.version();const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage();
 await page.goto('about:blank');
 await page.exposeFunction('__recordNative',e=>result.events.push(e));
 await page.evaluate(()=>{addEventListener('visibilitychange',e=>{void window.__recordNative({type:e.type,trusted:e.isTrusted,visibility:document.visibilityState,at:performance.now()})})});
 const sample=async name=>result.samples.push({name,...await page.evaluate(()=>({visibility:document.visibilityState,at:performance.now(),focus:document.hasFocus()}))});
 await sample('initial');const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await new Promise(r=>setTimeout(r,700));await sample('other-owned-tab-activated');await page.bringToFront();await new Promise(r=>setTimeout(r,700));await sample('original-owned-tab-activated');
 result.actualNativeCycle=result.events.some((e,i,a)=>e.trusted&&e.visibility==='hidden'&&a.slice(i+1).some(l=>l.trusted&&l.visibility==='visible'));
 result.qualification=result.actualNativeCycle?'Actual trusted browser tab hidden/visible events observed; capability only, no product-state cycle yet.':'Owned minimized browser did not produce a trusted hidden→visible cycle through tab activation. OS restore would expose a headed window and is excluded by the non-disruption constraint. No native-return acceptance.';
}catch(e){result.error=e.message;result.qualification='Native cycle not established; no acceptance.';}
finally{clearTimeout(timer);try{await browser?.close();result.cleanup=true}catch(e){result.cleanupError=e.message}await writeFile(out,JSON.stringify(result,null,2)+'\n')}
