import pathlib,json,copy,hashlib,collections,re
p=pathlib.Path(__file__).resolve().parent
root=p.parent.parent/'continuation-2026-10-19-r2'
q=json.loads((p/'queue.json').read_text(encoding='utf-8'))['records']
by={r['destinationId']:r for r in q}
records={};decisions={}
def ident(s):
 if s in by:return s
 return next(r['destinationId'] for r in q if r['name']['en'].casefold()==s.casefold())
def add(s,field,url,file,evidence,scope='brand-wide',vi=None,en=None):
 id=ident(s)
 assert field in by[id]['fields'],(s,field)
 f={'field':field,'state':'verified-agent','sourceUrl':url,'evidence':evidence,'checkedAt':'2026-10-20','applicability':scope,'verification':'source-checked','approval':'candidate-proposal','uncertainty':{'vi':'Thông tin chung của thương hiệu; xác nhận sản phẩm, giá và tình trạng phục vụ với chi nhánh.','en':'Brand-wide information; confirm products, prices and availability with the branch.'}}
 if scope=='branch':
  f['branchMallId']='vincom-dong-khoi';f['uncertainty']={'vi':'Thông tin theo trang chi nhánh chính thức đã kiểm tra; xác nhận trước khi ghé.','en':'Information from the checked official branch page; confirm before visiting.'}
 if field in ['website','catalog','menu','programme']:f['url']=url
 if vi is not None:f['value']={'vi':vi,'en':en or vi}
 records.setdefault(id,{'mallId':'vincom-dong-khoi','destinationId':id,'fields':[]})['fields'].append(f)
 decisions[(id,field)]={'destinationId':id,'field':field,'decision':'candidate-proposal','sourceUrl':url,'sourceFile':file,'reason':evidence,'scope':scope,'checkedAt':'2026-10-20','value':f.get('value'),'url':f.get('url'),'nextAction':'Independent content audit before central integration.'}
def contact(s,url,file,phone=None,hours=None,hoursEn=None):
 if phone:add(s,'phone',url,file,'Official branch locator row explicitly prints this contact; no corporate phone substituted.','branch',phone)
 if hours:add(s,'hours',url,file,'Official branch locator explicitly prints these hours; holiday variations may apply.','branch',hours,hoursEn)
def sitecat(s,url,file,branch=False,catalog=True):
 if 'website' in by[ident(s)]['fields']:add(s,'website',url,file,'Official brand/source identifies this brand; branch scope only when the page explicitly identifies Đồng Khởi.','branch' if branch else 'brand-wide')
 if catalog and 'catalog' in by[ident(s)]['fields']:add(s,'catalog',url,file,'Official product/category presentation provides a brand-wide catalogue; no branch inventory, price or fulfilment promise.','brand-wide')
def hold(s,fields,reason,files,urls=None,nextAction=None):
 for field in fields:
  id=ident(s);assert field in by[id]['fields']
  decisions[(id,field)]={'destinationId':id,'field':field,'decision':'hold','checkedAt':'2026-10-20','reason':reason,'sourceFiles':files,'sources':urls or [],'nextAction':nextAction or 'Obtain a readable, current official source resolving this exact field and branch identity.'}
def negative(s,fields,reason,files,urls):
 hold(s,fields,reason,files,urls,'Recheck the named official sources if new branch evidence becomes available.')
 for field in fields:decisions[(ident(s),field)].update(decision='unavailable-after-research',boundedScope='Only the named official mall, brand/locator and field-targeted search checks; not a claim of global absence.')

exec((p/'proposals.py').read_text(encoding='utf-8'))
exec((p/'resolutions.py').read_text(encoding='utf-8'))
exec((p/'product-offerings.py').read_text(encoding='utf-8'))
out={'revision':'vincom-retail-b-2026-10-20-r3','status':'candidate-proposal-for-independent-audit','records':list(records.values())}
(p/'records.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(p/'decisions.json').write_text(json.dumps({'checkedAt':'2026-10-20','decisions':list(decisions.values())},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
counts=collections.Counter(d['decision'] for d in decisions.values())
progress={'destinations':len(q),'queuedFields':sum(len(r['fields']) for r in q),'completedDecisions':len(decisions),'counts':dict(counts),'unresearched':[{'destinationId':r['destinationId'],'fields':[f for f in r['fields'] if (r['destinationId'],f) not in decisions]} for r in q if any((r['destinationId'],f) not in decisions for f in r['fields'])],'baselinePreserved':True,'writesLimitedToLane':True}
(p/'progress.json').write_text(json.dumps(progress,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in progress.items() if k!='unresearched'}))
