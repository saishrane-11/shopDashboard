import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { api } from "../services/api";
import type { DashboardData } from "../types/api";
import { formatTime, money } from "../utils/format";

export function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboard()
      .then((res) => setData(res as DashboardData))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="loading">Loading dashboard...</p>;

  return (
    <div className="page">
      <h1>Today</h1>
      <div className="card">
        <p className="muted">Today's Sales</p>
        <h2 style={{ fontSize: 36 }}>{money(data.todaySales)}</h2>
        <p className="muted">{data.transactions} transactions</p>
      </div>
      <div className="grid-cards">
        <div className="card">
          <p className="muted">Products</p>
          <h2>{data.products}</h2>
        </div>
        <div className="card">
          <p className="muted">Low Stock</p>
          <h2>{data.lowStock}</h2>
        </div>
      </div>
      <Button block onClick={() => navigate("/sales/new")}>
        + New Sale
      </Button>
      <section className="stack">
        <h3>Recent sales</h3>
        {data.recentSales.length === 0 ? (
          <p className="empty">No sales yet. Record the first one.</p>
        ) : (
          data.recentSales.map((sale) => (
            <button
              key={sale.id}
              className="card"
              style={{ textAlign: "left", width: "100%" }}
              onClick={() => navigate(`/sales/${sale.id}`)}
            >
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{sale.summary || "Sale"}</strong>
                <span>{money(sale.totalAmount)}</span>
              </div>
              <p className="muted">{formatTime(sale.createdAt)}</p>
            </button>
          ))
        )}
      </section>
    </div>
  );
}
