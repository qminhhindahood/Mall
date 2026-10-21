# Highlands Coffee B3-11 approach — r6

Bounded source-data change against isolated redesign candidate b4c8457. Only `src/data/area-routing.ts` is changed by this lane; no UI change, build, commit, canonical edit, upload or publication.

## Reviewed endpoint and source

The independent review at `D:/Midterm/.scratch/route-expansion-review-r6/README.md` and its `vincom-b3-highlands-paths.png` overlay approves the single default frontage approach from existing public-aisle start `(405,507)` to `(405,545)`, alongside **B3-11**, region **B3-region-014**. The original 1320×1077 B3 source raster remains SHA-256 `ccf11fc15fc9f6efa32ca8a23b395caba1a0e2f248740c0ee0d9c2c6c5e12e89`.

The x405 line is within the visible pale public aisle, between the B3-11 right boundary around x397–399 and the B3-15A boundary near x415. The endpoint is beside the labelled area, not a door. No alternate endpoint at B3-12&14 is added.

## Graph and activation

The existing `escalator (405,507) → south (405,620)` segment is split at generic node `aisle-beside-b3-11 (405,545)`. Existing Chang Kang Kung and Chilli Thai routes traverse the same straight public aisle with one additional step; their downstream segments and endpoint coordinates do not change. Siam Sugar and all Saigon routes are untouched. The new endpoint is appended so the pre-existing endpoint order/default choice is preserved.

The endpoint binds `vincom-prototype-highlandscoffee` only to `supplement-20261021-prototype-highlandscoffee`. Existing `supportedNetwork` checks require the destination to be open, on B3, and **area-confirmed with that exact area ID**. Both IndoorGuidance and JourneyAtlas call this guard before constructing a route; JourneyAtlas option-coverage text uses the same guard. The mapping supplement separately requires accepted independent review before generating that association. No guard bypass or activation-setting edit is made here. An unaccepted/pending supplement or original floor-only Highlands record therefore remains non-routable.

The combined mapping may represent B3-11 and B3-12&14, but this route ends only beside B3-11. It does not imply a separate shop door or a route to every component of the mapped area.

## Exact coverage

- Before accepted Highlands activation: six enabled landmark-to-area destinations (Saigon L5 three; Vincom B3 three), plus the existing CK↔MLB connection in two directions.
- Graph after this change: seven configured landmark-to-area destinations (Saigon L5 three; Vincom B3 four), conditional on accepted Highlands mapping. After that integration: **seven same-floor directed landmark-to-destination routes + two directed CK↔MLB journeys = nine supported directed journeys covering nine unique destination records**.
- No shop-origin reverse route, general shop-to-shop route, new cross-floor connection, metric/time claim, accessible-route claim or current onsite verification is added.

Final build and browser integration checks belong to the parent after the mapping supplement and visible association-detail notes are integrated. No new automated unit/test seam is introduced. Source inspection confirms the unchanged guard and both call sites; runtime success is not yet claimed by this lane.
