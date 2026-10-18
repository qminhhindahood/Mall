import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const out='D:/Midterm/implementation/mall-visitor/evidence/handoff-acceptance-2026-10-18/suite';await mkdir(`${out}/frames`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results={revision:'handoff-acceptance-2026-10-18-r1',browser:browser.version(),profile:'Headless Chrome / SwiftShader; CSS viewports; local static HTTP; not physical devices',runs:[]};
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&(document.querySelector('canvas')?.dataset.completeFrame||document.querySelector('.error')),{},{timeout:45000});
const settle=async page=>{await ready(page);await page.waitForTimeout(100);};
const assert=(row,pass,label)=>{(pass?row.checks:row.failed).push(label);};
const position=async(page,y)=>{await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await settle(page);};
const anchors=page=>page.evaluate(()=>{
 const stage=document.querySelector('.exterior-floor-journey'),hero=document.querySelector('#scene-exterior'),map=document.querySelector('#scene-map'),discovery=document.querySelector('#scene-discovery');
 const top=el=>el.getBoundingClientRect().top+scrollY;
 return {heroBottom:top(hero)+hero.offsetHeight,stageBottom:top(stage)+stage.offsetHeight,mapTop:top(map),discoveryTop:top(discovery),height:innerHeight};
});
async function capture(page,row,name){const path=`frames/${row.mall}-${row.locale}-${row.width}-${name}.png`;await page.screenshot({path:`${out}/${path}`});row.frames.push(path);}
try {
 for(const [mall,port,defaultFloor,count] of [['saigon',4333,'L5',8],['vincom',4334,'B2',7]])for(const locale of ['en','vi'])for(const width of [1280,390]){
  const row={mall,locale,width,mode:'normal-motion-public',checks:[],failed:[],frames:[],samples:[],errors:[]};results.runs.push(row);
  const context=await browser.newContext({viewport:{width,height:width===390?844:800},reducedMotion:'no-preference',recordVideo:locale==='en'?{dir:`${out}/video`,size:{width,height:width===390?844:800}}:undefined});const page=await context.newPage();page.on('pageerror',e=>row.errors.push(e.message));
  try {
   await page.goto(`http://localhost:${port}/${locale}`);await settle(page);await position(page,0);
   assert(row,await page.locator('.registered-floors').evaluate(e=>Number(getComputedStyle(e).opacity)===0),'Opening hero has no floor overlay');
   assert(row,!await page.locator('.skip-discovery').isVisible(),'Discovery skip absent from opening hero');
   assert(row,await page.locator('.floor-rail a').count()===count,'Every shopping level has a label');
   await capture(page,row,'hero');
   const a=await anchors(page);
   // Actual scrolling samples both changing layers rather than endpoint-only checks.
   const approachStart=width===390?await page.locator('.registered-scene').evaluate(e=>e.offsetTop-116):0;const fadeStart=approachStart+a.height*.55;
   for(const [i,y] of [fadeStart,fadeStart+a.height*.12,fadeStart+a.height*.24].entries()){
    await position(page,y);row.samples.push(await page.evaluate(()=>({scrollY,exteriorOpacity:Number(getComputedStyle(document.querySelector('.scene-host-exterior')).opacity),floorOpacity:Number(getComputedStyle(document.querySelector('.registered-floors')).opacity)})));if(i===1)await capture(page,row,'fade');
   }
   assert(row,row.samples.some(s=>s.exteriorOpacity>0&&s.exteriorOpacity<1&&s.floorOpacity>0&&s.floorOpacity<1),'Intermediate exterior fade and floor reveal are simultaneously visible');
   // A native-flow phone overview sits above the explanatory reading block.
   const stackY=approachStart+a.height;
   await position(page,stackY);await capture(page,row,'stack');
   const labels=await page.locator('.floor-rail a').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),top:r.top,bottom:r.bottom,left:r.left,right:r.right,font:parseFloat(getComputedStyle(e).fontSize),opacity:Number(getComputedStyle(e.parentElement).opacity),line:!!e.querySelector('.floor-callout-line')?.style.width};}));row.labels=labels;
   assert(row,labels.every(l=>l.top>=0&&l.bottom<= (width===390?844:800)&&l.font>=16&&l.opacity>.95),'All floor callouts readable together in overview');
   assert(row,labels.every(l=>l.line),'Every callout receives a measured connector');
   assert(row,await page.locator('.skip-discovery').isVisible(),'Localized Discovery skip visible after hero');
   // Skip is tested before any visitor floor choice.
   await page.locator('.skip-discovery').click();await settle(page);
   assert(row,new URL(page.url()).searchParams.get('view')==='discovery'&&await page.locator('#scene-discovery').evaluate(e=>e===document.activeElement),'Skip goes directly to focused Discovery');
   assert(row,new URL(page.url()).searchParams.get('floor')===defaultFloor,'Skip needs no floor selection and retains default');
   await page.goBack();await settle(page);assert(row,new URL(page.url()).searchParams.get('view')!=='discovery','Back restores skipped overview');
   await position(page,stackY);
   for(const label of labels){
    await page.locator('.floor-rail a').filter({hasText:new RegExp(`^${label.text}$`)}).click();await settle(page);
    await page.waitForFunction(id=>document.querySelector('.persistent-map [data-floor]')?.dataset.floor===id,label.text);
    await page.waitForTimeout(800);
    assert(row,new URL(page.url()).searchParams.get('floor')===label.text,`Label selects ${label.text}`);
    const identity=await page.evaluate(id=>{const paths=sel=>[...document.querySelectorAll(sel+' path')].map(p=>p.getAttribute('d'));const source=paths(`.overview-stack a[data-floor-id="${id}"]`),map=paths('.map-transform');return source.length>0&&JSON.stringify(source)===JSON.stringify(map);},label.text);
    assert(row,identity,`Source contours retained in ${label.text} detailed map`);
    if(['L6','B2','B3','L2','M'].includes(label.text))await capture(page,row,`map-${label.text}`);
    await position(page,stackY);
    assert(row,new URL(page.url()).searchParams.get('floor')===label.text,`Reverse scroll retains ${label.text}`);
   }
   // Representative physical floor-surface click (top plane is unobstructed).
   const hit=await page.locator('.overview-stack a').first().evaluate(e=>{const r=e.getBoundingClientRect();for(let y=r.top;y<r.bottom;y+=8)for(let x=r.left;x<r.right;x+=8){const h=document.elementFromPoint(x,y);if(h?.closest('.overview-stack a')===e)return{x,y};}return null;});
   if(hit){const topId=await page.locator('.overview-stack a').first().getAttribute('data-floor-id');await page.mouse.click(hit.x,hit.y);await settle(page);await page.waitForTimeout(800);assert(row,new URL(page.url()).searchParams.get('floor')===topId,'Floor surface selects its level');}else assert(row,false,'Floor surface exposes a clickable region');
   await position(page,stackY);
   const selected=new URL(page.url()).searchParams.get('floor');
   const flightStart=a.stageBottom-a.height;
   const flightEnd=a.mapTop-(width===390?116:120);
   for(const [i,fraction]of [.2,.5,.8].entries()){
    await position(page,flightStart+(flightEnd-flightStart)*fraction);const sample=await page.locator('.travelling-floor').evaluate(e=>({hidden:e.hidden,transform:getComputedStyle(e).transform,rect:e.getBoundingClientRect().toJSON()}));row.samples.push({flight:fraction,...sample});if(i===1)await capture(page,row,'travel');
   }
   assert(row,row.samples.filter(s=>s.flight).some(s=>!s.hidden),'Selected floor has a visible intermediate travel state');
   await position(page,a.mapTop-100);const mapHandle=await page.locator('.map-transform').elementHandle();await capture(page,row,'map');
   await position(page,a.discoveryTop-200);assert(row,await page.locator('.map-transform').evaluate((e,prior)=>e===prior,mapHandle),'Same practical map persists into Discovery');await capture(page,row,'discovery');
   await position(page,stackY);assert(row,new URL(page.url()).searchParams.get('floor')===selected,'Discovery reverse keeps selected floor');
   await position(page,0);assert(row,new URL(page.url()).searchParams.get('view')==='exterior'&&new URL(page.url()).searchParams.get('floor')===selected,'Reverse scroll restores exterior and selected floor');await capture(page,row,'reverse-hero');
   assert(row,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
   assert(row,await page.locator('.directory-panel').innerText().then(t=>t.includes(locale==='vi'?'chờ duyệt':'pending')),'Public content remains pending');
  }catch(error){row.failed.push(error.message);await page.screenshot({path:`${out}/frames/${mall}-${locale}-${width}-failure.png`});}
  finally{if(row.errors.length)row.failed.push('Browser page errors');console.log(JSON.stringify({mall,locale,width,checks:row.checks.length,failed:row.failed}));await context.close();await writeFile(`${out}/browser-results.json`,JSON.stringify(results,null,2)+'\n');}
 }
}finally{await browser.close();}
if(results.runs.some(r=>r.failed.length))process.exitCode=1;
