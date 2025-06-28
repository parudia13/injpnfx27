export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string; // deprecated, use images instead
  images?: string[];
  variants?: ProductVariant[];
  stock: number;
  status?: 'active' | 'inactive' | 'draft' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
  // Additional properties for cart functionality
  selectedVariantName?: string;
  selectedVariants?: Record<string, any>;
}

export interface ProductVariant {
  id?: string;
  name: string;
  price: number;
  stock: number;
  images?: string[];
  rawSelections?: Record<string, string>;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  total_price: number; // Alternative property name used in some components
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed' | 'completed';
  shipping_address: ShippingAddress;
  payment_method: 'credit_card' | 'paypal' | 'cod';
  created_at: string;
  updated_at: string;
  customer_info: CustomerInfo;
  referralTransaction?: any;
  invoice_number?: string;
  shipping_fee?: number; // Added shipping fee field
}

export interface OrderItem {
  product_id?: string;
  quantity: number;
  price: number;
  name: string;
  image_url?: string;
  selectedVariants?: Record<string, any>;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  prefecture?: string;
  postal_code?: string;
  city?: string;
  notes?: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
  created_at?: string;
  updated_at?: string;
}

export interface AdminLog {
  id: string;
  user_id: string;
  admin_id?: string; // Alternative property name
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface RecycleBinItem {
  id: string;
  original_table: string;
  original_id: string;
  data: Product;
  deleted_at: string;
}

// CartItem interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  product: Product;
  selectedVariants?: Record<string, any>;
  selectedVariantName?: string | null;
}

// DashboardStats interface
export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: Product[];
  totalOrders: number;
  criticalStockProducts: Product[];
  totalCategories: number;
  pendingOrders: number;
  totalRevenue: number;
}

// Prefecture interface
export interface Prefecture {
  name: string;
  name_en: string;
}

// Invoice interface
export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  created_at: string;
  total_amount: number;
  status: 'paid' | 'unpaid' | 'cancelled';
  payment_method?: string;
  payment_date?: string;
}

// OrderTracking interface
export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
  notes?: string;
  // Additional properties used in export utils
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount?: number;
  items?: any[];
  created_at?: string;
}

// Shipping Rate interface
export interface ShippingRate {
  id: string;
  prefecture_id: string;
  kanji: string;
  romaji: string;
  price: number;
  delivery_time: string;
  created_at?: string;
  updated_at?: string;
}