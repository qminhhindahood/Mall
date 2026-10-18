"""Content/evidence integrity prerequisites; not content or website acceptance."""
from pathlib import Path
import hashlib
import json
from shapely.geometry import shape

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]
ROOT = APP.parents[1]
def read(name):
    return json.loads((HERE / name).read_text(encoding='utf-8'))

mapping = read('mapping-ledger.json')
content = read('content-ledger.json')
proposals = read('registered-proposals.geojson')['features']
polygons = [r for r in mapping if r['originalGapState'] == 'official-source-polygon']
remaining = [r for r in mapping if r['originalGapState'] == 'precise-location-pending']
inputs = read('input-integrity.json')['files']
packet = HERE.parent / 'completion-packet-2026-10-17'
original = json.loads((packet / 'manifest.json').read_text(encoding='utf-8'))
checks = {
    '259InputsUnchanged': len(inputs) == 259 and all(hashlib.sha256((ROOT / r['path']).read_bytes()).hexdigest() == r['sha256'] for r in inputs),
    'original244PacketFilesUnchanged': len(original) == 244 and all(hashlib.sha256((packet / r['path']).read_bytes()).hexdigest() == r['sha256'] for r in original),
    '170UniqueOriginalGapOccurrences': len(mapping) == 170 and len({(r['mall'], r['id'], r['floor']) for r in mapping}) == 170,
    '42PolygonProposals': len(polygons) == len(proposals) == 42 and {(r['id'], r['floor']) for r in polygons} == {(f['properties']['recordId'], f['properties']['floor']) for f in proposals},
    'validPrivatePolygonGeometry': all(shape(f['geometry']).is_valid and shape(f['geometry']).area > 0 and f['properties']['ownerApproval'] is False for f in proposals),
    '128GapsRetainNoMarker': len(remaining) == 128 and all(r['proposedRegion'] is None and r['missingEvidence'] and all(isinstance(x, str) for x in r['missingEvidence']) for r in remaining),
    '371UniqueContentIdentities': len(content) == len({r['id'] for r in content}) == 371,
    'realReviewAttributionNoOwnerApproval': all(r['reviewedBy'] == 'Codex (AI evidence reviewer; not owner/editorial approval)' and r['reviewedAt'] == '2026-10-18' and r['ownerApproval'] is False and r['ownerApprovedAt'] is None for r in mapping + content),
    'separateLanguageProposals': all(set(r['copy']) == {'vi', 'en'} and all(x['ownerApproval'] is False for x in r['copy'].values()) for r in content),
    'mediaReviewScopeHonest': sum(r['media'].get('visuallyReviewed', False) for r in content) == 203 and sum(r['media']['unreviewedCandidateCount'] for r in content) == 985,
    'all42OverlaysExist': all((HERE / 'registration-crops' / (r['id'] + '.jpg')).is_file() for r in polygons),
    'publicSnapshotsPendingEmpty': all((lambda d: d['approval'] == 'pending' and d['reviewedAt'] is None and not d['destinations'])(json.loads((APP / 'data/malls' / mall / 'directory.json').read_text())) for mall in ('saigon-centre', 'vincom-dong-khoi')),
    '36PrivateReviewBrowserChecks': sum(len(r['checks']) for r in read('browser-validation.json')['results']) == 36 and all(c['passed'] for r in read('browser-validation.json')['results'] for c in r['checks']),
}
receipt = {'kind': 'Content/evidence integrity only; not editorial, occupancy, browser journey or release acceptance', 'checks': checks}
(HERE / 'validation.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
assert all(checks.values()), checks
print(f'{len(checks)} evidence-integrity checks passed. Owner approvals remain false.')
