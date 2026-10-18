import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import cp from 'node:child_process';
import ts from 'typescript';
import {gzipSync} from 'node:zlib';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'../../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const rows=[],inputs=[];
const save=(name,value)=>fs.writeFileSync(path.join(here,name),JSON.stringify(value,null,2)+'\n');
const source=p=>{const text=fs.readFileSync(path.join(app,p),'utf8');inputs.push({path:p,sha256:sha(text)});return text;};
function add(row){rows.push({ownerApproval:false,languageApprovals:{vi:false,en:false},correction:{vi:null,en:null},...row});}
function literal(node){return ts.isStringLiteralLike(node)?node.text:null;}
function line(file,node){return file.getLineAndCharacterOfPosition(node.getStart(file)).line+1;}
const dictionaryFiles={'src/components/copy.ts':['copy'],'src/components/journey-copy.ts':['journeyCopy'],'src/components/Discovery.tsx':['discoveryCopy']};
for(const [p,names] of Object.entries(dictionaryFiles)){
 const text=source(p), file=ts.createSourceFile(p,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node){
  if(ts.isVariableDeclaration(node)&&names.includes(node.name.getText(file))){
   let value=node.initializer;while(ts.isSatisfiesExpression(value)||ts.isAsExpression(value))value=value.expression;
   const byLang={};for(const lang of value.properties){const locale=lang.name.getText(file);byLang[locale]=Object.fromEntries(lang.initializer.properties.map(x=>[x.name.getText(file),{text:literal(x.initializer),line:line(file,x)}]));}
   for(const key of Object.keys(byLang.vi))add({id:`ui:${node.name.getText(file)}.${key}`,scope:'interface',section:p.includes('journey-copy')?'Map, directory and journey':p.includes('Discovery')?'Discovery collections':key.includes('Introduction')?'Tower introduction':'Navigation, loading and introduction',placement:key,source:[{path:p,key:`${node.name.getText(file)}.vi.${key}`,line:byLang.vi[key].line},{path:p,key:`${node.name.getText(file)}.en.${key}`,line:byLang.en[key]?.line}],currentText:{vi:byLang.vi[key].text,en:byLang.en[key]?.text??null},status:'Current source text',proposal:null});
  }
  ts.forEachChild(node,visit);
 }visit(file);
}
// Inline localized strings outside the dictionaries remain individually addressable.
const sourceFiles=['src/components/Explorer.tsx','src/components/Discovery.tsx','src/components/Directory.tsx','src/components/FloorMap.tsx','src/components/OverviewStack.tsx','src/pages/[locale]/[...path].astro','src/layouts/Guide.astro','src/data/site.ts'];
for(const p of sourceFiles){
 if(!fs.existsSync(path.join(app,p)))continue;
 const text=source(p);
 const ternary=/(?:selection\.)?locale\s*===\s*['"]vi['"]\s*\?\s*(['"])(.*?)\1\s*:\s*(['"])(.*?)\3/g;
 for(const match of text.matchAll(ternary)){
  const vi=match[2],en=match[4];if(!/[\sÀ-ỹ]/u.test(vi+en))continue;
  const at=text.slice(0,match.index).split('\n').length;
  add({id:`inline:${p}:${at}:${match.index}`,scope:'interface',section:'Inline labels and accessibility',placement:text.split('\n')[at-1].trim().slice(0,240),source:[{path:p,line:at,key:'inline localized expression',offset:match.index}],currentText:{vi,en},status:'Current source text',proposal:null});
 }
 if(p.endsWith('Explorer.tsx'))for(const [key,vi,en] of [['collapse','Thu gọn sơ đồ','Collapse map'],['expand','Phóng lớn sơ đồ','Expand map']])add({id:`inline:Explorer.map.${key}`,scope:'interface',section:'Inline labels and accessibility',placement:`Discovery map ${key} control`,source:[{path:p,line:text.slice(0,text.indexOf(vi)).split('\n').length,key:`mapExpanded.${key}`}],currentText:{vi,en},status:'Current source text',proposal:null});
}
const translationSource=source('src/data/research-fixtures.ts');
// Execute the same importer and approved private overlay used by the current preview.
// Transpilation removes type imports; the sole runtime dependency is resolved explicitly.
const fixtureCode=ts.transpileModule(translationSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace('../../scripts/research-overlay.mjs',pathToFileURL(path.join(app,'scripts/research-overlay.mjs')).href);
const {createResearchFixtures}=await import('data:text/javascript;base64,'+Buffer.from(fixtureCode).toString('base64'));
source('scripts/research-overlay.mjs');
const {researchGeometry}=await import(pathToFileURL(path.join(app,'scripts/research-overlay.mjs')).href);
for(const name of ['owner-decisions.json','manifest.json','source-hashes.json','saigon-centre.private.json','vincom-dong-khoi.private.json'])source('docs/content-preparation/integration-candidate-2026-10-18-r2/'+name);
const priorFixtureMode=process.env.INCLUDE_TEST_FIXTURES;
process.env.INCLUDE_TEST_FIXTURES='research';
const effectiveSnapshots=[];
for(const [name,flip] of [['english',false],['cuisines',true]]){
 const body=translationSource.match(new RegExp(`const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\};`))[1];
 const pairs=/(?:'([^']+)'|([A-Za-z]+))\s*:\s*'([^']+)'/g;
 for(const m of body.matchAll(pairs)){const key=m[1]??m[2];add({id:`taxonomy:${name}:${key}`,scope:'categories',section:flip?'Cuisine filters':'Category labels',placement:key,source:[{path:'src/data/research-fixtures.ts',key:`${name}[${key}]`}],currentText:flip?{vi:m[3],en:key}:{vi:key,en:m[3]},status:'Current research-preview translation',proposal:null});}
}
const baseline=read(path.join(here,'../record-review-2026-10-18/content-ledger.json'));
const returned=new Map(read(path.join(here,'../copy-return-2026-10-18/reconciled-copy.json')).records.map(r=>[r.id,r]));
const amendments=new Set(['vincom-prototype-cara','vincom-prototype-lizdnamat','vincom-prototype-mujoshtedbaker']);
const neutral=new Map(read(path.join(here,'../evidence-follow-up-2026-10-18-r1/neutral-copy-proposals.json')).records.map(r=>[r.id,r]));
const roster=read(path.join(here,'../completion-packet-2026-10-17/roster.json')).records;
const rosterById=new Map(roster.map(r=>[r.id,r]));
const currentById=new Map();
for(const mall of ['saigon-centre','vincom-dong-khoi']){
 const p=`data/research/${mall}.json`,data=JSON.parse(source(p));
 for(const record of data.records)currentById.set(record.id,{...record,mall,path:p});
 const geometry=JSON.parse(source(`data/malls/${mall}/floor-geometry.json`));
 const snapshot=createResearchFixtures(data,mall,researchGeometry(app,mall,geometry));
 effectiveSnapshots.push({mallId:mall,revision:snapshot.revision,areas:snapshot.areas.map(area=>({...area,destinationIds:snapshot.destinations.filter(d=>d.locations.some(l=>l.floorId===area.floorId&&l.areaIds.includes(area.id))).map(d=>d.id)})),locations:snapshot.destinations.map(d=>({id:d.id,locations:d.locations}))});
 for(const floor of geometry.floors)add({id:`floor:${mall}:${floor.id}`,scope:'mall-floor',section:'Floor labels',mall,placement:`Floor rail, overview labels and map title · ${floor.id}`,source:[{path:`data/malls/${mall}/floor-geometry.json`,key:`floors[id=${floor.id}].label`}],currentText:{vi:floor.label,en:floor.label},status:'Current shared floor label; code is identical in both languages',proposal:null});
 add({id:`mall:${mall}`,scope:'mall-floor',section:'Mall identity',mall,placement:'Hero, header, loader, footer and page title',source:[{path:'src/data/site.ts',key:'site.name'}],currentText:{vi:mall==='saigon-centre'?'Saigon Centre':'Vincom Center Đồng Khởi',en:mall==='saigon-centre'?'Saigon Centre':'Vincom Center Đồng Khởi'},status:'Current proper name',proposal:null});
}
for(const old of baseline){
 const current=currentById.get(old.id), supplied=rosterById.get(old.id), returnedRow=returned.get(old.id), neutralRow=neutral.get(old.id);
 const held=amendments.has(old.id);
 let latest=held?{vi:null,en:null}:returnedRow?returnedRow.description:{vi:old.copy.vi.proposedText,en:old.copy.en.proposedText};
 const provenance=held?'Three-record null amendment':returnedRow?'Returned copy (not installed in preview)':'Record-review proposal (not installed in preview)';
 add({id:`destination:${old.id}:name`,destinationId:old.id,scope:'store-names',section:'Store and brand names',mall:old.mall,placement:`Directory/Discovery/list/detail · ${old.floors.join(', ')}`,source:[{path:current?.path??'docs/content-preparation/completion-packet-2026-10-17/roster.json',key:`records[id=${old.id}].name`}],currentText:current?{vi:current.name,en:current.name}:{vi:null,en:null},status:current?'Current research-preview proper name':'Expanded roster only; absent from current preview',proposal:current?null:{vi:supplied.name,en:supplied.name}});
 add({id:`destination:${old.id}:description`,destinationId:old.id,scope:'store-descriptions',section:'Store descriptions',mall:old.mall,placement:`${old.name} · Directory detail and Discovery floating detail · ${old.floors.join(', ')}`,source:[{path:current?.path??'docs/content-preparation/completion-packet-2026-10-17/roster.json',key:`records[id=${old.id}].description`},{path:'src/data/research-fixtures.ts',key:'createResearchFixtures.description.en (currently empty)'}],currentText:current?{vi:current.description,en:''}:{vi:null,en:null},status:current?'Current research-preview VI; EN blank uses pending fallback':'Expanded roster only; absent from current preview',proposal:latest,proposalOrigin:provenance,proposalApproval:returnedRow?.copyOwnerApproval===true?'Exact Meat & Meet wording previously accepted; publication separate':'Not approved',withdrawnProposal:held?'Earlier returned strings withdrawn; both latest proposal languages null':null,additionalNeutralProposal:neutralRow?.proposedText??null,claimReasoning:old.copy.vi.finding,sourceUrls:old.sources.filter(x=>x.startsWith('https://')),sourceEvidence:neutralRow?.sources??[],previousDraft:{vi:old.copy.vi.draftText,en:old.copy.en.draftText}});
}
// Inventory effective visible area labels AFTER accepted42/no-marker overlay, not raw codes.
let areaCount=0;
for(const snapshot of effectiveSnapshots)for(const area of snapshot.areas){areaCount++;add({id:`area:${snapshot.mallId}:${area.id}`,scope:'map-labels',section:'Effective source unit and shared-area labels',mall:snapshot.mallId,placement:`Map accessible name, area link and shared-area chooser · ${area.floorId}`,source:[{path:'src/data/research-fixtures.ts',key:`createResearchFixtures.areas[id=${area.id}].name`},{path:`data/research/${snapshot.mallId}.json`,key:'Source location codes; overridden for accepted geometry and cleared for unresolved original gaps'},{path:`docs/content-preparation/integration-candidate-2026-10-18-r2/${snapshot.mallId}.private.json`,key:'records[].geometryCandidates / originalLocationGaps'}],currentText:area.name,status:'Effective private research-preview label after accepted42/no-marker overlay; no copy/occupancy approval',runtimeAreaId:area.id,regionIds:area.regionIds,destinationIds:area.destinationIds,proposal:null});}
if(priorFixtureMode===undefined)delete process.env.INCLUDE_TEST_FIXTURES;else process.env.INCLUDE_TEST_FIXTURES=priorFixtureMode;
save('effective-preview-labels.json',{revision:'website-text-review-2026-10-18-r1',refreshReason:'Late accepted42 geometry/no-marker runtime overlay and human-facing area labels',snapshots:effectiveSnapshots});
for(const row of rows.filter(r=>r.id.startsWith('ui:'))){
 const key=row.placement;
 const usage=[];
 for(const p of sourceFiles){if(!fs.existsSync(path.join(app,p)))continue;const lines=fs.readFileSync(path.join(app,p),'utf8').split('\n');for(let i=0;i<lines.length;i++)if(new RegExp(`(?:\\.|\\])${key}\\b|\\.${key}\\b`).test(lines[i]))usage.push({path:p,line:i+1,context:lines[i].trim().slice(0,320)});}
 row.renderingContexts=usage;row.usageStatus=usage.length?'Referenced by current source':'No direct consumer found; retained dictionary entry, not guaranteed visible';
}
const branchComparisons=[];
for(const ref of ['vincom-dong-khoi','takashimaya','prototype/0019-composition-2026-10-17'])for(const p of Object.keys(dictionaryFiles)){
 try{const refPath=ref==='vincom-dong-khoi'||ref==='takashimaya'?`visitor-app/${p}`:p;const previous=cp.execFileSync('git',['show',`${ref}:${refPath}`],{cwd:app,encoding:'utf8',stdio:['ignore','pipe','ignore']});const current=fs.readFileSync(path.join(app,p),'utf8');branchComparisons.push({ref,path:p,refPath,sameBytes:previous===current,sameTextIgnoringLineEndings:previous.replaceAll('\r\n','\n')===current.replaceAll('\r\n','\n'),refSha256:sha(previous),currentSha256:sha(current)});}catch{branchComparisons.push({ref,path:p,status:'Source path absent at ref; prototype artifacts differ from application'});}
}
const counts=Object.fromEntries([...new Set(rows.map(r=>r.scope))].map(scope=>[scope,rows.filter(r=>r.scope===scope).length]));
const inventory={revision:'website-text-review-2026-10-18-r1',sourceCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim(),counts,records:rows};
save('inventory.json',inventory);save('source-hashes.json',inputs);save('branch-comparison.json',branchComparisons);
save('summary.json',{...counts,total:rows.length,currentResearchIdentities:currentById.size,expandedRoster:baseline.length,storeEnglishBehavior:'All research-preview descriptions explicitly blank at importer; UI pending-description fallback is shown',returnedCopyNotInstalled:returned.size,withdrawnCopyIds:[...amendments],optionalNeutralProposals:neutral.size,sourceInputs:inputs.length,branchComparisons});
const csv=[['id','scope','mall','placement','source','vi_current','en_current','vi_latest_proposal','en_latest_proposal','vi_correction','en_correction','status'],...rows.map(r=>[r.id,r.scope,r.mall??'both',r.placement,r.source.map(s=>s.path+':'+(s.line??s.key)).join(' | '),r.currentText.vi??'',r.currentText.en??'',r.proposal?.vi??'',r.proposal?.en??'','','',r.status])];
fs.writeFileSync(path.join(here,'editable-copy.csv'),'\uFEFF'+csv.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\n')+'\n');
const template=fs.readFileSync(path.join(here,'review-template.html'),'utf8');
const pageInventory={...inventory,records:rows.map(r=>({...r,renderingContexts:r.renderingContexts?.slice(0,2).map(c=>({...c,context:c.context.slice(0,160)})),sourceEvidence:r.sourceEvidence?.map(s=>({...s,archivedDescription:typeof s.archivedDescription==='string'?s.archivedDescription.slice(0,800):s.archivedDescription})),previousDraft:undefined}))};
const compressed=gzipSync(Buffer.from(JSON.stringify(pageInventory))).toString('base64');
const embedded=`JSON.parse(await new Response(new Blob([Uint8Array.from(atob('${compressed}'),c=>c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('gzip'))).text())`;
fs.writeFileSync(path.join(here,'review.html'),template.replace('/*INVENTORY*/',embedded));
console.log(JSON.stringify({counts,total:rows.length,currentResearchIdentities:currentById.size,branchComparisons},null,2));
