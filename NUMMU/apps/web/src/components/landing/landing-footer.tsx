'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/contexts/auth-context';

type Href = React.ComponentProps<typeof Link>['href'];

const FOOTER_COLUMNS = [
  {
    title: 'Practice',
    links: [
      { label: 'DSA', href: '/dashboard/dsa' },
      { label: 'Development', href: '/dashboard/development' },
      { label: 'System Design', href: '/dashboard/system-design' },
      { label: 'Core CS', href: '/dashboard/core' },
    ],
  },
  {
    title: 'Compete',
    links: [
      { label: 'Tests', href: '/dashboard/tests' },
      { label: 'Leaderboard', href: '/dashboard/leaderboard' },
      { label: 'Notes', href: '/dashboard/notes' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'For Colleges', href: '#colleges' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Tracks', href: '#tracks' },
      { label: 'Create Account', href: '/register' },
    ],
  },
] as const;

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const cls = 'text-sm text-white/70 transition-colors hover:text-flx-accent';
  return href.startsWith('#') ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href as Href} className={cls}>
      {children}
    </Link>
  );
}

export function LandingFooter() {
  const { isAuthenticated } = useAuth();
  const ctaHref = (isAuthenticated ? '/dashboard' : '/register') as Href;

  return (
    <footer className="bg-flx-surface">
      {/* Lime CTA card overlapping the dark footer */}
      <div className="relative z-10 mx-auto -mb-32 w-full max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-flx-accent px-6 py-12 text-center sm:px-10 sm:py-14 shadow-xl">
          {/* decorative wires */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-[#082c1c]/15"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden
          >
            <path d="M0 80 C 200 20, 400 100, 600 50 S 1000 0, 1200 60" stroke="currentColor" strokeWidth="2" />
            <path d="M0 95 C 250 40, 450 110, 650 70 S 1000 30, 1200 85" stroke="currentColor" strokeWidth="2" />
          </svg>

          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-3.5 sm:gap-5">
            <h2 className="font-heading text-[1.65rem] font-bold leading-[2.15rem] tracking-[-0.02em] text-[#082c1c] sm:text-[2.6rem] sm:leading-[3.1rem]">
              Ready to become placement ready?
            </h2>
            <p className="max-w-xl text-sm text-[#082c1c]/80 sm:text-base">
              Master DSA, build real projects, learn System Design and crack tests &mdash; so you can focus on
              landing the offer.
            </p>
            <Link
              href={ctaHref}
              className="group mt-1 inline-flex items-center gap-2 rounded-full bg-[#082c1c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#193e2e] sm:text-base"
            >
              {isAuthenticated ? 'Continue Learning' : 'Start Learning Free'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="mt-1 flex flex-col gap-2 text-xs font-medium text-[#082c1c] sm:flex-row sm:gap-6 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" strokeWidth={3} /> Free forever plan, no card needed.
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" strokeWidth={3} /> Unified 4-track developer workspace.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dark footer */}
      <div className="bg-flx-primary pt-44">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-5 pb-10 sm:px-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo size="md" theme="dark" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
              The complete developer learning platform. Learn. Build. Grow.
            </p>
            <a
              href="mailto:hello@numu.dev"
              className="mt-4 inline-block text-sm font-medium text-flx-accent hover:underline"
            >
              hello@numu.dev
            </a>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3.5 font-heading text-sm font-bold text-white sm:text-base">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 px-5 py-5 text-xs text-white/50 sm:flex-row sm:px-8">
          <span>Copyright © {new Date().getFullYear()} NUMU, all rights reserved</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Terms of use
            </a>
            <a href="#" className="hover:text-white">
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
