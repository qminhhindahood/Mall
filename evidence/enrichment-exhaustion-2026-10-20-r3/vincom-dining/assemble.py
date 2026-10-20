import json,pathlib,re,hashlib,collections
P=pathlib.Path(__file__).resolve().parent
Q=json.loads((P/'queue.json').read_text(encoding='utf-8'))['records']
A=json.loads((P.parent/'shared-accepted-source-index.json').read_text(encoding='utf-8'))['records']
frozen={(r['destinationId'],f['field']) for r in A for f in r['fields']}
cfg={};props={};negs={};specialholds={}
def config(i,files,reason,action):cfg[i]=(files,reason,action)
def proposal(i,f,url,ev,scope='branch',vi=None,en=None,files=None):
 assert f in Q[i]['fields'];props[i,f]={'url':url,'evidence':ev,'scope':scope,'vi':vi,'en':en or vi,'files':files}
def negative(i,f,reason):negs[i,f]=reason
def hold(i,f,reason,action):specialholds[i,f]=(reason,action)
config(0,['source-pepper.txt'],'Official Vietnam homepage and real menu path return403. Branch and official-menu/contact searches identify those paths but cannot supply readable current source content.','Recover readable official Pepper Lunch Vietnam home/menu/store locator; confirm Dong Khoi row before branch phone/hours.')
config(1,['source-gogi.txt','browser-sources.json','browser-goldengate-hcm.json'],'Official site text fetch was a navigation shell; installed Chrome renders the HCM menu and Vincom Le Thanh Ton branch row at70-72LeThanhTon.','Read the exact HCM row/form; no bookings submitted.')
config(2,['source-meatmeet.txt','source-follow-meat-hoang.txt'],'Official brand homepage has menu/footer but the official Dong Khoi contact path discovered by targeted search cannot be retrieved. Corporate footer contacts conflict and are not branch substitutes.','Restore readable branch contact page or obtain branch-specific official opening-hours/reservation/service evidence.')
config(3,['source-mk.txt'],'MK official international site cannot be accessed; Vietnamese branch searches return third-party records only. Thailand-market information does not establish Vietnam franchise scope.','Identify readable official Vietnam operator/branch source; do not substitute unrelated MK branches.')
config(4,['source-hue.txt'],'The supplied brand Facebook page returns Temporarily Blocked/login shell. Official branch/store searches yield mall identity and third-party practical details, which are not promoted.','Recover public readable brand/branch Facebook information or independently verified official operator website.')
config(5,['source-hoangyen.txt','source-follow-hoang-exact.txt'],'Hoang Yen Buffet official home, actual main-course menu and contact locator read. Contact locator exposes Van Hanh Mall, not Dong Khoi; company T number is not a branch line.','Resolve current Dong Khoi branch applicability from official branch source before phone/hours or branch service claims.')
config(6,['source-morico.txt','source-follow-morico.txt'],'Morico current official menu/about/delivery pages read; delivery listing explicitly includes70-72LeThanhTon Vincom Shopping Mall. General contact is brand-wide; no branch operating-hours block found.','For branch hours recover actual official branch row; generic delivery and general contact must keep declared scope.')
config(7,['browser-sources.json'],'Official Highlands home/menu reused from r2; current official locator returns403 Cloudflare in Chrome and text tool offers empty interactive results.','Recover official branch locator data without bypassing access restrictions; delivery hotline remains brand-wide.')
proposal(1,'phone','https://gogi.com.vn/dat-ban','Chrome HCM row Gogi House Vincom Le Thanh Ton,70-72LeThanhTon:02873000917; browser-goldengate-hcm.json.','branch','02873000917')
proposal(1,'hours','https://gogi.com.vn/dat-ban','Same official HCM branch row: Open-Close09:00-22:00.','branch','09:00–22:00','09:00–22:00')
proposal(1,'menu','https://gogi.com.vn/thuc-don','Chrome renders HCM food categories and actual named combos, not navigation alone. No prices copied.','brand-wide')
proposal(1,'booking','https://gogi.com.vn/dat-ban','Official HCM restaurant list exposes a Dat ban action for Vincom Le Thanh Ton. Link to chooser, no reservation submitted.','brand-wide')
negative(1,'services','Checked official HCM menu, branch reservation locator and targeted services/contact search expose dining and reservation only; no separate named ancillary service found in these checked sources. Menu/booking are modeled separately; no inferred service facilities.')
proposal(5,'website','https://hoangyenbuffet.com/','Official Buffet mon Viet brand home and corporate footer; this is brand-wide, not evidence that Dong Khoi remains in current locator.','brand-wide')
proposal(5,'cuisine','https://hoangyenbuffet.com/','Official site identifies Buffet mon Viet, supported by actual main-course dish page.','brand-wide','Buffet món Việt','Vietnamese buffet')
proposal(5,'menu','https://hoangyenbuffet.com/menu/mon-chinh/','Official main-course page has actual named dishes, not empty menu navigation. Brand-wide only.','brand-wide')
proposal(6,'menu','https://morico.life/menu/','Official page exposes Vietnamese/English dessert menus and dining/lunch/seasonal menu image assets. No item availability or prices copied.','brand-wide')
proposal(6,'phone','https://morico.life/menu/','Official company Kamo Message us contact(+84)903667426. Brand contact only; not the Vincom branch phone.','brand-wide','+84 90 366 74 26')
proposal(6,'services','https://morico.life/delivery/','Official delivery page specifically lists70-72LeThanhTon,Vincom Shopping Mall and See Menu&Order.','branch','Đặt món giao hàng qua liên kết đặt hàng của Morico; xác nhận khu vực và khả năng phục vụ.','Delivery ordering through Morico’s linked ordering channel; confirm delivery area and availability.')
negative(6,'booking','Checked official homepage/menu/about/delivery pages and targeted reservation/services query have food-delivery ordering but no table-reservation form/action or booking policy. Delivery ordering is not dining reservation; no other obvious reservation route in checked navigation.')
hold(5,'phone','Official contact page lists company telephone and Van Hanh branch only, with no confirmed Dong Khoi number.','Obtain an official Dong Khoi branch contact; do not use company or Van Hanh number as branch phone.')
hold(5,'booking','Official contact form asks only name/email/message; it is not a table-booking form, and current locator omits Dong Khoi.','Resolve Dong Khoi branch applicability and real reservation channel; do not repurpose general contact form.')
hold(5,'services','Current official locator has no Dong Khoi branch, while branded pages concern general buffet offerings.','Confirm current branch service scope before copying delivery, group dining or other brand offerings to branch.')
proposal(7,'cuisine','https://www.highlandscoffee.com.vn/vn/san-pham.html','Reused audited r2 actual official menu categories coffee,tea,Freeze,bakery; source research-vincom/follow1.txt.','brand-wide','Cà phê, trà, đồ uống đá xay và bánh','Coffee, tea, blended drinks and bakery items',files=['../../continuation-2026-10-19-r2/research-vincom/follow1.txt'])
proposal(7,'phone','https://www.highlandscoffee.com.vn/','Official brand homepage title explicitly advertises delivery hotline19001755. Brand-wide ordering hotline, not branch phone.','brand-wide','19001755')
proposal(7,'services','https://www.highlandscoffee.com.vn/','Official homepage links DAT HANG to order.highlandscoffee.com.vn and advertises delivery; general brand service only.','brand-wide','Đặt món qua kênh giao hàng của Highlands; xác nhận địa chỉ và phạm vi giao hàng.','Order through Highlands’ delivery channel; confirm address and delivery coverage.')
hold(7,'booking','Official home/menu/navigation has ordering, not reservation; branch locator is403 in Chrome, so local reservation policy cannot be checked.','Recover official branch details and check reservation policy; do not relabel delivery ordering as booking.')
def sources(files):
 out=[]
 for file in files:
  p=P/file
  if not p.exists():continue
  if file.endswith('.json'):out.append({'evidenceFile':file,'section':'saved browser text, links and inputs','result':'browser-retrieved; inspect per-row status/error','support':'Exact body text retained'});continue
  text=p.read_text(encoding='utf-8')
  for part in text.split('--------------------------------------------------------------------------------'):
   urls=re.findall(r'https?://[^\s)"<>]+',part)
   if not urls:continue
   ref=re.search(r'\ue202([^\ue201]+)\ue201',part)
   out.append({'url':urls[0],'evidenceFile':file,'reference':ref[1] if ref else None,'section':'source response / referenced branch or field section','result':'retrieval-blocked' if part.strip().startswith('Internal Error') else 'retrieved','support':part.strip()[:170]})
 return out
def build(start,end,label):
 decisions=[];records=[]
 for i in range(start,end):
  r=Q[i];files,reason,action=cfg[i];ff=[]
  queries=[{'query':f'"{r["name"]["en"]}" "Vincom" "Đồng Khởi" điện thoại giờ menu','evidenceFile':f'search-{i//2+1:02}.txt','result':'Full returned results retained; nonofficial sources used only as leads.'},{'query':f'"{r["name"]["en"]}" Việt Nam official thực đơn website đặt bàn','evidenceFile':f'search-{i//2+1:02}.txt','result':'Official paths fetched where identified; unrelated brands/markets excluded.'},{'query':f'"{r["name"]["en"]}" Vietnam official contact telephone opening hours reservation services Vincom Dong Khoi','evidenceFile':f'field-search-{i//8+1}.txt','result':'Exact field/branch source results retained.'}]
  accepted=next((x for x in A if x['destinationId']==r['destinationId']),None)
  common={'mallId':r['mallId'],'destinationId':r['destinationId'],'checkedAt':'2026-10-20','searches':queries,'sources':sources(files),'acceptedSourceReuse':[{'field':f['field'],'sourceUrl':f['sourceUrl'],'receipt':'../shared-accepted-source-index.json'} for f in accepted['fields']] if accepted else []}
  for f in r['fields']:
   assert (r['destinationId'],f) not in frozen
   d=dict(common,field=f,reason=reason,remainingAction=action)
   if (i,f) in props:
    v=props[i,f];field={'field':f,'state':'newly-sourced-proposal','sourceUrl':v['url'],'evidence':v['evidence'],'checkedAt':'2026-10-20','applicability':v['scope'],'verification':'source-checked','approval':'provisional','uncertainty':{'vi':'Thông tin thương hiệu; xác nhận khả năng phục vụ, giá và thông tin hiện tại với chi nhánh.' if v['scope']=='brand-wide' else 'Thông tin từ nguồn chính thức; vui lòng xác nhận thông tin hiện tại trước khi ghé.','en':'Brand-wide information; confirm availability, prices and current details with the branch.' if v['scope']=='brand-wide' else 'Information from the checked official source; confirm current details before visiting.'}}
    if v['scope']=='branch':field['branchMallId']='vincom-dong-khoi'
    if v['vi'] is None:field['url']=v['url']
    else:field['value']={'vi':v['vi'],'en':v['en']}
    if v['files']:d['sources']=sources(v['files'])
    ff.append(field);d.update(outcome='proposal',proposedField=field,reason=v['evidence'],remainingAction=None)
   elif (i,f) in negs:d.update(outcome='unavailable-after-research',reason=negs[i,f],boundedScope='Only the listed official pages/sections and targeted searches; not global absence.',remainingAction=None)
   else:
    d['outcome']='hold'
    if (i,f) in specialholds:d['reason'],d['remainingAction']=specialholds[i,f]
   decisions.append(d)
  if ff:records.append({'mallId':r['mallId'],'destinationId':r['destinationId'],'fields':ff})
 (P/f'records-{label}.json').write_text(json.dumps({'revision':'vincom-dining-r3-'+label,'records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (P/f'decisions-{label}.json').write_text(json.dumps({'lane':'vincom-dining','range':[start,end],'decisions':decisions},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'chunk':label,'fields':len(decisions),'outcomes':dict(collections.Counter(d['outcome'] for d in decisions)),'hashes':{f:hashlib.sha256((P/f).read_bytes()).hexdigest() for f in [f'records-{label}.json',f'decisions-{label}.json']}}))
if __name__=='__main__':build(0,8,'chunk1')
