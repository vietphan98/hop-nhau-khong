# Sinh lời giải tử vi bằng model miễn phí (Gemini API, dự phòng OpenRouter :free / Mistral).
import json, os, sys, re, urllib.request, concurrent.futures as cf
CUNG = ["Mệnh","Phụ Mẫu","Phúc Đức","Điền Trạch","Quan Lộc","Nô Bộc","Thiên Di","Tật Ách","Tài Bạch","Tử Tức","Phu Thê","Huynh Đệ"]
STARS = ["Tử Vi","Thiên Cơ","Thái Dương","Vũ Khúc","Thiên Đồng","Liêm Trinh","Thiên Phủ","Thái Âm","Tham Lang","Cự Môn","Thiên Tướng","Thiên Lương","Thất Sát","Phá Quân",
 "Lộc Tồn","Kình Dương","Đà La","Văn Xương","Văn Khúc","Tả Phù","Hữu Bật","Thiên Khôi","Thiên Việt","Địa Không","Địa Kiếp","Hỏa Tinh","Linh Tinh","Thiên Mã","Đào Hoa","Hồng Loan","Thiên Hỷ","Thiên Khốc","Thiên Hư",
 "Hóa Lộc","Hóa Quyền","Hóa Khoa","Hóa Kỵ","Vô Chính Diệu"]
OUT = "gen"; os.makedirs(OUT, exist_ok=True)
def prompt(star):
    what = "khi cung KHÔNG có chính tinh nào (vô chính diệu)" if star=="Vô Chính Diệu" else f"khi sao {star} nằm ở từng cung"
    return f"""Bạn viết lời giải tử vi bằng tiếng Việt đời thường, dễ hiểu cho người không biết tử vi, giọng nhẹ nhàng, mang tính tham khảo giải trí.
Viết lời giải {what} trong 12 cung của lá số: {", ".join(CUNG)}.
Yêu cầu: mỗi cung 2 câu ngắn (tổng 25-45 từ), nói rõ ý nghĩa của sao đó trong chính lĩnh vực của cung đó (vd Phu Thê = vợ chồng/người yêu, Tài Bạch = cách kiếm và giữ tiền, Tật Ách = những điều cần để ý chăm sóc bản thân, Quan Lộc = công việc, Thiên Di = ra ngoài/đi xa, Nô Bộc = bạn bè đồng nghiệp, Điền Trạch = nhà cửa, Phúc Đức = phúc phần gia đình dòng họ, Phụ Mẫu = cha mẹ, Tử Tức = con cái, Huynh Đệ = anh chị em, Mệnh = tính cách). 12 đoạn phải khác nhau hoàn toàn, không lặp mẫu câu.
Cấm: khẳng định bệnh tật, chữa bệnh, hứa hẹn giàu/lỗ tiền, đầu tư, ngày chết, tai nạn cụ thể; không dùng từ ngữ hù doạ. Với sao xấu thì nói nhẹ nhàng thành "điểm cần để ý" kèm lời khuyên tích cực.
Chỉ trả về JSON object hợp lệ, khoá đúng là 12 tên cung ở trên, giá trị là chuỗi. Không markdown."""
def call_gemini(p):
    key=os.environ["GEMINI_API_KEY"]
    for model in ["gemini-3-flash-preview","gemini-flash-lite-latest"]:
        try:
            url=f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
            body={"contents":[{"parts":[{"text":p}]}],"generationConfig":{"responseMimeType":"application/json","temperature":0.9}}
            r=urllib.request.urlopen(urllib.request.Request(url,json.dumps(body).encode(),{"Content-Type":"application/json"}),timeout=300)
            j=json.load(r); return j["candidates"][0]["content"]["parts"][0]["text"], "gemini:"+model
        except Exception as e: print("gemini fail",model,e,file=sys.stderr)
    return None,None
def call_openai_like(url,key,model,p):
    body={"model":model,"messages":[{"role":"user","content":p}],"temperature":0.9}
    r=urllib.request.urlopen(urllib.request.Request(url,json.dumps(body).encode(),{"Content-Type":"application/json","Authorization":"Bearer "+key}),timeout=240)
    return json.load(r)["choices"][0]["message"]["content"]
def parse(t):
    t=re.sub(r"^```(json)?|```$","",t.strip(),flags=re.M).strip()
    d=json.loads(t[t.find("{"):t.rfind("}")+1]); assert all(c in d and len(d[c])>20 for c in CUNG), "missing"
    return {c:d[c].strip() for c in CUNG}
def one(star):
    fn=f"{OUT}/{star}.json"
    if os.path.exists(fn): return star,"cached"
    p=prompt(star)
    for attempt in range(1):
        t,src=call_gemini(p)
        try:
            if t: d=parse(t); json.dump({"src":src,"d":d},open(fn,"w"),ensure_ascii=False,indent=1); return star,src
        except Exception as e: print(star,"parse",e,file=sys.stderr)
    for url,k,m in [("https://openrouter.ai/api/v1/chat/completions","OPENROUTER_API_KEY","google/gemma-4-31b-it:free"),("https://openrouter.ai/api/v1/chat/completions","OPENROUTER_API_KEY","google/gemma-4-26b-a4b-it:free"),("https://api.mistral.ai/v1/chat/completions","MISTRAL_API_KEY","mistral-small-latest")]:
        try:
            d=parse(call_openai_like(url,os.environ[k],m,p)); json.dump({"src":m,"d":d},open(fn,"w"),ensure_ascii=False,indent=1); return star,m
        except Exception as e: print(star,m,e,file=sys.stderr)
    return star,"FAIL"
with cf.ThreadPoolExecutor(8) as ex:
    for s,r in ex.map(one,STARS): print(s,r,flush=True)
