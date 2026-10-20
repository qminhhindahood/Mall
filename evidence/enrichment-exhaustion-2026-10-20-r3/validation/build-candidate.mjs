import {spawnSync} from 'node:child_process';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation',rows=[];
if(existsSync(`${out}/builds.json`))throw Error('Build attempt already recorded; no automatic repeat');
const ready=JSON.parse(readFileSync(`${out}/source-ready.json`));
const snapshot=JSON.parse(readFileSync(ready.packageInputs.path));
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const file of snapshot.files)if(hash(readFileSync(file.path))!==file.sha256)throw Error(`Frozen input changed: ${file.path}`);
const manifests=['saigon-centre','vincom-dong-khoi'].map(mall=>({mall,path:`data/malls/${mall}/asset-manifest.json`,bytes:readFileSync(`data/malls/${mall}/asset-manifest.json`)}));
for(const row of manifests)writeFileSync(`${out}/baseline-${row.mall}-asset-manifest.json`,row.bytes);
try{
 buildLoop:for(const mode of ['fixture','public'])for(const mall of ['saigon','vincom']){
  const env={...process.env};delete env.INCLUDE_TEST_FIXTURES;delete env.PUBLIC_DISCOVERY_REVIEW;if(mode==='fixture')env.INCLUDE_TEST_FIXTURES='1';
  const start=new Date().toISOString();
  const r=spawnSync('C:/node.exe',['C:/node_modules/npm/bin/npm-cli.js','run',`build:${mall}`],{env,encoding:'utf8',timeout:240000,windowsHide:true});
  writeFileSync(`${out}/build-${mode}-${mall}.log`,(r.stdout??'')+(r.stderr??''));
  const row={mode,mall,start,end:new Date().toISOString(),exitCode:r.status,error:r.error?.message};rows.push(row);
  writeFileSync(`${out}/builds.json`,JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(row));
  if(r.status!==0){process.exitCode=1;break buildLoop;}
 }
}finally{for(const row of manifests){try{writeFileSync(`${out}/generated-${row.mall}-asset-manifest.json`,readFileSync(row.path));}finally{writeFileSync(row.path,row.bytes);}}}
for(const file of snapshot.files)if(hash(readFileSync(file.path))!==file.sha256)throw Error(`Frozen input changed after build: ${file.path}`);
