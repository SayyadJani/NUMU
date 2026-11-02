'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string | undefined;
  message: string;
  duration?: number | undefined;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (message: string, title?: string | undefined) => void;
  error: (message: string, title?: string | undefined) => void;
  info: (message: string, title?: string | undefined) => void;
  warning: (message: string, title?: string | undefined) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: Toast = {
        id,
        type,
        message,
        ...(title !== undefined ? { title } : {}),
        ...(duration !== undefined ? { duration } : {}),
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration && duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast],
  );

  const success = useCallback(
    (message: string, title?: string | undefined) =>
      showToast({ type: 'success', message, ...(title !== undefined ? { title } : {}) }),
    [showToast],
  );

  const error = useCallback(
    (message: string, title?: string | undefined) =>
      showToast({ type: 'error', message, ...(title !== undefined ? { title } : {}) }),
    [showToast],
  );

  const info = useCallback(
    (message: string, title?: string | undefined) =>
      showToast({ type: 'info', message, ...(title !== undefined ? { title } : {}) }),
    [showToast],
  );

  const warning = useCallback(
    (message: string, title?: string | undefined) =>
      showToast({ type: 'warning', message, ...(title !== undefined ? { title } : {}) }),
    [showToast],
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toasts, showToast, success, error, info, warning, dismissToast }),
    [toasts, showToast, success, error, info, warning, dismissToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-white',
    error: 'border-rose-500/30 bg-slate-900/95 text-white',
    warning: 'border-amber-500/30 bg-slate-900/95 text-white',
    info: 'border-sky-500/30 bg-slate-900/95 text-white',
  };

  return (
    <div
      role="status"
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md
        transition-all duration-300 ease-out transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-3
        ${borderStyles[toast.type]}
      `}
    >
      {icons[toast.type]}

      <div className="flex-1 text-sm">
        {toast.title && <div className="font-semibold text-xs tracking-wide uppercase opacity-90 mb-0.5">{toast.title}</div>}
        <div className="text-slate-200 text-xs leading-relaxed">{toast.message}</div>
      </div>

      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
