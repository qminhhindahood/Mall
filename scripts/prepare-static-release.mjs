import {readFile,writeFile,readdir,stat,copyFile} from 'node:fs/promises';
import {join} from 'node:path';
const mall=process.env.MALL_ID??'saigon-centre';
if(!['saigon-centre','vincom-dong-khoi'].includes(mall))throw new Error('Unknown mall');
const fixture=process.env.INCLUDE_TEST_FIXTURES==='1';
const root=`dist/${fixture?'fixtures/':''}${mall}`;
const files=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())await walk(path);else files.push({path,bytes:(await stat(path)).size});}}
await walk(root);
if(files.some(f=>f.bytes>25*1024*1024))throw new Error('Cloudflare per-asset 25 MiB limit exceeded');
if(files.length>20000)throw new Error('Cloudflare free-plan 20,000 assets limit exceeded');
if(!fixture&&files.filter(f=>f.path.endsWith('.html')).some(f=>f.path.includes('test-store')))throw new Error('Fixture route in public output');
for(const locale of ['vi','en'])await copyFile(`${root}/${locale}/404/index.html`,`${root}/${locale}/404.html`);
await writeFile(`${root}/_redirects`,'/ /vi 302\n');
await writeFile(`${root}/_headers`, `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/models/*.br
  Content-Encoding: br
  Content-Type: model/gltf-binary
/models/*.gz
  Content-Encoding: gzip
  Content-Type: model/gltf-binary
/data/*.br
  Content-Encoding: br
  Content-Type: application/json
/data/*.gz
  Content-Encoding: gzip
  Content-Type: application/json
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`);
const origin=process.env.SITE_ORIGIN;
if(origin){const url=new URL(origin);if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw new Error('SITE_ORIGIN must be the approved HTTPS origin');const routes=files.filter(f=>f.path.endsWith('index.html')&&!f.path.includes('404')).map(f=>f.path.replaceAll('\\','/').slice(root.length).replace(/\/index.html$/,''));await writeFile(`${root}/sitemap.xml`,'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(route=>`<url><loc>${new URL(route||'/',origin).href}</loc></url>`).join('')+'</urlset>');await writeFile(`${root}/robots.txt`,`User-agent: *\nAllow: /\nSitemap: ${origin.replace(/\/$/,'')}/sitemap.xml\n`);}
const directory=JSON.parse(await readFile(`data/malls/${mall}/directory.json`,'utf8'));
const result={mall,fixture,assetCount:files.length,largestAsset:files.reduce((a,b)=>a.bytes>b.bytes?a:b),directoryApproval:fixture?'fixture':directory.approval,siteOrigin:origin??null,releaseApproved:false};
await writeFile(`${root}/release-manifest.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
