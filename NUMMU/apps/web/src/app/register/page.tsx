'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  AtSign,
  Mail,
  Lock,
  GraduationCap,
  Users,
  Building2,
  Calendar,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthSocialButtons } from '@/components/auth/auth-social-buttons';
import { AuthRegisterShowcase } from '@/components/auth/auth-register-showcase';
import { PaperPlanes } from '@/components/auth/paper-planes';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('StrongPassword123!');
  const [college, setCollege] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [role, setRole] = useState<'student' | 'trainer'>('student');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await register({
        name: fullName || undefined,
        username: username || undefined,
        email,
        password,
        college: college || undefined,
        gradYear: gradYear ? parseInt(gradYear, 10) : undefined,
      });
      success('Account created successfully! Welcome to NUMU.', 'Registration Complete');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setErrorMessage(msg);
      error(msg, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-[#fbfcfd] text-slate-900 overflow-hidden relative select-none">
      {/* ── Background: Continuous Paper Planes Flying Across Entire Page ── */}
      <PaperPlanes />

      {/* ── Left Column: Value Proposition Showcase ── */}
      <div className="lg:w-1/2 h-full shrink-0 overflow-hidden">
        <AuthRegisterShowcase />
      </div>

      {/* ── Right Column: Fixed Window with Scrollable Inner Form (Matching Mockup) ── */}
      <div className="lg:w-1/2 h-full flex flex-col justify-between items-center relative bg-[#fafcfb] shrink-0 overflow-hidden">
        {/* Ambient Subtle Matrix Dots & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-200/20 blur-3xl pointer-events-none animate-float" />

        {/* Top Header: Link to Log in (Non-scrolling) */}
        <div className="w-full px-6 sm:px-10 py-4 flex items-center justify-end gap-3 text-xs relative z-20 shrink-0">
          <span className="text-slate-500 font-normal">Already have an account?</span>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-lg border border-emerald-600/40 text-emerald-800 font-semibold hover:bg-emerald-50 hover:border-emerald-600 transition-all active:scale-[0.98] shadow-2xs"
          >
            Log in
          </Link>
        </div>

        {/* ── Scrollable Form Area: Form container matches the screenshot exactly ── */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar px-4 sm:px-8 py-2 flex justify-center items-start z-10">
          <div className="w-full max-w-[460px] sm:max-w-[480px] my-auto py-3 bg-white border border-slate-100 shadow-xl shadow-slate-200/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5">
            {/* 1. Multi-Step Stepper Header */}
            <div className="flex items-center justify-between px-2 sm:px-4">
              {/* Step 1: Active */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#0b5c39] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  1
                </div>
                <span className="text-[11px] font-bold text-[#0b5c39] mt-1.5">
                  Create account
                </span>
              </div>

              <div className="flex-1 h-[1px] bg-slate-200 mx-3 -mt-4" />

              {/* Step 2: Next */}
              <div className="flex flex-col items-center opacity-60">
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1.5">
                  Personalize
                </span>
              </div>

              <div className="flex-1 h-[1px] bg-slate-200 mx-3 -mt-4" />

              {/* Step 3: Start learning */}
              <div className="flex flex-col items-center opacity-60">
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1.5">
                  Start learning
                </span>
              </div>
            </div>

            {/* 2. Form Title & Subtitle */}
            <div className="text-left space-y-1 pt-1">
              <h2 className="text-2xl sm:text-[27px] font-bold text-slate-900 tracking-tight leading-tight">
                Create your NUMU account
              </h2>
              <p className="text-xs sm:text-[13px] font-normal text-slate-500">
                Join thousands of learners and start your journey.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-left">
                {errorMessage}
              </div>
            )}

            {/* 3. Main Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left pt-1">
              {/* Row 1: Full name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AuthInput
                  label="Full name"
                  placeholder="John Doe"
                  icon={<User className="w-4 h-4 text-slate-400" />}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <AuthInput
                  label="Username"
                  placeholder="johndoe"
                  icon={<AtSign className="w-4 h-4 text-slate-400" />}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Row 2: Email */}
              <AuthInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Row 3: Password + Strength Indicator & Requirements */}
              <div className="space-y-1.5">
                <AuthInput
                  label="Password"
                  isPassword
                  placeholder="Create a strong password"
                  icon={<Lock className="w-4 h-4 text-slate-400" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* 5-bar Strength Indicator */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="h-1.5 flex-1 rounded-full bg-emerald-600" />
                    <div className="h-1.5 flex-1 rounded-full bg-emerald-600" />
                    <div className="h-1.5 flex-1 rounded-full bg-emerald-600" />
                    <div className="h-1.5 flex-1 rounded-full bg-emerald-600" />
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Strong</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Use at least 8 characters with a mix of{' '}
                  <span className="text-slate-600 font-medium">letters</span>,{' '}
                  <span className="text-slate-600 font-medium">numbers</span> and symbols.
                </p>
              </div>

              {/* Row 4: College / Institution & Graduation year Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    College / Institution
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select your college</option>
                      <option value="vit">Vellore Institute of Technology (VIT)</option>
                      <option value="iit">Indian Institute of Technology (IIT)</option>
                      <option value="bits">BITS Pilani</option>
                      <option value="nit">National Institute of Technology (NIT)</option>
                      <option value="other">Other Institution</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Graduation year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select year</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 5: "I am a" Role Selector */}
              <div className="space-y-1.5 pt-0.5">
                <label className="block text-xs font-semibold text-slate-700">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Student Option (Selected style matching screenshot) */}
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`
                      p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer
                      ${role === 'student'
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                      }
                    `}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        role === 'student'
                          ? 'bg-[#0b5c39] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        Student
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        I&apos;m here to learn and grow
                      </div>
                    </div>
                  </button>

                  {/* Trainer Option */}
                  <button
                    type="button"
                    onClick={() => setRole('trainer')}
                    className={`
                      p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer
                      ${role === 'trainer'
                        ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                      }
                    `}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        role === 'trainer'
                          ? 'bg-[#0b5c39] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        Trainer
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        I want to teach and manage students
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Row 6: Terms and Privacy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <Link
                      href={'/terms' as React.ComponentProps<typeof Link>['href']}
                      className="font-semibold text-emerald-800 hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href={'/privacy' as React.ComponentProps<typeof Link>['href']}
                      className="font-semibold text-emerald-800 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Row 7: Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0b5c39] hover:bg-[#08482c] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-950/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>{loading ? 'Creating account...' : 'Create account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 4. Social Auth Section (Placed below Submit Button as in screenshot) */}
            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                or continue with
              </span>
            </div>

            <AuthSocialButtons />
          </div>
        </div>

        {/* Empty bottom cushion */}
        <div className="h-2 shrink-0" />
      </div>
    </div>
  );
}
