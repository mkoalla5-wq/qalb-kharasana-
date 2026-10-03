import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CustomRequest } from '../types';
import { createCustomRequest } from '../services/storeService';
import {
  Sparkles,
  CheckCircle2,
  Palette,
  Layers,
  PenTool,
  Ruler,
  DollarSign,
  MapPin,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PIGMENT_OPTIONS = [
  { id: 'desert-ochre', name: 'Desert Sand / Ochre', nameAr: 'أوكر رملي صحراوي', color: '#c2a382' },
  { id: 'raw-grey', name: 'Industrial Raw Grey', nameAr: 'رمادي خرساني خام', color: '#8a8d8f' },
  { id: 'midnight-charcoal', name: 'Midnight Charcoal', nameAr: 'فحم داكن مخملي', color: '#2b2b2b' },
  { id: 'terracotta', name: 'Warm Terracotta Red', nameAr: 'تراكوتا فخارية دافئة', color: '#b86043' },
  { id: 'sage-green', name: 'Sage Olive Green', nameAr: 'أخضر ميرمية زيتي', color: '#687864' },
  { id: 'white-terrazzo', name: 'Alabaster Marbled White', nameAr: 'أبيض رخامي نقي', color: '#ebe6df' },
];

const AGGREGATE_OPTIONS = [
  { id: 'alabaster', name: 'Egyptian Desert Alabaster', nameAr: 'كسر رخام وألبستر مصري' },
  { id: 'basalt', name: 'Volcanic Black Basalt', nameAr: 'حصى البازلت البركاني' },
  { id: 'quartz', name: 'Natural Quartz & Flint', nameAr: 'بلورات الكوارتز الطبيعية' },
  { id: 'emerald-glass', name: 'Recycled Emerald Glass', nameAr: 'فتات الزجاج الزمردي' },
  { id: 'smooth-mineral', name: 'Ultra-Smooth (No Aggregate)', nameAr: 'صب ناعم مخملي بدون ركام' },
];

export const CustomConcreteRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  presetStoreId?: string;
}> = ({ isOpen, onClose, presetStoreId }) => {
  const { currency, language } = useMarketplace();
  const isRTL = language === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Saudi Arabia');
  const [city, setCity] = useState('Riyadh');
  const [concreteColor, setConcreteColor] = useState(PIGMENT_OPTIONS[0].name);
  const [aggregateType, setAggregateType] = useState(AGGREGATE_OPTIONS[0].name);
  const [engravingText, setEngravingText] = useState('');
  const [dimensions, setDimensions] = useState('Approx 35 x 35 x 45 cm');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'both'>('indoor');
  const [budget, setBudget] = useState(450);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReq, setSubmittedReq] = useState<CustomRequest | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !city.trim()) {
      alert('Please fill out your contact details.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCustomRequest({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        country,
        city: city.trim(),
        concreteColor,
        aggregateType,
        engravingText: engravingText.trim() || undefined,
        dimensions: dimensions.trim(),
        indoorOutdoor,
        budget: Number(budget),
        currency,
        notes: notes.trim() || undefined,
        targetStoreId: presetStoreId || 'any',
        status: 'new',
      });
      setSubmittedReq(created);
    } catch (err) {
      alert('Failed to submit commission. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-stone-900 my-auto">
        {submittedReq ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                {isRTL ? 'تم تسجيل طلب التنفيذ الخاص' : 'Bespoke Commission Dispatched'}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                {isRTL ? 'الطلب قيد مراجعة المشاغل' : 'Commission Under Atelier Review'}
              </h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-2">
                Our master concrete molders are reviewing your custom pigment and aggregate selection ({concreteColor} with {aggregateType}). An artisan will contact you at {phone}.
              </p>
            </div>

            <button
              onClick={() => {
                setSubmittedReq(null);
                onClose();
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-xl transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">
                    Bespoke Concrete Commission
                  </h3>
                  <p className="text-xs text-stone-500">
                    Custom pigment blends, aggregate selection, and calligraphy engraving
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Color & Aggregate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Select Mineral Pigment Tone
                  </label>
                  <select
                    value={concreteColor}
                    onChange={e => setConcreteColor(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    {PIGMENT_OPTIONS.map(p => (
                      <option key={p.id} value={p.name}>
                        {isRTL ? p.nameAr : p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Terrazzo Aggregate
                  </label>
                  <select
                    value={aggregateType}
                    onChange={e => setAggregateType(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    {AGGREGATE_OPTIONS.map(a => (
                      <option key={a.id} value={a.name}>
                        {isRTL ? a.nameAr : a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dimensions & Indoor/Outdoor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Target Dimensions / Placement
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    placeholder="e.g. 50cm diameter coffee table"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Usage Environment
                  </label>
                  <select
                    value={indoorOutdoor}
                    onChange={e => setIndoorOutdoor(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="indoor">Indoor (Satin beeswax sealant)</option>
                    <option value="outdoor">Outdoor / Garden (UV & frost resistant siloxane)</option>
                    <option value="both">Versatile (Indoor & Outdoor)</option>
                  </select>
                </div>
              </div>

              {/* Calligraphy Engraving */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Arabic Calligraphy or Monogram Engraving (Optional)
                </label>
                <input
                  type="text"
                  value={engravingText}
                  onChange={e => setEngravingText(e.target.value)}
                  placeholder="e.g. ن / مبارك / Family Monogram"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Fahad Al-Dossari"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+966 5..."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Riyadh"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Additional Notes or Reference Links
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe your design vision, architectural inspirations, or timeline..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-extrabold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting Commission...' : 'Submit to Concrete Ateliers'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
