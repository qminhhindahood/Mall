import {createServer} from 'vite';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
process.env.MALL_ID='vincom-dong-khoi';
const s=await createServer({configFile:false,optimizeDeps:{entries:[],noDiscovery:true},server:{middlewareMode:true}});
try{const {site}=await s.ssrLoadModule('/src/data/site.ts');assert.equal(site.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length,114,'Capture only from the d508f15 baseline, before this overlay is installed');writeFileSync('evidence/vincom-max-links-2026-10-22/baseline-runtime.json',JSON.stringify(site));console.log(site.content.revision);}finally{await s.close();}
