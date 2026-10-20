import json,pathlib,copy,hashlib,os
R=pathlib.Path('evidence/enrichment-exhaustion-2026-10-20-r3/content-audit');P=R.parent;L=P/'saigon-retail'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
ds=read(L/'decisions.json')['decisions'];ex=read(L/'field-support-excerpts.json');inputs={L/'decisions.json',L/'records.json',L/'field-support-excerpts.json',*L.glob('source-*.txt')};out=[]
cat={d['destinationId']:d['proposedField']for d in ds if d['outcome']=='proposal'and d['field']=='catalog'}
fresh={'himalaya':'turn783view3','rimowa':'turn822view0','takashimaya':'turn784view1','bloom':'turn783view2','skechers':'turn783view0','vivaia':'turn837view1','newbalance':'turn837view2','fujifilm':'turn837view3','lyn':'turn829view0','matinkimvietnam':'turn832view1','sandro':'turn833view0','pandora':'turn833view2'}
for d in ds:
 b=[]
 for s in d.get('sources',d.get('attempts',[])):
  p=(L/s['evidenceFile']).resolve()if s.get('evidenceFile')else None
  if p and p.exists():inputs.add(p);b.append({**{k:v for k,v in s.items()if k!='support'},'file':os.path.relpath(p,P).replace('\\','/')})
 if not b:
  for s in d.get('attempts',[]):
   p=(L/s['evidenceFile']).resolve()
   if p.exists():inputs.add(p);b.append({**s,'file':os.path.relpath(p,P).replace('\\','/')})
 b.append({'file':'saigon-retail/field-support-excerpts.json','binding':d['destinationId']+'/'+d['field'],'method':'Field-bound exact source windows plus complete source receipt; not proof inferred from generic navigation alone.'})
 o={k:d[k]for k in ['mallId','destinationId','field','reason']};o.update(evidenceBindings=b,reviewedBy='Codex independent content auditor (AI)',reviewedAt='2026-10-20');suffix=d['destinationId'].removeprefix('saigon-prototype-')
 reject=(suffix=='miana'and d['field']=='catalog')or(suffix=='onitsukatiger'and d['field']=='phone')
 if d['outcome']=='proposal'and not reject:
  f=copy.deepcopy(d['proposedField']);f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
  if suffix in fresh:b.append({'sourceUrl':f['sourceUrl'],'freshWebReference':fresh[suffix]})
  if suffix=='boss'and d['field']=='services':f['value']={'en':'Tailored clothing and accessories.','vi':'Trang ph\u1ee5c may ki\u1ec3u tailored v\u00e0 ph\u1ee5 ki\u1ec7n.'};o['reason']+=' Narrowed tailoring to tailored product style; no alteration service inferred.'
  if suffix=='matinkimvietnam':
   f['sourceUrl']='https://en.matinkim.com/category/new-in/45/'
   if d['field']=='catalog':f['url']=f['sourceUrl']
   f['evidence']='Official new-in product listing contains actual named down jumpers, knitwear and other clothes; international English/USD catalogue, not local stock.'
  if suffix=='sandro':
   f['sourceUrl']='https://us.sandro-paris.com/'
   if d['field']=='catalog':f['url']=f['sourceUrl']
   f['evidence']='Official US catalogue homepage contains actual named Light Wave sneakers and links current clothing collections; no Vietnamese inventory or fulfilment claim.'
  if suffix in ['pedro','adidas','giordano']and d['field']=='catalog':f['checkedAt']='2026-10-19';o['reason']+=' Exact action role uses audited19Oct official receipt; preserve actual source-check19 and independent review20.'
  if d['field']=='services'and f['applicability']=='brand-wide':
   c=cat.get(d['destinationId']);limit=c['uncertainty']if c else None
   if limit and ('International' in limit['en']or'any market' in limit['en']or'Singapore' in limit['en']):f['uncertainty']=copy.deepcopy(limit)
   elif suffix in ['sandro','matinkimvietnam']:f['uncertainty']={'en':'International/US-market product information; confirm products, prices and services at Saigon Centre.','vi':'Th\u00f4ng tin s\u1ea3n ph\u1ea9m qu\u1ed1c t\u1ebf/Hoa K\u1ef3; vui l\u00f2ng x\u00e1c nh\u1eadn s\u1ea3n ph\u1ea9m, gi\u00e1 v\u00e0 d\u1ecbch v\u1ee5 t\u1ea1i Saigon Centre.'}
  if suffix=='skechers':f['evidence']=f['evidence'].replace(' Mall also labels Opening Soon; operation and connectivity are not verified.',' Fresh independent branch page corroborates the listed contact; no call placed.')
  if suffix=='pnj'and d['field']=='services':
   f['applicability']='brand-wide';f.pop('branchMallId',None);f['sourceUrl']=cat[d['destinationId']]['sourceUrl'];f['uncertainty']=copy.deepcopy(cat[d['destinationId']]['uncertainty']);o['reason']+=' Mall profile has no specific goods description; actual brand gold/gemstone product catalogue supplies this narrower brand-wide offering, no branch inventory claim.'
  o.update(auditDecision='accept',acceptedField=f,originalProposal=d['proposedField'],brandContactScopeExplicit=f['applicability']=='brand-wide')
 else:
  o.update(auditDecision='hold',remainingAction=d.get('remainingAction')or'Obtain actual readable official evidence for this exact field and identity before acceptance.')
  if reject:
   if suffix=='miana':o['reason']='Actual official catalogue route displays115products/category links but no inspectable named product or product-content body; thumbnail retrieved is a navigation icon. Reader alone does not verify actual catalogue content.';o['remainingAction']='Render the official Miana catalogue/product images or inspect an actual first-party item/collection body; original site identity is established.'
   else:o['reason']='Only indexed official contact text supplies0382946249; fresh independent direct source returnsHTTP405. General brand-wide fallback scope is valid but actual readable contact binding remains unverified.';o['remainingAction']='Read actual official Onitsuka/ASICS contact body in enabled browser or another officially endorsed general-contact source; do not treat indexed-only practical value as independently verified.'
   o['rejectedProposal']=d['proposedField']
 out.append(o)
obj={'revision':'independent-saigon-retail-v2-audit','method':'Reviewed all226 field decisions,206 candidate value/source bindings and20 exact holds; exact field-support windows/full receipt evidence plus focused source-body checks, independent fresh reads on identity/practical/operational-risk targets. Specific products qualify Products/services. Two indexed/image-only proposals held; BOSS wording and international market caveats narrowed; exact r2 source dates retained where reused.','inputs':[{'file':os.path.relpath(p,P).replace('\\','/'),'sha256':sha(p)}for p in sorted(inputs)],'decisions':out}
(R/'reviewed-chunks/saigon-retail-v2.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(len(out),sum(x['auditDecision']=='accept'for x in out))
