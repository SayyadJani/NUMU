'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  ChevronDown,
  X,
  Code2,
  FileText,
  Trophy,
  Compass,
  User,
  Settings,
  LogOut,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { CharacterAvatar } from '@/components/ui/character-avatar';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { gamificationService } from '@/services/gamification.service';
import { notificationsService } from '@/services/notifications.service';
import type { Notification } from '@/types/notifications';

const SEARCH_ITEMS = [
  { id: 's1', title: 'Arrays & Two Pointers Curriculum', category: 'DSA Topic', link: '/dashboard/dsa?topic=arrays', icon: Compass },
  { id: 's2', title: 'Container With Most Water', category: 'DSA Problem', link: '/dashboard/dsa/problems/container-with-most-water', icon: Code2 },
  { id: 's3', title: 'Weekly DSA Assessment #1', category: 'Assessment', link: '/tests', icon: FileText },
  { id: 's4', title: '3Sum', category: 'DSA Problem', link: '/dashboard/dsa/problems/3sum', icon: Code2 },
  { id: 's5', title: 'Two Sum', category: 'DSA Problem', link: '/dashboard/dsa/problems/two-sum', icon: Code2 },
  { id: 's6', title: 'Fullstack SaaS Capstone', category: 'Project', link: '/dashboard/development', icon: FileText },
];

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelTitle, setLevelTitle] = useState('Level 1 Developer');
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const filteredSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEARCH_ITEMS.slice(0, 4);
    return SEARCH_ITEMS.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsUserMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;
    gamificationService
      .getSummary()
      .then((data) => {
        if (isMounted) {
          setStreak(data.streak.current);
          setLevelTitle(`Level ${data.level.current} Developer`);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const loadNotifications = React.useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount(),
      ]);
      setNotifs(list);
      setUnreadCount(count);
    } catch {
      // Fallback gracefully
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (isNotifOpen) {
      loadNotifications();
    }
  }, [isNotifOpen, loadNotifications]);

  const markAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Fallback
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationsService.markAsRead(n.id).catch(() => {});
      setNotifs((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsNotifOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 gap-3 sm:gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="shrink-0 flex items-center gap-2">
          <Logo size="sm" />
        </Link>

        {/* Interactive Search Bar with live autocomplete */}
        <div ref={searchRef} className="flex-1 max-w-lg relative">
          <div
            onClick={() => setIsSearchOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl border bg-slate-50 transition-all cursor-text ${
              isSearchOpen
                ? 'border-emerald-600 bg-white ring-2 ring-emerald-100'
                : 'border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search problems, topics, tests, contests..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 flex-1 w-full"
            />
            {searchQuery && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                {searchQuery ? 'Search Results' : 'Quick Jumps'}
              </div>
              <div className="space-y-1">
                {filteredSearch.length > 0 ? (
                  filteredSearch.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.link as React.ComponentProps<typeof Link>['href']}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/70 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-[#0b5c39] group-hover:text-white transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.category}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Jump ↗
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Streak Pill + Notification Bell + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Day Streak Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold cursor-default shadow-2xs"
            title={`${streak}-Day Streak! Consistency building.`}
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{streak}</span>
          </div>

          {/* Dark / Light Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-600" />
            )}
          </button>

          {/* Notification Bell with Popover */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                isNotifOpen
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Popover Card */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
                  {notifs.length > 0 ? (
                    notifs.slice(0, 6).map((n) => {
                      const content = (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            !n.isRead
                              ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                              : 'bg-white border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-900 mb-0.5">
                            <span className="truncate">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {n.description}
                          </p>
                        </div>
                      );

                      if (n.linkUrl) {
                        return (
                          <Link
                            key={n.id}
                            href={n.linkUrl as React.ComponentProps<typeof Link>['href']}
                            className="block"
                          >
                            {content}
                          </Link>
                        );
                      }
                      return content;
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <Link
                    href={'/dashboard/notifications' as React.ComponentProps<typeof Link>['href']}
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#0b5c39] flex items-center justify-center shadow-xs ring-1 ring-emerald-600/30">
                <CharacterAvatar type={user?.profile?.avatarUrl || 'male'} size="sm" className="w-full h-full" />
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-800">
                {user?.name || user?.username || 'Student'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Menu Modal / Card */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2.5 border-b border-slate-100 text-left">
                  <div className="text-xs font-bold text-slate-900">
                    {user?.name || user?.username || 'Student'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    @{user?.username || 'student'}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                    {levelTitle}
                  </div>
                </div>

                <div className="py-1 text-xs text-left">
                  <Link
                    href={(user?.username ? `/profile/${encodeURIComponent(user.username)}` : '/profile') as React.ComponentProps<typeof Link>['href']}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href={'/dashboard/leaderboard' as React.ComponentProps<typeof Link>['href']}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Leaderboard &amp; Rankings</span>
                  </Link>
                  <Link
                    href={(user?.username ? `/profile/${encodeURIComponent(user.username)}` : '/profile') as React.ComponentProps<typeof Link>['href']}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile &amp; Theme Settings</span>
                  </Link>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {isDark ? (
                        <Moon className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className="font-semibold">Dark Mode</span>
                    </span>
                    <span
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
                        isDark ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                          isDark ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      void logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
