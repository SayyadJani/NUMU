import React from 'react';
import { ArrowRight } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'mint' | 'dark' | 'emerald' | 'ghost' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
  leftIcon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  leftIcon,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-5 py-2.5 rounded-lg gap-2 font-semibold',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-semibold',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#0b5c39] hover:bg-[#094b2e] text-white shadow-sm shadow-[#0b5c39]/20 transition-all active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 shadow-xs transition-all active:scale-[0.98]',
    mint: 'bg-[#34d399] hover:bg-[#2ecc8f] text-[#064e3b] shadow-md shadow-[#34d399]/20 transition-all active:scale-[0.98]',
    dark: 'bg-transparent hover:bg-white/10 text-white border border-white/20 transition-all active:scale-[0.98]',
    emerald:
      'bg-[#10b981] hover:bg-[#059669] text-white shadow-md shadow-[#10b981]/25 transition-all active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 transition-colors',
    outline: 'bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors',
    destructive: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && withArrow && <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}
