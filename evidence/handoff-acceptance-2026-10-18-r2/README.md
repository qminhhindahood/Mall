# Integrated Discovery review candidate — 18 October 2026, r2

Baseline app HEAD: `1ee2c29`; exact pending source and built bundle hashes are in [provenance.json](provenance.json). This delivers the recovered slab presentation, selected-floor hover/focus isolation and the research-only owner-decision overlay together. Exterior `photo-polish-2026-10-12-delivery-r2`, original floor geometry `source-palette-schematic-2026-10-13-r2` and public `directory-pending-2026-10-14-r1` remain unchanged. Presentation uses the exact `5d3c831` schematic slab artifacts; the private research geometry adds the accepted r4 overlay only. No deployment or public-content approval.

## Final validation

- [Six builds](builds.json): public, synthetic fixture and private research for both malls pass, including Astro checks. Original build logs retained.
- [Normal public journeys](suite/browser-results.json): eight cases / 316 checks pass.
- [Fallback journeys](suite/fallback-results.json): sixteen cases / 126 checks pass.
- [Current fixture journeys](suite/fixture-current-results.json): eight cases / 296 checks pass, both malls/locales at 1280px and 390px. Covers complete categories, shared/multi-floor destinations, unknown locations without false markers, locale/history, focus, map persistence, rapid selection and reverse scrolling.
- [Edge cases](suite/edge-results.json): eight cases pass. Simulated lifecycle/context-loss checks do not establish native background-tab acceptance.
- [Focused presentation and private Discovery](targeted-results.json): eight cases / 52 checks pass. Restored slabs on every floor, 107 Vincom reference zones, no clipped slab sides, hover/focus isolation, exact 35 additional Saigon regions plus seven accepted reuses, localized notices, no photos and unresolved no-marker access.
- [HTTP/source transport](built-transport.json): 30 routes and eight identity/compressed resources pass exact decoded-byte checks.

The original fixture run failed eight cases on the obsolete `.categories` selector; [original results](suite/fixture-results.json) and logs remain. [First updated attempt](suite/fixture-current-attempt-1.json) exposed two harness defects: a focus assertion before the required floor preparation gate completed, and SVG `.click()` use. [Minimal focus diagnosis](focus-diagnosis.json) confirms the loading dialog holds focus during preparation and the exact invoking listing receives it afterwards. The final test waits for that observable completion and dispatches the click event for SVG controls; no application behavior was relaxed to pass the tests. Current Discovery expectations replace superseded Highlights/View-all UI with complete collections and floating details, retaining the original behavior coverage.

Reproduction from the app checkout: `node evidence/handoff-acceptance-2026-10-18-r2/final-fixture-current.mjs` against fixture servers 4337/4338. The historical `run-suite.mjs` regenerates the old fixture script and is retained only as provenance; use the current fixture command for the revised UI. Other final harness paths are recorded in `provenance.json`.

## Review surfaces and limits

- Private Saigon Centre: <http://localhost:4355/en?view=discovery>
- Private Vincom: <http://localhost:4356/en?view=discovery>
- [Website text inventory](../../docs/content-preparation/website-text-review-2026-10-18-r1/review.html): 1,083 entries, current wording separated from proposals; English store descriptions currently use the pending fallback.
- [Scoped owner decisions](../../docs/content-preparation/integration-candidate-2026-10-18-r2/owner-decisions.json): all 42 geometry mappings and unresolved no-photo/no-marker treatment accepted; copy, roster, identity, rendered journey and release remain separate.

Profile: local Headless Chrome 149 / SwiftShader, CSS viewport emulation, not physical phone or production performance. Prior independent Standards/Spec reviews reported zero unresolved findings for the application changes; resumed harness corrections were reviewed directly without new subagents. Shared T3 preview opened successfully but remained `visible:false`; two snapshot attempts returned exactly `Preview automation snapshot timed out after 15000ms.` Repository browser checks supplied runtime validation. Some saved selected-card screenshots show a stale hero composite despite Discovery DOM state; they do not establish appearance acceptance. Native background/return, stable shared-preview, production-host timing and owner visual/content/release gates remain open under 0013/0014/0016/0019. No completion percentage is claimed.
