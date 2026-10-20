"""Reconcile evidence states only; never changes source directory, maps, descriptions or runtime."""
import json,pathlib,copy,collections,hashlib
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;BASE=ROOT.parents[2]
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(n,o):(ROOT/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
r1=BASE/'evidence/combined-local-2026-10-19-r1/coverage-ledger.json'
ledger=copy.deepcopy(read(r1));by={(r['mallId'],r['destinationId']):r for r in ledger['records']}
inputs={};accepted={}
for name in ['baseline-accepted.json','audited-incremental-records.json','audited-vincom-supplement-records.json','audited-saigon-supplement-records.json','audited-vincom-final-menu-records.json','audited-saigon-priority-brand-records.json']:
 path=ROOT/name;inputs[name]=hashlib.sha256(path.read_bytes()).hexdigest()
 for r in read(path)['records']:
  for f in r['fields']:
   key=(r['mallId'],r['destinationId'],f['field'])
   if key in accepted:raise ValueError('duplicate accepted field '+str(key))
   accepted[key]=f
for a in read(ROOT/'core-amendments.json')['amendments']:accepted.pop((a['mallId'],a['destinationId'],a['field']))
def add_observation(mall,id,field,receipt,item):
 r=by.get((mall,id))
 if not r or field not in r['fields']:return
 r['fields'][field].setdefault('researchObservations',[]).append({'receipt':receipt,'detail':item})
def hold(mall,id,field,receipt,item):
 add_observation(mall,id,field,receipt,item)
 if (mall,id,field) in accepted:return
 r=by.get((mall,id))
 if r and field in r['fields']:
  existing=r['fields'][field]
  if existing['state']=='verified-existing':raise ValueError('attempt to override accepted description/location/cuisine')
  existing['state']='evidence-conflict-hold'
  existing['holdReason']=item.get('reason','Source or applicability unresolved')
  existing.pop('research',None)

saigon=read(PACKET/'research-saigon/decisions.json')
for x in saigon['records']:
 add_observation('saigon-centre',x['destinationId'],x['field'],'research-saigon/decisions.json',x)
 if x['outcome'] in ['hold','preserved-hold']:hold('saigon-centre',x['destinationId'],x['field'],'research-saigon/decisions.json',x)
follow=read(PACKET/'research-saigon/followthrough-decisions.json')
for x in follow['followthrough']+follow['diningMenuSearches']+follow['overrides']:
 add_observation('saigon-centre',x['destinationId'],x['field'],'research-saigon/followthrough-decisions.json',x)
 if x.get('outcome')=='hold':hold('saigon-centre',x['destinationId'],x['field'],'research-saigon/followthrough-decisions.json',x)
vincom=read(PACKET/'research-vincom/decisions.json')
for x in vincom['unresearchedRemainder']:add_observation('vincom-dong-khoi',x['destinationId'],x['field'],'research-vincom/decisions.json',x)
for x in vincom['hold']:
 hold('vincom-dong-khoi',x['destinationId'],x['field'],'research-vincom/decisions.json',x)
for a in read(PACKET/'research-vincom/directory-attempts.json'):
 if a.get('destinationId') and ('vincom-dong-khoi',a['destinationId']) in by:
  by[('vincom-dong-khoi',a['destinationId'])].setdefault('directorySourceAttempts',[]).append(a)
for a in read(PACKET/'research-vincom/brand-attempts.json'):
 if a.get('destinationId') and ('vincom-dong-khoi',a['destinationId']) in by:
  by[('vincom-dong-khoi',a['destinationId'])].setdefault('brandSourceAttempts',[]).append(a)
vinextra=read(PACKET/'research-vincom/decisions-incremental.json')
for x in read(PACKET/'research-vincom/decisions-supplemental.json')['reviewedAdditionalOpportunities']:
 targets={'https://www.starbucks.vn/store-locator/':'vincom-prototype-starbucks','https://www.highlandscoffee.com.vn/vn/he-thong-cua-hang.html':'vincom-prototype-highlandscoffee','https://manwah.com.vn/':'vincom-prototype-manwah','https://gogi.com.vn/':'vincom-prototype-gogihouse','https://dookkivietnam.vn/':'vincom-prototype-dookkidookki'}
 for field in x['fields']:add_observation('vincom-dong-khoi',targets[x['sourceUrl']],field,'research-vincom/decisions-supplemental.json',x)
for x in vinextra['hold']:
 for field in x['fields']:hold('vincom-dong-khoi',x['destinationId'],field,'research-vincom/decisions-incremental.json',x)
for name in ['decisions.json','saigon-supplement-decisions.json']:
 for x in read(ROOT/name)['decisions']:
  if x['decision']=='hold':hold(x['mallId'],x['destinationId'],x['field'],'content-audit/'+name,x)
for x in read(ROOT/'core-amendments.json')['amendments']:hold(x['mallId'],x['destinationId'],x['field'],'content-audit/core-amendments.json',x)
for x in read(ROOT/'vincom-supplement-decisions.json')['boundedUnavailable']:
 r=by[('vincom-dong-khoi',x['destinationId'])];f=r['fields'][x['field']]
 if ('vincom-dong-khoi',x['destinationId'],x['field']) in accepted:raise ValueError('unavailable accepted overlap')
 f['state']='unavailable-after-research';f.pop('research',None)
 f['boundedScope']=x['boundedScope'];f['reason']=x['reason'];f['evidence']={'sourceUrl':x['sourceUrl'],'receipt':'content-audit/vincom-supplement-decisions.json','freshWebReference':x['freshWebReference']}
for (mall,id,field),f in accepted.items():
 r=by[(mall,id)]
 if field not in r['fields']:raise ValueError('unknown field')
 if r['fields'][field]['state']=='not-applicable':raise ValueError('accepted nonapplicable '+str((mall,id,field)))
 old=r['fields'][field];r['fields'][field]={'state':'verified-agent','research':f}
 if old.get('researchObservations'):r['fields'][field]['researchObservations']=old['researchObservations']
 r['researchAttempted']=True
ledger['revision']='independent-coverage-reconciliation-2026-10-19-r2'
ledger['reconciles']=str(r1.relative_to(BASE))
ledger['inputSha256']=inputs
ledger['scope']='All368frozen listings/11field slots. Accepted changes only from independent field ledgers. Original32accepted preserved. Research attempts do not imply complete global research; source failures, bounded unavailable and conflict holds remain distinct.'
states=collections.Counter(x['state']for r in ledger['records']for x in r['fields'].values())
querykeys={(x['destinationId'],x['field'])for x in follow['diningMenuSearches']}
retrievalkeys={(x['destinationId'],x['field'])for x in follow['overrides']if x.get('outcome')=='attempted-unresearched'}
for r in ledger['records']:
 for field,data in r['fields'].items():
  if data['state'] not in ['unresearched','evidence-conflict-hold']:continue
  if data['state']=='evidence-conflict-hold':stage='specific-evidence-or-applicability-hold'
  elif field=='cuisine':stage='outside-enrichment-schema-unresearched'
  elif (r['destinationId'],field)in retrievalkeys:stage='specific-source-retrieval-incomplete'
  elif (r['destinationId'],field)in querykeys:stage='field-specific-search-without-accepted-full-evidence'
  elif r['mallId']=='saigon-centre':stage='complete-mall-page-checked-independent-brand-field-unresearched'
  elif r.get('directorySourceAttempts')or r.get('brandSourceAttempts'):stage='directory-or-home-source-attempted-independent-field-unresearched'
  else:stage='no-completed-field-specific-evidence'
  data['researchStage']=stage
  data['independentBrandResearchExhausted']=False
remaining=[{'mallId':r['mallId'],'destinationId':r['destinationId'],'name':r['name'],'field':field,**data}for r in ledger['records']for field,data in r['fields'].items()if data['state']in ['unresearched','evidence-conflict-hold']]
summary={'listings':len(ledger['records']),'fieldSlots':sum(len(r['fields'])for r in ledger['records']),'fieldStates':dict(states),'remainingFieldTasks':len(remaining),'acceptedNewFields':len(accepted)-32,'baselineAcceptedPreserved':32,'acceptedTotal':len(accepted),'byMall':{},'remainingByField':dict(collections.Counter(x['field']for x in remaining)),'remainingByStateAndField':{state:dict(collections.Counter(x['field']for x in remaining if x['state']==state))for state in ['unresearched','evidence-conflict-hold']},'notGloballyExhausted':True,'limits':['No percentages inferred.','Directory presence/absence or a contact block does not establish current occupancy.','All165Saigon mall branch sources and disclosed outbound links were checked; independent retail catalog/service/booking research remains incomplete.','Vincom203identities reconciled to directory attempts, but only retrieved branch/brand values accepted; missing index names and failed sources are unresolved.','Cuisine slots outside enrichment detailFields remain unchanged.','Bounded unavailable means absent from specified checked sources, not unavailable everywhere.']}
summary['remainingByResearchStage']=dict(collections.Counter(x['researchStage']for x in remaining))
original={(r['mallId'],r['destinationId'],field):data['state']for r in read(r1)['records']for field,data in r['fields'].items()}
summary['acceptedOverlayPriorStates']=dict(collections.Counter(original[key]for key in accepted if key not in {(r['mallId'],r['destinationId'],f['field'])for r in read(ROOT/'baseline-accepted.json')['records']for f in r['fields']}))
for mall in ['saigon-centre','vincom-dong-khoi']:
 rows=[r for r in ledger['records']if r['mallId']==mall]
 summary['byMall'][mall]={'listings':len(rows),'fieldStates':dict(collections.Counter(f['state']for r in rows for f in r['fields'].values())),'remainingFieldTasks':sum(f['state']in['unresearched','evidence-conflict-hold']for r in rows for f in r['fields'].values())}
if len(accepted)!=658 or states['verified-agent']!=658 or sum(states.values())!=4048:raise ValueError('unexpected final accounting')
merged={}
for (mall,id,field),f in accepted.items():merged.setdefault((mall,id),{'mallId':mall,'destinationId':id,'fields':[]})['fields'].append(f)
write('reconciled-accepted-records.json',{'revision':'independent-reconciled-acceptance-2026-10-19-r2','records':list(merged.values())})
write('coverage-ledger.json',ledger);write('coverage-summary.json',summary);write('remaining-field-tasks.json',{'count':len(remaining),'records':remaining})
actualpath=BASE/'src/data/enrichment-accepted.json';actual=read(actualpath)
actualfields={(r['mallId'],r['destinationId'],f['field']):f for r in actual['records']for f in r['fields']}
baselinefields={(r['mallId'],r['destinationId'],f['field']):f for r in read(ROOT/'baseline-accepted.json')['records']for f in r['fields']}
receipt={'checkedAt':'2026-10-19','sourceRevision':'7ce14e2','sourceFile':'src/data/enrichment-accepted.json','sourceSha256':hashlib.sha256(actualpath.read_bytes()).hexdigest(),'expectedFields':len(accepted),'actualFields':len(actualfields),'actualRecords':len(actual['records']),'missingKeys':[str(k)for k in accepted.keys()-actualfields.keys()],'unexpectedKeys':[str(k)for k in actualfields.keys()-accepted.keys()],'changedFieldObjects':[str(k)for k in accepted.keys()&actualfields.keys()if accepted[k]!=actualfields[k]],'changedBaselineFields':[str(k)for k,f in baselinefields.items()if actualfields.get(k)!=f],'method':'Exact parsed field-object equality: baseline32 + core598 - LYN1 + Vincom9 + Saigon14 + Starbucks1 + Saigon priority5 =658. All packet filenames and hashes recorded in coverage-ledger.json; no source mutation.'}
receipt['result']='pass'if not any(receipt[k]for k in ['missingKeys','unexpectedKeys','changedFieldObjects','changedBaselineFields'])else'fail'
write('final-source-comparison.json',receipt)
print(json.dumps(summary,indent=2))
print(json.dumps(receipt,indent=2))

