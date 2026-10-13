# Issue 0012 — source inputs and exact-byte transport

**Current serialization: `source-palette-schematic-2026-10-13-r2`, UTF-8 LF.** The original r1 capture/overlays and browser receipts below remain historical evidence of the CRLF working-tree representation. R2 changes only the revision label and line-ending serialization; every decoded floor coordinate, frame, region, source map and exterior byte remains unchanged. [Serialization receipt](geometry-serialization-r2.json) records the comparison; current manifests/input validation carry r2 digests. No new source/appearance/registration acceptance follows from this fix.

13 October 2026. Integration base `2bec288`; source inputs revision `source-palette-schematic-2026-10-13-r1`; exterior delivery stays `photo-polish-2026-10-12-delivery-r2`. This is a source-backed schematic loading foundation, not source/appearance/registration acceptance.

## Source capture and confidence

All eight Saigon PNGs and seven Vincom WebPs were inspected in a source contact sheet. The final red-outline [contact sheet](source-overlays/contact.png) covers all 15 captured records; individual Saigon L5/L6 and Vincom B2 overlays were also opened at larger size. Capture retains every selected palette contour above the recorded annotation threshold and every `CHAIN_APPROX_SIMPLE` pixel boundary (only exactly collinear pixels are omitted). There is no contour count cap, arbitrary polygon simplification, convex hull or repeated floor box. Source identity/dimensions, transforms, per-floor bounds and component exclusions are in [the capture receipt](floor-capture-receipt.json) and each mall's JSON.

Saigon includes cyan, near-white/gray partitions, blue, peach/pink, pale unclassified regions and green/brown/maroon non-shopping context. Near-white source-label background `(244,255,255)` was excluded after overlay inspection because it otherwise extruded labels as regions. White circulation, surrounding ground/roads and grey boundary strokes are not invented slabs. Vincom uses the inspected map panel `(90,175)–(745,925)` only, excluding titles, tenant lists, legends and navigation; neutral gray blocks remain unclassified reference context. Thresholds are 144 source pixel² for Saigon and 40 for Vincom. Receipts disclose discarded specks/annotation components; this extraction is an estimate rather than an exhaustive semantic architectural trace.

| Floor | Candidate comparison observation |
| --- | --- |
| Saigon B2 | Dense near-white and cyan divisions captured; lower extent distinct; blanks unresolved |
| Saigon B1 | Broad blue region and peach corner retained; own partitions and extent |
| Saigon L1 | Asymmetric colored divisions with tower/context regions; outside blue marks unreviewed |
| Saigon L2 | Dense gray/cyan partitions and pale central regions retained; blanks not openings |
| Saigon L3 | Dense gray divisions and small pink region retained; annotations remain ambiguous |
| Saigon L4 | Broad cyan plus garden/brown context; context is not current retail content |
| Saigon L5 | Distinct dining-region boundaries and two pale central shapes; no atrium interpretation |
| Saigon L6 | Sparse gray regions, rooftop garden and tower/accommodation context; no invented retail infill or current renovation claim |
| Vincom B3 | Numerous yellow/neutral partitions and lower green region retained |
| Vincom B2 | Multicolor blocks, small partitions and asymmetric extent retained; default demanding sample |
| Vincom B1 | Dense pink partitions retained; reference names not imported as tenants |
| Vincom L1 | Broad upper pink region and lower small/gray blocks retained |
| Vincom M | Distinct separated blocks retained between L1 and L2 schematic heights |
| Vincom L2 | Sparse separated large blocks retained; white gaps not holes |
| Vincom L3 | Broad orange/yellow/neutral regions retained with sparse shape |

This inspection verifies that the candidate follows visible palette regions at the review scale. It does not establish surveyed boundaries, classification, calibrated core identity or tolerances. Text/symbol interruptions, antialiasing, mask merging/splitting and unknown blank areas remain limitations; owner source geometry review is pending. Zero holes, columns, structural walls or tenant records are inferred.

The affine transform is `[s,0,0,s,-width*s/2,-height*s/2]`: fixed `s=.02` Saigon and `s=.1` Vincom, image x right and planar z down. Translation centres each source canvas as an **unregistered presentation transform**, not each extracted bounding box or a fitted physical frame. No level is independently stretched to equal extents. Cross-level/exterior registration and scale/north are unverified; per-view camera centring must not alter stored coordinates. L1 elevation zero, basements negative, M half slot, 5-unit height slots are explicitly schematic. SVG and live geometry consume these same planar records.

[Input validation](input-validation.json) confirms unchanged source-map bytes, finite captured rings and no inferred holes. Saigon has 641 regions/365,033 vertices, 5,181,013 decoded JSON bytes; Vincom has 204/13,777, 243,506 bytes. Saigon exceeds the old 1.5 MB decoded-geometry target; no detail was discarded to satisfy it. Decoded resource costs and GPU suitability remain runtime measurements. Overview/map/Discovery should share geometry rather than triplicate owned extrusions.

## Exact assets and delivery

`prepare-assets.mjs --import D:/Midterm` imports only the exact current polished web GLBs/WebPs and existing font/license files from the two exterior repositories, read-only. Pinned GLB and preview SHA-256 values stop source drift. `--mall` or `MALL_ID` chooses one output; build staging contains only that mall's models/maps/preview and common fonts. Each asset manifest records bytes, SHA-256, revision and transport candidates. Original rasters/models remain unchanged; no glTF lossy/quantizing transforms run.

| Resource | Identity bytes | Brotli Q5 bytes | Gzip bytes |
| --- | ---: | ---: | ---: |
| Saigon exterior | 2,000,796 | 205,547 | 271,536 |
| Vincom exterior | 4,797,176 | 1,199,582 | 1,400,594 |
| Saigon geometry JSON | 5,181,013 | 1,084,571 | 1,152,697 |
| Vincom geometry JSON | 243,506 | 42,224 | 46,581 |

All Brotli/gzip candidates roundtrip to **exact original bytes**, including GLB textures, geometry, identities and materials. Sidecars are reproducible build outputs rather than extra canonical assets. Build-time receipts are in `data/malls/*/asset-manifest.json`. Conservatively revalidate stable URLs rather than claiming immutable fingerprinted caching.

The local `serve-static.mjs --mall <id> --port <port>` negotiates br/gzip on original GLB/geometry JSON URLs and sends correct MIME, Content-Encoding, encoded Content-Length, Vary and representation-specific ETag. `?identity` forces the identity control for comparison. Explicit `.br`/`.gz` URLs also decode correctly. GET/HEAD and conditional revalidation are supported; range requests on original assets use full identity responses. Static root redirect, dropped trailing slash, actual localized 404s and ordinary HTML routes are supported for app acceptance.

Future hosting uses pure static **explicit representation selection** with path-specific `_headers`, preserving `model/gltf-binary`/`application/json` and identity fallback. This avoids assuming automatic GLB compression or introducing a metered Worker. Cloudflare release-host decoding/headers remain unverified and must be checked before release; local behavior does not prove hosted behavior. Sources: [Cloudflare custom headers](https://developers.cloudflare.com/workers/static-assets/headers/), [compression MIME support](https://developers.cloudflare.com/speed/optimization/content/compression/).

## Browser seam evidence

TDD seam was the already owner-confirmed public browser/network boundary. Initial exterior/geometry public requests returned 404 (red); after assets and server implementation, T3's browser fetched negotiated, explicit br/gzip and identity representations (green). Tests compared actual decoded GLB hashes against independent pinned source digests; all geometry representations produced identical decoded JSON, all 15 original preview hashes matched, and all supported floor labels/regions were present. Browser expressions are in `browser-checks/lossless-assets.js`; [Vincom/red evidence](0012-browser-red-green.json) and [Saigon evidence](0012-browser-saigon-green.json) record Chrome152/Electron44/T3 Alpha on Windows, viewport and conditions. Tests used background tab_i; root tab_g was untouched.

These are local HTTP public-resource checks without throttling, not cold/Wi-Fi/complete-frame benchmarks. Readiness, LCP/INP/CLS, physical devices and Lighthouse were not measured by this ticket. Source capture/build validation is an artifact prerequisite, not a new private/unit test seam. Complete application browser/build acceptance follows after integration.

Post-merge verification against integration `8c87f18`: `npm ci --no-audit --no-fund`, both `npm run build:saigon` and `npm run build:vincom` passed. Astro check reported 0 errors/warnings/hints for each; builds emitted 22/20 pages with current source geometry. `git diff --check` and source-input validation passed. A browser check exposed a slash-redirect query loss; preserving the query fixed it. The built Saigon server then retained `?floor=M` on canonical redirects, returned 200 for the valid floor and localized English HTTP404 for unknown stores. `_headers` revalidates identity JSON too; `.gitattributes` protects exact original asset bytes and LF JSON receipts across Windows checkout. See [redirect/public route receipt](0012-static-route-check.json).

## Byte reproducibility follow-up

Existing Windows worktrees retained converted CRLF license files after merging `assets/** -text`; attribute changes do not rewrite unchanged files. Python's default Windows text writer also ended captured JSON with CRLF, whereas committed JSON and clean checkouts used LF. Thus source values matched but old working-tree byte hashes differed from a clean checkout. Original exterior repositories and committed license blobs agree on exact LF bytes (BeVietnamPro 4,397 bytes, Manrope 4,386); no original asset needed modification.

Preparation now pins all font/license hashes, restores only the known CRLF-to-original-LF license representation in staging if its SHA matches the canonical source, and rejects real content drift. Geometry preparation and validation use canonical LF; capture writes explicit LF from r2. [Artifact reproduction](license-byte-reproducibility.json) confirms both mall manifests are byte-identical for canonical inputs and simulated legacy CRLF licenses, staged licenses equal original source bytes, and a real license edit is rejected. This is an artifact prerequisite; no browser behavior checks or full app rebuilds were rerun for this serialization-only fix. Old browser geometry byte counts/hashes remain r1-only; exact GLB evidence remains current photo-polish r2.

Current r2 identity JSON is 5,181,012 Saigon bytes (SHA `84952edc38465d572cd994ef416d5a095f778fa0cb35e46ce6d3d365c7454807`) and 243,505 Vincom bytes (SHA `be4771f73849d8d6909cbb8ba56edf5c9901446bcbdd392299f540169ceebb6e`). Current compression receipts live in each mall's asset manifest. Full captured boundary counts and remaining geometry/device/hosting gates are unchanged.
