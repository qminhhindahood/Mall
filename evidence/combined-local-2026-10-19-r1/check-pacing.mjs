import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const out='evidence/combined-local-2026-10-19-r1';await mkdir(out+'/frames',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});const rows=[];
try{for(const [mall,port] of [['saigon',4401],['vincom',4402]])for(const width of [1280,390])for(const locale of ['en','vi']){
 const height=width===390?844:800,context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'}),page=await context.newPage();const row={mall,locale,width,height,samples:[],failed:[]};rows.push(row);
 await page.goto('http://localhost:'+port+'/'+locale+'?view=map');await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
 for(const [label,selector,target] of [['invitation-entry','.discovery-introduction h2',height*.9],['invitation-center','.discovery-introduction h2',height*.4],['discovery-entry','#scene-discovery',height*.5],['settled','#scene-discovery',120]]){
  await page.evaluate(({selector,target})=>{scrollTo({top:scrollY+document.querySelector(selector).getBoundingClientRect().top-target,behavior:'instant'});dispatchEvent(new Event('scroll'));},{selector,target});await page.waitForTimeout(350);await page.waitForFunction(()=>!document.querySelector('.loading-screen'));
  const state=await page.evaluate(()=>({y:scrollY,invitationTitle:document.querySelector('.discovery-introduction h2').getBoundingClientRect().toJSON(),discoveryTop:document.querySelector('#scene-discovery').getBoundingClientRect().top,controlsVisible:getComputedStyle(document.querySelector('.persistent-map .map-controls')).visibility!=='hidden',opacity:Number(getComputedStyle(document.querySelector('.persistent-map')).opacity)}));row.samples.push({label,...state});await page.screenshot({path:out+'/frames/'+mall+'-'+width+'-'+locale+'-'+label+'.png'});
  if(label==='invitation-entry'&&state.opacity<.5)row.failed.push('Map clears before invitation is visible');
  if(label==='invitation-entry'&&state.controlsVisible)row.failed.push('Control bar overlaps invitation entry');
  if(label==='settled'&&width!==390&&!state.controlsVisible)row.failed.push('Map controls fail to return');
  if(label==='invitation-center'&&state.opacity>.01)row.failed.push('Map overlaps centered invitation');
  if(label==='discovery-entry'&&state.opacity<.05)row.failed.push('Map return delayed after Discovery entry');
 }
 await context.close();console.log(JSON.stringify(row));await writeFile(out+'/pacing-results.json',JSON.stringify(rows,null,2)+'\n');
}}finally{await browser.close()}if(rows.some(r=>r.failed.length))process.exitCode=1;


