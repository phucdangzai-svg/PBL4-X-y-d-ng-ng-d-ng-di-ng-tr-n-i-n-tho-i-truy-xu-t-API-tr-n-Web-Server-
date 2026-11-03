import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { getDashboardOverviewApi } from "../Services/api";
import "./Dashboard.css";

const COLORS = {
  available: "#16a085",
  occupied: "#315b91",
  maintenance: "#e59b36",
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  checked_in: "Đã nhận phòng",
  checked_out: "Đã trả phòng",
  cancelled: "Đã hủy",
};

const STATUS_COLORS = {
  pending: "#e5a43b",
  confirmed: "#315b91",
  checked_in: "#16a085",
  checked_out: "#64748b",
  cancelled: "#dc6262",
};

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) => {
  if (!value) return "--";

  return new Date(value).toLocaleDateString("vi-VN");
};

const formatMoney = (value) => `${formatNumber(value)} đ`;

function Dashboard() {
  const [period, setPeriod] = useState("7days");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardOverviewApi(period);

      if (!response?.success) {
        throw new Error(response?.message || "Không thể tải dữ liệu Dashboard");
      }

      setDashboard(response.data);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tải Dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>Đang tải dữ liệu Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboard}>Thử lại</button>
      </div>
    );
  }

  if (!dashboard) return null;

  const { summary, occupancy, bookingTrend, bookingStatus, recentBookings } =
    dashboard;

  const occupancyData = (occupancy || []).map((item) => ({
    ...item,
    name:
      item.status === "available"
        ? "Phòng trống"
        : item.status === "occupied"
          ? "Đang sử dụng"
          : "Bảo trì",
    value: Number(item.total),
  }));

  const statusData = (bookingStatus || []).map((item) => ({
    ...item,
    name: STATUS_LABELS[item.status] || item.status,
    total: Number(item.total),
    fill: STATUS_COLORS[item.status] || "#64748b",
  }));

  const cards = [
    {
      title: "Tổng số phòng",
      value: summary.totalRooms,
      icon: "▦",
      color: "blue",
    },
    {
      title: "Phòng trống",
      value: summary.availableRooms,
      icon: "✓",
      color: "green",
    },
    {
      title: "Đang sử dụng",
      value: summary.occupiedRooms,
      icon: "⌂",
      color: "orange",
    },
    {
      title: "Phòng bảo trì",
      value: summary.maintenanceRooms,
      icon: "⚙",
      color: "red",
    },
    {
      title: "Booking hôm nay",
      value: summary.todayBookings,
      icon: "▤",
      color: "purple",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan</h1>
          <p>Thống kê và tình hình hoạt động khách sạn</p>
        </div>

        <div className="dashboard-actions">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày gần đây</option>
            <option value="30days">30 ngày gần đây</option>
          </select>

          <button onClick={fetchDashboard} className="dashboard-refresh">
            ↻ Làm mới
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="dashboard-stats">
        {cards.map((card) => (
          <div className="dashboard-stat-card" key={card.title}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>

            <div>
              <p>{card.title}</p>
              <h2>{formatNumber(card.value)}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="dashboard-panel occupancy-panel">
          <div className="panel-header">
            <div>
              <h3>Tình trạng phòng</h3>
              <p>Thống kê trạng thái phòng hiện tại</p>
            </div>
          </div>

          {occupancyData.length === 0 ? (
            <div className="chart-empty">Chưa có dữ liệu</div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {occupancyData.map((item) => (
                      <Cell
                        key={item.status}
                        fill={COLORS[item.status] || "#64748b"}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => `${value} phòng`} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="dashboard-panel trend-panel">
          <div className="panel-header">
            <div>
              <h3>Xu hướng Booking</h3>
              <p>Số booking được tạo theo thời gian</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bookingTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => date.slice(5)}
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={(date) => `Ngày ${date}`}
                  formatter={(value) => [`${value} booking`, "Số lượng"]}
                />
                <Bar
                  dataKey="total"
                  name="Booking"
                  fill="#315b91"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Booking status */}
      <div className="dashboard-panel status-panel">
        <div className="panel-header">
          <div>
            <h3>Trạng thái Booking</h3>
            <p>Phân bố booking trong khoảng thời gian đã chọn</p>
          </div>
        </div>

        {statusData.length === 0 ? (
          <div className="chart-empty">Chưa có dữ liệu booking</div>
        ) : (
          <div className="status-chart">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={statusData}
                layout="vertical"
                margin={{ left: 20, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value} booking`, "Số lượng"]}
                />
                <Bar
                  dataKey="total"
                  name="Booking"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                >
                  {statusData.map((item) => (
                    <Cell key={item.status} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div className="dashboard-panel recent-panel">
        <div className="panel-header">
          <div>
            <h3>Booking gần đây</h3>
            <p>5 booking mới nhất trong hệ thống</p>
          </div>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Mã Booking</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Loại phòng</th>
                <th>Ngày nhận</th>
                <th>Ngày trả</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {(recentBookings || []).length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    Chưa có booking nào
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.customer_name || "--"}</td>
                    <td>{booking.room_number || "--"}</td>
                    <td>{booking.room_type_name || "--"}</td>
                    <td>{formatDate(booking.check_in)}</td>
                    <td>{formatDate(booking.check_out)}</td>
                    <td>{formatMoney(booking.total_price)}</td>
                    <td>
                      <span className={`booking-badge ${booking.status}`}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
