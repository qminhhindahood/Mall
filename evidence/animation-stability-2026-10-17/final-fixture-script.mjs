import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const script=await readFile('D:/Midterm/.scratch/animation-stability-2026-10-17/browser-checks/journey.js','utf8');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={sourceCommit:'c011906 + review fixes',browser:browser.version(),runs:[]};
try {for(const [mall,port]of[['saigon',4337],['vincom',4338]])for(const locale of ['vi','en'])for(const width of [1280,390]){
 const context=await browser.newContext({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'});const page=await context.newPage();const row={mall,locale,width,checks:[],failed:[]};results.runs.push(row);
 try {
  await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'tang':'floors'}/L1`);await page.waitForFunction(()=>!!document.querySelector('canvas')?.dataset.completeFrame&&!document.querySelector('.loading-screen'));
  const result=await page.evaluate(script);row.checks=result.checks;row.failed=result.failed;
  await page.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/loading-test-store?floor=L2&view=map`);
  await page.waitForFunction(()=>!!document.querySelector('.destination')&&!document.querySelector('.loading-screen')&&document.activeElement?.classList.contains('destination'));
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>!document.querySelector('.destination')&&new URL(location.href).searchParams.get('view')==='exterior');
  if(new URL(page.url()).searchParams.get('floor')==='L2')row.checks.push('Reverse to exterior dismisses destination and retains floor');else row.failed.push('Reverse loses destination floor');
  await page.locator('.skip-introduction').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.activeElement?.id==='scene-map');
  await page.locator('#scene-map .floors a').first().evaluate(a=>{a.click();a.parentElement.querySelector('a:last-child').click();});
  const expected=mall==='saigon'?'L6':'L3';await page.waitForFunction(id=>!document.querySelector('.loading-screen')&&document.querySelector('.persistent-map [data-floor]')?.dataset.floor===id,expected);await page.waitForTimeout(200);
  if(new URL(page.url()).searchParams.get('floor')===expected)row.checks.push('Rapid selection keeps newest floor intent');else row.failed.push('Rapid selection stale intent');
 }catch(error){row.failed.push(error.message);}finally{console.log(JSON.stringify({mall,locale,width,checks:row.checks.length,failed:row.failed}));await context.close();await writeFile('D:/Midterm/.scratch/animation-stability-2026-10-17/evidence/animation-stability-2026-10-17/suite/fixture-results.json',JSON.stringify(results,null,2)+'\n');}
}}finally{await browser.close();}if(results.runs.some(r=>r.failed.length))process.exitCode=1;
