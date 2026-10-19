// Local-only packaging: no network, subprocess deployment, or output rewriting.
import { readFile, writeFile, readdir, lstat, mkdir, copyFile } from 'node:fs/promises';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const malls = ['saigon-centre', 'vincom-dong-khoi'];
const base = 'evidence/continuation-2026-10-19-r2/release';
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };
const mode = process.argv.includes('--record-inputs') ? 'record' : process.argv.includes('--inspect') ? 'inspect' : 'package';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const inside = value => { const path = resolve(root, value); if (path === root || !path.startsWith(root + sep)) throw new Error('Path must be below checkout root'); return path; };
const snapshotPath = inside(arg('--snapshot') ?? `${base}/build-inputs.json`);
const out = inside(arg('--out') ?? `${base}/package`);
if (process.env.INCLUDE_TEST_FIXTURES) throw new Error('Unset INCLUDE_TEST_FIXTURES for all release operations');
if (process.env.PUBLIC_DISCOVERY_REVIEW) throw new Error('Unset PUBLIC_DISCOVERY_REVIEW for all release operations');
const envFiles = (await readdir(root)).filter(name => /^\.env(?:\.|$)/i.test(name));
if (envFiles.length) throw new Error(`Release operations require no Astro env files; resolve/remove these explicitly before recording or building: ${envFiles.join(', ')}`);

async function walk(path, prefix = '') {
  const result = [];
  for (const entry of (await readdir(path, { withFileTypes: true })).sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    const name = prefix + entry.name, absolute = resolve(path, entry.name);
    const info = await lstat(absolute);
    if (info.isSymbolicLink()) throw new Error(`Symlink rejected: ${absolute}`);
    if (info.isDirectory()) result.push(...await walk(absolute, name + '/'));
    else if (info.isFile()) result.push({ path: name, bytes: info.size, sha256: hash(await readFile(absolute)) });
    else throw new Error(`Non-file rejected: ${absolute}`);
  }
  return result;
}
async function inputs() {
  const result = [];
  // Raw source/config/assets only; generated public/, test fixtures and research
  // are not copied into the package. They are not the release source inputs.
  for (const path of ['src', 'assets', 'data/malls', 'scripts']) {
    for (const item of await walk(resolve(root, path))) result.push({ ...item, path: `${path}/${item.path}` });
  }
  for (const path of ['package.json', 'package-lock.json', 'astro.config.mjs', 'tsconfig.json', 'wrangler.saigon-centre.jsonc', 'wrangler.vincom-dong-khoi.jsonc']) {
    const bytes = await readFile(resolve(root, path)); result.push({ path, bytes: bytes.length, sha256: hash(bytes) });
  }
  // approved-overlay.mjs reads these approval records and their exact wording
  // source while preparing the public geometry. Bind all of them to the build.
  const packet = 'docs/content-preparation/approved-directory-2026-10-18-r1';
  const decisionPath = `${packet}/owner-decision.json`;
  const validationPath = `${packet}/validation.json`;
  const decision = JSON.parse(await readFile(resolve(root, decisionPath), 'utf8'));
  const validation = JSON.parse(await readFile(resolve(root, validationPath), 'utf8'));
  const wordingPath = 'docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json';
  if (decision.source !== wordingPath) throw new Error('Unexpected approved wording dependency path');
  for (const path of [decisionPath, validationPath, wordingPath]) {
    const bytes = await readFile(resolve(root, path));
    if (path === wordingPath && (hash(bytes) !== decision.sourceSha256 || hash(bytes) !== validation.sourceSha256)) throw new Error('Approved wording dependency hash drift');
    result.push({ path, bytes: bytes.length, sha256: hash(bytes) });
  }
  return result.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
const source = await inputs();
const sourceDigest = hash(json(source));
if (mode === 'record') {
  await mkdir(dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, json({ schemaVersion: 1, recordedAt: new Date().toISOString(), sourceDigest, files: source }));
  console.log(json({ recorded: relative(root, snapshotPath), sourceDigest, files: source.length }));
} else {
  const snapshot = mode === 'package' ? JSON.parse(await readFile(snapshotPath, 'utf8')) : null;
  if (snapshot && (snapshot.schemaVersion !== 1 || !Number.isFinite(Date.parse(snapshot.recordedAt)))) throw new Error('Invalid build-input snapshot');
  if (snapshot && snapshot.sourceDigest !== sourceDigest) throw new Error('Source/config/data/assets changed since input snapshot; record again and rebuild both public malls');
  const checked = [];
  for (const mall of malls) {
    const directory = resolve(root, 'dist', mall), files = await walk(directory);
    const manifest = JSON.parse(await readFile(resolve(directory, 'release-manifest.json'), 'utf8'));
    if (manifest.mall !== mall || manifest.fixture !== false || manifest.enrichmentReview !== false || manifest.directoryApproval !== 'approved' || manifest.releaseApproved !== false) throw new Error(`Non-public/unapproved directory output or missing explicit enrichmentReview:false marker: ${mall}`);
    if (files.length > 20000 || files.some(f => f.bytes > 25 * 1024 * 1024)) throw new Error(`Configured static asset limit exceeded: ${mall}`);
    for (const file of files) {
      if (/(^|\/)(?:\.[^/]*|node_modules|tests?|fixtures?|research|__acceptance)(\/|$)|test-store|\.map$|\.(?:pem|key|p12|pfx|env)$/i.test(file.path)) throw new Error(`Forbidden release path: ${mall}/${file.path}`);
      if (!/^(?:_astro|data|fonts|maps|models|previews|en|vi)\//.test(file.path) && !['_headers','_redirects','index.html','404.html','release-manifest.json','robots.txt','sitemap.xml'].includes(file.path)) throw new Error(`Unexpected release root file: ${mall}/${file.path}`);
      if (/\.(?:html|js|json)$/.test(file.path)) {
        const text = await readFile(resolve(directory, file.path), 'utf8');
        if (/\/__acceptance\/|browser-platform-fixtures\.js|__fixture|test-store-(?:shared|multi|missing|long)/.test(text)) throw new Error(`Acceptance/fixture content rejected: ${mall}/${file.path}`);
      }
    }
    for (const required of ['_headers','_redirects','en/index.html','vi/index.html','en/404.html','vi/404.html','data/asset-manifest.json']) if (!files.some(f => f.path === required)) throw new Error(`Missing ${mall}/${required}`);
    const assets = JSON.parse(await readFile(resolve(directory, 'data/asset-manifest.json'), 'utf8'));
    if (assets.mallId !== mall || assets.assetRevision !== 'photo-polish-2026-10-12-delivery-r2') throw new Error(`Asset provenance mismatch: ${mall}`);
    if (snapshot) {
      // Build completion marker and generated HTML must follow the snapshot.
      for (const file of files.filter(f => f.path.endsWith('.html') || f.path === 'release-manifest.json')) if ((await lstat(resolve(directory, file.path))).mtimeMs < Date.parse(snapshot.recordedAt)) throw new Error(`Stale build: ${mall}/${file.path}`);
    }
    checked.push({ mall, directory, files, siteOrigin: manifest.siteOrigin, assetRevision: assets.assetRevision, treeDigest: hash(json(files)) });
  }
  if (mode === 'inspect') console.log(json({ mode, sourceDigest, malls: checked.map(({ directory, files, ...item }) => ({ ...item, files: files.length })), releaseApproved: false }));
  else {
    if (await lstat(out).catch(() => null)) throw new Error('Output already exists; choose a new --out (no overwrite/removal)');
    if (out.startsWith(resolve(root,'dist') + sep) || out.startsWith(resolve(root,'src') + sep)) throw new Error('Unsafe output location');
    await mkdir(out, { recursive: true });
    for (const item of checked) {
      for (const file of item.files) {
        const target = resolve(out, item.mall, file.path); await mkdir(dirname(target), { recursive: true });
        await copyFile(resolve(item.directory, file.path), target);
      }
      if (json(await walk(resolve(out, item.mall))) !== json(item.files)) throw new Error(`Copy verification failed: ${item.mall}`);
      await writeFile(resolve(out, `${item.mall}.files.json`), json(item.files));
      await writeFile(resolve(out, `${item.mall}.sha256`), item.files.map(f => `${f.sha256}  ${f.path}`).join('\n') + '\n');
    }
    // Verify nothing changed during copying, including the source snapshot.
    if (hash(json(await inputs())) !== sourceDigest) throw new Error('Source changed during packaging; discard this incomplete output');
    for (const item of checked) if (json(await walk(item.directory)) !== json(item.files)) throw new Error('Build changed during packaging; discard this incomplete output');
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim();
    const provenance = { schemaVersion: 1, localOnly: true, releaseApproved: false, sourceHead: git(['rev-parse','HEAD']), sourceDigest, inputSnapshot: relative(root,snapshotPath).replaceAll('\\','/'), inputSnapshotSha256: hash(await readFile(snapshotPath)), dirtyPaths: git(['status','--porcelain','--untracked-files=no']).split('\n').filter(Boolean), node: process.version, malls: checked.map(({ directory, files, ...item }) => ({ ...item, files: files.length })), note: 'Package contains raw public static files only. No deployment/account/runtime acceptance is established.' };
    await writeFile(resolve(out,'source-inputs.json'), json(source));
    await writeFile(resolve(out,'provenance.json'), json(provenance));
    await writeFile(resolve(out,'COMPLETE.json'), json({ provenanceSha256: hash(json(provenance)), sourceDigest, malls: checked.map(i => ({ mall: i.mall, treeDigest: i.treeDigest })) }));
    console.log(json({ packaged: relative(root,out), complete: true, ...provenance }));
  }
}
