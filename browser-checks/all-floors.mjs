import {chromium}from '../../../.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});const results=[];
try{for(const [mall,port,defaultFloor]of [['saigon',4283,'L5'],['vincom',4284,'B2']])for(const locale of ['vi','en'])for(const width of [1280,390]){
const context=await browser.newContext({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'});const page=await context.newPage();const run={mall,locale,width,checks:[],failed:[]};results.push(run);
await page.goto(`http://localhost:${port}/${locale}`);await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.completeFrame&&!document.querySelector('.loading-screen'));
await page.locator('a.skip-introduction').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('.loading-screen'));if(await page.locator('.persistent-map [data-floor]').getAttribute('data-floor')===defaultFloor)run.checks.push('Default map and keyboard skip');else run.failed.push('Default map');
const labels=await page.locator('.floor-rail a').allTextContents();for(const id of labels){await page.locator('.floor-rail a').filter({hasText:new RegExp(`^${id}$`)}).evaluate(a=>a.click());await page.waitForFunction(id=>!document.querySelector('.loading-screen')&&document.querySelector('.persistent-map [data-floor]')?.dataset.floor===id,id);if(new URL(page.url()).searchParams.get('floor')===id)run.checks.push(`Immediate map ${id}`);else run.failed.push(`Map ${id}`);}
run.pending=await page.locator('.directory-panel').innerText().then(s=>s.includes(locale==='vi'?'chờ duyệt':'pending'));if(!run.pending)run.failed.push('Public pending state');
run.errors=[];console.log(JSON.stringify({mall,locale,width,floors:labels.length,failed:run.failed}));await context.close();
}}finally{await writeFile(new URL('../evidence/journey/all-floor-results.json',import.meta.url),JSON.stringify(results,null,2));await browser.close();}if(results.some(r=>r.failed.length))process.exitCode=1;
