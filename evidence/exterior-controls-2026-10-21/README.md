# Exterior controls and finite arrival — 21 October 2026

Owned source: `src/runtime/create-scene-runtime.ts`, `src/runtime/scene-contract.ts`, `src/components/ExteriorControls.tsx`, `src/styles/exterior-controls.css`. Parent owns the Explorer integration and builds. Existing assets and geometry are unchanged (`photo-polish-2026-10-12-delivery-r2`).

The previous indefinite exterior spin becomes a finite 5,500 ms eased front-view arrival: approximately 13.8 degrees of yaw and an 8% camera-distance settle. It stops at its final frame. Pause/background time is excluded. First pointer, wheel or keyboard input cancels automatic presentation; the parent's early-input latch covers shell interaction before runtime creation. Explicit replay is separate. This implements a bounded arrival, not a larger multi-stage cinematic sequence or new appearance acceptance.

Direct labelled buttons rotate, look, zoom and reset. Runtime limits rotation to ±π/3, look offset to −.18… .45 and fit-distance multiplier to .75…1.35. Nonfinite deltas are ignored. Manual camera settings fade out into the existing scroll-driven floor approach. GPU preparation cannot drop a queued manual redraw. Native scrolling remains available.

## Verification

- `npm run check`: 40 files; zero errors, warnings or hints before parent integration. Parent owns subsequent full builds/checks.
- `check-built.mjs` against actual built previews 4490/4491: **6 cases / 58 assertions pass**; both malls, desktop normal motion, 390px Vietnamese normal motion, desktop reduced motion. Actual exterior complete frames; approximately 5.5-second arrival and final stillness; keyboard cancellation during replay; direct-control cancellation; upper/lower limits and reset; 44px targets; no page errors. Reduced-motion exterior screenshots remain byte-identical 300 ms apart.
- `built-results.json` and six corresponding PNGs contain this run. These are software-rendered Chrome checks, not native performance or physical-device acceptance.
- The first run (`built-results-before-css-repair.json`, `*-failed.png`) identified a clipped panel and an invalid reduced-motion test using a frame counter shared with offscreen preparation. The corrected reduced-motion assertion compares the visible exterior itself.
- The panel alignment fix (`left:0; right:auto`) is in source. The successful run explicitly overlays that same CSS on the earlier build to verify geometry. Its screenshots therefore **do not establish a fresh final-build visual pass**. Parent must rebuild and retest the panel and phone hero-title clearance. Phone wrapped language controls overlapped the title in the earlier output; parent owns that separate shell repair.
- The earlier synthetic dev harness did not execute because Astro's development module transport timed out. `runtime-results.json` is empty and is not passing evidence. That known dev session was stopped. No dependencies were installed and no build, upload, push or deploy was performed by this lane.

## Integration API

`ExteriorControls` takes `runtime`, `locale`, `enabled`, and optional `onManualInput`. Runtime exposes `adjustExterior({rotate?,look?,zoom?})`, `resetExterior()`, `stopAutomaticPresentation()`, and `replayArrival()`. Existing maps, source-plan journey, model-failure handling and native navigation remain owned by the shared Explorer.
