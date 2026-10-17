"""Verify generated static outputs without executing JavaScript or approving content."""
from pathlib import Path
import json
from html import unescape

app = Path(__file__).resolve().parents[2]
results = []
for mall in ('vincom-dong-khoi', 'saigon-centre'):
    public = app / 'dist' / mall
    research = app / 'dist/research' / mall
    manifest = json.loads((public / 'release-manifest.json').read_text())
    preview_manifest = json.loads((research / 'release-manifest.json').read_text())
    source = json.loads((app / 'data/research' / f'{mall}.json').read_text(encoding='utf-8'))
    assert manifest['mall'] == mall and not manifest['fixture']
    assert manifest['directoryApproval'] == 'pending' and not manifest['releaseApproved']
    assert preview_manifest['fixture'] and not preview_manifest['releaseApproved']
    for locale, store_segment in (('vi', 'cua-hang'), ('en', 'stores')):
        html = (public / locale / 'index.html').read_text(encoding='utf-8')
        assert 'prototype-' not in html and 'Research preview' not in html
        assert not (public / '__acceptance').exists()
        assert '<svg' in html and '<a ' in html
        for record in source['records']:
            destination = research / locale / store_segment / record['id'] / 'index.html'
            assert destination.exists(), destination
            assert record['name'] in unescape(destination.read_text(encoding='utf-8')), record['id']
            assert not (public / locale / store_segment / record['id']).exists()
    results.append({'mall':mall,'researchIdentities':len(source['records']),'bothLocaleStaticDestinations':True,'publicResearchIsolation':True,'publicApproval':manifest['directoryApproval'],'releaseApproved':False})
receipt = {'revision':'discovery-static-output-check-2026-10-17-r1','results':results}
(Path(__file__).parent / 'static-output-check.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps(receipt))
