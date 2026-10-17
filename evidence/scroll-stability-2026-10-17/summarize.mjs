// Aggregate public-browser receipts and exact static inputs, not runtime internals.
import{readFile,writeFile}from'node:fs/promises';
import{createHash}from'node:crypto';
import{execFileSync}from'node:child_process';
const out=new URL('./',import.meta.url),root=new URL('../../',out);
const json=async name=>JSON.parse(await readFile(new URL(name,out),'utf8'));
const normal=await json('green-matrix.json');
const edges=[...(await json('edge-saigon-final.json')).runs,...(await json('edge-vincom-final.json')).runs];
const failure=await json('prepared-failure.json'),transport=await json('transport.json');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const source='f3bea415a0ec617e8a856209831fbd96abfa2e48';
const result={revision:'scroll-stability-2026-10-17-r1',source,recordedAt:new Date().toISOString(),browser:normal.browser,normal:[],edges:edges.map(({mall,test,pass,...r})=>({mall,test,pass,...r})),preparedFailure:failure.runs,builds:[],assets:[],transport:{routes:transport.malls.reduce((n,m)=>n+m.routes.length,0),representations:transport.malls.reduce((n,m)=>n+m.resources.length,0),pass:transport.malls.every(m=>m.mallIsolation&&m.unknownStatus===404&&m.productionFixtureStatus===404&&m.routes.every(r=>r.pass)&&m.resources.every(r=>r.exact&&r.validatorStatus===304))}};
for(const r of normal.runs){
 const keys=new Set(['exterior','overview','map','discovery']);
 const repeatedPreparation=r.marks.filter(m=>m.name.startsWith('mall-loading:scene-prepare:start:')&&m.at>=r.samples[0].at&&(m.detail.kind==='exterior'||m.detail.kind==='overview'||m.detail.floorId==='L2'));
 result.normal.push({mall:r.mall,locale:r.locale,width:r.width,status:r.status,overlays:r.overlays.length,wheelOverlays:r.wheel.overlays.length,floor:r.wheel.floor,profile:r.profile,repreparedRequestedViews:repeatedPreparation.length,visitedKinds:[...new Set(r.samples.map(s=>s.canvas.sceneKey?.split(':').at(-2)).filter(k=>keys.has(k)))]});
}
for(const mall of ['saigon-centre','vincom-dong-khoi']){
 const log=await readFile(new URL(`build-${mall==='saigon-centre'?'saigon':'vincom'}-delivery.log`,out),'utf8');
 result.builds.push({mall,pass:log.includes('[build] Complete!')&&log.includes('- 0 errors')&&log.includes('- 0 warnings'),existingUnusedEvidenceImportHint:log.includes("'stat' is declared"),existingLazyChunkWarning:log.includes('larger than 500 kB')});
 const directory=JSON.parse(await readFile(new URL(`data/malls/${mall}/directory.json`,root),'utf8'));
 const manifest=JSON.parse(await readFile(new URL(`dist/${mall}/data/asset-manifest.json`,root),'utf8'));
 result.assets.push({mall,exteriorRevision:manifest.assetRevision,geometryRevision:manifest.floorGeometry.revision,exteriorSha256:hash(await readFile(new URL(`dist/${mall}/models/exterior.glb`,root))),geometrySha256:hash(await readFile(new URL(`dist/${mall}/data/floor-geometry.json`,root))),publicRevision:directory.revision,approval:directory.approval,destinations:directory.destinations.length,reviewedAt:directory.reviewedAt});
}
result.browserCases=result.normal.length+edges.length+failure.runs.length;
result.pass=result.normal.length===8&&result.normal.every(r=>r.status==='passed'&&!r.overlays&&!r.wheelOverlays&&!r.repreparedRequestedViews&&r.floor==='L2')&&edges.length===8&&edges.every(r=>r.pass)&&failure.runs.length===2&&failure.runs.every(r=>r.pass)&&result.builds.every(r=>r.pass)&&result.transport.pass;
result.sourceDrift=execFileSync('git',['diff',source,'--','src','data','assets','scripts','tests','package.json','package-lock.json'],{cwd:root,encoding:'utf8'}).trim();
result.pass&&=!result.sourceDrift;
await writeFile(new URL('summary.json',out),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({revision:result.revision,source,pass:result.pass,browserCases:result.browserCases,normal:result.normal.map(({profile,...r})=>r),edges:edges.map(({mall,test,pass})=>({mall,test,pass})),transport:result.transport}));
if(!result.pass)process.exitCode=1;
