# Remaining Vincom mapping review — 22 October 2026

Base: combined branch `integration/consolidated-2026-10-21`, commit `5425ff8`.
The owner requests all remaining 59 links. This delivery **does not complete them**:
Vincom remains **144/203 area-linked, 59 floor-only**. Saigon remains164/165.
One incorrect floor is corrected: Innisfree **L1 → B1**. No new area or walking
route is activated. Asset revision remains `photo-polish-2026-10-12-delivery-r2`.

## Supported correction and rejected shortcuts

- [Innisfree's own locator](https://vn.innisfree.com/pages/store-locator) embeds
  Storemapper account `36047-MsULpxDpK8NbJjGo`. A fresh22 October capture of its
  public stores endpoint retains record61258554, INNISFREE VINCOM DONG KHOI,
  address B1-23. [Vincom's branch card](https://vincom.com.vn/brand/innisfree)
  independently says B1. The exact captured locator/endpoint bytes are pinned
  in `data/research/vincom-verified-floor-2026-10-22-r1.json` and `.gitattributes`.
  The supplied plan has **23A (Aqua)** and **23B (Botanifique)**, whose accepted
  area also includes22B. Unsuffixed23 does not identify A or B. Arbitrarily using
  Aqua's area, or including unrelated22B, would overstate the evidence. Preserve
  floor-only precision, existing geometry and both earlier associations.
- PNJ's [historical2023 PDF](https://www.pnj.com.vn/blog/wp-content/uploads/2023/01/Lich-mo-cua-cua-CH-pdf.pdf)
  says B1-23A, but the retained21 October official locator query has branch1159
  at **B1-60C2**. The earlier extracted record is copied here with its original
  finding (`pnj-branch-1159-extracted.json`); it is not a fresh API capture in
  this delivery. The undocumented `status_sis=D` and missing60C2 perimeter
  prevent treating historical23A as current. Do not infer60C2 from whole60.
- [Crocs' current Vincom page](https://vincom.com.vn/brand/crocs) contradicts
  itself: the article says B1 while the branch card says B2. The supplied
  Crocs17AB cells have a separately verified newer Lukfook17AB address. No
  current Crocs perimeter, shared occupancy or floor change is inferred.
- Old printed tenant names are not automatically mapped onto newer tenants'
  accepted source-unit references. This would turn unresolved chronology into
  an apparent current store location. Kiosk labels are not tenant perimeters.
  The five protected precision holds remain unchanged.

## All59 retained blockers

[remaining-evidence.csv](remaining-evidence.csv) preserves a per-store requirement
for all59, updating Innisfree, PNJ and Crocs from the findings above. The other
56 reuse the previous batch's reconciled evidence; this is **not** a claim that
each received a new current-occupancy audit in this delivery. No newer usable
plan was recovered from the additional official document leads.

| Evidence gap | Records |
| --- | ---: |
| No corresponding source footprint | 25 |
| Tenant chronology or unit subdivision conflict | 20 |
| Protected precision holds | 5 |
| Counter/kiosk perimeter missing | 3 |
| Floor/unit correspondence (Innisfree floor now resolved) | 3 |
| Shared unit with competing identities | 2 |
| Ambiguous printed unit perimeter | 1 |

The exact missing input is a dated tenant-to-unit correspondence plus an
identifiable plan contour or reviewed subdivision. Existing listings remain
available without a false map highlight. No claim of full mapping, current
exclusive boundaries, independent review or publication is made.

## Verification

- Both builds pass: Vincom431 pages, Saigon357; Astro reports zero diagnostics.
- `browser-results.json`: four EN/VI1280/390px journeys pass28 named checks.
  An old saved `?floor=L1` detail link hands off to Innisfree onB1, with visible
  floor-only wording, no selected store polygon and no invented route. No page
  errors or horizontal overflow. Uses the repository's retained Playwright/Chrome
  journey harness; no UI component or styling change.
- `delivery-checks.json`: all other destinations, areas, facilities, highlights,
  categories and **complete geometry** are unchanged for both malls. All101
  pre-existing dirty-file SHA256 values remain exact. Earlier144 links and
  five holds therefore remain unchanged. This is affected-change verification,
  not the complete release/device suite.
- Single-session source/code review: correction validates exact packet/source
  hashes, base revision, original destination and absence of unreviewed Highlight
  references. It changes only the reviewed destination's floor/provenance.
  Frozen earlier mapping packets are untouched.

Rerun from the app directory:

```powershell
npm run build:vincom
npm run build:saigon
node evidence/vincom-final-review-2026-10-22/check-delivery.mjs
# Serve dist/vincom-dong-khoi on4621 using scripts/serve-static.mjs.
node evidence/vincom-final-review-2026-10-22/browser-check.mjs
```

The full59 remain evidence-held; the requested all-links outcome is unfinished.
No upload, push, deployment, PR or other-checkout edit.
