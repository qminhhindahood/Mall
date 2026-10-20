import fs from 'node:fs/promises';
import vm from 'node:vm';
const dir=new URL('./',import.meta.url);
for(const f of (await fs.readdir(dir)).filter(x=>x.endsWith('.json')&&!x.includes('-data'))){
 const a=JSON.parse(await fs.readFile(new URL(f,dir),'utf8'));if(!a.scripts)continue;
 const script=a.scripts.find(x=>x.text.startsWith('window.__NUXT__='));if(!script)continue;
 const ctx={window:{}};vm.runInNewContext(script.text,ctx,{timeout:1000});
 await fs.writeFile(new URL(f.replace('.json','-data.json'),dir),JSON.stringify(ctx.window.__NUXT__,null,2));
 console.log(f,Object.keys(ctx.window.__NUXT__),JSON.stringify(ctx.window.__NUXT__).slice(-1600));
}
