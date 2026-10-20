import pathlib,re,json,sys
sys.stdout.reconfigure(encoding='utf-8')
p=pathlib.Path(__file__).resolve().parent.parent/'research-vincom'
r=json.loads((p/'enrichment-records.json').read_text(encoding='utf-8-sig'))
catalog={f['sourceUrl']:x['destinationId'] for x in r['records'] for f in x['fields'] if f['field']=='catalog'}
parts=[s for file in p.glob('*.txt') for s in file.read_text(encoding='utf-8-sig').split('--------------------------------------------------------------------------------')]
for url,identity in catalog.items():
 print('\n'+identity+' '+url)
 candidates=[s for s in parts if '"ref_id":"'+url+'"' in s]
 for s in sorted(candidates,key=len,reverse=True)[:1]:
  print(s.strip().splitlines()[0])
  print('\n'.join(t for t in s.splitlines() if re.match('L[0-9]+:',t) and ('#' in t or any(q in t.lower() for q in ['category','collection','sản phẩm','mua sắm','product','nam','women','men','giày'])))[:1300])
