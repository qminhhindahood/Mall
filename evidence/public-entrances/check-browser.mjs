// Run only after the parent completes fresh builds. No dependencies are installed.
import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const base=process.env.SAIGON_URL??'http://127.0.0.1:4490';
const vincom=process.env.VINCOM_URL??'http://127.0.0.1:4491';
const output=new URL('./',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[];
try{
 for(const locale of ['en','vi'])for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/${locale}/${locale==='en'?'directions':'chi-duong'}`);
  await page.locator('.atlas-places').waitFor();
  await page.locator('.atlas-floors button').getByText('L1',{exact:true}).click();
  assert.equal(await page.locator('[data-entrance-id]').count(),3);
  const destination=await page.locator('.atlas-place').nth(1).innerText();
  for(const id of ['1','3','4']){
   const marker=page.locator(`[data-entrance-id="saigon-entrance-door-${id}"]`);
   await marker.focus();await marker.press('Enter');
   const popup=page.locator('[data-entrance-popup]');await popup.waitFor();
   const name=await popup.locator('strong').innerText();
   await popup.getByRole('button',{name:locale==='en'?'Start here':'Bắt đầu tại đây',exact:true}).click();
   assert.ok((await page.locator('.atlas-place').first().innerText()).includes(name));
   assert.match(await page.locator('.atlas-status').innerText(),locale==='en'?/connection not reviewed/:/chưa được kiểm tra/);
   assert.equal(await page.locator('.atlas-primary').isDisabled(),true);
   assert.equal(await page.locator('.atlas-route').count(),0);
   assert.equal(await page.locator('.atlas-place').nth(1).innerText(),destination);
  }
  await page.screenshot({path:new URL(`${locale}-${width}.png`,output).pathname.slice(1),fullPage:true});
  const language=await page.locator('a[lang]').getAttribute('href');
  await page.goto(new URL(language,base).href);await page.locator('.atlas-places').waitFor();
  assert.match(await page.locator('.atlas-place').first().innerText(),/Pasteur/);
  assert.equal(await page.locator('.atlas-primary').isDisabled(),true);
  await page.locator('.atlas-floors button').getByText('L2',{exact:true}).click();
  assert.equal(await page.locator('[data-entrance-id]').count(),0);
  assert.deepEqual(errors,[]);results.push({locale,width,status:'passed'});await page.close();
 }
 const page=await browser.newPage();await page.goto(`${vincom}/en/directions`);await page.locator('.atlas-places').waitFor();
 await page.locator('.atlas-floors button').getByText('L1',{exact:true}).click();assert.equal(await page.locator('[data-entrance-id]').count(),0);await page.close();
 results.push({case:'Vincom has no guessed entrance markers',status:'passed'});
}catch(error){results.push({status:'failed',error:String(error)});throw error}
finally{await writeFile(new URL('browser-results.json',output),JSON.stringify(results,null,2));await browser.close()}
