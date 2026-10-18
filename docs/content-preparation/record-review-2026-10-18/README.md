# Discovery record-level evidence review — 18 October 2026

Revision: **record-review-2026-10-18-r1**. Reviewer: **Codex (AI evidence reviewer; not owner/editorial approval)**. Actual review date: **2026-10-18**, checked against the session UTC clock. Every mapping/content row records this attribution, its proposed decision and source references. Every `ownerApproval` remains **false**; `ownerApprovedAt` remains null. Neither public directory nor live site branch was changed.

Open the [searchable private review](review.html), or [serve it locally](http://127.0.0.1:4349/docs/content-preparation/record-review-2026-10-18/review.html). From the app checkout, `python -m http.server 4349 --bind 127.0.0.1` serves both the original packet and this review. The page has filters for the 42 polygons, 128 remaining gaps, 20 specific copy findings, all content, copy needing evidence and media. It records no approvals.

## Findings delivered

| Evidence set | Result | Decision boundary |
| --- | --- | --- |
| [Original mapping ledger](mapping-ledger.json) | **170 record/floor occurrences reviewed**, each with store ID, floor, sources, proposal, confidence and missing evidence | Not an approved mapping import |
| [Saigon registration](registration.json) and [private proposed geometry](registered-proposals.geojson) | **42 UUID-linked source polygons** transformed into the website schematic frame; **38 ready for owner visual review**, four duplicate-code conflicts need confirmation | Source identity and schematic registration do not prove current occupancy or survey accuracy |
| Existing contour comparisons | **6 potential existing-region reuses**; 36 need new proposed regions rather than guessing a captured contour | All proposed region IDs are explicitly private; none was inserted into website geometry |
| Remaining original gaps | **128 remain without a supported precise mapping**: 122 Vincom and six Saigon | Floor/list access proposed; per-row evidence requests, never fabricated pins |
| [Copy ledger](content-ledger.json) | **371 identities**, separate VI/EN proposals; **20 specific findings** with 17 neutral bilingual rewrite proposals and three identity/source holds | 220 identities have copy proposals ready for owner language decisions; 151 need evidence or rewrite. This is evidence triage, not editorial acceptance |
| [Media observations](media-observations.json) and [representatives](media-sample.json) | One representative for each of **212 identities**, **203 visually inspected**, nine unavailable; **159 identities have no candidates** | **985 other candidate references remain visually unreviewed**; zero images have established rights/freshness approval |
| [Targeted first-party follow-up](follow-up-sources.json) | 24 fresh URL requests, 23 HTTP successes, one adidas 403; response bodies and SHA-256 retained separately | A successful HTTP response is not factual/currentness acceptance |

## Saigon polygon registration

The earlier packet correctly left source coordinates unregistered. This review establishes a **candidate registration**, using an additional evidence bridge already present locally: same-record named source associations in `data/research/saigon-centre.json`, the official UUID-linked polygons, and the existing raster-derived website regions. It does not simply scale the two bounding boxes or match region numbers to unit codes.

For each floor, sort the named record pairs by ID and reserve every fourth pair as a held-out check. Fit a 2D affine transform to the other pairs' area centroids with deterministic RANSAC (1 schematic-unit inlier threshold, seed 20261018, 5,000 maximum iterations). Report every training/held-out anchor, residual and polygon intersection-over-union. There are 119 candidate anchor pairs across seven floors, 32 held out and 87 used for fitting. The fit accepts at least five training inliers and a held-out median residual below 0.6 units; these are declared research thresholds, not survey or production acceptance criteria.

| Floor | Training inliers / pairs | Held out | Median / maximum held-out residual (schematic units) |
| --- | --- | --- | --- |
| B2 | 10 / 12 | 4 | 0.265 / 0.790 |
| B1 | 6 / 6 | 3 | 0.205 / 1.644 |
| L1 | 11 / 12 | 4 | 0.178 / 0.353 |
| L2 | 20 / 21 | 8 | 0.199 / 2.546 |
| L3 | 17 / 17 | 6 | 0.307 / 0.497 |
| L4 | 7 / 8 | 3 | 0.248 / 0.248 |
| L5 | 11 / 11 | 4 | 0.224 / 0.585 |

Median error corresponds to about 9–15 raster pixels at the target's 0.02-unit/pixel scale. Maximums matter, especially for narrow kiosks. B1 Winkperry and L2 Chlo.D/Pleats Kora are held-out high-residual associations; BOAT NOODLE, Jo Malone London and Phúc Long are high-residual training associations. These are retained as warnings, not deleted to improve the reported fit. L6 has no named anchors and is explicitly unregistered; none of these 42 gap polygons is on L6. Extrapolation outside the anchor distribution and small kiosk precision still need visual judgment.

Source revision: `saigon-official-source-map-2026-10-17-r1`, `official-geographic-source-v1`. Target revision: `source-palette-schematic-2026-10-13-r2`, `saigon-centre-schematic-canvas-v1`. This registers into the **existing website floor-map frame only**. It does not register the floor stack to the exterior building, resolve estimated floor alignment, or establish metric accuracy.

All 42 registered outlines were visually compared with the named original raster locations in [sheet 1](registration-crops-1.jpg), [sheet 2](registration-crops-2.jpg), and [sheet 3](registration-crops-3.jpg); individual overlays appear in the review. Each proposal compares the three best existing contours. Six pass the declared reuse screen (IoU ≥0.7, source coverage ≥0.8): **Lách Ca Lách Cách, GoGi House, Manwah, Kichi-Kichi, Asanoha and LONGJING** on L5. Others may have fragmented, merged, missing or changed captured boundaries. Low contour IoU is not automatically bad registration: the captured contour may omit a kiosk or text/label fragments. The red source outline is retained as a new private geometry proposal rather than assigning a convenient nearby region.

Overlapping official source polygons are recorded per row. The Hour Glass/watch cluster, Asian Corner and Oedo Alley/individual restaurants include parent/shared-area relationships; do not convert them into asserted separate storefronts, union unrelated records or silently remove nested areas. Owner review must choose the area relationship while preserving independent destinations.

Four proposals are held for source conflicts: **Irvins/llaollao both print B2-K5**, and **Label Lab/Moschino both print L2-17**, despite distinct UUID-linked polygons. Fresh first-party [Irvins](https://shopping.saigoncentre.com.vn/en/store-directory/irvins/), [llaollao](https://shopping.saigoncentre.com.vn/en/store-directory/llaollao/), [Label Lab](https://shopping.saigoncentre.com.vn/en/store-directory/label-lab/) and [Moschino](https://shopping.saigoncentre.com.vn/en/store-directory/moschino/) responses still show those claims. Geometry fit does not decide which unit text or occupancy is correct. Obtain mall/branch confirmation or current labeled photography.

## The other 128 original gaps

Each was checked against the owner unit claims, the saved first-party unit/branch research, the source label anchors and their containing contours. [Mapping findings](mapping-findings.md) makes all 170 rows readable without parsing JSON. The ledger retains each relevant anchor, current claim, historical/access-limited limitation and specific missing boundary evidence.

For Vincom, **71 original gap occurrences have exact source-label anchor matches**, but no reviewed isolated current unit boundary follows. For example, Tian Long's B3-18B lies in `B3-region-005` with B3-26/B3-18A; Crocs B2-49 and Pucini B2-50 lie in a contour spanning several distinct units; H&M L2-02 shares a contour with L2-07/L2-06. These are evidence for where to inspect/retrace, not permission to label the entire merged region as one tenant. Thirty-two Vincom gap occurrences have no usable unit claim after excluding “unknown to owner” placeholders; other rows lack a full-code anchor or require a newer boundary/code crosswalk. Combined/slash/range codes are preserved and are not expanded into invented subunits.

The remaining six Saigon gaps are **Matin Kim L3** and **Takashimaya B2/B1/L1/L2/L3**. Fresh [Matin Kim](https://shopping.saigoncentre.com.vn/en/store-directory/matin-kim/) still displays Opening Soon/L3-12; its cached store mapData is null and the Miana L3-12 conflict is unresolved. [Takashimaya](https://shopping.saigoncentre.com.vn/en/store-directory/takashimaya/) lists B2–L3 but supplies no unified store polygon; 199 counter candidates do not establish its complete footprint. Require an authoritative department-store perimeter on each level. No union of counter polygons is proposed as a substitute.

The **191** expanded pending precise locations remains the original expanded-roster baseline; 42 private proposals and 38 review-ready decisions are not approved reductions to either denominator. The nine owner exclusions and separate counter candidates remain unchanged.

## Copy and media review

Both draft languages were read across the 371 identities and compared against available matched first-party descriptive context. The English drafts generally preserve the supplied Vietnamese intent; that does not make the Vietnamese claim true. The [20 specific copy findings](copy-findings.json) identify actual product/service contradictions, unsupported extensions or source ambiguity, with exact neutral bilingual proposals where supported. The content ledger keeps current text, proposed text, per-language decisions and source paths, so the originals are never overwritten.

Examples include HIMALAYA's fragrance business rather than herbal/personal care, CHANEL's beauty branch rather than clothing, Meat & Meet's restaurant rather than fresh-meat retail, Pinktree's accessories rather than clothing, Scentuals cosmetics rather than niche perfume, Face Wash Fox facial services rather than product retail, and Copenhaghen childrenswear rather than decor. These are based on the archived first-party descriptions and targeted fresh responses, not brand-name guessing. **Cara, Lizd Namat and Mujosh & Ted Baker stay on hold** for identity/assortment contradictions; Lizd's official category and body conflict internally. Owner-supplied copy is retained rather than silently replaced with the contradictory official text.

119 identities lack usable matched first-party descriptive text in the packet. Two additional records (AESOP/Sport Fair) have listing placeholders only; 27 contain specific/time-sensitive claims needing branch support or neutralization. Approving an empty description is an owner option, not a decision recorded by this review. Broad summaries ready for owner language decisions remain bounded: no promise of every listed SKU, today's menu, performance schedule, price, authenticity or occupancy follows from a brand introduction.

All six [media sheets](media-sheet-1.jpg) were visually read; `media-observations.json` records the cell classifications and exceptions. Of 212 samples: 148 product/model/promotional images, 21 logos, 27 store/signage/interior images, three composites with stores, two person/history portraits, one different-mall exterior, one street store with unverified branch, and nine unavailable. The downloaded content hashes, source dimensions, exact image/source URLs, sheet and cell are in `media-sample.json`. This is **representative triage**, not review of all 1,188 media references.

Reject sample 162 (Winmart) as target-branch evidence: its building says **VINCOM PLAZA**, not Vincom Center Đồng Khởi. Zara sample 194 and Estée Lauder 197 are portraits. Pandora sample 74 includes other-brand packaging and cannot establish its storefront. Hokkaido Sachi sample 166 has the stronger readable **Vincom Đồng Khởi / B3-07** caption; other actual shop images usually have only source-page association, not an independently readable branch identifier. Even this stronger image still lacks proven freshness and reuse rights. Nine unavailable samples include locator images; failed download is not proof of no usable photo. Other images on those records remain candidates.

No image is ready for publication. For 159 records without media, the owner can explicitly choose no-photo treatment or supply a reviewed image. For existing candidates, first review the remaining references and establish branch, date/freshness and permission before choosing. Logos, product imagery and brand-history portraits cannot be relabeled storefront photos.

## Audit, reproduction and validation

[259 input hashes](input-integrity.json) freeze the original packet's 244 manifest-listed files, both website geometries/public directories, named association input, coverage CSVs and original Saigon rasters. [Follow-up responses](follow-up-sources.json) are separate new evidence. No original generator was run. Source/store/geometry revisions and reviewer date remain explicit. The derived ledgers are proposal records, not authenticated owner decisions.

From the app checkout, reproduce the local calculations and read-only viewer:

```powershell
python -X utf8 docs/content-preparation/record-review-2026-10-18/review-records.py
python -X utf8 docs/content-preparation/record-review-2026-10-18/render-registration.py
python -X utf8 docs/content-preparation/record-review-2026-10-18/build-review.py
python -X utf8 docs/content-preparation/record-review-2026-10-18/validate-review.py
```

Uses installed Python/numpy/OpenCV/shapely/Pillow; no dependency or live application changes. The recorded review date stays 18 October when reproducing historical calculations. Changed frozen inputs fail regeneration and need a separately reviewed revision. `collect-media.py` and `fetch-evidence.py` document collection; do not rerun them over this historical review. New source retrieval or visual observations require a new revision and actual new review date.

[Evidence validation](validation.json) checks input immutability, counts, valid candidate polygons, explicit missing evidence, language separation, pending owner flags and pending public snapshots. [36 T3 browser checks](browser-validation.json) validate this review page at 1280×800 and 390×844: counts, mall isolation, specific corrections, empty search, overlays, sources, no approval actions and overflow. These checks validate the **review tool**, not content, current occupancy or the integrated visitor journey. The earlier eight data/18 page checks retain exactly their original scope. [Validation and local review notes](validation.md) records failures and limitations.

Next owner decisions are the 38 schematic mapping proposals, 220 per-identity bilingual copy proposals (each language separately), conflict resolutions, and explicit empty/no-photo choices. New geometry/application import still requires an approved reviewed revision, schema/mall isolation checks and rendered integration review. 0016/0019, 0017 rendered acceptance, 0021 handoff, 0013/0014 lifecycle/performance and hosting/release gates remain open. Physical phone checks remain waived/not-run where recorded. Nothing was deployed.
