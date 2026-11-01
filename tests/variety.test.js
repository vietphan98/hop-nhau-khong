// Run: NODE_PATH=<playwright node_modules> node tests/variety.test.js [url]
const {chromium}=require('playwright');const path=require('path');
const url=process.argv[2]||'file://'+path.resolve(__dirname,'../index.html');
const C=[['Nguyễn Minh Anh','1996-07-20','Trần Gia Bảo','1998-06-17'],['Lê Thu Hà','1990-01-05','Phạm Quốc Huy','1988-11-29'],['Võ Thị Lan','2000-03-14','Đặng Văn Nam','1999-09-09'],['Hoàng Yến','1995-12-31','Bùi Đức Long','1993-04-22'],['Phan Quốc Việt','1998-08-08','Ngô Mỹ Linh','2001-02-11'],['Trịnh Khánh Vy','1997-05-03','Đỗ Tuấn Kiệt','1994-10-17'],['Mai Ngọc Trâm','1992-06-25','Lý Hải Đăng','1991-07-07'],['Châu Bảo Ngọc','2002-09-19','Tạ Minh Khoa','2000-12-01'],['Dương Thảo','1989-02-28','Hồ Gia Huy','1987-03-16'],['Kiều Anh Thư','1999-11-11','Lâm Chí Thanh','1996-01-23']];
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('console',m=>m.type()==='error'&&errs.push(m.text()));p.on('pageerror',e=>errs.push(e.message));
 await p.goto(url,{waitUntil:'networkidle'});const res=[];
 for(const c of C){await p.evaluate(()=>{document.getElementById('result').dataset.ready='';});
  await p.fill('#name1',c[0]);await p.fill('#dob1',c[1]);await p.fill('#name2',c[2]);await p.fill('#dob2',c[3]);await p.click('#btnCalc');await p.waitForSelector('#result[data-ready="1"]');
  res.push(await p.evaluate(()=>{const t=id=>document.getElementById(id).innerText.trim();return {pc:+t('percentVal'),secs:['pairText','tcText1','tcText2','luan-tinhyeu','luan-suynghiep','luan-tailoc','luan-nam2027','derive'].map(t)};}));}
 const s=[];for(const q of['số 7','1 và 5','22','xyz']){await p.fill('#q',q);await p.click('#btnSearch');s.push(await p.innerText('#searchOut'));}
 await b.close();const pcs=res.map(r=>r.pc);const fail=[];
 if(new Set(pcs).size<6)fail.push('distinct%');if(Math.max(...pcs)-Math.min(...pcs)<40)fail.push('spread');
 if(new Set(res.map(r=>r.secs.slice(0,7).join('|'))).size!==10)fail.push('readings not distinct');
 res.forEach((r,i)=>r.secs.forEach((x,j)=>{if(x.length<20)fail.push('empty '+i+':'+j)}));console.log(s.map(x=>x.slice(0,60)));
 if(!s[0].includes('Số 7')||!s[1].includes('1 và 5')||s[2].length<50||!s[3].includes('Không tìm thấy'))fail.push('search');
 if(errs.length)fail.push('console: '+errs.join(';'));
 console.log('percents',pcs.join(', '));console.log('SAMPLE1',res[0].secs[0],'\n',res[0].secs[3]);console.log('SAMPLE2',res[4].secs[0],'\n',res[4].secs[3]);
 console.log(fail.length?'FAIL '+fail.join(', '):'PASS');process.exit(fail.length?1:0);})();
