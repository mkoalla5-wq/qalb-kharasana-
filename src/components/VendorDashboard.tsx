import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, ProductCategory, Order, Notification, CallbackRequest } from '../types';
import {
  getProductsByStore,
  createProduct,
  updateProductPriceAndStock,
  deleteProduct,
  getArtisanOrders,
  acceptArtisanOrder,
  updateOrderStatus,
  subscribeArtisanNotifications,
  getStoreCallbackRequests,
  updateCallbackRequestStatus,
  addArtisanPoints,
} from '../services/storeService';
import { ConcreteVaseDecor } from './ConcreteVaseDecor';
import {
  Plus,
  Package,
  TrendingUp,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Truck,
  Check,
  RefreshCw,
  Award,
  Bell,
  PhoneCall,
  Share2,
  Copy,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const CONCRETE_IMAGE_PRESETS = [
  {
    name: 'Architectural Step Mabkhara',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    category: 'mabkhara',
  },
  {
    name: 'Fluted Charcoal Oval Tray',
    url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80',
    category: 'trays',
  },
  {
    name: 'Hexagonal Alabaster Terrazzo Pot',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    category: 'planters',
  },
  {
    name: 'Cylinder Brutalist Concrete Lamp',
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    category: 'lighting',
  },
  {
    name: 'Sculptural Concrete Arches',
    url: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80',
    category: 'sculptures',
  },
  {
    name: 'Mineral Cast Terrazzo Coasters',
    url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
    category: 'tableware',
  },
];

export const VendorDashboard: React.FC<{
  onViewLiveStore: (slug: string) => void;
  onOpenVendorSignup?: () => void;
}> = ({ onViewLiveStore, onOpenVendorSignup }) => {
  const { userStore, currentUser, refreshUserStore } = useAuth();
  const { formatPrice, language } = useMarketplace();
  const isRTL = language === 'ar';

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'notifications' | 'callbacks'>('catalog');

  const [copiedLink, setCopiedLink] = useState(false);

  // New Product Modal Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('trays');
  const [newPriceSAR, setNewPriceSAR] = useState<number>(150);
  const [newStock, setNewStock] = useState<number>(15);
  const [newImageUrl, setNewImageUrl] = useState(CONCRETE_IMAGE_PRESETS[1].url);
  const [newDimensions, setNewDimensions] = useState('24 x 14 x 3 cm');
  const [newFinish, setNewFinish] = useState('Matte Siloxane Sealer (Water-Repellent)');
  const [submitting, setSubmitting] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  const storePublicUrl = userStore ? `${window.location.origin}/stores/${userStore.slug}` : '';

  const copyStoreLink = () => {
    if (!storePublicUrl) return;
    navigator.clipboard.writeText(storePublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const loadData = async () => {
    if (!userStore?.id || !currentUser?.id) return;
    setLoading(true);
    try {
      const [prods, storeOrders, cbs] = await Promise.all([
        getProductsByStore(userStore.id),
        getArtisanOrders(currentUser.id, userStore.id),
        getStoreCallbackRequests(userStore.id),
      ]);
      setProducts(prods);
      setOrders(storeOrders);
      setCallbacks(cbs);
    } catch (e) {
      console.warn('Dashboard data load warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userStore?.id, currentUser?.id]);

  // Real-time notifications for this specific artisan
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubscribe = subscribeArtisanNotifications(currentUser.id, notifs => {
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userStore || !currentUser) return;

    setSubmitting(true);
    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      const created = await createProduct({
        id: newId,
        storeId: userStore.id,
        storeName: userStore.name,
        vendorId: currentUser.id,
        title: newTitle.trim(),
        titleAr: newTitleAr.trim() || newTitle.trim(),
        description: newDesc.trim() || 'Hand-cast architectural brutalist concrete homeware.',
        descriptionAr: newDesc.trim(),
        category: newCategory,
        basePriceSAR: Number(newPriceSAR),
        stock: Number(newStock),
        imageUrl: newImageUrl,
        dimensions: newDimensions,
        weightKg: 1.8,
        finish: newFinish,
        isFeatured: false,
      });

      setProducts(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewTitleAr('');
      setNewPriceSAR(150);
      setNewStock(15);
      refreshUserStore();
    } catch (err) {
      alert('Failed to create product. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveInline = async (productId: string) => {
    try {
      await updateProductPriceAndStock(productId, editPrice, editStock);
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, basePriceSAR: editPrice, stock: editStock } : p))
      );
      setEditingId(null);
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this piece from your atelier?')) return;
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // Targeted Order Acceptance Handler
  const handleAcceptOrder = async (orderId: string, notifId?: string) => {
    if (!currentUser || !userStore) return;
    try {
      await acceptArtisanOrder(orderId, notifId, currentUser.id, userStore.id);
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: 'accepted' } : o))
      );
      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, status: 'accepted' } : n))
      );
      refreshUserStore();
    } catch (err) {
      alert('Failed to accept order');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleMarkCallbackResolved = async (cbId: string) => {
    try {
      await updateCallbackRequestStatus(cbId, 'resolved');
      setCallbacks(prev =>
        prev.map(c => (c.id === cbId ? { ...c, status: 'resolved' } : c))
      );
    } catch (err) {
      alert('Failed to update callback status');
    }
  };

  if (!userStore) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-stone-700 space-y-4 font-sans">
        <div className="w-16 h-16 bg-[#EDE8E1] border-2 border-stone-300 rounded-2xl flex items-center justify-center mx-auto text-stone-700">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">No Active Atelier Linked</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          {currentUser?.role === 'customer'
            ? 'You are signed in as a Customer Collector. To manage an atelier microsite and receive targeted orders, register as an artisan.'
            : 'Your account is being initialized with an atelier.'}
        </p>
        {onOpenVendorSignup && (
          <button
            onClick={onOpenVendorSignup}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>Register an Atelier</span>
          </button>
        )}
      </div>
    );
  }

  const unreadNotifsCount = notifications.filter(n => n.status === 'unread').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Decorative Concrete Vase */}
      <div className="absolute top-10 right-4 pointer-events-none opacity-20 hidden lg:block">
        <ConcreteVaseDecor variant="stepped" className="w-60 h-72" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* SHARABLE PUBLIC STORE LINK BANNER */}
        <div className="bg-[#FAF8F5] border-2 border-blue-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-100 text-blue-900 font-extrabold uppercase px-2 py-0.5 rounded-full border border-blue-200">
                Independent Microsite URL
              </span>
              <span className="text-xs font-bold text-stone-800">Sharable Public Link</span>
            </div>
            <p className="text-xs text-stone-600 font-mono select-all">
              {storePublicUrl}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={copyStoreLink}
              className="px-4 py-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-900 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Copy Store Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => onViewLiveStore(userStore.slug)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live Storefront</span>
            </button>
          </div>
        </div>

        {/* ARTISAN HEADER & REPUTATION POINTS CARD */}
        <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <img
              src={userStore.logoUrl || '/logo.svg'}
              alt={userStore.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-stone-300 bg-[#EDE6DE] shadow-sm flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  {userStore.name}
                </h1>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  Status: {userStore.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {userStore.city}, {userStore.country} • Vendor ID: <span className="font-mono text-stone-700">{userStore.vendorId.slice(0, 10)}...</span>
              </p>
            </div>
          </div>

          {/* Points Card */}
          <div className="flex items-center gap-4 bg-amber-50/80 border-2 border-amber-300/80 rounded-2xl p-4 sm:px-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                Artisan Reputation Points
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 font-['Plus_Jakarta_Sans',sans-serif]">
                {userStore.artisanPoints ?? 100} <span className="text-xs font-semibold text-amber-800">pts</span>
              </div>
              <div className="text-[10px] text-amber-800 font-medium">
                +50 pts per order accepted • +15 pts per listing
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-stone-300 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'orders'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Targeted Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'notifications'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Live Alerts</span>
            {unreadNotifsCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('callbacks')}
            className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'callbacks'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Customer Callbacks ({callbacks.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                Atelier Concrete Pieces
              </h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Handcrafted Piece</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-stone-500">Loading catalog...</div>
            ) : products.length === 0 ? (
              <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-12 text-center text-stone-500 max-w-md mx-auto space-y-3">
                <Package className="w-12 h-12 mx-auto text-stone-400" />
                <h3 className="font-bold text-stone-800 text-base">No Products Listed Yet</h3>
                <p className="text-xs text-stone-500">
                  List your first hand-cast concrete tray, mabkhara, or sculptural vessel to earn +15 Artisan Points.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  + Add First Piece
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div
                    key={p.id}
                    className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-4 shadow-sm space-y-3"
                  >
                    <div className="h-48 rounded-2xl overflow-hidden bg-stone-200 border border-stone-200">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                          {p.category}
                        </span>
                        <span className="text-xs font-bold text-stone-900 font-mono">
                          Stock: {p.stock}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-xs font-black text-stone-900 font-mono">
                        {formatPrice(p.basePriceSAR).formatted}
                      </p>
                    </div>

                    {editingId === p.id ? (
                      <div className="p-3 bg-stone-100 rounded-2xl space-y-2 border border-stone-300">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-stone-600">Price (SAR)</label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={e => setEditPrice(Number(e.target.value))}
                              className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-600">Stock</label>
                            <input
                              type="number"
                              value={editStock}
                              onChange={e => setEditStock(Number(e.target.value))}
                              className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveInline(p.id)}
                            className="flex-1 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 bg-stone-200 text-stone-700 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-200">
                        <button
                          onClick={() => {
                            setEditingId(p.id);
                            setEditPrice(p.basePriceSAR);
                            setEditStock(p.stock);
                          }}
                          className="flex-1 py-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                          title="Delete piece"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TARGETED ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900">
              Orders Routed Specifically to {userStore.name}
            </h2>

            {orders.length === 0 ? (
              <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-12 text-center text-stone-500 max-w-md mx-auto space-y-2">
                <ShoppingBag className="w-12 h-12 mx-auto text-stone-400" />
                <h3 className="font-bold text-stone-800 text-base">No Orders Yet</h3>
                <p className="text-xs text-stone-500">
                  When collectors place an order on your storefront, it arrives directly here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          #{order.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            order.status === 'accepted'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-stone-500">
                          COD • {order.currency} {order.totalAmount}
                        </span>
                      </div>

                      <div className="text-xs text-stone-700">
                        <span className="font-bold">{order.customerName}</span> ({order.customerPhone}) • {order.city}, {order.address}
                      </div>

                      <div className="text-xs text-stone-500">
                        Items: {order.items.map(it => `${it.productTitle} (x${it.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Order (+50 Pts)</span>
                        </button>
                      )}

                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Mark Dispatched</span>
                        </button>
                      )}

                      {order.status === 'dispatched' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE NOTIFICATIONS & INSTANT ACCEPT ACTION */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900">
              Live Artisan Alerts & Order Dispatch
            </h2>

            {notifications.length === 0 ? (
              <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-12 text-center text-stone-500 max-w-md mx-auto space-y-2">
                <Bell className="w-12 h-12 mx-auto text-stone-400" />
                <h3 className="font-bold text-stone-800 text-base">No Alerts Yet</h3>
                <p className="text-xs text-stone-500">
                  Instant notifications with 'Accept' buttons appear here when orders are placed.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`bg-[#FAF8F5] border-2 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-xs ${
                      notif.status === 'unread'
                        ? 'border-blue-300 bg-blue-50/20'
                        : 'border-stone-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{notif.title}</span>
                        {notif.status === 'unread' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {notif.orderId && notif.status !== 'accepted' && (
                      <button
                        onClick={() => handleAcceptOrder(notif.orderId!, notif.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-xs flex-shrink-0"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Order (+50 Pts)</span>
                      </button>
                    )}

                    {notif.status === 'accepted' && (
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                        ✓ Accepted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMER CALLBACK REQUESTS */}
        {activeTab === 'callbacks' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900">
              Customer Callback Inquiries
            </h2>

            {callbacks.length === 0 ? (
              <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-12 text-center text-stone-500 max-w-md mx-auto space-y-2">
                <PhoneCall className="w-12 h-12 mx-auto text-stone-400" />
                <h3 className="font-bold text-stone-800 text-base">No Callback Requests</h3>
                <p className="text-xs text-stone-500">
                  When collectors request a call from your store page, their contact details appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {callbacks.map(cb => (
                  <div
                    key={cb.id}
                    className="bg-[#FAF8F5] border-2 border-stone-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{cb.customerName}</span>
                        <span className="text-xs font-mono font-bold text-blue-700">{cb.customerPhone}</span>
                        <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full">
                          {cb.preferredTime || 'Anytime'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        Inquiry: "{cb.inquiry || 'Direct consult request'}"
                      </p>
                    </div>

                    <div>
                      {cb.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkCallbackResolved(cb.id)}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Mark Contacted
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-stone-400">Resolved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
          <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-stone-900">
              Add New Concrete Artwork (+15 Points)
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Basalt Monolith Incense Burner"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Title (Arabic)</label>
                <input
                  type="text"
                  value={newTitleAr}
                  onChange={e => setNewTitleAr(e.target.value)}
                  placeholder="e.g. مبخرة حجر البازلت المعمارية"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="mabkhara">Mabkhara (Incense)</option>
                    <option value="trays">Trays & Vessels</option>
                    <option value="planters">Planters</option>
                    <option value="lighting">Lighting & Lamps</option>
                    <option value="sculptures">Sculptures</option>
                    <option value="tableware">Tableware & Coasters</option>
                    <option value="bespoke">Bespoke</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Base Price (SAR)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newPriceSAR}
                    onChange={e => setNewPriceSAR(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newStock}
                    onChange={e => setNewStock(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={newDimensions}
                    onChange={e => setNewDimensions(e.target.value)}
                    placeholder="e.g. 20 x 20 x 8 cm"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Finish & Sealing</label>
                <input
                  type="text"
                  value={newFinish}
                  onChange={e => setNewFinish(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Select Image Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {CONCRETE_IMAGE_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setNewImageUrl(preset.url)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 h-16 transition ${
                        newImageUrl === preset.url ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-300 opacity-60'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-stone-900 text-white font-bold rounded-xl shadow-md"
                >
                  {submitting ? 'Listing...' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
