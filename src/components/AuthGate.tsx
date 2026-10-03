import React, { useState } from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { ConcreteVaseDecor } from './ConcreteVaseDecor';
import { Shield, Sparkles, Store, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthGate: React.FC<{
  onAuthSuccess?: () => void;
}> = ({ onAuthSuccess }) => {
  const { signInWithEmail, signUpCustomer, signUpArtisan, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [accountType, setAccountType] = useState<'customer' | 'artisan'>('customer');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Artisan Specific Fields
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [city, setCity] = useState('Riyadh');
  const [country, setCountry] = useState<'Saudi Arabia' | 'UAE' | 'Egypt'>('Saudi Arabia');
  const [description, setDescription] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSlugAutoFill = (name: string) => {
    setStoreName(name);
    if (!storeSlug || storeSlug === storeName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setStoreSlug(generated);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await signInWithEmail(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in. Please verify your email and password.');
    } else {
      if (onAuthSuccess) onAuthSuccess();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (accountType === 'customer') {
      const res = await signUpCustomer(email, password, displayName);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to register account.');
      } else {
        if (onAuthSuccess) onAuthSuccess();
      }
    } else {
      // Artisan Registration
      if (!storeName.trim()) {
        setErrorMsg('Please enter your Atelier / Store Name.');
        setLoading(false);
        return;
      }
      if (!storeSlug.trim() || storeSlug.length < 3) {
        setErrorMsg('Store URL handle must be at least 3 characters.');
        setLoading(false);
        return;
      }

      const res = await signUpArtisan(email, password, displayName, {
        storeName: storeName.trim(),
        storeSlug: storeSlug.trim(),
        city,
        country,
        description: description.trim() || 'Artisanal hand-cast concrete and sculptural brutalist homeware.',
      });

      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create artisan store.');
      } else {
        if (onAuthSuccess) onAuthSuccess();
      }
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Google sign-in was cancelled or failed.');
    } else {
      if (onAuthSuccess) onAuthSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F5F0] text-stone-900 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Background Decorative Minimalist Brutalist Concrete Vases */}
      <div className="absolute top-0 left-0 p-8 pointer-events-none opacity-40 hidden md:block">
        <ConcreteVaseDecor variant="sculptural" className="w-56 h-80" />
      </div>
      <div className="absolute bottom-0 right-0 p-8 pointer-events-none opacity-40 hidden md:block">
        <ConcreteVaseDecor variant="fluted" className="w-64 h-88" />
      </div>
      <div className="absolute top-1/3 right-8 pointer-events-none opacity-25 hidden xl:block">
        <ConcreteVaseDecor variant="stepped" className="w-48 h-64" />
      </div>

      <div className="relative w-full max-w-xl my-auto">
        {/* Soft Brutalist Monolithic Card */}
        <div className="bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Top Brand Banner */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-stone-300 bg-[#EDE6DE] p-1">
              <img
                src="/logo.svg"
                alt="QALB AL Kharasana by pryzm empire"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
                By pryzm empire
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                QALB AL <span className="font-normal text-stone-600">Kharasana</span>
              </h1>
              <p className="text-xs text-stone-500 max-w-sm mt-1">
                Authentic Concrete Home Art, Terrazzo & Sculptural Homeware Across the Arab World.
              </p>
            </div>
          </div>

          {/* Mode Tabs: Sign In / Create Account */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/70 rounded-2xl mb-6 text-xs font-bold border border-stone-300/80">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-stone-900 text-stone-50 shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-stone-900 text-stone-50 shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="artisan@qalb.art"
                    className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-stone-50 font-extrabold text-sm rounded-xl transition shadow-lg shadow-stone-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Marketplace'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-300"></div>
                <span className="flex-shrink mx-3 text-stone-400 text-[11px] font-semibold uppercase">Or</span>
                <div className="flex-grow border-t border-stone-300"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Select Your Account Role:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setAccountType('customer')}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center text-center gap-1.5 ${
                      accountType === 'customer'
                        ? 'border-stone-900 bg-stone-100 text-stone-900 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    <User className="w-5 h-5 text-stone-800" />
                    <div>
                      <div className="font-bold text-xs">Customer / Buyer</div>
                      <div className="text-[10px] text-stone-500">Collect & Order Art</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setAccountType('artisan')}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center text-center gap-1.5 ${
                      accountType === 'artisan'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    <Store className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-xs text-blue-900">Artisan / Atelier</div>
                      <div className="text-[10px] text-blue-700">Dedicated Storefront</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>

              {/* Artisan Dedicated Setup Fields */}
              {accountType === 'artisan' && (
                <div className="p-4 bg-stone-100/90 border border-stone-300 rounded-2xl space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dedicated Atelier Microsite Setup</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Atelier / Store Name
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={e => handleSlugAutoFill(e.target.value)}
                      placeholder="e.g. Sahar Concrete Studio"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Unique Public Storefront URL
                    </label>
                    <div className="flex items-center bg-white border border-stone-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
                      <span className="px-3 text-xs text-stone-400 font-mono bg-stone-50 border-r border-stone-200 py-2">
                        /stores/
                      </span>
                      <input
                        type="text"
                        required
                        value={storeSlug}
                        onChange={e =>
                          setStoreSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '-')
                          )
                        }
                        placeholder="sahar-studio"
                        className="w-full px-3 py-2 text-stone-900 text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      This becomes your isolated public microsite: <span className="font-mono text-blue-600 font-semibold">/stores/{storeSlug || 'your-handle'}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Country
                      </label>
                      <select
                        value={country}
                        onChange={e => setCountry(e.target.value as any)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none"
                      >
                        <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                        <option value="UAE">UAE (Dubai/Abu Dhabi)</option>
                        <option value="Egypt">Egypt (Cairo/Alex)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Riyadh"
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Artisan Craft Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Specializing in mineral-pigmented brutalist incense burners, terrazzo coffee tables..."
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-extrabold text-sm rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                  accountType === 'artisan'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-stone-900/10'
                }`}
              >
                {loading
                  ? 'Creating Account...'
                  : accountType === 'artisan'
                  ? 'Launch Artisan Atelier (+100 Points)'
                  : 'Create Customer Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Bottom Security Assurance */}
          <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Strict Login Wall Active
            </span>
            <span>Firebase Secure Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
