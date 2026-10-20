import {chromium} from 'file:///D:/Midterm/.scratch/impeccable-browser/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const out='evidence/enrichment-exhaustion-2026-10-20-r3/validation'; mkdirSync(out+'/frames',{recursive:true});
const receipt={at:new Date().toISOString(),static:[],categories:[],runs:[],failed:[]};
const input=mall=>JSON.parse(readFileSync(`data/malls/${mall}/directory.json`));
const proposals=JSON.parse(readFileSync('src/data/enrichment-accepted.json')).records;
receipt.enrichment={records:proposals.length,fields:proposals.reduce((n,r)=>n+r.fields.length,0),renderedFieldChecks:0,failures:[]};
const malls=[['saigon-centre',4431],['vincom-dong-khoi',4432]];
const decode=html=>html.replaceAll('&#39;',"'").replaceAll('&#x27;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const route=(locale,d,kind='discovery')=>`/${locale}/${locale==='vi'?'cua-hang':'stores'}/${d.id}?view=${kind}&floor=${d.primaryFloor}&collection=${d.categories[0]}`;
const save=()=>writeFileSync(out+'/discovery-results.json',JSON.stringify(receipt,null,2)+'\n');
for(const [mall,port] of malls) {
  const data=input(mall),row={mall,checks:0,failures:[]};receipt.static.push(row);
  for(const d of data.destinations) for(const locale of ['en','vi']) {
    const r=await fetch(`http://localhost:${port}${route(locale,d)}`),html=decode(await r.text());
    const expected=d.description[locale]||(locale==='vi'?'Nội dung giới thiệu đang chờ duyệt.':'Introduction awaiting editorial review.');
    const staticBody=html.slice(html.indexOf('class="static-guide"'));
    if(r.status!==200||!staticBody.includes(expected)||!staticBody.includes(`data-destination-details="${d.id}"`))row.failures.push(d.id+'/'+locale+' essential static details');
    for(const field of proposals.find(p=>p.mallId===mall&&p.destinationId===d.id)?.fields??[]) {
      receipt.enrichment.renderedFieldChecks++;
      const fieldBody=staticBody.match(new RegExp(`<div[^>]*data-detail-field="${field.field}"[^>]*>([\\s\\S]*?)</div>`))?.[1]??'';
      const exact=!!fieldBody&&(!field.url||fieldBody.includes(field.url))&&(!field.value||fieldBody.includes(field.value[locale]))&&fieldBody.includes(field.sourceUrl)&&fieldBody.includes(field.checkedAt)&&fieldBody.includes(field.uncertainty[locale]);
      if(!exact){const failure=d.id+'/'+locale+' accepted static value/source/date/caveat '+field.field;row.failures.push(failure);receipt.enrichment.failures.push(failure);}
    }
    if(d.website&&!proposals.find(p=>p.mallId===mall&&p.destinationId===d.id)?.fields.some(f=>f.field==='website')&&!staticBody.includes(d.website))row.failures.push(d.id+'/'+locale+' legacy website fallback missing');
    row.checks++;
  }
  for(const id of ['vincom-prototype-cara','vincom-prototype-lizdnamat','vincom-prototype-mujoshtedbaker','test-coffee'])for(const locale of ['en','vi']){
    const r=await fetch(`http://localhost:${port}/${locale}/${locale==='vi'?'cua-hang':'stores'}/${id}`);if(r.status!==404)row.failures.push('Excluded/fixture route '+id);row.checks++;
  }
}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
const ready=async page=>{await page.waitForFunction(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.completeFrame,null,{timeout:45000});};
const waitDetail=page=>page.locator('.discovery-glass').waitFor();
// One representative from every actual category, in both languages. No category silently skipped.
for(const [mall,port] of malls) for(const locale of ['en','vi']) {
  const data=input(mall),page=await browser.newPage({viewport:{width:locale==='vi'?390:1280,height:844},reducedMotion:'reduce'});
  for(const category of data.categories) {
    const d=data.destinations.find(d=>d.categories.includes(category.id)),r={mall,locale,categoryId:category.id,destinationId:d?.id,checks:[],failed:[]};receipt.categories.push(r);
    const assert=(value,label)=>{r.checks.push({label,pass:!!value});if(!value)throw Error(label);};
    try {
      if(!d){assert(true,'Empty category explicitly accounted');continue;}
      await page.goto(`http://localhost:${port}${route(locale,d).replace('collection='+d.categories[0],'collection='+category.id)}`);await ready(page);await waitDetail(page);
      const body=page.locator('.discovery-glass [data-destination-details]');
      assert(await body.getAttribute('data-destination-details')===d.id,'Category representative opens independent identity');
      assert(await page.locator('#discovery-glass-description').textContent()===(d.description[locale]||(locale==='vi'?'Nội dung giới thiệu đang chờ duyệt.':'Introduction awaiting editorial review.')),'Exact accepted description or truthful hold');
      assert((await body.textContent()).includes(category.name[locale]),'Category label retained');
      assert(await body.locator('[data-detail-field=menu]').count()===0||data.categories.filter(c=>d.categories.includes(c.id)).some(c=>c.name.en==='Dining'),'Menu restricted to dining');
      assert(await page.locator('.discovery-glass img').count()===0,'No destination photo added');
      if(!d.locations.find(l=>l.floorId===d.primaryFloor)?.areaIds.length)assert(await page.locator('.map-transform path[data-selected=true]').count()===0,'Floor-only has no false marker');
      await page.keyboard.press('Escape');assert(await page.locator('.discovery-glass').count()===0,'Escape closes direct category detail');
    } catch(e){r.failed.push(e.message);} save();
  }
  await page.close();
}
for(const [mall,port] of malls)for(const locale of ['en','vi'])for(const width of [1280,390]) {
  const data=input(mall),r={mall,locale,width,checks:[],failed:[],pageErrors:[]};receipt.runs.push(r);
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});page.on('pageerror',e=>r.pageErrors.push(e.message));
  const assert=(v,label)=>{r.checks.push({label,pass:!!v});if(!v)throw Error(label);};
  const search=async (q,scope='all')=>{await page.locator('#discovery-search').fill(q);await page.locator('.discovery-search select').selectOption(scope);await page.locator('.discovery-search button[type=submit]').click();await page.waitForTimeout(120);};
  try {
    const dining=data.categories.find(c=>c.name.en==='Dining'),target=data.destinations.find(d=>d.name.en===(mall==='saigon-centre'?'NIKE':'Sony'));
    await page.goto(`http://localhost:${port}/${locale}?view=discovery&collection=${dining.id}`);await ready(page);
    if(width===390){assert(await page.locator('.persistent-map').evaluate(el=>el.getBoundingClientRect().height)<=70,'Mobile defaults to compact map summary');assert(await page.locator('.scene-host-map').isVisible()===false,'Collapsed map yields room to results');}
    await search(target.name.en);
    assert(await page.locator(`[data-discovery-result][data-destination-id="${target.id}"]`).count()>0,'Name outside current category found globally');
    assert((await page.locator('.discovery-collection-heading').textContent()).includes(locale==='vi'?'mọi danh mục':'all categories'),'Global scope explicit');
    await search(target.name.en,'category');
    await page.locator('.journey-header a[lang]').click();await ready(page);
    assert(new URL(page.url()).searchParams.get('collectionScope')==='category'&&await page.locator('#discovery-search').inputValue()===target.name.en,'Locale retains explicit category scope and query');
    await page.locator('.journey-header a[lang]').click();await ready(page);
    assert(await page.locator('[data-discovery-result]').count()===0,'Explicit category scope filters matches');
    const outside=page.locator('.discovery-collection a').filter({hasText:locale==='vi'?'Xem kết quả ở danh mục khác':'Show matches in other categories'});assert(await outside.count()===1,'Outside-category recovery visible');await outside.click();
    assert(await page.locator(`[data-destination-id="${target.id}"]`).count()>0,'Scope recovery returns named match');
    await page.reload();await ready(page);assert(await page.locator(`[data-destination-id="${target.id}"]`).count()>0,'Refresh restores global query');
    await page.locator(`[data-destination-id="${target.id}"]`).first().click();await waitDetail(page);
    const selectedUrl=page.url();assert((await page.locator('#discovery-glass-title').textContent())===target.name[locale],'Result selection opens correct identity');
    if(width===390){await page.locator('.discovery-map-context button').click();assert(await page.locator('.scene-host-map').isVisible(),'Mobile map expansion available');}
    for(const index of [1,2,3]){await page.locator('.map-controls button').nth(index).click();assert(page.url()===selectedUrl&&await page.locator('.discovery-glass').count()===1,'Map control retains detail '+index);}
    const selectedFloor=await page.locator('.scene-host-map').getAttribute('data-floor');assert(target.floors.includes(selectedFloor),'Selected floor retained');
    if(width===390){await page.locator('.discovery-map-context button').click();assert(page.url()===selectedUrl,'Collapse retains selection');}
    await page.screenshot({path:`${out}/frames/${mall}-${width}-${locale}-detail.png`});
    await page.locator('.discovery-glass-content>button').click();assert((await page.evaluate(()=>navigator.clipboard.readText())).includes(target.id),'Sharing copies selected identity');
    await page.keyboard.press('Escape');assert(await page.locator('.discovery-glass').count()===0,'Escape closes detail');
    assert(await page.locator(`[data-destination-id="${target.id}"]`).first().evaluate(el=>el===document.activeElement),'Escape restores result focus');
    await page.goBack();await waitDetail(page);assert(await page.locator('#discovery-glass-title').textContent()===target.name[locale],'Back restores detail');
    await page.goForward();await page.waitForTimeout(100);assert(await page.locator('.discovery-glass').count()===0,'Forward restores closed results');
    await search('zzzz-no-destination');assert(await page.locator('.discovery-empty').isVisible(),'No-results state usable');
    await page.locator('.discovery-search>a').click();assert(await page.locator('#discovery-search').inputValue()==='','Clear query restores category browsing');
    const alias=data.destinations.find(d=>d.aliases.some(a=>a.length>2));if(alias){await search(alias.aliases[0]);assert(await page.locator(`[data-destination-id="${alias.id}"]`).count()>0,'Existing alias matching retained');}
    // Accent-insensitive Vietnamese search using a real approved name.
    const accent=data.destinations.find(d=>/[àáạảãâăèéẹẻẽêìíịỉĩòóọỏõôơùúụủũưỳýỵỷỹđ]/i.test(d.name.vi));
    if(accent){const q=accent.name.vi.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');await search(q);assert(await page.locator(`[data-destination-id="${accent.id}"]`).count()>0,'Accent-insensitive Vietnamese search retained');}
    await search('Meat');const before=await page.locator('[data-discovery-result]').count();
    if(before){await page.locator('.discovery-scope a').click();const others=page.locator('.discovery-other-floors a');if(await others.count()){await others.click();assert(await page.locator('[data-discovery-result]').count()===before,'Other-floor action restores full result scope');}}
    await page.screenshot({path:`${out}/frames/${mall}-${width}-${locale}-results.png`});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
    assert(!r.pageErrors.length,'No uncaught page errors');
  } catch(e){r.failed.push(e.message);}finally{save();await page.close();}
}
// Static/no-JS equivalence and locale links on actual deep links.
for(const [mall,port] of malls)for(const locale of ['en','vi']){
  const data=input(mall),d=data.destinations.find(d=>d.id.endsWith('meatmeet'));
  const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await page.goto(`http://localhost:${port}${route(locale,d)}`);const body=page.locator('.static-guide [data-destination-details]');
  const menu=proposals.find(r=>r.mallId===mall&&r.destinationId===d.id)?.fields.find(f=>f.field==='menu');
  if(!menu||!await body.isVisible()||!await body.locator(`[data-detail-field=menu] a[href="${menu.url}"]`).count())receipt.failed.push(mall+locale+' noJS essential/menu');await page.close();
}
await browser.close();save();
const failures=[...receipt.failed,...receipt.static.flatMap(r=>r.failures),...receipt.categories.flatMap(r=>r.failed),...receipt.runs.flatMap(r=>r.failed)];
console.log(JSON.stringify({staticChecks:receipt.static.reduce((n,r)=>n+r.checks,0),categoryCases:receipt.categories.length,interactionCases:receipt.runs.length,assertions:[...receipt.categories,...receipt.runs].reduce((n,r)=>n+r.checks.length,0),failures}));if(failures.length)process.exitCode=1;



