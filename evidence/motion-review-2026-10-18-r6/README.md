# Motion-on focused review — 18 October 2026

Scope: invitation and Discovery handoff in the existing r5 build. Single-context manual review; no subagents per owner's instructions. Not a formal Impeccable critique run. No source changes or rebuilds.

Owner acceptance: “i think that for the motion off, its fine now”. Record acceptance only for the current motion-off transition, not the whole site or motion-on behavior.

Live T3 collaborative preview, own hidden tab, actual 1280×800, prefers-reduced-motion false. Native preview_scroll and rendered snapshots used on both research sites (4355 and 4356), followed by reverse scroll. Saigon L5 map at scrollY2840, invitation at4240, incoming Discovery at5140 and settled Discovery at5390. Vincom same scroll positions inspected at3840 and5390; reverse to3840. Page loading initially consumed the first Vincom scroll; repeated after its settled map snapshot.

Findings:
1. High: empty-screen pause before invitation, reproduced on both malls at scrollY3840. Invitation container top600, map opacity0; heading remains below viewport. Only fixed navigation is visible. Existing .map-reading min-height150svh plus invitation margins35svh/40svh and center alignment produce more dead scroll than a clean breathing interval.
2. Medium: disproportionate map return. At Saigon scrollY5140 Discover top420, map absent; at5390 top170 map fully returned. Source reveal window at this viewport is top360→184 (176px), after the extended empty interval. This is a pacing judgement from positions and rendered states, not a frame-time/performance claim. Recommend coordinating fade-out with invitation arrival and using a proportionate reveal after text entry. Do not restore the old full-size map/rail overlap.
3. Current settled composition is clear: reading on left, contained map on right; old vertical floor rail absent. Reverse scroll clears the Discovery preview but retraces the long empty interval. Highlights exists but remains an empty state pending actual nominated places, separate from motion review.

Recommendation: motion-on needs one pacing pass. Preserve accepted motion-off behavior. This review does not establish phone, all-floor, bilingual, native smoothness, production or full-journey acceptance. Prior r5 regression evidence remains valid for its stated assertions but does not establish good visual pacing.
