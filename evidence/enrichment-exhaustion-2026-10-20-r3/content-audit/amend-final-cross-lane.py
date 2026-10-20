import json,pathlib,copy,hashlib
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(d):return(d['mallId'],d['destinationId'],d['field'])
current={key(d):d for d in read(ROOT/'audit-decisions.json')['records']};am=read(ROOT/'review-amendments.json');added=[]
def add(prior,reason,bindings,accepted=None,next=None):
 out={x:prior[x]for x in ['mallId','destinationId','field']};out.update(auditDecision='accept'if accepted else'hold',priorAuditedDecision=copy.deepcopy(prior),reason=reason,evidenceBindings=bindings,reviewedAt='2026-10-20',reviewedBy='Codex independent content auditor (AI)',amendmentGroup='final-cross-lane-rendered-source-closure')
 if accepted:out['acceptedField']=accepted
 else:out['remainingAction']=next
 added.append(out);current[key(out)]=out
results=read(PACKET/'menu-recovery-takahiro/results.json')['results']
ids={'asanoha':'saigon-prototype-asanoha','gyushige':'saigon-prototype-gyushige','jindinrou':'saigon-prototype-jindinrou','oedoalley':'saigon-prototype-oedoalley','ichibankenramen':'saigon-prototype-ramenichibanken','somtumthai':'saigon-prototype-somtumthai'}
# Exact existing identities, never inferred from product/name semantics.
for x in results:
 if x['brand']=='bastahiro':continue
 candidates=[d for d in current.values()if d['mallId']=='saigon-centre'and d['field']=='menu'and (x['brand']in d['destinationId'] or (x['brand']=='ichibankenramen'and 'ramenichibanken'in d['destinationId']) or (x['brand']=='somtumthai'and 'somtamthai'in d['destinationId']))]
 assert len(candidates)==1,(x['brand'],[d['destinationId']for d in candidates]);prior=candidates[0]
 bs=[{'file':'menu-recovery-takahiro/results.json','sha256':sha(PACKET/'menu-recovery-takahiro/results.json'),'section':x['brand'],'sourceUrls':x['urls'],'method':'Independent review of complete saved actual English/Vietnamese browser body, routes and referenced-script inspection; not an independently re-rendered session.'}]
 for f in x['evidenceFiles']:
  p=PACKET/'menu-recovery-takahiro'/f
  if p.exists():bs.append({'file':'menu-recovery-takahiro/'+f,'sha256':sha(p),'section':'Actual rendered page / public referenced script evidence'})
 add(prior,'Actual browser recovery completed for English and Vietnamese official roots, full scrolling, anchors/media and referenced public route/script inspection. No actual menu/PDF route or recoverable named menu gallery appears in this checked official family. This supersedes the earlier unresolved rendering explanation. '+('Oedo homepage also mixes Botejyu identity, so a Botejyu asset is not an Oedo menu. 'if x['brand']=='oedoalley'else'')+'This is a specific evidence hold, not a global absence claim.',bs,next=x['remainingAction'])
prior=next(d for d in current.values()if d['mallId']=='saigon-centre'and 'basta'in d['destinationId']and d['field']=='menu')
source=current[('vincom-dong-khoi','vincom-prototype-bastahiro','menu')];f=copy.deepcopy(source['acceptedField']);f['uncertainty']={'vi':'Menu tham khảo chung của Basta Hiro do Vincom đăng, ảnh ghi nguồn Internet; chưa xác nhận ngày áp dụng, món và giá hiện tại tại Saigon Centre.','en':'Brand-wide Basta Hiro menu reference published by Vincom, with Internet image attribution; effective date and current Saigon Centre dishes/prices are unconfirmed.'}
add(prior,'Same exact Basta Hiro brand in both malls: actual official mall reference names pizza/pasta/risotto and labelled menu image independently viewed (four-cheese, mushroom and salmon pizzas). Reuse only brand-wide menu role, never Vincom practical branch values. Official operator rendering produced no menu but does not invalidate this independently available mall-published reference.',source['evidenceBindings']+[{'file':'vincom-dining/basta-menu.jpg','sha256':sha(PACKET/'vincom-dining/basta-menu.jpg'),'section':'Central independent visual inspection on20Oct; named pizza menu, not unlabeled food photograph'},{'sourceUrl':'https://vincom.com.vn/brand/basta-hiro','freshWebReference':'turn897view1','section':'Actual menu sections and published Internet attribution'}],accepted=f)
prior=next(d for d in current.values()if d['mallId']=='saigon-centre'and 'converse'in d['destinationId']and d['field']=='phone')
add(prior,'Actual installed-browser public contact page now returned200 and readable body. Same page publishes owner contact028.3830111 Phím0 and footer028.38301111 Ext0: different digit counts remain internally conflicting. Access is resolved; no probable-typo selection or fabricated dial extension.',[{'file':'holds/converse-contact-final.json','sha256':sha(PACKET/'holds/converse-contact-final.json'),'sourceUrl':'https://www.converse.vn/contact-us','section':'Complete actual200 public browser body, owner and footer blocks'}],next='Require authoritative correction or another first-party source that resolves the conflicting digit strings; do not guess the missing digit.')
assert not any(d.get('amendmentGroup')=='final-cross-lane-rendered-source-closure'for d in am['records'])
am['records'].extend(added);write(ROOT/'review-amendments.json',am)
write(ROOT/'final-cross-lane-closure-receipt.json',{'checkedAt':'2026-10-20','method':'Explicit sequential amendments preserve exact preceding audited decisions; no branch practical values copied between malls.','amendedKeys':[{'mallId':d['mallId'],'destinationId':d['destinationId'],'field':d['field'],'decision':d['auditDecision']}for d in added]})
print('8 explicit amendments:',len(added))
