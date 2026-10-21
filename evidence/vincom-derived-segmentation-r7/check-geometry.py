import json
from pathlib import Path
from shapely.geometry import Polygon
from shapely import make_valid
from shapely.ops import unary_union
root=Path(__file__).resolve().parents[2]
p=json.loads((root/'data/research/vincom-derived-segmentation-2026-10-21-r7.json').read_text(encoding='utf-8'))
g=json.loads((Path(__file__).parent/'staged-geometry.json').read_text(encoding='utf-8'))
def polygon(r): return Polygon(r['outer'],r.get('holes',[]))
def surfaces(g):
    if g.geom_type=='Polygon': return [g]
    return [p for x in getattr(g,'geoms',[]) for p in surfaces(x)]
children={x['region']['id']:polygon(x['region']) for x in p['children']}
report={'activation':p['activation'],'parents':[],'overlaps':[]}
for parent in p['parents']:
    original=polygon(parent['original'])
    normalized=unary_union(surfaces(make_valid(original) if not original.is_valid else original))
    cutters=unary_union([children[k] for k in parent['subtractChildIds']])
    expected=normalized.difference(cutters)
    pieces=[polygon(r) for r in parent['residual']]
    assert all(x.is_valid and x.area>0 for x in pieces)
    actual=unary_union(pieces)
    error=actual.symmetric_difference(expected).area
    assert error<1e-9,(parent['original']['id'],error)
    assert abs(sum(x.area for x in pieces)-actual.area)<1e-9
    assert abs(normalized.area-actual.area-normalized.intersection(cutters).area)<1e-9
    report['parents'].append({'id':parent['original']['id'],'originalValid':original.is_valid,'positiveResidualPieces':len(pieces),'pieceAreas':[x.area for x in pieces],'symmetricDifferenceArea':error,'zeroAreaFragmentsWkt':parent['zeroAreaFragmentsWkt']})
floor=next(f for f in g['floors'] if f['id']=='B3')
for childId,child in children.items():
    assert child.is_valid and child.area>0
    for r in floor['regions']:
        if r['id']==childId: continue
        other=polygon(r)
        if not other.is_valid: other=unary_union(surfaces(make_valid(other)))
        overlap=child.intersection(other).area
        if overlap>1e-9: report['overlaps'].append({'child':childId,'region':r['id'],'area':overlap})
assert not report['overlaps'],report['overlaps']
report['result']='pass'
(Path(__file__).parent/'geometry-invariants.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
