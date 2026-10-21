"""Place escalator, lift, restroom, exit, ATM and information icons on the Saigon Centre floor maps.

Usage: python scripts/extract-plan-icons.py
Reads  docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-floorPlanMap-en.json
         (the mall's own floor-plan features, longitude/latitude)
       data/research/saigon-plan-affine-2026-10-22.json
         (per-floor affine fit from longitude/latitude to the supplied plan raster, from the 21 October walkway survey)
       data/malls/saigon-centre/floor-geometry.json (raster -> map units transform)
Writes data/malls/saigon-centre/plan-icons.json

These are visual labels only. They are not routing nodes and make no accessibility or door claims.
"""
import json
import math
import numpy as np

OFFICIAL = 'docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-floorPlanMap-en.json'
AFFINE = 'data/research/saigon-plan-affine-2026-10-22.json'
GEOMETRY = 'data/malls/saigon-centre/floor-geometry.json'
OUT = 'data/malls/saigon-centre/plan-icons.json'

LABELS = {
    'escalator': ('Escalator', 'Thang cuốn'),
    'lift': ('Lift', 'Thang máy'),
    'restroom': ('Restrooms', 'Nhà vệ sinh'),
    'exit': ('Emergency exit', 'Lối thoát hiểm'),
    'atm': ('ATM', 'ATM'),
    'info': ('Information', 'Quầy thông tin'),
}
# Merge radius in map units (1 unit = 1 metre on the supplied plan scale)
RADIUS = {'escalator': 2.5, 'lift': 2.0, 'restroom': 4.0, 'exit': 3.0, 'atm': 2.0, 'info': 2.0}


def flat(coords):
    if not coords:
        return []
    if isinstance(coords[0], (int, float)):
        return [coords]
    out = []
    for item in coords:
        out += flat(item)
    return out


def centroid(geometry):
    points = flat(geometry.get('coordinates') or [])
    if not points:
        return None
    if geometry.get('type') == 'Polygon' and points[0] == points[-1]:
        points = points[:-1]
    arr = np.array(points)[:, :2]
    return arr.mean(0)


def classify(props):
    name = (props.get('name') or '').strip()
    kind = props.get('type')
    icon = props.get('icon')
    if kind == 'escalator':
        return 'escalator', {}
    if icon == 'elevator' or (kind == 'polygon' and name.lower().startswith('zone')):
        return 'lift', {'zone': name}
    if icon in ('wheelchair',):
        return 'restroom', {'accessible': True}
    if icon == 'baby-changing' or kind == 'nursery':
        return 'restroom', {'baby': True}
    if (icon == 'toilet' or kind in ('toilet', 'Restroom')) and name.lower() != 'wall':
        return 'restroom', {}
    if kind == 'exit' or name == 'Emergency Fire Exit':
        return 'exit', {}
    if kind == 'atm':
        return 'atm', {}
    if kind in ('info', 'customer-service') or icon in ('info', 'customer-service'):
        return 'info', {}
    return None, {}


official = json.load(open(OFFICIAL, encoding='utf8'))
affine = json.load(open(AFFINE, encoding='utf8'))['floors']
geometry = json.load(open(GEOMETRY, encoding='utf8'))
transform = {f['id']: f['sources'][0]['transform'] for f in geometry['floors']}

result = {}
for item in official['items']:
    props = item['properties']
    floor = props['floor'][0]
    if floor not in transform or floor not in affine:
        continue
    A = np.array(affine[floor])
    sx, _, _, sy, tx, ty = transform[floor]
    layout = json.loads(props['layout'])
    found = []
    for feature in layout.get('features', []):
        p = feature.get('properties') or {}
        kind, extra = classify(p)
        if not kind:
            continue
        c = centroid(feature.get('geometry') or {})
        if c is None:
            continue
        px = np.r_[c[0], c[1], 1] @ A
        found.append({'kind': kind, 'x': sx * px[0] + tx, 'y': sy * px[1] + ty, **extra})
    merged = []
    for icon in found:
        for m in merged:
            if m['kind'] == icon['kind'] and math.hypot(m['x'] - icon['x'], m['y'] - icon['y']) < RADIUS[icon['kind']] and not (icon['kind'] == 'lift' and m.get('zone') != icon.get('zone')):
                m['n'] += 1
                m['accessible'] = m.get('accessible') or icon.get('accessible', False)
                m['baby'] = m.get('baby') or icon.get('baby', False)
                break
        else:
            merged.append({**icon, 'n': 1, 'accessible': icon.get('accessible', False), 'baby': icon.get('baby', False)})
    rows = []
    for m in merged:
        en, vi = LABELS[m['kind']]
        if m['kind'] == 'lift' and m.get('zone'):
            en, vi = f"Lift · {m['zone']}", f"Thang máy · {m['zone']}"
        if m['kind'] == 'restroom':
            if m['accessible']:
                en += ' · accessible'
                vi += ' · lối cho xe lăn'
            if m['baby']:
                en += ' · baby changing'
                vi += ' · chăm sóc em bé'
        rows.append({'kind': m['kind'], 'x': round(m['x'], 2), 'y': round(m['y'], 2), 'label': {'en': en, 'vi': vi}})
    result[floor] = sorted(rows, key=lambda r: (r['kind'], r['x'], r['y']))

out = {
    'mallId': 'saigon-centre',
    'source': 'Official Saigon Centre floor-plan features (docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-floorPlanMap-en.json) projected onto the supplied plan rasters with the per-floor affine fit in data/research/saigon-plan-affine-2026-10-22.json. Visual labels only; not routing nodes.',
    'floors': result,
}
open(OUT, 'w', encoding='utf8', newline='\n').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
for floor in ['B2', 'B1', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6']:
    rows = result.get(floor, [])
    counts = {}
    for r in rows:
        counts[r['kind']] = counts.get(r['kind'], 0) + 1
    print(floor, counts)
