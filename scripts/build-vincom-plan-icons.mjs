// Build data/malls/vincom-dong-khoi/plan-icons.json from icon centres read off the seven supplied plans.
// Pixel centres were detected from the black square pictograms (24 px window, >55% black) and each kind was
// confirmed on a full-floor overlay. Map positions use each floor's existing raster transform in floor-geometry.json.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const geometry = JSON.parse(readFileSync(`${root}/data/malls/vincom-dong-khoi/floor-geometry.json`, 'utf8'));

const px = {
  B3: [['escalator',222,279],['restroom',108,477],['escalator',374,507],['escalator',374,583],['lift',224,618],['restroom',554,687],['lift',223,751]],
  B2: [['escalator',265,285],['restroom',162,468],['escalator',420,573],['lift',260,701]],
  B1: [['escalator',430,667],['lift',260,696]],
  L1: [['escalator',397,479],['lift',180,556],['escalator',396,601],['lift',643,468],['lift',643,612]],
  M: [['escalator',426,476],['escalator',426,597],['lift',202,612]],
  L2: [['escalator',431,469],['lift',206,539],['escalator',431,591]],
  L3: [['escalator',421,453],['lift',201,564],['escalator',421,575]],
};
const labels = {
  escalator: { en: 'Escalator', vi: 'Thang cuốn' },
  lift: { en: 'Lift', vi: 'Thang máy' },
  restroom: { en: 'Restrooms', vi: 'Nhà vệ sinh' },
};

const floors = {};
for (const [floorId, items] of Object.entries(px)) {
  const floor = Object.values(geometry.floors).find(f => f.id === floorId);
  const [a, , , , tx, ty] = floor.sources[0].transform;
  floors[floorId] = items.map(([kind, x, y]) => {
    const label = { ...labels[kind] };
    if (floorId === 'B3' && kind === 'escalator' && x === 374 && y === 507) {
      label.en = 'Escalator · beside B3-13';
      label.vi = 'Thang cuốn · cạnh B3-13';
    }
    return { kind, x: Math.round((a * x + tx) * 100) / 100, y: Math.round((a * y + ty) * 100) / 100, pixel: [x, y], label };
  });
}

const packet = {
  mallId: 'vincom-dong-khoi',
  source: 'Black pictograms on the seven supplied Vincom Center Đồng Khởi plans in assets/vincom-dong-khoi/maps (B3, B2, B1, L1, M, L2, L3). Detected from the raster, not a vector feature file; positions are schematic map units from the same transform the floor geometry records. The plans are not registered to each other: cross-floor connector pairing is positional, not a surveyed shaft.',
  detection: {
    method: 'Dark-square detection (24 px window, at least 55% near-black pixels), then visual confirmation of each glyph on a full-floor overlay.',
    review: 'evidence/vincom-routing-2026-10-22/icons-overlay-{floor}.png',
    alignment: 'evidence/vincom-routing-2026-10-22/README.md',
    pixelTransform: 'data/malls/vincom-dong-khoi/floor-geometry.json sources[0].transform',
  },
  floors,
};
writeFileSync(`${root}/data/malls/vincom-dong-khoi/plan-icons.json`, `${JSON.stringify(packet, null, 2)}\n`);
console.log(JSON.stringify(Object.fromEntries(Object.entries(floors).map(([f, list]) => [f, list.length]))));
