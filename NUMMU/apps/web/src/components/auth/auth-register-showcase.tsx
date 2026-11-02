'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Code2,
  CheckSquare2,
  Trophy,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const FEATURES = [
  {
    title: 'Structured Roadmaps',
    subtitle: 'Step-by-step paths from foundational DSA to advanced system design.',
    icon: Compass,
    badge: 'Curated Paths',
  },
  {
    title: 'Curated Practice',
    subtitle: 'Handpicked coding challenges with live in-browser compiler & test suites.',
    icon: Code2,
    badge: 'Live Code',
  },
  {
    title: 'Real-World Projects',
    subtitle: 'Build production-grade applications, submit code, and receive reviews.',
    icon: CheckSquare2,
    badge: 'Hands-on',
  },
  {
    title: 'Contests & Assessments',
    subtitle: 'Weekly competitive rounds with Elo-style rating delta to benchmark skills.',
    icon: Trophy,
    badge: 'Rated Arena',
  },
];

const STATS = [
  { value: '10K+', label: 'Students' },
  { value: '200+', label: 'Colleges' },
  { value: '500K+', label: 'Problems Solved' },
  { value: '50K+', label: 'Projects Built' },
];

export function AuthRegisterShowcase() {
  return (
    <div className="w-full h-full relative flex flex-col justify-between p-7 sm:p-9 lg:p-11 overflow-hidden bg-gradient-to-br from-[#f2fbf6] via-[#f8fdfa] to-[#edf8f1] border-r border-emerald-900/10 select-none">
      {/* ── Background Organic Curves & Decorative Grid (Pure SVG & CSS) ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 700 800"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M -50 200 C 180 180, 250 450, 450 420 C 600 400, 650 650, 750 700"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <path
          d="M 100 0 C 300 120, 280 380, 520 480 C 680 550, 680 750, 800 850"
          fill="none"
          stroke="#10b981"
          strokeWidth="1"
          opacity="0.5"
        />
        <path
          d="M 450 0 C 600 180, 700 380, 680 800 L 700 0 Z"
          fill="url(#mintGradRegisterClean)"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="mintGradRegisterClean" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle micro-dots grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#10b981 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />

      {/* ── Top Header: Brand Logo & Title Lockup ── */}
      <div className="relative z-10 space-y-3 shrink-0">
        <Link href="/" className="inline-flex items-center">
          <Logo size="md" />
        </Link>

        <div className="space-y-1.5 text-left pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-[10px] font-bold text-emerald-800 tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Skills for a brighter tomorrow</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.08]">
            Learn.
            <br />
            Build.
            <br />
            <span className="text-[#0b5c39]">Grow.</span>
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-500 font-normal max-w-md leading-relaxed pt-0.5">
            A structured learning platform for college students to master DSA,
            build real-world projects, crack interviews and become industry ready.
          </p>
        </div>
      </div>

      {/* ── Center: Clean Icon-Driven Features Grid (Zero Fake Assets) ── */}
      <div className="relative z-10 my-auto py-3 space-y-2.5 w-full max-w-lg">
        {/* 2x2 Grid of Key Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-md transition-all group text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-[#0b5c39] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-100">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    {feat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5th Feature Banner: Campus to Career */}
        <div className="bg-gradient-to-r from-white via-white to-emerald-50/50 backdrop-blur-md border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-md transition-all group text-left flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0b5c39] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-none">
                  College Integration &amp; Placement Readiness
                </h3>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                  Campus to Career
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-1 truncate">
                Built for students, trainers &amp; institutions with verified skill credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Testimonial Quote & 4-Column Stats Strip ── */}
      <div className="relative z-10 shrink-0 space-y-3 pt-2">
        {/* Testimonial Quote & Signature Note */}
        <div className="flex items-end justify-between pb-1">
          {/* Left: Testimonial with green vertical accent line */}
          <div className="border-l-[3px] border-[#0b5c39] pl-3.5 py-0.5 text-left max-w-[280px] sm:max-w-xs space-y-0.5">
            <p className="text-[11px] sm:text-xs text-slate-700 font-normal leading-relaxed italic">
              &ldquo;Consistency compounds into extraordinary results.&rdquo;
            </p>
            <div className="text-[10px] text-slate-500 font-medium">
              — NUMU
            </div>
          </div>

          {/* Right: Playful Green Hand-Drawn Signature Note */}
          <div className="flex flex-col items-center select-none pointer-events-none pl-2 pr-1">
            <span
              className="font-serif italic font-bold text-[#0b5c39] text-xs leading-tight rotate-[-4deg]"
              style={{ fontFamily: '"Segoe Script", "Brush Script MT", cursive' }}
            >
              Better Developers
              <br />
              &nbsp;&nbsp;Brighter Futures ↗
            </span>
            <svg
              className="w-6 h-6 text-[#0b5c39] -mt-1 ml-4 rotate-[-10deg]"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 40C18 32 26 20 40 14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M30 13L40 14L37 25"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* 4 Stat Metrics Columns */}
        <div className="grid grid-cols-4 gap-2 text-left pt-2.5 border-t border-slate-200/80">
          {STATS.map((s, idx) => (
            <div
              key={s.label}
              className={`space-y-0.5 ${idx > 0 ? 'border-l border-slate-200/80 pl-3 sm:pl-4' : 'pr-2'}`}
            >
              <div className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">
                {s.value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal leading-tight mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
