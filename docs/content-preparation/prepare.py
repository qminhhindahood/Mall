"""Extract supplied directory claims into offline review drafts, never public data."""
import argparse
import hashlib
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--workspace', required=True, type=Path)
args = parser.parse_args()
workspace = args.workspace.resolve()
output = Path(__file__).resolve().parent
inputs = {
    'saigon-centre': 'Takashimaya/takashimaya list.md',
    'vincom-dong-khoi': 'Vincom đồng khởi/vincom center list.md',
}

def save(name, value):
    (output / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

inventory = []
for mall, relative in inputs.items():
    source = workspace / relative
    rows, notes = [], []
    section = None
    for number, line in enumerate(source.read_text(encoding='utf-8-sig').splitlines(), 1):
        if line.startswith('###'):
            section = line
        if line.startswith('>') or (line.strip() and not line.startswith('|') and not line.startswith('!') and not line.startswith('###')):
            notes.append({'line': number, 'text': line})
        if not line.startswith('| **'):
            continue
        cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
        if len(cells) != 3:
            raise ValueError(f'Unexpected table row: {relative}:{number}')
        label = cells[0].replace('**', '')
        name = re.split(r'\s*\(', label, maxsplit=1)[0].strip()
        # Keep unit/range and section as claims, never verified locations.
        unit = re.search(r'\(([^)]+)\)', label)
        rows.append({
            'candidateRef': f'{mall}-source-line-{number}',
            'workflowStatus': 'pending',
            'destinationId': None,
            'recordKind': None,
            'name': {'vi': name, 'en': None},
            'description': {'vi': cells[1], 'en': None},
            'suppliedClaims': {'label': label, 'section': section,
                               'unitOrRange': unit.group(1) if unit else None,
                               'homepageCell': cells[2], 'rawRow': line},
            'source': {'path': relative, 'line': number},
            'verifiedFloors': [], 'primaryFloor': None, 'locations': [],
            'categories': [], 'aliases': [], 'status': None,
            'statusEvidence': None, 'movedFrom': None, 'movedTo': None,
            'review': {'source': None, 'reviewedAt': None, 'reviewedBy': None,
                       'languages': {'vi': {'approved': False, 'reviewer': None, 'reviewedAt': None},
                                     'en': {'approved': False, 'reviewer': None, 'reviewedAt': None}}},
        })
    save(f'{mall}.draft.json', {
        'mallId': mall, 'revision': 'directory-preparation-2026-10-14-r1',
        'workflowStatus': 'pending', 'approval': 'pending', 'reviewedAt': None,
        'format': 'offline-review-worksheet-v1; not DirectorySnapshot',
        'suppliedSource': relative, 'sourceNotes': notes,
        'destinations': rows, 'categories': [], 'areas': [], 'facilities': [], 'highlights': [],
    })
    for file in sorted(source.parent.rglob('*')):
        if file.is_file():
            data = file.read_bytes()
            inventory.append({'mallId': mall, 'path': file.relative_to(workspace).as_posix(),
                              'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
                              'role': 'supplied-directory-claims' if file == source else
                                      'floor-map-reference-annotations' if file.parent.name in ['map', 'Sơ đồ tầng'] else
                                      'visual-reference-only',
                              'editorialReviewedAt': None})
    print(f'{mall}: {len(rows)} supplied table occurrences; pending, no verified locations')
save('supplied-reference-inventory.json', inventory)
