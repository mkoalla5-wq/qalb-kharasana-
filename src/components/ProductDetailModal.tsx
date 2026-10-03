import React from 'react';
import { Product } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, ShoppingBag, Truck, ShieldCheck, Ruler, Scale, Store, Sparkles, Check } from 'lucide-react';

export const ProductDetailModal: React.FC<{
  product: Product | null;
  onClose: () => void;
  onViewStore: (storeId: string) => void;
  onInstantCheckout: (product: Product) => void;
}> = ({ product, onClose, onViewStore, onInstantCheckout }) => {
  const { formatPrice, addToCart, language, t } = useMarketplace();
  if (!product) return null;

  const isRTL = language === 'ar';
  const priceInfo = formatPrice(product.basePriceSAR);

  const displayTitle = isRTL && product.titleAr ? product.titleAr : product.title;
  const displayDesc = isRTL && product.descriptionAr ? product.descriptionAr : product.description;
  const displayFinish = isRTL && product.finishAr ? product.finishAr : product.finish;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="relative bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-stone-900 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 p-2 bg-white/90 hover:bg-stone-200 text-stone-700 hover:text-stone-950 rounded-full transition cursor-pointer border border-stone-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-stone-200">
            <img
              src={product.imageUrl}
              alt={displayTitle}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 bg-white/95 border border-stone-300 rounded-xl px-3 py-1.5 shadow-xs text-xs font-bold text-stone-900">
              {isRTL ? 'خرسانة معمارية أصلية' : 'Authentic Architectural Concrete'}
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Store Link */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-wider text-blue-700 font-extrabold">{product.category}</span>
                <button
                  onClick={() => {
                    onClose();
                    onViewStore(product.storeId);
                  }}
                  className="flex items-center gap-1 text-stone-700 hover:text-stone-950 transition cursor-pointer font-bold"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{product.storeName || product.storeId}</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {displayTitle}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  {priceInfo.formatted}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  ({product.basePriceSAR} SAR base)
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {displayDesc}
              </p>

              {/* Specifications Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs bg-stone-100 rounded-2xl p-4 border border-stone-200">
                <div className="flex items-center gap-2 text-stone-700">
                  <Ruler className="w-4 h-4 text-stone-800 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-500">{t('dimensions')}</div>
                    <div className="font-bold text-stone-900">{product.dimensions}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-stone-700">
                  <Scale className="w-4 h-4 text-stone-800 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-500">{t('weight')}</div>
                    <div className="font-bold text-stone-900">{product.weightKg} kg</div>
                  </div>
                </div>

                <div className="col-span-2 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
                  <span>Finish:</span>
                  <span className="font-bold text-stone-900">{displayFinish}</span>
                </div>
              </div>

              {/* COD Badge */}
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Eligible for Cash on Delivery (COD) in KSA, UAE, Egypt</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => {
                  onClose();
                  onInstantCheckout(product);
                }}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>Order with Cash on Delivery</span>
              </button>

              <button
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
                className="w-full py-2.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('addToCart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
