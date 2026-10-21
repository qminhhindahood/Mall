# Independent entrance source review — 2026-10-21

Reviewer: area_routing_implementation. Evidence-only review; no runtime, primary receipt, source image, or route changes.

## Decision

Accept the three street-facing Saigon Centre L1 entrance markers and their immediate interior points below. Accept door 2 with the explicit Pasteur taxi/drop-off qualification and corrected interior point. These are approximate anchors on the supplied schematic, not surveyed doorway positions. Entrance identity and an immediate inward public-space point do not establish a route to a shop, another entrance, or another floor.

| Marker and usable label | Threshold source pixel | Interior source pixel | Threshold affine coordinate | Interior affine coordinate | Decision |
| --- | --- | --- | --- | --- | --- |
| Door 1 — Nam Kỳ Khởi Nghĩa entrance | (690, 2760) | (800, 2767) | (-34.02, 2.16) | (-31.82, 2.30) | Accept: entrance pictogram in blue outer-wall strip; white interior aisle east of it. |
| Door 3 — Lê Lợi entrance | (1615, 1522) | (1740, 1582) | (-15.52, -22.60) | (-13.02, -21.40) | Accept: outer-wall marker with white inward wedge between Cartier and Louis Vuitton. |
| Door 4 — Pasteur–Lê Lợi entrance | (2640, 644) | (2635, 699) | (4.98, -40.16) | (4.88, -39.06) | Accept: apex-wall marker with white inward wedge between Chloé and Kenzo. |
| Door 2 — Pasteur entrance by taxi/drop-off lane | (3360, 2400) | (3165, 2412) | (19.38, -5.04) | (15.48, -4.80) | Qualified accept: interior point lies in white public space outside the adjacent tenant polygons; exterior is a vehicle/drop-off lane, with no pedestrian street approach established. |

The earlier door-2 interior candidate (3285, 2392) is rejected: it lands on a gray line/threshold boundary (RGB 168,168,168), not the white interior aisle. The primary reviewer has already corrected README and candidates.json to (3165, 2412). The independent annotated crop retains the superseded point solely to document this correction.

The captured feature metadata calls doors 1 and 2 “Main Entrance.” That can identify the recorded source feature but should not imply a recommended, currently open, accessible, or preferred entrance. Street/landmark labels above are adequate for manual selection. The drop-off qualifier must remain visible for door 2; no walking approach through the vehicle lane is accepted.

## Source and coordinate checks

Inspected the original `Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-L1-2026-10-01.png` (4782 × 5304) and all four unannotated 880 × 800 packet crops. SHA-256 independently checked: `d7c4697eb9399e8d768586b01139295cf90c3607ba44e690a031c0aaf5eba89b`.

The candidate Saigon L1 geometry declares affine transform `[0.02, 0, 0, 0.02, -47.82, -53.04]`: first output coordinate = 0.02 × source x − 47.82; second output coordinate = 0.02 × source y − 53.04. All table coordinates independently recomputed and match. This is a schematic canvas transform, not metric calibration.

All four current interior samples are RGB (255,255,255), consistent with the visually inspected public-space patches. Pixel color alone is not a walkability classifier. Threshold samples overlap drawn entrance symbols; their coordinates identify the symbols approximately rather than proving a precise physical door opening. Local source geometry supports the immediate inward placement, not a complete usable graph or operating-hours claim.

Reproducible checks and annotated views are in `independent-coordinate-check.py`, `independent-coordinate-check.json`, and `door-{1,2,3,4}-independent-points.png`. Red marks threshold anchors, blue marks current interior points; green on door 2 marks the rejected previous point. These are derived evidence images; the source was not altered.

## Vincom bounded finding

Reviewed the supplied Vincom Đồng Khởi plans for B3, B2, B1, L1, M, L2, and L3, including the contact sheet and original floor images. No explicit exterior public entrance threshold identifiable by a door/street entrance marker was found in these seven supplied plans. Tenant boundaries, corridor openings, escalator symbols, and lift facilities do not independently identify a public exterior entrance.

This finding is limited to those supplied raster plans. It does not claim the mall lacks public entrances or that no other source can establish them. Vincom entrance origins need additional source evidence locating an actual public threshold and its inward public-space connection before activation.

## Remaining boundary

No entrance origin is activated by this review. Saigon entrance-to-network paths, shop-to-shop paths, cross-floor connector pairings, opening status, metric distances, and accessibility remain outside this acceptance. A later graph review must trace continuous public circulation from each accepted inward point to the relevant network. No build or browser run is applicable to this evidence-only delivery.
