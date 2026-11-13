'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { NAV_LINKS } from '@/data/landing-data';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/loading-state';

const RESOURCE_ITEMS = [
  { title: 'Curated DSA Sheets', desc: 'Top 150 interview patterns & problems', href: '/dashboard/dsa' },
  { title: 'Development Tracks', desc: 'Fullstack, Frontend & Backend roadmaps', href: '/dashboard/development' },
  { title: 'Placement Mock Tests', desc: 'Timed company-specific test assessments', href: '/tests' },
  { title: 'System Architecture', desc: 'Design guides, caching & database tips', href: '/dashboard/development' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [resourcesOpen, setResourcesOpen] = React.useState(false);
  const resourcesRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const isLinkActive = React.useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#') || href.startsWith('#')) return false;
    return pathname.startsWith(href);
  }, [pathname]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMobileOpen(false);
      success('You have been signed out successfully.', 'Signed Out');
    } catch {
      error('Failed to sign out. Please try again.');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-lg border-b border-slate-200/70 shadow-sm" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* ── Left: Logo ── */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Logo size="md" />
          </Link>

          {/* ── Centre: Nav links (desktop) ── */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);

              if (link.hasDropdown) {
                return (
                  <div key={link.label} className="relative" ref={resourcesRef}>
                    <button
                      type="button"
                      onClick={() => setResourcesOpen((v) => !v)}
                      className={`
                        relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium
                        transition-all duration-150 cursor-pointer
                        ${resourcesOpen
                          ? 'text-[#0b5c39] bg-emerald-50/80 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }
                      `}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
                          resourcesOpen ? 'rotate-180 text-[#0b5c39]' : ''
                        }`}
                      />
                    </button>

                    {/* Resources Dropdown Popover */}
                    {resourcesOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Learning Resources &amp; Guides
                        </div>
                        <div className="space-y-1 pt-1">
                          {RESOURCE_ITEMS.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href as React.ComponentProps<typeof Link>['href']}
                              onClick={() => setResourcesOpen(false)}
                              className="block px-3 py-2.5 rounded-xl hover:bg-emerald-50/70 group transition-all"
                            >
                              <div className="text-xs font-bold text-slate-800 group-hover:text-[#0b5c39] transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-500 leading-snug">
                                {item.desc}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href as React.ComponentProps<typeof Link>['href']}
                  className={`
                    relative flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13px] font-medium
                    transition-all duration-150
                    ${active
                      ? 'text-[#0b5c39] bg-emerald-50/90 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Search + Auth ── */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Search pill */}
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 w-52 lg:w-60 hover:border-slate-300 hover:bg-white transition-all cursor-pointer group"
            >
              <Search className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-slate-600" />
              <span className="text-xs text-slate-400 flex-1 select-none">Search...</span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] bg-white border border-slate-200 text-slate-400 rounded px-1.5 py-0.5 shadow-xs">
                ⌘K
              </kbd>
            </Link>

            {/* Live Auth state */}
            {loading ? (
              <div className="hidden sm:flex items-center gap-2">
                <Skeleton className="w-16 h-8 rounded-lg" />
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
            ) : isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none cursor-pointer"
                  aria-label="User navigation menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                    {user.name ? user.name[0] : (user.username ? user.username[0] : 'U')}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name || user.username || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200/80 shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {user.name || user.username}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                        {user.role}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                      Dashboard
                    </Link>

                    <Link
                      href={user.username ? `/profile/${encodeURIComponent(user.username)}` : '/profile'}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isDark}
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {isDark ? (
                          <Moon className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>Dark Mode</span>
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

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="lg:hidden relative bg-white border-t border-slate-200/70 px-4 pb-4 pt-2 shadow-lg">
          <nav className="flex flex-col gap-1 mb-4">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href as React.ComponentProps<typeof Link>['href']}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-[#0b5c39] bg-emerald-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-40" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-200">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name ? user.name[0] : (user.username ? user.username[0] : 'U')}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate">{user.name || user.username}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{user.role}</div>
                  </div>
                </div>
                <Link
                  href={user.username ? `/profile/${encodeURIComponent(user.username)}` : '/profile'}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    My Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-center text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-center">Log in</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full justify-center">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
