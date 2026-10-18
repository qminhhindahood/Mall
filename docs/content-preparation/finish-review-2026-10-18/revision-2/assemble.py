"""Assemble saved description drafts; never alter historical r1 or approval flags."""
import copy
import csv
import hashlib
import html
import io
import json
from collections import Counter
from pathlib import Path

P = Path(__file__).resolve().parent
def load(path):
    return json.loads(path.read_text(encoding='utf-8'))
def write(name, obj):
    (P/name).write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

prior = load(P.parent/'roster-proposals.json')['records']
owned = load(P/'owned-rewrites.json')['records']
vincom = load(P/'vincom-minimal-rewrites.json')
rewrites = {r['id']: r for r in owned+vincom}
assert len(rewrites) == len(owned)+len(vincom) == 368
assert set(rewrites) == {r['id'] for r in prior if r['copyTreatment'] != 'owner-null-hold'}
readiness = {r['recordID']: r for r in load(P/'source-checks-readiness.json')['records']}
rows = []
for old in prior:
    row = copy.deepcopy(old)
    new = rewrites.get(old['id'])
    row['previousRevisionDescription'] = old['proposedDescription']
    row['previousRevisionCopyTreatment'] = old['copyTreatment']
    row['previousRevisionCopyProvenance'] = old['copyProvenance']
    row['previousRevisionSources'] = old['sources']
    if new:
        assert new['name'] == old['name'] and new['floors'] == old['floors'] and new['mall'] == old['mall']
        row['proposedDescription'] = new['description']
        row['sources'] = new['sources']
        row['researchStatus'] = new['researchStatus']
        row['copyTreatment'] = 'informative-description-draft-r2' if new['description']['en'] else 'description-evidence-hold-r2'
        row['copyProvenance'] = 'Saved r2 authored draft; '+ ('owned-rewrites.json' if old['id'] in {r['id'] for r in owned} else 'vincom-minimal-rewrites.json')
        for key in ['archivedPrimaryContext', 'freshPrimaryCheck', 'historicalScopedAcceptance', 'scope']:
            if key in new:
                row[key] = new[key]
    else:
        assert row['proposedDescription'] == {'vi': None, 'en': None}
        row['researchStatus'] = 'prior-identity-evidence-hold-preserved'
    if row['id'] in readiness:
        row['freshPrimaryCheck'] = readiness[row['id']]
    row['ownerApproval'] = False
    row['languageApprovals'] = {'vi': False, 'en': False}
    row['publicationApproval'] = False
    row['importable'] = False
    row['proposedLaunchDisposition'] = 'pending-roster-and-language-review' if row['proposedDescription']['en'] else 'floor-list-access-with-description-held'
    rows.append(row)

drafts = [r for r in rows if all(r['proposedDescription'].values())]
holds = [r for r in rows if not any(r['proposedDescription'].values())]
assert len(rows) == 371 and len(drafts) == 361 and len(holds) == 10
assert all(r['sources'] for r in drafts)
assert all(not r['ownerApproval'] and not r['publicationApproval'] and not any(r['languageApprovals'].values()) and not r['importable'] for r in rows)
assert all(r['priorScopedCopyAcceptance'] == old['priorScopedCopyAcceptance'] and r['rosterIssues'] == old['rosterIssues'] and r['locationTreatment'] == old['locationTreatment'] and r['mediaTreatment'] == old['mediaTreatment'] for r, old in zip(rows, prior))
packet = {'revision': 'finish-review-descriptions-r2', 'reviewer': 'Codex (AI)', 'styleDecision': 'style-decision.json', 'fullWordingApproval': False, 'publicImportAllowed': False, 'highlightsDeferred': True, 'discoveryDetailContentDeferred': True, 'records': rows}
write('roster-proposals.json', packet)
columns = ['id', 'mall', 'name_vi', 'name_en', 'floors', 'description_vi', 'description_en', 'correction_vi', 'correction_en', 'owner_notes', 'research_status', 'sources', 'roster_issues']
stream = io.StringIO(newline='')
writer = csv.DictWriter(stream, fieldnames=columns)
writer.writeheader()
for r in rows:
    writer.writerow(dict(id=r['id'], mall=r['mall'], name_vi=r['name']['vi'], name_en=r['name']['en'], floors=' / '.join(r['floors']), description_vi=r['proposedDescription']['vi'] or '', description_en=r['proposedDescription']['en'] or '', correction_vi='', correction_en='', owner_notes='', research_status=r['researchStatus'], sources=json.dumps(r['sources'], ensure_ascii=False), roster_issues=json.dumps(r['rosterIssues'], ensure_ascii=False)))
(P/'roster-review.csv').write_text(stream.getvalue(), encoding='utf-8-sig', newline='')
validation = {'revision': packet['revision'], 'totalRecords': len(rows), 'bilingualDrafts': len(drafts), 'nullDescriptionHolds': len(holds), 'mallCounts': dict(Counter(r['mall'] for r in rows)), 'vincomBatch': {'rows':111, 'drafts':106, 'primaryAndSupplied':80, 'ownerSuppliedOnly':26, 'nullHolds':5}, 'holds': [{'id':r['id'], 'name':r['name']['en'], 'reason':r['researchStatus']} for r in holds], 'checks': {'uniqueCompleteIdSet':len({r['id'] for r in rows})==371, 'inheritedIdentityLocationMediaIssuesPreserved':True, 'noNewApprovalOrImport':True, 'allDraftsHaveSourceReferences':True, 'allFreshReadinessRecordsRetained':all(i in {r['id'] for r in rows} for i in readiness)}, 'limitations':['Source references support drafting, not fresh branch inventory or occupancy.', '26 Vincom drafts rely on supplied summaries only; no independent primary-detail verification is claimed.', 'No new source research performed by this assembly; archived and readiness checks retain their own provenance.', 'Style acceptance does not approve all final strings, roster, language or release.'], 'inputHashes': {str(path.relative_to(P.parent)):hashlib.sha256(path.read_bytes()).hexdigest() for path in [P.parent/'roster-proposals.json', P/'owned-rewrites.json', P/'vincom-minimal-rewrites.json', P/'source-checks-readiness.json', P/'style-decision.json']}}
write('validation.json', validation)
reader_rows = [{k:r[k] for k in ['id','mall','name','floors','proposedDescription','researchStatus','sources','rosterIssues']} for r in rows]
data = json.dumps(reader_rows, ensure_ascii=False).replace('<', '\\u003c')
page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Current descriptions · private r2 review</title><style>body{margin:0;background:#f5f1e9;color:#252a27;font:16px/1.5 system-ui}main{max-width:1100px;margin:auto;padding:24px}h1{font-size:clamp(25px,4vw,42px);line-height:1.15}header{border-bottom:1px solid #b5b4aa;padding-bottom:20px}a{color:#155d53}nav{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}input,select,button{color:#252a27;background:#fffdf7;font:inherit;padding:10px;max-width:100%;box-sizing:border-box}input{flex:1;min-width:180px}article{background:#fffdf7;border:1px solid #d6d3c9;border-radius:12px;padding:18px;margin:18px 0;overflow-wrap:anywhere}h2{margin:0;font-size:22px}.meta{color:#62675f;font-size:13px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}textarea{color:#252a27;box-sizing:border-box;width:100%;min-height:130px;padding:12px;font:inherit;line-height:1.5;border:1px solid #aaa;background:white}label{display:block;font-weight:650}details{font-size:14px;margin-top:12px}#notice{color:#715026}button{cursor:pointer} @media(max-width:600px){main{padding:16px}.pair{grid-template-columns:1fr}nav>*{width:100%}}</style><main><header><p>PRIVATE DRAFT · 18 OCTOBER 2026 · REVISION 2</p><h1>Descriptions ready for your corrections</h1><p>361 informative bilingual drafts; 10 descriptions held for missing identity or offering evidence. The sample's style is accepted; final wording and roster remain drafts.</p><p>Change any VI or EN field, add a note, then download your edits. Edits stay in this tab until downloaded. Downloading records corrections and does not grant approval.</p><p>Richer Discovery detail content and restaurant/shop Highlights will be developed together later.</p><p><a href="roster-review.csv">Editable CSV</a> · <a href="validation.json">Evidence gaps and validation</a> · <a href="README.md">Scope and provenance</a></p></header><nav><input id="query" aria-label="Find a store" placeholder="Find name, floor or ID"><select id="mall" aria-label="Mall"><option value="">Both malls</option><option value="saigon-centre">Saigon Centre</option><option value="vincom-dong-khoi">Vincom</option></select><select id="kind" aria-label="Evidence filter"><option value="">All records</option><option value="draft">Draft descriptions</option><option value="hold">Evidence holds</option><option value="supplied">Supplied evidence only</option></select><button id="download">Download edits</button></nav><p id="count" role="status"></p><p id="notice"></p><section id="list"></section></main><script>const rows=DATA;const edits={};const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(){const q=document.querySelector('#query').value.toLocaleLowerCase(),mall=document.querySelector('#mall').value,kind=document.querySelector('#kind').value;const visible=rows.filter(r=>(!mall||r.mall===mall)&&(!q||JSON.stringify([r.id,r.name,r.floors]).toLocaleLowerCase().includes(q))&&(!kind||(kind==='hold'?!r.proposedDescription.en:kind==='draft'?!!r.proposedDescription.en:r.researchStatus.includes('owner-supplied-evidence-only'))));document.querySelector('#count').textContent=visible.length+' records shown';document.querySelector('#list').innerHTML=visible.map(r=>{const e=edits[r.id]||{};return `<article><h2>${esc(r.name.en)}</h2><p class="meta">${esc(r.mall)} · ${esc(r.floors.join(' / '))} · ${esc(r.id)}</p>${!r.proposedDescription.en?'<p><strong>Description held.</strong> Floor/list access remains available; no detailed offering is inferred.</p>':''}<div class="pair">${['vi','en'].map(lang=>`<label>${lang.toUpperCase()}<textarea data-id="${esc(r.id)}" data-field="${lang}" aria-label="${lang.toUpperCase()} description for ${esc(r.name.en)}">${esc(e[lang]??r.proposedDescription[lang]??'')}</textarea></label>`).join('')}</div><label>Correction note<textarea data-id="${esc(r.id)}" data-field="note" aria-label="Correction note for ${esc(r.name.en)}">${esc(e.note||'')}</textarea></label><details><summary>Sources and unresolved issues</summary><p>${esc(r.researchStatus)}</p><pre style="white-space:pre-wrap">${esc(JSON.stringify({sources:r.sources,issues:r.rosterIssues},null,2))}</pre></details></article>`}).join('')}document.querySelector('#list').addEventListener('input',event=>{const t=event.target;if(!t.dataset.id)return;(edits[t.dataset.id]??={})[t.dataset.field]=t.value;document.querySelector('#notice').textContent=Object.keys(edits).length+' records edited — download before closing this tab.'});for(const id of ['query','mall','kind'])document.getElementById(id).addEventListener('input',render);document.querySelector('#download').onclick=()=>{const blob=new Blob([JSON.stringify({revision:'finish-review-descriptions-r2',kind:'owner-corrections-not-approval',edits},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='description-corrections-r2.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};render();</script></html>'''.replace('DATA',data)
(P/'review.html').write_text(page, encoding='utf-8')
print(json.dumps({'records':371,'drafts':361,'holds':10,'checks':validation['checks']}))
