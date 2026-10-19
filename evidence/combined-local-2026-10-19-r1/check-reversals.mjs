import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'evidence/combined-local-2026-10-19-r1';
await mkdir(`${out}/recordings`, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-unsafe-swiftshader'] });
const receipt = { browser: browser.version(), runs: [], scope: 'Emulated touch and CSS viewports; local rendering, not physical-device smoothness acceptance' };
const ready = page => page.waitForFunction(() => !document.querySelector('.loading-screen') && document.querySelector('canvas')?.dataset.completeFrame, null, { timeout: 45000 });
try {
  for (const [mall, port] of [['saigon', 4401], ['vincom', 4402]]) for (const locale of ['en', 'vi']) for (const width of [1280, 390]) {
    const height = width === 390 ? 844 : 800;
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width === 390, reducedMotion: 'no-preference', recordVideo: locale === 'en' ? { dir: `${out}/recordings`, size: { width, height } } : undefined });
    const page = await context.newPage();
    const row = { mall, locale, width, height, checks: [], failed: [], errors: [] };
    receipt.runs.push(row);
    page.on('pageerror', error => row.errors.push(error.message));
    const check = (ok, label) => { (ok ? row.checks : row.failed).push(label); if (!ok) throw Error(label); };
    try {
      await page.goto(`http://localhost:${port}/${locale}`);
      await ready(page);
      check(await page.evaluate(w => innerWidth === w && !matchMedia('(prefers-reduced-motion: reduce)').matches, width), 'Actual CSS width and normal motion');
      await page.evaluate(() => {
        window.__motionReview = { samples: [], last: performance.now(), active: true };
        const sample = now => {
          const state = window.__motionReview;
          if (!state.active) return;
          state.samples.push({ dt: now - state.last, y: scrollY, view: document.querySelector('.visitor-guide')?.dataset.view, loading: !!document.querySelector('.loading-screen') });
          state.last = now;
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      const overviewY = await page.evaluate(() => {
        const stage = document.querySelector('.exterior-floor-journey'), hero = document.querySelector('#scene-exterior');
        return stage.offsetTop + (innerWidth <= 700 ? hero.offsetTop + hero.offsetHeight + 24 - 116 : 0) + innerHeight + 24;
      });
      // Intermediate approach positions and rapid forward/backward intent changes.
      for (const fraction of [.15, .35, .55, .8, .45, .9, .6, 1]) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), overviewY * fraction);
        await page.waitForTimeout(120);
      }
      await page.waitForFunction(() => !document.querySelector('.registered-floors').inert);
      await ready(page);
      await page.screenshot({ path: `${out}/frames/${mall}-${width}-${locale}-reversal-overview.png` });
      const floor = page.locator('.registered-floors .floor-rail [data-floor-id="L2"]');
      if (width === 390) await floor.tap();
      else { await floor.focus(); await page.keyboard.press('Enter'); }
      await ready(page);
      await page.waitForFunction(() => document.activeElement?.id === 'scene-map');
      check(new URL(page.url()).searchParams.get('floor') === 'L2', 'Touch or keyboard selects L2 and focuses map');
      const map = await page.locator('.persistent-map').elementHandle();
      const positions = await page.evaluate(() => ({ map: scrollY, invitation: scrollY + document.querySelector('.discovery-introduction h2').getBoundingClientRect().top - innerHeight * .4, discovery: scrollY + document.querySelector('#scene-discovery').getBoundingClientRect().top - 120 }));
      // Reversal delays are deliberately shorter than normal animation settling.
      for (const key of ['invitation', 'map', 'discovery', 'invitation', 'discovery', 'map', 'discovery']) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), positions[key]);
        await page.waitForTimeout(90);
      }
      await ready(page);
      await page.waitForTimeout(350);
      check(await map.evaluate(e => e === document.querySelector('.persistent-map')), 'Same map survives rapid reversals');
      check(new URL(page.url()).searchParams.get('floor') === 'L2', 'L2 retained after rapid reversals');
      check(await page.locator('.map-floor-rail').evaluate(e => getComputedStyle(e).visibility === 'hidden'), 'Old rail clears at final Discovery');
      check(await page.locator('.persistent-map').evaluate(e => Number(getComputedStyle(e).opacity) > .99), 'Final Discovery map fully visible');
      const first = page.locator('[data-discovery-result]').first();
      if (width === 390) {
        await first.evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - innerHeight + 120, behavior: 'instant' }));
        await first.tap();
      } else { await first.focus(); await page.keyboard.press('Enter'); }
      await page.waitForSelector('.discovery-glass');
      check(true, 'Touch or keyboard opens destination details');
      const url = page.url();
      if (width === 390) { await page.locator('.discovery-map-context button').tap(); await page.locator('.map-controls button').nth(1).tap(); }
      else { await page.locator('.map-controls button').nth(1).focus(); await page.keyboard.press('Enter'); }
      check(page.url() === url && await page.locator('.discovery-glass').count() === 1, 'Touch or keyboard zoom preserves selected destination');
      await page.keyboard.press('Escape');
      check(await first.evaluate(e => e === document.activeElement), 'Escape restores result focus');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
      check(row.errors.length === 0, 'No uncaught page errors');
      row.frameSamples = await page.evaluate(() => { window.__motionReview.active = false; return window.__motionReview.samples; });
      const intervals = row.frameSamples.map(s => s.dt).sort((a, b) => a - b);
      row.frameTiming = { count: intervals.length, p95Ms: intervals[Math.floor(intervals.length * .95)], maxMs: intervals.at(-1), loadingFrames: row.frameSamples.filter(s => s.loading).length, qualification: 'Includes screenshot and automation overhead; diagnostic only, no smoothness pass threshold' };
    } catch (error) { if (!row.failed.includes(error.message)) row.failed.push(error.message); }
    finally {
      const video = page.video();
      await context.close();
      if (video) { row.recording = `recordings/${mall}-${width}-en.webm`; await video.saveAs(`${out}/${row.recording}`); await video.delete(); }
      await writeFile(`${out}/reversal-results.json`, JSON.stringify(receipt, null, 2) + '\n');
      console.log(JSON.stringify({ mall, locale, width, checks: row.checks.length, failed: row.failed }));
    }
  }
} finally { await browser.close(); }
if (receipt.runs.some(r => r.failed.length)) process.exitCode = 1;


