import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { SalesReport, TopProduct } from "../types/api";
import { money } from "../utils/format";

export function ReportsPage() {
  const [trend, setTrend] = useState("daily");
  const [report, setReport] = useState<SalesReport | null>(null);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.reportsSales(trend), api.topProducts()])
      .then(([sales, products]) => {
        setReport(sales as SalesReport);
        setTop(products as TopProduct[]);
      })
      .catch((err: Error) => setError(err.message));
  }, [trend]);

  const max = Math.max(1, ...(report?.trend.map((p) => p.total) ?? [1]));

  return (
    <div className="page">
      <h1>Reports</h1>
      {error ? <p className="error">{error}</p> : null}
      {report ? (
        <>
          <div className="grid-cards">
            <div className="card">
              <p className="muted">Today</p>
              <h2>{money(report.summary.today)}</h2>
            </div>
            <div className="card">
              <p className="muted">This week</p>
              <h2>{money(report.summary.week)}</h2>
            </div>
            <div className="card">
              <p className="muted">This month</p>
              <h2>{money(report.summary.month)}</h2>
            </div>
          </div>
          <div className="card stack">
            <div className="row">
              <h3>Sales trend</h3>
              <select className="select" value={trend} onChange={(e) => setTrend(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {report.trend.length === 0 ? <p className="muted">Not enough data yet.</p> : null}
            {report.trend.map((point) => (
              <div key={point.label}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>{point.label}</span>
                  <span>{money(point.total)}</span>
                </div>
                <div style={{ height: 10, background: "#d7f3ef", borderRadius: 99 }}>
                  <div
                    style={{
                      width: `${(point.total / max) * 100}%`,
                      height: "100%",
                      background: "#0f766e",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="loading">Loading reports...</p>
      )}
      <section className="stack">
        <h3>Top selling products</h3>
        {top.map((item) => (
          <article key={item.productId} className="card row" style={{ justifyContent: "space-between" }}>
            <strong>{item.name}</strong>
            <span>{item.quantitySold} sold</span>
          </article>
        ))}
      </section>
    </div>
  );
}
