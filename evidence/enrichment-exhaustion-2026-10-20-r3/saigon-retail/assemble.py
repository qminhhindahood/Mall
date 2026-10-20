import json,pathlib,re,unicodedata,hashlib,copy,collections
p=pathlib.Path(__file__).parent
root=p.parents[2]
q=json.loads((p/'queue.json').read_text(encoding='utf-8'))['records']
sources=json.loads((p/'source-index.json').read_text(encoding='utf-8'))
cat=json.loads((p/'catalog-plan.json').read_text(encoding='utf-8'))
cat.update(kenzo='https://www.kenzo.com/en-int/home',montblanc='https://www.montblanc.com/en-us/writing-instruments',rimowa='https://www.rimowa.com/us/en/all-luggage/',coach='https://www.coach.com/shop/women/collections/tabby',labellab='https://www.shop.dafc.com.vn/brands/palm-angels.html',giordanoladies='https://www.giordanoladies.com/onlinestorehk/Fall-Winter-Collection-2026-c203989529',stanley1913='https://www.stanley1913.com/collections/adventure-quencher-travel-tumblers',typo='https://cottonon.com/SG/typo/stationery/writing/',qhome='https://qhome-vn.com/collections/tat-ca-san-pham',hla='https://www.hlamall.cn/wxmall/product/list',ginsenghouse='https://vietsaomai.com/product-category/ginseng-house/')
summaries={}
cat.update(pnj='https://www.pnj.com.vn/trang-suc-vang/trang-suc-nam/',thegioikimcuong='https://thegioikimcuong.vn/collections/nhan')
for line in (p/'product-summaries.tsv').read_text(encoding='utf-8').splitlines():
 k,en,vi=line.split('|'); summaries[k]={'vi':vi,'en':en}
shared=json.loads((p.parent/'shared-accepted-source-index.json').read_text(encoding='utf-8'))['records']
reuse={}
for r in shared:
 if r['mallId']=='vincom-dong-khoi':
  for f in r['fields']:
   if f['field']=='catalog' and f['applicability']=='brand-wide':reuse[r['destinationId'].replace('vincom-prototype-','')]=f
aliases={'adidas':'adidasoriginals','eccovietnam':'ecco'}
now='2026-10-20'
unc={'vi':'Thông tin danh mục chung của thương hiệu; sản phẩm, giá và tình trạng có hàng tại Saigon Centre có thể khác. Vui lòng xác nhận với cửa hàng.','en':'General brand product information; products, prices and stock at Saigon Centre may differ. Confirm with the store.'}
branchunc={'vi':'Thông tin được nêu trên trang chi nhánh chính thức; vui lòng xác nhận sản phẩm, dịch vụ và thông tin hiện tại trước khi ghé.','en':'Information stated on the official branch profile; confirm products, services and current details before visiting.'}
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
def slug(r):return r['destinationId'].replace('saigon-prototype-','') if 'prototype-' in r['destinationId'] else ('AESOP' if r['name']['en']=='AESOP' else 'Sport Fair')
def best(url):
 hits=[s for s in sources if s['url']==url and not s['error'] and s['length']>200]
 return max(hits,key=lambda s:s['length'],default=None)
def src(s,scope):
 return {k:s[k] for k in ['url','evidenceFile','reference','title']}|{'section':scope,'result':'indexed official text retrieved' if 'search' in (s['reference'] or '') else 'official reader text retrieved','support':s['body'][:1600]}
def mall_sources(r):
 urls=[f['sourceUrl'] for f in r['acceptedFields'] if f['field']=='website']
 if not urls:return []
 u=urls[0]; enslug=u.rstrip('/').split('/')[-1]
 return [s for s in sources if s['url'] in [u,'https://shopping.saigoncentre.com.vn/vi/thuong-hieu/'+enslug] and not s['error'] and s['length']>200]
def searches(r,k):
 out=[]
 terms={norm(r['name']['en']),norm(k)}
 if k=='AESOP':terms.add('aesop')
 if k=='eccovietnam':terms.add('ecco')
 if k=='charleskeith':terms.add('charleskeith')
 if k=='jns':terms.add('jins')
 if k=='colehaanvietnam':terms.add('colehaan')
 if k=='thegioikimcuong':terms.add('thegioikimcuong')
 if k=='tierradiamondjewelry':terms.add('tierra')
 if k=='viinriicgaleriesdeparfums':terms.add('viinriic')
 if k=='jomalonelondon':terms.add('jomalone')
 if k=='bathbodyworks':terms.add('bathandbodyworks')
 for f in sorted(p.glob('source-*.txt')):
  first=f.read_text(encoding='utf-8').split('\n',1)[0]
  if not first.startswith('{'):continue
  try:a=json.loads(first)
  except ValueError:continue
  for x in a.get('search_query',[]):
   if any(t and t in norm(x['q']) for t in terms):out.append({'query':x['q'],'evidenceFile':f.name,'result':'See saved result set; only corroborated official sources are used for proposals. Similarly named and third-party results are excluded.'})
 return out
def attempts(r,k):
 mallurl=next((f['sourceUrl'] for f in r['acceptedFields'] if f['field']=='website'),None)
 urls={mallurl,cat.get(k)}-{None}
 arr=[]
 for s in sources:
  if s['url'] in urls:arr.append({'url':s['url'],'evidenceFile':s['evidenceFile'],'reference':s['reference'],'result':'retrieval error' if s['error'] else ('content retrieved' if s['length']>200 else 'metadata or shell only')})
 arr.insert(0,{'url':mallurl,'evidenceFile':'../../continuation-2026-10-19-r2/research-saigon/outbound-link-audit.json','result':'Inherited full mall profile / outgoing reader links checked; no independent brand action disclosed. R3 independent brand checks recorded below.'})
 return arr
catalog_holds={
 'currencyexchangesimcard':('operator/field-role identity','Mall identifies an Agribank agent and travel SIM counter but does not identify an independent catalogue operator, SIM carrier or plan catalogue. Agribank identity alone cannot authenticate a SIM catalogue.','Obtain an official counter/operator or carrier-linked product/plan catalogue bound to this counter.'),
 'centuryhealthcare':('incomplete product retrieval','Official Indonesian Century marketplace returned zero reader lines; indexed homepage contains an application error/empty product sections and no actual product records. HealthcareVietnam and Centerpharma results are different businesses.','Retrieve the official Century marketplace product feed or readable catalogue; establish any Vietnam-specific applicability before claiming local stock.'),
 'annacoco':('authority and identity','The mall confirms Korean fashion; the surfaced Annacoco Hawaii and AnnaKoo catalogues are different identities. The candidate annacoco.vn cannot be retrieved. Another official mall points to annacocofashion Facebook, but no authenticated readable production product catalogue was retrieved.','Retrieve a working catalogue linked by the verified Korean/Vietnam Annacoco channel; exclude Hawaii and unrelated sellers.'),
 'chileno':('catalogue authority unresolved','Official mall profile identifies womenswear; independent exact-name searches surfaced unrelated Chililuu, Hot Chili and Chile sites. No corroborated CHILENO product-action source was retrieved.','Identify the production brand channel linked to this CHILENO branch and retrieve its product catalogue.'),
 'winkperry':('catalogue identity unresolved','Mall profile identifies Winkperry womenswear. Searches surface unrelated Wink retailers/catalogues and unrelated creator pages; none authenticate a Winkperry catalogue.','Retrieve a product catalogue from an authenticated Winkperry brand channel.'),
 'chlod':('catalogue identity unresolved','The mall identifies Chlo.D Korean fashion. Returned Clove, Chloé and Chloe Design sources do not establish the same brand; their products cannot be assigned to Chlo.D.','Retrieve an official catalogue linked to this precise Korean Chlo.D brand.'),
 'kenneth':('catalogue identity unresolved','The mall identifies a Korean fashion brand named Kenneth. Search results for Kenneth Cole and Kenneth & Co do not establish this identity; no verified Korean Kenneth catalogue action was retrieved.','Resolve the full Korean brand/operator identity through a verified brand source, then retrieve its catalogue.'),
 'maestro':('catalogue identity unresolved','Mall identifies Korean menswear MAESTRO. Search results for Maestro Market and Maestro Apparel do not establish the Korean mall tenant; the verified local social-brand result does not yield a readable catalogue.','Retrieve a production catalogue linked to Korean MAESTRO/Vietnam operation, excluding unrelated Maestro retailers.'),
 'pleatskora':('production authority unresolved','Exact-name research surfaced a Pleats Kora store demo on hoang1.storedemo.vn and unrelated Pleatsmood. A demo host is not evidence of a production official brand catalogue.','Establish the actual Pleats Kora production website or official catalogue channel; do not import the demo or Pleatsmood.'),
 'minigood':('incomplete retrieval and market authority','The global minigood.com source advertises a forthcoming brand-image update and times out on full retrieval; no actual product catalogue is readable. Country franchise sources do not establish Vietnam catalogue applicability or common authority.','Retrieve a working official global/Vietnam product catalogue with verifiable ownership.'),
 'pinktree':('catalogue identity unresolved','Mall identifies a Seoul accessories brand. Returned PinkTree Egypt clothing and Pink Tree PR sources are different identities and cannot authenticate this jewellery/hair-accessory retailer.','Retrieve an official catalogue tied to the Korean/Vietnam Pinktree accessories operation.'),
 'photoobjet':('action authority and role unresolved','Mall describes the photobooth service but has no product catalogue. A self-described Beacons profile exposes a price-list link and Saigon Centre location, but source ownership and the price-list target have not been corroborated through an official linked brand source.','Corroborate the Photo Objet Vietnam channel through a verified brand/mall cross-link and retrieve the actual pricing/catalogue target.'),
 'Sport Fair':('identity and offering hold','Mall page contains only Sport Fair, placeholder S and Opening Soon; no specific product offering or independent operating brand is identified. Generic exhibition and sport-fair results are unrelated.','Obtain an official brand/operator statement identifying this tenant and its actual product catalogue/offerings/contact.'),
}
phone_holds={
 'converse':('incomplete branch-locator retrieval','Mall contact block lacks a branch number. The official locator endpoint is indexed with a Saigon Centre record but the full endpoint fails retrieval, so the branch phone value cannot be inspected reliably.','Retrieve the complete official Saigon Centre locator record and its phone property.'),
 'onitsukatiger':('branch applicability','Official store-finder names this branch but shows no phone. The corporate contact page gives 038 294 6249 for ASICS Vietnam customer service at this address; it is not established as a dedicated store contact.','Obtain an official branch-number label or store-finder phone rather than repurposing customer service.'),
 'vivaia':('branch applicability','Brand contact source gives a US +1 (888) 828 1060 support number and international store information; no Saigon Centre direct phone is established.','Retrieve the Vietnam/Saigon Centre branch contact from an official locator or branch profile.'),
 'bathbodyworks':('branch locator incomplete','Official Vietnam contact is online customer care; 1800-576-972 shown on other store pages is shared customer service. The official locator exposes a search shell without a Saigon Centre record in the retrieved source.','Retrieve a Saigon Centre-specific locator contact or branch profile phone.'),
 'fujifilm':('branch applicability','Official national contact source identifies corporate offices and a camera warranty centre, not the Saigon Centre retail booth. Their phone numbers cannot be substituted as the branch number.','Retrieve a first-party Saigon Centre retailer/booth contact record.'),
 'newbalance':('locator retrieval/applicability','Official global locator is a search shell and distributor brand page says no brand store terms available; no usable Saigon Centre phone record is retrieved. Global US support is not the local store phone.','Retrieve an official Vietnam/Saigon Centre locator record with a branch-labelled phone.'),
 'AESOP':('branch applicability','The official Aesop global locator lists owned-store markets without a Vietnam entry in the retrieved representation; the mall branch profile does not establish a branch phone. A foreign-market support number is not a branch contact.','Retrieve an official Saigon Centre retail-partner contact or branch-labelled telephone.'),
 'Sport Fair':catalog_holds['Sport Fair'],
}
catalog_holds['memorylove']=('catalogue identity unresolved','The mall describes personalised gifts; independent searches return Collective Memory, Memories of Time and other similarly named gift shops. None authenticates a Memory & Love product catalogue.','Retrieve the product catalogue from a channel authenticated as this precise Memory & Love brand.')
catalog_holds['annacoco']=('authority and retrieval','Official mall profiles identify the Korean/Vietnam fashion brand and link annacocofashion Facebook. That channel is fetch-throttled (source-088); candidate annacoco.vn is inaccessible. Annacoco Hawaii and AnnaKoo are different identities. No readable authenticated production catalogue was retrieved.','Retrieve an actual catalogue through the verified annacocofashion channel when public retrieval works; no login or unrelated brand substitution.')
catalog_holds['maestro']=('authority and retrieval','Mall identifies Korean menswear MAESTRO. The local maestrovietnam.vn Facebook route redirects to login and a temporarily blocked response (source-088). Maestro Market and Maestro Apparel do not establish the same identity.','Retrieve a public production catalogue linked to Korean MAESTRO/Vietnam; do not use login-only content or unrelated Maestro retailers.')
phone_holds['AESOP']=('contact-action retrieval','The fresh official global/US customer-service page shows a Phone / Call us block but no numeric telephone in the retrieved representation (source-090 turn786view3); it explicitly serves U.S. consumers only. The mall placeholder profile supplies no branch number. No numeric value can be proposed.','Recover the numeric official contact action or a Vietnam/retail-partner contact; preserve any explicit market eligibility and source limitations.')
special_service={
 'fujifilm':('https://www.fujifilm.com/vn/en/consumer','brand-wide'),
 'charleskeith':('https://www.charleskeith.vn/vn/new-arrivals','brand-wide'),
 'crocs':('https://www.crocs.com.vn/collections/classic-clog','brand-wide'),
 'giordano':('https://www.giordano.com/VN/','brand-wide'),
 'havaianas':('https://havaianas.com.vn/','brand-wide'),
 'thegioikimcuong':('https://thegioikimcuong.vn/pages/thu-doi-bao-hanh','brand-wide'),
 'AESOP':('https://www.aesop.com/','brand-wide'),
 'rimowa':('https://www.rimowa.com/us/en/storedetails/ho-chi%20minh%20city/rimowa-ho%20chi%20minh%20-%20saigon%20centre-45','branch'),
 'uniqlo':('https://map.uniqlo.com/vn/vi/detail/123748','branch'),
 'takashimaya':('https://takashimaya-vn.com/en/general-services/','branch'),
}
fallback_phones={
 'onitsukatiger':('https://www.onitsukatiger.com/vn/vi-vn/lien-he','038 294 6249','Vietnam ASICS customer care; not established as a dedicated Saigon Centre store line. Direct reader returns HTTP405; official indexed contact text supplies the number.','Chăm sóc khách hàng ASICS Việt Nam; chưa xác nhận là số riêng của cửa hàng Saigon Centre. Trang đọc trực tiếp báo HTTP405; số lấy từ nội dung liên hệ chính thức đã lập chỉ mục.'),
 'bathbodyworks':('https://www.bathandbodyworks.vn/en/Vincom_Lanmark_81.html','1800 576 972','Shared Bath & Body Works Vietnam customer service printed on an official store page; not the Landmark 81 or Saigon Centre dedicated phone.','Chăm sóc khách hàng chung Bath & Body Works Việt Nam được ghi trên trang cửa hàng chính thức; không phải số riêng của Landmark 81 hay Saigon Centre.'),
 'fujifilm':('https://www.fujifilm.com/vn/en/contact','+84 28 3939 0847','FUJIFILM Vietnam head-office general phone; not the Saigon Centre booth contact or warranty-centre extension.','Số liên hệ chung của trụ sở FUJIFILM Việt Nam; không phải số quầy Saigon Centre hoặc máy nhánh trung tâm bảo hành.'),
 'vivaia':('https://www.vivaia.com/article/contact-us-79.html','+1 888 828 1060','VIVAIA United States customer support, Monday-Friday 9am-6pm PST; Vietnam service, local call routing and Saigon Centre contact are not established.','Hỗ trợ khách hàng VIVAIA tại Hoa Kỳ, thứ Hai-thứ Sáu 9:00-18:00 PST; chưa xác nhận hỗ trợ Việt Nam, định tuyến cuộc gọi trong nước hoặc liên hệ Saigon Centre.'),
 'newbalance':('https://www.newbalance.com/customerservice/','800 595 9138','New Balance United States website customer care. The source gives this domestic toll-free format; no country prefix is invented. Vietnam accessibility and Saigon Centre assistance are not established.','Chăm sóc khách hàng website New Balance Hoa Kỳ. Giữ định dạng số miễn phí nội địa của nguồn, không tự thêm mã quốc gia. Chưa xác nhận khả năng gọi từ Việt Nam hoặc hỗ trợ Saigon Centre.'),
}
records=[];decisions=[]
for r in q:
 k=slug(r); fields=[]; mall=mall_sources(r); mallbest=max(mall,key=lambda s:s['length'],default=None)
 for field in r['fields']:
  d={'mallId':r['mallId'],'destinationId':r['destinationId'],'name':r['name'],'field':field,'checkedAt':now,'attempts':attempts(r,k),'searches':searches(r,k)}
  f=None; evidence=None; reason=None; scope='brand-wide';date=now
  if field=='catalog':
   old=reuse.get(aliases.get(k,k))
   if old:
    f=copy.deepcopy(old);date=old['checkedAt'];f.pop('reviewedBy',None);f.pop('reviewedAt',None)
    f['evidence']+=' Reused for the same exact brand-wide role under Saigon identity; source object preserved in ../shared-accepted-source-index.json (Vincom source identity '+aliases.get(k,k)+'). No branch stock claimed.'
    evidence={'url':old['sourceUrl'],'evidenceFile':'../shared-accepted-source-index.json','reference':'vincom-prototype-'+aliases.get(k,k)+'/catalog','section':'independently audited r2 brand-wide catalogue','result':'verified evidence reused','support':old['evidence']}
   elif k in cat:
    s=best(cat[k])
    if s:
     evidence=src(s,'actual product listing / collection catalogue')
     f={'url':cat[k],'sourceUrl':cat[k],'evidence':'Official product/collection source for '+r['name']['en']+'; '+s['evidenceFile']+' '+str(s['reference'])+'. No local stock, price or fulfillment claim.'}
    else:
     reason=('incomplete catalogue retrieval','Attempted official product route is inaccessible or returns metadata/shell without readable product records; this is a retrieval hold, not unavailable.','Retrieve the official product/collection page with actual product records: '+cat[k])
   else:reason=catalog_holds[k]
  elif field=='services' and k in summaries:
   if k in special_service:
    url,scope=special_service[k]; s=best(url)
   else:
    s=mallbest;scope='branch'
    if not s:
     # Same-brand audited catalogue or fetched product source supports brand-wide offerings.
     old=reuse.get(aliases.get(k,k));url=cat.get(k) or (old['sourceUrl'] if old else None)
     s=best(url) if url else None;scope='brand-wide'
   if s:
    evidence=src(s,'branch-specific service block' if k in ['rimowa','uniqlo','takashimaya'] else 'specific product offering / brand profile')
    f={'value':summaries[k],'sourceUrl':s['url'],'evidence':('Branch-specific service block states these offerings. ' if k in ['rimowa','uniqlo','takashimaya'] else 'Specific product-offering summary; operational services, stock and prices are not inferred. ')+s['evidenceFile']+' '+str(s['reference'])+'.'}
   else:
    reason=('incomplete offering-source retrieval','The accepted directory description identifies products but a corresponding readable official r3 offering source was not recovered; no unsearched absence claim is made.','Retrieve the actual official mall description or brand product page before proposing this summary.')
  elif field=='phone' and k in fallback_phones:
   url,val,en,vi=fallback_phones[k];s=best(url);assert s
   evidence=src(s,'explicit brand / national or foreign-market general customer contact')
   f={'value':{'en':val,'vi':val},'sourceUrl':url,'evidence':'Explicitly scoped general contact fallback. '+en+' '+s['evidenceFile']+' '+str(s['reference'])+'.'}
  elif field=='phone' and k in ['uniqlo','skechers']:
   url='https://map.uniqlo.com/vn/vi/detail/123748' if k=='uniqlo' else next(f['sourceUrl'] for f in r['acceptedFields'] if f['field']=='website')
   s=best(url);scope='branch'; val='028 7109 3212' if k=='uniqlo' else '028 3822 2046'
   assert s and re.sub('[^0-9]','',val) in re.sub('[^0-9]','',s['body'])
   evidence=src(s,'branch contact block')
   f={'value':{'vi':val,'en':val},'sourceUrl':url,'evidence':'Number printed in the explicit branch contact block. '+s['evidenceFile']+' '+str(s['reference'])+'.'+(' Mall also labels Opening Soon; operation and connectivity are not verified.' if k=='skechers' else ' The locator says phone orders are not accepted.')}
  else:reason=phone_holds.get(k) if field=='phone' else catalog_holds.get(k)
  if k=='uniqlo' and field in ['phone','services']:
   f=None;reason=('JavaScript branch-locator retrieval','The indexed official locator describes the phone/services but a fresh direct reader returns only You need to enable JavaScript to run this app (source-090, turn786view2). An actual rendered branch body or official public-store API has not been recovered; indexed facts are not accepted as current branch values.','Retrieve the rendered official Saigon Centre store record or an official public-store API response showing the exact phone/services before acceptance.')
  if f:
   f.update(field=field,state='newly-sourced-proposal',checkedAt=date,applicability=scope,verification='source-checked',approval='provisional',uncertainty=copy.deepcopy(branchunc if scope=='branch' else unc))
   if scope=='branch':f['branchMallId']=r['mallId']
   else:f.pop('branchMallId',None)
   # Catalogue subsets and international-market limits are explicit.
   extra={
    'montblanc':('Danh mục dụng cụ viết quốc tế; không đại diện toàn bộ các nhóm hàng của boutique.','International writing-instrument catalogue; it does not cover every boutique product category.'),
    'thehourglass':('Danh mục Rolex của nhà bán lẻ tại Việt Nam; không phải toàn bộ các thương hiệu của cửa hàng.','Retailer Rolex selection in Vietnam; not every brand carried by the store.'),
    'labellab':('Danh mục Palm Angels do DAFC cung cấp; không bao quát toàn bộ các thương hiệu của Label Lab.','DAFC Palm Angels product selection; it does not cover all Label Lab brands.'),
    'atzorganicyankeecandle':('Danh mục Yankee Candle tại Việt Nam; không bao quát toàn bộ sản phẩm ATZ Organic.','Yankee Candle Vietnam catalogue; it does not cover all ATZ Organic products.'),
    'harnn':('Bộ sưu tập chăm sóc cơ thể White Tea & Camellia của website Thái Lan.','White Tea & Camellia body-care collection on the Thai website.'),
    'typo':('Danh mục văn phòng phẩm của website Singapore; hàng tại Việt Nam có thể khác.','Stationery selection on the Singapore website; Vietnam products may differ.'),
    'hla':('Danh mục tiếng Trung cho thị trường Trung Quốc; không xác nhận sản phẩm hoặc giao hàng tại Việt Nam.','Chinese-language catalogue for the China market; Vietnam stock or delivery is not established.'),
    'giordanoladies':('Bộ sưu tập Thu Đông 2026 của website Hong Kong; không xác nhận hàng tại Việt Nam.','Fall Winter 2026 collection on the Hong Kong website; Vietnam stock is not established.'),
   }.get(k)
   international=k in ['christianlouboutin','coach','diptyque','jomalonelondon','kenzo','longchamp','mcm','montblanc','rimowa','tagheuer','tudor','tumi','zenith','armaniexchange','dsquared2','exnihilo','geox','lush','maje','maxco','moschino','sandro','thebodyshop','vivaia','weekendmaxmara','bloom','drmartens','levis','newbalance','stanley1913','sunniesstudios','matinkimvietnam','grandseiko','hublot']
   if field=='catalog' and international:
    f['uncertainty']['en']+=' International or foreign-market catalogue; Vietnam availability, delivery and prices are not established.'
    f['uncertainty']['vi']+=' Danh mục quốc tế hoặc cho thị trường khác; không xác nhận hàng hóa, giao hàng hay giá tại Việt Nam.'
   if field=='catalog' and extra:
    f['uncertainty']['vi']+=' '+extra[0];f['uncertainty']['en']+=' '+extra[1]
   if field=='phone' and k in fallback_phones:
    f['uncertainty']={'en':fallback_phones[k][2]+' Phone connectivity has not been tested.','vi':fallback_phones[k][3]+' Chưa kiểm tra khả năng kết nối cuộc gọi.'}
   d.update(outcome='proposal',proposedField=f,sources=[evidence],sourceScope=scope,reason='Official evidence supports the exact '+('action role' if field=='catalog' else 'bilingual value')+' with stated scope; independent review pending.',remainingAction=None)
   fields.append(f)
  else:
   assert reason,(k,field)
   d.update(outcome='hold',blockerType=reason[0],sources=[src(mallbest,'mall branch profile') ] if mallbest else [],sourceScope='unresolved',reason=reason[1],remainingAction=reason[2],boundedUnavailable=False)
   # Retain candidate/failed paths from every targeted result receipt, without
   # treating candidate authority or a third-party search hit as support.
   receiptfiles={x['evidenceFile'] for x in d['searches']}
   extra_receipts={'annacoco':['source-088.txt'],'maestro':['source-088.txt'],'photoobjet':['source-088.txt'],'uniqlo':['source-090.txt'],'AESOP':['source-090.txt']}.get(k,[])
   receiptfiles.update(extra_receipts)
   seen={(x.get('url'),x.get('evidenceFile'),x.get('reference')) for x in d['attempts']}
   for candidate in sources:
    key=(candidate['url'],candidate['evidenceFile'],candidate['reference'])
    if candidate['evidenceFile'] in receiptfiles and key not in seen:
     d['attempts'].append({'url':candidate['url'],'evidenceFile':candidate['evidenceFile'],'reference':candidate['reference'],'result':'Targeted result/candidate path examined; authority and exact brand/field applicability not assumed. '+('Retrieval failed.' if candidate['error'] else 'See source text and blocker reason.')});seen.add(key)
  if f and field=='services':
   cs=best(cat.get(k,''))
   if cs and cs['url']!=f['sourceUrl']:d['sources'].append(src(cs,'supplementary brand-wide product collection; no branch stock claim'))
   old=reuse.get(aliases.get(k,k))
   if old:d['sources'].append({'url':old['sourceUrl'],'evidenceFile':'../shared-accepted-source-index.json','reference':'vincom-prototype-'+aliases.get(k,k)+'/catalog','section':'supplementary audited same-brand product catalogue','result':'verified brand-wide role reused','support':old['evidence']})
  if f and k=='AESOP':
   f['uncertainty']['en']+=' Global/US product information; site also reports an outage. Vietnam availability and a working local transaction are not established.'
   f['uncertainty']['vi']+=' Thông tin sản phẩm toàn cầu/Mỹ; website cũng báo lỗi. Chưa xác nhận tình trạng hàng hoặc giao dịch tại Việt Nam.'
  decisions.append(d)
 if fields:records.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'fields':fields})
def write(name,data):
 (p/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write('records.json',{'revision':'saigon-retail-exhaustion-2026-10-20-r3-proposal','records':records})
write('decisions.json',{'revision':'saigon-retail-exhaustion-2026-10-20-r3','decisions':decisions})
write('catalog-final-plan.json',cat)
queued={(r['mallId'],r['destinationId'],f) for r in q for f in r['fields']}
assert len(decisions)==len(queued)==226
assert {(d['mallId'],d['destinationId'],d['field']) for d in decisions}==queued
assert not any(d['outcome']=='proposal' and not d['sources'] for d in decisions)
base=json.loads((p.parent/'baseline-accepted.json').read_text(encoding='utf-8'))
live=json.loads((root/'src/data/enrichment-accepted.json').read_text(encoding='utf-8'))
basekeys={(r['mallId'],r['destinationId'],f['field']):f for r in base['records'] for f in r['fields']}
livekeys={(r['mallId'],r['destinationId'],f['field']):f for r in live['records'] for f in r['fields']}
assert all(livekeys.get(k)==v for k,v in basekeys.items()),'Accepted658 baseline changed'
counts=collections.Counter(d['outcome'] for d in decisions)
stats={'lane':'saigon-retail','checkedAt':now,'status':'all-assigned-fields-reviewed-proposals-await-independent-audit','destinations':len(q),'queuedFields':len(decisions),'outcomes':dict(counts),'proposalFieldsByType':dict(collections.Counter(d['field'] for d in decisions if d['outcome']=='proposal')),'holdsByType':dict(collections.Counter(d['blockerType'] for d in decisions if d['outcome']=='hold')),'unresearched':0,'boundedUnavailable':0,'sourceReceiptFiles':len(list(p.glob('source-*.txt'))),'accepted658Preserved':True,'sourceAcceptedSha256':hashlib.sha256((root/'src/data/enrichment-accepted.json').read_bytes()).hexdigest(),'limits':['Indexed official representations and reader retrievals; no live occupancy, calls, stock, delivery, on-site or release acceptance.','No source/tracker/assets/build/frozen-preview changes.','All held actions expose no runtime value/action.','No personal owner approval fabricated; all positive fields remain proposals pending delegated audit.']}
write('progress.json',stats)
write('holds.json',[d for d in decisions if d['outcome']=='hold'])
print(json.dumps(stats,indent=2))
