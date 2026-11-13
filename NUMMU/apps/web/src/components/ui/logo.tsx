'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/lib/constants/assets';
import { useTheme } from '@/contexts/theme-context';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

const HEIGHT: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 28,
  md: 38,
  lg: 52,
};
const ASPECT = 3.2;

export function Logo({ className = '', size = 'md', theme }: LogoProps) {
  const { isDark } = useTheme();
  const h = HEIGHT[size];
  const w = Math.round(h * ASPECT);
  const useDarkVariant = theme === 'dark' || (theme === undefined && isDark);

  if (useDarkVariant) {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <Image
          src={ASSETS.brand.icon.src}
          alt={ASSETS.brand.icon.alt}
          width={h}
          height={h}
          priority
          className="object-contain rounded-lg"
        />
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight text-white ${
              size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'
            }`}
          >
            NUMU
          </span>
          <span className="text-[7px] font-bold tracking-widest text-emerald-400 uppercase mt-0.5">
            Learn • Build • Grow
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={ASSETS.brand.logo.src}
      alt={ASSETS.brand.logo.alt}
      width={w}
      height={h}
      priority
      className={`select-none object-contain ${className}`}
    />
  );
}
