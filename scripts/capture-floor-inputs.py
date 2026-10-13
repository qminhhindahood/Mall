"""Source-palette schematic capture; estimates, NOT surveyed or approved geometry.

Run from this repository: python scripts/capture-floor-inputs.py --sources D:/Midterm
Original rasters remain byte-identical. Python requires Pillow, numpy and OpenCV.
"""
import argparse, hashlib, json, shutil
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--sources', default='D:/Midterm')
SOURCE = Path(parser.parse_args().sources)
inventory = json.loads((SOURCE / 'docs/research/2026-10-12-floor-reference-inventory.json').read_text(encoding='utf8'))
revision = 'source-palette-schematic-2026-10-13-r1'
receipt = {'revision': revision, 'status': 'estimated; source geometry and exterior registration review pending', 'floors': []}
for mall, ids, scale in [('saigon-centre', ['B2','B1','L1','L2','L3','L4','L5','L6'], .02), ('vincom-dong-khoi', ['B3','B2','B1','L1','M','L2','L3'], .1)]:
    out = HERE / 'data/malls' / mall
    out.mkdir(parents=True, exist_ok=True)
    floors = []
    for order, floor in enumerate(ids):
        source = next(r for r in inventory if (f'-{floor}-2026' in r['path'] if mall == 'saigon-centre' else f'tang-{floor.lower()}.' in r['path']))
        path = SOURCE / source['path']
        raw = path.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == source['sha256'], f'Source drift: {path}'
        im = np.array(Image.open(path).convert('RGB'))
        h, w = im.shape[:2]
        # Source canvas centres, one fixed uniform pixel scale per mall. These are
        # schematic translations, not fitted physical/exterior registration.
        tx, ty = -w * scale / 2, -h * scale / 2
        if mall == 'saigon-centre':
            # Inspected flat-fill palette, including pale/grey commercial areas,
            # sparse rooftop/tower context and small colored reference regions.
            # Roads/background, white circulation and boundary strokes are not
            # interpreted as slab geometry or openings.
            colors = [(204,255,255),(245,245,245),(249,249,249),(255,243,220),(208,236,255),(199,232,255),(196,232,255),(150,229,150),(156,236,152),(216,226,197),(246,168,148),(238,192,220),(128,0,32),(121,83,101),(155,133,93),(161,194,244),(200,200,200)]
            masks = [(f'rgb-{r}-{g}-{b}', cv2.inRange(im, tuple(max(0,v-2) for v in (r,g,b)), tuple(min(255,v+2) for v in (r,g,b))) > 0) for r,g,b in colors]
            minimum_area = 144 # excludes pixel specks/label fragments, recorded below
        else:
            # Inspected source map panel only; crop excludes title/list/legend/nav.
            roi = np.zeros((h,w), dtype=bool); roi[175:925,90:745] = True
            hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV)
            hue, sat, val = cv2.split(hsv)
            masks = [(f'hue-{lo}-{hi}', roi & (sat > 65) & (val > 120) & (hue >= lo) & (hue < hi)) for lo,hi in [(0,18),(18,40),(40,78),(78,110),(110,145),(145,180)]]
            masks.append(('neutral-context', roi & (sat < 24) & (val > 155) & (val < 226)))
            minimum_area = 40
        regions, excluded = [], []
        overlay = Image.fromarray(im).convert('RGB'); draw = ImageDraw.Draw(overlay)
        for palette, mask in masks:
            contours,_ = cv2.findContours(mask.astype('uint8'), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for c in sorted(contours, key=cv2.contourArea, reverse=True):
                area = cv2.contourArea(c)
                if area < minimum_area or len(c) < 3:
                    excluded.append({'palette': palette, 'pixelArea': float(area), 'reason': 'below disclosed region/annotation threshold or degenerate'})
                    continue
                pixels = c.reshape(-1,2).tolist()
                outer = [[round(x*scale+tx,6), round(y*scale+ty,6)] for x,y in pixels]
                context = palette in ['rgb-150-229-150','rgb-156-236-152','rgb-216-226-197','rgb-128-0-32','rgb-155-133-93']
                regions.append({'id': f'{floor}-region-{len(regions)+1:03}', 'outer': outer, 'holes': [], 'role': 'reference-context' if context else 'unreviewed-reference-region', 'certainty': 'source-palette estimate; not an approved tenant or slab', 'sourcePalette': palette, 'sourcePixelArea': float(area)})
                draw.line([tuple(p) for p in pixels] + [tuple(pixels[0])], fill=(255,0,0), width=max(1,w//1200))
        assert regions, f'No captured regions: {path}'
        points = [p for r in regions for p in r['outer']]
        bounds = [min(p[0] for p in points), min(p[1] for p in points), max(p[0] for p in points), max(p[1] for p in points)]
        preview = f'/maps/{floor}{path.suffix}'
        dest = HERE / 'assets' / mall / 'maps' / (floor + path.suffix)
        dest.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(path, dest)
        elevation = (-int(floor[1:]) if floor.startswith('B') else .5 if floor == 'M' else int(floor[1:])-1) * 5
        floors.append({'id':floor, 'label':floor, 'order':order, 'elevation':elevation, 'bounds':bounds, 'regions':regions, 'sources':[{**source, 'transform':[scale,0,0,scale,tx,ty], 'certainty':'original raster; schematic canvas-centred transform, alignment not calibrated'}], 'preview':{'path':preview,'width':w,'height':h}})
        evidence = HERE / 'evidence/source-overlays' / mall
        evidence.mkdir(parents=True, exist_ok=True)
        overlay.thumbnail((1400,1400)); overlay.save(evidence / (floor+'.png'))
        receipt['floors'].append({'mall':mall,'floor':floor,'sourceSha256':source['sha256'],'regionCount':len(regions),'vertexCount':sum(len(r['outer']) for r in regions),'minimumPixelArea':minimum_area,'excludedComponents':len(excluded),'excludedPixelArea':sum(r['pixelArea'] for r in excluded),'bounds':bounds,'manualOverlay':'pending owner review; automatically generated outlines inspected as candidate only','holeCount':0})
    data = {'revision':revision,'frame':{'version':mall+'-schematic-canvas-v1','units':'schematic local units','scaleStatus':f'fixed {scale} units/source pixel across all levels; not metric','orientationStatus':'source image +x right/+z down; north and exterior alignment unverified','registrationStatus':'not-run; source translation centres rasters; cross-level alignment is an estimate','heightStatus':'5-unit schematic slots; M half slot; L1 zero, not construction heights'},'floors':floors}
    (out/'floor-geometry.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
(HERE/'evidence').mkdir(exist_ok=True)
(HERE/'evidence/floor-capture-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8')
print(json.dumps(receipt,indent=2))
