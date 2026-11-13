'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  Code2,
  ClipboardCheck,
  Users,
  ShieldCheck,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  KeyRound,
  User,
  BookOpen,
  Building2,
  Terminal,
  Eye,
  EyeOff,
  Search,
  Laptop,
  Trash2,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Cpu,
  Database,
  Bell,
} from 'lucide-react';
import {
  adminApi,
  type AdminUser,
  type AdminSessionItem,
  type Role,
  purgeBrowserAuthStorage,
} from '@/lib/api';
import { StatusBadge, Modal, Button } from '@/components/ui/primitives';
import {
  NumuLogo,
  CharacterAvatar,
  PaperPlanes,
  AdminAuthShowcase,
} from '@/components/ui/brand';
import { OverviewPanel, type AdminModuleTab } from '@/components/panels/OverviewPanel';
import { QuestionsPanel } from '@/components/panels/QuestionsPanel';
import { TopicsPanel } from '@/components/panels/TopicsPanel';
import { TestsPanel } from '@/components/panels/TestsPanel';
import { StudentsPanel } from '@/components/panels/StudentsPanel';
import { BatchesPanel } from '@/components/panels/BatchesPanel';
import { SubmissionsPanel } from '@/components/panels/SubmissionsPanel';
import { DsaHubPanel } from '@/components/panels/DsaHubPanel';
import { DevelopmentPanel } from '@/components/panels/DevelopmentPanel';
import { SystemDesignPanel } from '@/components/panels/SystemDesignPanel';
import { CoreCsPanel } from '@/components/panels/CoreCsPanel';
import { NotificationsPanel } from '@/components/panels/NotificationsPanel';

const ALLOWED_STAFF_ROLES: Role[] = ['PLATFORM_ADMIN', 'TRAINER', 'COLLEGE_ADMIN'];

export default function AdminConsolePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminModuleTab>('overview');

  // Login form state
  const [identifier, setIdentifier] = useState('alex.rivera@numu.io');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Header Command Search & Profile Menu
  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Security & Active Sessions Modal
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [sessions, setSessions] = useState<AdminSessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Keyboard shortcut ⌘K / Ctrl+K for Global Module Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkSession = useCallback(async () => {
    setAuthLoading(true);
    purgeBrowserAuthStorage();
    try {
      const me = await adminApi.me();
      if (me && ALLOWED_STAFF_ROLES.includes(me.role)) {
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const loadActiveSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const list = await adminApi.getSessions();
      setSessions(Array.isArray(list) ? list : []);
    } catch (err: any) {
      notify(err.message || 'Could not load active sessions', 'error');
    } finally {
      setSessionsLoading(false);
    }
  }, [notify]);

  const openSecurityCenter = () => {
    setProfileMenuOpen(false);
    setSecurityModalOpen(true);
    void loadActiveSessions();
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await adminApi.revokeSession(sessionId);
      notify('Session revoked successfully');
      void loadActiveSessions();
    } catch (err: any) {
      notify(err.message || 'Failed to revoke session', 'error');
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await adminApi.logoutAll();
      setSecurityModalOpen(false);
      setUser(null);
      notify('Signed out from all active devices');
    } catch (err: any) {
      notify(err.message || 'Failed to sign out all devices', 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await adminApi.login(identifier.trim(), password);
      if (!ALLOWED_STAFF_ROLES.includes(res.user.role)) {
        await adminApi.logout().catch(() => null);
        setLoginError(
          `Access Denied: Account role "${res.user.role}" does not have administrative privileges. Required: PLATFORM_ADMIN, COLLEGE_ADMIN, or TRAINER.`,
        );
        return;
      }
      setUser(res.user);
      notify(`Welcome back, ${res.user.name || res.user.username || 'Admin'}!`);
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await adminApi.logout().catch(() => null);
    setUser(null);
    notify('Signed out of NUMU Admin Console');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbfcfd] flex flex-col items-center justify-center text-slate-900 gap-4">
        <NumuLogo size="lg" badge="ADMIN" />
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-700 rounded-full animate-spin" />
          <span>Verifying HttpOnly administrative session...</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. NUMU Split-Screen Login Page (Matches apps/web/src/app/login/page.tsx)
  // ───────────────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fbfcfd] text-slate-900 relative overflow-hidden">
        {/* Shared Flying Paper Planes */}
        <PaperPlanes />

        {/* Left Column — NUMU Admin Governance Path Showcase */}
        <AdminAuthShowcase />

        {/* Right Column — Form Area with Radial Emerald Dot Pattern */}
        <div
          className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative z-10"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="w-full max-w-[440px]">
            {/* Mobile Brand Header */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <NumuLogo size="md" badge="ADMIN" />
              <span className="text-[11px] font-bold text-[#0b5c39] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Shared Backend
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 overflow-hidden">
              {/* Card Header */}
              <div className="p-6 sm:p-8 pb-5 border-b border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-extrabold uppercase tracking-wider text-[#0b5c39] mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Authorized Staff & Trainer Portal
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Sign in to Admin Console
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Uses your existing NUMU account with <code className="font-mono text-[#0b5c39]">HttpOnly</code> session cookies and role-based access control.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="p-6 sm:p-8 pt-6 space-y-4">
                {loginError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <User className="w-3.5 h-3.5 text-[#0b5c39]" />
                    Admin Email or Username
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@numu.edu"
                    autoComplete="username"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0b5c39] focus:ring-2 focus:ring-emerald-500/15 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#0b5c39]" />
                      Password
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Argon2id / Bcrypt Verified
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0b5c39] focus:ring-2 focus:ring-emerald-500/15 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Fill Preset Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                      Default Platform Admin
                    </span>
                    <span className="font-mono text-[#0b5c39] text-xs font-bold">
                      admin@numu.edu • Admin@123
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('admin@numu.edu');
                      setPassword('Admin@123');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200 text-[#0b5c39] font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    Fill Creds
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-11 flex items-center justify-center gap-2 px-5 rounded-xl bg-[#0b5c39] hover:bg-[#094a2e] text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Admin Console</span>
                      <ArrowRight className="w-4 h-4 ml-0.5 opacity-85" />
                    </>
                  )}
                </button>

                {/* Enterprise Security Guarantee Banner */}
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0b5c39] shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      <strong className="text-slate-700">Zero Browser Storage Policy:</strong> Tokens are never written to <code className="font-mono">localStorage</code>. Protected by <code className="font-mono">HttpOnly</code> cookies, CSRF validation, and single-flight refresh rotation.
                    </div>
                  </div>
                </div>
              </form>

              <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  API: <code className="text-[#0b5c39] font-mono font-semibold">/api/v1</code>
                </span>
                <a
                  href="http://localhost:3000/login"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#0b5c39] hover:underline inline-flex items-center gap-1"
                >
                  Student Login <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Authenticated NUMU Dashboard Shell (Matches apps/web/src/components/dashboard/*)
  // ───────────────────────────────────────────────────────────────────────────
  const navItems: {
    id: AdminModuleTab;
    label: string;
    subtitle: string;
    group: 'Overview' | 'Practice Tracks & Hub' | 'Curriculum & Questions' | 'Assessments & Exams' | 'Directory & Pipeline';
    keywords: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'overview',
      label: 'Command Center',
      subtitle: 'Live KPIs & Readiness',
      group: 'Overview',
      keywords: 'dashboard overview home metrics stats kpi command center',
      icon: LayoutDashboard,
    },
    {
      id: 'dsa-hub',
      label: 'DSA Practice Hub',
      subtitle: 'Daily & Curated Cards',
      group: 'Practice Tracks & Hub',
      keywords: 'dsa hub daily challenge schedule curated today practice featured test xp bonus',
      icon: Sparkles,
    },
    {
      id: 'development',
      label: 'Development Track',
      subtitle: 'Capstones & Sprints',
      group: 'Practice Tracks & Hub',
      keywords: 'development fullstack projects capstone milestones roadmap frontend backend devops',
      icon: Laptop,
    },
    {
      id: 'system-design',
      label: 'System Design',
      subtitle: 'HLD, LLD & Scenarios',
      group: 'Practice Tracks & Hub',
      keywords: 'system design hld lld architecture distributed scalability case studies solid patterns',
      icon: Cpu,
    },
    {
      id: 'core-cs',
      label: 'Core CS Hub',
      subtitle: 'DBMS, OS, CN & OOPs',
      group: 'Practice Tracks & Hub',
      keywords: 'core cs dbms sql os operating systems cn computer networks oops interview questions',
      icon: Database,
    },
    {
      id: 'questions',
      label: 'Problem Bank',
      subtitle: 'DSA & Test Cases',
      group: 'Curriculum & Questions',
      keywords: 'questions problems dsa bulk upload csv json testcases boilerplate',
      icon: Code2,
    },
    {
      id: 'topics',
      label: 'Topics & Syllabus',
      subtitle: 'Curriculum Taxonomy',
      group: 'Curriculum & Questions',
      keywords: 'topics curriculum syllabus difficulty distribution accuracy taxonomy',
      icon: BookOpen,
    },
    {
      id: 'tests',
      label: 'Assessments & Tests',
      subtitle: 'Proctoring & Reassign',
      group: 'Assessments & Exams',
      keywords: 'tests assessments exams proctoring fullscreen copy paste tab switch reassign duplicate',
      icon: ClipboardCheck,
    },
    {
      id: 'notifications',
      label: 'Broadcast Notifications',
      subtitle: 'Announcements & Alerts',
      group: 'Assessments & Exams',
      keywords: 'notifications broadcast announcements alerts push messaging students',
      icon: Bell,
    },
    {
      id: 'students',
      label: 'Students & 360° Stats',
      subtitle: 'Directory & Analytics',
      group: 'Directory & Pipeline',
      keywords: 'students users directory 360 analytics profile progress weak topics',
      icon: Users,
    },
    {
      id: 'batches',
      label: 'Batches & Cohorts',
      subtitle: 'Cohort Analytics',
      group: 'Directory & Pipeline',
      keywords: 'batches cohorts organizations colleges trainers members',
      icon: Building2,
    },
    {
      id: 'submissions',
      label: 'Judge0 Submissions',
      subtitle: 'Compiler & Verdict Logs',
      group: 'Directory & Pipeline',
      keywords: 'submissions judge0 code verdicts runtime memory compiler logs',
      icon: Terminal,
    },
  ];

  const filteredNavItems = cmdQuery.trim()
    ? navItems.filter((item) =>
        `${item.label} ${item.subtitle} ${item.keywords}`
          .toLowerCase()
          .includes(cmdQuery.trim().toLowerCase()),
      )
    : navItems;

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 bg-slate-900 text-white border-slate-800">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Fixed Top Header (Matches apps/web/src/components/dashboard/dashboard-header.tsx) ── */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: NUMU Brand Lockup */}
        <div className="flex items-center gap-3">
          <NumuLogo
            size="sm"
            badge="ADMIN"
            onClick={() => setActiveTab('overview')}
          />
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 pl-2 border-l border-slate-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Shared NUMU Platform
          </span>
        </div>

        {/* Center: Global Module Quick-Jump Search Bar (⌘K) */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={cmdQuery}
              onFocus={() => setCmdOpen(true)}
              onChange={(e) => {
                setCmdQuery(e.target.value);
                setCmdOpen(true);
              }}
              placeholder="Jump to module, proctoring, bulk upload, analytics..."
              className="w-full h-9 pl-9 pr-14 rounded-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-emerald-600 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition-all"
            />
            <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded-md">
              ⌘K
            </kbd>
          </div>

          {cmdOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setCmdOpen(false)}
              />
              <div className="absolute left-0 right-0 top-11 z-20 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Admin Modules & Tools
                </div>
                {filteredNavItems.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-slate-400">
                    No matching admin modules found.
                  </div>
                ) : (
                  filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setCmdOpen(false);
                          setCmdQuery('');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-50/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-emerald-700" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#0b5c39]">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-700" />
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Quick Actions, Security Center & Profile Menu */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openSecurityCenter}
            title="Inspect Active Sessions & Security Policies"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200/90 text-[11px] font-bold text-[#0b5c39] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{user.role.replace('_', ' ')}</span>
          </button>

          <a
            href="http://localhost:3000/dashboard"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <span>Student App</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Profile Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <CharacterAvatar seed={user.name || user.email} size={30} />
              <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[120px] truncate">
                {user.name || user.username || 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 z-20 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="text-xs font-extrabold text-slate-900 truncate">
                      {user.name || user.username}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <div className="mt-1.5">
                      <StatusBadge value={user.role} />
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={openSecurityCenter}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#0b5c39] transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Active Sessions & Security</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setActiveTab('tests');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <ClipboardCheck className="w-4 h-4 text-slate-500" />
                      <span>Manage Proctored Tests</span>
                    </button>
                  </div>

                  <div className="p-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Fixed Left Sidebar (Matches apps/web/src/components/dashboard/dashboard-sidebar.tsx) ── */}
      <aside className="fixed left-0 top-14 z-20 hidden lg:flex h-[calc(100vh-56px)] w-[268px] flex-col justify-between border-r border-slate-200/85 bg-white px-3.5 py-4 select-none">
        <div className="space-y-4 overflow-y-auto no-scrollbar">
          {[
            {
              group: 'Overview',
              items: navItems.filter((i) => i.group === 'Overview'),
            },
            {
              group: 'Practice Tracks & Hub',
              items: navItems.filter((i) => i.group === 'Practice Tracks & Hub'),
            },
            {
              group: 'Curriculum & Questions',
              items: navItems.filter((i) => i.group === 'Curriculum & Questions'),
            },
            {
              group: 'Assessments & Exams',
              items: navItems.filter((i) => i.group === 'Assessments & Exams'),
            },
            {
              group: 'Directory & Pipeline',
              items: navItems.filter((i) => i.group === 'Directory & Pipeline'),
            },
          ].map((sec) => (
            <div key={sec.group} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {sec.group}
              </div>
              {sec.items.map((item) => {
                const active = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`relative w-full flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all cursor-pointer text-left ${
                      active
                        ? 'bg-emerald-50/90 text-[#0b5c39] font-bold shadow-2xs ring-1 ring-emerald-200/80'
                        : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#0b5c39]" />
                    )}
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        active ? 'bg-[#0b5c39] text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          active ? 'text-emerald-700/85 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Proctoring & Security Status Card */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0b5c39]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Exam Guardrails
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Fullscreen lock, copy-paste toggle &amp; auto-submit on{' '}
              <strong className="text-rose-700">&gt;3 tab switches</strong> with attempt reassignment.
            </p>
          </div>

          <div className="px-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>v1.0.0 • NUMU ADMIN</span>
            <button
              type="button"
              onClick={openSecurityCenter}
              className="text-[#0b5c39] font-bold hover:underline cursor-pointer"
            >
              Security
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Module Switcher Bar */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-20 bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Content Workspace (Matches apps/web/src/components/dashboard/dashboard-shell.tsx) ── */}
      <div className="pt-26 lg:pt-14 lg:pl-[268px] min-h-screen flex flex-col">
        {/* Contextual Workspace Sub-Bar */}
        <div className="bg-white/75 backdrop-blur-xs border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-bold text-[#0b5c39]">NUMU Admin Console</span>
              <span>/</span>
              <span className="text-slate-400 hidden sm:inline">
                {navItems.find((n) => n.id === activeTab)?.group}
              </span>
              <span className="hidden sm:inline">/</span>
              <span className="font-extrabold text-slate-900">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
              <span className="hidden md:inline text-slate-400">
                — {navItems.find((n) => n.id === activeTab)?.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('dsa-hub')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[11px] font-bold text-[#0b5c39] transition-colors cursor-pointer"
              >
                + Daily Challenge
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
              >
                + Upload Problem
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tests')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[11px] font-bold text-[#0b5c39] transition-colors cursor-pointer"
              >
                + Arrange Assessment
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === 'overview' && (
            <OverviewPanel onNavigate={(tab) => setActiveTab(tab)} onNotify={notify} />
          )}
          {activeTab === 'dsa-hub' && <DsaHubPanel onNotify={notify} />}
          {activeTab === 'questions' && <QuestionsPanel onNotify={notify} />}
          {activeTab === 'topics' && <TopicsPanel onNotify={notify} />}
          {activeTab === 'development' && <DevelopmentPanel onNotify={notify} />}
          {activeTab === 'system-design' && <SystemDesignPanel onNotify={notify} />}
          {activeTab === 'core-cs' && <CoreCsPanel onNotify={notify} />}
          {activeTab === 'tests' && <TestsPanel onNotify={notify} />}
          {activeTab === 'notifications' && <NotificationsPanel onNotify={notify} />}
          {activeTab === 'students' && <StudentsPanel onNotify={notify} />}
          {activeTab === 'batches' && <BatchesPanel onNotify={notify} />}
          {activeTab === 'submissions' && <SubmissionsPanel onNotify={notify} />}
        </main>
      </div>

      {/* ── Enterprise Security & Active Sessions Modal ── */}
      <Modal
        open={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        title="Admin Security & Active Sessions"
        subtitle="Manage your HttpOnly authenticated devices, RBAC permissions, and session revocation"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSecurityModalOpen(false)}>
              Close
            </Button>
            <Button variant="danger" icon={LogOut} onClick={handleLogoutAllDevices}>
              Sign Out All Devices
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Security Policy Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Token Storage
              </div>
              <div className="text-xs font-black text-slate-900 mt-0.5">
                HttpOnly + SameSite=Lax
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Zero localStorage exposure
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                RBAC Role Scope
              </div>
              <div className="text-xs font-black text-slate-900 mt-0.5">{user.role}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Verified on every API call
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                CSRF & Frame Guard
              </div>
              <div className="text-xs font-black text-slate-900 mt-0.5">
                X-Frame-Options: DENY
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Single-flight token rotation
              </div>
            </div>
          </div>

          {/* Active Sessions List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Active Authenticated Sessions ({sessions.length})
              </h4>
              <button
                type="button"
                onClick={loadActiveSessions}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0b5c39] hover:underline cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {sessionsLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Loading active sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Current session active via HttpOnly cookie.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 bg-white flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {sess.ipAddress || 'Localhost / 127.0.0.1'}
                          </span>
                          {sess.isCurrent && (
                            <StatusBadge value="PUBLISHED" label="Current Session" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                          {sess.userAgent || 'Browser Session'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Last active: {new Date(sess.lastActivityAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleRevokeSession(sess.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
