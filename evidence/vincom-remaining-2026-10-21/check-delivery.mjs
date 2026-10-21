// Build/content validation for the mapping delivery, not a new runtime unit-test seam.
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { createServer } from 'vite';

const read = name => JSON.parse(readFileSync(name,'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const output = 'evidence/vincom-remaining-2026-10-21';
const before = read(`${output}/initial-worktree.json`);
const packet = read('data/research/vincom-reopened-source-unit-2026-10-21-r1.json');
const rows = [];
for (const mall of ['vincom-dong-khoi','saigon-centre']) {
  process.env.MALL_ID = mall;
  const server = await createServer({configFile:false,optimizeDeps:{entries:[],noDiscovery:true},server:{middlewareMode:true}});
  try {
    const {site} = await server.ssrLoadModule('/src/data/site.ts');
    const baseline = read(`evidence/vincom-integration/runtime-${mall}.json`);
    const expected = mall==='vincom-dong-khoi'?114:164;
    assert.equal(site.destinations.length,mall==='vincom-dong-khoi'?203:165);
    assert.equal(site.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length,expected);
    for (const destination of baseline.destinations) {
      if (mall==='vincom-dong-khoi' && destination.id==='vincom-prototype-nike') continue;
      assert.deepEqual(site.destinations.find(d=>d.id===destination.id),destination);
    }
    for (const area of baseline.content.areas) assert.deepEqual(site.content.areas.find(a=>a.id===area.id),area);
    for (const floor of baseline.geometry.floors) for (const region of floor.regions) {
      if (mall==='vincom-dong-khoi' && floor.id==='B1' && region.id===packet.originalNeutralRegion.id) continue;
      assert.deepEqual(site.geometry.floors.find(f=>f.id===floor.id).regions.find(r=>r.id===region.id),region);
    }
    if (mall==='vincom-dong-khoi') {
      for (const hold of packet.protectedHolds) assert.equal(site.destinations.find(d=>d.id===hold.destinationId).locations.find(l=>l.floorId===hold.floorId).areaIds.length,0);
      const nike=site.destinations.find(d=>d.id==='vincom-prototype-nike');
      assert.deepEqual(nike.locations[0].areaIds,['vincom-reopened-area-nike-b1-55']);
      assert.ok(nike.locations[0].associationDetail.note.en && nike.locations[0].associationDetail.note.vi);
    }
    const built=read(`dist/${mall}/data/floor-geometry.json`);
    assert.deepEqual(built.floors.map(f=>({id:f.id,sources:f.sources,regions:f.regions})),site.geometry.floors.map(f=>({id:f.id,sources:f.sources,regions:f.regions})));
    const identity=readFileSync(`dist/${mall}/data/floor-geometry.json`);
    assert.deepEqual(brotliDecompressSync(readFileSync(`dist/${mall}/data/floor-geometry.json.br`)),identity);
    assert.deepEqual(gunzipSync(readFileSync(`dist/${mall}/data/floor-geometry.json.gz`)),identity);
    rows.push({mall,total:site.destinations.length,mapped:expected,geometrySha256:hash(identity),allOtherDestinationsAndAreasUnchanged:true,allOtherRegionsUnchanged:true,transportRoundtrip:true});
  } finally { await server.close(); }
}
for (const [path,expected] of Object.entries(before.dirtyPaths)) assert.equal(hash(readFileSync(path)),expected,`Pre-existing dirty bytes changed: ${path}`);
const result={baseline:before.head,malls:rows,protectedDirtyFiles:Object.keys(before.dirtyPaths).length,protectedPrecisionHolds:packet.protectedHolds.length,assetRevision:'photo-polish-2026-10-12-delivery-r2',mappingComplete:false};
writeFileSync(`${output}/delivery-checks.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
