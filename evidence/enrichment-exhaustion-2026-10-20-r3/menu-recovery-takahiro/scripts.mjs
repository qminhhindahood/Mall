import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const dir=new URL('./',import.meta.url);const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const context=await b.newContext();const out=[];
for(const f of (await fs.readdir(dir)).filter(x=>x.endsWith('.json')&&!x.includes('-data'))){
 const a=JSON.parse(await fs.readFile(new URL(f,dir),'utf8'));if(!a.scripts)continue;const brand=f.replace('.json','');const hits=[];
 for(const [i,s] of a.scripts.filter(x=>x.src.includes('/_nuxt/')).entries()){
  try{const r=await context.request.get(s.src,{timeout:20000});const t=await r.text();await fs.writeFile(new URL(`${brand}-script-${i}.js`,dir),t);const m=[...t.matchAll(/.{0,150}(?:menu|\/api\/|baseURL|thuc-don).{0,200}/gi)].map(x=>x[0]);hits.push({url:s.src,status:r.status(),matches:m});}catch(e){hits.push({url:s.src,error:String(e)})}
 }
 out.push({brand,hits});console.log(brand,hits.flatMap(x=>x.matches||[]).filter(x=>/menu|baseURL|\/api\//i.test(x)).slice(0,15));await fs.writeFile(new URL('script-inspection.json',dir),JSON.stringify(out,null,2));
}
await b.close();
