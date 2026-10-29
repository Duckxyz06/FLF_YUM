# FLF YUM · Đoàn viên Hub

Web quản lý đoàn viên Khoa Ngoại ngữ, theo khóa 2023–2026. Giao diện tiếng Việt, dùng được trên máy tính và điện thoại. Giao diện chạy trên GitHub Pages, không dùng thư viện từ CDN. Tài khoản admin có thể kết nối Supabase Auth/Postgres.

## Chạy hoàn toàn trên GitHub Pages

Mã web sẵn trong `docs/`. Nhập/xuất và thống kê chạy trong trình duyệt; đăng nhập admin khi bật cần Supabase. Mở **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh **main**, thư mục **/docs**, rồi **Save**. GitHub sẽ tự build và cung cấp URL của website. Các lần push sau sẽ tự cập nhật.

Toàn bộ việc nhập file, thống kê, xuất Excel/Word và lưu JSON chạy trong trình duyệt. Trước lần sử dụng đầu tiên, nhập HTML/ZIP đoàn viên, DOCX lỗi và ZIP cuộc thi, hoặc khôi phục bản sao lưu JSON. Khi đổi thiết bị hoặc xóa dữ liệu trình duyệt cần nhập lại bản sao lưu.

Nếu sửa mã trong `dist/`, chạy `npm run build:pages` rồi commit các mã nguồn đã kiểm tra. Build luôn tạo `docs/seed.json` rỗng để tránh xuất dữ liệu cá nhân; không commit `dist/seed.json` cục bộ nếu chứa dữ liệu thật. Không đưa dữ liệu đoàn viên thật vào hai thư mục này khi repo công khai.

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
2. **Đoàn viên bị lỗi → Nhập DOCX lỗi:** chọn bảng Word cùng mẫu `Lỗi YUM_Chi đoàn.docx`, xác nhận để tách hồ sơ. Có thể tìm đoàn viên theo tên, mã hoặc chi đoàn và tách thủ công.
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

Dữ liệu được lưu bằng IndexedDB trên **trình duyệt/thiết bị hiện tại**, không phải dữ liệu dùng chung giữa nhiều máy. Đã có module đăng nhập Supabase và migration `supabase/migrations/202610300001_admin_accounts.sql`. Cấu hình hiện chưa kết nối, nên web vẫn dùng chế độ cục bộ chưa bảo vệ đăng nhập. Xem [cách kích hoạt admin](supabase/admin-setup.md). Không có mật khẩu mặc định. Tài khoản admin chỉ bảo vệ luồng truy cập giao diện; dữ liệu cục bộ chưa đồng bộ hoặc mã hóa.

Mục Sao lưu xuất toàn bộ JSON. Khôi phục có kiểm tra cấu trúc, xem số lượng và xác nhận trước khi thay thế. Các thay đổi lớn lưu tối đa 5 bản an toàn cục bộ; xóa dữ liệu trình duyệt cũng xóa các bản này. Hãy xuất JSON định kỳ. File JSON chứa dữ liệu cá nhân, lưu ở nơi được bảo vệ.

## Cấu trúc

- `dist/index.html`, `style.css`, `app.js`: giao diện, luồng quản trị và lưu trữ.
- `dist/core.js`: chuẩn hóa, đối chiếu, phân loại, bộ lọc và kiểm tra backup.
- `dist/files.js`: đọc XLSX/ZIP/HTML/DOCX và xuất OOXML XLSX/DOCX.
- `dist/vendor/jszip.min.js`: JSZip 3.x, MIT, được đóng gói tại chỗ.
- `dist/error-template.docx`: mẫu sạch không có hồ sơ cá nhân.
- `tests/core.test.mjs`: kiểm tra logic phân loại, gộp trùng, bộ lọc, tách lỗi, backup.

Không đưa `private-inputs/`, báo cáo hoặc bản sao lưu thật lên repository công khai. Tiện ích đăng nhập ban đầu chỉ được tham khảo về tổ chức khóa/chi đoàn; không sao chép thông tin xác thực hay thực hiện đăng nhập thay người dùng.

## Mẫu báo cáo cuộc thi

Chức năng **Xuất XLSX** trong Báo cáo dùng mẫu người dùng cung cấp ngày 30/10/2026:

- **Danh sách:** tiêu đề cuộc thi, phạm vi khóa/chi đoàn, bộ lọc và tìm kiếm, giờ xuất Việt Nam, số người đang hiển thị và tổng phạm vi. 11 cột: STT, Họ và tên, Mã định danh, Ngày sinh, Giới tính, Khóa, Chi đoàn, Trạng thái, Điểm, Thời gian nộp bài, Ghi chú.
- **Tổng hợp theo chi đoàn:** STT, Chi đoàn, Sĩ số, Đạt, Chưa đạt, Chưa làm, Bị lỗi, Tỷ lệ đã làm và dòng TỔNG. Số liệu tính đủ phạm vi khóa/chi đoàn, độc lập với bộ lọc trạng thái và ô tìm kiếm của danh sách. Tỷ lệ = (Đạt + Chưa đạt) / Sĩ số, lưu dạng số phần trăm.
- Times New Roman 12, tiêu đề 15 đậm; đầu bảng xanh nhạt chữ đen; kẻ ô, xuống dòng, cố định đầu bảng, lọc dữ liệu, khổ A4 ngang và lặp đầu bảng khi in. Mã định danh giữ dạng văn bản. Không thay số liệu hệ thống bằng số liệu trong file mẫu.

## Hai danh sách lỗi độc lập

- **Đoàn viên bị lỗi:** lỗi thông tin/tài khoản YUM. Tách khỏi chi đoàn và tất cả thống kê cuộc thi; nhập DOCX, tìm kiếm, xác nhận, sửa và khôi phục; xuất Word đúng mẫu cũ.
- **Đoàn viên bị lỗi liên quan đến cuộc thi:** chọn cuộc thi, khóa/chi đoàn, tìm họ tên hoặc mã định danh, xác nhận lý do. Hồ sơ vẫn thuộc chi đoàn; chỉ cuộc thi được chọn có trạng thái lỗi. Sửa/bỏ đánh dấu độc lập từng cuộc thi; xuất Excel theo mẫu báo cáo và bộ lọc hiện tại.

Dữ liệu lỗi đang lưu được giữ nguyên theo loại: `excluded` là lỗi YUM toàn hệ thống, `contests[].errors` là lỗi riêng cuộc thi. Không tự chuyển hồ sơ giữa hai nhóm khi đổi tên giao diện. File FLF_YUM_V2.zip chỉ dùng tham khảo chức năng; không đưa dữ liệu cá nhân hoặc mật khẩu mặc định của bản tham chiếu lên GitHub.
