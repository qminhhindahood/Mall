import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';

const out = new URL('./suite/paired-native-profile.json', import.meta.url);
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const result = {
  base: '96d1384', candidate: '110c08c', browser: browser.version(),
  profile: 'Headless Chrome, native GPU if available, 1280x800 CSS, DPR 1; one WebGL page open at a time',
  wheel: [], paired: [],
};
const configs = [['saigon', 4343, 4333], ['vincom', 4344, 4334]];
const ready = page => page.waitForFunction(() => !document.querySelector('.loading-screen') && document.querySelector('canvas')?.dataset.completeFrame, null, { timeout: 45000 });

try {
  for (const [mall, , candidatePort] of configs) for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 800 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const row = { mall, width, failures: [], pageErrors: [] }; result.wheel.push(row);
    page.on('pageerror', e => row.pageErrors.push(e.message));
    try {
      await page.goto(`http://localhost:${candidatePort}/en`); await ready(page);
      const overviewY = await page.evaluate(() => (innerWidth <= 700 ? document.querySelector('.registered-scene').offsetTop - 116 : 0) + innerHeight);
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), overviewY);
      await page.waitForFunction(() => !document.querySelector('.registered-floors').inert);
      await page.mouse.move(1, width === 390 ? 840 : 796);
      await page.locator('.floor-rail a[data-floor-id="L2"]').focus();
      await page.waitForTimeout(150);
      const before = await page.evaluate(() => ({ y: scrollY, preview: [...document.querySelectorAll('[data-preview="true"]')].map(x => x.dataset.floorId), focus: document.activeElement?.dataset.floorId }));
      row.before = before;
      await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(150);
      row.reduced = await page.evaluate(() => ({ preview: [...document.querySelectorAll('[data-preview="true"]')].map(x => x.dataset.floorId), focus: document.activeElement?.dataset.floorId, paused: document.querySelector('.pause-control')?.disabled }));
      if (before.focus !== 'L2' || !before.preview.includes('L2') || row.reduced.focus !== 'L2' || !row.reduced.preview.includes('L2') || !row.reduced.paused) row.failures.push('Live reduced-motion change lost focused floor preview');
      await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.waitForTimeout(100);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(100);
      const canvas = page.locator('canvas'); let resizes = 0;
      await canvas.evaluate(c => { window.__bufferObserver = new MutationObserver(records => window.__bufferResizes += records.filter(r => ['width', 'height'].includes(r.attributeName)).length); window.__bufferResizes = 0; window.__bufferObserver.observe(c, { attributes: true }); });
      const start = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 700); await page.waitForTimeout(450);
      row.down = await page.evaluate(() => ({ y: scrollY, loading: !!document.querySelector('.loading-screen'), frame: document.querySelector('canvas').dataset.completeFrame }));
      await page.mouse.wheel(0, -700); await page.waitForTimeout(450);
      row.up = await page.evaluate(() => ({ y: scrollY, loading: !!document.querySelector('.loading-screen'), frame: document.querySelector('canvas').dataset.completeFrame, resizes: window.__bufferResizes }));
      await page.evaluate(() => window.__bufferObserver.disconnect()); resizes = row.up.resizes;
      if (row.down.y <= start || row.down.loading || !row.down.frame) row.failures.push('Native downward wheel did not retain a complete rendered scene');
      if (row.up.y >= row.down.y || row.up.loading || !row.up.frame) row.failures.push('Native upward wheel did not retain a complete rendered scene');
      if (resizes) row.failures.push(`Wheel motion resized drawing buffer ${resizes} times`);
    } catch (e) { row.failures.push(e.message); }
    await context.close();
  }

  if (process.env.WHEEL_ONLY !== '1') for (const [mall, basePort, candidatePort] of configs) {
    for (const [pair, order] of [['A', ['base', 'candidate']], ['B', ['candidate', 'base']]]) {
      const samples = {};
      for (const version of order) {
        const port = version === 'base' ? basePort : candidatePort;
        const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
        const page = await context.newPage();
        await page.goto(`http://localhost:${port}/en`); await ready(page); await page.waitForTimeout(1800);
        samples[version] = await page.evaluate(async () => {
          const canvas = document.querySelector('canvas'), gl = canvas.getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info');
          let resizes = 0; const observer = new MutationObserver(records => resizes += records.filter(r => ['width', 'height'].includes(r.attributeName)).length);
          observer.observe(canvas, { attributes: true });
          const frames = []; let last; const start = performance.now();
          await new Promise(resolve => { const tick = t => { if (last !== undefined) frames.push(t - last); last = t; if (t - start < 1200) requestAnimationFrame(tick); else resolve(); }; requestAnimationFrame(tick); });
          observer.disconnect(); const sorted = [...frames].sort((a,b) => a-b);
          return { frames: frames.length, medianMs: sorted[Math.floor(sorted.length * .5)], p95Ms: sorted[Math.floor(sorted.length * .95)], over33ms: frames.filter(x => x > 33).length, bufferResizes: resizes, gpu: ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL), dpr: devicePixelRatio, visible: document.visibilityState };
        });
        await context.close();
      }
      result.paired.push({ mall, pair, order, samples });
      await writeFile(out, JSON.stringify(result, null, 2) + '\n');
    }
  }
} finally {
  await writeFile(out, JSON.stringify(result, null, 2) + '\n');
  await browser.close();
}
if (result.wheel.some(row => row.failures.length || row.pageErrors.length)) process.exitCode = 1;
