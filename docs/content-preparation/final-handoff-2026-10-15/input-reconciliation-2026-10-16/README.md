# Vincom input reconciliation — 16 October 2026

The owner supplied a newly hashed Vincom JSON and a comparison CSV named `all-record-map-comparison updated.csv`. Both exact input files are preserved in this folder. This is an offline reconciliation only; neither file is an approved public directory snapshot.

## Findings

- The comparison CSV has 383 rows (217 Vincom). Its SHA-256 is the same as the previously preserved comparison CSV, so this new filename contains no byte-level CSV updates.
- The JSON file's `stores` array has **208** objects and no IDs missing from the CSV crosswalk. Its metadata still says `stores: 217`, `generated: 2026-10-12`, `version: v0-draft`; its category metadata totals 217. Actual categories across 208 objects total 208: supermarket 1, restaurant 53, cafe 9, other 12, entertainment 2, fashion 96, services 4, beauty 29, electronics 2. Forty-eight objects have no unit; every object has a floor value and none has `_needsFloor` set. The metadata says 84 need floor verification, so that counter needs explanation/update.
- Floors agree across all 208 matched IDs. Nine CSV Vincom IDs are absent from the JSON: six already marked removed/merged in the CSV (Boost Juice, Phúc Long, Cocolux, CK Jeans, Letitia, HLA), plus Nine West, Nice and Sâm Ngọc Linh. The last three remain pending candidates in the CSV with unknown units; the JSON does not say why they were omitted. Do not convert omission into a closure decision.
- There are nine raw unit differences. Two (The Kooples and Weekend Max Mara) are already resolved by the separate owner amendment: their old CSV claims were cleared. Seven remain for review: Keds (`B2-50` in CSV, blank in JSON); Lẩu MK (`B3-18B`, blank); Huế Delights (`B3-19A`, blank); Tian Long (unknown, JSON `B3-18B`); Tous Les Jours (unknown, JSON `B3-19A`); Beauty Box (unknown, JSON `B2-17`); Pucini (unknown, JSON `B2-50`). These may reflect transfers/updated claims, but the draft JSON alone does not establish current occupancy.
- The JSON's nine category keys match the reported count of nine categories, but its actual `other` count is 12 versus the previous owner report of 26. Reconcile the category roster and count before changing taxonomy or assignments.

See [row-level unit differences](vincom-unit-differences.csv) and [machine-readable receipt](reconciliation.json). The earlier reviewed 50-row parked list remains unchanged; these new JSON claims are alternatives pending owner confirmation. Do not promote any of them to map markers or published location certainty.

## Decisions needed

1. Should Nine West, Nice and Sâm Ngọc Linh remain pending candidates despite being absent from the latest JSON, or were they intentionally omitted? If omitted, provide status/reason.
2. Confirm the seven remaining unit differences against the latest research and state which records should retain/clear each unit.
3. Correct/reissue the JSON metadata to match its object array and categories; clarify the meaning of `needsFloorVerification: 84`.
4. Confirm whether 12 or 26 Vincom records belong in `other`, and provide the exact current/proposed category lists before reclassification.
5. Update the comparison CSV if it is intended to carry the same latest unit decisions; the supplied copy is byte-identical to the previous one.

No public content, map geometry, unit markers or approvals changed in this reconciliation. The second location-research round remains in progress.
