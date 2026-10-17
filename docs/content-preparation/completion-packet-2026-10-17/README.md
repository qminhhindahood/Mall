# Discovery completion review packet — 17 October 2026

Revision: **completion-packet-2026-10-17-r1**. Research and editorial candidates only; approval pending. This packet advances the content work behind issues 0016/0019. It does not close either issue or change the public websites.

Open [the interactive review](review.html), or use the local server at <http://localhost:4349/docs/content-preparation/completion-packet-2026-10-17/review.html>. From the mall-visitor checkout, reproduce with `python -m http.server 4349 --bind 127.0.0.1`. The review supports mall/search/status filters, bilingual drafts, separately identified coordinate frames, source links, media candidates and exportable review notes. Notes are not approval records and are not imported into the application.

## What is ready

| Deliverable | Result | Limit |
| --- | --- | --- |
| Owner CSV reconciliation | All 383 occurrences accounted for: 374 included and nine owner removals/merge excluded | Occurrences are not unique destinations |
| Expanded candidate roster | 371 identities / 378 floor locations: Vincom 206/208; Saigon Centre 165/170 | Includes two official-only additions requiring a roster decision |
| Bilingual drafts | All 347 distinct supplied Vietnamese descriptions have English drafts, covering 369 supplied identities | Both languages still need editorial review; AESOP and Sport Fair have labelled listing placeholders, not finished introductions |
| Original 170 precise-location gaps | 42 now have first-party Saigon Centre polygons; 128 remain without precise evidence | New polygons are in the source coordinate frame and are not registered to the website model |
| Expanded mapping inventory | 163 official-source polygon locations; 24 inherited schematic associations; 191 precise locations pending | No new approved locations; source association does not establish current occupancy |
| Vincom unit research | 20 rows have first-party unit claims | None has an exact full-code correspondence in the existing reference-region inventory; no new region assignment is made |
| Media candidates | 212 identities have 1,188 candidate asset references; 159 have none | These include logos/graphics and unreviewed store-associated images, not 1,188 approved storefront photos; zero rights or branch approvals |
| Takashimaya counters | 199 separate official counter candidates retained | Two records are outside the B2–L3 counter scope; no automatic merge with same-name mall shops |

The 128 remaining gaps describe the **original narrower preview**. The 191 pending locations describe the **expanded supplied roster**. These denominators must not be exchanged or presented as a regression.

## Evidence and provenance

Owner inputs remain unchanged. [Roster and lineage](roster.json) retain individual CSV occurrences, exclusions, source records, aliases, source-unit claims and conflicts. [Input integrity](source-inputs.json) records source hashes and unchanged tracked application inputs. [Summary](summary.json) contains machine-readable counts; [manifest](manifest.json) hashes packet files.

Saigon Centre research uses the [official mall directory](https://shopping.saigoncentre.com.vn/vi/store-directory), its saved bilingual first-party content responses and floor layouts. [Research findings](saigon-research/discoveries.json) preserve 165 mall records, source URLs, reported status, descriptions and map data. The official directory adds AESOP and Sport Fair relative to the prior 163-identity fixture. Neither has a supplied introduction in those responses, so the packet does not invent one. [Source map](saigon-source-map.json) converts the common geographic source coordinates to a local planar frame for review. It remains separate from the legacy schematic and exterior-model frame; the review deliberately renders Pandora's retained legacy association in its original frame.

Vincom research uses the [official mall directory](https://vincom.com.vn/vincom-center-dong-khoi/gian-hang) and first-party branch locators, with URLs and cached pages in [research findings](vincom-research/discoveries.json). [Unit correspondence review](vincom-unit-correspondence-review.json) distinguishes current claims, historical/promotional claims, access-limited evidence and floor/identity conflicts. Exact full-code matching against the existing reference inventory yields zero new region candidates. This does not prove that no correspondence can be established through further source-image/shape review. Owner removals remain excluded even where an official listing still exists.

The [bilingual receipt](bilingual/coverage.json) covers 376 primary JSON rows and 347 unique descriptions; the additional 208-row research copy is duplicate input, not another 208 destinations. Vietnamese text is preserved. [Counter candidates](takashimaya-counter-candidates.json) remain distinct from the mall roster. Source-reported status is evidence, not a current occupancy guarantee. Archived source text and images are private review evidence, not a grant to republish them.

## Decisions required to finish

1. **Roster and categories:** resolve flagged identities, floor/unit conflicts, the two official-only additions, the 11 category-pending candidates and the two out-of-scope counter records. Keep owner exclusions unless explicitly superseded by a reviewed decision.
2. **Exact locations:** register accepted Saigon source polygons to the website's floor frame, review all inherited associations and obtain evidence for the remaining locations. Never infer a tenant from a code alone or split merged contours without source support. Complete list-to-map marking remains unfinished.
3. **Copy:** review Vietnamese and English introductions independently, replace the two listing placeholders with evidenced introductions, and record real reviewer/date decisions. Translation coverage is not editorial acceptance.
4. **Photos:** check each candidate's image type, store/branch association, freshness and reuse rights. Obtain missing imagery or explicitly approve an honest no-photo treatment. A logo must not be presented as a storefront photo.
5. **Integration and acceptance:** only after those decisions, import accepted content/mappings into both site branches and verify both malls/locales at desktop and phone widths, retained map/list selection, keyboard behavior, forward/reverse motion and the complete rendered journey. Existing performance, hosting and release gates remain separate.

[Per-identity decisions](decisions.json), [original-gap decisions](original-170-gap-decisions.json) and [mapping CSV](mapping-review.csv) make the remaining work reviewable. No approval timestamp has been invented. Public snapshots remain empty/pending at `directory-pending-2026-10-14-r1`; no deployment, source geometry revision, content publication or whole-journey acceptance follows from this packet.

## Validation and reproduction

Run `python docs/content-preparation/completion-packet-2026-10-17/prepare.py`, then `python docs/content-preparation/completion-packet-2026-10-17/build-review.py` from the app checkout. The first command reconciles inputs; the second builds review/decision files and refreshes the manifest. These commands do not import content into the application.

[Eight data checks](validation.json) pass, including occurrence lineage, unique identities, totals, region references in their source frames, media schemas and false approval flags. [Local browser verification](browser-review.json) passes 18 checks across 1280px and 390px, including filtering, both coordinate frames, bilingual copy, note semantics and overflow. [Desktop](review-frames/owner-review-1280.png) and [phone](review-frames/owner-review-390.png) frames were visually inspected. T3 preview status/open returned `Authentication required`; private review verification used installed Chrome through local Playwright. These checks validate the review tool, not the integrated public journey or production performance.
