import { Navigate, Outlet } from "react-router-dom";

function isAuthenticated(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

export function PrivateRoute() {
  return isAuthenticated()
    ? <Outlet />
    : <Navigate to="/login" replace />;
}