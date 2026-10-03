import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  Store,
  Product,
  Order,
  CustomRequest,
  UserProfile,
  MarketplaceSettings,
  Notification,
  StoreMessage,
  CallbackRequest,
} from '../types';
import { DEFAULT_MARKETPLACE_SETTINGS } from '../data/adminCodes';

const STORES_COLLECTION = 'stores';
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const NOTIFICATIONS_COLLECTION = 'notifications';
const CALLBACKS_COLLECTION = 'callbackRequests';
const REQUESTS_COLLECTION = 'customRequests';
const USERS_COLLECTION = 'users';
const SETTINGS_COLLECTION = 'settings';
const MARKETPLACE_SETTINGS_DOC = 'marketplace';

export const SUPER_ADMIN_EMAIL = 'mkoalla5@gmail.com';

// Ensure marketplace settings exist without inserting any dummy products or stores
export async function ensureMarketplaceSettings(): Promise<MarketplaceSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, MARKETPLACE_SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        ...DEFAULT_MARKETPLACE_SETTINGS,
        updatedAt: serverTimestamp(),
      });
      return DEFAULT_MARKETPLACE_SETTINGS;
    }
    return snap.data() as MarketplaceSettings;
  } catch (error) {
    console.warn('Using default marketplace settings:', error);
    return DEFAULT_MARKETPLACE_SETTINGS;
  }
}

// ---------------- MARKETPLACE GLOBAL SETTINGS ----------------
export async function getMarketplaceSettings(): Promise<MarketplaceSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, MARKETPLACE_SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MarketplaceSettings;
    }
    return DEFAULT_MARKETPLACE_SETTINGS;
  } catch (error) {
    return DEFAULT_MARKETPLACE_SETTINGS;
  }
}

export async function updateMarketplaceSettings(
  updates: Partial<MarketplaceSettings>
): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${MARKETPLACE_SETTINGS_DOC}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, MARKETPLACE_SETTINGS_DOC);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------- STORES / ATELIERS ----------------
export async function getAllStores(): Promise<Store[]> {
  try {
    const snap = await getDocs(collection(db, STORES_COLLECTION));
    return snap.docs.map(doc => doc.data() as Store);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, STORES_COLLECTION);
    return [];
  }
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  try {
    const snap = await getDoc(doc(db, STORES_COLLECTION, storeId));
    if (snap.exists()) {
      return snap.data() as Store;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${STORES_COLLECTION}/${storeId}`);
    return null;
  }
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  try {
    const q = query(collection(db, STORES_COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Store;
    }
    // Fallback: try by direct ID
    return await getStoreById(slug);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, STORES_COLLECTION);
    return null;
  }
}

export async function createStore(store: Omit<Store, 'createdAt' | 'updatedAt'>): Promise<Store> {
  const path = `${STORES_COLLECTION}/${store.id}`;
  try {
    const newStore: Store = {
      ...store,
      artisanPoints: store.artisanPoints ?? 100, // Starting reputation points
      rating: store.rating ?? 5.0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, STORES_COLLECTION, store.id), newStore);
    return newStore;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
  const path = `${STORES_COLLECTION}/${storeId}`;
  try {
    const docRef = doc(db, STORES_COLLECTION, storeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStore(storeId: string): Promise<void> {
  const path = `${STORES_COLLECTION}/${storeId}`;
  try {
    await deleteDoc(doc(db, STORES_COLLECTION, storeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- ARTISAN POINTS SYSTEM ----------------
export async function addArtisanPoints(
  artisanUid: string,
  storeId: string,
  pointsDelta: number
): Promise<void> {
  try {
    // Increment points on user profile
    const userRef = doc(db, USERS_COLLECTION, artisanUid);
    await updateDoc(userRef, {
      artisanPoints: increment(pointsDelta),
    });

    // Increment points on store document
    const storeRef = doc(db, STORES_COLLECTION, storeId);
    await updateDoc(storeRef, {
      artisanPoints: increment(pointsDelta),
    });
  } catch (e) {
    console.warn('Failed to update artisan points:', e);
  }
}

// ---------------- PRODUCTS ----------------
export async function getAllProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return snap.docs.map(doc => doc.data() as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    return [];
  }
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where('storeId', '==', storeId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    return [];
  }
}

export async function createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    const newProduct: Product = {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), newProduct);

    // Reward artisan with +15 engagement points for listing a handcrafted item!
    if (product.vendorId && product.storeId) {
      addArtisanPoints(product.vendorId, product.storeId, 15);
    }

    return newProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateProductPriceAndStock(
  productId: string,
  basePriceSAR: number,
  stock: number
): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      basePriceSAR,
      stock,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- TARGETED ORDERS & NOTIFICATIONS ----------------
export async function createTargetedOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  targetStore: Store
): Promise<Order> {
  const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${ORDERS_COLLECTION}/${orderId}`;

  try {
    const newOrder: Order = {
      ...order,
      id: orderId,
      storeId: targetStore.id,
      vendorId: targetStore.vendorId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, ORDERS_COLLECTION, orderId), newOrder);

    // 1. Send instant targeted alert to the specific Artisan
    const artisanNotifId = `notif_art_${Date.now()}`;
    const artisanNotification: Notification = {
      id: artisanNotifId,
      recipientId: targetStore.vendorId,
      recipientRole: 'artisan',
      storeId: targetStore.id,
      storeName: targetStore.name,
      title: `New Order: ${order.items[0]?.productTitle || 'Concrete Art'} (${order.currency} ${order.totalAmount})`,
      message: `${order.customerName} in ${order.city} ordered ${order.items.length} item(s). Click 'Accept Order' to claim and proceed.`,
      type: 'new_order',
      orderId: orderId,
      status: 'unread',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, artisanNotifId), artisanNotification);

    // 2. Simultaneously send a notification copy directly to the Super Admin
    const adminNotifId = `notif_admin_${Date.now()}`;
    const superAdminNotification: Notification = {
      id: adminNotifId,
      recipientId: 'superadmin',
      recipientRole: 'superadmin',
      storeId: targetStore.id,
      storeName: targetStore.name,
      title: `Platform Order Log: [${targetStore.name}]`,
      message: `Order #${orderId} placed for store "${targetStore.name}" (${order.currency} ${order.totalAmount}) by ${order.customerName}.`,
      type: 'new_order',
      orderId: orderId,
      status: 'unread',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, adminNotifId), superAdminNotification);

    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getArtisanOrders(vendorId: string, storeId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), where('storeId', '==', storeId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Order);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    return [];
  }
}

export async function getAllOrdersSuperAdmin(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    return snap.docs.map(doc => doc.data() as Order);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    return [];
  }
}

export async function acceptArtisanOrder(
  orderId: string,
  notificationId?: string,
  artisanUid?: string,
  storeId?: string
): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });

    if (notificationId) {
      await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
        status: 'accepted',
      });
    }

    // Award +50 Artisan Points for accepting and taking responsibility for an order!
    if (artisanUid && storeId) {
      addArtisanPoints(artisanUid, storeId, 50);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------- NOTIFICATIONS ----------------
export async function getArtisanNotifications(artisanUid: string): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', artisanUid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, NOTIFICATIONS_COLLECTION);
    return [];
  }
}

export async function getSuperAdminNotifications(): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientRole', '==', 'superadmin')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, NOTIFICATIONS_COLLECTION);
    return [];
  }
}

export function subscribeArtisanNotifications(
  artisanUid: string,
  callback: (notifs: Notification[]) => void
) {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('recipientId', '==', artisanUid)
  );
  return onSnapshot(
    q,
    snapshot => {
      const notifs = snapshot.docs.map(doc => doc.data() as Notification);
      callback(notifs);
    },
    error => {
      console.warn('Notification snapshot warning:', error);
    }
  );
}

// ---------------- REAL-TIME STORE MESSAGING (CHAT WITH STORE) ----------------
export async function sendStoreMessage(
  storeId: string,
  message: Omit<StoreMessage, 'id' | 'createdAt'>
): Promise<void> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${STORES_COLLECTION}/${storeId}/messages/${msgId}`;
  try {
    const newMsg: StoreMessage = {
      ...message,
      id: msgId,
      storeId,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, STORES_COLLECTION, storeId, 'messages', msgId), newMsg);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeStoreMessages(
  storeId: string,
  callback: (msgs: StoreMessage[]) => void
) {
  const messagesRef = collection(db, STORES_COLLECTION, storeId, 'messages');
  return onSnapshot(
    messagesRef,
    snapshot => {
      const msgs = snapshot.docs.map(doc => doc.data() as StoreMessage);
      // Sort in memory by timestamp
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
      });
      callback(msgs);
    },
    error => {
      console.warn('Store messages listener warning:', error);
    }
  );
}

// ---------------- CALLBACK REQUESTS ----------------
export async function createCallbackRequest(
  data: Omit<CallbackRequest, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  const reqId = `cb_${Date.now()}`;
  const path = `${CALLBACKS_COLLECTION}/${reqId}`;
  try {
    const newCb: CallbackRequest = {
      ...data,
      id: reqId,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, CALLBACKS_COLLECTION, reqId), newCb);

    // Notify artisan of callback request
    const notifId = `notif_cb_${Date.now()}`;
    const notification: Notification = {
      id: notifId,
      recipientId: data.storeId,
      recipientRole: 'artisan',
      storeId: data.storeId,
      storeName: data.storeName,
      title: `Callback Request: ${data.customerName}`,
      message: `${data.customerName} (${data.customerPhone}) requested a callback regarding: "${data.inquiry || 'Store inquiry'}". Preferred time: ${data.preferredTime || 'Anytime'}.`,
      type: 'callback_request',
      status: 'unread',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getStoreCallbackRequests(storeId: string): Promise<CallbackRequest[]> {
  try {
    const q = query(collection(db, CALLBACKS_COLLECTION), where('storeId', '==', storeId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as CallbackRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CALLBACKS_COLLECTION);
    return [];
  }
}

export async function updateCallbackRequestStatus(
  requestId: string,
  status: CallbackRequest['status']
): Promise<void> {
  const path = `${CALLBACKS_COLLECTION}/${requestId}`;
  try {
    await updateDoc(doc(db, CALLBACKS_COLLECTION, requestId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------- BESPOKE CUSTOM COMMISSIONS ----------------
export async function createCustomRequest(
  request: Omit<CustomRequest, 'id' | 'createdAt'>
): Promise<CustomRequest> {
  const reqId = `req_${Date.now()}`;
  const path = `${REQUESTS_COLLECTION}/${reqId}`;
  try {
    const newReq: CustomRequest = {
      ...request,
      id: reqId,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, REQUESTS_COLLECTION, reqId), newReq);
    return newReq;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getAllCustomRequests(): Promise<CustomRequest[]> {
  try {
    const snap = await getDocs(collection(db, REQUESTS_COLLECTION));
    return snap.docs.map(doc => doc.data() as CustomRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, REQUESTS_COLLECTION);
    return [];
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    return snap.docs.map(doc => doc.data() as Order);
  } catch (error) {
    return [];
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    return [];
  }
}

export async function setUserBanStatus(userId: string, isBanned: boolean): Promise<void> {
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), { isBanned });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateStoreStatus(storeId: string, status: Store['status']): Promise<void> {
  const path = `${STORES_COLLECTION}/${storeId}`;
  try {
    await updateDoc(doc(db, STORES_COLLECTION, storeId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateCustomRequestStatus(
  requestId: string,
  status: CustomRequest['status']
): Promise<void> {
  const path = `${REQUESTS_COLLECTION}/${requestId}`;
  try {
    await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

