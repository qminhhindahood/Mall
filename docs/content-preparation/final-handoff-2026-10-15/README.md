# Final owner directory reconciliation — 15 October 2026

**Preparation delivered; content remains pending and unpublished.** This packet preserves the latest supplied `D:\Midterm\all-record-map-comparison (1).csv` byte-for-byte and turns it into a review queue for both malls. It does not create an approved `DirectorySnapshot`, change public content, or infer editorial review dates or language approvals.

The source has 383 candidate occurrences: 166 Saigon Centre and 217 Vincom. Six rows explicitly marked `REMOVED` are excluded from current candidates (Boost Juice, Phúc Long, Cocolux, CK Jeans merged into Calvin Klein, Letitia and HLA). The other 377 remain pending basic-listing candidates. This is a preparation count, not a verified current tenant total. The owner CSV is a rebuilt file with new source references; only 75 rows retain a `source_line` value. Preserve the raw rows and do not assume the rebuilt IDs or absent source lines are the old ledger's original lineage. The referenced `all-record-map-comparison-REBUILD-NOTES.md` was not supplied.

## Owner decisions reflected

- Vincom Crocs: **B2-49**.
- Vincom Valentino Creations: **L2-07**; this latest owner decision supersedes the older B2 directory/map claim.
- Vincom Sony: **B1-21**, based on owner-supplied research in the latest CSV. This supersedes the earlier “unknown” decision. The research was not independently rechecked in this handoff.
- Vincom An Phước: **B2-01C**; the prior B1-49 claim is dropped.
- Vincom Adidas Original / Home of Sport: **B2**, without a unit claim; this is distinct from Adidas Originals at B1-56. The latest CSV name is “Adidas”; preserve the distinction during identity review.
- Other latest changes include Date Nariya, Langfarm, Kichi Kichi, Seoul Garden, KyoHananari, WatchMe and Sâm Geumsang unit/status revisions. See the preserved source rows and [legacy JSON differences](legacy-json-differences.json).

The prior Vincom JSON is older and does not agree with the newest CSV on all details. The 57 matched differences are retained in `legacy-json-differences.json`; do not use that old JSON to overwrite the latest owner decisions. In particular, it still contains older unit claims for locations now cleared by the owner.

## What needs owner/team review

| Review queue | Evidence in this packet | Next decision |
| --- | --- | --- |
| Precise locations | [50 Vincom rows with unknown/blank unit claims](parked-locations.csv) | Verify from current mall/operator evidence or an optional in-person visit. A floor claim may be retained separately; no map marker/region is supplied by this packet. |
| Shared unit strings | [8 groups with equal normalized unit claims](shared-unit-questions.json) | Decide whether these are shared counters/areas, aliases, duplicates, or transcription issues. Shared unit text does not prove a shared mapped area. |
| Range and alias overlaps | Examples in source include Vincom Karl Lagerfeld `M31+32` / Weekend Max Mara `M-31-32`, Giordano `B2-55-56` / Vincy `B2-55`, and Saigon Centre UNIQLO `L4-12-22,26-36` alongside other L4 claims. | Review ranges against current directory evidence and the maps. The equal-string queue is not a complete overlap detector. |
| Tenant identity/status | Six explicit removals/merge above; 377 pending candidates | Confirm stable destination vs independent counter/brand identity and actual open/closed/moved status. A removed row alone does not establish a public closure record. |
| Full coverage | Saigon Centre's supplied source omits the department-store counter roster; the source lists the whole mall and independent counters may need separate records | Supply the current counter roster and decide duplicate/multi-floor identity handling for repeated names. |
| Editorial fields | No approved VI/EN review ledger, facilities, mapped areas, category memberships, primary floors or Highlights in this source | Assign reviewers; provide actual source/check date, VI and EN decisions, facilities/taxonomy and primary floor. Highlights stay empty/deferred per owner. |

The original map labels remain reference annotations, not proof of current tenants. The owner’s latest CSV supplies floor and unit claims; where a precise unit is unknown, do not infer it from the map. Owner-supplied research notes are evidence to review, not independently verified findings here.

## Files and validation

- `owner-source.csv`: exact copy of the latest CSV; SHA-256 is in [validation receipt](validation.json).
- `records.json`: 383 offline candidate worksheets, including raw source rows, pending approvals, null editorial review dates, no mapped area IDs and empty Highlights. Six are explicitly excluded from current candidates; none is publication-ready.
- `parked-locations.csv`: 50 unknown/blank Vincom precise-unit claims.
- `shared-unit-questions.json`: eight equal-string shared-unit groups for manual review.
- `legacy-json-differences.json`: 57 matched differences against the older root Vincom JSON; not a complete lineage comparison.
- `prepare.py`: one-time generator. It refuses to overwrite `owner-source.csv`; its paths refer to the supplied `D:\Midterm` workspace.
- `validation.json`: source hash, counts, preserved public snapshot hashes and known limits.

The existing `validateContent` check passes both unchanged empty/pending public snapshots. The worksheets are deliberately not passed as approved content. The public snapshots remain `directory-pending-2026-10-14-r1`, empty and without `reviewedAt`. Completion of this packet closes content preparation for the supplied CSV revision; issue 0016 and publication remain open until owner/team review and the other issue acceptance gates are complete.

## Owner-review checklist

- [ ] Confirm the 377 pending candidates and six removals/merge; decide independent destination, brand and counter identities.
- [ ] Review the 50 precise-location questions, eight shared-unit groups, and range/alias overlaps against current evidence.
- [ ] Supply the missing Saigon Centre department-store counters and both malls' current facility rosters.
- [ ] Confirm current status, verified floors, primary floors, mapped areas and facility access; include evidence and actual check dates.
- [ ] Approve Vietnamese and English names/descriptions separately with reviewer names and dates.
- [ ] Approve category taxonomy/memberships; provide Highlights later or explicitly approve none.
- [ ] Sign off each mall's completeness/currentness and actual snapshot review date before runtime import/publication.
