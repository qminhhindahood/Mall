// Observation and public-link interaction only. No readiness/runtime override.
(() => {
  if (new URL(location.href).searchParams.get('__observe') === 'off') return;
  const log = window.__continuation = {startedAt: performance.now(), visibility: [], heartbeat: [], events: []};
  const state = () => ({at:performance.now(), state:document.visibilityState, focus:document.hasFocus()});
  log.visibility.push(state());
  document.addEventListener('visibilitychange', () => log.visibility.push(state()));
  const interval = setInterval(() => log.heartbeat.push(state()), 100);
  let stage = 0;
  const check = () => {
    if (document.querySelector('.error')) {log.error=document.querySelector('.error').textContent; return;}
    const canvas = document.querySelector('.scene-host canvas');
    if (!canvas?.dataset.completeFrame || document.querySelector('.loading-screen')) return;
    if (stage === 0) {
      stage=1;
      const prepared = performance.getEntriesByType('mark').some(e=>e.name.startsWith('mall-3d:prepared:') && e.name.endsWith(':map:L3'));
      log.events.push({type:'entry-ready-early-request',...state(),alreadyPrepared:prepared,frame:canvas.dataset.completeFrame});
      document.querySelector('.floors a[href$="/L3"]').click();
    } else if (stage === 1 && canvas.dataset.sceneKey?.endsWith(':map:L3')) {
      stage=2;
      log.events.push({type:'requested-map-ready',...state(),frame:canvas.dataset.completeFrame,focus:document.activeElement?.id});
    } else if (stage === 2 && performance.getEntriesByType('mark').some(e=>e.name.startsWith('mall-3d:prepared:') && e.name.endsWith(':discovery:L3'))) {
      stage=3;
      log.events.push({type:'prepared-discovery-request',...state()});
      document.querySelector('a[href*="view=discovery"]:not(.skip-discovery)').click();
    } else if (stage === 3 && canvas.dataset.sceneKey?.endsWith(':discovery:L3')) {
      stage=4;clearInterval(interval);
      log.events.push({type:'prepared-discovery-ready',...state(),frame:canvas.dataset.completeFrame,focus:document.activeElement?.id});
      log.done=true;
    }
  };
  new MutationObserver(check).observe(document,{childList:true,subtree:true,attributes:true});
  setInterval(check, 50);
})();
