import {chromium} from '../../../.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../evidence/visual-acceptance/states/',import.meta.url);await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={browser:browser.version(),runs:[]};
const ready=async page=>{await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&(document.querySelector('canvas')?.dataset.completeFrame||document.querySelector('.error')),null,{timeout:45000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);};
// Remove @supports blocks at the HTTP/CSS seam to exercise the actual opaque
// baseline, rather than pretending Chrome itself lacks backdrop-filter support.
function withoutSupports(css){let at;while((at=css.indexOf('@supports'))>=0){const start=css.indexOf('{',at);let depth=1,end=start+1;for(;end<css.length&&depth;end++){if(css[end]==='{')depth++;if(css[end]==='}')depth--;}css=css.slice(0,at)+css.slice(end);}return css;}
try{
for(const [mall,port]of [['saigon',4213],['vincom',4214]])for(const locale of ['vi','en'])for(const mode of ['transparency','unsupported-blur','reflow-200','short-phone','import-failure']){
 const viewport=mode==='reflow-200'?{width:640,height:400}:mode==='short-phone'?{width:320,height:568}:{width:390,height:844};
 const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await ctx.newPage();const run={mall,locale,mode,viewport,checks:[],failed:[],errors:[]};results.runs.push(run);
 if(mode==='unsupported-blur')await page.route('**/*.css',async route=>{const response=await route.fetch();await route.fulfill({response,body:withoutSupports(await response.text())});});
 if(mode==='import-failure')await page.route('**/create-scene-runtime*.js',route=>route.abort());
 if(mode==='transparency'){const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'},{name:'prefers-reduced-motion',value:'reduce'}]});}
 page.on('pageerror',e=>run.errors.push(e.message));await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'tang':'floors'}/L1`);await ready(page);
 run.styles=await page.evaluate(()=>{const c=document.querySelector('.map-controls'),s=getComputedStyle(c),p=document.querySelector('.persistent-map');return{background:s.backgroundColor,blur:s.backdropFilter,reducedTransparency:matchMedia('(prefers-reduced-transparency: reduce)').matches,sticky:getComputedStyle(p).position,overflow:document.documentElement.scrollWidth>innerWidth};});
 const check=(value,label)=>(value?run.checks:run.failed).push(label);
 check(!run.styles.overflow,'No horizontal overflow');
 if(['transparency','unsupported-blur'].includes(mode))check(run.styles.blur==='none'&&!run.styles.background.startsWith('rgba'),'Opaque porcelain fallback');
 if(mode==='transparency')check(run.styles.reducedTransparency,'Actual reduced-transparency media query');
 if(['reflow-200','short-phone'].includes(mode))check(run.styles.sticky==='relative','Short viewport leaves reading content unobstructed');
 await page.locator('.map-controls button').nth(1).focus();await page.keyboard.press('Tab');await page.keyboard.press('Enter');
 check(await page.locator('.map-controls button').nth(2).getAttribute('aria-pressed')==='true','Keyboard angle selected');
 check(await page.locator('.map-controls button').nth(2).evaluate(e=>getComputedStyle(e).outlineWidth==='3px'),'Visible keyboard focus');
 await page.screenshot({path:fileURLToPath(new URL(`${mall}-${locale}-${mode}.png`,root))});
 await page.locator('header nav a').nth(1).click();await ready(page);check(new URL(page.url()).searchParams.get('view')==='discovery','Discovery stays reachable');
 await page.screenshot({path:fileURLToPath(new URL(`${mall}-${locale}-${mode}-discovery.png`,root))});
 if(mode==='import-failure'){check(await page.locator('.error').count()===1,'Known scene failure releases loading');check(await page.locator('.persistent-map svg path').count()>0,'Practical geometry survives import failure');}
 await ctx.close();console.log(JSON.stringify({mall,locale,mode,checks:run.checks.length,failed:run.failed,errors:run.errors}));
}
// Continuous native scrolling uses the same map/controls; motion and transparency
// preferences are independent. Fixture selection exercises actual mapped areas.
for(const [mall,port]of [['saigon',4285],['vincom',4286]]){
 const ctx=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'no-preference'});const page=await ctx.newPage();await page.goto(`http://localhost:${port}/en/floors/L1`);await ready(page);
 const run={mall,mode:'fixture-transition',checks:[],failed:[],samples:[]};results.runs.push(run);const check=(value,label)=>(value?run.checks:run.failed).push(label);
 const host=await page.locator('.persistent-map .scene-host').elementHandle(),tools=await page.locator('.map-controls').elementHandle();
 await page.locator('.area-link').first().click();await ready(page);await page.locator('.shared-area li a').first().click();await ready(page);
 check(await page.locator('path[data-selected=true]').count()>0,'Fixture selection outlines source area');
 await page.screenshot({path:fileURLToPath(new URL(`${mall}-fixture-selection.png`,root))});
 await page.locator('.destination button').first().click();
 const start=await page.locator('#scene-discovery').evaluate(e=>scrollY+e.getBoundingClientRect().top-innerHeight);
 for(const delta of [0,160,320,480]){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start+delta);await ready(page);run.samples.push(await page.evaluate(()=>({progress:Number(document.querySelector('.map-discovery-journey').style.getPropertyValue('--discovery-progress')),transform:getComputedStyle(document.querySelector('.persistent-map .scene-host')).transform,toolsOpacity:getComputedStyle(document.querySelector('.map-controls')).opacity})));await page.screenshot({path:fileURLToPath(new URL(`${mall}-transition-${delta}.png`,root))});}
 check(await host.evaluate(e=>e===document.querySelector('.persistent-map .scene-host')),'Map host persists');check(await tools.evaluate(e=>e===document.querySelector('.map-controls')),'Controls persist without opacity fade');check(run.samples[0].progress<run.samples.at(-1).progress&&run.samples.every(s=>s.toolsOpacity==='1'),'Continuous transform progress; full-opacity tools');
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.wheel(0,20);await page.waitForTimeout(100);check(await page.locator('.persistent-map .scene-host').evaluate(e=>getComputedStyle(e).transform==='none'),'Reduced motion removes scroll transform');
 await ctx.close();console.log(JSON.stringify({mall,mode:run.mode,checks:run.checks.length,failed:run.failed}));
}
}finally{await writeFile(new URL('results.json',root),JSON.stringify(results,null,2));await browser.close();}
if(results.runs.some(r=>r.failed.length||r.errors?.length))process.exitCode=1;
