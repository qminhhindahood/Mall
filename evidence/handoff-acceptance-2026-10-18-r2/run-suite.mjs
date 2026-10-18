import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const root=process.cwd().replaceAll('\\','/');
const destination=`${root}/evidence/handoff-acceptance-2026-10-18-r2`;
await mkdir(`${destination}/suite/frames`,{recursive:true});
const receipt=[];
for(const name of ['final-matrix-script.mjs','final-fallback-script.mjs','final-fixture-script.mjs','edge.mjs']){
 let script=await readFile(`evidence/animation-stability-2026-10-17/${name}`,'utf8');
 script=script.replaceAll('D:/Midterm/.scratch/animation-stability-2026-10-17/evidence/animation-stability-2026-10-17/suite',`${destination}/suite`).replaceAll('D:/Midterm/.scratch/animation-stability-2026-10-17/browser-checks/journey.js',`${destination}/journey.js`).replaceAll('animation-stability-2026-10-17-r1','handoff-acceptance-2026-10-18-r2-r1');
 await writeFile(`${destination}/${name}`,script);
 const start=new Date().toISOString();
 const run=spawnSync(process.execPath,[`${destination}/${name}`],{encoding:'utf8',timeout:600000});
 await writeFile(`${destination}/${name}.log`,(run.stdout??'')+(run.stderr??''));
 receipt.push({name,start,end:new Date().toISOString(),exitCode:run.status,error:run.error?.message});
 await writeFile(`${destination}/execution.json`,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt.at(-1)));
}
if(receipt.some(r=>r.exitCode!==0))process.exitCode=1;
