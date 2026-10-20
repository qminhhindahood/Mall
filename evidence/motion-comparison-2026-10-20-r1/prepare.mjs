import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const out='evidence/motion-comparison-2026-10-20-r1',old='D:/Midterm/.scratch/mall-motion-refinement-2026-10-19';
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=b=>createHash('sha256').update(b).digest('hex');
const prior=read(`${old}/evidence/mall-motion-refinement-2026-10-19-r1/provenance.json`),pkg='evidence/enrichment-exhaustion-2026-10-20-r3/release/package';
const rows=[];
for(const mall of ['saigon-centre','vincom-dong-khoi']){
 const before=prior.outputs[mall].baseline;
 for(const f of before){const b=readFileSync(`${old}/dist/baseline/${mall}/${f.path}`);if(hash(b)!==f.sha256)throw Error(`Baseline drift:${mall}/${f.path}`);}
 const after=read(`${pkg}/${mall}.files.json`);const files=Array.isArray(after)?after:after.files;
 for(const f of files){const b=readFileSync(`${pkg}/${mall}/${f.path}`);if(hash(b)!==f.sha256)throw Error(`Final package drift:${mall}/${f.path}`);}
 rows.push({mall,baselineFiles:before.length,finalFiles:files.length,baselineManifestHash:hash(Buffer.from(JSON.stringify(before))),finalManifestHash:hash(readFileSync(`${pkg}/${mall}.files.json`)),baselineDirectory:`${old}/dist/baseline/${mall}`,finalDirectory:`${pkg}/${mall}`});
}
const git=(...a)=>{const r=spawnSync('git',a,{encoding:'utf8'});if(r.status)throw Error(r.stderr);return r.stdout.trim();};
if(git('rev-parse','HEAD')!=='8a21e160012926d9e9e950600a042078d6e47352')throw Error('Unexpected source checkpoint');
for(const f of ['src/runtime/create-scene-runtime.ts','src/runtime/mall-motion.ts','src/components/JourneyMotion.tsx'])if(git('rev-parse',`71e5def:${f}`)!==git('rev-parse',`HEAD:${f}`))throw Error(`Runtime changed:${f}`);
writeFileSync(`${out}/provenance.json`,JSON.stringify({at:new Date().toISOString(),baselineSource:prior.base,baselineSourceFull:'19a9e34e7bec399f165ab704bcb0af803fab486e',finalSource:'71e5def12a781513efd115045ba4f2f3a4cbaa3c',evidenceSource:git('rev-parse','HEAD'),priorReceipt:`${old}/evidence/mall-motion-refinement-2026-10-19-r1/provenance.json`,priorReceiptSha256:hash(readFileSync(`${old}/evidence/mall-motion-refinement-2026-10-19-r1/provenance.json`)),rows,methods:'Every baseline file matched the frozen pre-refinement manifest, every final file matched the r3 package manifest; source module Git objects match the tested71e5def checkpoint. No rebuild or app source edit.'},null,2)+'\n');
console.log(JSON.stringify(rows));
