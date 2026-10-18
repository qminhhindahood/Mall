// Run only after the UI build owner signals all six outputs are settled.
// Static/transport/package prerequisites; no inference of interaction acceptance.
import {readFile,readdir,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
const dir='evidence/finish-readiness-2026-10-18';
const hash=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const result={at:new Date().toISOString(),head:git('rev-parse','HEAD'),scope:'localhost final-output static/transport and local Wrangler packaging only',sourceHashes:{},outputs:[],failed:[]};
for(const p of git('ls-files','src','scripts','astro.config.mjs','package.json').split('\n').filter(Boolean))result.sourceHashes[p]=hash(await readFile(p));
for(const [mall,port] of [['saigon-centre',4333],['vincom-dong-khoi',4334]]){
 const root=`dist/${mall}`,base=`http://localhost:${port}`,manifest=JSON.parse(await readFile(`${root}/data/asset-manifest.json`)),geometry=JSON.parse(await readFile(`${root}/data/floor-geometry.json`));
 const row={mall,resources:[],routes:[],outputs:[],packaging:null};
 for(const [path,expected] of [['/models/exterior.glb',manifest.sha256],['/data/floor-geometry.json',manifest.floorGeometry.sha256]])for(const mode of ['identity','br']){
  const url=base+path+(mode==='br'?'.br':'?identity=1'),response=await fetch(url),bytes=new Uint8Array(await response.arrayBuffer()),headers=Object.fromEntries(response.headers),validator=await fetch(url,{headers:{'if-none-match':headers.etag}});
  const pass=response.ok&&hash(bytes)===expected&&validator.status===304&&(mode!=='br'||headers['content-encoding']==='br');
  row.resources.push({path,mode,pass,status:response.status,decodedBytes:bytes.length,encodedBytes:Number(headers['content-length']),sha256:hash(bytes),validator:validator.status});
  if(!pass)result.failed.push(`${mall}: resource ${path} ${mode}`);
 }
 for(const locale of ['vi','en'])for(const floor of geometry.floors){
  const path=`/${locale}/${locale==='vi'?'tang':'floors'}/${floor.id}`,r=await fetch(base+path),html=await r.text(),disk=await readFile(`${root}${path}/index.html`,'utf8');
  const pass=r.status===200&&html===disk&&html.includes('static-guide')&&html.includes('<svg');row.routes.push({path,status:r.status,pass});if(!pass)result.failed.push(`${mall}: route ${path}`);
 }
 for(const path of ['/en/stores/loading-test-store','/en/stores/unknown-store','/vi/cua-hang/unknown-store']){const status=(await fetch(base+path)).status;if(status!==404)result.failed.push(`${mall}: false 404 ${path}`);row.routes.push({path,status,pass:status===404});}
 for(const mode of ['','fixtures/','research/']){
  const output=`dist/${mode}${mall}`,files=[];
  async function walk(p){for(const f of await readdir(p,{withFileTypes:true})){const full=`${p}/${f.name}`;if(f.isDirectory())await walk(full);else files.push({path:full.slice(output.length+1),bytes:(await stat(full)).size,sha256:hash(await readFile(full))});}}
  await walk(output);const release=JSON.parse(await readFile(`${output}/release-manifest.json`));
  const pass=files.length<=20000&&files.every(f=>f.bytes<=25*1024*1024)&&release.mall===mall&&release.fixture===!!mode;
  if(!pass)result.failed.push(`${mall}: ${mode||'public'} output isolation/limits`);
  row.outputs.push({output,pass,files,release});
 }
 const dry=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--config',`wrangler.${mall}.jsonc`,'--outdir',`${dir}/package-${mall}`],{encoding:'utf8',timeout:60000,env:{...process.env,WRANGLER_SEND_METRICS:'false',CI:'true'}});
 row.packaging={exitCode:dry.status,error:dry.error?.code??null};await writeFile(`${dir}/dry-run-${mall}.log`,(dry.stdout??'')+(dry.stderr??''));if(dry.status!==0)result.failed.push(`${mall}: dry-run`);
 result.outputs.push(row);
}
await writeFile(`${dir}/final-output-results.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({head:result.head,malls:result.outputs.map(r=>({mall:r.mall,routes:r.routes.length,resources:r.resources.length,packaging:r.packaging})),failed:result.failed}));
if(result.failed.length)process.exitCode=1;
