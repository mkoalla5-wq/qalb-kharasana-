import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC<{
  onOpenCheckout: () => void;
}> = ({ onOpenCheckout }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartTotalConverted,
    formatPrice,
    language,
    t,
  } = useMarketplace();

  if (!isCartOpen) return null;
  const isRTL = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity font-sans">
      <div className={`fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} max-w-full flex pl-10 rtl:pl-0 rtl:pr-10`}>
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l-2 rtl:border-l-0 rtl:border-r-2 border-stone-300 text-stone-900 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-300 flex items-center justify-between bg-[#EDE8E1]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-base font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {t('yourCart')}
              </h2>
              <span className="bg-stone-900 text-white text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F7F5F0]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-stone-500">
                <div className="w-16 h-16 rounded-3xl bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-stone-900 font-extrabold text-base mb-1">{t('emptyCart')}</h3>
                  <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                    {isRTL
                      ? 'تصفح تشكيلة المباخر والصواني المعمارية من مشاغل الرياض ودبي والقاهرة.'
                      : 'Explore curated brutalist concrete homeware handcrafted by Arab artisans.'}
                  </p>
                </div>
              </div>
            ) : (
              cart.map(({ product, quantity }) => {
                const itemTotal = formatPrice(product.basePriceSAR * quantity);
                const displayTitle = isRTL && product.titleAr ? product.titleAr : product.title;

                return (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3.5 bg-white border border-stone-300 rounded-2xl shadow-2xs"
                  >
                    <img
                      src={product.imageUrl}
                      alt={displayTitle}
                      className="w-18 h-18 rounded-xl object-cover bg-stone-100 border border-stone-200 flex-shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                            {displayTitle}
                          </h4>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-stone-400 hover:text-red-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-blue-700 font-bold">
                          {product.storeName || product.storeId}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-300 rounded-lg p-0.5 text-xs">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-stone-900 font-mono text-xs">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-black text-xs sm:text-sm text-stone-900">
                          {itemTotal.formatted}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#FAF8F5] border-t-2 border-stone-300 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Shipping & Handling</span>
                  <span className="text-emerald-700 font-bold">Free (Special Delivery)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Payment Method</span>
                  <span className="font-bold text-stone-900">Cash on Delivery (COD)</span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Due</span>
                  <span className="font-mono text-lg">{cartTotalConverted.formatted}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>{isRTL ? 'متابعة الدفع عند الاستلام' : 'Proceed to COD Checkout'}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
