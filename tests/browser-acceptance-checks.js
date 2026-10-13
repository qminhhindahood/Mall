// Load through /__acceptance/ on an explicitly enabled local acceptance server.
// Tests use public navigation, visible content, browser APIs and User Timing.
async function acceptanceWait(predicate, label, timeout = 30000) {
  const deadline = performance.now() + timeout;
  while (!predicate()) {
    if (performance.now() > deadline) throw new Error(`Timed out: ${label}`);
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}
function acceptanceAssert(pass, label) {
  if (!pass) throw new Error(label);
}
async function browserAcceptanceReady() {
  await acceptanceWait(() => !!document.querySelector('.scene-host canvas[aria-hidden="false"]') || !!document.querySelector('.error'), '3D entry or usable error');
  acceptanceAssert(document.visibilityState === 'visible', 'Preview must be visible');
  acceptanceAssert(!document.querySelector('.error'), 'Unexpected scene failure');
  acceptanceAssert(!document.querySelector('.loading-screen'), 'Loader still covers prepared scene');
  acceptanceAssert(!document.querySelector('astro-island > div')?.inert, 'Guide is inert');
  acceptanceAssert(Number(document.querySelector('canvas')?.dataset.completeFrame) > 0, 'No complete frame');
}
async function browserAcceptanceFailureAndRetry(retry = true) {
  await acceptanceWait(() => !!document.querySelector('.error'), 'localized scene error');
  acceptanceAssert(!document.querySelector('.loading-screen'), 'Failure leaves loader covering guide');
  acceptanceAssert(!document.querySelector('.static-guide')?.hidden && !!document.querySelector('.static-guide svg path'), 'Failure hides useful SVG guide');
  acceptanceAssert(!document.querySelector('astro-island > div')?.inert, 'Failed guide is inert');
  document.querySelector('.floors a[href$="/L2"]').click();
  await acceptanceWait(() => location.pathname.endsWith('/L2'), 'Static floor navigation after failure');
  const language = document.querySelector('header nav a');
  language.click();
  await acceptanceWait(() => document.documentElement.lang === 'vi', 'Failure locale change');
  if (retry) {
    window.__acceptanceRecover?.();
    const url = new URL(location.href);url.searchParams.delete('__scenario');history.replaceState(null,'',url);
    document.querySelector('.error button').click();
    await acceptanceWait(()=>!document.querySelector('.error'), 'Retry begins');
    await browserAcceptanceReady();
    acceptanceAssert(document.querySelector('.scene-host[data-active="true"]').dataset.floor === 'L2' && document.documentElement.lang === 'vi', 'Retry loses floor/locale');
    acceptanceAssert(document.querySelectorAll('canvas').length === 1, 'Retry leaks a canvas');
  }
  return { pass: true, retry, href: location.href, guide: !!document.querySelector('.static-guide svg path') };
}
async function browserAcceptanceJourney(floors, defaultFloor) {
  await browserAcceptanceReady();
  acceptanceAssert(document.querySelector('.scene-host[data-active="true"]').dataset.floor === defaultFloor, 'Wrong mall default');
  acceptanceAssert(JSON.stringify([...document.querySelectorAll('.floors a')].map(a=>a.textContent)) === JSON.stringify(floors), 'Wrong mall floors');
  const results = [];
  for (const floor of floors) {
    document.querySelector(`.floors a[href$="/${floor}"]`).click();
    await acceptanceWait(() => !document.querySelector('.loading-screen') && document.querySelector('canvas')?.dataset.sceneKey?.endsWith(`:map:${floor}`), `Complete floor ${floor}`);
    await acceptanceWait(()=>document.activeElement===document.getElementById('scene-map'), 'Floor content focus');
    results.push({floor, frame: document.querySelector('canvas').dataset.completeFrame});
    document.querySelector('.views a[href="#scene-discovery"]').click();
    await acceptanceWait(() => !document.querySelector('.loading-screen') && document.querySelector('canvas')?.dataset.sceneKey?.endsWith(`:discovery:${floor}`), `Complete Discovery ${floor}`);
  }
  const language=document.querySelector('header nav a');language.focus();language.click();
  await acceptanceWait(()=>document.documentElement.lang==='vi','Language switch');
  acceptanceAssert(document.activeElement===language,'Locale focus lost');
  history.back();await acceptanceWait(()=>document.documentElement.lang==='en','Back locale');
  history.forward();await acceptanceWait(()=>document.documentElement.lang==='vi','Forward locale');
  const unknown=await fetch('/en/stores/unknown-store');acceptanceAssert(unknown.status===404,'Unknown route must return 404');
  for(const floor of floors) for(const locale of ['vi','en']) {
    const response=await fetch(`/${locale}/${locale==='vi'?'tang':'floors'}/${floor}`);
    const html=new DOMParser().parseFromString(await response.text(),'text/html');
    acceptanceAssert(response.ok && !!html.querySelector('.static-guide svg path') && html.documentElement.lang===locale,`Static route ${locale}/${floor}`);
  }
  const iframe=document.createElement('iframe');iframe.sandbox='allow-same-origin';iframe.src='/en/floors/L1';
  const loaded=new Promise(resolve=>iframe.addEventListener('load',resolve,{once:true}));document.body.append(iframe);await loaded;
  acceptanceAssert(!!iframe.contentDocument.querySelector('.static-guide svg path') && !iframe.contentDocument.querySelector('.static-guide').hidden,'No-JavaScript guide unusable');iframe.remove();
  acceptanceAssert(document.documentElement.scrollWidth<=innerWidth+1,'Viewport has horizontal overflow');
  return {pass:true,results,href:location.href,viewport:[innerWidth,innerHeight]};
}
async function browserViewFocusCheck() {
  await browserAcceptanceReady();
  document.querySelector('.floors a[href$="/L2"]').click();
  await acceptanceWait(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.sceneKey?.endsWith(':map:L2'),'L2 map frame');
  await acceptanceWait(()=>document.activeElement===document.getElementById('scene-map'),'L2 map keyboard focus');
  document.querySelector('.views a[href="#scene-discovery"]').click();
  await acceptanceWait(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.sceneKey?.endsWith(':discovery:L2'),'L2 Discovery frame');
  await acceptanceWait(()=>document.activeElement===document.getElementById('scene-discovery'),'Discovery keyboard focus');
  document.querySelector('.views a[href="#scene-map"]').click();
  await acceptanceWait(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.sceneKey?.endsWith(':map:L2'),'Reused map frame');
  await acceptanceWait(()=>document.activeElement===document.getElementById('scene-map'),'Reused map keyboard focus');
  return {pass:true,href:location.href,focus:document.activeElement.id,frame:document.querySelector('canvas').dataset.completeFrame,visibility:document.visibilityState};
}
function browserLoadingSample(label) {
  return {
    label, href: location.href, observedAt: new Date().toISOString(),
    profile: {userAgent:navigator.userAgent,platform:navigator.platform,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,visibility:document.visibilityState,hardwareConcurrency:navigator.hardwareConcurrency},
    navigation:performance.getEntriesByType('navigation').map(e=>e.toJSON()),
    marks:performance.getEntriesByType('mark').filter(e=>e.name.startsWith('mall-')).map(e=>({...e.toJSON(),detail:e.detail})),
    measures:performance.getEntriesByType('measure').filter(e=>e.name.startsWith('mall-')).map(e=>({...e.toJSON(),detail:e.detail})),
    resources:performance.getEntriesByType('resource').map(e=>e.toJSON()),
    ready:!document.querySelector('.loading-screen')&&!document.querySelector('.error'),
    canvas:document.querySelector('canvas')?.dataset.completeFrame,
  };
}
async function browserMeasurementRun(label) {
  await browserAcceptanceReady();
  const entry = performance.getEntriesByType('measure').filter(e=>['entry-to-frame','navigation-to-frame'].includes(e.detail?.operation)).map(e=>({...e.toJSON(),detail:e.detail}));
  const earlyAlreadyPrepared = performance.getEntriesByType('mark').some(e=>e.name.startsWith('mall-3d:prepared:')&&e.name.endsWith(':map:L3'));
  document.querySelector('.floors a[href$="/L3"]').click();
  await acceptanceWait(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.sceneKey?.endsWith(':map:L3'),'Early requested complete frame');
  await acceptanceWait(()=>performance.getEntriesByType('mark').some(e=>e.name.startsWith('mall-3d:prepared:')&&e.name.endsWith(':discovery:L3')),'Background Discovery ready');
  document.querySelector('.views a[href="#scene-discovery"]').click();
  await acceptanceWait(()=>!document.querySelector('.loading-screen')&&document.querySelector('canvas')?.dataset.sceneKey?.endsWith(':discovery:L3'),'Already-ready Discovery complete frame');
  return {...browserLoadingSample(label),entry,earlyAlreadyPrepared};
}
async function browserContextLossAndRetry() {
  await browserAcceptanceReady();
  const canvas=document.querySelector('.scene-host canvas');
  const extension=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
  if(!extension)return {pass:null,reason:'WEBGL_lose_context unavailable'};
  extension.loseContext();
  await acceptanceWait(()=>!!document.querySelector('.error'),'Context loss exposes static guide');
  acceptanceAssert(!document.querySelector('.static-guide').hidden && !document.querySelector('.loading-screen'),'Context loss leaves unusable guide');
  document.querySelector('.error button').click();
  await acceptanceWait(()=>!document.querySelector('.error'),'Retry begins');
  await browserAcceptanceReady();
  acceptanceAssert(document.querySelector('.scene-host canvas')!==canvas && document.querySelectorAll('canvas').length===1,'Context retry reuses lost canvas or leaks one');
  return {pass:true,href:location.href};
}
async function browserLaterRenderFailureAndRetry() {
  await browserAcceptanceReady();
  const gl=document.querySelector('.scene-host canvas').getContext('webgl2');
  const native=gl.drawElements.bind(gl);
  gl.drawElements=()=>{throw new Error('Deliberate browser GPU draw failure');};
  // A requested view must fail at its actual complete-frame presentation.
  document.querySelector('.views a[href="#scene-map"]').click();
  await acceptanceWait(()=>!!document.querySelector('.error'),'Requested render failure');
  gl.drawElements=native;
  acceptanceAssert(!document.querySelector('.static-guide').hidden,'Later failure hides guide');
  document.querySelector('.error button').click();
  await acceptanceWait(()=>!document.querySelector('.error'),'Retry begins');
  await browserAcceptanceReady();
  acceptanceAssert(document.querySelector('canvas').dataset.sceneKey.endsWith(':map:'+document.querySelector('.scene-host[data-active=true]').dataset.floor),'Later retry loses requested view');
  return {pass:true,href:location.href};
}
async function browserVisibleRenderFailureAndRetry(trigger, preparedCount) {
  await browserAcceptanceReady();
  await acceptanceWait(()=>performance.getEntriesByType('mark').filter(e=>e.name.startsWith('mall-3d:prepared:')).length>=preparedCount,'Background complete before visible failure');
  const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl2');
  gl.drawElements=()=>{throw new Error('Deliberate visible browser GPU failure');};
  if(trigger==='rotation')document.querySelector('#scene-exterior button').click();
  else document.querySelector('.scene-host[data-active=true]').style.height='451px';
  await acceptanceWait(()=>!!document.querySelector('.error'),'Visible rendering failure releases static guide');
  acceptanceAssert(!document.querySelector('.loading-screen')&&!document.querySelector('.static-guide').hidden&&!document.querySelector('astro-island > div')?.inert,'Visible failure leaves unusable guide');
  acceptanceAssert(performance.getEntriesByType('mark').some(e=>e.name==='mall-3d:disposed'),'Visible failure does not dispose resources');
  document.querySelector('.error button').click();
  await acceptanceWait(()=>!document.querySelector('.error'),'Visible failure Retry begins');
  await browserAcceptanceReady();
  acceptanceAssert(document.querySelector('canvas')!==canvas&&document.querySelectorAll('canvas').length===1,'Visible failure Retry leaks canvas');
  return {pass:true,trigger,href:location.href};
}
async function browserFixtureEntry(expectedFloor, corrected = false) {
  await browserAcceptanceReady();
  await acceptanceWait(()=>document.activeElement===document.querySelector('.destination'),'Destination details focus');
  acceptanceAssert(document.querySelector('.scene-host[data-active=true]').dataset.floor===expectedFloor,'Shared-store floor context lost');
  acceptanceAssert(document.querySelector('.destination').textContent.includes('Browser fixture'),'Unlabeled fixture');
  acceptanceAssert(document.querySelector('.destination').getBoundingClientRect().top>=-1 && document.querySelector('.destination').getBoundingClientRect().top<innerHeight,'Destination details outside viewport');
  if(corrected)acceptanceAssert(new URL(location.href).searchParams.get('floor')===expectedFloor && document.body.textContent.includes('Its primary floor is selected.'),'Invalid shared-store floor not corrected');
  document.querySelector('.wordmark').click();
  await acceptanceWait(()=>!document.querySelector('.loading-screen')&&!document.querySelector('.destination')&&document.querySelector('canvas')?.dataset.sceneKey?.endsWith(':exterior:all'),'Wordmark restores homepage');
  return {pass:true,expectedFloor,corrected,href:location.href};
}
