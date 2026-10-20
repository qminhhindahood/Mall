import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const out='evidence/continuation-2026-10-19-r2/validation',root='D:/Midterm/.scratch/combined-discovery-motion-2026-10-19';
const revision=process.env.SOURCE_CHECKPOINT;if(!revision)throw Error('Set SOURCE_CHECKPOINT to the frozen continuation commit');
const hash=b=>createHash('sha256').update(b).digest('hex');
const normalized=b=>hash(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
const git=args=>{const r=spawnSync('git',['-c',`safe.directory=${root}`,...args],{maxBuffer:32*1024*1024});if(r.status!==0)throw Error(`${args.join(' ')}: ${r.error?.message??r.stderr.toString()}`);return r.stdout;};
const names=git(['ls-files','-z','--','src','scripts','data/malls','astro.config.mjs','package.json','package-lock.json','tsconfig.json']).toString().split('\0').filter(Boolean).sort();
const source=names.map(path=>{const current=readFileSync(path),committed=git(['show',`${revision}:${path}`]);return {path,sha256:hash(current),checkpointSha256:hash(committed),normalizedSha256:normalized(current),normalizedCheckpointSha256:normalized(committed),pass:normalized(current)===normalized(committed)};});
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const outputs=[];
for(const mall of ['saigon-centre','vincom-dong-khoi'])for(const mode of ['public','fixture']){
 const dir=mode==='public'?`dist/${mall}`:`dist/fixtures/${mall}`;
 const files=walk(dir).sort().map(path=>{const b=readFileSync(path);return {path:path.slice(dir.length+1),bytes:b.length,sha256:hash(b)};});
 outputs.push({mall,mode,directory:dir,fileCount:files.length,manifestSha256:hash(Buffer.from(JSON.stringify(files))),files});
}
const manifests=['saigon-centre','vincom-dong-khoi'].map(mall=>{const current=readFileSync(`data/malls/${mall}/asset-manifest.json`),baseline=readFileSync(`${out}/baseline-${mall}-asset-manifest.json`);return {mall,sha256:hash(current),baselineSha256:hash(baseline),assetRevision:JSON.parse(current).assetRevision,pass:hash(current)===hash(baseline)};});
const accepted=readFileSync('src/data/enrichment-accepted.json'),records=JSON.parse(accepted).records;
const receipt={at:new Date().toISOString(),sourceCheckpoint:revision,source,outputs,assetManifests:manifests,enrichment:{sha256:hash(accepted),records:records.length,fields:records.reduce((n,r)=>n+r.fields.length,0)}};
writeFileSync(`${out}/provenance.json`,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({sourceCheckpoint:revision,sourceFiles:source.length,sourceFailures:source.filter(r=>!r.pass).map(r=>r.path),outputs:outputs.map(({files,...r})=>r),assetManifests:manifests,enrichment:receipt.enrichment}));
if(source.some(r=>!r.pass)||manifests.some(r=>!r.pass))process.exitCode=1;
