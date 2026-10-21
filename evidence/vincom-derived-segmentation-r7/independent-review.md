# Independent B3 segmentation review — 21 October 2026

Read only the original `D:/Midterm/Vincom đồng khởi/map/tang-b3.webp` (1320 × 1077; SHA-256 `ccf11fc15fc9f6efa32ca8a23b395caba1a0e2f248740c0ee0d9c2c6c5e12e89`), `proposals.json`, the four overlays and their unannotated source crops. The candidate runtime and approved geometry were not edited, built or committed. These are approximate plan shapes, not surveyed walls, exact doors or independent proof of current occupancy.

| Proposed polygon | Decision | Source-bound reason |
| --- | --- | --- |
| GoGi House, B3-23-24 | **Accept** six pixel vertices `[(248,187),(356,187),(356,257),(273,257),(273,238),(248,238)]`. | The printed x≈356 line divides B3-23-24 from B3-28C. The lower-left step excludes the B3-25 label/grey segment and pale circulation. No new corridor or doorway is implied. |
| Manwah, B3-28C | **Accept** eight pixel vertices `[(356,187),(562,187),(562,200),(525,200),(525,220),(584,220),(584,257),(356,257)]`. | The same visible divider supplies the left edge. The top-right inset is an exterior notch in the yellow shape, not an interior hole; the right pale aisle remains outside. |
| San Fu Lou, B3-28A/B | **Accept as one named area** rectangle `[(526,276),(584,276),(584,443),(526,443)]`. | Both printed units map to the same San Fu Lou legend name. Their internal line is visible but is not shown as public circulation; do not present two independent storefronts. The adjacent Hoang Yen region and right aisle are excluded. |
| Kichi-Kichi, B3-17 | **Accept** rectangle `[(625,445),(677,445),(677,598),(625,598)]`. | The yellow B3-17 area ends at the visible grey B3-17A boundary. The grey B3-17A shape and left pale aisle are excluded. No entrance is marked. |

All four simple rings lie within the raster and have no closed source-visible interior hole. Exact edge placement remains an approximate 1–3 pixel trace through antialiasing and shadows. The source legend binds these names to the printed units; the archived booking captures add unit corroboration for GoGi, Manwah and Kichi, while San Fu Lou's separate archive confirms only the B3 floor. This review accepts source-layout associations, not current occupancy or a walking route.

## Overlap with existing merged geometry

The current base geometry already paints these source spans as large unassigned merged regions. Shapely intersection in the existing transformed frame `[0.1,0,0,0.1,-66,-53.85]` found:

| New proposal | Existing merged region | Overlap in schematic square units | Parent total area |
| --- | --- | ---: | ---: |
| GoGi | B3-region-004 | 69.23 | 208.80 |
| Manwah | B3-region-004 | 139.05 | 208.80 |
| San Fu Lou | B3-region-001 | 94.47 | 415.74 |
| Kichi | B3-region-002 | 75.73 | 260.49 |

The four new polygons have no positive-area overlap with one another. The GoGi and Manwah pair covers nearly all of B3-region-004; a small difference reflects the old coarse source trace. B3-region-001 and B3-region-002 retain large areas representing other visible units. **Appending the new polygons as additional full interactive shapes would double-cover all four spans. Removing whole parents would erase unrelated map context.**

Safe integration is a versioned, source-hash-bound derived segmentation: preserve original geometry bytes and parent IDs as evidence, then subtract each accepted child footprint from its parent's *rendered/selectable derived representation* or apply an equivalent explicit child-priority mask in both static geometry transport and runtime SVG. Leave unreviewed residual shapes as neutral context, not invented tenant boundaries. Bind accepted destination IDs only to the reviewed child IDs; retain existing precision holds and fail closed on hash/vertex drift. No route endpoint follows automatically from a tenant polygon.
