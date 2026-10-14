# Importing a reviewed directory snapshot

The public `data/malls/<mall>/directory.json` files intentionally contain empty, pending snapshots with no review date. Do not infer current tenants or precise areas from reference-map labels. The owner confirmed on 14 October 2026 that actual content must be supplied or researched and submitted for team review before shipping.

`src/data/content.ts` defines the import contract and performs build validation. Each snapshot identifies its mall, stable revision, approval and actual review date. Destinations retain one ID across languages and floors, official bilingual names, primary category followed by optional memberships, source-backed per-floor certainty, primary floor, status and separately reviewed introductions. Empty introductions remain valid basic listings; descriptions are not invented.

Every category, area, facility, destination and Highlight records its source, actual review date, reviewer, and independent VI/EN approval. An area references source geometry region IDs on one floor. Several independent destinations may link to the same area. A floor-confirmed location must have no area IDs. Facilities remain separate records and require no commercial category. A Highlight must refer to an open destination eligible for that category and floor. No ranking or automatic Highlight approval is generated.

A submitted snapshot is review input, not approved content. Keep it outside the public data path until the team approves both languages, floor/area evidence and Highlights. Import its approved revision, build both outputs and run browser acceptance before requesting release review. `INCLUDE_TEST_FIXTURES=1` substitutes labeled synthetic data only into `dist/fixtures/<mall>`; public builds reject fixture approvals and records.

No reviewed redirects or destination media are supplied in this delivery. Stable IDs, source/use permission, directory completeness, currentness, media review and maintenance ownership remain release review responsibilities.

The [bilingual content preparation packet](content-preparation/README.md) inventories the supplied mall lists/maps, preserves their entries as pending source claims, and provides authoring templates, approval/conversion steps and an owner checklist. Its offline worksheets are outside the public data path and are not approved import snapshots.
