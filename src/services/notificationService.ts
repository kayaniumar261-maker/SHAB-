import { Storage } from './storage';

export type NotificationType =
  | 'Hearing'
  | 'Task'
  | 'Payment'
  | 'Quotation'
  | 'Calendar'
  | 'Document'
  | 'Legal Notice'
  | 'System';

export type NotificationPriority =
  | 'High'
  | 'Medium'
  | 'Low';

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference: string;
  route: string;
  priority: NotificationPriority;
  dueDate: string;
  createdAt: string;
  isRead: boolean;
  isGenerated: boolean;
  sourceId: number | string | null;
}

export type NewNotification = {
  type: NotificationType;
  title: string;
  message: string;
  reference?: string;
  route?: string;
  priority?: NotificationPriority;
  dueDate?: string;
  isGenerated?: boolean;
  sourceId?: number | string | null;
};

class NotificationService {
  getAll(): NotificationRecord[] {
    return Storage
      .getNotifications<NotificationRecord>()
      .sort((first, second) =>
        second.createdAt.localeCompare(
          first.createdAt,
        ),
      );
  }

  saveAll(
    notifications: NotificationRecord[],
  ): boolean {
    return Storage.saveNotifications(
      notifications,
    );
  }

  add(
    notification: NewNotification,
  ): NotificationRecord {
    const newNotification: NotificationRecord = {
      id: `NOT-${Date.now()}`,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      reference:
        notification.reference ?? '',
      route: notification.route ?? '',
      priority:
        notification.priority ?? 'Medium',
      dueDate:
        notification.dueDate ?? '',
      createdAt:
        new Date().toISOString(),
      isRead: false,
      isGenerated:
        notification.isGenerated ?? false,
      sourceId:
        notification.sourceId ?? null,
    };

    const notifications = [
      newNotification,
      ...this.getAll(),
    ];

    this.saveAll(notifications);

    return newNotification;
  }

  markAsRead(
    id: string,
  ): NotificationRecord[] {
    const notifications =
      this.getAll().map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
      );

    this.saveAll(notifications);

    return notifications;
  }

  markAllAsRead(): NotificationRecord[] {
    const notifications =
      this.getAll().map(
        (notification) => ({
          ...notification,
          isRead: true,
        }),
      );

    this.saveAll(notifications);

    return notifications;
  }

  delete(
    id: string,
  ): NotificationRecord[] {
    const notifications =
      this.getAll().filter(
        (notification) =>
          notification.id !== id,
      );

    this.saveAll(notifications);

    return notifications;
  }

  clear(): void {
    this.saveAll([]);
  }

  getUnreadCount(): number {
    return this.getAll().filter(
      (notification) =>
        !notification.isRead,
    ).length;
  }

  generate(): NotificationRecord[] {
    return this.getAll();
  }
}

export const Notifications =
  new NotificationService();