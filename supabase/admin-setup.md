# Kích hoạt tài khoản admin trên GitHub Pages

Phần giao diện vẫn ở GitHub Pages; Supabase Auth và Postgres lưu tài khoản và quyền admin. Hiện chưa có dự án Supabase được kết nối. `authConfig.enabled` tạm là `false`, web vẫn ở chế độ dữ liệu cục bộ và chưa được bảo vệ bởi đăng nhập.

1. Tạo dự án Supabase thuộc tài khoản của bạn. Trong SQL Editor chạy `migrations/202610300001_admin_accounts.sql`.
2. Trong Authentication bật đăng nhập email/mật khẩu, tắt **Allow new users to sign up**. Vào Users → Add user → Create user để tự đặt email và mật khẩu admin. Đảm bảo user được xác nhận email. Không gửi mật khẩu cho người khác hoặc ghi vào repo.
3. Cấp quyền trong SQL Editor, thay email mẫu bằng email vừa tạo:

```sql
do $$
declare account_id uuid;
begin
  select id into account_id from auth.users where lower(email) = lower('THAY_EMAIL_ADMIN');
  if account_id is null then raise exception 'Chưa tạo user trong Supabase Auth'; end if;
  insert into public.admin_accounts(user_id, display_name)
    values (account_id, 'Quản trị viên')
    on conflict (user_id) do update set active = true;
end $$;
```

4. Lấy Project URL và **publishable key** trong phần kết nối/API Keys. Chỉnh `dist/auth-config.js`: `enabled: true`, `url: 'https://PROJECT.supabase.co'`, `publishableKey: 'sb_publishable_...'`. Không dùng `sb_secret_...` hoặc `service_role` key. Chạy `npm run build:pages`, rồi đẩy mã lên GitHub. Không đưa seed chứa dữ liệu cá nhân lên repo công khai.
5. Mở web, đăng nhập. Kiểm tra user đúng mật khẩu nhưng không có dòng admin bị chặn; user active=false bị chặn; user admin không tự INSERT/UPDATE quyền bằng REST được. Đăng xuất và thử tải lại trang để kiểm tra màn hình đăng nhập.

Khóa quyền ngay bằng SQL Editor:

```sql
update public.admin_accounts set active = false where user_id = 'UUID_CAN_KHOA';
```

Mật khẩu được Supabase Auth quản lý; bảng `admin_accounts` chỉ giữ UUID, tên hiển thị, quyền, trạng thái và ngày tạo. Đặt lại mật khẩu qua Supabase Dashboard. Web giữ token trong sessionStorage của tab, không lưu mật khẩu. Quyền được kiểm tra lại khi hoạt động và mỗi 60 giây; nếu mất kết nối hoặc bị khóa, giao diện đóng lại.

Phạm vi: chức năng này tạo tài khoản và kiểm tra quyền admin. Dữ liệu đoàn viên, cuộc thi và JSON vẫn lưu IndexedDB trên thiết bị như trước, chưa đồng bộ cloud và không được mã hóa bởi màn hình đăng nhập. Người có quyền truy cập thiết bị vẫn có thể đọc dữ liệu cục bộ. Sao lưu JSON trước khi thay đổi thiết bị. Không coi việc ẩn giao diện là phân quyền cơ sở dữ liệu đoàn viên phía máy chủ.

Kiểm tra triển khai: bộ test Node dùng dịch vụ giả lập cho auth; cần chạy migration và kiểm tra quyền trên dự án Supabase thật trước khi xác nhận production.
