import pathlib,json,hashlib,copy,collections
p=pathlib.Path(__file__).resolve().parent
def read(n):return json.loads((p/n).read_text(encoding='utf-8'))
def save(n,x):(p/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(n):return hashlib.sha256((p/n).read_bytes()).hexdigest()
queue=read('queue.json')['records'];by={r['name']['en']:r for r in queue};base=read('decisions.json')['decisions']
names={'Catia':('catia','01'),'Studio 77':('studio77','01'),'Copenhaghen':('copenhaghen','01'),'The New Playground':('the-new-playground','02'),'Tuyết Kiều':('tuyet-kieu','02'),'Minigood':('minigood','02'),'Pierre Cardin':('pierre-cardin','02'),'Sealy':('sealy','03'),'Mothercare':('mothercare','03'),'Valentino Creations':('valentino-creations','03'),'Winmart':('winmart','03'),'Prima Art':('prima-art','04'),'Nike Rise':('nike-rise','04'),'Pull & Bear':('pull-bear','04')}
records=[];decisions=[]
template=copy.deepcopy(read('records.json')['records'][0]['fields'][0])
def proposal(name,field,url,value=None,scope='brand-wide',file='brand-profile-open-02.json',evidence=''):
 r=by[name];f=copy.deepcopy(template)
 for k in ['url','value','branchMallId']:f.pop(k,None)
 f.update(field=field,sourceUrl=url,applicability=scope,evidence=evidence,checkedAt='2026-10-20',approval='candidate-proposal')
 f['uncertainty']={'vi':'Thông tin chung do Vincom giới thiệu về thương hiệu; xác nhận sản phẩm và tình trạng phục vụ với chi nhánh.','en':'General brand information described by Vincom; confirm products and availability with the branch.'}
 if scope=='branch':f['branchMallId']='vincom-dong-khoi'
 if field=='website':f['url']=url
 if value:f['value']=value
 rec=next((z for z in records if z['destinationId']==r['destinationId']),None)
 if rec is None:rec={'mallId':'vincom-dong-khoi','destinationId':r['destinationId'],'fields':[]};records.append(rec)
 rec['fields'].append(f)
 prior=next((z for z in base if z['destinationId']==r['destinationId'] and z['field']==field),None)
 if prior is None:
  records.remove(rec)
  return
 decisions.append({'mallId':'vincom-dong-khoi','destinationId':r['destinationId'],'field':field,'decision':'candidate-proposal','checkedAt':'2026-10-20','proposedField':f,'sourceFile':file,'sourceUrl':url,'scope':scope,'reason':evidence,'nextAction':'Independent review of this explicit supplemental replacement before central integration.','replacesFrozenOutcome':prior['decision'],'frozenDecisionsSha256':sha('decisions.json')})
proposal('Pierre Cardin','website','https://vincom.com.vn/brand/pierre-cardin',evidence='Actual Vincom brand profile lines11–15 identifies Pierre Cardin and An Phuoc operator/exclusive menswear distribution. Brand-wide informational action; current listed branches exclude Dong Khoi, so no branch availability claim.')
proposal('Pierre Cardin','services','https://vincom.com.vn/brand/pierre-cardin',{'vi':'Thời trang nam Pierre Cardin theo giới thiệu thương hiệu của Vincom; xác nhận dòng sản phẩm tại chi nhánh.','en':'Pierre Cardin menswear as described in Vincom’s brand profile; confirm product lines with the branch.'},evidence='Products/services product offering only. Actual profile line14 explicitly describes the Pierre Cardin menswear brand and An Phuoc distribution. No specific garment types, inventory or treatment/alteration service inferred.')
proposal('Minigood','website','https://vincom.com.vn/store/minigood-vincom-center-dong-khoi',scope='branch',file='mall-product-01.json',evidence='Actual mall-owned profile lines9–21 names Minigood, explicitly includes Vincom Center Dong Khoi among locations and describes household, stationery, toy and technology products. Official mall information action; no independent brand domain, phone or schedule invented.')
overrides={(d['destinationId'],d['field']) for d in decisions}
for name,(slug,num) in names.items():
 r=by[name]
 for prior in base:
  if prior['destinationId']!=r['destinationId'] or prior['decision']!='hold' or (prior['destinationId'],prior['field']) in overrides:continue
  d=copy.deepcopy(prior);d['supplementalOfficialAttempt']={'url':'https://vincom.com.vn/brand/'+slug,'receipt':'brand-profile-open-'+num+'.json','checkedAt':'2026-10-20','outcome':'Readable brand-wide profile but no branch-specific contact/schedule or product browsing catalogue' if name=='Pierre Cardin' else 'Explicit access/timeout failure; no source body available for promotion'}
  d['supplementalSearchReceipts']=['brand-profile-search-01.json','brand-profile-search-02.json','brand-profile-search-03.json']
  if name in ['Valentino Creations','Nike Rise']:d['supplementalOfficialAttempt']['followupReceipt']='brand-profile-open-05.json';d['supplementalOfficialAttempt']['indexedLeadOnly']='Exact official profile search returned identity/product text; direct request failed, so indexed content is retained as a lead and not a field value.'
  d['nextAction']='Resolve the existing exact blocker with a readable current first-party/official-mall body, actual product action or unambiguous branch row; newly checked /brand family is also documented.'
  d['frozenDecisionsSha256']=sha('decisions.json');decisions.append(d)
save('brand-profile-supplement-records.json',{'revision':'brand-profile-followup-2026-10-20-r3','records':records})
save('brand-profile-supplement-decisions.json',{'revision':'Explicit supplement layered over frozen300-key snapshot; replaces only matching keys and preserves remaining frozen outcomes.','decisions':decisions})
count=collections.Counter(z['decision'] for z in base)
for x in decisions:
 prior=next(z for z in base if z['destinationId']==x['destinationId'] and z['field']==x['field'])
 count[prior['decision']]-=1;count[x['decision']]+=1
save('brand-profile-supplement-manifest.json',{'frozenRecordsSha256':sha('records.json'),'frozenDecisionsSha256':sha('decisions.json'),'supplementRecordsSha256':sha('brand-profile-supplement-records.json'),'supplementDecisionsSha256':sha('brand-profile-supplement-decisions.json'),'newlyProposedFields':sum(len(r['fields']) for r in records),'supplementedOutcomes':len(decisions),'layered300KeyCounts':dict(count),'note':'Frozen records, decisions, chunks and manifest bytes were not changed. Main-owned description/Prima Art contact keys remain outside this lane. Minigood website was already baseline accepted and is not re-proposed.'})
print(json.dumps(read('brand-profile-supplement-manifest.json')))
