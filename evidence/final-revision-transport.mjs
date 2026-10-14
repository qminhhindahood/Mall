// Static/build/transport receipts, not an additional runtime behavior test seam.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
const result = { recordedAt: new Date().toISOString(), source: 'a5f72cf / unchanged application 13a2083', profile: 'localhost HTTP; public static servers 4213/4214; no network throttling; not production', malls: [] };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [mallId,port] of [['saigon-centre',4213],['vincom-dong-khoi',4214]]) {
  const origin=`http://localhost:${port}`;
  const manifest=JSON.parse(await readFile(`dist/${mallId}/data/asset-manifest.json`,'utf8'));
  const receipt={mallId,assetRevision:manifest.assetRevision,geometryRevision:manifest.floorGeometry.revision,resources:[],bundles:[],routes:[]};
  for (const [path,expected] of [['/models/exterior.glb',manifest.sha256],['/data/floor-geometry.json',manifest.floorGeometry.sha256]]) for(const representation of ['identity','br']) {
    const response=await fetch(origin+path+(representation==='identity'?'?identity=1':'.br'));
    const bytes=new Uint8Array(await response.arrayBuffer());
    const exact=hash(bytes)===expected;
    if(!response.ok || !exact)throw new Error(`Source identity failure: ${mallId} ${path} ${representation}`);
    const headers=Object.fromEntries(response.headers);
    const validator=await fetch(origin+path+(representation==='identity'?'?identity=1':'.br'),{headers:{'If-None-Match':headers.etag}});
    if (validator.status !== 304 || representation === 'br' && headers['content-encoding'] !== 'br') throw new Error(`Cache/encoding failure: ${mallId} ${path} ${representation}`);
    receipt.resources.push({path,representation,decodedBytes:bytes.length,encodedBytes:Number(headers['content-length']),sha256:hash(bytes),exact,headers,validatorStatus:validator.status});
  }
  for(const name of await readdir(`dist/${mallId}/_astro`)) if(name.endsWith('.js')) {
    const bytes=await readFile(`dist/${mallId}/_astro/${name}`);
    receipt.bundles.push({name,bytes:bytes.length,gzipEstimateBytes:gzipSync(bytes).length,lazy3D:name.startsWith('create-scene-runtime')});
  }
  const geometry=JSON.parse(await readFile(`dist/${mallId}/data/floor-geometry.json`,'utf8'));
  for(const locale of ['vi','en']) for(const floor of geometry.floors) {
    const path=`/${locale}/${locale==='vi'?'tang':'floors'}/${floor.id}`;
    const response=await fetch(origin+path);const html=await response.text();
    const pass=response.status===200&&html.includes('static-guide')&&html.includes('<path')&&!html.includes('loading-test-store');
    if(!pass)throw new Error(`Static route failure: ${mallId} ${path}`);
    receipt.routes.push({path,status:response.status,pass});
  }
  receipt.unknownStatus=(await fetch(origin+'/en/stores/unknown-store')).status;
  receipt.productionFixtureStatus=(await fetch(origin+'/en/stores/loading-test-store')).status;
  receipt.publicMapFiles=await readdir(`dist/${mallId}/maps`);
  const snapshot=JSON.parse(await readFile(`data/malls/${mallId}/directory.json`,'utf8'));
  receipt.publicContent={revision:snapshot.revision,approval:snapshot.approval,reviewedAt:snapshot.reviewedAt,destinations:snapshot.destinations.length,highlights:snapshot.highlights.length};
  if(snapshot.approval!=='pending'||snapshot.reviewedAt!==null||snapshot.destinations.length||snapshot.highlights.length)throw new Error('Pending public content boundary changed');
  receipt.mallIsolation=manifest.mallId===mallId&&receipt.publicMapFiles.length===geometry.floors.length;
  if(!receipt.mallIsolation || receipt.unknownStatus!==404 || receipt.productionFixtureStatus!==404)throw new Error('Mall/fixture isolation or 404 failure');
  result.malls.push(receipt);
}
await writeFile('evidence/final-revision-built-transport.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.malls.map(m=>({mallId:m.mallId,routes:m.routes.length,resources:m.resources.length,mallIsolation:m.mallIsolation,unknownStatus:m.unknownStatus,productionFixtureStatus:m.productionFixtureStatus}))));
