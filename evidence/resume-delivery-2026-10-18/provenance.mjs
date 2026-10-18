import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const out='evidence/resume-delivery-2026-10-18';
const receipt={at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sources:{},publicSnapshots:{},outputs:[],releaseApproved:false};
for(const file of ['src/components/Explorer.tsx','src/data/research-fixtures.ts','scripts/research-overlay.mjs','docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json'])receipt.sources[file]=hash(file);
for(const mall of ['saigon-centre','vincom-dong-khoi']){
 receipt.publicSnapshots[mall]={sha256:hash(`data/malls/${mall}/directory.json`),...JSON.parse(readFileSync(`data/malls/${mall}/directory.json`))};
 for(const mode of ['public','research','fixture']){
  const directory=`dist/${mode==='public'?'':mode==='fixture'?'fixtures/':'research/'}${mall}`;
  const files={};const walk=dir=>{for(const name of readdirSync(dir)){const path=dir+'/'+name;if(statSync(path).isDirectory())walk(path);else files[path.slice(directory.length+1)]=hash(path);}};walk(directory);
  receipt.outputs.push({mall,mode,directory,fileCount:Object.keys(files).length,files});
 }
}
writeFileSync(out+'/provenance.json',JSON.stringify(receipt,null,2)+'\n');
