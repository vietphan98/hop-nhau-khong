// Tử vi engine: đổi dương → âm lịch (thuật toán Hồ Ngọc Đức, múi giờ +7), can chi, nạp âm,
// an Mệnh/Thân, 12 cung, cục, 14 chính tinh, phụ tinh, tứ hoá, đại hạn; so hợp 2 lá số.
// Nội dung tham khảo, giải trí.
(function (root) {
  'use strict';
  const PI = Math.PI, TZ = 7;
  const INT = Math.floor;
  function jdFromDate(dd, mm, yy) {
    const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    return jd;
  }
  function getNewMoonDay(k, tz) {
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    let deltat;
    if (T < -11) deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    else deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    const JdNew = Jd1 + C1 - deltat;
    return INT(JdNew + 0.5 + tz / 24);
  }
  function getSunLongitude(jdn, tz) {
    const T = (jdn - 2451545.5 - tz / 24) / 36525, T2 = T * T, dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return INT(L / PI * 6);
  }
  function getLunarMonth11(yy, tz) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = INT(off / 29.530588853);
    let nm = getNewMoonDay(k, tz);
    if (getSunLongitude(nm, tz) >= 9) nm = getNewMoonDay(k - 1, tz);
    return nm;
  }
  function getLeapMonthOffset(a11, tz) {
    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last, i = 1, arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
    do { last = arc; i++; arc = getSunLongitude(getNewMoonDay(k + i, tz), tz); } while (arc !== last && i < 14);
    return i - 1;
  }
  function solar2lunar(dd, mm, yy, tz = TZ) {
    const dayNumber = jdFromDate(dd, mm, yy);
    const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, tz);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz);
    let a11 = getLunarMonth11(yy, tz), b11 = a11, lunarYear;
    if (a11 >= monthStart) { lunarYear = yy; a11 = getLunarMonth11(yy - 1, tz); }
    else { lunarYear = yy + 1; b11 = getLunarMonth11(yy + 1, tz); }
    const lunarDay = dayNumber - monthStart + 1;
    const diff = INT((monthStart - a11) / 29);
    let lunarLeap = false, lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      const leapMonthDiff = getLeapMonthOffset(a11, tz);
      if (diff >= leapMonthDiff) { lunarMonth = diff + 10; if (diff === leapMonthDiff) lunarLeap = true; }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap, jd: dayNumber };
  }

  const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const CON_GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];
  const GIO = ['23h-1h', '1h-3h', '3h-5h', '5h-7h', '7h-9h', '9h-11h', '11h-13h', '13h-15h', '15h-17h', '17h-19h', '19h-21h', '21h-23h'];
  const NAP_AM = ['Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim', 'Sơn Đầu Hỏa', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc',
    'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy', 'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bích Thượng Thổ', 'Kim Bạch Kim',
    'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim', 'Tang Đố Mộc', 'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy'];
  const HANH = ['Kim', 'Thủy', 'Mộc', 'Hỏa', 'Thổ']; // vòng tương sinh: Kim→Thủy→Mộc→Hỏa→Thổ→Kim
  const CUC = { 'Thủy': 2, 'Mộc': 3, 'Kim': 4, 'Thổ': 5, 'Hỏa': 6 };
  const CUC_TEN = { 2: 'Thủy nhị cục', 3: 'Mộc tam cục', 4: 'Kim tứ cục', 5: 'Thổ ngũ cục', 6: 'Hỏa lục cục' };
  const CUNG = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'];
  const CHINH_TINH = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh', 'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'];
  const TU_HOA = [ // Lộc, Quyền, Khoa, Kỵ theo can năm
    ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'], ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
    ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'], ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
    ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'], ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
    ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'], ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
    ['Thiên Lương', 'Tử Vi', 'Tả Phù', 'Vũ Khúc'], ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang']];
  const HOA_TEN = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];
  const m12 = n => ((n % 12) + 12) % 12;
  const m10 = n => ((n % 10) + 10) % 10;
  const hanhOfNapAm = idx30 => NAP_AM[idx30].split(' ').pop();
  const sexaIndex = (can, chi) => { for (let n = 0; n < 60; n++) if (n % 10 === can && n % 12 === chi) return n; return -1; };
  function napAm(can, chi) { const i = INT(sexaIndex(can, chi) / 2); return { ten: NAP_AM[i], hanh: hanhOfNapAm(i) }; }
  const canChi = (c, h) => CAN[c] + ' ' + CHI[h];
  // quan hệ ngũ hành a → b
  function hanhRel(a, b) {
    const i = HANH.indexOf(a), j = HANH.indexOf(b);
    if (i === j) return 'hoa';
    if ((i + 1) % 5 === j) return 'sinh';     // a sinh b
    if ((j + 1) % 5 === i) return 'duocsinh'; // b sinh a
    if ((i + 2) % 5 === j) return 'khac';     // a khắc b
    return 'bikhac';
  }

  // input: {d,m,y (dương lịch), gio (0..11 chi), nam (bool)}
  function lapLaSo(inp) {
    const L = solar2lunar(inp.d, inp.m, inp.y);
    const yCan = m10(L.year + 6), yChi = m12(L.year + 8);
    // tháng nhuận: nửa đầu (≤15) tính tháng đó, nửa sau tính tháng sau
    let thangAn = L.month; if (L.leap && L.day > 15) thangAn = L.month % 12 + 1;
    const mCan = m10(L.year * 12 + L.month + 3), mChi = m12(L.month + 1);
    const dCan = m10(L.jd + 9), dChi = m12(L.jd + 1);
    const h = inp.gio, hCan = m10(dCan * 2 + h);
    const duong = yCan % 2 === 0, nam = !!inp.nam;
    const thuan = (duong && nam) || (!duong && !nam);
    const menh = m12(2 + (thangAn - 1) - h), than = m12(2 + (thangAn - 1) + h);
    const canDan = m10((yCan % 5) * 2 + 2);
    const canCung = c => m10(canDan + m12(c - 2));
    const cungAt = {}; for (let i = 0; i < 12; i++) cungAt[m12(menh + i)] = CUNG[i];
    const menhNA = napAm(canCung(menh), menh);
    const cuc = CUC[menhNA.hanh];
    // Tử Vi
    const d = L.day; let x = 0; while ((d + x) % cuc !== 0) x++;
    const q = (d + x) / cuc; let tv = m12(2 + q - 1); tv = x % 2 === 0 ? m12(tv + x) : m12(tv - x);
    const tp = m12(4 - tv);
    const stars = []; const put = (name, pos, loai) => stars.push({ name, pos: m12(pos), loai });
    put('Tử Vi', tv, 'chinh'); put('Thiên Cơ', tv - 1, 'chinh'); put('Thái Dương', tv - 3, 'chinh'); put('Vũ Khúc', tv - 4, 'chinh');
    put('Thiên Đồng', tv - 5, 'chinh'); put('Liêm Trinh', tv - 8, 'chinh');
    put('Thiên Phủ', tp, 'chinh'); put('Thái Âm', tp + 1, 'chinh'); put('Tham Lang', tp + 2, 'chinh'); put('Cự Môn', tp + 3, 'chinh');
    put('Thiên Tướng', tp + 4, 'chinh'); put('Thiên Lương', tp + 5, 'chinh'); put('Thất Sát', tp + 6, 'chinh'); put('Phá Quân', tp + 10, 'chinh');
    const locTon = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][yCan];
    put('Lộc Tồn', locTon, 'phu'); put('Kình Dương', locTon + 1, 'phu'); put('Đà La', locTon - 1, 'phu');
    put('Văn Xương', 10 - h, 'phu'); put('Văn Khúc', 4 + h, 'phu');
    put('Tả Phù', 4 + thangAn - 1, 'phu'); put('Hữu Bật', 10 - (thangAn - 1), 'phu');
    put('Thiên Khôi', [1, 0, 11, 11, 1, 0, 6, 6, 3, 3][yCan], 'phu'); put('Thiên Việt', [7, 8, 9, 9, 7, 8, 2, 2, 5, 5][yCan], 'phu');
    put('Địa Không', 11 - h, 'phu'); put('Địa Kiếp', 11 + h, 'phu');
    const g3 = yChi % 4; // 0: Thân Tý Thìn, 1: Tỵ Dậu Sửu, 2: Dần Ngọ Tuất, 3: Hợi Mão Mùi
    const hoaStart = [2, 3, 1, 9][g3], linhStart = g3 === 2 ? 3 : 10;
    put('Hỏa Tinh', thuan ? hoaStart + h : hoaStart - h, 'phu'); put('Linh Tinh', thuan ? linhStart - h : linhStart + h, 'phu');
    put('Thiên Mã', [2, 11, 8, 5][g3], 'phu'); put('Đào Hoa', [9, 6, 3, 0][g3], 'phu');
    put('Hồng Loan', 3 - yChi, 'phu'); put('Thiên Hỷ', 9 - yChi, 'phu');
    put('Thiên Khốc', 6 - yChi, 'phu'); put('Thiên Hư', 6 + yChi, 'phu');
    TU_HOA[yCan].forEach((s, i) => { const st = stars.find(z => z.name === s); if (st) put(HOA_TEN[i], st.pos, 'hoa'); });
    const cungs = [];
    for (let i = 0; i < 12; i++) {
      const pos = m12(menh + i);
 // số bước đại hạn tính từ Mệnh
      cungs.push({ ten: CUNG[i], pos, chi: CHI[pos], can: CAN[canCung(pos)], than: pos === than,
        daiHan: cuc + 10 * (thuan ? i : m12(-i)),
        sao: stars.filter(s => s.pos === pos).map(s => s.name),
        chinh: stars.filter(s => s.pos === pos && s.loai === 'chinh').map(s => s.name) });
    }
    return {
      input: inp, lunar: L, thangAn, yCan, yChi, nam, duong, thuan,
      namCanChi: canChi(yCan, yChi), thangCanChi: canChi(mCan, mChi), ngayCanChi: canChi(dCan, dChi), gioCanChi: canChi(hCan, h),
      conGiap: CON_GIAP[yChi], banMenh: napAm(yCan, yChi), menh, than, menhChi: CHI[menh], thanCung: cungAt[than],
      cuc, cucTen: CUC_TEN[cuc], menhNapAm: menhNA, tuViPos: tv, cungs, stars,
      amDuong: (duong ? 'Dương ' : 'Âm ') + (nam ? 'Nam' : 'Nữ')
    };
  }
  const cungByTen = (ls, ten) => ls.cungs.find(c => c.ten === ten);

  // Điểm sao ở Phu Thê (tham khảo) — dùng cho phần so hợp
  const PT_W = { 'Tử Vi': 6, 'Thiên Phủ': 6, 'Thái Âm': 7, 'Thiên Đồng': 7, 'Thiên Lương': 6, 'Thiên Tướng': 5, 'Thái Dương': 4, 'Thiên Cơ': 4,
    'Vũ Khúc': -2, 'Tham Lang': 0, 'Cự Môn': -3, 'Liêm Trinh': -2, 'Thất Sát': -4, 'Phá Quân': -4,
    'Hồng Loan': 4, 'Thiên Hỷ': 3, 'Đào Hoa': 2, 'Tả Phù': 3, 'Hữu Bật': 3, 'Văn Xương': 2, 'Văn Khúc': 2, 'Lộc Tồn': 2, 'Thiên Khôi': 2, 'Thiên Việt': 2,
    'Hóa Lộc': 3, 'Hóa Khoa': 2, 'Hóa Quyền': 1, 'Hóa Kỵ': -4, 'Kình Dương': -3, 'Đà La': -2, 'Địa Không': -3, 'Địa Kiếp': -3, 'Hỏa Tinh': -2, 'Linh Tinh': -2,
    'Thiên Khốc': -1, 'Thiên Hư': -1, 'Thiên Mã': 0 };
  function chiRel(a, b) {
    if (a === b) return { k: 'trung', diem: 4, ten: 'Cùng tuổi ' + CHI[a] };
    if (a % 4 === b % 4) return { k: 'tamhop', diem: 16, ten: 'Tam hợp' };
    if (m12(a + b) === 1) return { k: 'luchop', diem: 13, ten: 'Lục hợp' };
    if (Math.abs(a - b) === 6) return { k: 'xung', diem: -14, ten: 'Lục xung (tứ hành xung)' };
    if (m12(a + b) === 7) return { k: 'hai', diem: -8, ten: 'Lục hại' };
    if (a % 3 === b % 3) return { k: 'hinh', diem: -4, ten: 'Cùng nhóm tứ hành xung (nhẹ)' };
    return { k: 'binh', diem: 0, ten: 'Bình thường' };
  }
  function canRel(a, b) {
    if (a === b) return { k: 'trung', diem: 2, ten: 'Cùng can ' + CAN[a] };
    if (Math.abs(a - b) === 5) return { k: 'hop', diem: 10, ten: 'Can hợp (' + CAN[a] + ' – ' + CAN[b] + ')' };
    if (Math.abs(a - b) === 6 || Math.abs(a - b) === 4) return { k: 'pha', diem: -6, ten: 'Can khắc (' + CAN[a] + ' – ' + CAN[b] + ')' };
    return { k: 'binh', diem: 0, ten: 'Can bình hoà' };
  }
  function menhRel(ha, hb) {
    const r = hanhRel(ha, hb);
    return { sinh: { k: 'sinh', diem: 14, ten: ha + ' sinh ' + hb + ' (tương sinh)' }, duocsinh: { k: 'sinh', diem: 14, ten: hb + ' sinh ' + ha + ' (tương sinh)' },
      hoa: { k: 'hoa', diem: 6, ten: 'Cùng hành ' + ha + ' (bình hoà)' }, khac: { k: 'khac', diem: -12, ten: ha + ' khắc ' + hb + ' (tương khắc)' },
      bikhac: { k: 'khac', diem: -12, ten: hb + ' khắc ' + ha + ' (tương khắc)' } }[r];
  }
  function ptScore(ls) {
    const c = cungByTen(ls, 'Phu Thê'); let s = 0; c.sao.forEach(n => { s += PT_W[n] || 0; });
    if (!c.chinh.length) s -= 1;
    return { cung: c, diem: Math.max(-12, Math.min(14, s)) };
  }
  // Phần trăm hợp = 50 + tuổi(chi) + can + bản mệnh + Phu Thê A/2 + Phu Thê B/2 + Mệnh người kia rơi vào tam hợp/lục hợp Phu Thê, giới hạn 25..97
  function soHop(A, B) {
    const tuoi = chiRel(A.yChi, B.yChi), can = canRel(A.yCan, B.yCan), menh = menhRel(A.banMenh.hanh, B.banMenh.hanh);
    const ptA = ptScore(A), ptB = ptScore(B);
    const cross = (X, Y) => { const p = cungByTen(X, 'Phu Thê').pos, r = chiRel(p, Y.yChi); return (r.k === 'tamhop' || r.k === 'luchop' || r.k === 'trung') ? 5 : (r.k === 'xung' ? -4 : 0); };
    const cAB = cross(A, B), cBA = cross(B, A);
    const raw = 50 + tuoi.diem + can.diem + menh.diem + ptA.diem / 2 + ptB.diem / 2 + cAB + cBA;
    const percent = Math.max(25, Math.min(97, Math.round(raw)));
    const to100 = (v, lo, hi) => Math.round(20 + 78 * (v - lo) / (hi - lo));
    const truc = { 'Tuổi (con giáp)': to100(tuoi.diem, -14, 16), 'Can năm': to100(can.diem, -6, 10), 'Bản mệnh': to100(menh.diem, -12, 14),
      ['Phu Thê ' + 'A']: to100(ptA.diem, -12, 14), ['Phu Thê ' + 'B']: to100(ptB.diem, -12, 14), 'Duyên chéo': to100(cAB + cBA, -8, 10) };
    return { percent, tuoi, can, menh, ptA, ptB, cAB, cBA, truc, raw };
  }
  const API = { solar2lunar, jdFromDate, lapLaSo, soHop, chiRel, canRel, menhRel, hanhRel, napAm, CAN, CHI, GIO, CUNG, CHINH_TINH, CON_GIAP, NAP_AM };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TuVi = API;
})(typeof window !== 'undefined' ? window : globalThis);
