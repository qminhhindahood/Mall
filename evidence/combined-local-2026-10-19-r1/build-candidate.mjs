import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const out='evidence/combined-local-2026-10-19-r1',rows=[];
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
