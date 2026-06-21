"use client";

import { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    setOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 z-50 flex w-full items-center justify-center gap-2 bg-amber-500/90 px-4 py-2 text-sm font-medium text-slate-900 backdrop-blur-sm"
    >
      <span aria-hidden="true">{"\u26A0\uFE0F"}</span>
      <span>You&apos;re offline. Calculator still works. AI coach will reconnect when you&apos;re back online.</span>
    </div>
  );
}
