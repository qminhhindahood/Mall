# Two additional source-unit links —22 October2026

Base: combined `integration/consolidated-2026-10-21`, `0212108`.
**Vincom146/203 area-linked;57 floor-only**. Saigon164/165 unchanged;
combined310/368. This advances the owner's complete-all objective but does not
complete it. Source asset revision remains `photo-polish-2026-10-12-delivery-r2`.

## Primary-source findings

1. **Bath & Body Works, L1-45.** The live [Valiram locator](https://valiram.com/store-locator/)
   loads store2516, Bath & Body Works - Vincom Center Dong Khoi, with unit L1-45
   and the72 Lê Thánh Tôn branch address. The public read-only `asl_load_stores`
   request follows the locator's shipped JavaScript and its public page token.
   Full returned records are retained as `valiram-stores.json`, SHA256 pinned
   in `data/research/vincom-valiram-area-2026-10-22-r1.json`. No credentials or
   private endpoint were used. Earlier indexed primary locator content supplied
   the lead; the current raw response confirms it. The supplied raster labels45
   Innisfree, whose newer first-party locator places it onB1 (previous delivery).
   Activate **existing unowned `L1-region-003`**, visibly following the closed45
   source outline, as an approximate unit reference. Current fit-out boundary,
   exact doorway and plan date remain unverified and are disclosed in EN/VI.
2. **Yamazaki, shared B3-21 reference.** The [Vietnam Yamazaki employer notice](https://www.topcv.vn/viec-lam/nhan-vien-bep-banh/2310512.html)
   names B3-21 at Vincom Center Đồng Khởi, with application deadline23 October2026.
   TopCV identifies the employer as CÔNG TY TNHH VIỆT NAM YAMAZAKI and states
   postings are employer-supplied; account authorship is not independently
   authenticated here. Full200-response HTML is pinned in
   `data/research/vincom-yamazaki-area-2026-10-22-r1.json`. Share the already
   accepted B3-21 area with the supplied plan's **Beard Papa’s** identity. Preserve
   that destination's complete record and contour, use a neutral shared-area
   title, and disclose that shared current occupancy/exclusive current boundary
   and exact doorway are unverified. This is a source-unit reference, not a claim
   that two independently enclosed shops or current co-occupancy were established.

Both decisions are single-session reviews consistent with earlier qualified
source-unit references. No independent-review claim. Frozen previous packets
remain intact. New packets, primary captures, original target/anchor records,
base revisions and contour/source bytes are guarded. No routing/UI redesign.

## Remaining investigation

[remaining-evidence.csv](remaining-evidence.csv) accounts for all57 unresolved
records. The previous59-store ledger remains the baseline; these two records are
removed because newly inspected primary claims establish their unit references.

- Enlarged **Catia** inspection (retained `catia-label-inspection.png`, analytical
  crop of unchanged B2 source pixels) distinguishes diagonalH/I/J/K andN. The
  inner left square's compressed final letter remains ambiguous; enlargement
  cannot recover lost detail. Do not inherit the visiblyH-labelled old anchor.
- [Golden Dynasty secondary registry lead](https://masothue.com/0317411584-002-cong-ty-tnhh-rak-thai-chi-nhanh-golden-dynasty)
  names branch0317411584-001 at B3-10C, where the accepted Kohaku source-unit
  reference exists. This is a **lead only**, not verified primary evidence;
  no corresponding association is activated. A first-party/official registry
  confirmation plus chronology/perimeter review is still required.
- Fresh exact-unit searches for Victoria’s Secret, New Balance, Jo Malone, YSL,
  Fred Perry, Golden Dynasty, Dahu, Since Tea, PhotoTime, Vincy, Seha, Tutto Piccolo
  and Honee produced no further accepted unit/perimeter match. Fred Perry's
  [own locator](https://www.fredperry.com/eu-pt/shop-finder/vincom-dong-khoi-hcm)
  confirmsM only; it does not identify a source unit. No alternate-country raw
  fetch was used to retry the earlier denied Fred Perry request.
- Older printed identities, absent footprints, unlabeled kiosk extents and
  protected precision holds remain unresolved. All57 still require the recorded
  correspondence evidence; this pass does not establish exhaustive web coverage.

## Validation and reruns

- Both final builds pass: Vincom431 / Saigon357 pages, zero Astro diagnostics.
- Eight affected EN/VI1280/390px browser journeys pass. Verify detail → Directions,
  correct named highlight, keyboard selection, full source qualification,
  preserved shared anchor, no invented route, no overflow and no page errors.
  `browser-results.json` contains the named checks. Innisfree remains solelyB1
  and is not listed in the newL1-45 popup.
- `delivery-checks.json` compares the runtime against0212108: all other complete
  destination records, complete geometry, facilities, highlights, categories,
  source rasters and five precision holds are unchanged. Only one new area and
  the sharedB3-21 area's neutral title/review are added/updated. All101 original
  dirty-file hashes remain exact and are excluded from staging.
- `geometry-review.json`: reused contour is valid, no overlap with activeL1
  areas; zero new/changed contours. This remains approximate source geometry.
- Verification covers this change, not the complete release/device suite.

```powershell
npm run build:vincom
npm run build:saigon
node evidence/vincom-valiram-area-2026-10-22/check-delivery.mjs
# Serve the Vincom static output on4621 using scripts/serve-static.mjs.
node evidence/vincom-valiram-area-2026-10-22/browser-check.mjs
```

No remote write, upload, push, deployment, PR or other-checkout edit.
