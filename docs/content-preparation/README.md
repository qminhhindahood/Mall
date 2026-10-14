# Bilingual directory preparation — both malls

Preparation revision: **directory-preparation-2026-10-14-r1**. Prepared 14 October 2026; this is a workflow delivery date, **not an editorial review date**. All records remain pending outside `data/malls/` and `public/`. No current tenant, floor, unit, approval or Highlight is established by this delivery.

Authority: [issue 0016](../../../../docs/issues/0016-visitor-discovery-integration.md), [canonical visitor specification](../../../../docs/superpowers/specs/2026-10-11-mall-visitor-experience-spec.md), [existing import contract](../directory-import.md), and [build validator](../../src/data/content.ts). The `takashimaya` site covers the whole Saigon Centre mall, including independent department-store brands/counters and surrounding retail tenants.

Owner clarification received 14 October 2026: **both supplied Markdown lists are the owner's most up-to-date lists**. Use them as the current supplied directory baseline ahead of older map labels or historical research. This resolves which source version to use; it does not supply an editorial review date, independent bilingual approvals, precise geometry links or Highlight selections. The confirmation date is a communication date, not `reviewedAt`. Remaining checks reconcile and complete this baseline rather than request a newer list without a specific conflict.

Follow-up: **Highlights are deferred; the owner will provide them later.** The documents already supply floor claims, which are now extracted independently in [floor claims and map reconciliation](map-reconciliation.md). All 15 map images were visually inspected; floor sets match but reference tenant/unit labels are not fully synchronized. Preserve list floor claims separately from area certainty, and continue basic-listing preparation while exact markers remain unresolved. The reconciliation packet includes a 383-occurrence review queue and specific conflicts, without altering the original preparation r1 snapshots.

The owner's subsequent clarification makes **Markdown authoritative and maps outdated**. Use the [complete location checklist](owner-location-checklist.md), [383-record comparison spreadsheet](all-record-map-comparison.csv) and [map-only annotation checklist](map-only-annotations.md) for reconstruction review. Final extraction records 150 Vincom occurrences with explicit floor claims and 67 without them; the preliminary 151/66 count is superseded. Rebuild content labels/occupancy from owner resolutions; boundary changes require current shape evidence and belong to the map/runtime owners.

## Review packet

| File | Purpose |
| --- | --- |
| [record-template.json](record-template.json) | Blank destination, mapped area, facility, category, proposed Highlight and source-evidence worksheets, with separate VI/EN approvals |
| [saigon-centre.draft.json](saigon-centre.draft.json) | 166 verbatim supplied table occurrences with pending Vietnamese copy and source lines |
| [vincom-dong-khoi.draft.json](vincom-dong-khoi.draft.json) | 217 verbatim supplied table occurrences with pending Vietnamese copy and source lines |
| [supplied-reference-inventory.json](supplied-reference-inventory.json) | 62 supplied files with path, bytes, SHA-256, role and no editorial review date |
| [validation.md](validation.md) | Existing validation and extraction receipts; limits of this delivery |
| [prepare.py](prepare.py) | Reproducible offline extraction; never writes public snapshots |

Drafts use an **offline worksheet format**, not the application's `DirectorySnapshot` type. Null means unknown/not supplied; empty verified lists mean nothing verified. Do not cast these worksheets into the import type or set approvals to bypass validation. `candidateRef` identifies a source occurrence, not a destination ID. Raw labels, rows, homepage cells, notes and section headings are preserved as evidence. English remains null; Vietnamese is supplied copy, not approved copy. Markdown escapes in source names must be cleaned during editorial review without changing official brand spelling.

Regenerate initial drafts with `python docs/content-preparation/prepare.py --workspace D:/Midterm` from the application directory. **This overwrites generated drafts**: use it only before manual review, or generate in a separate copy and reconcile against reviewed work. Keep revision-specific reviewed packets rather than overwrite approval history.

## Supplied reference inventory and verification queue

| Mall | Supplied references | What they support / what remains |
| --- | --- | --- |
| Saigon Centre | `Takashimaya/takashimaya list.md`; 8 full-mall maps B2, B1, L1–L6; 23 exterior/interior visual references | List supplies names, Vietnamese descriptions and claimed floors/units. It claims October 2026 currency and official-directory comparison but gives no named reviewer, exact review date, independent English approval or per-record checked evidence. Maps support reference annotations/geometry, not current occupancy. |
| Vincom Center Đồng Khởi | `Vincom đồng khởi/vincom center list.md`; 7 maps B3, B2, B1, L1, M, L2, L3; 22 exterior/interior visual references | List supplies names, Vietnamese descriptions, unit claims and some homepage links. It claims an October 2026 update but does not supply actual reviews/approvals. Tables have no floor headings; rows without explicit floor/unit remain unresolved. Do not infer their floor from adjacent rows. |

Inventory hashes identify the files inspected in this packet; no originals were modified. The historical [15-map inventory](../../../../docs/research/2026-10-12-floor-reference-inventory.json) remains revision evidence. Saigon map filename `2026-10-01` is a filename date, not a verified capture, tenant-check or editorial-review date. Image dates, file timestamps and preparation dates never fill `reviewedAt`.

The [2026-10-05 asset assessment](../../../../docs/research/asset-audit/assessment.md) reports historical official Saigon Centre floor/store/department-store API observations (164 general and 199 department-store CMS records). These are historical research counts, not an audited current tenant total or supplied approved directory. No live refresh was performed here. Exterior/interior photos establish only their visible reference content; they do not prove current shop operations, exact units or public amenity access.

Team verification priorities:

- **Coverage and identity:** reconcile every source occurrence into one stable ID per independently discoverable destination. Saigon repeats Takashimaya five times and adidas twice; Vincom repeats ZARA and H&M. Check whether repeated names represent one multi-floor destination or distinct independently named branches. Preserve counters independently, even where geometry is shared. Saigon's list explicitly omits about 210 department-store brands as a source claim: request the actual counter roster rather than treating Takashimaya as complete coverage.
- **Shared areas:** Saigon claims Irvins/llaollao at B2-K5, several watch brands/The Hour Glass at L1-10, and Label Lab/Moschino at L2-17. Vincom claims Studio 77 at M-07 and Sony at floor M, lot 7 in descriptive text. Check coexistence, succession or erroneous labels before assigning geometry. A shared unit claim does not authorize a shared mapped area.
- **Changes and planned openings:** Saigon claims BOAT NOODLE, Converse and SKECHERS are planned; LONG JING is announced but absent from the directory; Marc Jacobs moved into Takashimaya L2. Vincom notes BreadTalk, TiNiWorld, Pablo, King BBQ Buffet, Xing Fu Tang and Elite Fitness are absent from its list, and Crocs/An Phước/Valentino Creations changed floors. Absence is not proof of closure. Source notes preserve these claims even when there is no table record. Verify current status and effective move evidence; do not map “planned” to `open` or `closed` by guesswork.
- **Floors and map links:** verify each occupied floor separately, then choose primary floor editorially. Supported import IDs: Saigon B2/B1/L1/L2/L3/L4/L5/L6; Vincom B3/B2/B1/L1/M/L2/L3. Takashimaya's source range B2–L3 remains a claim until every floor is checked. Source claims about L6's use/absence of tenants need confirmation. Unit strings are not region IDs.
- **Language and factual copy:** check official name spelling, each supplied descriptive/product claim, superlatives, opening dates and “first in Vietnam” claims. Draft English from supported facts and obtain separate VI/EN review. Brand homepages may support brand facts, but do not prove presence at this mall; retain the link as supplied until checked. “Không có” means no link supplied, not proof that no homepage exists.
- **Facilities and taxonomy:** no structured, approved facility roster, area mapping, category memberships or Highlights were supplied. Obtain amenity names, floors, precise-location evidence where available and access restrictions. Keep commercial service counters separate from visitor facilities. Ask the team to approve taxonomy and memberships.

## Authoring and approval workflow

1. Content owner assigns mall-specific completeness/currentness reviewers, VI and EN reviewers, and a maintenance owner. Attach checked mall/operator evidence with source path/URL, line/page, checker and actual check date. Capture/publication dates remain separate from the date a person reviewed the record. Record conflicting claims and their resolution.
2. Resolve identities and duplicates. Set `recordKind` to destination/brand/counter as appropriate; optional parent relationships are editorial context, never a substitute for an independent record. Choose stable lowercase hyphenated IDs. Keep one ID across languages, categories and verified floors. Preserve reviewed old-link redirects in the packet for runtime owners.
3. Verify current `open`, `closed` or `moved` status. Unknown/planned entries remain pending. Retain move-from/to and effective-date evidence in the worksheet; do not invent a new precise area or opening date. Ask runtime owners to review closed/moved presentation and redirect handling before import if richer relocation behavior is needed.
4. Add only verified floors to `verifiedFloors`. Set `primaryFloor` to one of them; it is an editorial default, not an asserted main entrance. Add one location for each floor. Use `floor-confirmed` with `areaIds: []` when the floor alone is supported. Use `area-confirmed` only with reviewed same-floor mapped areas and evidence. Unknown floors cannot become public basic listings.
5. Review mapped areas against geometry **source-palette-schematic-2026-10-13-r2**. Record floor, region IDs and geometry revision; regions must exist and have one area owner. Many independent destinations may share an area. A destination may reference several areas. Facilities get independent records, no commercial categories, and no marker for an unverified precise location. Floor-confirmed facilities may omit `areaId`.
6. Review names and descriptions independently in VI/EN with actual reviewer/date/decision. A supported basic listing may have empty descriptions in both languages when the team approves its names, categories, status and location; missing richer text is not permission to fabricate it. Record approval of this intentional absence.
7. Approve category names and memberships; put primary membership first. Specification proposals are Restaurants, Cafés, Bakeries, Fashion, Beauty, Accessories, Groceries & marts, with Desserts, Kids, Entertainment and Services as additional proposals. These are taxonomy proposals, not supplied mall facts. Fill `proposedHighlight` only when a team member nominates a destination/category/verified floor with a rationale. Record selection and separate language reviews. Default remains **no Highlights**.
8. Final content owner signs off completeness/currentness and the actual snapshot review date separately for each mall. Convert approved records into a separate candidate `DirectorySnapshot`; retain the worksheet/evidence and decisions. Publication remains gated by implementation validation, both-mall/both-locale acceptance and owner release review.

## Conversion to the existing content contract

| Worksheet | Approved import field / rule |
| --- | --- |
| `destinationId` / destination `id` | `Destination.id`; independent stable ID, no occurrence IDs |
| `verifiedFloors`, `primaryFloor` | `floors`, `primaryFloor`; primary belongs to verified floors |
| VI/EN names and descriptions | `name`, `description`; names nonempty, approved missing descriptions become empty strings |
| `categories` | Existing category IDs; first is primary, later entries are reviewed additional memberships |
| `locations` | Exactly one per verified floor with `floorId`, `certainty`, `areaIds`, evidence `source` |
| Evidence and independent approval ledger | `review.source`, real `review.reviewedAt`, named `review.reviewedBy`, `review.languages.vi/en: true` only after approval; destination `reviewedAt` must match its review |
| Mapped area | `id`, `floorId`, nonempty supported `regionIds`, bilingual `name`, `review` |
| Facility | `id`, bilingual `name`, `floorId`, optional verified `areaId`, `review`; omit unknown area field |
| Approved Highlight | `destinationId`, `categoryId`, `floorId`, `review`; destination must be open and belong to that category/floor |
| Snapshot signoff | Correct `mallId`, explicit new `revision`, `approval: approved`, actual `reviewedAt` |

Do not export worksheet-only fields (`recordKind`, parent, homepage, richer approval ledger, move evidence, redirects, rationale, geometry revision) into runtime without coordinating with its owners. The current contract supports status values but has no structured relocation/redirect/homepage fields. Preserve those decisions here for them. No runtime contract changes are part of this delivery.

The validator rejects **any nonempty pending public snapshot** and requires both language approvals for each imported record. It checks referential/geometry consistency, not factual currentness, real calendar dates, completeness or reviewer authority. A passing validator cannot replace content review. Keep both current public snapshots empty/pending until the approved import is ready; never enable fixtures to make draft content appear approved.

## Concise owner-review checklist

- [ ] Confirm full-mall roster, independent counters and stable-ID/duplicate decisions for both malls.
- [ ] Supply checked floors/status/moves, primary-floor choices, shared-area/region mappings and facilities; resolve conflicting labels.
- [ ] Supply English copy and approve VI/EN names/descriptions independently, with real names and dates.
- [ ] Approve taxonomy/memberships and explicitly nominate Highlights or approve an empty selection.
- [ ] Sign mall-specific completeness/currentness, actual snapshot review dates and maintenance ownership.
- [ ] Hand approved packet to runtime owners for import/validation and bilingual browser acceptance, then owner release review.
