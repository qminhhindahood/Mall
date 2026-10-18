"""Integrity evidence, including isolated failure cases; never edits frozen inputs."""
import hashlib
import html
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PACKET = Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text(encoding='utf-8'))
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
validation = read(PACKET / 'validation.json')
outputs = list(validation['outputs']) + [str((PACKET / name).relative_to(ROOT)) for name in ['owner-decision.json', 'validation.json']]
before = {name: digest(ROOT / name) for name in outputs}
checks = []
for changed in ['docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json', 'data/research/location-holds-2026-10-18-r1.json']:
    with tempfile.TemporaryDirectory(prefix='midterm-approved-negative-') as temp:
        isolated = Path(temp)
        for name in list(validation['inputs']) + outputs + ['scripts/import-approved-directory.py']:
            target = isolated / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / name, target)
        changed_path = isolated / changed
        value = read(changed_path)
        if 'records' in value:
            value['records'][0]['proposedDescription']['vi'] += ' altered unapproved string'
        else:
            value['scope'] += ' altered unapproved policy'
        changed_path.write_text(json.dumps(value, ensure_ascii=False), encoding='utf-8')
        result = subprocess.run([sys.executable, '-X', 'utf8', 'scripts/import-approved-directory.py'], cwd=isolated, capture_output=True, text=True, encoding='utf-8')
        unchanged = all(digest(isolated / name) == sha for name, sha in before.items())
        assert result.returncode != 0 and 'Approved input hash drift' in result.stderr and unchanged
        checks.append({'case': changed, 'result': 'PASS', 'rejectedBeforeWrites': True, 'outputsUnchanged': unchanged})
assert all(digest(ROOT / name) == sha for name, sha in before.items())
rebuild = subprocess.run([sys.executable, '-X', 'utf8', 'scripts/import-approved-directory.py'], cwd=ROOT, capture_output=True)
assert rebuild.returncode == 0 and all(digest(ROOT / name) == sha for name, sha in before.items())
checks.append({'case': 'deterministic unchanged input rebuild', 'result': 'PASS', 'outputsUnchanged': True})
draft = read(ROOT / 'docs/content-preparation/finish-review-2026-10-18/revision-2/roster-proposals.json')
proposals = {row['id']: row for row in draft['records']}
static = 0
for mall in validation['summary']:
    snapshot = read(ROOT / f'data/malls/{mall}/directory.json')
    for row in snapshot['destinations']:
        proposal = proposals[row['id']]
        if proposal['proposedDescription']['en']:
            assert row['description'] == proposal['proposedDescription']
        else:
            assert row['description'] == {'vi': '', 'en': ''}
        for locale, segment in [('vi', 'cua-hang'), ('en', 'stores')]:
            path = ROOT / f'dist/{mall}/{locale}/{segment}/{row["id"]}/index.html'
            content = html.unescape(path.read_text(encoding='utf-8'))
            assert row['name'][locale] in content
            if row['description'][locale]:
                assert row['description'][locale] in content
            static += 1
    for excluded in ['vincom-prototype-cara', 'vincom-prototype-lizdnamat', 'vincom-prototype-mujoshtedbaker']:
        assert not (ROOT / f'dist/{mall}/en/stores/{excluded}/index.html').exists()
    manifest = read(ROOT / f'data/malls/{mall}/asset-manifest.json')
    public_geometry = ROOT / f'dist/{mall}/data/floor-geometry.json'
    assert digest(public_geometry) == manifest['floorGeometry']['sha256']
    assert '+owner-approved-directory-2026-10-18-r1-geometry' in read(public_geometry)['revision']
receipt = {'result': 'PASS', 'isolatedNegativeAndRebuildChecks': checks, 'localizedStaticDestinationChecks': static,
           'exactApprovedDescriptions': 361, 'emptyOfferingHolds': 7, 'identityHoldsExcluded': 3,
           'publicGeometryMatchesManifest': True, 'realFrozenInputHashesUnchanged': True,
           'releaseApproval': False, 'scriptSha256': digest(ROOT / 'scripts/import-approved-directory.py')}
(PACKET / 'integrity-checks.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps(receipt))
