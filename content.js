// Nội dung luận giải (soạn tay, tiếng Việt đời thường). Tham khảo, giải trí.
const TINH_CACH = {
 1:"Thích tự quyết, làm gì cũng muốn đi đầu. Ngoài mặt cứng cỏi nhưng rất cần được ghi nhận.",
 2:"Tinh ý, hay để ý cảm xúc người khác. Dễ mềm lòng, ghét cãi nhau, thích được quan tâm nhỏ nhặt.",
 3:"Vui tính, nói chuyện có duyên, ở đâu cũng có tiếng cười. Buồn thì cũng hay giấu sau câu đùa.",
 4:"Chắc chắn, giữ lời, thích mọi thứ rõ ràng. Không giỏi nói ngọt nhưng làm thì rất thật lòng.",
 5:"Thích đi, thích thử cái mới, ghét bị gò bó. Ở cạnh thì không bao giờ chán.",
 6:"Sống tình cảm, lo cho người thân trước bản thân. Hay ôm việc nhà, ai buồn là muốn chăm ngay.",
 7:"Trầm, thích suy nghĩ một mình, ít khi mở lòng ngay. Đã tin ai thì tin rất sâu.",
 8:"Có chí, thích tự lo được cho mình, làm việc ra kết quả. Đôi khi lo việc quá mà quên nói lời thương.",
 9:"Bao dung, dễ thương người, hay giúp đỡ mà không tính toán. Dễ buồn khi lòng tốt không được đáp lại.",
 11:"Nhạy cảm, trực giác mạnh, hay đoán đúng lòng người. Cần người hiểu mình hơn là người chiều mình.",
 22:"Nghĩ lớn, làm lớn, chịu được áp lực. Ít khi than, nhưng cần một chỗ dựa để được nghỉ.",
 33:"Thương người vô điều kiện, thích chăm lo và dạy dỗ. Dễ quên mất bản thân vì người khác."
};
// Nhóm hợp: số rút về 1-9 (11→2, 22→4, 33→6)
const NHOM = {
 hop:[[1,3],[1,5],[1,9],[2,4],[2,6],[2,8],[3,6],[3,9],[4,8],[4,6],[5,7],[6,9],[7,9],[1,7],[3,5]],
 ky:[[1,8],[2,5],[3,4],[4,5],[5,6],[7,8],[1,1],[8,8],[4,9],[2,7]]
};
const MUC = [ // theo % hợp
 {min:85, ten:"Trời sinh một cặp", tom:"Hai bạn như đã quen từ lâu. Nói một câu là người kia hiểu cả đoạn."},
 {min:70, ten:"Rất hợp", tom:"Hợp nhau nhiều hơn khác nhau. Chỉ cần nhường nhau mấy chuyện nhỏ là êm."},
 {min:55, ten:"Khá hợp", tom:"Có lúc vui như tết, có lúc giận vu vơ. Hiểu tính nhau rồi thì thương lâu."},
 {min:0, ten:"Cần học cách hiểu nhau", tom:"Hai cá tính khác nhau khá xa. Khác nhau không phải xấu, chỉ là cần kiên nhẫn hơn."}
];
const LUAN = { // theo mức (cao, kha, thap)
 tinhyeu:{cao:"Hai bạn dễ có những buổi nói chuyện tới khuya mà không biết chán. Ghen thì có, nhưng giận không quá một bữa cơm.",
   kha:"Lúc đầu có thể hơi ngại mở lòng. Một người chủ động nhắn trước là mọi chuyện mở ra rất nhanh.",
   thap:"Hay hiểu lầm vì cách thể hiện khác nhau: người thích nói, người thích làm. Nói rõ điều mình cần sẽ đỡ giận hơn."},
 suynghiep:{cao:"Làm chung rất ăn ý, người lo ý tưởng, người lo làm cho xong. Hai bạn hay góp ý giúp nhau tiến lên.",
   kha:"Mỗi người một kiểu làm việc. Đừng ép nhau theo cách của mình, cứ chia việc theo sở trường là ổn.",
   thap:"Dễ bất đồng khi bàn chuyện làm ăn chung. Nên để mỗi người tự lo phần việc riêng, về nhà thì đừng mang chuyện công việc ra cãi."},
 tailoc:{cao:"Cách tiêu tiền khá giống nhau, ít khi cãi vì chuyện chi tiêu. Cùng để dành một khoản nhỏ sẽ thấy vui.",
   kha:"Một người thích để dành, một người thích tận hưởng. Thống nhất trước khoản chung là hết lăn tăn.",
   thap:"Chuyện tiền nong dễ thành chuyện to. Nên rõ ràng từ đầu, ai lo khoản nào, để tình cảm không bị ảnh hưởng."},
 nam2027:{cao:"Năm 2027 là năm hai bạn gần nhau hơn: có thể cùng đi một chuyến xa, hoặc bàn chuyện tương lai nghiêm túc.",
   kha:"Năm 2027 có vài lúc hai bạn bận bịu mỗi người một hướng. Giữ thói quen hỏi han mỗi ngày là tình cảm vẫn ấm.",
   thap:"Năm 2027 là năm thử thách sự kiên nhẫn. Vượt qua được giai đoạn giữa năm thì cuối năm sẽ hiểu nhau hơn hẳn."}
};
const DIEM_MANH = ["Nói chuyện hợp","Biết nhường nhịn","Cùng chí hướng","Vui vẻ khi ở cạnh","Tin tưởng nhau"];
