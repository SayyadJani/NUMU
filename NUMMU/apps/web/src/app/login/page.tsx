'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthPathShowcase } from '@/components/auth/auth-path-showcase';
import { PaperPlanes } from '@/components/auth/paper-planes';

import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      await login({ identifier: email, password });
      success('Welcome back to NUMU!', 'Login Successful');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials';
      setErrorMessage(msg);
      error(msg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fbfcfd] text-slate-900 overflow-hidden relative select-none">
      {/* ── Background: Continuous Paper Planes Flying in Loop Across the Whole Page ── */}
      <PaperPlanes />

      {/* ── Left Column: Career Path Showcase from Mockup ── */}
      <div className="lg:w-1/2 min-h-screen shrink-0 overflow-hidden relative">
        <AuthPathShowcase />
      </div>

      {/* ── Right Column: Clean White Form from Mockup ── */}
      <div className="lg:w-1/2 min-h-screen p-6 sm:p-10 lg:p-12 flex flex-col justify-between items-center relative bg-white lg:bg-[#fbfcfd] shrink-0 overflow-hidden z-10">
        {/* Subtle grid pattern matching mockup */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(#10b981 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Header: Link to Create Account */}
        <div className="w-full flex items-center justify-end gap-3 text-xs relative z-20">
          <span className="text-slate-500 font-medium">New to NUMU?</span>
          <Link
            href="/register"
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:border-[#0b5c39] bg-white text-[#0b5c39] font-bold transition-all active:scale-[0.98] shadow-2xs hover:bg-emerald-50/50"
          >
            Create account
          </Link>
        </div>

        {/* Center: Login Form Card */}
        <div className="relative z-20 w-full max-w-[420px] my-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-100 p-7 sm:p-9 space-y-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0b5c39] tracking-wider uppercase inline-block">
              WELCOME BACK
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Log in to NUMU
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Continue your learning journey
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-left">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {/* Email Input */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 transition-all outline-none hover:border-slate-300 focus:border-[#0b5c39] focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 transition-all outline-none hover:border-slate-300 focus:border-[#0b5c39] focus:ring-2 focus:ring-emerald-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#0b5c39] focus:ring-[#0b5c39] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <Link
                href={'/forgot-password' as React.ComponentProps<typeof Link>['href']}
                className="font-medium text-xs text-[#0b5c39] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0b5c39] hover:bg-[#08482c] disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99] mt-2"
            >
              <span>{loading ? 'Logging in...' : 'Log in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <span className="relative bg-white px-3 text-[11px] text-slate-400 font-medium">
              or continue with
            </span>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Google */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <div className="bg-[#f25022] w-1.5 h-1.5 rounded-[1px]" />
                <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-[1px]" />
                <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-[1px]" />
                <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-[1px]" />
              </div>
              <span>Microsoft</span>
            </button>
          </div>

          {/* Security Banner matching mockup */}
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-semibold text-slate-800">
                Your data is secure with enterprise-grade encryption.
              </span>
              <span className="block text-slate-500 mt-0.5">
                We care about your privacy.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Links */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-3 relative z-20">
          <div className="flex items-center gap-4">
            <Link href={'/about' as React.ComponentProps<typeof Link>['href']} className="hover:text-slate-600 transition-colors">About</Link>
            <Link href={'/privacy' as React.ComponentProps<typeof Link>['href']} className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href={'/terms' as React.ComponentProps<typeof Link>['href']} className="hover:text-slate-600 transition-colors">Terms</Link>
            <Link href={'/support' as React.ComponentProps<typeof Link>['href']} className="hover:text-slate-600 transition-colors">Support</Link>
          </div>
          <div>© 2024 NUMU. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
