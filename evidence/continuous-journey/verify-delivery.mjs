// Revision-specific artifact receipts; no private runtime tests.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (path, ...args) => execFileSync('git', ['-C', path, ...args], {encoding:'utf8'}).trim();
const receipt = JSON.parse(await readFile(resolve(root,'evidence/continuous-journey/branch-propagation.json')));
const result = {recordedAt:new Date().toISOString(), sharedHead:git(root,'rev-parse','HEAD'), testedSource:'13a2083', deliveries:[], matrices:[]};
for (const delivery of receipt.deliveries) {
  const site = resolve(delivery.path,'..');
  const mismatches = [];
  for (const file of delivery.copiedFiles) {
    const shared = hash(await readFile(resolve(root,file.path)));
    const copied = hash(await readFile(resolve(delivery.path,file.path)));
    if (shared !== file.sha256 || copied !== file.sha256) mismatches.push(file.path);
  }
  const paths = git(site,'diff','--name-only',`${delivery.commit}^`,'HEAD').split('\n').filter(Boolean);
  const outsideApp = paths.filter(p=>!p.startsWith('visitor-app/'));
  result.deliveries.push({branch:delivery.branch,head:git(site,'rev-parse','HEAD'),implementationCommit:delivery.commit,verifiedFiles:delivery.copiedFiles.length,mismatches,outsideAppChangedSinceDeliveryParent:outsideApp});
}
for (const name of ['browser-results','fallback-results','fixture-results']) {
  const data = JSON.parse(await readFile(resolve(root,`evidence/continuous-journey/${name}.json`)));
  result.matrices.push({name,cases:data.runs.length,checks:data.runs.reduce((sum,r)=>sum+(r.checks?.length??0),0),failures:data.runs.flatMap(r=>r.failed??[])});
}
result.applicationChangesAfterTestedSource = git(root,'diff','--name-only','13a2083','HEAD','--','src','data','assets','scripts','tests','package.json','package-lock.json');
const gallery = await readFile(resolve(root,'evidence/continuous-journey/gallery.html'),'utf8');
const links = [...new Set([...gallery.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]).filter(path=>!path.startsWith('#')&&!path.includes('://')))];
const missingLinks = [];
for (const link of links) {
  try { await readFile(resolve(root,'evidence/continuous-journey',link)); }
  catch { missingLinks.push(link); }
}
result.gallery = {localLinks:links.length,recordings:links.filter(path=>path.endsWith('.webm')).length,missingLinks};
result.pass = result.deliveries.every(d=>!d.mismatches.length&&!d.outsideAppChangedSinceDeliveryParent.length)&&result.matrices.every(m=>!m.failures.length)&&!result.applicationChangesAfterTestedSource;
result.pass &&= !missingLinks.length;
await writeFile(resolve(root,'evidence/continuous-journey/delivery-reverification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if (!result.pass) process.exitCode=1;
