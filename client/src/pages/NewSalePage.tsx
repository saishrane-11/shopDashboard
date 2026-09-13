import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { api } from "../services/api";
import type { Product, Sale } from "../types/api";
import { money } from "../utils/format";

type Line = { product: Product; quantity: number };

export function NewSalePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [popular, setPopular] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<Line[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Sale | null>(null);

  useEffect(() => {
    api
      .popularProducts()
      .then((data) => setPopular(data as Product[]))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      api
        .products(q)
        .then((data) => setResults(data as Product[]))
        .catch((err: Error) => setError(err.message));
    }, 150);
    return () => clearTimeout(handle);
  }, [q]);

  function add(product: Product) {
    setError("");
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      const nextQty = (existing?.quantity ?? 0) + 1;
      if (nextQty > product.stockQuantity) {
        setError(`Insufficient stock. Only ${product.stockQuantity} units are available.`);
        return current;
      }
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id ? { ...line, quantity: nextQty } : line,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((current) =>
      current
        .map((line) => {
          if (line.product.id !== id) return line;
          const quantity = line.quantity + delta;
          if (quantity > line.product.stockQuantity) {
            setError(`Insufficient stock. Only ${line.product.stockQuantity} units are available.`);
            return line;
          }
          return { ...line, quantity };
        })
        .filter((line) => line.quantity > 0),
    );
  }

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.product.sellingPrice * line.quantity, 0),
    [cart],
  );

  async function complete() {
    if (cart.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const sale = (await api.createSale(
        cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
      )) as Sale;
      setDone(sale);
      setCart([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete sale.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="page">
        <div className="card stack">
          <h1>Sale completed ✓</h1>
          <p>Total: {money(done.totalAmount)}</p>
          <p className="muted">Stock updated automatically.</p>
          <Button
            block
            onClick={() => {
              setDone(null);
              setQ("");
            }}
          >
            New Sale
          </Button>
          <Button type="ghost" block onClick={() => navigate(`/sales/${done.id}`)}>
            View sale
          </Button>
        </div>
      </div>
    );
  }

  const chips = q.trim() ? results : popular;

  return (
    <div className="page">
      <h1>New Sale</h1>
      <input
        className="input"
        placeholder="Search product..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid-cards">
        {chips.map((product) => (
          <button key={product.id} className="card" onClick={() => add(product)} disabled={product.stockQuantity <= 0}>
            <strong>{product.name}</strong>
            <p>{money(product.sellingPrice)}</p>
            <p className="muted">{product.stockQuantity} in stock</p>
          </button>
        ))}
      </div>
      <section className="stack">
        <h3>Selected items</h3>
        {cart.length === 0 ? <p className="empty">Tap a product to add it.</p> : null}
        {cart.map((line) => (
          <article key={line.product.id} className="card row" style={{ justifyContent: "space-between" }}>
            <div>
              <strong>{line.product.name}</strong>
              <p className="muted">{money(line.product.sellingPrice)}</p>
            </div>
            <div className="row">
              <Button type="ghost" onClick={() => changeQty(line.product.id, -1)}>
                -
              </Button>
              <strong>{line.quantity}</strong>
              <Button type="ghost" onClick={() => changeQty(line.product.id, 1)}>
                +
              </Button>
            </div>
          </article>
        ))}
      </section>
      {error ? <p className="error">{error}</p> : null}
      <div className="card row" style={{ justifyContent: "space-between" }}>
        <strong>Total</strong>
        <strong>{money(total)}</strong>
      </div>
      <Button block disabled={busy || cart.length === 0} onClick={() => void complete()}>
        Complete Sale
      </Button>
    </div>
  );
}
