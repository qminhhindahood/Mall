import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)),'..');
const arg = name => {const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:undefined;};
const mall = arg('--mall') ?? process.env.MALL_ID ?? 'saigon-centre';
if (!['saigon-centre','vincom-dong-khoi'].includes(mall)) throw new Error('Unsupported mall');
const directory = resolve(root,arg('--dir') ?? `dist/${mall}`);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.glb':'model/gltf-binary','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.txt':'text/plain'};
function encoding(header) {
  const choices = (header ?? '').split(',').map(s=>{const [name,...params]=s.trim().split(';');const q=params.find(p=>p.trim().startsWith('q='));return {name:name.toLowerCase(),q:q?Number(q.trim().slice(2)):1};});
  const quality = name => choices.find(c=>c.name===name)?.q ?? choices.find(c=>c.name==='*')?.q ?? 0;
  return ['br','gzip'].filter(e=>quality(e)>0).sort((a,b)=>quality(b)-quality(a))[0];
}
createServer(async (req,res)=>{
  try {
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
    const url = new URL(req.url,'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname==='/' || pathname.endsWith('/') && pathname!=='/') {res.writeHead(302,{Location:pathname==='/'?'/vi':pathname.slice(0,-1)});res.end();return;}
    let filename = resolve(directory,'.'+pathname);
    if (!filename.startsWith(directory+sep)) {res.writeHead(403);res.end();return;}
    let status = 200;
    let exists = await stat(filename).catch(()=>null);
    if (exists?.isDirectory()) filename = resolve(filename,'index.html');
    else if (!exists && !extname(filename)) filename += '.html';
    if (!await stat(filename).catch(()=>null)) {
      status = 404;
      const locale = pathname.startsWith('/en') ? 'en' : 'vi';
      filename = resolve(directory,locale,'404.html');
      if (!await stat(filename).catch(()=>null)) filename = resolve(directory,locale,'404','index.html');
      if (!await stat(filename).catch(()=>null)) filename = resolve(directory,'404.html');
      if (!await stat(filename).catch(()=>null)) {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');return;}
    }
    let contentEncoding;
    if (filename.endsWith('.br')) contentEncoding='br';
    else if (filename.endsWith('.gz')) contentEncoding='gzip';
    else if (['.glb','.json'].includes(extname(filename)) && !req.headers.range && !url.searchParams.has('identity')) {
      contentEncoding = encoding(req.headers['accept-encoding']);
      const candidate = filename + (contentEncoding==='br'?'.br':'.gz');
      if (contentEncoding && await stat(candidate).catch(()=>null)) filename=candidate; else contentEncoding=undefined;
    }
    const bytes = await readFile(filename);
    const originalName=contentEncoding?filename.replace(/\.(br|gz)$/,''):filename;
    const headers = {'Content-Type':mime[extname(originalName)]??'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'public, max-age=0, must-revalidate','ETag':'"'+createHash('sha256').update(bytes).digest('hex')+'"'};
    if (['.glb','.json'].includes(extname(originalName))) headers.Vary='Accept-Encoding';
    if (contentEncoding) headers['Content-Encoding']=contentEncoding;
    if (req.headers['if-none-match']===headers.ETag) {res.writeHead(304,headers);res.end();return;}
    res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:bytes);
  } catch (error) {res.writeHead(500,{'Content-Type':'text/plain'});res.end('Static serving failure');console.error(error.message);}
}).listen(Number(arg('--port')??4210),'127.0.0.1',()=>console.log(`Serving ${mall} at http://localhost:${arg('--port')??4210} from ${directory}`));
