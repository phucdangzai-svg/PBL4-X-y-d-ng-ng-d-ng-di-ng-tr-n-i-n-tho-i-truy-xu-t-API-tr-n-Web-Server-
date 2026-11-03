import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./AdminLayout.css";

function AdminLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <span>HOTEL MANAGEMENT SYSTEM</span>
            <h2>GRAND HOTEL PMS</h2>
          </div>

          <div className="admin-user">
            <strong>{user.username}</strong>
            <span>{user.role}</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
