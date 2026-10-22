"""Turn the saved official Takashimaya brand table into proposed basic listings.

Usage: python scripts/import-takashimaya-brands.py
Reads  evidence/takashimaya-brands-2026-10-22/brands-en.html (saved from
       https://takashimaya-vn.com/en/brands/ on 2026-10-22)
Writes data/research/takashimaya-brands-2026-10-22-r1.json

Names keep the source spelling. Rows are merged only when the normalised name
matches (the same brand on several floors). Names that collide with an existing
mall store get a ' · Takashimaya' suffix so the two places stay distinguishable.
"""
import hashlib, html, io, json, re, sys, unicodedata
from collections import OrderedDict

SRC = 'evidence/takashimaya-brands-2026-10-22/brands-en.html'
OUT = 'data/research/takashimaya-brands-2026-10-22-r1.json'
DIRECTORY = 'data/malls/saigon-centre/directory.json'
URL = 'https://takashimaya-vn.com/en/brands/'
DATE = '2026-10-22'
FLOORS = ['B2', 'B1', 'L1', 'L2', 'L3']

# official category -> existing directory category ids
BEAUTY, DINING, FASHION, JEWEL, HEALTH, ELECTRONICS, SPORTS, HOME, LIFESTYLE = (
    'category-3', 'category-1', 'category-2', 'category-4', 'category-7', 'category-8', 'category-9', 'category-10', 'category-11')
CATEGORY_MAP = {
    'cosmetics': BEAUTY, 'cosmetic': BEAUTY, 'fragrances': BEAUTY, 'fragrance': BEAUTY,
    'cosmetics & fragrances': BEAUTY, 'cosmetics & fragrances & prestige': BEAUTY, 'beautech': BEAUTY,
    'beautech/ household': BEAUTY, 'nail / hair salon': BEAUTY,
    'jewelry': JEWEL, 'jewelry & accessories': JEWEL, 'accessories': JEWEL, 'watch': JEWEL,
    'f&b': DINING, 'dine-in': DINING, 'wine': DINING,
    'ladies fashion': FASHION, 'international fashion': FASHION, 'international fashion & accessories': FASHION,
    'international fashion/ multi-brand': FASHION, 'golf fashion': FASHION, 'lingeries': FASHION, 'loungewear': FASHION,
    'young fashion': FASHION, "men's wear & accessories": FASHION, 'fashion & accessories': FASHION, 'kids wear': FASHION,
    'children wear': FASHION, 'kids shoes': FASHION, 'shoes': FASHION, 'shoes & bags': FASHION, 'bags': FASHION, 'bag': FASHION,
    'bags & accessories': FASHION, 'international bags & accessories': FASHION, 'sunglasses': FASHION,
    'sportwear': SPORTS, 'sportswear': SPORTS, 'swimwear': SPORTS,
    'household': HOME, 'bedding': HOME,
    'toy': LIFESTYLE, 'toys': LIFESTYLE, 'baby zone': LIFESTYLE, 'baby': LIFESTYLE, 'luggage': LIFESTYLE,
    'luggage & accessories': LIFESTYLE, 'travel accessories': LIFESTYLE, 'music instruments': LIFESTYLE,
    'technical accessories': ELECTRONICS, 'high-end music accessories': ELECTRONICS,
    'massage chair': HEALTH, 'healthcare accessories': HEALTH,
}
# entries that read as a product zone rather than one brand: kept as published, flagged for review
ZONE_NAMES = ('feeding bedding', 'infant toys', 'wheeled goods', 'mini brands')
SUSPECT_SPELLING = {'sketchers': 'Skechers?', 'royal albartross': 'Royal Albatross?', 'm05ch1n0 jeans': 'Moschino Jeans?'}


def norm(text):
    text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'\s+', ' ', text).strip()


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', norm(text)).strip('-')


raw = open(SRC, 'rb').read()
page = raw.decode('utf8', errors='replace')
found = re.findall(r'<td class="column-1">(.*?)</td><td class="column-2">(.*?)</td><td class="column-3">(.*?)</td>', page, flags=re.S)
rows = [(html.unescape(a).strip(), html.unescape(b).strip(), html.unescape(c).strip()) for a, b, c in found]
blank = [r for r in rows if not r[0]]
rows = [r for r in rows if r[0]]
for name, floor, cat in rows:
    assert floor in FLOORS, (name, floor)
    assert cat.lower() in CATEGORY_MAP, ('unmapped official category', cat, name)

existing = json.load(open(DIRECTORY, encoding='utf8'))
existing_names = {norm(d['name']['en']) for d in existing['destinations']}

merged = OrderedDict()
for name, floor, cat in rows:
    merged.setdefault(norm(name), {'name': name, 'rows': []})['rows'].append((floor, cat))

destinations, ids = [], set()
flags = {'suffixed': [], 'merged': [], 'zones': [], 'combined': [], 'spelling': []}
for key, item in merged.items():
    name = item['name']
    floors = [f for f in FLOORS if any(r[0] == f for r in item['rows'])]
    officials = sorted({r[1] for r in item['rows']})
    cats = []
    for official in officials:
        cid = CATEGORY_MAP[official.lower()]
        if cid not in cats:
            cats.append(cid)
    display = name
    if key in existing_names:
        display = name + ' · Takashimaya'
        flags['suffixed'].append(name)
    if len(item['rows']) > 1:
        flags['merged'].append({'name': name, 'floors': floors, 'officialCategories': officials})
    if key in ZONE_NAMES:
        flags['zones'].append(name)
    if '/' in name:
        flags['combined'].append(name)
    if key in SUSPECT_SPELLING:
        flags['spelling'].append({'name': name, 'maybe': SUSPECT_SPELLING[key]})
    base = 'saigon-takashimaya-' + slug(name)
    ident, n = base, 2
    while ident in ids:
        ident = base + '-' + str(n)
        n += 1
    ids.add(ident)
    source = URL + ' (Floor column, ' + DATE + ')'
    destinations.append({
        'id': ident, 'name': {'vi': display, 'en': display}, 'primaryFloor': floors[0], 'floors': floors,
        'description': {'vi': '', 'en': ''}, 'reviewedAt': DATE, 'categories': cats,
        'aliases': sorted({name, *officials, 'Takashimaya'}), 'status': 'open',
        'locations': [{'floorId': f, 'certainty': 'floor-confirmed', 'areaIds': [], 'source': source} for f in floors],
        'review': {'source': 'data/research/takashimaya-brands-2026-10-22-r1.json; ' + URL, 'reviewedAt': DATE,
                   'reviewedBy': 'Imported from the official Takashimaya brand directory; owner confirmation pending',
                   'languages': {'vi': True, 'en': True}},
        'officialCategories': officials,
    })

out = {
    'mallId': 'saigon-centre', 'revision': 'takashimaya-brands-2026-10-22-r1', 'activation': 'accepted-owner-request',
    'source': {'url': URL, 'fetchedOn': DATE, 'evidence': SRC, 'pageSha256': hashlib.sha256(raw).hexdigest(),
               'tableRows': len(rows) + len(blank), 'blankRows': len(blank), 'brandRows': len(rows)},
    'counts': {'destinations': len(destinations), 'byFloor': {f: sum(1 for d in destinations if f in d['floors']) for f in FLOORS}},
    'flags': flags, 'destinations': destinations,
}
open(OUT, 'w', encoding='utf8', newline='\n').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf8')
print(json.dumps({'rows': len(rows), 'blank': len(blank), 'destinations': len(destinations), 'byFloor': out['counts']['byFloor'],
                  'flags': {k: len(v) for k, v in flags.items()}}, ensure_ascii=False))
