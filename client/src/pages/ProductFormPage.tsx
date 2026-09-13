import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { api } from "../services/api";
import type { Product } from "../types/api";

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("0");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .product(id)
      .then((product) => {
        const p = product as Product;
        setName(p.name);
        setSellingPrice(String(p.sellingPrice));
        setStockQuantity(String(p.stockQuantity));
        setLowStockThreshold(String(p.lowStockThreshold));
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      name,
      sellingPrice: Number(sellingPrice),
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
    };
    try {
      if (editing && id) await api.updateProduct(id, payload);
      else await api.createProduct(payload);
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="page" onSubmit={onSubmit}>
      <h1>{editing ? "Edit product" : "Add product"}</h1>
      <Field label="Product name" value={name} onChange={setName} required />
      <Field label="Selling price" value={sellingPrice} onChange={setSellingPrice} type="number" required />
      <Field label="Current stock" value={stockQuantity} onChange={setStockQuantity} type="number" required />
      <Field
        label="Low stock threshold"
        value={lowStockThreshold}
        onChange={setLowStockThreshold}
        type="number"
        required
      />
      {error ? <p className="error">{error}</p> : null}
      <Button htmlType="submit" disabled={busy} block>
        Save product
      </Button>
      <Link to="/products">Cancel</Link>
    </form>
  );
}
