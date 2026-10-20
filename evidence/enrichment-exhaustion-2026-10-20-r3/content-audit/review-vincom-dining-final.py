"""Serialize the completed independent field review; research is not auto-imported."""
import json,pathlib,hashlib,copy,collections
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent;LANE=PACKET/'vincom-dining'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d):return(d['mallId'],d['destinationId'],d['field'])
incoming=read(LANE/'decisions.json')['decisions']
assert sha(LANE/'decisions.json')=='4a541acd892d57942937d10ac39ccae3171c56ad88e17e75995edec9ff25e212'
assert sha(LANE/'records.json')=='5d106af33f5c644c8d2d616be35aebfd1ccbf4225bfdaa24b1f48353a09f5728'
old={key(d):d for d in read(ROOT/'audit-decisions.json')['records']}
prior14={key(d)for d in read(ROOT/'reviewed-chunks/vincom-dining-01-accepted-and-morico-negative.json')['decisions']}
inputs={LANE/'decisions.json',LANE/'records.json',LANE/'decisions-amendments5.json',LANE/'records-amendments5.json'}
def bindings(d):
 out=[]
 for kind in ['sources','searches']:
  for s in d.get(kind,[]):
   f=s.get('evidenceFile')
   if f:
    p=(LANE/f).resolve();assert p.exists(),p;inputs.add(p)
    out.append({**s,'file':str(p.relative_to(PACKET.resolve())),'role':'source receipt; independently assess actual body and identity' if kind=='sources' else 'targeted discovery/negative coverage; third-party leads not factual authority'})
 return out
def accepted(d):
 f=copy.deepcopy(d['proposedField']);f.update(state='verified-agent',approval='agent-accepted',reviewedBy='Codex independent content auditor (delegated AI review)',reviewedAt='2026-10-20')
 if d['field']=='booking'and f.get('url')=='https://datban.ggg.com.vn/':
  f['uncertainty']={'vi':'Cổng đặt bàn chung của Golden Gate; chọn thương hiệu, nhà hàng và xác nhận chi nhánh, thời gian còn chỗ. Chưa gửi yêu cầu đặt bàn.','en':'Golden Gate reservation chooser; select the brand and restaurant and confirm branch/time availability. No reservation submitted.'}
 if d['destinationId']=='vincom-prototype-isushi'and d['field']in['menu','services']:
  f['uncertainty']={'vi':'Menu Hasu được xem ở lựa chọn khu vực Hà Nội; chỉ tham khảo thương hiệu, cần xác nhận món, giá và khả năng phục vụ ở Đồng Khởi.','en':'Hasu menu inspected under the Hanoi regional selection; brand reference only. Confirm Dong Khoi dishes, prices and availability.'}
 return f
decisions=[]
for d in incoming:
 k=key(d)
 if k in prior14:continue
 b=bindings(d)
 out={x:d[x]for x in ['mallId','destinationId','field']};out.update(reason=d['reason'],evidenceBindings=b,reviewedAt='2026-10-20',reviewedBy='Codex independent content auditor (AI)')
 if d['outcome']=='proposal':
  f=accepted(d);out.update(auditDecision='accept',acceptedField=f,originalProposal=d['proposedField'])
  if d['field']=='phone'and f['applicability']=='brand-wide':out['brandContactScopeExplicit']=True
  out['reason']+=' Independent review confirms the role and stated scope against retained full source evidence; current branch inventory, prices and successful calling/reservation are not inferred.'
 elif d['outcome']=='unavailable-after-research':
  out.update(auditDecision='unavailable-after-research',boundedScope=d['boundedScope'],negativeCoverage={'officialSources':d['sources'],'targetedSearches':d.get('searches',[]),'finding':d['reason'],'limit':'Named checked public sources only, not global or permanent absence.'})
 else:
  out.update(auditDecision='hold',remainingAction=d['remainingAction'])
  # Remove stale whole-site failures after later successful recoveries. Field-specific gaps remain.
  if d['destinationId']=='vincom-candidate-vd-b3-005':out['reason']='Canonical MK Thailand homepage, actual menu and corporate contact are readable and separately accepted. No authenticated Vietnam Dong Khoi '+d['field']+' is established. The Vietnam mall discovery path redirects generically; Thai practical values are not branch evidence.'
  if d['destinationId']=='vincom-prototype-kingbbq':out['reason']='King BBQ exact Dong Khoi locator and actual branch menu are readable. The linked Goldsun booking route remains a shell and the alternative form has an inconsistent brand heading; no authenticated usable reservation action was established.'
  if d['destinationId']=='vincom-prototype-changkangkung':out['reason']='Official Vincom brand article and actual menu image are readable, with a separately scoped brand delivery hotline. The direct brand branch paths time out/return403; no exact Dong Khoi '+d['field']+' is established. Delivery ordering is not table reservation.'
  if d['destinationId']=='vincom-prototype-haidilao':out['reason']='Official Vincom article now establishes Dong Khoi telephone booking and actual brand menu; it does not publish a verified exact branch schedule. Empty corporate-body/uncertain international-domain attempts add no usable Dong Khoi hours.'
  if d['destinationId']=='vincom-prototype-chillithai':out['reason']='Correct official Vincom Chilli Thai article supplies exact Dong Khoi phone and telephone-booking instructions plus reference menu, but no verified branch schedule. Different ChillThai operator domain remains excluded.'
  if d['destinationId']=='vincom-prototype-yakinikulike':out['reason']='Exact Vietnam operator branch row and Japanese-market brand menu are readable and separately supported. The branch row has no usable reservation action; unrelated-market booking cannot establish Dong Khoi booking.'
 decisions.append(out)
assert len(decisions)==278
write(ROOT/'reviewed-chunks/vincom-dining-final278.json',{'revision':'independent-vincom-dining-final5-remaining278','method':'Central field-by-field review of final values, scope, retained full text/browser receipts and visual menu assets; earlier independent fresh primary reads for practical rows/forms and international roles, fresh Basta/Chilli corroboration and explicit Haidilao/Hachiban fetch failures. Does not claim every URL was independently re-fetched or re-rendered. Targeted queries and all54 mall brand-profile outcomes retained. Source presence/hash checks are reconciliation aids, not factual acceptance criteria.','inputs':[{'file':str(p.relative_to(PACKET.resolve())) if p.is_absolute() else str(p.relative_to(PACKET)),'sha256':sha(p)}for p in sorted(inputs)],'decisions':decisions})
am=read(ROOT/'review-amendments.json')
g=next(d for d in incoming if d['destinationId']=='vincom-prototype-gogihouse'and d['field']=='booking');k=key(g)
if not any(key(x)==k and x['auditDecision']=='accept'and x.get('acceptedField',{}).get('url')=='https://datban.ggg.com.vn/'for x in am['records']):
 out={x:g[x]for x in ['mallId','destinationId','field']};out.update(auditDecision='accept',priorAuditedDecision=old[k],acceptedField=accepted(g),reason='Explicit action correction: exact branch locator buttons opened Google Maps; use independently inspected actual Golden Gate operator reservation chooser endorsed by official brand navigation. Preserve the previous accepted object in this amendment.',evidenceBindings=bindings(g),reviewedAt='2026-10-20',reviewedBy='Codex independent content auditor (AI)');am['records'].append(out)
write(ROOT/'review-amendments.json',am)
print(collections.Counter(d['auditDecision']for d in decisions))
