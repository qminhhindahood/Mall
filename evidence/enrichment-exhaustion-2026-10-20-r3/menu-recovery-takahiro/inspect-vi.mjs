import { chromium } from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const dir=new URL('./',import.meta.url);
const brands=['bastahiro','asanoha','gyushige','jindinrou','oedoalley','ichibankenramen','somtumthai'];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
for(const brand of brands){
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const responses=[];
 page.on('response',async r=>{if(/json/i.test(r.headers()['content-type']||'')){try{responses.push({url:r.url(),body:await r.text()});}catch{}}});
 try{
  await page.goto(`https://${brand}.com.vn/`,{waitUntil:'networkidle',timeout:45000});
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(150);}
  await page.waitForTimeout(1000);
  const data=await page.evaluate(()=>({url:location.href,text:document.body.innerText,html:document.documentElement.outerHTML,links:[...document.querySelectorAll('a')].map(e=>({text:e.innerText,href:e.href})),images:[...document.images].map(e=>({alt:e.alt,src:e.currentSrc,html:e.outerHTML})),scripts:[...document.scripts].map(e=>({src:e.src,text:e.src?'':e.textContent}))}));
  data.responses=responses;await fs.writeFile(new URL(brand+'-vi.json',dir),JSON.stringify(data,null,2));
  await page.screenshot({path:new URL(brand+'-vi.png',dir).pathname.replace(/^\/D:/,'D:'),fullPage:true});
  console.log(brand,JSON.stringify({links:data.links.filter(x=>/menu|th.c.đ.n|pdf/i.test(x.text+' '+x.href)),images:data.images.length,responses:responses.map(x=>x.url)}));
 }catch(e){console.log(brand,String(e));await fs.writeFile(new URL(brand+'-error.txt',dir),String(e));}
 await page.close();
}
await browser.close();
