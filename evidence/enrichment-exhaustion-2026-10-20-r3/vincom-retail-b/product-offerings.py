# Products/services accepts documented product offerings. These replace
# operational-service-only holds, without assigning store policies or stock.
offerings=[
('Cath Kidston','Túi xách, túi gấp gọn và phụ kiện họa tiết.','Printed bags, foldaway totes and accessories.','Product cards name Paddington and Tokidoki bags; product categories list accessories.'),
('Botanifique','Sản phẩm chăm sóc da như gel tẩy tế bào chết, tinh chất và mặt nạ.','Skincare products including peeling gel, facial serum and masks.','Actual bestseller cards: Face-It Peeling Gel, Deep Essence Facial Serum, Magnifique Facial Mask.'),
('Marhen.J','Túi đeo vai, với mẫu Nua phom chữ nhật được giới thiệu trên trang sản phẩm.','Shoulder bags, including the rectangular Nua design shown on the product page.','Actual Nua shoulder-bag product title and details, not generic distributor navigation.'),
('Ceci','Trang phục nữ với đầm lụa, bộ phối sẵn và áo dài trong danh mục thương hiệu.','Womenswear with silk dresses, matching sets and áo dài in the brand range.','Official home lists SILK DRESS, MATCHING SETS and ÁO DÀI 2026.'),
('Cutie Land','Đầm trẻ em, áo dài và trang phục dự tiệc.','Children’s dresses, áo dài and occasion clothing.','Actual Glossy Dreams product cards and áo dài / occasion-clothing categories.'),
('BHPC - Beverly Hills Polo Club','Áo polo, sơ mi, áo thun và quần nam.','Men’s polo shirts, shirts, T-shirts and trousers.','Actual Regular Fit and Slim Fit polo cards plus listed apparel categories.'),
('Old Navy','Jeans, áo và trang phục thường ngày cho nhiều thành viên trong gia đình.','Jeans, tops and casual clothing for the family.','Actual international shopping presentation explicitly lists family jeans and casual apparel.'),
('Keds','Giày Keds với các kiểu sneaker trong danh mục quốc tế.','Keds footwear with sneaker styles in its international range.','Readable shoe styles and shopping categories retained in locator-detail-02.json.'),
('Timberland','Giày dép và trang phục trong danh mục quốc tế Timberland.','Footwear and clothing in Timberland’s international range.','Readable official international footwear/clothing shopping presentation.'),
('Lock & Lock','Đồ dùng nhà bếp và sản phẩm đựng, bảo quản thực phẩm.','Kitchenware and food-storage products.','Actual official Vietnam product presentation, not a claim of in-store repair.'),
('Max & Co','Trang phục nữ trong các bộ sưu tập thời trang của MAX&Co.','Womenswear from MAX&Co. fashion collections.','Official international womenswear product/category presentation.'),
('Shu Uemura','Sản phẩm trang điểm và chăm sóc da trong danh mục quốc tế.','Makeup and skincare products in the international range.','Official US product presentation; no local treatment availability inferred.'),
('GAP','Jeans và trang phục thường ngày.','Jeans and casual clothing.','Official international Gap product presentation; no foreign-market service entitlement.'),
('Gustavo Gano','Thời trang trẻ em gồm áo thun, quần và đầm.','Children’s clothing including T-shirts, trousers and dresses.','Actual product categories on official home include boys T-shirts/bottoms and girls dresses.'),
('Lush','Sản phẩm tắm, chăm sóc tóc và nước hoa.','Bath products, haircare and fragrances.','Official Vietnam product presentation lists shampoos, perfumes and bath/body product groups.'),
('New Balance','Giày thể thao, sneaker và trang phục thể thao trong danh mục quốc tế.','Athletic footwear, sneakers and sportswear in the international range.','Official international product presentation; no Vietnam fitting service inferred.'),
('Scentuals','Sản phẩm chăm sóc da, cơ thể, tóc và tinh dầu.','Skincare, body care, haircare and essential oils.','Actual product cards include facial toning mist, rosemary/mint shampoo and sandalwood essential oil.'),
('Stradivarius','Trang phục nữ, với danh mục áo khoác trên trang quốc tế.','Womenswear, including the jackets category on the international site.','Readable official jackets category description, not local inventory.'),
('Skechers','Giày dép và sneaker trong danh mục quốc tế Skechers.','Footwear and sneakers in Skechers’ international range.','Official international product presentation; no local fitting or repair promise.'),
('Viin Riic Niche Perfume','Nước hoa niche trong danh mục nhiều thương hiệu.','Niche fragrances across a multi-brand selection.','Official Viin Riic product catalogue; private booking at a different gallery is excluded.'),
('PNJ','Trang sức trong danh mục chính thức của PNJ.','Jewellery from PNJ’s official range.','Actual PNJ jewellery listing; no manufacturing/export service transferred.'),
('Tommy Hilfiger','Trang phục Tommy Hilfiger trong danh mục nhà phân phối tại Việt Nam.','Tommy Hilfiger clothing in its Vietnamese distributor’s range.','Actual ACFC Tommy Hilfiger product listing.'),
('Honee Coffee','Cà phê đóng gói, rang xay với các dòng Arabica, Robusta, Peaberry và Moka.','Packaged and roasted coffee including Arabica, Robusta, Peaberry and Moka ranges.','Actual official coffee product presentation; not a branch café menu or tasting service.'),
('Laneige','Sản phẩm chăm sóc da, dưỡng môi và trang điểm nền.','Skincare, lip care and complexion makeup.','Actual product cards include Water Bank cream, Lip Sleeping Mask and Neo Cushion.'),
('Amara','Sản phẩm cho không gian sống trong danh mục AMARA.','Home products in AMARA’s range.','Readable actual official home-product cards, not branch stock.'),
('Calvin Klein','Trang phục CK Jeans và đồ lót Calvin Klein.','CK Jeans clothing and Calvin Klein underwear.','Official exclusive Vietnamese distributor describes and presents these product lines.'),
('Micro','Xe scooter Mini Micro, Maxi Micro và các dòng scooter khác.','Mini Micro, Maxi Micro and other scooter ranges.','Actual Swiss official product cards name Mini Micro and Maxi Micro bundles.'),
('Li-Ning','Giày chạy bộ nam, với các dòng Super Light, Infinity và Feidian.','Men’s running shoes including Super Light, Infinity and Feidian ranges.','Actual Vietnam product cards in running-shoe collection lines625–668.'),
]
for s,vi,en,support in offerings:
 id=ident(s)
 if 'services' not in by[id]['fields']:continue
 cat=next((f for f in records.get(id,{}).get('fields',[]) if f['field']=='catalog'),None)
 assert cat,(s,'missing checked catalogue')
 prior=decisions.get((id,'services'))
 add(s,'services',cat['sourceUrl'],decisions[(id,'catalog')]['sourceFile'],'Documented product offering for Products/services. '+support+' Brand-wide; branch stock, prices and operational services are not asserted.','brand-wide',vi,en)
 records[id]['fields'][-1]['uncertainty']=copy.deepcopy(cat['uncertainty'])
 decisions[(id,'services')]['supersedesResearchOutcome']=prior

# Correct action-role targets: actual product listings rather than locators.
for s,url in [('Aristino','https://aristino.com/collections/ao-so-mi'),('Li-Ning','https://lining.com.vn/collections/giay-chay-bo-nam-2')]:
 id=ident(s); old=next(f for f in records[id]['fields'] if f['field']=='catalog')
 records[id]['fields']=[f for f in records[id]['fields'] if f['field']!='catalog']
 add(s,'catalog',url,'product-service-03.json','Actual official product collection: Aristino shirts with 553 products and filters; Li-Ning running shoes with named product cards (also product-service-06.json). Brand-wide; no branch stock claim.')
 if s=='Li-Ning':
  sf=next(f for f in records[id]['fields'] if f['field']=='services'); sf['sourceUrl']=url
  decisions[(id,'services')].update(sourceUrl=url,sourceFile='product-service-06.json')

# Explicit fresh proof for the product-offering descriptions.
for s,file in [('Botanifique','product-service-01.json'),('Ceci','product-service-01.json'),('BHPC - Beverly Hills Polo Club','product-service-01.json'),('Cutie Land','product-service-05.json'),('Micro','product-service-04.json'),('Laneige','product-service-04.json')]:decisions[(ident(s),'services')]['sourceFile']=file

for s,slug,file,vi,en,section in [
 ('Minigood','minigood','mall-product-01.json','Đồ gia dụng, văn phòng phẩm, đồ chơi và phụ kiện công nghệ.','Household goods, stationery, toys and technology accessories.','Mall page line21 explicitly enumerates these product groups.'),
 ('Lancôme','lancome','mall-product-02.json','Nước hoa và mỹ phẩm Lancôme.','Lancôme fragrances and cosmetics.','Mall page lines18–19 identifies fragrances and cosmetics; no treatment service inferred.'),
 ('Charles & Keith','charles-keith','mall-product-02.json','Giày dép, túi xách và phụ kiện như thắt lưng, kính mát.','Footwear, bags and accessories including belts and sunglasses.','Mall page line22 explicitly lists footwear, bags, belts and sunglasses.'),
 ('Pedro','pedro','mall-product-03.json','Giày dép, túi xách và thắt lưng cho nam, nữ.','Footwear, bags and belts for men and women.','Mall page lines18,23,30–33 enumerate actual product groups.'),
]:
 prior=decisions[(ident(s),'services')]
 add(s,'services','https://vincom.com.vn/store/'+slug+'-vincom-center-dong-khoi',file,'Product offering from the mall-owned destination description. '+section+' General product range; no branch stock, price, manufacturing provenance or service entitlement.','brand-wide',vi,en)
 decisions[(ident(s),'services')]['supersedesResearchOutcome']=prior

proofs={'Timberland':'product-proof-01.json','Lock & Lock':'product-proof-01.json','Max & Co':'product-proof-04.json','Shu Uemura':'product-proof-04.json','MAC':'product-proof-02.json','Mắt Việt':'product-proof-02.json','New Balance':'product-proof-06.json','Viin Riic Niche Perfume':'product-proof-04.json','Skechers':'product-proof-03.json','Lush':'product-proof-03.json'}
for s,file in proofs.items():
 for field in ['catalog','services']:
  d=decisions.get((ident(s),field))
  if d and d['decision']=='candidate-proposal':d['supplementalSourceFiles']=[file]

# Genuine Japanese product overview, rather than the corporate landing page.
id=ident('Daiso');records[id]['fields']=[f for f in records[id]['fields'] if f['field']!='catalog']
add('Daiso','catalog','https://www.daiso-sangyo.co.jp/item','product-proof-05.json','Official new-product overview names seasonal decoration, sealing wax, yarn, drain brushes and craft clips (lines53–68). Japanese market; Vietnam range not established.')
add('Daiso','services','https://www.daiso-sangyo.co.jp/item','product-proof-05.json','Documented product offering: official new-product overview lists seasonal decorations, craft materials and household cleaning items, not local photocopy/repair services.','brand-wide','Đồ trang trí theo mùa, vật liệu thủ công và đồ dùng vệ sinh gia đình trong danh mục Nhật Bản.','Seasonal decorations, craft materials and household cleaning items in the Japanese range.')
for s in ['Daiso','Estée Lauder']:
 for f in records[ident(s)]['fields']:
  if f['applicability']=='brand-wide':f['uncertainty']={'vi':'Nguồn sản phẩm/dịch vụ quốc tế; danh mục, giá và dịch vụ có thể khác tại Việt Nam. Xác nhận với chi nhánh.','en':'International product/service source; range, prices and services may differ in Vietnam. Confirm with the branch.'}

for s,url,file,vi,en,evidence,foreign in [
 ('Mango','https://shop.mango.com/vn/en/h/women','follow-04.json','Trang phục nữ như áo khoác, jeans, đầm và áo sơ mi.','Womenswear including coats, jeans, dresses and shirts.','Actual Vietnam home product categories lines15–28.',False),
 ('Furla','https://www.furla.com/int/en/eshop/storedetails/?StoreID=03AVN020--SO','product-proof-07.json','Túi xách, ví, đồ da nhỏ và phụ kiện.','Bags, wallets, small leather goods and accessories.','Actual Categories block lines78–87, without branch stock or international online service claims.',True),
 ('Sneaker Buzz','https://sneakerbuzz.vn/','product-proof-07.json','Giày sneaker nhiều thương hiệu, với các mẫu Vans Authentic trong danh mục.','Multi-brand sneakers, including Vans Authentic styles in the range.','Actual Vans Authentic product cards with model names and SKUs.',False),
 ('OVS','https://www.ovs.it/it/it/c/uomo/','product-proof-07.json','Trang phục như áo thun, sơ mi, áo khoác và jeans trong danh mục Ý.','Clothing including T-shirts, shirts, jackets and jeans in the Italian range.','Readable official collection and clothing categories; reuse baseline catalogue identity.',True),
 ('Ecco','https://eccovietnam.vn/','product-proof-08.json','Giày sneaker, giày công sở, sandal và giày golf.','Sneakers, dress shoes, sandals and golf shoes.','Actual Vietnam categories and named ECCO Golf BIOM / Soft / Offroad collections.',False),
 ('Giordano','https://www.giordano.com/VN/en-US/','product-proof-08.json','Áo polo, áo thun, sơ mi, jeans và quần khaki.','Polo shirts, T-shirts, shirts, jeans and khaki trousers.','Vietnam product categories lines12–26 and45–58, not a fitting/repair service.',False),
 ('My Kingdom','https://www.mykingdom.com.vn/','product-proof-08.json','Đồ chơi lắp ráp LEGO, gồm các dòng Classic, Technic và Super Heroes.','LEGO construction toys including Classic, Technic and Super Heroes ranges.','Actual LEGO product cards with model numbers10696,42177,76322.',False),
 ('Himalaya','https://www.himalaya-vn.com/','product-proof-10.json','Nến thơm, với các dòng Bahama Breeze và Beach Walk.','Scented candles including Bahama Breeze and Beach Walk ranges.','Actual product cards lines269–286. No wellness outcome or treatment inferred.',False),
 ('TGNH – Thế Giới Nước Hoa','https://www.thegioinuochoa.com.vn/','product-proof-10.json','Nước hoa nhiều thương hiệu như Lancôme, Gucci và Yves Saint Laurent.','Multi-brand fragrances including Lancôme, Gucci and Yves Saint Laurent.','Actual Idole, Flora and Libre product cards in official national catalogue.',False),
 ('ZARA','https://www.zara.com/vn/','product-proof-10.json','Trang phục, giày và phụ kiện cho nữ, nam và trẻ em.','Clothing, footwear and accessories for women, men and children.','Actual Vietnam shopping presentation categories; no selected-market Pre-Owned repair transfer.',False),
]:
 prior=decisions[(ident(s),'services')]
 add(s,'services',url,file,'Documented product offering for Products/services. '+evidence+' Brand-wide product information; no branch inventory, prices or operational-service promises.','brand-wide',vi,en)
 decisions[(ident(s),'services')]['supersedesResearchOutcome']=prior
 if foreign:records[ident(s)]['fields'][-1]['uncertainty']={'vi':'Nguồn danh mục quốc tế; sản phẩm, giá và dịch vụ có thể khác tại Việt Nam. Xác nhận với chi nhánh.','en':'International catalogue source; products, prices and services may differ in Vietnam. Confirm with the branch.'}

# Precision correction from independent fresh read: generic phone exists,
# while the inspected address blocks omit an explicitly associated branch line.
decisions[(ident('Fixifoot'),'phone')]['reason']='Official contact page contains a repeated generic site phone0983000821, while inspected branch blocks print addresses without an explicitly branch-associated phone. No dedicated Dong Khoi contact is established; the shared site number is excluded from branch-direct contact.'
