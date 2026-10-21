# Vincom batch of 30 source-area links — 22 October 2026

Delivered on the combined branch after baseline **d508f15**. The owner requested
maximizing area links, then specifically asked for 30–40 additions in one batch
before checking. This packet adds **30** qualified source-area references:
Vincom **114 → 144/203 (70.9%)**, with **59** floor-only records remaining.
Saigon remains **164/165**; combined coverage is **308/368**.

Asset revision: **photo-polish-2026-10-12-delivery-r2**, unchanged. These are
schematic source-unit references, not verified current exclusive premises,
doorways, surveyed boundaries, co-occupancy or new walking routes.

## What is accepted

[All 30 links and their units](accepted-links.md) identify the exact delivered
scope. [Source review](source-review.json) records every claim, source URL and
identity conflict. There are 21 association additions and nine links sharing a
single area ID with another destination. Six existing area labels/review records
become explicit shared-reference labels; their regions and original destinations'
locations are preserved. No overlapping duplicate tenant areas are created.

The supplied rasters are undated and frequently print older tenant names. This
delivery accepts a narrower correspondence to a numbered source unit, with public
EN/VI qualifications. It does not infer that tenant replacement preserved walls,
that either tenant closed, or that competing names operate together.

Primary retailer/operator unit claims support most links. Partner merchant/voucher
addresses support Tian Long, Tous Les Jours, Guess, The Body Shop, iSushi and The
North Face; Long Wang has an employer-published unit address. An Phước, Escentric
Signature and The Matcha Tokyo use explicitly identified secondary unit coverage,
corroborating retained unit claims and separately checked branch identity. This is
weaker than a current operator floor plan and is accepted only as an approximate
source reference. Retrieval dates are not tenant-location effective dates.

Sony's own current address says B1-21. The plan legend names Prima Art at unit21
and shows closed grey cells21A/21B. Grouping these cells is an explicitly recorded
numeric-family inference; it is not a current Sony perimeter. Prima Art's own
locator confirms its B1 branch but omits the unit. Its visible note therefore says
**its current shop location is unconfirmed**, and that a shared reference does not
establish shared premises. The grey cells are source-unit references, not newly
asserted tenant walls. Mắt Việt uses only the readable coloured19 portion of its
18–19 claim; no grey18A/B extent is borrowed.

Lukfook reuses the exact completed serial review retained in the other checkout:
[review](lukfook-source-review.json), [packet](lukfook-source-packet.json) and
[brand release](lukfook-release.html). The release dates its opening to1 September
2026 at B1-17AB. The reference excludes17C. That checkout was read only; no helper
agent was started. The new batch's source/code review is otherwise in-session,
not an independent review.

## Validation

- Both builds pass: Vincom431 pages, Saigon357; zero Astro errors/warnings/hints.
- [120 browser cases](browser-results.json), EN/VI ×1280/390px ×30 links, pass840
  named checks: static detail handoff, named map highlight, unavailable unsupported
  route, keyboard popup, complete bilingual qualification, no overflow/page errors.
- [Delivery guards](delivery-checks.json) verify144/203 and164/165, all other
  destination records, accepted contours, unchanged area-region associations,
  five precision holds,101 original dirty-file hashes, and identity/br/gzip parity.
- [Geometry review](geometry-review.json) verifies22 new contours, no active-area
  overlap, no overlap between new contours, and neutral subtraction conservation.
  Original raster files and transforms remain unchanged. Approximate contour
  uncertainty is1–3 source pixels; the Mắt Việt contour was inset after crop review.
- Source overlays [B1](B1-reviewed-contours.png) and [B3](B3-reviewed-contours.png)
  show the traced references. Raw source crops are retained alongside them.

The earlier17-link browser receipt is retained as intermediate evidence, not a
second final acceptance run. No full release suite, physical navigation, production
acceptance, source-tenant chronology resolution or independent batch review is claimed.

## Reproduce

From the combined application directory, with the existing installation:

```powershell
python evidence/vincom-max-links-2026-10-22/prepare-packet.py
npm run build:vincom
npm run build:saigon
node evidence/vincom-max-links-2026-10-22/check-delivery.mjs
# Serve Vincom on127.0.0.1:4621 using the documented static-server workflow.
node evidence/vincom-max-links-2026-10-22/browser-check.mjs
```

The contour reproducer requires Shapely; it regenerates the exact LF packet/review
bytes pinned by the loader. The browser harness uses the repository's retained
Playwright/Chrome workflow. `baseline-runtime.json` was captured at114 mapped;
`capture-baseline.mjs` deliberately refuses to capture the expanded runtime as a
new baseline. Do not normalize the101 existing dirty hash-bound files.

[Retrieval receipts](source-retrievals.json) distinguish successful raw downloads,
access failures and indexed-only excerpts. The raw research cache remains under
`D:/Midterm/.scratch/vincom-max-source-2026-10-22`; it is not uploaded. In particular,
the VIB Body Shop and XanhSM iSushi full PDFs were not read; their indexed primary
partner unit excerpts are recorded with that limitation. Guess's full VPBank PDF
and its page10 merchant row were checked locally.

## Remaining scope

[The full89-record ledger](review-ledger.json) accounts for30 accepted and59 held.
[The59 exact remaining requirements](remaining-evidence.csv) preserve each unresolved
unit/identity/floor/perimeter input. All were reconciled against retained claims and
this packet; fresh external checks were focused, not an independent current survey
of all59 stores. The five precision holds remain intact. A larger count cannot be
obtained by assigning unlabelled/kiosk shapes or silently lifting those holds.

No source asset revision, Saigon mapping, route graph, publication or remote write
is part of this delivery. Tracker updates remain local in the root repository.
