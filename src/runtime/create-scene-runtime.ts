import { createElement, useLayoutEffect } from 'react';
import { createRoot, useFrame, type RootStore } from '@react-three/fiber';
import { AmbientLight, Box3, BufferAttribute, BufferGeometry, Color, DirectionalLight, Group, LoadingManager, Mesh, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, Scene, ShapeUtils, Texture, Vector2, Vector3, WebGLRenderTarget, WebGLRenderer, SRGBColorSpace } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { FloorGeometry, SceneRequest, SceneRuntime, SceneRuntimeOptions } from './scene-contract';
import { timing } from './loading-timing';
import { mallMotion } from './mall-motion';

type View = { scene: Scene; camera: PerspectiveCamera; group: Group; exteriorFit?: {center:Vector3;radius:number} };
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
  const motion = mallMotion[options.mallId];
  const detail = { mallId: options.mallId, assetRevision: options.assetRevision, geometryRevision: data.revision };
  const setupDone = timing('renderer-setup', detail);
  let disposed=false, failed: Error|null=null, active=!document.hidden, paused=options.reducedMotion, raf=0, last=0, serial=0, journeyProgress=0, approachRotation=0;
  const arrivalDuration=5500;
  let arrivalElapsed=0, automaticStopped=options.reducedMotion, manualLook=0, manualZoom=1;
  const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
  const stopAutomaticPresentation=()=>{
    if(!automaticStopped)manualZoom*=1+.08*Math.pow(1-clamp(arrivalElapsed/arrivalDuration,0,1),2);
    automaticStopped=true;cancelAnimationFrame(raf);raf=0;
    canvas.dataset.arrival='stopped';
  };
  // Capture intent before a link, scrolling gesture or control handles it. This
  // never prevents native scrolling, focus, links or practical map interaction.
  const userInput=()=>{if(current?.exteriorFit)stopAutomaticPresentation();};
  window.addEventListener('pointerdown',userInput,{capture:true,passive:true});
  window.addEventListener('wheel',userInput,{capture:true,passive:true});
  window.addEventListener('keydown',userInput,true);
  let rejectLife!: (reason: Error)=>void;
  const lifecycle = new Promise<never>((_,reject)=>{rejectLife=reject;});
  void lifecycle.catch(()=>{});
  const alive = () => { if(disposed || failed) throw failed ?? new Error('Scene disposed'); };
  const race = <T,>(value: Promise<T>) => Promise.race([value,lifecycle]);
  const key = (request: SceneRequest) => `${options.mallId}:${options.assetRevision}:${data.revision}:${request.kind}:${request.kind==='exterior'||request.kind==='overview'?'all':request.floorId}`;
  const status = (request:SceneRequest,phase:'fetching'|'decoding'|'preparing'|'ready'|'failed',error?:string) => options.onStatus({key:key(request),phase,error});
  const mark = (name:string) => performance.mark(`mall-3d:${name}`);
  const views=new Map<string,View>(), prepared=new Map<string,Promise<void>>(), buffers=new Map<string,BufferGeometry>();
  const complete=new Set<string>();
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
  const failVisible = (error: unknown, source: 'context'|'runtime') => {
    if(disposed || failed) return;
    failed=error instanceof Error ? error : new Error(String(error)); serial++; cancelAnimationFrame(raf);
    prepared.clear(); complete.clear(); rejectLife(failed);
    for(const task of tasks.splice(0)) task.reject(failed);
    options.onStatus({key:source,phase:'failed',error:failed.message});
  };
  const lost = () => failVisible(new Error('WebGL context lost'),'context');
  canvas.addEventListener('webglcontextlost',lost);
  function Driver({ committed }: {committed():void}) {
    useLayoutEffect(committed,[]);
    useFrame(({gl})=>{if(job){gl.setRenderTarget(job.target);gl.render(job.view.scene,job.view.camera);gl.setRenderTarget(null);}},1);
    return null;
  }
  let resize:ResizeObserver|undefined;
  const disposeOwned = () => {
    for(const geometry of geometries) geometry.dispose();
    for(const material of materials) material.dispose();
    for(const texture of textures) {texture.dispose();const image=texture.image;if(image instanceof ImageBitmap) image.close();}
    geometries.clear(); materials.clear(); textures.clear();
  };
  const cleanup = () => {
    if(disposed) return;
    disposed=true; serial++; cancelAnimationFrame(raf); rejectLife(new Error('Scene disposed'));
    canvas.removeEventListener('webglcontextlost',lost); resize?.disconnect();
    window.removeEventListener('pointerdown',userInput,true);
    window.removeEventListener('wheel',userInput,true);
    window.removeEventListener('keydown',userInput,true);
    for(const task of tasks.splice(0)) task.reject(new Error('Scene disposed'));
    root.unmount();
    const counts={geometries:geometries.size,materials:materials.size,textures:textures.size};
    disposeOwned();
    target?.dispose(); envTarget?.dispose(); renderer?.dispose();
    views.clear(); buffers.clear(); prepared.clear(); complete.clear();
    performance.mark('mall-3d:disposed', { detail: { ...detail, ...counts } });
  };
  try {
    await root.configure({gl:{antialias:true,alpha:false,powerPreference:'high-performance'},frameloop:'never',dpr:Math.min(devicePixelRatio,2),size:{width:width(),height:height(),top:0,left:0}});
    let commit!:()=>void;
    const committed=new Promise<void>(resolve=>{commit=resolve;});
    store=root.render(createElement(Driver,{committed:()=>{commit();}}));
    await race(committed); renderer=store.getState().gl;
    if(renderer.getContext().isContextLost()) throw new Error('WebGL unavailable');
    const generator=new PMREMGenerator(renderer), room=new RoomEnvironment();
    try {envTarget=generator.fromScene(room,.04); environment=envTarget.texture;}
    finally {room.dispose(); generator.dispose();}
    target=new WebGLRenderTarget(width(),height()); target.texture.colorSpace=SRGBColorSpace;
    const floorMaterial=new MeshStandardMaterial({color:0xe7d8c5,roughness:.72,metalness:0,flatShading:true,side:2}); materials.add(floorMaterial);
    let renderWidth=0,renderHeight=0;
    const ensureSize=(view:View) => {const w=width(),h=height();
      // Assigning canvas width/height clears and reallocates the drawing buffer,
      // even at the same size. Resize only when its actual host changes size.
      if(w!==renderWidth||h!==renderHeight){renderer.setSize(w,h,false);renderWidth=w;renderHeight=h;}
      view.camera.aspect=w/h;
      if(view.exteriorFit){
        const {center,radius}=view.exteriorFit;
        const halfAngle=Math.atan(Math.tan(view.camera.fov*Math.PI/360)*Math.min(1,w/h));
        const distance=radius/Math.sin(halfAngle)*1.08;
        // Approach the estimated shopping podium in the exterior's own frame.
        // The same camera stays in the incumbent front three-quarter quadrant.
        const shoppingCenter=center.clone().add(new Vector3(...motion.shoppingFocus).multiplyScalar(radius));
        const approach=Math.min(1,journeyProgress/motion.focusBy);
        const focus=center.clone().lerp(shoppingCenter,approach*approach*(3-2*approach));
        const bearing=new Vector3(.72,.28,1).lerp(new Vector3(...motion.bearing),approach*approach*(3-2*approach));
        // Zoom continues through the shared tower/copy fade. Reversal evaluates
        // this same path directly, with no tween, hold or second scene clock.
        const manualWeight=1-approach*approach*(3-2*approach);
        bearing.y+=manualLook*manualWeight;
        const arrival=clamp(arrivalElapsed/arrivalDuration,0,1);
        const settle=automaticStopped?1:1+.08*(1-arrival)*(1-arrival);
        const zoom=1+(manualZoom-1)*manualWeight;
        view.camera.position.copy(focus).add(bearing.normalize().multiplyScalar(distance*Math.exp(-motion.zoomRate*journeyProgress)*zoom*(1+(settle-1)*manualWeight)));
        view.camera.lookAt(focus);
      }
      view.camera.updateProjectionMatrix();target.setSize(Math.round(w*renderer.getPixelRatio()),Math.round(h*renderer.getPixelRatio()));};
    const draw=(view:View,offscreen:boolean) => {
      alive(); ensureSize(view); job={view,target:offscreen?target:null};
      const before=renderer.info.render.frame;
      try {store.getState().advance(performance.now()/1000,false); if(renderer.info.render.frame<=before || renderer.getContext().isContextLost()) throw new Error('Complete frame unavailable');canvas.dataset.renderedFrames=String(renderer.info.render.frame);}
      finally {job=null;renderer.setRenderTarget(null);}
    };
    const fit=(scene:Scene,group:Group,isExterior=false):View => {
      const bounds=new Box3().setFromObject(group),center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
      if(bounds.isEmpty()) throw new Error('Empty scene');
      const camera=new PerspectiveCamera(38,width()/height(),.1,3000);
      if(isExterior&&!automaticStopped&&arrivalElapsed===0)group.rotation.y=-.24;
      const radius=Math.max(size.x,size.y,size.z),distance=radius*1.8/Math.min(1,camera.aspect);
      camera.position.copy(center).add(new Vector3(distance*.72,distance*.65,distance)); camera.lookAt(center);
      scene.add(group,new AmbientLight(0xffffff,.7));
      const light=new DirectionalLight(0xffffff,2.6); light.position.set(40,100,70); scene.add(light); scene.environment=environment; scene.background=new Color(options.mallId==='saigon-centre'?0xfff9f1:0xfffbf3);
      return {scene,camera,group,...(isExterior?{exteriorFit:{center,radius:size.length()/2}}:{})};
    };
    const bytes=options.modelBytes ?? fetch(options.exteriorUrl).then(response=>{if(!response.ok)throw new Error('Model unavailable');return response.arrayBuffer();});
    void bytes.catch(()=>{});
    let exteriorPromise:Promise<Group>|undefined;
    const exterior=() => exteriorPromise ??= (async()=>{
      const input = await race(bytes);
      const decoded = timing('model-decode', detail);
      mark('model-decode-start');
      let model;
      const manager=new LoadingManager();
      let resourceFailed=false;
      manager.onError=()=>{resourceFailed=true;};
      try { model=await new GLTFLoader(manager).parseAsync(input,''); }
      catch (error) { decoded('failed'); throw error; }
      model.scene.traverse(object=>{if(object instanceof Mesh){geometries.add(object.geometry);const list=Array.isArray(object.material)?object.material:[object.material];for(const material of list){materials.add(material as MeshStandardMaterial);for(const value of Object.values(material))if(value instanceof Texture)textures.add(value);}}});
      if(disposed||failed){decoded('cancelled');disposeOwned();alive();}
      if(resourceFailed){decoded('failed');throw new Error('Model texture resource unavailable');}
      decoded();
      mark('model-decode-end'); return model.scene;
    })();
    const floorGeometry=async(floor:FloorGeometry) => {
      let geometry=buffers.get(floor.id);
      if(!geometry){await race(new Promise<void>(resolve=>setTimeout(resolve,0)));alive();const done=timing('floor-geometry',{...detail,floorId:floor.id});try{geometry=floorBuffer(floor);done();}catch(error){done('failed');throw error;}buffers.set(floor.id,geometry);geometries.add(geometry);}
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
      alive();const view=fit(new Scene(),group,request.kind==='exterior');views.set(key(request),view);return view;
    };
    async function drain() {
      if(working)return;working=true;
      try {while(tasks.length && !disposed && !failed){tasks.sort((a,b)=>b.priority-a.priority);const task=tasks.shift()!;
        const done=timing('scene-prepare',{...detail,...task.request});
        try {const view=await build(task.request);status(task.request,'preparing');await gpu(async()=>{ensureSize(view);
          const gpuDone=timing('gpu-prepare',{...detail,...task.request});
          try {
          for(const texture of textures)renderer.initTexture(texture); renderer.initTexture(environment);
          await race(renderer.compileAsync(view.scene,view.camera));alive();draw(view,true);
          await race(renderer.readRenderTargetPixelsAsync(target,0,0,1,1,new Uint8Array(4)));alive();gpuDone();
          } catch(error) {gpuDone('failed');throw error;} });
          done();
          complete.add(key(task.request));status(task.request,'ready');mark(`prepared:${key(task.request)}`);task.resolve();
        }catch(error){done('failed');prepared.delete(key(task.request));status(task.request,'failed',String(error));task.reject(error);}
        await new Promise(resolve=>setTimeout(resolve,0));
      }}finally{working=false;}
    }
    const prepare=(request:SceneRequest,priority=0) => {
      alive();const existing=prepared.get(key(request));if(existing){const task=tasks.find(task=>key(task.request)===key(request));if(task)task.priority=Math.max(priority,task.priority);return existing;}
      status(request,'fetching');const promise=new Promise<void>((resolve,reject)=>{tasks.push({request,priority,resolve,reject});});prepared.set(key(request),promise);void promise.catch(()=>{});void drain();return race(promise);
    };
    const animate=(time:number) => {
      raf=0;if(disposed || failed || !active || paused || !current)return;
      const delta=Math.max(0,time-last);last=time;
      if(current!==views.get(key({kind:'exterior',floorId:''})))return;
      if(journeyProgress>0)return;
      arrivalElapsed=Math.min(arrivalDuration,arrivalElapsed+delta);
      const arrival=arrivalElapsed/arrivalDuration;
      current.group.rotation.y=-.24*(1-arrival)*(1-arrival);
      canvas.dataset.arrival=arrival===1?'complete':'playing';
      try {if(!gpuBusy)draw(current,false);if(arrivalElapsed<arrivalDuration||gpuBusy)raf=requestAnimationFrame(animate);}
      catch(error){failVisible(error,'runtime');}
    };
    const refreshAnimation=()=>{cancelAnimationFrame(raf);raf=0;last=performance.now();if(active&&!paused&&!automaticStopped&&arrivalElapsed<arrivalDuration&&current?.exteriorFit&&journeyProgress===0&&!disposed&&!failed)raf=requestAnimationFrame(animate);};
    const redrawExterior=()=>{
      if(!active||!current?.exteriorFit||disposed||failed)return;
      // A manual button may be pressed while floor shaders prepare. Queue its
      // frame behind that GPU work rather than dropping the requested update.
      if(gpuBusy){void gpu(async()=>{if(active&&current?.exteriorFit)draw(current,false);}).catch(error=>failVisible(error,'runtime'));return;}
      try{draw(current,false);}catch(error){failVisible(error,'runtime');}
    };
    resize=new ResizeObserver(()=>{if(current&&!disposed&&!failed&&!gpuBusy&&(!current.exteriorFit||journeyProgress<.95)){try{draw(current,false);}catch(error){failVisible(error,'runtime');}}});resize.observe(canvas.parentElement!);
    let backgroundStarted=false;
    setupDone();
    return {
      prepare: request=>prepare(request,1),
      isPrepared: request=>!disposed&&!failed&&complete.has(key(request)),
      async show(request) {
        const id=++serial;
        // The overview keeps the exterior's registered camera underneath the
        // source-plan presentation. Its complete mesh view is still prepared.
        const present=()=>{
          if(id!==serial)return;
          alive();
          const view=request.kind==='overview'?views.get(key({kind:'exterior',floorId:request.floorId}))!:views.get(key(request))!;
          const host=options.sceneHosts?.[request.kind];
          host?.append(canvas);if(host)resize?.observe(host);
          ensureSize(view);
          const frameDone=timing('scene-render',{...detail,...request});
          try {draw(view,false);alive();frameDone('ready',{frame:renderer.info.render.frame});}catch(error){frameDone('failed');throw error;}if(id!==serial)return;
          current=view;canvas.dataset.sceneKey=key(request);canvas.dataset.completeFrame=String(renderer.info.render.frame);
          let geometryBytes=0,textureBytes=0;
          for(const geometry of geometries){for(const attribute of Object.values(geometry.attributes))geometryBytes+=attribute.array.byteLength;geometryBytes+=geometry.index?.array.byteLength??0;}
          for(const texture of textures){const image=texture.image;if(image && typeof image==='object' && 'width' in image && 'height' in image)textureBytes+=Number(image.width)*Number(image.height)*4*(texture.generateMipmaps?4/3:1);}
          performance.mark('mall-3d:resources',{detail:{...detail,geometries:geometries.size,geometryBytes,materials:materials.size,textures:textures.size,estimatedTextureBytes:Math.round(textureBytes),views:views.size,estimatedRenderTargetBytes:target.width*target.height*8,estimatedEnvironmentBytes:(envTarget?.width??0)*(envTarget?.height??0)*8,estimateLimit:'Buffers are CPU array bytes; texture/environment estimates omit driver allocation, default framebuffer and shader costs.'}});
        };
        // Preparation already compiled shaders and completed a GPU readback.
        // Reuse can render synchronously before React paints a changed selection.
        if(!gpuBusy&&complete.has(key(request)))present();
        // A busy background GPU job retains the previous complete presentation
        // until this prepared view can draw; it does not invalidate preparation.
        else {await prepare(request,3);alive();if(id!==serial)return;await gpu(async()=>{present();});}
        if(id!==serial)return;
        mark(`shown:${key(request)}`);refreshAnimation();
        if(!backgroundStarted){backgroundStarted=true;setTimeout(()=>{if(disposed||failed)return;for(const floor of data.floors)for(const kind of ['map','discovery'] as const)void prepare({kind,floorId:floor.id}).catch(()=>{});},0);}
      },
      setActive(value){active=value;refreshAnimation();},
      setPaused(value){paused=value;refreshAnimation();},
      stopAutomaticPresentation,
      adjustExterior(change){
        stopAutomaticPresentation();
        const view=views.get(key({kind:'exterior',floorId:''}));if(!view||journeyProgress>0)return;
        const finite=(value:number|undefined)=>Number.isFinite(value)?value!:0;
        // Keep inspection near the supplied front view; these are visual
        // controls, not claims of a surveyed orbit or additional model detail.
        view.group.rotation.y=clamp(view.group.rotation.y+finite(change.rotate),-Math.PI/3,Math.PI/3);
        manualLook=clamp(manualLook+finite(change.look),-.18,.45);
        manualZoom=clamp(manualZoom+finite(change.zoom),.75,1.35);
        canvas.dataset.exteriorRotate=String(view.group.rotation.y);
        canvas.dataset.exteriorLook=String(manualLook);
        canvas.dataset.exteriorZoom=String(manualZoom);
        redrawExterior();
      },
      resetExterior(){
        stopAutomaticPresentation();manualLook=0;manualZoom=1;
        const view=views.get(key({kind:'exterior',floorId:''}));if(view)view.group.rotation.y=0;
        canvas.dataset.exteriorRotate='0';canvas.dataset.exteriorLook='0';canvas.dataset.exteriorZoom='1';
        redrawExterior();
      },
      replayArrival(){
        if(options.reducedMotion||journeyProgress>0||disposed||failed)return;
        automaticStopped=false;arrivalElapsed=0;manualLook=0;manualZoom=1;
        const view=views.get(key({kind:'exterior',floorId:''}));if(view)view.group.rotation.y=-.24;
        refreshAnimation();redrawExterior();
      },
      setJourneyProgress(value,reducedMotion){const previous=journeyProgress;journeyProgress=reducedMotion?0:Math.max(0,Math.min(1,value));const exteriorView=views.get(key({kind:'exterior',floorId:''}));if(exteriorView){if(previous===0&&journeyProgress>0)approachRotation=Math.atan2(Math.sin(exteriorView.group.rotation.y),Math.cos(exteriorView.group.rotation.y));if(journeyProgress>0)exteriorView.group.rotation.y=approachRotation*(1-journeyProgress);}if(journeyProgress>0){cancelAnimationFrame(raf);raf=0;}else if(previous>0)refreshAnimation();if(previous!==journeyProgress&&journeyProgress<.95&&active&&current?.exteriorFit&&!disposed&&!failed&&!gpuBusy){try{draw(current,false);}catch(error){failVisible(error,'runtime');}}},
      dispose:cleanup,
    };
  } catch(error) {setupDone('failed');cleanup();throw error;}
}
