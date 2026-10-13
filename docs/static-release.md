# Static release preparation — visitor-discovery-2026-10-14-r1

No deployment, upload, remote push or release approval is included. The two Wrangler configs package only their named public mall output. This static-assets application has no request-time Worker, bindings, paid resources or Worker logging dependency.

## Local verification

- `npm run build:saigon` and `npm run build:vincom` generate independent public outputs.
- `npm run dry-run:saigon` and `npm run dry-run:vincom` validate packaging without uploading.
- Fixture builds require `INCLUDE_TEST_FIXTURES=1` and go to `dist/fixtures/<mall>`; neither deployment config points there.
- Post-build validation checks asset limits and creates localized nearest-404 assets, a Vietnamese root redirect, compressed delivery headers and immutable caching for hashed chunks.
- Supply approved HTTPS `SITE_ORIGIN` at build time for absolute metadata, sitemap and robots. No hostname is invented. Origin/account/domain verification remains not-run.

The browser harness is `node browser-checks/run-journey.mjs`, using the existing scratch Playwright driver and installed Chrome. Public servers use 4283/4284; fixture servers use 4285/4286. It adds no unit/helper suite.

## Remaining release gates

Obtain team-reviewed bilingual directory snapshots, mapped-location evidence, facilities, actual review dates and explicit Highlights, then import and repeat browser acceptance. Review geometry/common-frame registration, final glass composites and remaining 0013/0014 native/background/production-host evidence. Physical-phone hardware checks remain owner-waived/not-run.

Confirm the owner's Cloudflare account/free plan, proposed Worker names and approved origins. Rebuild with those origins, repeat routing/metadata/isolation and config dry runs, and obtain owner release approval for the exact revisions before publication. Production routing, compressed delivery and timings require an authorized deployment.

Documentation checked 14 October 2026: [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [custom 404 routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/), [headers](https://developers.cloudflare.com/workers/static-assets/headers/), [billing and limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). Installed Wrangler 4.150.0 confirms `drop-trailing-slash` and `404-page`. Dry run establishes local packaging only.
