import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, LanguageCode, CartItem, Product, ProductCategory, MarketplaceSettings } from '../types';
import { CURRENCY_RATES } from '../data/seedData';
import { DEFAULT_MARKETPLACE_SETTINGS } from '../data/adminCodes';
import { getMarketplaceSettings, updateMarketplaceSettings, ensureMarketplaceSettings } from '../services/storeService';

interface MarketplaceContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  settings: MarketplaceSettings;
  updateSettings: (updates: Partial<MarketplaceSettings>) => Promise<void>;
  formatPrice: (basePriceSAR: number) => { amount: number; formatted: string; symbol: string };
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalSAR: number;
  cartTotalConverted: { amount: number; formatted: string; symbol: string };
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  countryFilter: string;
  setCountryFilter: (c: string) => void;
  t: (key: string) => string;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('SAR');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [settings, setSettings] = useState<MarketplaceSettings>(DEFAULT_MARKETPLACE_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('qalb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');

  // Load dynamic settings from Firestore on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const live = await ensureMarketplaceSettings();
        setSettings(live);
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    }
    loadSettings();
  }, []);

  const updateSettingsHandler = async (updates: Partial<MarketplaceSettings>) => {
    await updateMarketplaceSettings(updates);
    const updated = await getMarketplaceSettings();
    setSettings(updated);
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qalb_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [cart]);

  // Adjust HTML dir attribute based on language
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key: string): string => {
    // Dynamic translations backed by settings
    if (key === 'brandName') return (language === 'ar' ? (settings.appNameAr || settings.appName) : settings.appName) || 'Qalb Al-Kharasana';
    if (key === 'brandTagline') return (language === 'ar' ? (settings.appTaglineAr || settings.appTagline) : settings.appTagline) || 'Artisanal Concrete Home Art & Architecture';
    if (key === 'heroTitle') return (language === 'ar' ? (settings.heroTitleAr || settings.heroTitle) : settings.heroTitle) || 'Raw Brutalism. Sculptural Elegance.';
    if (key === 'heroSubtitle') return (language === 'ar' ? (settings.heroSubtitleAr || settings.heroSubtitle) : settings.heroSubtitle) || 'Artisanal concrete decor across the Arab world.';

    const dict: Record<string, { en: string; ar: string }> = {
      exploreProducts: { en: 'Catalog', ar: 'الكتالوج' },
      artisanStores: { en: '30 Artisan Ateliers', ar: 'مشاغل الخرسانة (٣٠ متجر)' },
      bespokeRequest: { en: 'Custom Order', ar: 'طلب خرسانة مخصص' },
      vendorPortal: { en: 'Vendor Dashboard', ar: 'لوحة تحكم المشغل' },
      superAdmin: { en: 'Super Admin', ar: 'الإدارة العليا' },
      cart: { en: 'Cart', ar: 'السلة' },
      currency: { en: 'Currency', ar: 'العملة' },
      language: { en: 'Language', ar: 'اللغة' },
      all: { en: 'All Collections', ar: 'جميع القطع' },
      addToCart: { en: 'Add to Cart', ar: 'إضافة للسلة' },
      yourCart: { en: 'Shopping Bag', ar: 'سلة المقتنيات' },
      emptyCart: { en: 'Your bag is empty. Explore our concrete creations.', ar: 'سلتك فارغة، استكشف روائع الخرسانة الفنية.' },
      subtotal: { en: 'Subtotal', ar: 'المجموع' },
      codDelivery: { en: 'Cash on Delivery (COD)', ar: 'الدفع عند الاستلام (COD)' },
      proceedToCheckout: { en: 'Proceed to COD Checkout', ar: 'إتمام الطلب (الدفع عند الاستلام)' },
      dimensions: { en: 'Dimensions', ar: 'الأبعاد' },
      weight: { en: 'Weight', ar: 'الوزن' },
      finish: { en: 'Finish', ar: 'المعالجة' },
    };

    const entry = dict[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  const formatPrice = (basePriceSAR: number) => {
    const info = CURRENCY_RATES[currency] || CURRENCY_RATES.SAR;
    const amount = Math.round(basePriceSAR * info.rate);
    const symbol = language === 'ar' ? info.symbolAr : info.symbol;
    return {
      amount,
      formatted: `${amount.toLocaleString()} ${symbol}`,
      symbol,
    };
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalSAR = cart.reduce(
    (sum, item) => sum + item.product.basePriceSAR * item.quantity,
    0
  );

  const cartTotalConverted = formatPrice(cartTotalSAR);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <MarketplaceContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        settings,
        updateSettings: updateSettingsHandler,
        formatPrice,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalSAR,
        cartTotalConverted,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        countryFilter,
        setCountryFilter,
        t,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
