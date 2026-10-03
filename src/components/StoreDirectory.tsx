import React from 'react';
import { Store } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { MapPin, Star, ArrowRight, Store as StoreIcon, ShieldCheck, Award, ExternalLink } from 'lucide-react';

export const StoreDirectory: React.FC<{
  stores: Store[];
  onSelectStore: (store: Store) => void;
  onOpenVendorSignup: () => void;
}> = ({ stores, onSelectStore, onOpenVendorSignup }) => {
  const { language, countryFilter, setCountryFilter } = useMarketplace();
  const isRTL = language === 'ar';

  const filteredStores = stores.filter(s => {
    if (countryFilter === 'all') return true;
    return s.country.toLowerCase().includes(countryFilter.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-300">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-700">
            {isRTL ? 'دليل المشاغل المستقلة' : 'Independent Atelier Directory'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-1 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
            {isRTL ? 'مشاغل الخرسانة الفنية المعمارية' : 'Arab World Concrete Ateliers'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            {isRTL
              ? 'كل مشغل يمتلك متجراً مستقلاً بمسار مخصص (/stores/[slug]) وتواصل مباشر مع الحرفي.'
              : 'Each verified atelier operates an independent microsite (/stores/[slug]) with direct artisan messaging.'}
          </p>
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] border-2 border-stone-300 p-1.5 rounded-2xl text-xs flex-wrap">
          {[
            { id: 'all', label: isRTL ? 'جميع المشاغل' : 'All Ateliers' },
            { id: 'Saudi', label: isRTL ? 'السعودية' : 'Saudi Arabia' },
            { id: 'UAE', label: isRTL ? 'الإمارات' : 'UAE' },
            { id: 'Egypt', label: isRTL ? 'مصر' : 'Egypt' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCountryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                countryFilter === c.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean State Empty Stores Display */}
      {stores.length === 0 ? (
        <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-8 sm:p-14 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-stone-200 border border-stone-300 flex items-center justify-center mx-auto text-stone-700">
            <StoreIcon className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {isRTL ? 'لم يتم تسجيل أي مشغل بعد' : 'Ready for Atelier Registrations'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              {isRTL
                ? 'سجل حساب حرفي لتفعيل متجرك المستقل والحصول على رابط خاص بك.'
                : 'Create an Artisan account to claim your dedicated storefront microsite and start accepting targeted orders.'}
            </p>
          </div>

          <button
            onClick={onOpenVendorSignup}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-xl text-xs sm:text-sm transition inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>{isRTL ? 'إنشاء متجر حرفي جديد' : 'Launch an Atelier Microsite'}</span>
          </button>
        </div>
      ) : (
        /* Grid of Stores */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map(store => {
            const displayTitle = isRTL && store.nameAr ? store.nameAr : store.name;
            const displayDesc = isRTL && store.descriptionAr ? store.descriptionAr : store.description;

            return (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="group bg-[#FAF8F5] border-2 border-stone-300 hover:border-stone-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Banner & Logo */}
                  <div className="relative h-36 bg-stone-200 overflow-hidden">
                    <img
                      src={
                        store.bannerUrl ||
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Microsite URL pill */}
                    <span className="absolute top-3 left-3 bg-white/95 text-stone-900 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-stone-300 shadow-2xs">
                      /stores/{store.slug}
                    </span>

                    {/* Logo Overlay */}
                    <div className="absolute -bottom-4 left-4 rtl:left-auto rtl:right-4 w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-[#EDE6DE] shadow-md">
                      <img
                        src={store.logoUrl || '/logo.svg'}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 pt-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-stone-900 group-hover:text-blue-800 transition line-clamp-1">
                        {displayTitle}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-700 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{store.rating || '5.0'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-stone-700" />
                        {store.city}, {store.country}
                      </span>
                      {/* Artisan Points */}
                      <span className="flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-900 font-extrabold px-2 py-0.2 rounded-full text-[10px]">
                        <Award className="w-3 h-3 text-amber-700" />
                        <span>{store.artisanPoints ?? 100} pts</span>
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed pt-1">
                      {displayDesc ||
                        'Artisanal hand-cast brutalist concrete, incense burners, and architectural planters.'}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-stone-100/70 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-900 group-hover:text-blue-700">
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Enter Atelier Microsite</span>
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
