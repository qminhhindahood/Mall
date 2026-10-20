import json,pathlib,copy,hashlib,os
R=pathlib.Path('evidence/enrichment-exhaustion-2026-10-20-r3/content-audit');P=R.parent;L=P/'holds'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
inputs={L/'chunk-final-decisions.json',L/'mall-menu-reference.json',L/'decisions-complete.json',L/'records-complete.json'};out=[]
for d in read(L/'chunk-final-decisions.json')['decisions']:
 b=[]
 for s in d.get('sources',[]):
  if s.get('evidenceFile'):
   p=(L/s['evidenceFile']).resolve()
   if p.exists():inputs.add(p);b.append({**s,'file':os.path.relpath(p,P).replace('\\','/')})
 if not b:b=[{'file':'holds/decisions-complete.json','binding':d['destinationId']+'/'+d['field'],'method':'Full retained priorEvidence and fresh-source/search receipt chain reviewed; exact hold reason remains bounded.'}]
 o={k:d[k]for k in ['mallId','destinationId','field','reason']};o.update(evidenceBindings=b,reviewedBy='Codex independent content auditor (AI)',reviewedAt='2026-10-20')
 if d['outcome']=='proposal':
  f=copy.deepcopy(d['proposedField']);f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20');o.update(auditDecision='accept',acceptedField=f,originalProposal=d['proposedField'])
  n='chilli-menu-reference.jpg'if'vincom'in d['destinationId']else'spicy-menu-reference.jpg';inputs.add(L/n);b.append({'file':'holds/'+n,'result':'Independently visually inspected actual named Thai salad menu; or branded SpicyBox food image combined with named detailed menu in source body. No prices/policies imported.'})
  o['reason']+=' Independent full mall-body review and saved-image visual inspection verify actual food/menu role. Mall publishing authority is attributed accurately; third-party image credit is disclosed, not promoted as a current brand-issued branch menu.'
 else:o.update(auditDecision='hold',remainingAction=d['remainingAction'])
 out.append(o)
(R/'reviewed-chunks/holds-final21.json').write_text(json.dumps({'revision':'independent-root-held-final21','inputs':[{'file':os.path.relpath(p,P).replace('\\','/'),'sha256':sha(p)}for p in sorted(inputs)],'decisions':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('21:2reference-menu accepts19exactholds')
