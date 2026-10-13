// Artifact/content prerequisites, not a private behavior or unit suite.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const hash=b=>createHash('sha256').update(b).digest('hex');
const rows=[];
for (const mall of ['saigon-centre','vincom-dong-khoi']) {
  const raw=await readFile(resolve(root,`data/malls/${mall}/floor-geometry.json`)),data=JSON.parse(raw);
  let vertices=0,regions=0;
  for (const floor of data.floors) {
    const source=floor.sources[0];
    const map=await readFile(resolve(root,`assets/${mall}/maps/${floor.id}.${mall==='saigon-centre'?'png':'webp'}`));
    if (hash(map)!==source.sha256) throw new Error(`Source identity changed: ${mall}/${floor.id}`);
    for (const region of floor.regions) {
      if(region.outer.length<3||region.outer.some(p=>p.length!==2||p.some(n=>!Number.isFinite(n)))||region.holes.length) throw new Error(`Invalid or inferred ring: ${region.id}`);
      vertices+=region.outer.length;regions++;
    }
  }
  rows.push({mall,revision:data.revision,bytes:raw.length,sha256:hash(raw),floorCount:data.floors.length,regions,vertices,sourceMapsByteIdentical:true,finiteNondegenerateRings:true,holesInferred:0,registration:'not-run; unregistered source-canvas-centred schematic frame',topologyReview:'source-overlay candidate review; surveyed/physical geometry unaccepted'});
}
await mkdir(resolve(root,'evidence'),{recursive:true});
await writeFile(resolve(root,'evidence/input-validation.json'),JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify(rows,null,2));
