'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * DashboardShell
 *
 * Responsively renders the global dashboard layout (fixed sidebar + header).
 * Automatically detects problem-solving practice sessions (/dashboard/dsa/problems/[slug])
 * and disables the sidebar and global top header to provide a 100% full-screen,
 * distraction-free practice environment.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  // Active problem-solving session: e.g. /dashboard/dsa/problems/two-sum
  // Note: /dashboard/dsa/problems is the catalog list, which keeps the sidebar
  const isPracticeSession =
    pathname.startsWith('/dashboard/dsa/problems/') &&
    pathname !== '/dashboard/dsa/problems';

  if (isPracticeSession) {
    return (
      <main className="w-full h-screen max-h-screen overflow-hidden bg-white">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f8] flex">
      {/* ── Persistent Sidebar (fixed, 200px wide) ── */}
      <DashboardSidebar />

      {/* ── Main content area offset by sidebar width ── */}
      <div className="flex-1 flex flex-col ml-[200px] min-w-0">
        {/* Persistent top navbar (fixed, clears sidebar) */}
        <DashboardHeader />

        {/* Child Pages mount inside the content area below header (pt-14 = 56px) */}
        <div className="flex-1 flex flex-col min-h-0 pt-14">
          {children}
        </div>
      </div>
    </div>
  );
}
