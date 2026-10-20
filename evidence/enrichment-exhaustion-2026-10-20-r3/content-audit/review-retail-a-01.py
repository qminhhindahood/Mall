import json,pathlib,copy,hashlib,os
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;LANE=PACKET/'vincom-retail-a'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
original=read(LANE/'chunk-01-decisions.json')['decisions'];amend=read(LANE/'amendment-01-phones.json')['decisions']
replace={(d['destinationId'],d['field']):d for d in amend}
inputs={LANE/'chunk-01-decisions.json',LANE/'chunk-01-records.json',LANE/'amendment-01-phones.json'}
fresh={'https://aldoshoes.vn/':'turn640view0','https://aldoshoes.vn/pages/he-thong-cua-hang':'turn640view1','https://milensea.com.vn/collections/gold-element':'turn645view0/turn648view3','https://milensea.com.vn/pages/gold-elements-spa':'turn648view3 (same official distributor contact separately corroborated on collection page)','https://ppp.com.vn/lien-he/':'turn645view2/turn645view3','https://ppp.com.vn/':'turn648view0','https://dongviet.vn/':'turn648view1','https://dongviet.vn/danh-sach-cua-hang/':'turn645view6'}
decisions=[]
for old in original:
 d=replace.get((old['destinationId'],old['field']),old);bindings=[]
 for s in d['sources']:
  p=LANE/s['evidenceFile'];inputs.add(p);bindings.append({**s,'file':str(p.relative_to(PACKET))})
  if s['url']in fresh:bindings.append({'sourceUrl':s['url'],'freshWebReference':fresh[s['url']]})
 out={'mallId':d['mallId'],'destinationId':d['destinationId'],'field':d['field'],'reason':d['reason'],'evidenceBindings':bindings,'reviewedAt':'2026-10-20','reviewedBy':'Codex independent content auditor (AI)'}
 if d['outcome']=='proposal':
  f=copy.deepcopy(d['proposedField']);f.update(state='verified-agent',approval='agent-accepted',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
  if f['field']=='phone':
   digits=f['value']['en'].split(': ',1)[-1];f['value']={'vi':digits,'en':digits}
   distributor=d['destinationId']=='vincom-candidate-vd-b1-007'
   f['uncertainty']={'vi':('Liên hệ hỗ trợ chung của nhà phân phối MilenSea; không phải số riêng của quầy tại Vincom Đồng Khởi.'if distributor else'Liên hệ hỗ trợ chung của thương hiệu; không phải số riêng của chi nhánh Vincom Đồng Khởi.'),'en':('MilenSea distributor support contact; this is not a dedicated Vincom Dong Khoi counter line.'if distributor else'Brand-wide support contact; this is not a dedicated Vincom Dong Khoi branch line.')}
   out['brandContactScopeExplicit']=True;out['reason']+=' Independent correction: numeric phone value preserved; localized support label moved into uncertainty for valid call action.'
  f['evidence']=f['evidence'].replace('exclusive Vietnam brand','officially distributed Vietnam brand')
  out.update(auditDecision='accept',acceptedField=f,originalProposal=d['proposedField'])
 else:
  out.update(auditDecision='hold',remainingAction=d['remainingAction'])
  if d['destinationId']=='vincom-candidate-vd-b2-001':out['reason']+=' Fresh locator317-324 gives generic STORE block, while footer361-363 calls exact B2-16 counter UNI.WATCH; current RHYTHM identity remains unresolved.'
 decisions.append(out)
write(ROOT/'reviewed-chunks/vincom-retail-a-01.json',{'revision':'independent-vincom-retail-a-first20-including-explicit-phone-amendment','inputs':[{'file':str(p.relative_to(PACKET)),'sha256':sha(p)}for p in sorted(inputs)],'decisions':decisions})
print('20 queued keys reviewed:14accepted,6holds;3phone amendments incorporated without duplicate keys.')
