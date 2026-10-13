# Impeccable retry: loading and focus

13 October 2026. Starting integration `f6773ee`; exact exterior and schematic
floor asset revisions are unchanged. Scope: retry the open loading/browser
checks and audit the incumbent visitor guide. No visual redesign or publication.

## Implementation integrity verdict

**Pass for the loading slice, with product-style work still pending.** The guide
uses real mall-specific models/source maps, labels schematic uncertainty and
unavailable reviewed directory content, and keeps source SVG routes usable.
Test-only data and browser faults remain excluded from normal output. The full
Porcelain type/palette system is not yet integrated into this foundation.

The bundled detector reported one `side-tab` warning at `src/styles/guide.css:3`
for the error alert's 4px accent border. The alert has a real recovery purpose;
the warning concerns treatment, not fabricated content. This narrow retry
preserves that incumbent treatment. Raw output: [detector](impeccable-retry-detector.json).

## Provisional audit health

| Dimension | Score | Evidence and limit |
| --- | --- | --- |
| Accessibility | 2/4 | Focus regression repaired; readable measured text contrast; undersized controls/mobile header text remain |
| Performance | 3/4 | Lazy full-detail renderer, bounded preparation and real complete frames; broader repeated profile/CWV work pending |
| Responsive design | 2/4 | Desktop and 390px journeys pass without horizontal overflow; touch areas need work |
| Theming | 2/4 | Bright incumbent surfaces; shared raw colors and Guide-only headings do not complete the pinned mall-specific Porcelain system |
| Implementation integrity | 3/4 | Honest source-backed guide and functional fallback; full product presentation remains a separate scope |
| **Total** | **12/20 — Acceptable** | **A scoped implementation audit, not release or whole-product acceptance** |

## Fixed blocking finding

**P0: already-prepared floor changes could leave keyboard focus on the exterior.**
Location: `src/components/Explorer.tsx`, scene presentation completion and focus
effect. The public Vincom B3 journey timed out waiting for floor focus even though
the map had a complete frame, the loader was absent and the document/preview
were visible. A smaller L2 navigation reproduced the same result: frame 55,
current map L2, focus `scene-exterior`.

React can batch `loading` and `ready` for a cached scene into an unchanged final
state. Selection's focus effect ran before the new canvas frame; the complete-frame
guard correctly deferred focus, but there was then no committed dependency
change to retry it. Each accepted presentation now increments a state version,
so focus runs after the actual frame even when the loading value is unchanged.
Stale completions cannot increment that version. No readiness timing/quality or
asset changes. A browser regression covers map → Discovery → reused map focus.

## Remaining findings

- **P1 — short control targets.** `src/styles/guide.css:3–4`; measured overview
  links and language controls are below the project's 44 CSS px target. Floor
  chips and primary navigation mostly meet it at desktop. On phones, small
  controls make floor/locale selection harder. Add a 44px minimum hit area and
  vertical alignment to overview, language and mobile view controls.
  Suggested command: `$impeccable adapt`. This is a project-target finding;
  44px is not being presented as the WCAG AA minimum.
- **P1 — mobile header control text is 14.4px.** The `max-width:600px` header rule
  sets `.9rem`, reducing the language link below the canonical 16 CSS px control
  floor. Keep header controls at 1rem and let the layout wrap if needed.
  Suggested command: `$impeccable adapt`.
- **P2 — live floor maps are visually faint.** Desktop/mobile screenshots show
  low separation between pale floor geometry and the canvas surface, and a
  relatively small Saigon outline. The source SVG below is substantially easier
  to scan. Calibrate camera framing and material/light contrast against the
  source, retaining exact geometry; this audit does not assert a calibrated
  non-text contrast failure. Suggested command: `$impeccable polish`.
- **P2 — pinned Porcelain typography/palette remains incomplete.** Headings
  compute to `Guide` (Be Vietnam Pro), with the same teal selection treatment for
  both malls. The canonical brief specifies Manrope headings and distinct
  red/brown lacquer accents. Complete that product-style work in its own visual
  pass without relabeling the current loading foundation as a final design.
  Suggested command: `$impeccable typeset`, then `$impeccable polish`.

Remaining issue count: **0 P0, 2 P1, 2 P2, 0 P3**; the P0 focus finding above is
repaired. The recurring control-size rules are the main systemic accessibility
gap. No changes to factual copy or incumbent aesthetics were made here.

## Positive findings

- Both mall defaults and all 15 floor labels are preserved.
- Full-detail model preparation produces actual WebGL frames. No timeout,
  minimum wait or quality downgrade was introduced.
- Both locales, history, keyboard content focus, every map/Discovery view,
  truthful unknown-route 404 and scripts-disabled SVG fallback pass in the
  separate-browser confirmation.
- All four desktop/mobile runs retain normal page scrolling without horizontal
  overflow. No JavaScript page errors were observed.
- Solid text contrast calculated from the incumbent colors: body 10.91:1,
  disclosure 5.59:1, selected control text 9.82:1. This does not certify all
  composited scene/interactive states or WCAG conformance.

## Browser evidence

T3 initially recovered enough to verify Saigon and Vincom complete-frame entry
and save screenshots. Vincom default B2 had frame 37, a 1,191.6ms local
navigation-to-frame sample, and a visible document. Longer evaluation and
mobile resize calls failed; eventually `preview_open` itself returned an explicit
no-automation-host error. Only then was the alternate browser used.

The confirmation ran the same built app and public browser functions in local
headless Chrome **149.0.7827.198**, Windows, DPR 1, reduced motion. Actual WebGL
renderer: **ANGLE / AMD Radeon 780M / Direct3D11**. Software fallback permission
was enabled, but the reported renderer was AMD D3D11. This is separate from the
T3/Electron Chrome 152 profile and from physical-phone/production acceptance.

| Mall | Viewport | Journey/focus | Navigation-to-frame sample |
| --- | --- | --- | --- |
| Saigon | 1280×800 | passed | 5,637.0ms |
| Saigon | 390×844 | passed | 2,210.3ms |
| Vincom | 1280×800 | passed | 1,980.9ms |
| Vincom | 390×844 | passed | 1,326.4ms |

The first Saigon sample exceeds the five-second goal. These four samples have
different viewport/cache/driver-warmth conditions and are not a repeated
identity/Brotli or Wi-Fi benchmark matrix. No timing goal/release pass follows.
Do not treat the headless browser as a restored shared preview.

Raw profile, targets, headings, timings and journey results:
[browser receipts](impeccable-retry-browser.json).
Screenshots: [Saigon desktop](impeccable-saigon-1280.png),
[Saigon mobile](impeccable-saigon-390.png),
[Vincom desktop](impeccable-vincom-1280.png),
[Vincom mobile](impeccable-vincom-390.png).
T3 entry captures: [Saigon](impeccable-t3-saigon-entry.png),
[Vincom](impeccable-t3-vincom-entry.png).

Both mall builds passed with zero Astro diagnostics; browser script syntax and
whitespace checks passed. Existing deferred-bundle size warning remains.
The confirmation driver is local at `.scratch/impeccable-browser/confirm.mjs`;
its Playwright dependency is isolated there, with no application dependency or
lockfile change. No live-server/overlay was started; browser contexts/process
were closed after the four-run batch. Only one repair batch and one usable
confirmation batch were performed; failed T3 calls are recorded as tool limits.

Still open for 0013/0014: final context/error/stale/fixture/resource checks,
controlled visibility/rotation behavior, repeated performance matrix, release
host, physical devices and trace/Lighthouse/CWV acceptance. Asset/source and
full-product design acceptance stay separate. Whole-project coverage is
unchanged. Recommended next UI actions: `$impeccable adapt`,
`$impeccable typeset`, then `$impeccable polish`.
