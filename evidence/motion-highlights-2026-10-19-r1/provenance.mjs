import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const out = 'evidence/motion-highlights-2026-10-19-r1';
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();
const original = JSON.parse(readFileSync('evidence/approved-content-integration-2026-10-18-browser/provenance.json'));
const receipt = { at: new Date().toISOString(), sourceRevision: git('.', 'rev-parse', 'HEAD'), branch: git('.', 'branch', '--show-current'), sourceChanges: [], assetsRevised: false, publication: false, sourceChecks: [], outputChecks: [], sites: [], urls: [], failed: [] };
for (const [path, expected] of Object.entries(original.sources)) {
  const actual = hash(path); receipt.sourceChecks.push({ path, expected, actual, pass: actual === expected });
  if (actual !== expected) receipt.failed.push(`Source drift: ${path}`);
}
for (const output of original.outputs) {
  let checked = 0;
  for (const [path, expected] of Object.entries(output.files)) { checked++; if (hash(`${output.directory}/${path}`) !== expected) receipt.failed.push(`Output drift: ${output.directory}/${path}`); }
  receipt.outputChecks.push({ mall: output.mall, mode: output.mode, checked });
}
for (const [path, branch] of [['D:/Midterm/.scratch/mall-branch-bootstrap', 'vincom-dong-khoi'], ['D:/Midterm/.scratch/issue-0005-takashimaya', 'takashimaya']]) {
  const row = { branch, head: git(path, 'rev-parse', 'HEAD'), matches: [] };
  for (const file of ['src/components/Explorer.tsx', 'src/styles/journey.css', 'src/components/OverviewStack.tsx', 'src/data/content.ts', 'data/malls/saigon-centre/directory.json', 'data/malls/vincom-dong-khoi/directory.json']) {
    const actual = hash(file), site = hash(`${path}/visitor-app/${file}`); row.matches.push({ file, actual, site, pass: actual === site });
    if (actual !== site) receipt.failed.push(`Site drift: ${branch}/${file}`);
  }
  receipt.sites.push(row);
}
for (const [mall, port] of [['saigon-centre', 4363], ['vincom-dong-khoi', 4364]]) for (const locale of ['en', 'vi']) {
  const url = `http://localhost:${port}/${locale}`, response = await fetch(url), bytes = Buffer.from(await response.arrayBuffer());
  const actual = createHash('sha256').update(bytes).digest('hex'), expected = hash(`dist/${mall}/${locale}/index.html`);
  receipt.urls.push({ url, status: response.status, actual, expected, pass: response.status === 200 && actual === expected });
  if (response.status !== 200 || actual !== expected) receipt.failed.push(`Served HTML differs: ${url}`);
}
writeFileSync(`${out}/source-propagation.json`, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ sources: receipt.sourceChecks.length, outputs: receipt.outputChecks, sites: receipt.sites.map(s => ({ branch: s.branch, head: s.head })), failed: receipt.failed }));
if (receipt.failed.length) process.exitCode = 1;
