# Vincom reopened mapping pass — delivered 22 October 2026

Candidate coverage is **114/203 area-linked, 89 floor-only**, from the combined
branch baseline `aae75e6063f31780ed8e7c5b8827420a9e249205`. This pass adds **Nike
B1-55 as an approximate source-unit reference**. It does not complete all-store
mapping. All 203 listings remain present. Saigon stays 164/165; combined coverage
is 278/368. Asset revision remains **photo-polish-2026-10-12-delivery-r2**.

## What changed and why

The retained ledger held Nike because the supplied plan spells the B1-55 legend
“Nice”. The distributor's [Nike page](https://www.acfc.com.vn/nike.html) and
[store locator](https://www.acfc.com.vn/he-thong-cua-hang) explicitly identify Nike
at B1-55. These are two pages from the same publisher, not independent publishers.
Historical merchant-program search excerpts corroborate the unit; the attempted
full Shinhan PDF retrieval timed out, so no fresh full-PDF verification is claimed.

The decision uses **unit-number correspondence as an inference**, rather than
treating the printed name as a literal Nike match or silently correcting the
original plan. The source plan has a separate, legible B1-55 unit between the
already mapped CK Jeans and Adidas Originals. The new contour follows that unit,
with 1–3 source-pixel tracing uncertainty. Original raster and captured geometry
files are unchanged. Current exclusive premises, operation, exact doors and
walking connections remain unverified. The bilingual note identifies the area as
approximate and asks visitors to check signage on arrival.

[Source decision](nike-source-review.json),
[exact contour/residual measurements](geometry-review.json) and the hash-bound
packet in `data/research/vincom-reopened-source-unit-2026-10-21-r1.json` preserve
that qualification. The new stage replaces only the unassociated neutral parent
with its residuals plus the new contour; it does not overlap an existing mapped
region. Packet, source review, raster, transform, directory revision, original
locations and original neutral region are guarded. Existing loader/precision
guards continue to execute.

## Remaining 89 records

[Review ledger](review-ledger.json) reconciles all 90 previously floor-only records;
[remaining-evidence.csv](remaining-evidence.csv) gives the exact requirement for
each of the 89 holds. This was a desk reconciliation of retained evidence, with
new external checks focused on Nike and the B1-28B/C group. It is not 90 fresh
independent investigations or a new physical survey.

Remaining categories: 43 identity/chronology/subdivision gaps, 28 missing matching
footprints, five protected precision holds, four shared-unit/competing identities,
four floor/boundary conflicts, three missing kiosk/counter perimeters and two
ambiguous unit boundaries. These categories describe the reviewed evidence gaps;
they do not prove tenant closure or absence from the mall.

Marhen.J's [own locator](https://marhenj.co.kr/shop/page.html?id=7) names B1-28B.
However, the supplied plan groups Marhen.J/Puma/Ceci across B1-28B-C, while the
retailer's [loyalty list](https://www.maisononline.vn/blogs/news/maison-loyalty-quet-payme-qr-tich-diem-me-ly)
also names Urban Revivo at B1-28B. Currentness and exclusive/shared boundaries
remain unresolved, so none of these four records is activated. An initial search
snippet appearing to place Ceci at that unit actually referred to Marhen.J in the
opened article; it was not accepted as Ceci evidence. The separately owned
Lukfook review/worktree was not edited.

The owner identified the supplied handoff folder and existing specifications as
the available material, without identifying a newer plan. [Handoff inventory](handoff-inventory.json)
inspects all 16 ZIP entry lists and the seven recognizable original Vincom floor
WebPs; all seven match the current originals. No newer recognized dated floor
plan was found. This is not a verification of every payload or arbitrary image
in all archives. Earlier proposal/delta counts are superseded by the integrated
113/203 baseline; no old archive was restored over the combined app.

## Verification and limits

- Both final builds pass: **Vincom 431 / Saigon 357 pages**; each Astro check reports
  55 files, zero errors/warnings/hints. Logs are adjacent; archived copies trim
  trailing whitespace. Existing bundle-size advisories remain.
- [Before browser check](browser-before.json) fails at zero selected Nike regions.
  [Final browser checks](browser-after.json) pass four EN/VI desktop/390px cases
  with 28 named checks: Nike detail-to-map handoff, identity, keyboard selection,
  unsupported routing, horizontal bounds, adjacent Adidas and all five held stores.
  The first post-change run raced the query-selection effect in one VI case;
  [that receipt](browser-after-initial.json) is retained. Waiting for the selected
  region to become visible resolves the harness race without changing the app.
- [Delivery checks](delivery-checks.json) compare all other destinations, existing
  areas and all other geometry regions with the retained runtime. They preserve
  the five precision holds and verify built/runtime geometry plus Brotli/gzip
  round trips for both malls. All **101 pre-existing dirty files** retain their
  original hashes and are excluded from staging.
- The two new hash-bound packet/review files have exact-byte `.gitattributes`
  rules. Their staged Git blobs match the tested working bytes. Only those two
  new files were refreshed under those rules; existing captured evidence was
  neither normalized nor staged.
- The content checker disables Vite dependency discovery: its first run scanned
  archived HTML review templates containing deliberate placeholders and printed
  optimizer warnings, while the content assertions passed. The corrected checker
  rerun passes without scanning those unrelated files.
- Single-session source/code review only; **no independent reviewer or subagent**
  was used, following the owner's usage constraint. No full 300-case historical
  mapping suite, physical-device check, whole-branch release review, complete
  Home/UI acceptance or production verification is claimed.

Scope is one local mapping addition plus evidence. UI styles/components, directory
wording, routing graphs and source assets are preserved. The existing UI model
assignment is unaffected. No upload, push, PR or deployment was performed. Further
mapping expansion needs the per-record identity/unit/perimeter evidence in the CSV;
the current supplied material does not safely locate all 203 stores.
