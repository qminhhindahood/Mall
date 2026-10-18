# Current description corrections · revision 2

This is the current **private description draft**, assembled on 18 October 2026 from the saved authored batches. [Open the editable bilingual reader](review.html), [editable CSV](roster-review.csv), [complete proposal JSON](roster-proposals.json), and [validation and exact exceptions](validation.json).

The owner approved the style of the ten examples at `http://127.0.0.1:4371/revision-2/sample.html`: **“Yes, use this style throughout.”** [The scoped receipt](style-decision.json) records that direction. These drafts explain the offering and a distinctive detail in one or two sentences. This accepts the style, not every new final string or the proposed roster.

## What is ready

The 371 candidate identities retain their existing IDs, mall/floor/category fields, roster issues, location/media treatments and prior scoped acceptance metadata. **361 have complete VI/EN description drafts; 10 retain null descriptions.** There are 165 Saigon Centre and 206 Vincom candidates; these are not a freshly verified census of open shops.

The reader searches name, ID and floor, filters by mall or evidence state, allows corrections to both languages and downloads correction JSON. Changes stay in that tab until downloaded. The CSV has separate correction and note columns. Neither editing nor downloading grants approval. The current 306-record running preview is a separate roster; this packet does not silently import its additional candidates.

## Exceptions and evidence limits

Three earlier identity holds remain: **Cara, Lizd Namat, Mujosh & Ted Baker**. Two Saigon offering gaps remain: **RAK Thai, Sport Fair**. Five additional Vincom gaps were present in the saved batch and are preserved: **Pang Pang, Catia, Seha Accessories, Studio 77, Dessert Planet**. Their exact IDs and reasons are in `validation.json`. Floor/list access can remain available under the existing policy, with no invented introduction or marker.

Of the 111 saved Vincom rows, 106 have drafts: 80 use primary plus supplied evidence, 26 rely on supplied summaries only, and five are null holds. The 257-row other batch contains 255 drafts and two null holds. Their disjoint union gives 368 rows; adding the three previous identity holds yields 371 rows / 361 drafts / 10 holds. Earlier estimates of 366 drafts missed the five null Vincom entries and must not be used.

Descriptions preserve the source references, archived excerpts, fresh-readiness notes and previous draft fieldset. Source-specific gaps remain visible. Brand-wide range does not verify current branch stock, hours, services or operating status. The assembly performs no new research; it preserves the separately documented archived/fresh checks. All new overall, VI, EN, publication and import approvals remain false, including new alternates to historically scoped accepted wording.

## Deferred work

The owner's later direction is to develop richer Discovery detail content and restaurant/shop Highlights together after this core pass. The six earlier nominations remain unapproved historical proposals. They are **not a launch requirement or an approval request in this packet**. This delivery adds overall descriptions, not the deferred richer Discovery layer. Ask the owner to review that layer when it is actually added.

## Reproduction and checks

From the application checkout run `python -X utf8 docs/content-preparation/finish-review-2026-10-18/revision-2/assemble.py`. The generator writes only this revision's JSON, CSV, reader and validation receipt. It asserts complete unique identities, disjoint batches, bilingual/null counts, source references, unchanged inherited issues/location/media/scoped acceptance, and false new approval/import flags. Input hashes bind the five source files. Historical r1 artifacts remain unchanged; the parent README and decision sheet identify this revision as current. This documentation assembly does not run or claim a site build, public promotion, release or full rendered acceptance.
