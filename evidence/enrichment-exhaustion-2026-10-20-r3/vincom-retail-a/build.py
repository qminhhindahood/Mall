import json,pathlib,hashlib
P=pathlib.Path(__file__).parent
Q=json.loads((P/'queue.json').read_text(encoding='utf-8'))['records']
def save(name,obj): (P/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
N=json.loads((P/'notes.json').read_text(encoding='utf-8'))
out=[];ds=[]
for n in N:
 r=next(x for x in Q if x['destinationId']==n['id'])
 fields=[]
 for key in r['fields']:
  if key not in n['fields']:continue
  x=n['fields'][key];url=x.get('url',n.get('url'));ev=x.get('evidence',n.get('evidence'));scope=x.get('scope','brand-wide')
  d={'mallId':r['mallId'],'destinationId':r['destinationId'],'name':r['name'],'field':key,'outcome':x.get('outcome','proposal'),'checkedAt':'2026-10-20','sources':[{'url':url,'evidenceFile':ev,'reference':x.get('reference',n.get('reference')),'section':x.get('section',key+' content'),'result':x.get('result','retrieved'),'support':x['reason']}],'searches':n.get('searches',[]),'reason':x['reason'],'remainingAction':x.get('remainingAction'),'applicability':scope,'attempts':x.get('attempts',n.get('attempts',[]))}
  if d['outcome']=='proposal':
   f={'field':key,'state':'verified-proposal','sourceUrl':url,'evidence':x['reason']+' Evidence: '+ev,'checkedAt':'2026-10-20','applicability':scope,'verification':'source-checked','approval':'pending-delegated-review','uncertainty':{'vi':'Thông tin chung của thương hiệu; vui lòng xác nhận sản phẩm, giá và tình trạng phục vụ tại chi nhánh.','en':'Brand-wide information; confirm products, prices and availability with the branch.'},'reviewedBy':'Codex Vincom A research agent (AI)','reviewedAt':'2026-10-20'}
   if scope=='branch':f['branchMallId']=r['mallId'];f['uncertainty']={'vi':'Theo nguồn chính thức đã kiểm tra; vui lòng xác nhận thông tin hiện tại trước khi ghé.','en':'From the checked official source; confirm current details before visiting.'}
   if key in ('website','catalog','programme'):f['url']=x.get('actionUrl',url)
   else:f['value']={'vi':x['vi'],'en':x['en']}
   if ev.startswith('../../continuation-2026-10-19-r2/') or ev=='../shared-accepted-source-index.json':f['checkedAt']='2026-10-19'
   if x.get('uncertainty'):f['uncertainty']=x['uncertainty']
   if key=='phone' and scope=='brand-wide':
    for lang in ('vi','en'):f['value'][lang]=f['value'][lang].split(': ')[-1]
    f['uncertainty']={'vi':'Liên hệ hỗ trợ chung của thương hiệu hoặc nhà phân phối; không phải số riêng của chi nhánh Vincom Đồng Khởi.','en':'General brand or distributor support contact; not a dedicated Vincom Dong Khoi branch line.'}
   fields.append(f);d['proposedField']=f
  ds.append(d)
 if fields:out.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'fields':fields})
save('records.json',{'revision':'vincom-retail-a-r3-proposals-2026-10-20','records':out})
save('decisions.json',{'revision':'vincom-retail-a-r3-research-2026-10-20','decisions':ds})
save('progress.json',{'assignedDestinations':len(Q),'assignedFields':sum(len(x['fields']) for x in Q),'reviewedFields':len(ds),'proposalFields':sum(x['outcome']=='proposal' for x in ds),'heldFields':sum(x['outcome']=='hold' for x in ds),'remainingFields':sum(len(x['fields']) for x in Q)-len(ds),'completedDestinations':len(N),'baselinePreserved':True})
print(json.dumps(json.loads((P/'progress.json').read_text(encoding='utf-8'))))

