// Giao diện chế độ "Theo tử vi" (tham khảo, giải trí) — Việt Phan
(function () {
  'use strict';
  const T = window.TuVi, $ = id => document.getElementById(id);
  const TEXT = window.TUVI_TEXT || {};
  // ---- Lời bình quan hệ (soạn tay) ----
  const TUOI_TXT = {
    tamhop: (a, b) => `Tuổi ${a} và ${b} nằm cùng một nhóm tam hợp: dễ chung chí hướng, làm gì cũng có người tiếp sức, ít khi "nói một đằng hiểu một nẻo".`,
    luchop: (a, b) => `${a} và ${b} là cặp lục hợp: kiểu "hai mảnh ghép", người này bù chỗ thiếu của người kia, ở lâu càng thấy dễ chịu.`,
    trung: (a) => `Hai bạn cùng tuổi ${a}: hiểu nhau nhanh vì giống nhau, nhưng cũng dễ cùng nóng một lúc. Nhường nhau một nhịp là ổn.`,
    xung: (a, b) => `${a} và ${b} đứng đối diện nhau trên vòng 12 con giáp (lục xung): tính cách trái chiều, dễ tranh luận. Hợp hay không nằm ở cách hai bạn nói chuyện với nhau.`,
    hai: (a, b) => `${a} và ${b} thuộc cặp lục hại: hay hiểu lầm vì chuyện nhỏ. Nói rõ ràng, đừng để bụng là gỡ được.`,
    hinh: (a, b) => `${a} và ${b} cùng nhóm tứ hành xung nhưng không đối diện: thỉnh thoảng va nhau về cách làm, không phải chuyện lớn.`,
    binh: (a, b) => `${a} và ${b} không hợp cũng không xung: mối quan hệ do chính hai bạn vun đắp là chính.`
  };
  const CAN_TXT = {
    hop: 'Can năm sinh "ngũ hợp": kiểu hai người dễ nhường nhau, dễ tìm điểm chung khi bàn chuyện lớn.',
    pha: 'Can năm sinh khắc nhau: mỗi người một cách làm, cần thống nhất trước khi quyết việc chung.',
    trung: 'Cùng can năm: cách nghĩ giống nhau, hợp làm chung nhưng nên có người chịu lùi khi bất đồng.',
    binh: 'Can năm bình hoà: không cộng không trừ, không ảnh hưởng nhiều.'
  };
  const HANH_TINH = { Kim: 'rõ ràng, quyết đoán', Thủy: 'mềm mỏng, linh hoạt', Mộc: 'hiền, thích vun đắp', Hỏa: 'nhiệt tình, nhanh nhẹn', Thổ: 'chắc chắn, đáng tin' };
  const MENH_TXT = {
    sinh: (a, b) => `Bản mệnh tương sinh (${a} – ${b}): người ${HANH_TINH[a]} gặp người ${HANH_TINH[b]}, kiểu một người "tiếp sức" cho người kia.`,
    hoa: (a) => `Cùng hành ${a}: hai người đều ${HANH_TINH[a]}, dễ đồng cảm, chỉ cần tránh cùng cố chấp.`,
    khac: (a, b) => `Bản mệnh tương khắc (${a} – ${b}): một bên ${HANH_TINH[a]}, một bên ${HANH_TINH[b]}, nhịp sống khác nhau nên cần kiên nhẫn hơn.`
  };
  const MUC = [
    { min: 82, ten: 'Rất hợp', tom: 'Nhiều yếu tố cùng thuận, kiểu hai người "nói là hiểu".' },
    { min: 68, ten: 'Khá hợp', tom: 'Điểm thuận nhiều hơn điểm vướng, chịu khó lắng nghe là bền.' },
    { min: 52, ten: 'Hợp vừa', tom: 'Có thuận có vướng, hợp hay không do cách hai bạn đối xử.' },
    { min: 0, ten: 'Cần vun đắp', tom: 'Nhiều điểm khác nhau, nhưng khác nhau cũng có thể bù cho nhau.' }];

  const GIO_LABEL = T.GIO.map((g, i) => T.CHI[i] + ' · ' + g);
  const state = { gio: { 1: null, 2: null }, sex: { 1: null, 2: null }, ls: [], cur: 0, charts: {} };

  // ---- Nhập ----
  document.querySelectorAll('.gio-grid').forEach(box => {
    const p = box.dataset.for;
    box.innerHTML = GIO_LABEL.map((g, i) => `<button type="button" class="chip gio" data-gio="${i}"><b>${T.CHI[i]}</b><small>${T.GIO[i]}</small></button>`).join('');
    box.addEventListener('click', e => { const b = e.target.closest('[data-gio]'); if (!b) return; setGio(p, +b.dataset.gio); });
  });
  document.querySelectorAll('.sex-row').forEach(box => {
    const p = box.dataset.for;
    box.addEventListener('click', e => { const b = e.target.closest('[data-sex]'); if (!b) return; setSex(p, b.dataset.sex); });
  });
  function setGio(p, g) { state.gio[p] = g; document.querySelectorAll(`.gio-grid[data-for="${p}"] .chip`).forEach(c => c.classList.toggle('active', +c.dataset.gio === g)); }
  function setSex(p, s) { state.sex[p] = s; document.querySelectorAll(`.sex-row[data-for="${p}"] .chip`).forEach(c => c.classList.toggle('active', c.dataset.sex === s)); }
  function parseDob(s) {
    const m = String(s).trim().match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})$/);
    if (!m) return null;
    const d = +m[1], mo = +m[2], y = +m[3];
    const dt = new Date(y, mo - 1, d);
    if (y < 1900 || y > 2099 || dt.getDate() !== d || dt.getMonth() !== mo - 1) return null;
    return { d, m: mo, y };
  }

  // ---- Tính ----
  function readPerson(p) {
    const name = $('tvName' + p).value.trim(), dob = parseDob($('tvDob' + p).value);
    if (!name) return 'Nhập họ tên ' + (p === '1' ? 'của bạn' : 'người ấy') + ' nhé.';
    if (!dob) return 'Ngày sinh ' + (p === '1' ? 'của bạn' : 'người ấy') + ' chưa đúng dạng ngày/tháng/năm (vd 20/07/1996).';
    if (state.gio[p] === null) return 'Chọn giờ sinh ' + (p === '1' ? 'của bạn' : 'người ấy') + ' (không nhớ thì chọn gần đúng).';
    if (!state.sex[p]) return 'Chọn giới tính ' + (p === '1' ? 'của bạn' : 'người ấy') + ' (tử vi an sao theo giới tính).';
    return { name, ...dob, gio: state.gio[p], nam: state.sex[p] === 'nam' };
  }
  function calc() {
    const a = readPerson('1'), b = readPerson('2');
    const err = typeof a === 'string' ? a : (typeof b === 'string' ? b : '');
    if (err) { $('tvError').innerText = err; return; }
    $('tvError').innerText = '';
    const A = T.lapLaSo(a), B = T.lapLaSo(b); A.name = a.name; B.name = b.name;
    const R = T.soHop(A, B);
    state.ls = [A, B]; state.cur = 0;
    render(A, B, R);
    $('tvResult').classList.remove('hidden');
    $('tvResult').scrollIntoView({ behavior: 'smooth' });
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const amStr = L => `${L.day}/${L.month}${L.leap ? ' (nhuận)' : ''}/${L.year}`;
  const sign = n => (n > 0 ? '+' : '') + (Math.round(n * 10) / 10);
  function ptText(ls) {
    const c = ls.cungs.find(x => x.ten === 'Phu Thê');
    const list = c.chinh.length ? c.chinh.join(', ') : 'không có chính tinh';
    const lead = c.chinh[0] || 'Vô Chính Diệu';
    const t = (TEXT[lead] || {})['Phu Thê'] || '';
    return `Cung Phu Thê của ${esc(ls.name)} ở ${c.chi} có ${list}${c.sao.length > c.chinh.length ? ' (kèm ' + c.sao.filter(s => !c.chinh.includes(s)).join(', ') + ')' : ''}. ${t}`;
  }
  function render(A, B, R) {
    $('tvResName1').innerText = A.name; $('tvResName2').innerText = B.name;
    $('tvPercent').innerText = R.percent;
    const muc = MUC.find(m => R.percent >= m.min);
    $('tvLevel').innerText = muc.ten;
    $('tvSummary').innerText = `${muc.tom} ${R.tuoi.ten} · ${R.menh.ten.replace(/ \(.*\)/, '')}.`;
    $('tvAge1').innerText = A.namCanChi; $('tvMenh1').innerText = A.banMenh.ten;
    $('tvAge2').innerText = B.namCanChi; $('tvMenh2').innerText = B.banMenh.ten;
    const ca = T.CHI[A.yChi] + ' (' + A.conGiap + ')', cb = T.CHI[B.yChi] + ' (' + B.conGiap + ')';
    const items = [
      ['🐾 Tuổi con giáp', R.tuoi.ten, R.tuoi.diem, TUOI_TXT[R.tuoi.k](ca, cb)],
      ['🔟 Can năm sinh', R.can.ten, R.can.diem, CAN_TXT[R.can.k]],
      ['🌿 Bản mệnh', `${A.banMenh.ten} – ${B.banMenh.ten}`, R.menh.diem, MENH_TXT[R.menh.k](A.banMenh.hanh, B.banMenh.hanh)],
      ['💞 Phu Thê của ' + A.name, '', R.ptA.diem / 2, ptText(A)],
      ['💞 Phu Thê của ' + B.name, '', R.ptB.diem / 2, ptText(B)],
      ['🔗 Duyên chéo', 'Tuổi người kia so với cung Phu Thê', R.cAB + R.cBA,
        `Cung Phu Thê của ${A.name} ở ${T.CHI[A.cungs[10].pos]}, tuổi ${B.name} là ${T.CHI[B.yChi]}; Phu Thê của ${B.name} ở ${T.CHI[B.cungs[10].pos]}, tuổi ${A.name} là ${T.CHI[A.yChi]}. ` +
        (R.cAB + R.cBA > 0 ? 'Có điểm "chạm" nhau: tuổi người này hợp với cung vợ chồng của người kia.' : (R.cAB + R.cBA < 0 ? 'Có điểm xung nhẹ giữa tuổi và cung vợ chồng, nên nhường nhau hơn.' : 'Không hợp không xung, trung tính.'))]];
    $('tvFactorList').innerHTML = items.map(([h, s, d, t]) =>
      `<li><div class="f-head"><b>${esc(h)}</b><span class="f-pt ${d > 0 ? 'up' : (d < 0 ? 'down' : '')}">${sign(d)}</span></div>${s ? `<div class="f-sub">${esc(s)}</div>` : ''}<p>${esc(t)}</p></li>`).join('') +
      `<li class="f-formula">Công thức: 50 + tuổi + can + bản mệnh + ½ Phu Thê mỗi người + duyên chéo = ${Math.round(R.raw * 10) / 10} → ${R.percent}% (giới hạn 25–97).</li>`;
    drawCharts(R, A, B);
    $('tvStepsBody').innerHTML = [A, B].map(steps).join('');
    $('tvLs1').innerText = A.name; $('tvLs2').innerText = B.name;
    showLaSo(0);
    $('tvSearch').value = ''; $('tvSearchOut').innerHTML = '';
  }
  function steps(ls) {
    const L = ls.lunar, i = ls.input;
    const leap = L.leap ? `<br>⚠️ Sinh vào <b>tháng ${L.month} nhuận</b>: ${L.day <= 15 ? 'nửa đầu tháng nên an sao như tháng ' + L.month : 'nửa sau tháng nên an sao như tháng ' + ls.thangAn}.` : '';
    return `<div class="step-box"><b>${esc(ls.name)}</b> (${ls.amDuong})<br>
      Dương lịch ${String(i.d).padStart(2, '0')}/${String(i.m).padStart(2, '0')}/${i.y} → <b>Âm lịch ${amStr(L)}</b>${leap}<br>
      Năm <b>${ls.namCanChi}</b> (${ls.conGiap}) · tháng ${ls.thangCanChi} · ngày ${ls.ngayCanChi} · giờ ${ls.gioCanChi}<br>
      Bản mệnh: <b>${ls.banMenh.ten}</b> (hành ${ls.banMenh.hanh})<br>
      Mệnh an tại <b>${ls.menhChi}</b> (từ Dần đếm thuận tới tháng ${ls.thangAn}, đếm nghịch tới giờ ${T.CHI[i.gio]}), Thân cư <b>${ls.thanCung}</b><br>
      Cung Mệnh ${ls.cungs[0].can} ${ls.cungs[0].chi} nạp âm ${ls.menhNapAm.ten} → <b>${ls.cucTen}</b>; ngày ${L.day} → Tử Vi tại ${T.CHI[ls.tuViPos]}<br>
      Đại hạn đi ${ls.thuan ? 'thuận' : 'nghịch'}, khởi ${ls.cuc} tuổi tại cung Mệnh.</div>`;
  }
  function drawCharts(R, A, B) {
    Object.values(state.charts).forEach(c => c && c.destroy());
    state.charts.g = new Chart($('tvGauge').getContext('2d'), { type: 'doughnut',
      data: { datasets: [{ data: [R.percent, 100 - R.percent], backgroundColor: ['#ffffff', 'rgba(255,255,255,0.3)'], borderWidth: 0, circumference: 180, rotation: 270, borderRadius: 10 }] },
      options: { cutout: '80%', responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, plugins: { legend: { display: false }, tooltip: { enabled: false } } } });
    const labels = Object.keys(R.truc).map(k => k.replace('Phu Thê A', 'Phu Thê ' + A.name.split(' ').pop()).replace('Phu Thê B', 'Phu Thê ' + B.name.split(' ').pop()));
    state.charts.r = new Chart($('tvRadar').getContext('2d'), { type: 'radar',
      data: { labels, datasets: [{ label: 'Điểm', data: Object.values(R.truc), backgroundColor: 'rgba(232,67,147,0.18)', borderColor: '#e84393', pointBackgroundColor: '#e84393' }] },
      options: { scales: { r: { min: 0, max: 100, ticks: { display: false }, pointLabels: { font: { size: 11 } } } }, plugins: { legend: { display: false } } } });
  }
  // Bố cục lá số truyền thống: hàng 1 Tỵ Ngọ Mùi Thân, ... hàng 4 Dần Sửu Tý Hợi
  const GRID = [[5, 1, 1], [6, 1, 2], [7, 1, 3], [8, 1, 4], [4, 2, 1], [9, 2, 4], [3, 3, 1], [10, 3, 4], [2, 4, 1], [1, 4, 2], [0, 4, 3], [11, 4, 4]];
  const CHINH = new Set(T.CHINH_TINH);
  function showLaSo(k) {
    state.cur = k; const ls = state.ls[k];
    $('tvLs1').classList.toggle('active', k === 0); $('tvLs2').classList.toggle('active', k === 1);
    const byPos = {}; ls.cungs.forEach(c => { byPos[c.pos] = c; });
    let html = GRID.map(([pos, r, col]) => {
      const c = byPos[pos];
      const chinh = c.chinh.map(s => `<span class="s-chinh">${s}</span>`).join('') || '<span class="s-vcd">Vô chính diệu</span>';
      const phu = c.sao.filter(s => !CHINH.has(s)).map(s => `<span class="s-phu${/^Hóa/.test(s) ? ' s-hoa' : ''}">${s}</span>`).join('');
      return `<div class="ls-cell${c.ten === 'Mệnh' ? ' is-menh' : ''}${c.ten === 'Phu Thê' ? ' is-pt' : ''}" style="grid-row:${r};grid-column:${col}" data-cung="${c.ten}">
        <div class="ls-top"><b>${c.ten}${c.than ? ' · Thân' : ''}</b><i>${c.daiHan}</i></div><div class="ls-chi">${c.can} ${c.chi}</div>${chinh}<div class="ls-phu">${phu}</div></div>`;
    }).join('');
    html += `<div class="ls-center" style="grid-row:2/4;grid-column:2/4"><b>${esc(ls.name)}</b><span>${ls.amDuong}</span><span>Âm lịch ${amStr(ls.lunar)}</span><span>Năm ${ls.namCanChi} · giờ ${T.CHI[ls.input.gio]}</span><span>${ls.banMenh.ten}</span><span>${ls.cucTen}</span></div>`;
    $('tvLaSo').innerHTML = html;
    renderGiai(ls);
  }
  function starText(star, cung) { return (TEXT[star] || {})[cung] || ''; }
  function renderGiai(ls) {
    $('tvGiaiTitle').innerText = 'Lời giải từng cung · ' + ls.name;
    $('tvGiai').innerHTML = ls.cungs.map(c => {
      const list = (c.chinh.length ? [] : ['Vô Chính Diệu']).concat(c.sao);
      return `<details class="giai" id="giai-${c.ten.replace(/\s/g, '')}"${c.ten === 'Mệnh' || c.ten === 'Phu Thê' ? ' open' : ''}><summary>Cung ${c.ten} · ${c.can} ${c.chi} <small>${c.sao.length} sao</small></summary>` +
        list.map(s => `<p><b class="${CHINH.has(s) ? 'c' : ''}">${s}:</b> ${esc(starText(s, c.ten))}</p>`).join('') + '</details>';
    }).join('');
  }
  $('tvLaSo').addEventListener('click', e => {
    const cell = e.target.closest('[data-cung]'); if (!cell) return;
    const d = $('giai-' + cell.dataset.cung.replace(/\s/g, '')); if (!d) return;
    d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('tvLs1').addEventListener('click', () => showLaSo(0));
  $('tvLs2').addEventListener('click', () => showLaSo(1));
  // ---- Tra cứu ----
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
  const ALL_STARS = Object.keys(TEXT).sort((a, b) => b.length - a.length);
  function search(q) {
    const nq = norm(q); if (!nq.trim()) { $('tvSearchOut').innerHTML = ''; return; }
    const star = ALL_STARS.find(s => nq.includes(norm(s)));
    const cung = T.CUNG.slice().sort((a, b) => b.length - a.length).find(c => nq.includes(norm(c)));
    if (!star) { $('tvSearchOut').innerHTML = `<p class="muted">Không thấy sao nào trong "${esc(q)}". Thử: Tử Vi, Thái Âm, Đào Hoa, Hóa Lộc…</p>`; return; }
    let out = '';
    if (state.ls.length) out += state.ls.map(ls => { const c = ls.cungs.find(x => x.sao.includes(star) || (star === 'Vô Chính Diệu' && !x.chinh.length)); return c ? `<p>📍 Lá số <b>${esc(ls.name)}</b>: ${star} ở cung <b>${c.ten}</b> (${c.chi}).</p>` : ''; }).join('');
    const cungs = cung ? [cung] : T.CUNG;
    out += cungs.map(c => `<p><b>${star} ở ${c}:</b> ${esc(starText(star, c))}</p>`).join('');
    $('tvSearchOut').innerHTML = out;
  }
  $('tvSearch').addEventListener('input', e => search(e.target.value));
  // ---- Nút ----
  $('tvBtnCalc').addEventListener('click', calc);
  $('tvBtnSample').addEventListener('click', () => {
    $('tvName1').value = 'Nguyễn Minh Anh'; $('tvDob1').value = '20/07/1996'; setGio('1', 4); setSex('1', 'nu');
    $('tvName2').value = 'Trần Gia Bảo'; $('tvDob2').value = '17/06/1998'; setGio('2', 6); setSex('2', 'nam');
    $('tvError').innerText = '';
  });
  $('tvBtnReset').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { $('tvResult').classList.add('hidden'); ['tvName1', 'tvName2', 'tvDob1', 'tvDob2'].forEach(i => { $(i).value = ''; }); ['1', '2'].forEach(p => { state.gio[p] = null; state.sex[p] = null; setGio(p, -1); setSex(p, ''); }); }, 500);
  });
  $('tvBtnSave').addEventListener('click', () => {
    html2canvas($('tvCard'), { scale: 2, useCORS: true }).then(cv => { const a = document.createElement('a'); a.download = 'hop-nhau-tu-vi.png'; a.href = cv.toDataURL('image/png'); a.click(); });
  });
  // ---- Tab ----
  function setMode(m) {
    $('modeTSH').classList.toggle('hidden', m !== 'tsh'); $('modeTuVi').classList.toggle('hidden', m !== 'tuvi');
    $('tabTSH').classList.toggle('active', m === 'tsh'); $('tabTuVi').classList.toggle('active', m === 'tuvi');
    $('subtitle').innerText = m === 'tuvi' ? 'Tử vi 2 người: lá số 12 cung (tham khảo, giải trí)' : 'Thần số học 2 người (tham khảo, giải trí)';
    if (history.replaceState) history.replaceState(null, '', m === 'tuvi' ? '#tuvi' : location.pathname + location.search);
  }
  $('tabTSH').addEventListener('click', () => setMode('tsh'));
  $('tabTuVi').addEventListener('click', () => setMode('tuvi'));
  if (location.hash === '#tuvi') setMode('tuvi');
  window.TuViUI = { search, showLaSo, state };
})();
