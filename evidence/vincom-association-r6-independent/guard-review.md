# Supplement guard and limitation UI review

Read-only initial review, 21 October 2026, before activation. `review.json` remains unchanged because the implementation pins its hash. No build, source edit or activation performed by this reviewer.

## Findings requiring repair

1. **Accepted associations are not bound to per-item evidence.** `src/data/site.ts` checks the hash of `reviewEvidence.path`, but the initial `applyAssociationSupplement` implementation reads only self-reported `row.review` fields. It never compares each accepted destination/floor/region-ID tuple and decision to the independently accepted tuple in the hashed receipt. A coordinated change to `regionIds` plus its corresponding `geometryRegions` can select a different valid, unoccupied source polygon without invalidating any current guard. Likewise, changing a destination and `originalLocations` together could cite independent review for a different association. Parse the verified receipt and require an exact per-item match before applying any accepted row. Reported to parent and mapping agent before activation.
2. **Map-area chooser omits the partial-area limitation.** New notes are present immediately in DestinationDetails, Atlas search results, and selected From/To cards. The initial `.atlas-area-selection` popup still displays only the shop name and Start here / Go here. Include the item's association limitation there, particularly Cath Kidston's explicit partial B1-17C scope. Reported to parent before browser review.

## Positive source findings

- Scope requires approved matching mall, correct post-holds directory revision, and explicit activation. Pending supplements currently return the unmodified snapshot.
- Existing locations are compared to captured originals; only floor-confirmed locations with no area IDs are eligible.
- Region source hash/transform and full current polygon payload are checked. No coordinates are added or mutated.
- Duplicate destination/floor and area IDs, previously occupied region IDs, and held region IDs are rejected. Existing five precision holds are required to remain floor-confirmed and area-free.
- Output clones destination/location data and appends selection areas; original geometry and approved source files are untouched by this function.
- All thirteen bilingual notes disclaim current occupancy and exact doorway verification. Cath's note specifies the right magenta B1-17C portion, unresolved adjacent grey portion, and incomplete shop footprint. Daniel Wellington describes text-shaped contour notches; Watch Me describes its thin source strip.

## Review boundary

The supplement's eight negative checks and immutable-source checks were reported by the implementing mapping agent, not independently rerun here. No activated runtime or browser result is claimed by this initial source review. Final follow-up findings/results will be appended after repaired source and parent-built previews are ready.

## Resumed final source readback

After the interrupted execution server returned, independently re-read the current module, site integration, data and UI source. Both findings above are repaired:

- The site verifies the evidence bytes' SHA-256, parses `AssociationReviewReceipt`, and passes it into the supplement. Every accepted row must match exactly one receipt decision on destination ID, floor, ordered region IDs, printed units and review decision before existing source/collision/partial checks run. Missing or substituted per-item evidence fails closed. Independent readback confirms the hash matches and all thirteen current tuples match the receipt.
- The map-area popup now renders each picked shop's association note with its source-layout/partial-source-layout marker, alongside the existing search, selected From/To and detail notes.

**Final source outcome: pass; no remaining blocking source finding in scope.** Activation was still `pending-independent-review` at this readback. Parent owns activation/build and will signal rebuilt previews before this reviewer runs browser checks. No imagery rereview, build, activation or source edits performed during this follow-up.

## Activated built-preview browser review

After the parent confirmed both activated builds complete, `browser-review.mjs` ran four Vincom task flows: desktop1280×900 / phone390×844, each EN/VI. **84 checks pass**, zero page errors. Browser profile: installed headless Chrome, CSS viewport emulation, reduced motion, WebGL unavailable; not physical or production validation. Parent independently owns broader Saigon/route regressions.

Each flow opens Cath details, follows Directions with the correct destination/floor and no assumed origin, searches and selects all thirteen associations, checks the exact localized limitation note and selected SVG path count for every association, and opens Cath's actual keyboard-operable selected map area. Cath's explicit partial note is present in details, search, selected card and popup. Then Highlands is opened without a route; manually choosing the reviewed B3 landmark enables the one-step B3-11 frontage guidance. The note continues to disclaim current occupancy and exact doorway verification.

`browser-receipt.json` preserves all checks and popup dimensions; twelve screenshots preserve Cath detail/popup and Highlands guidance in all four variants. Actual screenshots were personally inspected for phone/desktop details, phone/desktop popup and phone Highlands guidance.

One scoped visual finding was reported to parent: the newly inserted popup limitation squeezed phone actions into narrow columns (41px EN /38px VI), with the Vietnamese start label wrapped into four small lines. The note itself remained present/readable with no horizontal overflow, and all functional checks passed. Parent owns the popup layout repair; final confirmation will be appended after a rebuilt preview is signalled. No source changes/build/activation performed by this reviewer.

## Final phone popup confirmation

After the parent signalled the final CSS rebuild, `final-popup.mjs` ran just two localized phone cases: **12 checks pass**, zero page errors. Both actions are now146×44px, in a row below the explicit partial limitation. Both screenshots were personally inspected: `final-popup-en.png` and `final-popup-vi.png`. The popup and page have no horizontal overflow. The bounded popup retains vertical scrolling for longer content; Go here was clicked successfully in both languages and retained the partial note in the selected destination card.

The cramped-action finding is resolved. **No remaining blocking source or scoped usability finding.** Full prior84-check evidence remains separate from this focused retest; no complete matrix rerun is claimed. Source-layout/current-occupancy/doorway limits and Cath's partial-area condition remain intact. Parent owns commit and delivery tracking; no source edit/build/commit/publication by this reviewer.
