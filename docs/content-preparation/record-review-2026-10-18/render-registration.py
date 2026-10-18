"""Render technical registration overlays against unchanged source rasters."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]
ROOT = APP.parents[1]
target = json.loads((APP / 'data/malls/saigon-centre/floor-geometry.json').read_text(encoding='utf-8'))
floors = {f['id']: f for f in target['floors']}
images = {fid: Image.open(ROOT / f['sources'][0]['path']).convert('RGB') for fid, f in floors.items()}
rows = [r for r in json.loads((HERE / 'mapping-ledger.json').read_text(encoding='utf-8')) if r['originalGapState'] == 'official-source-polygon']
features = {f['properties']['recordId']: f for f in json.loads((HERE / 'registered-proposals.geojson').read_text())['features']}
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
(HERE / 'registration-crops').mkdir(exist_ok=True)
for start in range(0, len(rows), 14):
    canvas = Image.new('RGB', (1400, 1400), 'white')
    draw = ImageDraw.Draw(canvas)
    for i, row in enumerate(rows[start:start + 14]):
        transform = floors[row['floor']]['sources'][0]['transform']
        geometry = features[row['id']]['geometry']
        rings = geometry['coordinates'] if geometry['type'] == 'Polygon' else [ring for p in geometry['coordinates'] for ring in p]
        points = [((x - transform[4]) / transform[0], (y - transform[5]) / transform[3]) for ring in rings for x, y in ring]
        left, top = int(min(x for x, y in points) - 120), int(min(y for x, y in points) - 100)
        right, bottom = int(max(x for x, y in points) + 120), int(max(y for x, y in points) + 100)
        crop = images[row['floor']].crop((left, top, right, bottom))
        overlay = ImageDraw.Draw(crop)
        for ring in rings:
            xy = [((x - transform[4]) / transform[0] - left, (y - transform[5]) / transform[3] - top) for x, y in ring]
            overlay.line(xy, fill='#dd1744', width=7)
        crop.thumbnail((900, 900))
        crop.save(HERE / 'registration-crops' / (row['id'] + '.jpg'), quality=92)
        crop.thumbnail((340, 320))
        x, y = (i % 4) * 350, (i // 4) * 350
        canvas.paste(crop, (x + (340 - crop.width) // 2, y + 28))
        draw.text((x + 4, y + 3), f'{start+i+1:02} {row["floor"]} {row["name"][:27]}', font=font, fill='black')
    canvas.save(HERE / f'registration-crops-{start//14+1}.jpg', quality=92)
print('42 private registration crop overlays; three contact sheets. Source rasters unchanged.')
