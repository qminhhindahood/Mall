"""Deterministic local import of the owner's r2 wording/roster decision.

Frozen review inputs remain unchanged. No release/deployment is performed.
"""
import gzip
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKET = ROOT / 'docs/content-preparation/approved-directory-2026-10-18-r1'
REVISION = 'owner-approved-directory-2026-10-18-r1'

def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

EXPECTED_INPUTS = {
    'data/malls/saigon-centre/floor-geometry.json': '84952edc38465d572cd994ef416d5a095f778fa0cb35e46ce6d3d365c7454807',
    'data/malls/vincom-dong-khoi/floor-geometry.json': 'be4771f73849d8d6909cbb8ba56edf5c9901446bcbdd392299f540169ceebb6e',
    'docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json': 'dddf720a429e6028817a3c19b3fd18c58c3704b45620e0790a7b0e3788aa823a',
    'data/research/saigon-centre.json': '659a3f20a4e8477b3b1faf7c4df34718f25b0b76cab30125b24584a0b4b8caf2',
    'data/research/vincom-dong-khoi.json': 'fd3adaf8d5fda9fe290f8b47cfe48a6a1d589e8cd68c3dd0523f5a7d71c264d4',
    'data/research/location-holds-2026-10-18-r1.json': 'f777c850befabc41c0051547f76ccce708f3498609d60ed4cd124d419bb3c6e3',
    'docs/content-preparation/integration-candidate-2026-10-18-r2/saigon-centre.private.json': '668ab73f71a6c3233142f1f0796fc88fa30fbf57c9bad44182ee323d070426a1',
    'docs/content-preparation/integration-candidate-2026-10-18-r2/vincom-dong-khoi.private.json': '21cd59607a1336320d2a7128f95ae19b1f0441da443e4a0ba367b35503db4c46',
    'docs/content-preparation/integration-candidate-2026-10-18-r2/accepted-r4-geometry.json.gz': '89f5ac26720497a9dcbb74bdf89c770432d1e7974b5b1c99474c57698b397434',
}
# Verify every approval/source input before producing ANY output. Changed wording
# requires a new owner decision and revision, never a freshly calculated approval.
for name, expected in EXPECTED_INPUTS.items():
    if digest(ROOT / name) != expected:
        raise ValueError(f'Approved input hash drift: {name}')

draft_path = 'docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json'
draft = read(draft_path)
assert draft['revision'] == 'finish-review-descriptions-r2'
assert len(draft['records']) == 371
identity_holds = {'vincom-prototype-cara', 'vincom-prototype-lizdnamat', 'vincom-prototype-mujoshtedbaker'}
decision = {
    'revision': REVISION, 'decidedAt': '2026-10-18', 'decidedBy': 'Project owner (conversation participant)',
    'recordedBy': 'Codex (AI)', 'statement': 'I think this is good now, i apporve',
    'prompt': 'The revised copy is ready at http://127.0.0.1:4371/revision-2/review.html, with 361 bilingual drafts and ten explicit holds. What would you like changed? If you accept the complete wording and roster, please say so explicitly; your earlier sample approval covered style only. Public release remains a separate decision.',
    'provenance': {'threadId': 'a3ced64f-6d28-4cf6-ae29-1c22a669bcc1', 'position': 577,
                   'updatedAt': '2026-10-18T12:20:03.456Z',
                   'itemId': 'turn-item:message:async-answer%3Aruntime-request%3Aprovider%3Acodex%3Aprovider-turn%3Aprovider-turn%253Aprovider%253Acodex%253Anative-turn%253A01a14ee5-4830-70c0-98ac-fd76179183ef%3Anative-request%3Aasync%253Acall_665e9bd8b4cc4755a7924d0969d54d70%3A42c8c531-3c19-4712-8ee6-5d94cd24f047'},
    'source': draft_path, 'sourceSha256': digest(ROOT / draft_path),
    'rosterApproval': True, 'wordingApprovals': {'vi': True, 'en': True},
    'languageApprovalAuthority': 'One owner explicitly approves both languages; no separate human reviewers inferred.',
    'localPublicDataIntegrationApproved': True, 'releaseApproval': False,
    'holds': [], 'deferred': ['Richer Discovery detail content', 'Restaurant/shop Highlights'],
    'scope': '361 exact bilingual descriptions; seven basic listings keep empty descriptions; three identity holds excluded. No fresh stock/occupancy verification, media rights, fabricated map precision or release approval.'
}
english = {'Thời trang':'Fashion','Ẩm thực':'Dining','Vui chơi giải trí':'Entertainment','Rạp chiếu phim':'Cinema','Mẹ & bé':'Parent & baby','Nội thất, gia dụng & điện máy':'Home & appliances','Giày dép & túi xách':'Shoes & bags','Trang sức, đồng hồ & mắt kính':'Jewellery, watches & eyewear','Mỹ phẩm & làm đẹp':'Beauty','Đồ dùng & quà tặng':'Gifts & essentials','Siêu thị':'Supermarket','Thể thao & wellness':'Sports & wellness','Thương hiệu cao cấp':'Luxury brands','Mỹ phẩm':'Beauty','Trang sức & đồng hồ':'Jewellery & watches','Nhà sách':'Bookshop','Sức khỏe':'Health','Điện tử':'Electronics','Thể thao':'Sports','Trang trí nội thất':'Home decor','Phong cách sống':'Lifestyle'}
cuisines = {'Chinese':'Trung Hoa','Japanese':'Nhật Bản','Korean':'Hàn Quốc','Thai':'Thái Lan','Vietnamese':'Việt Nam','Italian':'Ý','Western':'Âu','International':'Quốc tế'}
summary = {}
for mall in ['saigon-centre', 'vincom-dong-khoi']:
    source = read(f'data/research/{mall}.json')
    existing = {row['id']: row for row in source['records']}
    existing_codes = {(floor, link['region']): link['code'] for old in source['records'] for floor, links in old['locations'].items() for link in links}
    candidate = read(f'docs/content-preparation/integration-candidate-2026-10-18-r2/{mall}.private.json')
    effective = {row['id']: row for row in candidate['records']}
    geometry = read(f'data/malls/{mall}/floor-geometry.json')
    additions = []
    if mall == 'saigon-centre':
        frozen = json.loads(gzip.decompress((ROOT / 'docs/content-preparation/integration-candidate-2026-10-18-r2/accepted-r4-geometry.json.gz').read_bytes()))
        shared = {a['regionId'] for row in candidate['records'] for a in row['geometryCandidates'] if a.get('sharedAreaRole') == 'shared-parent-area'}
        for floor in frozen['floors']:
            current = next(f for f in geometry['floors'] if f['id'] == floor['id'])
            assert current['regions'] == floor['regions']
            regions = [r for r in floor.get('candidateRegions', []) if r['id'] not in shared]
            additions.append({'floorId': floor['id'], 'regions': regions})
            current['regions'] += regions
    overlay = {'revision': REVISION + '-geometry', 'baseRevision': geometry['revision'], 'floors': additions,
               'source': 'integration-candidate-2026-10-18-r2/accepted-r4-geometry.json.gz',
               'scope': 'Exact accepted r4 contours excluding shared parents; occupancy and duplicate identities are not inferred.'}
    write(ROOT / f'data/malls/{mall}/approved-regions.json', overlay)
    review = {'source': f'docs/content-preparation/approved-directory-2026-10-18-r1/owner-decision.json; {draft_path}',
              'reviewedAt': '2026-10-18', 'reviewedBy': 'Project owner (explicit VI and EN approval in conversation)', 'languages': {'vi': True, 'en': True}}
    areas, destinations = {}, []
    holds = read('data/research/location-holds-2026-10-18-r1.json')['unitHolds']
    for row in [r for r in draft['records'] if r['mall'] == mall]:
        held = not row['proposedDescription'].get('en')
        if held:
            decision['holds'].append({'id': row['id'], 'name': row['name'], 'copyApproved': False,
                                      'disposition': 'excluded-identity-hold' if row['id'] in identity_holds else 'basic-listing-empty-description',
                                      'reason': row['copyTreatment']})
        if row['id'] in identity_holds:
            continue
        old = existing.get(row['id'], {})
        links = json.loads(json.dumps(old.get('locations', {})))
        eff = effective[row['id']]
        for gap in eff['originalLocationGaps']:
            assert gap['regionId'] is None and gap['noMarkerTreatmentOwnerApproval']
            links[gap['floor']] = []
        for area in eff['geometryCandidates']:
            assert area['ownerApproval']
            links[area['floor']] = [] if area.get('sharedAreaRole') == 'shared-parent-area' else [{'region': area['regionId'], 'code': existing_codes.get((area['floor'], area['regionId']), 'r4-' + area['regionId'])}]
        locations = []
        for floor in row['floors']:
            area_ids = []
            for link in links.get(floor, []):
                if any(h['mallId'] == mall and h['floor'] == floor and h['code'] == link['code'] for h in holds):
                    continue
                assert any(r['id'] == link['region'] for f in geometry['floors'] if f['id'] == floor for r in f['regions'])
                # Preserve existing research area URLs/grouping across promotion.
                area_id = 'research-' + floor.lower() + '-' + re.sub('[^a-z0-9]+', '-', link['code'].lower()).rstrip('-')
                if area_id not in areas:
                    areas[area_id] = {'id': area_id, 'floorId': floor, 'regionIds': [],
                                      'name': link.get('label', {'vi': 'Khu vực trên sơ đồ', 'en': 'Mapped area'}), 'review': review}
                if link['region'] not in areas[area_id]['regionIds']:
                    areas[area_id]['regionIds'].append(link['region'])
                area_ids.append(area_id)
            locations.append({'floorId': floor, 'certainty': 'area-confirmed' if area_ids else 'floor-confirmed',
                              'areaIds': list(dict.fromkeys(area_ids)),
                              'source': f'{review["source"]}; source-layout associations and accepted r4 geometry; later shared-parent/L5-05 display holds take precedence'})
        entry = {'id': row['id'], 'name': row['name'], 'primaryFloor': row['floors'][0], 'floors': row['floors'],
                 'description': {'vi': '', 'en': ''} if held else row['proposedDescription'],
                 'reviewedAt': review['reviewedAt'], 'review': review, 'categories': row['categories'],
                 'aliases': [], 'status': 'open', 'locations': locations}
        for key in ['website', 'openingSoon']:
            if key in old:
                entry[key] = old[key]
        if old.get('cuisine'):
            entry['cuisine'] = {'vi': cuisines.get(old['cuisine'], old['cuisine']), 'en': old['cuisine']}
        destinations.append(entry)
    used = {c for row in destinations for c in row['categories']}
    categories = [{'id': c['id'], 'name': {'vi': c['label'], 'en': english[c['label']]}, 'review': review} for c in source['categories'] if c['id'] in used]
    if 'category-pending' in used:
        categories.append({'id': 'category-pending', 'name': {'vi': 'Chưa phân loại', 'en': 'Uncategorized'}, 'review': review})
    snapshot = {'mallId': mall, 'revision': REVISION, 'approval': 'approved', 'reviewedAt': '2026-10-18',
                'destinations': destinations, 'categories': categories, 'areas': list(areas.values()), 'facilities': [], 'highlights': []}
    assert used == {c['id'] for c in categories}
    write(ROOT / f'data/malls/{mall}/directory.json', snapshot)
    summary[mall] = {'destinations': len(destinations), 'descriptions': sum(bool(d['description']['en']) for d in destinations),
                     'emptyDescriptions': sum(not d['description']['en'] for d in destinations), 'areas': len(areas),
                     'areaConfirmedLocations': sum(l['certainty'] == 'area-confirmed' for d in destinations for l in d['locations']),
                     'addedRegions': sum(len(f['regions']) for f in additions)}
assert sum(s['destinations'] for s in summary.values()) == 368
assert sum(s['descriptions'] for s in summary.values()) == 361
assert len(decision['holds']) == 10
write(PACKET / 'owner-decision.json', decision)
write(PACKET / 'validation.json', {'revision': REVISION, 'sourceSha256': decision['sourceSha256'], 'inputs': EXPECTED_INPUTS, 'summary': summary,
                                  'result': 'PASS', 'tenHoldsPreserved': True, 'noPhotos': True, 'noHighlights': True,
                                  'releaseApproval': False, 'outputs': {str(p.relative_to(ROOT)).replace('\\', '/'): digest(p) for mall in summary for p in [ROOT / f'data/malls/{mall}/directory.json', ROOT / f'data/malls/{mall}/approved-regions.json']}})
print(json.dumps(summary, ensure_ascii=False))
