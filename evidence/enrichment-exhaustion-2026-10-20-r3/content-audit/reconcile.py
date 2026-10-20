"""Independent audit accounting; consumes only reviewed chunks, never auto-accepts research."""
import json,pathlib,hashlib,collections,copy,datetime,urllib.parse
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;BASE=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(n,o):(ROOT/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(x):return(x['mallId'],x['destinationId'],x['field'])
def safe(url):
 u=urllib.parse.urlparse(url)
 return u.scheme in['http','https']and bool(u.hostname)and not u.username and not u.password and u.hostname not in['localhost','127.0.0.1']
expected={key(x):x for x in read(ROOT/'expected-keys.json')['records']}
baseline=read(ROOT/'baseline-accepted.json')
original={(r['mallId'],r['destinationId'],f['field']):f for r in baseline['records']for f in r['fields']}
coverage=copy.deepcopy(read(ROOT/'baseline-coverage.json'))
by={(r['mallId'],r['destinationId']):r for r in coverage['records']}
decisions={};chunkhashes={};accepted={};pending=[]
linkfields=['website','menu','catalog','programme','booking']
for path in sorted((ROOT/'reviewed-chunks').glob('*.json')):
 chunk=read(path);chunkhashes[path.name]=sha(path)
 for src in chunk.get('inputs',[]):
  p=PACKET/src['file']
  if sha(p)!=src['sha256']:raise ValueError('Reviewed research input changed: '+src['file'])
 for d in chunk['decisions']:
  k=key(d)
  if k not in expected or k in original:raise ValueError('unassigned or baseline key '+str(k))
  if k in decisions:raise ValueError('duplicate reviewed decision '+str(k))
  if d['auditDecision']not in['accept','hold','unavailable-after-research']:raise ValueError('unknown audit decision')
  if not d.get('reason','').strip()or not d.get('evidenceBindings'):raise ValueError('missing review reason/evidence')
  if not d.get('reviewedBy','').strip()or d.get('reviewedAt')!='2026-10-20':raise ValueError('missing actual reviewer/date')
  if d['auditDecision']=='accept':
   f=d['acceptedField']
   if f['field']!=k[2]or f['state']!='verified-agent'or f['approval']!='agent-accepted'or f['verification']!='source-checked':raise ValueError('invalid accepted field')
   if not safe(f['sourceUrl'])or(f.get('url')and not safe(f['url'])):raise ValueError('unsafe URL')
   if f['applicability']=='branch':
    if f.get('branchMallId')!=k[0]:raise ValueError('branch identity mismatch')
   elif f['applicability']=='brand-wide':
    if f.get('branchMallId'):raise ValueError('brand branch leakage')
   else:raise ValueError('unresolved accepted applicability')
   if k[2]=='hours'and f['applicability']!='branch':raise ValueError('branch hours without branch authority')
   if k[2]=='phone'and f['applicability']=='brand-wide'and not d.get('brandContactScopeExplicit'):raise ValueError('brand phone needs explicit brand-contact review')
   for lang in['vi','en']:
    if not f['uncertainty'].get(lang,'').strip():raise ValueError('missing localized uncertainty')
    if k[2]not in linkfields and not f.get('value',{}).get(lang,'').strip():raise ValueError('missing bilingual value')
   if k[2]in linkfields and not f.get('url'):raise ValueError('missing action')
   if k[2]=='phone'and f['value']['vi']!=f['value']['en']:raise ValueError('phone locale mismatch')
   accepted[k]=f
  elif d['auditDecision']=='unavailable-after-research':
   if not d.get('boundedScope')or not d.get('negativeCoverage'):raise ValueError('missing bounded negative coverage')
   if d.get('acceptedField'):raise ValueError('negative exposes accepted action/value')
  elif not d.get('remainingAction'):raise ValueError('hold needs exact remaining resolution action')
  decisions[k]=d
reviewamendments=read(ROOT/'review-amendments.json')['records']if(ROOT/'review-amendments.json').exists()else[]
for d in reviewamendments:
 k=key(d)
 if k not in decisions or d['priorAuditedDecision']!=decisions[k]:raise ValueError('review amendment does not preserve exact previous decision')
 if not d.get('evidenceBindings')or not d.get('reason')or d.get('reviewedAt')!='2026-10-20':raise ValueError('invalid review amendment evidence')
 if d['auditDecision']=='hold':
  if not d.get('remainingAction'):raise ValueError('invalid review hold amendment')
  accepted.pop(k,None)
 elif d['auditDecision']=='accept':
  f=d['acceptedField']
  if f['field']!=k[2]or f['state']!='verified-agent'or f['approval']!='agent-accepted'or f['verification']!='source-checked':raise ValueError('invalid accepted amendment metadata')
  if not safe(f['sourceUrl'])or(f.get('url')and not safe(f['url'])):raise ValueError('unsafe amendment URL')
  if f['applicability']=='branch':
   if f.get('branchMallId')!=k[0]:raise ValueError('amendment branch mismatch')
  elif f['applicability']=='brand-wide':
   if f.get('branchMallId'):raise ValueError('amendment brand scope leakage')
  else:raise ValueError('amendment applicability')
  for lang in ['vi','en']:
   if not f['uncertainty'].get(lang)or(k[2]not in linkfields and not f.get('value',{}).get(lang)):raise ValueError('amendment localization missing')
  if k[2]in linkfields and not f.get('url'):raise ValueError('amendment action missing')
  if k[2]=='hours'and f['applicability']!='branch':raise ValueError('amendment hours scope')
  if k[2]=='phone'and(f['value']['vi']!=f['value']['en']or(f['applicability']=='brand-wide'and not d.get('brandContactScopeExplicit'))):raise ValueError('amendment phone scope/value')
  accepted[k]=f
 else:raise ValueError('unsupported review amendment')
 decisions[k]=d
for k,x in expected.items():
 r=by[k[:2]];slot=r['fields'][k[2]]
 if k not in decisions:pending.append(x);slot['r3Audit']='pending';continue
 d=decisions[k];slot['r3Audit']={'decision':d['auditDecision'],'reason':d['reason'],'evidenceBindings':d['evidenceBindings']}
 if d['auditDecision']=='accept':slot.update(state='verified-agent',research=d['acceptedField'])
 elif d['auditDecision']=='unavailable-after-research':
  slot['state']='unavailable-after-research';slot.pop('research',None);slot['boundedScope']=d['boundedScope'];slot['negativeCoverage']=d['negativeCoverage']
 else:
  slot['state']='evidence-conflict-hold';slot.pop('research',None);slot['holdReason']=d['reason'];slot['remainingAction']=d['remainingAction']
amendments=read(ROOT/'baseline-amendments.json')['records']if(ROOT/'baseline-amendments.json').exists()else[]
amended={}
for d in amendments:
 k=key(d)
 if k not in original or k in expected or k in amended:raise ValueError('invalid outside-queue baseline amendment')
 if d['originalAcceptedField']!=original[k]:raise ValueError('baseline amendment does not preserve exact original field')
 if d['auditDecision']!='hold'or not d.get('evidenceBindings')or not d.get('remainingAction'):raise ValueError('invalid baseline hold')
 amended[k]=d;slot=by[k[:2]]['fields'][k[2]]
 slot.update(state='evidence-conflict-hold',holdReason=d['reason'],remainingAction=d['remainingAction'],r3BaselineAmendment=d)
 slot.pop('research',None)
merged=copy.deepcopy(baseline['records'])
for r in merged:r['fields']=[f for f in r['fields']if(r['mallId'],r['destinationId'],f['field'])not in amended]
recordby={(r['mallId'],r['destinationId']):r for r in merged}
coordinatoronly=[]
for k,f in accepted.items():
 if k[2]in['description','location']:
  coordinatoronly.append({'mallId':k[0],'destinationId':k[1],'field':f,'instruction':'Evidence proposal only; preserve approved directory and require separate coordinator reconciliation.'});continue
 r=recordby.get(k[:2])
 if r is None:r={'mallId':k[0],'destinationId':k[1],'fields':[]};recordby[k[:2]]=r;merged.append(r)
 r['fields'].append(f)
states=collections.Counter(slot['state']for r in coverage['records']for slot in r['fields'].values())
summary={'revision':'independent-exhaustion-audit-r3','checkedAt':'2026-10-20','expectedKeys':len(expected),'reviewedKeys':len(decisions),'pendingAuditKeys':len(pending),'baselineAcceptedFields':len(original),'decisions':dict(collections.Counter(d['auditDecision']for d in decisions.values())),'fieldStates':dict(states),'remainingResearchOrHoldFields':states['unresearched']+states['evidence-conflict-hold'],'allQueuedFieldsReviewed':len(pending)==0,'baselineMustRemainExact':True,'chunkHashes':chunkhashes,'byLane':{lane:{'expected':sum(x['lane']==lane for x in expected.values()),'reviewed':sum(expected[k]['lane']==lane for k in decisions)}for lane in sorted({x['lane']for x in expected.values()})},'limits':['Pending audit is incomplete work, not a source blocker.','Bounded unavailable covers named inspected sources only.','Holds name exact remaining actions; no global search-exhaustion inference.','Cuisine schema integration and runtime validation are coordinator-owned; approved directory values remain frozen.']}
summary.update(originalQueuedKeys=len(expected),outsideQueueBaselineAmendments=len(amended),expandedQueueKeys=len(expected)+len(amended),expandedReviewedKeys=len(decisions)+len(amended),baselineSnapshotFields=len(original),baselineRetainedExactFields=len(original)-len(amended),baselineMustRemainExactExceptExplicitAmendments=True,baselineMustRemainExact=not bool(amended),activeExpectedAcceptedFields=sum(len(r['fields'])for r in merged))
coverage['revision']='independent-coverage-reconciliation-2026-10-20-r3';coverage['r3AuditSummary']=summary
write('audit-decisions.json',{'records':list(decisions.values())});write('audit-summary.json',summary)
write('pending-audit-keys.json',{'records':pending});write('coverage-ledger.json',coverage)
write('accepted-incremental.json',{'records':[{'mallId':mall,'destinationId':identity,'fields':[f for (m,i,_),f in accepted.items()if m==mall and i==identity]}for mall,identity in dict.fromkeys(k[:2]for k in accepted)]})
write('expected-merged-acceptance.json',{'revision':'independent-r3-audited','records':merged});write('coordinator-only-proposals.json',{'records':coordinatoronly})
print(json.dumps(summary,indent=2))
