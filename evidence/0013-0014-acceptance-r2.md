# Loading acceptance retry — 13 October 2026

Implementation `a7864f0` follows modal repair `650b579` and cached-focus repair `dbf1ab5`, on `task/0013-0014-acceptance`, integrated into `integration/full-detail-3d-loading`. No asset revision or publication. Both normal builds pass (Saigon 22 / Vincom 20 pages), both isolated fixture builds pass (24 / 22), and Astro reports zero errors, warnings or hints. The existing lazy renderer chunk-size warning remains.

The error DOM could appear while passive modal cleanup still left navigation inert. Modal cleanup now runs before paint. Independent Spec review then found visible rotation/resize errors escaping recovery and a requested gate starting after selection committed. Both visible errors reproduced at `650b579` ([red receipt](0013-visible-render-red.json)); `a7864f0` cancels/disposes the failed attempt, exposes the static guide, and commits the loader with changed navigation/history selection. Neither readiness timeout nor quality reduction was added.

## Public browser results

[Final desktop receipt](0013-final-browser.json): **34/34 cases pass**, zero page errors, Chrome 149.0.7827.198, Windows/AMD Radeon 780M D3D11, 1280×800, DPR 1, reduced motion. Both malls pass model HTTP/invalid-byte, geometry HTTP/invalid-data, texture and unavailable-WebGL failures; import failure with full-document Retry; context loss/new-canvas Retry; requested render failure; rotation/resize failures; delayed initial loading beyond five seconds with latest locale/floor/history/focus retained; L1/L2/primary/invalid shared-store entry; all supported floor/map/Discovery/history/noJS/404 journeys; reduced motion, Pause/Resume, offscreen suspension/resumption; one canvas and unchanged geometry/preparation counts when reusing views. Resource marks remain qualified CPU-buffer/texture estimates, not exact driver allocation.

[Edge receipt](0013-runtime-edge.json): both malls retain the ready exterior after an unrelated background draw failure and later recover the failed requested floor. A browser GPU-fence fixture holds pending work for 5.5 seconds: the loader/keyboard gate remains after 4.2 seconds, then latest Vietnamese L2 Discovery/history/focus wins. [Additional receipt](0013-runtime-addon.json): supported but unrelated B2 is corrected to a fixture's primary L1; a failed direct L2 destination retains details and usable L1/L2 SVG guides; emulated public `document.hidden`/`visibilitychange` signals pause and resume rendering. This signal check is explicitly separate from a native hidden-tab check.

[Mobile receipt](0013-final-mobile.json): both malls pass all-floor journeys and cached map/Discovery focus at 390×844, zero page errors. Final screenshots: [Saigon](0013-final-saigon-390.png), [Vincom](0013-final-vincom-390.png). Earlier Impeccable visual findings remain in [the audit](impeccable-retry-audit.md); this retry repairs loading/recovery behavior, not a broader style redesign.

The [intermediate receipt](0013-final-browser-intermediate.json) is **not final acceptance**: its import fault depended on a document Referer that dynamic modules do not reliably use, and its stale test dispatched multiple clicks in one React batch before locale committed. The final import test intercepts the public module request; final rapid actions run on separate browser turns with Back/forward. These were harness defects, not claimed application red/green fixes.

## Shared preview limits

T3 stayed open with `available:true`, `visible:true`, and `document.visibilityState='visible'`, yet requested 30 ms timers repeatedly took about one second. A Saigon retry eventually reached complete frame after 46.019 seconds; the 30-second **test** deadline failed first. Four batch results were incomplete and are excluded. Snapshot failed and resize timed out; snapshot later recovered. [Raw shared-preview observations](0013-shared-preview-retry.json) retain these limits and scoped green checks, including texture recovery, import recovery and Vincom context recovery. Final Saigon complete-frame 37 and saved screenshot were observed in the still-open preview. A screenshot's recovery does not turn the throttled runs into performance acceptance.

This session previously received an explicit T3 `preview_open` unavailable/no-host error; standalone browser confirmation was therefore used and kept separate. Headless tab switching did not expose a native hidden document. **Native background-tab and a stable final shared-preview matrix remain unverified.** The public visibility-signal fixture proves the application handler only. Preview visibility is a current tool observation, not a guarantee of future host availability.

## Repeated loading measurements

[24 raw runs](0014-repeated-loading.json) and [compact summary](0014-loading-summary.json): three identity/Brotli pairs per mall, each with a fresh incognito context then a warm navigation in that context. Same browser/runtime, 1280×800, DPR 1/reduced motion, localhost HTTP, no network throttle. OS/driver shader caches were uncontrolled and transports ran sequentially; no causal latency-speedup or fast-Wi-Fi claim follows. All runs reached complete frames without errors.

Navigation-to-complete-frame milliseconds, **median [minimum–maximum]**, three observations per cell:

| Mall | Transport | Cold context | Warm navigation |
| --- | --- | --- | --- |
| Saigon | Brotli | 2373.7 [2266.9–5014.9] | 1771.1 [1750.4–1840.4] |
| Saigon | Identity | 2114.4 [2096.9–2289.1] | 1710.5 [1686.9–1797.4] |
| Vincom | Brotli | 1144.8 [1123.5–1929.8] | 609.3 [581.2–765.9] |
| Vincom | Identity | 1161.6 [1085.2–1284.8] | 591.0 [579.5–642.8] |

The Saigon first Brotli cold observation **misses** the five-second goal by 14.9 ms. All 24 L3 map requests began before that map was prepared, and prepared L3 Discovery requests are separately recorded; exact request spans, module/transfer/decode/GPU/render timing and Resource Timing are in the raw receipt. Neither the injected 5.5-second wait nor its stale replacements is a latency benchmark. Warm asset Resource Timing reports 300 transferred bytes with retained encoded/decoded body sizes, consistent with revalidation; server/cache headers are retained.

[Built transport receipts](0014-built-transport.json) re-pass 30 bilingual floor routes, mall-only assets, truthful unknown/production-fixture 404s, identity/Brotli bytes, MIME/encoding/cache/ETag/304 and exact decoded identities. Model identity → Brotli bytes: Saigon 2,000,796 → 205,547; Vincom 4,797,176 → 1,199,582. Floor identity → Brotli: Saigon 5,181,012 → 1,084,569; Vincom 243,505 → 42,221. Byte reduction is demonstrated; loopback latency is dominated by other costs in these runs.

Sources remain exterior `photo-polish-2026-10-12-delivery-r2` and floor `source-palette-schematic-2026-10-13-r2`. Model SHA-256: Saigon `f04fee93c620b698874e67e319d2140cbed60796506f63213c5e57b6aad49050`; Vincom `e2853dcf2fdf123ed897eb6f0e0014d12de6dfcf9ba81bc202d1ad8035c50c5e`. Geometry SHA-256: Saigon `84952edc38465d572cd994ef416d5a095f778fa0cb35e46ce6d3d365c7454807`; Vincom `be4771f73849d8d6909cbb8ba56edf5c9901446bcbdd392299f540169ceebb6e`.

Dedicated trace/Lighthouse/LCP/INP/CLS, physical devices, production-host decoding/cache and real Wi-Fi measurements are **uncollected**. No new tool/plugin/dependency was added to the app. This is local implementation/measurement evidence, not release acceptance.

## Standards

Independent review of `2c35231...650b579`, followed by `650b579..a7864f0`: **0 documented violations, 0 actionable smell findings**. Resource/preparation/presentation ownership and the coordinated React selection owner match the documented architecture. Source review is separate from browser evidence.

## Spec

Independent review found two actionable implementation concerns: uncaught visible-render failures and a post-commit requested loader. Both are repaired in `a7864f0`; the narrow recheck reports **0 remaining actionable implementation findings**. Browser receipts and repeated measurements were captured afterward. Remaining native/shared-preview/device/host evidence limits above are not erased by source review.

## Reproduction and delivery boundary

Public checks live in `tests/browser-acceptance-checks.js`; local fault injection is served only with `scripts/serve-static.mjs --acceptance`. Normal outputs exclude fixture destinations and acceptance scripts. Fixture builds use `INCLUDE_TEST_FIXTURES=1` and separate `dist/fixtures/<mall>` outputs. Existing local servers: normal Saigon 4253 / Vincom 4254, fixtures 4263 / 4264. Preview uses Saigon `/en` on 4253; leave it open for the owner's acceptance.

Standalone runners are preserved under `D:/Midterm/.scratch/impeccable-browser/`: `runtime-final.mjs`, `runtime-edge.mjs`, `runtime-addon.mjs`, `confirm-final.mjs`, `measure-final.mjs`, `summarize.mjs`. They use the scratch-only Playwright install and installed Chrome; no app dependency/lockfile change. Run measurements after builds and other browser batches finish, not concurrently. Browser fixtures intercept public network/GPU APIs; they do not inspect private runtime state.

0013/0014 remain **in-progress** for native background-tab and reliable final shared-preview acceptance. Repeated local measurement and available failure/stale/resource/responsive checks are now delivered. Loading package stays **2/4 complete**, whole-product coverage **22.9%**; no remote push, PR or deployment.
