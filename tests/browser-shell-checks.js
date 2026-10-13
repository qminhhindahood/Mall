// Public browser seam only. Run this function through T3 preview_evaluate on a
// built homepage after hydration. Fixture stores are tested by the runtime slice.
async function browserShellChecks(expectedMall, expectedFloors, expectedDefault) {
  const results = [];
  const wait = () => new Promise(resolve => setTimeout(resolve, 150));
  const check = (name, pass, observed) => {
    results.push({name,pass,observed});
    if (!pass) throw new Error(`${name}: ${JSON.stringify(observed)}`);
  };
  check('Correct mall homepage', document.querySelector('h1')?.textContent === expectedMall, document.title);
  check('All supported shopping levels', JSON.stringify([...document.querySelectorAll('.floors a')].map(a=>a.textContent)) === JSON.stringify(expectedFloors), [...document.querySelectorAll('.floors a')].map(a=>a.textContent));
  check('Mall-specific default', document.querySelector('.scene-host[data-active=true]')?.dataset.floor === expectedDefault, document.querySelector('.scene-host[data-active=true]')?.dataset.floor);
  check('Four continuous journey sections', ['scene-exterior','scene-overview','scene-map','scene-discovery'].every(id=>document.getElementById(id)), [...document.querySelectorAll('.scene-section')].map(section=>section.id));
  check('No fabricated current listings', !document.querySelector('.destination') && document.body.textContent.includes('Danh bạ cửa hàng đã duyệt chưa có'), document.querySelector('.destination')?.textContent);
  document.querySelector('.floors a[href$="/L2"]').click();
  await wait();
  check('Floor link selects L2 and updates URL', location.pathname === '/vi/tang/L2' && document.querySelector('.scene-host')?.dataset.floor === 'L2', location.href);
  check('Floor navigation gives content focus', document.activeElement === document.querySelector('#scene-map'), document.activeElement?.tagName);
  const language = document.querySelector('header nav a');
  language.focus();language.click();
  await wait();
  check('Locale keeps floor and focus', document.documentElement.lang === 'en' && location.pathname === '/en/floors/L2' && document.querySelector('.scene-host')?.dataset.floor === 'L2' && document.activeElement === language, {href:location.href,focus:document.activeElement?.textContent});
  history.back(); await wait();
  check('Back restores previous locale and floor', document.documentElement.lang === 'vi' && document.querySelector('.scene-host')?.dataset.floor === 'L2', location.href);
  for (const floor of expectedFloors) {
    const response = await fetch(`/en/floors/${floor}`);
    const page = new DOMParser().parseFromString(await response.text(),'text/html');
    check(`Static route ${floor}`, response.status === 200 && page.documentElement.lang === 'en' && page.querySelector('.static-guide svg path') !== null, {status:response.status,paths:page.querySelectorAll('.static-guide svg path').length});
  }
  const unknown = await fetch('/en/stores/unknown-store');
  check('Unknown destination returns 404', unknown.status === 404 && (await unknown.text()).includes('Page not found'), unknown.status);
  const iframe = document.createElement('iframe');
  iframe.sandbox = 'allow-same-origin';iframe.src='/en/floors/L1';
  iframe.style.cssText='position:absolute;left:-2000px;width:390px;height:844px';
  document.body.append(iframe);
  await new Promise(resolve=>iframe.addEventListener('load',resolve,{once:true}));
  check('Scripts-disabled guide retains source SVG and links', iframe.contentDocument?.querySelectorAll('.floors a').length===expectedFloors.length && iframe.contentDocument?.querySelector('.static-guide svg path')!==null && !iframe.contentDocument?.querySelector('.static-guide')?.hidden, {links:iframe.contentDocument?.querySelectorAll('.floors a').length,paths:iframe.contentDocument?.querySelectorAll('.static-guide svg path').length});
  iframe.remove();
  return results;
}
