"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { StatChips } from "@/components/leaderboard/StatChips";
import { SortControls } from "@/components/leaderboard/SortControls";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export default function LeaderboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  
  const {
    entries,
    totalCount,
    loading,
    error,
    sortKey,
    page,
    perPage,
    currentAnonymousId,
    userRankInfo,
    loadingMore,
    hasMore,
    handleSortChange,
    handleLoadMore,
    retry,
  } = useLeaderboard(user, authLoading);

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden font-body-base flex flex-col justify-between" role="main">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrUNlExDcUZIh3XCXqcvrXzoeWQU4Zx6fKaCmhgDUNdMBYGzSxT15SZfbtr5uRgWf75tFH7KlJXEhzNeIrZforhqzE5u7j_FQMlYlivXlHpG48QbPy6TFbcdTYDlvDs7vC1xNjK-OZYhUNt9XvfG4FqZruZzX1Y_hcwByON2Z2oHlzK05b7XRN3FIE_OWpHocAhcVH2dYiriL9i8XPEMxSa6GbVkS-EHoz7nOyDshwXH7d4wKSrTCM_WGZ1CUXvGj9AH6PzrJ6TbgP')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 pt-[140px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-8 flex-grow">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center gap-4 fade-in-rise">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest/50 backdrop-blur-md border border-white/5 shadow-md">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase text-[10px]">
              Global Standing
            </span>
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-none">
            Carbon Coach <span className="font-editorial-italic text-editorial-italic text-primary">Leaderboard</span>
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
            See where you stand among our global community of stewards. Every reduction counts towards our collective future.
          </p>

          <StatChips totalCount={totalCount} />
        </header>

        <SortControls sortKey={sortKey} onSortChange={handleSortChange} />

        <LeaderboardTable
          entries={entries}
          user={user}
          currentAnonymousId={currentAnonymousId}
          page={page}
          perPage={perPage}
          loading={loading}
          error={error}
          hasMore={hasMore}
          loadingMore={loadingMore}
          userRankInfo={userRankInfo}
          onLoadMore={handleLoadMore}
          onRetry={retry}
        />
      </div>

      <Footer />
    </main>
  );
}
