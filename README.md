# PBL4 — Hotel Management System

Backend quản lý khách sạn (PMS — Property Management System) xây dựng bằng Node.js, Express và MySQL. Backend cung cấp REST API dùng chung cho React PMS (quản trị) và Flutter App (khách hàng).

## 1. Tổng quan hệ thống

```text
React PMS (Owner/Admin) ──┐
                          ├── HTTP/HTTPS + REST API + JSON ──> PMS Backend ──> MySQL
Flutter App (Guest) ──────┘
```

- **PMS Backend:** xác thực, phân quyền, validation, xử lý nghiệp vụ và truy vấn database.
- **React PMS:** giao diện quản trị dành cho Owner/Admin; gọi API của backend.
- **Flutter App:** giao diện Guest; gọi API của backend.
- **MySQL:** lưu tài khoản, phòng, khách hàng, booking và dữ liệu liên quan.

React và Flutter không kết nối trực tiếp đến MySQL.

## 2. Công nghệ

- Node.js, Express.js, ES Modules
- MySQL với `mysql2/promise`
- JWT access token và refresh token
- `bcrypt` để băm mật khẩu
- REST API, JSON
- Apidog để lưu request và test API
- Có thể bổ sung OpenAPI/Swagger để tài liệu hóa API

## 3. Cài đặt local

### Yêu cầu
- Node.js LTS phù hợp với dependencies
- npm
- MySQL Server
- Git
- Apidog hoặc HTTP client tương đương

### Bước 1 — Clone dự án

Thay `<GITHUB_REPOSITORY_URL>` bằng URL repository thật:

```bash
git clone <GITHUB_REPOSITORY_URL>
cd PBL4
npm install
```

Chạy lệnh tại thư mục chứa `package.json` của backend.

### Bước 2 — Tạo database

1. Mở MySQL.
2. Tạo database `hotel_pms` hoặc dùng tên trong cấu hình dự án.
3. Chạy SQL/migrations đã commit theo đúng thứ tự.
4. Kiểm tra bảng và khóa ngoại đã được tạo.

Không chạy lại migration tạo bảng nếu bảng đã tồn tại, trừ khi migration được thiết kế để chạy lặp an toàn.

### Bước 3 — Tạo file `.env`

Sao chép `.env.example` thành `.env` nếu dự án có file mẫu. Ví dụ:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=hotel_pms

ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_another_long_random_secret
```

Tên biến phải khớp với code hiện tại. Không commit `.env`, mật khẩu thật hoặc token lên GitHub.

### Bước 4 — Chạy backend

Kiểm tra scripts trong `package.json`, sau đó chạy script có sẵn, thường là:

```bash
npm run dev
```

hoặc:

```bash
npm start
```

Nếu dự án có script migration/seed riêng, đọc cấu hình script trước khi chạy.

Base URL local thường dùng:

`http://localhost:3000/api/v1`

Nếu health endpoint đã được mount, kiểm tra:

`GET http://localhost:3000/api/v1/health`

## 4. Chức năng API

### Auth — xác thực tài khoản

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Đăng ký tài khoản Guest | Public |
| POST | `/api/v1/auth/login` | Đăng nhập, nhận token | Public |
| POST | `/api/v1/auth/refresh` | Cấp access token mới bằng refresh token | Cần refresh token hợp lệ |
| POST | `/api/v1/auth/logout` | Đăng xuất/thu hồi refresh token | Đã đăng nhập |
| GET | `/api/v1/auth/me` | Lấy tài khoản hiện tại | Đã đăng nhập |

Mật khẩu được băm bằng bcrypt. Không lưu mật khẩu dạng chữ thường.

### Room — quản lý phòng

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| GET | `/api/v1/rooms` | Danh sách phòng, phân trang/lọc nếu hỗ trợ | Public |
| GET | `/api/v1/rooms/:id` | Chi tiết phòng | Public |
| POST | `/api/v1/rooms` | Tạo phòng | Owner/Admin |
| PUT | `/api/v1/rooms/:id` | Cập nhật phòng | Owner/Admin |
| DELETE | `/api/v1/rooms/:id` | Xóa phòng nếu không bị booking tham chiếu | Owner/Admin |

Trạng thái phòng: `available`, `occupied`, `maintenance`.

Ví dụ phân trang: `GET /api/v1/rooms?page=1&limit=2`.

### Room Type — loại phòng

| Method | Endpoint | Chức năng | Quyền |
|---|---|---|---|
| GET | `/api/v1/room-type` | Danh sách loại phòng | Public |
| GET | `/api/v1/room-type/:id` | Chi tiết loại phòng | Public |
| POST | `/api/v1/room-type` | Tạo loại phòng | Owner/Admin |
| PUT | `/api/v1/room-type/:id` | Cập nhật loại phòng | Owner/Admin |
| DELETE | `/api/v1/room-type/:id` | Xóa loại phòng nếu chưa được phòng sử dụng | Owner/Admin |

### Customer — hồ sơ khách hàng

Các chức năng gồm xem danh sách/chi tiết, tạo hồ sơ, cập nhật và xóa hồ sơ theo quyền trong routes/service.

- Guest tạo hoặc cập nhật hồ sơ của chính mình.
- Owner/Admin quản lý hồ sơ theo quyền được cấu hình.
- Không xóa khách hàng đang được booking tham chiếu.
- Hồ sơ khách vãng lai chỉ có thể dùng `user_id = NULL` nếu schema hiện tại cho phép.

Kiểm tra `routes/customer.routes.js` để biết quyền chính xác của từng endpoint.

### Booking — đặt phòng

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/v1/bookings` | Guest xem booking của mình; Owner/Admin xem danh sách theo quyền |
| GET | `/api/v1/bookings/:id` | Xem chi tiết booking có kiểm tra quyền |
| POST | `/api/v1/bookings` | Tạo booking |
| PATCH | `/api/v1/bookings/:id/status` | Chuyển trạng thái booking |

Trong thiết kế hiện tại, booking **không có DELETE để hủy**. Hủy bằng cách chuyển trạng thái thành `cancelled` để giữ lịch sử.

Trạng thái booking: `pending`, `confirmed`, `cancelled`, `checked_in`, `checked_out`.

Quy tắc nghiệp vụ chính:
- Guest chỉ đặt phòng cho hồ sơ gắn với tài khoản của mình; không tự chọn khách hàng khác.
- Owner/Admin có thể tạo booking cho khách hàng bằng `customer_id`.
- `check_out` phải sau `check_in`.
- Không cho đặt trùng khoảng ngày với booking chưa bị hủy.
- `price_per_night` lưu giá phòng tại thời điểm đặt; `total_price` là tổng tiền phòng theo số đêm.
- Guest chỉ được hủy booking của mình theo điều kiện nghiệp vụ; không tự confirm/check-in/check-out.
- Owner/Admin thực hiện confirm, check-in, check-out theo quy tắc chuyển trạng thái.
- Khi check-in, phòng chuyển sang `occupied`; khi check-out, code hiện tại chuyển phòng về `available`. Cần đảm bảo nghiệp vụ không ghi đè trạng thái bảo trì nếu có tình huống đó.

Ví dụ tạo booking cho Guest:

```http
POST /api/v1/bookings
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "room_id": 1,
  "check_in": "2026-11-01",
  "check_out": "2026-11-03",
  "note": "Yêu cầu phòng yên tĩnh"
}
```

Owner/Admin gửi thêm `customer_id`:

```json
{
  "customer_id": 1,
  "room_id": 1,
  "check_in": "2026-11-01",
  "check_out": "2026-11-03",
  "note": "Khách đặt trực tiếp"
}
```

Ví dụ đổi trạng thái:

```http
PATCH /api/v1/bookings/1/status
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "status": "confirmed"
}
```

Ngày trong ví dụ chỉ để minh họa; khi test phải chọn ngày phù hợp với ngày hệ thống và quy tắc nghiệp vụ.

## 5. Phân quyền tổng quát

| Chức năng | Guest | Owner | Admin |
|---|---:|---:|---:|
| Đăng ký/đăng nhập | Có | Có | Có |
| Xem phòng | Có | Có | Có |
| Tạo/sửa/xóa phòng | Không | Có | Có |
| Quản lý loại phòng | Không | Có | Có |
| Tạo booking | Có, cho mình | Có, cho khách | Có, cho khách |
| Xem booking | Của mình | Theo quyền quản lý | Theo quyền quản lý |
| Hủy booking | Của mình, theo điều kiện | Theo service | Theo service |
| Confirm/check-in/check-out | Không | Có, theo điều kiện | Có, theo điều kiện |

Bảng trên mô tả nghiệp vụ tổng quát. Khi có khác biệt, routes/service đang có trong source code là căn cứ cuối cùng.

Mã HTTP thường dùng:
- `200`: thao tác thành công.
- `201`: tạo tài nguyên thành công.
- `400`: dữ liệu đầu vào không hợp lệ.
- `401`: thiếu token hoặc token không hợp lệ/hết hạn.
- `403`: đã xác thực nhưng không đủ quyền.
- `404`: không tìm thấy tài nguyên.
- `409`: trùng dữ liệu hoặc xung đột nghiệp vụ.
- `500`: lỗi ngoài dự kiến phía server.

## 6. Tạo dữ liệu test

Kiểm tra thư mục `database/seeds/` và `package.json` để biết seed script hiện có. Nếu chạy seed, chỉ dùng tài khoản test ở môi trường local.

Role mẫu trong database:
- `guest`
- `owner`
- `admin`

Nếu seed báo tài khoản đã tồn tại, kiểm tra `users.role_id` và bảng `roles`; không chạy lặp một cách mù quáng.

## 7. Test API bằng Apidog

1. Tạo request với base URL `http://localhost:3000/api/v1`.
2. Chọn method và endpoint.
3. Với POST/PUT/PATCH, chọn Body → JSON.
4. Với API cần đăng nhập, chọn Auth → Bearer Token và dán **access token**. Nếu Apidog tự thêm tiền tố, chỉ dán token, không nhập thêm `Bearer `.
5. Kiểm tra status code, response JSON và dữ liệu trong MySQL sau các thao tác thay đổi dữ liệu.

Checklist kiểm thử:

- **Auth:** đăng ký hợp lệ; email bắt buộc và hợp lệ; email trùng; đăng nhập bằng email đúng/sai; thiếu token; token hết hạn; refresh; logout; `/me`.
- **Room/Room Type:** CRUD; ID sai/không tồn tại; trùng số phòng/tên loại phòng; loại phòng không tồn tại; status không hợp lệ; phân trang/lọc; thử quyền Guest/Owner/Admin; xóa tài nguyên đang được tham chiếu.
- **Customer:** tạo/cập nhật hợp lệ; dữ liệu sai; Guest truy cập hồ sơ người khác; trùng hồ sơ gắn user; xóa khách có booking.
- **Booking:** ngày không hợp lệ; checkout trước/bằng check-in; phòng không tồn tại/bảo trì; booking trùng ngày; Guest chưa có hồ sơ; Guest thao tác booking người khác; chuyển trạng thái không hợp lệ; kiểm tra ngày check-in/check-out; xác minh trạng thái phòng sau thao tác.

Với mỗi test, ghi lại: mã test, role/token, request, status mong đợi, response thực tế và pass/fail. Không chỉ kiểm tra status code; cần xác minh dữ liệu sau thao tác.

## 8. Git và làm việc nhóm

Trước khi bắt đầu:

```bash
git pull
git status
```

Sau khi sửa:

```bash
git add .
git commit -m "Describe the change"
git push
```

Quy tắc:
- Không commit `.env`, `node_modules/`, token, mật khẩu thật hoặc dữ liệu khách hàng thật.
- Commit migrations/seeds cần thiết để thành viên khác dựng database nhất quán.
- Trao đổi với nhóm trước khi đổi schema hoặc API contract.
- Nếu nhóm dùng branch, mỗi người làm trên branch riêng rồi tạo pull request.
- Không sửa trực tiếp database chung mà không thống nhất.

## 9. Cấu trúc thư mục tham khảo

```text
PBL4/
├── configs/          # Cấu hình database
├── controllers/      # Nhận request và trả response
├── middlewares/      # Auth, phân quyền, xử lý lỗi
├── repositories/     # Truy vấn MySQL
├── routes/           # Khai báo endpoint
├── services/         # Validation và nghiệp vụ
├── utils/            # JWT và hàm hỗ trợ
├── database/
│   ├── migrations/   # Thay đổi schema có version
│   └── seeds/        # Dữ liệu khởi tạo/test
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```

Cấu trúc thực tế có thể khác; hãy đối chiếu Explorer trong VS Code.

## 10. Lộ trình tiếp theo

1. Hoàn tất test backend theo từng module.
2. Chốt API contract và bổ sung OpenAPI/Swagger nếu được yêu cầu.
3. Xây React PMS: Login, Dashboard, Room, Room Type, Customer, Booking.
4. Kết nối React với backend qua REST API.
5. Xây/kết nối Flutter Guest App.
6. Kiểm thử tích hợp qua Wi-Fi/LAN, chuẩn bị báo cáo và demo.

## 11. Khi báo lỗi

Cung cấp:
- HTTP method và endpoint
- Role đang dùng
- Request body/query (ẩn token và dữ liệu nhạy cảm)
- HTTP status và response
- Log server liên quan
- Các bước tái hiện lỗi

Trao đổi với nhóm trước khi thay đổi API contract hoặc schema database dùng chung.

## 12. Chạy Flutter Customer App

### Khởi động Backend và MySQL

Từ thư mục gốc repository, tạo `.env` từ `.env.example`, điền các giá trị database/JWT rồi chạy:

```powershell
docker compose up --build
```

Kiểm tra backend tại `http://localhost:3000/api/v1/health`.

### Chạy trên Android Emulator

Android Emulator truy cập máy host qua `10.0.2.2`:

```powershell
$flutter = "C:\Users\ADMIN\flutter\flutter\bin\flutter.bat"
Set-Location mobile_apps\customer_app_one
& $flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1
```

### Chạy trên điện thoại thật

Cho laptop và điện thoại vào cùng Wi-Fi, lấy IPv4 của laptop bằng `ipconfig` (ví dụ `192.168.1.10`), rồi cho phép Node/Docker qua Windows Firewall ở port `3000`:

```powershell
Set-Location mobile_apps\customer_app_one
& $flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000/api/v1
```

Không dùng `localhost` trên điện thoại thật vì `localhost` khi đó là chính điện thoại.

### Đóng gói APK

```powershell
Set-Location mobile_apps\customer_app_one
& $flutter build apk --release --dart-define=API_BASE_URL=http://192.168.1.10:3000/api/v1
```

APK nằm tại `mobile_apps\customer_app_one\build\app\outputs\flutter-apk\app-release.apk`.
