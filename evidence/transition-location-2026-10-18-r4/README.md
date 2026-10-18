# Clean transitions, location holds and Discovery Highlights — 18 October 2026, r4

Baseline `b108664`. Owner screenshot feedback requests greater separation between scenes, rejects the broad Asian Corner/L5-5 location treatment, and requires recommended restaurants/shops in a dedicated Discovery Highlights section. This revision changes private display treatment, not original source evidence or public content approval.

## Location finding and correction

The screenshot's **5 is a generated map-area index**, not the printed unit **L5-05**. The selected Asian Corner record imported an official shared-parent outline as though it were an individual destination area. Its frozen r4 metadata explicitly says `shared-parent-area`, lists Lạch Cạch Lạch Cạch, GoGi House, Manwah and Kichi-Kichi as children, and retains separate identity/currentness decisions. The importer discarded that semantic distinction. Owner shape acceptance did not establish an exclusive storefront or approve that display claim.

Four r4 records have the same parent role: Asian Corner/L5, Oedo Alley/L5, The Hour Glass/L1 and Moschino/L2. These parent associations now retain floor/list/card access without precise markers; their four overlapping candidate outlines are omitted from the effective research geometry so they cannot obscure independent regions. The original r4 geometry and all source/approval ledgers stay frozen. Other independent accepted candidate shapes remain: **31 added regions**, alongside unchanged original geometry.

The separate raw **L5-05** association belongs to **YAKINIKU LIKE**, originally linked to `L5-region-018`. The owner's unit complaint places that association on hold too. The [superseding display policy](../../data/research/location-holds-2026-10-18-r1.json) clears every matching L5/L5-05 association without guessing replacement coordinates. This is a hold pending correct individual boundary evidence, not a claim that physical locations have been resolved. Original unresolved no-marker treatment remains intact.

## Presentation and recommendations

Overview-to-map separation increases from 65svh to 110svh on desktop (100svh on phones). The map has a longer reading/inspection interval, then 30–35svh before the invitation and 35–40svh after it. The map fades out before the invitation enters and becomes inert while hidden; it returns for Discovery. Duplicate destination rails stay hidden during selected-floor travel. Scrolling remains native and reversible; no artificial loading delay is added.

Discovery now has a separate **Highlights** section, backed by `DirectorySnapshot.highlights` and separate from complete category results. Provided eligible recommendations open their own floor/card through the existing selection behavior. The current approved/research nomination lists are empty, so the bilingual UI says no recommended places have been selected yet. No restaurant/shop endorsement, recommendation copy or editorial approval was invented. The owner requirement is also recorded in the canonical spec, motion draft and issues 0016/0019.

## Evidence

Final result: **six builds; 16 browser cases / 276 checks pass**, zero failed cases (224 journey, 40 location/empty-state, 12 supplied synthetic Highlight checks). The synthetic Highlight checks establish interaction only, not real recommendations.

[Builds](builds.json) cover both malls' public, synthetic-fixture and private-research outputs with Astro checks. [Journey checks](browser-results.json) cover both malls/locales at desktop/phone widths, normal/reduced motion, spacing/clean invitation transition, vertical rail, selection, map persistence, URL/focus, card close, overflow and reverse scrolling. [Location checks](location-results.json) inspect every held parent and L5-05 in both languages, confirming no selected precise shape while floor/card access remains; they also verify the retained independent shapes and truthful Highlights empty state. [Exact source/output hashes](provenance.json) bind the actual revision. Saigon's first research output was refreshed to include the hidden-map inert behavior already present in later outputs; the final journey run uses that output.

[Rendered frames](frames/) were inspected at desktop and phone widths. [Detector](detector.json): 18 advisories, zero non-advisory findings, largely inherited documented typography differences. T3 preview opened but snapshots twice returned `Preview automation snapshot timed out after 15000ms.` Repository Chrome 149/SwiftShader checks supply scoped runtime evidence, not native-device/shared-preview/production timing or owner appearance acceptance.

Reproduce from the app checkout with `node evidence/transition-location-2026-10-18-r4/build-all.mjs`, then both `check-*.mjs` scripts against the existing 4355/4356 private servers. Keep checks on stable outputs. Exterior assets, original floor geometry, recovered slab sources and public `directory-pending-2026-10-14-r1` remain unchanged. No deployment, release approval or project-percentage increase.

Review: [Saigon Centre](http://localhost:4355/en) · [Vincom](http://localhost:4356/en).
