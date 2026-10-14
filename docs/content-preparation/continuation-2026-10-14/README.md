# 0016 continuation: source-backed basic-listing review

Revision **directory-continuation-2026-10-14-r1**. Prepared 14 October 2026. This preparation date is not an editorial review date. The owner's supplied Markdown remains authoritative; Highlights remain deferred.

This packet joins every supplied source occurrence to its floor evidence and prior map comparison, adds provisional stable-ID and bilingual name-only proposals, and puts editable decisions in one queue. It avoids requiring a full English translation of unreviewed product claims before basic directory review. The team must explicitly approve keeping introductions empty and approve names independently in both languages. None of these proposals is a public snapshot.

| Deliverable | Review use |
| --- | --- |
| [decision-queue.csv](decision-queue.csv) | 383 source occurrences sorted by immediate attention; source fields prefilled, decisions/reviewers/dates blank |
| [review-cards.json](review-cards.json) | 383 complete source rows, supplied VI prose/homepage cells, claimed floors/evidence, historical map notes, proposed VI/EN names and intentionally empty introductions |
| [identity-proposals.json](identity-proposals.json) | 376 exact-name groups with provisional IDs; no merge approved |
| [review-decisions.md](review-decisions.md) | Short batch review order and decisions that require people |
| [validation.json](validation.json) | Counts, input/public-snapshot hashes, source fidelity and pending-field receipt |
| [prepare-continuation.py](prepare-continuation.py) | Reproducible preparation and read-only `--verify-only`; refuses to overwrite existing outputs |

## Review order

| Batch | Occurrences | Action |
| --- | --- | --- |
| Priority 1 | 67 Vincom | Supply explicit current floors before basic listing eligibility; historical map clues stay reference-only |
| Priority 2 | 21 | Repeated exact names, selected relocation/occupancy/identity questions, or explicitly planned openings; see the existing complete location checklist as well |
| Priority 3 | 295 | Review source-backed basic listings for status, floors, names, primary floor, taxonomy and intentional empty introductions |

Priorities are mechanical attention flags, not a factual risk ranking or exhaustive ambiguity detector. Shared-unit/counter decisions in the [existing location checklist](../owner-location-checklist.md) still apply to all batches. **316 occurrences have source floor claims**, including 166/166 Saigon and 150/217 Vincom. They are not 316 approved operating destinations. A source-backed basic listing can become eligible for a reviewed `floor-confirmed` location with no area IDs; a missing precise unit does not require a fabricated marker or delay independent language preparation. Current status, taxonomy, reviewed floors and both language approvals remain necessary.

The four repeated exact-name groups are Takashimaya (five occurrences), adidas in Saigon (two), ZARA in Vincom (two), and H&M in Vincom (two). Claimed floor unions preserve evidence without merging destinations or transferring evidence to an occurrence that lacks it. In particular, Vincom ZARA's unlocated occurrence stays unlocated even though another occurrence claims M. Exact-name grouping does not catch spelling variants; Adidas Original/Adidas Originals and combined Mujosh & Ted Baker remain explicit identity review subjects. IDs are mall-scoped proposals and have zero within-mall collisions; they are not approved stable links. After splitting a group, choose distinct reviewed IDs before import.

Proposed display names remove Markdown punctuation escapes (for example `H\&M` becomes `H&M`), while the complete raw source row and label remain verbatim. The same supplied official-form name is proposed in both locales; this is not English editorial approval or a checked official spelling. Rich supplied Vietnamese descriptions remain evidence beside the proposal; empty bilingual descriptions are a deliberate basic-listing option awaiting review. Descriptive claims have not been translated, fact-checked or silently discarded from the source ledger.

Edit the decision columns in a **reviewed copy** of the CSV; preserve the generated proposals and input receipt. Complete one named reviewer/date/decision per language. Review dates must be dates people actually performed the review. `source_line`, `candidate_ref` and source claims are immutable evidence. `candidate_ref` is not a destination ID. Group memberships, primary floor, operating status and category assignments need explicit decisions; no default values have been approved.

## Validation and preservation

Performed 14 October 2026:

- 383 unique source rows joined to the existing floor-claim and map-comparison records; each raw row matches its original Markdown line.
- All 62 supplied-reference SHA-256 values match the prior inventory. Existing drafts, comparison, claims, inventory and both public snapshots are recorded in the receipt.
- 383 pending cards retain empty verified floors/locations/categories, null primary floor/status, and no reviewer/date/approval; no claimed floor is promoted into a verified one.
- 376 provisional groups; four repeated exact-name groups and zero within-mall ID collisions.
- Both unchanged empty/pending public snapshots pass the existing `validateContent` against their current floor geometry. This validates structure, not editorial approval or completeness.
- Read-only regeneration verification passes and public pending data remains empty with no review date.

From `implementation/mall-visitor`:

```powershell
python docs/content-preparation/continuation-2026-10-14/prepare-continuation.py --workspace D:/Midterm --verify-only
```

No live tenant research, new map inspection, content import, application/asset revision, browser/release acceptance, site propagation, deployment or publication occurred. Source/map comparison evidence is reused and explicitly historical. Exterior **photo-polish-2026-10-12-delivery-r2**, floors **source-palette-schematic-2026-10-13-r2** and public **directory-pending-2026-10-14-r1** remain unchanged. Issue 0016 remains in-progress / ready-for-human, historical coverage 47.9% unchanged. The coordinator owns updates to issue 0016 and the progress index.

Authority: [issue 0016](../../../../../docs/issues/0016-visitor-discovery-integration.md), [canonical specification](../../../../../docs/superpowers/specs/2026-10-11-mall-visitor-experience-spec.md), [import contract](../../directory-import.md), and [prior preparation/reconciliation](../README.md).
