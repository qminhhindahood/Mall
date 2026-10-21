// Browser-level checks for the 22 October UI polish pass (owner notes 0032).
// Usage: node scripts/test-ui-polish.mjs <saigonPort> <vincomPort>
import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
const [saigonPort=4692,vincomPort=4711]=process.argv.slice(2).map(Number);
const malls=[
  {mall:'saigon',port:saigonPort,store:'saigon-prototype-meatmeet'},
  {mall:'vincom',port:vincomPort,store:'vincom-prototype-zara'}
];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
const results=[];
for(const {mall,port,store} of malls)for(const width of [1440,390])for(const locale of ['en','vi']){
  const row={mall,width,locale,checks:[],errors:[]};results.push(row);
  const page=await browser.newPage({viewport:{width,height:900}});
  page.on('pageerror',e=>row.errors.push(e.message));
  const check=(ok,label)=>{row.checks.push({label,pass:!!ok});};
  const base=`http://127.0.0.1:${port}`;
  try{
    await page.goto(`${base}/${locale}`,{waitUntil:'networkidle'});
    await page.waitForTimeout(1500);
    check(await page.locator('.brand-symbol').count()===0,'no logo mark beside the mall name');
    check(await page.locator('.introduction-controls,.guide-identity').count()===0,'hero has no controls row or identity line');
    check(await page.locator('main h1:visible').count()===1,'exactly one visible h1 on Home');
    check(await page.locator('#scene-overview').count()===1&&await page.locator('#scene-map').count()===1,'Home keeps the floor overview and floor map');
    const lang=await page.locator('.shell-language').getAttribute('aria-label');
    const visible=(await page.locator('.shell-language').innerText()).trim();
    check(lang?.includes(visible),'language control name contains its visible text');
    check(await page.locator('.public-entrance').count()===0,'no entrance badges on Home');
    check(await page.locator('nav[aria-label]').evaluateAll(n=>new Set(n.map(e=>e.getAttribute('aria-label'))).size===n.length),'landmark names are unique');
    // From the overview, choosing a floor lands on a visible map heading.
    if(width>700){
      await page.locator('.registered-floors .floor-rail a').first().scrollIntoViewIfNeeded().catch(()=>{});
      await page.evaluate(()=>document.querySelector('#scene-overview')?.scrollIntoView());
      await page.waitForTimeout(1500);
      await page.locator('.floor-rail a').nth(2).click();
      await page.waitForTimeout(4500);
      const top=await page.evaluate(()=>{const h=document.querySelector('.map-reading>h2');return h?h.getBoundingClientRect().top:-1;});
      check(top>=88,`floor heading clears the header (top ${Math.round(top)}px)`);
    }
    // Discovery page and store sheet.
    await page.goto(`${base}/${locale}/${locale==='vi'?'kham-pha':'discovery'}`,{waitUntil:'networkidle'});
    await page.waitForTimeout(1500);
    check(await page.locator('main h1:visible').count()===1,'exactly one visible h1 on the Discovery page');
    await page.locator('.visitor-highlights a').first().click();
    const dialog=page.locator('[role=dialog]');await dialog.waitFor();await page.waitForTimeout(800);
    const box=await dialog.boundingBox();
    check(width>700?box.x<40:box.x===0,'store sheet opens on the left');
    const text=(await dialog.innerText()).toLowerCase();
    check(!/(source|reviewed|verified|nguồn|đã xác minh|đã duyệt|brand-wide|mapped area)/.test(text),'store sheet shows no provenance wording');
    check(await dialog.locator('.detail-facts li').count()>=0&&await dialog.locator('[data-directions-handoff]').count()===1,'store sheet keeps Directions');
    await page.keyboard.press('Escape');
  }catch(e){check(false,`flow threw: ${String(e.message).split('\n')[0]}`);}
  await page.close();
}
await browser.close();
const failed=results.flatMap(r=>r.checks.filter(c=>!c.pass).map(c=>`${r.mall} ${r.width} ${r.locale}: ${c.label}`)).concat(results.flatMap(r=>r.errors.map(e=>`${r.mall} ${r.width} ${r.locale}: page error ${e}`)));
console.log(JSON.stringify({cases:results.length,checks:results.reduce((n,r)=>n+r.checks.length,0),failed},null,1));
process.exit(failed.length?1:0);
