"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface AnonymousGateProps {
  children: React.ReactNode;
}

export function AnonymousGate({ children }: AnonymousGateProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.push("/dashboard");
    } else {
      setChecking(false);
    }
  }, [user, isLoading, router]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-body-base">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">LOADING</p>
      </div>
    );
  }

  return <>{children}</>;
}
