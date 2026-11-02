'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Code2, Box, FileText, Trophy, ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  isTarget?: boolean;
}

// Mathematically generated along the cubic Bézier: M 16 73 C 34 68, 58 42, 74 15
// Guarantees a 100% smooth, continuous curve that never kinks or overlaps text
const STEPS: Step[] = [
  { id: 'learn', title: 'Learn', subtitle: 'Structured roadmaps', icon: <BookOpen className="w-[18px] h-[18px]" />, x: 16, y: 73 },
  { id: 'practice', title: 'Practice', subtitle: 'Solve problems and exercises', icon: <Code2 className="w-[18px] h-[18px]" />, x: 27.5, y: 67.5 },
  { id: 'build', title: 'Build', subtitle: 'Work on real projects', icon: <Box className="w-[18px] h-[18px]" />, x: 39.5, y: 58.5 },
  { id: 'test', title: 'Test', subtitle: 'Assess your knowledge', icon: <FileText className="w-[18px] h-[18px]" />, x: 52, y: 46 },
  { id: 'compete', title: 'Compete', subtitle: 'Participate and grow', icon: <Trophy className="w-[18px] h-[18px]" />, x: 63.5, y: 31 },
  { id: 'hire', title: 'Get Hired', subtitle: 'Turn your skills into opportunities', icon: <ArrowUpRight className="w-[18px] h-[18px]" />, x: 74, y: 15, isTarget: true },
];

const MAIN_PATH = 'M 16 73 C 34 68, 58 42, 74 15';
const EXTENSION_PATH = 'M 74 15 C 76 11, 77 8, 78 5';

const STATS = [
  { value: '10K+', label: 'Students' },
  { value: '200+', label: 'Colleges' },
  { value: '500K+', label: 'Problems Solved' },
  { value: '50K+', label: 'Projects Built' },
];

export function AuthPathShowcase() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#f2f9f5] via-[#f7fcf9] to-[#edf7f2] select-none p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
      {/* ── Background: faint grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(16,185,129,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Background: organic soft decorative shapes ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="mintWave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path d="M 0 45 C 15 42, 28 54, 32 70 C 36 84, 28 94, 35 100 L 0 100 Z" fill="url(#mintWave)" />
      </svg>

      {/* ── Top Header: Brand Logo & Title (Compacted to stay in top-left quadrant) ── */}
      <div className="relative z-20 space-y-3 shrink-0 max-w-[280px] xl:max-w-[320px]">
        <Link href="/" className="inline-flex items-center">
          <Logo size="md" />
        </Link>

        <div className="space-y-1.5 text-left pt-1">
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Your path from
            <br />
            learning to
            <br />
            industry-ready.
          </h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed pt-0.5">
            Structured learning. Real practice. Real projects. Assessments.
            Contests. A brighter you.
          </p>
        </div>
      </div>

      {/* ── Ascending Path Vector Track (z-10, always behind cards) ── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Main Smooth Curved Track Line */}
          <path
            d={MAIN_PATH}
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Flowing Energy Pulse Highlight */}
          <path
            d={MAIN_PATH}
            pathLength={100}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="16 84"
            vectorEffect="non-scaling-stroke"
            className="animate-dash-flow"
          />
          {/* Soft dashed extension line past target */}
          <path
            d={EXTENSION_PATH}
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* 6 Step Nodes & Floating Cards (z-20, clean white background, no clipping) */}
        {STEPS.map((step) => (
          <div
            key={step.id}
            className="absolute z-20 flex items-center gap-2.5 transition-transform duration-300 hover:scale-105 pointer-events-auto cursor-default group"
            style={{
              left: `${step.x}%`,
              top: `${step.y}%`,
              transform: 'translate(-18px, -50%)',
            }}
          >
            {/* Circle Node (Centered directly on curve coordinate) */}
            <div className="relative shrink-0">
              {step.isTarget && (
                <span className="absolute -inset-1.5 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
              )}
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#dcfce7] border-2 border-[#86efac] text-[#0b5c39] ring-4 ring-white shadow-xs transition-transform duration-200 group-hover:scale-110">
                {step.icon}
              </div>
            </div>

            {/* Step Label Card (Sits to the right of node with crisp white bg) */}
            <div className="bg-white rounded-xl px-3 py-1.5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-200 group-hover:shadow-md text-left whitespace-nowrap">
              <div className="text-[12px] font-bold text-slate-900 leading-tight">
                {step.title}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                {step.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Section: Stats Grid + Testimonial & Signature ── */}
      <div className="relative z-20 shrink-0 space-y-4 pt-6">
        {/* 4 Stat Metrics */}
        <div className="grid grid-cols-4 max-w-lg border-t border-slate-200/80 pt-4">
          {STATS.map((s, idx) => (
            <div
              key={s.label}
              className={`space-y-0.5 ${idx > 0 ? 'border-l border-slate-200/80 pl-3 sm:pl-4' : 'pr-2'}`}
            >
              <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                {s.value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal leading-tight mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial Quote & Signature Note */}
        <div className="flex items-end justify-between pt-1">
          {/* Left: Testimonial with green vertical accent bar */}
          <div className="border-l-[3px] border-[#0b5c39] pl-3.5 py-0.5 text-left max-w-xs space-y-1">
            <p className="text-[11px] sm:text-xs text-slate-700 font-normal leading-relaxed italic">
              &ldquo;NUMU gave structure to my learning journey and helped me become industry ready.&rdquo;
            </p>
            <div className="text-[10px] text-slate-500 font-medium">
              — B.Tech Student, VIT
            </div>
          </div>

          {/* Right: Signature Note */}
          <div className="flex flex-col items-center select-none pointer-events-none pl-3 pr-2">
            <span
              className="font-serif italic font-bold text-[#0b5c39] text-sm leading-tight rotate-[-4deg]"
              style={{ fontFamily: '"Segoe Script", "Brush Script MT", cursive' }}
            >
              Learn
              <br />
              &nbsp;&nbsp;Build
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;Grow
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
      </div>
    </div>
  );
}
