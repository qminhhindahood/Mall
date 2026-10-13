import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { brotliCompressSync, brotliDecompressSync, gzipSync, gunzipSync, constants } from 'node:zlib';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i+1] : undefined; };
const mall = arg('--mall') ?? process.env.MALL_ID ?? 'saigon-centre';
const inputs = {
  'saigon-centre': { repo:'takashimaya-exterior', stem:'saigon-centre', sha256:'f04fee93c620b698874e67e319d2140cbed60796506f63213c5e57b6aad49050', previewSha256:'72090fe1fc92a5ca318e5ab4915efecc98e6afc95d5f70f86d6b917f4e2a0179' },
  'vincom-dong-khoi': { repo:'vincom-exterior', stem:'vincom-dong-khoi', sha256:'e2853dcf2fdf123ed897eb6f0e0014d12de6dfcf9ba81bc202d1ad8035c50c5e', previewSha256:'7584abb6e0e0ed7d9867f614ecd957ce884711961d81a1504b30ba4815915473' }
};
if (!inputs[mall]) throw new Error(`Unsupported MALL_ID: ${mall}`);
const hash = b => createHash('sha256').update(b).digest('hex');
async function put(path, bytes) { await mkdir(dirname(path), { recursive:true }); await writeFile(path,bytes); }
if (arg('--import')) {
  for (const [id, input] of Object.entries(inputs)) {
    const from = resolve(arg('--import'), 'implementation', input.repo, 'public');
    for (const [source,target] of [[`models/${input.stem}.web.glb`, `assets/${id}/models/exterior.glb`], [`previews/${input.stem}.webp`, `assets/${id}/previews/exterior.webp`]]) {
      const bytes = await readFile(resolve(from,source));
      if (hash(bytes) !== (source.endsWith('.glb') ? input.sha256 : input.previewSha256)) throw new Error(`Polished revision mismatch: ${source}`);
      await put(resolve(root,target),bytes);
    }
    for (const name of await readdir(resolve(from,'fonts'))) await put(resolve(root,'assets/shared/fonts',name), await readFile(resolve(from,'fonts',name)));
  }
}
// public is this script's build staging area, always inside this checked-out repo.
const publicRoot = resolve(root,'public');
if (!publicRoot.startsWith(root + '\\') && !publicRoot.startsWith(root + '/')) throw new Error('Unsafe staging path');
await rm(publicRoot,{recursive:true,force:true});
const input = inputs[mall];
const original = await readFile(resolve(root,`assets/${mall}/models/exterior.glb`));
if (hash(original) !== input.sha256) throw new Error('Exterior identity changed');
const preview = await readFile(resolve(root,`assets/${mall}/previews/exterior.webp`));
if (hash(preview) !== input.previewSha256) throw new Error('Preview identity changed');
const variants = [{ encoding:'identity', suffix:'', bytes:original }, { encoding:'br',suffix:'.br',bytes:brotliCompressSync(original,{params:{[constants.BROTLI_PARAM_QUALITY]:5}}) }, { encoding:'gzip',suffix:'.gz',bytes:gzipSync(original) }];
const manifest = { revision:'photo-polish-2026-10-12-delivery-r2', assetRevision:'photo-polish-2026-10-12-delivery-r2', mallId:mall, exteriorUrl:'/models/exterior.glb.br', identityUrl:'/models/exterior.glb', preferredExteriorUrl:'/models/exterior.glb.br', sha256:input.sha256, bytes:original.length, previewUrl:'/previews/exterior.webp', preview:{sha256:hash(preview),bytes:preview.length}, source:`implementation/${input.repo}/public/models/${input.stem}.web.glb`, compression:[], hostingStatus:'explicit-static _headers prepared; local browser verified separately; production release host unverified' };
for (const variant of variants) {
  const decoded = variant.encoding === 'br' ? brotliDecompressSync(variant.bytes) : variant.encoding === 'gzip' ? gunzipSync(variant.bytes) : variant.bytes;
  if (!decoded.equals(original)) throw new Error(`Roundtrip mismatch: ${variant.encoding}`);
  await put(resolve(publicRoot,'models/exterior.glb'+variant.suffix),variant.bytes);
  manifest.compression.push({encoding:variant.encoding,url:'/models/exterior.glb'+variant.suffix,bytes:variant.bytes.length,sha256:hash(variant.bytes),decodedSha256:hash(decoded),roundtripExact:true,...(variant.encoding === 'br' ? {quality:5} : {})});
}
await put(resolve(publicRoot,'previews/exterior.webp'),preview);
manifest.staticInputs = [];
for (const directory of [`assets/${mall}/maps`,'assets/shared/fonts']) for (const name of await readdir(resolve(root,directory))) {
  const target = directory.endsWith('/maps') ? 'maps' : 'fonts';
  const bytes = await readFile(resolve(root,directory,name));
  await put(resolve(publicRoot,target,name),bytes);
  manifest.staticInputs.push({url:`/${target}/${name}`,bytes:bytes.length,sha256:hash(bytes)});
}
const geometry = await readFile(resolve(root,`data/malls/${mall}/floor-geometry.json`));
manifest.floorGeometry = {revision:JSON.parse(geometry).revision,url:'/data/floor-geometry.json.br',identityUrl:'/data/floor-geometry.json',bytes:geometry.length,sha256:hash(geometry),compression:[]};
for (const [encoding,suffix,bytes] of [['identity','',geometry],['br','.br',brotliCompressSync(geometry,{params:{[constants.BROTLI_PARAM_QUALITY]:5}})],['gzip','.gz',gzipSync(geometry)]]) {
  const decoded=encoding==='br'?brotliDecompressSync(bytes):encoding==='gzip'?gunzipSync(bytes):bytes;
  if (!decoded.equals(geometry)) throw new Error('Geometry transport roundtrip mismatch');
  await put(resolve(publicRoot,'data/floor-geometry.json'+suffix),bytes);
  manifest.floorGeometry.compression.push({encoding,url:'/data/floor-geometry.json'+suffix,bytes:bytes.length,sha256:hash(bytes),decodedSha256:hash(decoded),roundtripExact:true});
}
await put(resolve(root,`data/malls/${mall}/asset-manifest.json`),JSON.stringify(manifest,null,2)+'\n');
await put(resolve(publicRoot,'data/asset-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
// Explicit representations on a pure-static host. Not automatic negotiation.
await put(resolve(publicRoot,'_headers'),`/models/exterior.glb\n  Content-Type: model/gltf-binary\n  Cache-Control: public, max-age=0, must-revalidate\n/models/exterior.glb.br\n  Content-Type: model/gltf-binary\n  Content-Encoding: br\n  Cache-Control: public, max-age=0, must-revalidate\n/models/exterior.glb.gz\n  Content-Type: model/gltf-binary\n  Content-Encoding: gzip\n  Cache-Control: public, max-age=0, must-revalidate\n`);
const headersPath=resolve(publicRoot,'_headers');
await put(headersPath,(await readFile(headersPath,'utf8'))+`/data/floor-geometry.json.br\n  Content-Type: application/json\n  Content-Encoding: br\n  Cache-Control: public, max-age=0, must-revalidate\n/data/floor-geometry.json.gz\n  Content-Type: application/json\n  Content-Encoding: gzip\n  Cache-Control: public, max-age=0, must-revalidate\n`);
console.log(JSON.stringify({mall,sha256:manifest.sha256,variants:manifest.compression}));
