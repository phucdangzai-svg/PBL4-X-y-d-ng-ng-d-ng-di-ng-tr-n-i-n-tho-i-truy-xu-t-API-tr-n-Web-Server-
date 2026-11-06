import { useEffect, useMemo, useState } from "react";
import {
  getRoomsApi,
  getRoomTypesApi,
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
} from "../Services/api";
import "./Rooms.css";

const initialForm = {
  room_number: "",
  room_type_id: "",
  price: "",
  status: "available",
  description: "",
};

const statusLabels = {
  available: "Còn trống",
  occupied: "Đang thuê",
  maintenance: "Bảo trì",
};

const API_BASE_URL = "http://localhost:3000";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [form, setForm] = useState(initialForm);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Chuyển URL ảnh thành đường dẫn hiển thị
  const getImageUrl = (url) => {
    if (!url) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) {
      return url;
    }

    return `${API_BASE_URL}${url}`;
  };

  // Lấy danh sách loại phòng
  const loadRoomTypes = async () => {
    const result = await getRoomTypesApi();
    setRoomTypes(result.data || []);
  };

  // Lấy danh sách phòng
  const loadRooms = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: pagination.limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.room_type_id = typeFilter;

      const result = await getRoomsApi(params);

      setRooms(result.data || []);

      setPagination(
        result.pagination || {
          page,
          limit: 10,
          totalItems: result.data?.length || 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadRoomTypes();
      } catch (err) {
        setError(err.message);
      }
    };

    loadInitialData();
  }, []);

  // Tải lại danh sách khi thay đổi bộ lọc
  useEffect(() => {
    loadRooms(1);
  }, [statusFilter, typeFilter]);

  // Tìm kiếm phòng theo số phòng
  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rooms;

    return rooms.filter((room) =>
      String(room.room_number).toLowerCase().includes(keyword),
    );
  }, [rooms, search]);

  // Mở form thêm phòng
  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setSelectedImageFile(null);
    setImagePreview("");
    setError("");
    setShowModal(true);
  };

  // Mở form cập nhật phòng
  const openEditModal = (room) => {
    setEditingId(room.id);

    setForm({
      room_number: room.room_number,
      room_type_id: String(room.room_type_id),
      price: room.price,
      status: room.status,
      description: room.description || "",
    });

    setSelectedImageFile(null);
    setImagePreview(room.image_url || "");
    setError("");
    setShowModal(true);
  };

  // Đóng form
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setSelectedImageFile(null);
    setImagePreview("");
    setError("");
  };

  // Xử lý thay đổi dữ liệu form
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Chọn ảnh và tạo preview, chưa upload lên Cloudinary
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5 MB");
      event.target.value = "";
      return;
    }

    setSelectedImageFile(file);
    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result);
    };

    reader.onerror = () => {
      setError("Không thể đọc file ảnh");
      setSelectedImageFile(null);
      setImagePreview("");
    };

    reader.readAsDataURL(file);

    // Cho phép chọn lại cùng một file nếu cần
    event.target.value = "";
  };

  // Thêm hoặc cập nhật phòng
  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    const roomData = {
      room_number: form.room_number.trim(),
      room_type_id: Number(form.room_type_id),
      price: Number(form.price),
      status: form.status,
      description: form.description.trim() || null,
    };

    try {
      if (editingId) {
        await updateRoomApi(editingId, roomData, selectedImageFile);
      } else {
        await createRoomApi(roomData, selectedImageFile);
      }

      const currentPage = editingId ? pagination.page : 1;

      setShowModal(false);
      setEditingId(null);
      setForm(initialForm);
      setSelectedImageFile(null);
      setImagePreview("");

      await loadRooms(currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Xóa phòng
  const handleDelete = async (room) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa phòng ${room.room_number}?`,
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteRoomApi(room.id);

      const nextPage =
        rooms.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;

      await loadRooms(nextPage);
    } catch (err) {
      setError(err.message);
    }
  };

  // Định dạng giá tiền
  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + " ₫";

  return (
    <div className="rooms-page">
      <div className="rooms-heading">
        <div>
          <h1>Quản lý phòng</h1>
          <p>Quản lý danh sách và tình trạng phòng khách sạn</p>
        </div>

        <button className="primary-button" onClick={openCreateModal}>
          + Thêm phòng
        </button>
      </div>

      <div className="room-summary">
        <div className="summary-card">
          <span>Tổng số phòng</span>
          <strong>{pagination.totalItems}</strong>
        </div>

        <div className="summary-card">
          <span>Phòng còn trống</span>
          <strong className="available-text">
            {rooms.filter((room) => room.status === "available").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Phòng đang thuê</span>
          <strong className="occupied-text">
            {rooms.filter((room) => room.status === "occupied").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Phòng bảo trì</span>
          <strong className="maintenance-text">
            {rooms.filter((room) => room.status === "maintenance").length}
          </strong>
        </div>
      </div>

      <div className="rooms-content">
        <div className="rooms-toolbar">
          <input
            type="text"
            placeholder="Tìm theo số phòng..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="available">Còn trống</option>
            <option value="occupied">Đang thuê</option>
            <option value="maintenance">Bảo trì</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="">Tất cả loại phòng</option>
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="rooms-error">{error}</div>}

        <div className="rooms-table-wrapper">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ảnh</th>
                <th>Số phòng</th>
                <th>Loại phòng</th>
                <th>Giá phòng</th>
                <th>Trạng thái</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    Không tìm thấy phòng phù hợp
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, index) => (
                  <tr key={room.id}>
                    <td>
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>

                    <td>
                      {room.image_url ? (
                        <img
                          className="room-thumbnail"
                          src={getImageUrl(room.image_url)}
                          alt={`Phòng ${room.room_number}`}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="no-room-image">Chưa có ảnh</span>
                      )}
                    </td>

                    <td className="room-number">{room.room_number}</td>
                    <td>{room.room_type_name}</td>
                    <td>{formatPrice(room.price)}</td>

                    <td>
                      <span className={`status-badge ${room.status}`}>
                        {statusLabels[room.status] || room.status}
                      </span>
                    </td>

                    <td className="room-description">
                      {room.description || "—"}
                    </td>

                    <td>
                      <div className="room-actions">
                        <button
                          className="edit-button"
                          onClick={() => openEditModal(room)}
                        >
                          Sửa
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(room)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rooms-pagination">
          <span>Tổng cộng {pagination.totalItems} phòng</span>

          <div>
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => loadRooms(pagination.page - 1)}
            >
              Trước
            </button>

            <span>
              Trang {pagination.page} / {pagination.totalPages}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => loadRooms(pagination.page + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="room-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2>{editingId ? "Cập nhật phòng" : "Thêm phòng mới"}</h2>
                <p>Nhập thông tin phòng khách sạn</p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                type="button"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Số phòng *
                  <input
                    name="room_number"
                    value={form.room_number}
                    onChange={handleFormChange}
                    required
                    placeholder="Ví dụ: 101"
                  />
                </label>

                <label>
                  Loại phòng *
                  <select
                    name="room_type_id"
                    value={form.room_type_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Chọn loại phòng</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Giá phòng (VNĐ) *
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    min="1"
                    required
                    placeholder="Ví dụ: 500000"
                  />
                </label>

                <label>
                  Trạng thái *
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <option value="available">Còn trống</option>
                    <option value="occupied">Đang thuê</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </label>

                <div className="full-width image-form-group">
                  <label>
                    Chọn ảnh phòng
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={saving}
                    />
                  </label>

                  {selectedImageFile && (
                    <p className="uploading-text">
                      Đã chọn: {selectedImageFile.name}
                    </p>
                  )}

                  {imagePreview && (
                    <div className="image-preview-wrapper">
                      <img
                        className="room-image-preview"
                        src={getImageUrl(imagePreview)}
                        alt="Ảnh xem trước phòng"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <label className="full-width">
                  Mô tả
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Nhập mô tả phòng..."
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Thêm phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;
