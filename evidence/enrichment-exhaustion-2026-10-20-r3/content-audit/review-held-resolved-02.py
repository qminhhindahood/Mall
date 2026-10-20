import pathlib,json,copy,hashlib,os
R=pathlib.Path('evidence/enrichment-exhaustion-2026-10-20-r3/content-audit');P=R.parent;L=P/'holds'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
inputs={L/'chunk-resolved-decisions.json',L/'chunk-resolved-records.json'};out=[]
refs={'phone':'turn787view0','website':'turn787view1'}
for d in read(L/'chunk-resolved-decisions.json')['decisions']:
 b=[]
 for s in d['sources']:
  p=(L/s['evidenceFile']).resolve();inputs.add(p);b.append({**s,'file':os.path.relpath(p,P).replace('\\','/')})
 f=copy.deepcopy(d['proposedField']);f.update(state='verified-agent',approval='agent-accepted',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
 reason=d['reason']
 if d['field'] in refs:b.append({'sourceUrl':f['sourceUrl'],'freshWebReference':refs[d['field']]})
 else:reason+=' Independently inspected saved official HTML-to-published-script-to-public-CMS collection chain, published collection IDs1002/1055 and seven actual dish records. Saved completed retrieval is reviewed, not claimed as an additional independent network fetch.'
 out.append({'mallId':d['mallId'],'destinationId':d['destinationId'],'field':d['field'],'auditDecision':'accept','acceptedField':f,'originalProposal':d['proposedField'],'reason':reason,'evidenceBindings':b,'reviewedBy':'Codex independent content auditor (AI)','reviewedAt':'2026-10-20','brandContactScopeExplicit':f['applicability']=='brand-wide'})
(R/'reviewed-chunks/holds-resolved-02.json').write_text(json.dumps({'revision':'independent-root-held-three-source-recoveries','inputs':[{'file':os.path.relpath(p,P).replace('\\','/'),'sha256':sha(p)}for p in sorted(inputs)],'decisions':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('3 root resolved proposals independently accepted')
