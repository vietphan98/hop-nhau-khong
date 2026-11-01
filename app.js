const NUMS=[1,2,3,4,5,6,7,8,9,11,22,33];
const PY={a:1,j:1,s:1,b:2,k:2,t:2,c:3,l:3,u:3,d:4,m:4,v:4,e:5,n:5,w:5,f:6,o:6,x:6,g:7,p:7,y:7,h:8,q:8,z:8,i:9,r:9};
const VOW='aeiouy';
const dsum=n=>String(n).split('').reduce((s,d)=>s+ +d,0);
function red(n,keep=true){const st=[n];while(n>9&&!(keep&&[11,22,33].includes(n))){n=dsum(n);st.push(n);}return {v:n,st};}
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z ]/g,'');
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function nameNum(name,filter,label){const letters=[...norm(name).replace(/ /g,'')].filter(filter);const sum=letters.reduce((s,c)=>s+PY[c],0);const r=red(sum||9);
 return {v:r.v,txt:`${label}: ${letters.map(c=>c.toUpperCase()+'='+PY[c]).join(' + ')} = ${r.st.join(' → ')}`};}
function calc(name,dob){
 const [y,m,d]=dob.split('-').map(Number);const dig=dob.replace(/\D/g,'');
 const lp=red(dsum(dig));const bd=red(d);const pyr=red(dsum(2027)+dsum(m)+dsum(d),false);
 const des=nameNum(name,c=>PY[c],'Sứ mệnh (tất cả chữ cái)');const soul=nameNum(name,c=>VOW.includes(c),'Linh hồn (nguyên âm)');const per=nameNum(name,c=>!VOW.includes(c),'Nhân cách (phụ âm)');
 return {name,lp:lp.v,des:des.v,soul:soul.v,per:per.v,bd:bd.v,py:pyr.v,seed:hash(norm(name)+dob),
  steps:[`Chủ đạo: ${dig.split('').join('+')} = ${lp.st.join(' → ')}`,des.txt,soul.txt,per.txt,`Ngày sinh: ${d} → ${bd.v}`,`Năm cá nhân 2027: (2+0+2+7) + (${m}) + (${d}) → ${pyr.st.join(' → ')}`]};}
const base=n=>n>9?dsum(n):n;
const GRP=[[1,5,7],[2,4,8],[3,6,9]];
function harm(a,b){a=base(a);b=base(b);if(a===b)return .72;if(GRP.some(g=>g.includes(a)&&g.includes(b)))return .95;
 const t=[[1,8],[4,5],[3,4],[7,8],[1,6],[5,6],[2,5],[7,9],[4,9]];if(t.some(p=>p.includes(a)&&p.includes(b)))return .15;return .5-Math.abs(a-b)*.03;}
const pick=(arr,seed,k=0)=>arr&&arr.length?arr[(seed+k*7)%arr.length]:'';
const pairKey=(a,b)=>a<=b?a+'-'+b:b+'-'+a;
function score(A,B){const h=.35*harm(A.lp,B.lp)+.2*harm(A.des,B.des)+.2*harm(A.soul,B.soul)+.15*harm(A.per,B.per)+.1*harm(A.bd,B.bd);return Math.max(12,Math.min(99,Math.round(40+120*(h-.3))));}
const MUCS=[[85,'Rất hợp 💞','Hai bạn có nhiều điểm bổ trợ tự nhiên, chỉ cần giữ thói quen nói chuyện với nhau.'],[70,'Khá hợp 💗','Có nền tảng tốt, thỉnh thoảng lệch nhịp nhưng dễ hiểu nhau.'],[55,'Cần vun đắp 🤝','Khác nhau khá nhiều, hợp hay không tùy vào cách hai bạn lắng nghe.'],[0,'Khác biệt lớn 🌗','Hai cách sống khác nhau rõ, cần kiên nhẫn và tôn trọng nhiều hơn.']];
function compose(A,B){const s=(A.seed^B.seed)>>>0;const sec=(k,na,nb)=>`${A.name}: ${pick(SO[na][k],A.seed,k.length)} ${B.name}: ${pick(SO[nb][k],B.seed,k.length)}`;
 return {pair:pick(CAP[pairKey(A.lp,B.lp)],s)+' '+(A.soul!==B.soul?'Về mong muốn bên trong: '+pick(CAP[pairKey(A.soul,B.soul)],s>>3,1):''),
  tc1:pick(SO[A.lp].tinhcach,A.seed),tc2:pick(SO[B.lp].tinhcach,B.seed),
  love:sec('tinhyeu',A.soul,B.soul),career:sec('suynghiep',A.des,B.des),money:sec('tailoc',A.per,B.per),y27:sec('nam2027',A.py,B.py)};}
function radar(A,B){return [harm(A.per,B.per),harm(A.lp,B.lp),harm(A.soul,B.soul),harm(A.des,B.des),harm(A.py,B.py)].map((h,i)=>Math.round(25+72*h-(i*(A.bd+B.bd))%9));}
function months(A,B){return Array.from({length:12},(_,i)=>{const p1=red(A.py+i+1,false).v,p2=red(B.py+i+1,false).v;return Math.round(20+75*harm(p1,p2)+((p1*p2)%7)-3);});}
function search(q){q=q.toLowerCase();const ns=(q.match(/\d+/g)||[]).map(Number).filter(n=>NUMS.includes(n));
 if(ns.length>=2){const k=pairKey(ns[0],ns[1]);return `<h4>Cặp số ${ns[0]} và ${ns[1]}</h4>`+CAP[k].map(t=>`<p>${t}</p>`).join('');}
 if(ns.length===1){const o=SO[ns[0]];return `<h4>Số ${ns[0]} – ${NHAN_SO[ns[0]]}</h4>`+[['Tính cách','tinhcach'],['Tình yêu','tinhyeu'],['Sự nghiệp','suynghiep'],['Tài lộc','tailoc'],['Năm cá nhân 2027','nam2027']].map(([t,k])=>`<p><b>${t}:</b> ${o[k].join(' ')}</p>`).join('');}
 return '<p class="error-msg">Không tìm thấy. Hãy nhập một số trong 1–9, 11, 22, 33 (vd "số 7") hoặc một cặp (vd "1 và 5").</p>';}
document.addEventListener('DOMContentLoaded',()=>{const $=id=>document.getElementById(id);const charts={};
 const draw=(k,id,cfg)=>{if(charts[k])charts[k].destroy();if(window.Chart)charts[k]=new Chart($(id).getContext('2d'),cfg);};
 $('btnSearch').onclick=()=>{$('searchOut').innerHTML=search($('q').value);};$('q').onkeydown=e=>{if(e.key==='Enter')$('btnSearch').click();};
 $('btnCalc').onclick=()=>{const n1=$('name1').value.trim(),d1=$('dob1').value,n2=$('name2').value.trim(),d2=$('dob2').value;
  if(!n1||!d1||!n2||!d2){$('errorMsg').innerText='Vui lòng nhập đầy đủ tên và ngày sinh của cả hai nhé!';return;}$('errorMsg').innerText='';
  const A=calc(n1,d1),B=calc(n2,d2),pc=score(A,B),c=compose(A,B),lv=MUCS.find(x=>pc>=x[0]);
  $('resName1').innerText=n1;$('resName2').innerText=n2;$('percentVal').innerText=pc;$('resLevel').innerText=lv[1];
  $('resSummary').innerText=`${lv[2]} (Chủ đạo ${A.lp} × ${B.lp}, Linh hồn ${A.soul} × ${B.soul}, Sứ mệnh ${A.des} × ${B.des})`;
  $('cdao1').innerText=A.lp;$('lhon1').innerText=A.soul;$('cdao2').innerText=B.lp;$('lhon2').innerText=B.soul;
  $('derive').innerHTML=[A,B].map(P=>`<b>${P.name}</b><br>`+P.steps.join('<br>')).join('<br><br>');
  $('pairText').innerText=c.pair;
  $('tcTitle1').innerText=`${n1} · Số ${A.lp} – ${NHAN_SO[A.lp]}`;$('tcText1').innerText=c.tc1;$('tcTitle2').innerText=`${n2} · Số ${B.lp} – ${NHAN_SO[B.lp]}`;$('tcText2').innerText=c.tc2;
  $('luan-tinhyeu').innerText=c.love;$('luan-suynghiep').innerText=c.career;$('luan-tailoc').innerText=c.money;$('luan-nam2027').innerText=`Năm cá nhân 2027: ${A.name} số ${A.py}, ${B.name} số ${B.py}. `+c.y27;
  const r=radar(A,B),mo=months(A,B);
  draw('g','gaugeChart',{type:'doughnut',data:{datasets:[{data:[pc,100-pc],backgroundColor:['#fff','rgba(255,255,255,.3)'],borderWidth:0,circumference:180,rotation:270}]},options:{cutout:'80%',maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false}}}});
  draw('r','radar',{type:'radar',data:{labels:['Giao tiếp','Tin tưởng','Lãng mạn','Mục tiêu chung','Đồng hành 2027'],datasets:[{data:r,backgroundColor:'rgba(72,52,212,.2)',borderColor:'#4834d4'}]},options:{scales:{r:{min:0,max:100,ticks:{display:false}}},plugins:{legend:{display:false}}}});
  draw('m','months',{type:'bar',data:{labels:mo.map((_,i)=>'T'+(i+1)),datasets:[{data:mo,backgroundColor:mo.map(v=>v>75?'#6c5ce7':'#a29bfe')}]},options:{scales:{y:{min:0,max:100}},plugins:{legend:{display:false}}}});
  const mx=Math.max(...mo),mn=Math.min(...mo);$('maxMonthNote').innerText=`✨ Tháng hợp nhất: Tháng ${mo.indexOf(mx)+1} (${mx})`;$('minMonthNote').innerText=`🤝 Tháng nên nhường nhau: Tháng ${mo.indexOf(mn)+1} (${mn})`;
  $('result').dataset.ready='1';$('result').classList.remove('hidden');$('result').scrollIntoView({behavior:'smooth'});};
 $('btnSample').onclick=()=>{$('name1').value='Nguyễn Minh Anh';$('dob1').value='1996-07-20';$('name2').value='Trần Gia Bảo';$('dob2').value='1998-06-17';};
 $('btnReset').onclick=()=>{window.scrollTo({top:0,behavior:'smooth'});$('result').classList.add('hidden');['name1','name2','dob1','dob2'].forEach(i=>$(i).value='');};
 $('btnSave').onclick=()=>html2canvas($('card'),{scale:2}).then(cv=>{const a=document.createElement('a');a.download='hop-nhau.png';a.href=cv.toDataURL();a.click();});
});
