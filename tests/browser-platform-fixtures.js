// Injected ONLY by serve-static --acceptance, never included in built assets.
(() => {
  const params = new URL(location.href).searchParams;
  const scenario = params.get('__scenario');
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
