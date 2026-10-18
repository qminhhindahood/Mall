"""Build the private, read-only record review without touching the original packet."""
from pathlib import Path
import json

HERE = Path(__file__).resolve().parent
def read(name):
    return json.loads((HERE / name).read_text(encoding='utf-8'))

payload = {'mapping': read('mapping-ledger.json'), 'content': read('content-ledger.json'),
           'findingIds': list(read('copy-findings.json'))}
serialized = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('<', chr(92) + 'u003c')
(HERE / 'review.html').write_text((HERE / 'review-template.html').read_text(encoding='utf-8').replace('__DATA__', serialized), encoding='utf-8')
print('Private read-only review built; no approval or application writes.')
