// Evidence-only checks for exact packaged bytes served WITHOUT --acceptance.
import { request } from 'node:http';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { brotliDecompressSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };
const packageRoot = resolve(here, arg('--package') ?? 'package');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const checks = [];
function check(mall, name, passed, details = {}) {
  checks.push({ mall, name, passed: Boolean(passed), ...details });
  if (!passed) throw new Error(`${mall}: ${name}`);
}
function get(port, path, headers = {}) {
  return new Promise((resolveResponse, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method: 'GET', headers }, res => {
      const chunks = []; res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolveResponse({ status: res.statusCode, headers: res.headers, bytes: Buffer.concat(chunks) }));
    });
    req.setTimeout(15000, () => req.destroy(new Error(`Timeout: ${port}${path}`)));
    req.on('error', reject); req.end();
  });
}
async function htmlFiles(dir, prefix = '') {
  const result = [];
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await htmlFiles(resolve(dir, entry.name), name + '/'));
    else if (name.endsWith('.html')) result.push(name);
  }
  return result;
}
const routeOf = path => '/' + path.replace(/\/index\.html$/, '').replace(/\.html$/, '');
async function exactHtml(mall, dir, port, file) {
  const path = routeOf(file), expected = await readFile(resolve(dir, file)), response = await get(port, path);
  check(mall, `${path} exact public HTML`, response.status === 200 && response.bytes.equals(expected) && /text\/html/.test(response.headers['content-type'] ?? ''), { path, status: response.status, bytes: response.bytes.length, sha256: sha(response.bytes), diskSha256: sha(expected) });
  check(mall, `${path} no acceptance injection`, !response.bytes.includes(Buffer.from('/__acceptance/')) && !response.bytes.includes(Buffer.from('browser-platform-fixtures.js')));
}
let error;
try {
  const complete = JSON.parse(await readFile(resolve(packageRoot, 'COMPLETE.json'), 'utf8'));
  const provenanceBytes = await readFile(resolve(packageRoot, 'provenance.json'));
  check('both', 'completed package provenance', sha(provenanceBytes) === complete.provenanceSha256);
  for (const [mall, port] of [['saigon-centre', Number(arg('--saigon-port') ?? 4441)], ['vincom-dong-khoi', Number(arg('--vincom-port') ?? 4442)]]) {
    const dir = resolve(packageRoot, mall), files = await htmlFiles(dir);
    const root = await get(port, '/');
    check(mall, 'root redirects to Vietnamese', root.status === 302 && root.headers.location === '/vi', { status: root.status, location: root.headers.location });
    for (const locale of ['en', 'vi']) {
      await exactHtml(mall, dir, port, `${locale}/index.html`);
      for (const part of locale === 'en' ? ['floors', 'stores'] : ['tang', 'cua-hang']) {
        const file = files.find(file => file.startsWith(`${locale}/${part}/`));
        check(mall, `${locale} ${part} deep link exists`, Boolean(file), { file });
        await exactHtml(mall, dir, port, file);
      }
      const path = `/${locale}/__raw_preview_unknown_20261020`, response = await get(port, path);
      const expected = await readFile(resolve(dir, locale, '404.html'));
      check(mall, `${locale} truthful exact 404`, response.status === 404 && response.bytes.equals(expected), { path, status: response.status, sha256: sha(response.bytes), diskSha256: sha(expected) });
    }
    const blocked = await get(port, '/__acceptance/browser-platform-fixtures.js');
    check(mall, 'acceptance endpoint unavailable', blocked.status === 404, { status: blocked.status });
    for (const file of ['models/exterior.glb', 'data/floor-geometry.json']) {
      const identityDisk = await readFile(resolve(dir, file)), compressedDisk = await readFile(resolve(dir, file + '.br'));
      const identity = await get(port, `/${file}?identity=1`, { 'Accept-Encoding': 'identity' });
      check(mall, `${file} exact identity`, identity.status === 200 && !identity.headers['content-encoding'] && identity.bytes.equals(identityDisk), { status: identity.status, bytes: identity.bytes.length, sha256: sha(identity.bytes), diskSha256: sha(identityDisk) });
      const br = await get(port, `/${file}`, { 'Accept-Encoding': 'br' });
      check(mall, `${file} negotiated exact Brotli`, br.status === 200 && br.headers['content-encoding'] === 'br' && br.bytes.equals(compressedDisk) && brotliDecompressSync(br.bytes).equals(identityDisk) && /accept-encoding/i.test(br.headers.vary ?? ''), { status: br.status, encoding: br.headers['content-encoding'], vary: br.headers.vary, bytes: br.bytes.length, sha256: sha(br.bytes), diskSha256: sha(compressedDisk), decodedSha256: sha(brotliDecompressSync(br.bytes)) });
      const explicit = await get(port, `/${file}.br`);
      check(mall, `${file} explicit exact Brotli`, explicit.status === 200 && explicit.headers['content-encoding'] === 'br' && explicit.bytes.equals(compressedDisk), { status: explicit.status, encoding: explicit.headers['content-encoding'] });
      const conditional = await get(port, `/${file}`, { 'Accept-Encoding': 'br', 'If-None-Match': br.headers.etag });
      check(mall, `${file} Brotli validator 304`, conditional.status === 304 && conditional.bytes.length === 0, { status: conditional.status });
    }
  }
} catch (failure) { error = failure.message; }
const receipt = { schemaVersion: 1, checkedAt: new Date().toISOString(), packageRoot, serverMode: 'raw public static; no --acceptance', passed: !error, checks: checks.length, passedChecks: checks.filter(c => c.passed).length, results: checks, ...(error ? { error } : {}), limitations: 'Local HTTP/disk equality and static response checks only; no production, native visibility, performance budget or owner acceptance.' };
await writeFile(resolve(here, arg('--receipt') ?? 'raw-preview-checks.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ passed: receipt.passed, checks: receipt.checks, passedChecks: receipt.passedChecks, ...(error ? { error } : {}) }));
if (error) process.exitCode = 1;
