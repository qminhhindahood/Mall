# Official-source read — 21 October 2026

Successfully read all three user-supplied pages with the web tool:

- https://takashimaya-vn.com/en/floor-map-eng/ lists B2, B1, L1, L2 and L3 on the department-store website. B2 image link resolves to https://takashimaya-vn.com/wp-content/uploads/2026/09/B2-100-scaled.jpg and L2 to https://takashimaya-vn.com/wp-content/uploads/2026/09/L2-100-1-scaled.jpg. These URL names match archived references, but no fresh byte equivalence is claimed. Direct visual inspection of the archived B2 image confirms it also depicts surrounding Saigon Centre units (including Meat & Meet and Annam) separately from Takashimaya's internal counters. Do not treat the website brand as the boundary of everything drawn on its images.
- https://takashimaya-vn.com/en/brands/ supplies department-store brands/floors/categories. This is not the whole Saigon Centre directory, and it does not supply the wider mall's L5 routing geometry.
- https://vincom.com.vn/vincom-center-dong-khoi/gian-hang lists Siam Sugar, Chilli Thai, Chang Kang Kung and Meat & Meet on B3 and Runam Boutique on B2. The linked current directory records support floor identity, not precise unit boundaries, corridor connections or entrances.

Visible source geometry and accepted destination/area associations must supply the latter. Area routes stop adjacent to a labelled frontage; neither page establishes an exact door, metric distance, accessibility or paired cross-floor connection.

Linked Siam Sugar store page also loaded successfully and identifies the brand/mall; it supplies no corridor graph. Linked Chilli Thai and Chang Kang Kung detail pages timed out in the web tool. The successfully read main mall directory remains the fresh floor-level check for those two records; no unseen detail-page content is claimed.

## Download limitation

Local Python HTTPS requests to these three pages and two image URLs failed with WinError10013 (socket access forbidden). `fetch.json` preserves all five exact attempted targets/errors. No bytes were downloaded, no uncertain outcome, and no retry/bypass was performed. Web-tool page reading succeeded independently. Consequently fresh downloaded-image hash comparison is unavailable; local input hash comparison remains possible and is recorded separately.
