import json,pathlib,hashlib,collections
P=pathlib.Path(__file__).resolve().parent
load=lambda n:json.loads((P/n).read_text(encoding='utf-8'))
ds={}
for n in ['decisions-chunk1.json','decisions-chunk2.json','decisions-chunk3.json','decisions-amendments.json']:
 for d in load(n)['decisions']:ds[d['destinationId'],d['field']]=d
q=load('queue.json')['records'];ids={i:r['destinationId'] for i,r in enumerate(q)}
# Small exact-source corrections, kept separate from immutable audited chunks.
updates=[]
def modify(i,f,fn):
 d=json.loads(json.dumps(ds[ids[i],f]));fn(d);updates.append(d);ds[ids[i],f]=d
def tian(d):
 f=d['proposedField'];f['evidence']='Official contact-page embedded menu lists tomato hotpot, skirt steak, jade shrimp and cheese tofu. No mala claim retained.';f['value']={'vi':'Lẩu cà chua, diềm thăn, tôm bạch ngọc và đậu hũ phô mai theo thực đơn Tian Long.','en':'Tomato hotpot, skirt steak, jade shrimp and cheese tofu from Tian Long’s menu.'};d['reason']=f['evidence']
modify(37,'services',tian)
def expanded_phone(d):
 d['reason']='Official exact Vietnam branch has blank Tel. The official regional general-contact page was additionally retrieved: it provides inquiry input fields, not a published contact telephone. Exact branch/brand phone queries yield no usable authenticated number. Other branch/franchise numbers excluded. This finding is bounded to these checked sources, including general-contact channels.';d['sources'].append({'url':'https://dining-innovation.com.sg/contact','evidenceFile':'source-kohaku-booking-contact.txt','reference':'turn745view0','section':'General Enquiries','result':'retrieved','support':'Inquiry form fields only; no published brand phone.'})
modify(34,'phone',expanded_phone)
def service(i,url,vi,en,evidence,source):
 key=ids[i],'services';d=json.loads(json.dumps(ds[key]));f={'field':'services','state':'newly-sourced-proposal','sourceUrl':url,'evidence':evidence,'checkedAt':'2026-10-20','applicability':'brand-wide','verification':'source-checked','approval':'provisional','value':{'vi':vi,'en':en}};d.update(outcome='proposal',proposedField=f,reason=evidence,remainingAction=None);d['sources'].append({'url':url,'evidenceFile':source,'section':'Official brand introduction','result':'retrieved','support':evidence});updates.append(d);ds[key]=d
service(10,'https://somtumthai.com.vn/en/','Các món Thái theo phong cách vùng miền, gồm gỏi đu đủ được giới thiệu trên trang thương hiệu.','Regional Thai cooking, including the papaya salads described on the brand page.','Official current Som Tum Thai introduction discusses papaya salads and four regional Thai cooking styles; brand-wide summary only.','source-som-basta-last.txt')
service(13,'https://bastahiro.com.vn/en/','Các món kết hợp ẩm thực Ý với nguyên liệu Nhật Bản, theo phong cách truyền thống và hiện đại của thương hiệu.','Italian dishes combined with Japanese ingredients in the brand’s traditional and modern styles.','Official current Basta Hiro introduction explicitly describes Italian cuisine with Japanese ingredients and dishes prepared in traditional/modern styles; brand-wide concept only.','source-som-basta-last.txt')
(P/'decisions-amendments2.json').write_text(json.dumps({'decisions':updates,'supersedes':'Matching destinationId/field pairs only; exact-source refinement.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
rr=[]
for d in updates:
 if d['outcome']=='proposal':rr.append({'mallId':d['mallId'],'destinationId':d['destinationId'],'fields':[d['proposedField']]})
(P/'records-amendments2.json').write_text(json.dumps({'records':rr},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
expected={(r['destinationId'],f) for r in q for f in r['fields']};assert set(ds)==expected
allrecords=[]
for r in q:
 fields=[]
 for f in r['fields']:
  d=ds[r['destinationId'],f]
  assert d['outcome'] in ['proposal','hold','unavailable-after-research']
  assert d['sources'] or d['searches']
  if d['outcome']=='proposal':
   v=d['proposedField'];assert v.get('url') or all(v.get('value',{}).get(k) for k in ['vi','en'])
   v['uncertainty']={'vi':'Thông tin chung của thương hiệu; xác nhận thực đơn, sản phẩm và thông tin hiện tại tại chi nhánh.' if v['applicability']=='brand-wide' else 'Thông tin từ nguồn chính thức đã kiểm tra; vui lòng xác nhận trước khi ghé.','en':'Brand-wide information; confirm the branch menu, products and current details.' if v['applicability']=='brand-wide' else 'Information from the checked official source; confirm current details before visiting.'}
   fields.append(v)
  elif d['outcome']=='hold':assert d['remainingAction']
  d['fieldRequirement']={'phone':'An explicitly published branch phone or clearly scoped general brand contact; never another branch.','hours':'Exact branch schedule, distinguishing hotline hours and mall opening times.','menu':'Actual menu/product content or actual menu asset, with market/branch scope.','booking':'Actual reservation form/action/policy, not contact form or food delivery.','services':'Specific actual offerings/products; no invented amenities.','website':'Authenticated official brand/branch action URL, not generic mall landing.','cuisine':'Source-supported bilingual cuisine; preserve taxonomy/applicability conflicts.'}[f]
 if fields:allrecords.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'fields':fields})
accepted=load('../shared-accepted-source-index.json')['records'];frozen={(r['destinationId'],f['field']) for r in accepted for f in r['fields']};assert not expected & frozen
(P/'records.json').write_text(json.dumps({'revision':'vincom-dining-r3-final-proposals','records':allrecords},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(P/'decisions.json').write_text(json.dumps({'lane':'vincom-dining','checkedAt':'2026-10-20','decisions':list(ds.values())},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
counts=dict(collections.Counter(d['outcome'] for d in ds.values()))
files=[p for p in P.iterdir() if p.is_file() and p.name not in ['progress.json','source-manifest.json']]
manifest={p.name:{'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in files}
(P/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
progress={'lane':'vincom-dining','destinations':len(q),'queuedFields':len(expected),'completedFieldDecisions':len(ds),'unresearched':0,'outcomes':counts,'acceptedFrozenFieldsPreserved':True,'proposalStatus':'Pending independent audit; no src integration by researcher.','browserApproval':'First final script rejected on stale read-only scope; exact retry approved after parent supplied superseding trusted user history. Executed successfully; no remaining approval denial.','limitations':['Official Facebook login/temporary blocks and403/timeouts retained as access holds.','Ambiguous brands and market/operator mismatches retained as identity/applicability holds.','Kichi and RuNam menu pages render selectors/navigation without actual menu-image retrieval in final browser inventory.','Longwang real embedded booking frame found; actual form inaccessible to text retriever and not yet inspected in frame.','Two frozen cosmetics identities retain dining taxonomy holds; no category changes.','Bounded negatives describe only checked official sources, never global absence.'],'validation':['292 unique queue keys exactly accounted for.','No overlap with shared accepted field index.','All proposals have bilingual value or actual URL, source date and declared scope.','Every hold has reason and remaining action.','No frozen roster or accepted source fields changed.'],'files':{n:manifest[n] for n in ['records.json','decisions.json','records-amendments2.json','decisions-amendments2.json']}}
(P/'progress.json').write_text(json.dumps(progress,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(progress,ensure_ascii=False))
