import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results=[];
try {
  for(const mallId of ['saigon-centre','vincom-dong-khoi'])for(const reducedMotion of [false,true]){
    const page=await browser.newPage({viewport:{width:960,height:720}});
    await page.route('**/runtime-probe',route=>route.fulfill({contentType:'text/html',body:'<html><body><div id="host" style="width:900px;height:600px"><canvas></canvas></div></body></html>'}));
    await page.goto('http://127.0.0.1:4321/runtime-probe');
    const result=await page.evaluate(async({mallId,reducedMotion})=>{
      const {createSceneRuntime}=await import('/src/runtime/create-scene-runtime.ts');
      const vertices=new Float32Array([-1,0,0,1,0,0,0,2,0]);
      const bytes=btoa(String.fromCharCode(...new Uint8Array(vertices.buffer)));
      const gltf={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{byteLength:vertices.byteLength,uri:`data:application/octet-stream;base64,${bytes}`}],bufferViews:[{buffer:0,byteOffset:0,byteLength:vertices.byteLength}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,0,0],max:[1,2,0]}]};
      const canvas=document.querySelector('canvas');
      const runtime=await createSceneRuntime({canvas,mallId,reducedMotion,assetRevision:'synthetic-browser-fixture',exteriorUrl:'unused',modelBytes:Promise.resolve(new TextEncoder().encode(JSON.stringify(gltf)).buffer),data:{revision:'fixture',floors:[]},onStatus(){}});
      await runtime.prepare({kind:'exterior',floorId:''});
      const start=performance.now();await runtime.show({kind:'exterior',floorId:''});
      const checks=[];const assert=(condition,name)=>{checks.push({name,pass:!!condition});if(!condition)throw Error(name);};
      const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      if(!reducedMotion){
        while(canvas.dataset.arrival!=='complete'&&performance.now()-start<7000)await wait(50);
        const elapsed=performance.now()-start;
        assert(canvas.dataset.arrival==='complete','arrival completes');assert(elapsed>=5400&&elapsed<=6500,'arrival lasts about 5.5 seconds');
        const frames=canvas.dataset.renderedFrames;await wait(180);assert(canvas.dataset.renderedFrames===frames,'arrival stops rendering after completion');
        runtime.replayArrival();await wait(100);window.dispatchEvent(new WheelEvent('wheel'));const stopped=canvas.dataset.renderedFrames;await wait(180);
        assert(canvas.dataset.arrival==='stopped'&&canvas.dataset.renderedFrames===stopped,'first wheel input cancels arrival');
      }else{const frames=canvas.dataset.renderedFrames;await wait(180);assert(canvas.dataset.renderedFrames===frames,'reduced motion has no automatic frames');}
      for(let i=0;i<40;i++)runtime.adjustExterior({rotate:.15,look:.07,zoom:.1});
      assert(Number(canvas.dataset.exteriorRotate)<=Math.PI/3,'rotation upper bound');assert(Number(canvas.dataset.exteriorLook)===.45,'look upper bound');assert(Number(canvas.dataset.exteriorZoom)===1.35,'zoom upper bound');
      for(let i=0;i<40;i++)runtime.adjustExterior({rotate:-.15,look:-.07,zoom:-.1});
      assert(Number(canvas.dataset.exteriorRotate)>=-Math.PI/3,'rotation lower bound');assert(Number(canvas.dataset.exteriorLook)===-.18,'look lower bound');assert(Number(canvas.dataset.exteriorZoom)===.75,'zoom lower bound');
      runtime.adjustExterior({rotate:NaN,look:Infinity,zoom:NaN});assert(Number.isFinite(Number(canvas.dataset.exteriorRotate)),'nonfinite deltas ignored');
      runtime.resetExterior();assert(canvas.dataset.exteriorRotate==='0'&&canvas.dataset.exteriorLook==='0'&&canvas.dataset.exteriorZoom==='1','reset restores neutral frame');
      runtime.dispose();return {mallId,reducedMotion,checks};
    },{mallId,reducedMotion});
    results.push(result);await page.close();
  }
}finally{await browser.close();writeFileSync('evidence/exterior-controls-2026-10-21/runtime-results.json',JSON.stringify(results,null,2));}
console.log(JSON.stringify({cases:results.length,assertions:results.reduce((n,r)=>n+r.checks.length,0)}));
