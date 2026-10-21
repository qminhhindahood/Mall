# Exact mall map folder inventory — 21 October 2026

The two user-named folders contain **15 floor rasters**: eight Saigon Centre/Takashimaya PNGs and seven Vincom Đồng Khởi WEBPs. Every image's current SHA-256, dimensions, and byte count match the source entry for its floor in the isolated candidate's `data/malls/{saigon-centre,vincom-dong-khoi}/floor-geometry.json` (`source-palette-schematic-2026-10-13-r2`). All 15 also match the earlier `docs/evidence/unit-hover-coverage-2026-10-17/inventory.json` inputs. The exact hashes and paths are in [inventory.json](inventory.json). These are **not newly supplied map bytes or a new geometry revision**.

| Saigon floor | Original PNG dimensions | Earlier visually audited JPG dimensions | PNG width multiplier |
| --- | ---: | ---: | ---: |
| B1 | 5142 × 5258 | 1650 × 1687 | 3.116× |
| B2 | 5142 × 5284 | 1650 × 1696 | 3.116× |
| L1 | 4782 × 5304 | 1623 × 1800 | 2.946× |
| L2 | 4608 × 5082 | 1632 × 1800 | 2.824× |
| L3 | 4712 × 5142 | 1649 × 1800 | 2.857× |
| L4 | 4832 × 5132 | 1650 × 1752 | 2.928× |
| L5 | 4732 × 4416 | 1650 × 1540 | 2.868× |
| L6 | 4902 × 4848 | 1650 × 1632 | 2.971× |

The prior 20 October walking audit explicitly inspected the eight smaller `saigon-centre-{floor}-source.jpg` images plus two independent B2/L2 research JPGs. The original PNGs offer about **2.8–3.1 times the linear resolution** and therefore sharper inspection, though the exact PNG hashes were already in the candidate geometry and the 17 October source inventory. Resizing both PNG and matching JPG to 128 × 128 gives mean RGB absolute differences of 0.29–0.34 on a 0–255 channel scale; that supports the same map composition, not independent routing content. Different file hashes are expected across PNG/JPG encodings and sizes.

| Vincom floor | Original WEBP dimensions | Match to 20 October audit copy |
| --- | ---: | --- |
| B1 | 1320 × 1083 | Byte identical |
| B2 | 1319 × 1083 | Byte identical |
| B3 | 1320 × 1077 | Byte identical |
| L1 | 1320 × 1083 | Byte identical |
| M | 1319 × 1084 | Byte identical |
| L2 | 1320 × 1084 | Byte identical |
| L3 | 1319 × 1081 | Byte identical |

The original Vincom files match the seven copies and hash manifest in `.scratch/restaurant-routing-evidence-2026-10-20/vincom/` byte for byte. Their map content and source resolution are unchanged.

Direct visual checks of the high-resolution Saigon B2 and L5 originals show labeled premises, tenant outlines, elevator/escalator symbols, and apparent shared circulation areas. B2 Meat & Meet and L5 Chang Kang Kung/GINSENG HOUSE/POULET lack source-marked exact restaurant door thresholds. Original Vincom B3 likewise shows the known B3-26, B3-13 and connector symbols without exact door markings. This limits **exact-door routing**, but does not rule out honest area/frontage directions along visible continuous public aisles. The separate implementation review assesses those area-level connections under the updated issue 0024 scope; this inventory makes no route-eligibility determination.

This is a read-only source review apart from this report and JSON. It changes no app, geometry, tracker, canonical asset, dependency, or site branch. No route implementation, build, or browser test was run for an unchanged runtime.
