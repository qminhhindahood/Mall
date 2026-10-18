// Read-only authentication probe. Never persist raw whoami output or identities.
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const dir='evidence/release-plan-2026-10-18';
await mkdir(dir,{recursive:true});
const run=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','whoami','--json'],{encoding:'utf8',timeout:30000,env:{...process.env,WRANGLER_SEND_METRICS:'false',CI:'true'}});
let parsed;try{parsed=JSON.parse(run.stdout);}catch{}
const text=(run.stdout??'')+(run.stderr??'');
const result={at:new Date().toISOString(),wrangler:JSON.parse(await readFile('node_modules/wrangler/package.json')).version,command:'project-local wrangler whoami --json (read-only)',exitCode:run.status,authenticated:run.status===0&&!!parsed,accountCount:Array.isArray(parsed?.accounts)?parsed.accounts.length:null,classification:run.error?.code==='ETIMEDOUT'?'timeout':/not authenticated|not logged|login|log in/i.test(text)&&run.status!==0?'authentication-unavailable':run.status===0?'authenticated':'probe-failed',secretEnvironmentVariableNames:['CLOUDFLARE_API_TOKEN','CLOUDFLARE_API_KEY','CLOUDFLARE_ACCOUNT_ID'].filter(k=>!!process.env[k]),rawOutputStored:false,accountIdentityStored:false,planVerified:false,originApproved:false,remoteWrites:false};
await writeFile(`${dir}/environment.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
