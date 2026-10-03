import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldCheck, Sparkles, MapPin, Award } from 'lucide-react';

export const Footer: React.FC<{
  onOpenVendorSignup: () => void;
  onOpenSuperAdmin: () => void;
  onOpenCustomRequest: () => void;
}> = ({ onOpenVendorSignup, onOpenSuperAdmin, onOpenCustomRequest }) => {
  const { language, t } = useMarketplace();
  const { isSuperAdmin } = useAuth();
  const isRTL = language === 'ar';

  return (
    <footer className="bg-[#EDE8E1] border-t-2 border-stone-300 text-stone-700 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-stone-300 bg-[#EDE6DE] flex items-center justify-center">
                <img
                  src="/logo.svg"
                  alt="QALB AL Kharasana by pryzm empire"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-[10px] text-blue-700 font-bold tracking-wide">
                  By pryzm empire
                </div>
                <span className="font-black text-lg text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  {t('brandName')}
                </span>
              </div>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed max-w-md font-normal">
              {isRTL
                ? 'منصة روائع الخرسانة الفنية المعمارية، التيرازو المصنوع يدوياً، والمباخر المضلعة. ندعم المشاغل الحرفية المستقلة في الرياض ودبي والقاهرة مع خدمة الدفع عند الاستلام.'
                : 'The dedicated marketplace for brutalist concrete homeware, architectural incense burners, and hand-cast terrazzo across Saudi Arabia, UAE, and Egypt. Handcrafted with local aggregate and mineral pigments.'}
            </p>
            <div className="flex items-center gap-4 text-stone-600 text-[11px] pt-1">
              <span className="flex items-center gap-1.5 font-bold text-stone-900">
                <Truck className="w-3.5 h-3.5 text-stone-700" />
                Cash on Delivery (COD)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Arab Artisans
              </span>
            </div>
          </div>

          {/* Hubs */}
          <div className="space-y-3">
            <h4 className="font-black text-stone-900 uppercase text-[11px] tracking-wider">
              {isRTL ? 'مراكز المشاغل الحرفية' : 'Artisan Hubs'}
            </h4>
            <ul className="space-y-2 text-stone-600">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-800" />
                <span>Riyadh & Jeddah, KSA</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-800" />
                <span>Alserkal Avenue, Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-800" />
                <span>Zamalek & New Cairo, Egypt</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-black text-stone-900 uppercase text-[11px] tracking-wider">
              {isRTL ? 'المشاغل والإدارة' : 'Platform & Ateliers'}
            </h4>
            <ul className="space-y-2 text-stone-600">
              <li>
                <button
                  onClick={onOpenVendorSignup}
                  className="hover:text-stone-950 font-bold transition cursor-pointer"
                >
                  {isRTL ? 'تسجيل مشغل جديد (+100 نقطة)' : 'Launch Artisan Atelier (+100 Pts)'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCustomRequest}
                  className="hover:text-stone-950 font-bold transition cursor-pointer"
                >
                  {isRTL ? 'طلب تنفيذ خاص للفلل والمشاريع' : 'Custom Architectural Commission'}
                </button>
              </li>
              {isSuperAdmin && (
                <li>
                  <button
                    onClick={onOpenSuperAdmin}
                    className="text-red-700 hover:text-red-900 transition cursor-pointer font-bold"
                  >
                    Super Admin Control Panel
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-medium">
          <div>
            © {new Date().getFullYear()} Qalb Al-Kharasana by pryzm empire.
          </div>
          <div>
            Hand-cast with raw brutalist concrete, terrazzo & mineral pigments.
          </div>
        </div>
      </div>
    </footer>
  );
};
