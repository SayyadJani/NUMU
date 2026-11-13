'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle2,
  Send,
  AlertCircle,
  Radio,
  Clock,
  Sparkles,
  Layers,
  Award,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import {
  DataTable,
  type ColumnDef,
  Button,
  StatusBadge,
  FormField,
  Input,
  Textarea,
  Select,
  Modal,
  StatCard,
} from '@/components/ui/primitives';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tag: string;
  linkUrl?: string | null;
  isBroadcast: boolean;
  targetRole?: string | null;
  createdAt: string;
  readCount: number;
  totalRecipients: number;
}

export function NotificationsPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal create state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TESTS',
    tag: 'Test',
    linkUrl: '',
    targetAudience: 'ALL_STUDENTS',
  });

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getNotifications();
      setNotifications(data || []);
    } catch (err: any) {
      onNotify('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      onNotify('Please fill in title and description', 'error');
      return;
    }

    try {
      setSaving(true);
      const isBroadcast = form.targetAudience === 'ALL_STUDENTS' || form.targetAudience === 'ALL_USERS';
      const targetRole = form.targetAudience === 'ALL_STUDENTS' ? 'STUDENT' : form.targetAudience === 'TRAINERS' ? 'TRAINER' : undefined;

      await adminApi.createNotification({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        tag: form.tag,
        linkUrl: form.linkUrl.trim() || undefined,
        isBroadcast,
        targetRole,
      });

      onNotify('Announcement broadcasted successfully to student application! 📢');
      setCreateModalOpen(false);
      setForm({
        title: '',
        description: '',
        category: 'TESTS',
        tag: 'Test',
        linkUrl: '',
        targetAudience: 'ALL_STUDENTS',
      });
      loadNotifications();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to broadcast announcement', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete announcement "${title}"?`)) return;

    try {
      await adminApi.deleteNotification(id);
      onNotify(`Announcement "${title}" removed successfully`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      onNotify('Failed to delete announcement', 'error');
    }
  };

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || n.category.toUpperCase() === categoryFilter.toUpperCase();
      return matchSearch && matchCat;
    });
  }, [notifications, search, categoryFilter]);

  const totalReads = useMemo(() => {
    return notifications.reduce((acc, curr) => acc + (curr.readCount || 0), 0);
  }, [notifications]);

  const columns: ColumnDef<NotificationItem>[] = [
    {
      key: 'title',
      header: 'Announcement',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <span>{row.title}</span>
            {row.linkUrl && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Linked
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & Tag',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge value={row.tag || row.category} />
        </div>
      ),
    },
    {
      key: 'targetRole',
      header: 'Audience',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          <Users className="w-3 h-3 text-slate-500" />
          {row.isBroadcast ? 'All Students' : row.targetRole || 'Specific User'}
        </span>
      ),
    },
    {
      key: 'readCount',
      header: 'Engagement',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-900">{row.readCount}</span>
          <span className="text-slate-500 text-[11px]"> reads</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date Sent',
      render: (row) => (
        <div className="text-xs text-slate-600 font-mono">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="inline-flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={ExternalLink}
            onClick={() => window.open('http://localhost:3000/dashboard/notifications', '_blank')}
            title="Preview student notification center"
          >
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => handleDelete(row.id, row.title)}
            title="Delete announcement"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 border border-emerald-500/30 text-[11px] font-semibold text-emerald-200 mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Live Student Broadcast System
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Notification & Announcement Center</h1>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-xl">
              Broadcast critical test reminders, contest alerts, assignment milestones, and academic updates directly to student dashboards in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={loadNotifications}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Sync
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-md border-transparent"
            >
              Broadcast Announcement
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Broadcasts"
          value={notifications.length}
          sublabel="All-time announcements"
          icon={Bell}
        />
        <StatCard
          label="Active Broadcasts"
          value={notifications.filter((n) => n.isBroadcast).length}
          sublabel="Visible to all students"
          icon={Radio}
        />
        <StatCard
          label="Total Student Reads"
          value={totalReads}
          sublabel="Confirmed read receipts"
          icon={CheckCircle2}
        />
        <StatCard
          label="Test & Exam Alerts"
          value={notifications.filter((n) => n.category.toUpperCase() === 'TESTS').length}
          sublabel="Proctored assessment updates"
          icon={Award}
        />
      </div>

      {/* ── Controls Row ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search announcements by title or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="TESTS">Tests & Assessments</option>
            <option value="CONTESTS">Contests</option>
            <option value="ASSIGNMENTS">Assignments</option>
            <option value="PROJECTS">Projects</option>
            <option value="SYSTEM">System & Academic</option>
          </Select>
        </div>
      </div>

      {/* ── Data Table ── */}
      <DataTable
        rowKey={(row) => row.id}
        columns={columns}
        rows={filtered}
        loading={loading}
        emptyMessage="No announcements found. Click 'Broadcast Announcement' to publish your first notification."
      />

      {/* ── Create Notification Modal ── */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Broadcast New Announcement"
        subtitle="This notification will be immediately delivered to student dashboards."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <FormField label="Announcement Title" required>
            <Input
              placeholder="e.g., Weekly DSA Assessment #2 is Now Live"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Message & Guidelines" required>
            <Textarea
              placeholder="Provide clear details, instructions, or deadlines for students..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Category">
              <Select
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  const tagMap: Record<string, string> = {
                    TESTS: 'Test',
                    CONTESTS: 'Contest',
                    ASSIGNMENTS: 'Assignment',
                    PROJECTS: 'Project',
                    SYSTEM: 'System',
                  };
                  setForm({ ...form, category: cat, tag: tagMap[cat] || 'System' });
                }}
              >
                <option value="TESTS">Tests & Assessments</option>
                <option value="CONTESTS">Contests</option>
                <option value="ASSIGNMENTS">Assignments</option>
                <option value="PROJECTS">Projects</option>
                <option value="SYSTEM">System & Academic</option>
              </Select>
            </FormField>

            <FormField label="Display Tag">
              <Input
                placeholder="e.g. Test, Contest, Alert"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Target Audience">
              <Select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              >
                <option value="ALL_STUDENTS">All Enrolled Students (Broadcast)</option>
                <option value="ALL_USERS">All Users (Students & Staff)</option>
                <option value="TRAINERS">Trainers Only</option>
              </Select>
            </FormField>

            <FormField label="Action Deep Link (Optional)">
              <Input
                placeholder="e.g. /dashboard/tests?test=week-122-dsa"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              />
            </FormField>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              When published, this announcement appears in students' sidebar notification badge and in their notification center. If an Action Link is provided, clicking the alert navigates directly to that resource.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving} icon={Send}>
              Broadcast to Students
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
