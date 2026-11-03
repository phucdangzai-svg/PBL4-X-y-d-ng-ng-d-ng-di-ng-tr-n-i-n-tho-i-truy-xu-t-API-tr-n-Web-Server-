import { useEffect, useMemo, useState } from "react";
import {
  getChannelsApi,
  updateChannelStatusApi,
  getMappingsApi,
  createMappingApi,
  updateMappingApi,
  deleteMappingApi,
  getSyncLogsApi,
  getRoomTypesApi,
} from "../Services/api";

import "./ChannelManager.css";

const getData = (response) => response?.data ?? response;

const getList = (response) => {
  const data = getData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const CHANNEL_LABELS = {
  BOOKING: "Booking.com",
  AGODA: "Agoda",
  TRAVELOKA: "Traveloka",
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("vi-VN");
};

function ChannelManager() {
  const [activeTab, setActiveTab] = useState("channels");

  const [channels, setChannels] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [channelLoadingId, setChannelLoadingId] = useState(null);

  const [showMappingModal, setShowMappingModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [savingMapping, setSavingMapping] = useState(false);

  const [mappingForm, setMappingForm] = useState({
    channel_id: "",
    room_type_id: "",
    ota_room_code: "",
    ota_room_name: "",
    status: "active",
  });

  const [mappingFilters, setMappingFilters] = useState({
    channel_id: "",
    status: "",
  });

  const [logFilters, setLogFilters] = useState({
    channel_id: "",
    status: "",
    event_type: "",
  });

  const [logPage, setLogPage] = useState(1);
  const [logLimit] = useState(10);
  const [logPagination, setLogPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const [selectedLog, setSelectedLog] = useState(null);

  // ================= LOAD DATA =================

  const loadChannels = async () => {
    const response = await getChannelsApi();
    setChannels(getList(response));
  };

  const loadMappings = async () => {
    const params = {};

    if (mappingFilters.channel_id) {
      params.channel_id = mappingFilters.channel_id;
    }

    if (mappingFilters.status) {
      params.status = mappingFilters.status;
    }

    const response = await getMappingsApi(params);
    setMappings(getList(response));
  };

  const loadRoomTypes = async () => {
    const response = await getRoomTypesApi();
    setRoomTypes(getList(response));
  };

  const loadSyncLogs = async () => {
    const params = {
      page: logPage,
      limit: logLimit,
    };

    if (logFilters.channel_id) {
      params.channel_id = logFilters.channel_id;
    }

    if (logFilters.status) {
      params.status = logFilters.status;
    }

    if (logFilters.event_type) {
      params.event_type = logFilters.event_type;
    }

    const response = await getSyncLogsApi(params);
    const data = getData(response);

    setSyncLogs(data?.data || []);
    setLogPagination({
      total: data?.total || 0,
      totalPages: data?.totalPages || 0,
    });
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([loadChannels(), loadRoomTypes()]);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu Channel Manager");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== "mappings") return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await loadMappings();
      } catch (err) {
        setError(err.message || "Không thể tải Room Mapping");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, mappingFilters]);

  useEffect(() => {
    if (activeTab !== "logs") return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await loadSyncLogs();
      } catch (err) {
        setError(err.message || "Không thể tải lịch sử đồng bộ");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, logPage, logFilters]);

  // ================= CHANNEL ACTIONS =================

  const handleToggleChannel = async (channel) => {
    const nextStatus =
      channel.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Bạn có chắc muốn ${
        nextStatus === "active" ? "bật" : "tắt"
      } kênh ${channel.name}?`,
    );

    if (!confirmed) return;

    try {
      setChannelLoadingId(channel.id);
      setError("");
      setSuccess("");

      await updateChannelStatusApi(channel.id, nextStatus);
      await loadChannels();

      setSuccess(`Đã cập nhật trạng thái ${channel.name}`);
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái kênh");
    } finally {
      setChannelLoadingId(null);
    }
  };

  // ================= MAPPING ACTIONS =================

  const resetMappingForm = () => {
    setMappingForm({
      channel_id: "",
      room_type_id: "",
      ota_room_code: "",
      ota_room_name: "",
      status: "active",
    });
    setEditingMapping(null);
  };

  const openCreateMapping = () => {
    resetMappingForm();
    setShowMappingModal(true);
  };

  const openEditMapping = (mapping) => {
    setEditingMapping(mapping);

    setMappingForm({
      channel_id: String(mapping.channel_id),
      room_type_id: String(mapping.room_type_id),
      ota_room_code: mapping.ota_room_code || "",
      ota_room_name: mapping.ota_room_name || "",
      status: mapping.status,
    });

    setShowMappingModal(true);
  };

  const handleMappingSubmit = async (event) => {
    event.preventDefault();

    if (
      !mappingForm.channel_id ||
      !mappingForm.room_type_id ||
      !mappingForm.ota_room_code.trim()
    ) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    const payload = {
      channel_id: Number(mappingForm.channel_id),
      room_type_id: Number(mappingForm.room_type_id),
      ota_room_code: mappingForm.ota_room_code.trim(),
      ota_room_name: mappingForm.ota_room_name.trim() || null,
      status: mappingForm.status,
    };

    try {
      setSavingMapping(true);
      setError("");
      setSuccess("");

      if (editingMapping) {
        await updateMappingApi(editingMapping.id, payload);
        setSuccess("Cập nhật Room Mapping thành công");
      } else {
        await createMappingApi(payload);
        setSuccess("Thêm Room Mapping thành công");
      }

      setShowMappingModal(false);
      resetMappingForm();
      await loadMappings();
    } catch (err) {
      setError(err.message || "Không thể lưu Room Mapping");
    } finally {
      setSavingMapping(false);
    }
  };

  const handleDeleteMapping = async (mapping) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa mapping ${mapping.ota_room_code}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteMappingApi(mapping.id);
      await loadMappings();

      setSuccess("Xóa Room Mapping thành công");
    } catch (err) {
      setError(err.message || "Không thể xóa Room Mapping");
    }
  };

  // ================= DERIVED DATA =================

  const activeChannels = useMemo(
    () => channels.filter((channel) => channel.status === "active").length,
    [channels],
  );

  const getChannelLabel = (code, name) =>
    CHANNEL_LABELS[code] || name || code || "-";

  // ================= RENDER =================

  return (
    <div className="channel-manager-page">
      <div className="cm-header">
        <div>
          <h1>Channel Manager</h1>
          <p>Quản lý kết nối và đồng bộ với các kênh OTA</p>
        </div>

        <button
          className="cm-button cm-button-outline"
          onClick={loadInitialData}
          disabled={loading}
        >
          ↻ Làm mới
        </button>
      </div>

      {(error || success) && (
        <div className={`cm-alert ${error ? "cm-alert-error" : "cm-alert-success"}`}>
          <span>{error || success}</span>
          <button
            onClick={() => {
              setError("");
              setSuccess("");
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="cm-tabs">
        <button
          className={activeTab === "channels" ? "active" : ""}
          onClick={() => setActiveTab("channels")}
        >
          ◈ Kênh OTA
        </button>

        <button
          className={activeTab === "mappings" ? "active" : ""}
          onClick={() => setActiveTab("mappings")}
        >
          ⚑ Room Mapping
        </button>

        <button
          className={activeTab === "logs" ? "active" : ""}
          onClick={() => setActiveTab("logs")}
        >
          ◷ Lịch sử đồng bộ
        </button>
      </div>

      {loading && (
        <div className="cm-loading">Đang tải dữ liệu...</div>
      )}

      {/* ================= CHANNELS ================= */}

      {activeTab === "channels" && !loading && (
        <section className="cm-section">
          <div className="cm-section-heading">
            <div>
              <h2>Kênh OTA</h2>
              <p>Theo dõi và quản lý trạng thái các kênh phân phối</p>
            </div>

            <span className="cm-summary">
              {activeChannels}/{channels.length} kênh đang hoạt động
            </span>
          </div>

          <div className="cm-channel-grid">
            {channels.map((channel) => (
              <div className="cm-channel-card" key={channel.id}>
                <div className="cm-channel-card-top">
                  <div>
                    <span className={`cm-channel-logo ${channel.channel_code.toLowerCase()}`}>
                      {getChannelLabel(channel.channel_code, channel.name)}
                    </span>
                    <p className="cm-channel-code">{channel.channel_code}</p>
                  </div>

                  <span
                    className={`cm-status ${
                      channel.status === "active" ? "success" : "inactive"
                    }`}
                  >
                    {channel.status === "active" ? "Đang hoạt động" : "Tạm ngưng"}
                  </span>
                </div>

                <div className="cm-channel-info">
                  <p>
                    Trạng thái API Key:{" "}
                    <strong>
                      {channel.has_api_key ? "Đã cấu hình" : "Chưa cấu hình"}
                    </strong>
                  </p>
                </div>

                <div className="cm-channel-footer">
                  <span>
                    {channel.status === "active"
                      ? "Kênh đang được kích hoạt"
                      : "Kênh hiện đang bị tắt"}
                  </span>

                  <button
                    className={`cm-toggle ${
                      channel.status === "active" ? "on" : ""
                    }`}
                    disabled={channelLoadingId === channel.id}
                    onClick={() => handleToggleChannel(channel)}
                    aria-label="Thay đổi trạng thái kênh"
                  >
                    <span />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {channels.length === 0 && (
            <div className="cm-empty">Chưa có kênh OTA nào</div>
          )}
        </section>
      )}

      {/* ================= MAPPINGS ================= */}

      {activeTab === "mappings" && !loading && (
        <section className="cm-section">
          <div className="cm-section-heading">
            <div>
              <h2>Room Mapping</h2>
              <p>Ánh xạ loại phòng giữa PMS và các kênh OTA</p>
            </div>

            <button
              className="cm-button cm-button-primary"
              onClick={openCreateMapping}
            >
              + Thêm mapping
            </button>
          </div>

          <div className="cm-filters">
            <select
              value={mappingFilters.channel_id}
              onChange={(e) =>
                setMappingFilters({
                  ...mappingFilters,
                  channel_id: e.target.value,
                })
              }
            >
              <option value="">Tất cả kênh OTA</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>

            <select
              value={mappingFilters.status}
              onChange={(e) =>
                setMappingFilters({
                  ...mappingFilters,
                  status: e.target.value,
                })
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>

          <div className="cm-table-wrapper">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kênh OTA</th>
                  <th>Loại phòng PMS</th>
                  <th>Mã phòng OTA</th>
                  <th>Tên phòng OTA</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {mappings.map((mapping, index) => (
                  <tr key={mapping.id}>
                    <td>{index + 1}</td>
                    <td>{mapping.channel_name}</td>
                    <td>{mapping.room_type_name}</td>
                    <td>
                      <strong>{mapping.ota_room_code}</strong>
                    </td>
                    <td>{mapping.ota_room_name || "-"}</td>
                    <td>
                      <span
                        className={`cm-status ${
                          mapping.status === "active" ? "success" : "inactive"
                        }`}
                      >
                        {mapping.status === "active"
                          ? "Đang hoạt động"
                          : "Tạm ngưng"}
                      </span>
                    </td>
                    <td>
                      <div className="cm-actions">
                        <button
                          className="cm-action-edit"
                          onClick={() => openEditMapping(mapping)}
                        >
                          Sửa
                        </button>

                        <button
                          className="cm-action-delete"
                          onClick={() => handleDeleteMapping(mapping)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {mappings.length === 0 && (
              <div className="cm-empty">Chưa có Room Mapping</div>
            )}
          </div>
        </section>
      )}

      {/* ================= SYNC LOGS ================= */}

      {activeTab === "logs" && !loading && (
        <section className="cm-section">
          <div className="cm-section-heading">
            <div>
              <h2>Lịch sử đồng bộ</h2>
              <p>Theo dõi các sự kiện đồng bộ dữ liệu với kênh OTA</p>
            </div>
          </div>

          <div className="cm-filters">
            <select
              value={logFilters.channel_id}
              onChange={(e) => {
                setLogFilters({
                  ...logFilters,
                  channel_id: e.target.value,
                });
                setLogPage(1);
              }}
            >
              <option value="">Tất cả kênh OTA</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>

            <select
              value={logFilters.status}
              onChange={(e) => {
                setLogFilters({
                  ...logFilters,
                  status: e.target.value,
                });
                setLogPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại</option>
            </select>

            <input
              type="text"
              placeholder="Loại sự kiện..."
              value={logFilters.event_type}
              onChange={(e) => {
                setLogFilters({
                  ...logFilters,
                  event_type: e.target.value,
                });
                setLogPage(1);
              }}
            />
          </div>

          <div className="cm-table-wrapper">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Kênh OTA</th>
                  <th>Loại sự kiện</th>
                  <th>Mã booking OTA</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>

              <tbody>
                {syncLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{formatDateTime(log.created_at)}</td>
                    <td>{log.channel_name}</td>
                    <td>{log.event_type}</td>
                    <td>{log.external_booking_id || "-"}</td>
                    <td>
                      <span
                        className={`cm-status ${
                          log.status === "success" ? "success" : "failed"
                        }`}
                      >
                        {log.status === "success" ? "Thành công" : "Thất bại"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="cm-action-view"
                        onClick={() => setSelectedLog(log)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {syncLogs.length === 0 && (
              <div className="cm-empty">Chưa có lịch sử đồng bộ</div>
            )}
          </div>

          <div className="cm-pagination">
            <span>
              Tổng cộng {logPagination.total} bản ghi
            </span>

            <div>
              <button
                disabled={logPage <= 1}
                onClick={() => setLogPage((page) => page - 1)}
              >
                Trước
              </button>

              <span>
                Trang {logPage} / {Math.max(logPagination.totalPages, 1)}
              </span>

              <button
                disabled={
                  logPage >= logPagination.totalPages ||
                  logPagination.totalPages === 0
                }
                onClick={() => setLogPage((page) => page + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= MAPPING MODAL ================= */}

      {showMappingModal && (
        <div className="cm-modal-overlay">
          <div className="cm-modal">
            <div className="cm-modal-header">
              <h2>
                {editingMapping ? "Cập nhật Room Mapping" : "Thêm Room Mapping"}
              </h2>

              <button
                onClick={() => {
                  setShowMappingModal(false);
                  resetMappingForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleMappingSubmit}>
              <div className="cm-form-group">
                <label>Kênh OTA *</label>
                <select
                  value={mappingForm.channel_id}
                  onChange={(e) =>
                    setMappingForm({
                      ...mappingForm,
                      channel_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Chọn kênh OTA --</option>
                  {channels
                    .filter((channel) => channel.status === "active")
                    .map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="cm-form-group">
                <label>Loại phòng PMS *</label>
                <select
                  value={mappingForm.room_type_id}
                  onChange={(e) =>
                    setMappingForm({
                      ...mappingForm,
                      room_type_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Chọn loại phòng --</option>
                  {roomTypes.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cm-form-group">
                <label>Mã phòng OTA *</label>
                <input
                  type="text"
                  value={mappingForm.ota_room_code}
                  onChange={(e) =>
                    setMappingForm({
                      ...mappingForm,
                      ota_room_code: e.target.value,
                    })
                  }
                  maxLength={100}
                  placeholder="Ví dụ: BK_STD"
                  required
                />
              </div>

              <div className="cm-form-group">
                <label>Tên phòng OTA</label>
                <input
                  type="text"
                  value={mappingForm.ota_room_name}
                  onChange={(e) =>
                    setMappingForm({
                      ...mappingForm,
                      ota_room_name: e.target.value,
                    })
                  }
                  maxLength={255}
                  placeholder="Ví dụ: Standard Room"
                />
              </div>

              <div className="cm-form-group">
                <label>Trạng thái</label>
                <select
                  value={mappingForm.status}
                  onChange={(e) =>
                    setMappingForm({
                      ...mappingForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ngưng</option>
                </select>
              </div>

              <div className="cm-modal-actions">
                <button
                  type="button"
                  className="cm-button cm-button-outline"
                  onClick={() => {
                    setShowMappingModal(false);
                    resetMappingForm();
                  }}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="cm-button cm-button-primary"
                  disabled={savingMapping}
                >
                  {savingMapping ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= LOG DETAIL MODAL ================= */}

      {selectedLog && (
        <div className="cm-modal-overlay">
          <div className="cm-modal">
            <div className="cm-modal-header">
              <h2>Chi tiết đồng bộ #{selectedLog.id}</h2>
              <button onClick={() => setSelectedLog(null)}>×</button>
            </div>

            <div className="cm-log-detail">
              <p>
                <strong>Kênh OTA:</strong> {selectedLog.channel_name}
              </p>
              <p>
                <strong>Loại sự kiện:</strong> {selectedLog.event_type}
              </p>
              <p>
                <strong>Mã booking OTA:</strong>{" "}
                {selectedLog.external_booking_id || "-"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedLog.status === "success"
                  ? "Thành công"
                  : "Thất bại"}
              </p>
              <p>
                <strong>Thời gian:</strong>{" "}
                {formatDateTime(selectedLog.created_at)}
              </p>
              <p>
                <strong>Thông báo:</strong>
              </p>
              <div className="cm-log-message">
                {selectedLog.message || "Không có thông báo"}
              </div>
            </div>

            <div className="cm-modal-actions">
              <button
                className="cm-button cm-button-primary"
                onClick={() => setSelectedLog(null)}
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

export default ChannelManager;