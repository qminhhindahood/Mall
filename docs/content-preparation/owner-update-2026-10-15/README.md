# Owner directory update — 15 October 2026

Revision **directory-owner-update-2026-10-15-r1**. This packet incorporates the owner's updated comparison CSV and Vincom store JSON. It supersedes the earlier **67 missing Vincom floor decisions**: all **383 supplied table occurrences now have explicit owner-reported floors**, including all 217 Vincom records. This is content/location review input; bilingual, status, identity, taxonomy and release approvals remain separate.

The owner explicitly confirmed **Adidas Original / Home of Sport is on B2**, independently of Adidas Originals. The root `D:/Midterm/all-record-map-comparison (1).csv` now records B2 in its owner-decision columns, matching `store-data-vincom-dong-khoi.json` (`floor` and `zone` both B2). The old B1-56 clue remains in historical observation columns; it is not a current location assignment. The owner-unit field is now `not published`, rather than retaining a misleading possible B1 unit. The JSON already said B2 and was left byte-for-byte unchanged.

## Files

| File | Purpose |
| --- | --- |
| [Corrected owner CSV](inputs/all-record-map-comparison.corrected.csv) | Copy of the corrected root file; all 383 owner decisions preserved |
| [Received CSV](inputs/all-record-map-comparison.received.csv) | Original input before the explicit Adidas correction |
| [Supplied Vincom JSON](inputs/store-data-vincom-dong-khoi.json) | Exact supplied 217-store source; not a public directory snapshot |
| [review-cards.json](review-cards.json) | 383 historical source/proposal cards with owner-reported floors, floor-only candidate locations and preserved raw JSON/CSV decisions |
| [remaining-location-queue.csv](remaining-location-queue.csv) | 75 rows with unresolved unit precision or flagged evidence/occupancy questions; no visit is claimed or scheduled |
| [consistency-notes.json](consistency-notes.json) | Narrow cross-file, cross-mall and shared-unit observations |
| [validation.json](validation.json) | Source hashes, counts, validation limits and unchanged public-snapshot hashes |
| [import-owner-update.py](import-owner-update.py) | One-time preparation; refuses to overwrite an existing review packet |

The received source files live outside the application Git repository; exact source copies and correction hashes make this delivery reviewable in Git. The received date **15 October 2026** and explicit Adidas correction date are communication dates. They do not fill `reviewedAt` or VI/EN approval dates. Owner prose citing an official live check on 14 October is preserved as supplied evidence, not a new independent check by this agent.

## What is accepted and what stays parked

- Owner floor decisions are carried forward for all 383 occurrences. They are no longer automatically rejected because the old Markdown had no Vincom floor headings. Candidate floor locations use **floor-confirmed with no area IDs**; final public approval fields remain pending.
- Every JSON floor belongs to the corresponding corrected CSV floor set. ZARA is compatible: CSV's first row records L1/M at brand level, while JSON retains separate L1 and M rows. Identity consolidation still needs an explicit decision before producing one public multi-floor destination.
- The JSON has **70 stores without unit values**. Missing or uncertain units do not become precise map markers. The 75-row queue also includes shared-occupancy/cross-mall notes and therefore is not a count of 75 incorrect floors or mandatory visits.
- The owner states remaining location problems cannot be resolved without going in person. Those locations remain parked; no further lookup or visit is assumed. Resolved floor decisions allow bilingual/basic-listing preparation to continue without those precise markers.
- Crocs Vincom B2, Valentino Creations B2 and Yamazaki B3 retain owner-confirmed floors with unknown units. Their stale reference units are not imported. The Saigon Crocs row retains its structured owner floor **L3**; its prose was copied from the Vincom B2 relocation and cannot supply Saigon location evidence. That unit stays unknown as the owner marked it.
- An Phước and Sealy both claim **B2-01C** in the supplied inputs. Preserve both independent records, but infer neither replacement nor shared geometry. Sony and Studio 77 likewise remain independent per owner instructions; `Lô 7` versus `M-07` does not establish a common polygon.

## JSON semantics and metadata

`meta.version` remains `v0-draft`; `meta.generated: 2026-10-12` is a supplied generation date, not content approval. `meta.needsFloorVerification: 84` and prose about missing floors are stale relative to the actual 217 records, which all now have floors; no `_needsFloor` flags exist in them. The immutable copy preserves the original metadata while the receipt records actual counts.

The per-store **`highlights` string is visit-purpose/descriptive Vietnamese copy**, not a team-selected editorial Highlight. It is retained in each source record for content review and never converted to the application's `highlights` collection. Editorial Highlights remain empty/deferred until the owner supplies them. JSON category/cuisine fields are keyword-derived suggestions, not approved taxonomy. Supplied source IDs (`vd-x-*` included), websites and prose remain review input; no stable runtime IDs, operating status, English translation, prices, opening hours or media are fabricated.

## Validation and handoff

PASS: all 383 source occurrence IDs are unique and all original non-owner CSV columns match the prior comparison. All 217 JSON records align to CSV rows by checked names and source sequence, including the explicit CK Jeans long-name variant; JSON IDs are unique. Supported floors and CSV/JSON floor compatibility pass after the owner's Adidas correction. Pending language/status/taxonomy/identity fields, empty verified public locations and empty editorial Highlights remain intact. Both existing pending public snapshots pass `validateContent` against current geometry; their hashes remain unchanged.

No public content import, map/geometry/runtime/presentation change, site propagation, publication or deployment occurred. Original maps and prior review packets remain revision evidence. No in-person checks were performed. The map/runtime owners can use these owner decisions for future occupancy reconstruction, while exact areas remain withheld until location evidence exists. Exterior **photo-polish-2026-10-12-delivery-r2**, floors **source-palette-schematic-2026-10-13-r2** and public snapshots **directory-pending-2026-10-14-r1** remain unchanged.

Remaining owner/editorial work: confirm independent identities and operating status, category memberships/primary floors, VI/EN names and descriptions (or approved empty introductions), real approval reviewers/dates, facilities/counter completeness and snapshot signoff. Precise-location questions are parked for an eventual owner visit if no current evidence is available; they need not block otherwise approved floor-only basic listings.
