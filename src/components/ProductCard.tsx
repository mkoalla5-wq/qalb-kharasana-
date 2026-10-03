import React from 'react';
import { Product } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { ShoppingBag, Eye, Store, ShieldCheck } from 'lucide-react';

export const ProductCard: React.FC<{
  product: Product;
  onSelect: (product: Product) => void;
  onViewStore?: (storeId: string) => void;
}> = ({ product, onSelect, onViewStore }) => {
  const { formatPrice, addToCart, language, t } = useMarketplace();
  const isRTL = language === 'ar';
  const priceInfo = formatPrice(product.basePriceSAR);

  const displayTitle = isRTL && product.titleAr ? product.titleAr : product.title;
  const displayFinish = isRTL && product.finishAr ? product.finishAr : product.finish;

  return (
    <div className="group bg-[#FAF8F5] rounded-3xl border-2 border-stone-300 hover:border-stone-800 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 font-sans">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-stone-200">
        <img
          src={product.imageUrl}
          alt={displayTitle}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Store Badge (if onViewStore provided) */}
        {onViewStore && (
          <button
            onClick={e => {
              e.stopPropagation();
              onViewStore(product.storeId);
            }}
            className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/95 hover:bg-stone-900 hover:text-white text-stone-900 text-[11px] font-bold px-3 py-1 rounded-full border border-stone-300 backdrop-blur-md flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Store className="w-3 h-3 text-stone-700 group-hover:text-white" />
            <span>{product.storeName || product.storeId}</span>
          </button>
        )}

        {/* Quick View Button Overlay */}
        <button
          onClick={() => onSelect(product)}
          className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 bg-stone-900 hover:bg-stone-800 text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Stock status tag */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
            {isRTL ? `متبقي ${product.stock} فقط` : `Only ${product.stock} left`}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold mb-1">
            <span className="uppercase tracking-wider text-blue-700">{product.category}</span>
            <span>{product.dimensions}</span>
          </div>

          <h3
            onClick={() => onSelect(product)}
            className="font-extrabold text-sm sm:text-base text-stone-900 hover:text-stone-700 transition cursor-pointer line-clamp-1"
          >
            {displayTitle}
          </h3>

          <p className="text-xs text-stone-500 mt-1 line-clamp-1">
            {displayFinish}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {priceInfo.formatted}
            </div>
            <div className="text-[10px] text-stone-500 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{isRTL ? 'دفع عند الاستلام' : 'Cash on Delivery'}</span>
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
