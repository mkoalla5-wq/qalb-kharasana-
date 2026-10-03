import React from 'react';
import { Product, ProductCategory } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from './ProductCard';
import { ConcreteVaseDecor } from './ConcreteVaseDecor';
import { Sparkles, Package, RefreshCw, PlusCircle } from 'lucide-react';

const CATEGORIES: { id: ProductCategory | 'all'; label: string; labelAr: string }[] = [
  { id: 'all', label: 'All Collections', labelAr: 'جميع القطع' },
  { id: 'mabkhara', label: 'Modern Mabkhara', labelAr: 'مباخر معمارية' },
  { id: 'trays', label: 'Fluted Trays', labelAr: 'صواني مضلعة' },
  { id: 'planters', label: 'Terrazzo Planters', labelAr: 'أصص تيرازو' },
  { id: 'lighting', label: 'Brutalist Lighting', labelAr: 'إضاءة بروتاليزم' },
  { id: 'sculptures', label: 'Sculptures & Arches', labelAr: 'منحوتات وأقواس' },
  { id: 'tableware', label: 'Tableware & Coasters', labelAr: 'قواعد وأواني مائدة' },
];

export const CatalogView: React.FC<{
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewStore: (storeId: string) => void;
  onCustomCommission: () => void;
  onOpenVendorSignup: () => void;
  onRefresh: () => void;
}> = ({ products, onSelectProduct, onViewStore, onCustomCommission, onOpenVendorSignup, onRefresh }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    language,
    t,
  } = useMarketplace();
  const isRTL = language === 'ar';

  const filteredProducts = products.filter(p => {
    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q) || (p.titleAr && p.titleAr.includes(q));
      const matchDesc = p.description.toLowerCase().includes(q) || (p.descriptionAr && p.descriptionAr.includes(q));
      const matchStore = p.storeName?.toLowerCase().includes(q) || p.storeId.toLowerCase().includes(q);
      const matchFinish = p.finish.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchStore || matchFinish;
    }
    return true;
  });

  return (
    <div id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-sans">
      {/* Category Pills Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-2xs ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-300'
              }`}
            >
              {isRTL ? cat.labelAr : cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
          title="Refresh products"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {/* Result Counter & Info */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-6">
        <div>
          <span className="font-extrabold text-stone-900">{filteredProducts.length}</span>{' '}
          {isRTL ? 'قطع خرسانية معروضة' : 'hand-cast concrete pieces in global market'}
          {searchQuery && (
            <span className="ml-2 rtl:mr-2 text-blue-700 font-bold">
              {isRTL ? `للطلب: "${searchQuery}"` : `matching "${searchQuery}"`}
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-500 font-medium">
          <span>{isRTL ? 'الدفع عند الاستلام متاح لجميع القطع' : 'All pieces eligible for Cash on Delivery (COD)'}</span>
        </div>
      </div>

      {/* Clean State Empty Display when no products exist */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-8 sm:p-14 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 bottom-4 pointer-events-none opacity-20 hidden sm:block">
            <ConcreteVaseDecor variant="fluted" className="w-40 h-52" />
          </div>

          <div className="w-16 h-16 bg-stone-200/80 border border-stone-300 text-stone-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <Package className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {isRTL ? 'لا توجد قطع معروضة حالياً' : 'No Pieces in this Collection Yet'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {isRTL
                ? 'مشاغل الخرسانة المعمارية تقوم حالياً بتجهيز وإطلاق أولى مجموعاتها المضلعة والتيراتزو.'
                : 'Artisan ateliers are currently casting and finishing new brutalist collections.'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button
              onClick={onCustomCommission}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRTL ? 'طلب قطعة مخصصة حسب القياس' : 'Request Custom Commission'}</span>
            </button>

            <button
              onClick={onOpenVendorSignup}
              className="px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>{isRTL ? 'انضم كمشغل وأضف أول قطعة' : 'List First Piece as Artisan'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onViewStore={onViewStore}
            />
          ))}
        </div>
      )}
    </div>
  );
};
