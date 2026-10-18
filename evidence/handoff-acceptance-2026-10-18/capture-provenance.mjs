import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const digest=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const receipt={at:new Date().toISOString(),branch:git('branch','--show-current'),entryHead:'1ee2c29785d4f3600d7ce95013e2121156e90be2',headAtCapture:git('rev-parse','HEAD'),latestApplicationSourceCommit:git('log','-1','--format=%H','--','src'),pendingTrackedChanges:git('diff','--name-only'),publicBuilds:[],harnessInputs:[]};
for(const mall of ['saigon-centre','vincom-dong-khoi']){
 const manifest=JSON.parse(await readFile(`dist/${mall}/data/asset-manifest.json`,'utf8'));
 receipt.publicBuilds.push({mall,htmlSha256:await digest(`dist/${mall}/en/index.html`).catch(()=>digest(`dist/${mall}/en.html`)),manifest});
}
for(const path of ['evidence/animation-stability-2026-10-17/final-matrix-script.mjs','evidence/animation-stability-2026-10-17/final-fallback-script.mjs','evidence/animation-stability-2026-10-17/final-fixture-script.mjs','evidence/animation-stability-2026-10-17/edge.mjs','evidence/handoff-acceptance-2026-10-18/journey.js'])receipt.harnessInputs.push({path,sha256:await digest(path)});
await writeFile('evidence/handoff-acceptance-2026-10-18/provenance.json',JSON.stringify(receipt,null,2)+'\n');
