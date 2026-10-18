// Public browser seam; supplemental to r9 actual pointer regression matrix.
import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out='evidence/finish-readiness-2026-10-18',runs=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const record=async()=>writeFile(`${out}/keyboard-results.json`,JSON.stringify({profile:'Headless installed Chrome/SwiftShader; CSS viewports, not native device or native hidden/return',browser:browser.version(),runs},null,2)+'\n');
try{
 for(const [mall,port]of [['saigon',4355],['vincom',4356]])for(const width of [1280,390])for(const locale of ['en','vi']){
  const context=await browser.newContext({viewport:{width,height:width===390?844:800},reducedMotion:locale==='vi'?'reduce':'no-preference'}),page=await context.newPage(),row={mall,width,locale,checks:[],failed:[],errors:[]};runs.push(row);page.on('pageerror',e=>row.errors.push(e.message));
  try{
   await page.goto(`http://localhost:${port}/${locale}?view=map`);
   await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
   const path=page.locator('.persistent-map path[role=button]').first();await path.focus();
   const focus=await path.evaluate(p=>({active:document.activeElement===p,outline:getComputedStyle(p).outlineStyle,shadow:getComputedStyle(p).boxShadow,vector:getComputedStyle(p).vectorEffect}));
   if(!focus.active||focus.outline!=='none'||focus.shadow!=='none'||focus.vector!=='non-scaling-stroke')throw Error('Map keyboard focus style/activation target');row.checks.push('Map focus is keyboard reachable with contour-only indicator');
   await path.press('Enter');await page.waitForFunction(()=>new URL(location.href).searchParams.has('area')&&!document.querySelector('.loading-screen'));
   if(!await page.locator('.persistent-map path[data-selected=true]').count()||!await page.locator('.shared-area').count())throw Error('Enter selection/detail');row.checks.push('Enter opens selected area and relevant list');row.selectedUrl=page.url();
   await page.goBack();await page.waitForFunction(()=>!new URL(location.href).searchParams.has('area')&&!document.querySelector('.loading-screen'));row.checks.push('Back restores prior map selection');
   await page.goForward();await page.waitForFunction(()=>new URL(location.href).searchParams.has('area')&&!document.querySelector('.loading-screen'));if(!await page.locator('.shared-area').count())throw Error('Forward detail restoration');row.checks.push('Forward restores selected area/list');
   await page.goBack();await page.waitForFunction(()=>!new URL(location.href).searchParams.has('area')&&!document.querySelector('.loading-screen'));await path.focus();await path.press('Space');await page.waitForFunction(()=>new URL(location.href).searchParams.has('area')&&!document.querySelector('.loading-screen'));row.checks.push('Space activates SVG area');
   await page.locator('.shared-area > a').press('Enter');await page.waitForFunction(()=>!new URL(location.href).searchParams.has('area')&&!document.querySelector('.loading-screen'));row.checks.push('Keyboard close clears area selection');
   if(row.errors.length)throw Error('Page errors: '+row.errors.join(';'));
  }catch(e){row.failed.push(e.message);}finally{await context.close();console.log(JSON.stringify(row));await record();}
 }
 for(const [mall,port]of [['saigon',4363],['vincom',4364]])for(const locale of ['en','vi']){
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage(),row={mall,locale,mode:'no-JavaScript exact public output',checks:[],failed:[]};runs.push(row);
  try{const r=await page.goto(`http://localhost:${port}/${locale}`);if(r.status()!==200||!await page.locator('.static-guide').count()||!await page.locator('.static-guide a').count())throw Error('NoJS useful introduction');row.checks.push('Useful public guide/ordinary links without JavaScript');const floor=await page.locator('.static-guide a[href*="/'+(locale==='vi'?'tang':'floors')+'/"]').first().getAttribute('href');const f=await page.goto(`http://localhost:${port}${floor}`);if(f.status()!==200||!await page.locator('svg path').count())throw Error('NoJS floor map');row.checks.push('Ordinary floor navigation renders static SVG');}catch(e){row.failed.push(e.message);}finally{await context.close();console.log(JSON.stringify(row));await record();}
 }
}finally{await browser.close();await record();}
if(runs.some(r=>r.failed.length||r.errors?.length))process.exitCode=1;
