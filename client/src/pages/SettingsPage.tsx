import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { ShopSettings } from "../types/api";

export function SettingsPage() {
  const { clear, setSession, user } = useAuth();
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .shop()
      .then((data) => {
        const shop = data as ShopSettings;
        setShopName(shop.name);
        setOwnerName(shop.ownerName);
        setPhone(shop.phone);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  async function saveShop(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const shop = (await api.updateShop({ shopName, ownerName, phone })) as ShopSettings;
      if (user) setSession({ ...user, name: shop.ownerName, phone: shop.phone }, { id: shop.id, name: shop.name });
      setMessage("Shop details saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save shop.");
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change password.");
    }
  }

  async function logout() {
    await api.logout();
    clear();
    navigate("/login");
  }

  return (
    <div className="page">
      <h1>Settings</h1>
      {message ? <p className="muted">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <form className="card stack" onSubmit={saveShop}>
        <h3>Shop information</h3>
        <Field label="Shop name" value={shopName} onChange={setShopName} required />
        <Field label="Owner name" value={ownerName} onChange={setOwnerName} required />
        <Field label="Phone" value={phone} onChange={setPhone} required />
        <Button htmlType="submit">Save</Button>
      </form>
      <form className="card stack" onSubmit={savePassword}>
        <h3>Account</h3>
        <Field label="Current password" value={currentPassword} onChange={setCurrentPassword} type="password" required />
        <Field label="New password" value={newPassword} onChange={setNewPassword} type="password" required />
        <Button htmlType="submit">Change password</Button>
      </form>
      <Button type="danger" onClick={() => void logout()} block>
        Log out
      </Button>
    </div>
  );
}
