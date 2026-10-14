# Schematic floor review — continuous-journey-2026-10-14-r1

Reviewed the [all-level source overlays](../source-overlays/contact.png) against the retained contour records for all eight Saigon Centre and seven Vincom shopping levels. These are supported **schematic reference shapes**, not surveyed architectural geometry or approved current tenant locations. The same source contours can support raised plan presentation and a practical top-down map; their semantic classifications remain candidates.

| Mall / level | Source comparison and limitations |
| --- | --- |
| Saigon B2 | Dense small partitions and broad cyan areas; asymmetric lower extent preserved. White circulation remains negative space. |
| Saigon B1 | Distinct large blue area and peach corner; its own perimeter and partitions retained. |
| Saigon L1 | Irregular cyan/neutral partitions and surrounding tower context. Context is not shopping-floor infill. |
| Saigon L2 | Dense partitions around pale central regions; blank regions do not establish atriums. |
| Saigon L3 | Distinct dense divisions and small pink region; annotation interruptions remain ambiguous. |
| Saigon L4 | Broad cyan area plus garden/office context; these regions do not establish commercial listings. |
| Saigon L5 | Distinct dining-area contours and central pale shapes; no structural-opening interpretation. |
| Saigon L6 | Sparse upper plan, garden and tower/accommodation context retained. No invented retail slab fills the gaps. |
| Vincom B3 | Dense yellow/neutral divisions and lower green area; circulation gaps retained. |
| Vincom B2 | Multiple colored zones and small partitions; distinct basement perimeter. |
| Vincom B1 | Dense pink divisions; old reference names remain outside the public directory. |
| Vincom L1 | Large upper block and smaller lower partitions; separated circulation retained. |
| Vincom M | Distinct separated upper/lower blocks and mezzanine label; not a duplicate of L1. |
| Vincom L2 | Sparse large blocks around open white circulation; no invented holes or connecting slab. |
| Vincom L3 | Large orange upper zone and smaller yellow/neutral lower blocks. |

Plan coordinates retain the existing fixed source transforms: Saigon 0.02 schematic units per source pixel; Vincom 0.1. Source x runs right and planar z runs down. The source rasters were canvas-centred, with different dimensions; north and calibrated cross-level/exterior registration are unknown. Presentation must apply a common mall frame rather than independently stretching each level to equal bounds. L1 is elevation zero, successive slots are five schematic units, basements negative and M a half slot. These elevations, raised depth, visual gaps, rotation and placement relative to the shopping podium are presentation estimates, not construction heights.

The existing palette extraction excludes annotation-sized fragments, does not infer structural walls/columns, and has zero inferred holes. Text interruption, antialiasing and merged palette components limit topology quality. Original white circulation is negative space between mapped regions, not a newly surveyed corridor mesh. The [0012 source contract](../0012-source-and-transport.md) retains capture thresholds and previous evidence.

No floor-input, source-map, exterior GLB or texture revision changed. Floor revision remains **source-palette-schematic-2026-10-13-r2**; exterior remains **photo-polish-2026-10-12-delivery-r2**. The new delivery changes presentation registration/motion only. Rendered stack/travel evidence and owner appearance acceptance are recorded separately; this source review alone does not pass them.
