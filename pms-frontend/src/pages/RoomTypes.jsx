
import { useEffect, useState } from "react";
import {
  getRoomTypesApi,
  getRoomTypeByIdApi,
  createRoomTypeApi,
  updateRoomTypeApi,
  deleteRoomTypeApi,
} from "../Services/api";
import "./RoomTypes.css";

const emptyForm = {
  name: "",
  description: "",
  capacity: 1,
};

function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy danh sách loại phòng
  const getList = async () => {
    try {
      setLoading(true);
      const result = await getRoomTypesApi();

      setRoomTypes(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  // Tìm kiếm loại phòng theo tên
  const filteredRoomTypes = roomTypes.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Mở modal thêm
  const openCreate = () => {
    setForm(emptyForm);
    setSelectedId(null);
    setError("");
    setModal("create");
  };

  // Mở modal xem chi tiết hoặc chỉnh sửa
  const openDetail = async (id, mode) => {
    try {
      setError("");
      const result = await getRoomTypeByIdApi(id);
      const roomType = result.data;

      setSelectedId(id);
      setForm({
        name: roomType.name || "",
        description: roomType.description || "",
        capacity: roomType.capacity || 1,
      });

      setModal(mode);
    } catch (error) {
      setError(error.message);
    }
  };

  // Thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "capacity" ? value : value,
    }));
  };

  // Kiểm tra dữ liệu
  const validateForm = () => {
    if (!form.name.trim()) {
      return "Tên loại phòng không được để trống";
    }

    if (form.name.trim().length > 100) {
      return "Tên loại phòng không được vượt quá 100 ký tự";
    }

    if (
      form.capacity === "" ||
      !Number.isInteger(Number(form.capacity)) ||
      Number(form.capacity) <= 0
    ) {
      return "Sức chứa phải là số nguyên lớn hơn 0";
    }

    return "";
  };

  // Thêm hoặc cập nhật loại phòng
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const roomTypeData = {
      name: form.name.trim(),
      description: form.description.trim(),
      capacity: Number(form.capacity),
    };

    try {
      setLoading(true);
      setError("");

      if (modal === "create") {
        await createRoomTypeApi(roomTypeData);
        setSuccess("Thêm loại phòng thành công");
      } else {
        await updateRoomTypeApi(selectedId, roomTypeData);
        setSuccess("Cập nhật loại phòng thành công");
      }

      setModal("");
      await getList();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xóa loại phòng
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa loại phòng này?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");
      await deleteRoomTypeApi(id);

      setSuccess("Xóa loại phòng thành công");
      await getList();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-types-page">
      <div className="room-types-header">
        <div>
          <h2>Quản lý loại phòng</h2>
          <p>Quản lý thông tin và sức chứa của các loại phòng khách sạn</p>
        </div>

        <button className="rt-btn-primary" onClick={openCreate}>
          + Thêm loại phòng
        </button>
      </div>

      {success && (
        <div className="rt-alert rt-success">
          {success}
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {error && !modal && (
        <div className="rt-alert rt-error">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="rt-toolbar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên loại phòng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>Tổng số: {filteredRoomTypes.length} loại phòng</span>
      </div>

      <div className="rt-table-container">
        <table className="rt-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên loại phòng</th>
              <th>Mô tả</th>
              <th>Sức chứa</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {loading && roomTypes.length === 0 ? (
              <tr>
                <td colSpan="5" className="rt-empty">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredRoomTypes.length === 0 ? (
              <tr>
                <td colSpan="5" className="rt-empty">
                  Không tìm thấy loại phòng
                </td>
              </tr>
            ) : (
              filteredRoomTypes.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="rt-name">{item.name}</td>
                  <td>{item.description || "Chưa có mô tả"}</td>
                  <td>{item.capacity} người</td>
                  <td>
                    <div className="rt-actions">
                      <button
                        className="rt-btn-view"
                        onClick={() => openDetail(item.id, "detail")}
                      >
                        Chi tiết
                      </button>

                      <button
                        className="rt-btn-edit"
                        onClick={() => openDetail(item.id, "edit")}
                      >
                        Sửa
                      </button>

                      <button
                        className="rt-btn-delete"
                        onClick={() => handleDelete(item.id)}
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

      {/* Modal thêm / sửa / chi tiết */}
      {modal && (
        <div className="rt-modal-overlay">
          <div className="rt-modal">
            <div className="rt-modal-header">
              <h3>
                {modal === "create"
                  ? "Thêm loại phòng"
                  : modal === "edit"
                    ? "Cập nhật loại phòng"
                    : "Chi tiết loại phòng"}
              </h3>

              <button
                className="rt-close"
                onClick={() => {
                  setModal("");
                  setError("");
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {modal === "detail" && (
                <div className="rt-form-group">
                  <label>ID</label>
                  <input value={selectedId} disabled />
                </div>
              )}

              <div className="rt-form-group">
                <label>Tên loại phòng *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Standard, Deluxe..."
                  maxLength={100}
                  disabled={modal === "detail"}
                />
              </div>

              <div className="rt-form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả loại phòng..."
                  rows={4}
                  disabled={modal === "detail"}
                />
              </div>

              <div className="rt-form-group">
                <label>Sức chứa (người) *</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={handleChange}
                  disabled={modal === "detail"}
                />
              </div>

              {error && (
                <div className="rt-alert rt-error">{error}</div>
              )}

              <div className="rt-modal-actions">
                <button
                  type="button"
                  className="rt-btn-cancel"
                  onClick={() => {
                    setModal("");
                    setError("");
                  }}
                >
                  Đóng
                </button>

                {modal !== "detail" && (
                  <button
                    type="submit"
                    className="rt-btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Đang xử lý..."
                      : modal === "create"
                        ? "Thêm mới"
                        : "Lưu thay đổi"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomTypes;
