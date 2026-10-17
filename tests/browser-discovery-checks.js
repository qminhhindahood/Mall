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
  await wait(() => !document.querySelector('.discovery-glass'), 'Description did not close');
  assert(document.activeElement === destination, 'Closing must return focus to the selected listing');
  assert(document.documentElement.lang === nextLocale && location.pathname.startsWith('/'+nextLocale), 'Closing reverted the locale');
  assert(document.documentElement.scrollWidth <= innerWidth, 'Horizontal overflow');
  return { results: new Set([...collection.querySelectorAll('[data-destination-id]')].map(link => link.dataset.destinationId)).size, passed: true };
}
