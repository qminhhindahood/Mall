import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const rows=[];
for(const mode of ['research','public','fixture'])for(const mall of ['saigon','vincom']){
 const env={...process.env};if(mode==='public')delete env.INCLUDE_TEST_FIXTURES;else env.INCLUDE_TEST_FIXTURES=mode==='fixture'?'1':'research';
 const start=new Date().toISOString();const result=spawnSync('C:/node.exe',['C:/node_modules/npm/bin/npm-cli.js',`run`,`build:${mall}`],{env,encoding:'utf8',timeout:180000});
 writeFileSync(`evidence/map-focus-2026-10-18-r8/build-${mode}-${mall}.log`,(result.stdout??'')+(result.stderr??''));
 const row={mode,mall,start,end:new Date().toISOString(),exitCode:result.status,error:result.error?.message};rows.push(row);writeFileSync('evidence/map-focus-2026-10-18-r8/builds.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(row));if(result.status!==0){process.exitCode=1;break;}
}
