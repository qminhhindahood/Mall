"""Build a review-only Highlights ledger from the accepted local directory."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
PACKET = 'docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json'
DECISION = 'docs/content-preparation/approved-directory-2026-10-18-r1/owner-decision.json'
proposals = [
    ('SC1', 'saigon-centre', 'saigon-prototype-dimtutac',
     'Cantonese dining gives the initial selection a clear meal option; the approved description explicitly supports dim sum.',
     'Ghé Dim Tu Tac ở L5 nếu bạn muốn khám phá dim sum và ẩm thực Quảng Đông.',
     'Explore dim sum and Cantonese cooking at Dim Tu Tac on L5.'),
    ('SC2', 'saigon-centre', 'saigon-prototype-phuongnambookstore',
     'Adds a book-and-gift browsing option alongside dining, using the approved books, music, toys and gifts description.',
     'Dành thời gian khám phá sách, đồ chơi và quà tặng tại Phuong Nam Bookstore ở L4.',
     'Browse books, toys and gifts at Phuong Nam Bookstore on L4.'),
    ('SC3', 'saigon-centre', 'saigon-prototype-annamgourmet',
     'Adds food shopping to the initial mix, supported by the accepted European-cuisine and gourmet-products description.',
     'Khám phá thực phẩm và sản phẩm gourmet theo định hướng ẩm thực châu Âu tại Annam Gourmet ở B2.',
     'Explore European-oriented food and gourmet products at Annam Gourmet on B2.'),
    ('VC1', 'vincom-dong-khoi', 'vincom-prototype-chillithai',
     'Adds Thai dining and shareable dishes, supported by the approved hot-pot and curry description.',
     'Khám phá lẩu, cà ri và các món Thái dùng chung tại Chilli Thai ở B3.',
     'Explore Thai hot pots, curries and dishes for sharing at Chilli Thai on B3.'),
    ('VC2', 'vincom-dong-khoi', 'vincom-prototype-runamboutique',
     'Provides a cafe option distinct from a full restaurant; approved copy supports Vietnamese phin coffee and meals.',
     'Ghé Runam Boutique ở B2 để khám phá cà phê phin Việt Nam và các món ăn trong không gian quán cà phê.',
     'Explore Vietnamese phin coffee and cafe meals at Runam Boutique on B2.'),
    ('VC3', 'vincom-dong-khoi', 'vincom-prototype-pullbear',
     'Adds clothing to the initial dining/cafe mix, supported by the approved casual T-shirt, jeans and jacket description.',
     'Khám phá áo thun, quần jeans và áo khoác phong cách trẻ trung tại Pull & Bear ở L2.',
     'Browse casual T-shirts, jeans and jackets at Pull & Bear on L2.'),
]

def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))

packet = {r['id']: r for r in read(PACKET)['records']}
ledger = {'revision': 'motion-highlights-2026-10-19-r1', 'preparedAt': '2026-10-19',
          'status': 'proposal-only', 'ownerSelection': None, 'copyApproval': {'vi': False, 'en': False},
          'sourcePolicy': 'Uses supplied archived evidence and the later owner-approved directory; no fresh occupancy, availability, price or quality verification.',
          'sourceHashes': {}, 'records': []}
for path in [PACKET, DECISION] + [f'data/malls/{m}/directory.json' for m in ['saigon-centre', 'vincom-dong-khoi']]:
    ledger['sourceHashes'][path] = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()

for short_id, mall, destination_id, rationale, vi, en in proposals:
    directory = read(f'data/malls/{mall}/directory.json')
    destination = next(d for d in directory['destinations'] if d['id'] == destination_id)
    floor = destination['primaryFloor']
    category = next(c for c in directory['categories'] if c['id'] == destination['categories'][0])
    location = next(l for l in destination['locations'] if l['floorId'] == floor)
    assert directory['approval'] == 'approved' and destination['status'] == 'open'
    assert all(destination['description'][language] for language in ['vi', 'en'])
    assert location['certainty'] == 'area-confirmed' and location['areaIds']
    areas = [next(a for a in directory['areas'] if a['id'] == area_id) for area_id in location['areaIds']]
    ledger['records'].append({
        'shortId': short_id, 'mallId': mall, 'destinationId': destination_id,
        'name': destination['name'], 'categoryId': category['id'], 'categoryName': category['name'],
        'floorId': floor, 'location': location, 'areas': areas, 'rationale': rationale,
        'recommendation': {'vi': vi, 'en': en}, 'acceptedDescription': destination['description'],
        'source': {'directory': f'data/malls/{mall}/directory.json', 'packet': PACKET, 'ownerDecision': DECISION,
                   'archivedReferences': packet[destination_id].get('sources', []),
                   'archivedPrimaryContext': packet[destination_id].get('archivedPrimaryContext', [])},
        'eligibility': 'Passes current open-destination/category/floor requirements; individual area supported in accepted local snapshot. Editorial nomination and new recommendation copy still pending.',
        'caveats': ['Stable IDs retain their historical prototype prefix; do not rename them.',
                    'No independent new occupancy or menu/stock check; source review date is 2026-10-18.',
                    'No photo added; no rejected shared-parent or L5-05 association used.',
                    'Current Highlight schema has no recommendation-copy field; approved text will need an explicit integration change in the release lane.'],
        'ownerSelected': False, 'recommendationApproval': {'vi': False, 'en': False}, 'publishableNow': False,
    })

(OUT / 'highlights-proposal.json').write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
lines = ['# Initial Highlights proposal', '', 'Proposal only · 19 October 2026. Select any subset; recommendation wording needs separate VI/EN approval. No live Highlights changed.', '',
         'Six nominations use existing approved identities and individual supported areas. Selection balances dining, cafe and shopping use cases; it is not a popularity or quality ranking. Current operating status, menu and stock have not been independently rechecked.', '']
for r in ledger['records']:
    lines += [f"## {r['shortId']} · {r['name']['en']} · {r['floorId']}", '',
              f"Stable ID: `{r['destinationId']}`. Mall: `{r['mallId']}`. Category: {r['categoryName']['en']} (`{r['categoryId']}`).", '',
              r['rationale'], '', f"**VI proposal:** {r['recommendation']['vi']}", '', f"**EN proposal:** {r['recommendation']['en']}", '',
              f"Source: accepted directory and hash-bound roster packet, record `{r['destinationId']}`; full archived source references and exact area IDs are in [the ledger](highlights-proposal.json).", '',
              'Identity/eligibility: approved open listing with an accepted description and supported individual area. No identity or offering-description hold. No new occupancy verification or photo approval. Owner selection and both new language texts remain pending.', '']
lines += ['## Decision', '', 'Select SC1–SC3 and VC1–VC3 individually or as a set, then approve or edit their VI/EN recommendation wording. An endorsement decision does not approve deployment. The ledger remains proposal-only until the actual response is recorded.', '']
(OUT / 'highlights-proposal.md').write_text('\n'.join(lines), encoding='utf-8')
print('Prepared six eligible proposals; zero endorsements or publication approvals.')
