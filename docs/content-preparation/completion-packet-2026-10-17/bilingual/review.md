# Bilingual description packet — 17 October 2026

Status: **agent-drafted and agent-reviewed for linguistic meaning and grammar; owner editorial approval pending**. This review does not establish current tenancy, stock, services, pricing, opening status, photo rights or mapped location. No public directory snapshot or application approval flag was changed.

## Files and coverage

- `translations.json`: 347 exact original Vietnamese `highlights` strings mapped to original English translations. Use exact string lookup; the Vietnamese keys have not been rewritten or normalized.
- `records.json`: source path, store ID and store name joined to both languages. It preserves all 584 source occurrences: 208 Vincom category records, 168 Saigon Centre category records and the 208-record latest Vincom research file. The latest Vincom file has the same bytes as the category file, so these are **376 primary rows**, not 584 distinct stores.
- `coverage.json`: source hashes, actual row counts, empty-source results, translation coverage and readback checks. All 376 primary rows have bilingual text. There are zero untranslated descriptions and zero empty supplied descriptions.
- `worklist.json` and `translations-lines.txt`: exact source-to-translation drafting order, retained to make the preparation reproducible and easy to audit.

The Saigon Centre source metadata says 162 stores; the actual `stores` array contains **168 rows**. Coverage follows the actual rows. These counts are supplied record counts, not a roster reconciliation or a count of verified occupied units.

## Linguistic review performed

After writing the translations, the agent loaded the JSON from disk, read back paired Vietnamese and English descriptions and checked meaning, grammar, product lists, brand spellings and row alignment. A second coverage pass independently reloaded all three source files, checked every source sentence against the mapping, verified there were no extra or missing keys, and checked every per-store bilingual join. Both steps passed on 2026-10-17.

English preserves the supplied activities and products rather than replacing individual descriptions with category boilerplate. Vietnamese dish names and product names are retained where useful; short explanations are provided for gyutan and bạc xỉu. English uses consistent sentence case and US spelling. No hours, numerical prices, locations, brand claims or products were added from outside the supplied descriptions.

Promotional adjectives such as “delicious,” “famous,” “exclusive,” “durable” and “high quality” are toned down where they do not help identify the offering. Unsupported general wellness, nutrition and baby-safety assurances are not amplified in English. Specific supplied product names, source claims of authenticity and product attributes remain source claims requiring editorial confirmation. Generic “affordable” pricing language is retained only where it appears in Vietnamese; it is not a researched current price.

## Items for the owner/content reviewer

1. Confirm the actual current offering before publication. Translation checks cannot validate availability, authenticity claims, laser treatments, eye examinations, foot care, organic/vegan/natural ingredients or current product ranges.
2. Reconfirm every “opening soon” claim and the source descriptions that mention L3 or L5. Those strings are faithfully translated, not newly verified opening notices or final floor mappings.
3. Several source descriptions are intrinsically sparse, including “Thưởng thức các món ăn.” → “Enjoy a meal.” and “Mua sắm trang phục thời trang.” → “Shop for fashion clothing.” They are covered without inventing details; stronger store-specific copy requires evidence.
4. “Sữa chua uống … nếp cẩm” is rendered as yogurt drinks with black sticky rice; “mì ramen số 8” as No. 8 ramen; “trà Freeze” as Freeze tea drinks. These preserve the supplied terminology and should be checked against the store's actual menu naming.
5. The Vietnamese sentence mentioning leather shoes, casual shoes and breathable jackets ends with “êm chân,” which applies to footwear rather than jackets. English avoids the malformed modifier and lists the supplied products clearly.

This packet is ready for owner editorial review and review-mode integration. `ownerEditorialApproval` remains `false` in every per-store record. Approval must be recorded after review; the agent's linguistic check must not be converted into owner approval.
