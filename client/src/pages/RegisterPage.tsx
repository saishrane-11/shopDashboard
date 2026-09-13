import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { Shop, User } from "../types/api";

export function RegisterPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = (await api.register({ shopName, ownerName, phone, email, password })) as {
        user: User;
        shop: Shop;
      };
      setSession(data.user, data.shop);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <h1>Create shop</h1>
      <p className="muted">Takes less than a minute.</p>
      <Field label="Shop name" value={shopName} onChange={setShopName} required />
      <Field label="Owner name" value={ownerName} onChange={setOwnerName} required />
      <Field label="Phone" value={phone} onChange={setPhone} required />
      <Field label="Email (optional)" value={email} onChange={setEmail} type="email" />
      <Field label="Password" value={password} onChange={setPassword} type="password" required />
      {error ? <p className="error">{error}</p> : null}
      <Button htmlType="submit" disabled={busy} block>
        {busy ? "Please wait..." : "Create account"}
      </Button>
      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
