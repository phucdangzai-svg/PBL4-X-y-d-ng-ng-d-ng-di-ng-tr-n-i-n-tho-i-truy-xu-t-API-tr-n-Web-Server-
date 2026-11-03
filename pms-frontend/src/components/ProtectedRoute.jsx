import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const accessToken = localStorage.getItem("accessToken");
  const userString = localStorage.getItem("user");

  let user = null;

  try {
    user = userString ? JSON.parse(userString) : null;
  } catch {
    user = null;
  }

  const hasPermission = ["owner", "admin"].includes(user?.role);

  if (!accessToken || !hasPermission) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
