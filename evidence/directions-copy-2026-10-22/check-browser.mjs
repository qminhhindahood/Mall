import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-webgl']});const checks=[];
try{for(const locale of ['en','vi'])for(const width of [390,1280])for(const port of [4621,4622]) {
const p=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
const q=port===4621?'from=vincom-prototype-watsons&fromFloor=B2&to=vincom-prototype-cgv&floor=L3':'from=saigon-entrance-door-1&fromFloor=L1&to=saigon-prototype-mlb&floor=L3';
await p.goto(`http://localhost:${port}/${locale}/${locale==='vi'?'chi-duong':'directions'}?${q}`);await p.waitForFunction(()=>document.querySelector('.atlas-primary')?.disabled===false);
assert.ok(!(await p.locator('.atlas-estimate-note').isVisible()));
await p.locator('.atlas-place').nth(1).click();
const chooser=await p.locator('.atlas-search-results').innerText();
assert.ok(!/Approximate mapped area|Khu vực gần đúng|Estimated route from the floor plan|Lộ trình ước tính từ sơ đồ tầng/.test(chooser));
await p.locator('.atlas-search-dialog input').fill(port===4621?'CGV':'MLB');
await p.locator('.atlas-search-results button').first().click();
assert.ok(await p.locator('.atlas-primary').isEnabled());
await p.locator('.atlas-disclosure').click();assert.ok(await p.locator('.atlas-estimate-note').isVisible());assert.ok((await p.locator('.atlas-estimate-note').innerText()).includes(locale==='vi'?'ước tính':'Estimated'));await p.locator('.atlas-details ol button').last().click();
assert.ok((await p.locator('.atlas-map-header h2').innerText()).startsWith('L3'));
assert.equal(await p.getByText('Kết nối từ cửa vào chưa được kiểm tra',{exact:true}).count(),0);
assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
checks.push({port,locale,width,genericChooserLabelsRemoved:true,estimatedBasisInDetails:true,stepSelection:true,errors});await p.close();
}
const row=JSON.parse(readFileSync('data/research/vincom-literal-plan-references-2026-10-22-r1.json')).rows[0];
for(const locale of ['en','vi']){const p=await browser.newPage();await p.goto(`http://localhost:4621/${locale}/${locale==='vi'?'chi-duong':'directions'}?from=landmark:escalator&fromFloor=B3&to=${row.destinationId}&floor=${row.floorId}`);await p.waitForFunction(()=>!!document.querySelector('.atlas-primary'));assert.ok(await p.locator('.atlas-primary').isDisabled());assert.equal(await p.locator('.atlas-estimate-note').count(),0);assert.ok((await p.locator('.atlas-association-notes').innerText()).includes(locale==='vi'?'chưa xác minh':'unconfirmed'));checks.push({locale,sourcePlanOnlyBlocked:true});await p.close()}
}finally{await browser.close()}
writeFileSync('evidence/directions-copy-2026-10-22/browser-results.json',JSON.stringify(checks,null,2)+'\n');console.log(`${checks.length} focused browser cases passed`);
