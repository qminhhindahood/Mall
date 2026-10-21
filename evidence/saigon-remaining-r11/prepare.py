"""Freeze bounded source-contour associations; never mutate approved inputs."""
import gzip
import hashlib
import json
from pathlib import Path

APP = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
ROOT = Path('D:/Midterm')
REV = 'saigon-source-associations-2026-10-21-r11'
def read(p):
    return json.loads((APP / p).read_text(encoding='utf-8'))
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, obj):
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

geometry = read('data/malls/saigon-centre/floor-geometry.json')
directory = read('data/malls/saigon-centre/directory.json')
r10 = read('data/research/saigon-source-associations-2026-10-21-r10.json')
official = read('docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-source-map.json')
archive_path = APP / 'docs/content-preparation/integration-candidate-2026-10-18-r2/accepted-r4-geometry.json.gz'
with gzip.open(archive_path, 'rt', encoding='utf-8') as f:
    archive = json.load(f)
targets = [
    ('thehourglass', 'L1', 'L1-region-011', '2d5b055d-036d-48b0-98e5-144bf937bc96',
     'Only the central area named The Hour Glass on the supplied plan is shown. Separate Cartier, Hublot, Grand Seiko and Zenith areas are excluded; this is a partial source area, not the full retailer footprint or an exact entrance.',
     'Chỉ hiển thị phần trung tâm ghi The Hour Glass trên sơ đồ được cung cấp. Không bao gồm các khu Cartier, Hublot, Grand Seiko và Zenith riêng biệt; đây là một phần khu vực theo sơ đồ, không phải toàn bộ mặt bằng hay cửa vào chính xác.'),
    ('moschino', 'L2', 'L2-region-009', '6190de79-9b80-4c88-af66-40e5181fdbe2',
     'Only the main area named Moschino on the supplied plan is shown. The separate Label Lab area and narrow cyan fragment are excluded. The duplicated L2-17 unit claim remains unverified; this partial source area does not confirm current occupancy or an exact entrance.',
     'Chỉ hiển thị phần chính ghi Moschino trên sơ đồ được cung cấp. Không bao gồm khu Label Lab riêng biệt và dải màu xanh hẹp. Thông tin trùng mã L2-17 chưa được xác minh; phần khu vực này không xác nhận tình trạng hoạt động hiện tại hay cửa vào chính xác.'),
    ('yakinikulike', 'L5', 'L5-region-018', 'ff451ea9-998a-4e74-98a7-8f35156222fe',
     'Shows the individual area named Yakiniku Like on the supplied plan, beside Tonkatsu Wako and the facilities block. The L5-05 unit code is not printed on this plan and remains unverified. This replaces the held unit-based display with named source-area guidance only; current occupancy and an exact entrance are not confirmed.',
     'Hiển thị khu riêng ghi Yakiniku Like trên sơ đồ được cung cấp, cạnh Tonkatsu Wako và khu tiện ích. Mã L5-05 không được in trên sơ đồ này và chưa được xác minh. Chỉ dẫn khu vực theo tên trên sơ đồ thay cho vị trí bị giữ theo mã gian hàng; không xác nhận tình trạng hoạt động hiện tại hay cửa vào chính xác.'),
]
rows = []
decisions = []
source_records = []
occupied = {(a['floorId'], rid) for a in directory['areas'] for rid in a['regionIds']}
for suffix, floor_id, region_id, official_id, en, vi in targets:
    destination_id = 'saigon-prototype-' + suffix
    floor = next(f for f in geometry['floors'] if f['id'] == floor_id)
    region = next(r for r in floor['regions'] if r['id'] == region_id)
    source = floor['sources'][0]
    assert sha(ROOT / source['path']) == source['sha256']
    assert (floor_id, region_id) not in occupied
    destination = next(d for d in directory['destinations'] if d['id'] == destination_id)
    assert all(l['certainty'] == 'floor-confirmed' and not l['areaIds'] for l in destination['locations'])
    official_store = next(s for s in official['stores'] if s['officialId'] == official_id)
    assert any(f['floorId'] == floor_id for f in official_store['mapData']['floor'])
    printed = 'No unit code printed; named raster area only'
    decision = dict(destinationId=destination_id, floor=floor_id, regionIds=[region_id], printedUnits=printed, reviewDecision='accept-partial-area-only')
    decisions.append(decision)
    rows.append(dict(destinationId=destination_id, floorId=floor_id, areaId='saigon-r11-'+suffix+'-'+floor_id.lower(), printedUnits=printed,
                     regionIds=[region_id], originalLocations=destination['locations'], source={k:source[k] for k in ['sha256','transform','path']},
                     geometryRegions=[region], associationDetail=dict(kind='partial-source-layout', note=dict(en=en,vi=vi)),
                     review=dict(status='accepted', reviewedBy='Codex GPT-6.1 Sol source review', reviewedAt='2026-10-21', decision='accept-partial-area-only')))
    source_records.append(dict(destinationId=destination_id, officialId=official_id, rasterRegion=region_id, source=source,
                               sourceContourSha256=hashlib.sha256(json.dumps(region,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),
                               scope=en, geometryChanged=False, unitClaimAccepted=False, currentOperationVerified=False))

holds = [
    dict(destinationId='saigon-prototype-asiancorner', floors=['L5'], category='identity-evidence', status='evidence-blocked',
         finding='Official parent covers Lach Ca Lach Cach, GoGi House, Manwah and Kichi-Kichi; raster label sits in a narrow internal strip. No archived description defines an individual tenant versus restaurant grouping. The owner-rejected broad highlight stays held.',
         missingExternalInput='Mall-issued labelled boundary and statement identifying Asian Corner as an individual venue or named shared complex, including whether the internal label strip is occupiable premises. A coordinate or narrow printed label alone is insufficient.'),
    dict(destinationId='saigon-prototype-oedoalley', floors=['L5'], category='shared-scope-implementation', status='implementation-pending',
         finding='Official name is Oedo Alley - Japanese Food Village and accepted r4 candidate is explicitly shared-parent-area over Sundubu, Asanoha, Botejyu and Ramen Ichibanken. Identity supports a shared food-village scope, not an exclusive shop.',
         missingExternalInput=None,
         remainingImplementation='A distinct shared-complex map contract, additive hash-bound candidate-region overlay/transport and parent/child selection behavior are required before activation. Current association helper accepts existing unoccupied contours only and has source-layout/partial-source-layout semantics. Do not relabel the whole parent as exclusive or silently bypass guards.',
         candidateRegionId='proposal-20261018-r4-b32ef3d1-41d7-42fb-97ea-7343d47863a1-l5'),
    dict(destinationId='saigon-prototype-takashimaya', floors=['B2','L1','L2','L3'], category='boundary-evidence', status='evidence-blocked',
         finding='Official department store mapData is null. Supplied plans label individual counters, without a unified labelled department perimeter. Current directory floor list is preserved; archival B1 is not added.',
         missingExternalInput='An authoritative department-store boundary per current directory floor (B2, L1, L2, L3), or an explicitly designated partial department-owned area with matching label and floor. Counter unions do not establish this boundary.'),
    dict(destinationId='saigon-prototype-matinkimvietnam', floors=['L3'], category='identity-and-boundary-evidence', status='evidence-blocked',
         finding='Official mapData is null; supplied L3 plan identifies Miana and archive has competing L3-12 claims. Matin Kim archive reports Opening Soon.',
         missingExternalInput='A branch-specific labelled Matin Kim polygon or floor plan identifying its boundary and resolving the competing Miana L3-12 claim, with dated opening/move evidence if current occupancy is claimed. Do not replace Miana or remove Opening Soon caveat.')
]
shared = next(r for f in archive['floors'] for r in f.get('candidateRegions',[]) if r['id'] == holds[1]['candidateRegionId'])
write(OUT/'oedo-shared-candidate.json', dict(activation='not-activated', source=str(archive_path.relative_to(APP)).replace('\\','/'), sourceSha256=sha(archive_path), floorId='L5', region=shared, limitation=holds[1]))
inputs = ['data/malls/saigon-centre/floor-geometry.json', 'data/malls/saigon-centre/directory.json',
          'data/malls/saigon-centre/approved-regions.json', 'data/research/location-holds-2026-10-18-r1.json',
          'docs/content-preparation/record-review-2026-10-18/registration.json',
          'docs/content-preparation/completion-packet-2026-10-17/saigon-research/official-source-map.json',
          'docs/content-preparation/integration-candidate-2026-10-18-r2/saigon-centre.private.json',
          str(archive_path.relative_to(APP)).replace('\\','/')]
review = dict(reviewedAt='2026-10-21', reviewedBy='Codex GPT-6.1 Sol source review',
              basis='Original supplied raster contours and archived official identities reviewed locally. No fresh web, independent reviewer, physical survey or current-operation verification.',
              decisions=decisions, acceptedScopes=source_records, remaining=holds,
              immutableInputSha256={p:sha(APP/p) for p in inputs},
              supersession='Only the three named narrow/partial raster-area decisions supersede their previous precise-display holds. Broad Asian Corner and all exclusive-parent interpretations remain held. L5-05 unit identity remains unaccepted.')
registration = read('docs/content-preparation/record-review-2026-10-18/registration.json')
review['yakinikuHoldReassessment'] = dict(
    authorization='Parent delegated the owner-authorized reopened remaining-seven task and specifically authorized bounded named-source-area reassessment. This is source review, not new owner physical-location acceptance.',
    priorHoldSource='data/research/location-holds-2026-10-18-r1.json',
    priorHoldReason='Owner screenshot feedback rejected the broad Asian Corner highlight and reported all L5-5 locations wrong; the specification identifies screenshot 5 as a generated Discovery area number, not a printed L5-05 unit.',
    visualEvidence='L5-contours.png overlays the unchanged L5-region-018 on the exact original supplied raster. The contour explicitly contains the Yakiniku Like label, adjoins Tonkatsu Wako below/left and is separated by an aisle from the facilities block above/right.',
    officialEvidence='official-source-map.json stores[officialId=ff451ea9-998a-4e74-98a7-8f35156222fe] names YAKINIKU LIKE and has L5 polygon geometry.',
    archivedRegistrationCorroboration=next(a for a in registration['L5']['anchors'] if a['id']=='saigon-prototype-yakinikulike'),
    registrationLimitation='Historical candidate affine registration, schematic units and residuals; not a new fit, metric survey or current occupancy evidence.',
    conclusion='Same physical contour, independently supported by supplied raster label and matching archived official identity/floor plus historical registration. Accept only qualified source-area display; L5-05 remains unverified, and rejected Asian Corner broad geometry remains held.')
write(OUT/'source-review.json', review)
supplement = dict(revision=REV, mallId='saigon-centre', baseDirectoryRevision=r10['baseDirectoryRevision']+'+'+r10['revision'],
                  activation='accepted-source-review', reviewEvidence=dict(path='evidence/saigon-remaining-r11/source-review.json', sha256=sha(OUT/'source-review.json')),
                  protectedHolds=[dict(destinationId=h['destinationId'],floorId=f,regionIds=[]) for h in holds for f in h['floors']], associations=rows)
write(APP/'data/research'/f'{REV}.json', supplement)
print(json.dumps(dict(revision=REV, accepted=len(rows), evidenceBlocked=3, sharedImplementationPending=1, reviewSha256=sha(OUT/'source-review.json')), indent=2))
