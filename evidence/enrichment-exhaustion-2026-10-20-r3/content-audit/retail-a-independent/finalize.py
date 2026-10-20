import pathlib,json,hashlib,copy,collections,re,os
P=pathlib.Path(__file__).parent; R=P.parents[1]; L=R/'vincom-retail-a'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(x):return x['mallId'],x['destinationId'],x['field']
assert sha(L/'records.json')=='83958a01806ffc93aad47fddb284b9f018fb028d6267511f49b78f7901c740fe'
assert sha(L/'decisions.json')=='237d0b3066982f8bec43036b5bc411809e9251838588086d7c3dc56c566aa253'
prior=read(R/'content-audit/reviewed-chunks/vincom-retail-a-01.json')['decisions']; ex={key(d)for d in prior}
ds=[d for d in read(L/'decisions.json')['decisions'] if key(d)not in ex]
groups=collections.defaultdict(list)
for d in ds:groups[d['destinationId']].append(d)
# Explicit manual decisions after reading every proposed value and bound source body.
# Each row corresponds to the stable 70-entity review matrix in inspect.py.
rows=[
('website phone catalog services','Aqua Mineral identity matches frozen accepted description; actual MilenSea skincare and haircare cards. General operator contact is explicitly scoped.'),
('website services','Actual official PUMA Vietnam footwear, clothing and accessories categories retrieved. Dynamic locator does not expose branch phone/hours or actual catalogue listing.'),
('','Watch Me exact operator remains unresolved; similarly named watch businesses cannot be substituted.'),
('','Planet Sports exact Vietnamese branch/operator authority remains unresolved.'),
('','Official Vincom Sky Optic brand profile describes German ophthalmic equipment for clinics, conflicting with retail-counter identity; no eyewear or medical-service inference.'),
('website catalog services','Actual international EUR watch collections Quadro Mini, Pathfinder and Classic, plus official mall profile confirming Daniel Wellington identity. International range only.'),
('','The North Face official site access and exact mall brand profile retrieval blocked; no current branch practical or actual offering body retrieved.'),
('website phone catalog services','Actual Shooz official body has priced Jefferson Wanderfoam Block and Jefferson footwear cards. National hotline 1900636641; other-centre hours excluded.'),
('website phone catalog services','Actual CLJ official Dong Khoi B1-60D branch phone 0938244179; CLJ22133 and CLJ96143 jewellery cards prove catalogue role.'),
('website phone catalog services','Actual Pantio dresses, blazer BAV93615 and BDC93849 and menswear cards. General CSKH 1900988903 verified. Official relocation notice prevents assuming old branch hours.'),
('catalog services','Actual GNC US Beyond Raw LIT V2 pre-workout cards and supplements; US range caveat required. Fertilizer company GNC.com.vn excluded.'),
('website phone services','Gintell brand massage-chair offering and general hotline 0932988080 verified; hero/model images alone do not establish usable catalogue body.'),
('website phone catalog services','Actual Albetta priced rompers and dresses, babywear and handcrafted toys; official operator office contact 0913732020 is general, not a branch line.'),
('website phone hours services','Rabity exact Vincom Dong Khoi B2-15A block supplies phone 0327987022 and 10:00–22:00. Homepage collection hero/navigation does not prove catalogue listing.'),
('website phone catalog services','Actual Phuong Nam Disney Cinderella Tiny Book and Tales of Arabian Nights cards; general support 19006656. Dong Nai Dong Khoi store is not this branch.'),
('website phone catalog services','Actual AMM priced childrens cat-print clothes, mens Henley and linen dress cards; general official contact 0862020988.'),
('','Sam Geumsang exact operator unresolved; Geumsan, GEUMSAM and KUMSAM are not established identity matches.'),
('','Paris & France exact retailer identity unresolved; name and fashion classification cannot establish products or contacts.'),
('','Guerlain country site/branch retrieval inaccessible; no exact Dong Khoi practical body retrieved and other counters excluded.'),
('','The Kooples official commercial site denied and mall brand profile inaccessible; precise retrieval hold, not absence.'),
('website catalog services','Official Weekend Max Mara Vietnam identity and Pasticcino bags established; US actual Go-To Bags, coats, matching sets and knitwear collection directory provides foreign-market catalogue fallback.'),
('website catalog services','Actual Geox international Climasandal and Fast In collection body and footwear/clothing summary; adult jackets and childrens shoes distinguished.'),
('phone hours services','Actual Adidas Originals exact B1-56 locator provides phone as printed and daily 09:30–22:00. Same-brand accepted Vietnam catalogue supports goods; no branch inventory inference.'),
('phone catalog services','Actual An Phuoc category body with 154 priced shirts; hotline 1800888618 general brand support, not branch hours.'),
('phone hours catalog services','Actual BBW exact Vincom Dong Khoi branch page gives 10:00–22:00; hotline 1800576972 is general. Mist Magic In Air and Snowflakes Cashmere candle cards prove range/catalogue.'),
('catalog services','Actual Bobbi Brown US Vitamin Enriched Face Base Primer Duo and Lip Oil Serum product cards; explicit US-market caveat retained.'),
('','CGV exact branch body inaccessible in EN/VI and official mall brand family; frozen description alone cannot establish current services/hours.'),
('catalog services','Actual Clarins US Double Serum Eye and Total Eye Lift cards; offering restricted to evidenced eye-care range with US caveat.'),
('website catalog services','Actual COBRA KING TEC mini driver and KING irons body; COBRA golf-equipment subset explicitly scoped, not unsupported Puma range.'),
('phone catalog services','Actual ACFC exact Cotton On Dong Khoi B1-B31.32 phone 02873014799. Actual womens All Day Crew Tee, Jackson Utility Pant and Rubi slides; goods narrowed to evidenced womens clothes/footwear.'),
('services','Actual official Crocs clogs, sandals, slides and Jibbitz offering plus accepted same-brand catalogue authority; no dynamic locator contact inference.'),
('','Dyson official store list identifies branch but dynamic body does not supply usable branch phone/hours; exact practical retrieval hold.'),
('','Escentric Signature exact operator/brand applicability unproven; AH Perfumes cannot be conflated without identity binding.'),
('website phone catalog services','Actual Face Wash Fox Deep Cleanse, Cryo, Lumiglow, Gymming and Eye-revive duration/price offerings. General hotline 0889866666; no efficacy claim.'),
('website phone hours catalog services','Actual Fred Perry exact branch locator gives +84902645408 and daily 10:00–22:00; US M12 polo actual product body and related accessories, international caveat.'),
('phone services','Actual GiGi Maison national 1900252538 support; explicit womens tops/dresses/skirts/trousers categories. Common dummy tank cart is not catalogue evidence.'),
('website phone services','Official mall Guess profile is a usable information action and describes denim/clothing/accessories. Exact branch promotional phone 02873039599 retains historical-source caveat.'),
('phone services','Actual Maison exact Havaianas B1-28A branch phone 02871056979. Official mall brand body names flipflop/footwear collections; no stock inference.'),
('hours services','Actual H&M exact branch hours weekdays10–22/weekends09:30–22 and accepted Vietnam catalogue identity/range. No shared mall-hours inference.'),
('services','Actual Innisfree Green Tea Seed Serum, creams and cleanser body and official mall brand profile corroborate skincare offerings.'),
('website catalog services','Actual Karl Lagerfeld Netherlands/EUR White Shirts A Karl Classic collection and priced quickshop cards. Explicit international-market caveat.'),
('phone catalog services','Lacoste official Vietnam phone block shows 0822086860 below Hotline dash; general customer support, not branch line. Actual mens-polo category description and 372 results establish catalogue subset.'),
('catalog services','Actual mall Levi’s denim/clothing offering; official US body includes Puffer Collection, Cord Shop and Low Straight shopping collections beyond navigation. US catalogue caveat.'),
('phone catalog services','Actual Long Beach Pearl Heritage earrings, bracelet and pendant cards; national hotline 1900277299. Office hours excluded as branch schedule.'),
('services','Actual Lukfook specific gold/platinum and gem-set ring categories establish international goods. News plus global navigation alone does not prove catalogue body.'),
('services','Actual LYN Vietnam Viktoria Mini Handbag, Ivar Shoulder Bag and Bethany S Crossbody product cards with prices.'),
('website catalog services','Actual Make Up For Ever US Artist Color Glow Lip Balm, Color Pencil and Pure Color eyeshadow priced product cards; US market caveat.'),
('services','Actual Matsukiyo INJESK serum, MQURE and ARGELAN haircare/personal-care cards, with Vietnam general-range scope.'),
('hours catalog services','Actual Messyweekend exact branch locator distinguishes weekday/weekend hours. NUMA Clay Deep Brown and YORI Dark Havana priced glasses prove Danish/international catalogue.'),
('phone catalog services','Correct official MLB Vietnam Maison-distributed domain retrieved. National 1900299268 support; actual Bigball Chunky category body describes variants and priced listing. Catalogue explicitly limited to sneaker subset.'),
('services','Actual official mall NARS profile describes Orgasm blush, bronzer and lip/eye makeup. Vietnam commercial catalogue access remains held.'),
('phone catalog services','Actual ACFC Nike B1-55 phone02873028399, distinct from Nike Rise. Actual Nike VN Caitlin 1 Midnight Fever, Tatum 5 Sunrise and Pegasus Plus cards.'),
('catalog services','Same-brand independently accepted Vietnam OWNDAYS catalogue reused with original checked date19. Actual mall brand body establishes frames and lenses; goods narrowed accordingly.'),
('website catalog services','Actual Passiflores Montblanc Legend Blue EDP, Gucci Bloom and Narciso Musc Nude cards establish perfume/beauty catalogue and range.'),
('website phone services','Actual PHOTO TIME self-photo Color/Banbe rooms and official footer general contact0369357270. Franchise enquiry numbers excluded; PhotoObjet/Koala programmes not conflated.'),
('phone services','Actual official July–August2026 Polo branch promotion supplies M04/M05 phone02873001948 and linen/knitwear/sweater offering; dated-source uncertainty retained.'),
('phone catalog services','Actual Pucini PCN2350/6585/6566 bags and 6561 backpack cards; 0868887095 is shared e-commerce/general contact, not branch-only.'),
('phone catalog services','Actual Samsonite exact B2-55 branch phone02835354636 and Modio, Quanthom, Zipprix and Sammies Dreams luggage cards.'),
('','Seha Accessories exact identity/operator unresolved; fashion classification/name alone cannot support goods, catalogue or practical details.'),
('services','Actual Sony Vietnam televisions, audio/headphones, cameras and Alpha7RVI/WHCH730N offering; dynamic branch locator does not expose practical values.'),
('phone hours catalog services','Actual Sulwhasoo exact spa reservation block phone02862724574 and10:00–21:30; actual Vietnam First Care serum/Ginseng cream plus spa treatments, with source bindings for both.'),
('','TGKC official commercial root502 and targeted ring-category retrieval failed; official mall brand profile unavailable. Exact retrieval hold, not absence; Saigon-specific extension not copied.'),
('catalog services','Actual official mall Body Shop head-to-toe cosmetics; actual UK priced Ginger Shampoo, Hemp Hand Protector and Vitamin E Cream product cards provide foreign catalogue fallback.'),
('programme services','Actual Timezone branch game listing names Asphalt9LegendsDX, VRParaglider, CombatHeroes and RabbidsVRBigRide. Programme action is games listing, not invented event calendar.'),
('services','Actual Tutto Piccolo baby/children clothing categories establish international range; navigation and generic marketing alone do not prove usable actual catalogue listing.'),
('phone services','Actual Urban Revivo Maison national hotline1900252538 and specific clothing/footwear/bags categories. Dynamic empty sections and duplicated sample tank do not prove catalogue role.'),
('','Victoria’s Secret exact store indexed name is insufficient: actual commercial page returned market/error content, exact mall page and both brand slugs inaccessible. Identity/action retrieval hold.'),
('phone catalog services','Actual Vincy sales/complaints general phone0909411449; BSD/BST short sets priced product cards. Sales hotline hours excluded as branch schedule.'),
('phone hours catalog services','Actual Wilson exact B1-51 phone+84919730267 and MonThu10–22/FriSun09:30–22. Main category directory has tennis81, bags74 and actual LaverCup2026 collection, beyond dummy quickview.'),
('catalog services','Actual YSL Beauty US Holiday Advent Calendar, Libre Gift Set and Loveshine Gift Set priced cards despite partial outage. Beauty identity, US market and outage caveats retained.')]
assert len(rows)==len(groups)==70
reviewer='Codex independent content auditor (AI)'
used={L/'records.json',L/'decisions.json',L/'amendment-03-identity-offerings.json',R/'content-audit/reviewed-chunks/vincom-retail-a-01.json'}
def bind(file,ref,url=None,support=None):
 p=(R/file).resolve();assert p.is_file(),p;used.add(p)
 b={'file':os.path.relpath(p,R).replace('\\','/'),'reference':ref}
 if url:b['url']=url
 if support:b['support']=support
 return b
def fresh(n,ref,url=None):return bind('content-audit/retail-a-independent/fresh-%03d.txt'%n,ref,url)
def fieldbase(d,url):
 return {'field':d['field'],'state':'verified-agent','sourceUrl':url,'checkedAt':'2026-10-20','applicability':'brand-wide','verification':'source-checked','approval':'agent-accepted','reviewedBy':reviewer,'reviewedAt':'2026-10-20','evidence':'Independent source-body review; see immutable audit evidenceBindings.','uncertainty':{'vi':'Thông tin chung của thương hiệu; xác nhận sản phẩm, giá và tình trạng phục vụ tại chi nhánh.','en':'Brand-wide information; confirm products, prices and availability with the branch.'}}
def phone(d,url,num):
 f=fieldbase(d,url);f['value']={'vi':num,'en':num};f['uncertainty']={'vi':'Liên hệ hỗ trợ chung của thương hiệu/nhà phân phối tại Việt Nam; không phải số riêng của chi nhánh Vincom Đồng Khởi.','en':'General Vietnam brand/distributor support contact; not a dedicated Vincom Dong Khoi branch line.'};return f
def catalog(d,url,market=None,subset=None):
 f=fieldbase(d,url);f['url']=url
 if market:f['uncertainty']={'vi':f'Danh mục {market} của thương hiệu; sản phẩm, giá và giao hàng có thể khác tại Việt Nam. Xác nhận tồn kho với chi nhánh.','en':f'Brand catalogue for {market}; products, prices and shipping may differ in Vietnam. Confirm branch stock.'}
 if subset:
  f['uncertainty']['vi']+=' Chỉ liên kết một phần danh mục: '+subset+'.'
  f['uncertainty']['en']+=' Linked catalogue subset: '+subset+'.'
 return f
out=[]
for i,(identity,arr)in enumerate(groups.items()):
 allowed,note=rows[i];allowed=set(allowed.split())
 for d in arr:
  fkey=d['field'];bs=[]
  for s in d.get('sources',[]):
   if s.get('evidenceFile'):
    b=bind(os.path.relpath((L/s['evidenceFile']).resolve(),R),s.get('reference')or 'Exact same-brand accepted source entry',s.get('url'),s.get('support'));bs.append(b)
  if not bs:
   bs=[bind('vincom-retail-a/decisions.json',identity+'/'+fkey+' exact attempts')]
  # Full source-family pass: actual preserved requests and responses, never name/category inference.
  for p in sorted(P.glob('fresh-*.txt')):
   t=p.read_text(encoding='utf8')
   targets=read(P/'brand-targets.json'); urls=[x['url']for x in targets if x['id']==identity]
   extra={2:['/brand/watch-me'],3:['/brand/planet-sports'],4:['/brand/sky-optic'],6:['/brand/the-north-face'],16:['/brand/sam-geumsang'],17:['/brand/paris-france'],18:['/brand/guerlain'],19:['/brand/the-kooples'],26:['/brand/cgv'],32:['/brand/escentric-signature'],58:['/brand/seha-accessories'],61:['/brand/the-gioi-kim-cuong'],66:['/brand/victorias-secret','/brand/victoria-secret']}.get(i,[])
   hits=[u for u in urls+extra if u in t]
   if hits:bs.append(bind(str(p.relative_to(R)),'Official brand-profile request/actual response: '+', '.join(hits)))
  a={'mallId':d['mallId'],'destinationId':identity,'field':fkey,'reviewedBy':reviewer,'reviewedAt':'2026-10-20','reason':note+' Field review: '+d['reason'],'evidenceBindings':bs}
  if fkey not in allowed:
   a['auditDecision']='hold';a['remainingAction']=d.get('remainingAction')or 'Retrieve an actual official '+fkey+' body or collection/category listing for this exact identity and applicable market; rendered public official content or public payload required. Do not infer from navigation, hero or dummy cart.'
   if d.get('proposedField'):a['originalProposal']=d['proposedField'];a['reason']+=' Independent rejection: available body does not demonstrate the proposed action role beyond navigation/hero/dynamic placeholder.'
   if i==4:a['remainingAction']='Resolve exact Sky Optic retail operator against official Vincom profile describing German clinical equipment; then retrieve applicable retail offerings/contact.'
   out.append(a);continue
  f=copy.deepcopy(d.get('proposedField'))
  if f is None:f=fieldbase(d,d['sources'][0]['url'])
  if i==7:
   bs.append(fresh(1,'turn843view0','https://shooz.vn/'))
   if fkey=='catalog':f=catalog(d,'https://shooz.vn/')
  if i==9:bs.append(fresh(1,'turn843view1','https://www.pantio.vn/'))
  if i==12:bs.append(fresh(1,'turn843view2','https://albettaretail.vn/'))
  if i==1:bs.append(fresh(1,'turn843view3'))
  if i in[20,21,42,62]and fkey=='catalog':
   n,ref,url,market={20:('062','turn596view1','https://us.weekendmaxmara.com/','United States'),21:('058','turn589view0','https://www.geox.com/int/','international market'),42:('065','turn615view1','https://www.levi.com/US/en_US/','United States'),62:('060','turn594view3','https://www.thebodyshop.com/en-gb/','United Kingdom')}[i]
   bs.append(bind('saigon-retail/source-'+n+'.txt',ref,url));f=catalog(d,url,market)
  if i==21 and fkey=='services':
   f['value']={'vi':'Giày cho nam, nữ và trẻ em; áo khoác cho người lớn (danh mục quốc tế của Geox, có thể khác tại Việt Nam).','en':'Footwear for men, women and children, and jackets for adults (Geox international range; Vietnam availability may differ).'};bs.append(bind('saigon-retail/source-058.txt','turn589view0 L35-37','https://www.geox.com/int/'))
  if i==29 and fkey=='services':f['value']={'vi':'Trang phục và dép nữ Cotton:On/Cotton:On Rubi (các sản phẩm được liệt kê tại nhà phân phối Việt Nam).','en':'Cotton:On/Cotton:On Rubi women’s clothing and slides (products listed by the Vietnam distributor).'}
  if i==41:
   if fkey=='phone':f=phone(d,'https://www.lacoste.com.vn/','0822086860');bs.append(fresh(10,'turn879view2 L770-773','https://www.lacoste.com.vn/'))
   if fkey=='catalog':f=catalog(d,'https://www.lacoste.com.vn/collections/ao-polo-nam',subset='men’s polo shirts');bs.append(fresh(11,'turn881view0 L683-700',f['url']))
  if i==49:
   bs.append(fresh(10,'turn879view3','https://vn.mlb-korea.com/'));bs.append(fresh(12,'turn890view0 L64-158 actual priced category listing; L349-379 actual collection variants; L436-438 exclusive Vietnam operator and hotline','https://vn.mlb-korea.com/collections/giay-bigball-chunky'))
   if fkey=='phone':f=phone(d,'https://vn.mlb-korea.com/','1900299268')
   if fkey=='catalog':f=catalog(d,'https://vn.mlb-korea.com/collections/giay-bigball-chunky',subset='Bigball Chunky sneakers')
   if fkey=='services':f=fieldbase(d,'https://vn.mlb-korea.com/');f['value']={'vi':'Giày sneakers, trang phục, mũ, túi và phụ kiện MLB (danh mục chung tại nhà phân phối Việt Nam).','en':'MLB sneakers, clothing, caps, bags and accessories (Vietnam distributor’s general range).'}
  if i==52 and fkey=='services':
   f['value']={'vi':'Gọng kính và tròng kính OWNDAYS (danh mục chung của thương hiệu tại Việt Nam).','en':'OWNDAYS spectacle frames and lenses (general Vietnam brand range).'};bs.append(fresh(8,'turn870view10','https://vincom.com.vn/brand/owndays'))
  if i==54 and fkey=='phone':f=phone(d,'https://phototimevn.com/vi/','0369357270');bs.append(bind('vincom-retail-a/source-text/catalog-phototime.json','turn521view0 official footer general contact','https://phototimevn.com/vi/'))
  if i==60 and fkey=='services':bs.append(bind('vincom-retail-a/source-text/find27.json','turn408view6 L40-44 treatments; L95-115 exact branch spa reservation/contact','https://vn.sulwhasoo.com/en/pages/spa-reservation'))
  if i in[22,30,37,38,52] and fkey in['services','catalog']:bs.append(bind('shared-accepted-source-index.json','Same exact brand Vietnam-wide accepted catalogue; no branch practical reuse'))
  f.update(state='verified-agent',approval='agent-accepted',verification='source-checked',reviewedBy=reviewer,reviewedAt='2026-10-20')
  if f['applicability']=='brand-wide':f.pop('branchMallId',None)
  a.update(auditDecision='accept',acceptedField=f)
  if d.get('proposedField'):a['originalProposal']=d['proposedField']
  if fkey=='phone'and f['applicability']=='brand-wide':a['brandContactScopeExplicit']=True
  out.append(a)
assert len(out)==291 and len({key(d)for d in out})==291
assert not {key(d)for d in out}&ex
for d in out:
 if d['auditDecision']=='accept':
  f=d['acceptedField'];assert f['sourceUrl'].startswith('https://')
  if f['field']in['website','catalog','programme']:assert f.get('url')
  else:assert f.get('value',{}).get('vi')and f['value'].get('en')
  if f['field']=='phone':assert f['value']['vi']==f['value']['en']
  if f['field']=='hours':assert f['applicability']=='branch'
  if f['applicability']=='branch':assert f['branchMallId']==d['mallId']
  assert all(f['uncertainty'].get(l)for l in ['vi','en'])
inputs=[{'file':os.path.relpath(p,R).replace('\\','/'),'sha256':sha(p)}for p in sorted(used)]
packet={'revision':'independent-retail-a-remaining291-source-body-reviewed','inputs':inputs,'decisions':out,'limits':['Central auditor retains final signoff/reconciliation.','No own Saigon key independently accepted in this packet; foreign catalogue receipts reused only as primary source bodies for distinct Vincom keys.','No global unavailability claims. All unresolved fields retain precise holds.','Original prior20, baseline658, runtime and frozen4411/4412 untouched.']}
path=P/'reviewed-remaining.json';path.write_text(json.dumps(packet,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
validation={'keys':len(out),'decisions':dict(collections.Counter(d['auditDecision']for d in out)),'sha256':sha(path),'inputs':len(inputs),'prior20Overlap':0,'validated':True}
(P/'validation.json').write_text(json.dumps(validation,indent=2)+'\n',encoding='utf8');print(json.dumps(validation))
