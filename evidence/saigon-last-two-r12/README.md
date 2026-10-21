# Saigon last-two mapping review — r12

Owner request: finish the remaining two Saigon listings. This pass resolves useful **partial Takashimaya references on all five listed floors** and leaves **Matin Kim evidence-blocked**. Source-based coverage is **164/165 Saigon (99.4%)**, Vincom38/203 unchanged, combined202/368 (54.9%). This is area-link coverage, not complete floor coverage, exact entrances or working routes for every store.

## Takashimaya: five explicitly partial references

| Floor | Named department counter | Exact existing contour |
| --- | --- | --- |
| B2 | Marou Station | B2-region-030 |
| B1 | Rập | B1-region-018 |
| L1 | Polo Ralph Lauren | L1-region-030 |
| L2 | TWG Tea Salon | L2-region-050 |
| L3 | Wilson | L3-region-054 |

Each contour was visually checked against its printed name on the unchanged supplied raster. Membership is established by the archived official /takashimaya-store-directory counter record, corroborated by the department's own floor guide. Existing affine registration helps locate candidates; overlap scores are not used as boundary approval. Candidate screenshots/JSON remain research; only the five rows in source-review.json are accepted.

Each location states exactly which named counter area is shown, that it is a partial department reference and that the full perimeter, entrance, other counters, current occupancy and walking connections are unverified. The five shapes remain separate; no union or invented department perimeter. The 165 main-directory listings are unchanged; counter membership does not add extra retail listings.

Runtime support matches review decisions by destination AND floor, allowing one source-reviewed destination on several floors while preserving duplicate/wrong-floor/geometry guards. The new packet loads after all r11 packets. Original maps, models, accepted source data, other destinations and both graphs remain unchanged.

## Matin Kim: precise remaining blocker

The supplied L3 plan and archived official polygon identify **Miana** at L3-12. The mall's accessible official search results still describe **Matin Kim as Opening Soon at L3-12**, while Miana's official result also claims L3-12. The accessible brand locator lists a Hanoi branch; it supplies no Saigon footprint. Neither the archive nor these accessible current sources resolves the competing occupancy/geometry. Matin Kim remains floor-only, with no marker or selectable mapped origin; Miana's existing association stays intact.

Needed evidence: a mall-issued or brand-issued **Saigon Centre L3 plan/footprint identifying Matin Kim**, with dated clarification of the Miana/L3-12 conflict. Another unit-number-only claim does not establish which footprint or occupancy is correct.

Sources checked via web tools:
- https://shopping.saigoncentre.com.vn/en/store-directory/matin-kim
- https://shopping.saigoncentre.com.vn/en/store-directory/miana
- https://matinkim.vn/pages/he-thong-cua-hang
- https://takashimaya-vn.com/en/floor-map-eng/
- https://takashimaya-vn.com/en/polo-ralph-lauren-brand-introduction/

Direct local Python HTTP refresh of the first three URLs was **denied by local socket permissions (WinError10013)** before receiving a response. The denied requests were not retried or bypassed. fresh/receipt.json preserves exact targets/errors. Web-tool results and supplied/archived evidence remain available; fresh direct mall HTML/API parity is not claimed.

## Verification

- Both builds pass355/429 pages, Astro zero errors/warnings; build-saigon.log/build-vincom.log.
- checks.json:17 focused guards, five partial locations, only Takashimaya changed, Matin/Miana preserved, Vincom unchanged, both graphs identical.
- Existing r11 association audit22checks still passes after the destination+floor review lookup change.
- browser.json:12 checks/flows pass: five floors ×ENdesktop1280/VIphone390 detail→Directions→keyboard area→manual origin; exact one highlight, full counter limitation in expanded notes, no invented route/overflow/page errors; two Matin floor-only/Miana-preservation cases.
- takashimaya-partial-phone.png visually inspected. Browser emulation is not physical/device/current-operation acceptance.
- Routing stays41 directed journeys/13 approaches/zero connected entrance routes; all preexisting routing/UI behavior is preserved.

Only the isolated candidate is edited. No Vincom expansion, routing expansion, upload, publication, canonical mutation or ownership/security exception.

