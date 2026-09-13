import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { Shop, User } from "../types/api";

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = (await api.login({ identifier, password })) as { user: User; shop: Shop };
      setSession(data.user, data.shop);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <h1>Shop Book</h1>
      <p className="muted">Log in to record today's sales.</p>
      <Field label="Phone or email" value={identifier} onChange={setIdentifier} required />
      <Field label="Password" value={password} onChange={setPassword} type="password" required />
      {error ? <p className="error">{error}</p> : null}
      <Button htmlType="submit" disabled={busy} block>
        {busy ? "Please wait..." : "Log in"}
      </Button>
      <p className="muted">
        New shop? <Link to="/register">Create account</Link>
      </p>
    </form>
  );
}
