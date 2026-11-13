'use client';

import React, { useEffect } from 'react';
import {
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Inbox,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Unified Badge Map (Status, Difficulty, Role, Verdict)
// ─────────────────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, { badge: string; dot: string }> = {
  // Difficulty
  EASY: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dot: 'bg-emerald-500',
  },
  MEDIUM: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  HARD: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-500',
  },
  // Content status
  PUBLISHED: {
    badge: 'bg-emerald-50 text-[#0b5c39] border-emerald-200/90',
    dot: 'bg-emerald-600',
  },
  DRAFT: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  ARCHIVED: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  // Attempt status
  SUBMITTED: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dot: 'bg-emerald-500',
  },
  COMPLETED: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dot: 'bg-emerald-500',
  },
  IN_PROGRESS: {
    badge: 'bg-sky-50 text-sky-800 border-sky-200/90',
    dot: 'bg-sky-500',
  },
  AUTO_SUBMITTED: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-500',
  },
  EXPIRED: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  // Judge0 Verdicts (both short & full names)
  AC: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dot: 'bg-emerald-500',
  },
  ACCEPTED: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dot: 'bg-emerald-500',
  },
  WA: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-500',
  },
  WRONG_ANSWER: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-500',
  },
  TLE: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  TIME_LIMIT_EXCEEDED: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  MLE: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  MEMORY_LIMIT_EXCEEDED: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  CE: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-600',
  },
  COMPILATION_ERROR: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-600',
  },
  RE: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-500',
  },
  RUNTIME_ERROR: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-500',
  },
  PENDING: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  // Roles
  PLATFORM_ADMIN: {
    badge: 'bg-emerald-50 text-[#0b5c39] border-emerald-200/90',
    dot: 'bg-[#0b5c39]',
  },
  COLLEGE_ADMIN: {
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200/90',
    dot: 'bg-indigo-500',
  },
  TRAINER: {
    badge: 'bg-teal-50 text-teal-800 border-teal-200/90',
    dot: 'bg-teal-500',
  },
  STUDENT: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
  // Generic
  ACTIVE: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dot: 'bg-emerald-500',
  },
  SUSPENDED: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/90',
    dot: 'bg-rose-500',
  },
  VIOLATION: {
    badge: 'bg-rose-100/90 text-rose-900 border-rose-300',
    dot: 'bg-rose-600',
  },
};

export function StatusBadge({
  value,
  label,
  className = '',
  showDot = true,
}: {
  value: string;
  label?: string | undefined;
  className?: string | undefined;
  showDot?: boolean | undefined;
}) {
  const key = (value || '').toUpperCase();
  const entry = BADGE_STYLES[key] || {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };
  const displayLabel = label ?? value?.replace(/_/g, ' ');
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-tight whitespace-nowrap ${entry.badge} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.dot}`} />}
      {displayLabel}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Button
// ─────────────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-[#0d6941] to-[#0b5c39] hover:from-[#0b5c39] hover:to-[#08472c] text-white border border-[#08472c]/40 shadow-xs shadow-emerald-950/10',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs',
  danger:
    'bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border border-rose-800/30 shadow-xs',
  ghost:
    'bg-transparent hover:bg-slate-100/90 text-slate-600 hover:text-slate-900 border border-transparent',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant | undefined;
  size?: 'sm' | 'md' | undefined;
  loading?: boolean | undefined;
  icon?: LucideIcon | undefined;
}) {
  const sizeClass =
    size === 'sm' ? 'px-3 py-1.5 text-xs rounded-xl' : 'px-4 py-2 text-xs rounded-xl';
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-150 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none ${BUTTON_VARIANTS[variant]} ${sizeClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PageHeader & StatCard & SectionCard
// ─────────────────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  badge,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle: string;
  badge?: string | undefined;
  icon?: LucideIcon | undefined;
  actions?: React.ReactNode | undefined;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/85 p-5 sm:p-6 mb-6 shadow-2xs">
      {/* Subtle Top Emerald Accent Line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0b5c39] via-emerald-500 to-teal-400" />
      <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/5 blur-2xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {Icon && (
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#0b5c39] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] font-extrabold uppercase tracking-wider text-[#0b5c39]">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                {badge || 'NUMU Admin Governance'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {title}
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = 'emerald',
  onClick,
}: {
  label: string;
  value: string | number;
  sublabel?: string | undefined;
  icon: LucideIcon;
  tone?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | undefined;
  onClick?: (() => void) | undefined;
}) {
  const tones = {
    emerald: {
      iconBox: 'bg-emerald-50 text-[#0b5c39] border-emerald-200/80',
      bar: 'from-[#0b5c39] to-emerald-500',
    },
    blue: {
      iconBox: 'bg-sky-50 text-sky-700 border-sky-200/80',
      bar: 'from-sky-600 to-blue-500',
    },
    amber: {
      iconBox: 'bg-amber-50 text-amber-700 border-amber-200/80',
      bar: 'from-amber-500 to-orange-500',
    },
    rose: {
      iconBox: 'bg-rose-50 text-rose-700 border-rose-200/80',
      bar: 'from-rose-600 to-pink-500',
    },
    purple: {
      iconBox: 'bg-purple-50 text-purple-700 border-purple-200/80',
      bar: 'from-purple-600 to-indigo-500',
    },
  };

  const t = tones[tone];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/85 p-4 sm:p-5 shadow-2xs transition-all duration-200 flex items-start justify-between gap-3 ${
        onClick
          ? 'cursor-pointer hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5'
          : 'hover:border-slate-300/90'
      }`}
    >
      <div className={`pointer-events-none absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${t.bar} opacity-75`} />
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
          {label}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight tabular-nums">
          {value}
        </div>
        {sublabel && (
          <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">{sublabel}</div>
        )}
      </div>
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${t.iconBox}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string | undefined;
  icon?: LucideIcon | undefined;
  actions?: React.ReactNode | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/85 shadow-2xs overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/40">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#0b5c39]" />}
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Form Controls (FormField, Input, Select, Textarea, Toggle)
// ─────────────────────────────────────────────────────────────────────────────

export function FormField({
  label,
  hint,
  required,
  children,
  className = '',
}: {
  label: string;
  hint?: string | undefined;
  required?: boolean | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {hint && <span className="text-[11px] text-slate-400 font-medium">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export const inputBaseClass =
  'w-full px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/15 focus:border-[#0b5c39] transition-all shadow-2xs';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBaseClass} ${props.className || ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBaseClass} ${props.className || ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBaseClass} ${props.className || ''}`} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string | undefined;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
        checked
          ? 'border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-50/70'
          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
      }`}
    >
      <div>
        <div className="text-xs font-bold text-slate-800">{label}</div>
        {description && <div className="text-[11px] text-slate-500 mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`w-10 h-5.5 rounded-full transition-colors p-0.5 shrink-0 ${
          checked ? 'bg-[#0b5c39]' : 'bg-slate-300'
        }`}
      >
        <span
          className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
            checked ? 'translate-x-4.5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FilterBar (Search + Select Filters + Refresh)
// ─────────────────────────────────────────────────────────────────────────────

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  onRefresh,
  children,
}: {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string | undefined;
  onRefresh?: (() => void) | undefined;
  children?: React.ReactNode | undefined;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 p-3.5 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200/90 bg-slate-50/70 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/15 focus:border-[#0b5c39] transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={onRefresh}
            title="Sync latest data"
          >
            Sync
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Generic DataTable<T> with Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  header: string;
  className?: string | undefined;
  render: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  data,
  rowKey,
  loading = false,
  emptyMessage,
  emptyTitle,
  emptySubtitle,
  page,
  totalPages,
  total,
  totalItems,
  onPageChange,
}: {
  columns: ColumnDef<T>[];
  rows?: T[] | undefined;
  data?: T[] | undefined;
  rowKey: (row: T) => string;
  loading?: boolean | undefined;
  emptyMessage?: string | undefined;
  emptyTitle?: string | undefined;
  emptySubtitle?: string | undefined;
  page?: number | undefined;
  totalPages?: number | undefined;
  total?: number | undefined;
  totalItems?: number | undefined;
  onPageChange?: ((nextPage: number) => void) | undefined;
}) {
  const actualRows = rows ?? data ?? [];
  const actualTotal = total ?? totalItems;
  const primaryEmpty = emptyTitle || emptyMessage || 'No matching records found';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/85 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              {columns.map((col) => (
                <th key={col.key} className={`py-3.5 px-4 whitespace-nowrap ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center text-slate-400">
                  <div className="inline-flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0b5c39]" />
                    <span className="font-semibold text-slate-500">Loading platform records...</span>
                  </div>
                </td>
              </tr>
            ) : actualRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-14 px-6 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-extrabold text-slate-700">{primaryEmpty}</div>
                    {emptySubtitle && (
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {emptySubtitle}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              actualRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="hover:bg-emerald-50/25 transition-colors group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 align-middle ${col.className || ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info / Pagination */}
      {(actualRows.length > 0 || (page !== undefined && totalPages !== undefined && totalPages > 1)) && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{actualRows.length}</strong> record(s)
            {actualTotal !== undefined && (
              <span className="text-slate-400 ml-1">of {actualTotal} total</span>
            )}
          </div>

          {page !== undefined && totalPages !== undefined && totalPages > 1 && onPageChange && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                Page <strong className="text-slate-800">{page}</strong> of{' '}
                <strong className="text-slate-800">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Modal & ConfirmModal
// ─────────────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-3xl',
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | undefined;
  maxWidth?: string | undefined;
  footer?: React.ReactNode | undefined;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className={`relative bg-white rounded-3xl w-full ${maxWidth} shadow-2xl border border-slate-200/90 overflow-hidden my-auto flex flex-col max-h-[90vh]`}
      >
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0b5c39] via-emerald-500 to-teal-400" />
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">{children}</div>

        {footer && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string | undefined;
  loading?: boolean | undefined;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="pt-1">{description}</p>
      </div>
    </Modal>
  );
}
