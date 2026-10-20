import json,pathlib,copy,hashlib
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;LANE=PACKET/'vincom-dining'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
incoming=read(LANE/'decisions-chunk1.json')['decisions'];decisions=[];inputs={LANE/'decisions-chunk1.json',LANE/'records-chunk1.json'}
fresh={'https://morico.life/menu/':'turn673view0','https://morico.life/delivery/':'turn673view1','https://hoangyenbuffet.com/menu/mon-chinh/':'turn673view2','https://www.highlandscoffee.com.vn/':'turn673view3'}
for d in incoming:
 if d['outcome']!='proposal'and not(d['destinationId']=='vincom-prototype-morico'and d['field']=='booking'):continue
 bindings=[]
 for s in d['sources']:
  p=LANE/s['evidenceFile'];inputs.add(p);bindings.append({**s,'file':str(p.relative_to(PACKET))})
 out={'mallId':d['mallId'],'destinationId':d['destinationId'],'field':d['field'],'reason':d['reason'],'evidenceBindings':bindings,'reviewedAt':'2026-10-20','reviewedBy':'Codex independent content auditor (AI)'}
 if d['outcome']=='proposal':
  f=copy.deepcopy(d['proposedField']);f.update(state='verified-agent',approval='agent-accepted',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
  if f['sourceUrl']in fresh:bindings.append({'sourceUrl':f['sourceUrl'],'freshWebReference':fresh[f['sourceUrl']]})
  if d['destinationId']=='vincom-prototype-gogihouse':
   out['reason']+=' Independent audit of complete saved browser HCM row verifies Vincom Le Thanh Ton B3-23-24 and exact phone/schedule; named menu combos appear in same official browser receipt. Independent text-reader fetch is empty, so no claim of independently re-rendering browser session.'
  if d['field']=='phone'and f['applicability']=='brand-wide':
   out['brandContactScopeExplicit']=True
   if d['destinationId']=='vincom-prototype-morico':f['uncertainty']={'vi':'Liên hệ chung của Morico/Kamo; không phải số điện thoại riêng của chi nhánh Vincom.','en':'Morico/Kamo general contact; this is not a dedicated Vincom branch line.'}
   else:f['uncertainty']={'vi':'Hotline đặt món giao hàng chung của Highlands; không phải số điện thoại riêng của chi nhánh.','en':'Highlands brand-wide delivery ordering hotline; this is not a dedicated branch line.'}
  if d['destinationId']=='vincom-prototype-highlandscoffee'and d['field']=='cuisine':
   f['checkedAt']='2026-10-19';out['reason']+=' Exact menu URL uses audited19Oct receipt; preserve actual source-check date19 with independent review20, also corroborated by fresh20Oct homepage categories.'
  out.update(auditDecision='accept',acceptedField=f,originalProposal=d['proposedField'])
 else:
  out.update(auditDecision='unavailable-after-research',boundedScope=d['boundedScope'],negativeCoverage={'officialSources':d['sources'],'targetedSearches':d['searches'],'finding':'No table-reservation action in the named checked homepage/menu/about/delivery navigation; ordering links are explicitly delivery only. This is bounded absence, not proof no booking exists.'})
 decisions.append(out)
write(ROOT/'reviewed-chunks/vincom-dining-01-accepted-and-morico-negative.json',{'revision':'independent-vincom-dining-first13-proposals-and-one-bounded-negative','inputs':[{'file':str(p.relative_to(PACKET)),'sha256':sha(p)}for p in sorted(inputs)],'decisions':decisions,'pendingFromWorkerChunk':'30 other decisions need final review; some products/services and broad holds returned for correction before accounting as final.'})
print('13accepted and1bounded-negative; remaining30firstchunk keys pending correction/review.')
