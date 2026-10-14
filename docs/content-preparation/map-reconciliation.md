# Supplied lists versus floor maps

Revision **directory-map-reconciliation-2026-10-14-r2**; comparison performed 14 October 2026. This is a technical reference comparison, not editorial approval or a tenant-currentness audit. Owner confirms the Markdown lists are authoritative and maps are outdated; owner will provide Highlights later. Keep Highlights empty/deferred and continue directory preparation independently. The [complete owner checklist](owner-location-checklist.md) and [383-row comparison](all-record-map-comparison.csv) supersede the initial targeted queue below for location review.

**The floor sets agree, but the maps and lists cannot be treated as fully synchronized.** Vincom has direct floor/tenant-label differences. Saigon has matching floor references plus unresolved unit/status/coverage differences. Use the latest list for directory claims; use map outlines as reference geometry. Do not restore old tenants, change a list floor or assign a precise area just because an older map label says otherwise.

## Deliverables and scope

- [floor-claims.json](floor-claims.json): all 383 source occurrences with floor-claim evidence and corresponding map paths; 15-map crosswalk, hashes and geometry revision. Claimed floors are preserved separately from verified floors and approved areas.
- [floor-review-queue.csv](floor-review-queue.csv): spreadsheet-ready source-line review queue, with columns for map observation, resolution and approved area IDs. These review columns intentionally start empty; targeted observations are recorded below, not an exhaustive tenant-by-tenant signoff.
- [reconcile-floors.py](reconcile-floors.py): reproducible extraction from the existing drafts. Run `python docs/content-preparation/reconcile-floors.py --workspace D:/Midterm` from the application directory. Regeneration overwrites the queue: preserve reviewed copies before running again.

All eight Saigon Centre and seven Vincom images were opened and visually inspected. The sweep checks floor-level examples and known changes; it does **not** transcribe/audit every map label, prove absence of a small label, or register destinations to runtime region IDs. No OCR-derived approval, inferred polygon link or asset edit was made.

Saigon: **166/166 table occurrences have explicit source floor claims**, via headings/labels. Vincom: **150/217 have explicit source floor claims**, including four named claims from the introductory note and Sony's floor in descriptive prose; **67/217 remain without an explicit list floor**. No floor is inferred from adjacent Vincom rows or brand-name tokens. Counts are source occurrences, not distinct operating destinations. The explicit Takashimaya B2–L3 range is retained as a range claim, not five independently approved locations.

## Floor-level visual sweep

Saigon images are `Takashimaya/Sơ đồ tầng/saigon-centre-so-do-tang-<floor>-2026-10-01.png`. Vincom images are `Vincom đồng khởi/map/tang-<floor lowercase>.webp`. Exact paths/hashes are in the crosswalk.

| Mall / floor | Observed map examples and comparison | Limit / next action |
| --- | --- | --- |
| Saigon B2 | Annam Gourmet, BreadTalk, Highlands, McDonald's match list floor claims; BOAT NOODLE is marked opening soon | Irvins/llaollao have separated labels despite the same list unit claim; precise units need reconciliation |
| Saigon B1 | G2000, Beauty Box, Owndays, Nespresso agree at floor level; Converse marked opening soon | Winkperry also says opening soon on map but list row does not say so; status remains unresolved |
| Saigon L1 | CHANEL, Louis Vuitton, BOSS, RuNam Boutique and watch brands are labeled on this floor | Many independent department-store counters shown but absent from supplied table roster; shared watch unit does not prove one polygon |
| Saigon L2 | Starbucks, PAUL, Label Lab, Moschino and Marc Jacobs are labeled on L2 | Label Lab and Moschino appear at separate positions despite both claiming L2-17; Marc Jacobs appears only in list notes/anchor description |
| Saigon L3 | adidas, JINS and Crocs match floor claims; Skechers marked opening soon | Dense grouped counter labels do not create independent approved counter records |
| Saigon L4 | UNIQLO, DJI and adidas match floor claims | adidas also appears on L3; owner must decide multi-floor identity versus independently named branches |
| Saigon L5 | Dim Tu Tac, Pepper Lunch and LONGJING labeled here | LONG JING is mentioned as absent from directory in list introduction; map supplies a reference floor but does not prove opening/currentness |
| Saigon L6 | Rooftop Garden and Under Renovation Work labels | No tenant table rows supplied; no claim of current garden access, renovation status or complete absence of tenants |
| Vincom B3 | Winmart B3-02-03 and Pepper Lunch B3-28D agree with list | Breadtalk B3-15A retained on map despite list removal note; no precise unit for new Yamazaki supplied |
| Vincom B2 | Starbucks B2-02-02A agrees | Tini World B2-18A/Pablo B2-17 retained on map despite removal note; moved brands' new B2 unit claims unresolved |
| Vincom B1 | Adidas Originals B1-56 agrees | Crocs B1-17A-B and An Phước B1-49 contradict list note moving them to B2 |
| Vincom L1 | Innisfree L1-45, Dior L1-51 and other beauty units agree | ZARA and Massimo Dutti have map floor labels but no explicit floor in their corresponding unnumbered list rows; retain as reference-only candidate floor |
| Vincom M | Tommy Hilfiger M-01-02A and H&M M-15-19 agree | Studio 77/Sony both claim lot 7 in the list; map labels Studio 77 M-07 only, so do not assign Sony that shape automatically |
| Vincom L2 | H&M L2-02, Pull & Bear L2-03 and Stradivarius L2-06 agree | Valentino Creations L2-07 contradicts the list note moving it to B2 |
| Vincom L3 | CGV L3-01, Dookki L3-06-07 and Haidilao L3-08 agree | King BBQ Buffet L3-02-03-04, Xing Fu Tang L3-K2 and Elite Fitness L3-10 retained despite list removal note |

“Agree” means the observed reference annotation agrees with the supplied claim, not that a floor or polygon is editorially approved. Spelling variants require review; they are not automatically separate brands.

## Specific resolution queue

| Item | Latest list evidence | Map observation | Required resolution |
| --- | --- | --- | --- |
| Vincom Crocs / An Phước | Intro line 9 says moved to B2; rows 107/108 have no unit | B1 legend still lists B1-17A-B / B1-49 | Preserve B2 claim from explicit note. Confirm B2 unit/area; suppress old B1 marker in any future approved import |
| Vincom Valentino Creations | Intro line 9 says moved to B2; row 109 has no unit | L2 legend lists L2-07 | Preserve B2 claim; confirm new unit/area |
| Vincom removed labels | Intro line 9 names BreadTalk, TiNiWorld, Pablo, King BBQ Buffet, Xing Fu Tang, Elite Fitness as no longer listed | Those names are visible on B3/B2/L3 maps | Do not import them from maps. Absence from list alone is not a closed-status approval |
| Vincom King BBQ identity | Intro line 9 removes **King BBQ Buffet**; row 23 retains **King BBQ B3-10B** | B3 labels King BBQ B3-10B; L3 separately labels King BBQ Buffet | These may be different branches/concepts, rather than a contradictory row. Confirm identity and status separately; do not delete B3 King BBQ by fuzzy name matching |
| Vincom Yamazaki | Intro line 9 supplies B3; row 42 lacks a unit | B3 reference layout has older bakery annotations | B3 floor claim can be reviewed independently; no replacement unit/polygon inferred |
| Vincom Sony / Studio 77 | Row 235 says Sony floor M, lot 7; row 225 says Studio 77 M-07 | M-07 map label is Studio 77 | Determine succession, shared occupancy or incorrect claim; keep distinct candidates and no automatic shared-area approval |
| Saigon Irvins / llaollao | Rows 28/29 both B2-K5 | Irvins label near escalator/right circulation; llao llao label near NAGOCHA on opposite side | Same-floor agreement, ambiguous unit relationship. Do not merge into a shared area based on K5 |
| Saigon Label Lab / Moschino | Rows 106/113 both L2-17 | Separate labels/positions on L2 map | Confirm unit identifiers/area ownership rather than infer shared geometry |
| Saigon Winkperry | Row 55 B1-4A, no planned-opening qualifier | B1 label Winkperry (Opening Soon) | Preserve latest list as baseline; confirm operating status before setting open/closed/moved |
| Saigon LONG JING | Intro line 9 announces opening but says absent from directory | LONGJING labeled on L5 | Add to candidate queue only after named-floor/status evidence is resolved; map label alone does not approve opening |
| Saigon Marc Jacobs | Intro line 9 and row 93 describe move into Takashimaya L2 | Marc Jacobs label within department-store portion of L2 | Floor-reference agreement. Request its independent counter record, approved bilingual copy and area evidence |

Source lines refer to the unchanged owner-supplied Markdown files. Their hashes are preserved in the [reference inventory](supplied-reference-inventory.json). Original maps remain unchanged; do not paint over or rewrite them to hide differences.

## Import direction for runtime owners

1. Preserve owner-supplied floor claims now; review them without requiring perfect map synchronization for every basic listing.
2. For an approved destination whose floor is confirmed but area remains uncertain, use `floor-confirmed` with `areaIds: []`. It can be searchable and open details on that floor without a false marker. Do not label an unreviewed source claim as an approved location.
3. For conflicts, resolve using the latest supplied list plus owner/checked unit evidence. Map labels remain reference annotations; candidate geometry is not current occupancy proof. Approve `area-confirmed` only after reviewing actual region IDs on the matching floor/revision.
4. Keep closed/moved branch identities distinct and preserve stable links. Planned openings do not fit open/closed/moved by assumption. Missing list floors stay in review; a map-only floor may be proposed but requires owner acceptance.
5. Keep Highlights empty until the owner supplies them. Their deferral does not block preparing complete categories/basic directory records; release must show the truthful missing-Highlights state until editorial selections are approved.

Checks: all 383 records trace back to supplied source lines; all extracted floor tokens belong to the supported mall floor set; all 15 map hashes match the prior inventory; approved floors/areas/dates remain empty. The existing `validateContent` still passes for both public empty/pending snapshots. Preliminary parsing exposed accidental floor-M interpretation in brand names; label parsing now reads only parenthesized location text. The final count is 150/67, superseding the preliminary 151/66. CK Jeans' location is taken from its second parenthesis B1-54 rather than its first brand-expansion parenthesis. No public records, runtime files, geometry or assets changed.
