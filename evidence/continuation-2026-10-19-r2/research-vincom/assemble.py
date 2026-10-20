import json,re,unicodedata,pathlib,collections
ROOT=pathlib.Path(__file__).resolve().parent
BASE=ROOT.parents[2]
ledger=json.loads((BASE/'evidence/combined-local-2026-10-19-r1/coverage-ledger.json').read_text(encoding='utf-8'))['records']
roster=[r for r in ledger if r['mallId']=='vincom-dong-khoi']
def norm(s):
 return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',s.lower().replace('đ','d')).encode('ascii','ignore').decode())
aliases={'somtumthai':'somthai','congcafe':'cafecong','dookki':'dookkidookki','christiandior':'dior','makeupforever':'makeupforever','thegioikimcuong':'tgkcthegioikimcuong','thegioinuochoa':'tgnhthegioinuochoa','vangtuyetkieu':'tuyetkieu','cledepeau':'cledepeaubeaute','viinriicniche':'viinriicnicheperfume','lukfookjewelry':'lukfookjewellery'}
byname={norm(r['name']['en']):r for r in roster}
byid={r['destinationId'].replace('vincom-prototype-',''):r for r in roster}
def match(name):
 n=norm(name);return byname.get(n) or byid.get(aliases.get(n,n))
index={}
for file in ['directory.txt','directory-complete.txt']:
 for m in re.finditer(r'###### .*?\ue202(\d+)†([^†\ue201]+)\ue201', (ROOT/file).read_text(encoding='utf-8')):
  i,name=m.groups();index[int(i)]=name
attempts=[]
for path in sorted(ROOT.glob('batch*.txt')):
 for part in path.read_text(encoding='utf-8').split('--------------------------------------------------------------------------------'):
  m=re.search(r'Source: click\(.*?"id":(\d+)',part)
  if not m:continue
  i=int(m[1]);head=part.strip().splitlines()[0];url=re.search(r'\((https://[^)]+)\)',head)
  attempts.append({'indexLinkId':i,'name':index.get(i),'url':url[1] if url else None,'outcome':'retrieved' if url else 'fetch-error','evidenceFile':path.name,'webReference':(re.search(r'\ue202([^\ue201]+)\ue201',part) or ['',''])[1]})
records={};decisions=[]
unc={'vi':'Thông tin theo nguồn chính thức đã kiểm tra; vui lòng xác nhận thông tin hiện tại trước khi ghé.','en':'Information from the checked official source; confirm current details before visiting.'}
brandunc={'vi':'Thông tin chung của thương hiệu; vui lòng xác nhận sản phẩm, giá và tình trạng phục vụ tại chi nhánh.','en':'Brand-wide information; confirm products, prices and availability with the branch.'}
existing=json.loads((BASE/'src/data/enrichment-accepted.json').read_text(encoding='utf-8'))['records']
frozen={(r['destinationId'],f['field']) for r in existing for f in r['fields']}
def add(r,field,url,evidence,scope='branch',value=None,source=None):
 if (r['destinationId'],field) in frozen:return
 rec=records.setdefault(r['destinationId'],{'mallId':'vincom-dong-khoi','destinationId':r['destinationId'],'fields':[]})
 if any(x['field']==field for x in rec['fields']):return
 f={'field':field,'state':'verified-agent','sourceUrl':source or url,'evidence':evidence,'checkedAt':'2026-10-19','applicability':scope,'verification':'source-checked','approval':'agent-accepted','uncertainty':unc if scope=='branch' else brandunc,'reviewedBy':'Codex delegated Vincom research reviewer','reviewedAt':'2026-10-19'}
 if scope=='branch':f['branchMallId']='vincom-dong-khoi'
 if value is None:f['url']=url
 else:f['value']=value
 rec['fields'].append(f)
 decisions.append({'destinationId':r['destinationId'],'field':field,'decision':'accepted','sourceUrl':f['sourceUrl'],'applicability':scope,'reason':evidence})
for a in attempts:
 r=match(a['name'] or '')
 a['destinationId']=r['destinationId'] if r else None
 if r and a['outcome']=='retrieved':
  add(r,'website',a['url'],'Official mall branch-detail page reached through the current Dong Khoi directory link; title identifies this branch. Link only; no floor, occupancy freshness, phone, hours, policies or prices promoted.')
def write(name,obj): (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write('directory-attempts.json',attempts)
write('directory-reconciliation.json',[{'destinationId':r['destinationId'],'name':r['name'],'indexMatches':[a for a in attempts if a['destinationId']==r['destinationId']],'status':'matched-current-index' if any(a['destinationId']==r['destinationId'] for a in attempts) else 'absent-or-unresolved-in-current-index','interpretation':'No roster, occupancy or location mutation; absent does not mean closed.'} for r in roster])
write('enrichment-records.json',{'revision':'vincom-continuation-2026-10-19-r2','records':list(records.values())})
write('decisions.json',{'checkedAt':'2026-10-19','decisions':decisions,'attempts':attempts})
print(json.dumps({'attempts':len(attempts),'indexNames':len(index),'retrieved':sum(a['outcome']=='retrieved' for a in attempts),'matched':sum(a['destinationId'] is not None for a in attempts),'records':len(records),'fields':len(decisions),'unmatched':[(a['indexLinkId'],a['name']) for a in attempts if not a['destinationId']],'failed':[{'id':a['indexLinkId'],'name':a['name']} for a in attempts if a['outcome']=='fetch-error']},ensure_ascii=True))
retrymeta=json.loads((ROOT/'retryurls.json').read_text(encoding='utf-8'))
byretry={x['url']:x for x in retrymeta}
for path in sorted(ROOT.glob('retry*.txt')):
 for part in path.read_text(encoding='utf-8').split('--------------------------------------------------------------------------------'):
  m=re.search(r'Source: open\(.*?"ref_id":"([^"]+)"',part)
  if not m or m[1] not in byretry:continue
  a=dict(byretry[m[1]]);a.update(url=m[1],evidenceFile=path.name,outcome='retrieved' if not part.strip().startswith('Internal Error') else 'fetch-error')
  r=match(a['name'] or '');a['destinationId']=r['destinationId'] if r else None;attempts.append(a)
  if r and a['outcome']=='retrieved':add(r,'website',a['url'],'Official mall branch-detail page retrieved at canonical URL after the directory link failed. Branch title checked; link only, without promoting location or generic policies.')
brandmeta=json.loads((ROOT/'brandurls.json').read_text(encoding='utf-8'))
bybrand={x['url']:x for x in brandmeta}
catalogids=set('giordano himalaya matsumotokiyoshi charleskeith gigi primaart lyn ecco pedro havaianas adidasoriginals dyson lancome zara massimodutti innisfree tgnhthegioinuochoa shiseido pandora swarovski hm longines'.split())
brandattempts=[]
for path in sorted(ROOT.glob('brand[123].txt')):
 for part in path.read_text(encoding='utf-8').split('--------------------------------------------------------------------------------'):
  m=re.search(r'Source: open\(.*?"ref_id":"([^"]+)"',part)
  if not m or m[1] not in bybrand:continue
  b=bybrand[m[1]];r=next(x for x in roster if x['destinationId']==b['id']);ok=not part.strip().startswith('Internal Error');lines=int((re.search(r'Total lines: (\d+)',part) or ['','0'])[1]);final=(re.search(r'Redirected to URL: ([^;]+);',part) or ['',''])[1] or m[1]
  brandattempts.append({'destinationId':b['id'],'sourceUrl':m[1],'finalUrl':final,'outcome':'retrieved' if ok else 'fetch-error','textLines':lines,'evidenceFile':path.name,'scope':'brand-wide'})
  if ok and r['destinationId'].replace('vincom-prototype-','') in catalogids:
   add(r,'catalog',final,'Existing approved directory official brand URL freshly retrieved; official site title and product/category presentation provide a general catalog. No local stock, prices, delivery or branch services asserted. Evidence: '+path.name,'brand-wide',source=m[1])
def special(id,field,url,evidence,scope='branch',vi=None,en=None):
 r=next(x for x in roster if x['destinationId']==id)
 add(r,field,url,evidence,scope,{'vi':vi,'en':en or vi} if vi else None)
prefix='vincom-prototype-'
tz='https://www.timezonegames.com/en-vn/venues/hcm-city/vincom-dong-khoi/'
special(prefix+'timezone','website',tz,'Direct official venue page identifies Dong Khoi; replaces held generic mall introduction. initial.txt lines46-68.')
special(prefix+'timezone','phone',tz,'Venue-specific Enquiries number from official Dong Khoi page. initial.txt lines64-68.',vi='+84 28 7300 0972')
special(prefix+'timezone','hours',tz,'Official venue heading opening-hours block; daily 10:00-22:00. Ignore mismatched Ha Dong FAQ on VI page.',vi='Thứ Hai–Chủ Nhật: 10:00–22:00',en='Monday–Sunday: 10:00–22:00')
wt='https://www.watsons.vn/en/store/WTCVN_S0005_EN'
special(prefix+'watsons','phone',wt,'Dong Khoi store-hours/contact block prints +84-0971088853; preserve source form instead of silently repairing country/trunk prefix. follow2.txt lines49-61.',vi='+84-0971088853')
special(prefix+'watsons','hours',wt,'All seven days in the Dong Khoi locator show10AM-10PM; public-holiday exceptions stated. follow2.txt lines63-89,130.',vi='Hằng ngày: 10:00–22:00; ngày lễ có thể thay đổi.',en='Daily: 10:00–22:00; public-holiday hours may vary.')
special(prefix+'watsons','services',wt,'Branch services block lists Click & Collect, Chat & Shop and member benefits. follow2.txt lines122-130.',vi='Nhận hàng tại cửa hàng (Click & Collect), Chat & Shop và ưu đãi thành viên.',en='Click & Collect, Chat & Shop and member benefits.')
for id,url,phone in [('somthai','https://somtumthai.com.vn/en/location/?current=Vincom+Center+Dong+Khoi','028 3620 1155'),('bastahiro','https://bastahiro.com.vn/en/location/?current=Vincom+Center+Dong+Khoi','028 3822 6999'),('wraproll','https://wrap-roll.com/','(028) 3993 9015')]:
 special(prefix+id,'phone',url,'Official branch block names Dong Khoi and prints this number. Som Thai also lists02836201100; primary first number retained. follow1.txt/follow2.txt.',vi=phone)
 special(prefix+id,'hours',url,'Official Dong Khoi block; no mall-default hours inferred. follow1.txt/follow2.txt.',vi='10:00–22:00' if id=='wraproll' else '10:30–22:00; gọi món cuối lúc 21:30.',en='10:00–22:00' if id=='wraproll' else '10:30–22:00; last order at21:30.')
for id,url in [('highlandscoffee','https://www.highlandscoffee.com.vn/vn/san-pham.html'),('wraproll','https://wrap-roll.com/thuc-don/thuc-don-nha-hang'),('cafecong','https://congcaphe.com/thucdon'),('chillithai','https://www.chillthai.vn/')]:
 special(prefix+id,'menu',url,'Official brand menu/category presentation retrieved (follow1.txt/follow2.txt; ChillThai home has MENU CHILLTHAI and menu images). Branch availability and prices not asserted.','brand-wide')
special(prefix+'crocs','catalog','https://www.crocs.com.vn/','Freshly retrieved authorized Vietnam distributor catalog. Footer identifies GTF as authorized Crocs distributor; national assortment only. heldfollow.txt.','brand-wide')
special('vincom-candidate-vd-b2-003','website','https://www.ovs.it/it/it/','Original /en/ remains inaccessible; checked actual Italian official OVS homepage instead. International brand-wide information only, no Vietnam branch claim. heldfollow.txt.','brand-wide')
special('vincom-candidate-vd-b2-003','catalog','https://www.ovs.it/it/it/c/uomo/','Official OVS mens collection retrieved; Italian-language international catalog, no local products/prices asserted. follow2.txt.','brand-wide')
special(prefix+'dyson','services','https://www.dyson.vn/en-VN/store','Official Vietnam store-finder describes expert demos/advice above national store list. Kept brand-wide because individual Dong Khoi services not separately enumerated. initial.txt lines89-106.','brand-wide',vi='Trải nghiệm sản phẩm và tư vấn từ chuyên gia theo thông tin chung của Dyson Store; xác nhận dịch vụ tại chi nhánh.',en='Product demonstrations and expert advice described for Dyson Store generally; confirm branch services.')
special(prefix+'cgv','programme','https://www.cgv.vn/en/cinox/site/cgv-vincom-dong-khoi/','HOLD PLACEHOLDER') if False else None
# CGV direct programme/contacts time out; indexed official text is a discovery lead, not an accepted direct action or branch phone.
holds=[{'destinationId':prefix+'cgv','field':f,'decision':'hold','reason':'Official indexed branch page shows hotline19006017 and film listings; direct EN/VI branch and contacts URLs repeatedly failed/time out. Branch-direct phone not established; programme action usability unresolved. No fallback to mall phone.','attemptedUrls':['https://www.cgv.vn/en/cinox/site/cgv-vincom-dong-khoi','https://www.cgv.vn/en/cinox/site/cgv-vincom-dong-khoi/','https://www.cgv.vn/default/cinox/site/cgv-vincom-dong-khoi/','https://www.cgv.vn/default/contacts/'],'evidenceFiles':['initial.txt','directory.txt','heldfollow.txt']} for f in ['phone','programme']]
acceptedkeys={(r['destinationId'],f['field']) for r in records.values() for f in r['fields']}
remainder=[{'destinationId':r['destinationId'],'name':r['name'],'field':field,'state':data['state'],'reason':'Not resolved by this pass. A directory/homepage retrieval does not exhaust all field-specific official sources.'} for r in roster for field,data in r['fields'].items() if data['state'] in ['unresearched','evidence-conflict-hold'] and (r['destinationId'],field) not in acceptedkeys]
write('directory-attempts.json',attempts)
write('brand-attempts.json',brandattempts)
write('enrichment-records.json',{'revision':'vincom-continuation-2026-10-19-r2','records':list(records.values())})
write('decisions.json',{'checkedAt':'2026-10-19','reviewer':'Codex delegated Vincom research reviewer','accepted':decisions,'hold':holds,'unavailable':[],'attempts':attempts,'brandAttempts':brandattempts,'unresearchedRemainder':remainder,'limits':['No roster, floor, identity, description, geometry, media, source, tracker or runtime changes.','No field labeled bounded unavailable: source failures and uninspected field paths remain unresolved.','Seven index names do not map to unchanged roster; no new listings created.','Six support/warehouse entries appear in index but are outside retail directory enrichment.']})
write('summary.json',{'rosterReconciled':len(roster),'retailIndexLinksAttempted':147,'directoryAttemptsIncludingRetries':len(attempts),'directoryRetrievedResponses':sum(a['outcome']=='retrieved' for a in attempts),'brandURLsAttempted':len(brandattempts),'acceptedRecords':len(records),'acceptedFields':sum(len(r['fields']) for r in records.values()),'fieldsByKind':dict(collections.Counter(f['field'] for r in records.values() for f in r['fields'])),'remainingFieldTasks':len(remainder),'holds':len(holds),'boundedUnavailable':0})
print((ROOT/'summary.json').read_text(encoding='utf-8'))
