export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  variant?: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  barcode: string | null;
  stock: number;
  lowStockThreshold: number;
  images: string;
  status: string;
  isFeatured: boolean;
  categoryId: string | null;
  category?: CategoryType | null;
  variants?: ProductVariantType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantType {
  id: string;
  name: string;
  value: string;
  price: number | null;
  stock: number;
  sku: string | null;
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface OrderType {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  customerAddress: string | null;
  items: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  notes: string | null;
  whatsappSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItemType[];
}

export interface OrderItemType {
  id: string;
  quantity: number;
  price: number;
  variant: string | null;
  productId: string;
  product?: ProductType;
}

export interface BannerType {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: OrderType[];
  ordersByStatus: Record<string, number>;
  monthlyRevenue: { month: string; revenue: number }[];
  lowStockProducts?: ProductType[];
}
