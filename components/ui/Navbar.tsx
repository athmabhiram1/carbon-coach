"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/auth/UserProfile";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "How It Works", href: "/how-it-works" },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max rounded-full bg-surface-container/60 backdrop-blur-xl border-t border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 px-8 py-3 flex justify-between items-center font-body-base">
      <Link href="/" className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2 outline-none">
        <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        Carbon Coach
      </Link>

      {/* Desktop navigation */}
      <div className="hidden md:flex gap-8 items-center font-body-base text-body-base">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-on-surface-variant hover:text-primary transition-all duration-300 font-medium scale-95 active:scale-90",
                isActive && "text-primary border-b-2 border-primary pb-0.5"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="hidden md:block">
        <UserProfile />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-on-surface hover:text-primary transition-colors focus:outline-none"
        aria-expanded={isOpen}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-0 top-[60px] bg-background/95 backdrop-blur-xl z-40 flex flex-col p-8 gap-6 md:hidden transition-transform duration-300 ease-in-out border-t border-white/5",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-2xl text-on-surface-variant hover:text-primary transition-colors py-2 border-b border-white/5",
                isActive && "text-primary font-bold"
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="mt-4 flex justify-center">
          <UserProfile />
        </div>
      </div>
    </nav>
  );
}
