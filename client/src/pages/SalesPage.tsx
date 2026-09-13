import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import type { Sale } from "../types/api";
import { formatDate, formatTime, money } from "../utils/format";

export function SalesPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState("");

  async function load(next = { period, from, to, q }) {
    const params = new URLSearchParams({ period: next.period, q: next.q });
    if (next.period === "custom") {
      params.set("from", next.from);
      params.set("to", next.to);
    }
    try {
      const data = (await api.sales(params.toString())) as Sale[];
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load sales.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="page">
      <h1>Sales history</h1>
      <select
        className="select"
        value={period}
        onChange={(e) => {
          const value = e.target.value;
          setPeriod(value);
          void load({ period: value, from, to, q });
        }}
      >
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="week">This week</option>
        <option value="month">This month</option>
        <option value="custom">Custom range</option>
      </select>
      {period === "custom" ? (
        <div className="row">
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="btn btn-ghost" onClick={() => void load()}>
            Apply
          </button>
        </div>
      ) : null}
      <input
        className="input"
        placeholder="Search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          void load({ period, from, to, q: e.target.value });
        }}
      />
      {error ? <p className="error">{error}</p> : null}
      {sales.length === 0 ? <p className="empty">No sales in this period.</p> : null}
      {sales.map((sale) => (
        <button
          key={sale.id}
          className="card stack"
          style={{ textAlign: "left" }}
          onClick={() => navigate(`/sales/${sale.id}`)}
        >
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>
              {formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}
            </span>
            <StatusBadge status={sale.status} />
          </div>
          <p>{sale.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p>
          <strong>{money(sale.totalAmount)}</strong>
        </button>
      ))}
    </div>
  );
}
