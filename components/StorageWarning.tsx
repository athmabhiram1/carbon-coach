"use client";

import { useState, useEffect } from "react";
import { isStorageBlocked } from "@/lib/storage";

export default function StorageWarning() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(isStorageBlocked());
  }, []);

  if (!blocked) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400"
    >
      {"\u26A0\uFE0F"} localStorage is unavailable. Your data will not persist after you close the tab.
    </div>
  );
}
