# Issue 0013 — WIP checkpoint, 13 October 2026

Question: can the accepted initial pair/later-scene loading contract use actual
R3F/Three complete-frame preparation while retaining exact source detail?

This is an implementation checkpoint, not accepted delivery. Issue 0013 and
dependent 0014 remain open. Root asked for immediate handoff because the owner
has limited time; no new long scenarios were started.

## Implemented source

- One R3F createRoot/never-loop/priority render driver and one canvas/context per
  attempt; revision-keyed views, serialized GPU jobs, requested task priority,
  finite background map/Discovery jobs and one reused scratch target.
- Exact polished GLB parse, original embedded textures/materials; source-byte
  Brotli transport only. All source contour points retained in indexed floor
  caps/sides. One shared geometry buffer per floor across overview/map/Discovery,
  without simplification, quantization or texture downgrade.
- PMREM environment, texture initialization, compileAsync, actual scratch frame
  plus asynchronous GPU readback before prepared status; final actual-canvas
  render behind loader before show resolves. No timeout or minimum duration.
- Context failure rejects lifecycle/gates and invalidates GPU readiness. Attempt
  teardown disposes unique owned buffers/materials/textures/environment/target;
  retry owns a distinct canvas. Pause/reduced motion and stage/document visibility.
- Model and full-geometry requests begin before lazy module factory. Early model
  rejection is handled. Geometry validation precedes React replacement of useful
  SSR guide. Memoized FloorMap avoids contour serialization on each phase update.
- Initial latest-selection loop and show serials prevent stale scene presentation;
  full-page dialog inerts siblings including SSR guide, owns focus/scroll lock.

## Exact checks and limits

Confirmed branch base before edits: integration/full-detail-3d-loading at 5d20dd4.
Public red on deliberate foundation stub at localhost:4243/en: no revealed real
3D, localized error/static guide, 208 SVG paths. No helper/reducer unit tests.

Public first green on real runtime while tab_n reported visible:true: exterior
canvas visible, loader absent, actual complete-frame attribute 37, screenshot
showed fully textured polished Saigon building. Initial required preparation
marks: exterior 2112.2ms; overview 3379.8ms; actual shown 3395.6ms; entry start
209ms (3186.6ms gate in this single local sample). All 16 map/Discovery background
marks followed by 3805.1ms. These are one localhost sample, not Wi-Fi/device goal
acceptance, CWV/Lighthouse or repeated timing evidence.

Resource Timing in that sample: GLB br began 210.6ms (205547 encoded/2000796
decoded bytes); full geometry br began 211ms (1084571 encoded/5181013 decoded);
lazy runtime module began 212ms (787434 bytes). Byte inputs remained original.

Next public red: ready app retained inert=true. Corrected by removing competing
React inert prop and letting the dialog effect restore original sibling values.
Also added serialized GPU preparation/presentation and bounded parking width.
These final changes passed Astro diagnostics/build for Saigon; Vincom build
passed before the final inert-only correction. Both diagnostics 0 errors/warnings.
Generic deferred chunk >500kB warning remains. git diff --check passed.

Final reload reported tab_n visible:false despite preview_open(show:true,
open:true), and loader remained pending after model decode. No final green or
failure was inferred from this suspended renderer. User/main UI must keep the
shared preview attached/visible for completion checks. Final source has not yet
passed the complete browser suite: both-mall reveal, all-floor/shared-store routes,
delayed and hard import/model/geometry failure, unavailable/context-loss/retry,
stale/history/locale/focus and physical/background visibility remain to run.
Review must inspect teardown/resource ownership and canvas shader preparation.

## Running local tools / continuation

Worktree D:/Midterm/.scratch/implement-0013; branch task/0013-scene-runtime.
Own node_modules installed npm ci (304 packages). Saigon static server port4243
session28753; Vincom port4244 session11370. Current visible-intended T3 tab_n at
http://localhost:4243/en/floors/L2?floor=L2&view=map. Preview was never hidden by
this agent; its final reported visibility was false. Do not claim it is visible.

Resume by keeping/reopening preview visible, rebuild both malls sequentially
after final canonical LF asset merge, rerun public entry check in
tests/browser-runtime-checks.js, then browser failure/route acceptance at that
same authorized seam. Data/scripts/hosting and root tracker remain other owners.
No remote PR/push/deployment and no current exterior worktree edits.

Final checkpoint merge: da097c0 includes current integration source receipts at 6c95db1. The Explorer focus conflict was resolved preserving dialog-owned restoration and the latest target section. Post-merge Astro check: 0 errors, 0 warnings, 0 hints (20 files); clean worktree after merge. Rebuild outputs against the canonical LF source on continuation; existing local outputs predate that final source-receipt merge.
