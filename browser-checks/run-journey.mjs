import { chromium } from '../../../.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
const directory=new URL('../evidence/journey/',import.meta.url);await mkdir(directory,{recursive:true});
const script=await readFile(new URL('./journey.js',import.meta.url),'utf8');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={revision:'visitor-discovery-2026-10-14-r1',browser:browser.version(),profile:'Headless Chrome / SwiftShader, CSS viewport emulation, not physical devices',runs:[]};
try{
for(const [mall,port] of [['saigon',4285],['vincom',4286]])for(const width of [1280,390])for(const locale of ['vi','en']){
 const context=await browser.newContext({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'tang':'floors'}/L1`);
 await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.completeFrame||document.querySelector('.error'));
 const receipt=await page.evaluate(script);receipt.mall=mall;receipt.errors=errors;results.runs.push(receipt);
 console.log(JSON.stringify({mall,width,locale,checks:receipt.checks.length,failed:receipt.failed,errors}));
 // Capture the same practical map and Discovery composition at each supported width.
 await page.locator('header nav a').first().click();await page.waitForFunction(()=>!document.querySelector('.loading-screen'));
 await page.getByRole('button',{name:locale==='vi'?'Phóng to sơ đồ':'Zoom in on map',exact:true}).press('Enter');
 const zoomed=await page.locator('.map-transform').getAttribute('style');
 await page.getByRole('button',{name:locale==='vi'?'Đặt lại sơ đồ':'Reset map',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.map-transform')?.style.transform.startsWith('scale(1)'));
 if(zoomed.includes('1.25'))receipt.checks.push('Keyboard map zoom and reset');else receipt.failed.push('Keyboard map zoom');
 await page.screenshot({path:new URL(`${mall}-${width}-${locale}.png`,directory).pathname.slice(1)});
 await context.close();
}
for(const [mall,port]of [['saigon',4283],['vincom',4284]])for(const locale of ['vi','en']){
 const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const page=await context.newPage();
 const checks=[],failed=[];const root=await page.goto(`http://localhost:${port}/${locale}`);if(root.status()===200&&await page.locator('.floor-rail a').count()===(mall==='saigon'?8:7))checks.push('No-JavaScript bilingual overview floor links');else failed.push('NoJS overview');
 for(const anchor of await page.locator('.floor-rail a').all()){const url=await anchor.getAttribute('href');const response=await context.request.get(`http://localhost:${port}${url}`);const html=await response.text();if(response.status()!==200||!html.includes('static-guide')||!html.includes('<svg'))failed.push(`Static floor ${url}`);}
 if(!failed.length)checks.push('Every supported static floor route includes SVG');
 const unknown=await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/loading-test-store`);if(unknown.status()===404&&await page.locator('meta[name=robots]').getAttribute('content')==='noindex,follow')checks.push('Truthful 404 and fixture isolation');else failed.push('Public fixture route / 404');
 results.runs.push({mall,locale,mode:'no-javascript-public',checks,failed});await context.close();
}
// Direct shared-store HTML is neutral until query-floor hydration resolves.
for(const [mall,port]of [['saigon',4285],['vincom',4286]]){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();const checks=[],failed=[];
 const url=`http://localhost:${port}/en/stores/loading-test-store?floor=L2&view=map`;
 const html=await (await context.request.get(url)).text();
 if(!/class="scene-host scene-host-map"[^>]*data-floor=/.test(html)&&html.includes('Test-only store'))checks.push('Floor-neutral store SSR retains static basic listing');else failed.push('Store SSR');
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.completeFrame&&!document.querySelector('.loading-screen'));
 if(await page.locator('.persistent-map [data-floor]').getAttribute('data-floor')==='L2'&&await page.locator('.destination nav [aria-current=page]').innerText()==='L2')checks.push('Shared-store query floor hydrates correctly');else failed.push('Shared-store hydration');
 await page.goto(`http://localhost:${port}/en/stores/loading-test-store?floor=invalid&view=map`);await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.completeFrame&&!document.querySelector('.loading-screen'));
 if(new URL(page.url()).searchParams.get('floor')==='L1')checks.push('Invalid destination floor corrects to primary');else failed.push('Invalid floor correction');
 results.runs.push({mall,mode:'shared-store-route',checks,failed});await context.close();
}
// Complete 3D context loss must leave the practical directory usable.
for(const [mall,port]of [['saigon',4285],['vincom',4286]])for(const failure of ['context-loss','import-failure']){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();if(failure==='import-failure')await page.route('**/create-scene-runtime*.js',route=>route.abort());await page.goto(`http://localhost:${port}/en/floors/L1`);if(failure==='context-loss'){await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.completeFrame&&!document.querySelector('.loading-screen'));await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());}await page.locator('.error').waitFor();await page.waitForFunction(()=>document.querySelector('.persistent-map svg path'));
 const receipt=await page.evaluate(script);results.runs.push({...receipt,mall,mode:failure});console.log(JSON.stringify({mall,mode:failure,checks:receipt.checks.length,failed:receipt.failed}));await context.close();
}
}finally{await writeFile(new URL('browser-results.json',directory),JSON.stringify(results,null,2));await browser.close();}
if(results.runs.some(r=>r.failed.length||r.errors?.length))process.exitCode=1;
