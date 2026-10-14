"""Measure captured composites and assemble reference/before/after contact sheets.

No screenshot retouching: sheets only resize and juxtapose the original captures.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import json, re, math

root = Path(__file__).resolve().parents[1] / 'evidence/visual-acceptance'

def luminance(rgb):
    def linear(v):
        v = v / 255
        return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4
    return sum(w * linear(v) for w, v in zip([.2126, .7152, .0722], rgb))

def ratio(a, b):
    values = sorted([luminance(a), luminance(b)])
    return (values[1] + .05) / (values[0] + .05)

results = json.loads((root / 'after/results.json').read_text(encoding='utf-8'))
receipt = {'method': 'sRGB PNG background captures with only control/header glyphs hidden; sample each live control rectangle inset 8px, every 2px. Disabled controls excluded. Captured scenes only, not all future backdrops or browsers.', 'runs': []}
for run in results['runs']:
    prefix = f"{run['mall']}-{run['width']}-{run['locale']}"
    background = Image.open(root / f'after/{prefix}-glass-background.png').convert('RGB')
    samples = []
    for control in run['contrast']:
        if control['disabled']:
            continue
        color = list(map(int, re.findall(r'\d+', control['color'])[:3]))
        rect = control['rect']
        values = [ratio(color, background.getpixel((x, y)))
                  for x in range(max(0, math.ceil(rect['left']) + 8), min(background.width, math.floor(rect['right']) - 8), 2)
                  for y in range(max(0, math.ceil(rect['top']) + 8), min(background.height, math.floor(rect['bottom']) - 8), 2)]
        samples.append({'color': color, 'minimumRatio': round(min(values), 2), 'pixels': len(values)})
    receipt['runs'].append({'mall': run['mall'], 'width': run['width'], 'locale': run['locale'], 'minimumRatio': min(s['minimumRatio'] for s in samples), 'controls': samples})

receipt['solidPairs'] = {label: round(ratio(bytes.fromhex(a), bytes.fromhex(b)), 2) for label, a, b in [
    ('secondary-on-paper', '64584e', 'fff9f1'), ('saigon-action-label', 'ffffff', 'a12b18'),
    ('vincom-action-label', 'ffffff', '744600'), ('saigon-selected-edge', 'ad2d19', 'ffe6dc'),
    ('vincom-selected-edge', '795015', 'f5e4bf'), ('focus-on-light-separator', '231c17', 'fffdfa')]}
receipt['passed'] = all(r['minimumRatio'] >= 4.5 for r in receipt['runs']) and all(v >= 4.5 for v in receipt['solidPairs'].values())
(root / 'contrast.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
for mall in ['saigon', 'vincom']:
    for width in [1280, 820, 390]:
        prefix = f'{mall}-{width}-vi'
        for state, ref in [('overview', 'overview'), ('map', 'map')]:
            paths = [f'before/reference-{prefix}-{ref}.png', f'before/{prefix}-{state}.png', f'after/{prefix}-{state}.png']
            images = [Image.open(root / path).convert('RGB') for path in paths]
            cell_width = 640 if width > 700 else 390
            resized = [im.resize((cell_width, round(im.height * cell_width / im.width))) for im in images]
            sheet = Image.new('RGB', (cell_width * 3, max(im.height for im in resized) + 40), '#fff9f1')
            draw = ImageDraw.Draw(sheet)
            for i, (label, im) in enumerate(zip(['Approved prototype', 'Baseline c15e421', 'After presentation fixes'], resized)):
                draw.text((i * cell_width + 12, 12), label, fill='#231c17')
                sheet.paste(im, (i * cell_width, 40))
            sheet.save(root / f'comparison-{prefix}-{state}.png')
print(json.dumps({'passed': receipt['passed'], 'minimumCompositedRatio': min(r['minimumRatio'] for r in receipt['runs']), 'solidPairs': receipt['solidPairs']}))
if not receipt['passed']:
    raise SystemExit(1)
