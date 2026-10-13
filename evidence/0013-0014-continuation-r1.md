# Loading runtime and diagnostics continuation

13 October 2026. Code delivery `0442fcb75028861c82c52dec768b4cca6b057a81`,
from integration `6459e4b`, developed on `task/0013-0014-acceptance` in an
isolated worktree. This is an implemented candidate with **acceptance open**,
not a completed 0013/0014 or release claim.

## Delivered changes

- Bounded User Timing spans distinguish navigation-to-frame, entry/retry,
  requested scene, module, model/geometry transfer, JSON validation/decode,
  GLTF decode, floor construction, GPU preparation and actual frame submission.
  Marks include mall, source revision, floor/view and outcomes where applicable.
  Request timing starts at navigation interaction, and stale work is labeled.
- Resource marks report owned geometry/material/texture counts, CPU geometry
  array bytes and texture/render-target/PMREM estimates. These are not measured
  GPU allocations; driver, default-framebuffer and shader costs are excluded.
- GLTF resource errors fail preparation instead of revealing a scene with
  missing textures. Resources arriving after cancellation are also disposed.
- Known context/request failures dispose the failed attempt immediately.
  PMREM transient resources dispose in `finally`; shared ownership cleanup
  clears resource sets. No timeout or quality downgrade was added.
- A failed lazy import retries by loading the current selection route, because
  the browser retains failed import state within the existing document. Other
  retries use a fresh canvas while retaining selection and Pause state.
- Floor/destination focus follows committed complete-frame/error state;
  requested deep-entry content scrolls into view. Destination details are
  focusable; the wordmark returns to the mall homepage. Invalid destination
  floor queries resolve to the primary floor with a localized notice, and
  canonical metadata follows the current route.
- Destination static fallback includes every related floor with honest labels,
  keeping query-dependent SSR selection neutral. Fixture builds have separate
  `dist/fixtures/{mall}` directories.
- An explicit local `--acceptance` server mode injects browser/network fault
  fixtures. Neither injection nor test script endpoints enter normal outputs.
  Public checks cover failures/retry, all-floor journeys, shared-store entry,
  context loss, later GPU draw failure and timing capture. No helper/unit suite.

## Source revisions

Exterior assets remain `photo-polish-2026-10-12-delivery-r2`:
Saigon SHA256 `f04fee93c620b698874e67e319d2140cbed60796506f63213c5e57b6aad49050`;
Vincom `e2853dcf2fdf123ed897eb6f0e0014d12de6dfcf9ba81bc202d1ad8035c50c5e`.
Both floor inputs remain `source-palette-schematic-2026-10-13-r2`, canonical LF,
with original reference image bytes retained. No model, texture or floor asset
was revised by this continuation. Historical byte figures remain tied to their
earlier serialization receipts.

## Passed prerequisites on final source

| Check | Result |
| --- | --- |
| `npm ci` | 304 packages, zero reported vulnerabilities |
| Astro diagnostics | 0 errors, warnings or hints |
| `npm run build:saigon` | 22 normal static pages |
| `npm run build:vincom` | 20 normal static pages |
| Fixture builds | 24 Saigon / 22 Vincom pages in isolated output; latest final focus guard still needs fixture rebuild before browser claims |
| Input validation | 8/7 floors, original source maps identical, finite nondegenerate rings, no inferred holes |
| Built route probes | 16 Saigon / 14 Vincom bilingual floor routes retain SVG content |
| Unknown and fixture production routes | truthful 404 for both malls |
| Mall isolation | selected mall manifest and 8/7 map files only |
| Model/geometry identity and Brotli | browser-decoded HTTP response bytes hash exactly to their source |
| Cache/encoding headers | explicit `br`, identity, `Vary`, ETag and 304 validator checks recorded |
| JS syntax / whitespace | existing and added browser scripts, server/capture scripts, `git diff --check` pass |

The deferred Three/R3F chunk still emits the existing >500 kB build warning.
Exact bundle sizes and calculated gzip estimates are in
[built transport receipts](0014-built-transport.json); JavaScript gzip estimates
are not observed served encodings. The non-3D chunk estimates remain separate
from the lazy renderer.

| Asset | Saigon identity / Brotli bytes | Vincom identity / Brotli bytes |
| --- | --- | --- |
| Exterior | 2,000,796 / 205,547 | 4,797,176 / 1,199,582 |
| Canonical floor JSON | 5,181,012 / 1,084,569 | 243,505 / 42,221 |

These are local exact-byte transport measurements, not production hosting or
device latency acceptance. The local server uses `public, max-age=0,
must-revalidate`; warm visits can revalidate. All final transport details and
hashes are captured in the linked JSON.

## Browser observations and limitations

Intermediate public checks observed useful SVG/error content after deliberate
model, geometry and import failures, WebGL-unavailable recovery with one canvas,
invalid geometry recovery with preserved Vietnamese/L2 context, and delayed
selection ending on the latest Vietnamese/L3 Discovery route. A deliberately
delayed initial request remained covered beyond five seconds. Vincom's full
seven-floor map/Discovery journey, locale/history, keyboard focus, static routes
and scripts-disabled iframe checks eventually returned green on the intermediate
focus-serial candidate. These observations do **not** pass the final candidate.

Two red findings drove changes: native failed-import Retry failed again in the
same document, and rapid already-prepared view changes could leave focus on the
prior scene. A cold-cache test harness also appended query parameters to blob
texture URLs, corrupting its own full-detail samples. That harness defect is
fixed; its earlier timings and delayed-state runs are explicitly excluded from
full-detail/performance acceptance. GLTF texture-error handling was hardened.

The T3 preview repeatedly failed snapshot/resize calls. One heartbeat observed
a timer after about 127 ms but an animation frame about 60,684 ms later, despite
a visible document report. Some later GPU polling paused. After the owner
confirmed the preview was open, its tool status still intermittently returned
`visible:false`; the final sample had `document.visibilityState === 'hidden'`
and timed out at the browser harness deadline. That deadline only fails a test;
the production loader continues waiting. No readiness timeout was introduced.

[Interim raw observations](0014-interim-observations.json) label invalid runs.
[Interim Vincom L2 screenshot](0013-vincom-L2-interim.png) predates the final
focus/resource fixes and is scoped evidence only. No final responsive pass,
five-second goal pass or repeated cold/warm matrix is claimed.

## Integration review

Standards and Spec were reviewed independently from fixed base `2c35231`,
including the continuation working tree. Standards: zero hard violations;
one ownership-disposal duplication judgement was repaired, with zero remaining
actionable findings on re-review. Spec: navigation timing, environment accounting,
destination focus/scroll, deep-entry home navigation, PMREM setup cleanup, late
texture disposal and exterior Retry focus findings were repaired. Final review
reported zero remaining actionable Spec findings. Review is code evidence,
not a substitute for final browser acceptance.

## Resume verification

Keep the preview actually visible for the entire final run and record T3 status
before/after each scenario. Rebuild both normal outputs from the final commit.
For fixture outputs, set `INCLUDE_TEST_FIXTURES=1` for each build, then remove the
variable. Start the same `scripts/serve-static.mjs` with `--acceptance`, selected
mall/port and, for fixtures, `--dir dist/fixtures/{mall}`.

Load `/__acceptance/browser-acceptance-checks.js` through T3 page evaluation and
run its public functions. Supported fault URL parameters are `__scenario=`:
`model-fail`, `model-invalid`, `geometry-fail`, `geometry-invalid`, `texture-fail`,
`import-fail`, `webgl-unavailable`, `delayed`, `identity`. `__cache=cold&__run=`
bypasses same-origin fetch caches, preserving embedded blob URLs; it is not a
fresh browser/process cache profile. Native lazy imports retain their actual
browser cache state. Import Retry navigates to a fresh document, so verify its
post-reload state as a separate browser step.

Run `browserAcceptanceJourney`, `browserAcceptanceFailureAndRetry`,
`browserContextLossAndRetry`, `browserLaterRenderFailureAndRetry`,
`browserFixtureEntry` and `browserMeasurementRun` on their documented routes.
Repeat identity/Brotli, cold-transfer/warm, early/already-ready samples for both
malls and retain failures/misses. Also finish pause/reduced-motion/offscreen,
controlled background visibility and disposal/reuse observations.

Still uncollected: stable final both-mall suite, latest fixture/deep-link suite,
context-loss and later-draw checks, final resource observations, responsive
screenshots, repeated profile matrix, dedicated trace/Lighthouse/TBT, LCP/INP/CLS
acceptance, physical devices and production-host negotiation. Dedicated tracing
tools are absent. Device/asset/content/release gates stay separate. Issues 0013
and 0014 remain in progress; whole-project coverage remains 22.9%. No remote
push, PR, deployment or publication.
