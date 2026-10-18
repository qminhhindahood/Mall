import json, html
from pathlib import Path
p=Path(__file__).resolve().parent;e=lambda x:html.escape(str(x))
sample=json.loads((p/'sample-rewrites.json').read_text(encoding='utf-8'))['records']
prior={r['id']:r for r in json.loads((p.parent/'roster-proposals.json').read_text(encoding='utf-8'))['records']}
parts=['''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Revised introduction style</title><style>body{font:16px/1.6 system-ui;max-width:1100px;margin:auto;padding:24px;color:#29241f;background:#fffcf7}h1{font-size:30px;line-height:1.2}h2{font-size:19px;margin:0 0 10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}article{padding:20px;border:1px solid #d6cdc2;border-radius:12px;background:white}p{margin:8px 0}small{color:#6e6258}summary{cursor:pointer}a{color:#8d351f}details{margin-top:12px}code{overflow-wrap:anywhere}@media(max-width:650px){.grid{grid-template-columns:1fr}body{padding:16px}}</style><h1>Revised introductions ·10 examples</h1><p>One or two informative sentences: what the place offers, then a specific supported detail. No action-label or floor-only filler. These are new drafts; nothing is approved.</p><div class="grid">''']
for r in sample:
    old=prior[r['id']]
    parts.append(f'<article><h2>{e(old["name"]["en"])}</h2><p lang="vi">{e(r["description"]["vi"])}</p><p lang="en">{e(r["description"]["en"])}</p><details><summary>Before and evidence</summary><small>Earlier rejected draft</small><p lang="vi">{e(old["proposedDescription"]["vi"])}</p><p lang="en">{e(old["proposedDescription"]["en"])}</p>')
    for s in r['sources']:parts.append(f'<p><a href="{e(s["url"])}">Source</a> ·{e(s["evidenceSummary"])}</p>')
    parts.append('</details></article>')
(p/'sample.html').write_text(''.join(parts)+'</div>',encoding='utf-8')
