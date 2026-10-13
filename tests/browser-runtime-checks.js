// Public browser journey seam. Run via T3 preview_evaluate against a built app.
// Preview must remain visible; this cannot establish renderer readiness hidden.
async function browserRuntimeEntryCheck() {
  const started=performance.now();
  while(document.querySelector('.loading-screen') && performance.now()-started<30000) await new Promise(resolve=>setTimeout(resolve,100));
  const pass=!document.querySelector('.loading-screen') && !document.querySelector('.error') && !!document.querySelector('.scene-host canvas[aria-hidden="false"]') && !document.querySelector('astro-island > div')?.inert;
  if(!pass) throw new Error('Entry has not revealed complete 3D with usable keyboard guide');
  return {name:'Entry reveals complete 3D and releases keyboard guide',pass,href:location.href};
}
