# Private effective integration candidate r2 — 18 October 2026

Revision **integration-candidate-2026-10-18-r2** preserves r1 and the original r4 artifacts. [Owner decisions](owner-decisions.json) record the exact statements **“r4 geometry accept all”** and **“Approve no-photo and no-marker treatment for unresolved records.”**, decision date **2026-10-18**, project owner as conversation participant, Codex as recorder. These are actual owner decisions, not inferred technical acceptance.

All **42 geometry proposals** now have explicit scoped owner approval in the new effective candidate: seven existing-region reuses and 35 new candidates. Geometry-only acceptance leaves the duplicated B2-K5/L2-17 identities, shared-area/parent relationships and current occupancy separate. Original r4 ledgers and polygons retain their historical false approval flags and hashes; their geometry is unchanged. The new ledger supersedes their pending geometry decision state only.

All 371 identities currently lack approved media, so the owner's unresolved-media policy selects **no photo**, without granting image rights or branch/currentness approval. The 128 original precise-location gap occurrences retain null region IDs and owner-approved **no-marker** treatment with floor/list access; their missing evidence remains recorded. The expanded 191-location baseline is historical and distinct. This treatment does not resolve the physical locations.

No new copy, roster, category/facility or independent VI/EN reviewer approval was given. The owner asked for copy context. Meat & Meet's existing narrow wording acceptance alone persists; the three latest null holds retain precedence and 27 neutral proposals remain unapproved. Every overall record approval/publication approval remains false.

## Public integration boundary

`src/data/content.ts` requires pending snapshots to contain no records and requires actual source/reviewer/date and both VI/EN approvals for published content. That contract remains enforced. Owner geometry acceptance alone supplies none of the missing roster/identity/language review metadata. A geometry-only destination-directory import cannot satisfy it truthfully. The 35 new polygons remain `candidateRegions` in the frozen source review format. The opt-in private research build promotes their exact contours into its own geometry payload, alongside all 641 preserved original regions; normal public and synthetic fixture builds keep the original geometry. Public directory snapshots therefore stay empty/pending, and public floor geometry remains unchanged.

The application research-only overlay (`INCLUDE_TEST_FIXTURES=research`) now uses the accepted r4 geometry and scoped no-marker policy through actual Discovery list/map routes. It preserves existing 306 research identities/current text, omits photos, and never imports unapproved copy proposals. Research banners are bilingual and distinguish accepted geometry from pending roster/VIEN review. The public validator is unchanged.

A separate [private geometry reader](review.html) displays the exact 42 accepted shapes and lists their source identities. It is clearly labeled private and incomplete, excludes all photos and unresolved markers, and cannot be mistaken for an approved public roster. This supplies a concrete geometry review surface without bypassing the public validator. Full application rendered acceptance and release remain independent.

## Reproduction and evidence

From the app checkout, run `python -X utf8 docs/content-preparation/integration-candidate-2026-10-18-r2/prepare.py`, then `python -X utf8 docs/content-preparation/integration-candidate-2026-10-18-r2/build-review.py`. [Source hashes](source-hashes.json), [manifest](manifest.json) and [integrity receipt](integrity.json) bind the exact decision/source inputs and emitted private JSON. **580 assembly invariants pass**, and two unchanged JSON rebuilds match byte-for-byte. The generator fails closed if source hashes change; create a new revision instead of overwriting prior evidence.

[Reader browser checks](browser-validation.json): 728px/390px T3 HTML previews contain 42 exact shape paths and 42 listed records, zero photos, no horizontal overflow and no final console errors. An initial shell transfer truncated the SVG HTML and produced a path parse error; increasing the transfer output budget preserved the full document, and both final previews passed. The preview was published inline; these are review-tool checks, not application behavior or release acceptance.

Application research fixture content and its geometry overlay changed only behind the opt-in research build gate. Normal public content, public directory, original evidence, original map IDs, mall assets, site branches and release metadata were not changed by this private packet. No deployment, push or release authorization is recorded.
