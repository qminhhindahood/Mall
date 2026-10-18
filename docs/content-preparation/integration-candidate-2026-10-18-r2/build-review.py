import json
from pathlib import Path
from html import escape
HERE=Path(__file__).resolve().parent
APP=HERE.parents[2]
PROJECT=APP.parents[1]
read=lambda p:json.loads(p.read_text(encoding="utf8"))
geometry=read(PROJECT/"docs/polygon-review/result-2026-10-18-r4/floor-geometry-candidate.json")
records=read(HERE/"saigon-centre.private.json")["records"]
all_records=records+read(HERE/"vincom-dong-khoi.private.json")["records"]
sections=[]
for floor in geometry["floors"]:
    approved=[(r,g) for r in records for g in r["geometryCandidates"] if g["floor"]==floor["id"]]
    if not approved:continue
    regions={r["id"]:r for r in floor["regions"]+floor.get("candidateRegions",[])}
    x1,y1,x2,y2=floor["bounds"]
    paths=[];rows=[]
    for r,g in approved:
        region=regions[g["regionId"]]
        d=" ".join("M"+" L".join(f"{x},{y}" for x,y in ring)+" Z" for ring in [region["outer"]]+region.get("holes",[]))
        label=escape(str(r["name"]))
        paths.append(f'<path d="{d}" fill-rule="evenodd"><title>{label}</title></path>')
        rows.append(f'<li><strong>{label}</strong><code>{escape(r["id"])}</code><span>Geometry accepted · {escape(g["sharedAreaRole"])}</span></li>')
    sections.append(f'<section><h2>Saigon Centre · {escape(floor["id"])}</h2><svg role="img" aria-label="Accepted r4 regions on {escape(floor["id"])}; not a complete floor map" viewBox="{x1} {y1} {x2-x1} {y2-y1}">{"".join(paths)}</svg><ul>{"".join(rows)}</ul></section>')
html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private geometry and unresolved-treatment review · r2</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f1e9;color:#242921;font:16px/1.55 system-ui}main{max-width:1100px;margin:auto;padding:24px}h1{font-size:clamp(28px,5vw,44px);line-height:1.12}p{max-width:78ch}.notice{padding:18px;background:#fff;border:2px solid #46644f;border-radius:12px}.counts{font-size:20px;font-weight:650}section{margin:30px 0;padding:24px;background:#fff;border-radius:12px;display:flow-root}svg{width:48%;max-height:450px;float:left;margin-right:3%;background:#f0f0e9}path{fill:#769b80;fill-opacity:.5;stroke:#284f37;stroke-width:.12}path:hover{fill:#d99c3e;fill-opacity:.9}ul{list-style:none;padding:0}li{margin:0 0 12px}code{display:block;font-size:12px;overflow-wrap:anywhere}span{display:block;font-size:13px;color:#50604d}a{color:#20573c}small{display:block}@media(max-width:600px){main{padding:16px}section{padding:16px}svg{float:none;width:100%;margin:0 0 12px}h1{font-size:30px}}</style><main><p>PRIVATE REVIEW · 18 OCTOBER 2026 · r2</p><h1>Accepted geometry, with content decisions still open</h1><div class="notice"><p><strong>Owner: “r4 geometry accept all”</strong></p><p>Owner: “Approve no-photo and no-marker treatment for unresolved records.”</p><p>These decisions accept the 42 r4 shapes and unresolved-record treatment. They do not approve duplicate-code identities, occupancy, the roster, VI/EN copy, image rights or publication.</p></div><p class="counts">42 geometry proposals accepted · 128 original location gaps remain unmarked · 371 unapproved media identities use no photo</p><p>This is a private review fixture, not a public directory. Approved polygons below preserve the r4 geometry frame; each panel shows only accepted regions, not a complete floor map. No location is invented for unresolved records. Shared areas and duplicated codes remain identity questions.</p><p>Copy context is available in <a href="../evidence-follow-up-2026-10-18-r1/owner-review.html">the bilingual owner reader</a>. No new VI/EN wording approval is recorded. The public directory validator remains enforced, and public snapshots remain pending/empty.</p>'+"".join(sections)+"<footer>Current revision integration-candidate-2026-10-18-r2. No deployment or release approval.</footer></main></html>"
(HERE/"review.html").write_text(html,encoding="utf8")
print(f"Rendered {sum(len(r['geometryCandidates']) for r in records)} approved regions; private review only")
