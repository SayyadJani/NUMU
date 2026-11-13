/**
 * Notifications Service Layer
 * Fully functional client connecting to NestJS NotificationsModule endpoints.
 */

import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { groupNotifications } from '@/data/notifications';
import type { Notification, NotificationGroup, UnreadSummaryItem } from '@/types/notifications';

export class NotificationsApiService {
  /**
   * Fetch current user's notifications.
   */
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.LIST);
  }

  /**
   * Fetch grouped notifications (Today, Yesterday, Older).
   */
  async getGroups(): Promise<NotificationGroup[]> {
    try {
      const list = await this.getNotifications();
      return groupNotifications(list);
    } catch {
      return [];
    }
  }

  /**
   * Get unread badge count.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ unreadCount: number }>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      return res.unreadCount ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<any> {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  /**
   * Mark all visible notifications as read.
   */
  async markAllAsRead(): Promise<any> {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }
}

export const notificationsService = new NotificationsApiService();
