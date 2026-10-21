# Reopened Saigon mapping and UI delivery — r11

This supersedes earlier pending conclusions in this directory. The owner reopened the seven Saigon records and remaining UI implementation after 16d1439. Only the verified scope below was changed. Original plans, model assets, approved geometry, Vincom content and both routing graphs remain unchanged.

## Delivered mapping

Saigon **163/165 area-linked (98.8%)**, Vincom **38/203 (18.7%)**, combined **201/368 (54.6%)**; 167 listings remain floor-only. This is qualified source-area coverage, not exact door or full routing coverage.

| Destination | Activated source scope |
| --- | --- |
| The Hour Glass L1 | Partial central named area L1-region-011; separate branded counters excluded. |
| Moschino L2 | Partial main named L2-region-009; Label Lab and the separate fragment excluded; duplicated unit claim unverified. |
| Yakiniku Like L5 | Partial named L5-region-018; same historical contour reassessed using printed name, official identity and registration. Generated screenshot number 5 does not establish physical unit L5-05. |
| Oedo Alley L5 | Partial shared village: reuses existing reviewed Botejyu and Tokyo Sundubu areas only. Children and geometry ownership preserved; other membership/whole boundary not inferred. |
| Asian Corner L5 | Narrow named L5-region-019 only. Rejected broad parent and neighbouring restaurant areas excluded; not a complete/exclusive footprint. |

Takashimaya remains floor-only: archived official mapData is null and department perimeter is not established by counters. Need authoritative per-floor department boundary or an explicitly owned partial area. Matin Kim remains floor-only: mapData is null, L3-12 conflicts with Miana, and archived Opening Soon caveat persists. Need branch-labelled footprint resolving that identity conflict. Aesop and Sport Fair retain source-plan Opening Soon/current-operation qualifications.

The frozen three-store review, later Oedo shared-component review and later Asian-band review are separate sequential decisions. Earlier pending conclusions below are historical. Final loader order is r10 → three r11 associations → guarded shared components → Asian band. New helper rejects source/review/revision/member/geometry drift. No new routing edges were created; **41 directed journeys / 13 approaches / zero connected entrance routes** remain.

## Delivered visible UI implementation

GPT-6 Astra medium changed JourneyAtlas.tsx and journey-atlas.css. Phone DOM is now one combined From/To card → unobscured interactive map → route instructions/actions; desktop joins controls and instructions beside the map. No duplicate interactive controls. Search dialog has a localized accessible name, Escape restores focus, shop/entrance search folds accents, compact source qualifications remain visible, controls reach 44px, and selected shared destinations highlight all components. Existing introduction, exterior controls, featured-first Discovery and store details were preserved rather than redesigned again.

Matched 390×844 CK→MLB screenshots are ../ui-phone-r11/before-phone.png and after-phone.png. After: combined card height 186px, map y325–765, steps begin y779. Independent Vincom started/expanded case improves card 725→234px and map top 872→381px; full 440px map fits that tested first viewport. Manual cross-floor progress remains explicit; no live positioning or automatic arrival.

## Verification and limits

- Both final builds pass: Saigon 355 pages, Vincom 429; Astro zero errors/warnings. Final logs are ../ui-phone-r11/build-saigon-final.log and build-vincom-final.log.
- final-integration-checks.json: 22 checks, exact five destination changes/four new areas, prior areas/graphs preserved; 201 linked listings.
- oedo-helper-validation.json: 15 focused helper checks.
- Ten focused mapping flows pass: EN desktop / VI phone for all five new destinations, detail → Directions → keyboard map selection → manual origin; partial qualifications and unavailable routing remain honest. shared-band-browser.json verifies Oedo's two highlighted components and Asian's one.
- ../ui-phone-r11/acceptance.json: focused UI checks, CK→MLB and reverse manual transfer, Vincom same-floor completion, desktop joined card, unique controls, dialog/focus and no tested overflow/page errors.
- Saved screenshots were visually inspected. Browser emulation is not physical-device, physical-mall, screen-reader or production acceptance. Existing performance/asset size and wider coverage gaps remain in release/routing handoffs.

No upload, publication, canonical overwrite or security exception. Shared loader ownership remains with the coordinator until explicit file/revision handover; external Vincom packets have not been received or activated.

