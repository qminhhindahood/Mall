import fs from 'node:fs';
import {createServer} from 'vite';
const mall=process.argv[2]??'vincom-dong-khoi';process.env.MALL_ID=mall;
const server=await createServer({configFile:false,server:{middlewareMode:true}});
try{
 const {site}=await server.ssrLoadModule('/src/data/site.ts');
 fs.writeFileSync(`evidence/vincom-integration/runtime-${mall}.json`,JSON.stringify(site,null,2)+'\n');
 console.log(JSON.stringify({mall,listings:site.destinations.length,mapped:site.destinations.filter(d=>d.locations.some(l=>l.areaIds.length)).length}));
}finally{await server.close();}
