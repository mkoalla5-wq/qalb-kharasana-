import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createStore } from '../services/storeService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Store, Sparkles, AlertCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';

export const VendorRegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (slug: string) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, refreshUserStore, refreshUserProfile } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [city, setCity] = useState('Riyadh');
  const [country, setCountry] = useState<'Saudi Arabia' | 'UAE' | 'Egypt'>('Saudi Arabia');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setStoreName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);

    const cleanSlug = storeSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (!cleanSlug || cleanSlug.length < 3) {
      setError('Store handle must be at least 3 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const newStore = await createStore({
        id: cleanSlug,
        slug: cleanSlug,
        name: storeName.trim(),
        vendorId: currentUser.id,
        vendorEmail: currentUser.email,
        description: description.trim() || 'Handcrafted architectural brutalist concrete and terrazzo pieces.',
        city,
        country,
        status: 'active',
        rating: 5.0,
        artisanPoints: 100, // Starter bonus
        logoUrl: '/logo.svg',
        bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      });

      // Update current user to 'admin'
      await updateDoc(doc(db, 'users', currentUser.id), {
        role: 'admin',
        storeId: newStore.id,
        storeSlug: cleanSlug,
        artisanPoints: 100,
        updatedAt: serverTimestamp(),
      });

      await refreshUserProfile();
      await refreshUserStore();

      onSuccess(cleanSlug);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create store. Slug may already be claimed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-stone-900 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-stone-900 leading-tight">
                Launch an Atelier Microsite
              </h3>
              <p className="text-xs text-stone-500">
                Claim your unique /stores/[slug] URL and receive targeted orders
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

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Atelier / Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Basalt & Form Atelier"
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Dedicated Storefront URL
            </label>
            <div className="flex items-center bg-white border border-stone-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-stone-900">
              <span className="px-3 text-xs text-stone-400 font-mono bg-stone-50 border-r border-stone-200 py-2">
                /stores/
              </span>
              <input
                type="text"
                required
                value={storeSlug}
                onChange={e => setStoreSlug(e.target.value)}
                placeholder="basalt-form"
                className="w-full px-3 py-2 text-stone-900 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value as any)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
              >
                <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                <option value="UAE">United Arab Emirates (UAE)</option>
                <option value="Egypt">Egypt (EGY)</option>
              </select>
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
            <label className="block font-bold text-stone-700 mb-1">Craft Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell collectors about your cast concrete pieces, aggregates, and mineral pigments..."
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-extrabold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? 'Creating Atelier...' : 'Launch Atelier & Claim +100 Points'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
