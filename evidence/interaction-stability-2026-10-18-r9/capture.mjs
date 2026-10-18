import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const receipt={at:new Date().toISOString(),baseline:"ad9723c",head:git('rev-parse','HEAD'),sourceFiles:{},builds:JSON.parse(await readFile('evidence/interaction-stability-2026-10-18-r9/builds.json')),outputs:{}};
for(const path of ['src/components/Discovery.tsx','src/components/Explorer.tsx','src/components/FloorMap.tsx','src/styles/discovery.css'])receipt.sourceFiles[path]=hash(await readFile(path));
for(const mode of ['','fixtures/','research/'])for(const mall of ['saigon-centre','vincom-dong-khoi']){
 const root=`dist/${mode}${mall}`;const files={};
 for(const path of ['en/index.html','vi/index.html','data/asset-manifest.json','data/floor-geometry.json'])files[path]=hash(await readFile(`${root}/${path}`));
 for(const name of await readdir(`${root}/_astro`))if(/\.(js|css)$/.test(name))files[`_astro/${name}`]=hash(await readFile(`${root}/_astro/${name}`));
 receipt.outputs[root]=files;
}
await writeFile('evidence/interaction-stability-2026-10-18-r9/provenance.json',JSON.stringify(receipt,null,2)+'\n');
