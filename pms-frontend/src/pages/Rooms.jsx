
import { useEffect, useMemo, useState } from "react";
import {
  getRoomsApi,
  getRoomTypesApi,
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
  uploadRoomImageApi,
} from "../Services/api";
import "./Rooms.css";

const initialForm = {
  room_number: "",
  room_type_id: "",
  price: "",
  status: "available",
  description: "",
  image_url: "",
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
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const getImageUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `${API_BASE_URL}${url}`;
  };

  const loadRoomTypes = async () => {
    const result = await getRoomTypesApi();
    setRoomTypes(result.data || []);
  };

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

  useEffect(() => {
    loadRooms(1);
  }, [statusFilter, typeFilter]);

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rooms;

    return rooms.filter((room) =>
      room.room_number.toLowerCase().includes(keyword),
    );
  }, [rooms, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setImagePreview("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingId(room.id);
    setForm({
      room_number: room.room_number,
      room_type_id: String(room.room_type_id),
      price: room.price,
      status: room.status,
      description: room.description || "",
      image_url: room.image_url || "",
    });
    setImagePreview(room.image_url || "");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving || uploadingImage) return;

    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setImagePreview("");
    setError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (event) => {
    const value = event.target.value;

    handleFormChange(event);
    setImagePreview(value);
    setError("");
  };

  const handleImageChange = async (event) => {
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

    setUploadingImage(true);
    setError("");

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const imageUrl = await uploadRoomImageApi(file);

      setForm((prev) => ({
        ...prev,
        image_url: imageUrl,
      }));

      setImagePreview(imageUrl);
    } catch (err) {
      setError(err.message);
      setImagePreview(form.image_url);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (uploadingImage) {
      setError("Vui lòng đợi ảnh tải lên hoàn tất");
      return;
    }

    setSaving(true);
    setError("");

    const roomData = {
      room_number: form.room_number.trim(),
      room_type_id: Number(form.room_type_id),
      price: Number(form.price),
      status: form.status,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
    };

    try {
      if (editingId) {
        await updateRoomApi(editingId, roomData);
      } else {
        await createRoomApi(roomData);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(initialForm);
      setImagePreview("");

      await loadRooms(editingId ? pagination.page : 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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

  const formatPrice = (price) =>
    Number(price).toLocaleString("vi-VN") + " ₫";

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
                    Đường dẫn hình ảnh
                    <input
                      name="image_url"
                      value={form.image_url}
                      onChange={handleImageUrlChange}
                      placeholder="https://..."
                    />
                  </label>

                  <label>
                    Hoặc chọn ảnh từ máy tính
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                  </label>

                  {uploadingImage && (
                    <p className="uploading-text">Đang tải ảnh lên...</p>
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
                  disabled={saving || uploadingImage}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving || uploadingImage}
                >
                  {uploadingImage
                    ? "Đang tải ảnh..."
                    : saving
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
