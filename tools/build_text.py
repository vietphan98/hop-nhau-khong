# Gộp tools/gen/*.json -> tuvi-text.js (window.TUVI_TEXT[sao][cung])
import json, glob, os, sys
CUNG=["Mệnh","Phụ Mẫu","Phúc Đức","Điền Trạch","Quan Lộc","Nô Bộc","Thiên Di","Tật Ách","Tài Bạch","Tử Tức","Phu Thê","Huynh Đệ"]
d={}; bad=[]
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__),'gen','*.json'))):
    j=json.load(open(f,encoding='utf-8')); star=os.path.basename(f)[:-5]
    m={c:(j['d'].get(c) or '').strip() for c in CUNG}
    for c in CUNG:
        if len(m[c])<40: bad.append((star,c))
    d[star]=m
open(os.path.join(os.path.dirname(__file__),'..','tuvi-text.js'),'w',encoding='utf-8').write(
 '// Lời giải từng sao trong từng cung (tham khảo, giải trí) — Việt Phan\nwindow.TUVI_TEXT = '+json.dumps(d,ensure_ascii=False,indent=0)+';\n')
print(len(d),'sao; ngắn/thiếu:',bad)
