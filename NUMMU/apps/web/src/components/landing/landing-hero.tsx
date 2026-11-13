'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Cpu,
  Database,
  Laptop,
  Terminal,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

type Href = React.ComponentProps<typeof Link>['href'];

const QUICK_TRACKS = [
  { label: 'DSA + Judge0 IDE', href: '/dashboard/dsa', Icon: Code2 },
  { label: 'Full-Stack Dev', href: '/dashboard/development', Icon: Laptop },
  { label: 'System Design (HLD/LLD)', href: '/dashboard/system-design', Icon: Cpu },
  { label: 'Core CS (DBMS, OS, CN)', href: '/dashboard/core', Icon: Database },
] as const;

const TECH_MARQUEE = [
  'Data Structures & Algorithms',
  'Judge0 Multi-Language IDE',
  'Full-Stack Web Development',
  'High-Level System Design (HLD)',
  'Low-Level Object Design (LLD)',
  'DBMS & SQL Query Optimization',
  'Operating Systems & Concurrency',
  'Computer Networks & Protocols',
  'OOPs & Design Patterns',
  'Timed Placement Mock OAs',
  '21-Day Activity Heatmap',
  'Verified Developer Profiles',
] as const;

export function LandingHero() {
  const { isAuthenticated } = useAuth();
  const ctaHref = (isAuthenticated ? '/dashboard' : '/register') as Href;

  return (
    <div id="landing-hero" className="bg-flx-surface px-0 pt-0 md:px-2.5 md:pt-2.5">
      <section className="relative flex flex-col justify-between overflow-hidden bg-flx-primary text-white md:rounded-[24px]">
        {/* Ambient radial emerald glow + subtle dot grid */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-flx-secondary/80 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.11)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,transparent_35%,#000_100%)]"
          aria-hidden
        />

        {/* Center Hero Copy */}
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pt-24 pb-8 text-center md:pt-28 md:pb-10">
          {/* Platform Identity Pill */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 backdrop-blur-sm">
              <span className="flex size-2 rounded-full bg-flx-accent shadow-[0_0_10px_#cff07c]" />
              <span className="text-[11px] font-semibold tracking-wider text-white/95 sm:text-xs">
                LEARN • BUILD • GROW — COMPLETE DEVELOPER WORKSPACE
              </span>
            </div>
          </div>

          {/* Headline — fits cleanly on 2 balanced lines */}
          <h1 className="mx-auto max-w-4xl font-heading text-[1.75rem]/[2.25rem] font-bold tracking-[-0.02em] text-white sm:text-[2.35rem]/[3rem] lg:text-[2.75rem]/[3.45rem]">
            Master <span className="flx-highlight select-none sm:whitespace-nowrap">DSA, Dev &amp; System Design</span>
            <br />
            in one unified platform.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-3.5 max-w-xl text-sm text-white/80 sm:mt-4 sm:text-base sm:leading-relaxed">
            Stop juggling scattered sheets, playlists, and compilers. Practice pattern-first DSA with our live Judge0
            IDE, build full-stack projects, master Core CS &amp; System Design, and prove your skills with a verified
            profile.
          </p>

          {/* Primary + Secondary CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ctaHref}
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-flx-accent px-6 py-3 text-sm font-bold text-[#082c1c] shadow-lg transition-all hover:brightness-95"
            >
              {isAuthenticated ? 'Continue in Dashboard' : 'Start Practicing Free'}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard/dsa"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/15"
            >
              <Terminal className="size-4 text-flx-accent" />
              Explore DSA Curriculum
            </Link>
          </div>

          {/* 4 Interactive Track Shortcut Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {QUICK_TRACKS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href as Href}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/20 px-3.5 py-1.5 text-xs font-medium text-white/85 transition-all hover:border-flx-accent/60 hover:bg-white/10 hover:text-white"
              >
                <Icon className="size-3.5 text-flx-accent" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Lower Hero Stats Strip + Marquee */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-7 pt-2">
          <div className="mb-5 grid grid-cols-2 gap-3 border-y border-white/10 py-3.5 sm:grid-cols-4">
            {[
              { val: '4 Core Tracks', label: 'DSA · Dev · SysDesign · Core CS' },
              { val: 'Judge0 Engine', label: 'Instant Multi-Language Execution' },
              { val: '21-Day Matrix', label: 'Live PostgreSQL Streak Tracking' },
              { val: 'Verified Profile', label: 'Shareable Proof of Work' },
            ].map((stat) => (
              <div key={stat.val} className="text-center">
                <p className="font-heading text-base font-bold text-flx-accent sm:text-lg">{stat.val}</p>
                <p className="text-[11px] text-white/70 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flx-marquee flex w-max items-center gap-8 py-0.5">
              {[...TECH_MARQUEE, ...TECH_MARQUEE].map((item, idx) => (
                <span
                  key={`${item}-${idx}`}
                  className="inline-flex items-center gap-2.5 whitespace-nowrap text-xs font-semibold tracking-wide text-white/75"
                >
                  <span className="size-1.5 rounded-full bg-flx-accent" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
