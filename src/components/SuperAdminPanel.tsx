import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { Store, Product, Order, CustomRequest, UserProfile, MarketplaceSettings, AdminCode } from '../types';
import {
  getAllStores,
  updateStoreStatus,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  getAllCustomRequests,
  updateCustomRequestStatus,
  getAllUsers,
  setUserBanStatus,
  deleteStore,
} from '../services/storeService';
import {
  Shield,
  Store as StoreIcon,
  Package,
  Truck,
  Sparkles,
  Settings,
  Trash2,
  Lock,
  RefreshCw,
  Key,
  CheckCircle,
  Save,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

export const SuperAdminPanel: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { currentUser, isSuperAdmin, signInWithGoogle } = useAuth();
  const { language, settings, updateSettings } = useMarketplace();
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState<'branding' | 'codes' | 'stores' | 'products' | 'orders' | 'requests'>('branding');

  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Dynamic Customization Form State
  const [appName, setAppName] = useState(settings.appName || 'Qalb Al-Kharasana');
  const [appNameAr, setAppNameAr] = useState(settings.appNameAr || 'قلب الخرسانة');
  const [appTagline, setAppTagline] = useState(settings.appTagline || '');
  const [appTaglineAr, setAppTaglineAr] = useState(settings.appTaglineAr || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(settings.bannerUrl || '');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || '');
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle || '');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName || '');
      setAppNameAr(settings.appNameAr || '');
      setAppTagline(settings.appTagline || '');
      setAppTaglineAr(settings.appTaglineAr || '');
      setLogoUrl(settings.logoUrl || '');
      setBannerUrl(settings.bannerUrl || '');
      setHeroTitle(settings.heroTitle || '');
      setHeroSubtitle(settings.heroSubtitle || '');
    }
  }, [settings]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [s, p, o, r, u] = await Promise.all([
        getAllStores(),
        getAllProducts(),
        getAllOrders(),
        getAllCustomRequests(),
        getAllUsers(),
      ]);
      setStores(s);
      setProducts(p);
      setOrders(o);
      setCustomRequests(r);
      setUsers(u);
    } catch (e) {
      console.warn('Superadmin fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAllAdminData();
    }
  }, [isSuperAdmin]);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettings({
        appName: appName.trim(),
        appNameAr: appNameAr.trim(),
        appTagline: appTagline.trim(),
        appTaglineAr: appTaglineAr.trim(),
        logoUrl: logoUrl.trim(),
        bannerUrl: bannerUrl.trim(),
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle.trim(),
      });
      setSettingsSavedMessage(true);
      setTimeout(() => setSettingsSavedMessage(false), 3000);
    } catch (err) {
      alert('Failed to save marketplace branding');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleStoreStatus = async (store: Store) => {
    const newStatus = store.status === 'active' ? 'suspended' : 'active';
    try {
      await updateStoreStatus(store.id, newStatus);
      setStores(prev => prev.map(s => (s.id === store.id ? { ...s, status: newStatus } : s)));
    } catch {
      alert('Failed to update store status');
    }
  };

  const handleDeleteStorePermanent = async (storeId: string) => {
    if (!confirm(`Are you sure you want to permanently delete store ${storeId}? This will remove it from the marketplace.`)) return;
    try {
      await deleteStore(storeId);
      setStores(prev => prev.filter(s => s.id !== storeId));
    } catch {
      alert('Failed to delete store');
    }
  };

  const handleDeleteProductGlobal = async (productId: string) => {
    if (!confirm('SUPER ADMIN: Permanently remove this product from the marketplace?')) return;
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch {
      alert('Failed to delete product');
    }
  };

  const handleRevokeAdminCode = async (codeStr: string) => {
    if (!confirm(`Revoke / release admin code ${codeStr}?`)) return;
    const currentCodes = settings.adminCodes || [];
    const updated = currentCodes.map(c =>
      c.code === codeStr
        ? { ...c, isClaimed: false, claimedByStoreId: undefined, claimedByStoreName: undefined }
        : c
    );
    await updateSettings({ adminCodes: updated });
  };

  const adminCodes = settings.adminCodes || [];
  const claimedCount = adminCodes.filter(c => c.isClaimed).length;

  // Strict Super Admin Access Gate
  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-red-900/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-red-950/80 border border-red-800 text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Super Admin Access Restricted</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Total marketplace control is strictly restricted to the authorized administrator email:
            </p>
            <div className="inline-block bg-stone-950 border border-red-800 px-3 py-1 rounded-xl font-mono text-xs text-red-400 font-bold">
              mkoalla5@gmail.com
            </div>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-xs space-y-2 text-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-400">Current User:</span>
              <span className="font-semibold text-white truncate max-w-[200px]">
                {currentUser?.email || 'Not Signed In'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Current Role:</span>
              <span className="font-bold text-amber-400 uppercase">
                {currentUser?.role || 'Guest Customer'}
              </span>
            </div>
            <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800/80">
              Regular customers and vendors cannot access the Super Admin control center.
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Sign In with Google (mkoalla5@gmail.com)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-stone-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto p-2 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl my-2 sm:my-4 text-stone-100">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-950 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white">Super Admin Total Control</h1>
                <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  30 STORES SYSTEM
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Oversee vendors, customize marketplace branding, manage 30 admin codes, moderate products.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllAdminData}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-3 sm:px-6 gap-2 sm:gap-6 text-xs sm:text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-3 sm:py-4 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'branding' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Marketplace Customization</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`py-3 sm:py-4 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'codes' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-400'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>30 Admin Codes ({claimedCount}/30)</span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`py-3 sm:py-4 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'stores' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-400'
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span>Stores ({stores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 sm:py-4 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'products' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-400'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 sm:py-4 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-400'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>COD Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 sm:py-4 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'requests' ? 'border-amber-500 text-amber-400' : 'border-transparent text-stone-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Commissions ({customRequests.length})</span>
          </button>
        </div>

        {/* Tab 1: Marketplace Branding & Dynamic Customization */}
        {activeTab === 'branding' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 text-xs text-stone-300">
              <span className="font-bold text-amber-400">Dynamic Customization:</span> Change the global marketplace name, logos, and banner image. Changes are written directly to Firestore and update all users immediately!
            </div>

            {settingsSavedMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Marketplace branding settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveBranding} className="space-y-4 text-xs max-w-3xl">
              {/* App Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Global App Name (English)</label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={e => setAppName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Global App Name (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={appNameAr}
                    onChange={e => setAppNameAr(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              {/* Taglines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Tagline (English)</label>
                  <input
                    type="text"
                    value={appTagline}
                    onChange={e => setAppTagline(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Tagline (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={appTaglineAr}
                    onChange={e => setAppTaglineAr(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Logo & Banner URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Marketplace Logo URL</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white"
                  />
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo preview" className="w-10 h-10 rounded-xl object-cover mt-2 border border-stone-800" />
                  )}
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Hero Banner Image URL</label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={e => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white"
                  />
                  {bannerUrl && (
                    <img src={bannerUrl} alt="Banner preview" className="w-full h-16 rounded-xl object-cover mt-2 border border-stone-800" />
                  )}
                </div>
              </div>

              {/* Hero Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Hero Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={e => setHeroTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Hero Subtitle</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={e => setHeroSubtitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving to Firestore...' : 'Save & Publish Dynamic Branding'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: 30 Admin Codes Management */}
        {activeTab === 'codes' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="text-base font-bold text-white">30 Unique Admin Code Slots</h3>
                <p className="text-stone-400">
                  Each vendor account uses one verified code to launch their isolated store.
                </p>
              </div>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                {claimedCount} Claimed • {30 - claimedCount} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {adminCodes.map((codeItem, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
                    codeItem.isClaimed
                      ? 'bg-stone-950 border-emerald-800/60'
                      : 'bg-stone-950/60 border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{codeItem.code}</span>
                      <span className="text-[10px] text-stone-500 font-mono">Slot #{codeItem.slotNumber}</span>
                    </div>

                    <div className="mt-1 text-[11px]">
                      {codeItem.isClaimed ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          Claimed by: {codeItem.claimedByStoreName || codeItem.claimedByStoreId}
                        </span>
                      ) : (
                        <span className="text-stone-400">Available for new vendor</span>
                      )}
                    </div>
                  </div>

                  {codeItem.isClaimed && (
                    <button
                      onClick={() => handleRevokeAdminCode(codeItem.code)}
                      className="text-stone-500 hover:text-red-400 p-1"
                      title="Revoke and make available again"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Stores */}
        {activeTab === 'stores' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="text-xs text-stone-400">
              Oversee all registered vendor stores. You can suspend or permanently delete fraudulent stores.
            </div>

            {stores.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs bg-stone-950/50 rounded-2xl border border-stone-800">
                No stores registered yet. Database is in a completely clean state!
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map(s => (
                  <div
                    key={s.id}
                    className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{s.name}</span>
                        <span className="font-mono text-amber-400">/store/{s.slug}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-stone-400 mt-1">
                        {s.city}, {s.country} • Vendor: {s.vendorEmail}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStoreStatus(s)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold"
                      >
                        {s.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteStorePermanent(s.id)}
                        className="p-1.5 bg-red-950 text-red-400 hover:bg-red-900 rounded-xl border border-red-800"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Products */}
        {activeTab === 'products' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="text-xs text-stone-400">
              Super Admin master product moderation across all vendor stores.
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs bg-stone-950/50 rounded-2xl border border-stone-800">
                No products in the marketplace yet. Clean catalog!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-900 border border-stone-800"
                      />
                      <div>
                        <div className="font-bold text-white line-clamp-1">{p.title}</div>
                        <div className="text-amber-400 font-mono text-[11px]">{p.basePriceSAR} SAR</div>
                        <div className="text-[10px] text-stone-500">Store: {p.storeName || p.storeId}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProductGlobal(p.id)}
                      className="p-2 text-stone-500 hover:text-red-400 rounded-lg"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: COD Orders */}
        {activeTab === 'orders' && (
          <div className="p-4 sm:p-6 space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs bg-stone-950/50 rounded-2xl border border-stone-800">
                No orders placed yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(o => (
                  <div key={o.id} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-400 font-mono">{o.id}</span>
                      <span className="text-white">{o.totalAmount} {o.currency}</span>
                    </div>
                    <div className="text-stone-300">
                      Customer: {o.customerName} ({o.customerPhone})
                    </div>
                    <div className="text-stone-400">
                      Address: {o.address}, {o.city}, {o.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Custom Requests */}
        {activeTab === 'requests' && (
          <div className="p-4 sm:p-6 space-y-4">
            {customRequests.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs bg-stone-950/50 rounded-2xl border border-stone-800">
                No bespoke commission requests yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customRequests.map(r => (
                  <div key={r.id} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-amber-400 font-mono">{r.id}</span>
                      <span className="text-emerald-400">{r.budget} {r.currency}</span>
                    </div>
                    <div className="text-stone-200">
                      Client: {r.customerName} ({r.city}) • Color: {r.concreteColor}
                    </div>
                    {r.engravingText && (
                      <div className="text-amber-300 italic">Engraving: "{r.engravingText}"</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
