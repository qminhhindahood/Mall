import json,pathlib,copy,hashlib,os
R=pathlib.Path('evidence/enrichment-exhaustion-2026-10-20-r3/content-audit');P=R.parent;L=P/'holds'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
inputs={L/'chunk-browser-records.json',L/'chunk-browser-decisions.json'};out=[]
for d in read(L/'chunk-browser-decisions.json')['decisions']:
 b=[]
 for s in d['sources']:
  p=L/s['evidenceFile'];inputs.add(p);b.append({**s,'file':str(p.relative_to(P))})
 f=copy.deepcopy(d['proposedField']);f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20');reason=d['reason']+' Independent review of saved complete browser source/identity and specific value binding; no inference from status200 alone.'
 if d['destinationId']=='saigon-prototype-truffleco':
  b.append({'sourceUrl':f['sourceUrl'],'freshWebReference':'turn819view0'});f['uncertainty']['en']+=' A text-reader version also contains an unavailable-service message; confirm directly if the request cannot proceed.';f['uncertainty']['vi']+=' Phi\u00ean b\u1ea3n \u0111\u1ecdc v\u0103n b\u1ea3n c\u0169ng c\u00f3 th\u00f4ng b\u00e1o d\u1ecbch v\u1ee5 kh\u00f4ng kh\u1ea3 d\u1ee5ng; vui l\u00f2ng x\u00e1c nh\u1eadn tr\u1ef1c ti\u1ebfp n\u1ebfu kh\u00f4ng g\u1eedi \u0111\u01b0\u1ee3c y\u00eau c\u1ea7u.';reason+=' Fresh independent reader corroborates actual party/date/time controls and branch address, with conditional unavailable message disclosed rather than claiming a completed booking.'
 if d['destinationId']=='saigon-prototype-lachcalachcach':reason+=' Independently visually inspected pho food page, not just branded cover.'
 if d['destinationId']=='vincom-prototype-sanfulou':reason+=' Independently visually inspected selected Dong Khoi contact screenshot and read actual seven-page PDF dish text; default Le Lai tab is excluded.'
 out.append({'mallId':d['mallId'],'destinationId':d['destinationId'],'field':d['field'],'auditDecision':'accept','acceptedField':f,'originalProposal':d['proposedField'],'reason':reason,'evidenceBindings':b,'reviewedBy':'Codex independent content auditor (AI)','reviewedAt':'2026-10-20','brandContactScopeExplicit':f['applicability']=='brand-wide'})
(R/'reviewed-chunks/holds-browser-03.json').write_text(json.dumps({'revision':'independent-root-browser-eight-recoveries','inputs':[{'file':str(p.relative_to(P)),'sha256':sha(p)}for p in sorted(inputs)],'decisions':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
a=read(R/'baseline-amendments.json');base=read(R/'baseline-accepted.json');new=[('saigon-prototype-truffleco','10:00-21:30 daily','https://www.truffleco.vn/sgc-reservation-1-1','turn819view0','Operation Hours/Last Order at exact Saigon Centre B2 branch; visible browser schedule and fresh reader businessHours10:00-21:30.'),('saigon-prototype-rimowa','Mon-Fri09:30-21:30;Sat-Sun09:30-22:00','https://www.rimowa.com/us/en/storedetails/ho-chi%20minh%20city/rimowa-ho%20chi%20minh%20-%20saigon%20centre-45','turn822view0','Exact L1-20/65LeLoi and same02836367080; named weekday schedule329-335 conflicts with mall all-days09:30-21:30.')]
for identity,val,url,ref,detail in new:
 if any(d['destinationId']==identity and d['field']=='hours'for d in a['records']):continue
 original=next(f for r in base['records']if r['destinationId']==identity for f in r['fields']if f['field']=='hours')
 a['records'].append({'mallId':'saigon-centre','destinationId':identity,'field':'hours','auditDecision':'hold','originalAcceptedField':original,'reason':'Conflicting official baseline hours versus brand branch schedule: '+val+'. '+detail,'remainingAction':'Resolve competing official schedules with current branch authority before restoring verified hours; no silent preference or replacement.','evidenceBindings':[{'sourceUrl':url,'freshWebReference':ref,'section':detail},{'file':'content-audit/baseline-accepted.json','sourceUrl':original['sourceUrl'],'originalValue':original['value']}],'reviewedBy':'Codex independent content auditor (AI)','reviewedAt':'2026-10-20'})
(R/'baseline-amendments.json').write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('8accepted;2explicitbaselinehoursconflicts')
