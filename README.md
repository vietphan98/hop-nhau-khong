# Hợp Nhau Không?

Xem hai người hợp nhau bao nhiêu % theo thần số học (số chủ đạo, số linh hồn): radar điểm mạnh, tình yêu, sự nghiệp, tài lộc, năm 2027 theo tháng, lưu ảnh kết quả.

Dùng ngay: https://vietphan98.github.io/hop-nhau-khong/

Nội dung mang tính tham khảo, giải trí. Tác giả: Việt Phan.

## Chế độ "Theo tử vi" (mới)
Mở thẳng: https://vietphan98.github.io/hop-nhau-khong/#tuvi

- Nhập ngày sinh **dương lịch**, giờ sinh (12 canh giờ) và giới tính cho 2 người.
- App đổi sang **âm lịch** (thuật toán Hồ Ngọc Đức, múi giờ Việt Nam, có **tháng nhuận**: sinh nửa đầu tháng nhuận an như tháng đó, nửa sau an như tháng sau), tính can chi năm/tháng/ngày/giờ, bản mệnh nạp âm.
- Lập **lá số 12 cung** cho từng người: an Mệnh/Thân, cục, 14 chính tinh, các phụ tinh (Lộc Tồn, Kình Dương, Đà La, Xương Khúc, Tả Hữu, Khôi Việt, Không Kiếp, Hỏa Linh, Thiên Mã, Đào Hoa, Hồng Loan, Thiên Hỷ, Khốc Hư) và Tứ Hóa, đại hạn.
- **Lời giải riêng cho từng sao trong từng cung** (38 sao × 12 cung = 456 đoạn, không đoạn nào trùng), có ô **tra cứu** "sao + cung".
- Điểm hợp = 50 + tuổi con giáp (tam hợp/lục hợp/xung/hại) + can năm + bản mệnh (sinh/khắc) + ½ cung Phu Thê mỗi người + duyên chéo (tuổi người kia so với cung Phu Thê), giới hạn 25–97%. Có biểu đồ radar 6 phần và nút **Lưu ảnh kết quả**.

Kiểm thử:
- `python3 tests/lunar_web_check.py` — đối chiếu âm lịch với lịch thật trên web (18/18 ngày, có ngày tháng nhuận).
- `python3 tests/variety_test.py` — 12 cặp (24 lá số) trên trình duyệt thật: điểm khác nhau, lời giải không trống, tra cứu, thần số học vẫn chạy, 0 lỗi console.

Nội dung mang tính tham khảo, giải trí. — Việt Phan
