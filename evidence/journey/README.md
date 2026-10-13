# Visitor journey integration — visitor-discovery-2026-10-14-r1

Ticket 03 / local issue 0016. Integration branch: `integration/full-detail-3d-loading`, worktree `D:/Midterm/implementation/mall-visitor`. Approved exterior revision remains `photo-polish-2026-10-12-delivery-r2`; floor inputs remain `source-palette-schematic-2026-10-13-r2`. No source model, mesh, texture or floor-input asset revision was changed.

## Delivered behavior

The four-section introduction → source-floor overview → practical map/directory → Discovery journey uses one coordinated explorer. Map and canvas hosts persist through Discovery; native scrolling progressively reduces the map preview, with an immediate reduced-motion equivalent. Preview-floor counts and category ties use distinct open destination IDs and recorded floor order while retaining the practical floor. Highlights remain explicit editorial references. View all opens the complete matching collection grouped by floor.

Directory search normalizes Vietnamese accents, đ, case and whitespace, and offers bounded typo suggestions without auto-selection. Shared mapped areas expose individual destinations; each multi-floor destination keeps one ID and verified floor links. Unknown precise locations receive no false highlight. Facilities have separate search/toggle presentation. Details preserve filters, provide source/review/certainty information, and copy a shareable link or show a copy fallback. Browser history and locale preserve context and usable focus.

Public content is intentionally pending. On 14 October the owner confirmed that a real snapshot must be supplied or researched and submitted for team review. Both `directory.json` files have `approval: pending`, `reviewedAt: null`, and no records. No tenant location, review date or Highlight approval was inferred. Test builds alone substitute clearly labeled synthetic records under `dist/fixtures/`; neither deployment configuration targets them. [Import contract](../../docs/directory-import.md).

The practical source-coordinate SVG stays outside 3D scene ownership. Its geometry request survives an early 3D import failure; source images and server-rendered SVG guides remain fallbacks. Destination SSR stays floor-neutral until query-floor hydration resolves, while no-JavaScript destination basics and all verified floor diagrams remain available.

## Verification and limitations

Final receipts are in `browser-results.json`; prior attempts remain in `browser-attempt-1.json` through `browser-attempt-4.json`. The first harness navigated before hydration and sampled focus/scroll before React committed; it was corrected to await hydration and two animation frames. Subsequent phone/failure checks exposed a real Discovery detection threshold bug, repaired using the visible sticky-map boundary. Early module failure also exposed coupled geometry cancellation, repaired with an independent request controller. Failure-state locale changes exposed native scroll anchoring; locale scroll is now explicitly preserved and automatic anchoring disabled.

T3 preview passed 25 preliminary public-control checks and captured the initial desktop composition. Its measured viewport/DPR differed from requested settings in some probes. Snapshot/resize were intermittent, then an explicit unavailable-host error authorized standalone browser verification. `t3-results.json` keeps that preliminary source/profile separate from final headless Chrome evidence. No T3 or headless observation counts as a physical-phone check.

Both public and isolated fixture builds run Astro/TypeScript checking. Wrangler 4.150.0 static-assets dry runs validate independent mall packages without upload. `_headers` retains compressed model/data response encodings; localized nearest-404 assets, root VI redirect, optional origin-based sitemap/metadata and release manifests are prepared. [Release preparation](../../docs/static-release.md).

The existing large deferred-scene chunk warning remains. Local complete-frame timings are diagnostics, not a production/Wi-Fi benchmark or five-second acceptance. 0013/0014 native background-tab, stable final shared-preview and production-host gates remain open. No production origin/account, deployed HTTP behavior or physical device was verified. Full composited glass contrast over the permitted range, enlarged-text/zoom and unsupported-blur/reduced-transparency browser acceptance remain release gates, despite implemented opaque fallbacks and readable source-map boundaries.

The Impeccable mechanical detector ran once and reported advisory undocumented palette/type additions; these were documented in DESIGN.md. A source/render review was performed in-thread to honor the project's no-subagent preference; it is not an independent finishing review. No deployment, push or owner release approval is claimed.

## Final verification receipt

- **18/18 journey scenarios, 398 checks passed**, Chrome 149.0.7827.198 / SwiftShader. Eight normal fixture runs cover both malls × both locales × 1280×800 and 390×844; four scripts-disabled public runs cover both malls/locales and all static floors; two shared-store runs verify floor-neutral SSR, L2 hydration and invalid-floor correction; four phone-width failure runs repeat the complete practical journey after context loss or blocked scene import.
- **8/8 public all-floor scenarios, 68 checks passed**: both malls × both locales × both widths, default keyboard skip and immediate overview selection for every supported floor. Both public pending states pass. These are additional to the 18-scenario matrix; no physical-device claim follows.
- Final `npm run check`: zero errors/warnings/hints. Both package build commands passed during implementation. Final source was checked once, then the same existing asset preparation → Astro static build → release preparation stages ran sequentially for both public and both isolated fixture outputs. `final-builds.log` records those stages; the final Explorer chunk is identical across all four outputs.
- Both final Wrangler static-assets dry runs pass with no upload or bindings. No account/origin/production check was performed.
- Final initial complete-frame samples in the core matrix range **607.5–5462.4 ms**. The 5462.4 ms sample misses the five-second initial goal. These are localhost software-renderer diagnostics with uncontrolled shader/cache warmth, not repeated production or Wi-Fi acceptance.
- Final source control and branch propagation are recorded in local issue 0016 and the project index. Full content, glass-composite, native-background and release gates remain open.

Final public render checks also confirm reset scale 1, pending content and no horizontal overflow for both malls at 1280/390 widths (`public-render-results.json`, `public-*.png`). Fixture screenshots are separate; initial captures taken during zoom/reset are not the public render acceptance frames.
