import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {writeFileSync} from 'node:fs';
const out='evidence/arrival-r5';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results=[];
try{
  for(const [mall,port] of [['saigon',4490],['vincom',4491]])for(const reduced of [false,true]){
    const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:reduced?'reduce':'no-preference'});
    const row={mall,reduced,checks:[],errors:[]};results.push(row);
    page.on('pageerror',error=>row.errors.push(error.message));
    const assert=(pass,name)=>{row.checks.push({name,pass:!!pass});if(!pass)throw Error(name)};
    await page.addInitScript(()=>{
      window.arrivalTrace=[];
      setInterval(()=>{
        const c=document.querySelector('canvas');if(!c?.dataset.arrivalStage)return;
        const toggle=document.querySelector('.exterior-controls-toggle');
        window.arrivalTrace.push({t:performance.now(),stage:c.dataset.arrivalStage,arrival:c.dataset.arrival,progress:Number(c.dataset.arrivalProgress),distance:Number(c.dataset.arrivalDistance),focusY:Number(c.dataset.arrivalFocusY),clearance:Number(c.dataset.exteriorClearance),enabled:toggle&&!toggle.disabled,shown:!!c.closest('.scene-host-exterior')&&getComputedStyle(c).visibility==='visible',hidden:document.hidden});
      },40);
    });
    try{
      await page.goto(`http://127.0.0.1:${port}/en`,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>!document.querySelector('.exterior-controls-toggle')?.disabled,{timeout:90000});
      row.readyAt=await page.evaluate(()=>performance.now());
      assert(await page.locator('.scene-host-exterior canvas[data-complete-frame]').count()===1,'actual exterior has complete frame');
      if(!reduced){
        await page.screenshot({path:`${out}/${mall}-establish.png`});
        await page.waitForFunction(()=>Number(document.querySelector('canvas')?.dataset.arrivalProgress)>=.63,{timeout:15000});
        await page.screenshot({path:`${out}/${mall}-facade.png`});
        await page.waitForFunction(()=>Number(document.querySelector('canvas')?.dataset.arrivalProgress)>=.85,{timeout:15000});
        await page.screenshot({path:`${out}/${mall}-settle.png`});
        await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.arrival==='complete',{timeout:15000});
        await page.waitForTimeout(100);
        row.initialTrace=await page.evaluate(()=>window.arrivalTrace);
        const playing=row.initialTrace.filter(s=>s.arrival==='playing'),complete=row.initialTrace.find(s=>s.arrival==='complete');
        row.durationMs=complete.t-playing[0].t;row.preReadyProgress=Math.max(0,...row.initialTrace.filter(s=>!s.enabled).map(s=>s.progress));row.firstPreparedAt=row.initialTrace[0].t;row.firstPlayingAt=playing[0].t;
        assert(['establish','facade','settle'].every(stage=>playing.some(s=>s.stage===stage)),'all three actual motion stages observed');
        assert(row.durationMs>=5250&&row.durationMs<=6250,'visible playing clock completes about5500ms');
        assert(row.preReadyProgress<.04,'no material animation before ready shell');
        assert(Math.min(...row.initialTrace.map(s=>s.clearance))>=1.2499,'camera remains outside fitted sphere with25percent margin');
        const minimum=Math.min(...playing.map(s=>s.distance));assert(minimum<(mall==='saigon'?.75:.83),'facade materially approaches fit camera');
        const final=complete;assert(final.distance===1&&final.focusY===0&&final.progress===1,'settle returns exact registered neutral camera');
        const still1=await page.locator('.scene-host-exterior').screenshot();await page.waitForTimeout(300);const still2=await page.locator('.scene-host-exterior').screenshot();assert(still1.equals(still2),'completed exterior stays visually still');
        await page.screenshot({path:`${out}/${mall}-complete.png`});
        await page.locator('.introduction-controls .replay-control').click();
        await page.waitForFunction(()=>Number(document.querySelector('canvas')?.dataset.arrivalProgress)>.52&&document.querySelector('canvas')?.dataset.arrival==='playing');
        await page.keyboard.press('ArrowLeft');
        const frozen=await page.locator('canvas').evaluate(c=>({...c.dataset}));
        const stopped1=await page.locator('.scene-host-exterior').screenshot();await page.waitForTimeout(300);const stopped2=await page.locator('.scene-host-exterior').screenshot();
        const frozenAfter=await page.locator('canvas').evaluate(c=>({...c.dataset}));
        assert(frozen.arrival==='stopped'&&frozenAfter.arrivalProgress===frozen.arrivalProgress&&frozenAfter.arrivalDistance===frozen.arrivalDistance&&frozenAfter.arrivalFocusY===frozen.arrivalFocusY,'keyboard input freezes entire facade pose');
        assert(stopped1.equals(stopped2),'cancelled facade stays visually still');
        await page.locator('.exterior-controls-toggle').click();
        await page.getByRole('button',{name:'Zoom in',exact:true}).click();
        assert(Number(await page.locator('canvas').getAttribute('data-exterior-zoom'))<1,'manual zoom remains usable from cancelled pose');
        await page.getByRole('button',{name:'Reset view',exact:true}).click();
        const reset=await page.locator('canvas').evaluate(c=>({...c.dataset}));assert(reset.arrivalDistance==='1'&&reset.arrivalFocusY==='0'&&reset.exteriorZoom==='1','reset restores neutral camera after facade interruption');
      }else{
        await page.waitForTimeout(700);
        const a=await page.locator('.scene-host-exterior').screenshot();await page.waitForTimeout(400);const b=await page.locator('.scene-host-exterior').screenshot();
        row.initialTrace=await page.evaluate(()=>window.arrivalTrace);
        assert(row.initialTrace.every(s=>s.progress===1&&s.stage==='complete'&&s.arrival!=='playing'),'reduced motion prepares directly at neutral final stage');
        assert(a.equals(b),'reduced motion exterior remains visually static');
        await page.screenshot({path:`${out}/${mall}-reduced.png`});
      }
      assert(row.errors.length===0,'no page errors');
    }catch(error){row.failure=String(error);row.traceOnFailure=await page.evaluate(()=>window.arrivalTrace);await page.screenshot({path:`${out}/${mall}-${reduced?'reduced':'motion'}-failed.png`}).catch(()=>{});}
    await page.close();
  }
}finally{await browser.close();writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify({cases:results.length,assertions:results.reduce((n,r)=>n+r.checks.length,0),failures:results.filter(r=>r.failure).map(r=>({mall:r.mall,reduced:r.reduced,failure:r.failure}))}));
