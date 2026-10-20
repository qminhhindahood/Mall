# R3 enrichment runtime support

The three-file change adds `cuisine` as a bilingual text enrichment field. Build validation requires a Dining category and rejects a cuisine action URL. Discovery metadata uses the same accepted/provisional compile-time gates as shared details. Existing cuisine remains the fallback. An enriched cuisine is shown once in the provenance-bearing detail section rather than duplicated in the baseline definition list; the shared component still serves Discovery, map and static/no-JavaScript pages.

Accepted entries retain required approval, reviewer and source provenance. Both dates must be valid ISO calendar dates; `checkedAt <= reviewedAt <= today` replaces the former same-day equality. Invalid dates now fail through the explicit validator instead of potentially throwing `RangeError`.

Scoped Astro check: 32 files, zero errors/warnings/hints. `git diff --check` passes. See `source.diff`, `receipt.json` and `typecheck.txt`. No full build, unit/helper assertions or fresh browser run was performed here. Central integration owns accepted JSON and the final browser validation.

Pending integrated browser checks: newly accepted cuisine appears once in localized Discovery/map/static detail bodies with source/date/scope/caveat; Discovery result metadata agrees; baseline cuisine fallback and non-Dining category labels remain; fixtures exclude enrichment; held/provisional values stay out of ordinary public output. Actual older source-check/newer-review entries must build successfully.

FaceShop/Clinique inherited Dining classification is an evidence hold. This lane does not reinterpret the frozen approved taxonomy or add unsupported cuisine. Canonical branches, directory data, assets, geometry, styles, floor guidance and release approval remain outside this change.
