'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Code2,
  Cpu,
  Database,
  FileCheck2,
  Laptop,
  Menu,
  Moon,
  NotebookPen,
  Sun,
  Trophy,
  X,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

type Href = React.ComponentProps<typeof Link>['href'];

const MENUS = [
  {
    label: 'Practice Tracks',
    items: [
      {
        title: 'DSA Curriculum',
        desc: 'Expandable topic accordions & Judge0 IDE',
        href: '/dashboard/dsa',
        Icon: Code2,
        tone: 'bg-flx-pastel-green text-flx-text',
      },
      {
        title: 'Development',
        desc: 'Full-stack roadmaps & real-world projects',
        href: '/dashboard/development',
        Icon: Laptop,
        tone: 'bg-flx-pastel-blue text-[#2563eb] dark:text-[#60a5fa]',
      },
      {
        title: 'System Design',
        desc: 'HLD, LLD & Distributed Systems architecture',
        href: '/dashboard/system-design',
        Icon: Cpu,
        tone: 'bg-flx-pastel-lavender text-[#7c3aed] dark:text-[#c084fc]',
      },
      {
        title: 'Core CS Hub',
        desc: 'DBMS & SQL, Operating Systems, CN & OOPs',
        href: '/dashboard/core',
        Icon: Database,
        tone: 'bg-flx-pastel-yellow text-[#d97706] dark:text-[#fbbf24]',
      },
    ],
  },
  {
    label: 'Assessments & Tools',
    items: [
      {
        title: 'Timed Mock Tests',
        desc: 'Company-style OAs & topic assessments',
        href: '/dashboard/tests',
        Icon: FileCheck2,
        tone: 'bg-flx-pastel-green text-flx-text',
      },
      {
        title: 'Leaderboard & XP',
        desc: 'Weekly rankings, streaks & developer tiers',
        href: '/dashboard/leaderboard',
        Icon: Trophy,
        tone: 'bg-flx-pastel-yellow text-[#d97706] dark:text-[#fbbf24]',
      },
      {
        title: 'Revision Notes',
        desc: 'In-editor saved notes & problem bookmarks',
        href: '/dashboard/notes',
        Icon: NotebookPen,
        tone: 'bg-flx-pastel-pearl text-flx-text',
      },
    ],
  },
] as const;

const LINKS = [
  { label: 'Roadmaps', href: '#tracks' },
  { label: 'For Colleges', href: '#colleges' },
  { label: 'Pricing', href: '#pricing' },
] as const;

export function LandingNav() {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [floating, setFloating] = React.useState(false);
  const [menu, setMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('landing-hero');
      const limit = hero ? hero.offsetHeight - 60 : 560;
      setFloating(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const primaryHref = (isAuthenticated ? '/dashboard' : '/register') as Href;

  return (
    <>
      {!floating && (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-40 hidden h-2.5 bg-flx-surface md:block"
          aria-hidden
        />
      )}

      <header
        onMouseLeave={() => setMenu(null)}
        className={`fixed inset-x-0 z-50 mx-auto w-full bg-flx-surface transition-all duration-200 md:w-[88%] xl:w-fit rounded-b-xl md:rounded-b-2xl ${
          floating
            ? 'top-0 shadow-[0_10px_30px_rgba(8,44,28,0.16)] border-x border-b border-flx-border/80'
            : `top-0 md:top-2.5 shadow-md ${menu ? 'md:rounded-b-none' : 'flx-nav-ear'}`
        }`}
      >
        <nav className="flex items-center justify-between px-4 py-2.5 md:px-6 xl:gap-12" aria-label="Main navigation">
          <div className="flex items-center gap-6">
            <Link href="/" aria-label="NUMU home" className="shrink-0 flex items-center">
              <Logo size="sm" />
            </Link>

            <ul className="hidden items-center gap-0.5 lg:flex">
              {MENUS.map((m) => (
                <li key={m.label} className="relative" onMouseEnter={() => setMenu(m.label)}>
                  <button
                    type="button"
                    onClick={() => setMenu(menu === m.label ? null : m.label)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[0.84rem] font-medium text-flx-text transition-colors hover:bg-flx-muted"
                    aria-expanded={menu === m.label}
                  >
                    {m.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${menu === m.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                </li>
              ))}
              {LINKS.map((l) => (
                <li key={l.label} onMouseEnter={() => setMenu(null)}>
                  <a
                    href={l.href}
                    className="rounded-full px-3 py-1.5 text-[0.84rem] font-medium text-flx-text transition-colors hover:bg-flx-muted"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-flx-border text-flx-text transition-colors hover:bg-flx-muted"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="size-4 text-[#ffd449]" /> : <Moon className="size-4" />}
            </button>
            <Link
              href={(isAuthenticated ? '/dashboard/dsa' : '/login') as Href}
              className="rounded-full border border-flx-border px-4 py-1.5 text-[0.84rem] font-semibold text-flx-text transition-colors hover:bg-flx-muted"
            >
              {isAuthenticated ? 'DSA Hub' : 'Log in'}
            </Link>
            <Link
              href={primaryHref}
              className="rounded-full bg-flx-accent px-4 py-1.5 text-[0.84rem] font-bold text-[#082c1c] shadow-xs transition-all hover:brightness-95"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Start Learning Free'}
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-8 items-center justify-center rounded-full border border-flx-border text-flx-text"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="size-4 text-[#ffd449]" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full bg-flx-accent p-2 text-[#082c1c]"
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </nav>

        {/* Desktop dropdown panel */}
        {menu && (
          <div className="hidden border-t border-flx-border bg-flx-surface px-5 pb-4 pt-3.5 shadow-xl md:rounded-b-2xl lg:block">
            <div className="grid grid-cols-2 gap-2">
              {MENUS.find((m) => m.label === menu)?.items.map((it) => {
                const Icon = it.Icon;
                return (
                  <Link
                    key={it.title}
                    href={it.href as Href}
                    className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-flx-muted"
                  >
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${it.tone}`}>
                      <Icon className="size-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-flx-text">{it.title}</p>
                      <p className="text-xs text-flx-text-subtle mt-0.5">{it.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-flx-border px-5 pb-5 pt-3 lg:hidden">
            {MENUS.map((m) => (
              <div key={m.label} className="mb-3">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-flx-text-subtle">{m.label}</p>
                {m.items.map((it) => (
                  <Link
                    key={it.title}
                    href={it.href as Href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm font-medium text-flx-text hover:bg-flx-muted"
                  >
                    {it.title}
                  </Link>
                ))}
              </div>
            ))}
            <div className="mt-4 flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-full border border-flx-border py-2 text-center text-sm font-semibold text-flx-text"
              >
                Log in
              </Link>
              <Link
                href={primaryHref}
                className="flex-1 rounded-full bg-flx-accent py-2 text-center text-sm font-bold text-[#082c1c]"
              >
                {isAuthenticated ? 'Dashboard' : 'Start Free'}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
