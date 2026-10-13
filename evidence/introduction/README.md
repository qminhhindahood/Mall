# Ticket 01 introduction delivery

Revision: **visitor-introduction-2026-10-14-r1**. Date: 14 October 2026. Isolated worktree: `D:/Midterm/.scratch/visitor-introduction`, branch `task/visitor-introduction`, base runtime `d23e3dd`. Only ticket 01 was implemented.

The Astro/React introduction now uses the approved Porcelain Daylight gallery composition, mall-specific identity and approved exterior, concise VI/EN copy, persistent Pause, live reduced motion, native scroll guidance and a post-hero header. Floor map retains the current selected floor; Discovery opens its existing separate section. The static SVG guide and ordinary floor routes survive scene failure. The introduction has no duplicate hero-copy CTA buttons. Camera framing fits the entire exterior bounding sphere at the current aspect ratio; no model or texture values were changed.

## Validation

- `npm run build:saigon` and `npm run build:vincom`: **passed**, Astro diagnostics 0 errors/warnings/hints, 22/20 static pages. Deferred 3D chunk-size warning remains.
- Asset preparation: **passed**, exact lossless identity/Brotli/gzip round trips; unchanged exterior revision **photo-polish-2026-10-12-delivery-r2** and floor revision **source-palette-schematic-2026-10-13-r2**.
- `git diff --check`: **passed**. Impeccable detector on Explorer/introduction CSS: **passed**, `[]`.
- [Final browser results](browser-results.json): **12/12 passed**, headless Chrome 149.0.7827.198 / SwiftShader, both malls, 1280×800 and 390×844, both locales. Four journey cases check automatic rotation, Pause/Resume, Pause surviving reload/language changes, live reduced motion, native wheel, header timing/inert state, selected-floor map/Discovery targets, Back/focus and keyboard skip. Six injected model/WebGL/import failures preserve the localized static guide and practical navigation. Two no-JavaScript cases verify SVG, bottom anchor and ordinary floor links.
- [Initial browser results](browser-results-initial.json): **6/12 passed**. Four reduced-motion probes counted finite background offscreen preparation as presentation motion; corrected by waiting for those finite frames to settle before comparing. Two module-failure probes were ineffective; final checks block the actual module request through the browser. No implementation regression was concealed as a pass.
- T3 preview: rendered Saigon introduction, VI→EN and Vincom native scroll/header reveal observed. Snapshot/resize errors and measured viewport drift occurred; then `preview_status` explicitly reported no automation host and instructed headless fallback. T3 was not used as exact-width acceptance.

The browser driver is externally installed in `.scratch/impeccable-browser`; no unit/helper/mesh test suite or new application dependency was added. Run `checkIntroduction(chromium, evidencePath)` from [the browser check](../../browser-checks/introduction.mjs) against `serve-static --acceptance` on ports 4273/4274.

## Visual review

Both malls/locales have desktop and phone screenshots in this folder. The approved prototype provides the visual authority: warm paper, self-hosted Manrope/Be Vietnam Pro, mall-specific lacquer accents, isolated building, minimal opening controls and bottom scroll instruction. Phone composition stacks copy before the scene and can exceed one viewport. The building is framed completely in the supplied screenshots; the camera bounds accommodate rotation and resize.

In-thread finish review substituted for delegated review because the project disallows subagents without the user's explicit request. **Disposition: ship for ticket 01 scope.** Persistence: DESIGN.md and sidecar record the built introduction. Fidelity: approved copy/composition/materials retained; phone stacking is the responsive adaptation. Ceiling: desktop/phone inspected, detector clear. Material fixes: none open for this slice. Keep: native navigation, accessible static fallback and unchanged approved model detail.

## Limits and handoff

Physical-device performance, native background-tab behavior, production hosting, full turntable angle acceptance and owner review of exact glass tuning are **not-run** here. Existing 0013/0014 evidence gates remain open. Reviewed directory content, complete floor/map interactions and map-to-Discovery continuity remain their own tickets. No deployment, remote push or release approval.

The site branches currently host the standalone exterior reviewer at repository root. Carry this Astro app into a `visitor-app/` subtree on each branch so the existing reviewer and mall assets remain intact; the shared app produces independent mall builds. Existing work appearing in the integration branch is preserved during delivery, with ticket 01 changes separately committed.

Ticket 01 implementation is **c15168a**. Merge **400f918** preserves existing floor-overview work **b52ab41** without claiming its delivery. After that merge, both mall builds and the complete **12/12** introduction browser matrix passed again; the current screenshots/results describe the integrated tree. The independently reviewable introduction implementation remains isolated in c15168a.
