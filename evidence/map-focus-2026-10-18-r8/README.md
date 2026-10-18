# Map focus rings and Vincom parity — 18 October 2026, r8

Owner screenshots show oversized black/white rounded boxes across floor plans. Reproduced by focusing an SVG map path in T3: computed CSS outline3px, offset4px and white box-shadow2px. Global HTML focus decoration was applied to SVG paths, scaling in map coordinates and painting a rectangular ring over the geometry. This is not floor geometry or a map marker.

A scoped path focus rule removes the rectangular outline/shadow. Keyboard focus uses a2.5px non-scaling contour stroke in the existing mall accent. Pointer/keyboard selection, pressed states, numbering, deep links and all ordinary HTML focus indicators remain. No motion timing change.

Six builds pass. Eight focused browser cases pass across both malls, map/Discovery and desktop1280×800/phone390×844. Cases explicitly focus a path, verify bounded contour focus, activate with Enter, and confirm selected geometry plus an area/detail card. Discovery categories and results remain populated. Screenshots inspected in frames/. Chrome149/SwiftShader and CSS viewport evidence, not physical-device or native performance acceptance. T3 independently verified the prior ring and a live Vincom Chang Kang Kung click/detail/selection.

## Vincom interaction question

Vincom uses the same FloorMap, Explorer and Discovery components. Its default B2 map has14 interactive paths; Dining Discovery previews B3 with4 interactive paths and3 category numbers (42 listings across floors). Saigon L5 currently has27 paths and24 Dining numbers. Both sites have12 categories. Final tested Vincom pointer selection opens Chang Kang Kung details; keyboard selection and cards work at both widths.

The main disparity is sparse map-to-place associations, not a disabled interface. source-coverage.json counts original research input only, before accepted overlay additions/display holds: Vincom143 records/23 with any map link, versus Saigon163/119. Vincom B1 has32 records and no original links. Decorative reference-zone paths provide a complete-looking backdrop but are not verified destination boundaries. Existing no-marker treatment deliberately retains floor/list/card access for unresolved locations. Making every backdrop shape clickable would invent associations and repeat the owner's rejected broad-area placement. No locations or geometry were fabricated/promoted in this fix. Final current default-view path counts are in browser-results.json; source coverage is not claimed as final current occupancy.

One changed source file: src/styles/journey.css. Tested source/output hashes in provenance.json, exact two-site propagation in propagation.json. Assets, accepted motion-off baseline, content gates, held locations and Highlights remain unchanged. No push or deployment. Further Vincom map coverage needs supported individual location boundaries.
