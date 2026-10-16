# Final owner directory reconciliation — 15 October 2026

**Preparation delivered; content remains pending and unpublished.** This packet preserves the supplied `D:\Midterm\all-record-map-comparison (1).csv` byte-for-byte and turns it into a review queue for both malls. Owner corrections received after the original packet are recorded in a separate amendment ledger; the source CSV remains unchanged. This does not create an approved `DirectorySnapshot`, change public content, or infer editorial review dates or language approvals.

The source has 383 candidate occurrences: 166 Saigon Centre and 217 Vincom. Six rows explicitly marked `REMOVED` are excluded from current candidates (Boost Juice, Phúc Long, Cocolux, CK Jeans merged into Calvin Klein, Letitia and HLA). The other 377 remain pending basic-listing candidates. This is a preparation count, not a verified current tenant total. The owner CSV is a rebuilt file with new source references; only 75 rows retain a `source_line` value. Preserve the raw rows and do not assume the rebuilt IDs or absent source lines are the old ledger's original lineage. The referenced `all-record-map-comparison-REBUILD-NOTES.md` was not supplied.

## Owner decisions reflected

- Vincom Crocs: **B2-49**.
- Vincom Valentino Creations: **L2-07**; this latest owner decision supersedes the older B2 directory/map claim.
- Vincom Sony: **B1-21**, based on owner-supplied research in the latest CSV. This supersedes the earlier “unknown” decision. The research was not independently rechecked in this handoff.
- Vincom An Phước: **B2-01C**; the prior B1-49 claim is dropped.
- Vincom Adidas Original / Home of Sport: **B2**, without a unit claim; this is distinct from Adidas Originals at B1-56. The latest CSV name is “Adidas”; preserve the distinction during identity review.
- Other latest changes include Date Nariya, Langfarm, Kichi Kichi, Seoul Garden, KyoHananari, WatchMe and Sâm Geumsang unit/status revisions. See the preserved source rows and [legacy JSON differences](legacy-json-differences.json).

The prior Vincom JSON is older and does not agree with the newest CSV on all details. The 57 matched differences are retained in `legacy-json-differences.json`; do not use that old JSON to overwrite the latest owner decisions. In particular, it still contains older unit claims for locations now cleared by the owner.

## Supplemental Vincom inputs — 16 October 2026

The newly supplied [Vincom input comparison](input-reconciliation-2026-10-16/README.md) is the latest cross-file review. The supplied `all-record-map-comparison updated.csv` has the same SHA-256 as the prior comparison CSV, so its contents did not change. The new Vincom JSON has 208 objects while its metadata says 217; all 208 floors match the CSV, but nine rows are absent and seven unit differences remain after applying the earlier Kooples/Weekend amendments. Keep those candidates pending until the owner resolves them. The report preserves both new inputs, the full row-level unit diff, category counts and metadata mismatch. It changes no base records or public snapshots.

## Owner unit and editorial review — 15 October 2026

The owner reports **zero conflicting unit assignments**. The detailed assessment identifies five legitimate shared groups, two Saigon Centre groups requiring ground truth, and one previous Vincom exact-match flag corrected by the owner. See [the full review and team decisions](team-decisions-2026-10-15.md), [the preserved supplied assessment](shared-unit-assessment-source.md), and the structured [shared-unit assessment](shared-unit-questions.json). The assessment's official-site/map references are owner-reported and were not independently rechecked here.

The Kooples' `M-04-05` claim is cleared for Polo Ralph Lauren (`M-04,05`); Weekend Max Mara's `M-31-32` is cleared for Karl Lagerfeld (`M31+32`). Giordano retains `B2-55-56`; Vincy has no unit claim. Those cleared claims do not establish the current location/status of The Kooples or Weekend Max Mara. The original [50-row parked-location list](parked-locations.csv) is preserved as owner-confirmed, and the second location-research round is still running.

The owner also reports nine current categories against an eleven-category proposal, four proposed gaps, and 26 “other” records; the counts need a taxonomy decision before reassignment. No VI/EN name pairs or approval ledger exist; reported Highlight copy is Vietnamese-only and remains deferred from publication. Neither mall has a facility roster. Details and exact team decisions are in [the owner review update](team-decisions-2026-10-15.md). The raw owner CSV remains byte-preserved; post-CSV corrections are in the amendment ledger.

## What needs owner/team review

| Review queue | Evidence in this packet | Next decision |
| --- | --- | --- |
| Precise locations | [50 Vincom rows with unknown/blank unit claims](parked-locations.csv) | Verify from current mall/operator evidence or an optional in-person visit. A floor claim may be retained separately; no map marker/region is supplied by this packet. |
| Shared units | Five legitimate groups, two unresolved Saigon Centre group relationships, zero conflicting unit assignments. | Verify B2-K5 and L2-17; use the shared-unit map display notes for the other groups, subject to map-owner geometry review. |
| Map-area links | Current unit claims and shared zones still need evidence-based links to geometry for precise markers. | Match supported units to current region IDs. Group/pin presentation notes are handoff recommendations and need runtime/map-owner implementation. |
| Tenant identity/status | Six explicit removals/merge above; 377 pending candidates | Confirm stable destination vs independent counter/brand identity and actual open/closed/moved status. A removed row alone does not establish a public closure record. |
| Full coverage | Saigon Centre's supplied source omits the department-store counter roster; the source lists the whole mall and independent counters may need separate records | Supply the current counter roster and decide duplicate/multi-floor identity handling for repeated names. |
| Editorial fields | No approved VI/EN review ledger, facilities, mapped areas, category memberships, primary floors or Highlights in this source | Assign reviewers; provide actual source/check date, VI and EN decisions, facilities/taxonomy and primary floor. Highlights stay empty/deferred per owner. |

The original map labels remain reference annotations, not proof of current tenants. The owner’s latest CSV supplies floor and unit claims; where a precise unit is unknown, do not infer it from the map. Owner-supplied research notes are evidence to review, not independently verified findings here.

## Files and validation

- `owner-source.csv`: exact copy of the latest CSV; SHA-256 is in [validation receipt](validation.json).
- `records.json`: 383 offline candidate worksheets, including raw source rows, pending approvals, null editorial review dates, no mapped area IDs and empty Highlights. Six are explicitly excluded from current candidates; none is publication-ready.
- `parked-locations.csv`: 50 unknown/blank Vincom precise-unit claims.
- `shared-unit-questions.json`: owner resolution and historical eight-group extraction; not an open conflict queue.
- `owner-update-2026-10-15-unit-reconciliation.json`: owner corrections for The Kooples, Weekend Max Mara and Giordano/Vincy; see shared-unit assessment for current classifications.
- `input-reconciliation-2026-10-16/`: exact copies of the newly supplied CSV and JSON, the row-level diff and unresolved input decisions.
- `team-decisions-2026-10-15.md`: detailed owner assessment of shared units, taxonomy, language approvals, facilities and ongoing location research.
- `shared-unit-assessment-source.md`: preserved supplied Markdown source.
- `legacy-json-differences.json`: 57 matched differences against the older root Vincom JSON; not a complete lineage comparison.
- `prepare.py`: one-time generator. It refuses to overwrite `owner-source.csv`; its paths refer to the supplied `D:\Midterm` workspace.
- `validation.json`: source hash, counts, preserved public snapshot hashes and known limits.

The existing `validateContent` check passes both unchanged empty/pending public snapshots. The worksheets are deliberately not passed as approved content. The public snapshots remain `directory-pending-2026-10-14-r1`, empty and without `reviewedAt`. Completion of this packet closes content preparation for the supplied CSV revision; issue 0016 and publication remain open until owner/team review and the other issue acceptance gates are complete.

## Owner-review checklist

- [ ] Confirm the 377 pending candidates and six removals/merge; decide independent destination, brand and counter identities.
- [ ] Await the second location-research round for 50 parked units; review evidence and actual check dates before updating location claims. Resolve The Kooples and Weekend Max Mara status/location after their old claims were cleared.
- [ ] Verify Saigon Centre B2-K5 and L2-17 co-location/shop-in-shop relationships with ground truth.
- [ ] Supply the missing Saigon Centre department-store counters and both malls' current facility rosters.
- [ ] Confirm current status, verified floors, primary floors, mapped areas and facility access; include evidence and actual check dates.
- [ ] Approve Vietnamese and English names/descriptions separately with reviewer names and dates.
- [ ] Resolve the nine-current / eleven-proposed taxonomy counts, the four named gaps, and the 26 “other” assignments; approve taxonomy/memberships before reassignment.
- [ ] Provide facility rosters for both malls and approved bilingual names/descriptions; approve English and Vietnamese independently. Provide Highlights later or explicitly approve none.
- [ ] Sign off each mall's completeness/currentness and actual snapshot review date before runtime import/publication.
