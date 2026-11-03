import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>✦</span> GRAND HOTEL
      </div>

      <p className="sidebar-label">MAIN MENU</p>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          ▦ Tổng quan
        </NavLink>

        <NavLink to="/rooms" className="nav-item">
          ▣ Quản lý phòng
        </NavLink>

        <NavLink to="/bookings" className="nav-item">
          ▤ Đặt phòng
        </NavLink>

        <NavLink to="/customers" className="nav-item">
          ♙ Khách hàng
        </NavLink>

        <NavLink to="/room-types" className="nav-item">
          ▧ Loại phòng
        </NavLink>

        <NavLink to="/channel-manager" className="nav-item">
          ◈ Channel Manager
        </NavLink>
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        ↪ Đăng xuất
      </button>
    </aside>
  );
}

export default Sidebar;
