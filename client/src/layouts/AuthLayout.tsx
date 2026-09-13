import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div className="card" style={{ width: "min(420px, 100%)" }}>
        <Outlet />
      </div>
    </div>
  );
}
