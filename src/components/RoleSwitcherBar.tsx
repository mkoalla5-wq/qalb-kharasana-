import React from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { Shield, User, Store, LogOut, Award } from 'lucide-react';

export const RoleSwitcherBar: React.FC<{
  onOpenVendorSignup: () => void;
  onOpenSuperAdminModal: () => void;
}> = ({ onOpenVendorSignup, onOpenSuperAdminModal }) => {
  const { currentUser, userStore, isSuperAdmin, logout } = useAuth();

  if (!currentUser) return null;

  const role = currentUser.role || 'customer';

  return (
    <div className="bg-[#EDE8E1] text-stone-800 text-[11px] border-b border-stone-300 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 font-sans select-none">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-stone-500 font-medium">Authenticated Account:</span>
        <span className="font-bold text-stone-900 font-mono truncate max-w-[200px]">
          {currentUser.email}
        </span>

        <span
          className={`px-2 py-0.2 rounded-full font-extrabold uppercase text-[9px] border ${
            role === 'superadmin'
              ? 'bg-red-100 text-red-900 border-red-300'
              : role === 'admin' || role === 'vendor'
              ? 'bg-blue-100 text-blue-900 border-blue-300'
              : 'bg-stone-200 text-stone-800 border-stone-300'
          }`}
        >
          {role === 'admin' ? 'Artisan / Store Admin' : role}
        </span>

        {userStore && (
          <span className="text-stone-600 hidden sm:inline">
            • Atelier: <span className="font-bold text-stone-900">{userStore.name}</span> (/stores/{userStore.slug})
          </span>
        )}

        {currentUser.artisanPoints !== undefined && currentUser.artisanPoints > 0 && (
          <span className="flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-900 font-bold px-2 py-0.2 rounded-full text-[10px]">
            <Award className="w-3 h-3 text-amber-700" />
            <span>{currentUser.artisanPoints} Artisan Points</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isSuperAdmin && (
          <button
            onClick={onOpenSuperAdminModal}
            className="px-2.5 py-0.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-lg text-[10px] cursor-pointer shadow-xs transition"
          >
            Super Admin Controls
          </button>
        )}

        <button
          onClick={logout}
          className="text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1 cursor-pointer transition text-[10px]"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
