import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const result={at:new Date().toISOString(),scope:'Synthetic fixture recommendation only; no real endorsement',runs:[]};
try{for(const [mall,port]of[['saigon',4337],['vincom',4338]])for(const locale of ['en','vi']){
 const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:900}}),page=await context.newPage(),row={mall,locale,checks:[],failed:[]};result.runs.push(row);
 try{
  await page.goto(`http://localhost:${port}/${locale}?view=discovery`);await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.activeElement?.id==='scene-discovery');
  if(await page.locator('.discovery-highlights a').count()!==1)throw Error('Expected exactly one supplied fixture Highlight');row.checks.push('Only supplied eligible fixture recommendation is shown');
  await page.locator('.discovery-highlights a').click();await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&!!document.querySelector('.discovery-glass'));
  if(!page.url().includes('/test-coffee?floor=L2&view=discovery'))throw Error('Highlight did not open its own destination/floor');row.checks.push('Highlight opens its specific destination and L2 within Discovery');
  if(!await page.locator('.persistent-map svg').count())throw Error('Map lost');row.checks.push('Recommendation selection preserves usable map');
 }catch(error){row.failed.push(error.message)}finally{await context.close();await writeFile('evidence/transition-location-2026-10-18-r4/highlight-results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(row));}
}}finally{await browser.close()}
if(result.runs.some(r=>r.failed.length))process.exitCode=1;
