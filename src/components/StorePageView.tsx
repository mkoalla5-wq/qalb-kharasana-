import React, { useState, useEffect } from 'react';
import { Store, Product } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from './ProductCard';
import { getProductsByStore } from '../services/storeService';
import { StoreChatModal } from './StoreChatModal';
import { CallbackRequestModal } from './CallbackRequestModal';
import { ConcreteVaseDecor } from './ConcreteVaseDecor';
import {
  MapPin,
  Star,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  PhoneCall,
  Share2,
  ShieldCheck,
  Award,
  Check,
  ShoppingBag,
  PlusCircle,
} from 'lucide-react';

export const StorePageView: React.FC<{
  store: Store;
  onBackToGlobalMarket?: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCustomRequestWithStore: (storeId: string) => void;
  onOpenPublishModal?: () => void;
}> = ({ store, onBackToGlobalMarket, onSelectProduct, onOpenCustomRequestWithStore, onOpenPublishModal }) => {
  const { language, t, setIsCartOpen } = useMarketplace();
  const { currentUser } = useAuth();
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.id === store.vendorId || currentUser?.storeId === store.id;

  // Communication Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isRTL = language === 'ar';
  const displayStoreName = isRTL && store.nameAr ? store.nameAr : store.name;
  const displayDesc = isRTL && store.descriptionAr ? store.descriptionAr : store.description;

  const storePublicUrl = `${window.location.origin}/stores/${store.slug}`;

  const copyStoreLink = () => {
    navigator.clipboard.writeText(storePublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadStoreCatalog() {
      setLoading(true);
      try {
        const prods = await getProductsByStore(store.id);
        if (isMounted) setStoreProducts(prods);
      } catch (e) {
        console.warn('Error loading store products:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStoreCatalog();
    return () => {
      isMounted = false;
    };
  }, [store.id]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 pb-20 font-sans selection:bg-stone-900 selection:text-white relative overflow-hidden">
      {/* Background Subtle Concrete Vase Graphics */}
      <div className="absolute top-24 right-4 pointer-events-none opacity-20 hidden lg:block">
        <ConcreteVaseDecor variant="fluted" className="w-64 h-80" />
      </div>
      <div className="absolute bottom-20 left-4 pointer-events-none opacity-15 hidden lg:block">
        <ConcreteVaseDecor variant="stepped" className="w-56 h-72" />
      </div>

      {/* Independent Microsite Minimal Header */}
      <div className="bg-[#FAF8F5] border-b border-stone-300 py-3.5 px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToGlobalMarket && (
              <button
                onClick={onBackToGlobalMarket}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 transition cursor-pointer"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                <span>Global Market</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-stone-900 tracking-tight">
                {displayStoreName}
              </span>
              <span className="text-[10px] bg-stone-200 text-stone-700 font-mono font-bold px-2 py-0.5 rounded-full border border-stone-300">
                /stores/{store.slug}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Chat with Store</span>
            </button>

            <button
              onClick={() => setIsCallbackOpen(true)}
              className="px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Request Callback</span>
            </button>

            {isOwner && onOpenPublishModal && (
              <button
                onClick={onOpenPublishModal}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Put for Sale</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="View Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Store Banner & Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative rounded-3xl overflow-hidden border-2 border-stone-300 bg-[#FAF8F5] shadow-xl">
          {/* Banner Image */}
          <div className="h-52 sm:h-72 lg:h-96 w-full relative overflow-hidden bg-stone-200">
            <img
              src={store.bannerUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
              alt={displayStoreName}
              className="w-full h-full object-cover object-center filter contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
          </div>

          {/* Profile Card Overlay */}
          <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-end gap-4 sm:gap-6">
                <img
                  src={store.logoUrl || '/logo.svg'}
                  alt={displayStoreName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#FAF8F5] bg-[#EDE6DE] shadow-2xl flex-shrink-0"
                />
                <div className="space-y-1 text-white sm:text-stone-900">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                      {displayStoreName}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-600 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-stone-700" />
                      {store.city}, {store.country}
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {store.rating || '5.0'} Rating
                    </span>
                    {/* Artisan Points Badge */}
                    <span className="flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full text-[11px] shadow-xs">
                      <Award className="w-3.5 h-3.5 text-amber-700" />
                      <span>{store.artisanPoints ?? 100} Artisan Points</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Atelier
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {isOwner && onOpenPublishModal && (
                  <button
                    onClick={onOpenPublishModal}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>+ Put Item for Sale</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenCustomRequestWithStore(store.id)}
                  className="px-4 py-2.5 bg-white border-2 border-stone-300 hover:border-stone-400 text-stone-900 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Bespoke Commission</span>
                </button>

                <button
                  onClick={copyStoreLink}
                  title="Copy direct shareable store URL"
                  className="px-3.5 py-2.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-stone-600" />
                      <span>Share Store</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Atelier Craft Description */}
            <div className="mt-6 pt-6 border-t border-stone-200">
              <h2 className="text-xs font-extrabold text-stone-500 uppercase tracking-widest mb-1.5">
                About the Atelier
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-4xl font-normal">
                {displayDesc ||
                  'Dedicated to the craft of raw brutalist concrete homeware, hand-mixed terrazzo aggregates, and architectural sculptural incense burners. Each piece is cast, cured, diamond-honed, and sealed by hand.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Section for this Specific Store */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-300">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Atelier Collections
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {storeProducts.length} authentic handcrafted concrete piece(s) from {displayStoreName}
            </p>
          </div>

          <div className="text-xs text-stone-500 font-mono">
            {storeProducts.length} Pieces Available
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className="bg-[#FAF8F5] border border-stone-300 rounded-3xl h-96 animate-pulse"
              ></div>
            ))}
          </div>
        ) : storeProducts.length === 0 ? (
          <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-12 text-center text-stone-500 max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-200 text-stone-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">New Collection in Production</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {displayStoreName} is currently curing and diamond-finishing a new batch of cast concrete homeware.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              {isOwner && onOpenPublishModal && (
                <button
                  onClick={onOpenPublishModal}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-black hover:bg-stone-800 transition shadow-sm cursor-pointer"
                >
                  + Put Item for Sale
                </button>
              )}
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-4 py-2.5 bg-white border border-stone-300 text-stone-900 rounded-xl text-xs font-bold hover:bg-stone-100 transition shadow-2xs cursor-pointer"
              >
                Inquire Directly
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {storeProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Independent Store Microsite Footer (No links to other stores) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-stone-300 text-center text-xs text-stone-500 space-y-2">
        <p className="font-semibold text-stone-700">
          {displayStoreName} • Independent Concrete Atelier
        </p>
        <p className="text-[11px] text-stone-400">
          Handcrafted in {store.city}, {store.country}. Powered by Pryzm Concrete Architecture Engine.
        </p>
      </div>

      {/* Chat With Store Modal */}
      <StoreChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        store={store}
      />

      {/* Request Callback Modal */}
      <CallbackRequestModal
        isOpen={isCallbackOpen}
        onClose={() => setIsCallbackOpen(false)}
        store={store}
      />
    </div>
  );
};
