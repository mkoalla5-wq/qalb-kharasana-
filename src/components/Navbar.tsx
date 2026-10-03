import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CurrencyCode } from '../types';
import {
  ShoppingBag,
  Store as StoreIcon,
  Shield,
  Search,
  Sparkles,
  Globe,
  Coins,
  Menu,
  X,
  PlusCircle,
  LogOut,
  User,
  Award,
} from 'lucide-react';

export const Navbar: React.FC<{
  onOpenCart: () => void;
  onOpenVendorSignup: () => void;
  onOpenSuperAdmin: () => void;
  onOpenCustomRequest: () => void;
  onOpenPublishModal: () => void;
  onNavigateHome: () => void;
  onNavigateStores: () => void;
  onNavigateVendorDashboard: () => void;
  currentView: string;
}> = ({
  onOpenCart,
  onOpenVendorSignup,
  onOpenSuperAdmin,
  onOpenCustomRequest,
  onOpenPublishModal,
  onNavigateHome,
  onNavigateStores,
  onNavigateVendorDashboard,
  currentView,
}) => {
  const {
    currency,
    setCurrency,
    language,
    setLanguage,
    cartCount,
    searchQuery,
    setSearchQuery,
    settings,
    t,
  } = useMarketplace();
  const { currentUser, userStore, isSuperAdmin, isVendorOrAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRTL = language === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b-2 border-stone-300 text-stone-900 transition-colors font-sans shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Dynamic Brand */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-md border-2 border-stone-300 bg-[#EDE6DE] flex items-center justify-center group-hover:scale-105 transition">
              <img
                src={settings.logoUrl || '/logo.svg'}
                alt="QALB AL Kharasana by pryzm empire"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="max-w-[150px] sm:max-w-xs truncate">
              <div className="text-[10px] sm:text-[11px] font-bold text-blue-700 tracking-tight leading-none mb-0.5">
                By pryzm empire
              </div>
              <span className="font-black text-sm sm:text-lg tracking-tight text-stone-900 flex items-center gap-1 font-['Plus_Jakarta_Sans',sans-serif] truncate">
                {t('brandName')}
              </span>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide truncate hidden sm:block">
                {t('brandTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className={`absolute top-2.5 w-4 h-4 text-stone-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'ابحث عن مباخر، صواني، تيرازو، أصص خرسانية...' : 'Search mabkhara, fluted trays, terrazzo...'}
                className={`w-full bg-white border border-stone-300 rounded-full py-2 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 transition ${
                  isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-2.5 text-stone-400 hover:text-stone-700 text-xs ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Global Catalog */}
            <button
              onClick={onNavigateHome}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition hidden lg:flex items-center gap-1 cursor-pointer ${
                currentView === 'home'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <span>{t('exploreProducts')}</span>
            </button>

            {/* 30 Artisan Ateliers */}
            <button
              onClick={onNavigateStores}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition hidden lg:flex items-center gap-1.5 cursor-pointer ${
                currentView === 'stores' || currentView === 'store'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <StoreIcon className="w-3.5 h-3.5 text-blue-700" />
              <span>{t('artisanStores')}</span>
            </button>

            {/* Bespoke Custom Commission */}
            <button
              onClick={onOpenCustomRequest}
              className="px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition hidden xl:flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('bespokeRequest')}</span>
            </button>

            {/* Artisan Dashboard Trigger (if vendor or has store) */}
            {isVendorOrAdmin && (
              <button
                onClick={onNavigateVendorDashboard}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'vendor_dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100'
                }`}
              >
                <StoreIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Atelier Dashboard</span>
                {userStore?.artisanPoints !== undefined && (
                  <span className="text-[10px] bg-blue-200 text-blue-950 font-mono px-1.5 py-0.2 rounded-full font-bold">
                    {userStore.artisanPoints}p
                  </span>
                )}
              </button>
            )}

            {/* Super Admin Control Center Trigger */}
            {isSuperAdmin && (
              <button
                onClick={onOpenSuperAdmin}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-900 hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Super Admin</span>
              </button>
            )}

            {/* Put Item for Sale Button */}
            <button
              onClick={onOpenPublishModal}
              className="px-3 py-1.5 sm:py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102"
              title="Put concrete item for sale"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRTL ? 'عرض قطعة للبيع' : 'Put for Sale'}</span>
            </button>

            {/* Currency Selector (SAR / AED / EGP) */}
            <div className="relative group">
              <button className="px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs">
                <Coins className="w-3 h-3 text-stone-600" />
                <span>{currency}</span>
              </button>
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1 w-28 bg-[#FAF8F5] border-2 border-stone-300 rounded-xl shadow-xl p-1 hidden group-hover:block z-50 animate-in fade-in duration-100">
                {(['SAR', 'AED', 'EGP'] as CurrencyCode[]).map(cur => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`w-full text-left rtl:text-right px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                      currency === cur
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-700 hover:bg-stone-200/70'
                    }`}
                  >
                    <span>{cur}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      {cur === 'SAR' ? 'ريال' : cur === 'AED' ? 'درهم' : 'جنيه'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-2 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              title="Toggle Language (العربية / English)"
            >
              <Globe className="w-3 h-3 text-stone-600" />
              <span>{language === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition flex items-center justify-center cursor-pointer shadow-sm"
              title={t('cart')}
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Sign Out Button */}
            {currentUser && (
              <button
                onClick={logout}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-200/60 transition cursor-pointer"
                title={`Sign out (${currentUser.email})`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 lg:hidden rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className={`absolute top-2.5 w-4 h-4 text-stone-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن مباخر، صواني، تيرازو...' : 'Search mabkhara, trays, terrazzo...'}
              className={`w-full bg-white border border-stone-300 rounded-full py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Mobile Menu Slide */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 py-3 space-y-2 animate-in fade-in">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100 flex items-center justify-between"
            >
              <span>{t('exploreProducts')}</span>
            </button>
            <button
              onClick={() => {
                onNavigateStores();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100 flex items-center justify-between"
            >
              <span>{t('artisanStores')}</span>
            </button>
            <button
              onClick={() => {
                onOpenCustomRequest();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100 flex items-center justify-between"
            >
              <span>{t('bespokeRequest')}</span>
            </button>

            {isVendorOrAdmin && (
              <button
                onClick={() => {
                  onNavigateVendorDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
              >
                <span>Atelier Dashboard</span>
              </button>
            )}

            {isSuperAdmin && (
              <button
                onClick={() => {
                  onOpenSuperAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold text-red-900 bg-red-50 hover:bg-red-100 flex items-center justify-between"
              >
                <span>Super Admin</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
