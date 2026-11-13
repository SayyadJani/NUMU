'use client';

import React from 'react';
import {
  Code2,
  BookOpen,
  ClipboardCheck,
  Building2,
  Terminal,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

/**
 * Shared NUMU Brand Logo (Matches apps/web/src/components/ui/logo.tsx)
 */
export function NumuLogo({
  size = 'md',
  badge = 'ADMIN',
  onClick,
}: {
  size?: 'sm' | 'md' | 'lg' | undefined;
  badge?: string | null | undefined;
  onClick?: (() => void) | undefined;
}) {
  const heights = {
    sm: 'h-7',
    md: 'h-8',
    lg: 'h-11',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer group' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/numu-nav-logo.png"
        alt="NUMU"
        className={`${heights[size]} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
      />
      {badge && (
        <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/90 text-[10px] font-black uppercase tracking-wider text-[#0b5c39] shadow-2xs">
          {badge}
        </span>
      )}
    </div>
  );
}

/**
 * Shared Character Avatar (Matches apps/web/src/components/ui/character-avatar.tsx)
 */
export function CharacterAvatar({
  seed = 'Admin',
  size = 32,
  className = '',
}: {
  seed?: string | undefined;
  size?: number | undefined;
  className?: string | undefined;
}) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;
  const palettes = [
    { bg: '#dcfce7', hoodie: '#059669', skin: '#fcd34d', hair: '#1e293b' },
    { bg: '#e0f2fe', hoodie: '#0284c7', skin: '#fdba74', hair: '#0f172a' },
    { bg: '#ede9fe', hoodie: '#7c3aed', skin: '#fde68a', hair: '#312e81' },
    { bg: '#fef3c7', hoodie: '#d97706', skin: '#fed7aa', hair: '#451a03' },
  ];
  const p = palettes[index] || palettes[0]!;

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden shrink-0 inline-flex items-center justify-center ring-2 ring-emerald-500/20 shadow-xs ${className}`}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect width="64" height="64" rx="32" fill={p.bg} />
        <path d="M12 64 C12 45 52 45 52 64 Z" fill={p.hoodie} />
        <rect x="27" y="38" width="10" height="8" rx="4" fill={p.skin} />
        <circle cx="32" cy="27" r="13" fill={p.skin} />
        <path d="M18 25 C18 13 46 13 46 25 C44 19 20 19 18 25 Z" fill={p.hair} />
        <circle cx="27" cy="27" r="1.8" fill="#0f172a" />
        <circle cx="37" cy="27" r="1.8" fill="#0f172a" />
        <path
          d="M28 33 Q32 36 36 33"
          fill="none"
          stroke="#0f172a"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Shared Paper Planes Animation (Matches apps/web/src/components/auth/paper-planes.tsx)
 */
function PaperPlaneSvg({ className }: { className?: string | undefined }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M58 6L26 36L28 52L36 41L58 6Z"
        fill="#10b981"
        fillOpacity="0.22"
      />
      <path
        d="M58 6L6 28L26 36L58 6Z"
        fill="#34d399"
        fillOpacity="0.32"
        stroke="#059669"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M58 6L46 54L26 36L58 6Z"
        fill="#10b981"
        fillOpacity="0.26"
        stroke="#059669"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaperPlanes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none">
      <div className="absolute left-0 top-0 animate-fly-1">
        <PaperPlaneSvg className="w-12 h-12 drop-shadow-sm" />
      </div>
      <div className="absolute left-0 top-0 animate-fly-2">
        <PaperPlaneSvg className="w-9 h-9 opacity-80" />
      </div>
      <div className="absolute left-0 top-0 animate-fly-3">
        <PaperPlaneSvg className="w-11 h-11 opacity-85" />
      </div>
      <div className="absolute left-0 top-0 animate-fly-4">
        <PaperPlaneSvg className="w-8 h-8 opacity-65" />
      </div>
    </div>
  );
}

/**
 * Left-Column Showcase on Admin Login Page (Matches apps/web/src/components/auth/auth-path-showcase.tsx)
 */
const ADMIN_PATH_STEPS = [
  {
    step: '01',
    title: 'Problem Bank',
    subtitle: 'DSA & Bulk Import',
    icon: Code2,
    x: '14%',
    y: '74%',
    active: true,
  },
  {
    step: '02',
    title: 'Syllabus Topics',
    subtitle: 'Difficulty Balance',
    icon: BookOpen,
    x: '32%',
    y: '54%',
    active: true,
  },
  {
    step: '03',
    title: 'Proctored Tests',
    subtitle: 'Fullscreen & Tab Lock',
    icon: ClipboardCheck,
    x: '50%',
    y: '66%',
    active: true,
  },
  {
    step: '04',
    title: 'Cohort Batches',
    subtitle: 'Trainer & Org Scope',
    icon: Building2,
    x: '64%',
    y: '38%',
    active: true,
  },
  {
    step: '05',
    title: 'Judge0 Pipeline',
    subtitle: 'Live Code Verdicts',
    icon: Terminal,
    x: '78%',
    y: '50%',
    active: false,
  },
  {
    step: '06',
    title: '360° Analytics',
    subtitle: 'Student Mastery',
    icon: BarChart3,
    x: '88%',
    y: '20%',
    active: false,
  },
];

export function AdminAuthShowcase() {
  return (
    <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] relative overflow-hidden bg-gradient-to-br from-[#f2f9f5] via-[#f7fcf9] to-[#edf7f2] border-r border-emerald-900/10 flex-col justify-between p-10 xl:p-14 select-none">
      {/* Subtle Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-[28rem] h-[28rem] rounded-full bg-teal-300/15 blur-3xl" />

      {/* Top Brand Header */}
      <div className="relative z-10 space-y-5 max-w-xl">
        <div className="flex items-center justify-between">
          <NumuLogo size="lg" badge="ADMIN CONSOLE" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-emerald-200/80 text-[11px] font-bold text-[#0b5c39] shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Shared Backend • Zero-Storage Auth
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Command Every Layer of{' '}
            <span className="text-[#0b5c39] underline decoration-emerald-300/80 decoration-wavy decoration-2 underline-offset-4">
              Student Engineering
            </span>
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Unified governance over the NUMU Student Platform — manage DSA problem banks, configure strict proctoring guardrails, monitor Judge0 verdicts, and track 360° cohort mastery in real time.
          </p>
        </div>
      </div>

      {/* Interactive-Style Curvy Path Map */}
      <div className="relative z-10 my-auto h-72 w-full max-w-2xl mx-auto">
        <svg
          viewBox="0 0 800 320"
          fill="none"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="adminRoadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>

          {/* Soft Road Shadow */}
          <path
            d="M 80 250 C 170 240, 200 160, 260 170 C 330 180, 350 225, 410 210 C 470 195, 470 115, 520 120 C 570 125, 590 175, 635 160 C 680 145, 685 75, 720 60"
            stroke="#064e3b"
            strokeOpacity="0.08"
            strokeWidth="26"
            strokeLinecap="round"
          />

          {/* Main Emerald Path */}
          <path
            d="M 80 244 C 170 234, 200 154, 260 164 C 330 174, 350 219, 410 204 C 470 189, 470 109, 520 114 C 570 119, 590 169, 635 154 C 680 139, 685 69, 720 54"
            stroke="url(#adminRoadGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Animated Center Dash Line */}
          <path
            d="M 80 244 C 170 234, 200 154, 260 164 C 330 174, 350 219, 410 204 C 470 189, 470 109, 520 114 C 570 119, 590 169, 635 154 C 680 139, 685 69, 720 54"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="8 10"
            strokeLinecap="round"
            className="animate-dash-flow"
          />
        </svg>

        {/* Milestone Nodes */}
        {ADMIN_PATH_STEPS.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.step}
              style={{ left: node.x, top: node.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-110 ${
                    node.active
                      ? 'bg-[#0b5c39] text-white ring-4 ring-emerald-500/20'
                      : 'bg-white text-emerald-800 border-2 border-emerald-300 shadow-sm'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-2 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-xs border border-emerald-900/10 shadow-xs text-center whitespace-nowrap">
                  <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                    {node.step}. {node.title}
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500">{node.subtitle}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Stats & Tagline */}
      <div className="relative z-10 flex items-center justify-between gap-6 pt-6 border-t border-emerald-900/10">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-lg font-black text-slate-900">HttpOnly + RBAC</div>
            <div className="text-[11px] font-semibold text-slate-500">Zero Web-Storage Tokens</div>
          </div>
          <div className="h-8 w-px bg-emerald-900/10" />
          <div>
            <div className="text-lg font-black text-slate-900">100% Shared</div>
            <div className="text-[11px] font-semibold text-slate-500">PostgreSQL & Judge0 Engine</div>
          </div>
          <div className="h-8 w-px bg-emerald-900/10" />
          <div>
            <div className="text-lg font-black text-[#0b5c39]">Live Proctoring</div>
            <div className="text-[11px] font-semibold text-slate-500">Tab-Switch & Copy-Paste Locks</div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-black tracking-widest uppercase text-[#0b5c39]">
            Learn • Build • Grow
          </span>
        </div>
      </div>
    </div>
  );
}

