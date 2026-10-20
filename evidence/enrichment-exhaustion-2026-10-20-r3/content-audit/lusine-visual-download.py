import urllib.request,pathlib,fitz,json,hashlib
p=pathlib.Path('evidence/enrichment-exhaustion-2026-10-20-r3/content-audit/lusine-visual');p.mkdir(exist_ok=True)
u='https://lusinespace.com/view/Main-Menu.pdf';data=urllib.request.urlopen(u,timeout=40).read();(p/'Main-Menu.pdf').write_bytes(data);doc=fitz.open(stream=data,filetype='pdf')
for i in range(min(3,len(doc))):doc[i].get_pixmap(matrix=fitz.Matrix(0.8,0.8)).save(str(p/f'page-{i+1}.png'))
(p/'text.txt').write_text('\n'.join(x.get_text()for x in doc),encoding='utf-8')
print(json.dumps({'bytes':len(data),'pages':len(doc),'text':sum(len(x.get_text())for x in doc),'sha256':hashlib.sha256(data).hexdigest()}))
