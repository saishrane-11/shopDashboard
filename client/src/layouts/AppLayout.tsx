import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./AppLayout.module.css";

const links = [
  { to: "/dashboard", label: "Home" },
  { to: "/sales", label: "Sales" },
  { to: "/sales/new", label: "Sale", plus: true },
  { to: "/products", label: "Products" },
  { to: "/reports", label: "More" },
];

export function AppLayout() {
  const { shop } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <strong>{shop?.name ?? "Shop Book"}</strong>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/sales/new">New Sale</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/inventory">Inventory</NavLink>
        <NavLink to="/sales">Sales</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </aside>
      <div>
        <header className={styles.topbar}>
          <span className={styles.shopName}>{shop?.name ?? "Shop Book"}</span>
          <button className="btn btn-ghost" onClick={() => navigate("/settings")}>
            Settings
          </button>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
        <nav className={styles.bottomNav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              {link.plus ? <span className={styles.navPlus}>+</span> : null}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
