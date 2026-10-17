"""Record exact source inputs and verify this packet has no tracked app changes."""
from pathlib import Path
import hashlib, json, subprocess

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]
ROOT = APP.parents[1]
paths = [
    ROOT / 'docs/research/all-record-map-comparison (1).csv',
    ROOT / 'docs/research/store-data-vincom-dong-khoi.json',
    ROOT / 'docs/evidence/category-2026-10-17/store-data-vincom-dong-khoi.json',
    ROOT / 'docs/evidence/category-2026-10-17/store-data-saigon-centre.json',
]
for mall in ['vincom-dong-khoi', 'saigon-centre']:
    paths.extend([APP / f'data/research/{mall}.json', APP / f'data/malls/{mall}/floor-geometry.json', APP / f'data/malls/{mall}/directory.json'])
inputs = [{'path': p.relative_to(ROOT).as_posix(), 'bytes': p.stat().st_size,
           'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]
public = []
for mall in ['vincom-dong-khoi', 'saigon-centre']:
    data = json.loads((APP / f'data/malls/{mall}/directory.json').read_text(encoding='utf-8'))
    public.append({'mall': mall, 'revision': data['revision'], 'approval': data['approval'],
                   'reviewedAt': data['reviewedAt'], 'destinations': len(data['destinations'])})
    assert data['approval'] == 'pending' and data['reviewedAt'] is None and not data['destinations']
diff = subprocess.check_output(['git', 'diff', 'HEAD', '--name-only'], cwd=APP, text=True).splitlines()
assert not diff, diff
receipt = {'sourceCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=APP, text=True).strip(),
           'inputs': inputs, 'publicSnapshots': public, 'trackedDiffAtVerification': diff,
           'limits': 'Hashes establish input identity, not current occupancy, copyright permission or editorial approval.'}
(HERE / 'source-inputs.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Input hashes recorded; tracked application unchanged; public snapshots pending/empty.')
