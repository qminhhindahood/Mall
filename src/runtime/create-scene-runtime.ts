import { createElement, useLayoutEffect } from 'react';
import { createRoot, useFrame, type RootStore } from '@react-three/fiber';
import { AmbientLight, Box3, BufferAttribute, BufferGeometry, Color, DirectionalLight, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, Scene, ShapeUtils, Texture, Vector2, Vector3, WebGLRenderTarget, WebGLRenderer, SRGBColorSpace } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { FloorGeometry, SceneRequest, SceneRuntime, SceneRuntimeOptions } from './scene-contract';

type View = { scene: Scene; camera: PerspectiveCamera; group: Group };
type Task = { request: SceneRequest; priority: number; resolve(): void; reject(error: unknown): void };

// Retain every contour point. Indexed geometry buffers are shared across views.
function floorBuffer(floor: FloorGeometry): BufferGeometry {
  const positions: number[] = [], indices: number[] = [];
  for (const region of floor.regions) {
    const rings = [region.outer, ...region.holes];
    const vectors = rings.map(ring => ring.map(([x,z]) => new Vector2(x,z)));
    const points = rings.flat(), start = positions.length / 3, count = points.length;
    for (const y of [0, .65]) for (const [x,z] of points) positions.push(x,y,z);
    for (const [a,b,c] of ShapeUtils.triangulateShape(vectors[0],vectors.slice(1))) indices.push(start+a,start+b,start+c,start+count+c,start+count+b,start+count+a);
    let offset = 0;
    for (const ring of rings) {
      for (let i=0;i<ring.length;i++) {const a=start+offset+i,b=start+offset+(i+1)%ring.length;indices.push(a,b,b+count,a,b+count,a+count);}
      offset += ring.length;
    }
  }
  const result = new BufferGeometry();
  result.setAttribute('position', new BufferAttribute(new Float32Array(positions),3));
  result.setIndex(indices); result.computeVertexNormals(); result.computeBoundingBox();
  result.userData = { floorId:floor.id, sourcePointCount:floor.regions.reduce((n,r)=>n+r.outer.length+r.holes.reduce((m,h)=>m+h.length,0),0) };
  return result;
}

export async function createSceneRuntime(options: SceneRuntimeOptions): Promise<SceneRuntime> {
  const { canvas, data } = options;
  let disposed=false, failed: Error|null=null, active=!document.hidden, paused=options.reducedMotion, raf=0, last=0, serial=0;
  let rejectLife!: (reason: Error)=>void;
  const lifecycle = new Promise<never>((_,reject)=>{rejectLife=reject;});
  void lifecycle.catch(()=>{});
  const alive = () => { if(disposed || failed) throw failed ?? new Error('Scene disposed'); };
  const race = <T,>(value: Promise<T>) => Promise.race([value,lifecycle]);
  const key = (request: SceneRequest) => `${options.mallId}:${options.assetRevision}:${data.revision}:${request.kind}:${request.kind==='exterior'||request.kind==='overview'?'all':request.floorId}`;
  const status = (request:SceneRequest,phase:'fetching'|'decoding'|'preparing'|'ready'|'failed',error?:string) => options.onStatus({key:key(request),phase,error});
  const mark = (name:string) => performance.mark(`mall-3d:${name}`);
  const views=new Map<string,View>(), prepared=new Map<string,Promise<void>>(), buffers=new Map<string,BufferGeometry>();
  const geometries=new Set<BufferGeometry>(), materials=new Set<MeshStandardMaterial>(), textures=new Set<Texture>();
  const tasks:Task[]=[];
  let working=false, current:View|null=null, job:{view:View;target:WebGLRenderTarget|null}|null=null;
  let gpuTail=Promise.resolve(), gpuBusy=false;
  const gpu = <T,>(action:()=>Promise<T>) => {
    const result=gpuTail.then(async()=>{alive();gpuBusy=true;try{return await action();}finally{gpuBusy=false;}});
    gpuTail=result.then(()=>{},()=>{});return race(result);
  };
  let store:RootStore, renderer:WebGLRenderer, target:WebGLRenderTarget, environment:Texture, envTarget:WebGLRenderTarget|undefined;
  const root=createRoot(canvas);
  const width = () => Math.max(1,canvas.parentElement?.clientWidth ?? 900);
  const height = () => Math.max(1,canvas.parentElement?.clientHeight ?? 450);
  const lost = () => {
    if(disposed || failed) return;
    failed=new Error('WebGL context lost'); serial++; cancelAnimationFrame(raf);
    prepared.clear(); rejectLife(failed);
    for(const task of tasks.splice(0)) task.reject(failed);
    options.onStatus({key:'context',phase:'failed',error:failed.message});
  };
  canvas.addEventListener('webglcontextlost',lost);
  function Driver({ committed }: {committed():void}) {
    useLayoutEffect(committed,[]);
    useFrame(({gl})=>{if(job){gl.setRenderTarget(job.target);gl.render(job.view.scene,job.view.camera);gl.setRenderTarget(null);}},1);
    return null;
  }
  let resize:ResizeObserver|undefined;
  const cleanup = () => {
    if(disposed) return;
    disposed=true; serial++; cancelAnimationFrame(raf); rejectLife(new Error('Scene disposed'));
    canvas.removeEventListener('webglcontextlost',lost); resize?.disconnect();
    for(const task of tasks.splice(0)) task.reject(new Error('Scene disposed'));
    root.unmount();
    for(const geometry of geometries) geometry.dispose();
    for(const material of materials) material.dispose();
    for(const texture of textures) {texture.dispose();const image=texture.image;if(image instanceof ImageBitmap) image.close();}
    target?.dispose(); envTarget?.dispose(); renderer?.dispose();
    views.clear(); buffers.clear(); prepared.clear();
  };
  try {
    await root.configure({gl:{antialias:true,alpha:false,powerPreference:'high-performance'},frameloop:'never',dpr:Math.min(devicePixelRatio,2),size:{width:width(),height:height(),top:0,left:0}});
    let commit!:()=>void;
    const committed=new Promise<void>(resolve=>{commit=resolve;});
    store=root.render(createElement(Driver,{committed:()=>{commit();}}));
    await race(committed); renderer=store.getState().gl;
    if(renderer.getContext().isContextLost()) throw new Error('WebGL unavailable');
    const generator=new PMREMGenerator(renderer), room=new RoomEnvironment();
    envTarget=generator.fromScene(room,.04); environment=envTarget.texture;
    room.dispose(); generator.dispose();
    target=new WebGLRenderTarget(width(),height()); target.texture.colorSpace=SRGBColorSpace;
    const floorMaterial=new MeshStandardMaterial({color:0x88b4a4,roughness:.72,metalness:0,flatShading:true,side:2}); materials.add(floorMaterial);
    const ensureSize=(view:View) => {const w=width(),h=height();renderer.setSize(w,h,false);view.camera.aspect=w/h;view.camera.updateProjectionMatrix();target.setSize(Math.round(w*renderer.getPixelRatio()),Math.round(h*renderer.getPixelRatio()));};
    const draw=(view:View,offscreen:boolean) => {
      alive(); ensureSize(view); job={view,target:offscreen?target:null};
      const before=renderer.info.render.frame;
      try {store.getState().advance(performance.now()/1000,false); if(renderer.info.render.frame<=before || renderer.getContext().isContextLost()) throw new Error('Complete frame unavailable');}
      finally {job=null;renderer.setRenderTarget(null);}
    };
    const fit=(scene:Scene,group:Group):View => {
      const bounds=new Box3().setFromObject(group),center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
      if(bounds.isEmpty()) throw new Error('Empty scene');
      const camera=new PerspectiveCamera(38,width()/height(),.1,3000);
      const radius=Math.max(size.x,size.y,size.z),distance=radius*1.8/Math.min(1,camera.aspect);
      camera.position.copy(center).add(new Vector3(distance*.72,distance*.65,distance)); camera.lookAt(center);
      scene.add(group,new AmbientLight(0xffffff,.7));
      const light=new DirectionalLight(0xffffff,2.6); light.position.set(40,100,70); scene.add(light); scene.environment=environment; scene.background=new Color(0xe5ebe7);
      return {scene,camera,group};
    };
    const bytes=options.modelBytes ?? fetch(options.exteriorUrl).then(response=>{if(!response.ok)throw new Error('Model unavailable');return response.arrayBuffer();});
    void bytes.catch(()=>{});
    let exteriorPromise:Promise<Group>|undefined;
    const exterior=() => exteriorPromise ??= (async()=>{
      mark('model-decode-start'); const model=await new GLTFLoader().parseAsync(await race(bytes),'');
      model.scene.traverse(object=>{if(object instanceof Mesh){geometries.add(object.geometry);const list=Array.isArray(object.material)?object.material:[object.material];for(const material of list){materials.add(material as MeshStandardMaterial);for(const value of Object.values(material))if(value instanceof Texture)textures.add(value);}}});
      if(disposed||failed){for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();for(const texture of textures){texture.dispose();if(texture.image instanceof ImageBitmap)texture.image.close();}alive();}
      mark('model-decode-end'); return model.scene;
    })();
    const floorGeometry=async(floor:FloorGeometry) => {
      let geometry=buffers.get(floor.id);
      if(!geometry){await race(new Promise<void>(resolve=>setTimeout(resolve,0)));alive();geometry=floorBuffer(floor);buffers.set(floor.id,geometry);geometries.add(geometry);}
      return geometry;
    };
    const build=async(request:SceneRequest):Promise<View> => {
      const cached=views.get(key(request));if(cached)return cached;
      status(request,'decoding');const group=new Group();
      if(request.kind==='exterior')group.add(await race(exterior()));
      else {
        const floors=request.kind==='overview'?data.floors:data.floors.filter(floor=>floor.id===request.floorId);
        if(!floors.length)throw new Error('Unknown floor');
        for(const floor of floors){const mesh=new Mesh(await floorGeometry(floor),floorMaterial);mesh.position.y=request.kind==='overview'?floor.elevation:0;group.add(mesh);}
      }
      alive();const view=fit(new Scene(),group);views.set(key(request),view);return view;
    };
    async function drain() {
      if(working)return;working=true;
      try {while(tasks.length && !disposed && !failed){tasks.sort((a,b)=>b.priority-a.priority);const task=tasks.shift()!;
        try {const view=await build(task.request);status(task.request,'preparing');await gpu(async()=>{ensureSize(view);
          for(const texture of textures)renderer.initTexture(texture); renderer.initTexture(environment);
          await race(renderer.compileAsync(view.scene,view.camera));alive();draw(view,true);
          await race(renderer.readRenderTargetPixelsAsync(target,0,0,1,1,new Uint8Array(4)));alive();});
          status(task.request,'ready');mark(`prepared:${key(task.request)}`);task.resolve();
        }catch(error){prepared.delete(key(task.request));status(task.request,'failed',String(error));task.reject(error);}
        await new Promise(resolve=>setTimeout(resolve,0));
      }}finally{working=false;}
    }
    const prepare=(request:SceneRequest,priority=0) => {
      alive();const existing=prepared.get(key(request));if(existing){const task=tasks.find(task=>key(task.request)===key(request));if(task)task.priority=Math.max(priority,task.priority);return existing;}
      status(request,'fetching');const promise=new Promise<void>((resolve,reject)=>{tasks.push({request,priority,resolve,reject});});prepared.set(key(request),promise);void promise.catch(()=>{});void drain();return race(promise);
    };
    const animate=(time:number) => {
      raf=0;if(disposed || failed || !active || paused || !current)return;
      const delta=Math.min(.04,Math.max(0,(time-last)/1000));last=time;
      if(current!==views.get(key({kind:'exterior',floorId:''})))return;
      current.group.rotation.y+=delta*.08;
      if(!gpuBusy)draw(current,false);raf=requestAnimationFrame(animate);
    };
    const refreshAnimation=()=>{cancelAnimationFrame(raf);raf=0;last=performance.now();if(active&&!paused&&current&&!disposed&&!failed)raf=requestAnimationFrame(animate);};
    resize=new ResizeObserver(()=>{if(current&&!disposed&&!failed&&!gpuBusy)draw(current,false);});resize.observe(canvas.parentElement!);
    let backgroundStarted=false;
    return {
      prepare: request=>prepare(request,1),
      async show(request) {
        const id=++serial;await prepare(request,3);alive();if(id!==serial)return;
        const view=views.get(key(request))!;
        await gpu(async()=>{
          if(id!==serial)return;
          const host=options.sceneHosts?.[request.kind];
          host?.append(canvas);if(host)resize?.observe(host);
          ensureSize(view);await race(renderer.compileAsync(view.scene,view.camera));alive();if(id!==serial)return;
          draw(view,false);alive();if(id!==serial)return;
          current=view;canvas.dataset.sceneKey=key(request);canvas.dataset.completeFrame=String(renderer.info.render.frame);
        });if(id!==serial)return;
        mark(`shown:${key(request)}`);refreshAnimation();
        if(!backgroundStarted){backgroundStarted=true;setTimeout(()=>{if(disposed||failed)return;for(const floor of data.floors)for(const kind of ['map','discovery'] as const)void prepare({kind,floorId:floor.id}).catch(()=>{});},0);}
      },
      setActive(value){active=value;refreshAnimation();},
      setPaused(value){paused=value;refreshAnimation();},
      dispose:cleanup,
    };
  } catch(error) {cleanup();throw error;}
}
