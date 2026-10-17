"""Compile preserved first-party HTTP evidence, without editorial approval or registration guesses."""
import csv
import hashlib
import html
import json
import pathlib
import re
import unicodedata

HERE = pathlib.Path(__file__).resolve().parent
APP = HERE.parents[3]
ORIGIN = 'https://shopping.saigoncentre.com.vn'
DATE = '2026-10-17'

def read(name):
    return json.loads((HERE / name).read_text(encoding='utf8'))

def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf8')

def norm(value):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower())

def text(value):
    if isinstance(value, dict):
        value = value.get('markup') or ''
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', ' ', value or ''))).strip()

def assets(props):
    result = []
    for field in ['storeLogo', 'storeThumbnail', 'storeBanner', 'videoImageCover']:
        values = props.get(field) or []
        for item in values if isinstance(values, list) else [values]:
            if not isinstance(item, dict) or not item.get('url'):
                continue
            result.append({
                'sourceField': field, 'url': ORIGIN + item['url'],
                'sourceMediaId': item.get('id'), 'name': item.get('name'),
                'width': item.get('width'), 'height': item.get('height'),
                'kind': 'logo' if field == 'storeLogo' else 'store-associated-image-candidate',
                'reviewedAsPhysicalStorePhoto': False, 'reuseRights': 'unknown',
                'rightsEvidenceUrl': None,
            })
    return result

def source_map(item):
    raw = item.get('properties', {}).get('mapData')
    return json.loads(raw) if isinstance(raw, str) and raw else raw

en = read('official-directory-en.json')['items']
vi = {x['id']: x for x in read('official-directory-vi.json')['items']}
index = {norm(x['name']): x for x in en}
aliases = {
    'oedoalley': 'Oedo Alley - Japanese Food Village',
    'asanoha': 'Asanoha - Modern Japanese Hotpot',
    'longjing': 'LONGJING Restaurant',
    'matinkimvietnam': 'Matin Kim',
    'thebodyshop': 'THE BODY SHOP VIETNAM',
    'gyushigeyakiniku': 'Gyu Shige – Nguu Phon',
    'gongcha': 'GONG CHA VIET NAM',
    'bastahiroitalianrestaurant': 'Basta Hiro',
    'eccovietnam': 'ECCO Vietnam',
    'colehaanvietnam': 'Cole Haan Việt Nam',
    'thegioikimcuong': 'DIAMOND WORLD',
    'somtamthai': 'Som ตำ Thai',
    'tagheuer': 'TAG HEUER (Opening Soon)',
    'jindinroutaiwaneserestaurant': 'Jin Din Rou - 京鼎樓',
}

def match(name):
    key = norm(name)
    return index.get(norm(aliases.get(key, name)))

current = []
for item in en:
    props = item['properties']
    counterpart = vi.get(item['id'])
    current.append({
        'officialId': item['id'], 'name': item['name'].strip(),
        'sourceUrls': {'en': ORIGIN + '/en' + item['slug'], 'vi': ORIGIN + '/vi' + counterpart['slug'] if counterpart else None},
        'floorClaims': props.get('floorLocation'), 'unitClaim': props.get('storeLocationDetail'),
        'sourceReportedStatus': props.get('storeStatus'), 'website': props.get('website'),
        'descriptionEvidence': {'en': text(props.get('storeDescription')), 'vi': text(counterpart['properties'].get('storeDescription')) if counterpart else ''},
        'imageCandidates': assets(props), 'officialMapData': source_map(item),
        'retrievedDate': DATE, 'editorialApproval': 'pending', 'photoRightsApproval': 'pending',
    })
current_index = {x['officialId']: x for x in current}

ledger_path = APP / 'docs/content-preparation/discovery-integration-2026-10-17/floor-location-ledger.csv'
ledger = list(csv.DictReader(ledger_path.open(encoding='utf-8-sig')))
pending = [r for r in ledger if r['mall'] == 'saigon-centre' and r['state'] == 'precise-location-pending']
findings = []
for row in pending:
    item = match(row['name'])
    assert item, row
    official = current_index[item['id']]
    geometry = official['officialMapData']
    supported = [f for f in (geometry or {}).get('floor', []) if f.get('floorId') == row['floor']]
    conflicts = []
    if row['name'] in ['Irvins', 'llaollao']:
        conflicts.append('Both official records print B2-K5 but their source geographic polygons differ. Printed code cannot uniquely identify occupancy or schematic region.')
    if row['name'] in ['Label Lab', 'Moschino']:
        conflicts.append('Both official records print L2-17 but their source geographic polygons differ. Do not collapse identities or infer shared occupancy from the code.')
    if row['name'] == 'Matin Kim Vietnam':
        conflicts.append('Official Matin Kim and Miana both print L3-12; Matin Kim is source-reported Opening Soon and has no mapData. Current occupancy needs confirmation.')
    if row['name'] == 'Takashimaya':
        conflicts.append('Mall store record floorLocation contains only B2 although detail is B2-L3; Takashimaya own floor guide confirms B2, B1, L1, L2, L3. Store-level mapData is null. Department-store extent is not supplied as a unified footprint.')
    findings.append({
        'previewId': row['previewId'], 'previewName': row['name'], 'requestedFloor': row['floor'],
        'officialId': item['id'], 'officialName': item['name'].strip(),
        'sourceUrls': official['sourceUrls'], 'unitClaim': official['unitClaim'],
        'officialFloorClaims': official['floorClaims'], 'sourceReportedStatus': official['sourceReportedStatus'],
        'sourceGeographicPolygonsForRequestedFloor': supported,
        'mappingEvidenceState': 'official-geographic-polygon-unregistered-to-local-schematic' if supported else 'official-floor-unit-claim-no-store-polygon',
        'localSchematicRegistration': 'not-established', 'conflicts': conflicts,
        'imageCandidates': official['imageCandidates'],
        'bilingualSourceDescriptionAvailable': {locale: bool(value) for locale, value in official['descriptionEvidence'].items()},
        'retrievedDate': DATE, 'finalMappingApproval': 'pending',
    })

local = json.loads((APP / 'data/research/saigon-centre.json').read_text(encoding='utf8'))['records']
matched_ids = {match(r['name'])['id'] for r in local if match(r['name'])}
unmatched = [{'previewId': r['id'], 'name': r['name']} for r in local if not match(r['name'])]
additional = [dict(officialId=x['officialId'], name=x['name'], unitClaim=x['unitClaim'], sourceUrls=x['sourceUrls']) for x in current if x['officialId'] not in matched_ids]
taka = read('official-storeInfoTaka-en.json')['items']
layouts = read('official-floorPlanMap-en.json')['items']
floor_features = {}
for item in layouts:
    props = item['properties']
    floor_features[props['floor'][0]] = json.loads(props['layout'])
map_bundle = {
    'sourceOrigin': ORIGIN, 'retrievedDate': DATE,
    'coordinateContract': 'Source geographic longitude/latitude coordinate pairs rendered by official app in Web Mercator. No registration to existing source-palette-schematic-2026-10-13-r2 pixel coordinates is established.',
    'layouts': floor_features,
    'stores': [{'officialId': x['id'], 'name': x['name'], 'mapData': source_map(x)} for x in en],
    'takashimayaCounters': [{'officialId': x['id'], 'name': x['name'], 'sourceUrl': ORIGIN + '/en' + x['slug'], 'floorClaims': x['properties'].get('floorLocation'), 'mapData': source_map(x)} for x in taka],
    'approval': 'pending',
}
write('official-source-map.json', map_bundle)
counter_roster = read('takashimaya-counter-roster.json')
counter_roster['rows'] = [r for r in counter_roster['rows'] if r['name'] and r['floor']]
write('takashimaya-counter-roster.json', counter_roster)
summary = {
    'officialMallRecords': len(en), 'officialMallViRecords': len(vi),
    'localPreviewIdentities': len(local), 'localPreviewIdentitiesMatchedToOfficialRecords': len(local) - len(unmatched),
    'localPreviewUnmatched': unmatched, 'officialMallRecordsBeyondLocalPreview': len(additional),
    'pendingStoreFloorRowsInvestigated': len(findings),
    'pendingRowsWithOfficialGeographicPolygon': sum(bool(x['sourceGeographicPolygonsForRequestedFloor']) for x in findings),
    'pendingRowsWithoutOfficialStorePolygon': sum(not x['sourceGeographicPolygonsForRequestedFloor'] for x in findings),
    'officialTakashimayaMapCounterRecords': len(taka),
    'counterFloorClaimsOutsideDepartmentStoreGuide': [dict(officialId=x['id'], name=x['name'], floorClaims=x['properties'].get('floorLocation'), sourceUrl=ORIGIN+'/en'+x['slug']) for x in taka if any(f not in ['B2','B1','L1','L2','L3'] for f in x['properties'].get('floorLocation',[]))],
    'takashimayaOwnBrandTableOccurrences': len(counter_roster['rows']),
    'mallRecordsWithBothSourceDescriptions': sum(all(x['descriptionEvidence'].values()) for x in current),
    'mallRecordsMissingSourceDescription': [dict(name=x['name'], locales=[k for k,v in x['descriptionEvidence'].items() if not v]) for x in current if not all(x['descriptionEvidence'].values())],
    'mallRecordsWithImageCandidate': sum(bool(x['imageCandidates']) for x in current),
    'mallRecordsWithNonLogoImageCandidate': sum(any(a['kind']!='logo' for a in x['imageCandidates']) for x in current),
    'approvedPhotoRights': 0, 'approvedLocalSchematicMappings': 0,
}
write('discoveries.json', {'retrievedDate': DATE, 'approval': 'pending', 'summary': summary, 'pendingLocationFindings': findings, 'currentOfficialMallRoster': current, 'additionalOfficialRecordsComparedWithPreview': additional})
receipt = {}
for file in HERE.iterdir():
    if file.suffix in ['.json', '.html', '.jpg'] and file.name not in ['response-hashes.json', 'discoveries.json', 'official-source-map.json']:
        receipt[file.name] = {'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'bytes': file.stat().st_size}
write('response-hashes.json', receipt)
print(json.dumps(summary, ensure_ascii=False, indent=2))
