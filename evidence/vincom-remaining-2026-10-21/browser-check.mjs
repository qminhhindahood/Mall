import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const baseline = process.argv.includes('--baseline');
const browser = await chromium.launch({ headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--disable-webgl'] });
const results = [];
try {
  for (const locale of baseline ? ['en'] : ['en','vi']) for (const width of baseline ? [390] : [1280,390]) {
    const page = await browser.newPage({ viewport:{width,height:844}, reducedMotion:'reduce' });
    const row = {locale,width,checks:[],errors:[]}; results.push(row);
    page.on('pageerror', error => row.errors.push(error.message));
    try {
      await page.goto(`http://127.0.0.1:4621/${locale}/${locale==='vi'?'cua-hang':'stores'}/vincom-prototype-nike?floor=B1`);
      const directions = page.locator('a[href*="to=vincom-prototype-nike"]').first();
      const href = await directions.getAttribute('href');
      assert.ok(href.includes('to=vincom-prototype-nike') && href.includes('floor=B1'));
      await page.goto(new URL(href,page.url()).href);
      await page.locator('astro-island:not([ssr])').waitFor();
      const selected = page.locator('.atlas-map-stage svg path[aria-pressed="true"]');
      await selected.first().waitFor({timeout:5000});
      assert.equal(await selected.count(),1,'Nike must highlight one B1-55 source area');
      assert.match(await selected.getAttribute('aria-label'),/Nike/);
      row.checks.push('Nike direct detail handoff selects one named B1 area');
      assert.equal(await page.locator('.atlas-primary').isDisabled(),true,'New mapping must not invent a route');
      row.checks.push('Nike route remains unavailable without a supported connection');
      await selected.focus(); await page.keyboard.press('Enter');
      await page.locator('.atlas-area-selection').waitFor();
      assert.match(await page.locator('.atlas-area-selection').innerText(),/Nike/);
      row.checks.push('Keyboard map selection retains Nike identity');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      row.checks.push('Desktop/phone map has no horizontal overflow');
      await page.screenshot({path:`evidence/vincom-remaining-2026-10-21/nike-${locale}-${width}.png`});
      await page.goto(`http://127.0.0.1:4621/${locale}/${locale==='vi'?'cua-hang':'stores'}/vincom-prototype-adidasoriginals?floor=B1`);
      const neighbour = await page.locator('a[href*="to=vincom-prototype-adidasoriginals"]').first().getAttribute('href');
      await page.goto(new URL(neighbour,page.url()).href);
      await page.locator('astro-island:not([ssr])').waitFor();
      await page.locator('.atlas-map-stage svg path[aria-pressed="true"]').first().waitFor();
      assert.match(await page.locator('.atlas-map-stage svg path[aria-pressed="true"]').getAttribute('aria-label'),/Adidas/);
      row.checks.push('Adjacent Adidas Originals mapping remains selectable');
      for (const id of ['lacoste','scentuals','lining','messyweekend','beautybox']) {
        await page.goto(`http://127.0.0.1:4621/${locale}/${locale==='vi'?'cua-hang':'stores'}/vincom-prototype-${id}?view=discovery`);
        await page.locator('.discovery-glass').waitFor();
        const summary = await page.locator('.discovery-glass .detail-location-summary').innerText();
        assert.ok(locale==='en'?summary.includes('store area not mapped'):summary.includes('chưa'));
      }
      row.checks.push('All five precision-held stores remain floor-only');
      assert.deepEqual(row.errors,[]); row.checks.push('No page errors');
    } catch(error) {
      row.failure=String(error);
      row.url=page.url();
    } finally { await page.close(); }
  }
} finally {
  await browser.close();
  await writeFile(`evidence/vincom-remaining-2026-10-21/browser-${baseline?'before':'after'}.json`,JSON.stringify(results,null,2)+'\n');
}
console.log(JSON.stringify(results));
if(results.some(row=>row.failure)) process.exitCode=1;
