// Public browser/network seam only. Evaluate in T3 preview on the selected build.
(async () => {
  const manifest = await (await fetch('/data/asset-manifest.json', {cache:'no-store'})).json();
  const expected = {
    'saigon-centre': {sha256:'f04fee93c620b698874e67e319d2140cbed60796506f63213c5e57b6aad49050',bytes:2000796,floors:['B2','B1','L1','L2','L3','L4','L5','L6']},
    'vincom-dong-khoi': {sha256:'e2853dcf2fdf123ed897eb6f0e0014d12de6dfcf9ba81bc202d1ad8035c50c5e',bytes:4797176,floors:['B3','B2','B1','L1','M','L2','L3']}
  }[manifest.mallId];
  const digest = async b => [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))].map(n=>n.toString(16).padStart(2,'0')).join('');
  const rows = [];
  for (const url of ['/models/exterior.glb','/models/exterior.glb.br','/models/exterior.glb.gz','/models/exterior.glb?identity']) {
    const r=await fetch(url,{cache:'no-store'}), bytes=await r.arrayBuffer(), sha256=await digest(bytes);
    rows.push({url,status:r.status,encoding:r.headers.get('content-encoding'),encodedLength:r.headers.get('content-length'),decodedLength:bytes.byteLength,sha256,mime:r.headers.get('content-type'),pass:r.ok&&sha256===expected.sha256&&bytes.byteLength===expected.bytes&&r.headers.get('content-type')==='model/gltf-binary'});
  }
  let geometry;
  const geometries=[];
  for (const suffix of ['', '.br','.gz','?identity']) {
    const url='/data/floor-geometry.json'+suffix, r=await fetch(url,{cache:'no-store'}), bytes=await r.arrayBuffer();
    const data=JSON.parse(new TextDecoder().decode(bytes)); geometry=data;
    geometries.push({url,status:r.status,encoding:r.headers.get('content-encoding'),mime:r.headers.get('content-type'),encodedLength:r.headers.get('content-length'),decodedLength:bytes.byteLength,sha256:await digest(bytes),floorIds:data.floors.map(f=>f.id),pass:r.ok&&r.headers.get('content-type')==='application/json'&&JSON.stringify(data.floors.map(f=>f.id))===JSON.stringify(expected.floors)&&data.floors.every(f=>f.regions.length>0&&f.sources[0].sha256.length===64)});
  }
  const previews=[];
  for (const floor of geometry.floors) {
    const r=await fetch(floor.preview.path,{cache:'no-store'}),bytes=await r.arrayBuffer(),sha256=await digest(bytes);
    previews.push({floor:floor.id,status:r.status,sha256,pass:r.ok&&sha256===floor.sources[0].sha256});
  }
  const pass=rows.every(r=>r.pass)&&geometries.every(r=>r.pass&&r.sha256===geometries[0].sha256)&&previews.every(r=>r.pass);
  return {mall:manifest.mallId,pass,browser:navigator.userAgent,viewport:[innerWidth,innerHeight],conditions:'localhost HTTP, no-store requests; public browser decoding; no throttling; no readiness benchmark',models:rows,geometry:geometries,previews};
})()
