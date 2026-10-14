# Decisions for the content team

Use the prefilled [decision queue](decision-queue.csv) and [source cards](review-cards.json). These decisions concern content; 0017's rendered journey review and 0013/0014 runtime checks continue independently. Publication is not authorized.

## Smallest useful review batch

1. Assign actual content/currentness and independent VI/EN reviewers, plus a maintenance owner, separately for each mall. Decide whether to approve name-only basic listings with deliberately empty descriptions while richer introductions are reviewed later. This is an available canonical-spec path, not an approved content policy.
2. Start with any chosen source-backed floor subset among the 316 occurrences. Confirm identity, current operating status and each floor; choose a primary floor and approved categories. Review the proposed official-form names in VI/EN and intentional empty introductions. Supply actual reviewers and dates. This can prepare a useful candidate batch before precise polygons are resolved, but does not establish complete-mall content acceptance.
3. Resolve the 67 Vincom rows without list floors in priority 1. Record explicit current floor evidence. Leave unlocated rows pending; an old map clue, nearby table row or another occurrence's claim cannot fill their approved floor field.
4. Resolve repeated identities before stable-ID approval. Takashimaya's five occurrences describe one potential multi-floor anchor, while independent department-store counters must remain independently discoverable. Confirm adidas, ZARA and H&M multi-floor identities or named branches. Review spelling variants and the combined Mujosh & Ted Baker record separately; do not fuzzy-merge King BBQ B3 with removed King BBQ Buffet L3.
5. Resolve priority 2 status/location questions and all shared-unit groups in the existing [complete checklist](../owner-location-checklist.md). For Crocs, An Phước and Valentino Creations retain authoritative B2 claims; request current unit/shape only for precise markers. For Sony/Studio 77 decide succession, coexistence or incorrect unit claim. For Yamazaki retain B3 claim without guessing a bakery replacement shape. For BOAT NOODLE, Converse and SKECHERS obtain current operation evidence; `planned` cannot be translated into open/closed/moved by assumption.
6. Supply the omitted independent Takashimaya counter roster and approved visitor facility roster. Existing map-only annotations are a prompt to investigate, not a current roster. Verify L6 garden/access/renovation separately. Approve taxonomy labels and memberships; commercial service destinations remain separate from facilities.
7. Sign off completeness/currentness and actual snapshot review dates for each mall after reviewing the assembled candidate. A partially prepared subset does not approve full directory coverage. Keep Highlights deferred/empty; do not request nominations again unless the owner changes that decision.

## Decision ledger conventions

The queue is one row per source occurrence, so repeated identity decisions should be written consistently across affected rows and reference the same `identity_group`. `reviewed_destination_id` must be a reviewed mall-scoped destination ID; the proposed ID is a suggestion. For a split identity, record different IDs and explain why. `verified_floors` must contain only floors supported by the review; `primary_floor` must belong to that set. Record evidence in `location_evidence` and explanation in `decision_notes`, including whether a unit remains uncertain.

Names and empty-introduction choices require independent VI/EN review. Fill `vi_reviewer` / `vi_review_date` and `en_reviewer` / `en_review_date` with actual reviews, not filenames, generation dates or the owner's communication date. A factual-currentness check is separate from language approval. Approve intentional empty introductions explicitly; if rich copy is chosen instead, provide independently reviewed bilingual copy in a separate revisioned record packet.

Mapped areas require reviewed runtime region IDs and geometry-revision evidence, not unit strings. `floor-confirmed` imports have no area IDs. Geometry/source boundaries need not be redrawn merely because a tenant annotation is obsolete. New boundary/split/merge evidence goes to the map/runtime owner after content decisions, with original maps preserved.

## Handoff after decisions

Preserve the reviewed CSV and evidence as a new revision. The content coordinator resolves identities and prepares a separate candidate import under the existing contract, with floor-confirmed records where appropriate, no invented precise markers, independent facilities, approved taxonomy, and no Highlights. The runtime owner validates/imports only the fully approved version and reviews bilingual behavior. Mall completeness and release acceptance remain separate; no deployment or publication belongs to this packet.
