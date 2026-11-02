/**
 * DUMMY DATA — Notifications
 * Replace the fetch calls in useNotifications hook with real API calls.
 * All shapes match the types in src/types/notifications.ts
 */

import type {
  Notification,
  NotificationGroup,
  UnreadSummaryItem,
} from '@/types/notifications';

export const DUMMY_NOTIFICATIONS: Notification[] = [
  // Today
  {
    id: 'n1',
    title: 'NUMU Weekly #42 Registration Open',
    description: 'Registration is now open for NUMU Weekly #42. Compete with 1200+ learners!',
    tag: 'Contest',
    category: 'contests',
    time: '2 hours ago',
    isRead: false,
    icon: '🏆',
    iconBg: 'bg-amber-50',
  },
  {
    id: 'n2',
    title: 'DSA Assignment Due Tomorrow',
    description: 'You have 5 problems on Binary Search. Deadline: Sep 20, 2026, 11:59 PM.',
    tag: 'Assignment',
    category: 'assignments',
    time: '4 hours ago',
    isRead: false,
    icon: '📋',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'n3',
    title: 'Trainer reviewed your project',
    description: 'Your Expense Tracker project has been reviewed. Check the feedback now.',
    tag: 'Project',
    category: 'projects',
    time: '6 hours ago',
    isRead: false,
    icon: '💻',
    iconBg: 'bg-purple-50',
  },
  {
    id: 'n4',
    title: 'You unlocked a new achievement!',
    description: 'Amazing! You\'ve earned the "7 Day Streak" badge.',
    tag: 'Achievement',
    category: 'system',
    time: '8 hours ago',
    isRead: false,
    icon: '⭐',
    iconBg: 'bg-yellow-50',
  },
  {
    id: 'n5',
    title: 'Your streak is active!',
    description: "You're on a 12-day streak. Keep going!",
    tag: 'System',
    category: 'system',
    time: '10 hours ago',
    isRead: true,
    icon: '🔥',
    iconBg: 'bg-orange-50',
  },
  // Yesterday
  {
    id: 'n6',
    title: 'Test Results Available',
    description: 'Your results for JavaScript Fundamentals Test are ready. Score: 82/100',
    tag: 'Test',
    category: 'tests',
    time: '1 day ago',
    isRead: true,
    icon: '✅',
    iconBg: 'bg-emerald-50',
  },
  {
    id: 'n7',
    title: 'New Learning Path Released',
    description: "We've added a new System Design learning path. Explore now!",
    tag: 'System',
    category: 'system',
    time: '1 day ago',
    isRead: true,
    icon: '📢',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'n8',
    title: 'Your friend completed a project',
    description: 'Ali completed the Portfolio Website project. Check it out!',
    tag: 'Community',
    category: 'system',
    time: '1 day ago',
    isRead: true,
    icon: '👥',
    iconBg: 'bg-teal-50',
  },
  {
    id: 'n9',
    title: 'Project Deadline Reminder',
    description: 'Your Chat Application project is due in 3 days.',
    tag: 'Project',
    category: 'projects',
    time: '1 day ago',
    isRead: true,
    icon: '📦',
    iconBg: 'bg-purple-50',
  },
  // Earlier
  {
    id: 'n10',
    title: 'New Contest Announced: NUMU Weekly #43',
    description: 'Get ready! NUMU Weekly #43 is scheduled for Sep 28, 2026.',
    tag: 'Contest',
    category: 'contests',
    time: '2 days ago',
    isRead: true,
    icon: '🏆',
    iconBg: 'bg-amber-50',
  },
  {
    id: 'n11',
    title: 'Assignment Graded',
    description: 'Your Linked List assignment has been graded. Score: 95/100.',
    tag: 'Assignment',
    category: 'assignments',
    time: '3 days ago',
    isRead: true,
    icon: '📋',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'n12',
    title: 'Mock Test Scheduled',
    description: 'DSA Mock Test is scheduled for Sep 25, 2026 at 10:00 AM.',
    tag: 'Test',
    category: 'tests',
    time: '3 days ago',
    isRead: true,
    icon: '📝',
    iconBg: 'bg-indigo-50',
  },
];

export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const earlier: Notification[] = [];

  notifications.forEach((n) => {
    if (n.time.includes('hours ago') || n.time === 'just now') today.push(n);
    else if (n.time === '1 day ago') yesterday.push(n);
    else earlier.push(n);
  });

  const groups: NotificationGroup[] = [];
  if (today.length) groups.push({ label: 'Today', items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (earlier.length) groups.push({ label: 'Earlier', items: earlier });
  return groups;
}

export const UNREAD_SUMMARY: UnreadSummaryItem[] = [
  { category: 'Assignments', count: 1, icon: '📋' },
  { category: 'Contests', count: 1, icon: '🏆' },
  { category: 'Tests', count: 0, icon: '📝' },
  { category: 'Projects', count: 1, icon: '📦' },
  { category: 'System', count: 2, icon: '⚙️' },
];
