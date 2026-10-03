import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Order, OrderItem, Store } from '../types';
import { createTargetedOrder, getStoreById } from '../services/storeService';
import {
  Truck,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  FileText,
  X,
  ArrowRight,
  Package,
} from 'lucide-react';

const ARAB_CITIES: Record<string, { cities: string[]; dialCode: string }> = {
  'Saudi Arabia': {
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca', 'Medina', 'Tabuk', 'Abha'],
    dialCode: '+966',
  },
  'UAE': {
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah'],
    dialCode: '+971',
  },
  'Egypt': {
    cities: ['Cairo', 'Giza', 'Alexandria', 'New Cairo', 'Sheikh Zayed', 'Mansoura'],
    dialCode: '+20',
  },
};

export const CheckoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  singleProductOrder?: { product: any; quantity: number } | null;
}> = ({ isOpen, onClose, singleProductOrder }) => {
  const { cart, clearCart, currency, formatPrice, language } = useMarketplace();
  const isRTL = language === 'ar';

  const checkoutItems = singleProductOrder
    ? [{ product: singleProductOrder.product, quantity: singleProductOrder.quantity }]
    : cart;

  const [country, setCountry] = useState<string>('Saudi Arabia');
  const [city, setCity] = useState<string>('Riyadh');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);

  if (!isOpen) return null;

  const totalSAR = checkoutItems.reduce(
    (sum, it) => sum + it.product.basePriceSAR * it.quantity,
    0
  );
  const convertedTotal = formatPrice(totalSAR);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const available = ARAB_CITIES[newCountry]?.cities || [];
    setCity(available[0] || '');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in required shipping information.');
      return;
    }

    setSubmitting(true);
    try {
      // Group items by storeId for targeted order routing
      const storeMap: Record<string, OrderItem[]> = {};

      for (const it of checkoutItems) {
        const sId = it.product.storeId || 'default-store';
        if (!storeMap[sId]) storeMap[sId] = [];
        storeMap[sId].push({
          productId: it.product.id,
          productTitle: it.product.title,
          productTitleAr: it.product.titleAr,
          storeId: sId,
          storeName: it.product.storeName,
          vendorId: it.product.vendorId,
          quantity: it.quantity,
          unitPriceSAR: it.product.basePriceSAR,
          totalPriceSAR: it.product.basePriceSAR * it.quantity,
          imageUrl: it.product.imageUrl,
        });
      }

      const placedList: Order[] = [];

      // Place targeted orders for each store
      for (const [sId, items] of Object.entries(storeMap)) {
        let storeObj = await getStoreById(sId);
        if (!storeObj) {
          storeObj = {
            id: sId,
            name: items[0]?.storeName || 'Artisan Atelier',
            slug: sId,
            vendorId: items[0]?.vendorId || 'unknown_vendor',
            vendorEmail: '',
            description: '',
            city,
            country: country as any,
            status: 'active',
            createdAt: null,
            updatedAt: null,
          };
        }

        const storeTotalSAR = items.reduce((sum, i) => sum + i.totalPriceSAR, 0);
        const storeConverted = formatPrice(storeTotalSAR);

        const order = await createTargetedOrder(
          {
            storeId: storeObj.id,
            vendorId: storeObj.vendorId,
            customerName: name.trim(),
            customerPhone: `${ARAB_CITIES[country]?.dialCode || ''} ${phone.trim()}`,
            customerEmail: email.trim() || undefined,
            country,
            city,
            address: address.trim(),
            paymentMethod: 'COD',
            currency,
            totalAmount: storeConverted.amount,
            totalAmountSAR: storeTotalSAR,
            items,
            status: 'pending',
            notes: notes.trim() || undefined,
          },
          storeObj
        );

        placedList.push(order);
      }

      setConfirmedOrders(placedList);
      if (!singleProductOrder) {
        clearCart();
      }
    } catch (err) {
      alert('Error placing Cash on Delivery order. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-stone-900 my-auto">
        {/* If Order is Confirmed */}
        {confirmedOrders.length > 0 ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                {isRTL ? 'تم إرسال الطلب إلى المشغل بنجاح' : 'Targeted COD Order Routed Successfully'}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                {isRTL ? 'طلبك قيد المراجعة والمطابقة' : 'Order Routed to Atelier'}
              </h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-2">
                An instant alert has been sent to the artisan atelier to accept and prepare your handcrafted concrete pieces. You will pay Cash on Delivery upon delivery to your doorstep.
              </p>
            </div>

            <div className="p-4 bg-stone-100 rounded-2xl text-xs space-y-2 border border-stone-200 text-left">
              <div className="flex justify-between font-bold">
                <span>Total Due on Delivery:</span>
                <span className="text-stone-900 font-mono text-sm">{convertedTotal.formatted}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Address:</span>
                <span>{city}, {country}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Targeted Ateliers:</span>
                <span>{confirmedOrders.map(o => o.storeId).join(', ')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmedOrders([]);
                onClose();
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-xl transition cursor-pointer"
            >
              Continue Exploring Collections
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">
                    Cash on Delivery (COD) Checkout
                  </h3>
                  <p className="text-xs text-stone-500">
                    Hand-cast architectural concrete delivery across KSA, UAE, and Egypt
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

            {/* Order Items Summary */}
            <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 max-h-48 overflow-y-auto space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Order Items ({checkoutItems.length})
              </span>
              {checkoutItems.map(item => (
                <div key={item.product.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      className="w-8 h-8 rounded-lg object-cover border border-stone-300"
                    />
                    <span className="font-semibold text-stone-800 line-clamp-1 max-w-[200px]">
                      {item.product.title} (x{item.quantity})
                    </span>
                  </div>
                  <span className="font-mono font-bold text-stone-900">
                    {formatPrice(item.product.basePriceSAR * item.quantity).formatted}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-300 flex justify-between font-extrabold text-sm text-stone-900">
                <span>Total Amount:</span>
                <span className="font-mono">{convertedTotal.formatted}</span>
              </div>
            </div>

            {/* Shipping Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                    <option value="UAE">United Arab Emirates (UAE)</option>
                    <option value="Egypt">Egypt (EGY)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    {(ARAB_CITIES[country]?.cities || []).map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sultan Al-Otaibi"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mobile Number</label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl text-stone-600 font-mono text-xs">
                      {ARAB_CITIES[country]?.dialCode}
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="50 123 4567"
                      className="w-full bg-white border border-stone-300 rounded-r-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Street Address & District</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="District, Street Name, Villa / Apartment Number"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Gate code, specific delivery hour, aggregate preference..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="p-3 bg-stone-100 rounded-2xl flex items-center justify-between text-xs text-stone-700 border border-stone-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Cash on Delivery
                </span>
                <span className="text-[11px] text-stone-500">Pay only upon inspection & arrival</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-extrabold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? 'Placing Order...' : `Place COD Order (${convertedTotal.formatted})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
