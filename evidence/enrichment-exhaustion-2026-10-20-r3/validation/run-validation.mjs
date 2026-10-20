import {spawn} from 'node:child_process';
import {createWriteStream,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation';
const suites=[['accepted-cuisine','check-accepted-cuisine.mjs'],['cuisine-website','check-cuisine-website.mjs'],['guidance','check-indoor-guidance.mjs'],['discovery','check-discovery.mjs'],['map-pointer','check-interaction.mjs'],['fixtures','check-fixtures.mjs'],['detail-parity','check-detail-parity.mjs'],['search-review','check-review.mjs'],['entry-controls','check-entry-controls.mjs'],['area-history','check-area-history.mjs'],['fallback','check-fallback.mjs'],['journey','check-journey.mjs'],['rapid-reversals','check-reversals.mjs']];
if(existsSync(`${out}/suite-execution.json`)){
 const archive=`${out}/previous-run-${new Date().toISOString().replace(/[:.]/g,'-')}`;mkdirSync(archive);
 copyFileSync(`${out}/suite-execution.json`,`${archive}/suite-execution.json`);
 for(const [name]of suites)if(existsSync(`${out}/${name}.log`))copyFileSync(`${out}/${name}.log`,`${archive}/${name}.log`);
 throw Error(`Prior execution archived at ${archive}; choose targeted retries explicitly rather than silently rerunning all suites`);
}
let next=0;const rows=[];
const persist=()=>writeFileSync(`${out}/suite-execution.json`,JSON.stringify({at:new Date().toISOString(),pid:process.pid,concurrency:2,rows},null,2)+'\n');
const env={...process.env};for(const name of ['CHECK_LOCALE','CHECK_MALL','GUIDANCE_TYPE','ONLY'])delete env[name];
async function worker(lane){
 while(next<suites.length&&!existsSync(`${out}/cancel-queue`)){
  const [name,script]=suites[next++],row={name,script,lane,start:new Date().toISOString(),status:'running'};rows.push(row);persist();
  const log=createWriteStream(`${out}/${name}.log`);
  await new Promise(resolve=>{
   const child=spawn('C:/node.exe',[`${out}/${script}`],{env,windowsHide:true});row.pid=child.pid;persist();child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});
   child.on('error',error=>{row.error=error.message;});
   child.on('close',(code,signal)=>{row.exitCode=code;row.signal=signal;row.status=code===0?'passed':'failed';row.end=new Date().toISOString();log.end();persist();console.log(JSON.stringify(row));resolve();});
  });
 }
}
await Promise.all([worker(1),worker(2)]);
if(rows.some(r=>r.status!=='passed'))process.exitCode=1;
