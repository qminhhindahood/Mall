import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation',phase=process.argv[2]??'before';
if(!['before','after'].includes(phase))throw Error('Unsupported verification phase');
const hash=b=>createHash('sha256').update(b).digest('hex');
writeFileSync(`${out}/empty-git-ignore`,'');
const git=(root,args)=>{const r=spawnSync('git',['-c',`safe.directory=${root}`,'-c',`core.excludesFile=${resolve(out,'empty-git-ignore')}`,'-C',root,...args]);if(r.status!==0)throw Error(r.stderr.toString());return r.stdout;};
const roots=[['application','D:/Midterm/implementation/mall-visitor'],['vincom-dong-khoi','D:/Midterm/.scratch/mall-branch-bootstrap'],['takashimaya','D:/Midterm/.scratch/issue-0005-takashimaya']];
const rows=roots.map(([name,root])=>{
 const files=git(root,['ls-files','-z','--','src','data','astro.config.mjs','visitor-app/src','visitor-app/data','visitor-app/astro.config.mjs']).toString().split('\0').filter(Boolean).sort().map(path=>({path,sha256:hash(readFileSync(`${root}/${path}`))}));
 return {name,root,branch:git(root,['branch','--show-current']).toString().trim(),head:git(root,['rev-parse','HEAD']).toString().trim(),status:git(root,['status','--porcelain=v1','--untracked-files=no']).toString(),runtimeFileCount:files.length,runtimeManifestSha256:hash(Buffer.from(JSON.stringify(files))),files};
});
const receipt={at:new Date().toISOString(),phase,rows};
if(phase==='after'){
 const previous=JSON.parse(readFileSync(`${out}/canonical-before.json`));
 receipt.comparisons=rows.map(row=>{const old=previous.rows.find(r=>r.name===row.name);return {name:row.name,headUnchanged:row.head===old.head,runtimeFilesUnchanged:row.runtimeManifestSha256===old.runtimeManifestSha256,statusUnchanged:row.status===old.status};});
 receipt.pass=receipt.comparisons.every(r=>r.headUnchanged&&r.runtimeFilesUnchanged&&r.statusUnchanged);
}else if(existsSync(`${out}/canonical-before.json`))throw Error('Canonical baseline already recorded; refusing to overwrite');
writeFileSync(`${out}/canonical-${phase}.json`,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({phase,rows:rows.map(({files,...r})=>r),comparisons:receipt.comparisons,pass:receipt.pass}));
if(receipt.pass===false)process.exitCode=1;
