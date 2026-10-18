# Recovered floor presentation — 18 October 2026

Revision `source-floor-slabs-2026-10-18-r1`. The preview mismatch was a branch integration gap: the continuous application had its own rotating, source-region stack, but the improved continuous plates and complete Vincom source zones remained in the separate composition prototype.

| Prior work | Preserved source | Consolidated result |
| --- | --- | --- |
| Continuous schematic floor plates | `f8df2f5` on `prototype/0019-composition-2026-10-17` | Exact later r5 plate outlines restored for all 15 shopping floors |
| Horizontal aligned projection | `ed98ce0` | Existing application horizontal stack retained, using those plate outlines |
| Complete Vincom panels and full-turn stacks | `5d3c831` | Seven exact r5 Vincom plates and 107 clipped source-zone paths; existing full-turn/Pause/reduced-motion behavior retained |
| Continuous hero/overview/map transition | Existing integrated `JourneyMotion.tsx` | Same native-scroll controller and selected-floor travel; recovered presentation used by the shared `FloorMap` |
| Discovery A5 complete collections and retained map | Existing `a4dc9b9` / `aa38848` integration | Existing category/list/details and selected map retained |

`python scripts/import-overview-slabs.py` recovers presentation from exact committed `5d3c831` artifacts rather than recreating geometry or reading the dirty prototype worktree. Each mall's `data/malls/<mall>/overview-slabs.json` records source commit, artifact hashes, source raster hashes and the original schematic method. These are presentation assets, not new precise-location associations. They retain the original estimated coordinate frame and do not assert survey accuracy, occupancy, independent storefronts or newly verified map IDs. Application code loads only its mall's presentation.

The shared SVG now draws a continuous plate and side edge, including the complete Vincom reference backdrop. Original interactive mapped areas retain their IDs and continue rendering above the backdrop. Shared framing includes the recovered perimeter extents; both floor selection and the map retain the same coordinate contract. Live `floor-geometry.json`, source maps, exterior models and textures remain unchanged.

The idle selected floor remains emphasized. Hovering or focusing another floor now also dims and neutralizes the selected floor, matching all other alternatives. Leaving the floor controls restores the selected emphasis. The former selected CSS rule was more specific than the general dim rule, causing the reported double emphasis.

Validation: scoped Astro check passes 27 files with zero errors, warnings or hints. The Impeccable detector reports only advisory existing typography/palette-documentation differences; this repair reuses those incumbent colors and introduces no new font scale. Final builds and browser hover/focus, map selection and responsive evidence are owned by `evidence/handoff-acceptance-2026-10-18/`. Owner appearance acceptance, directory copy review and runtime/release acceptance remain separate.
