# Discovery input reconciliation — 17 October 2026

This is a research ledger, **not an approved content packet**. The owner confirmed on 17 October that reviewed Vietnamese/English descriptions, store-linked reviewed photos and final mappings for the remaining gaps are unavailable. Public snapshots stay pending, with no destinations and no editorial review date. No source claim is promoted to approved occupancy or a precise store location.

[counts.json](counts.json) separates the count domains. The supplied comparison CSV has 383 occurrences and 383 nonempty owner-reported floor claims (217 Vincom, 166 Saigon). The current category JSON files contain 208 Vincom / 168 Saigon occurrences. The narrower normalized preview contains 306 identities and 313 store-floor locations: 143 source-layout associations and **170 precise locations pending** (122 Vincom, 48 Saigon). These are different populations; the preview is not the complete supplied roster.

[floor-location-ledger.csv](floor-location-ledger.csv) gives every preview identity/floor, association code/region or explicit pending state. Reproduce with `python docs/content-preparation/discovery-integration-2026-10-17/reconcile.py` from the shared application checkout. Source hashes are recorded in the count report. Associations reuse the existing schematic geometry; no store pin coordinates were invented.

The input files in `data/research/` are isolated behind `INCLUDE_TEST_FIXTURES=research`. They produce `dist/research/{mall}`, separate from public `dist/{mall}` and synthetic fixtures. Source Vietnamese copy is retained; missing English copy stays empty and displays a localized pending message. No reviewed photo is supplied. Fixture review metadata records a software import check, explicitly not editorial approval.

Remaining work belongs to the existing content/release scope in issue 0016: reconcile all roster differences, review bilingual descriptions and store-linked photo rights/associations, resolve final locations and obtain owner approval before public import. Floor claims alone do not satisfy those gates.
