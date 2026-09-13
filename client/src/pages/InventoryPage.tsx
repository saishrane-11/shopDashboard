import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import type { Product } from "../types/api";

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .products()
      .then((data) => setProducts(data as Product[]))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Inventory</h1>
      {error ? <p className="error">{error}</p> : null}
      {products.map((product) => (
        <article key={product.id} className="card row" style={{ justifyContent: "space-between" }}>
          <div>
            <strong>{product.name}</strong>
            <p className="muted">Stock {product.stockQuantity}</p>
          </div>
          <StatusBadge status={product.status} />
        </article>
      ))}
    </div>
  );
}
