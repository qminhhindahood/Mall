"""Generate the owner reader without importing proposals into the app."""
import html
import json
from pathlib import Path

out = Path(__file__).resolve().parent
ledger = json.loads((out / 'highlights-proposal.json').read_text(encoding='utf-8'))
esc = html.escape
style = '''body{font:16px/1.55 system-ui,sans-serif;color:var(--foreground,#231c17);margin:0}main{max-width:1100px;margin:auto}h1,h2{line-height:1.2}h1{font-size:32px}h2{font-size:24px}h2{margin-top:32px}p{max-width:80ch}a{color:var(--accent-foreground,#944021)}small,.muted{color:var(--muted-foreground,#64584e)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}figure{margin:0}img,video{width:100%;height:auto;border-radius:8px}figure.phone img{max-height:420px;object-fit:contain;object-position:left}figcaption{font-size:14px}details{border-top:1px solid var(--border,#d3c5b8);padding:16px 0}summary{cursor:pointer;font-weight:600;min-height:44px}code{overflow-wrap:anywhere;font-size:.85em}.copy{border-left:1px solid var(--border,#d3c5b8);padding-left:16px}li{margin-bottom:8px}@media(max-width:520px){.grid{grid-template-columns:1fr}}'''
parts = [f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Motion and Highlights review</title><style>{style}</style><main>',
         '<h1>Motion review · initial Highlights</h1>',
         '<p>Review candidate <code>46f162a70da3fc7d4f6b632db7816e7801c790c9</code> · 19 October 2026. Both malls, English and Vietnamese, desktop and actual 390 × 844 CSS viewports; normal and reduced motion. No application or asset changes were needed in this bounded review.</p>',
         '<p>Fresh intermediate checks, rapid reversals and emulated touch/keyboard checks pass. Recordings use local Chrome with software rendering: they demonstrate behavior, not physical-device smoothness or production performance. Your full motion-on appearance decision remains pending.</p>',
         '<p><a href="http://localhost:4363/en">Saigon EN</a> · <a href="http://localhost:4363/vi">Saigon VI</a> · <a href="http://localhost:4364/en">Vincom EN</a> · <a href="http://localhost:4364/vi">Vincom VI</a></p>',
         '<h2>Review the sequence</h2><p>Check the close podium approach and tower fade, centered stack, floor selection, invitation pacing, Discovery map reveal and rapid reverse travel. Floor identity and the accepted shop/control behavior must remain stable.</p><div class="grid">']
frames = [
    ('journey/frames/saigon-centre-1440-en-no-preference-overview-hover.png', 'Saigon · desktop floor hover; labels fade with the other floors', False),
    ('journey/frames/vincom-dong-khoi-390-en-no-preference-overview-hover.png', 'Vincom · 390px overview and complete floor rail', True),
    ('frames/saigon-390-vi-invitation-entry.png', 'Saigon · Vietnamese invitation arrives while the map remains', True),
    ('frames/vincom-1280-en-discovery-entry.png', 'Vincom · Discovery map returns after the old rail clears', False),
]
for path, caption, phone in frames:
    parts.append(f'<figure class="{"phone" if phone else "desktop"}"><img src="{path}" alt="{esc(caption)}"><figcaption>{esc(caption)}</figcaption></figure>')
parts.append('</div><h2>Normal-motion recordings</h2><p>English recordings cover both sizes; Vietnamese behavior is covered by the separate automated matrix and frame evidence. The recordings include forward travel and deliberate direction changes. It does not simulate a human browsing pace.</p><div class="grid">')
for mall in ['saigon', 'vincom']:
    for width in [1280, 390]:
        parts.append(f'<figure><video controls preload="metadata" src="recordings/paced/{mall}-{width}-en.webm"></video><figcaption>{mall.title()} · {width}px · normal motion</figcaption></figure>')
parts.append('</div><h2>Choose an initial Highlights set</h2><p>Three proposals per mall, selected for different visitor needs and supported individual locations. These are editorial proposals, not endorsements or popularity rankings. All six have approved identities and descriptions; new recommendation wording still needs your VI/EN approval.</p>')
for r in ledger['records']:
    parts.append(f'''<details><summary>{r['shortId']} · {esc(r['name']['en'])} · {r['floorId']} · {esc(r['categoryName']['en'])}</summary>
<p><code>{r['destinationId']}</code></p><p>{esc(r['rationale'])}</p>
<div class="copy"><p lang="vi"><strong>VI proposal:</strong> {esc(r['recommendation']['vi'])}</p><p><strong>EN proposal:</strong> {esc(r['recommendation']['en'])}</p></div>
<p class="muted">Based on the owner-approved directory and archived record-level evidence, reviewed 18 October. No fresh occupancy or stock verification, no photo, no held shared-parent or L5-05 mapping. Existing stable ID and supported area retained. <a href="highlights-proposal.json">Source and eligibility ledger</a>.</p></details>''')
parts.append('<h2>Your decision</h2><ol><li>Do you accept the normal-motion journey appearance for both malls at desktop and 390px, in EN/VI, on source <code>46f162a</code>? If not, identify the mall, viewport and transition to revise.</li><li>Which of SC1–SC3 and VC1–VC3 should become Highlights, and do you approve their proposed VI/EN recommendation text?</li></ol><p>Accepted r9 click behavior and motion-off remain accepted separately. No reply is recorded as approval. Highlights remain empty in the app; deployment is a separate decision.</p><p><a href="README.md">Evidence and limitations</a> · <a href="highlights-proposal.md">Full shortlist</a> · <a href="source-propagation.json">Exact source receipt</a></p></main></html>')
page = '\n'.join(parts)
(out / 'review.html').write_text(page, encoding='utf-8')
# The inline attachment uses absolute local image paths, which T3 embeds.
inline = page
for path, _, _ in frames:
    inline = inline.replace(f'src="{path}"', f'src="{(out/path).as_posix()}"')
start = inline.index('<h2>Normal-motion recordings</h2>')
end = inline.index('<h2>Choose an initial Highlights set</h2>')
inline = inline[:start] + '<p>Four normal-motion recordings and the full evidence ledger are included in the linked local review packet.</p>' + inline[end:]
for target in ['highlights-proposal.json', 'README.md', 'highlights-proposal.md', 'source-propagation.json']:
    inline = inline.replace(f'href="{target}"', f'href="{(out/target).as_posix()}"')
(out / 'inline.html').write_text(inline, encoding='utf-8')
print('Owner reader and inline attachment generated.')
