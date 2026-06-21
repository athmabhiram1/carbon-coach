"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { AuthButton } from "./AuthButton";
import { User, ShieldAlert } from "lucide-react";
import { useState } from "react";

export function UserProfile() {
  const { user, profile, isAnonymous } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const displayName = user
    ? profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || "Eco Warrior"
    : "Anonymous Steward";

  const avatarUrl = user
    ? profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    : null;

  return (
    <div className="relative font-body-base">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/40 border border-white/5 shadow-md hover:bg-surface-container-highest/60 transition-all"
        aria-label="User profile menu"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-primary/20 text-primary">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="text-xs font-semibold text-on-surface truncate max-w-[100px] hidden sm:inline">
          {displayName}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-highest/95 backdrop-blur-xl border border-white/10 shadow-2xl p-4 z-50 flex flex-col gap-3 fade-in">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-on-surface truncate">{displayName}</span>
            <span className="text-[10px] text-on-surface-variant mt-0.5">
              {user ? user.email : "Local Offline Account"}
            </span>
          </div>

          <div className="h-px bg-white/5 w-full" />

          {isAnonymous && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] leading-normal">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Sign in to save your footprint history across devices.</span>
            </div>
          )}

          <div className="flex justify-end mt-1">
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}
