#!/usr/bin/env python3
"""Test chế độ Tử vi trên trình duyệt thật (Playwright): >=10 cặp lá số khác nhau.
python3 tests/variety_test.py [URL]   (mặc định chạy server tĩnh tại thư mục app)"""
import asyncio, sys, os, json, subprocess, time
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = sys.argv[1] if len(sys.argv) > 1 else None
# (tên, dd/mm/yyyy, giờ chi 0..11, giới tính) — năm/tháng/ngày/giờ/giới khác nhau, có ngày tháng nhuận
PAIRS = [
 (("Nguyễn Minh Anh","20/07/1996",4,"nu"),("Trần Gia Bảo","17/06/1998",6,"nam")),
 (("Lê Thu Hà","23/05/2020",0,"nu"),("Phạm Quốc Huy","14/02/1985",11,"nam")),      # 23/5/2020 = 1/4 nhuận
 (("Võ Hoàng Nam","05/09/1993",2,"nam"),("Đặng Ngọc Lan","12/12/1990",8,"nu")),
 (("Bùi Thanh Tâm","08/08/1988",5,"nu"),("Hồ Đức Long","03/03/2001",9,"nam")),
 (("Đỗ Khánh Linh","28/10/1995",1,"nu"),("Ngô Tuấn Kiệt","19/04/1979",7,"nam")),
 (("Phan Mai Chi","30/07/2025",3,"nu"),("Lý Minh Khang","23/03/2023",10,"nam")),    # 2 ngày tháng nhuận
 (("Trương Bảo Ngọc","21/06/2004",6,"nu"),("Huỳnh Gia Huy","18/08/2006",0,"nam")),
 (("Mai Phương Thảo","01/01/2000",9,"nu"),("Đinh Công Danh","10/02/2024",3,"nam")),
 (("Cao Thùy Dung","15/11/1992",4,"nu"),("Tạ Văn Hùng","15/11/1992",4,"nam")),     # cùng ngày giờ, khác giới
 (("Vũ Hải Yến","02/11/2026",7,"nu"),("La Thành Đạt","25/07/2025",1,"nam")),
 (("Kiều Anh Thư","09/09/1999",2,"nu"),("Quách Minh Trí","04/01/1997",5,"nam")),
 (("Lâm Ngọc Hân","29/02/1984",11,"nu"),("Tô Hoàng Phúc","14/07/1986",8,"nam")),
]
async def main():
    srv = None; url = URL
    if not url:
        srv = subprocess.Popen([sys.executable, '-m', 'http.server', '18765'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
        url = 'http://127.0.0.1:18765/index.html'
    errs = []; res = []; fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 540, 'height': 960})
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url + '#tuvi'); await pg.wait_for_timeout(1500)
        if not await pg.is_visible('#modeTuVi'): fails.append('#tuvi không mở tab tử vi')
        for (a, bb) in PAIRS:
            for k, (n, d, g, s) in ((1, a), (2, bb)):
                await pg.fill(f'#tvName{k}', n); await pg.fill(f'#tvDob{k}', d)
                await pg.click(f'.gio-grid[data-for="{k}"] [data-gio="{g}"]'); await pg.click(f'.sex-row[data-for="{k}"] [data-sex="{s}"]')
            await pg.click('#tvBtnCalc'); await pg.wait_for_timeout(500)
            r = await pg.evaluate('''() => { const q=s=>document.querySelector(s);
              const st=window.TuViUI.state; const ls=st.ls.map(l=>({am:l.lunar.day+'/'+l.lunar.month+(l.lunar.leap?'n':'')+'/'+l.lunar.year, nam:l.namCanChi, menh:l.menhChi, cuc:l.cucTen, pt:l.cungs[10].sao.join(','), menhSao:l.cungs[0].sao.join(','), daiHan:l.cungs.map(c=>c.daiHan).join(',')}));
              const giai=[...document.querySelectorAll('#tvGiai details')].map(d=>d.textContent);
              const empty=[...document.querySelectorAll('#tvGiai p')].filter(p=>p.textContent.split(':').slice(1).join(':').trim().length<30).length;
              const cells=document.querySelectorAll('#tvLaSo .ls-cell').length;
              const radar=Chart.getChart(q('#tvRadar')); const rd=radar?radar.data.datasets[0].data:[];
              return {pct:+q('#tvPercent').innerText, level:q('#tvLevel').innerText, factors:q('#tvFactorList').innerText, steps:q('#tvStepsBody').innerText, giai:giai.join('\\n'), nGiai:giai.length, empty, cells, rd, ls}; }''')
            await pg.click('#tvLs2'); await pg.wait_for_timeout(150)
            r['giaiB'] = await pg.text_content('#tvGiai'); await pg.click('#tvLs1')
            res.append(r)
            if r['cells'] != 12 or r['nGiai'] != 12: fails.append(f"{a[0]}: lá số {r['cells']} ô / {r['nGiai']} cung")
            if r['empty']: fails.append(f"{a[0]}: {r['empty']} lời giải trống/quá ngắn")
            if len(r['rd']) != 6 or any(v is None for v in r['rd']): fails.append(f"{a[0]}: radar thiếu dữ liệu {r['rd']}")
            print(f"{r['pct']:>3}% {r['level']:<12} | {a[0]} {a[1]} → ÂL {r['ls'][0]['am']} {r['ls'][0]['nam']} Mệnh {r['ls'][0]['menh']} {r['ls'][0]['cuc']} [{r['ls'][0]['menhSao']}] || {bb[0]} {bb[1]} → ÂL {r['ls'][1]['am']} {r['ls'][1]['nam']} Mệnh {r['ls'][1]['menh']} {r['ls'][1]['cuc']} [{r['ls'][1]['menhSao']}]")
        # tra cứu
        await pg.fill('#tvSearch', 'thai am phu the'); await pg.wait_for_timeout(200)
        so = await pg.inner_text('#tvSearchOut')
        if 'Thái Âm ở Phu Thê' not in so: fails.append('Tra cứu "thai am phu the" không ra kết quả đúng')
        await pg.fill('#tvSearch', 'Đào Hoa'); await pg.wait_for_timeout(200)
        so2 = await pg.inner_text('#tvSearchOut')
        if so2.count('Đào Hoa ở ') < 12: fails.append('Tra cứu Đào Hoa không đủ 12 cung')
        # thần số học vẫn chạy
        await pg.click('#tabTSH'); await pg.wait_for_timeout(300)
        await pg.click('#btnSample'); await pg.click('#btnCalc'); await pg.wait_for_timeout(800)
        tsh = await pg.is_visible('#result')
        if not tsh: fails.append('Chế độ thần số học không ra kết quả')
        await b.close()
    if srv: srv.terminate()
    pcts = [r['pct'] for r in res]
    lasos = set(json.dumps(l, ensure_ascii=False) for r in res for l in r['ls'])
    giais = set(r['giai'] for r in res) | set(r['giaiB'] for r in res)
    facts = set(r['factors'] for r in res)
    print('\nĐiểm:', pcts, '| khác nhau:', len(set(pcts)), '| biên độ:', max(pcts) - min(pcts))
    print('Lá số khác nhau:', len(lasos), '/', 2 * len(res), '| bộ lời giải khác nhau:', len(giais), '| bảng lý do khác nhau:', len(facts))
    if len(res) < 10: fails.append('ít hơn 10 cặp')
    if len(set(pcts)) < 6: fails.append('ít hơn 6 mức điểm khác nhau')
    if max(pcts) - min(pcts) < 40: fails.append('biên độ điểm < 40')
    if len(lasos) < 2 * len(res): fails.append('có lá số trùng nhau')
    if len(facts) != len(res): fails.append('bảng lý do bị trùng')
    if errs: fails.append('console error: ' + ' | '.join(errs[:3]))
    print('Console errors:', len(errs), '| Thần số học OK:', tsh)
    print('KẾT QUẢ:', 'PASS' if not fails else 'FAIL\n - ' + '\n - '.join(fails))
    sys.exit(1 if fails else 0)
asyncio.run(main())
