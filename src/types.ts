export type CurrencyCode = 'SAR' | 'AED' | 'EGP';
export type LanguageCode = 'en' | 'ar';

export interface Store {
  id: string; // storeId
  name: string;
  nameAr?: string;
  slug: string;
  vendorId: string;
  vendorEmail: string;
  description: string;
  descriptionAr?: string;
  city: string;
  country: 'Saudi Arabia' | 'UAE' | 'Egypt';
  status: 'active' | 'suspended' | 'pending';
  logoUrl?: string;
  bannerUrl?: string;
  productCount?: number;
  rating?: number;
  artisanPoints?: number;
  createdAt: any;
  updatedAt: any;
}

export type ProductCategory = 
  | 'trays'
  | 'mabkhara'
  | 'planters'
  | 'lighting'
  | 'sculptures'
  | 'tableware'
  | 'bespoke';

export interface Product {
  id: string;
  storeId: string;
  storeName?: string;
  vendorId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: ProductCategory;
  basePriceSAR: number; // Base currency is SAR
  stock: number;
  imageUrl: string;
  dimensions: string;
  weightKg: number;
  finish: string;
  finishAr?: string;
  isFeatured?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productTitleAr?: string;
  storeId: string;
  storeName?: string;
  vendorId: string;
  quantity: number;
  unitPriceSAR: number;
  totalPriceSAR: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  storeId: string; // Target specific store
  vendorId: string; // Target artisan
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  country: string;
  city: string;
  address: string;
  paymentMethod: 'COD'; // Cash On Delivery
  currency: CurrencyCode;
  totalAmount: number;
  totalAmountSAR: number;
  items: OrderItem[];
  storeIds?: string[];
  status: 'pending' | 'accepted' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  recipientId: string; // Artisan UID or "superadmin"
  recipientRole: 'artisan' | 'superadmin';
  storeId?: string;
  storeName?: string;
  title: string;
  message: string;
  type: 'new_order' | 'callback_request' | 'system';
  orderId?: string;
  status: 'unread' | 'accepted' | 'read';
  createdAt: any;
}

export interface StoreMessage {
  id: string;
  storeId: string;
  customerId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'artisan';
  text: string;
  createdAt: any;
}

export interface CallbackRequest {
  id: string;
  storeId: string;
  storeName?: string;
  customerName: string;
  customerPhone: string;
  preferredTime?: string;
  inquiry?: string;
  status: 'pending' | 'called' | 'resolved';
  createdAt: any;
}

export interface CustomRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  country: string;
  city: string;
  concreteColor: string;
  aggregateType: string;
  engravingText?: string;
  dimensions?: string;
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  budget: number;
  currency: CurrencyCode;
  notes?: string;
  status: 'new' | 'in_review' | 'quoted' | 'in_production' | 'completed';
  targetStoreId?: string;
  createdAt: any;
}

export type UserRole = 'superadmin' | 'admin' | 'vendor' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  storeId?: string;
  storeSlug?: string;
  artisanPoints?: number;
  isBanned?: boolean;
  createdAt?: any;
}

export interface AdminCode {
  code: string;
  slotNumber: number;
  isClaimed: boolean;
  claimedByStoreId?: string;
  claimedByStoreName?: string;
  claimedAt?: any;
}

export interface MarketplaceSettings {
  id: string;
  appName: string;
  appNameAr?: string;
  appTagline: string;
  appTaglineAr?: string;
  logoUrl?: string;
  bannerUrl?: string;
  heroTitle?: string;
  heroTitleAr?: string;
  heroSubtitle?: string;
  heroSubtitleAr?: string;
  adminCodes?: AdminCode[];
  updatedAt?: any;
}
