import{chromium}from'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
const out='evidence/motion-comparison-2026-10-20-r1',capture=JSON.parse(readFileSync(`${out}/capture-results.json`)),runs=[],http=[];if(!capture.complete)throw Error('All captures required');mkdirSync(`${out}/viewer-frames`,{recursive:true});
for(const r of capture.runs){const response=await fetch(`http://127.0.0.1:4450/${r.video}`,{headers:{Range:'bytes=0-1023'}});const bytes=await response.arrayBuffer();const check={video:r.video,status:response.status,bytes:bytes.byteLength,contentType:response.headers.get('content-type'),range:response.headers.get('content-range')};http.push(check);if(check.status!==206||check.bytes!==1024||check.contentType!=='video/mp4')throw Error('Video range playback response');}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{for(const pageWidth of [1440,390])for(const mall of ['saigon','vincom'])for(const width of [1280,390]){
 const ctx=await browser.newContext({viewport:{width:pageWidth,height:950},reducedMotion:pageWidth===390?'reduce':'no-preference'}),page=await ctx.newPage(),row={pageWidth,mall,recordedWidth:width,checks:[],failed:[],pageErrors:[]};runs.push(row);page.on('pageerror',e=>row.pageErrors.push(e.message));const check=(pass,label)=>{row.checks.push({label,pass:!!pass});if(!pass)throw Error(label);};
 try{await page.goto('http://127.0.0.1:4450/review.html');await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 const select=async(id,value)=>{await page.locator(id).selectOption(value);await page.waitForFunction(()=>!document.getElementById('replay').disabled);};
 if(mall!=='saigon')await select('#mall',mall);if(width!==1280)await select('#viewport',String(width));
 check(await page.locator('#before').evaluate(v=>v.videoWidth)===width&&await page.locator('#after').evaluate(v=>v.videoWidth)===width,'Before and after have exact matched decoded viewport');
 check(await page.locator('video').evaluateAll(v=>v.every(x=>x.paused&&x.controls)),'No automatic playback; native replay controls present');
 const expected=capture.runs.filter(r=>r.mall===mall&&r.width===width);const positions=await page.locator('video').evaluateAll(v=>v.map(x=>({id:x.id,t:x.currentTime,src:x.currentSrc})));
 check(positions.every(x=>{const e=expected.find(r=>r.version===x.id);return Math.abs(x.t-e.chapters.podium)<.15&&x.src.endsWith(e.video);}), 'Initial matched podium moment and source selection exact');
 await page.locator('#replay').click();await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>!v.paused&&v.currentTime>.4&&v.playbackRate===1),null,{timeout:15000});
 row.playback=await page.locator('video').evaluateAll(v=>v.map(x=>({id:x.id,time:x.currentTime,frames:x.getVideoPlaybackQuality().totalVideoFrames,readyState:x.readyState})));
 check(row.playback.every(x=>x.frames>1&&x.readyState>=2),'Both recordings decode and advance at normal speed');
 await page.locator('#pause').click();const stopped=await page.locator('video').evaluateAll(v=>v.map(x=>x.currentTime));await page.waitForTimeout(220);
 check(await page.locator('video').evaluateAll((v,t)=>v.every((x,i)=>x.paused&&Math.abs(x.currentTime-t[i])<.06),stopped),'Pause both stops playback');
 await page.locator('[data-moment=approach]').click();await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>!v.paused));await page.locator('#pause').click();
 check((await page.locator('video').evaluateAll(v=>v.map(x=>({id:x.id,t:x.currentTime})))).every(x=>Math.abs(x.t-(expected.find(r=>r.version===x.id).chapters.approach-1.1))<.8),'Moment jump seeks both to matching approach');
 await page.locator('[data-moment=podium]').click();await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.paused));
 await page.waitForFunction(times=>[...document.querySelectorAll('video')].every(v=>Math.abs(v.currentTime-times[v.id])<.15),Object.fromEntries(expected.map(r=>[r.version,r.chapters.podium])));
 check(true,'Freeze podium aligns both actual capture chapters');
 await page.locator('#speed').selectOption('0.5');check(await page.locator('video').evaluateAll(v=>v.every(x=>x.playbackRate===.5)),'Half-speed inspection is an explicit optional control');await page.locator('#speed').selectOption('1');
 check(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)===(pageWidth===390),'Review controls leave context motion preference unchanged');
 check(await page.evaluate(()=>localStorage.length===0),'Viewer does not write saved app preferences');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Responsive review page has no horizontal overflow');
 await page.screenshot({path:`${out}/viewer-frames/${mall}-${width}-page${pageWidth}.png`,fullPage:true});
 check(!row.pageErrors.length,'No review page errors');
 }catch(e){row.failed.push(e.message);}finally{await ctx.close();writeFileSync(`${out}/viewer-results.json`,JSON.stringify({http,runs},null,2)+'\n');}
}
const page=await browser.newPage();await page.goto('http://127.0.0.1:4450/review.html');await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');await page.locator('#loop').check();await page.evaluate(async()=>{const all=[...document.querySelectorAll('video')];for(const v of all)v.currentTime=v.duration-.3;await Promise.all(all.map(v=>v.play()));});await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>!v.paused&&v.currentTime<2),null,{timeout:15000});await page.locator('#pause').click();writeFileSync(`${out}/loop-result.json`,JSON.stringify({passed:true,method:'Enable loop; play both last0.3seconds; observe both restart below2seconds without pause.'},null,2)+'\n');await page.close();
}finally{await browser.close();}
const result={http,runs,complete:runs.length===8&&runs.every(r=>!r.failed.length),assertions:runs.reduce((n,r)=>n+r.checks.length,0)};writeFileSync(`${out}/viewer-results.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({complete:result.complete,cases:runs.length,assertions:result.assertions,rangeChecks:http.length,failures:runs.flatMap(r=>r.failed)}));if(!result.complete)process.exitCode=1;
