import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const out=new URL('./',import.meta.url),r={scope:'Final CSS rebuild focused phone popup retest only; full prior 84-check receipt retained.',runs:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{for(const locale of['en','vi']){
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),run={locale,checks:[],errors:[]};r.runs.push(run);page.on('pageerror',e=>run.errors.push(e.message));
try{
await page.goto(`http://127.0.0.1:4491/${locale}/${locale==='vi'?'chi-duong':'directions'}?to=vincom-candidate-vd-b1-006&floor=B1`,{waitUntil:'domcontentloaded'});await page.locator('.atlas-association-notes').waitFor();
await page.locator('.atlas-map-stage path[role="button"][data-selected="true"]').first().press('Enter');const popup=page.locator('.atlas-area-selection');await popup.waitFor();await popup.scrollIntoViewIfNeeded();
run.layout=await popup.evaluate(e=>{const note=e.querySelector('[data-association-kind="partial-source-layout"]'),buttons=[...e.querySelectorAll('button')].filter(b=>!b.classList.contains('atlas-area-close'));return{rect:e.getBoundingClientRect().toJSON(),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,note:{text:note.textContent,rect:note.getBoundingClientRect().toJSON()},buttons:buttons.map(b=>({text:b.textContent,rect:b.getBoundingClientRect().toJSON()})),pageWidth:document.documentElement.scrollWidth,viewport:innerWidth}});
const l=run.layout;run.checks.push({name:'Both action targets at least44px in both dimensions',pass:l.buttons.length===2&&l.buttons.every(b=>b.rect.width>=44&&b.rect.height>=44)});run.checks.push({name:'Partial note is above actions',pass:l.note.rect.bottom<=Math.min(...l.buttons.map(b=>b.rect.top))+1});run.checks.push({name:'No popup or page horizontal overflow',pass:l.scrollWidth<=l.clientWidth+1&&l.pageWidth<=l.viewport+1});run.checks.push({name:'Explicit partial limitation remains',pass:l.note.text.includes('B1-17C')&&l.note.text.includes(locale==='vi'?'một phần':'Partial')});
await page.screenshot({path:new URL(`final-popup-${locale}.png`,out).pathname.replace(/^\//,'')});
await popup.locator('button').last().click();run.checks.push({name:'Go here remains operable and retains partial card note',pass:await popup.count()===0&&(await page.locator('.atlas-association-notes').innerText()).includes('B1-17C')});run.checks.push({name:'No page errors',pass:!run.errors.length});
}catch(e){run.failure=e.message}console.log(JSON.stringify(run));await context.close();}
}finally{await writeFile(new URL('final-popup-receipt.json',out),JSON.stringify(r,null,2));await browser.close()}
