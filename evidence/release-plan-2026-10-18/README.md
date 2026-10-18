# Prepared publication plan — 18 October 2026

The complete wording and roster are owner-approved for local integration. Public publication is still unapproved. No deploy, upload, push, paid-resource change or subscription change has occurred.

## Exact targets

| Site | Existing Wrangler target | Proposed public origin | Static output |
| --- | --- | --- | --- |
| Saigon Centre | `midterm-saigon-centre` | `https://midterm-saigon-centre.anothermiralph.workers.dev` | `dist/saigon-centre` |
| Vincom Đồng Khởi | `midterm-vincom-dong-khoi` | `https://midterm-vincom-dong-khoi.anothermiralph.workers.dev` | `dist/vincom-dong-khoi` |

[Fresh sanitized authentication](environment.json) verifies Wrangler 4.150.0 and one authenticated account. [Read-only target probe](hosting-targets.json) verifies the account workers.dev subdomain; the existing two configuration names select the targets above. Account identity and credentials are not stored. The account subscriptions GET returns403/code10000; no account plan is inferred.

Both configurations contain only static assets, compatibility date, HTML handling and404 handling: no Worker entry point, SSR, `run_worker_first`, paid binding, custom domain or paid service. Cloudflare documents static-asset requests as free and unlimited, with no additional asset storage cost ([official billing documentation](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), checked18October2026). This supports zero incremental hosting cost for this static-only release irrespective of the unreadable account subscription listing. Existing unrelated account spending is not assessed. Build-time asset-count/per-file limits and local dry runs are recorded separately.

## Commands prepared, not executed as deployment

Run from the corresponding final site checkout's `visitor-app` directory. Keep research/fixture mode unset. After the owner explicitly approves the two public origins, set the matching `SITE_ORIGIN` and rebuild to emit canonical sitemap/robots metadata; verify the final artifact manifest and static content before upload. No account or configuration change is needed.

Saigon Centre, `.scratch/issue-0005-takashimaya/visitor-app`:

```powershell
$env:SITE_ORIGIN = 'https://midterm-saigon-centre.anothermiralph.workers.dev'
npm run build:saigon
npm run dry-run:saigon
npx --no-install wrangler deploy --config wrangler.saigon-centre.jsonc
```

Vincom, `.scratch/mall-branch-bootstrap/visitor-app`:

```powershell
$env:SITE_ORIGIN = 'https://midterm-vincom-dong-khoi.anothermiralph.workers.dev'
npm run build:vincom
npm run dry-run:vincom
npx --no-install wrangler deploy --config wrangler.vincom-dong-khoi.jsonc
```

The deploy lines require the separate owner publication decision. Local installed Wrangler help confirms these flags. Following any authorized upload, verify both bilingual entry routes, one floor/store deep link, identity/Brotli geometry headers and real complete-frame loading at the deployed HTTPS origins. Production/network and genuine native background-tab acceptance cannot be established by the local builds. Richer Discovery detail content and Highlights remain deferred. Artifact commits, hashes, source parity and local packaging checks are recorded in the final propagation receipt.
