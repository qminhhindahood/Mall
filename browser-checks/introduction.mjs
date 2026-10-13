// Public browser journey boundary. Pass the installed browser driver from the runner.
import {mkdir,writeFile} from 'node:fs/promises';
export async function checkIntroduction(chromium, evidence) {
  await mkdir(evidence,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
  const results={revision:'visitor-introduction-2026-10-14-r1',browser:browser.version(),profile:'Headless Chrome / SwiftShader; desktop and phone CSS widths, not physical devices',runs:[]};
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const ready=async page=>{await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('.scene-host canvas')?.dataset.completeFrame,{},{timeout:30000});};
  for(const [mall,port,floor] of [['saigon',4273,'L5'],['vincom',4274,'B2']])for(const width of [1280,390]) {
    const context=await browser.newContext({viewport:{width,height:width===390?844:800},reducedMotion:'no-preference'});
    const page=await context.newPage();
    const run={mall,width,checks:[],errors:[]};results.runs.push(run);
    page.on('pageerror',error=>run.errors.push(error.message));
    try {
      await page.goto(`http://localhost:${port}/`);await ready(page);
      assert(new URL(page.url()).pathname==='/vi','Vietnamese root default');
      assert(await page.locator('.introduction h1').innerText().then(s=>s.includes(mall==='saigon'?'Saigon Centre':'Vincom Center Đồng Khởi')),'Mall identity');
      assert(await page.locator('.introduction-copy p').first().innerText().then(s=>mall!=='saigon'||s.includes('Takashimaya')),'Whole-mall introduction');
      assert(await page.locator('header').evaluate(e=>e.inert&&getComputedStyle(e).visibility==='hidden'),'Header hidden and inert before hero ends');
      assert(await page.locator('.introduction-copy a,.introduction-copy button').count()===0,'No duplicate hero CTAs');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
      run.checks.push('VI default / mall identity / whole-mall copy / hidden header / no duplicate CTAs / no overflow');
      await page.screenshot({path:`${evidence}/${mall}-${width}-vi.png`});
      await page.locator('.introduction-controls a[lang=en]').click();
      assert(await page.locator('.introduction h1').innerText().then(s=>s.startsWith('Discover')),'English introduction');
      assert(new URL(page.url()).searchParams.get('floor')===floor&&new URL(page.url()).searchParams.get('view')==='exterior','Locale retains floor and introduction');
      assert(await page.evaluate(()=>scrollY)<10,'Locale preserves hero position');
      await page.screenshot({path:`${evidence}/${mall}-${width}-en.png`});
      await page.waitForTimeout(1800); // Let finite background preparation finish.
      const frames=()=>page.locator('canvas').getAttribute('data-rendered-frames').then(Number);
      const before=await frames();await page.waitForTimeout(400);assert(await frames()>before,'Automatic exterior presentation');
      await page.getByRole('button',{name:'Pause rotation',exact:true}).click();
      const stopped=await frames();await page.waitForTimeout(400);assert(await frames()===stopped,'Pause stops presentation');
      await page.reload();await ready(page);assert(await page.getByRole('button',{name:'Resume rotation',exact:true}).getAttribute('aria-pressed')==='true','Pause survives reload');
      await page.locator('.introduction-controls a[lang=vi]').click();
      assert(await page.getByRole('button',{name:'Tiếp tục xoay',exact:true}).getAttribute('aria-pressed')==='true','Pause survives language change');
      await page.getByRole('button',{name:'Tiếp tục xoay',exact:true}).click();
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.getByRole('button',{name:'Chuyển động đã tắt',exact:true}).waitFor();
      assert(await page.getByRole('button',{name:'Chuyển động đã tắt',exact:true}).isDisabled(),'Reduced motion disables Resume');
      // Background preparation also renders complete frames into an offscreen target.
      // A static presentation must settle once that finite preparation is done.
      await page.waitForFunction(()=>{
        const canvas=document.querySelector('canvas');if(!canvas)return false;
        const frame=canvas.dataset.renderedFrames;
        if(window.__introFrame!==frame){window.__introFrame=frame;window.__introStableSince=Date.now();}
        return Date.now()-window.__introStableSince>600;
      },{},{timeout:15000});
      const reduced=await frames();await page.waitForTimeout(400);assert(await frames()===reduced,'Reduced motion stops rotation');
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.getByRole('button',{name:'Tạm dừng xoay',exact:true}).waitFor();
      run.checks.push('EN context / automatic rotation / Pause / persistent Pause / live reduced motion');
      await page.mouse.wheel(0,await page.locator('.introduction').evaluate(e=>e.getBoundingClientRect().height-60));
      await page.waitForTimeout(300);
      assert(await page.locator('header').evaluate(e=>e.inert),'Header stays hidden until hero ends');
      await page.mouse.wheel(0,150);await page.waitForFunction(()=>!document.querySelector('header').inert);await ready(page);
      assert(await page.locator('header nav a').allTextContents().then(s=>s[0]==='Sơ đồ tầng'&&s[1]==='Khám phá'),'Floor map before Discovery');
      await page.locator('header nav a').first().click();await ready(page);
      assert(new URL(page.url()).searchParams.get('floor')===floor&&new URL(page.url()).searchParams.get('view')==='map','Header opens selected detailed map');
      assert(await page.evaluate(()=>document.activeElement?.id==='scene-map'),'Map receives usable focus');
      await page.locator('header nav a').nth(1).click();await ready(page);
      assert(new URL(page.url()).searchParams.get('view')==='discovery','Header opens Discovery');
      await page.goBack();await ready(page);assert(new URL(page.url()).searchParams.get('view')==='map','Back restores map context');
      await page.locator('header .wordmark').click();await ready(page);
      await page.locator('.skip-introduction').focus();await page.keyboard.press('Enter');await ready(page);
      assert(new URL(page.url()).searchParams.get('view')==='map','Keyboard skip opens practical map');
      run.checks.push('Native wheel / exact hero-end reveal / ordered header targets / selected floor / focus / Back / keyboard skip');
      run.pass=true;
    }catch(error){run.pass=false;run.failure=String(error);await page.screenshot({path:`${evidence}/${mall}-${width}-failure.png`}).catch(()=>{});}
    await context.close();
  }
  for(const [mall,port] of [['saigon',4273],['vincom',4274]])for(const scenario of ['model-fail','webgl-unavailable','import-fail']) {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
    const run={mall,scenario,checks:[]};results.runs.push(run);
    try {
      if(scenario==='import-fail')await page.route('**/_astro/create-scene-runtime*.js',route=>route.abort());
      await page.goto(`http://localhost:${port}/vi?__scenario=${scenario}`);
      await page.locator('.error').waitFor({timeout:30000});
      assert(await page.locator('.static-guide').isVisible(),'Static guide survives scene failure');
      assert(await page.locator('.static-guide svg').count()>0,'Static SVG remains available');
      await page.locator('.introduction-controls a[lang=en]').click();
      assert(await page.locator('.error').innerText().then(s=>s.includes('3D could not')),'Localized failure');
      assert(await page.locator('.static-guide h2 a').first().getAttribute('href').then(s=>s.includes('/en/floors/')),'Static links preserve locale');
      await page.locator('.skip-introduction').focus();await page.keyboard.press('Enter');
      await page.waitForFunction(()=>document.activeElement?.id==='scene-map');
      assert(new URL(page.url()).searchParams.get('view')==='map','Practical navigation survives failure');
      assert(await page.evaluate(()=>!document.querySelector('.loading-screen')&&!document.body.inert),'Failure releases loading gate');
      run.checks.push('Failure releases gate / static SVG / localized guide / keyboard practical navigation');run.pass=true;
    }catch(error){run.pass=false;run.failure=String(error);}await context.close();
  }
  for(const [mall,port] of [['saigon',4273],['vincom',4274]]) {
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();const run={mall,scenario:'no-javascript'};results.runs.push(run);
    try{await page.goto(`http://localhost:${port}/vi`);assert(await page.locator('.static-guide svg').count()>0,'No-JS static SVG');await page.locator('.scroll-guide').click();assert(page.url().endsWith('#scene-overview'),'No-JS scroll guidance');await page.locator('.floors a').first().click();assert(page.url().includes('/vi/tang/'),'No-JS ordinary floor route');run.pass=true;}catch(error){run.pass=false;run.failure=String(error);}await context.close();
  }
  await browser.close();await writeFile(`${evidence}/browser-results.json`,JSON.stringify(results,null,2));
  return results;
}
