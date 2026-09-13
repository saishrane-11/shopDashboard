import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import type { Sale } from "../types/api";
import { formatDate, formatTime, moneyExact } from "../utils/format";

export function SaleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .sale(id)
      .then((data) => setSale(data as Sale))
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function cancel() {
    if (!id || !confirm("Cancel this sale and restore stock?")) return;
    setBusy(true);
    try {
      const data = (await api.cancelSale(id)) as Sale;
      setSale(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel sale.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!sale) return <p className="loading">Loading sale...</p>;

  return (
    <div className="page">
      <h1>Sale</h1>
      <p className="muted">
        {formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}
      </p>
      <StatusBadge status={sale.status} />
      {sale.items.map((item) => (
        <article key={item.id} className="card">
          <strong>{item.productName}</strong>
          <p>
            {item.quantity} × {moneyExact(item.unitPrice)} = {moneyExact(item.totalPrice)}
          </p>
        </article>
      ))}
      <div className="card row" style={{ justifyContent: "space-between" }}>
        <strong>Total</strong>
        <strong>{moneyExact(sale.totalAmount)}</strong>
      </div>
      {sale.status === "COMPLETED" ? (
        <Button type="danger" disabled={busy} onClick={() => void cancel()} block>
          Cancel sale
        </Button>
      ) : null}
      <Button type="ghost" onClick={() => navigate("/sales")} block>
        Back
      </Button>
    </div>
  );
}
