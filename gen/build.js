const fs=require('fs');const j=f=>{let t=fs.readFileSync(f,'utf8');t=t.slice(t.indexOf('{'),t.lastIndexOf('}')+1);t=t.replace(/,(\s*[\]}])/g,"$1");return JSON.parse(t)};
const S=j('sec.raw');for(const f of['x1.raw','x2.raw','x3.raw']){const X=j(f);for(const n in X)for(const k in X[n])S[n][k]=S[n][k].concat(X[n][k])};const P=Object.assign({},j('pA.raw'),j('pB.raw'),j('pC.raw'));const N=[1,2,3,4,5,6,7,8,9,11,22,33];let miss=[];
for(const n of N){if(!S[n])miss.push('S'+n);else for(const k of['tinhcach','tinhyeu','suynghiep','tailoc','nam2027'])if(!(S[n][k]||[]).length)miss.push(n+k)}
for(const a of N)for(const b of N)if(a<=b&&!(P[a+'-'+b]||[]).length)miss.push(a+'-'+b);
console.log('missing',miss.join(' '),Object.keys(P).length);
fs.writeFileSync('../content.js','// Nội dung luận giải sinh bằng mô hình miễn phí, đã duyệt. Tham khảo, giải trí.\nconst SO=' +JSON.stringify(S,null,1)+';\nconst CAP='+JSON.stringify(P,null,1)+';\nconst NHAN_SO={1:"Người tiên phong",2:"Người kết nối",3:"Người truyền cảm hứng",4:"Người xây nền",5:"Người tự do",6:"Người chăm sóc",7:"Người suy ngẫm",8:"Người làm chủ",9:"Người bao dung",11:"Người trực giác",22:"Người kiến tạo",33:"Người chữa lành"};\n');
