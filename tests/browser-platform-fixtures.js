// Injected ONLY by serve-static --acceptance, never included in built assets.
(() => {
  const params = new URL(location.href).searchParams;
  const scenario = params.get('__scenario');
  // The collaborative preview inherits the host's reduced-motion preference.
  // This opt-in browser fixture exercises the normal path without changing
  // the user's OS setting or adding a product/runtime override.
  if (params.get('__motion') === 'normal') {
    const nativeMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = query => query.includes('prefers-reduced-motion')
      ? nativeMatchMedia(query.replace(/prefers-reduced-motion\s*:\s*reduce/g, 'min-width: 999999px'))
      : nativeMatchMedia(query);
    const disableReducedMotionStyles = () => {
      const visit = rules => {
        for (const rule of rules) {
          if (rule instanceof CSSMediaRule && /prefers-reduced-motion\s*:\s*reduce/.test(rule.conditionText)) rule.media.mediaText = 'not all';
          if ('cssRules' in rule) visit(rule.cssRules);
        }
      };
      for (const sheet of document.styleSheets) {
        try { visit(sheet.cssRules); } catch { /* Cross-origin sheets are untouched. */ }
      }
    };
    document.addEventListener('DOMContentLoaded', disableReducedMotionStyles, {once: true});
    window.addEventListener('load', disableReducedMotionStyles, {once: true});
  }
  const nativeFetch = window.fetch.bind(window);
  let fault = true;
  window.__acceptanceRecover = () => { fault = false; };
  window.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, location.href);
    const model = url.pathname.startsWith('/models/');
    const geometry = url.pathname.startsWith('/data/floor-geometry');
    if (fault && scenario === 'texture-fail' && url.protocol === 'blob:') return new Response('Deliberate texture failure', { status: 503 });
    if (fault && (scenario === 'model-fail' && model || scenario === 'geometry-fail' && geometry)) return new Response('Deliberate acceptance failure', { status: 503 });
    if (fault && scenario === 'geometry-invalid' && geometry) return Response.json({ revision: 'invalid', floors: [] });
    if (fault && scenario === 'model-invalid' && model) return new Response(new Uint8Array([1,2,3,4]));
    if (scenario === 'delayed' && model) await new Promise(resolve => setTimeout(resolve, 6500));
    if (scenario === 'identity' && (model || geometry)) {
      url.pathname = url.pathname.replace(/\.br$/, '');
      url.searchParams.set('identity', '1');
    }
    if (params.get('__cache') === 'cold' && url.origin === location.origin && ['http:','https:'].includes(url.protocol)) {
      url.searchParams.set('__run', params.get('__run') ?? String(Date.now()));
      init = { ...init, cache: 'reload' };
    }
    return nativeFetch(url, init);
  };
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
    if (fault && scenario === 'webgl-unavailable' && kind.startsWith('webgl')) return null;
    return getContext.call(this, kind, ...args);
  };
})();
