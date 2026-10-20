import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const out='evidence/motion-comparison-2026-10-20-r1';
const provenance=JSON.parse(readFileSync(`${out}/provenance.json`));
if(existsSync(`${out}/capture-results.json`))throw Error('Capture already attempted; preserve and diagnose before retry');
for(const name of ['raw','videos','frames'])mkdirSync(`${out}/${name}`,{recursive:true});
const ff=(cmd,args,buffer=false)=>{const r=spawnSync(cmd,args,{encoding:buffer?undefined:'utf8',maxBuffer:16*1024*1024,windowsHide:true});if(r.status!==0)throw Error(`${cmd}:${r.stderr}`);return r.stdout;};
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const receipt={at:new Date().toISOString(),baseline:provenance.baselineSourceFull,final:provenance.finalSource,runs:[],method:'Fresh normal-motion browser recordings, same scripted sequence and CSS viewports. Intro turntable enabled by public Resume action in fresh isolated contexts. A temporary green pre-roll marker is removed before visible recording and used only for exact trim alignment. No app source changes, no OS preference changes. Native scene requests and waits preserved; timing is capture evidence, not a benchmark.'};
const persist=()=>writeFileSync(`${out}/capture-results.json`,JSON.stringify(receipt,null,2)+'\n');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=p=>p.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:60000});
try{
for(const [mall,beforePort,afterPort]of [['saigon',4451,4441],['vincom',4452,4442]])for(const [width,height]of [[1280,800],[390,844]])for(const version of ['before','after']){
 const id=`${mall}-${width}-${version}`,port=version==='before'?beforePort:afterPort,row={id,mall,version,width,height,port,checks:[],failed:[],errors:[],chapters:{}};receipt.runs.push(row);persist();
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:width===390,reducedMotion:'no-preference',recordVideo:{dir:`${out}/raw`,size:{width,height}}});
 await context.addInitScript(()=>localStorage.setItem('mall-introduction-paused','true'));
 const page=await context.newPage();page.on('pageerror',e=>row.errors.push(e.message));
 const check=(ok,label)=>{row.checks.push({label,pass:!!ok});if(!ok)throw Error(label);};
 let duration;
 try{
  await page.goto(`http://127.0.0.1:${port}/en?view=exterior`);await ready(page);
  row.profile=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return{width:innerWidth,height:innerHeight,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,initialPause:document.querySelector('.visitor-guide').dataset.paused,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),userAgent:navigator.userAgent};});
  check(row.profile.width===width&&row.profile.height===height&&!row.profile.reducedMotion,'Matched actual viewport and normal motion');
  const start=await page.evaluate(()=>{const stage=document.querySelector('.exterior-floor-journey'),hero=document.querySelector('#scene-exterior'),visual=document.querySelector('.registered-scene');return stage.offsetTop+(innerWidth<=700?hero.offsetTop+hero.offsetHeight+(parseFloat(getComputedStyle(visual).marginTop)||0)-(parseFloat(getComputedStyle(visual).top)||0):0);});
  await page.evaluate(y=>{scrollTo({top:y,behavior:'instant'});const m=document.createElement('div');m.id='capture-preroll';Object.assign(m.style,{position:'fixed',top:'0',left:'0',width:'32px',height:'32px',background:'#00ff00',zIndex:'2147483647'});document.body.append(m);},start);await page.waitForTimeout(850);
  const anchor=await page.evaluate(()=>{document.getElementById('capture-preroll').remove();document.querySelector('.pause-control').click();return performance.now();});
  const mark=async name=>{row.chapters[name]=(await page.evaluate(()=>performance.now())-anchor)/1000;await page.screenshot({path:`${out}/frames/${id}-${name}.png`});};
  const move=async(y,ms=1400)=>{await page.evaluate(({y,ms})=>new Promise(ok=>{const from=scrollY,start=performance.now();function tick(t){const p=Math.min(1,(t-start)/ms);scrollTo({top:from+(y-from)*p,behavior:'instant'});p<1?requestAnimationFrame(tick):ok();}requestAnimationFrame(tick);}),{y,ms});};
  await mark('opening');await page.waitForTimeout(2400);
  check(await page.locator('.visitor-guide').getAttribute('data-paused')==='false','Automatic introduction rotation on');
  await mark('rotation');
  for(const [name,p]of [['early',.2],['approach',.4],['podium',.54],['reveal',.72],['overview',1]]){await move(start+p*height);await page.waitForTimeout(name==='podium'?850:450);await mark(name);}
  await page.waitForFunction(()=>!document.querySelector('.registered-floors').inert);await ready(page);
  const floor=page.locator('.registered-floors .floor-rail [data-floor-id="L2"]');await floor.focus();await mark('travel');await page.keyboard.press('Enter');await ready(page);await page.waitForFunction(()=>document.activeElement?.id==='scene-map');await page.waitForTimeout(500);await mark('map');
  check(new URL(page.url()).searchParams.get('floor')==='L2','Actual L2 selection and map entry');
  const points=await page.evaluate(()=>({invitation:scrollY+document.querySelector('.discovery-introduction h2').getBoundingClientRect().top-innerHeight*.4,discovery:scrollY+document.querySelector('#scene-discovery').getBoundingClientRect().top-120}));
  await move(points.invitation);await page.waitForTimeout(500);await mark('invitation');
  await move(points.discovery);await ready(page);await page.waitForTimeout(700);await mark('discovery');
  await move(start+.54*height,1600);await page.waitForTimeout(550);await mark('return');
  row.finalBounds=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,scrollX,observationOnly:true}));check(row.errors.length===0,'No page errors');
  duration=(await page.evaluate(()=>performance.now())-anchor)/1000;row.sequenceDuration=duration;
 }catch(e){row.failed.push(e.message);}
 finally{const video=page.video();await context.close();await video.saveAs(`${out}/raw/${id}.webm`);await video.delete();}
 if(!row.failed.length){
  const raw=`${out}/raw/${id}.webm`;
  const timestamps=JSON.parse(ff('ffprobe',['-v','error','-select_streams','v:0','-show_entries','frame=best_effort_timestamp_time','-of','json',raw])).frames.map(f=>Number(f.best_effort_timestamp_time));
  const pixels=ff('ffmpeg',['-v','error','-i',raw,'-vf','crop=2:2:8:8,format=rgb24','-fps_mode','passthrough','-f','rawvideo','pipe:1'],true);
  let last=-1;for(let i=0;i<pixels.length/12;i++)if(pixels[i*12]<20&&pixels[i*12+1]>235&&pixels[i*12+2]<20)last=i;
  check(last>=0&&timestamps[last+1]!==undefined,'Pre-roll marker detected and removed from replay');row.trimStart=timestamps[last+1];
  const target=`${out}/videos/${id}.mp4`;
  ff('ffmpeg',['-v','error','-ss',String(row.trimStart),'-i',raw,'-t',String(duration),'-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',target]);
  row.video=`videos/${id}.mp4`;row.poster=`frames/${id}-podium.png`;row.videoSha256=sha(target);row.rawSha256=sha(raw);
  row.media=JSON.parse(ff('ffprobe',['-v','error','-show_entries','stream=width,height,avg_frame_rate:format=duration','-of','json',target]));
  check(row.media.streams[0].width===width&&row.media.streams[0].height===height,'Encoded video preserves exact matched viewport');
 }
 persist();console.log(JSON.stringify({id,failed:row.failed,seconds:duration,trimStart:row.trimStart}));
 if(row.failed.length)throw Error(`Capture failed:${id}`);
}
}finally{await browser.close();persist();}
receipt.complete=receipt.runs.length===8&&receipt.runs.every(r=>!r.failed.length);persist();
