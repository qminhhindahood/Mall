# Printed-plan references — 22 October 2026

Base: combined `integration/consolidated-2026-10-21`, `70e0329`.
**Vincom 163/203 area-linked (80.3 %); 40 floor-only**. Saigon 164/165
unchanged; combined 327/368. This advances the owner's complete-all objective
but does not complete it. Source asset revision remains
`photo-polish-2026-10-12-delivery-r2`.

## Owner input and interpretation

The owner supplied `D:\Midterm\Vincom đồng khởi\map` (seven WebP floor plans)
and asked whether those sources are sufficient. The plans are undated printed
layouts. They are sufficient to establish **literal printed-unit references**,
not current occupancy, current fit-out boundaries, exact doorways or walking
connections. The runtime therefore labels every new association
`source-plan-only` and keeps walking guidance disabled for those destinations.

Five existing precision holds are preserved because the supplied plan names a
different occupant at the assigned unit: Scentuals, Lining, Messy Weekend,
Beauty Box and Lacoste. No protected hold was overwritten.

## Delivered references

All 17 rows and their printed units are listed in
[accepted-references.md](accepted-references.md). Summary:

- **16 shared source-unit references** reuse an existing accepted area and its
  unchanged contour. The new destination and the existing anchor are both
  selectable in the area popup; the area title/review becomes the neutral
  printed-unit reference. Examples: Lẩu MK / Tian Long at B3-18B, Keds / Pucini
  at B2-50, Old Navy / Wilson at B1-50-51.
- **1 new contour pair, PNJ** at printed B2-17I/17J, added as
  `vincom-plan-pnj-b2-reference` with regions `vincom-plan-pnj-17i` and
  `vincom-plan-pnj-17j`. Both trace polygons sit on the unchanged unowned
  source-palette parent `B2-region-027-prompt1-residual-1`; no active shop area
  overlaps them. PNJ's newer locator instead names **B1-60C2**, so the B2
  reference is explicitly disclosed as a printed-plan reference only.

Every new association carries a bilingual note naming the printed unit, the
shared anchor (where applicable), and the unverified current location,
occupancy, doorway and plan date. Detail, Discovery and map surfaces show the
same warning; the map area popup cannot become a walking origin and the
Directions primary action is disabled.

## Sources and limits

- All seven owner-supplied WebPs (B1, B2, B3, L1, L2, L3 and M) match the
  runtime rasters byte-for-byte; the 17 rows use B1, B2, B3, L1 and M. L2/L3
  were checked in the existing remaining-record review and produced no
  additional supported literal reference: New Balance (L2), Dessert Planet
  (L3-K2, printed as Xing Fu Tang) and Coway (L3) remain evidence-held.
  SHA-256 values for all seven are pinned in
  `data/research/vincom-literal-plan-references-2026-10-22-r1.json`; the packet
  itself is hash-guarded by `scripts/vincom-plan-labels-overlay.mjs`.
- Printed names/units were reviewed against the full legend and unchanged
  raster pixels. The plans have no verified publication date.
- Shared units are a source-layout statement only. No exclusive current
  perimeter, co-occupancy, tenancy chronology or exact entrance threshold is
  established.
- PNJ's B2 printed identity conflicts with the newer PNJ locator B1-60C2. The
  conflict is retained rather than resolved by inference.
- This is a single-session source review; no independent-review claim.
- No routing expansion, upload, deployment, remote write or publication.

Remaining floor-only records and their individual evidence requirements are
listed in [remaining-evidence.csv](remaining-evidence.csv). The complete
mapping objective remains active and unfinished.

## Validation

- Both final builds pass sequentially: **Vincom 431 pages / Saigon 357 pages**,
  zero Astro diagnostics. Logs: [build-vincom.log](build-vincom.log),
  [build-saigon.log](build-saigon.log).
- [delivery-checks.json](delivery-checks.json) compares runtime against the
  `70e0329` baseline: 163/203 Vincom and 164/165 Saigon area-linked, 40/1
  floor-only, 17 source-plan-only references, five precision holds, complete
  geometry and all other destination records unchanged, 101 original
  dirty-file hashes exact.
- Browser: **68 EN/VI × 1280/390 px cases, 880 named checks, all pass**
  ([browser-results.json](browser-results.json)). Each affected destination is
  checked for: SSR detail label, handoff, pre-selection warning, correct named
  highlight (one path per region), no route, keyboard popup warning, disabled
  walking origin, preserved mapped anchor, full bilingual note, no overflow,
  Discovery disclosure and no page errors.
- [geometry-review.json](geometry-review.json) records the PNJ trace areas,
  parent coverage, zero active-area overlap, zero mutual overlap and zero
  degenerate contours. Coverage/overlap figures are sampled, not a
  boolean-conservation proof.
- Screenshots: [pnj-detail-en-1280.png](pnj-detail-en-1280.png),
  [pnj-discovery-en-1280.png](pnj-discovery-en-1280.png),
  [pnj-map-en-1280.png](pnj-map-en-1280.png),
  [pnj-detail-vi-390.png](pnj-detail-vi-390.png),
  [pnj-discovery-vi-390.png](pnj-discovery-vi-390.png),
  [pnj-map-vi-390.png](pnj-map-vi-390.png),
  [hue-discovery-vi-390.png](hue-discovery-vi-390.png).

Test-harness note: the SSR fallback and the hydrated detail sheet can both be
present in the DOM when the 3D runtime is disabled, so the static-detail check
is scoped to `.static-guide`. Discovery search uses the app's `collectionQ`
parameter (the `q` parameter belongs to the map scene); using `q` silently
falls back to the default Dining category and hides Keds/Sealy.

## Reproduction

```powershell
npm run build:vincom
npm run build:saigon
node evidence/vincom-plan-labels-2026-10-22/check-delivery.mjs
# Serve dist/vincom-dong-khoi on 127.0.0.1:4621:
node scripts/serve-static.mjs --mall vincom-dong-khoi --port 4621
node evidence/vincom-plan-labels-2026-10-22/browser-check.mjs
node evidence/vincom-plan-labels-2026-10-22/capture.mjs
```

No remote write, upload, push, deployment, PR or other-checkout edit.
