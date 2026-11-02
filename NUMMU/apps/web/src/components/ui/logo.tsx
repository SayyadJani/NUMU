import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/lib/constants/assets';

interface LogoProps {
  className?: string;
  /**
   * sm → 28px tall  (sidebar, footer)
   * md → 38px tall  (navbar — default)
   * lg → 52px tall  (hero lockup)
   */
  size?: 'sm' | 'md' | 'lg';
  /** Reserved for future dark variant */
  theme?: 'light' | 'dark';
}

// Height in px per size; width is derived from the 3.2:1 aspect ratio of the lockup
const HEIGHT: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 28,
  md: 38,
  lg: 52,
};
const ASPECT = 3.2;

export function Logo({ className = '', size = 'md', theme: _theme = 'light' }: LogoProps) {
  const h = HEIGHT[size];
  const w = Math.round(h * ASPECT);

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
