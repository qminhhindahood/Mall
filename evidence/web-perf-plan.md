# Full-detail loading performance evidence plan

13 October 2026. Implement-spec + web-perf, local issue 0014. This is a measurement plan, not results.

Audit progress:

- [ ] Phase 1: production-build preparation measurements; dedicated trace tools unavailable.
- [ ] Phase 2: report available observer metrics separately from full-detail 3D readiness; no invented Lighthouse/field CWV results.
- [ ] Phase 3: Resource Timing plus response header/decoded-byte verification, identity versus exact-byte Brotli, cold-transfer and warm/cache observations.
- [ ] Phase 4: public accessibility snapshot, loader/inert/focus/error guide behavior.
- [x] Phase 5: source analysis. Existing exterior model fetch follows scene import/Canvas mount, and ready signals before the render. New pipeline starts fetch/import together and gates on texture/shader/frame preparation.

Primary references retrieved for current APIs: [Resource Timing](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming), [Web Vitals](https://web.dev/articles/vitals), [Chrome performance tooling](https://developer.chrome.com/docs/devtools/performance), plus the external exploration notes `C:/Users/PC/AppData/Local/Temp/midterm-loading-exploration-2026-10-13.md` for Three.js and compression/hosting sources.

Resource Timing distinguishes encoded/decoded body bytes and transfer/cache behavior; a zero transferSize alone is not evidence that GPU scene resources are ready. Collect navigation/request-to-complete-frame marks rather than substituting LCP or download duration for the owner's 3D goal. A known static resource can use browser-decoded SHA256 as an exact-byte identity receipt.

Compare the same built app/runtime/asset revision served over local HTTP with compression enabled/identity controls. Use fresh representation URLs/no-store when deliberately collecting cold-transfer samples; label this as cache-bypassed transfer, not a newly restarted browser with every cache empty. Warm visits record actual resource transfer sizes and validator/cache headers. Capture repeated measurements, browser/device/viewport/visibility, full-scene marks, resource bytes and failure cases. Local CPU/GPU, headless automation, caching and loopback transport can dominate timings; do not convert these into a powerful-device fast-Wi-Fi production acceptance claim.

Targets: initial exterior+overview and direct requested view under the five-second goal; an unfinished later requested view aims for three to four seconds. Continue loading beyond misses, preserve lossless detail, and release to the static guide only after known failure. Report all observed misses as well as successful samples. No device-quality downgrade is permitted.

Uncollected until explicitly demonstrated: Lighthouse score, trace insights/TBT, field INP/CWV percentiles, physical-phone GPU/frame-time distribution, background-tab device behavior and release-host negotiation. Dedicated tracing tools are absent; no MCP setup or deployment is part of this implementation.
