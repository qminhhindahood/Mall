import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const out='evidence/continuation-2026-10-19-r2/validation';
const frozen=join(process.env.TEMP,'midterm-delivered-preview-370be91-2026-10-19-r2');
if(existsSync(frozen))throw Error('Snapshot target already exists: '+frozen);
mkdirSync(frozen);
const old=JSON.parse(readFileSync('evidence/combined-local-2026-10-19-r1/provenance.json'));
const hash=b=>createHash('sha256').update(b).digest('hex'),rows=[];
for(const [mall,port,pid]of[['saigon-centre',4401,25400],['vincom-dong-khoi',4402,29732]]){
 const dir=join(frozen,mall),provenance=old.outputs.find(r=>r.mall===mall&&r.mode==='public');
 cpSync(`dist/${mall}`,dir,{recursive:true,errorOnExist:true,force:false});
 const files=provenance.files.map(file=>{const actual=hash(readFileSync(join(dir,file.path)));if(actual!==file.sha256)throw Error('Frozen output drift: '+mall+'/'+file.path);return {...file};});
 const pages=[];
 for(const locale of ['en','vi']){const r=await fetch(`http://127.0.0.1:${port}/${locale}`);const bytes=Buffer.from(await r.arrayBuffer());if(r.status!==200)throw Error('Delivered preview not available');pages.push({locale,status:r.status,sha256:hash(bytes),bytes:bytes.length});}
 rows.push({mall,port,previousPid:pid,snapshot:dir,sourceCheckpoint:'370be91',fileCount:files.length,manifestSha256:provenance.manifestSha256,pages});
}
writeFileSync(`${out}/delivered-preview-snapshot.json`,JSON.stringify({at:new Date().toISOString(),directory:frozen,rows},null,2)+'\n');
console.log(JSON.stringify(rows.map(({pages,...r})=>r)));
