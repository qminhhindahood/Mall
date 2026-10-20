# Local release tooling source review

Reviewer: Codex delegated integration reviewer. Date: 2026-10-19 UTC.
Scope: scripts/package-local-release.mjs and prepare-static-release.mjs, including their actual public-build dependencies. Read-only review; no packaging, deployment or source edits by reviewer.

## Findings — resolved by source follow-up

**P2 — Build-input snapshot omits approval dependencies.** inputs() hashes src, assets, data/malls, scripts and selected config files, but the production build also reads docs/content-preparation/approved-directory-2026-10-18-r1/validation.json, owner-decision.json and the file named by owner-decision.source. scripts/approved-overlay.mjs consumes these during both asset preparation and site construction. A change to these inputs after recording the snapshot is invisible to sourceDigest. Include the exact approval dependencies, safely resolving the referenced source within the checkout. Hashing all unrelated documentation is unnecessary.

**P2 — Review-mode manifest can disagree with Astro dotenv resolution.** Astro's installed env-loader.js uses Vite loadEnv with the project root (and production build mode); prepare-static-release.mjs reads only the invoking process.env.PUBLIC_DISCOVERY_REVIEW. A .env-provided review flag could therefore include provisional values while the later manifest records enrichmentReview:false. No .env file was present during review, so no current-output leak is claimed. Fail closed on unsupported applicable environment files, or bind manifest mode to the same resolved configuration; include permitted build-env inputs in snapshot provenance.

Both findings were sent to the parent and repaired by the release worker. These are bounded tooling corrections before making reproducibility/isolation claims, not a request to publish.

## Positive checks

- Packaging has no network/deploy command; its only subprocess use records Git provenance.
- Package input flags, explicit public manifest markers, approved directory status and asset revision are checked. Missing review markers correctly reject old outputs.
- Static paths reject test/acceptance/research artifacts, source maps and common secret filenames. Symlink entries are rejected. These are bounded guards, not a general secret scan.
- The output must be new; source files are not rewritten or removed. Copies are hash-verified, source/build drift is checked again, and COMPLETE.json is written last.
- HTML/build-manifest timestamps are explicitly described as an operational sequence guard, not compiler attestation. Null origins and releaseApproved:false preserve the local-only boundary.

## Indoor guidance follow-up

The manual-start help now says persistence applies when browser storage is available, in both EN and VI. This matches the caught read/write failures; no material guidance source finding remains. The separate indoor-guidance-review.md records the prior resolved findings and pending final rendered validation.

## Completion

Source follow-up confirms both P2 findings are resolved. inputs() now includes the two approval JSON files and the exact expected wording dependency. It rejects an unexpected owner-decision.source path and compares the wording bytes to both approval/validation hashes. All three dependency hashes therefore participate in sourceDigest.

Both preparation and packaging now reject root .env and .env.* names before writing their release metadata/package, preventing the observed Astro/process-env disagreement under the current root envDir configuration. The guard is intentionally conservative, including .env.example; it does not read or expose file contents. Existing explicit public-mode manifest requirements remain intact.

No remaining material source finding. Final input freeze, sequential builds and actual package validation are still required; this report does not claim a completed package exists. Reviewed SHA-256:

- scripts/package-local-release.mjs: C8E2E0A5D1E5484DC4EA6B9AEAEC3345597E04D09399676B84647FB6AD18471E
- scripts/prepare-static-release.mjs: EBECA816CED0BD50EC6D91B16D4FABDDD45129E44496468322812A5A06CD4F4C
