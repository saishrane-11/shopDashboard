export type User = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type Shop = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
};

export type SaleItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Sale = {
  id: string;
  totalAmount: number;
  status: "COMPLETED" | "CANCELLED";
  createdAt: string;
  items: SaleItem[];
};

export type DashboardData = {
  todaySales: number;
  transactions: number;
  products: number;
  lowStock: number;
  recentSales: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    summary: string;
  }>;
};

export type SalesReport = {
  summary: { today: number; week: number; month: number };
  trend: Array<{ label: string; total: number }>;
};

export type TopProduct = {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
};

export type ShopSettings = {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string | null;
};
