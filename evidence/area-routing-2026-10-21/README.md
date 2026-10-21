# Area routing candidate — 21 October 2026

Isolated from tested source **4549695**. No canonical edits, publication, dependency installation, or underlying directory/geometry changes. Existing exterior revision `photo-polish-2026-10-12-delivery-r2` and floor geometry `source-palette-schematic-2026-10-13-r2` are preserved. New routing revision: **area-routing-2026-10-21-r1**.

## Supported scope

Six same-floor, manually started **area-frontage** paths. These stop in the public aisle beside the labelled destination area; they do not locate exact entrance thresholds. No distances, travel times, step-free or cross-floor claim. Other destinations retain the existing floor-guidance fallback; no complete-mall routing claim.

- Saigon Centre L5, start **Public concourse beside Zone A lifts**: Dim Tu Tac, LONGJING, Chang Kang Kung. This is Saigon Centre mall floor evidence, not department-store-only coverage.
- Vincom Center Đồng Khởi B3, start **Public aisle to the right of the escalator beside B3-13 on the plan**: Siam Sugar (source spells Siam Suger), Chang Kang Kung B3-01, Chilli Thai B3-01A.

The source plans visibly establish the continuous public concourse/aisles. Starts are in public space beside the landmark, not inside an elevator/escalator pictogram. Existing accepted destination-area IDs are required at runtime; a floor-only record, changed area association, other floor, closed destination, or unsupported destination cannot get a route. A different manually selected starting floor suppresses the route. No route is drawn until the visitor explicitly chooses the same-floor landmark. Refresh and destination change require a new landmark selection.

## Exact sources and coordinate convention

`src/assets/routing/saigon-L5.png` is a byte-exact copy of `D:/Midterm/Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-L5-2026-10-01.png`: **4732×4416**, SHA-256 `4abefc8f9c34f1fa3c0f9076e5b4b9c5689505d783d6a843a37078f2a6b712c5`.

`src/assets/routing/vincom-B3.webp` is a byte-exact copy of `D:/Midterm/Vincom đồng khởi/map/tang-b3.webp`: **1320×1077**, SHA-256 `ccf11fc15fc9f6efa32ca8a23b395caba1a0e2f248740c0ee0d9c2c6c5e12e89`.

No raster resizing or image generation. The Saigon source image is drawn at normalized SVG dimensions 1632×1522, Vincom at1320×1077; graph points share those exact display coordinates. The slight Saigon aspect rounding matches the visual inspection reference; the image and route always receive the same transform. Cropped SVG viewBoxes focus the route corridor, while the full unchanged source map is one ordinary link away. Each build stages only its mall's source plan under `/routing/`.

`src/data/area-routing.ts` is the explicit source-reviewed directed graph. Each segment stores bilingual instructions; breadth-first traversal over those permitted edges generates both the line and the ordered steps. There is no computed walkability from retail polygons, centroid snapping, inferred door, or measured shortest-path claim.

Saigon segment inspection: (875,645) public Zone A concourse → (805,625) open west concourse; Dim endpoint (790,609) remains below the labelled area's lower edge. LONGJING endpoint (650,589) lies between the area edge and the small Mochi/iGelato island. East route to Chang endpoint (1060,591) remains below the lift/exit blocks and the labelled restaurant frontage.

Vincom segment inspection: (405,507) starts in the aisle east of the escalator island, never in its symbol. Siam endpoint (405,480) remains alongside B3-13. The vertical aisle through (405,620) to (405,758) runs between B3-06 and B3-05. Chang endpoint (430,758) lies above B3-01. Chilli branches through (510,758) → (510,738) → (570,738), beneath B3-04 and above B3-01A.

Root source inventory and official-reading packet: `D:/Midterm/.scratch/area-routing-source-review-2026-10-21/`. It records fifteen originals, unchanged source identities, and current official Vincom destination-floor corroboration. Official listings corroborate identities/floors; they do not establish aisle geometry.

## Validation

Final Astro diagnostics: 34 files, zero errors/warnings/hints (`check-final.log`). Public Saigon build352 pages; Vincom426 pages; both prepare-static-release pass. Existing dependency junction reused. Direct Node CLI used after npm wrapper delayed; initial wrapper attempts interrupted, no installation.

Browser matrix and independent review are recorded alongside this file. Implementation receipts total **64 browser cases / 372 assertions passed**; independent review is additional bounded evidence. Native no-JavaScript disclosure retains source links and avoids inert manual selectors. Static floor maps/listings remain available. No physical-device, native-motion, production or on-site acceptance is asserted.

Previews: http://127.0.0.1:4461/en and http://127.0.0.1:4462/en (also /vi).

## Delivery and review receipts

Runtime source commit: **b690041** (detached isolated worktree). The source crop repair is included in this commit. All six route identities and accepted destination-area associations remain unchanged.

- `browser-results.json`: **36 cases / 276 assertions passed**. Six destinations × two locales × desktop/390px phone gives24 route cases; eight floor-only hold cases and four no-JavaScript cases complete the matrix. Checks cover native keyboard selection, explicit-start gating, steps/overlay, area limitations, source availability, overflow, different-floor suppression, resetting the landmark after a floor change, and refresh.
- `history-fallback-results.json`: **4 cases / 24 assertions passed** across both malls and widths. Language, Back/forward, blocked 3D import, and visible static fallback remain usable.
- `final-browser-results.json` / `final-frames/`: **24 cases / 72 assertions passed** against final source; six destinations × two locales × two widths. All final SVG crops match reviewed bounds, each route has steps, and no horizontal overflow occurs. Forty-eight final screenshots cover both the map crop and its surrounding UI.
- `source-identity.json`: original/candidate/built reference bytes match for both malls; exactly one own-mall source plan is shipped per build. New build-time hash guards prevent an unreviewed replacement reference from silently retaining this graph.
- `builds/check-final.log`: final diagnostics, zero errors/warnings/hints. `builds/build-saigon-final.log` / `builds/build-vincom-final.log`: final352/426-page builds and static packaging pass.
- `review/`: independent review evidence and final finding closure.

Earlier browser harness attempts are retained honestly: one attempted native keyboard selection before the existing scene-entry focus handoff; one passed seven assertions before requesting a relative source URL without a base; one history harness over-required a focus state. Readiness was tightened for keyboard interaction, request URLs were resolved against the page, and history checks wait for the complete rendered frame without assuming the initial focus remains unchanged. No application failure is being hidden by these test-harness corrections.

The only bounded visual review finding was the Saigon crop clipping the LONGJING and Dim Tu Tac map labels. It now starts at y340 instead of495, retaining horizontal scale and the whole supported aisle. Final confirmation covers the repaired presentation. No general directory, motion, geometry or approved content changes were required.

The other362 directory entries do not receive routes in this candidate. This is a curated implemented subset, not a finding that no other source-supported area paths exist. Further floor/area coverage remains unreviewed or unsupported until individually established; exact-door, cross-floor, measured and accessible routing remain separate unmet evidence scopes.

No approval rejection, uncertain mutation, network installation, push or publication occurred in this implementation. Windows process introspection (`Get-CimInstance Win32_Process`) returned access denied; it was not needed and was not retried. The local previews remain running.


