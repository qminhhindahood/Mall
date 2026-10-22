// Browser-level checks for Directions routing and map zoom.
// Usage: node scripts/test-routing.mjs <saigonPort> <vincomPort>
// One seam: the Directions page, driven through its URL parameters.
import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
const [saigonPort = 4692, vincomPort = 4711] = process.argv.slice(2).map(Number);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
const failures = [], lines = [];

const READY = /Show route steps|Xem các bước/i;
const transferButton = /I’m on|Tôi đã đến/;
const stopButton = /Finish|Kết thúc/i;

async function openRoute(port, path, q, viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() === 404 && !/favicon/.test(r.url())) errors.push(`404 ${r.url()}`); });
  await page.goto(`http://127.0.0.1:${port}/${path}?${q}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(()=>!!document.querySelector('.atlas-primary')); await page.waitForTimeout(200);
  const primary = ((await page.locator('.atlas-primary').textContent().catch(() => '')) ?? '').trim();
  return { page, primary, errors, ready: READY.test(primary) };
}

async function stepsOf(page) {
  const steps = [];
  if (!(await page.locator('.atlas-primary').count())) return steps;
  if (READY.test((await page.locator('.atlas-primary').textContent()) ?? '')) {
    await page.locator('.atlas-primary').click();
    await page.waitForTimeout(250);
  }
  for (let i = 0; i < 40; i++) {
    const s = await page.locator('.atlas-current-step strong').first().textContent().catch(() => null);
    if (!s) break;
    steps.push(s);
    const label = (await page.locator('.atlas-primary').textContent().catch(() => '')) ?? '';
    if (stopButton.test(label)) break;
    await page.locator('.atlas-primary').click();
    await page.waitForTimeout(60);
  }
  return steps;
}

function check(label, cond, detail) { if (!cond) failures.push(`${label}: ${detail}`); }

// Reviewed guidance must win over the estimate.
{
  const label = 'Vincom: reviewed route wins (B3-13 to Siam Sugar)';
  const { page, primary, errors, ready } = await openRoute(vincomPort, 'en/directions', 'from=landmark:escalator&fromFloor=B3&to=vincom-prototype-siamsugar&floor=B3');
  const steps = ready ? await stepsOf(page) : [];
  const text = steps.join(' ');
  lines.push(`${label} -> ${ready ? `${steps.length} steps` : primary}`);
  check(label, ready, `no route (${primary})`);
  check(label, /Follow the aisle upward/i.test(text), 'reviewed wording missing');
  check(label, !/take the (lift|escalator)/i.test(text), 'estimated floor change used instead of the reviewed route');
  check(label, steps.length === 2, `expected the 2-step reviewed route, got ${steps.length}`);
  if (errors.length) check(label, false, `page error ${errors[0]}`);
  await page.close();
}

// Mapped listings on every floor, every floor pair (adjacent and skipping, M included).
const mapped = { B3: 'vincom-prototype-winmart', B2: 'vincom-prototype-tuyetkieu', B1: 'vincom-candidate-vd-b1-001', L1: 'vincom-prototype-lancome', M: 'vincom-prototype-tommyhilfiger', L2: 'vincom-prototype-pullbear', L3: 'vincom-prototype-cgv' };
const floorOrder = ['B3', 'B2', 'B1', 'L1', 'M', 'L2', 'L3'];
for (let i = 0; i < floorOrder.length; i++) for (let j = i + 1; j < floorOrder.length; j++) {
  const a = floorOrder[i], b = floorOrder[j], label = `Vincom: ${a} to ${b} (mapped to mapped)`;
  const { page, primary, errors, ready } = await openRoute(vincomPort, 'en/directions', `from=${mapped[a]}&fromFloor=${a}&to=${mapped[b]}&floor=${b}`);
  const steps = ready ? await stepsOf(page) : [];
  lines.push(`${label} -> ${ready ? `${steps.length} steps` : primary}`);
  check(label, ready, `no route (${primary})`);
  check(label, steps.length >= 3, `only ${steps.length} steps`);
  check(label, steps.some(s => /lift|escalator/i.test(s)), 'no lift or escalator step');
  if (errors.length) check(label, false, `page error ${errors[0]}`);
  await page.close();
}

// Mapped to floor-only, floor-only to mapped, floor-only to floor-only.
const vincomCases = [
  { name: 'mapped shop to a floor-only listing', q: 'from=vincom-prototype-watsons&fromFloor=B2&to=vincom-prototype-dessertplanet&floor=L3', min: 4 },
  { name: 'floor-only listing to a mapped shop', q: 'from=vincom-prototype-mochisweet&fromFloor=B3&to=vincom-prototype-lancome&floor=L1', min: 4 },
  { name: 'floor-only listing to floor-only listing', q: 'from=vincom-prototype-mochisweet&fromFloor=B3&to=vincom-prototype-hm&floor=M', min: 4, landing: 'M' },
  { name: 'same floor, two mapped shops', q: 'from=vincom-prototype-winmart&fromFloor=B3&to=vincom-prototype-chillithai&floor=B3', min: 2, cross: false },
  { name: 'Escalator beside B3-13 start', q: 'from=landmark:escalator&fromFloor=B3&to=vincom-prototype-cgv&floor=L3', min: 4, start: 'Escalator beside B3-13' },
];
for (const c of vincomCases) {
  const label = `Vincom: ${c.name}`;
  const { page, primary, errors, ready } = await openRoute(vincomPort, 'en/directions', c.q);
  const steps = ready ? await stepsOf(page) : [];
  lines.push(`${label} -> ${ready ? `${steps.length} steps` : primary}`);
  check(label, ready, `no route (${primary})`);
  if (ready) {
    check(label, steps.length >= c.min, `only ${steps.length} steps`);
    if (c.cross !== false) check(label, steps.some(s => /lift|escalator/i.test(s)), 'no floor change step');
    if (c.cross === false) check(label, !steps.some(s => /lift|escalator/i.test(s)), 'unexpected floor change');
    if (c.start) check(label, steps.some(s => s.includes(c.start)), `start "${c.start}" missing`);
    if (c.landing) check(label, steps.some(s => new RegExp(`${c.landing} is on|ở tầng ${c.landing}`).test(s)), `landing on ${c.landing} missing`);
  }
  if (errors.length) check(label, false, `page error ${errors[0]}`);
  await page.close();
}

// The map follows the transfer.
{
  const label = 'Vincom: map follows the floor change';
  const { page, primary, ready } = await openRoute(vincomPort, 'en/directions', 'from=vincom-prototype-watsons&fromFloor=B2&to=vincom-prototype-cgv&floor=L3');
  if (ready) {
    await page.locator('.atlas-primary').click(); await page.waitForTimeout(250);
    let moved = null;
    for (let i = 0; i < 15; i++) {
      const button = (await page.locator('.atlas-primary').textContent().catch(() => '')) ?? '';
      if (transferButton.test(button)) {
        const match = /(?:I’m on|Tôi đã đến)\s+([A-Z0-9]+)/.exec(button);
        const target = match?.[1];
        await page.locator('.atlas-primary').click(); await page.waitForTimeout(400);
        const heading = ((await page.locator('.atlas-map-header h2').textContent().catch(() => '')) ?? '').trim();
        moved = { target, heading };
        break;
      }
      if (stopButton.test(button)) break;
      await page.locator('.atlas-primary').click(); await page.waitForTimeout(200);
    }
    lines.push(`${label} -> ${moved ? `${moved.target} shown (${moved.heading})` : 'no transfer found'}`);
    check(label, !!moved, 'route did not expose a floor transfer');
    if (moved) check(label, moved.heading.startsWith(moved.target), `showed ${moved.heading} instead of ${moved.target}`);
  } else { lines.push(`${label} -> ${primary}`); check(label, false, `no route (${primary})`); }
  await page.close();
}

// Vietnamese and phone-width runs of a cross-floor case.
for (const run of [
  { name: 'Vietnamese cross-floor', path: 'vi/chi-duong', viewport: { width: 1440, height: 900 }, vi: true },
  { name: 'phone-width cross-floor', path: 'en/directions', viewport: { width: 390, height: 844 }, vi: false },
]) {
  const label = `Vincom: ${run.name}`;
  const q = 'from=vincom-prototype-watsons&fromFloor=B2&to=vincom-prototype-cgv&floor=L3';
  const { page, primary, errors, ready } = await openRoute(vincomPort, run.path, q, run.viewport);
  const steps = ready ? await stepsOf(page) : [];
  lines.push(`${label} -> ${ready ? `${steps.length} steps` : primary}`);
  check(label, ready, `no route (${primary})`);
  check(label, steps.some(s => /lift|escalator|thang (máy|cuốn)/i.test(s)), 'no floor change step');
  if (run.vi) check(label, steps.some(s => /thang (máy|cuốn)/i.test(s)), 'no Vietnamese lift or escalator step');
  if (run.viewport.width === 390) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    check(label, !overflow, 'horizontal overflow on a 390 px viewport');
  }
  if (errors.length) check(label, false, `page error ${errors[0]}`);
  await page.close();
}

// Vincom map icons and key on B3 (7 detected icons: 3 escalators, 2 lifts, 2 restrooms).
{
  const label = 'Vincom: B3 icons and key';
  const { page, errors } = await openRoute(vincomPort, 'en/directions', 'from=vincom-prototype-winmart&fromFloor=B3&to=vincom-prototype-chillithai&floor=B3');
  const icons = await page.locator('.plan-icons > g').count();
  const legend = ((await page.locator('.atlas-map-legend').textContent().catch(() => '')) ?? '');
  lines.push(`${label} -> ${icons} icons, key: ${legend.replace(/\s+/g, ' ').trim()}`);
  check(label, icons >= 7, `only ${icons} icons on B3`);
  check(label, /Escalator/i.test(legend) && /Lift/i.test(legend) && /Restrooms/i.test(legend), 'key is missing an icon name');
  if (errors.length) check(label, false, `page error ${errors[0]}`);
  await page.close();
}

// Saigon regression cases.
const saigonCases = [
  { name: 'same floor, two shops', q: 'to=saigon-prototype-mlb&floor=L3&from=saigon-prototype-adidas&fromFloor=L3', min: 2, cross: false },
  { name: 'between floors by lift', q: 'to=saigon-prototype-mlb&floor=L3&from=saigon-prototype-meatmeet&fromFloor=B2', min: 5, cross: true },
  { name: 'shop to a floor-only listing', q: 'to=saigon-prototype-matinkimvietnam&floor=L3&from=saigon-prototype-calvinklein&fromFloor=L2', min: 4, cross: true },
  { name: 'from a public entrance', q: 'to=saigon-prototype-mlb&floor=L3&from=saigon-entrance-door-1&fromFloor=L1', min: 4, cross: true },
  { name: 'floor-only listing to mapped shop', q: 'to=saigon-prototype-calvinklein&floor=L2&from=saigon-prototype-matinkimvietnam&fromFloor=L3', min: 4, cross: true },
];
for (const c of saigonCases) {
  const label = `Saigon: ${c.name}`;
  const { page, primary, errors, ready } = await openRoute(saigonPort, 'en/directions', c.q);
  const steps = ready ? await stepsOf(page) : [];
  lines.push(`${label} -> ${ready ? `${steps.length} steps` : primary}`);
  check(label, ready, `no route (${primary})`);
  if (ready) {
    check(label, steps.length >= c.min, `only ${steps.length} steps`);
    if (c.cross) check(label, steps.some(s => /lift|escalator/i.test(s)), 'no lift or escalator step');
    if (!c.cross) check(label, !steps.some(s => /lift|escalator/i.test(s)), 'unexpected floor change');
  }
  if (errors.length) check(label, false, `page error ${errors[0]}`);
  await page.close();
}

// Sweep: 40 seeded pairs from current Vincom listings, excluding source-plan-only identities whose current location is unconfirmed.
{
  const html = await (await fetch(`http://127.0.0.1:${vincomPort}/en/directions`)).text();
  const match = html.match(/<astro-island[^>]*props="([^"]*)"/);
  if (!match) failures.push('Vincom sweep: could not read the built directory');
  else {
    const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const revive = (_k, v) => Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' ? v[1] : v;
    const site = JSON.parse(decoded, revive).site;
    const all = site.destinations.filter(d=>!d.locations.some(l=>l.associationDetail?.referenceStatus==='source-plan-only')).map(d => ({ id: d.id, name: d.name.en, floor: d.primaryFloor }));
    let seed = 20261022;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const picked = [];
    for (let n = 0; n < 40; n++) {
      let a, b;
      do { a = all[Math.floor(rand() * all.length)]; b = all[Math.floor(rand() * all.length)]; } while (a.id === b.id);
      picked.push([a, b]);
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    let routed = 0;
    for (const [a, b] of picked) {
      await page.goto(`http://127.0.0.1:${vincomPort}/en/directions?from=${a.id}&fromFloor=${a.floor}&to=${b.id}&floor=${b.floor}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(()=>!!document.querySelector('.atlas-primary')); await page.waitForTimeout(60);
      const primary = ((await page.locator('.atlas-primary').textContent().catch(() => '')) ?? '').trim();
      if (READY.test(primary)) routed++;
      else failures.push(`Vincom sweep: ${a.name} (${a.floor}) to ${b.name} (${b.floor}) -> ${primary || 'no route control'}`);
    }
    await page.close();
    lines.push(`Vincom sweep: ${routed} of ${picked.length} sampled pairs routed`);
    if (routed !== picked.length) failures.push(`Vincom sweep: ${picked.length - routed} of ${picked.length} pairs did not route`);
  }
}

// Zoom grows from the middle of the map, not from its top-left corner.
for (const [mall, port] of [['Saigon', saigonPort], ['Vincom', vincomPort]]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}/en/directions`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('.atlas-map-controls button').nth(1).click();
  await page.waitForTimeout(400);
  const moved = await page.locator('.atlas-map-scroll').evaluate(e => ({ left: e.scrollLeft, top: e.scrollTop, w: e.clientWidth, h: e.clientHeight, sw: e.scrollWidth }));
  lines.push(`${mall}: zoom in -> scroll ${Math.round(moved.left)},${Math.round(moved.top)} of ${moved.sw}px`);
  if (!(moved.left > moved.w * 0.15 && moved.top > moved.h * 0.15)) failures.push(`${mall}: zoom did not anchor on the map centre (${Math.round(moved.left)},${Math.round(moved.top)})`);
  await page.close();
}

await browser.close();
console.log(lines.join('\n'));
console.log(JSON.stringify({ failures }, null, 1));
process.exit(failures.length ? 1 : 0);
