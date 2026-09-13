const API = "/api";

type ApiSuccess<T> = { success: true; data: T; message?: string };
type ApiFail = { success: false; message: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  const body = (await res.json().catch(() => ({}))) as ApiSuccess<T> | ApiFail;
  if (!res.ok || !("success" in body) || body.success === false) {
    throw new Error(("message" in body && body.message) || "Something went wrong. Please try again.");
  }
  return body.data;
}

export const api = {
  register: (payload: Record<string, string>) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: Record<string, string>) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  changePassword: (payload: Record<string, string>) =>
    request("/auth/password", { method: "PATCH", body: JSON.stringify(payload) }),
  products: (q?: string) => request(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  popularProducts: () => request("/products?popular=true"),
  product: (id: string) => request(`/products/${id}`),
  createProduct: (payload: Record<string, string | number>) =>
    request("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: Record<string, string | number>) =>
    request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteProduct: (id: string) => request(`/products/${id}`, { method: "DELETE" }),
  createSale: (items: Array<{ productId: string; quantity: number }>) =>
    request("/sales", { method: "POST", body: JSON.stringify({ items }) }),
  sales: (params: string) => request(`/sales?${params}`),
  sale: (id: string) => request(`/sales/${id}`),
  cancelSale: (id: string) => request(`/sales/${id}/cancel`, { method: "POST" }),
  dashboard: () => request("/dashboard"),
  reportsSales: (trend: string) => request(`/reports/sales?trend=${trend}`),
  topProducts: () => request("/reports/top-products"),
  shop: () => request("/shop"),
  updateShop: (payload: Record<string, string>) =>
    request("/shop", { method: "PATCH", body: JSON.stringify(payload) }),
};
