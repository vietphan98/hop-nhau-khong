# Đối chiếu đổi âm lịch của tuvi.js với lịch thật trên web:
#  - baonghean.vn (lịch vạn niên VN): ngày/tháng âm, can chi ngày, can chi năm
#  - nhatnguyet.org (thuật toán Hồ Ngọc Đức UTC+7): thêm cờ tháng nhuận (khi trang có)
import re, subprocess, json, urllib.request, html as H, sys
DATES = ["17-06-1998","01-01-2000","23-05-2020","14-02-1985","05-09-1993","12-12-1990","08-08-1988","03-03-2001","28-10-1995","19-04-1979",
         "20-07-1996","30-07-2025","23-03-2023","02-11-2026","21-06-2004","18-08-2006","25-07-2025","10-02-2024"]
UA = {"User-Agent": "Mozilla/5.0"}
def get(url):
    try: return H.unescape(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read().decode())
    except Exception: return None
ok = 0; leapChecked = 0
for ds in DATES:
    d, m, y = map(int, ds.split("-"))
    js = json.loads(subprocess.check_output(["node", "-e", f"const T=require('./tuvi.js');const L=T.solar2lunar({d},{m},{y});const ls=T.lapLaSo({{d:{d},m:{m},y:{y},gio:0,nam:true}});console.log(JSON.stringify({{L,ngay:ls.ngayCanChi,nam:ls.namCanChi}}))"]))
    L = js["L"]
    t = get(f"https://baonghean.vn/am-duong-lich-ngay-{d}-thang-{m}-nam-{y}.html") or ""
    t = re.sub(r"<[^>]*>", " ", t)
    mm = re.search(r"là ngày (\d+) tháng (\d+) Âm lịch\. Ngày ([^,]+), Tháng .+?\s+Năm ([^.]+)\.", t)
    if not mm: print(ds, "NO WEB DATA (baonghean)"); continue
    wd, wm, wday, wy = int(mm[1]), int(mm[2]), mm[3].strip(), mm[4].strip()
    good = (L["day"], L["month"]) == (wd, wm) and js["nam"] == wy and js["ngay"] == wday
    leapNote = ""
    n = get(f"https://nhatnguyet.org/lich-am/{ds}")
    if n:
        nm = re.search(r"dương lịch là ngày (\d+) tháng (\d+)( nhuận)? âm lịch", n)
        if nm:
            wl = bool(nm[3]); leapChecked += 1
            good = good and wl == L["leap"] and int(nm[1]) == L["day"] and int(nm[2]) == L["month"]
            leapNote = f" | nhatnguyet: {nm[1]}/{nm[2]}{' nhuận' if wl else ''}"
    ok += good
    print(f"{ds}: app {L['day']}/{L['month']}{' nhuận' if L['leap'] else ''} năm {js['nam']} ngày {js['ngay']} | baonghean {wd}/{wm} năm {wy} ngày {wday}{leapNote} -> {'PASS' if good else 'FAIL'}")
print(f"{ok}/{len(DATES)} PASS (cờ nhuận đối chiếu được {leapChecked} ngày)"); sys.exit(0 if ok == len(DATES) else 1)
