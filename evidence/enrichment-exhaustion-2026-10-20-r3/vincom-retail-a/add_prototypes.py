import pathlib,json,re
p=pathlib.Path(__file__).parent
q=json.loads((p/'queue.json').read_text(encoding='utf-8'))['records'];n=json.loads((p/'notes.json').read_text(encoding='utf-8'))
for ix,url,ev,vi,en,cat,reason in json.loads((p/'batch-prototype-input.json').read_text(encoding='utf-8')):
 r=q[ix];name=r['name']['en'];fs={}
 for f in r['fields']:
  fs[f]={'outcome':'hold','url':url,'evidence':ev,'reason':reason+' Specific unresolved field: '+f+'.','remainingAction':'Retrieve readable official '+name+' '+f+' source with exact frozen brand identity and stated branch or brand-wide applicability.'}
 if vi:
  if 'website' in fs: fs['website']={'url':url,'evidence':ev,'reason':'Retrieved official brand or operator source provides an actual website action for this exact brand. '+reason}
  if cat and 'catalog' in fs:fs['catalog']={'url':url,'evidence':ev,'reason':'Actual official source presents concrete product listings or product-category collection content, supporting catalogue role. '+reason}
  if 'services' in fs:fs['services']={'url':url,'evidence':ev,'vi':vi,'en':en,'reason':'Official specific product/service offering summary; no unmentioned policy, inventory, local price or efficacy claim. '+reason}
 # no create generic source actions from access-failed source
 if ix in (46,54,66):
  slug={46:'levis',54:'nars',66:'the-body-shop'}[ix]
  fs['services'].update(url='https://vincom.com.vn/store/'+slug+'-vincom-center-dong-khoi',evidence='source-text/mall-'+slug+'.json')
 if ix==65: # actual branch article/root both502; do not promote indexed excerpt
  fs['services']={'outcome':'hold','url':url,'evidence':'source-text/details34.json','reason':'Official brand root and exact reopening article both return502. Product-offering text exists only as an indexed search lead, not a readable actual official source.','remainingAction':'Retrieve the official brand article or another authoritative product source successfully.'}
 if ix==56:
  if 'catalog' in fs:fs['catalog'].update(evidence='../shared-accepted-source-index.json',reason='Reuse exact independently accepted saigon-prototype-owndays catalog source at https://www.owndays.com/vn/vi; identical brand and Vietnam-wide role. Original source checked2026-10-19; no cross-mall practical values reused.')
  if 'services' in fs:fs['services'].update(url='https://vincom.com.vn/store/owndays-vincom-center-dong-khoi',evidence='source-text/mall-owndays.json')
 if ix in (38,53,62,70): # no actual product/body evidence; website stays held if not retrieved brand-specific
  pass
 if ix==58:fs['services']['vi']='Studio tự chụp phong cách Hàn Quốc với các loại phòng Color và Banbe (thông tin chung của PHOTO TIME).';fs['services']['en']='Korean-style self-photo studio with Color and Banbe room types (PHOTO TIME general information).'
 if ix==67:
  fs['services']['scope']='branch'
  fs['programme']={'url':url,'evidence':ev,'scope':'branch','reason':'Actual exact Timezone Vincom Dong Khoi page lists named arcade and VR games: Asphalt9 Legends DX, VR Paraglider, Combat Herosco-op and Rabbids VR The Big Ride. Programme is a current-source game/attraction listing, not an inferred live-event calendar.'}
 n.append({'id':r['destinationId'],'url':url,'evidence':ev,'fields':fs,'attempts':[{'action':'review r2 research and independently accepted source index','result':'Exact identity/brand-wide reuse checked; accepted baseline objects remain untouched.'},{'action':'retrieve official source after exact branch/brand search','url':url,'evidenceFile':ev,'result':reason}]})
def put(ix,f,url,ev,val,reason,scope='branch'):
 a=next(z for z in n if z['id']==q[ix]['destinationId'])
 if f not in q[ix]['fields']:raise ValueError((ix,f))
 a['fields'][f]={'url':url,'evidence':ev,'scope':scope,'vi':val,'en':val,'reason':reason}
put(26,'phone','https://www.adidas.com.vn/en/stores/vietnam/ho-chi-minh-city/b1-56-vincom-dong-khoi-72-le-thanh-ton/9990086719','source-text/find27.json','+84 02838245997','Actual official locator explicitly names adidas Originals Store Ho Chi Minh City, B1-56 Vincom Dong Khoi and gives+8402838245997. Exact frozen Originals identity, not separate Adidas destination; display source formatting without invented digits.')
put(26,'hours','https://www.adidas.com.vn/en/stores/vietnam/ho-chi-minh-city/b1-56-vincom-dong-khoi-72-le-thanh-ton/9990086719','source-text/find27.json','09:30–22:00','Actual official exact Originals branch opening-hours block lists09:30–22:00 for each of seven days.')
put(27,'phone','https://anphuoc.com.vn/an-phuoc-menswear/ao-so-mi-nam','source-text/alternative-anphuoc.json','1800 888 618','Actual official national product-category page header displays1800888618. Explicit An Phuoc general customer contact, not a dedicated Dong Khoi branch line.','brand-wide')
put(28,'phone','https://www.bathandbodyworks.vn/en/Vincom_Dong_Khoi.html','source-text/alternates33.json','1800 576 972','Actual official Vietnam branch page explicitly says contact Customer Service1800576972; national customer support only. Conflicting cached branchphone lead is not used.','brand-wide')
put(28,'hours','https://www.bathandbodyworks.vn/en/Vincom_Dong_Khoi.html','source-text/alternates33.json','10:00–22:00','Actual exact Vietnam Dong Khoi branch page lists10:00AM–10:00PM for every day Monday–Sunday, matched72 Le Thanh Ton address.')
put(33,'phone','https://www.acfc.com.vn/blog/he-thong-cua-hang-cotton-on.html','source-text/locator-new-cotton.json','028 7301 4799','Actual official authorized distributor ACFC block names Cotton On Vincom Center Dong Khoi, B1-B31.32,72 Le Thanh Ton and phone02873014799.')
put(38,'website','https://www.fredperry.com/sa-en/shop-finder/vincom-dong-khoi-hcm','source-text/find27.json','','Actual official exact Fred Perry Vincom Dong Khoi store page,72 Le Thanh Ton, branch website action.')
put(38,'phone','https://www.fredperry.com/sa-en/shop-finder/vincom-dong-khoi-hcm','source-text/find27.json','+84 902 645 408','Actual exact official Fred Perry Dong Khoi locator phone+84902645408.')
put(38,'hours','https://www.fredperry.com/sa-en/shop-finder/vincom-dong-khoi-hcm','source-text/find27.json','10:00–22:00','Actual exact Fred Perry Dong Khoi locator lists10:00–22:00 for all seven days.')
put(39,'phone','https://gigi.com.vn/','source-text/catalog-gigi.json','1900 252 538','Actual official GIGI Vietnam footer gives national Maison/GiGi hotline1900252538; explicitly distributor-wide, not dedicated Dong Khoi branch.','brand-wide')
put(40,'phone','https://vincom.com.vn/promotion/guess-or-more-for-less','source-text/alternates33.json','028 7303 9599','Actual official mall promotion September2026 explicitly gives GUESS Vincom Dong Khoi,72 Le Thanh Ton, phone02873039599. Promotion discount is not reused or asserted current.')
put(41,'phone','https://maisonrmi.com/vi/brands/havaianas/','source-text/locator-new-havaianas.json','028 7105 6979','Actual official Maison operator Havaianas page exact Dong Khoi branch B1-28A72 Le Thanh Ton gives02871056979.')
put(42,'hours','https://www2.hm.com/vi_vn/customer-service/shopping-at-hm/store-locator/viet%20nam/hochiminh/hm-vincom-%C4%91%E1%BB%93ng-kh%E1%BB%9Fi/vn0101.html','source-text/contacts31.json','Mon–Fri 10:00–22:00; Sat–Sun 09:30–22:00','Actual official H&M Vincom Dong Khoi locator lines970–974 gives weekday/weekend schedule at72 Le Thanh Ton.')
next(z for z in n if z['id']==q[42]['destinationId'])['fields']['hours']['vi']='Thứ Hai–Thứ Sáu 10:00–22:00; Thứ Bảy–Chủ Nhật 09:30–22:00'
put(47,'phone','https://longbeachpearl.com/','source-text/catalog-longbeach.json','1900 277 299','Actual official Long Beach Pearl footer gives national switchboard1900277299; explicitly brand-wide contact. Indexed0932027709 branch lead remains unverified by actual dynamic locator.','brand-wide')
put(52,'hours','https://messyweekend.dk/pages/stores','source-text/locator-messy.json','Mon–Fri 10:00–22:00; Sat–Sun 09:30–22:00','Actual official MESSYWEEKEND stores page names Vincom Center Dong Khoi72 Le Thanh Ton and supplies weekday/weekend opening schedule.')
next(z for z in n if z['id']==q[52]['destinationId'])['fields']['hours']['vi']='Thứ Hai–Thứ Sáu 10:00–22:00; Thứ Bảy–Chủ Nhật 09:30–22:00'
put(55,'phone','https://www.acfc.com.vn/maplist','../vincom-retail-b/details-03.json','028 7302 8399','Actual official ACFC maplist source lines760–764 names standard Nike Vincom Center Dong Khoi B1-55,72 Le Thanh Ton and phone02873028399. Matches frozen standard Nike; separate Nike Rise is not amended.')
put(60,'phone','https://pucini.vn/store/','source-text/locator-pucini.json','0868 887 095','Actual official store page repeats0868887095 with ecom@pucini.vn for multiplebranches, including Dong Khoi. Explicit general e-commerce contact only, not a dedicated branch line.','brand-wide')
put(61,'phone','https://samsonite-vietnam.com/pages/he-thong-cua-hang','source-text/locator-samsonite.json','028 3535 4636','Actual official exact Samsonite Vincom Dong Khoi B2-55 store block lists02835354636. Head-office17th-floor phone is not used.')
put(64,'phone','https://vn.sulwhasoo.com/en/pages/spa-reservation','source-text/find27.json','028 6272 4574','Actual official Sulwhasoo Vincom Dong Khoi spa reservation block at72 Le Thanh Ton lists02862724574.')
put(64,'hours','https://vn.sulwhasoo.com/en/pages/spa-reservation','source-text/find27.json','10:00–21:30','Actual official Sulwhasoo Vincom Dong Khoi spa branch block gives working time10:00–21:30; no holiday schedule inferred.')
put(69,'phone','https://urbanrevivo.com.vn/','source-text/catalog-urban.json','1900 252 538','Actual Vietnam brand footer gives official Maison national customer-service hotline1900252538. Explicit distributor-wide, not cached branchphone02836227748.','brand-wide')
put(72,'phone','https://www.wilsonsports.com.vn/pages/wilson-vietnam-stores','source-text/locator-wilson.json','+84 919 730 267','Actual Wilson Vietnam stores page exact WILSON VINCOM DONG KHOI B1-51 branch gives+84919730267.')
put(72,'hours','https://www.wilsonsports.com.vn/pages/wilson-vietnam-stores','source-text/locator-wilson.json','Mon–Thu 10:00–22:00; Fri–Sun 09:30–22:00','Actual exact Wilson Dong Khoi branch block gives Mon–Thu10:00–22:00 and Fri–Sun09:30–22:00, retained Friday distinction.')
next(z for z in n if z['id']==q[72]['destinationId'])['fields']['hours']['vi']='Thứ Hai–Thứ Năm 10:00–22:00; Thứ Sáu–Chủ Nhật 09:30–22:00'
# Concrete source-access supplements
for ix in (38,65):
 a=next(z for z in n if z['id']==q[ix]['destinationId'])
 for f in a['fields'].values():
  if f.get('outcome')=='hold':f['attempts']=[{'action':'retrieve exact alternative official category/article','evidenceFile':'source-text/details34.json','result':'Timeout (Fred Perry category) or502 (TGKC exact reopening article); no repeated denied URL request.'}]
# exact issued query receipts replace synthetic query descriptions
for a in n:
 ix=next(i for i,r in enumerate(q) if r['destinationId']==a['id']);g=(ix//4)*4;fp=p/'source-text'/('targeted-'+str(g)+'.json');s=json.loads(fp.read_text(encoding='utf-8'));qi=ix-g
 a['searches']=[{'query':s['queries'][qi]['q'],'evidenceFile':'source-text/'+fp.name,'result':'See full preserved actual search response; only official sources considered for proposals, third-party contacts/hours excluded.'}]
 a.setdefault('attempts',[]).append({'action':'exact branch phone/hours search','query':s['queries'][qi]['q'],'evidenceFile':'source-text/'+fp.name,'result':'Actual search response retained; no global absence claim.'})
 # bind exact web reference automatically where source response contains one
 for f,x in a['fields'].items():
  ef=x.get('evidence',a.get('evidence'))
  if ef and (p/ef).is_file():
   raw=(p/ef).read_text(encoding='utf-8');m=re.search(r'turn\d+(?:view|search)\d+',raw)
   if m:x.setdefault('reference',m.group())
# avoid unreviewed global inference and mark international action scope
international={8,14,25,29,31,32,44,48,50,52,68,73}
for a in n:
 ix=next(i for i,r in enumerate(q) if r['destinationId']==a['id'])
 if ix in international:
  for x in a['fields'].values():
   if x.get('outcome','proposal')=='proposal' and x.get('scope','brand-wide')=='brand-wide':
    x['uncertainty']={'vi':'Danh mục hoặc thông tin thương hiệu ở thị trường quốc tế; không xác nhận giá, hàng tồn, giao hàng hay dịch vụ tại chi nhánh Việt Nam.','en':'International-market brand information; Vietnam branch prices, stock, delivery and services are not confirmed.'}
n.sort(key=lambda a:next(i for i,r in enumerate(q) if r['destinationId']==a['id']))
(p/'notes.json').write_text(json.dumps(n,ensure_ascii=False,indent=2),encoding='utf-8')

