import {createServer} from 'vite';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out='evidence/vincom-57-audit-2026-10-22';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
process.env.MALL_ID='vincom-dong-khoi';
const server=await createServer({configFile:false,optimizeDeps:{entries:[],noDiscovery:true},server:{middlewareMode:true}});
try {
 const {site}=await server.ssrLoadModule('/src/data/site.ts');
 const baseline=read('evidence/vincom-valiram-area-2026-10-22/runtime-after.json');
 assert.deepEqual(site,baseline,'Current runtime must match delivered2668bb3');
 const remaining=site.destinations.filter(d=>d.locations.every(l=>!l.areaIds.length));
 const csv=readFileSync(`${out}/remaining-evidence.csv`,'utf8');
 assert.equal(remaining.length,57);
 assert.equal(site.destinations.length,203);
 assert.equal(csv.trim().split('\n').length,58);
 for(const d of remaining) assert.ok(csv.includes(d.id+','),`Missing requirement for ${d.id}`);
 const holds=read('data/research/vincom-max-source-units-2026-10-22-r1.json').protectedHolds;
 for(const h of holds)assert.equal(site.destinations.find(d=>d.id===h.destinationId).locations.find(l=>l.floorId===h.floorId).areaIds.length,0);
 const dirty=read('evidence/vincom-remaining-2026-10-21/initial-worktree.json').dirtyPaths;
 for(const [p,h] of Object.entries(dirty))assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),h,p);
 const result={baseCommit:'2668bb3',total:203,areaLinked:146,floorOnly:57,completeMapping:false,runtimeUnchanged:true,protectedHolds:holds.length,originalRawHashesPreserved:Object.keys(dirty).length,remainingIds:remaining.map(d=>d.id)};
 writeFileSync(`${out}/runtime-audit.json`,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({...result,remainingIds:undefined}));
}finally{await server.close();}
