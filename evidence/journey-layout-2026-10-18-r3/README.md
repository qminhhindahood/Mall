# Owner-requested journey layout correction — 18 October 2026, r3

Baseline `c95ea97`. This revision implements the owner's screenshot feedback and subsequent explicit vertical-rail/Discovery-invitation clarification. [Source and built-output hashes](provenance.json) identify the delivered revision. Owner visual acceptance remains pending; no publication or percentage increase.

## Changed behavior

- The introduction scroll guide fades out and becomes hidden/inert on departure; reverse scrolling restores it.
- Overview caption and floor stack share the page center, rather than inheriting the hero's right column. Removed the obsolete left-side reference paragraphs. Existing schematic slabs are retained, with a larger desktop presentation.
- Floor identity labels/connectors fade and neutralize with their slabs on hover/focus, including the previously selected floor's outline.
- Detailed map keeps the descending vertical floor rail, current selection, 44px targets and compact tools. Removed the horizontal row, area-link grid, full directory/search/banner, facilities and reference-image blocks from this section. Requested destination details and shared-area selection remain supported; static fallback maps/navigation remain available.
- A distinct bilingual invitation follows the map, with an explicit action into Discovery. It retains the same map element and selected-floor state. Discovery browsing remains beside the map on desktop and below the sticky map on phones.

The invitation is reading content, not another runtime scene or model. Native forward/reverse scrolling, direct links and reduced-motion behavior remain part of the existing scene contract. No new store copy, roster, location, photo or approval is imported. The earlier text inventory remains bound to its original revision; new invitation strings are in `journey-copy.ts` for review.

## Validation

Final result: **six builds pass; 20 browser cases / 268 checks pass, zero failed cases** (216 journey + 52 boundary checks).

[Build receipt](builds.json): public, synthetic fixture and private research builds for both malls, including Astro checks. [Journey checks](browser-results.json) exercise both malls/locales at 1440px/390px, normal/reduced motion: guide visibility/restoration, actual stack/caption centering, matching label/slab fading, map clutter removal, full vertical rail visibility and pointer input, floor switching, invitation order/action/URL/focus, persistent map visibility, card close/focus, overflow and reverse scrolling. [Boundary checks](boundary-results.json) cover both locales/malls with JavaScript disabled, blocked 3D imports and multi-floor destination deep links. Exact final counts and failures are in those receipts.

Earlier `*-pass-*`, `*-attempt-*` and `*-pre-*` receipts preserve failed attempts. They exposed a reduced-motion stacking issue, the phone invitation covering its sticky map, an exact-scroll-boundary URL reversal, and an initial direct-details test reading before complete-frame readiness. The application fixes establish the rail's stacking order, reserve the phone map band in native flow and switch the narrative at its sticky boundary. The direct-details check waits for the existing complete-frame/focus contract. One import-failure attempt overlapped a static-output rebuild; the final run uses stable built outputs. No failing attempts are presented as acceptance.

[Mechanical scan](detector.json) contains 18 advisories, no blocking findings, predominantly existing documented typography/type-ramp mismatches; it does not substitute for the rendered desktop/phone inspection. [Frames](frames/) show the actual revised overview, quiet map, invitation and Discovery states. This is local Chrome 149 / SwiftShader and CSS viewport emulation, not physical-device or production timing evidence. T3 shared-preview snapshots twice returned `Preview automation snapshot timed out after 15000ms.` The repository browser workflow supplied the scoped checks; stable shared-preview/native/production acceptance remains open.

## Reproduce and review

From the app checkout, run `node evidence/journey-layout-2026-10-18-r3/build-all.mjs`, then the two `check-*.mjs` scripts against the existing public 4333/4334, fixture 4337/4338 and research 4355/4356 servers. Keep checks on stable outputs. `node evidence/journey-layout-2026-10-18-r3/capture.mjs` records exact output hashes.

- Saigon Centre: <http://localhost:4355/en>
- Vincom: <http://localhost:4356/en>

Exterior `photo-polish-2026-10-12-delivery-r2`, original floors `source-palette-schematic-2026-10-13-r2`, recovered schematic slab sources and public `directory-pending-2026-10-14-r1` remain unchanged. The accepted r4 overlay remains private/research-only. Content, native/shared-preview/production and owner release gates remain separate.
