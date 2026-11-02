'use client';

import React from 'react';
import { Settings, Check, ChevronRight, Bell } from 'lucide-react';
import {
  DUMMY_NOTIFICATIONS,
  groupNotifications,
  UNREAD_SUMMARY,
} from '@/data/notifications';
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
  { key: 'assignments', label: 'Assignments' },
  { key: 'contests', label: 'Contests' },
  { key: 'tests', label: 'Tests' },
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
}: {
  notification: Notification;
  onToggleRead: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-start gap-4 px-4 py-3.5 rounded-xl transition-colors group cursor-pointer ${
        notification.isRead ? 'hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/60'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${notification.iconBg} flex items-center justify-center text-lg shrink-0`}>
        {notification.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-sm font-bold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
            {notification.title}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${TAG_STYLES[notification.tag]}`}>
            {notification.tag}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{notification.description}</p>
      </div>

      {/* Time + Read dot */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-slate-400 whitespace-nowrap">{notification.time}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleRead(notification.id); }}
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
  const [notifications, setNotifications] = React.useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [activeTab, setActiveTab] = React.useState<NotificationCategory>('all');

  // ── derived ──
  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => n.category === activeTab);

  const grouped = groupNotifications(filtered);

  const countByCategory = (cat: NotificationCategory) =>
    cat === 'all'
      ? notifications.length
      : notifications.filter((n) => n.category === cat).length;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── actions ──
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const toggleRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );

  return (
    <main className="flex-1 pt-4 px-6 py-5 flex gap-5 min-h-0">

          {/* ── Left: Notification list ── */}
          <div className="flex-1 min-w-0">

            {/* Page header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Stay updated with your learning journey, assignments, contests and more.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
                <button className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
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
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap relative transition-all ${
                      activeTab === tab.key ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
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
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Bell className="w-10 h-10 mb-3 opacity-30" />
                  <div className="text-sm font-semibold">No notifications</div>
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
                        <NotificationItem key={n.id} notification={n} onToggleRead={toggleRead} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-64 shrink-0 space-y-4">

            {/* Stay in the loop */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">Stay in the loop</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Get notified about important updates, deadlines and opportunities.
                  </p>
                </div>
              </div>
              <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl transition-all">
                Notification Settings <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Unread Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Unread Summary</div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-700">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {UNREAD_SUMMARY.map((s) => (
                  <div key={s.category} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-xs text-slate-600">{s.category}</span>
                    </div>
                    <span className={`text-xs font-bold ${s.count > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Quick Actions</div>
              <div className="space-y-1">
                {QUICK_ACTIONS.map((a, i) => (
                  <button
                    key={i}
                    onClick={i === 0 ? markAllRead : undefined}
                    className="w-full flex items-center justify-between px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 text-slate-600 group-hover:text-slate-900">
                      {a.icon}
                      <span className="text-xs font-medium">{a.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="text-3xl text-emerald-200 font-serif leading-none mb-2">&ldquo;</div>
              <blockquote className="text-xs font-semibold text-slate-700 italic leading-relaxed">
                Discipline today, opportunities tomorrow.
              </blockquote>
              <div className="text-[10px] text-slate-400 mt-2">— NUMU</div>
            </div>
          </div>
        </main>
  );
}
