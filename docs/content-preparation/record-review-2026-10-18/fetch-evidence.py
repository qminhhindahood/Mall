"""Preserve targeted first-party follow-up responses separately from original inputs."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import datetime as dt
import hashlib
import json
import requests

HERE = Path(__file__).resolve().parent
PACKET = HERE.parent / 'completion-packet-2026-10-17'
roster = json.loads((PACKET / 'roster.json').read_text(encoding='utf-8'))['records']
vincom = json.loads((PACKET / 'vincom-research/discoveries.json').read_text(encoding='utf-8'))
urls = set(c['sourceUrl'] for r in vincom['records'] for c in r['unitEvidence'])
priority = {'saigon-prototype-himalaya', 'saigon-prototype-chanel', 'saigon-prototype-meatmeet',
            'saigon-prototype-pinktree', 'saigon-prototype-memorylove', 'saigon-prototype-irvins',
            'saigon-prototype-llaollao', 'saigon-prototype-labellab', 'saigon-prototype-moschino',
            'saigon-prototype-matinkimvietnam', 'saigon-prototype-takashimaya',
            'vincom-prototype-facewashfox', 'vincom-prototype-scentuals', 'vincom-prototype-copenhaghen',
            'vincom-prototype-cara', 'vincom-prototype-lizdnamat', 'vincom-prototype-amara'}
for r in roster:
    if r['id'] in priority:
        urls.update(x['url'] for x in r['official'])


def fetch(url):
    row = {'url': url, 'retrievedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'ownerApproval': False}
    try:
        response = requests.get(url, timeout=25, headers={'User-Agent': 'Mozilla/5.0'})
        row.update(httpStatus=response.status_code, finalUrl=response.url,
                   sha256=hashlib.sha256(response.content).hexdigest())
        name = hashlib.sha256(url.encode()).hexdigest()[:16] + '.html'
        (HERE / 'follow-up' / name).write_bytes(response.content)
        row['path'] = 'follow-up/' + name
        row['status'] = 'retrieved-not-content-accepted' if response.ok else 'http-failure'
    except requests.RequestException as error:
        row.update(status='request-failure', error=str(error))
    return row


if __name__ == '__main__':
    if (HERE / 'follow-up-sources.json').exists():
        raise SystemExit('Historical follow-up evidence already exists; collect into a new review revision.')
    (HERE / 'follow-up').mkdir(exist_ok=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(fetch, sorted(urls)))
    (HERE / 'follow-up-sources.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(results)} first-party follow-ups; {sum(r["status"] == "retrieved-not-content-accepted" for r in results)} HTTP successes (not content acceptance)')
