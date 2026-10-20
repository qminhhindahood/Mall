import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='evidence/continuation-2026-10-19-r2/validation';
const snapshot=JSON.parse(readFileSync(`${out}/delivered-preview-snapshot.json`)),rows=[];
for(const row of snapshot.rows)for(const before of row.pages){
 const response=await fetch(`http://127.0.0.1:${row.port}/${before.locale}`),html=await response.text();
 const original=html.replace('<script src="/__acceptance/browser-platform-fixtures.js"></script>','');
 const sha=createHash('sha256').update(original).digest('hex');
 rows.push({mall:row.mall,locale:before.locale,port:row.port,status:response.status,acceptanceScript:html.includes('/__acceptance/browser-platform-fixtures.js'),priorContentSha256:before.sha256,currentContentSha256:sha,pass:response.status===200&&sha===before.sha256});
}
writeFileSync(`${out}/delivered-preview-after-restart.json`,JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify(rows));if(rows.some(r=>!r.pass))process.exitCode=1;
