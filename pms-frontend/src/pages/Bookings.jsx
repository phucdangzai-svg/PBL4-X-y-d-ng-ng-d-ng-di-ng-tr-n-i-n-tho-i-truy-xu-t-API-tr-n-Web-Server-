import { useEffect, useMemo, useState } from "react";
import {
  getBookingsApi,
  getBookingByIdApi,
  createBookingApi,
  updateBookingStatusApi,
  getRoomsApi,
  getCustomersApi,
} from "../Services/api";
import "./Bookings.css";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  checked_in: "Đang nhận phòng",
  checked_out: "Đã trả phòng",
  cancelled: "Đã hủy",
};

const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "checked_in"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " ₫";

const formatDate = (value) => {
  if (!value) return "-";
  return String(value).slice(0, 10);
};

const getList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

function Bookings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role || "").toLowerCase();
  const isManager = ["owner", "admin"].includes(role);

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [form, setForm] = useState({
    customer_id: "",
    room_id: "",
    check_in: "",
    check_out: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBookingsApi();
      setBookings(getList(response));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const roomResponse = await getRoomsApi({ limit: 100 });
      setRooms(getList(roomResponse));

      if (isManager) {
        const customerResponse = await getCustomersApi();
        setCustomers(getList(customerResponse));
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu phòng/khách hàng");
    }
  };

  useEffect(() => {
    loadBookings();
    loadFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBookings = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesKeyword =
        !search ||
        String(booking.id).includes(search) ||
        String(booking.customer_name || "")
          .toLowerCase()
          .includes(search) ||
        String(booking.room_number || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const matchesSource =
        sourceFilter === "all" || booking.booking_source === sourceFilter;

      return matchesKeyword && matchesStatus && matchesSource;
    });
  }, [bookings, keyword, statusFilter, sourceFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / PAGE_SIZE),
  );

  const currentBookings = filteredBookings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const openCreateModal = () => {
    setError("");
    setForm({
      customer_id: "",
      room_id: "",
      check_in: "",
      check_out: "",
      note: "",
    });
    setShowCreate(true);
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.room_id || !form.check_in || !form.check_out) {
      setError("Vui lòng nhập đầy đủ thông tin đặt phòng");
      return;
    }

    if (form.check_out <= form.check_in) {
      setError("Ngày trả phòng phải sau ngày nhận phòng");
      return;
    }

    if (isManager && !form.customer_id) {
      setError("Vui lòng chọn khách hàng");
      return;
    }

    const payload = {
      room_id: Number(form.room_id),
      check_in: form.check_in,
      check_out: form.check_out,
      note: form.note.trim(),
    };

    if (isManager) {
      payload.customer_id = Number(form.customer_id);
    }

    try {
      setSubmitting(true);
      setError("");

      await createBookingApi(payload);

      setShowCreate(false);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Đặt phòng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (id) => {
    try {
      setError("");
      const response = await getBookingByIdApi(id);
      const booking = response?.data?.data ?? response?.data ?? response;

      setSelectedBooking(booking);
      setShowDetail(true);
    } catch (err) {
      setError(err.message || "Không thể xem chi tiết đặt phòng");
    }
  };

  const handleUpdateStatus = async (booking, status) => {
    const confirmMessage = `Bạn có chắc muốn chuyển booking #${booking.id} sang trạng thái "${STATUS_LABELS[status]}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setError("");
      await updateBookingStatusApi(booking.id, status);

      await loadBookings();

      if (showDetail) {
        const response = await getBookingByIdApi(booking.id);
        const updated = response?.data?.data ?? response?.data ?? response;
        setSelectedBooking(updated);
      }
    } catch (err) {
      setError(err.message || "Cập nhật trạng thái thất bại");
    }
  };

  const getAllowedStatuses = (booking) => {
    const allowed = NEXT_STATUSES[booking.status] || [];

    // Guest chỉ được hủy booking của chính mình.
    if (!isManager) {
      return allowed.includes("cancelled") ? ["cancelled"] : [];
    }

    return allowed;
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <div>
          <h1>Quản lý đặt phòng</h1>
          <p>Theo dõi và quản lý các đơn đặt phòng</p>
        </div>

        <button className="booking-primary-btn" onClick={openCreateModal}>
          + Tạo đặt phòng
        </button>
      </div>

      {error && (
        <div className="booking-error">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="booking-toolbar">
        <input
          type="text"
          placeholder="Tìm theo mã booking, khách hàng, số phòng..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả nguồn đặt</option>
          <option value="DIRECT">Trực tiếp</option>
          <option value="BOOKING">Booking.com</option>
          <option value="AGODA">Agoda</option>
          <option value="TRAVELOKA">Traveloka</option>
        </select>
      </div>

      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Khách hàng</th>
              <th>Phòng</th>
              <th>Nguồn đặt</th>
              <th>Ngày nhận</th>
              <th>Ngày trả</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="booking-empty">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentBookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="booking-empty">
                  Không có dữ liệu đặt phòng
                </td>
              </tr>
            ) : (
              currentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.customer_name || "-"}</td>
                  <td>{booking.room_number || "-"}</td>

                  <td>
                    <span
                      className={`booking-source ${String(
                        booking.booking_source || "",
                      ).toLowerCase()}`}
                    >
                      {booking.booking_source === "DIRECT"
                        ? "Trực tiếp"
                        : booking.channel_name || booking.booking_source || "-"}
                    </span>
                  </td>

                  <td>{formatDate(booking.check_in)}</td>
                  <td>{formatDate(booking.check_out)}</td>
                  <td>{formatMoney(booking.total_price)}</td>

                  <td>
                    <span className={`booking-status ${booking.status}`}>
                      {STATUS_LABELS[booking.status] || booking.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="booking-detail-btn"
                      onClick={() => openDetail(booking.id)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="booking-pagination">
        <span>
          Hiển thị {currentBookings.length} / {filteredBookings.length} booking
        </span>

        <div>
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Trước
          </button>

          <span>
            Trang {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Sau
          </button>
        </div>
      </div>

      {/* Modal tạo booking */}
      {showCreate && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h2>Tạo đặt phòng</h2>
              <button onClick={() => setShowCreate(false)}>×</button>
            </div>

            <form onSubmit={handleCreate}>
              {isManager && (
                <div className="booking-form-group">
                  <label>Khách hàng</label>
                  <select
                    value={form.customer_id}
                    onChange={(e) =>
                      setForm({ ...form, customer_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="booking-form-group">
                <label>Phòng</label>
                <select
                  value={form.room_id}
                  onChange={(e) =>
                    setForm({ ...form, room_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Phòng {room.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="booking-form-row">
                <div className="booking-form-group">
                  <label>Ngày nhận phòng</label>
                  <input
                    type="date"
                    value={form.check_in}
                    onChange={(e) =>
                      setForm({ ...form, check_in: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="booking-form-group">
                  <label>Ngày trả phòng</label>
                  <input
                    type="date"
                    value={form.check_out}
                    onChange={(e) =>
                      setForm({ ...form, check_out: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="booking-form-group">
                <label>Ghi chú</label>
                <textarea
                  rows="3"
                  maxLength="2000"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Nhập ghi chú nếu có..."
                />
              </div>

              <p className="booking-form-note">
                Giá mỗi đêm và tổng tiền sẽ được Backend tự tính.
              </p>

              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="booking-secondary-btn"
                  onClick={() => setShowCreate(false)}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="booking-primary-btn"
                  disabled={submitting}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết booking */}
      {showDetail && selectedBooking && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h2>Chi tiết booking #{selectedBooking.id}</h2>
              <button onClick={() => setShowDetail(false)}>×</button>
            </div>

            <div className="booking-detail-content">
              <p>
                <strong>Khách hàng:</strong>{" "}
                {selectedBooking.customer_name || "-"}
              </p>

              <p>
                <strong>Phòng:</strong> {selectedBooking.room_number || "-"}
              </p>

              <p>
                <strong>Nguồn đặt:</strong>{" "}
                {selectedBooking.booking_source === "DIRECT"
                  ? "Trực tiếp"
                  : selectedBooking.channel_name ||
                    selectedBooking.booking_source ||
                    "-"}
              </p>

              {selectedBooking.booking_source &&
                selectedBooking.booking_source !== "DIRECT" && (
                  <p>
                    <strong>Mã booking OTA:</strong>{" "}
                    {selectedBooking.external_booking_id || "-"}
                  </p>
                )}

              <p>
                <strong>Loại phòng:</strong>{" "}
                {selectedBooking.room_type_name || "-"}
              </p>

              <p>
                <strong>Ngày nhận:</strong>{" "}
                {formatDate(selectedBooking.check_in)}
              </p>

              <p>
                <strong>Ngày trả:</strong>{" "}
                {formatDate(selectedBooking.check_out)}
              </p>

              <p>
                <strong>Giá mỗi đêm:</strong>{" "}
                {formatMoney(selectedBooking.price_per_night)}
              </p>

              <p>
                <strong>Tổng tiền:</strong>{" "}
                {formatMoney(selectedBooking.total_price)}
              </p>

              <p>
                <strong>Trạng thái:</strong>{" "}
                {STATUS_LABELS[selectedBooking.status] ||
                  selectedBooking.status}
              </p>

              <p>
                <strong>Ghi chú:</strong> {selectedBooking.note || "-"}
              </p>
            </div>

            <div className="booking-status-actions">
              {getAllowedStatuses(selectedBooking).map((status) => (
                <button
                  key={status}
                  className={
                    status === "cancelled"
                      ? "booking-cancel-btn"
                      : "booking-primary-btn"
                  }
                  onClick={() => handleUpdateStatus(selectedBooking, status)}
                >
                  {status === "confirmed" && "Xác nhận"}
                  {status === "cancelled" && "Hủy booking"}
                  {status === "checked_in" && "Nhận phòng"}
                  {status === "checked_out" && "Trả phòng"}
                </button>
              ))}
            </div>

            <div className="booking-modal-actions">
              <button
                className="booking-secondary-btn"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
