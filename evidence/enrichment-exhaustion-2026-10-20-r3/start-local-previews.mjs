// Local Node launcher for hosts whose PowerShell policy disallows .ps1 files.
// Does not change execution policy or stop existing listeners.
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {existsSync,openSync,closeSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const packet=dirname(fileURLToPath(import.meta.url)),root=resolve(packet,'../..');
const mode=process.argv[2];
if(!['acceptance','raw'].includes(mode))throw Error('Specify acceptance or raw');
const raw=mode==='raw',out=resolve(packet,raw?'release':'validation');
const receipt=resolve(out,raw?'raw-preview-startup.json':'server-processes.json');
if(existsSync(receipt))throw Error('Startup already recorded; inspect existing process state first');
if(raw&&!existsSync(resolve(out,'package/COMPLETE.json')))throw Error('Completed package required');
const targets=raw?
 [['saigon-centre',4441,'evidence/enrichment-exhaustion-2026-10-20-r3/release/package/saigon-centre'],['vincom-dong-khoi',4442,'evidence/enrichment-exhaustion-2026-10-20-r3/release/package/vincom-dong-khoi']]:
 [['saigon-centre',4431,'dist/saigon-centre'],['vincom-dong-khoi',4432,'dist/vincom-dong-khoi'],['saigon-centre',4433,'dist/fixtures/saigon-centre'],['vincom-dong-khoi',4434,'dist/fixtures/vincom-dong-khoi']];
for(const [,port]of targets)await new Promise((ok,no)=>{const server=createServer();server.once('error',no);server.listen(port,'127.0.0.1',()=>server.close(ok));});
const rows=[];
for(const [mall,port,directory]of targets){
 const logs=[openSync(resolve(out,`server-${port}.log`),'wx'),openSync(resolve(out,`server-${port}-error.log`),'wx')];
 const child=spawn(process.execPath,['scripts/serve-static.mjs','--mall',mall,'--port',String(port),'--dir',directory,...(raw?[]:['--acceptance'])],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',...logs]});
 await new Promise((ok,no)=>{child.once('spawn',ok);child.once('error',no);});
 child.unref();logs.forEach(closeSync);
 rows.push({mall,port,directory,acceptance:!raw,pid:child.pid,startedAt:new Date().toISOString()});
 writeFileSync(receipt,JSON.stringify(rows,null,2)+'\n');
}
console.log(JSON.stringify(rows));
