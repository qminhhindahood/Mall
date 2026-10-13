# Issue 0013 runtime delivery evidence

13 October 2026. Integration branch `integration/full-detail-3d-loading`.

The runtime now creates one R3F root/canvas per attempt, starts exterior bytes and
the lazy scene module in parallel, prepares the complete exterior and floor
overview before entry, and prepares all floor map/Discovery views in the
background. Readiness includes material/environment setup, shader compilation,
an offscreen rendered frame and an asynchronous pixel read before the loader is
released. Exact source geometry and the `photo-polish-2026-10-12-delivery-r2`
exterior revision remain keyed in the cache. No timeout, minimum duration,
quality downgrade or artificial progress value is used.

The loader owns focus and inert state while preparing. A failed initial model,
geometry, renderer or context attempt leaves the static guide visible and
offers localized Retry; a later requested-scene failure also restores that
guide. Cancellation, stale selection, visibility, reduced motion and resource
disposal are handled at the runtime boundary.

## Validation

- `npm ci`: passed; audit reported zero vulnerabilities.
- `npm run check`: passed, 0 errors/warnings/hints.
- `npm run build:saigon`: passed, 22 pages; exact exterior identity 2,000,796
  bytes and Brotli representation 205,547 bytes.
- `npm run build:vincom`: passed, 20 pages; exact exterior identity 4,797,176
  bytes and Brotli representation 1,199,582 bytes.
- `node --check tests/browser-runtime-checks.js` and
  `node --check tests/browser-shell-checks.js`: passed.
- `git diff --check`: passed.
- Built static route probes passed for both malls, including localized floor
  pages, mall-only output, 404 status for an unknown store, and explicit
  `Content-Encoding: br` versus identity GLB headers.
- T3 browser checks passed for Saigon entry, visible complete-frame marker,
  loader removal, inert release, L2 selection/focus, locale/floor preservation,
  and Back restoration. Vincom entry passed with default B2, all seven labels,
  and a visible complete-frame marker.

The browser observations are localhost/T3 samples only. Saigon's earlier
visible sample recorded a 3.1866 s initial gate; Vincom recorded 1.4076 s on a
separate run. These are not five-second fast-Wi-Fi, physical-device, Lighthouse,
Core Web Vitals, or release acceptance. Background-tab/device behavior and
production-host negotiation remain uncollected.

## Review result

Standards review found no documented-standard breach or unaddressed baseline
smell in the continuation diff. Spec review found and fixed one fallback gap:
geometry success had hidden the static guide before model/runtime success, so a
subsequent model or WebGL failure could leave no useful preview. The guide now
hides only after the first complete frame and is restored for any failed
attempt.
