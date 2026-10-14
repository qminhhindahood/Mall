# Continuous visitor journey — continuous-journey-2026-10-14-r1

Issue [0017](../../../../docs/issues/0017-continuous-visitor-journey.md), integration branch `integration/continuous-visitor-journey`. Tested application source **13a2083**, implementing **210673f**, render fixes **9f266bb**, review fixes **7dc0d52**. Owner visual acceptance remains open. No production deployment, upload or push.

Open the [rendered gallery](gallery.html) for both malls, VI/EN, desktop 1280×800 and phone 390×844. It includes initial exterior, intermediate fade, compact stack, selected-floor travel, representative maps, Discovery and reverse exterior frames. Four linked recordings show actual native scrolling, floor selection and reversal; endpoint screenshots alone are not the motion evidence. [Source geometry review](geometry-review.md) covers all 15 levels; [estimated frame](motion-frame.md) records camera, bearing, scale/tilt, raised depth/spacing and registration limits.

## Delivered behavior

The exterior and source plans share a persistent presentation frame. Scrolling approaches the shopping portion, normalizes its bearing and fades the exterior into compact raised source layers. All floor labels remain visible, with layout-measured callouts and selectable floor surfaces. Selecting a floor travels into its top-down map, preserving the source contours and common union frame; other floors fade. The map persists into the separate Discovery section. Reversal restores stack/exterior and keeps the floor while dismissing incompatible destination/area details.

Localized **Skip to Discovery** appears after the introduction, opens Discovery directly without a floor choice, preserves floor/locale/history and focuses the content. Required complete-detail preparation still gates unfinished scenes. Reduced motion uses direct equivalents and responds to preference changes after entry. Existing Pause/Resume, directory/search/details/sharing, keyboard access, routes, noJS SVG and 3D-failure functionality remain usable. Public directories remain empty/pending; fixtures remain exclusively in `dist/fixtures/`, outside deployment targets.

## Verification

[Summary and exact asset receipt](validation-summary.json): **32/32 cases, 706 checks, zero failures** at 13a2083.

| Matrix | Cases | Checks | Scope |
| --- | ---: | ---: | --- |
| [Normal journey](browser-results.json) | 8 | 316 | Both malls/locales/widths; intermediate reveal/travel, all 15 labels and contour identities, physical floor-surface clicks, skip before a choice, history, Discovery/map persistence and reverse selection |
| [Fallbacks and motion](fallback-results.json) | 16 | 126 | Both malls/locales at 390×844; actual scripts-disabled pages/all static floors/404, reduced/live motion, blocked scene import and real WebGL context loss, practical focus/locale/history/skip |
| [Isolated fixtures](fixture-results.json) | 8 | 264 | Existing full directory/search/shared-area/multi-floor/Discovery/sharing/facility/history checks; direct query-floor detail entry, reverse detail dismissal and newest rapid selection |

Final `npm run check`: **39 files, zero errors/warnings/hints** ([log](final-check.log)). Both existing public build commands and both isolated fixture build commands pass. Logs retain the existing deferred-scene **>500 kB** chunk warning. The Vincom public build temporarily reported two unused-import hints from copied *evidence scripts*, now stored as `.txt`; the final check is clear. This was not an application defect. Source-map/exterior hashes and pending snapshot metadata are verified in the summary; unchanged asset revisions are **photo-polish-2026-10-12-delivery-r2** and **source-palette-schematic-2026-10-13-r2**.

Browser: **Chrome 149.0.7827.198**, headless, CSS viewport emulation, DPR1. Final sampled renderer: **ANGLE / AMD Radeon 780M / Direct3D11**, visible document. These are local browser observations, not physical-phone tests or production/Wi-Fi timing acceptance. Early runner descriptions called the profile SwiftShader because `--enable-unsafe-swiftshader` was passed; that flag permits fallback and does not force software rendering. The final measured GPU supersedes that assumption; prior provisional receipts did not independently sample their renderer.

T3 preview initially opened at Chrome152/Electron44 and captured the baseline. It then returned an explicit unavailable-host error with “Do not retry,” authorizing the standalone browser fallback. No final T3-host acceptance is claimed. The opt-in `__motion=normal` fixture applies only to an explicitly started `--acceptance` server and never enters production HTML; final headless cases used native browser preference emulation.

Standards review: zero documented breaches; the shared bounds and duplicated responsive flight-geometry findings were fixed. Spec review: duplicate canvas exposure during flight, retained details on return to building, stale initial reduced-motion camera state and arbitrary exterior bearing were fixed; final source review found no remaining concrete defects. Rendered registration usefulness still requires owner acceptance.

## Preliminary evidence and reproduction

`browser-red.json` records the baseline failing post-hero skip check at 19ba65a. `probe/` retains initial phone premature reveal/prose overlap and the short overview interval; 9f266bb repairs them. `browser-attempt-9f266bb.json` retains the passing earlier matrix, which does not verify later source fixes. `fallback-attempt-1.json` retains one timing miss: cached-scene readiness returned before the next scroll animation frame. The final test waits two frames and passes. The deliberate import failure is blocked at the browser HTTP seam; it does not rely on a module referrer carrying the document query.

Runner source snapshots are `final-matrix-script.mjs.txt`, `final-fallback-script.mjs.txt` and `final-fixture-script.mjs.txt`. They ran from `D:/Midterm/.scratch/impeccable-browser` using its existing Playwright installation and installed Chrome. Reproduction servers use this application's `scripts/serve-static.mjs`: public Saigon/Vincom ports4263/4264 with `--acceptance`; isolated fixture ports4265/4266 with `--dir dist/fixtures/<mall-id> --acceptance`. Build fixtures with `INCLUDE_TEST_FIXTURES=1`; normal builds leave that variable absent. The source snapshots retain workspace paths intentionally and are not runtime assets.

## Remaining acceptance

Owner review must accept the visible connected journey, estimated registration, floor structure/spacing and callouts before closing0017. Exact glass/material and broader browser/backdrop review, reviewed bilingual content/locations/Highlights, 0013/0014 native-background/production-host/performance gates and release approval remain independent. Physical-phone verification remains waived/not-run. Vincom's unchanged4,797,176-byte exterior remains above the provisional3MB target; this delivery adds no new performance-budget pass. Historical whole-project coverage stays47.9% pending broader story acceptance.

Both local site-tree deliveries and byte-preservation receipts are recorded in `branch-propagation.json` and the root issue/index. The local tracker is outside Git; no GitHub issue or PR is required.
