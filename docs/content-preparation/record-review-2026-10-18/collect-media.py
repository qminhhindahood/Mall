"""Download one representative per identity for private visual evidence review."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import hashlib
import json
import datetime as dt
import requests
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
PACKET = HERE.parent / 'completion-packet-2026-10-17'
records = json.loads((PACKET / 'roster.json').read_text(encoding='utf-8'))['records']
selected = []
for record in records:
    if not record['photos']:
        continue
    photos = sorted(record['photos'], key=lambda p: (
        p.get('association') != 'locator explicitly names this branch',
        p['kind'] == 'logo-or-graphic'))
    selected.append((record, photos[0]))


def fetch(pair):
    record, photo = pair
    row = {'id': record['id'], 'mall': record['mall'], 'name': record['name'],
           'url': photo['url'], 'sourceUrl': photo['sourceUrl'], 'association': photo['association'],
           'retrievedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'ownerApproval': False}
    try:
        response = requests.get(photo['url'], timeout=20, headers={'User-Agent': 'Mozilla/5.0'})
        row['httpStatus'] = response.status_code
        response.raise_for_status()
        row['sourceSha256'] = hashlib.sha256(response.content).hexdigest()
        im = Image.open(BytesIO(response.content)).convert('RGB')
        row['sourceDimensions'] = list(im.size)
        im.thumbnail((250, 165))
        row['result'] = 'downloaded-for-visual-review'
        return row, im
    except Exception as error:
        row.update(result='image-unavailable', error=str(error))
        return row, None


if __name__ == '__main__':
    if (HERE / 'media-sample.json').exists():
        raise SystemExit('Historical media evidence already exists; collect into a new review revision.')
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
    rows = []
    with ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(fetch, selected))
    for start in range(0, len(results), 36):
        canvas = Image.new('RGB', (1560, 1260), 'white')
        draw = ImageDraw.Draw(canvas)
        sheet = start // 36 + 1
        for i, (row, im) in enumerate(results[start:start + 36]):
            index = start + i + 1
            x, y = (i % 6) * 260, (i // 6) * 210
            if im:
                canvas.paste(im, (x + (250 - im.width) // 2, y))
            else:
                draw.text((x + 8, y + 60), 'IMAGE UNAVAILABLE', font=font, fill='red')
            draw.text((x + 4, y + 168), f'{index:03} {row["name"][:31]}', font=font, fill='black')
            draw.text((x + 4, y + 187), row['mall'], font=font, fill='black')
            row.update(contactSheet=f'media-sheet-{sheet}.jpg', cell=index)
            rows.append(row)
        canvas.save(HERE / f'media-sheet-{sheet}.jpg', quality=88)
    (HERE / 'media-sample.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(rows)} representative media references; {sum(x["result"] == "downloaded-for-visual-review" for x in rows)} available')
