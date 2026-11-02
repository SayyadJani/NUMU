'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/loading-state';

export function ProfileSkeleton() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-[#fbfcfd] animate-pulse">
      {/* ── Top Cover Banner Skeleton ── */}
      <div className="relative w-full h-44 sm:h-52 bg-slate-800 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end justify-between pb-4">
          <Skeleton className="w-48 h-6 bg-slate-700/60 rounded-full" />
          <div className="hidden sm:flex gap-2">
            <Skeleton className="w-24 h-6 bg-slate-700/60 rounded-md" />
            <Skeleton className="w-24 h-6 bg-slate-700/60 rounded-md" />
          </div>
        </div>
      </div>

      {/* ── 2-Column Main Skeleton Layout ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 pb-16 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-6">

          {/* Left Column Skeleton: Profile Card */}
          <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            {/* Avatar & Names */}
            <div className="flex flex-col items-center text-center">
              <Skeleton className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-3" />
              <Skeleton className="w-36 h-5 rounded-md mb-1.5" />
              <Skeleton className="w-24 h-3.5 rounded-md" />
            </div>

            {/* Badges / College */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="w-full h-4 rounded-md" />
              <Skeleton className="w-3/4 h-4 rounded-md" />
            </div>

            {/* Bio */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <Skeleton className="w-full h-3 rounded-md" />
              <Skeleton className="w-5/6 h-3 rounded-md" />
              <Skeleton className="w-4/6 h-3 rounded-md" />
            </div>

            {/* Edit Button */}
            <Skeleton className="w-full h-9 rounded-xl" />

            {/* Social Links */}
            <div className="flex justify-center gap-3 pt-3 border-t border-slate-100">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <section className="flex-1 min-w-0 w-full space-y-6">
            {/* Quick KPI Stats Bar (5 cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-2">
                  <Skeleton className="w-16 h-3 rounded-md" />
                  <Skeleton className="w-12 h-6 rounded-md" />
                </div>
              ))}
            </div>

            {/* Tabs Nav Skeleton */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 flex gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 flex-1 rounded-lg" />
              ))}
            </div>

            {/* Content Card Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <Skeleton className="w-40 h-5 rounded-md" />
              <Skeleton className="w-full h-32 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
