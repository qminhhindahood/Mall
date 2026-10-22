# Routing preview integration —22 October 2026

The previews on ports4621/4622 were serving the mapping branch, which had only the 41 reviewed directed journeys. New estimated routing was separately committed in `implementation/mall-visitor-ui` on `ui/polish-2026-10-22`, through **3a83f2f477cb565093251ebbf09c68c6872086ac**, and had never reached these previews.

## Reproduction and fix

`node evidence/routing-integration-2026-10-22/repro.mjs` failed before integration with:

```
4622: FAIL Route not available
4621: FAIL Route not available
```

The cases are Saigon entrance1 L1 to MLB L3 and Vincom Watsons B2 to CGV L3. Both now pass with an enabled Show route steps control.

Imported the newer shared estimated route engine, facility/icon data, Directions controls and map zoom/labels from committed UI sources; the other checkout was read-only. Three-way integration against aae75e6 preserves the current mapping implementation and its 17 source-plan-only flags. No directory, contour, original plan or reviewed graph is replaced. Both outputs now use reviewed guidance first and estimated guidance for supported remaining connections. Estimated paths are visibly labelled in EN/VI. The requested entrance-status message stays removed.

Fixed an upstream estimated-step selection defect: the expanded step list used `route!.steps` even when the path came from an estimate, where `route` is null. It now selects the clicked step's floor. This is exercised in all eight bilingual desktop/phone regression cases for the reproduced pairs.

## Validation

Both builds pass: Vincom431 pages, Saigon357 pages, zero errors/warnings and one inherited unused-variable hint in the estimated engine. `focused-results.json` records eight EN/VI390/1280px estimated-route/detail-step/map-floor/overflow checks plus two cases retaining source-plan-only route blocking. All101 protected raw-file hashes match the original baseline (`raw-hashes.json`). `browser-suite.log` records a passing broader suite: reviewed-route priority, all21 Vincom floor pairs, mapped/floor-only trips, landmark start, manual floor transfers, Vietnamese/phone checks, facility key, five Saigon route scenarios,40 seeded Vincom pairs (40/40 routed), and map zoom on both malls. The sweep excludes the17 source-plan-only identities. The initial upstream fixture used a now-protected historical identity as a floor-only start; it was updated to the currently floor-only Mochi Sweet. Build log copies have terminal colour and trailing whitespace removed; original logs remain in `.scratch/routing-integration`.

## Limits

The transferred routing implementation estimates corridors and connector pairing from schematic plans. Vincom lift shafts and served floors are positional assumptions, not surveyed or physically walked connections. The upstream icon packet names overlay evidence that is absent from the supplied checkout; those references are provenance from the source commit, not new independent visual approval. No independent review or publication is claimed.

The17 literal source-plan-only identities still disclose unconfirmed current location and cannot be walking origins or receive an estimated path. New floor-only route support does not resolve those conflicting historical identities. Vincom remains163/203 area-linked and40 floor-only; Saigon164/165. Asset revision **photo-polish-2026-10-12-delivery-r2** unchanged. This integrates existing routing work; it does not complete the remaining mapping objective.
