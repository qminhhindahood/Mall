import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation';mkdirSync(`${out}/guidance-frames`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const receipt={at:new Date().toISOString(),browser:browser.version(),scope:'Public browser guidance: manual saved starting floor, selected destination floor only; no walking topology, position detection or accessibility route claim.',runs:[]};
const copy={en:{title:'Find this destination',target:'Selected destination floor',same:'Your selected starting floor matches the selected destination floor.',different:'The selected destination floor differs from your selected starting floor.',floorOnly:'Only the floor is confirmed; an exact storefront is not marked.',limit:'Walking routes are not available:',manual:'Your position is not detected.'},vi:{title:'Tìm địa điểm này',target:'Tầng đã chọn của địa điểm',same:'Tầng bắt đầu đã chọn trùng với tầng đã chọn của địa điểm.',different:'Tầng đã chọn của địa điểm khác với tầng bắt đầu đã chọn.',floorOnly:'Chỉ xác nhận được tầng; chưa đánh dấu vị trí cửa hàng chính xác.',limit:'Chưa có chỉ đường đi bộ:',manual:'Vị trí của bạn không được tự động xác định.'}};
const ready=page=>page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});
const route=(port,locale,d,floor=d.primaryFloor,kind='discovery')=>`http://127.0.0.1:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?floor=${floor}&view=${kind}`;
const official=(mall,locale)=>mall==='saigon-centre'?`https://shopping.saigoncentre.com.vn/${locale}/floorplan`:'https://vincom.com.vn/vincom-center-dong-khoi';
const save=()=>writeFileSync(`${out}/indoor-guidance-results.json`,JSON.stringify(receipt,null,2)+'\n');
async function openGuide(page,container='.discovery-glass'){
 const guide=page.locator(`${container} [data-indoor-guidance]`);await guide.waitFor();
 if(await guide.getAttribute('open')===null){await guide.locator('summary').focus();await page.keyboard.press('Enter');}
 await guide.locator('select').waitFor();return guide;
}
async function relation(guide,value,assert){await guide.locator(`[data-floor-relation="${value}"]`).waitFor();assert(true,`Manual comparison is ${value}`);}
async function truth(page,guide,mall,locale,target,assert){
 assert(await guide.locator('summary').textContent()===copy[locale].title,'Guidance summary is exactly localized');
 assert((await guide.locator(':scope >p strong').textContent())===`${copy[locale].target}: ${target}`,'Target identifies the selected destination floor');
 assert((await guide.locator('.indoor-guidance-limit').textContent()).startsWith(copy[locale].limit),'Unsupported walking routes remain explicitly withheld');
 assert(await guide.locator('svg,canvas').count()===0,'Guidance invents no walking-path visual');
 const link=guide.locator('[data-indoor-official-link]'),rel=String(await link.getAttribute('rel')).split(/\s+/);
 assert(await link.getAttribute('href')===official(mall,locale)&&await link.getAttribute('target')==='_blank'&&['noopener','noreferrer'].every(token=>rel.includes(token)),'Correct official mall fallback opens safely in a new tab');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Guidance causes no document overflow');
}
async function idAndType(page,guide,assert){
 const select=guide.locator('select'),id=await select.getAttribute('id');
 assert(!!id&&await guide.locator('label').getAttribute('for')===id&&await page.evaluate(id=>[...document.querySelectorAll('[id]')].filter(e=>e.id===id).length,id)===1,'Starting-floor selector has a unique associated label');
 assert(await select.evaluate(e=>e.getBoundingClientRect().height>=44),'Starting-floor selector meets 44px target');
 assert(await guide.evaluate(e=>[...e.querySelectorAll('p,a,label,summary,select')].every(n=>parseFloat(getComputedStyle(n).fontSize)>=16)),'Guidance text and controls meet 16px minimum');
}
function watchPosition(){window.__guidanceGeolocationCalls=0;for(const name of ['getCurrentPosition','watchPosition'])Object.defineProperty(navigator.geolocation,name,{configurable:true,value(){window.__guidanceGeolocationCalls++;throw Error('Unexpected position request');}});}
try{
 for(const [mall,port]of[['saigon-centre',4431],['vincom-dong-khoi',4432]])for(const locale of['en','vi'])for(const width of[1280,390])for(const type of['manual','multi-floor','floor-only','no-javascript']){
  if(process.env.GUIDANCE_TYPE&&type!==process.env.GUIDANCE_TYPE)continue;
  const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`)),floors=JSON.parse(readFileSync(`dist/${mall}/data/floor-geometry.json`)).floors.map(f=>f.id);
  const mapped=data.destinations.find(d=>d.floors.length===1&&d.locations.some(l=>l.certainty==='area-confirmed'&&l.areaIds.length));
  const multi=data.destinations.find(d=>d.id===(mall==='saigon-centre'?'saigon-prototype-takashimaya':'vincom-prototype-zara'));
  const floorOnly=data.destinations.find(d=>d.floors.length===1&&d.locations.every(l=>!l.areaIds.length));
  const destination=type==='multi-floor'?multi:type==='floor-only'?floorOnly:mapped;
  const row={mall,locale,width,type,destinationId:destination?.id,checks:[],failed:[],pageErrors:[]};receipt.runs.push(row);
  const assert=(pass,label)=>{row.checks.push({label,pass:!!pass});if(!pass)throw Error(label);};
  const context=await browser.newContext({viewport:{width,height:844},javaScriptEnabled:type!=='no-javascript',reducedMotion:locale==='vi'?'reduce':'no-preference'});await context.addInitScript(watchPosition);
  const page=await context.newPage();page.on('pageerror',e=>row.pageErrors.push(e.message));
  try{
   if(!destination)throw Error(`No real ${type} representative`);
   const primary=destination.primaryFloor,key=`mall-guide:starting-floor:${mall}`;
   await page.goto(route(port,locale,destination));
   if(type==='no-javascript'){
    const guide=page.locator('.static-guide [data-indoor-guidance]');await guide.waitFor();
    await guide.locator('summary').focus();await page.keyboard.press('Enter');
    assert(await guide.getAttribute('open')!==null,'Native noJS guidance disclosure opens by keyboard');
    assert(await guide.locator('select').count()===0,'NoJS does not expose an inert manual selector');
    await truth(page,guide,mall,locale,primary,assert);
    const map=guide.locator('a[href*="view=map"]'),url=new URL(await map.getAttribute('href'),page.url());
    assert(url.pathname.endsWith('/'+destination.id)&&url.searchParams.get('floor')===primary,'NoJS destination-floor link preserves identity and floor');
    const response=await context.request.get(url.href);assert(response.status()===200&&(await response.text()).includes('static-guide'),'NoJS destination-floor action has useful shipped HTML');
    await page.screenshot({path:`${out}/guidance-frames/${mall}-${locale}-${width}-${type}.png`});
    continue;
   }
   await ready(page);let guide=await openGuide(page);await truth(page,guide,mall,locale,primary,assert);await idAndType(page,guide,assert);
   const select=guide.locator('select');assert(await select.inputValue()==='','Fresh tab starts without an invented position');await relation(guide,'unknown',assert);
   assert((await guide.locator('.indoor-guidance-start p').textContent()).includes(copy[locale].manual),'Manual help explicitly denies position detection');
   assert(JSON.stringify(await select.locator('option').evaluateAll(options=>options.map(o=>o.value)))===JSON.stringify(['',...floors]),'Manual start offers only supported mall floors');
   if(type==='manual'){
    const before=page.url(),mapFloor=await page.locator('.scene-host-map').getAttribute('data-floor');
    await select.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');
    assert(await select.inputValue()===floors[0],'Native starting-floor control responds to keyboard');
    await select.selectOption(primary);await relation(guide,'same-floor',assert);
    assert(await guide.locator('[data-floor-relation]').textContent()===copy[locale].same,'Same-floor copy scopes the selected starting and destination floors');
    const other=floors.find(f=>f!==primary);await select.selectOption(other);await relation(guide,'different-floor',assert);
    assert((await guide.locator('[data-floor-relation]').textContent()).startsWith(copy[locale].different),'Cross-floor copy scopes the selected destination floor');
    assert(page.url()===before&&await page.locator('.scene-host-map').getAttribute('data-floor')===mapFloor,'Manual start changes neither target URL nor map floor');
    assert(await page.evaluate(key=>sessionStorage.getItem(key),key)===other,'Starting floor is saved for this mall in the current tab');
    if(width===390)await page.locator('.discovery-map-context button').click();
    await page.locator('.map-controls button').nth(1).click();assert(await guide.locator('select').inputValue()===other&&page.url()===before,'Map control retains open guidance and saved start');
    await guide.locator('select').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/guidance-frames/${mall}-${locale}-${width}-${type}.png`});
    await guide.locator('a[href*="view=map"]').click();await ready(page);guide=await openGuide(page,'.destination');
    assert(await guide.locator('select').inputValue()===other,'Destination map navigation retains saved starting floor');
    await page.goBack();await ready(page);guide=await openGuide(page);assert(await guide.locator('select').inputValue()===other,'Back restores selected destination and saved start');
    const translated=locale==='en'?'vi':'en';await page.locator(`.journey-header a[lang=${translated}]`).click();await ready(page);guide=await openGuide(page);
    assert(await guide.locator('select').inputValue()===other&&new URL(page.url()).searchParams.get('floor')===primary,'Locale navigation retains selected destination floor and manual start');
    await truth(page,guide,mall,translated,primary,assert);await relation(guide,'different-floor',assert);
    await page.goBack();await ready(page);guide=await openGuide(page);assert(await guide.locator('select').inputValue()===other,'Locale Back retains manual start');
    await guide.locator('select').selectOption('');await relation(guide,'unknown',assert);assert(await page.evaluate(key=>sessionStorage.getItem(key),key)===null,'Unknown starting floor clears the saved value');
    await page.reload();await ready(page);guide=await openGuide(page);assert(await guide.locator('select').inputValue()==='','Cleared starting floor stays unknown after refresh');
   }else if(type==='multi-floor'){
    const start=destination.floors.includes('B2')?'B2':destination.floors[0],target=destination.floors.includes('L3')?'L3':destination.floors.at(-1);
    row.startingFloor=start;row.comparedTargetFloor=target;
    await select.selectOption(start);
    const links=page.locator('.discovery-glass nav a');assert(JSON.stringify((await links.allTextContents()).map(s=>s.trim()).sort())===JSON.stringify([...destination.floors].sort()),'Every verified destination floor remains available');
    await links.filter({hasText:new RegExp('^'+target+'$')}).click();await ready(page);guide=await openGuide(page);await relation(guide,'different-floor',assert);
    assert(destination.floors.includes(start)&&await guide.locator('select').inputValue()===start,'Start is retained even when destination also occupies that floor');
    assert((await guide.locator('[data-floor-relation]').textContent()).startsWith(copy[locale].different),'Multi-floor wording compares only selected target; it does not claim absence from start');
    assert((await guide.locator(':scope >p strong').textContent())===`${copy[locale].target}: ${target}`&&await page.locator('.scene-host-map').getAttribute('data-floor')===target,'Selected alternate destination floor controls guidance and map');
    await guide.locator('select').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/guidance-frames/${mall}-${locale}-${width}-${type}.png`});
    await links.filter({hasText:new RegExp('^'+start+'$')}).click();await ready(page);guide=await openGuide(page);await relation(guide,'same-floor',assert);
    assert(await guide.locator('select').inputValue()===start,'Switching target floor preserves the saved starting choice');
   }else{
    assert((await guide.textContent()).includes(copy[locale].floorOnly),'Held location explicitly withholds exact storefront');
    assert(await page.locator('.map-transform path[data-selected=true]').count()===0,'Floor-only destination invents no map marker');
    await select.selectOption(primary);await relation(guide,'same-floor',assert);
    assert(await page.locator('.map-transform path[data-selected=true]').count()===0,'Manual floor comparison adds no false location geometry');
    await guide.locator('select').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/guidance-frames/${mall}-${locale}-${width}-${type}.png`});
   }
   assert(await page.evaluate(()=>window.__guidanceGeolocationCalls)===0,'Guidance never requests geolocation');
   assert(row.pageErrors.length===0,'No uncaught guidance errors');
  }catch(error){row.failed.push(error.message);}finally{await context.close();save();console.log(JSON.stringify({mall,locale,width,type,checks:row.checks.length,failed:row.failed}));}
 }
 for(const [mall,port]of[['saigon-centre',4431],['vincom-dong-khoi',4432]])for(const locale of['en','vi']){
  if(process.env.GUIDANCE_TYPE&&process.env.GUIDANCE_TYPE!=='storage')continue;
  const data=JSON.parse(readFileSync(`data/malls/${mall}/directory.json`)),d=data.destinations.find(d=>d.floors.length===1),key=`mall-guide:starting-floor:${mall}`,otherKey=`mall-guide:starting-floor:${mall==='saigon-centre'?'vincom-dong-khoi':'saigon-centre'}`;
  const row={mall,locale,width:390,type:'storage',checks:[],failed:[],pageErrors:[]};receipt.runs.push(row);const assert=(pass,label)=>{row.checks.push({label,pass:!!pass});if(!pass)throw Error(label);};let context;
  try{
   context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await context.addInitScript(({key,otherKey})=>{sessionStorage.setItem(key,'NOT-A-MALL-FLOOR');sessionStorage.setItem(otherKey,'L2');},{key,otherKey});
   let page=await context.newPage();await page.goto(route(port,locale,d));await ready(page);let guide=await openGuide(page);
   assert(await guide.locator('select').inputValue()===''&&await page.evaluate(key=>sessionStorage.getItem(key),key)===null,'Invalid saved floor is cleared rather than treated as position');
   assert(await page.evaluate(key=>sessionStorage.getItem(key),otherKey)==='L2','Another mall key is ignored and retained separately');
   await context.close();context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await context.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('Unavailable in browser test','SecurityError');}}));
   page=await context.newPage();page.on('pageerror',e=>row.pageErrors.push(e.message));await page.goto(route(port,locale,d));await ready(page);guide=await openGuide(page);
   await guide.locator('select').selectOption(d.primaryFloor);await relation(guide,'same-floor',assert);
   assert(await guide.locator('select').inputValue()===d.primaryFloor,'Unavailable storage preserves mounted manual comparison');
   await page.screenshot({path:`${out}/guidance-frames/${mall}-${locale}-390-storage.png`});
   await page.reload();await ready(page);guide=await openGuide(page);assert(await guide.locator('select').inputValue()==='','Unavailable storage returns honestly to unknown on full reload');
   assert(row.pageErrors.length===0,'Storage exceptions never become uncaught page errors');
  }catch(error){row.failed.push(error.message);}finally{await context?.close();save();console.log(JSON.stringify({mall,locale,type:'storage',checks:row.checks.length,failed:row.failed}));}
 }
}finally{await browser.close();}
console.log(JSON.stringify({cases:receipt.runs.length,assertions:receipt.runs.reduce((n,r)=>n+r.checks.length,0),failures:receipt.runs.flatMap(r=>r.failed)}));
if(receipt.runs.some(r=>r.failed.length))process.exitCode=1;
