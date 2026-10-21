import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='D:/Midterm/.scratch/redesign-readiness-2026-10-21/evidence/exterior-controls-2026-10-21';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const results=[];
try{
for(const [mall,port]of[['saigon',4490],['vincom',4491]])for(const mode of ['desktop','phone','reduced']){
const width=mode==='phone'?390:1280,locale=mode==='phone'?'vi':'en';
const page=await browser.newPage({viewport:{width,height:mode==='phone'?844:800},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
const row={mall,mode,checks:[],errors:[]};results.push(row);
page.on('pageerror',e=>row.errors.push(e.message));
const assert=(v,name)=>{row.checks.push({name,pass:!!v});if(!v)throw Error(name)};
try{
await page.goto(`http://127.0.0.1:${port}/${locale}`,{waitUntil:'domcontentloaded',timeout:60000});
await page.locator('.exterior-controls-toggle').waitFor({timeout:30000});
await page.waitForFunction(()=>!document.querySelector('.exterior-controls-toggle')?.disabled,{timeout:90000});
assert(await page.locator('canvas[data-complete-frame]').count()>0,'actual exterior completes a frame');
const canvas=page.locator('.scene-host-exterior canvas');
if(mode==='desktop'){
const start=Date.now();await page.waitForFunction(()=>document.querySelector('.scene-host-exterior canvas')?.dataset.arrival==='complete',{timeout:9000});
row.arrivalRemainingMs=Date.now()-start;assert(row.arrivalRemainingMs>=3500&&row.arrivalRemainingMs<=7000,'arrival settles within finite 5.5s presentation');
const frames=await canvas.getAttribute('data-rendered-frames');await page.waitForTimeout(250);assert(frames===await canvas.getAttribute('data-rendered-frames'),'arrival remains stopped at final frame');
await page.locator('.introduction-controls .replay-control').click();await page.waitForFunction(()=>document.querySelector('.scene-host-exterior canvas')?.dataset.arrival==='playing');await page.keyboard.press('ArrowLeft');assert(await canvas.getAttribute('data-arrival')==='stopped','first keyboard input cancels active arrival');
}else if(mode==='reduced'){
await page.waitForTimeout(700);const before=await page.locator('.scene-host-exterior').screenshot();await page.waitForTimeout(300);const after=await page.locator('.scene-host-exterior').screenshot();assert(before.equals(after),'reduced motion keeps actual exterior visually static');assert(await canvas.getAttribute('data-arrival')!=='playing','reduced motion does not run arrival');
}
await page.locator('.exterior-controls-toggle').click();
assert(await canvas.getAttribute('data-arrival')==='stopped','opening controls stops automatic arrival');
const names=locale==='vi'?{left:'Xoay trái',right:'Xoay phải',up:'Nhìn lên',down:'Nhìn xuống',closer:'Phóng to',farther:'Thu nhỏ',reset:'Đặt lại'}:{left:'Rotate left',right:'Rotate right',up:'Look up',down:'Look down',closer:'Zoom in',farther:'Zoom out',reset:'Reset view'};
for(const name of [names.right,names.up,names.farther])await page.getByRole('button',{name,exact:true}).evaluate(button=>{for(let i=0;i<25;i++)button.click()});
let d=await canvas.evaluate(c=>({...c.dataset}));assert(Number(d.exteriorRotate)<=Math.PI/3&&Number(d.exteriorLook)===.45&&Number(d.exteriorZoom)===1.35,'upper rotate/look/zoom bounds');
for(const name of [names.left,names.down,names.closer])await page.getByRole('button',{name,exact:true}).evaluate(button=>{for(let i=0;i<25;i++)button.click()});
d=await canvas.evaluate(c=>({...c.dataset}));assert(Number(d.exteriorRotate)>=-Math.PI/3&&Number(d.exteriorLook)===-.18&&Number(d.exteriorZoom)===.75,'lower rotate/look/zoom bounds');
await page.getByRole('button',{name:names.reset,exact:true}).click();d=await canvas.evaluate(c=>({...c.dataset}));assert(d.exteriorRotate==='0'&&d.exteriorLook==='0'&&d.exteriorZoom==='1','reset restores neutral view');
assert(await page.locator('.exterior-controls-panel button').evaluateAll(buttons=>buttons.every(b=>b.getBoundingClientRect().height>=44&&b.getBoundingClientRect().width>=44)),'buttons meet44px target');
row.preRepairLayout={scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth),viewport:width,panel:await page.locator('.exterior-controls-panel').boundingBox()};
// Runtime is the actual built output. Overlay only the reviewed CSS repair to
// check its geometry; a fresh build is still needed for final visual evidence.
await page.addStyleTag({content:'.exterior-controls-panel{left:0!important;right:auto!important}'});
const box=await page.locator('.exterior-controls-panel').boundingBox();assert(box.x>=0&&box.x+box.width<=width,'proposed panel alignment repair stays in viewport');
await page.screenshot({path:`${out}/${mall}-${mode}.png`});
assert(row.errors.length===0,'no page errors');
}catch(error){row.failure=String(error);await page.screenshot({path:`${out}/${mall}-${mode}-failed.png`}).catch(()=>{});}
await page.close();
}
}finally{await browser.close();writeFileSync(`${out}/built-results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify({cases:results.length,assertions:results.reduce((n,r)=>n+r.checks.length,0),failed:results.filter(r=>r.failure)}));
