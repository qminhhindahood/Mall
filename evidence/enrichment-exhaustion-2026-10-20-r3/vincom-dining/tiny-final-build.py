import json,pathlib,hashlib,copy
p=pathlib.Path(__file__).parent
root=p.parent
q=json.loads((p/'queue.json').read_text(encoding='utf-8'))['records']
audit=json.loads((root/'content-audit/audit-decisions.json').read_text(encoding='utf-8'))['records']
browser=json.loads((p/'tiny-contact-browser.json').read_text(encoding='utf-8'))
def write(name,obj):
 path=p/name
 assert not path.exists(),name
 path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
keys=[(q[i]['destinationId'],'phone') for i in [22,26,27,41,42,50]]+[(q[42]['destinationId'],'menu')]
prior=[copy.deepcopy(x) for x in audit if (x.get('destinationId'),x.get('field')) in keys]
assert len(prior)==7,len(prior)
write('tiny-final-prior-audit.json',{'source':'content-audit/audit-decisions.json','sourceSha256':hashlib.sha256((root/'content-audit/audit-decisions.json').read_bytes()).hexdigest(),'records':prior})
decisions=[]
records={}
def decision(i,field,sourceindices,reason,proposal=None):
 r=q[i]; d={'mallId':r['mallId'],'destinationId':r['destinationId'],'field':field,'outcome':'proposal' if proposal else 'hold','checkedAt':'2026-10-20','reason':reason,'sources':[{'sourceUrl':browser[n]['finalUrl'],'evidenceFile':'vincom-dining/tiny-contact-browser.json','sourceIndex':n,'status':browser[n]['status'],'checkedAt':browser[n]['checkedAt']} for n in sourceindices],'searches':[{'url':browser[n]['url'],'purpose':'Inspect exact official contact/corporate page and rendered body for published phone' if field=='phone' else 'Inspect actual food catalogue products and market selector','result':'Actual rendered official body saved; no forms submitted'} for n in sourceindices],'priorAuditFile':'vincom-dining/tiny-final-prior-audit.json','remainingAction':'Independent content audit of this immutable amendment' if proposal else 'Retain precise hold; resolve stated source gap or discrepancy before publishing a phone'}
 if proposal:
  d['proposedField']=proposal
  records.setdefault(i,{'mallId':r['mallId'],'destinationId':r['destinationId'],'fields':[]})['fields'].append(proposal)
 decisions.append(d)
def phone(i,n,value,en,vi,evidence):
 f={'field':'phone','state':'newly-sourced-proposal','sourceUrl':browser[n]['finalUrl'],'evidence':evidence,'checkedAt':'2026-10-20','applicability':'brand-wide','verification':'source-checked','approval':'provisional','value':{'vi':value,'en':value},'uncertainty':{'vi':vi,'en':en}}
 decision(i,'phone',[n],evidence,f)
phone(22,1,'06-6361-7000','DAY TO LIFE parent-company head office in Osaka, Japan, linked by Beard Papa’s official site; not a Vietnam branch or customer-order line. Calling from Vietnam has not been tested.','Văn phòng công ty mẹ DAY TO LIFE tại Osaka, Nhật Bản, được website Beard Papa liên kết; không phải số chi nhánh Việt Nam hay đường dây đặt hàng. Chưa thử gọi từ Việt Nam.','Official Beard Papa contact/footer directly links DAY TO LIFE corporate profile; rendered profile labels 06-6361-7000 as representative TEL of Japan head office. Fax excluded.')
phone(27,6,'0120-811-114','Yamazaki Baking Japan customer consultation toll-free number for product enquiries; not the Vincom bakery. Domestic Japanese toll-free access from Vietnam is not verified.','Số miễn phí tư vấn sản phẩm của Yamazaki Baking tại Nhật Bản; không phải tiệm tại Vincom. Chưa xác minh khả năng gọi số miễn phí nội địa Nhật từ Việt Nam.','Official Yamazaki Japan product-enquiry page explicitly publishes customer consultation free-dial 0120-811-114; rendered browser and reader agree.')
phone(50,7,'1-800-419-4041','Clinique US online customer support, as published under Need Help on the US-market official site; not the Vincom counter. Toll-free calling from Vietnam is not verified.','Hỗ trợ khách hàng trực tuyến Clinique thị trường Mỹ, công bố trong mục Need Help; không phải quầy tại Vincom. Chưa xác minh gọi miễn phí từ Việt Nam.','Official Clinique.com rendered US site footer places 1-800-419-4041 under Need Help alongside customer services; source reader explicitly identifies market us/Country US.')
decision(26,'phone',[2],'SeoulGarden Singapore official Contact Us page renders an enquiry form with optional mobile-number input for the sender, but no published destination telephone or tel link. No phone inferred from form fields; earlier Vietnam branch source gap remains.')
decision(41,'phone',[3],'TLJ US official Contact Us page renders enquiry form and Buena Park corporate postal address, but no destination phone or tel link. Order enquiries direct visitors to their local branch; no arbitrary foreign outlet substituted.')
decision(42,'phone',[4],'Exact language/version discrepancy: reader Japanese legal notice publishes 080-7171-6457 (tiny-contact-web-3.txt); live browser final English /en/policies/legal-notice publishes 050-5435-1201. Both describe THE MATCHA TOKYO Japan online-store legal contact. Retain hold until current applicable contact is reconciled, rather than choose digits silently.')
f={'field':'menu','state':'newly-sourced-proposal','sourceUrl':browser[5]['finalUrl'],'evidence':'Official MATCHA FOODS retail catalogue renders actual organic-matcha energy-drink 6/30-bottle packs and MATCHA WATER 6-bottle pack, with Japan JPY market selector. This is an actual consumable product catalogue reference, not a restaurant menu shell. Cached reader exposes additional products, but live-item claim is limited to rendered drinks.','checkedAt':'2026-10-20','applicability':'brand-wide','verification':'source-checked','approval':'provisional','url':browser[5]['finalUrl'],'uncertainty':{'vi':'Danh mục thực phẩm, đồ uống bán lẻ của thương hiệu cho thị trường Nhật Bản; chỉ là tài liệu tham khảo một phần, không phải thực đơn quán tại Vincom. Xác nhận sản phẩm và giá tại chi nhánh.','en':'Brand retail food/drink catalogue for the Japanese market; a partial product reference, not the Vincom cafe menu. Confirm branch products and prices.'}}
decision(42,'menu',[5],f['evidence'],f)
write('tiny-final-records.json',{'revision':'tiny-final-contact-catalogue-2026-10-20','records':list(records.values())})
write('tiny-final-decisions.json',{'revision':'tiny-final-contact-catalogue-2026-10-20','records':decisions})
expected={'records.json':'5d106af33f5c644c8d2d616be35aebfd1ccbf4225bfdaa24b1f48353a09f5728','decisions.json':'4a541acd892d57942937d10ac39ccae3171c56ad88e17e75995edec9ff25e212'}
unchanged={n:hashlib.sha256((p/n).read_bytes()).hexdigest()==h for n,h in expected.items()}
assert all(unchanged.values()),unchanged
files=['tiny-final-records.json','tiny-final-decisions.json','tiny-final-prior-audit.json','tiny-contact-browser.json']+['tiny-contact-web-'+str(i)+'.txt' for i in range(1,5)]
write('tiny-final-validation.json',{'passed':True,'queuedKeysReviewed':7,'proposals':4,'holds':3,'priorExactObjects':7,'canonicalUnchanged':unchanged,'filesSha256':{n:hashlib.sha256((p/n).read_bytes()).hexdigest() for n in files}})
print(json.dumps({'proposals':4,'holds':3,'hashes':{n:hashlib.sha256((p/n).read_bytes()).hexdigest() for n in files[:4]}},indent=2))

