'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { notificationsService } from '@/services/notifications.service';
import {
  Home,
  FileText,
  BookMarked,
  Trophy,
  Bell,
  ChevronUp,
  ChevronDown,
  Hexagon,
} from 'lucide-react';

type NextLinkHref = React.ComponentProps<typeof Link>['href'];

interface PracticeItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

const PRACTICE_ITEMS: PracticeItem[] = [
  { label: 'DSA', href: '/dashboard/dsa' },
  { label: 'Development', href: '/dashboard/development' },
  { label: 'System Design', href: '/dashboard/system-design' },
  {
    label: 'Core',
    href: '/dashboard/core',
    subItems: [
      { label: 'DBMS & SQL', href: '/dashboard/core?subject=dbms' },
      { label: 'Operating Systems', href: '/dashboard/core?subject=os' },
      { label: 'Computer Networks', href: '/dashboard/core?subject=cn' },
      { label: 'OOPs Concepts', href: '/dashboard/core?subject=oops' },
    ],
  },
];

const OTHER_NAV_ITEMS = [
  { label: 'Tests', href: '/dashboard/tests', icon: FileText },
  { label: 'Notes', href: '/dashboard/notes', icon: BookMarked },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [practiceOpen, setPracticeOpen] = useState(true);
  const [coreOpen, setCoreOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    notificationsService
      .getUnreadCount()
      .then((count) => {
        if (isMounted) setUnreadCount(count);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const isPracticeActive = PRACTICE_ITEMS.some((item) =>
    pathname.startsWith(item.href),
  );

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] w-[200px] bg-white border-r border-slate-200/80 flex flex-col z-30 select-none">
      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 no-scrollbar">
        {/* 1. Home */}
        <Link
          href={'/dashboard' as NextLinkHref}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
            pathname === '/dashboard'
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Home
            className={`w-[18px] h-[18px] shrink-0 transition-colors ${
              pathname === '/dashboard'
                ? 'text-emerald-700'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span>Home</span>
        </Link>

        {/* 2. Collapsible Practice Tree Group (DSA, Development, System Design, Core) */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setPracticeOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
              isPracticeActive
                ? 'text-emerald-800 bg-emerald-50/60'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-[18px] h-[18px] shrink-0">
                <Hexagon
                  className={`w-[18px] h-[18px] transition-colors ${
                    isPracticeActive
                      ? 'text-emerald-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span
                  className={`absolute text-[8px] font-black leading-none ${
                    isPracticeActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  ‹
                </span>
              </div>
              <span>Practice</span>
            </div>
            {practiceOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            )}
          </button>

          {/* Tree Branch Items */}
          {practiceOpen && (
            <div className="relative ml-[21px] mt-1 pl-3.5 space-y-0.5">
              {PRACTICE_ITEMS.map((item, idx) => {
                const isLast = idx === PRACTICE_ITEMS.length - 1;
                const isActive = pathname.startsWith(item.href);
                const hasSub = Boolean(item.subItems && item.subItems.length > 0);

                return (
                  <div key={item.label} className="relative">
                    {/* Vertical trunk line segment */}
                    {!isLast && (
                      <span
                        className="absolute -left-3.5 top-0 bottom-0 w-px bg-slate-300/80 dark:bg-slate-700"
                        aria-hidden="true"
                      />
                    )}
                    {isLast && (
                      <span
                        className="absolute -left-3.5 top-0 h-4 w-px bg-slate-300/80 dark:bg-slate-700"
                        aria-hidden="true"
                      />
                    )}

                    {/* Curved elbow connector (╰─) */}
                    <span
                      className="absolute -left-3.5 top-1 w-3 h-3.5 border-l border-b border-slate-300/80 dark:border-slate-700 rounded-bl-lg pointer-events-none"
                      aria-hidden="true"
                    />

                    <div className="flex items-center justify-between rounded-lg transition-colors">
                      <Link
                        href={item.href as NextLinkHref}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[13px] transition-colors truncate ${
                          isActive
                            ? 'text-emerald-700 font-bold bg-emerald-50/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        {item.label}
                      </Link>

                      {hasSub && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCoreOpen((prev) => !prev);
                          }}
                          className="p-1 mr-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Toggle Core CS subjects"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              coreOpen ? 'rotate-180 text-emerald-600' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Optional nested sub-items under Core */}
                    {hasSub && coreOpen && (
                      <div className="relative ml-3 mt-0.5 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5">
                        {item.subItems!.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href as NextLinkHref}
                            className="block py-1 px-2 rounded-md text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-slate-50 transition-colors truncate"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Other Top-Level Items (Tests, Notes, Leaderboard) */}
        {OTHER_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href as NextLinkHref}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* 4. Notifications */}
        <div className="pt-1">
          <Link
            href={'/dashboard/notifications' as NextLinkHref}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
              pathname.startsWith('/dashboard/notifications')
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell
                className={`w-[18px] h-[18px] ${
                  pathname.startsWith('/dashboard/notifications')
                    ? 'text-emerald-700'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="text-sm">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
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
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-[50%] bg-emerald-500 rounded-full" />
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
