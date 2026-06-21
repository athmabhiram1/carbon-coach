"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Github, Globe } from "lucide-react";
import { useState } from "react";

export function AuthButton() {
  const { user, signInWithOAuth, signOut } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setLoading(provider);
      await signInWithOAuth(provider);
    } catch (err) {
      console.error("Sign-in failed:", err);
      setLoading(null);
    }
  };

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut()}
        className="flex items-center gap-2 border-white/10 text-on-surface hover:bg-surface-container-highest/20"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => handleSignIn("github")}
        className="flex items-center gap-2 border-white/10 text-on-surface hover:bg-surface-container-highest/20"
      >
        <Github className="w-4 h-4" />
        {loading === "github" ? "Connecting..." : "GitHub"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => handleSignIn("google")}
        className="flex items-center gap-2 border-white/10 text-on-surface hover:bg-surface-container-highest/20"
      >
        <Globe className="w-4 h-4" />
        {loading === "google" ? "Connecting..." : "Google"}
      </Button>
    </div>
  );
}
