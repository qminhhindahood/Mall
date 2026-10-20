import json,pathlib,hashlib,collections
P=pathlib.Path(__file__).resolve().parent
load=lambda n:json.loads((P/n).read_text(encoding='utf-8'))
ds={(d['destinationId'],d['field']):d for d in load('decisions.json')['decisions']};q=load('queue.json')['records'];updates=[]
def p(i,f,url,evidence,files,vi=None,en=None,scope='brand-wide'):
 r=q[i];d=json.loads(json.dumps(ds[r['destinationId'],f]));v={'field':f,'state':'newly-sourced-proposal','sourceUrl':url,'evidence':evidence,'checkedAt':'2026-10-20','applicability':scope,'verification':'source-checked','approval':'provisional'}
 if vi is None:v['url']=url
 else:v['value']={'vi':vi,'en':en or vi}
 if scope=='branch':v['branchMallId']='vincom-dong-khoi'
 v['uncertainty']={'vi':'Thông tin chung của thương hiệu; xác nhận thực đơn, sản phẩm và thông tin hiện tại tại chi nhánh.' if scope=='brand-wide' else 'Thông tin từ nguồn chính thức đã kiểm tra; vui lòng xác nhận trước khi ghé.','en':'Brand-wide information; confirm the branch menu, products and current details.' if scope=='brand-wide' else 'Information from the checked official source; confirm current details before visiting.'}
 d.update(outcome='proposal',proposedField=v,reason=evidence,remainingAction=None);d['sources']=[{'evidenceFile':n,'url':url,'section':'Exact official branch/menu/action evidence','result':'retrieved and source-checked','support':evidence} for n in files];ds[r['destinationId'],f]=d;updates.append(d)
p(8,'phone','https://kingbbq.vn/lien-he/','After official city selection locator resolves36rows, including exact King BBQ Buffet Vincom Center Dong Khoi72LeThanhTon/45ALyTuTrong and02873081779. Source writes floorLau3; floor/geometry not changed, telephone binding is exact named branch.',['browser-remaining.json'],'02873081779',scope='branch')
p(8,'menu','https://kingbbq.vn/thuc-don-mien-nam/menu-mix-dong-khoi/','Official selector has distinct King BBQ Vincom Dong Khoi option pointing to this20page gallery. Browser200 and downloaded pages3/6 visually show actual beef/salmon/pork dishes; not the separate VincomB ALC option.',['browser-final-sources.json','king-menu.json','king-menu-3.jpg','king-menu-6.jpg'],scope='branch')
p(8,'services','https://kingbbq.vn/thuc-don-mien-nam/menu-mix-dong-khoi/','Exact official Dong Khoi menu pages3/6 visually verified beef,ribs,porkcollar,porkbelly and cheese-wrapped pork offerings. No prices copied.',['king-menu.json','king-menu-3.jpg','king-menu-6.jpg'],'Thịt bò, dẻ sườn, nạc dăm heo, ba chỉ heo và ba chỉ cuộn phô mai theo thực đơn nướng.','Beef, ribs, pork collar, pork belly and pork belly with cheese from the barbecue menu.',scope='branch')
p(25,'menu','https://kichi.com.vn/thuc-don','Official HCM selection and normal scrolling resolves3actual menu images. Downloaded HCM image2 visually verified beef cuts, seafood, cheese tofu and handmade items; no prices copied.',['browser-menu-last.json','kichi-menu.png'])
p(25,'services','https://kichi.com.vn/thuc-don','Actual HCM menu image2 visually lists American beef belly, Australian beef cuts, squid/shrimp/salmon and cheese tofu. Product options vary by buffet, no prices/tier promises copied.',['browser-menu-last.json','kichi-menu.png'],'Buffet lẩu băng chuyền với các lựa chọn thịt bò, hải sản và đậu hũ phô mai theo thực đơn.','Conveyor hotpot buffet with beef, seafood and cheese-tofu options from the menu.')
p(40,'booking','https://longwang.vn/en/stores/','Official Book A Table action opens embedded Aladdin reservation form: name,phone,email,area,restaurant,date,time,party,message and request button. Restaurant field remains chooser; brand-wide form only, confirm branch. No submission.',['browser-remaining.json'])
p(48,'menu','https://caferunam.com/vi/menu/runam-vietnam-menu-sang','After normal scrolling official Vietnam morning menu renders actual named dishes and drinks: soft-shell crab banhcanh,wonton noodles,rice dishes,desserts,eggcoffee. No prices copied.',['browser-menu-last.json'])
for i in [1,18,25,33]:
 p(i,'booking','https://datban.ggg.com.vn/','Official Golden Gate brand pages link this actual operator reservation platform. Direct retrieval confirms brand/restaurant,party,date/time chooser and customer form with contact fields and reservation policies. Exact branch locator buttons unexpectedly open Google Maps, which is not promoted as booking. This is operator-wide chooser only; select and confirm correct brand/branch and available slot. No reservation submitted.',['source-goldengate-booking-platform.txt','goldengate-booking-followup.json','browser-goldengate-hcm.json','browser-final-sources.json'])
p(9,'services','https://sushihokkaidosachi.com.vn/en/menu/','Actual official menu explicitly lists chutoro sashimi,ikura,komochi nishin sashimi,tai aranabe and other named dishes.','source-sachi.txt'.split(),'Sashimi cá ngừ, cá trích ép trứng, trứng cá hồi và các món Nhật theo thực đơn thương hiệu.','Tuna sashimi, herring roe sashimi, salmon roe and Japanese dishes from the brand menu.')
# Locator recovered; preserve the actual bounded hours gap instead of stale loading/error reason.
d=ds[q[8]['destinationId'],'hours'];d.update(outcome='unavailable-after-research',reason='Official locator successfully loaded36rows and exact DongKhoi contact, but publishes no operating-hours block. Official home, southern menu selector and actual DongKhoi menu gallery were additionally checked, plus exact branch-hours search. No verified official branch schedule found in these checked sources; third-party opening times and mall hours excluded.',remainingAction=None,boundedScope='Only listed official locator/home/menu and targeted exact branch-hours search, not global absence.');d['sources'].append({'url':'https://kingbbq.vn/lien-he/','evidenceFile':'browser-remaining.json','section':'Exact DongKhoi branch row and complete36row locator','result':'retrieved','support':'Branch address/phone present; hours absent.'});updates.append(d)
# Bind Highlands hotline/ordering to the reused exact official homepage source receipt.
for f in ['phone','services']:
 d=ds[q[7]['destinationId'],f];d['sources'].append({'evidenceFile':'../../continuation-2026-10-19-r2/research-vincom/brand1.txt','url':'https://www.highlandscoffee.com.vn/','section':'Homepage delivery hotline/order link','result':'reused official r2 retrieval','support':'Actual homepage19001755 ordering hotline and ordering channel.'});updates.append(d)
# Preserve immutable amendment files. Additional booking-followup dispositions can be appended by coordinator after review.
(P/'decisions-amendments3.json').write_text(json.dumps({'decisions':updates,'supersedes':'Matching keys only; final accessible browser follow-through.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
rr=[]
for d in updates:
 if d['outcome']=='proposal':rr.append({'mallId':d['mallId'],'destinationId':d['destinationId'],'fields':[d['proposedField']]})
(P/'records-amendments3.json').write_text(json.dumps({'records':rr},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
records=[]
for r in q:
 fields=[]
 for f in r['fields']:
  d=ds[r['destinationId'],f]
  for s in d['searches']:
   s['query']=s['query'].replace('D?ng Kh?i','Đồng Khởi').replace('di?n tho?i gi?','điện thoại giờ').replace('Vi?t Nam','Việt Nam').replace('th?c don website d?t bàn','thực đơn website đặt bàn').replace('th?c don website d?t b�n','thực đơn website đặt bàn')
  if d['outcome']=='proposal':fields.append(d['proposedField'])
 if fields:records.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'fields':fields})
assert len(ds)==sum(len(r['fields']) for r in q)==292
assert len({(r['destinationId'],f['field']) for r in records for f in r['fields']})==sum(len(r['fields']) for r in records)
(P/'records.json').write_text(json.dumps({'revision':'vincom-dining-r3-final-proposals','records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(P/'decisions.json').write_text(json.dumps({'lane':'vincom-dining','checkedAt':'2026-10-20','decisions':list(ds.values())},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
manifest={p.name:{'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in P.iterdir() if p.is_file() and p.name not in ['progress.json','source-manifest.json']}
(P/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
pr=load('progress.json');pr['outcomes']=dict(collections.Counter(d['outcome'] for d in ds.values()));pr['limitations']=['Official Facebook login/temporary blocks and403/timeouts retained as source-access holds.','Ambiguous brands, incorrect operator identities and international-market applicability remain explicit holds.','Two frozen cosmetics identities retain dining-only taxonomy holds; no category edits.','Longwang menu remains explicitly Updating; no usable menu action proposed.','Bounded negatives describe only checked official sources, never global absence.'];pr['files']={n:manifest[n] for n in ['records.json','decisions.json','records-amendments3.json','decisions-amendments3.json']};(P/'progress.json').write_text(json.dumps(pr,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(pr,ensure_ascii=False))
