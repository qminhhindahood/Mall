# Vincom B3 connected aisle assessment — r7 resumed

21 October 2026. The latest owner continuation supersedes the earlier pause, retained in `paused-handoff.md`. This is **read-only source evidence for independent review**, not a runtime delivery or route acceptance. No candidate application, geometry, directory, approved source, build, tracker or commit is changed by this lane.

Sources read: the original `D:/Midterm/Vincom đồng khởi/map/tang-b3.webp` (1320×1077; SHA-256 `ccf11fc15fc9f6efa32ca8a23b395caba1a0e2f248740c0ee0d9c2c6c5e12e89`), r6 graph at `5e8479d`, and `.scratch/vincom-segmentation-r7/proposals.json` plus its independent segmentation review. That review accepts GoGi B3-23-24, Manwah B3-28C, San Fu Lou B3-28A/B as one area, and Kichi-Kichi B3-17 source shapes; it does not automatically accept walking connections or runtime bindings.

[Connected source overlay](connected-aisles-overlay.png), [unannotated crop](source-crop-unannotated.png), and [machine-readable proposal with pixel samples](network-proposal.json) share the exact original raster coordinate frame: x right, y down. `trace-review.py` reproducibly creates these evidence artifacts. Pixel lengths in the JSON are audit quantities only, not visitor distances.

## Connected network proposed for review

The four approaches reuse one visibly continuous pale public-aisle network. No line crosses a yellow tenant area or escalator symbol in the inspected raster. These segments have no source-visible one-way restriction; **bidirectional public-aisle traversal is proposed for independent review**, rather than automatically generating reverse instructions from old forward-only instructions.

| Edge | Source-pixel endpoints | Source-visible aisle evidence |
| --- | --- | --- |
| E1 | (405,507) ↔ (405,480) | Existing reviewed start east of the B3-13 escalator to the existing Siam Sugar frontage; the line stays in the narrow pale aisle outside the escalator/tenant island. |
| E2 | (405,480) ↔ (405,454) | Continues above B3-13 into the transverse passage between the upper and lower blocks. |
| E3 | (405,454) ↔ (594,454) | Continuous horizontal pale strip below B3-20 / B3-27 / B3-28B and above B3-15C / B3-16A. Upper tenant edge is approximately y443; lower tenant edges begin around y462. |
| E4 | (594,454) ↔ (594,330) | Eastern pale aisle beside San Fu Lou B3-28B and B3-28A, outside their right boundary around x584; facing B3-28E/F starts around x603. |
| E5 | (594,330) ↔ (594,267) | Same aisle continues beside B3-28A toward the upper transverse passage. It stops below the Manwah/Pepper Lunch upper block at its junction. |
| E6 | (594,267) ↔ (470,267) | Pale horizontal passage below Manwah B3-28C and above the next block. Manwah lower edge is around y257; the lower block begins around y276. |
| E7 | (470,267) ↔ (310,267) | The same uninterrupted passage continues beneath the accepted GoGi B3-23-24 area. It stays east of GoGi's lower-left step and the circular escalator space. |
| E8 | (594,454) ↔ (615,454) | Short transverse public-aisle connection into the strip west of B3-17. |
| E9 | (615,454) ↔ (615,525) | Pale aisle between B3-16A (right edge around x605) and Kichi B3-17 (left edge around x625). Stops above the grey B3-17A portion. |

The shared network has **10 nodes and 9 edges**. E1 reuses an existing reviewed edge; E2–E9 are the new review proposals. Node splits at frontages preserve the same continuous lines and permit reusable traversal without deriving edges from shop polygons.

## Four proposed frontage anchors

| Destination | Accepted shape reference | Proposed public-space endpoint | From existing landmark |
| --- | --- | --- | --- |
| GoGi House | `proposal-r7-gogihouse`, B3-23-24 | (310,267), south of labelled area | E1 → E2 → E3 → E4 → E5 → E6 → E7 |
| Manwah | `proposal-r7-manwah`, B3-28C | (470,267), south of labelled area | E1 → E2 → E3 → E4 → E5 → E6 |
| San Fu Lou | `proposal-r7-sanfulou`, B3-28A/B | (594,330), east of B3-28A within the combined named area | E1 → E2 → E3 → E4 |
| Kichi-Kichi | `proposal-r7-kichikichi`, B3-17 | (615,525), west of labelled area | E1 → E2 → E3 → E8 → E9 |

Each anchor is in the public aisle beside the named area. It is **not an exact door**, not proof of a preferred/main entrance, and not a point inside the business. San Fu Lou receives one approach to its combined area, not two invented independent stores. The final runtime area IDs must come from accepted derived geometry integration; proposal IDs must not be guessed into active bindings.

## Inspection and uncertainty

Every integer centreline pixel was sampled from the original source as supporting audit data. Across all nine edges the minimum channel value is229 and maximum channel spread is9: the sampled lines remain pale/near-neutral, consistent with the visible aisle. This is **not** an automatic walkability classifier; white tenant interiors or other white regions elsewhere would not justify an edge.

The overlay uses a4px coloured line with9px white casing in source-pixel terms and7px-radius node circles. Horizontal corridor y267 lies between the y257/y276 block edges; the x594 and x615 strips are similarly narrow. The reviewer should explicitly assess casing and endpoint-circle clearance, shadows/antialiasing, and all three junctions at (405,454), (594,454), (594,267). Accepted tenant outlines retain their1–3px tracing uncertainty. The original source has no doorway marks at these endpoints. Onsite closures, temporary fixtures, occupancy changes, walking distances and access conditions are not established.

This evidence covers the connected aisle network necessary for these four approaches, **not every B3 aisle**. The western diagonal/circular-escalator zone, eastern strip below Kichi, additional mall entrances, and other floors have not been newly reviewed here. Existing r6 southbound routes may connect through the same start node only after their reverse traversal and directional instructions are reviewed; this packet does not silently promote all old directed edges to undirected ones.

## Coverage and implementation boundary

If all proposed edges and bindings are independently accepted, the four shops' public-frontage anchors can connect to one another through this shared graph. That yields12 ordered shop-to-shop combinations among the four anchors, plus8 ordered landmark↔shop combinations:20 directed pairs among those five selectable places. These are **potential graph combinations, not20 implemented or separately field-verified routes**. Existing Siam Sugar is also an explicit shared node; broader origin/destination coverage should be derived from accepted graph reachability rather than hardcoded demonstration pairs.

Current runtime remains r6 in this lane. No new route is activated, no build/browser result is claimed, and no cross-floor/door/GPS/accessibility inference is made. See `pair-routing-architecture.md` for the separate architecture implications.
