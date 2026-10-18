"""Assemble a private decision packet; never updates application content or approvals."""
import collections, csv, hashlib, html, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
ROOT = BASE.parent.parent
inputs = {}
def read(relative):
    path = BASE / relative
    inputs[relative] = hashlib.sha256(path.read_bytes()).hexdigest()
    return json.loads(path.read_text(encoding='utf-8'))
def write(name, value):
    (HERE/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

roster = read('completion-packet-2026-10-17/roster.json')['records']
ledger = {r['id']: r for r in read('record-review-2026-10-18/content-ledger.json')}
returns = {r['id']: r for r in read('copy-return-2026-10-18/reconciled-copy.json')['records']}
neutral = {r['id']: r for r in read('evidence-follow-up-2026-10-18-r1/neutral-copy-proposals.json')['records']}
holds = {r['id']: r for r in read('copy-hold-amendment-2026-10-18/effective-holds.json')['records']}
mapping = read('record-review-2026-10-18/mapping-ledger.json')
records=[]
for r in roster:
    old=ledger[r['id']]
    scope='prior-broad-summary'; provenance='record-review-2026-10-18/content-ledger.json'
    copy={lang: old['copy'][lang]['proposedText'] for lang in ['vi','en']}
    if not all(copy.values()):
        # No unsupported product, status, availability or quality promise.
        vi=', '.join(r['floors']); en=', '.join(r['floors'])
        copy={'vi':f"Xem thông tin {r['name']} tại tầng {vi}.", 'en':f"Find {r['name']} on floor{'s' if len(r['floors'])>1 else ''} {en}."}
        scope='minimal-floor-listing'; provenance='latest owner-confirmed floor set in completion roster; no product assertion'
    if r['id'] in neutral:
        copy=neutral[r['id']]['proposedText']; scope='prior-neutral-summary'; provenance='evidence-follow-up-2026-10-18-r1/neutral-copy-proposals.json'
    if r['id'] in returns and all(returns[r['id']]['description'].values()):
        copy=returns[r['id']]['description']; scope='returned-owner-informed-rewrite'; provenance='copy-return-2026-10-18/reconciled-copy.json'
    if r['id'] in holds:
        copy={'vi':None,'en':None}; scope='owner-null-hold'; provenance='copy-hold-amendment-2026-10-18/effective-holds.json'
    records.append({'id':r['id'],'mall':r['mall'],'name':{'vi':r['name'],'en':r['name']},'floors':r['floors'],
        'categories':r['categories'],'proposedDescription':copy,'copyTreatment':scope,'copyProvenance':provenance,
        'sources':old['sources'],'rosterIssues':r.get('issues',[]),'officialReferences':r.get('official',[]),
        'mediaTreatment':'no-photo-owner-accepted','locationTreatment':'supported individual areas only; floor/list elsewhere; preserve shared-parent and L5-05 holds',
        'priorScopedCopyAcceptance':returns.get(r['id'],{}).get('copyOwnerApproval',False),
        'proposedLaunchDisposition':'exclude-identity-unresolved' if r['id'] in holds else 'include-after-batch-roster-and-language-approval',
        'ownerApproval':False,'publicationApproval':False,'languageApprovals':{'vi':False,'en':False},
        'currentOperatingStatus':'not independently verified by this assembly','importable':False})

write('roster-proposals.json', {'revision':'finish-review-2026-10-18-r1','reviewer':'Codex (AI preparation; no owner/editorial approval)', 'records':records})
with (HERE/'roster-review.csv').open('w',encoding='utf-8-sig',newline='') as f:
    out=csv.writer(f);out.writerow(['id','mall','name','floors','treatment','vi','en','sources','owner_decision','vi_reviewer','en_reviewer'])
    for r in records: out.writerow([r['id'],r['mall'],r['name']['vi'],', '.join(r['floors']),r['copyTreatment'],r['proposedDescription']['vi'],r['proposedDescription']['en'],' | '.join(r['sources']),'','',''])

audit=[]
for r in mapping:
    reasons=r.get('missingEvidence',[])
    group='accepted-r4-shape-separate-identity-review' if r['proposedDecision']=='review-registered-source-polygon' else ('merged-contour-needs-individual-partition' if any('also containing' in s for s in reasons) else 'needs-source-or-boundary-evidence')
    audit.append({'id':r['id'],'mall':r['mall'],'name':r['name'],'floor':r['floor'],'group':group,'proposedRegion':r.get('proposedRegion'),
        'sources':r.get('sources',[]),'missingEvidence':reasons,'anchors':r.get('sourceLabelAnchors',[]),'promoteAdditionalExactAssociation':False})
write('mapping-audit.json', {'revision':'finish-review-2026-10-18-r1','newPreciseAssociations':0,'reason':'No unambiguous new individual unit boundary established by existing gap ledger. Unit labels inside merged contours cannot become exact storefront highlights.', 'records':audit})
write('input-hashes.json',inputs)
summary={'identities':len(records),'byMall':dict(collections.Counter(r['mall'] for r in records)), 'copyTreatments':dict(collections.Counter(r['copyTreatment'] for r in records)), 'mappingOccurrences':len(audit),'mappingGroups':dict(collections.Counter(r['group'] for r in audit)),'newPreciseAssociations':0}
assert len(records)==371 and len({r['id'] for r in records})==371
assert len(holds)==3 and all(r['proposedDescription']=={'vi':None,'en':None} for r in records if r['id'] in holds)
assert all(all(r['proposedDescription'].values()) for r in records if r['id'] not in holds)
assert all(not r['ownerApproval'] and not r['publicationApproval'] and not any(r['languageApprovals'].values()) for r in records)
assert len(audit)==170 and not any(r['promoteAdditionalExactAssociation'] for r in audit)
write('validation.json',{'passed':5,'failed':0,'checks':['371 unique identities','three exact null holds','368 complete bilingual proposals','approval metadata remains false','170 mapping occurrences; no unsupported promotions'],'summary':summary})
highlights=json.loads((HERE/'highlights.json').read_text(encoding='utf-8'))['records']
assert len(highlights)==6 and all(h['destinationId'] in ledger for h in highlights)
assert all(not h['ownerApproval'] and not any(h['languageApprovals'].values()) for h in highlights)
esc=lambda x: html.escape(str(x))
parts=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Final content decision packet</title><style>body{font:17px/1.6 system-ui;max-width:960px;margin:auto;padding:24px;color:#24211d;background:#fffaf4}article{padding-block:22px;border-bottom:1px solid #cfc3b5}small{color:#635a50}a{color:#853522}h1,h2{line-height:1.2}code{overflow-wrap:anywhere}p{max-width:75ch}</style><main><h1>Content ready for a final decision</h1><p>Private proposals. No roster, language, recommendation or publication approval is inferred. 371 identities: 368 bilingual proposals and three explicit null-copy holds. Review <a href="DECISIONS.md">the short decision sheet</a> first.</p><h2>Six proposed Highlights</h2>']
for h in highlights:
    parts.append(f'<article><h3>{esc(h["destinationId"])}</h3><p lang="vi">{esc(h["title"]["vi"])} — {esc(h["description"]["vi"])}</p><p>{esc(h["title"]["en"])} — {esc(h["description"]["en"])}</p><p>{esc(h["reason"])}</p><small>{esc(h["sourceLimit"])}</small><p>'+ ' · '.join(f'<a href="{esc(url)}">Source {i+1}</a>' for i,url in enumerate(h['sources']))+'</p></article>')
parts.append('<h2>Complete proposed roster and wording</h2><p>Minimal floor listings deliberately avoid unverified product claims. They are a proposed launch treatment, not completed rich introductions. Existing null holds remain blank.</p>')
for r in records:
    parts.append(f'<article id="{esc(r["id"])}"><h3>{esc(r["name"]["vi"])}</h3><small>{esc(r["mall"])} · {esc(", ".join(r["floors"]))} · {esc(r["copyTreatment"])}</small><p lang="vi">{esc(r["proposedDescription"]["vi"] or "[Giữ trống — cần bằng chứng]")}</p><p>{esc(r["proposedDescription"]["en"] or "[Blank — evidence required]")}</p><details><summary>Evidence and provenance</summary><p>{esc(r["copyProvenance"])}</p><code>{esc(r["id"])}</code><p>'+ '<br>'.join(esc(s) for s in r['sources'])+'</p></details></article>')
(HERE/'review.html').write_text(''.join(parts)+'</main></html>',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False))
