"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import Link from "next/link";

export function AuthButton() {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut()}
        className="w-full flex items-center justify-center gap-2 border-white/10 text-on-surface hover:bg-surface-container-highest/20 py-2.5 rounded-xl text-xs font-semibold"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <Link href="/auth/sign-in" className="w-full">
      <Button
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center gap-2 border-white/10 text-on-surface hover:bg-surface-container-highest/20 py-2.5 rounded-xl text-xs font-semibold"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </Link>
  );
}
