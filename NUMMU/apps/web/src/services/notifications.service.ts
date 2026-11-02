/**
 * Notifications Service Layer
 * Abstracts user notifications, categories, and read status mutations.
 */

import { envConfig } from '@/lib/config/env';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  DUMMY_NOTIFICATIONS,
  groupNotifications,
  UNREAD_SUMMARY,
} from '@/data/notifications';
import type { Notification, NotificationGroup, UnreadSummaryItem } from '@/types/notifications';

export interface NotificationsService {
  getNotifications(): Promise<Notification[]>;
  getGroups(): Promise<NotificationGroup[]>;
  getUnreadSummary(): Promise<UnreadSummaryItem[]>;
  markAsRead(id: string): Promise<Notification[]>;
  markAllAsRead(): Promise<Notification[]>;
}

class MockNotificationsService implements NotificationsService {
  private notifications = [...DUMMY_NOTIFICATIONS];

  async getNotifications(): Promise<Notification[]> {
    await new Promise((res) => setTimeout(res, 30));
    return this.notifications;
  }

  async getGroups(): Promise<NotificationGroup[]> {
    await new Promise((res) => setTimeout(res, 30));
    return groupNotifications(this.notifications);
  }

  async getUnreadSummary(): Promise<UnreadSummaryItem[]> {
    await new Promise((res) => setTimeout(res, 30));
    return UNREAD_SUMMARY;
  }

  async markAsRead(id: string): Promise<Notification[]> {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    return this.notifications;
  }

  async markAllAsRead(): Promise<Notification[]> {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    return this.notifications;
  }
}

class ApiNotificationsService implements NotificationsService {
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.LIST);
  }

  async getGroups(): Promise<NotificationGroup[]> {
    return apiClient.get<NotificationGroup[]>(`${ENDPOINTS.NOTIFICATIONS.LIST}/groups`);
  }

  async getUnreadSummary(): Promise<UnreadSummaryItem[]> {
    return apiClient.get<UnreadSummaryItem[]>(`${ENDPOINTS.NOTIFICATIONS.LIST}/summary`);
  }

  async markAsRead(id: string): Promise<Notification[]> {
    return apiClient.patch<Notification[]>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  async markAllAsRead(): Promise<Notification[]> {
    return apiClient.post<Notification[]>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }
}

export const notificationsService: NotificationsService = envConfig.useMocks
  ? new MockNotificationsService()
  : new ApiNotificationsService();
