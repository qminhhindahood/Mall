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

## Owner unit reconciliation update — 15 October 2026

The owner confirms **zero conflicting unit assignments remain** and only **two legitimate shared units**. At the owner's instruction, this packet does not name those two units. Six of the eight groups previously produced by exact-string matching are resolved; the old groups remain in [shared-unit-questions.json](shared-unit-questions.json) as historical extraction evidence only, not as an open conflict queue.

- The Kooples' `M-04-05` claim is cleared for Polo Ralph Lauren (`M-04,05`) per an ACFC official locator reported by the owner.
- Weekend Max Mara's `M-31-32` claim is cleared for Karl Lagerfeld (`M31+32`) per an ACFC official source reported by the owner.
- Giordano retains `B2-55-56`; Vincy has no unit claim. This is not a collision.

The raw CSV's SHA-256 is unchanged and remains preserved as the earlier input. These owner corrections are reflected in `records.json` and [the amendment ledger](owner-update-2026-10-15-unit-reconciliation.json). The two cleared claims do not establish the current unit or open/closed/moved status of The Kooples or Weekend Max Mara; keep those decisions pending. The original [50-row parked-location list](parked-locations.csv) is preserved as owner-confirmed; the two newly cleared claims are tracked separately rather than silently changing that reviewed list. No ACFC source was independently checked during this documentation update.

## What needs owner/team review

| Review queue | Evidence in this packet | Next decision |
| --- | --- | --- |
| Precise locations | [50 Vincom rows with unknown/blank unit claims](parked-locations.csv) | Verify from current mall/operator evidence or an optional in-person visit. A floor claim may be retained separately; no map marker/region is supplied by this packet. |
| Unit reconciliation | Owner confirms zero conflicting unit assignments; two legitimate shared units are intentionally unnamed. The Kooples and Weekend Max Mara claims are cleared as above; Giordano/Vincy is not a collision. | Keep old automated groups as history only. No conflicting unit assignment remains open. Confirm the current status/location of the two brands whose claims were cleared. |
| Map-area links | Unit claims and the owner-confirmed shared units still need evidence-based mapping to current geometry where the team wants precise markers. | Match only supported units to current region IDs; don't infer map ownership from a unit collision report. |
| Tenant identity/status | Six explicit removals/merge above; 377 pending candidates | Confirm stable destination vs independent counter/brand identity and actual open/closed/moved status. A removed row alone does not establish a public closure record. |
| Full coverage | Saigon Centre's supplied source omits the department-store counter roster; the source lists the whole mall and independent counters may need separate records | Supply the current counter roster and decide duplicate/multi-floor identity handling for repeated names. |
| Editorial fields | No approved VI/EN review ledger, facilities, mapped areas, category memberships, primary floors or Highlights in this source | Assign reviewers; provide actual source/check date, VI and EN decisions, facilities/taxonomy and primary floor. Highlights stay empty/deferred per owner. |

The original map labels remain reference annotations, not proof of current tenants. The owner’s latest CSV supplies floor and unit claims; where a precise unit is unknown, do not infer it from the map. Owner-supplied research notes are evidence to review, not independently verified findings here.

## Files and validation

- `owner-source.csv`: exact copy of the latest CSV; SHA-256 is in [validation receipt](validation.json).
- `records.json`: 383 offline candidate worksheets, including raw source rows, pending approvals, null editorial review dates, no mapped area IDs and empty Highlights. Six are explicitly excluded from current candidates; none is publication-ready.
- `parked-locations.csv`: 50 unknown/blank Vincom precise-unit claims.
- `shared-unit-questions.json`: owner resolution and historical eight-group extraction; not an open conflict queue.
- `owner-update-2026-10-15-unit-reconciliation.json`: owner corrections for The Kooples, Weekend Max Mara, Giordano/Vincy and the zero-conflict/two-shared-unit decision.
- `legacy-json-differences.json`: 57 matched differences against the older root Vincom JSON; not a complete lineage comparison.
- `prepare.py`: one-time generator. It refuses to overwrite `owner-source.csv`; its paths refer to the supplied `D:\Midterm` workspace.
- `validation.json`: source hash, counts, preserved public snapshot hashes and known limits.

The existing `validateContent` check passes both unchanged empty/pending public snapshots. The worksheets are deliberately not passed as approved content. The public snapshots remain `directory-pending-2026-10-14-r1`, empty and without `reviewedAt`. Completion of this packet closes content preparation for the supplied CSV revision; issue 0016 and publication remain open until owner/team review and the other issue acceptance gates are complete.

## Owner-review checklist

- [ ] Confirm the 377 pending candidates and six removals/merge; decide independent destination, brand and counter identities.
- [ ] Review the 50 parked precise-location questions against current evidence; resolve The Kooples and Weekend Max Mara current status/location after their old claims were cleared.
- [ ] Supply the missing Saigon Centre department-store counters and both malls' current facility rosters.
- [ ] Confirm current status, verified floors, primary floors, mapped areas and facility access; include evidence and actual check dates.
- [ ] Approve Vietnamese and English names/descriptions separately with reviewer names and dates.
- [ ] Approve category taxonomy/memberships; provide Highlights later or explicitly approve none.
- [ ] Sign off each mall's completeness/currentness and actual snapshot review date before runtime import/publication.
