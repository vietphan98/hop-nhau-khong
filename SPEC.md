# App "Hợp Nhau Không?" – thần số học 2 người (tham khảo, giải trí)
File có sẵn: content.js (KHÔNG sửa nội dung chữ trong đó, chỉ dùng). Viết index.html, style.css, app.js. Pure HTML/CSS/JS, Chart.js từ CDN jsdelivr, html2canvas từ CDN. Mobile-first (max-width 480px giữa màn hình), nền gradient tím-hồng hiện đại, font "Be Vietnam Pro" Google Fonts, toàn bộ giao diện tiếng Việt.
## Nhập
2 thẻ "Bạn" và "Người ấy": họ tên (input id name1/name2), ngày sinh (input type=date id dob1/dob2). Nút id="btnCalc" "Xem hợp không". Nút id="btnSample" "Thử ví dụ" điền: Nguyễn Minh Anh 1996-07-20, Trần Gia Bảo 1998-06-17.
## Công thức
- Số chủ đạo: cộng tất cả chữ số ngày+tháng+năm sinh; rút gọn bằng cộng chữ số đến khi ≤9, NHƯNG dừng nếu ra 11, 22, 33. Vd 12/05/1998: 1+2+0+5+1+9+9+8=35→8.
- Số linh hồn: bỏ dấu tiếng Việt (normalize NFD, bỏ dấu, đ→d), chỉ lấy nguyên âm a e i o u y, bảng Pythagoras a1 b2 c3 d4 e5 f6 g7 h8 i9 j1 k2 l3 m4 n5 o6 p7 q8 r9 s1 t2 u3 v4 w5 x6 y7 z8; cộng rồi rút gọn như trên.
- base(n): 11→2, 22→4, 33→6, khác giữ.
- pairScore(a,b): a=base, b=base; nếu cặp (không thứ tự) thuộc NHOM.hop → 90; thuộc NHOM.ky → 45; a==b (ngoài ky) → 75; còn lại 65.
- Phần trăm hợp = round(0.6*pairScore(chủ đạo1,chủ đạo2) + 0.4*pairScore(linh hồn1,linh hồn2)), giới hạn 30..98.
- Radar 5 trục DIEM_MANH: giá trị trục i = clamp(percent + ((cđ1*7 + cđ2*3 + lh1 + lh2*(i+1) + i*13) % 21) - 10, 25, 99).
- Biểu đồ theo tháng 2027 (12 cột, nhãn T1..T12): giá trị tháng m = clamp(percent + ((cđ1+cđ2)*m*7 + lh1*3) % 31 - 15, 20, 99). Ghi chú dưới: "Tháng cao nhất: Tm" và "Tháng nên nhường nhau: Tm".
- mức: percent>=78 → cao, >=60 → kha, còn lại thap.
## Kết quả (section id="result", ẩn đến khi bấm)
1. Thẻ gradient id="card": tên 2 người, gauge % hợp (Chart.js doughnut nửa vòng, số % lớn ở giữa), tên mức MUC (chọn MUC đầu tiên có percent>=min) + câu tom, số chủ đạo & linh hồn mỗi người.
2. Hai thẻ tính cách: TINH_CACH[số chủ đạo] mỗi người, tiêu đề "Tính cách của <tên>  · Số <n>".
3. Radar chart (canvas id="radar") "Điểm mạnh của hai bạn".
4. 4 mục Tình yêu, Sự nghiệp, Tài lộc, Năm 2027 dùng LUAN[key][mức], mỗi mục có icon emoji.
5. Bar chart (canvas id="months") "Năm 2027 theo từng tháng".
6. Nút id="btnSave" "Lưu ảnh kết quả": html2canvas(#card, scale 2) tải xuống png "hop-nhau.png". Nút "Xem cặp khác" cuộn lên đầu.
Sau khi tính, cuộn mượt tới #result. Validation: thiếu tên/ngày → hiện thông báo đỏ nhẹ dưới nút, không alert.
Footer: "Nội dung mang tính tham khảo, giải trí. · Tác giả: Việt Phan".
Không có lỗi console. Hủy chart cũ trước khi vẽ lại.
