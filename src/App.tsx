import React, { useState, useEffect } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthGate } from './components/AuthGate';
import { Navbar } from './components/Navbar';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Hero } from './components/Hero';
import { CatalogView } from './components/CatalogView';
import { StoreDirectory } from './components/StoreDirectory';
import { StorePageView } from './components/StorePageView';
import { VendorDashboard } from './components/VendorDashboard';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomConcreteRequestModal } from './components/CustomConcreteRequestModal';
import { VendorRegistrationModal } from './components/VendorRegistrationModal';
import { PublishProductModal } from './components/PublishProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { AIChatHelper } from './components/AIChatHelper';
import { Product, Store } from './types';
import {
  getAllProducts,
  getAllStores,
  getStoreBySlug,
  ensureMarketplaceSettings,
} from './services/storeService';

function MainApp() {
  const { isCartOpen, setIsCartOpen } = useMarketplace();
  const { currentUser, firebaseUser, loading: authLoading, refreshUserStore } = useAuth();

  // Navigation View: 'home' | 'stores' | 'store' | 'vendor_dashboard'
  const [currentView, setCurrentView] = useState<'home' | 'stores' | 'store' | 'vendor_dashboard'>('home');
  const [activeStore, setActiveStore] = useState<Store | null>(null);

  // Data: Clean state from Firestore
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [singleProductOrder, setSingleProductOrder] = useState<{ product: Product; quantity: number } | null>(null);
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
  const [customRequestTargetStoreId, setCustomRequestTargetStoreId] = useState<string | undefined>(undefined);
  const [isVendorSignupOpen, setIsVendorSignupOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Load real data from Firestore
  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      await ensureMarketplaceSettings();
      const [prods, strList] = await Promise.all([getAllProducts(), getAllStores()]);
      setProducts(prods);
      setStores(strList);
    } catch (e) {
      console.warn('Error loading marketplace data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser || firebaseUser) {
      loadMarketplaceData();
    }
  }, [currentUser, firebaseUser]);

  // URL-based Store Routing: /stores/[slug] vs Global Market /
  useEffect(() => {
    const handleUrlRoute = async () => {
      const path = window.location.pathname;
      if (path.startsWith('/stores/')) {
        const slug = path.replace('/stores/', '').replace(/\/$/, '');
        if (slug) {
          const s = await getStoreBySlug(slug);
          if (s) {
            setActiveStore(s);
            setCurrentView('store');
            return;
          }
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  const handleOpenStorePage = async (storeIdOrSlug: string) => {
    let s: Store | null = stores.find(str => str.id === storeIdOrSlug || str.slug === storeIdOrSlug) || null;
    if (!s) {
      s = await getStoreBySlug(storeIdOrSlug);
    }
    if (s) {
      setActiveStore(s);
      setCurrentView('store');
      try {
        window.history.pushState(null, '', `/stores/${s.slug}`);
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToGlobalMarket = () => {
    setCurrentView('home');
    setActiveStore(null);
    try {
      window.history.pushState(null, '', '/');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstantCheckout = (prod: Product) => {
    setSingleProductOrder({ product: prod, quantity: 1 });
    setIsCheckoutOpen(true);
  };

  const handleProductPublished = (newProd: Product) => {
    // Immediately display new product in global feed
    setProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
    loadMarketplaceData();
  };

  // 1. STRICT LOGIN WALL ENFORCEMENT
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center font-sans text-stone-900">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-lg animate-pulse mb-3">
          <span className="font-mono font-bold text-sm">P</span>
        </div>
        <p className="text-xs font-bold text-stone-600">Initializing Concrete Art Engine...</p>
      </div>
    );
  }

  if (!currentUser && !firebaseUser) {
    return <AuthGate onAuthSuccess={loadMarketplaceData} />;
  }

  // 2. DEDICATED STOREFRONT MICROSITE ROUTE (/stores/[storeName])
  if (currentView === 'store' && activeStore) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
        {/* Status bar */}
        <RoleSwitcherBar
          onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
          onOpenSuperAdminModal={() => setIsSuperAdminOpen(true)}
        />

        <main className="flex-1">
          <StorePageView
            store={activeStore}
            onBackToGlobalMarket={handleBackToGlobalMarket}
            onSelectProduct={prod => setSelectedProduct(prod)}
            onOpenCustomRequestWithStore={storeId => {
              setCustomRequestTargetStoreId(storeId);
              setIsCustomRequestOpen(true);
            }}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
          />
        </main>

        {/* Global Cart Drawer */}
        <CartDrawer
          onOpenCheckout={() => {
            setSingleProductOrder(null);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onViewStore={handleOpenStorePage}
          onInstantCheckout={handleInstantCheckout}
        />

        {/* Targeted COD Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSingleProductOrder(null);
          }}
          singleProductOrder={singleProductOrder}
        />

        {/* Bespoke Custom Commission Modal */}
        <CustomConcreteRequestModal
          isOpen={isCustomRequestOpen}
          onClose={() => setIsCustomRequestOpen(false)}
          presetStoreId={customRequestTargetStoreId}
        />

        {/* Put Item for Sale Modal */}
        <PublishProductModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          onProductPublished={handleProductPublished}
        />

        {/* AI Support Chat Concierge */}
        <AIChatHelper />
      </div>
    );
  }

  // 3. GLOBAL MARKETPLACE & DASHBOARD VIEWS
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white pb-16 sm:pb-0">
      {/* Top Authenticated Account Status Bar */}
      <RoleSwitcherBar
        onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
        onOpenSuperAdminModal={() => setIsSuperAdminOpen(true)}
      />

      {/* Global Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        onOpenCustomRequest={() => {
          setCustomRequestTargetStoreId(undefined);
          setIsCustomRequestOpen(true);
        }}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onNavigateHome={() => {
          setCurrentView('home');
          try {
            window.history.pushState(null, '', '/');
          } catch {}
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateStores={() => {
          setCurrentView('stores');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateVendorDashboard={() => {
          setCurrentView('vendor_dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentView={currentView}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              onExplore={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onCustomCommission={() => {
                setCustomRequestTargetStoreId(undefined);
                setIsCustomRequestOpen(true);
              }}
              onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
              storeCount={stores.length}
              productCount={products.length}
            />

            <CatalogView
              products={products}
              onSelectProduct={prod => setSelectedProduct(prod)}
              onViewStore={handleOpenStorePage}
              onCustomCommission={() => {
                setCustomRequestTargetStoreId(undefined);
                setIsCustomRequestOpen(true);
              }}
              onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
              onOpenPublishModal={() => setIsPublishModalOpen(true)}
              onRefresh={loadMarketplaceData}
            />
          </>
        )}

        {currentView === 'stores' && (
          <StoreDirectory
            stores={stores}
            onSelectStore={s => handleOpenStorePage(s.slug)}
            onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
          />
        )}

        {currentView === 'vendor_dashboard' && (
          <VendorDashboard
            onViewLiveStore={slug => handleOpenStorePage(slug)}
            onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
          />
        )}
      </main>

      {/* AI Chat Support Helper */}
      <AIChatHelper />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onNavigateHome={() => {
          setCurrentView('home');
          try {
            window.history.pushState(null, '', '/');
          } catch {}
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateStores={() => {
          setCurrentView('stores');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateVendorDashboard={() => {
          setCurrentView('vendor_dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCustomRequest={() => {
          setCustomRequestTargetStoreId(undefined);
          setIsCustomRequestOpen(true);
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
      />

      {/* Shopping Bag Drawer */}
      <CartDrawer
        onOpenCheckout={() => {
          setSingleProductOrder(null);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onViewStore={handleOpenStorePage}
        onInstantCheckout={handleInstantCheckout}
      />

      {/* Targeted COD Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setSingleProductOrder(null);
        }}
        singleProductOrder={singleProductOrder}
      />

      {/* Bespoke Custom Commission Modal */}
      <CustomConcreteRequestModal
        isOpen={isCustomRequestOpen}
        onClose={() => setIsCustomRequestOpen(false)}
        presetStoreId={customRequestTargetStoreId}
      />

      {/* Put Item for Sale Modal */}
      <PublishProductModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onProductPublished={handleProductPublished}
      />

      {/* Atelier Upgrade / Launch Modal */}
      <VendorRegistrationModal
        isOpen={isVendorSignupOpen}
        onClose={() => setIsVendorSignupOpen(false)}
        onSuccess={slug => {
          refreshUserStore();
          loadMarketplaceData();
          handleOpenStorePage(slug);
        }}
      />

      {/* Super Admin Control Center Modal (Strictly Restricted to mkoalla5@gmail.com) */}
      {isSuperAdminOpen && (
        <SuperAdminPanel
          onClose={() => {
            setIsSuperAdminOpen(false);
            loadMarketplaceData();
          }}
        />
      )}

      {/* Global Footer */}
      <Footer
        onOpenVendorSignup={() => setIsVendorSignupOpen(true)}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        onOpenCustomRequest={() => {
          setCustomRequestTargetStoreId(undefined);
          setIsCustomRequestOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <MainApp />
      </MarketplaceProvider>
    </AuthProvider>
  );
}
