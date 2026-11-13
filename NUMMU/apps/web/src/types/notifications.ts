// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationCategory =
  | 'all'
  | 'assignments'
  | 'contests'
  | 'tests'
  | 'projects'
  | 'system';

export type NotificationTag =
  | 'Contest'
  | 'Assignment'
  | 'Project'
  | 'Achievement'
  | 'System'
  | 'Test'
  | 'Community';

export interface Notification {
  id: string;
  title: string;
  description: string;
  tag: NotificationTag;
  category: Exclude<NotificationCategory, 'all'>;
  time: string;       // e.g. "2 hours ago"
  isRead: boolean;
  icon: string;       // emoji or icon name
  iconBg: string;     // tailwind bg color
  linkUrl?: string;
}

export interface NotificationGroup {
  label: string;      // "Today" | "Yesterday" | date string
  items: Notification[];
}

export interface UnreadSummaryItem {
  category: string;
  count: number;
  icon: string;
}
