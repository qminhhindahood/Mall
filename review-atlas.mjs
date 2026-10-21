import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('evidence/journey-atlas',{recursive:true});
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report=[];
for(const [mall,port] of [['saigon',4473],['vincom',4474]])for(const [device,width,height] of [['desktop',1440,1000],['phone',390,844]]){
 const p=await b.newPage({viewport:{width,height}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`http://127.0.0.1:${port}/en/prototype/directions`);await p.locator('.atlas-place').first().click();await p.locator('dialog[open]').waitFor();await p.getByRole('button',{name:'Close search',exact:true}).click();
 await p.screenshot({path:`evidence/journey-atlas/${mall}-${device}.png`,fullPage:true});
 const areas=await p.locator('svg path[role=button]').count();
 await p.getByRole('button',{name:'Zoom in',exact:true}).click();const zoom=await p.locator('.atlas-map-controls').innerText();await p.getByRole('button',{name:'Reset map view',exact:true}).click();
 await p.locator('.atlas-primary').click();const step=await p.locator('.atlas-current-step').innerText();
 await p.locator('.atlas-place').first().click();await p.getByRole('textbox',{name:'Search shops'}).fill(mall==='saigon'?'LONGJING':'Chilli');await p.locator('.atlas-search-results button').first().click();
 const blockedShop=await p.locator('.atlas-primary').isDisabled();
 await p.locator('.atlas-place').first().click();await p.getByRole('textbox',{name:'Search shops'}).fill('L1');await p.locator('.atlas-search-results button').first().click();
 const cross=await p.locator('.atlas-status').innerText();await p.screenshot({path:`evidence/journey-atlas/${mall}-${device}-cross-floor.png`,fullPage:true});
 await p.locator('.atlas-floors button').last().click();const floor=await p.locator('.atlas-map-header h2').innerText();
 if(await p.locator('svg path[role=button]').count()){await p.locator('svg path[role=button]').first().focus();await p.keyboard.press('Enter');await p.locator('.atlas-area-selection').waitFor();}
 report.push({mall,device,areas,zoom,step,blockedShop,cross,floor,errors,overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await p.close();
}
await b.close();await writeFile('evidence/journey-atlas/browser-review.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

