'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  ShieldAlert,
  GraduationCap,
  Download,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, downloadCsv, type AdminUser, type Role, type StudentAnalyticsResponse } from '@/lib/api';
import {
  PageHeader,
  StatCard,
  FilterBar,
  DataTable,
  Modal,
  ConfirmModal,
  Button,
  FormField,
  Input,
  Select,
  Toggle,
  StatusBadge,
  type ColumnDef,
} from '@/components/ui/primitives';
import { CharacterAvatar } from '@/components/ui/brand';

interface UserFormState {
  id?: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  isActive: boolean;
  college: string;
  gradYear: string;
}

const emptyUserForm = (): UserFormState => ({
  name: '',
  email: '',
  username: '',
  password: '',
  role: 'STUDENT',
  isActive: true,
  college: '',
  gradYear: '2027',
});

export function StudentsPanel({ onNotify }: { onNotify: (msg: string, type?: 'success' | 'error') => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<UserFormState>(() => emptyUserForm());
  const [saving, setSaving] = useState(false);

  // Student 360 Inspector & Analytics Modal
  const [inspectDetail, setInspectDetail] = useState<any | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalyticsResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listUsers({
        page,
        limit: 15,
        search: search || undefined,
        role: roleFilter || undefined,
        isActive: activeFilter || undefined,
      });
      setUsers(res.data || []);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load students & users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter, onNotify]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openCreateModal = () => {
    setForm(emptyUserForm());
    setModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setForm({
      id: u.id,
      name: u.name || '',
      email: u.email,
      username: u.username || '',
      password: '',
      role: u.role,
      isActive: u.isActive,
      college: u.profile?.college || '',
      gradYear: u.profile?.gradYear ? String(u.profile.gradYear) : '',
    });
    setModalOpen(true);
  };

  const openInspector = async (u: AdminUser) => {
    try {
      setLoadingDetail(true);
      setInspectDetail({ ...u, testAttempts: [], submissions: [] });
      setStudentAnalytics(null);
      const [detail, analytics] = await Promise.all([
        adminApi.getUser(u.id),
        adminApi.getStudentAnalytics(u.id).catch(() => null),
      ]);
      setInspectDetail(detail);
      setStudentAnalytics(analytics);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load student details', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExportStudentsCsv = () => {
    downloadCsv(
      'numu-students-directory.csv',
      users.map((u) => ({
        id: u.id,
        name: u.name || '',
        email: u.email,
        username: u.username || '',
        role: u.role,
        status: u.isActive ? 'ACTIVE' : 'SUSPENDED',
        college: u.profile?.college || '',
        gradYear: u.profile?.gradYear ?? '',
        batches: (u.batches || []).map((b) => b.name).join('; '),
        submissionsCount: u.submissionsCount ?? 0,
        testAttemptsCount: u.testAttemptsCount ?? 0,
      })),
    );
  };

  const handleSaveUser = async () => {
    if (!form.email.trim()) {
      onNotify('Email address is required', 'error');
      return;
    }

    const payload: Record<string, unknown> = {
      email: form.email.trim(),
      name: form.name.trim() || undefined,
      username: form.username.trim() || undefined,
      role: form.role,
      isActive: form.isActive,
      college: form.college.trim() || undefined,
      ...(form.gradYear && { gradYear: Number(form.gradYear) }),
      ...(form.password.trim() && { password: form.password.trim() }),
    };

    try {
      setSaving(true);
      if (form.id) {
        await adminApi.updateUser(form.id, payload);
        onNotify(`User "${form.name || form.email}" updated`);
      } else {
        await adminApi.createUser(payload);
        onNotify(`Account "${form.email}" created`);
      }
      setModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      onNotify(err.message || 'Failed to save user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggleActive = async (u: AdminUser) => {
    try {
      await adminApi.updateUser(u.id, { isActive: !u.isActive });
      onNotify(
        `${u.name || u.email} ${!u.isActive ? 'activated' : 'suspended'}`,
      );
      await loadUsers();
    } catch (err: any) {
      onNotify(err.message || 'Failed to update status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await adminApi.deleteUser(deleteTarget.id);
      onNotify(`User "${deleteTarget.email}" deleted`);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      key: 'student',
      header: 'Student / User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <CharacterAvatar seed={row.name || row.email} size={34} />
          <div className="min-w-0">
            <div className="font-extrabold text-slate-900 truncate">
              {row.name || 'Unnamed User'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {row.email} {row.username ? `• @${row.username}` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'college',
      header: 'College & Batches',
      render: (row) => (
        <div className="text-slate-700 space-y-1">
          <div>
            <span className="font-medium">{row.profile?.college || '—'}</span>
            {row.profile?.gradYear && (
              <span className="text-[11px] text-slate-400 ml-1">({row.profile.gradYear})</span>
            )}
          </div>
          {row.batches && row.batches.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {row.batches.map((b) => (
                <span
                  key={b.id}
                  className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold"
                >
                  {b.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <StatusBadge value={row.role} />,
    },
    {
      key: 'activity',
      header: 'Activity',
      render: (row) => (
        <div className="text-slate-600">
          <span className="font-semibold text-slate-800">{row.submissionsCount ?? 0}</span> Submissions •{' '}
          <span className="font-semibold text-slate-800">{row.testAttemptsCount ?? 0}</span> Tests
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleQuickToggleActive(row)}
          title="Click to toggle Active / Suspended"
          className="cursor-pointer"
        >
          <StatusBadge
            value={row.isActive ? 'ACTIVE' : 'SUSPENDED'}
            label={row.isActive ? 'Active' : 'Suspended'}
          />
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          <Button variant="secondary" size="sm" icon={BarChart3} onClick={() => openInspector(row)}>
            360° Analytics
          </Button>
          <Button variant="secondary" size="sm" icon={Edit3} onClick={() => openEditModal(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteTarget(row)}
            className="text-rose-600 hover:bg-rose-50"
          />
        </div>
      ),
    },
  ];

  const studentCount = users.filter((u) => u.role === 'STUDENT').length;
  const activeCount = users.filter((u) => u.isActive).length;
  const staffCount = users.filter((u) => u.role !== 'STUDENT').length;

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Directory & 360° Mastery"
        icon={GraduationCap}
        title="Students & Users Management"
        subtitle="Enroll students, manage college cohorts, assign trainer/admin roles, suspend accounts, and inspect student-wise DSA & test analytics"
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExportStudentsCsv}>
              Export CSV
            </Button>
            <Button icon={UserPlus} onClick={openCreateModal}>
              Add Student / User
            </Button>
          </>
        }
      />

      {/* Directory KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Directory Users"
          value={total || users.length}
          sublabel="Registered platform accounts"
          icon={GraduationCap}
          tone="emerald"
        />
        <StatCard
          label="Enrolled Students"
          value={studentCount}
          sublabel="Active learners in cohorts"
          icon={TrendingUp}
          tone="blue"
        />
        <StatCard
          label="Active Accounts"
          value={activeCount}
          sublabel="Verified & enabled"
          icon={CheckCircle2}
          tone="purple"
        />
        <StatCard
          label="Trainers & Staff"
          value={staffCount}
          sublabel="Authorized console operators"
          icon={ShieldAlert}
          tone="amber"
        />
      </div>

      {/* Quick Role Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: '', label: 'All Accounts' },
          { id: 'STUDENT', label: 'Students' },
          { id: 'TRAINER', label: 'Trainers' },
          { id: 'COLLEGE_ADMIN', label: 'College Admins' },
          { id: 'PLATFORM_ADMIN', label: 'Platform Admins' },
        ].map((pill) => {
          const active = roleFilter === pill.id;
          return (
            <button
              key={pill.id || 'all'}
              type="button"
              onClick={() => {
                setRoleFilter(pill.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                active
                  ? 'bg-[#0b5c39] text-white border-[#0b5c39] shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, @username, or college..."
        onRefresh={loadUsers}
      >
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="w-40"
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="TRAINER">Trainer</option>
          <option value="COLLEGE_ADMIN">College Admin</option>
          <option value="PLATFORM_ADMIN">Platform Admin</option>
        </Select>

        <Select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Suspended</option>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(r) => r.id}
        loading={loading}
        emptyMessage="No users found matching your filters."
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {/* ── Create / Edit Student Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? `Edit User: ${form.name || form.email}` : 'Enroll New Student / Staff User'}
        subtitle="Manage credentials, platform role, college affiliation, and account access"
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button icon={CheckCircle2} loading={saving} onClick={handleSaveUser}>
              {form.id ? 'Save Changes' : 'Create Account'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Full Name" required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Aarav Sharma"
              />
            </FormField>

            <FormField label="Username Handle">
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="aaravsharma"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Email Address" required>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@college.edu"
              />
            </FormField>

            <FormField
              label={form.id ? 'Reset Password' : 'Password'}
              hint={form.id ? 'Leave blank to keep current' : 'Default: Student@123'}
            >
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Platform Role">
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              >
                <option value="STUDENT">STUDENT</option>
                <option value="TRAINER">TRAINER</option>
                <option value="COLLEGE_ADMIN">COLLEGE_ADMIN</option>
                <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
              </Select>
            </FormField>

            <FormField label="College / Institution">
              <Input
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="IIT Hyderabad"
              />
            </FormField>

            <FormField label="Graduation Year">
              <Input
                type="number"
                value={form.gradYear}
                onChange={(e) => setForm({ ...form, gradYear: e.target.value })}
                placeholder="2027"
              />
            </FormField>
          </div>

          <Toggle
            checked={form.isActive}
            onChange={(val) => setForm({ ...form, isActive: val })}
            label="Account Active"
            description="Suspended users cannot sign in or attempt assessments."
          />
        </div>
      </Modal>

      {/* ── Student 360° Analytics & Proctoring Inspector Modal ── */}
      <Modal
        open={Boolean(inspectDetail)}
        onClose={() => {
          setInspectDetail(null);
          setStudentAnalytics(null);
        }}
        title={`Student 360° Analytics & Proctoring Record: ${inspectDetail?.name || inspectDetail?.email || ''}`}
        subtitle={`${inspectDetail?.email || ''} • ${inspectDetail?.profile?.college || 'No college set'} ${
          studentAnalytics?.student.batches?.length
            ? `• Batches: ${studentAnalytics.student.batches.map((b) => b.name).join(', ')}`
            : ''
        }`}
        maxWidth="max-w-5xl"
      >
        {loadingDetail ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Computing student-wise DSA, topic, and proctoring analytics...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Student-Wise Summary Metrics */}
            {studentAnalytics && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="text-[10px] font-bold uppercase text-emerald-700">Unique Solved</div>
                    <div className="text-lg font-extrabold text-emerald-900">
                      {studentAnalytics.learningProgress.uniqueProblemsSolved} /{' '}
                      {studentAnalytics.learningProgress.uniqueProblemsAttempted}
                    </div>
                    <div className="text-[10px] text-emerald-700">
                      {studentAnalytics.learningProgress.completionPercentage}% of bank
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Total Submissions</div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {studentAnalytics.learningProgress.totalSubmissions}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {studentAnalytics.learningProgress.submissionSuccessRate}% AC rate
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="text-[10px] font-bold uppercase text-blue-700">Easy / Med / Hard</div>
                    <div className="text-sm font-extrabold text-blue-950 mt-1">
                      <span className="text-emerald-700">
                        {studentAnalytics.learningProgress.difficultyBreakdown.EASY.solved}E
                      </span>{' '}
                      •{' '}
                      <span className="text-amber-700">
                        {studentAnalytics.learningProgress.difficultyBreakdown.MEDIUM.solved}M
                      </span>{' '}
                      •{' '}
                      <span className="text-rose-700">
                        {studentAnalytics.learningProgress.difficultyBreakdown.HARD.solved}H
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                    <div className="text-[10px] font-bold uppercase text-purple-700">Avg Test Score</div>
                    <div className="text-lg font-extrabold text-purple-900">
                      {studentAnalytics.assessmentPerformance.averagePercentage ?? 0}%
                    </div>
                    <div className="text-[10px] text-purple-700">
                      {studentAnalytics.assessmentPerformance.completedAttempts}/
                      {studentAnalytics.assessmentPerformance.totalAttempts} completed
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="text-[10px] font-bold uppercase text-amber-700">XP &amp; Trend</div>
                    <div className="text-lg font-extrabold text-amber-900">
                      {studentAnalytics.student.totalXp} XP
                    </div>
                    <div className="text-[10px] text-amber-800 font-semibold">
                      {studentAnalytics.assessmentPerformance.performanceTrend}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                    <div className="text-[10px] font-bold uppercase text-rose-700">Auto-Submits</div>
                    <div className="text-lg font-extrabold text-rose-900">
                      {studentAnalytics.assessmentPerformance.autoSubmittedCount}
                    </div>
                    <div className="text-[10px] text-rose-700">
                      {studentAnalytics.assessmentPerformance.passedAttempts} tests passed
                    </div>
                  </div>
                </div>

                {/* Topic-wise Accuracy & Strong/Weak Topics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                      Topic-Wise Mastery &amp; Accuracy
                    </h4>
                    {studentAnalytics.topicBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-400">No topic submissions recorded yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {studentAnalytics.topicBreakdown.map((tp) => (
                          <div key={tp.slug} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">{tp.name}</span>
                              <span className="text-slate-600 font-mono text-[11px]">
                                {tp.problemsSolved} solved • {tp.accuracy}% AC ({tp.accepted}/{tp.submissions})
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  tp.accuracy >= 65
                                    ? 'bg-emerald-600'
                                    : tp.accuracy >= 35
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, tp.accuracy)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Strong vs Weak Topics
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {studentAnalytics.insights.strongTopics.map((t) => (
                          <span
                            key={t.slug}
                            className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-bold"
                          >
                            Strong: {t.name} ({t.accuracy}%)
                          </span>
                        ))}
                        {studentAnalytics.insights.weakTopics.map((t) => (
                          <span
                            key={t.slug}
                            className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[11px] font-bold"
                          >
                            Weak: {t.name} ({t.accuracy}%)
                          </span>
                        ))}
                        {studentAnalytics.insights.strongTopics.length === 0 &&
                          studentAnalytics.insights.weakTopics.length === 0 && (
                            <span className="text-xs text-slate-400">
                              Insufficient topic data to classify strengths/weaknesses.
                            </span>
                          )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Languages Used &amp; Unresolved Struggles
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(studentAnalytics.learningProgress.languageUsage).map(
                          ([lang, entry]) => (
                            <span
                              key={lang}
                              className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[10px] font-bold uppercase"
                            >
                              {lang}: {entry.accepted}/{entry.submissions} AC
                            </span>
                          ),
                        )}
                      </div>
                      {studentAnalytics.insights.frequentlyFailedProblems.length > 0 && (
                        <div className="space-y-1">
                          {studentAnalytics.insights.frequentlyFailedProblems.map((fp) => (
                            <div
                              key={fp.slug}
                              className="text-[11px] text-rose-700 flex items-center justify-between bg-rose-50/70 px-2.5 py-1 rounded-lg border border-rose-200"
                            >
                              <span className="font-bold truncate">{fp.title}</span>
                              <span className="font-mono shrink-0">{fp.failures} failed tries</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Test Attempts &amp; Proctoring History ({inspectDetail?.testAttempts?.length || 0})
              </h4>
              <DataTable
                rows={inspectDetail?.testAttempts || []}
                rowKey={(a: any) => a.id}
                emptyMessage="No test attempts recorded for this student."
                columns={[
                  {
                    key: 'test',
                    header: 'Assessment',
                    render: (a: any) => (
                      <span className="font-bold text-slate-900">{a.test?.title || 'Test'}</span>
                    ),
                  },
                  {
                    key: 'score',
                    header: 'Score',
                    render: (a: any) => (
                      <span className="font-semibold text-slate-800">
                        {a.score}/{a.test?.totalMarks ?? 100} ({a.percentage}%)
                      </span>
                    ),
                  },
                  {
                    key: 'proctoring',
                    header: 'Proctoring / Tab Switches',
                    render: (a: any) => (
                      <div>
                        <span className={a.tabSwitchCount > 0 ? 'font-bold text-rose-600' : 'text-emerald-700 font-semibold'}>
                          {a.tabSwitchCount ?? 0} Tab Switches
                        </span>
                        {a.autoSubmitted && (
                          <div className="text-[10px] text-rose-600 font-bold">
                            {a.terminationReason || 'Auto-Submitted'}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (a: any) => <StatusBadge value={a.status} />,
                  },
                ]}
              />
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Recent DSA Submissions ({inspectDetail?.submissions?.length || 0})
              </h4>
              <DataTable
                rows={inspectDetail?.submissions || []}
                rowKey={(s: any) => s.id}
                emptyMessage="No problem submissions yet."
                columns={[
                  {
                    key: 'problem',
                    header: 'Problem',
                    render: (s: any) => (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{s.problem?.title}</span>
                        {s.problem?.difficulty && <StatusBadge value={s.problem.difficulty} />}
                      </div>
                    ),
                  },
                  {
                    key: 'lang',
                    header: 'Language',
                    render: (s: any) => <span className="font-mono uppercase">{s.language}</span>,
                  },
                  {
                    key: 'verdict',
                    header: 'Verdict',
                    render: (s: any) => <StatusBadge value={s.verdict} />,
                  },
                  {
                    key: 'cases',
                    header: 'Cases Passed',
                    render: (s: any) => (
                      <span>
                        {s.testsPassed}/{s.totalTests} ({s.runtimeMs ?? 0} ms)
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={saving}
        title="Delete User Account?"
        description={`Are you sure you want to permanently remove "${deleteTarget?.email}"?`}
        confirmLabel="Delete Account"
      />
    </div>
  );
}

