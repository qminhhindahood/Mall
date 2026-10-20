import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation',runs=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
for(const [mall,port] of [['saigon-centre',4431],['vincom-dong-khoi',4432]])for(const [locale,width] of [['en',1280],['vi',390]].filter(([l])=>!process.env.CHECK_LOCALE||l===process.env.CHECK_LOCALE)){
 const page=await browser.newPage({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'}),row={mall,locale,width,checks:[],failed:[]};runs.push(row);
 const assert=(ok,label)=>{row.checks.push({label,pass:!!ok});if(!ok)throw Error(label)};
 const ready=()=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame);
 try{
  await page.goto(`http://localhost:${port}/${locale}?view=discovery`);await ready();
  if(width===390)await page.locator('.discovery-map-context button').click(); const label=await page.locator('.map-transform path[role=button]').first().getAttribute('aria-label');
  const floor=await page.locator('.scene-host-map').getAttribute('data-floor');
  const html=readFileSync(`dist/${mall}/${locale}/index.html`,'utf8').replaceAll('&quot;','"');
  const area=html.match(new RegExp('"id":\\[0,"(research-'+floor.toLowerCase()+'-[^"]+)"'))?.[1];
  if(!area)throw Error('No actual area identity on current floor');
  // The ordinary map action exposes its canonical area identity through URL.
  await page.locator('.map-transform path[role=button]').first().focus();await page.keyboard.press('Enter');await page.waitForTimeout(150);
  const params=new URLSearchParams({floor,view:'discovery',area});
  const direct=`http://localhost:${port}/${locale}?${params}`;row.direct=direct;row.label=label;
  await page.goto(direct);await ready();await page.locator('.discovery-glass').waitFor();await page.waitForTimeout(200);
  if(width===390)await page.locator('.discovery-map-context button').click();
  const before=page.url();await page.locator('.map-controls button').nth(1).click();await page.waitForTimeout(100);
  assert(page.url()===before&&await page.locator('.discovery-glass').count()===1,'Direct area Discovery retains selected details through map control');
  const previousY=await page.evaluate(()=>scrollY);
  await page.keyboard.press('Escape');await page.waitForTimeout(100);assert(await page.locator('.discovery-glass').count()===0,'Escape closes direct area');
  await page.goBack();await ready();await page.waitForTimeout(150);assert(await page.locator('.discovery-glass').count()===1,'Back restores direct area detail');
  assert(Math.abs(await page.evaluate(()=>scrollY)-previousY)<3,'Back restores Discovery scroll');
  const other=locale==='en'?'vi':'en';await page.locator(`.journey-header a[lang=${other}]`).click();await page.waitForTimeout(250);
  assert(new URL(page.url()).pathname.startsWith('/'+other)&&await page.locator('.discovery-glass').count()===1,'Locale retains Discovery detail');
 }catch(e){row.failed.push(e.message)}await page.close();writeFileSync(out+(process.env.CHECK_LOCALE?'/area-history-retry-results.json':'/area-history-results.json'),JSON.stringify(runs,null,2)+'\n');console.log(JSON.stringify(row));
}
await browser.close();if(runs.some(r=>r.failed.length))process.exitCode=1;




