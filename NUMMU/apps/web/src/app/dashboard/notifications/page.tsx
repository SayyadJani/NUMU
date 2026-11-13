'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Check, ChevronRight, Bell, Loader2, ExternalLink } from 'lucide-react';
import { groupNotifications, UNREAD_SUMMARY } from '@/data/notifications';
import { notificationsService } from '@/services/notifications.service';
import type { Notification, NotificationCategory } from '@/types/notifications';

// ─── Tag styling ──────────────────────────────────────────────────────────────
const TAG_STYLES: Record<string, string> = {
  Contest:     'bg-amber-50   text-amber-700   border-amber-200',
  Assignment:  'bg-blue-50    text-blue-700    border-blue-200',
  Project:     'bg-purple-50  text-purple-700  border-purple-200',
  Achievement: 'bg-orange-50  text-orange-700  border-orange-200',
  System:      'bg-slate-100  text-slate-600   border-slate-200',
  Test:        'bg-teal-50    text-teal-700    border-teal-200',
  Community:   'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { key: NotificationCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tests', label: 'Tests' },
  { key: 'contests', label: 'Contests' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'projects', label: 'Projects' },
  { key: 'system', label: 'System' },
];

const QUICK_ACTIONS = [
  { icon: <Check className="w-3.5 h-3.5" />, label: 'Mark all as read' },
  { icon: <Settings className="w-3.5 h-3.5" />, label: 'Notification settings' },
  { icon: <span className="text-xs">✉️</span>, label: 'Email preferences' },
  { icon: <Bell className="w-3.5 h-3.5" />, label: 'Push notifications' },
];

// ─── Notification Item ────────────────────────────────────────────────────────
function NotificationItem({
  notification,
  onToggleRead,
  onSelect,
}: {
  notification: Notification;
  onToggleRead: (id: string) => void;
  onSelect: (n: Notification) => void;
}) {
  return (
    <div
      onClick={() => onSelect(notification)}
      className={`flex items-start gap-4 px-4 py-3.5 rounded-xl transition-colors group cursor-pointer ${
        notification.isRead ? 'hover:bg-slate-50' : 'bg-emerald-50/20 hover:bg-emerald-50/40'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${notification.iconBg || 'bg-slate-100 text-slate-800'} flex items-center justify-center text-lg shrink-0`}>
        {notification.icon || '📢'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-sm font-bold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
            {notification.title}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${TAG_STYLES[notification.tag] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {notification.tag}
          </span>
          {(notification as any).linkUrl && (
            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
              <span>View</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{notification.description}</p>
      </div>

      {/* Time + Read dot */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-slate-400 whitespace-nowrap">{notification.time}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead(notification.id);
          }}
          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
            notification.isRead ? 'bg-slate-200 hover:bg-slate-300' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
          title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');

  const loadLiveNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications();
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveNotifications();
  }, []);

  // ── derived ──
  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => n.category.toLowerCase() === activeTab.toLowerCase());

  const grouped = groupNotifications(filtered);

  const countByCategory = (cat: NotificationCategory) =>
    cat === 'all'
      ? notifications.length
      : notifications.filter((n) => n.category.toLowerCase() === cat.toLowerCase()).length;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── actions ──
  const markAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const toggleRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleSelect = async (n: Notification) => {
    if (!n.isRead) {
      toggleRead(n.id);
    }
    const link = (n as any).linkUrl;
    if (link) {
      router.push(link);
    }
  };

  return (
    <main className="flex-1 pt-4 px-6 py-5 flex gap-5 min-h-0">
      {/* ── Left: Notification list ── */}
      <div className="flex-1 min-w-0">
        {/* Page header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Stay updated with your learning journey, proctored assessments, and contest alerts.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <button
              onClick={loadLiveNotifications}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh notifications"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-5 overflow-x-auto">
          {TABS.map((tab) => {
            const count = countByCategory(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap relative transition-all cursor-pointer ${
                  activeTab === tab.key ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Notification groups */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <div className="text-xs font-medium">Loading notifications from server...</div>
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Bell className="w-10 h-10 mb-3 opacity-30 text-emerald-600" />
              <div className="text-sm font-semibold text-slate-700">No notifications in this category</div>
              <p className="text-xs text-slate-400 mt-1">You are all caught up with announcements and updates.</p>
            </div>
          ) : (
            grouped.map((group, gi) => (
              <div key={gi}>
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
                <div className="divide-y divide-slate-100/80">
                  {group.items.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onToggleRead={toggleRead}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="w-64 shrink-0 space-y-4 hidden lg:block">
        {/* Stay in the loop */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <div className="text-xs font-bold text-slate-900 mb-0.5">Stay In The Loop</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Receive proctored assessment reminders, weekly rating deltas, and milestone alerts.
              </div>
            </div>
          </div>
        </div>

        {/* Unread summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-900 mb-3">Unread Breakdown</div>
          <div className="space-y-2">
            {[
              { category: 'Tests & Assessments', count: countByCategory('tests'), icon: '📝' },
              { category: 'Weekly Contests', count: countByCategory('contests'), icon: '🏆' },
              { category: 'System & Platform', count: countByCategory('system'), icon: '📢' },
            ].map((s) => (
              <div key={s.category} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span>{s.icon}</span>
                  <span className="text-slate-600">{s.category}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
