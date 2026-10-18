import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const digest=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const receipt={at:new Date().toISOString(),branch:git('branch','--show-current'),entryHead:'1ee2c29785d4f3600d7ce95013e2121156e90be2',headAtCapture:git('rev-parse','HEAD'),latestApplicationSourceCommit:git('log','-1','--format=%H','--','src'),pendingTrackedChanges:git('diff','HEAD','--name-only'),publicBuilds:[],harnessInputs:[]};
for(const mall of ['saigon-centre','vincom-dong-khoi']){
 const manifest=JSON.parse(await readFile(`dist/${mall}/data/asset-manifest.json`,'utf8'));
 receipt.publicBuilds.push({mall,htmlSha256:await digest(`dist/${mall}/en/index.html`).catch(()=>digest(`dist/${mall}/en.html`)),manifest});
}
for(const name of ['final-matrix-script.mjs','final-fallback-script.mjs','final-fixture-current.mjs','edge.mjs','journey-current.js','targeted.mjs']){const path=`evidence/handoff-acceptance-2026-10-18-r2/${name}`;receipt.harnessInputs.push({path,sha256:await digest(path)});}
receipt.harnessInputs.push({path:'tests/browser-discovery-checks.js',sha256:await digest('tests/browser-discovery-checks.js')});
receipt.sourceFileHashes={};
const sourcePaths=git('ls-files','src','scripts','tsconfig.json','data/malls').split('\n');
for(const path of [...sourcePaths,'scripts/research-overlay.mjs','docs/content-preparation/integration-candidate-2026-10-18-r2/manifest.json','docs/content-preparation/integration-candidate-2026-10-18-r2/owner-decisions.json']) receipt.sourceFileHashes[path]=await digest(path);
receipt.pendingSourceDiffSha256=createHash('sha256').update(git('diff','HEAD','--','src','scripts','tsconfig.json')).digest('hex');
receipt.builtBundleHashes={};
for(const mode of ['','fixtures/','research/'])for(const mall of ['saigon-centre','vincom-dong-khoi']){
 const folder=`dist/${mode}${mall}/_astro`;
 for(const file of await readdir(folder))if(/\.(?:js|css)$/.test(file))receipt.builtBundleHashes[`${folder}/${file}`]=await digest(`${folder}/${file}`);
}
await writeFile('evidence/handoff-acceptance-2026-10-18-r2/provenance.json',JSON.stringify(receipt,null,2)+'\n');
