import csv, hashlib, json, re, unicodedata
from pathlib import Path
p=Path(__file__).resolve().parent
base=p.parents[1]
load=lambda path:json.loads(path.read_text(encoding='utf-8'))
prior=load(p.parent/'roster-proposals.json')['records']
samples={r['id']:r for r in load(p/'sample-rewrites.json')['records']}
readiness={r['recordID']:r for r in load(p/'source-checks-readiness.json')['records']}
norm=lambda s:re.sub('[^a-z0-9]','',unicodedata.normalize('NFD',s.casefold()).encode('ascii','ignore').decode())
author={}
for name in ['saigon-authored.tsv','vincom-authored.tsv']:
    for row in csv.DictReader((p/name).open(encoding='utf-8'),delimiter='\t'):
        assert row['vi'] and row['en'];author[norm(row['name'])]=row
aliases={'hokkaidosachi':'sushihokkaidosachi','somthai':'somtamthai','bastahiro':'bastahiroitalianrestaurant','tgkcthegioikimcuong':'thegioikimcuong','ecco':'eccovietnam'}
original=load(base/'completion-packet-2026-10-17/roster.json')['records']
original={r['id']:r for r in original}
official=load(base/'completion-packet-2026-10-17/saigon-research/discoveries.json')['currentOfficialMallRoster']
official={r['officialId']:r for r in official}
vincom={r['id']:r for r in load(base/'record-review-2026-10-18/vincom-source-extracts.json')}
rows=[]
for old in prior:
    if old['copyTreatment']=='owner-null-hold' or (old['mall']=='vincom-dong-khoi' and old['copyTreatment']=='minimal-floor-listing'):continue
    row={'id':old['id'],'mall':old['mall'],'name':old['name'],'floors':old['floors'],'ownerApproval':False,'languageApprovals':{'vi':False,'en':False},'publicationApproval':False}
    key=norm(old['name']['en']);key=aliases.get(key,key)
    authored=author.get(key)
    if old['id'] in samples:
        sample=samples[old['id']]; row.update({k:sample[k] for k in ['description','sources','researchStatus']})
    elif authored:
        row['description']={lang:authored[lang] for lang in ['vi','en']}
        row['researchStatus']='rewritten-from-archived-primary-and-owner-context'
        row['sources']=[{'url':url,'evidenceSummary':'Existing record-level source reference; current branch stock/operating status is not inferred from this rewrite.'} for url in old['sources']]
    else:
        assert old['name']['en'] in ['RAK Thai','Sport Fair'],old['name']
        row.update(description={'vi':None,'en':None},researchStatus='description-evidence-gap',sources=[])
    # Preserve actual primary descriptive excerpts and immutable local pointers.
    source=original[old['id']]
    contexts=[]
    for ref in source.get('official',[]):
        detail=official.get(ref.get('id'))
        if detail and any(detail['descriptionEvidence'].values()):
            contexts.append({'path':'../../completion-packet-2026-10-17/saigon-research/discoveries.json#currentOfficialMallRoster[officialId='+ref['id']+']','urls':detail['sourceUrls'],'excerpt':detail['descriptionEvidence'].get('en','')[:1200] or detail['descriptionEvidence'].get('vi','')[:1200]})
    for detail in vincom.get(old['id'],{}).get('sources',[]):
        contexts.append({'path':'../../record-review-2026-10-18/vincom-source-extracts.json#'+old['id'],'sourceFile':detail.get('path'),'excerpt':detail['text'][:1400]})
    row['archivedPrimaryContext']=contexts
    if old['id'] in readiness:
        fresh=readiness[old['id']]
        row['sources'] += [{'url':u,'evidenceSummary':fresh['evidenceSummary']} for u in fresh['URLs']]
        row['freshPrimaryCheck']=fresh
        if row['researchStatus']!='description-evidence-gap':row['researchStatus']='rewritten-with-fresh-primary-check'
    row['previousDescription']=old['proposedDescription']
    row['priorScopedCopyAcceptance']=old['priorScopedCopyAcceptance']
    row['scope']='New overall brand/place introduction; no current stock, occupancy, precise location or publication approval'
    rows.append(row)
assert len(rows)==257,len(rows)
assert len({r['id'] for r in rows})==257
assert sum(bool(r['description']['vi'] and r['description']['en']) for r in rows)==255
(p/'owned-rewrites.json').write_text(json.dumps({'revision':'finish-review-descriptions-r2','styleApproval':'scoped owner decision in style-decision.json; full wording pending','records':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'owned':len(rows),'drafted':255,'sourceGaps':[r['id'] for r in rows if not r['description']['en']]},ensure_ascii=False))
