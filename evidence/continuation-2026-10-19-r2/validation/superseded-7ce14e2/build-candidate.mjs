import {spawnSync} from 'node:child_process';
import {writeFileSync,readFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
const out='evidence/continuation-2026-10-19-r2/validation',rows=[];
if(existsSync(`${out}/builds.json`)){
 const archived=`${out}/previous-build-${new Date().toISOString().replace(/[:.]/g,'-')}`;mkdirSync(archived);
 for(const name of ['builds.json','build-fixture-saigon.log','build-fixture-vincom.log','build-public-saigon.log','build-public-vincom.log'])if(existsSync(`${out}/${name}`))copyFileSync(`${out}/${name}`,`${archived}/${name}`);
}
const manifests=['saigon-centre','vincom-dong-khoi'].map(mall=>({mall,path:`data/malls/${mall}/asset-manifest.json`,bytes:readFileSync(`data/malls/${mall}/asset-manifest.json`)}));
for(const row of manifests)writeFileSync(`${out}/baseline-${row.mall}-asset-manifest.json`,row.bytes);
try{
for(const mode of ['fixture','public']) for(const mall of ['saigon','vincom']) {
  const env={...process.env};delete env.INCLUDE_TEST_FIXTURES;delete env.PUBLIC_DISCOVERY_REVIEW;
  if(mode==='fixture')env.INCLUDE_TEST_FIXTURES='1';
  const start=new Date().toISOString();
  const r=spawnSync('C:/node.exe',['C:/node_modules/npm/bin/npm-cli.js','run',`build:${mall}`],{env,encoding:'utf8',timeout:240000});
  writeFileSync(`${out}/build-${mode}-${mall}.log`,(r.stdout??'')+(r.stderr??''));
  const row={mode,mall,start,end:new Date().toISOString(),exitCode:r.status,error:r.error?.message};rows.push(row);
  writeFileSync(`${out}/builds.json`,JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(row));
  if(r.status!==0){process.exitCode=1;break;}
}
}finally{
 for(const row of manifests){writeFileSync(`${out}/generated-${row.mall}-asset-manifest.json`,readFileSync(row.path));writeFileSync(row.path,row.bytes);}
}

