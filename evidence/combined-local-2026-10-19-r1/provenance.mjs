import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const out='evidence/combined-local-2026-10-19-r1',root='D:/Midterm/.scratch/combined-discovery-motion-2026-10-19',revision=process.env.SOURCE_CHECKPOINT??'b114498';
const hash=b=>createHash('sha256').update(b).digest('hex');
const git=args=>{const r=spawnSync('git',['-c',`safe.directory=${root}`,...args]);if(r.status!==0)throw Error(r.stderr.toString());return r.stdout;};
const names=git(['show','--pretty=format:','--name-only','b114498']).toString().trim().split(/\r?\n/).filter(Boolean);
const source=names.map(path=>{const actualBytes=readFileSync(path),checkpointBytes=git(['show',`${revision}:${path}`]),actual=hash(actualBytes),checkpoint=hash(checkpointBytes);const normalized=b=>hash(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));const normalizedActual=normalized(actualBytes),normalizedCheckpoint=normalized(checkpointBytes);return {path,sha256:actual,checkpointSha256:checkpoint,normalizedSha256:normalizedActual,normalizedCheckpointSha256:normalizedCheckpoint,lineEndingsOnly:actual!==checkpoint&&normalizedActual===normalizedCheckpoint,pass:normalizedActual===normalizedCheckpoint};});
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const outputs=[];
for(const mall of ['saigon-centre','vincom-dong-khoi'])for(const mode of ['public','fixture']){
 const dir=mode==='public'?`dist/${mall}`:`dist/fixtures/${mall}`;
 const files=walk(dir).sort().map(path=>{const bytes=readFileSync(path);return {path:path.slice(dir.length+1),bytes:bytes.length,sha256:hash(bytes)};});
 outputs.push({mall,mode,directory:dir,fileCount:files.length,manifestSha256:hash(Buffer.from(JSON.stringify(files))),files});
}
const manifests=['saigon-centre','vincom-dong-khoi'].map(mall=>({mall,sha256:hash(readFileSync(`data/malls/${mall}/asset-manifest.json`)),assetRevision:JSON.parse(readFileSync(`data/malls/${mall}/asset-manifest.json`)).assetRevision}));
const receipt={at:new Date().toISOString(),sourceCheckpoint:revision,source,outputs,assetManifests:manifests};
writeFileSync(`${out}/provenance.json`,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({sourceCheckpoint:revision,sourceFiles:source.length,sourceFailures:source.filter(r=>!r.pass),outputs:outputs.map(({files,...r})=>r),assetManifests:manifests}));
if(source.some(r=>!r.pass))process.exitCode=1;

