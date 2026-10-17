# Animation and stability delivery — 17 October 2026

## Delivered source

The four-file implementation starts at **96d1384** and ends at source commit **110c08c** on `task/animation-stability-2026-10-17`; the shared app integration branch contains that source and the evidence commits. The implementation avoids renderer buffer resizes during steady animation, smooths the exterior approach and fade of the full tower/description group, anchors the overview and its copy, keeps floor preview stable across motion-preference changes, and supports the motion pause/reduced-motion states. Site commits are Vincom **0a703de** and Takashimaya **aa40f43**; [`propagation.json`](propagation.json) records the source/evidence commits, four-file diff, and protected-file manifest hashes.

Asset revisions are unchanged: exterior `photo-polish-2026-10-12-delivery-r2`, floors `source-palette-schematic-2026-10-13-r2`, and pending content `directory-pending-2026-10-14-r1`. The existing source-derived fragmented floor surfaces remain. Connected-slab geometry, Discovery composition, and unit-code mappings are deferred.

## Final validation

All browser output below is local static output in headless Chrome 149.0.7827.198 with SwiftShader for the journey matrices, CSS viewports, and reduced-motion/native-preference emulation. It is not physical-device or production-host evidence.

| Check | Result |
| --- | --- |
| Public builds | Saigon 22 routes / 50 assets; Vincom 20 routes / 47 assets. Both `astro check` runs: zero errors/warnings, six evidence hints; each build emits the existing >500 kB chunk advisory. |
| Fixture builds | Saigon 30 routes / 58 assets; Vincom 28 routes / 55 assets. Fixtures remain test-only. |
| Motion and normal journey matrix | 8/8 cases, 316 checks, zero failures/errors. Each mall/locale/width combination covers fade/reveal frames, floor labels and selection, reverse scroll, Discovery skip/map retention, Pause/reduced motion, and the prepared-view stability loop. See [`suite/browser-results.json`](suite/browser-results.json), [`final-matrix-script.mjs`](final-matrix-script.mjs), screenshots under `suite/frames/`, and recordings under `suite/video/`. |
| Fallback and reduced motion | 16/16 mall/locale/mode cases, 126 checks, zero failures across reduced motion, no JavaScript, import failure, and context loss. See [`suite/fallback-results.json`](suite/fallback-results.json). |
| Synthetic fixtures | 8/8 mall/locale/width cases, 264 checks, zero failures. See [`suite/fixture-results.json`](suite/fixture-results.json). |
| Edge regressions | 8/8 cases, zero failures: held-GPU reversal, genuine pending-work gate, latest selection, intermediate history Back, context Retry, and prepared focus/Pause. See [`suite/edge-results.json`](suite/edge-results.json). |
| Native wheel and focused floor preview | 4/4 mall/width cases pass. Down/up wheel input retained a complete frame, opened no loader, and caused zero drawing-buffer resizes. Changing `prefers-reduced-motion` while L2 was focused retained the focus preview. See [`suite/paired-native-profile.json`](suite/paired-native-profile.json). |
| Site branches | `vincom-dong-khoi` and `takashimaya` each build the correct mall output (20 and 22 routes); Astro check is clean. Exactly four `visitor-app/src` files differ, and hashes for all 645 other tracked files per site match their pre-copy values. |

The separate paired frame-sampling profile used one Chrome page at a time on ANGLE / AMD Radeon 780M D3D11, DPR 1. The candidate recorded zero drawing-buffer attribute changes in all eight samples; base `96d1384` recorded 40–44 for Saigon and 434–436 for Vincom. Saigon frame intervals varied substantially between paired runs (candidate median 105–111 ms; base 105–117 ms), so frame-rate comparison is inconclusive. Vincom medians were 5.6 ms for both revisions. This local sample is not a production performance sign-off.

## Reproduction

From `.scratch/animation-stability-2026-10-17`:

```powershell
npm run check
npm run build:saigon
npm run build:vincom
$env:INCLUDE_TEST_FIXTURES = '1'
npm run build:saigon
npm run build:vincom
Remove-Item Env:INCLUDE_TEST_FIXTURES
node evidence/animation-stability-2026-10-17/final-matrix-script.mjs
node evidence/animation-stability-2026-10-17/final-fallback-script.mjs
node evidence/animation-stability-2026-10-17/final-fixture-script.mjs
node evidence/animation-stability-2026-10-17/edge.mjs
node evidence/animation-stability-2026-10-17/paired-native-profile.mjs
```

The browser scripts expect sequential local static servers on 4333/4334 (public, with the acceptance shim) and 4337/4338 (fixtures). Use `scripts/serve-static.mjs --mall <mall-id> --dir <dist-path> --port <port>` for each output; add `--acceptance` on the public servers. `paired-native-profile.mjs` compares the candidate with base `96d1384` on 4343/4344. Recreate the baseline with `git -C implementation/mall-visitor worktree add --detach D:/Midterm/.scratch/animation-stability-baseline-2026-10-17 96d1384`, connect its `node_modules` junction to `implementation/mall-visitor/node_modules`, then run `npm run build:saigon` and `npm run build:vincom` sequentially in the baseline worktree. Only one browser run should render WebGL at a time.

## Earlier attempts and limits

`attempts/` and `recordings/` preserve earlier/superseded captures. The old introduction harness in `suite/native-wheel/browser-results.json` is **not a pass**: its 4 initial cases stop on a stale “Header stays hidden until hero ends” assertion before reaching its wheel check. The final wheel evidence is the separately passing direct native-wheel portion of `suite/paired-native-profile.json`. The earlier unpaired sample is retained as `native-baseline.json` and is not used for comparison.

Independent Standards/Spec reviews in [`reviews.json`](reviews.json) report no blocking or unresolved findings; they do not establish rendered owner acceptance. The stale Impeccable sidecar advisory remains recorded in `design-detector.json` and was not refreshed. Native background-tab pause/return, reliable shared-preview acceptance, physical-device behavior, production/Wi-Fi performance, visual composition acceptance, reviewed content, Discovery, geometry, and release approval remain open. No deployment, push, publication, issue closure, or coverage increase is claimed.
