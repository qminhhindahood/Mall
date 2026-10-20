# Local release packaging — continuation r2

Packaged the final isolated source **3e505fbb8c67ec5c389f39b7fce43461a11cc7f7** after the coordinator's four-build and browser-validation pass. This is a local delivery, with no publication or account operation. Asset revision remains **photo-polish-2026-10-12-delivery-r2**.

## Final local receipt — 20 October 2026

The ignored [raw package](package/) is complete, with immutable copies of its [completion marker](final-package/COMPLETE.json), [provenance](final-package/provenance.json), [source inputs](final-package/source-inputs.json), and both per-file inventories/checksum lists under [final-package](final-package/). The packaging process reports no tracked dirty paths and verifies source/build stability plus exact copied bytes. The 91-input source digest is `0762d9f65cdfaf6f2b1f5c7e8f9c21016379dd5cc9348d95a128d4d7703a3aae`; input-snapshot SHA-256 is `98685be61374943436fa1e52a3eacd73fade2703710268bc931a2ebbb4ac20ad`; provenance SHA-256 is `15ace4fecf50fa7f9e7c361fc3d524110d80ab52b574276e740c99c8caa641ca`.

| Mall | Files / total raw bytes | Tree digest | Raw preview |
| --- | --- | --- | --- |
| Saigon Centre | 386 / 581,304,202 | `be0623e8651a490a7ce86f268047938c14ab1ff139e902144d0f226b87e7c105` | [EN](http://127.0.0.1:4411/en), [VI](http://127.0.0.1:4411/vi) |
| Vincom Đồng Khởi | 459 / 438,526,326 | `27f40bddbe629d91a86c02fd8c6792115af79a82eb28fe4f6be868318abcc63a` | [EN](http://127.0.0.1:4412/en), [VI](http://127.0.0.1:4412/vi) |

[Raw-preview checks](raw-preview-checks.json): **57/57 pass**, zero failures. Both mall servers use `serve-static.mjs` without `--acceptance`; exact HTML/disk equality covers both homes plus one floor and store route in each locale, root redirects to `/vi`, localized unknown routes return exact 404 HTML, acceptance endpoints return 404, and identity/negotiated/explicit Brotli model+geometry bytes and 304 validators pass. Reproduce while previews are running with `node evidence/continuation-2026-10-19-r2/release/check-raw-previews.mjs`. The [frozen startup receipt](raw-preview-startup.json) records owned PIDs 29380/10076; live stdout/stderr remain inside ignored `package/`, so tracked evidence does not change while servers remain running.

The coordinator's separate [final validation](../validation/README.md) reports four builds, 172 browser cases / 2,428 assertions, 752 route checks, 1,316 localized accepted-field checks and four isolation boundaries passing. This packaging receipt adds raw HTTP/disk equivalence, not additional performance or native visibility acceptance. Both packaged origins remain null and `releaseApproved:false`; this is not an origin-bound publication artifact.

## Reproduce after source is frozen

Run in `D:/Midterm/.scratch/combined-discovery-motion-2026-10-19` using the existing installed Node/npm dependencies. Do not run builds concurrently: `prepare-assets.mjs` shares/replaces `public/` staging. Keep all source, scripts, config, mall data and raw assets stable between the input snapshot and packaging.

```powershell
Remove-Item Env:INCLUDE_TEST_FIXTURES -ErrorAction SilentlyContinue
Remove-Item Env:PUBLIC_DISCOVERY_REVIEW -ErrorAction SilentlyContinue
Remove-Item Env:SITE_ORIGIN -ErrorAction SilentlyContinue
node scripts/package-local-release.mjs --record-inputs
npm run build:saigon
npm run build:vincom
node scripts/package-local-release.mjs --inspect
node scripts/package-local-release.mjs
```

Stop if either build or check fails. The script does not build, regenerate, serve, download, upload, install, or invoke Wrangler. Default package location is `evidence/continuation-2026-10-19-r2/release/package/`. Existing output is rejected; use a new `--out evidence/continuation-2026-10-19-r2/release/package-rN` for another run. `--snapshot` can name another checkout-relative input snapshot; use the same path for recording and packaging. Do not overwrite a completed receipt with a new build.

If source changes after the snapshot, take a new snapshot and repeat both public builds. The guard checks exact input hashes, including the approved overlay's validation/owner-decision records and exact hash-validated roster wording dependency, and requires every HTML file plus each build completion manifest to postdate the snapshot. Both static preparation and packaging fail closed if any root `.env` or `.env.*` file exists: Astro may otherwise load a review flag that is absent from the later Node process environment. No such files were present during preparation. This establishes an operational build sequence, not a cryptographic compiler attestation. Never manually touch stale output to bypass the guard.

The two mall folders contain the exact raw files from `dist/saigon-centre` and `dist/vincom-dong-khoi`, copied and verified without HTML injection or transformation. Sibling `*.files.json` and `*.sha256` describe every asset. `source-inputs.json` records source/config/mall-data/raw-asset hashes; `provenance.json` records Git HEAD, tracked dirty paths, Node version, input snapshot hash, per-mall tree digest and origin. `COMPLETE.json` is written last: its absence means an incomplete attempt, never a release package. Source files and secrets are not copied into the static artifacts. This is a directory package, not a timestamp-sensitive ZIP. Repeating against identical inputs/outputs gives identical mall file manifests and tree digests; snapshot time and environment provenance intentionally describe the actual run. The default `package/` folder is Git-ignored to avoid committing duplicated raw assets; retain small completion/provenance/checksum summaries separately as delivery evidence. A custom output name requires its own explicit exclusion before any commit.

The tool reuses `prepare-static-release.mjs` output, including `_headers`, root redirect and localized 404s. Its file counts include all final auxiliary files, unlike the older release manifest's pre-auxiliary count. It rejects fixture/review environment flags, non-public manifests, test/research/acceptance paths, injected acceptance script references, source maps, common key/env filenames, unexpected root files, symlinks, mismatched asset revision and configured local asset-size/count violations. Each build manifest now records `enrichmentReview`; packaging requires explicit `false`, so unsetting the current environment cannot accidentally admit an earlier review build. Missing markers also fail until a fresh build. These are bounded local guards, not a general secret scanner or a replacement for browser/content review.

## Preview the packaged bytes

After a successful package, start these in separate terminals without `--acceptance`:

```powershell
node scripts/serve-static.mjs --mall saigon-centre --dir evidence/continuation-2026-10-19-r2/release/package/saigon-centre --port 4411
node scripts/serve-static.mjs --mall vincom-dong-khoi --dir evidence/continuation-2026-10-19-r2/release/package/vincom-dong-khoi --port 4412
```

Check `/en`, `/vi`, floor/store deep links, root redirect, truthful unknown-route 404, and identity/Brotli geometry. The server's `--acceptance` mode injects browser fixtures into HTML responses; those responses are test evidence only and are never packaging inputs. Packaging always reads disk files directly.

## Local readiness versus publication

| Item | Evidence / remaining action |
| --- | --- |
| Packaging tooling | `scripts/package-local-release.mjs`; syntax check and read-only inspection passed on the pre-continuation outputs. |
| Final source/build/package | Delivered for source `3e505fb`; see final local receipt above and the separate final-validation evidence. |
| Content and browser acceptance | Use the coordinator's final source-bound review evidence. Packaging does not confer additional copy, geometry, motion or runtime acceptance. |
| Origins | Current inspected release manifests have `siteOrigin: null`; this local package is not an origin-bound publication candidate. Existing proposed origins and target configs are documented in the earlier release plan. |
| Publication decision | Separate explicit authorization for the exact final candidate and the two public targets remains required. `releaseApproved` stays false. |
| Account and zero spending | Existing earlier account probes are historical. At authorized publication time verify the current intended account/target and applicable static hosting limits/cost conditions; no account access or fresh plan claim was made here. |
| Runtime | Production HTTPS route/encoding/404 and complete-frame loading checks require an actual authorized deployment. Native/shared-preview limits remain as recorded by the coordinator; physical checks retain the existing waiver/not-run status. |

When origins are approved, set each mall's approved `SITE_ORIGIN` immediately before its sequential build, following a fresh input snapshot, then rerun packaging and browser/metadata checks for those exact bytes. Confirm the `siteOrigin` recorded for each package. Earlier `implementation/mall-visitor/evidence/release-plan-2026-10-18/README.md` contains historical proposed targets and deployment commands; none were executed here. This document deliberately performs no deployment or Wrangler account contact.

## Read-only tooling check

`node --check` passes for both packaging/preparation scripts. Initial `--inspect` passed against older outputs; after review-build hardening those older manifests correctly failed for missing explicit `enrichmentReview:false`. Setting `PUBLIC_DISCOVERY_REVIEW=1` is rejected before any output write. These historical checks preceded the coordinator's final builds; successful final packaging and raw-preview checks are recorded above.
