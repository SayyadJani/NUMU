'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Code2,
  Monitor,
  FileText,
  BookMarked,
  Trophy,
  Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'DSA', href: '/dashboard/dsa', icon: Code2 },
  { label: 'Development', href: '/dashboard/development', icon: Monitor },
  { label: 'Tests', href: '/dashboard/tests', icon: FileText },
  { label: 'Notes', href: '/dashboard/notes', icon: BookMarked },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] w-[200px] bg-white border-r border-slate-200/80 flex flex-col z-30">
      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href as React.ComponentProps<typeof Link>['href']}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {label}
            </Link>
          );
        })}

        {/* Notifications — highlighted */}
        <div className="pt-1">
          <Link
            href={'/dashboard/notifications' as React.ComponentProps<typeof Link>['href']}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-[18px] h-[18px] text-emerald-700" />
              <span className="text-sm font-semibold text-emerald-800">Notifications</span>
            </div>
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
              9
            </span>
          </Link>
        </div>
      </nav>

      {/* Keep Learning card */}
      <div className="px-3 pb-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Keep Learning!</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
            Small steps every day lead to big results.
          </p>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-[40%] bg-emerald-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">v1.0.0</span>
        <span className="text-[10px] text-slate-500 font-bold">NUMU</span>
      </div>
    </aside>
  );
}
