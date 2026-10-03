import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store } from '../types';
import { createCallbackRequest } from '../services/storeService';
import { PhoneCall, X, CheckCircle2, Clock, User, Phone, MessageSquare } from 'lucide-react';

export const CallbackRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}> = ({ isOpen, onClose, store }) => {
  const { currentUser } = useAuth();

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');
  const [inquiry, setInquiry] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;

    setSubmitting(true);
    try {
      await createCallbackRequest({
        storeId: store.id,
        storeName: store.name,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        preferredTime,
        inquiry: inquiry.trim() || 'General inquiry about concrete homeware / custom dimensions.',
      });
      setSubmitted(true);
    } catch (e) {
      console.warn('Failed to submit callback request:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                Request a Callback
              </h3>
              <p className="text-xs text-stone-500">
                Direct phone consult with {store.name}
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

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-stone-900">
              Callback Scheduled!
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              We have alerted the artisans at <span className="font-bold text-stone-900">{store.name}</span>. An artisan specialist will contact you at <span className="font-mono font-bold text-stone-900">{customerPhone}</span> during your preferred window: {preferredTime}.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Faisal Al-Sabah"
                  className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Phone Number (WhatsApp or Call)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+966 50 123 4567"
                  className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Preferred Call Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <select
                  value={preferredTime}
                  onChange={e => setPreferredTime(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
                >
                  <option>Morning (9 AM - 12 PM)</option>
                  <option>Afternoon (1 PM - 5 PM)</option>
                  <option>Evening (6 PM - 9 PM)</option>
                  <option>Immediate / ASAP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Project or Inquiry Details
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <textarea
                  rows={2}
                  value={inquiry}
                  onChange={e => setInquiry(e.target.value)}
                  placeholder="Need advice on sizing for a living room incense altar, terrazzo table weights, or mineral tones..."
                  className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? 'Sending Request...' : `Submit Request to ${store.name}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
