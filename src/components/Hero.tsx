import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ConcreteVaseDecor } from './ConcreteVaseDecor';
import { Sparkles, Truck, ShieldCheck, ArrowRight, Layers, Award } from 'lucide-react';

export const Hero: React.FC<{
  onExplore: () => void;
  onCustomCommission: () => void;
  onOpenVendorSignup: () => void;
  storeCount: number;
  productCount: number;
}> = ({ onExplore, onCustomCommission, onOpenVendorSignup, storeCount, productCount }) => {
  const { t, language, settings } = useMarketplace();
  const isRTL = language === 'ar';

  return (
    <div className="relative overflow-hidden bg-[#F5F2EB] border-b-2 border-stone-300 text-stone-900 font-sans">
      {/* Subtle Background Brutalist Concrete Vase Vector Graphic */}
      <div className="absolute right-0 top-0 bottom-0 pointer-events-none opacity-20 hidden md:block">
        <ConcreteVaseDecor variant="sculptural" className="w-96 h-full" />
      </div>
      <div className="absolute left-6 bottom-4 pointer-events-none opacity-10 hidden xl:block">
        <ConcreteVaseDecor variant="fluted" className="w-56 h-64" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Text Content */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-300 text-[11px] sm:text-xs font-bold text-stone-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>
                {isRTL
                  ? 'منصة روائع الخرسانة الفنية المعمارية • مشاغل مستقلة معتمدة'
                  : 'Arab World Artisanal Concrete • Independent Atelier Microsites'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-[1.1] font-['Plus_Jakarta_Sans',sans-serif]">
              {t('heroTitle')}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-2xl">
              {t('heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-1">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-2xl shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20 transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <span>{isRTL ? 'استكشف المعروضات' : 'Explore Collections'}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={onCustomCommission}
                className="px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-900 border-2 border-stone-300 font-bold rounded-2xl transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t('bespokeRequest')}</span>
              </button>

              <button
                onClick={onOpenVendorSignup}
                className="px-4 py-3.5 text-blue-700 hover:text-blue-900 text-xs sm:text-sm font-bold underline underline-offset-4 transition cursor-pointer"
              >
                {isRTL ? 'إطلاق مشغل خاص (رابط مستقل)' : 'Launch Atelier Microsite'}
              </button>
            </div>

            {/* Regional Market USPs Bar */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-stone-300 text-xs">
              <div className="flex items-center gap-2.5 text-stone-700">
                <div className="w-8 h-8 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-stone-900 shadow-2xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-stone-900">{isRTL ? 'دفع عند الاستلام' : 'Cash on Delivery'}</div>
                  <div className="text-[11px] text-stone-500">{isRTL ? 'السعودية، الإمارات، ومصر' : 'Saudi Arabia, UAE & Egypt'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-stone-700">
                <div className="w-8 h-8 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-blue-700 shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-stone-900">{isRTL ? 'متاجر بروابط مستقلة' : 'Independent URLs'}</div>
                  <div className="text-[11px] text-stone-500">{isRTL ? 'صفحة خاصة لكل مشغل' : 'Unique /stores/[slug] sites'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-stone-700 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-amber-700 shadow-2xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-stone-900">{isRTL ? 'نظام نقاط الحرفيين' : 'Artisan Points System'}</div>
                  <div className="text-[11px] text-stone-500">{isRTL ? 'تقييم الحرفية والأداء' : 'Reputation & sales rewards'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-6 sm:p-7 shadow-xl w-full max-w-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                  Marketplace Overview
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  Live Feed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                  <div className="text-3xl font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    {storeCount}
                  </div>
                  <div className="text-xs font-bold text-stone-500 mt-0.5">
                    Active Ateliers
                  </div>
                </div>

                <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                  <div className="text-3xl font-black text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    {productCount}
                  </div>
                  <div className="text-xs font-bold text-stone-500 mt-0.5">
                    Concrete Pieces
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-100/90 rounded-2xl text-[11px] text-stone-600 leading-relaxed border border-stone-200">
                Direct atelier dispatch: Each piece is sealed with industrial water-repellent siloxanes and shipped with high-density foam framing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
