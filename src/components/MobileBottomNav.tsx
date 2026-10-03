import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { Home, Store, Sparkles, ShoppingBag, ShieldCheck, Shield } from 'lucide-react';

export const MobileBottomNav: React.FC<{
  currentView: string;
  onNavigateHome: () => void;
  onNavigateStores: () => void;
  onNavigateVendorDashboard: () => void;
  onOpenCustomRequest: () => void;
  onOpenCart: () => void;
  onOpenVendorSignup: () => void;
  onOpenSuperAdmin: () => void;
}> = ({
  currentView,
  onNavigateHome,
  onNavigateStores,
  onNavigateVendorDashboard,
  onOpenCustomRequest,
  onOpenCart,
  onOpenVendorSignup,
  onOpenSuperAdmin,
}) => {
  const { cartCount, language } = useMarketplace();
  const { currentUser, isSuperAdmin, isVendorOrAdmin } = useAuth();
  const isRTL = language === 'ar';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-t-2 border-stone-300 px-2 py-1 shadow-2xl safe-area-pb font-sans">
      <div className="flex items-center justify-around">
        {/* Home / Catalog */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition cursor-pointer ${
            currentView === 'home' ? 'text-stone-900 font-extrabold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isRTL ? 'الكتالوج' : 'Catalog'}</span>
        </button>

        {/* Stores (Ateliers) */}
        <button
          onClick={onNavigateStores}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition cursor-pointer ${
            currentView === 'stores' || currentView === 'store'
              ? 'text-stone-900 font-extrabold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Store className="w-5 h-5 text-blue-700" />
          <span className="text-[10px] mt-0.5">{isRTL ? 'المشاغل' : 'Ateliers'}</span>
        </button>

        {/* Bespoke Request */}
        <button
          onClick={onOpenCustomRequest}
          className="flex flex-col items-center justify-center py-1 px-2 text-stone-600 hover:text-stone-900 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center -mt-2 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 text-stone-800 font-bold">{isRTL ? 'طلب خاص' : 'Bespoke'}</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1.5 px-2 text-stone-500 hover:text-stone-900 transition cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">{isRTL ? 'السلة' : 'Bag'}</span>
        </button>

        {/* Dynamic Admin/Vendor Portal */}
        {isVendorOrAdmin ? (
          <button
            onClick={onNavigateVendorDashboard}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition cursor-pointer ${
              currentView === 'vendor_dashboard' ? 'text-blue-700 font-black' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <span className="text-[10px] mt-0.5">{isRTL ? 'لوحتي' : 'Dashboard'}</span>
          </button>
        ) : isSuperAdmin ? (
          <button
            onClick={onOpenSuperAdmin}
            className="flex flex-col items-center justify-center py-1.5 px-2 text-red-600 hover:text-red-700 transition cursor-pointer"
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">Admin</span>
          </button>
        ) : (
          <button
            onClick={onOpenVendorSignup}
            className="flex flex-col items-center justify-center py-1.5 px-2 text-stone-600 hover:text-stone-900 transition cursor-pointer"
          >
            <Store className="w-5 h-5 text-stone-700" />
            <span className="text-[10px] mt-0.5 font-bold">{isRTL ? 'إطلاق متجر' : 'Atelier'}</span>
          </button>
        )}
      </div>
    </nav>
  );
};
