"""Freeze the reviewed merge contract after all exact known-source addenda land."""
import json,pathlib,hashlib,collections,datetime,sys
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;BASE=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d):return(d['mallId'],d['destinationId'],d['field'])
s=read(ROOT/'audit-summary.json');assert s['reviewedKeys']==1315 and s['pendingAuditKeys']==0
assert s['fieldStates'].get('unresearched',0)==0
assert s['outsideQueueBaselineAmendments']==16 and s['baselineRetainedExactFields']==642
ds=read(ROOT/'audit-decisions.json')['records'];expected=read(ROOT/'expected-merged-acceptance.json');baseline=read(ROOT/'baseline-accepted.json')
base={(r['mallId'],r['destinationId'],f['field']):f for r in baseline['records']for f in r['fields']}
active={(r['mallId'],r['destinationId'],f['field']):f for r in expected['records']for f in r['fields']}
removed={key(x)for x in read(ROOT/'baseline-amendments.json')['records']}
assert len(active)==s['activeExpectedAcceptedFields']
assert {k for k in base if k not in active}==removed
assert all(active[k]==f for k,f in base.items()if k not in removed)
preintegration=BASE/'src/data/enrichment-accepted.json'
assert sha(preintegration)==sha(ROOT/'baseline-accepted.json'),'Source changed before final audited import'
for rec in expected['records']:
 for f in rec['fields']:
  assert f['checkedAt']<=f.get('reviewedAt','2026-10-20')<='2026-10-20'
  if f['field']=='phone':assert f['value']['vi']==f['value']['en']
  for role in ['value','uncertainty']:
   assert all('\ufffd'not in x for x in f.get(role,{}).values())
inputs={};missing=[]
def collect(obj):
 if isinstance(obj,dict):
  if isinstance(obj.get('file'),str):
   p=(PACKET/obj['file']).resolve()
   if p.exists()and p.is_file():
    if obj.get('sha256'):assert sha(p)==obj['sha256'],p
    inputs[str(p.relative_to(BASE.resolve()))]={'sha256':sha(p),'bytes':p.stat().st_size}
   else:missing.append(obj['file'])
  for k,v in obj.items():
   if k!='originalProposal':collect(v)
 elif isinstance(obj,list):
  for x in obj:collect(x)
for p in sorted((ROOT/'reviewed-chunks').glob('*.json')):collect(read(p))
for name in ['review-amendments.json','baseline-amendments.json']:
 collect(read(ROOT/name))
for folder in ['retail-a-independent','retail-b-independent']:
 for p in sorted((ROOT/folder).glob('*amendments*.json')):
  collect(read(p));inputs[str(p.relative_to(BASE))]={'sha256':sha(p),'bytes':p.stat().st_size}
assert not missing,missing
# Exact original directories include approved description/location/roster values.
integ=read(ROOT/'baseline-integrity.json')
for name,h in integ['hashes'].items():
 if name.startswith('data/'):
  p=BASE/name;assert sha(p)==h,(name,'approved directory changed');inputs[name]={'sha256':sha(p),'bytes':p.stat().st_size}
for name in ['baseline-accepted.json','baseline-integrity.json','expected-keys.json','audit-decisions.json','audit-summary.json','review-amendments.json','baseline-amendments.json','accepted-incremental.json','expected-merged-acceptance.json','coverage-ledger.json','final-fresh-source-observations.json','final-cross-lane-closure-receipt.json']:
 p=ROOT/name;inputs[str(p.relative_to(BASE))]={'sha256':sha(p),'bytes':p.stat().st_size}
for p in sorted((ROOT/'reviewed-chunks').glob('*.json')):inputs[str(p.relative_to(BASE))]={'sha256':sha(p),'bytes':p.stat().st_size}
lanemap={key(d):d['lane']for d in read(ROOT/'expected-keys.json')['records']}
lane={name:dict(collections.Counter(d['auditDecision']for d in ds if lanemap[key(d)]==name))for name in sorted(set(lanemap.values()))}
if '--check-only'in sys.argv:
 print(json.dumps({'all1315Reviewed':True,'exactBaselineRetained':642,'explicitBaselineHolds':16,'currentAcceptedFields':len(active),'boundHashesValid':len(inputs),'approvedDirectoriesExact':True}));sys.exit(0)
receipt={'revision':'r3-independent-content-audit-final-merge-contract','checkedAt':'2026-10-20','originalQueueKeys':1315,'reviewedKeys':1315,'pendingAuditKeys':0,'unresearchedKeys':0,'originalQueueDecisions':s['decisions'],'byLane':lane,'baselineSnapshotFields':658,'explicitOutsideQueueBaselineHolds':16,'exactRetainedBaselineFields':642,'expandedReviewedKeys':1331,'newAcceptedFields':s['decisions']['accept'],'expectedActiveAcceptedFields':len(active),'expectedDestinationRecords':len(expected['records']),'expectedAcceptanceFile':'content-audit/expected-merged-acceptance.json','expectedAcceptanceSha256':sha(ROOT/'expected-merged-acceptance.json'),'reviewAmendmentsSha256':sha(ROOT/'review-amendments.json'),'approvedDirectoriesExact':True,'allBoundInputHashesValid':True,'boundFileCount':len(inputs),'sourceIntegrationPending':True,'reviewMethod':'Central independent full value/source binding and scope review; independent cross-lane retail reviewers; fresh primary reads concentrated on practical details/conflicts/identity and representative roles; saved complete browser receipts and actual menu/catalogue/form/PDF/image material reviewed. Does not claim every source was independently re-fetched. Hash/envelope checks aid reconciliation and do not establish factual truth.','remainingLimits':['Specific identity, authority, access, conflicting-value and field-applicability holds retain exact next actions.','Bounded unavailable concerns only the named checked public-source families and queries; it is not permanent/global nonexistence.','No branch telephone/hours copied between malls. Foreign/regional/subset/menu-reference scope remains explicit.','No live call, booking, purchase or publication performed. Source integration and runtime/build validation remain coordinator-owned.']}
receipt['preIntegrationAcceptedSha256']=sha(preintegration)
write(ROOT/'final-source-input-hashes.json',{'base':'isolated candidate root','files':inputs})
receipt['sourceInputManifestSha256']=sha(ROOT/'final-source-input-hashes.json');write(ROOT/'final-audit-freeze.json',receipt)
text=f'''# r3 independent enrichment audit — final merge contract

All 1,315 original queued keys are independently reviewed: {s['decisions']['accept']} accepted, {s['decisions']['hold']} specific holds and {s['decisions']['unavailable-after-research']} bounded unavailable. Zero pending audit or unresearched queued keys. The expanded reviewed set is 1,331 after 16 separately documented baseline contradictions.

The expected merge contains {len(active)} accepted fields across {len(expected['records'])} destination records: 642 exact retained baseline objects plus {s['decisions']['accept']} newly accepted fields. The original 658-object snapshot remains intact; 16 explicit amendments preserve the exact old field and opposing official evidence. Every later decision change likewise preserves its exact prior decision. Approved roster, descriptions and locations remain byte-exact. Import only expected-merged-acceptance.json; final-audit-freeze.json binds its hash and final-source-input-hashes.json binds {len(inputs)} reviewed input/output files.

Independent review checked actual value/source bindings, target roles, branch versus brand scope, bilingual text, numeric contacts, conflicts and market/date limits. Complete saved receipts and actual product/menu/form material were reviewed, with fresh primary reads focused on risky practical facts, identities and representative targets. Images and PDFs were visually inspected where needed. Independent reviewers audited other researchers' retail lanes. This does not claim every URL was independently re-fetched or rendered. reconcile.py validates accounting and envelopes; it is not a truth detector.

Remaining holds name exact access, identity, authority, applicability or conflict resolution actions. Bounded unavailable covers only listed checked public sources; zero unresearched does not prove universal internet exhaustion. Known-source final followthrough includes actual catalogue targets, scoped general contacts, cross-mall brand-menu reuse and completed Takahiro rendering/script-family checks. No known assigned recovery is left pending. No call, reservation, purchase, public upload or publication occurred. Integration, runtime/build validation and packaging remain coordinator-owned; no personal-owner gate is invented.
'''
write(ROOT/'audit-delivery-summary.json',receipt)
(ROOT/'README.md').write_text(text,encoding='utf-8')
print(json.dumps(receipt,indent=2))
