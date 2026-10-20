// Run only after the root confirms the final source freeze. No builds here.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation';
const snapshot='evidence/enrichment-exhaustion-2026-10-20-r3/release/build-inputs.json';
if(!process.env.SOURCE_CHECKPOINT)throw Error('Set SOURCE_CHECKPOINT after final root freeze');
if(existsSync(`${out}/source-ready.json`)||existsSync(snapshot))throw Error('Freeze already recorded; refusing overwrite');
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(r.stderr||r.stdout||r.error?.message);return r.stdout.trim();};
const head=run('git',['rev-parse','HEAD']);
if(run('git',['rev-parse',process.env.SOURCE_CHECKPOINT])!==head)throw Error('Checkpoint must equal HEAD');
if(run('git',['diff','HEAD','--','src','scripts','data/malls','assets','package.json','package-lock.json','astro.config.mjs','tsconfig.json']))throw Error('Commit frozen runtime/build inputs before preparing');
run('C:/node.exe',[`${out}/verify-canonical.mjs`,'before']);
run('C:/node.exe',['scripts/package-local-release.mjs','--record-inputs','--snapshot',snapshot]);
const inputs=JSON.parse(readFileSync(snapshot)),records=JSON.parse(readFileSync('src/data/enrichment-accepted.json')).records;
const receipt={at:new Date().toISOString(),sourceCheckpoint:head,acceptedRecords:records.length,acceptedFields:records.reduce((n,r)=>n+r.fields.length,0),packageInputs:{path:snapshot,files:inputs.files.length,digest:inputs.sourceDigest},ports:[4431,4432,4433,4434]};
writeFileSync(`${out}/source-ready.json`,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
