import json, html
from pathlib import Path
p=Path(__file__).resolve().parent
data=json.loads((p/'highlights.json').read_text(encoding='utf-8'))['records']
rows=json.loads((p/'roster-proposals.json').read_text(encoding='utf-8'))['records']
e=lambda x:html.escape(str(x))
parts=['''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Proposed directory package</title><style>
*{box-sizing:border-box}body{margin:0;font-family:var(--font-sans,system-ui);font-size:15px;line-height:1.55;color:var(--foreground,#26211d)}h2{font-size:25px;line-height:1.2;margin:0 0 12px}h3{font-size:18px;margin:20px 0 8px}h4{font-size:16px;margin:0 0 6px}p{margin:7px 0 12px}a{color:var(--primary,#94321d);text-underline-offset:3px}small,.muted{color:var(--muted-foreground,#6a6159)}.facts{display:flex;flex-wrap:wrap;gap:10px 22px;margin:15px 0;padding:14px 0;border-block:1px solid var(--border,#d6cec3)}.facts strong{font-size:22px;display:block}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card{padding:16px;background:var(--card,#fffaf4);border:1px solid var(--border,#ddd2c6);border-radius:var(--radius,10px)}.card p{margin:6px 0 10px}.links{display:flex;flex-wrap:wrap;gap:14px}details{padding-block:12px;border-bottom:1px solid var(--border,#d6cec3)}summary{cursor:pointer;font-weight:600}code{font-size:12px;overflow-wrap:anywhere}.hold{border-left:3px solid var(--warning,#ad6f18);padding-left:14px}li{margin-bottom:7px}@media(max-width:550px){.cards{grid-template-columns:1fr}.facts{gap:10px 20px}h2{font-size:23px}} </style></head><body><main>
<h2>Proposed directory and Highlights package</h2><p>One batch review, with corrections by exception. Prepared from the existing owner roster and source evidence; every new approval remains pending.</p>
<div class="facts"><div><strong>368</strong>proposed basic listings</div><div><strong>6</strong>Highlights nominations</div><div><strong>3</strong>identity exclusions</div></div>
<p>Recommended launch scope: useful bilingual listings, the accepted no-photo/no-marker treatment, incumbent categories plus an explicit “Uncategorised” group, and no unsupported facility claims.</p>
<p class="links"><a href="http://127.0.0.1:4371/review.html" target="_blank">Full bilingual reader ↗</a><a href="http://127.0.0.1:4371/roster-review.csv" target="_blank">Editable roster CSV ↗</a></p>
''']
for mall,label in [('saigon-centre','Saigon Centre'),('vincom-dong-khoi','Vincom Center Đồng Khởi')]:
    parts.append(f'<h3>{label} · proposed Highlights</h3><div class="cards">')
    for h in data:
        if h['mall']!=mall:continue
        row=next(r for r in rows if r['id']==h['destinationId'])
        parts.append(f'<section class="card"><h4>{e(row["name"]["en"])}</h4><small>{e(" / ".join(row["floors"]))}</small><p lang="vi">{e(h["description"]["vi"])}</p><p>{e(h["description"]["en"])}</p><a href="{e(h["sources"][0])}" target="_blank">First-party source ↗</a></section>')
    parts.append('</div>')
parts.append('''<p class="muted">Nominations balance a meal, a short stop and shopping. They are proposed selections, not existing owner endorsements or claims of firsthand quality. Current card schema shows destination descriptions; custom nomination captions above are review copy.</p>
<h3>Exact exceptions</h3><div class="hold"><p><strong>Exclude Cara, Lizd Namat and Mujosh &amp; Ted Baker</strong> from the proposed launch roster until their identity evidence is resolved. Their introductions remain null.</p></div>
<p>Keep Irvins/llaollao B2-K5 and Label Lab/Moschino L2-17 as distinct listings without an inferred shared storefront. Preserve all current broad-parent and L5-05 marker holds. Missing individual boundaries and photos are already covered by the accepted treatment.</p>
<details><summary>What the listing wording looks like</summary>''')
for id in ['saigon-prototype-annamgourmet','saigon-prototype-breadtalk']:
    r=next(r for r in rows if r['id']==id)
    parts.append(f'<h4>{e(r["name"]["en"])}</h4><p lang="vi">{e(r["proposedDescription"]["vi"])}</p><p>{e(r["proposedDescription"]["en"])}</p>')
r=next(r for r in rows if r['copyTreatment']=='minimal-floor-listing')
parts.append(f'<h4>{e(r["name"]["en"])} · minimal listing</h4><p lang="vi">{e(r["proposedDescription"]["vi"])}</p><p>{e(r["proposedDescription"]["en"])}</p>')
parts.append('''<small>203 broad summaries + 27 neutral summaries + 17 returned rewrites + 121 minimal floor listings. Minimal listings avoid unverified product/quality promises. Rich introductions can follow later.</small></details>
<details><summary>What accepting this package covers</summary><p>The proposed 368-row roster and VI/EN wording; category assignments including Uncategorised; six Highlight selections; no facility listings. Accept as a batch or list specific corrections. Actual VI/EN reviewers and review dates must be recorded.</p><p>This content decision does not approve the interactive UI or publication. Precise markers/photos remain optional where evidence is absent. The expanded candidate roster is not asserted to be a freshly verified tenant census.</p></details>
<p class="muted">Scope: 165 Saigon and 203 Vincom proposed listings. Full audit preserves all371 candidates and three exclusions. Public snapshots remain unchanged.</p></main><script>requestAnimationFrame(()=>console.log(JSON.stringify({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,highlightCards:document.querySelectorAll('.card').length,links:document.querySelectorAll('a').length})))</script></body></html>''')
(p/'decision-page.html').write_text(''.join(parts),encoding='utf-8')
