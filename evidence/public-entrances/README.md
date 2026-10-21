# Public entrance evidence review — 2026-10-21

Read-only source review for the proposed routing network. Pixel positions below use the **original raster's** top-left origin, with x right and y down. They are schematic anchors, not surveyed doors, GPS locations, walking distances, accessible paths, opening hours, or proof of cross-floor connection. No source or runtime file was changed.

## Decision

Saigon Centre L1 offers three clear public-concourse entrance candidates and one qualified drop-off candidate. The exact seven supplied Vincom Dong Khoi plans contain **no identifiable public exterior entrance threshold**. A Vincom exterior-origin picker would need another sourced entrance plan or a verified on-site threshold; the white space at an image boundary is not evidence of an entrance. Store-to-store and internal start routes can still be evaluated independently.

## Saigon Centre L1

Exact source: `Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-L1-2026-10-01.png`, 4782×5304, SHA-256 `d7c4697eb9399e8d768586b01139295cf90c3607ba44e690a031c0aaf5eba89b`. The previously captured source feature set at `.scratch/restaurant-routing-evidence-2026-10-20/saigon/source-features.json` calls these `door-1` through `door-4`, all on L1, with the location names below. The rendered raster independently shows door icons and blue threshold strips. The source feature polygon vertices are **not** route nodes. Crops in this folder are unannotated extracts of this exact PNG, each 880×800; the crop origin is supplied to make positions auditable.

| Source ID / candidate picker label | Status and visible connection | Approx. threshold pixel | Proposed first **interior** public-aisle node (pixel) | Crop (origin in source pixels) |
| --- | --- | ---: | ---: | --- |
| `door-1` / Nam Kỳ Khởi Nghĩa main entrance | **Confirmed schematic entrance.** Door icon and blue strip cross the outer wall; broad white lobby/concourse is immediately on the east/right side. Exclude the exterior street and nearby brown wheelchair/facility symbols from the route graph. | (690, 2760) | (800, 2767) | [door-1-nam-ky.png](door-1-nam-ky.png), (250, 2367) |
| `door-3` / Lê Lợi entrance | **Confirmed schematic entrance.** Door icon and two blue strips interrupt the northwest outer wall; a white public wedge continues southeast between Cartier and the adjoining large unit. | (1615, 1522) | (1740, 1582) | [door-3-le-loi.png](door-3-le-loi.png), (1170, 1122) |
| `door-4` / Pasteur–Lê Lợi entrance | **Confirmed schematic entrance.** Door icon and blue strip cross the apex wall; white public wedge continues inward between Chloé and Kenzo. | (2640, 644) | (2635, 699) | [door-4-pasteur-le-loi.png](door-4-pasteur-le-loi.png), (2205, 244) |
| `door-2` / Pasteur main entrance by drop-off | **Qualified.** The source names it Main Entrance, and a blue door strip visibly connects to white interior concourse. Outside is a marked vehicle/taxi drop-off lane, not a drawn pedestrian sidewalk link. It can be identified as a mall threshold, but do not instruct a walking approach through the lane or treat it as a generic street entrance without further evidence. | (3360, 2400) | (3165, 2412) | [door-2-pasteur.png](door-2-pasteur.png), (2915, 2012) |

The current schematic registration is `x_svg = 0.02*x_pixel - 47.82`, `z_svg = 0.02*y_pixel - 53.04`, from `data/malls/saigon-centre/floor-geometry.json` L1 source metadata in candidate `.scratch/redesign-readiness-2026-10-21`. It is a centering transform in schematic units, not a calibrated map. The proposed interior nodes map approximately to `(-31.82, 2.30)`, `(-13.02, -21.40)`, `(4.88, -39.06)`, and `(15.48, -4.80)` respectively in table order. All four candidate interior pixels sample as white in the exact PNG. Any route edge beyond these first nodes still requires a visible continuous white public aisle trace on L1; none is certified by the doorway crop alone.

## Vincom Dong Khoi

I inspected all seven exact supplied floor plans, shown together in [vincom-all-floors-contact.jpg](vincom-all-floors-contact.jpg). They depict tenant blocks, interior white aisles, elevators, escalators and toilets but omit exterior wall/door symbols, street names, and entrance labels. L1's simplified Zara/Massimo Dutti diagram is no exception. Therefore no pixel coordinate on these plans qualifies as a public entrance node. Escalator/elevator icons are internal connectors; open-looking margins are cartographic blank space, not entrance evidence.

| Source plan | SHA-256 |
| --- | --- |
| `Vincom đồng khởi/map/tang-b1.webp` | `652a375d36e608f98cb7be28f782deb3144d7273d1eeed3f1d622023a751caa4` |
| `Vincom đồng khởi/map/tang-b2.webp` | `46f2aea288a07060ecbe06701971526cccc2a2e497b4abca777952fd5a45d713` |
| `Vincom đồng khởi/map/tang-b3.webp` | `ccf11fc15fc9f6efa32ca8a23b395caba1a0e2f248740c0ee0d9c2c6c5e12e89` |
| `Vincom đồng khởi/map/tang-l1.webp` | `c3b7344f118dfe7fb174330ddcfe0f83d5320fc72b4eb92e3e0d86d09f0237c8` |
| `Vincom đồng khởi/map/tang-m.webp` | `7f13ba0bffa900d8f3f7b13a55c8580a902268376b07ab70aa60cfa4ce90530` |
| `Vincom đồng khởi/map/tang-l2.webp` | `82d79221bcf667d472db83832c3438a9765d11e185d29548a679ec2a9d75c029` |
| `Vincom đồng khởi/map/tang-l3.webp` | `629d9860433bacc381daede046513190e2d6877bf88f99907eafb3f0794bbc70` |

Both current directory datasets have empty `facilities` arrays, so they supply no separate entrance record. The source feature IDs above are an audit aid, not present visitor-facing entrance data. A future entrance picker should use source-labelled entrances only after each first interior node is connected to a validated public-aisle graph. Do not connect the four Saigon thresholds to each other, to other floors, or to every destination merely because they appear on L1.
