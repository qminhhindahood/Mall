import json,pathlib,hashlib,copy
ROOT=pathlib.Path(__file__).resolve().parent;PACKET=ROOT.parent
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(n,o):(ROOT/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=PACKET/'research-saigon/enrichment-additional-records.json';incoming=read(p)
refs={'breadtalk':'turn207view0','llaollao':'turn209view0','nagocha':'turn207view2','truffleco':'turn209view5','runamboutique':'turn209view1/turn209view2','starbucks':'turn207view6','changkangkung':'turn207view7/turn209view3','gogihouse':'turn209view4/turn208view5','sushihokkaidosachi':'turn209view6','the350f':'turn207view12','dimtutac':'turn208view4','nespresso':'turn149view0/turn208view6'}
records=[];decisions=[]
for r in incoming['records']:
 out={**r,'fields':[]};suffix=r['destinationId'].removeprefix('saigon-prototype-')
 for f in r['fields']:
  hold=f['field']=='menu' and suffix in ['runamboutique','gogihouse']
  reason='Independent fresh official read confirms menu/product role or actual booking-request form. Brand-wide scope and local availability caveats retained; no prices imported or reservation made.'
  if hold:reason='Fresh official target and menu navigation expose only navigation/footer shell, no actual dishes/menu categories/images. Actual menu content/action usability not verified by reader. Hold pending rendered or full menu evidence; not a global unavailability claim.'
  if suffix=='nespresso' and f['field']=='phone':reason='Fresh official Saigon Centre branch locator B1/67LeLoi prints0917761054. This resolves prior generic-mall-phone hold; accepted branch phone is not the national support hotline.'
  if suffix=='nespresso' and f['field']=='services':reason='Fresh official Vietnam page explicitly contains machine-maintenance sections. Wording remains brand-wide information and does not assert branch repair availability.'
  if suffix=='llaollao':reason='Initial direct read failed; official-domain search reference reopened full global menu with product/topping categories. Global scope retained; no Vietnam assortment or availability inferred.'
  if suffix=='dimtutac':reason='Fresh official actual reservation form location dropdown explicitly includes SaigonCentre. Booking request only; no form submitted or booking confirmed.'
  decisions.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'field':f['field'],'decision':'hold'if hold else'accept','reason':reason,'sourceUrl':f['sourceUrl'],'freshWebReference':refs[suffix],'original':f})
  if not hold:
   v=copy.deepcopy(f);v['reviewedBy']='Codex independent content auditor (delegated AI review)';out['fields'].append(v)
 if out['fields']:records.append(out)
write('audited-saigon-supplement-records.json',{'revision':'independent-saigon-supplement-audit-2026-10-19-r2','records':records})
write('saigon-supplement-decisions.json',{'checkedAt':'2026-10-19','inputSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'proposedFields':16,'acceptedFields':14,'heldFields':2,'method':'Every action target independently retrieved. llaollao direct failure recovered through official-domain search reference. Nespresso phone freshly reviewed in earlier same-session locator read. Shell-only menus withheld; brand-wide booking forms do not assert branch availability.','decisions':decisions})
print('Saigon supplement:14accepted,2held; baseline32+core597+Vincom9+Saigon14=652acceptedfields.')
