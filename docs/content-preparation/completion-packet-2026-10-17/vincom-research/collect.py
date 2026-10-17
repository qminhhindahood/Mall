import requests,re,pathlib,json,csv,unicodedata,html,concurrent.futures,datetime
P=pathlib.Path(__file__).parent
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def norm(s):
 s=unicodedata.normalize('NFKD',s.lower().replace('đ','d'));return re.sub('[^a-z0-9]','',s)
def text(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s))).strip()
raw=(P/'directory.html').read_text(encoding='utf8')
blocks=re.split(r'<div[^>]+category-item[^>]*>',raw)[1:]
roster=[]
for b in blocks:
 url=re.search(r'href="(/store/[^"<>]+)',b)
 name=re.search(r'<h6 class="text-center mb-1">(.*?)</h6>',b,re.S)
 floor=re.search(r'<p class="text-muted text-center m-0">(.*?)</p>',b,re.S)
 img=re.search(r'<img[^>]+src="([^"]+)',b)
 if url and name:roster.append({'name':text(name.group(1)),'normalizedName':norm(text(name.group(1))),'sourceUrl':'https://vincom.com.vn'+html.unescape(url.group(1)),'floorClaim':text(floor.group(1)) if floor else None,'logoUrl':html.unescape(img.group(1)) if img else None})
(P/'official-roster.json').write_text(json.dumps({'retrievedAt':NOW,'sourceUrl':'https://vincom.com.vn/vincom-center-dong-khoi/gian-hang','records':roster},ensure_ascii=False,indent=2),encoding='utf8')
D=P/'store-pages';D.mkdir(exist_ok=True)
def get(r):
 slug=r['sourceUrl'].split('/store/')[1].split('?')[0];f=D/(slug+'.html')
 try:
  resp=requests.get(r['sourceUrl'],timeout=40);s=resp.text;f.write_text(s,encoding='utf8');r['httpStatus']=resp.status_code;r['evidenceFile']='store-pages/'+f.name
  section=s[s.find('id="eventDetailBooth"'):];section=section[:section.find('</section>')]
  r['detailText']=text(section)
  b=re.search(r'<div class="brand-content[^>]*>(.*?)</div>',section,re.S);r['descriptionSourceVi']=text(b.group(1)) if b else None
  r['unitTokens']=sorted(set(re.findall(r'\b(?:B[123]|L[123]|M)[ -]\d{1,3}[A-Z]?(?:[-–]\d{1,3}[A-Z]?)?',text(section))))
  r['photoCandidates']=[{'url':html.unescape(url),'kind':'store-detail-content-image','rightsStatus':'unknown','reviewStatus':'pending'} for url in re.findall(r'<img[^>]+src="([^"]+)"',b.group(1) if b else '')]
  r['rightsStatus']='unknown';r['retrievedAt']=NOW
 except Exception as e:r['error']=str(e)
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(get,roster))
(P/'official-stores.json').write_text(json.dumps({'retrievedAt':NOW,'records':results},ensure_ascii=False,indent=2),encoding='utf8')
print('Fetched',len(results),'failures',sum(bool(x.get('error')) for x in results),'unit-token-pages',sum(bool(x.get('unitTokens')) for x in results),'photo-pages',sum(bool(x.get('photoCandidates')) for x in results))
