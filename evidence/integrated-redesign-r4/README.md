# Store details, directions handoff and exterior controls — 21 October 2026

Isolated continuation from `1cfbfe8`; canonical app and preserved source candidates unchanged. No upload, push or deployment.

## Delivered behavior

- Discovery details open as a readable right-side modal on desktop and a full-screen phone sheet. Location certainty and primary Directions come first; practical fields prioritize telephone, hours and menus. Source date, scope and uncertainty remain available in expandable disclosures. Unknown and held values remain withheld. Multi-floor selection is near the top with a distinct active state.
- Directions opens `/en/directions` or `/vi/chi-duong`, retains the destination/floor and validates a same-origin Discovery return path including store selection and filters. Public handoffs require an explicit manual origin. No inferred GPS position. The old prototype retains its regression fixture defaults.
- Bounded CK L2 ↔ MLB L3 source-based route and the six older area routes are unchanged. Swapping a floor-only destination into the origin is disallowed, preventing false mapped-origin wording. Floor-only destinations remain selectable with honest unavailable-path states.
- The model loader no longer makes the whole shell inert. A compact status replaces the blocking overlay; directory, store details and Directions are usable while model requests are held.
- Existing exterior model gains a 5.5-second arrival, explicit skip/replay and labelled rotate/look/zoom/reset controls. The finite arrival eases a roughly 13.8-degree front-view turn and 8% camera-distance settle. First pointer/key/wheel input cancels it, including input before runtime creation. Reduced motion remains static; controls still work. This is bounded frontage motion, not the full richer multi-stage cinematic introduction.

## Verification

- Both malls build with public EN/VI directions pages (355 Saigon / 429 Vincom pages); final build logs are in `D:/Midterm/.scratch/migration-readiness-2026-10-21/build-final-r4-*.log`.
- `details-handoff-browser.json` there covers eight EN/VI desktop/phone shopper flows: correct details, explicit origin, CK→MLB manual transfer where supported, unsupported ZARA route, and return to the same store/filter. No page errors. The first harness attempt had an ambiguous language/back selector, fixed in the harness; a later query-effect readiness race prompted the public preparing-state repair.
- Independent Astra review: `.scratch/mapping-review-2026-10-21/report.json` and actual screenshots. Four independent flows and source disclosure/multi-floor checks passed; no blocking usability finding. Its recommended top floor selector was implemented afterward.
- `shell-before-model.json` holds real model requests and verifies phone directory/store/Directions access for both malls.
- `../exterior-controls-2026-10-21/README.md` documents six actual-model cases covering finite motion, cancellation, clamp/reset, reduced-motion stillness and target sizes. First review found panel clipping and phone title overlap; source fixes align the panel and put phone controls in normal flow. Final fresh-build visual receipt is recorded in `final-exterior-layout.json` in the readiness packet.
- Browser emulation only; physical devices, screen-reader hardware and production hosting are not verified. Shared build chunk remains above 500 kB and prototype directions HTML remains about 11.28 MB; performance redesign remains open.

## Mapping semantics independently verified

| Measure | Saigon | Vincom | Total |
| --- | ---: | ---: | ---: |
| Listings | 165 | 203 | 368 |
| Area-associated listings | 156 | 23 | 179 |
| Floor-only listings | 9 | 180 | 189 |
| Floor-location records | 170 | 205 | 375 |
| Area-associated floor records | 157 | 23 | 180 |
| Floor-only records | 13 | 182 | 195 |

Adidas accounts for the additional mapped floor association. No exact doors or dangling references. Eight Saigon regions carry overlapping-independent-area semantics: Cartier, Grand Seiko, Hublot, Tudor, Zenith, Labellab, Botejyu Okonomiyaki and Ramen Ichibanken. Phúc Long has one area linked to two polygons. Zero shared active IDs therefore does not prove exclusive boundaries. The Hour Glass, Moschino, Asian Corner, Oedo Alley and Yakiniku Like remain explicitly held/floor-only; Takashimaya, Matin Kim Vietnam, AESOP and Sport Fair also lack an area. No coordinates or route edges were added by this batch.

## Remaining work and blocker

Full shared-shell visual redesign (including complete Home/Discover/Map/Directions/Visit navigation), distinct mall identity refinement, richer multi-stage arrival choreography and broader source-supported map/routing coverage remain unfinished. Do not substitute replay or this bounded camera arrival for the larger cinematic brief. Private cloud destination/access still pending; existing GitHub remote is public. No transfer attempted. The earlier captured snapshots are preserved; this newer source revision is a subsequent local delta.
