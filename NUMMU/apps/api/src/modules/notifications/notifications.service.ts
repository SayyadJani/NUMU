import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationCategory, NotificationTag, Role } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch all notifications visible to a specific user with real read status.
   */
  async getUserNotifications(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    const userRole = user?.role || Role.STUDENT;

    // Fetch notifications that are broadcast, role-targeted, or user-specific
    const notifications = await this.prisma.notification.findMany({
      where: {
        OR: [
          { isBroadcast: true },
          { userId },
          { targetRole: userRole },
        ],
      },
      include: {
        reads: {
          where: { userId },
          select: { id: true, readAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => {
      const isRead = n.reads.length > 0;
      return {
        id: n.id,
        title: n.title,
        description: n.description,
        category: n.category.toLowerCase(),
        tag: n.tag,
        linkUrl: n.linkUrl,
        createdAt: n.createdAt,
        time: this.formatRelativeTime(n.createdAt),
        isRead,
        icon: this.getCategoryEmoji(n.category),
        iconBg: this.getCategoryBg(n.category),
      };
    });
  }

  /**
   * Get unread notifications count for badge display.
   */
  async getUnreadCount(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const userRole = user?.role || Role.STUDENT;

    const totalEligible = await this.prisma.notification.count({
      where: {
        OR: [
          { isBroadcast: true },
          { userId },
          { targetRole: userRole },
        ],
      },
    });

    const readCount = await this.prisma.notificationRead.count({
      where: { userId },
    });

    return Math.max(0, totalEligible - readCount);
  }

  /**
   * Mark a single notification as read for a user.
   */
  async markAsRead(notificationId: string, userId: string) {
    await this.prisma.notificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
      create: {
        notificationId,
        userId,
      },
      update: {},
    });

    return { success: true };
  }

  /**
   * Mark all eligible notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const userRole = user?.role || Role.STUDENT;

    const visibleNotifications = await this.prisma.notification.findMany({
      where: {
        OR: [
          { isBroadcast: true },
          { userId },
          { targetRole: userRole },
        ],
      },
      select: { id: true },
    });

    const readsToCreate = visibleNotifications.map((n) => ({
      notificationId: n.id,
      userId,
    }));

    if (readsToCreate.length > 0) {
      await this.prisma.notificationRead.createMany({
        data: readsToCreate,
        skipDuplicates: true,
      });
    }

    return { success: true };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Admin Management Methods
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Admin lists all notifications with metrics.
   */
  async getAdminNotifications() {
    const list = await this.prisma.notification.findMany({
      include: {
        _count: { select: { reads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalStudents = await this.prisma.user.count({
      where: { role: Role.STUDENT },
    });

    return list.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      tag: item.tag,
      linkUrl: item.linkUrl,
      isBroadcast: item.isBroadcast,
      targetRole: item.targetRole,
      createdAt: item.createdAt,
      readCount: item._count.reads,
      totalRecipients: item.isBroadcast ? totalStudents : 1,
    }));
  }

  /**
   * Admin creates and broadcasts a notification.
   */
  async createNotification(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category || NotificationCategory.SYSTEM,
        tag: dto.tag || NotificationTag.System,
        linkUrl: dto.linkUrl,
        isBroadcast: dto.isBroadcast ?? true,
        targetRole: dto.targetRole,
        userId: dto.userId,
      },
    });
  }

  /**
   * Admin deletes a notification.
   */
  async deleteNotification(id: string) {
    const existing = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { success: true, message: 'Notification deleted successfully' };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────────────────────

  private formatRelativeTime(date: Date): string {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)} days ago`;
  }

  private getCategoryEmoji(category: NotificationCategory): string {
    switch (category) {
      case NotificationCategory.CONTESTS:
        return '🏆';
      case NotificationCategory.TESTS:
        return '📝';
      case NotificationCategory.ASSIGNMENTS:
        return '📋';
      case NotificationCategory.PROJECTS:
        return '🚀';
      default:
        return '📢';
    }
  }

  private getCategoryBg(category: NotificationCategory): string {
    switch (category) {
      case NotificationCategory.CONTESTS:
        return 'bg-amber-100 text-amber-800';
      case NotificationCategory.TESTS:
        return 'bg-emerald-100 text-emerald-800';
      case NotificationCategory.ASSIGNMENTS:
        return 'bg-blue-100 text-blue-800';
      case NotificationCategory.PROJECTS:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }
}
