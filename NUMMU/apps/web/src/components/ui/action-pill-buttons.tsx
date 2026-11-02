'use client';

import React from 'react';

/**
 * 3D Claymorphic / Skeuomorphic Action Pill Buttons
 * Matches the reference design with high-fidelity gradients, 3D icons, and tactile micro-interactions.
 */

// ── 1. 3D Run Icon (Dark Console with Green Play & Code Lines) ──
export function Icon3DRunTerminal({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-sm select-none`}
    >
      <defs>
        {/* Terminal outer body gradient */}
        <linearGradient id="termGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a34" />
          <stop offset="40%" stopColor="#0a231d" />
          <stop offset="100%" stopColor="#02140f" />
        </linearGradient>
        {/* Glass reflection gradient */}
        <linearGradient id="termGlass" x1="22" y1="2" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
        {/* Play triangle vibrant gradient */}
        <linearGradient id="playGrad" x1="18" y1="16" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        {/* Subtle border highlight */}
        <linearGradient id="termBorder" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="0.8" />
        </linearGradient>
        {/* Drop shadow filter */}
        <filter id="termShadow" x="-2" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#042f2e" floodOpacity="0.4" />
        </filter>
        <filter id="playGlow" x="12" y="12" width="22" height="22" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Main Terminal Window Body */}
      <rect
        x="2.5"
        y="2.5"
        width="39"
        height="39"
        rx="10"
        fill="url(#termGrad)"
        stroke="url(#termBorder)"
        strokeWidth="1.5"
        filter="url(#termShadow)"
      />

      {/* Top Header Bar Line */}
      <line x1="2.5" y1="11" x2="41.5" y2="11" stroke="#0f3d32" strokeWidth="1" />

      {/* 3 Window Dots */}
      <circle cx="7" cy="6.8" r="1.3" fill="#34d399" fillOpacity="0.8" />
      <circle cx="11.5" cy="6.8" r="1.3" fill="#10b981" fillOpacity="0.6" />
      <circle cx="16" cy="6.8" r="1.3" fill="#059669" fillOpacity="0.5" />

      {/* Top Glass Light Sweep */}
      <path
        d="M 3.5 12 C 10 12, 34 12, 40.5 12 C 40.5 12, 40 18, 3.5 22 Z"
        fill="url(#termGlass)"
      />

      {/* Code Lines on Left */}
      <rect x="7" y="16.5" width="4" height="1.8" rx="0.9" fill="#34d399" fillOpacity="0.9" />
      <rect x="7" y="21" width="6" height="1.8" rx="0.9" fill="#10b981" fillOpacity="0.75" />
      <rect x="7" y="25.5" width="4.5" height="1.8" rx="0.9" fill="#059669" fillOpacity="0.65" />
      <rect x="7" y="30" width="10" height="1.8" rx="0.9" fill="#047857" fillOpacity="0.5" />
      <rect x="7" y="34.5" width="7" height="1.8" rx="0.9" fill="#065f46" fillOpacity="0.4" />

      {/* 3D Glowing Green Play Icon */}
      <path
        d="M 18.5 17.2 C 18.5 15.9  20 15.1  21.1 15.8 L 32.2 22.4 C 33.2 23.0  33.2 24.5  32.2 25.1 L 21.1 31.7 C 20 32.4  18.5 31.6  18.5 30.3 Z"
        fill="url(#playGrad)"
        filter="url(#playGlow)"
      />
      {/* Play Icon Top Highlight */}
      <path
        d="M 19.5 18 L 30 23.8 L 22 25 Z"
        fill="#ffffff"
        fillOpacity="0.35"
      />
    </svg>
  );
}

// ── 2. 3D Submit Icon (Blue Jet Paper Plane with Motion Trails) ──
export function Icon3DSubmitPlane({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-sm select-none`}
    >
      <defs>
        {/* Main top wing gradient */}
        <linearGradient id="planeTop" x1="12" y1="8" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        {/* Underbody dark shade */}
        <linearGradient id="planeUnder" x1="18" y1="22" x2="30" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        {/* Fold crease shadow */}
        <linearGradient id="planeFold" x1="20" y1="18" x2="38" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        {/* Motion lines gradient */}
        <linearGradient id="motionGrad" x1="4" y1="36" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="planeShadow" x="6" y="4" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#1d4ed8" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Speed / Motion dash lines */}
      <path
        d="M 6 36 L 11 31"
        stroke="url(#motionGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 9 40 L 16 33"
        stroke="url(#motionGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M 4 28 L 8 24"
        stroke="url(#motionGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Main 3D Paper Plane */}
      <g filter="url(#planeShadow)">
        {/* Under wing / body shadow */}
        <path
          d="M 12 25 L 39 8 L 22 36 L 20 28 Z"
          fill="url(#planeUnder)"
        />
        {/* Left main wing */}
        <path
          d="M 12 25 L 39 8 L 22 23 Z"
          fill="url(#planeFold)"
        />
        {/* Right / Top glossy wing */}
        <path
          d="M 22 23 L 39 8 L 22 36 L 24 26 Z"
          fill="url(#planeTop)"
        />
        {/* Top glossy edge reflection */}
        <path
          d="M 12 25 L 39 8 L 28 14 Z"
          fill="#ffffff"
          fillOpacity="0.4"
        />
        {/* Center keel fold line */}
        <path
          d="M 39 8 L 22 23"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeOpacity="0.7"
        />
      </g>
    </svg>
  );
}

// ── 3. 3D Streak Flame Icon with Sparkles ──
export function Icon3DStreakFlame({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-sm select-none`}
    >
      <defs>
        {/* Outer Red/Orange Fire */}
        <linearGradient id="fireOuter" x1="22" y1="4" x2="22" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4500" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        {/* Mid Fire Gradient (Warm Orange-Yellow) */}
        <linearGradient id="fireMid" x1="22" y1="14" x2="22" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        {/* Inner Core Fire Gradient (Bright Yellow / White Core) */}
        <linearGradient id="fireCore" x1="22" y1="22" x2="22" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        {/* Golden Sparkle Gradient */}
        <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="fireGlow" x="4" y="2" width="36" height="40" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#ea580c" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Sparkle 1 (Top Left) */}
      <path
        d="M 7 14 C 7 11 9 9 12 9 C 9 9 7 7 7 4 C 7 7 5 9 2 9 C 5 9 7 11 7 14 Z"
        fill="url(#sparkleGrad)"
        transform="scale(0.65) translate(4, 8)"
      />
      {/* Sparkle 2 (Top Right) */}
      <path
        d="M 7 14 C 7 11 9 9 12 9 C 9 9 7 7 7 4 C 7 7 5 9 2 9 C 5 9 7 11 7 14 Z"
        fill="url(#sparkleGrad)"
        transform="scale(0.7) translate(48, 12)"
      />
      {/* Sparkle 3 (Bottom Right) */}
      <circle cx="38" cy="28" r="1.5" fill="#f59e0b" />
      <circle cx="5" cy="27" r="1.3" fill="#fbbf24" />

      {/* Main 3D Fire Body */}
      <g filter="url(#fireGlow)">
        {/* Outer Flame */}
        <path
          d="M 22 5 C 23.5 11  29 14.5  30.5 20 C 32 25  32 30  28.5 35 C 25.5 39  18.5 39  15.5 35 C 12 30  12 24.5  15 19.5 C 15.5 22.5  17.5 24  19.5 23.5 C 19 18  16 14  22 5 Z"
          fill="url(#fireOuter)"
        />
        {/* Mid Warm Flame */}
        <path
          d="M 22 14 C 23.5 18  27.5 21  28 26 C 28.5 30  26 34  22 36 C 18 34  15.5 30  16 26 C 16.5 22.5  18 20.5  20 20 C 19.5 17  19 15.5  22 14 Z"
          fill="url(#fireMid)"
        />
        {/* Glowing Yellow-White Core */}
        <path
          d="M 22 22 C 23 25  25.5 27  25 30.5 C 24.5 33  23.5 34.5  22 35 C 20.5 34.5  19.5 33  19 30.5 C 18.5 27.5  20.5 25.5  22 22 Z"
          fill="url(#fireCore)"
        />
        {/* Top Gloss Highlight */}
        <ellipse cx="21" cy="26" rx="2" ry="4" fill="#ffffff" fillOpacity="0.45" />
      </g>
    </svg>
  );
}

// ── 4. 3D Streak Calendar Icon (Purple with Flame Seal Badge) ──
export function Icon3DStreakCalendar({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-sm select-none`}
    >
      <defs>
        {/* Purple Calendar Base Gradient */}
        <linearGradient id="calGrad" x1="6" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        {/* Sheet White Gradient */}
        <linearGradient id="calSheet" x1="22" y1="14" x2="22" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3e8ff" />
        </linearGradient>
        {/* Coin / Seal Badge Gradient */}
        <linearGradient id="sealGrad" x1="28" y1="24" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <filter id="calShadow" x="2" y="2" width="40" height="40" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4c1d95" floodOpacity="0.3" />
        </filter>
        <filter id="sealShadow" x="25" y="22" width="18" height="18" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#312e81" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Main Calendar Body */}
      <g filter="url(#calShadow)">
        {/* Purple Header & Body backing */}
        <rect x="5.5" y="7" width="31" height="30" rx="7" fill="url(#calGrad)" />

        {/* 2 Top Ring Binders */}
        <path d="M 11 4 L 11 10" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 17 4 L 17 10" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 25 4 L 25 10" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 31 4 L 31 10" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />

        {/* White/Lavender Calendar Sheet */}
        <rect x="7" y="14" width="28" height="21" rx="4" fill="url(#calSheet)" />

        {/* Calendar Grid Dots */}
        <circle cx="11.5" cy="18.5" r="1.3" fill="#8b5cf6" />
        <circle cx="16.5" cy="18.5" r="1.3" fill="#8b5cf6" />
        <circle cx="21.5" cy="18.5" r="1.3" fill="#8b5cf6" />
        <circle cx="26.5" cy="18.5" r="1.3" fill="#8b5cf6" />
        <circle cx="30.5" cy="18.5" r="1.3" fill="#8b5cf6" />

        <circle cx="11.5" cy="23.5" r="1.3" fill="#8b5cf6" />
        <circle cx="16.5" cy="23.5" r="1.3" fill="#8b5cf6" />
        <circle cx="21.5" cy="23.5" r="1.3" fill="#8b5cf6" />
        <circle cx="26.5" cy="23.5" r="1.3" fill="#a78bfa" />
        <circle cx="30.5" cy="23.5" r="1.3" fill="#a78bfa" />

        <circle cx="11.5" cy="28.5" r="1.3" fill="#8b5cf6" />
        <circle cx="16.5" cy="28.5" r="1.3" fill="#8b5cf6" />
        <circle cx="21.5" cy="28.5" r="1.3" fill="#a78bfa" />
      </g>

      {/* Overlapping Bottom-Right Fire Coin / Seal */}
      <g filter="url(#sealShadow)">
        <circle cx="32.5" cy="31" r="7.5" fill="url(#sealGrad)" stroke="#c4b5fd" strokeWidth="1.2" />
        {/* White/Cyan Mini Flame inside seal */}
        <path
          d="M 32.5 26.5 C 33.2 28.5  35 29.5  35 31.5 C 35 33.2  33.8 34.5  32.5 34.5 C 31.2 34.5  30 33.2  30 31.5 C 30 30  31.2 29  31.8 28.5 C 31.6 28  31.8 27.5  32.5 26.5 Z"
          fill="#ffffff"
        />
        <circle cx="32.5" cy="32" r="1" fill="#38bdf8" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// INTERACTIVE PILL BUTTON COMPONENTS
// ─────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

/**
 * 1. RUN BUTTON
 * Skeuomorphic mint/emerald pill with 3D Terminal Play Icon
 */
export function RunPillButton({
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 gap-2 text-sm',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 gap-2.5 sm:gap-3 text-base sm:text-lg',
    lg: 'px-6 py-3 gap-3.5 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11',
  }[size];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center rounded-[20px] sm:rounded-[24px] font-extrabold tracking-tight transition-all duration-200 select-none cursor-pointer ${sizeClasses}
        bg-gradient-to-b from-[#f2fdf9] via-[#e6faf4] to-[#d6f5ec]
        border-[1.5px] border-[#6ee7b7] hover:border-[#34d399] active:border-[#10b981]
        text-[#064e3b] hover:text-[#022c22]
        shadow-[0_4px_16px_rgba(20,184,166,0.18),inset_0_1px_1px_rgba(255,255,255,0.9)]
        hover:shadow-[0_6px_22px_rgba(20,184,166,0.28),inset_0_1px_2px_rgba(255,255,255,1)]
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
      {...props}
    >
      <Icon3DRunTerminal className={`${iconSizes} transition-transform duration-200 group-hover:scale-105`} />
      <span className="font-extrabold text-slate-900 group-hover:text-black">Run</span>
    </button>
  );
}

/**
 * 2. SUBMIT BUTTON
 * Skeuomorphic soft blue pill with 3D Jet Plane Icon
 */
export function SubmitPillButton({
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 gap-2 text-sm',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 gap-2.5 sm:gap-3 text-base sm:text-lg',
    lg: 'px-6 py-3 gap-3.5 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11',
  }[size];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center rounded-[20px] sm:rounded-[24px] font-extrabold tracking-tight transition-all duration-200 select-none cursor-pointer ${sizeClasses}
        bg-gradient-to-b from-[#f8faff] via-[#eff6ff] to-[#dbeafe]
        border-[1.5px] border-[#93c5fd] hover:border-[#60a5fa] active:border-[#3b82f6]
        text-[#1e3a8a] hover:text-[#172554]
        shadow-[0_4px_16px_rgba(59,130,246,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)]
        hover:shadow-[0_6px_22px_rgba(59,130,246,0.28),inset_0_1px_2px_rgba(255,255,255,1)]
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
      {...props}
    >
      <Icon3DSubmitPlane className={`${iconSizes} transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />
      <span className="font-extrabold text-slate-900 group-hover:text-black">Submit</span>
    </button>
  );
}

/**
 * 3. STREAK BUTTON (FLAME VERSION)
 * Skeuomorphic warm peach/amber pill with 3D Fire Flame & Sparkles
 */
export function StreakFlamePillButton({
  size = 'md',
  count,
  className = '',
  ...props
}: ButtonProps & { count?: number | string }) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 gap-2 text-sm',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 gap-2.5 sm:gap-3 text-base sm:text-lg',
    lg: 'px-6 py-3 gap-3.5 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11',
  }[size];

  return (
    <button
      type="button"
      className={`group relative inline-flex items-center justify-center rounded-[20px] sm:rounded-[24px] font-extrabold tracking-tight transition-all duration-200 select-none cursor-pointer ${sizeClasses}
        bg-gradient-to-b from-[#fffaf5] via-[#fff4e8] to-[#ffedd5]
        border-[1.5px] border-[#fed7aa] hover:border-[#fdba74] active:border-[#fb923c]
        text-[#431407] hover:text-[#2d0c04]
        shadow-[0_4px_16px_rgba(249,115,22,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)]
        hover:shadow-[0_6px_22px_rgba(249,115,22,0.28),inset_0_1px_2px_rgba(255,255,255,1)]
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${className}`}
      {...props}
    >
      <Icon3DStreakFlame className={`${iconSizes} transition-transform duration-200 group-hover:scale-110`} />
      <span className="font-extrabold text-[#431407] group-hover:text-black">
        Streak{count !== undefined ? ` · ${count}` : ''}
      </span>
    </button>
  );
}

/**
 * 4. STREAK BUTTON (CALENDAR VERSION)
 * Skeuomorphic soft lavender pill with 3D Purple Calendar & Fire Coin Seal
 */
export function StreakCalendarPillButton({
  size = 'md',
  count,
  className = '',
  ...props
}: ButtonProps & { count?: number | string }) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 gap-2 text-sm',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 gap-2.5 sm:gap-3 text-base sm:text-lg',
    lg: 'px-6 py-3 gap-3.5 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11',
  }[size];

  return (
    <button
      type="button"
      className={`group relative inline-flex items-center justify-center rounded-[20px] sm:rounded-[24px] font-extrabold tracking-tight transition-all duration-200 select-none cursor-pointer ${sizeClasses}
        bg-gradient-to-b from-[#faf5ff] via-[#f5edff] to-[#ede4ff]
        border-[1.5px] border-[#d8b4fe] hover:border-[#c084fc] active:border-[#a855f7]
        text-[#3b0764] hover:text-[#2e1065]
        shadow-[0_4px_16px_rgba(168,85,247,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)]
        hover:shadow-[0_6px_22px_rgba(168,85,247,0.28),inset_0_1px_2px_rgba(255,255,255,1)]
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${className}`}
      {...props}
    >
      <Icon3DStreakCalendar className={`${iconSizes} transition-transform duration-200 group-hover:scale-105`} />
      <span className="font-extrabold text-[#2e1065] group-hover:text-black">
        Streak{count !== undefined ? ` · ${count}` : ''}
      </span>
    </button>
  );
}

/**
 * 5. ALL 4 BUTTONS DISPLAY / SHOWCASE ROW
 * Can be rendered directly on the dashboard or anywhere in the app!
 */
export function ActionButtonsShowcaseRow({
  onRun,
  onSubmit,
  onStreakFlame,
  onStreakCalendar,
  streakCount = 12,
  size = 'md',
}: {
  onRun?: () => void;
  onSubmit?: () => void;
  onStreakFlame?: () => void;
  onStreakCalendar?: () => void;
  streakCount?: number | string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4.5">
      <RunPillButton size={size} onClick={onRun} />
      <SubmitPillButton size={size} onClick={onSubmit} />
      <StreakFlamePillButton size={size} count={streakCount} onClick={onStreakFlame} />
      <StreakCalendarPillButton size={size} onClick={onStreakCalendar} />
    </div>
  );
}
