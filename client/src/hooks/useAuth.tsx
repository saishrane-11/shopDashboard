import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { Shop, User } from "../types/api";

type AuthState = {
  user: User | null;
  shop: Shop | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setSession: (user: User, shop: Shop) => void;
  clear: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = (await api.me()) as { user: User; shop: Shop };
      setUser(data.user);
      setShop(data.shop);
    } catch {
      setUser(null);
      setShop(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(
    () => ({
      user,
      shop,
      loading,
      refresh,
      setSession: (nextUser: User, nextShop: Shop) => {
        setUser(nextUser);
        setShop(nextShop);
      },
      clear: () => {
        setUser(null);
        setShop(null);
      },
    }),
    [user, shop, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
