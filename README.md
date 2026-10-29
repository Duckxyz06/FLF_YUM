# FLF YUM · Đoàn viên Hub

Web quản lý đoàn viên Khoa Ngoại ngữ, theo khóa 2023–2026. Giao diện tiếng Việt, dùng được trên máy tính và điện thoại. Không cần máy chủ ứng dụng hoặc thư viện từ CDN.

## Chạy hoàn toàn trên GitHub Pages

Mã web sẵn trong `docs/`, không cần backend hay dịch vụ bên ngoài. Mở **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh **main**, thư mục **/docs**, rồi **Save**. GitHub sẽ tự build và cung cấp URL của website. Các lần push sau sẽ tự cập nhật.

Toàn bộ việc nhập file, thống kê, xuất Excel/Word và lưu JSON chạy trong trình duyệt. Trước lần sử dụng đầu tiên, nhập HTML/ZIP đoàn viên, DOCX lỗi và ZIP cuộc thi, hoặc khôi phục bản sao lưu JSON. Khi đổi thiết bị hoặc xóa dữ liệu trình duyệt cần nhập lại bản sao lưu.

Nếu sửa mã trong `dist/`, chạy `npm run build:pages` rồi commit cả `dist/` và `docs/`. Không đưa dữ liệu đoàn viên thật vào hai thư mục này khi repo công khai.

## Chạy trên VS Code

```bash
# Yêu cầu Python 3 (hoặc dùng VS Code Live Server mở thư mục dist)
python -m http.server 8080 --directory dist
```

Mở http://localhost:8080. Không mở index.html bằng file://. Kiểm tra logic với Node 20+:

```bash
npm test
npm run check
```

## Nạp dữ liệu

Bản mã nguồn công khai không chứa tên, mã định danh, số điện thoại, email đoàn viên, báo cáo thật hoặc mật khẩu tiện ích. `dist/seed.json` là cơ sở trống với danh mục chi đoàn.

1. **Đoàn viên → Cập nhật HTML / ZIP:** chọn từng file HTML, nhiều HTML hoặc ZIP danh sách YUM đã lưu bằng SingleFile. Chỉ cập nhật chi đoàn xuất hiện trong tệp, giữ nguyên chi đoàn khác. Tên file được nhận theo mã chi đoàn gốc: ĐHTAKD25A.html, ĐHTAKD25A (1).html, ĐHTAKD25A (2).html đều thuộc ĐHTAKD25A. Chọn đủ các trang cùng lúc (hoặc ZIP chứa đủ trang) để gộp danh sách trước khi cập nhật. Họ tên trùng giữa các trang chỉ tính một người; các mã định danh được hợp nhất. Nội dung có tên chi đoàn khác tên file sẽ bị chặn khi nhập riêng, hoặc bị bỏ qua kèm cảnh báo khi ở trong ZIP.
2. **Tài khoản lỗi → Nhập DOCX lỗi:** chọn bảng Word cùng mẫu `Lỗi YUM_Chi đoàn.docx`, xác nhận để tách hồ sơ. Có thể tìm đoàn viên theo tên, mã hoặc chi đoàn và tách thủ công.
3. **Cuộc thi → Nhập cuộc thi:** nhận nhiều XLSX hoặc ZIP. Form bắt buộc: STT; Họ và tên; Đơn vị; Đối tượng; Thời gian nộp bài; Trạng thái; Điểm. Chấp nhận Đạt / Không đạt. Đặt tên và duyệt sau khi xem số bản ghi khớp, trùng, không khớp.
4. **Báo cáo:** chọn cuộc thi, một hoặc nhiều khóa, chi đoàn, trạng thái; tìm kiếm; xem bảng tổng hợp, chi tiết hoặc bản ghi cần đối chiếu.
5. Xuất XLSX theo đúng bộ lọc: font Times New Roman, bảng kẻ ô, tiêu đề cuộc thi, thời gian xuất Việt Nam và số người. Có sheet tổng hợp chi đoàn. Xuất DOCX lỗi dùng mẫu bảng Word hai hàng tiêu đề, cột ngày sinh Nam/Nữ, đúng thứ tự cột.

## Cách tính

- Mỗi người = họ tên chuẩn hóa Unicode, khoảng trắng, chữ hoa + chi đoàn. Mã định danh gốc được giữ trong một danh sách khi gộp.
- Không tự ghép tên gần giống; kết quả không khớp hoặc thiếu tên nằm ở Cần đối chiếu, không được cộng sĩ số.
- Có ít nhất một lần Đạt thì tính Đạt; nếu không có lần Đạt nhưng có Không đạt thì tính Chưa đạt. Lấy điểm cao nhất trong nhóm trạng thái tốt nhất.
- Đã thi = Đạt + Chưa đạt. Không tìm thấy kết quả khớp được xếp Chưa thi; không khẳng định đã/chưa thao tác thực tế ngoài file báo cáo.
- Lỗi cuộc thi do admin xác nhận chỉ ảnh hưởng cuộc thi đó, tách khỏi các nhóm đã/chưa thi.
- Tài khoản lỗi YUM được lưu riêng và không tính trong bất kỳ cuộc thi nào. Có chức năng khôi phục. Nếu nhập lại HTML, hồ sơ đã tách không bị thêm trở lại.
- Tổng người trong phạm vi = Đã thi + Chưa thi + Bị lỗi cuộc thi.

## Lưu trữ và sao lưu

Dữ liệu được lưu bằng IndexedDB trên **trình duyệt/thiết bị hiện tại**, không phải dữ liệu dùng chung giữa nhiều máy. Không có máy chủ tài khoản hay mật khẩu admin mặc định. Bản Sites có thể được bảo vệ bằng quyền truy cập riêng tư của chủ sở hữu; tự triển khai trên máy chủ công khai cần thêm lớp xác thực trước khi nạp dữ liệu thật.

Mục Sao lưu xuất toàn bộ JSON. Khôi phục có kiểm tra cấu trúc, xem số lượng và xác nhận trước khi thay thế. Các thay đổi lớn lưu tối đa 5 bản an toàn cục bộ; xóa dữ liệu trình duyệt cũng xóa các bản này. Hãy xuất JSON định kỳ. File JSON chứa dữ liệu cá nhân, lưu ở nơi được bảo vệ.

## Cấu trúc

- `dist/index.html`, `style.css`, `app.js`: giao diện, luồng quản trị và lưu trữ.
- `dist/core.js`: chuẩn hóa, đối chiếu, phân loại, bộ lọc và kiểm tra backup.
- `dist/files.js`: đọc XLSX/ZIP/HTML/DOCX và xuất OOXML XLSX/DOCX.
- `dist/vendor/jszip.min.js`: JSZip 3.x, MIT, được đóng gói tại chỗ.
- `dist/error-template.docx`: mẫu sạch không có hồ sơ cá nhân.
- `tests/core.test.mjs`: kiểm tra logic phân loại, gộp trùng, bộ lọc, tách lỗi, backup.

Không đưa `private-inputs/`, báo cáo hoặc bản sao lưu thật lên repository công khai. Tiện ích đăng nhập ban đầu chỉ được tham khảo về tổ chức khóa/chi đoàn; không sao chép thông tin xác thực hay thực hiện đăng nhập thay người dùng.
