import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole, Store } from '../types';
import { createStore, getStoreById, getStoreBySlug } from '../services/storeService';

// STRICT SUPER ADMIN EMAIL - Only this email has Super Admin privileges
export const SUPER_ADMIN_EMAIL = 'mkoalla5@gmail.com';

interface ArtisanSignUpData {
  storeName: string;
  storeSlug: string;
  city: string;
  country: 'Saudi Arabia' | 'UAE' | 'Egypt';
  description: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  userStore: Store | null;
  setUserStore: (store: Store | null) => void;
  refreshUserStore: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpCustomer: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signUpArtisan: (email: string, pass: string, displayName: string, storeData: ArtisanSignUpData) => Promise<{ success: boolean; error?: string; store?: Store }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isVendorOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('qalb_auth_profile');
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile;
        if (parsed.role === 'superadmin' && parsed.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
          parsed.role = 'customer';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [userStore, setUserStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile to localStorage with security sanitization
  useEffect(() => {
    if (currentUser) {
      const sanitized = { ...currentUser };
      if (sanitized.role === 'superadmin' && sanitized.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        sanitized.role = 'customer';
      }
      localStorage.setItem('qalb_auth_profile', JSON.stringify(sanitized));
    } else {
      localStorage.removeItem('qalb_auth_profile');
    }
  }, [currentUser]);

  // Fetch store if user is an artisan / store admin
  const refreshUserStore = async () => {
    if ((currentUser?.role === 'admin' || currentUser?.role === 'vendor') && currentUser.storeId) {
      const store = await getStoreById(currentUser.storeId);
      setUserStore(store);
    } else if ((currentUser?.role === 'admin' || currentUser?.role === 'vendor') && currentUser?.storeSlug) {
      const store = await getStoreBySlug(currentUser.storeSlug);
      setUserStore(store);
    } else {
      setUserStore(null);
    }
  };

  const refreshUserProfile = async () => {
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          setCurrentUser(snap.data() as UserProfile);
        }
      } catch (e) {
        console.warn('Could not refresh profile:', e);
      }
    }
  };

  useEffect(() => {
    if (currentUser?.storeId || currentUser?.storeSlug) {
      refreshUserStore();
    }
  }, [currentUser?.storeId, currentUser?.storeSlug]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          
          const isSuperAdminEmail = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            
            // STRICT SECURITY ENFORCEMENT:
            if (isSuperAdminEmail) {
              if (profile.role !== 'superadmin') {
                profile.role = 'superadmin';
                await setDoc(userDocRef, { ...profile, role: 'superadmin' }, { merge: true });
              }
            } else {
              if (profile.role === 'superadmin') {
                profile.role = profile.storeId ? 'admin' : 'customer';
                await setDoc(userDocRef, { ...profile, role: profile.role }, { merge: true });
              }
            }
            setCurrentUser(profile);
          } else {
            // New user registration flow
            const newRole: UserRole = isSuperAdminEmail ? 'superadmin' : 'customer';

            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Artisan Guest',
              role: newRole,
              artisanPoints: newRole === 'superadmin' ? 500 : 0,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            
            if (isSuperAdminEmail) {
              await setDoc(doc(db, 'admins', user.uid), {
                id: user.uid,
                email: user.email,
                role: 'superadmin',
                createdAt: serverTimestamp(),
              });
            }
            setCurrentUser(newProfile);
          }
        } catch (e) {
          console.warn('Error fetching user profile:', e);
        }
      } else {
        setCurrentUser(null);
        setUserStore(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard Email/Password Sign In
  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true };
    } catch (err: any) {
      let msg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a moment and try again.';
      }
      return { success: false, error: msg };
    }
  };

  // Standard Email/Password Customer Registration
  const signUpCustomer = async (
    email: string,
    pass: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const isSuper = email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      try {
        await updateProfile(cred.user, { displayName });
      } catch {}

      const userProfile: UserProfile = {
        id: cred.user.uid,
        email: email.trim(),
        displayName: displayName || 'Customer Collector',
        role: isSuper ? 'superadmin' : 'customer',
        artisanPoints: 0,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), userProfile);
      setCurrentUser(userProfile);
      return { success: true };
    } catch (err: any) {
      let msg = err.message || 'Failed to create customer account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      return { success: false, error: msg };
    }
  };

  // Standard Email/Password Artisan Registration with Storefront Generation
  const signUpArtisan = async (
    email: string,
    pass: string,
    displayName: string,
    storeData: ArtisanSignUpData
  ): Promise<{ success: boolean; error?: string; store?: Store }> => {
    const cleanSlug = storeData.storeSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    if (!cleanSlug || cleanSlug.length < 3) {
      return { success: false, error: 'Store URL slug must be at least 3 characters (e.g. riyadh-brutalist).' };
    }

    // Check if store slug already taken
    const existing = await getStoreBySlug(cleanSlug);
    if (existing) {
      return {
        success: false,
        error: `Store URL /stores/${cleanSlug} is already registered by another artisan. Please choose a unique name.`,
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);

      try {
        await updateProfile(cred.user, { displayName });
      } catch {}

      // Create Store in Firestore
      const newStore = await createStore({
        id: cleanSlug,
        slug: cleanSlug,
        name: storeData.storeName.trim(),
        vendorId: cred.user.uid,
        vendorEmail: email.trim(),
        description: storeData.description.trim(),
        city: storeData.city.trim(),
        country: storeData.country,
        status: 'active',
        rating: 5.0,
        artisanPoints: 100, // Starting bonus points
        logoUrl: '/logo.svg',
        bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      });

      // Create User Profile with role: 'admin'
      const userProfile: UserProfile = {
        id: cred.user.uid,
        email: email.trim(),
        displayName: displayName || storeData.storeName,
        role: 'admin',
        storeId: newStore.id,
        storeSlug: cleanSlug,
        artisanPoints: 100,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), userProfile);

      setCurrentUser(userProfile);
      setUserStore(newStore);

      return { success: true, store: newStore };
    } catch (err: any) {
      let msg = err.message || 'Failed to create artisan account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already in use. Please sign in or use another email.';
      }
      return { success: false, error: msg };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setCurrentUser(null);
    setUserStore(null);
  };

  const isSuperAdmin =
    (currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
     firebaseUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) &&
    currentUser?.role === 'superadmin';

  const isVendorOrAdmin =
    (currentUser?.role === 'admin' || currentUser?.role === 'vendor') &&
    Boolean(currentUser?.storeId || userStore);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        userStore,
        setUserStore,
        refreshUserStore,
        refreshUserProfile,
        signInWithEmail,
        signUpCustomer,
        signUpArtisan,
        signInWithGoogle,
        logout,
        isSuperAdmin,
        isVendorOrAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
