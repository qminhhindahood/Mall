// Public browser seam. Served only by the explicitly enabled acceptance server.
async function browserDiscoveryCheck(minimumResults) {
  const wait = async (predicate, label) => {
    const deadline = performance.now() + 45000;
    while (!predicate()) {
      if (performance.now() > deadline) throw new Error(label);
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  };
  const assert = (pass, label) => { if (!pass) throw new Error(label); };
  await wait(() => !document.querySelector('.loading-screen'), 'Loading did not release');
  const collection = document.querySelector('[data-discovery-results]');
  assert(!!collection, 'Discovery must render the complete category collection');
  assert(new Set([...collection.querySelectorAll('[data-destination-id]')].map(link => link.dataset.destinationId)).size >= minimumResults, 'Collection was truncated');
  const toggle = document.querySelector('[data-category-toggle]');
  assert(toggle.getAttribute('aria-expanded') === 'true', 'Categories must start visible');
  toggle.click();
  await wait(() => toggle.getAttribute('aria-expanded') === 'false', 'Hide categories');
  toggle.click();
  await wait(() => toggle.getAttribute('aria-expanded') === 'true', 'Show categories');
  const destination = collection.querySelector('[data-destination-id]');
  destination.click();
  await wait(() => !!document.querySelector('.discovery-glass'), 'Floating description did not open');
  assert(new URL(location.href).searchParams.get('view') === 'discovery', 'Store selection must retain Discovery');
  assert(!!document.querySelector('.persistent-map svg'), 'Map disappeared');
  const localeLink = document.querySelector('.journey-header a[lang]');
  const selectedId = destination.dataset.destinationId;
  const nextLocale = localeLink.lang;
  localeLink.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
  localeLink.click();
  await wait(() => document.documentElement.lang === nextLocale, 'Locale did not switch');
  assert(!!document.querySelector('.discovery-glass'), 'Locale pointer dismissed the card');
  assert(document.querySelector('[data-discovery-result][aria-current="true"]')?.dataset.destinationId === selectedId, 'Locale lost the selected destination');
  document.querySelector('.discovery-glass [data-close-discovery]').click();
  await wait(() => !document.querySelector('.discovery-glass') && !document.querySelector('.loading-screen') && document.activeElement === destination, 'Description did not close and restore listing focus after preparation');
  assert(document.activeElement === destination, 'Closing must return focus to the selected listing');
  assert(document.documentElement.lang === nextLocale && location.pathname.startsWith('/'+nextLocale), 'Closing reverted the locale');
  assert(document.documentElement.scrollWidth <= innerWidth, 'Horizontal overflow');
  return { results: new Set([...collection.querySelectorAll('[data-destination-id]')].map(link => link.dataset.destinationId)).size, passed: true };
}

(async()=>{
  const receipt={url:location.href,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},checks:[],failed:[],timings:[]};
  const wait=async(fn)=>{const start=Date.now();while(!fn()){if(Date.now()-start>20000)throw new Error('Browser state wait exceeded 20s');await new Promise(r=>setTimeout(r,60));}};
  const assert=(value,label)=>{if(!value)throw new Error(label);receipt.checks.push(label);};
  const ready=async()=>{await wait(()=>!document.querySelector('.loading-screen'));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));};
  const click=(selector)=>{const element=document.querySelector(selector);if(!element)throw new Error(`Missing control ${selector}`);element.dispatchEvent(new MouseEvent('click', {bubbles:true,cancelable:true}));};
  const query=async(value)=>{const input=document.querySelector('.directory-search input[name=q]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);document.querySelector('.directory-search').requestSubmit();await ready();await wait(()=>new URL(location.href).searchParams.get('q')===value);};
  const fixture=!!document.querySelector('.fixture-notice');
  try{
    await ready();
    assert(document.documentElement.scrollWidth<=innerWidth,'No horizontal overflow');
    assert(parseFloat(getComputedStyle(document.querySelector('.floor-rail a')).fontSize)>=16,'Readable floor controls');
    assert(document.querySelectorAll('.floor-rail a').length===(document.body.innerText.includes('Saigon Centre')?8:7),'All supported overview floor links');
    if(!fixture){assert(document.querySelector('.directory-panel').innerText.includes(document.documentElement.lang==='vi'?'chờ duyệt':'pending'),'Honest pending public directory');assert(!document.querySelector('.directory-results li'),'No public synthetic tenants');return receipt;}
    assert(document.querySelector('.fixture-notice').innerText.length>0,'Fixture disclosure');
    await query('ca phe dong');
    assert(document.querySelectorAll('.directory-results li').length===1,'Accent-insensitive mall-wide search');
    click('.directory-results a');await ready();await wait(()=>!!document.querySelector('.destination'));
    assert(new URL(location.href).pathname.endsWith('/test-cafe'),'Independent destination link');
    assert(document.querySelector('.destination p').innerText.includes(document.documentElement.lang==='vi'?'chờ duyệt':'awaiting'),'Missing introduction preserves basic listing');
    assert(document.querySelectorAll('path[data-selected=true]').length>0,'Verified mapped area highlighted');
    click('.destination button');await wait(()=>!document.querySelector('.destination'));
    assert(new URL(location.href).searchParams.get('q')==='ca phe dong','Close preserves search');
    await wait(()=>document.activeElement?.closest('.directory-results'));assert(true,'Close restores invoking result focus');
    await query('caff');assert(document.querySelector('.directory-panel').innerText.includes(document.documentElement.lang==='vi'?'Gợi ý':'Spelling'),'Bounded typo suggestions');assert(!document.querySelector('.destination'),'Suggestions never auto-select');
    click('.directory-search>a');await ready();
    click('.area-link');await ready();await wait(()=>!!document.querySelector('.shared-area'));
    assert(document.querySelectorAll('.shared-area li').length===2,'Shared area exposes both destinations without arbitrary selection');
    click('.shared-area li a[href*="loading-test-store"]');await ready();await wait(()=>!!document.querySelector('.destination'));
    assert(document.querySelectorAll('.destination nav a').length===2,'One destination exposes both verified floors');
    click('.destination nav a[href*="floor=L2"]');await ready();assert(new URL(location.href).searchParams.get('floor')==='L2','Destination panel switches verified floor');
    click('.destination nav a[href*="floor=L1"]');await ready();
    click('.destination button:last-of-type');await wait(()=>document.querySelector('.share-status').textContent.length>0);assert(true,'Share copies destination link or supplies a usable copy fallback');
    click('.destination button');await ready();
    click('.directory-panel details summary');assert(document.querySelector('.directory-panel details').innerText.includes(document.documentElement.lang==='vi'?'Thang máy':'Test lift'),'Facilities stay separate from commercial destinations');
    click('header nav a:nth-child(2)');await ready();await wait(()=>new URL(location.href).searchParams.get('view')==='discovery');
    click('.discovery-categories a[href*="collection=cafes"]');await ready();
    assert(document.querySelector('.persistent-map [data-floor]').dataset.floor==='L2','Category previews most-matching floor');
    assert(new URL(location.href).searchParams.get('floor')==='L1','Preview preserves practical floor');
    const map=document.querySelector('.persistent-map'),canvas=map.querySelector('canvas');
    await browserDiscoveryCheck(3);receipt.checks.push('Current Discovery: complete collection, category toggle, card/map persistence, pointer locale, close/focus and overflow');await ready();
    assert(document.querySelectorAll('[data-discovery-results] [data-destination-id]').length===3,'Complete cafe collection includes all matching destinations');
    const groups=[...document.querySelectorAll('[data-discovery-results] h4')].map(e=>e.textContent);assert(groups.some(x=>x.includes('L1'))&&groups.some(x=>x.includes('L2')),'Collection groups by verified floor');
    click('[data-discovery-results] a[data-destination-id="test-coffee"]');await ready();await wait(()=>!!document.querySelector('.discovery-glass'));
    assert(new URL(location.href).searchParams.get('floor')==='L2'&&new URL(location.href).searchParams.get('view')==='discovery','Collection opens requested floor and floating details without leaving Discovery');
    click('[data-close-discovery]');await ready();
    assert(map===document.querySelector('.persistent-map')&&canvas===map.querySelector('canvas'),canvas?'Map and canvas persist through Discovery':'Map persists with 3D unavailable');
    click('[data-discovery-results] a[data-destination-id="test-unknown"]');await ready();await wait(()=>!!document.querySelector('.discovery-glass'));
    assert(document.querySelectorAll('.persistent-map path[data-selected=true]').length===0,'Floor-only destination has no false map highlight');
    const before=location.href,scrollBefore=scrollY;click('header nav a:last-child');await ready();
    assert(new URL(location.href).pathname.includes(document.documentElement.lang==='vi'?'/cua-hang/':'/stores/'),'Locale updates destination route');
    assert(new URL(location.href).searchParams.get('collection')==='cafes','Locale retains collection context');
    assert(Math.abs(scrollY-scrollBefore)<5,'Locale preserves scroll');
    history.back();await wait(()=>location.href===before);await ready();
    assert(document.querySelector('.discovery-glass')&&new URL(location.href).searchParams.get('floor')==='L2','Back restores floating details and floor');
    click('[data-close-discovery]');await ready();
    click('.discovery-floors a[href*="collectionFloor=L1"]');await ready();
    assert(document.querySelectorAll('[data-discovery-results] [data-destination-id]').length===1,'Floor filter narrows current complete collection');
    click('.persistent-map .map-transform path[role=button]');await ready();await wait(()=>!!document.querySelector('.discovery-glass'));
    assert(document.querySelectorAll('.discovery-glass li').length===2,'Shared Discovery area exposes both destinations without arbitrary selection');
    click('.discovery-glass li a[href*="loading-test-store"]');await ready();
    assert(document.querySelectorAll('.discovery-glass nav a').length===2,'Floating destination exposes both verified floors');
    click('.discovery-glass nav a[href*="floor=L2"]');await ready();assert(new URL(location.href).searchParams.get('floor')==='L2','Floating details switch verified floor');
    click('[data-close-discovery]');await ready();
    click('.discovery-categories a[href*="collection=empty"]');await ready();
    assert(document.querySelectorAll('[data-discovery-results] [data-destination-id]').length===0&&!!document.querySelector('.discovery-empty'),'Empty category invents no destination or Highlight');
    click('header nav a:first-child');await ready();
    const existingMap=document.querySelector('.persistent-map');
    const discovery=document.querySelector('#scene-discovery');window.scrollBy({top:discovery.getBoundingClientRect().top-innerHeight*.35,behavior:'instant'});
    await wait(()=>new URL(location.href).searchParams.get('view')==='discovery');await ready();
    assert(document.querySelector('.persistent-map')===existingMap,'Native scroll continuously retains map into Discovery');
    receipt.timings=performance.getEntriesByType('measure').filter(e=>e.name.includes('navigation-to-frame')||e.name.includes('request-to-frame')).map(e=>({name:e.name,duration:e.duration}));
  }catch(error){receipt.failed.push(error.message);}
  return receipt;
})()
