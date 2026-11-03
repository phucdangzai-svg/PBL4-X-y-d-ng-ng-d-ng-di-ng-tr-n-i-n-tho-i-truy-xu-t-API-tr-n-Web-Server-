import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../Services/api.js";
import "../App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Gọi API đăng nhập Backend
      const data = await loginApi(username, password);

      // Chỉ Owner và Admin được truy cập PMS
      if (!["owner", "admin"].includes(data.user.role)) {
        throw new Error("Bạn không có quyền truy cập PMS");
      }

      // Lưu thông tin đăng nhập
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* Khu vực giới thiệu */}
      <section className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <span className="logo-icon">✦</span>
            <span>GRAND HOTEL</span>
          </div>

          <div className="brand-message">
            <span className="brand-subtitle">HOTEL MANAGEMENT SYSTEM</span>

            <h1>
              Manage your hotel.
              <br />
              <span>Elevate your service.</span>
            </h1>

            <p>
              A smarter way to manage your hotel operations, reservations and
              guest experiences.
            </p>
          </div>

          <div className="brand-footer">
            <span>PREMIUM HOTEL MANAGEMENT</span>
            <span>EST. 2026</span>
          </div>
        </div>
      </section>

      {/* Khu vực đăng nhập */}
      <section className="login-form-section">
        <div className="login-form-wrapper">
          <div className="form-heading">
            <span className="form-eyebrow">WELCOME BACK</span>
            <h2>Sign in</h2>
            <p>Đăng nhập để tiếp tục quản lý khách sạn của bạn.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="form-footer">
            <span>© 2026 GRAND HOTEL PMS</span>
            <span>SECURE ACCESS</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
