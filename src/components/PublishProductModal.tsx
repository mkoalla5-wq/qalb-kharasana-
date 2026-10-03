import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, ProductCategory, Store } from '../types';
import { createProduct, createStore } from '../services/storeService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Sparkles,
  X,
  Package,
  CheckCircle2,
  DollarSign,
  FileText,
  Layers,
  Ruler,
  Image as ImageIcon,
  Check,
  ArrowRight,
  Store as StoreIcon,
  Tag,
} from 'lucide-react';

const CONCRETE_IMAGE_PRESETS = [
  {
    name: 'Architectural Step Mabkhara',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    category: 'mabkhara' as ProductCategory,
  },
  {
    name: 'Fluted Charcoal Oval Tray',
    url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80',
    category: 'trays' as ProductCategory,
  },
  {
    name: 'Hexagonal Alabaster Terrazzo Pot',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    category: 'planters' as ProductCategory,
  },
  {
    name: 'Cylinder Brutalist Concrete Lamp',
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    category: 'lighting' as ProductCategory,
  },
  {
    name: 'Sculptural Concrete Arches',
    url: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80',
    category: 'sculptures' as ProductCategory,
  },
  {
    name: 'Mineral Cast Terrazzo Coasters',
    url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
    category: 'tableware' as ProductCategory,
  },
];

export const PublishProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onProductPublished: (product: Product) => void;
}> = ({ isOpen, onClose, onProductPublished }) => {
  const { currentUser, userStore, refreshUserStore, refreshUserProfile } = useAuth();
  const { formatPrice, language } = useMarketplace();
  const isRTL = language === 'ar';

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [priceSAR, setPriceSAR] = useState<number>(185);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ProductCategory>('mabkhara');
  const [stock, setStock] = useState<number>(12);
  const [dimensions, setDimensions] = useState('22 x 14 x 5 cm');
  const [weightKg, setWeightKg] = useState<number>(1.6);
  const [finish, setFinish] = useState('Matte Siloxane Water-Repellent Sealer');
  const [imageUrl, setImageUrl] = useState(CONCRETE_IMAGE_PRESETS[0].url);
  const [customImageInput, setCustomImageInput] = useState('');

  // Fallback for user without store yet
  const [quickAtelierName, setQuickAtelierName] = useState(
    currentUser?.displayName ? `${currentUser.displayName} Concrete Atelier` : 'Arabian Concrete Atelier'
  );

  const [submitting, setSubmitting] = useState(false);
  const [successProduct, setSuccessProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  // Approximate Currency conversion for preview
  const aedEstimate = (priceSAR * 0.98).toFixed(0);
  const egpEstimate = (priceSAR * 12.8).toFixed(0);

  const handleSelectPreset = (preset: typeof CONCRETE_IMAGE_PRESETS[0]) => {
    setImageUrl(preset.url);
    setCategory(preset.category);
  };

  const handleApplyCustomImage = () => {
    if (customImageInput.trim()) {
      setImageUrl(customImageInput.trim());
      setCustomImageInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim()) {
      alert('Please enter a product title.');
      return;
    }
    if (priceSAR <= 0) {
      alert('Please enter a valid price greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      let activeStore: Store | null = userStore;

      // If vendor doesn't have an active store document, create one effortlessly
      if (!activeStore) {
        const slug = (quickAtelierName || 'artisan-atelier')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `atelier-${Date.now().toString(36)}`;

        activeStore = await createStore({
          id: slug,
          slug: slug,
          name: quickAtelierName.trim() || 'Artisan Concrete Atelier',
          vendorId: currentUser.id,
          vendorEmail: currentUser.email,
          description: 'Independent atelier crafting bespoke architectural concrete homeware.',
          city: 'Riyadh',
          country: 'Saudi Arabia',
          status: 'active',
          rating: 5.0,
          artisanPoints: 100,
          logoUrl: '/logo.svg',
          bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        });

        // Update user profile to link to this new store
        await updateDoc(doc(db, 'users', currentUser.id), {
          role: 'admin',
          storeId: activeStore.id,
          storeSlug: activeStore.slug,
          artisanPoints: 100,
          updatedAt: serverTimestamp(),
        });

        await refreshUserProfile();
        await refreshUserStore();
      }

      const productId = `prod_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

      const newProduct: Product = {
        id: productId,
        storeId: activeStore.id,
        storeName: activeStore.name,
        vendorId: currentUser.id,
        title: title.trim(),
        titleAr: titleAr.trim() || title.trim(),
        description: notes.trim() || 'Hand-cast architectural brutalist concrete piece with mineral pigments.',
        descriptionAr: notes.trim(),
        category,
        basePriceSAR: Number(priceSAR),
        stock: Number(stock),
        imageUrl: imageUrl.trim(),
        dimensions: dimensions.trim() || '20 x 20 x 5 cm',
        weightKg: Number(weightKg) || 1.5,
        finish: finish.trim() || 'Industrial Siloxane Matte Sealer',
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const published = await createProduct(newProduct);
      setSuccessProduct(published);
      onProductPublished(published);
    } catch (err: any) {
      console.error('Publish product error:', err);
      alert('Failed to publish product. Please check network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-stone-900 my-auto">
        {/* SUCCESS VIEW */}
        {successProduct ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-800 font-extrabold">
                {isRTL ? 'تم النشر بنجاح' : 'Live on Platform'}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                Your Item is Now Published for Sale!
              </h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
                "{successProduct.title}" has been published to the <strong>Global Marketplace</strong> and to your dedicated atelier storefront. Every client across Saudi Arabia, UAE, and Egypt can now discover, inspect, and order it with Cash on Delivery.
              </p>
            </div>

            {/* Product Snapshot Card */}
            <div className="p-4 bg-white border border-stone-200 rounded-2xl flex items-center gap-4 text-left max-w-md mx-auto shadow-2xs">
              <img
                src={successProduct.imageUrl}
                alt={successProduct.title}
                className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-blue-700">
                  {successProduct.category}
                </span>
                <h4 className="font-extrabold text-sm text-stone-900 truncate">
                  {successProduct.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-stone-900 font-mono">
                    {formatPrice(successProduct.basePriceSAR).formatted}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    • Stock: {successProduct.stock} pcs
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessProduct(null);
                  setTitle('');
                  setTitleAr('');
                  setNotes('');
                  onClose();
                }}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-xl transition cursor-pointer text-xs sm:text-sm shadow-md"
              >
                View in Marketplace
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessProduct(null);
                  setTitle('');
                  setTitleAr('');
                  setNotes('');
                }}
                className="px-5 py-3 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
              >
                + Publish Another Piece
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-sm">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Put Concrete Item for Sale
                  </h3>
                  <p className="text-xs text-stone-500">
                    Set your price, craft notes, and publish instantly for all clients
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

            {/* Atelier Indicator */}
            {userStore ? (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <StoreIcon className="w-4 h-4 text-blue-700" />
                  <span className="text-stone-700">Publishing under Atelier:</span>
                  <span className="font-extrabold text-blue-950">{userStore.name}</span>
                </div>
                <span className="font-mono text-[10px] text-blue-700 font-bold">
                  /stores/{userStore.slug}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-xs">
                <label className="block font-bold text-amber-950">
                  Your Atelier / Brand Name:
                </label>
                <input
                  type="text"
                  required
                  value={quickAtelierName}
                  onChange={e => setQuickAtelierName(e.target.value)}
                  placeholder="e.g. Desert Rock Concrete Studio"
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-800">
                  We will automatically activate your dedicated storefront microsite when you publish!
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Item Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Brutalist Fluted Incense Altar"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Item Title (Arabic - Optional)
                  </label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={e => setTitleAr(e.target.value)}
                    placeholder="e.g. مبخرة معمارية مضلعة"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Price (SAR) & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Sale Price (SAR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={10}
                      step={5}
                      value={priceSAR}
                      onChange={e => setPriceSAR(Number(e.target.value))}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono mt-1">
                    ≈ {aedEstimate} AED • {egpEstimate} EGP
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="mabkhara">Modern Mabkhara (Incense)</option>
                    <option value="trays">Fluted Trays & Vessels</option>
                    <option value="planters">Terrazzo Planters</option>
                    <option value="lighting">Brutalist Lighting</option>
                    <option value="sculptures">Sculptures & Arches</option>
                    <option value="tableware">Tableware & Coasters</option>
                    <option value="bespoke">Bespoke Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <div className="text-[10px] text-stone-400 mt-1">
                    Ready for immediate COD dispatch
                  </div>
                </div>
              </div>

              {/* Vendor Notes & Craft Description */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Vendor Notes & Craft Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Detail your concrete mix (e.g. Portland cement, quartz aggregate, mineral pigment), heat resistance for incense, water-repellent sealant, or care instructions for collectors..."
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-stone-900 font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none text-xs"
                />
                <p className="text-[10px] text-stone-500 mt-0.5">
                  These notes are displayed on the product page so clients understand the craftsmanship of your piece.
                </p>
              </div>

              {/* Specifications: Dimensions, Weight, Finish */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    placeholder="e.g. 24 x 14 x 4 cm"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Approx. Weight (kg)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Finish / Sealing
                  </label>
                  <input
                    type="text"
                    value={finish}
                    onChange={e => setFinish(e.target.value)}
                    placeholder="e.g. Matte Siloxane"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              {/* Image Selection & Preview */}
              <div className="space-y-2 pt-1 border-t border-stone-200">
                <label className="block font-bold text-stone-700">
                  Select Concrete Artwork Photo:
                </label>

                {/* Preset Options */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CONCRETE_IMAGE_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 h-16 transition relative group ${
                        imageUrl === preset.url
                          ? 'border-stone-900 ring-2 ring-stone-900 scale-102'
                          : 'border-stone-300 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      {imageUrl === preset.url && (
                        <div className="absolute top-1 right-1 bg-stone-900 text-white rounded-full p-0.5 shadow-sm">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Or Custom URL */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={customImageInput}
                    onChange={e => setCustomImageInput(e.target.value)}
                    placeholder="Or paste custom image URL (https://...)"
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomImage}
                    disabled={!customImageInput.trim()}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl disabled:opacity-40 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-stone-900/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Publishing to Platform...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Publish for Sale (+15 Artisan Points)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
