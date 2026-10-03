import { AdminCode, MarketplaceSettings } from '../types';

export const INITIAL_30_ADMIN_CODES: AdminCode[] = Array.from({ length: 30 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  const region = i % 3 === 0 ? 'KSA' : i % 3 === 1 ? 'UAE' : 'EGY';
  return {
    code: `ARTISAN-${num}-${region}`,
    slotNumber: i + 1,
    isClaimed: false,
  };
});

export const DEFAULT_MARKETPLACE_SETTINGS: MarketplaceSettings = {
  id: 'marketplace',
  appName: 'Qalb Al-Kharasana',
  appNameAr: 'قلب الخرسانة',
  appTagline: 'Artisanal Concrete Home Art & Architecture',
  appTaglineAr: 'فن وديكور الخرسانة المعمارية للمنزل العربي',
  logoUrl: '/logo.svg',
  bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
  heroTitle: 'Raw Brutalism. Sculptural Elegance.',
  heroTitleAr: 'جمالية الخرسانة الخام. أصالة الفن المعماري.',
  heroSubtitle: 'A multi-vendor marketplace connecting up to 30 independent concrete ateliers and artisans across Riyadh, Dubai, and Cairo to lovers of brutalist home decor.',
  heroSubtitleAr: 'منصة متكاملة تدعم حتى ٣٠ مشغلاً ومصمماً للخرسانة الفنية المعمارية في الرياض ودبي والقاهرة لعشاق الديكور العصري الراقي.',
  adminCodes: INITIAL_30_ADMIN_CODES,
};
