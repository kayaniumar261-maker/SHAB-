/* ==========================================
   SHAB ERP Notification Service
   Enterprise Version 2.0
========================================== */

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

  reference?: string;

  route?: string;

  priority: NotificationPriority;

  dueDate?: string;

  createdAt: string;

  isRead: boolean;

  isGenerated: boolean;

  sourceId?: number | string;
}

type GenericRecord = Record<string, unknown>;

const ONE_DAY_MS =
  24 * 60 * 60 * 1000;

function getLocalDate(): string {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDaysDifference(
  dateValue: string,
): number | null {
  if (!dateValue) {
    return null;
  }

  const today = new Date(
    `${getLocalDate()}T00:00:00`,
  );

  const target = new Date(
    `${dateValue}T00:00:00`,
  );

  if (
    Number.isNaN(target.getTime())
  ) {
    return null;
  }

  return Math.round(
    (target.getTime() -
      today.getTime()) /
      ONE_DAY_MS,
  );
}

function readString(
  record: GenericRecord,
  keys: string[],
): string {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return '';
}

function readId(
  record: GenericRecord,
): number | string | undefined {
  const value = record.id;

  if (
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  return undefined;
}

function createGeneratedId(
  type: NotificationType,
  sourceId: number | string | undefined,
  suffix: string,
): string {
  return [
    'generated',
    type.toLowerCase().replace(/\s+/g, '-'),
    sourceId ?? 'unknown',
    suffix,
  ].join(':');
}

function isCompletedStatus(
  status: string,
): boolean {
  return [
    'completed',
    'paid',
    'cancelled',
    'closed',
    'accepted',
    'rejected',
    'expired',
  ].includes(status.toLowerCase());
}

class NotificationService {
  getAll(): NotificationRecord[] {
    return Storage
      .getNotifications<NotificationRecord>()
      .sort(
        (first, second) =>
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
    notification: Omit<
      NotificationRecord,
      'id' | 'createdAt' | 'isRead'
    > & {
      id?: string;
      createdAt?: string;
      isRead?: boolean;
    },
  ): NotificationRecord {
    const newNotification: NotificationRecord = {
      ...notification,
      id:
        notification.id ??
        `manual:${Date.now()}`,
      createdAt:
        notification.createdAt ??
        new Date().toISOString(),
      isRead:
        notification.isRead ?? false,
    };

    const current =
      this.getAll();

    this.saveAll([
      newNotification,
      ...current,
    ]);

    return newNotification;
  }

  markAsRead(
    id: string,
  ): NotificationRecord[] {
    const updated =
      this.getAll().map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
      );

    this.saveAll(updated);

    return updated;
  }

  markAllAsRead(): NotificationRecord[] {
    const updated =
      this.getAll().map(
        (notification) => ({
          ...notification,
          isRead: true,
        }),
      );

    this.saveAll(updated);

    return updated;
  }

  delete(
    id: string,
  ): NotificationRecord[] {
    const updated =
      this.getAll().filter(
        (notification) =>
          notification.id !== id,
      );

    this.saveAll(updated);

    return updated;
  }

  clearGenerated(): NotificationRecord[] {
    const manualNotifications =
      this.getAll().filter(
        (notification) =>
          !notification.isGenerated,
      );

    this.saveAll(
      manualNotifications,
    );

    return manualNotifications;
  }

  getUnreadCount(): number {
    return this.getAll().filter(
      (notification) =>
        !notification.isRead,
    ).length;
  }

  generate(): NotificationRecord[] {
    const existingManual =
      this.getAll().filter(
        (notification) =>
          !notification.isGenerated,
      );

    const generated: NotificationRecord[] = [
      ...this.generateHearingNotifications(),
      ...this.generateTaskNotifications(),
      ...this.generatePaymentNotifications(),
      ...this.generateQuotationNotifications(),
      ...this.generateCalendarNotifications(),
    ];

    const previousReadState =
      new Map(
        this.getAll().map(
          (notification) => [
            notification.id,
            notification.isRead,
          ],
        ),
      );

    const mergedGenerated =
      generated.map(
        (notification) => ({
          ...notification,
          isRead:
            previousReadState.get(
              notification.id,
            ) ?? false,
        }),
      );

    const allNotifications = [
      ...existingManual,
      ...mergedGenerated,
    ].sort(
      (first, second) =>
        second.createdAt.localeCompare(
          first.createdAt,
        ),
    );

    this.saveAll(
      allNotifications,
    );

    return allNotifications;
  }

  private generateHearingNotifications():
    NotificationRecord[] {
    const hearings =
      Storage.getHearings<GenericRecord>();

    const notifications:
      NotificationRecord[] = [];

    hearings.forEach((hearing) => {
      const status = readString(
        hearing,
        ['status'],
      );

      if (
        isCompletedStatus(status)
      ) {
        return;
      }

      const hearingDate = readString(
        hearing,
        ['hearingDate', 'date'],
      );

      const difference =
        getDaysDifference(
          hearingDate,
        );

      if (
        difference === null ||
        difference < 0 ||
        difference > 2
      ) {
        return;
      }

      const sourceId =
        readId(hearing);

      const title = readString(
        hearing,
        ['title', 'caseTitle'],
      );

      const reference = readString(
        hearing,
        [
          'relatedCase',
          'caseNumber',
          'reference',
        ],
      );

      const court = readString(
        hearing,
        ['courtName', 'court'],
      );

      const timing =
        difference === 0
          ? 'today'
          : difference === 1
            ? 'tomorrow'
            : 'in 2 days';

      notifications.push({
        id: createGeneratedId(
          'Hearing',
          sourceId,
          hearingDate,
        ),
        type: 'Hearing',
        title:
          difference === 0
            ? 'Hearing Today'
            : 'Upcoming Hearing',
        message: `${
          title || 'Court hearing'
        } is scheduled ${timing}${
          court ? ` at ${court}` : ''
        }.`,
        reference,
        route: '/hearings',
        priority:
          difference === 0
            ? 'High'
            : 'Medium',
        dueDate: hearingDate,
        createdAt:
          new Date().toISOString(),
        isRead: false,
        isGenerated: true,
        sourceId,
      });
    });

    return notifications;
  }

  private generateTaskNotifications():
    NotificationRecord[] {
    const tasks =
      Storage.getTasks<GenericRecord>();

    const notifications:
      NotificationRecord[] = [];

    tasks.forEach((task) => {
      const status = readString(
        task,
        ['status'],
      );

      if (
        isCompletedStatus(status)
      ) {
        return;
      }

      const dueDate = readString(
        task,
        ['dueDate', 'date'],
      );

      const difference =
        getDaysDifference(dueDate);

      if (
        difference === null ||
        difference > 1
      ) {
        return;
      }

      const sourceId =
        readId(task);

      const title = readString(
        task,
        ['title', 'name'],
      );

      const isOverdue =
        difference < 0;

      notifications.push({
        id: createGeneratedId(
          'Task',
          sourceId,
          dueDate,
        ),
        type: 'Task',
        title: isOverdue
          ? 'Task Overdue'
          : difference === 0
            ? 'Task Due Today'
            : 'Task Due Tomorrow',
        message:
          title ||
          'A task requires attention.',
        reference: readString(
          task,
          [
            'relatedCase',
            'reference',
          ],
        ),
        route: '/tasks',
        priority:
          isOverdue ||
          difference === 0
            ? 'High'
            : 'Medium',
        dueDate,
        createdAt:
          new Date().toISOString(),
        isRead: false,
        isGenerated: true,
        sourceId,
      });
    });

    return notifications;
  }

  private generatePaymentNotifications():
    NotificationRecord[] {
    const payments =
      Storage.getPayments<GenericRecord>();

    const notifications:
      NotificationRecord[] = [];

    payments.forEach((payment) => {
      const status = readString(
        payment,
        ['status', 'paymentStatus'],
      );

      if (
        isCompletedStatus(status)
      ) {
        return;
      }

      const dueDate = readString(
        payment,
        ['dueDate', 'date'],
      );

      const difference =
        getDaysDifference(dueDate);

      if (
        difference === null ||
        difference > 3
      ) {
        return;
      }

      const sourceId =
        readId(payment);

      const amount = readString(
        payment,
        [
          'amount',
          'totalAmount',
          'balance',
        ],
      );

      const client = readString(
        payment,
        [
          'clientName',
          'client',
          'payer',
        ],
      );

      const overdue =
        difference < 0;

      notifications.push({
        id: createGeneratedId(
          'Payment',
          sourceId,
          dueDate,
        ),
        type: 'Payment',
        title: overdue
          ? 'Payment Overdue'
          : 'Payment Due Soon',
        message: `${
          client || 'Client payment'
        }${
          amount ? ` of AED ${amount}` : ''
        } requires attention.`,
        reference: readString(
          payment,
          [
            'reference',
            'relatedCase',
            'invoiceNumber',
          ],
        ),
        route: '/payments',
        priority: overdue
          ? 'High'
          : 'Medium',
        dueDate,
        createdAt:
          new Date().toISOString(),
        isRead: false,
        isGenerated: true,
        sourceId,
      });
    });

    return notifications;
  }

  private generateQuotationNotifications():
    NotificationRecord[] {
    const quotations =
      Storage.getQuotations<GenericRecord>();

    const notifications:
      NotificationRecord[] = [];

    quotations.forEach(
      (quotation) => {
        const status = readString(
          quotation,
          ['status'],
        );

        if (
          isCompletedStatus(status)
        ) {
          return;
        }

        const expiryDate =
          readString(
            quotation,
            [
              'validUntil',
              'expiryDate',
              'dueDate',
            ],
          );

        const difference =
          getDaysDifference(
            expiryDate,
          );

        if (
          difference === null ||
          difference < 0 ||
          difference > 3
        ) {
          return;
        }

        const sourceId =
          readId(quotation);

        notifications.push({
          id: createGeneratedId(
            'Quotation',
            sourceId,
            expiryDate,
          ),
          type: 'Quotation',
          title:
            difference === 0
              ? 'Quotation Expires Today'
              : 'Quotation Expiring Soon',
          message: `${
            readString(
              quotation,
              [
                'clientName',
                'client',
                'title',
              ],
            ) || 'Quotation'
          } expires in ${
            difference === 0
              ? 'less than one day'
              : `${difference} day${
                  difference === 1
                    ? ''
                    : 's'
                }`
          }.`,
          reference:
            readString(
              quotation,
              [
                'reference',
                'quotationNumber',
              ],
            ),
          route: '/quotations',
          priority:
            difference === 0
              ? 'High'
              : 'Medium',
          dueDate: expiryDate,
          createdAt:
            new Date().toISOString(),
          isRead: false,
          isGenerated: true,
          sourceId,
        });
      },
    );

    return notifications;
  }

  private generateCalendarNotifications():
    NotificationRecord[] {
    const events =
      Storage.getCalendarEvents<GenericRecord>();

    const notifications:
      NotificationRecord[] = [];

    events.forEach((event) => {
      const status = readString(
        event,
        ['status'],
      );

      if (
        isCompletedStatus(status)
      ) {
        return;
      }

      const eventDate = readString(
        event,
        ['date'],
      );

      const difference =
        getDaysDifference(
          eventDate,
        );

      if (
        difference === null ||
        difference < 0 ||
        difference > 1
      ) {
        return;
      }

      const eventType = readString(
        event,
        ['eventType'],
      );

      if (
        eventType.toLowerCase() ===
        'hearing'
      ) {
        return;
      }

      const sourceId =
        readId(event);

      notifications.push({
        id: createGeneratedId(
          'Calendar',
          sourceId,
          eventDate,
        ),
        type: 'Calendar',
        title:
          difference === 0
            ? 'Calendar Event Today'
            : 'Calendar Event Tomorrow',
        message:
          readString(
            event,
            ['title'],
          ) ||
          'A calendar event is approaching.',
        reference: readString(
          event,
          ['relatedCase', 'reference'],
        ),
        route: '/calendar',
        priority:
          difference === 0
            ? 'High'
            : 'Low',
        dueDate: eventDate,
        createdAt:
          new Date().toISOString(),
        isRead: false,
        isGenerated: true,
        sourceId,
      });
    });

    return notifications;
  }
}

export const Notifications =
  new NotificationService();
