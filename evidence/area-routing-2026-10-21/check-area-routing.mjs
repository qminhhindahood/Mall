import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
const out='evidence/area-routing-2026-10-21';mkdirSync(`${out}/frames`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={at:new Date().toISOString(),browser:browser.version(),runs:[]};
const targets=[['saigon-centre',4461,'saigon-prototype-','L5',['dimtutac','longjing','changkangkung']],['vincom-dong-khoi',4462,'vincom-prototype-','B3',['siamsugar','changkangkung','chillithai']]];
const url=(port,l,id,f)=>`http://127.0.0.1:${port}/${l}/${l==='en'?'stores':'cua-hang'}/${id}?floor=${f}&view=discovery`;
try {
for(const [mall,port,prefix,floor,ids] of targets)for(const locale of ['en','vi'])for(const width of [1280,390]){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});const page=await context.newPage();
 for(const tail of ids){const id=prefix+tail,row={mall,locale,width,id,checks:[]};results.runs.push(row);const check=(p,m)=>{row.checks.push({pass:!!p,label:m});if(!p)throw Error(m);};
 await page.goto(url(port,locale,id,floor));await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame&&document.activeElement?.classList.contains('discovery-glass'),null,{timeout:60000});
 const guide=page.locator('.discovery-glass [data-indoor-guidance]');await guide.waitFor();const area=guide.locator('.area-directions');await area.locator('select').waitFor();
 check(await guide.getAttribute('open')!==null,'Supported directions open by default');
 check(await area.locator('svg').count()===0,'No route before manual start');
 const select=area.locator('select');await select.scrollIntoViewIfNeeded();await select.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');await area.locator('svg').waitFor();
 check((await select.inputValue())!=='','Keyboard chooses named starting landmark');
 check(await area.locator('li').count()>0,'Steps accompany route');
 check(await area.locator('svg').getAttribute('aria-label')!==null,'Route image has localized accessible name');
 check((await area.textContent()).includes(locale==='en'?'not an exact entrance':'không chỉ cửa vào chính xác'),'Area endpoint limitation visible');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
 const source=area.locator('a');const response=await context.request.get(new URL(await source.getAttribute('href'),page.url()).href);check(response.status()===200,'Full source map is available');
 await area.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/frames/${mall}-${tail}-${locale}-${width}.png`});
 const floorSelect=guide.locator('.indoor-guidance-start select');await floorSelect.selectOption(floor==='B3'?'L1':'B2');check(await guide.locator('.area-directions').count()===0,'Different starting floor suppresses route');
 await floorSelect.selectOption(floor);await guide.locator('.area-directions select').waitFor();check(await guide.locator('.area-directions svg').count()===0,'Returning to same floor requires fresh named start');
 await guide.locator('.area-directions select').selectOption({index:1});await guide.locator('.area-directions svg').waitFor();await page.reload();await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame&&document.activeElement?.classList.contains('discovery-glass'),null,{timeout:60000});await page.locator('.discovery-glass .area-directions select').waitFor();check(await page.locator('.discovery-glass .area-directions svg').count()===0,'Refresh does not invent current landmark');
 }
 const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));const held=data.destinations.find(d=>d.status==='open'&&d.locations.every(l=>l.certainty==='floor-confirmed'));await page.goto(url(port,locale,held.id,held.primaryFloor));await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame&&document.activeElement?.classList.contains('discovery-glass'),null,{timeout:60000});const guide=page.locator('.discovery-glass [data-indoor-guidance]');await guide.locator('summary').click();if(await guide.locator('.area-directions').count())throw Error('Held destination incorrectly routable');
 results.runs.push({mall,locale,width,id:held.id,checks:[{pass:true,label:'Floor-only destination retains no route'}]});await context.close();
}
for(const [mall,port,prefix,floor,ids] of targets)for(const locale of ['en','vi']){
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(url(port,locale,prefix+ids[0],floor));const guide=page.locator('.static-guide [data-indoor-guidance]');if(await guide.locator('select').count())throw Error('NoJS inert selector');if(await guide.locator('.area-directions a').count()!==1)throw Error('NoJS source fallback missing');results.runs.push({mall,locale,type:'noJS',checks:[{pass:true,label:'Native disclosure and full source map remain available without inert controls'}]});await context.close();
}
} catch(error){results.error=String(error);process.exitCode=1;} finally {writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2));await browser.close();console.log(JSON.stringify({cases:results.runs.length,checks:results.runs.reduce((n,r)=>n+r.checks.length,0),error:results.error}));}


