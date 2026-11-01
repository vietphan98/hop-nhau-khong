document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        name1: document.getElementById('name1'),
        dob1: document.getElementById('dob1'),
        name2: document.getElementById('name2'),
        dob2: document.getElementById('dob2'),
        btnCalc: document.getElementById('btnCalc'),
        btnSample: document.getElementById('btnSample'),
        btnSave: document.getElementById('btnSave'),
        btnReset: document.getElementById('btnReset'),
        errorMsg: document.getElementById('errorMsg'),
        resultSec: document.getElementById('result'),
        // Result fields
        resName1: document.getElementById('resName1'),
        resName2: document.getElementById('resName2'),
        percentVal: document.getElementById('percentVal'),
        resLevel: document.getElementById('resLevel'),
        resSummary: document.getElementById('resSummary'),
        cdao1: document.getElementById('cdao1'),
        lhon1: document.getElementById('lhon1'),
        cdao2: document.getElementById('cdao2'),
        lhon2: document.getElementById('lhon2'),
        tcTitle1: document.getElementById('tcTitle1'),
        tcText1: document.getElementById('tcText1'),
        tcTitle2: document.getElementById('tcTitle2'),
        tcText2: document.getElementById('tcText2'),
        luanTinhYeu: document.getElementById('luan-tinhyeu'),
        luanSuyNghiep: document.getElementById('luan-suynghiep'),
        luanTaiLoc: document.getElementById('luan-tailoc'),
        luanNam2027: document.getElementById('luan-nam2027'),
        maxMonthNote: document.getElementById('maxMonthNote'),
        minMonthNote: document.getElementById('minMonthNote')
    };

    let charts = {
        gauge: null,
        radar: null,
        months: null
    };

    // --- Numerology Logic ---

    function getSumDigits(n) {
        return String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
    }

    function reduceNum(n, stopAtSpecial = true) {
        let current = n;
        while (current > 9) {
            if (stopAtSpecial && [11, 22, 33].includes(current)) break;
            current = getSumDigits(current);
        }
        return current;
    }

    function calculateMainNum(dobString) {
        const digitsOnly = dobString.replace(/\D/g, '');
        const sum = digitsOnly.split('').reduce((a, b) => a + parseInt(b), 0);
        return reduceNum(sum);
    }

    function calculateSoulNum(name) {
        const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd');
        const pythagoras = {
            a: 1, j: 1, s: 1,
            b: 2, k: 2, t: 2,
            c: 3, l: 3, u: 3,
            d: 4, m: 4, v: 4,
            e: 5, n: 5, w: 5,
            f: 6, o: 6, x: 6,
            g: 7, p: 7, y: 7,
            h: 8, q: 8, z: 8,
            i: 9, r: 9
        };
        const vowels = 'aeiouy';
        let sum = 0;
        for (let char of normalized) {
            if (vowels.includes(char) && pythagoras[char]) {
                sum += pythagoras[char];
            }
        }
        return sum === 0 ? 0 : reduceNum(sum);
    }

    function getBase(n) {
        if (n === 11) return 2;
        if (n === 22) return 4;
        if (n === 33) return 6;
        return n;
    }

    function checkPair(a, b, list) {
        return list.some(pair => (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a));
    }

    function getPairScore(n1, n2) {
        const b1 = getBase(n1);
        const b2 = getBase(n2);
        if (checkPair(b1, b2, NHOM.hop)) return 90;
        if (checkPair(b1, b2, NHOM.ky)) return 45;
        if (b1 === b2) return 75;
        return 65;
    }

    // --- UI Helpers ---

    function destroyCharts() {
        Object.keys(charts).forEach(key => {
            if (charts[key]) {
                charts[key].destroy();
                charts[key] = null;
            }
        });
    }

    function drawGauge(percent) {
        const ctx = document.getElementById('gaugeChart').getContext('2d');
        charts.gauge = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percent, 100 - percent],
                    backgroundColor: ['#ffffff', 'rgba(255, 255, 255, 0.3)'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270,
                    borderRadius: 10
                }]
            },
            options: {
                cutout: '80%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    }

    function drawRadar(percent, c1, c2, l1, l2) {
        const ctx = document.getElementById('radar').getContext('2d');
        const dataValues = DIEM_MANH.map((_, i) => {
            const val = percent + ((c1 * 7 + c2 * 3 + l1 + l2 * (i + 1) + i * 13) % 21) - 10;
            return Math.max(25, Math.min(99, val));
        });

        charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: DIEM_MANH,
                datasets: [{
                    label: 'Điểm',
                    data: dataValues,
                    backgroundColor: 'rgba(72, 52, 212, 0.2)',
                    borderColor: '#4834d4',
                    pointBackgroundColor: '#4834d4'
                }]
            },
            options: {
                scales: {
                    r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#eee' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    function drawMonths(percent, c1, c2, l1) {
        const ctx = document.getElementById('months').getContext('2d');
        const labels = Array.from({length: 12}, (_, i) => `T${i+1}`);
        const dataValues = labels.map((_, i) => {
            const m = i + 1;
            const val = percent + ((c1 * 5 + c2 * 3 + l1) * m * m + m * 11) % 31 - 15;
            return Math.max(20, Math.min(99, val));
        });

        charts.months = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: dataValues.map(v => v > 80 ? '#6c5ce7' : '#a29bfe'),
                    borderRadius: 5
                }]
            },
            options: {
                scales: { y: { min: 0, max: 100 } },
                plugins: { legend: { display: false } }
            }
        });

        const maxVal = Math.max(...dataValues);
        const minVal = Math.min(...dataValues);
        const maxMonth = dataValues.indexOf(maxVal) + 1;
        const minMonth = dataValues.indexOf(minVal) + 1;

        elements.maxMonthNote.innerText = `✨ Tháng cao nhất: Tháng ${maxMonth}`;
        elements.minMonthNote.innerText = `🤝 Tháng nên nhường nhau: Tháng ${minMonth}`;
    }

    // --- Main Action ---

    elements.btnCalc.addEventListener('click', () => {
        const n1 = elements.name1.value.trim();
        const d1 = elements.dob1.value;
        const n2 = elements.name2.value.trim();
        const d2 = elements.dob2.value;

        if (!n1 || !d1 || !n2 || !d2) {
            elements.errorMsg.innerText = 'Vui lòng nhập đầy đủ tên và ngày sinh của cả hai nhé!';
            return;
        }
        elements.errorMsg.innerText = '';

        const cd1 = calculateMainNum(d1);
        const cd2 = calculateMainNum(d2);
        const lh1 = calculateSoulNum(n1);
        const lh2 = calculateSoulNum(n2);

        const scoreCD = getPairScore(cd1, cd2);
        const scoreLH = getPairScore(lh1, lh2);
        let percent = Math.round(0.6 * scoreCD + 0.4 * scoreLH);
        percent = Math.max(30, Math.min(98, percent));

        // Update UI
        elements.resName1.innerText = n1;
        elements.resName2.innerText = n2;
        elements.percentVal.innerText = percent;
        elements.cdao1.innerText = cd1;
        elements.lhon1.innerText = lh1;
        elements.cdao2.innerText = cd2;
        elements.lhon2.innerText = lh2;

        const levelObj = MUC.find(m => percent >= m.min);
        elements.resLevel.innerText = levelObj.ten;
        elements.resSummary.innerText = levelObj.tom;

        elements.tcTitle1.innerText = `Tính cách của ${n1} · Số ${cd1}`;
        elements.tcText1.innerText = TINH_CACH[cd1];
        elements.tcTitle2.innerText = `Tính cách của ${n2} · Số ${cd2}`;
        elements.tcText2.innerText = TINH_CACH[cd2];

        const mucKey = percent >= 78 ? 'cao' : (percent >= 60 ? 'kha' : 'thap');
        elements.luanTinhYeu.innerText = LUAN.tinhyeu[mucKey];
        elements.luanSuyNghiep.innerText = LUAN.suynghiep[mucKey];
        elements.luanTaiLoc.innerText = LUAN.tailoc[mucKey];
        elements.luanNam2027.innerText = LUAN.nam2027[mucKey];

        destroyCharts();
        drawGauge(percent);
        drawRadar(percent, cd1, cd2, lh1, lh2);
        drawMonths(percent, cd1, cd2, lh1);

        elements.resultSec.classList.remove('hidden');
        elements.resultSec.scrollIntoView({ behavior: 'smooth' });
    });

    elements.btnSample.addEventListener('click', () => {
        elements.name1.value = 'Nguyễn Minh Anh';
        elements.dob1.value = '1996-07-20';
        elements.name2.value = 'Trần Gia Bảo';
        elements.dob2.value = '1998-06-17';
        elements.errorMsg.innerText = '';
    });

    elements.btnReset.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            elements.resultSec.classList.add('hidden');
            elements.name1.value = '';
            elements.name2.value = '';
            elements.dob1.value = '';
            elements.dob2.value = '';
        }, 500);
    });

    elements.btnSave.addEventListener('click', () => {
        const card = document.getElementById('card');
        html2canvas(card, { scale: 2, useCORS: true }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'hop-nhau.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
});
