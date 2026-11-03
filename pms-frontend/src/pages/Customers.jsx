import { useEffect, useMemo, useState } from "react";
import {
  getCustomersApi,
  getCustomerByIdApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
} from "../Services/api";
import "./Customers.css";

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  identity_card: "",
  user_id: "",
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

function Customers() {
  const currentUser = getCurrentUser();
  const isManager = ["owner", "admin"].includes(
    currentUser?.role?.toLowerCase(),
  );

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCustomersApi();
      setCustomers(result.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManager) {
      loadCustomers();
    } else {
      setLoading(false);
    }
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) =>
      [
        customer.full_name,
        customer.email,
        customer.phone,
        customer.identity_card,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / limit));

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * limit,
    page * limit,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = async (customer) => {
    try {
      setError("");
      const result = await getCustomerByIdApi(customer.id);

      setEditingCustomer(result.data);
      setForm({
        full_name: result.data.full_name || "",
        email: result.data.email || "",
        phone: result.data.phone || "",
        address: result.data.address || "",
        identity_card: result.data.identity_card || "",
        user_id: "",
      });
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Không thể tải thông tin khách hàng");
    }
  };

  const openDetail = async (customer) => {
    try {
      setError("");
      const result = await getCustomerByIdApi(customer.id);
      setSelectedCustomer(result.data);
      setShowDetail(true);
    } catch (err) {
      setError(err.message || "Không thể tải thông tin khách hàng");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }

    const customerData = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      identity_card: form.identity_card.trim() || null,
    };

    if (!editingCustomer && form.user_id.trim()) {
      const userId = Number(form.user_id);

      if (!Number.isInteger(userId) || userId <= 0) {
        setError("User ID phải là số nguyên dương");
        return;
      }

      customerData.user_id = userId;
    }

    try {
      setSaving(true);
      setError("");

      if (editingCustomer) {
        await updateCustomerApi(editingCustomer.id, customerData);
      } else {
        await createCustomerApi(customerData);
      }

      setShowModal(false);
      setForm(emptyForm);
      await loadCustomers();
    } catch (err) {
      setError(err.message || "Không thể lưu khách hàng");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa khách hàng "${customer.full_name}" không?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteCustomerApi(customer.id);
      await loadCustomers();
    } catch (err) {
      setError(err.message || "Không thể xóa khách hàng");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (!isManager) {
    return (
      <div className="customers-page">
        <div className="customers-error">
          Bạn không có quyền truy cập trang quản lý khách hàng.
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="customers-heading">
        <div>
          <h1>Quản lý khách hàng</h1>
          <p>Quản lý thông tin và hồ sơ khách hàng của khách sạn</p>
        </div>

        <button className="customer-add-btn" onClick={openCreateModal}>
          + Thêm khách hàng
        </button>
      </div>

      <div className="customer-summary">
        <div className="customer-summary-icon">👥</div>
        <div>
          <span>Tổng số khách hàng</span>
          <strong>{customers.length}</strong>
        </div>
      </div>

      <div className="customers-content">
        <div className="customers-toolbar">
          <div>
            <h2>Danh sách khách hàng</h2>
            <span>{filteredCustomers.length} khách hàng</span>
          </div>

          <input
            type="text"
            placeholder="Tìm tên, email, SĐT, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="customers-error">{error}</div>}

        {loading ? (
          <div className="customers-empty">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>CCCD</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>#{customer.id}</td>
                        <td className="customer-name">{customer.full_name}</td>
                        <td>{customer.email || "—"}</td>
                        <td>{customer.phone || "—"}</td>
                        <td>{customer.identity_card || "—"}</td>
                        <td>{formatDate(customer.created_at)}</td>
                        <td>
                          <div className="customer-actions">
                            <button
                              className="action-view"
                              onClick={() => openDetail(customer)}
                              title="Chi tiết"
                            >
                              Xem
                            </button>
                            <button
                              className="action-edit"
                              onClick={() => openEditModal(customer)}
                              title="Chỉnh sửa"
                            >
                              Sửa
                            </button>
                            <button
                              className="action-delete"
                              onClick={() => handleDelete(customer)}
                              title="Xóa"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="customers-empty">
                        Không tìm thấy khách hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="customers-pagination">
              <span>
                Trang {page}/{totalPages}
              </span>

              <div>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Trước
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => !saving && setShowModal(false)}
        >
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <h2>
                  {editingCustomer ? "Cập nhật khách hàng" : "Thêm khách hàng"}
                </h2>
                <p>Nhập thông tin khách hàng bên dưới</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="customer-form-grid">
                <div className="customer-form-group full-width">
                  <label>Họ và tên *</label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    maxLength="255"
                    required
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="customer-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    maxLength="255"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="customer-form-group">
                  <label>Số điện thoại</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength="20"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="customer-form-group">
                  <label>Số CCCD</label>
                  <input
                    name="identity_card"
                    value={form.identity_card}
                    onChange={handleChange}
                    maxLength="20"
                    placeholder="Nhập số CCCD"
                  />
                </div>

                <div className="customer-form-group">
                  <label>User ID</label>
                  <input
                    name="user_id"
                    type="number"
                    min="1"
                    value={form.user_id}
                    onChange={handleChange}
                    disabled={!!editingCustomer}
                    placeholder="Để trống nếu chưa liên kết tài khoản"
                  />
                </div>

                <div className="customer-form-group full-width">
                  <label>Địa chỉ</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    maxLength="255"
                    rows="3"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>

              {error && <div className="customers-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="customer-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="customer-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingCustomer
                      ? "Cập nhật"
                      : "Thêm khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <h2>Thông tin khách hàng</h2>
                <p>Chi tiết hồ sơ khách hàng #{selectedCustomer.id}</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowDetail(false)}
              >
                ×
              </button>
            </div>

            <div className="customer-detail-grid">
              <div>
                <span>Họ và tên</span>
                <strong>{selectedCustomer.full_name}</strong>
              </div>
              <div>
                <span>User ID</span>
                <strong>{selectedCustomer.user_id ?? "Chưa liên kết"}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedCustomer.email || "—"}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{selectedCustomer.phone || "—"}</strong>
              </div>
              <div>
                <span>CCCD</span>
                <strong>{selectedCustomer.identity_card || "—"}</strong>
              </div>
              <div>
                <span>Ngày tạo</span>
                <strong>{formatDate(selectedCustomer.created_at)}</strong>
              </div>
              <div className="full-width">
                <span>Địa chỉ</span>
                <strong>{selectedCustomer.address || "—"}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="customer-cancel-btn"
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

export default Customers;
