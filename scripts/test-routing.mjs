// Browser-level checks for Directions routing and map zoom.
// Usage: node scripts/test-routing.mjs <saigonPort> <vincomPort>
import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
const [saigonPort=4692,vincomPort=4711]=process.argv.slice(2).map(Number);
const cases=[
  {mall:'Saigon',port:saigonPort,name:'same floor, two shops',q:'to=saigon-prototype-mlb&floor=L3&from=saigon-prototype-adidas&fromFloor=L3',min:2,cross:false},
  {mall:'Saigon',port:saigonPort,name:'between floors by lift',q:'to=saigon-prototype-mlb&floor=L3&from=saigon-prototype-meatmeet&fromFloor=B2',min:5,cross:true},
  {mall:'Saigon',port:saigonPort,name:'shop to a floor-only Takashimaya brand',q:'to=saigon-takashimaya-clarks&floor=B1&from=saigon-prototype-calvinklein&fromFloor=L2',min:4,cross:true},
  {mall:'Saigon',port:saigonPort,name:'from a public entrance',q:'to=saigon-prototype-mlb&floor=L3&from=saigon-entrance-door-1&fromFloor=L1',min:4,cross:true},
  {mall:'Saigon',port:saigonPort,name:'floor-only brand to floor-only brand',q:'to=saigon-takashimaya-hugo&floor=L2&from=saigon-takashimaya-clarks&fromFloor=B1',min:4,cross:true},
  {mall:'Vincom',port:vincomPort,name:'same floor, two shops',q:'to=vincom-prototype-watsons&floor=B2&from=vincom-prototype-giordano&fromFloor=B2',min:2,cross:false},
];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
const failures=[],lines=[];
for(const c of cases){
  const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(`http://127.0.0.1:${c.port}/en/directions?${c.q}`,{waitUntil:'networkidle'});await page.waitForTimeout(2500);
    const primary=(await page.locator('.atlas-primary').textContent())??'';
    const ok=/Show route steps/i.test(primary);
    const status=ok?'route ready':(await page.locator('.atlas-status strong').first().textContent().catch(()=>primary));
    const steps=[];
    if(ok){
      await page.locator('.atlas-primary').click();await page.waitForTimeout(300);
      for(let i=0;i<20;i++){const s=await page.locator('.atlas-current-step strong').first().textContent().catch(()=>null);if(!s)break;steps.push(s);const label=await page.locator('.atlas-primary').textContent();if(/Finish/.test(label))break;await page.locator('.atlas-primary').click();await page.waitForTimeout(200);}
    }
    const label=`${c.mall}: ${c.name}`;lines.push(`${label} -> ${status} (${steps.length} steps)`);
    if(!ok)failures.push(`${label}: no route (${status})`);
    else{
      if(steps.length<c.min)failures.push(`${label}: only ${steps.length} steps`);
      if(c.cross&&!steps.some(s=>/lift|escalator/i.test(s)))failures.push(`${label}: no lift or escalator step`);
      if(!c.cross&&steps.some(s=>/lift|escalator/i.test(s)))failures.push(`${label}: unexpected floor change`);
    }
    if(errors.length)failures.push(`${label}: page error ${errors[0]}`);
  }catch(e){failures.push(`${c.mall}: ${c.name}: ${String(e.message).split('\n')[0]}`);}
  await page.close();
}
// Zoom grows from the middle of the map, not from its top-left corner.
for(const [mall,port] of [['Saigon',saigonPort],['Vincom',vincomPort]]){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(`http://127.0.0.1:${port}/en/directions`,{waitUntil:'networkidle'});await page.waitForTimeout(1200);
  await page.locator('.atlas-map-controls button').nth(1).click();await page.waitForTimeout(400);
  const moved=await page.locator('.atlas-map-scroll').evaluate(e=>({left:e.scrollLeft,top:e.scrollTop,w:e.clientWidth,h:e.clientHeight,sw:e.scrollWidth}));
  lines.push(`${mall}: zoom in -> scroll ${Math.round(moved.left)},${Math.round(moved.top)} of ${moved.sw}px`);
  if(!(moved.left>moved.w*0.15&&moved.top>moved.h*0.15))failures.push(`${mall}: zoom did not anchor on the map centre (${Math.round(moved.left)},${Math.round(moved.top)})`);
  await page.close();
}
await browser.close();
console.log(lines.join('\n'));
console.log(JSON.stringify({failures},null,1));
process.exit(failures.length?1:0);
