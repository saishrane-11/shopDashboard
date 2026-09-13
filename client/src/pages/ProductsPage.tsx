import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import type { Product } from "../types/api";
import { money } from "../utils/format";

export function ProductsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  async function load(search = q) {
    try {
      const data = (await api.products(search)) as Product[];
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products.");
    }
  }

  useEffect(() => {
    void load("");
  }, []);

  async function remove(id: string) {
    if (!confirm("Remove this product?")) return;
    try {
      await api.deleteProduct(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove product.");
    }
  }

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Products</h1>
        <div className="row">
          <Button type="ghost" onClick={() => navigate("/inventory")}>
            Inventory
          </Button>
          <Button onClick={() => navigate("/products/new")}>+ Add</Button>
        </div>
      </div>
      <input
        className="input"
        placeholder="Search product..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          void load(e.target.value);
        }}
      />
      {error ? <p className="error">{error}</p> : null}
      {products.length === 0 ? <p className="empty">No products yet.</p> : null}
      {products.map((product) => (
        <article key={product.id} className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{product.name}</strong>
            <StatusBadge status={product.status} />
          </div>
          <p>
            {money(product.sellingPrice)} · Stock {product.stockQuantity}
          </p>
          <div className="row">
            <Button type="ghost" onClick={() => navigate(`/products/${product.id}/edit`)}>
              Edit
            </Button>
            <Button type="danger" onClick={() => void remove(product.id)}>
              Delete
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
