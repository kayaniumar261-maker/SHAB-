import {
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Receipt,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type NotificationPriority =
  | 'High'
  | 'Medium'
  | 'Low';

type NotificationCategory =
  | 'Task'
  | 'Calendar'
  | 'Payment'
  | 'Quotation'
  | 'Case'
  | 'General';

type ManualNotification = {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  dueDate: string;
  read: boolean;
  createdAt: string;
};

type GeneratedNotification = {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  dueDate: string;
  sourcePath: string;
};

type NotificationItem =
  | ManualNotification
  | GeneratedNotification;

type StoredTask = {
  id: number;
  title: string;
  description?: string;
  assignedTo?: string;
  relatedCase?: string;
  dueDate?: string;
  priority?: NotificationPriority;
  completed?: boolean;
};

type StoredCalendarEvent = {
  id: number;
  title: string;
  eventType?: string;
  date: string;
  time?: string;
  court?: string;
  location?: string;
  relatedCase?: string;
};

type StoredPayment = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  balance: number;
  dueDate: string;
  status: string;
};

type StoredQuotation = {
  id: number;
  quotationNumber: string;
  clientName: string;
  validUntil: string;
  status: string;
};

type StoredCase = {
  id: number;
  title: string;
  reference: string;
  nextHearing?: string;
  status?: string;
};

type NotificationForm = {
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  dueDate: string;
};

const MANUAL_NOTIFICATIONS_KEY =
  'shab-manual-notifications';

const READ_NOTIFICATIONS_KEY =
  'shab-read-notifications';

const DISMISSED_NOTIFICATIONS_KEY =
  'shab-dismissed-notifications';

const TASKS_STORAGE_KEY = 'shab-tasks';
const CALENDAR_STORAGE_KEY =
  'shab-calendar-events';
const PAYMENTS_STORAGE_KEY = 'shab-payments';
const QUOTATIONS_STORAGE_KEY =
  'shab-quotations';
const CASES_STORAGE_KEY = 'shab-cases';

const emptyForm: NotificationForm = {
  title: '',
  message: '',
  category: 'General',
  priority: 'Medium',
  dueDate: '',
};

function loadArray<T>(key: string): T[] {
  try {
    const savedValue =
      window.localStorage.getItem(key);

    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
}

function loadStringArray(key: string): string[] {
  return loadArray<string>(key);
}

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

function addDays(
  dateValue: string,
  days: number,
): string {
  const date = new Date(
    `${dateValue}T00:00:00`,
  );

  date.setDate(date.getDate() + days);

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
): number {
  const today = new Date(
    `${getLocalDate()}T00:00:00`,
  );

  const targetDate = new Date(
    `${dateValue}T00:00:00`,
  );

  return Math.ceil(
    (targetDate.getTime() -
      today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function formatDate(value: string): string {
  if (!value) {
    return 'No date';
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(value);
}

function createGeneratedNotifications(): GeneratedNotification[] {
  const today = getLocalDate();
  const nextSevenDays = addDays(today, 7);

  const tasks = loadArray<StoredTask>(
    TASKS_STORAGE_KEY,
  );

  const calendarEvents =
    loadArray<StoredCalendarEvent>(
      CALENDAR_STORAGE_KEY,
    );

  const payments = loadArray<StoredPayment>(
    PAYMENTS_STORAGE_KEY,
  );

  const quotations =
    loadArray<StoredQuotation>(
      QUOTATIONS_STORAGE_KEY,
    );

  const cases = loadArray<StoredCase>(
    CASES_STORAGE_KEY,
  );

  const notifications: GeneratedNotification[] = [];

  tasks
    .filter(
      (task) =>
        !task.completed &&
        task.dueDate &&
        task.dueDate <= nextSevenDays,
    )
    .forEach((task) => {
      const days = getDaysDifference(
        task.dueDate || '',
      );

      let title = 'Task due soon';
      let priority: NotificationPriority =
        task.priority || 'Medium';

      if (days < 0) {
        title = 'Overdue task';
        priority = 'High';
      } else if (days === 0) {
        title = 'Task due today';
        priority = 'High';
      } else if (days === 1) {
        title = 'Task due tomorrow';
      }

      notifications.push({
        id: `task-${task.id}-${task.dueDate}`,
        title,
        message: `${task.title}${
          task.assignedTo
            ? ` — Assigned to ${task.assignedTo}`
            : ''
        }${
          task.relatedCase
            ? ` — Case ${task.relatedCase}`
            : ''
        }`,
        category: 'Task',
        priority,
        dueDate: task.dueDate || '',
        sourcePath: '/tasks',
      });
    });

  calendarEvents
    .filter(
      (event) =>
        event.date >= today &&
        event.date <= nextSevenDays,
    )
    .forEach((event) => {
      const days = getDaysDifference(
        event.date,
      );

      let title =
        event.eventType || 'Calendar event';

      let priority: NotificationPriority =
        'Medium';

      if (days === 0) {
        title = `${title} today`;
        priority = 'High';
      } else if (days === 1) {
        title = `${title} tomorrow`;
        priority = 'High';
      } else {
        title = `${title} approaching`;
      }

      notifications.push({
        id: `calendar-${event.id}-${event.date}`,
        title,
        message: `${event.title}${
          event.time
            ? ` at ${event.time}`
            : ''
        }${
          event.court
            ? ` — ${event.court}`
            : ''
        }${
          event.location
            ? ` — ${event.location}`
            : ''
        }`,
        category: 'Calendar',
        priority,
        dueDate: event.date,
        sourcePath: '/calendar',
      });
    });

  payments
    .filter(
      (payment) =>
        payment.status !== 'Paid' &&
        payment.status !== 'Cancelled' &&
        payment.balance > 0 &&
        payment.dueDate &&
        payment.dueDate <= nextSevenDays,
    )
    .forEach((payment) => {
      const days = getDaysDifference(
        payment.dueDate,
      );

      const overdue = days < 0;

      notifications.push({
        id: `payment-${payment.id}-${payment.dueDate}`,
        title: overdue
          ? 'Overdue payment'
          : 'Payment due soon',
        message: `${payment.invoiceNumber} — ${payment.clientName} — Balance ${formatCurrency(
          payment.balance,
        )}`,
        category: 'Payment',
        priority: overdue
          ? 'High'
          : 'Medium',
        dueDate: payment.dueDate,
        sourcePath: '/payments',
      });
    });

  quotations
    .filter(
      (quotation) =>
        (quotation.status === 'Draft' ||
          quotation.status === 'Sent') &&
        quotation.validUntil &&
        quotation.validUntil <=
          nextSevenDays,
    )
    .forEach((quotation) => {
      const days = getDaysDifference(
        quotation.validUntil,
      );

      notifications.push({
        id: `quotation-${quotation.id}-${quotation.validUntil}`,
        title:
          days < 0
            ? 'Quotation expired'
            : 'Quotation expiring soon',
        message: `${quotation.quotationNumber} — ${quotation.clientName}`,
        category: 'Quotation',
        priority:
          days < 0 ? 'High' : 'Medium',
        dueDate: quotation.validUntil,
        sourcePath: '/quotations',
      });
    });

  cases
    .filter(
      (caseItem) =>
        caseItem.status !== 'Closed' &&
        caseItem.nextHearing &&
        caseItem.nextHearing >= today &&
        caseItem.nextHearing <=
          nextSevenDays,
    )
    .forEach((caseItem) => {
      const days = getDaysDifference(
        caseItem.nextHearing || '',
      );

      notifications.push({
        id: `case-${caseItem.id}-${caseItem.nextHearing}`,
        title:
          days === 0
            ? 'Case hearing today'
            : days === 1
              ? 'Case hearing tomorrow'
              : 'Case hearing approaching',
        message: `${caseItem.reference} — ${caseItem.title}`,
        category: 'Case',
        priority:
          days <= 1 ? 'High' : 'Medium',
        dueDate:
          caseItem.nextHearing || '',
        sourcePath: '/cases',
      });
    });

  return notifications;
}

function isManualNotification(
  notification: NotificationItem,
): notification is ManualNotification {
  return 'createdAt' in notification;
}

export function Notifications() {
  const [
    manualNotifications,
    setManualNotifications,
  ] = useState<ManualNotification[]>(() =>
    loadArray<ManualNotification>(
      MANUAL_NOTIFICATIONS_KEY,
    ),
  );

  const [
    generatedNotifications,
    setGeneratedNotifications,
  ] = useState<GeneratedNotification[]>(
    createGeneratedNotifications,
  );

  const [
    readNotificationIds,
    setReadNotificationIds,
  ] = useState<string[]>(() =>
    loadStringArray(
      READ_NOTIFICATIONS_KEY,
    ),
  );

  const [
    dismissedNotificationIds,
    setDismissedNotificationIds,
  ] = useState<string[]>(() =>
    loadStringArray(
      DISMISSED_NOTIFICATIONS_KEY,
    ),
  );

  const [searchTerm, setSearchTerm] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState<'All' | NotificationCategory>(
      'All',
    );

  const [showUnreadOnly, setShowUnreadOnly] =
    useState(false);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [form, setForm] =
    useState<NotificationForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      MANUAL_NOTIFICATIONS_KEY,
      JSON.stringify(manualNotifications),
    );
  }, [manualNotifications]);

  useEffect(() => {
    window.localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(readNotificationIds),
    );
  }, [readNotificationIds]);

  useEffect(() => {
    window.localStorage.setItem(
      DISMISSED_NOTIFICATIONS_KEY,
      JSON.stringify(
        dismissedNotificationIds,
      ),
    );
  }, [dismissedNotificationIds]);

  useEffect(() => {
    const refreshNotifications = () => {
      setGeneratedNotifications(
        createGeneratedNotifications(),
      );
    };

    refreshNotifications();

    window.addEventListener(
      'focus',
      refreshNotifications,
    );

    window.addEventListener(
      'storage',
      refreshNotifications,
    );

    return () => {
      window.removeEventListener(
        'focus',
        refreshNotifications,
      );

      window.removeEventListener(
        'storage',
        refreshNotifications,
      );
    };
  }, []);

  const allNotifications = useMemo(() => {
    const generated =
      generatedNotifications.filter(
        (notification) =>
          !dismissedNotificationIds.includes(
            notification.id,
          ),
      );

    return [
      ...manualNotifications,
      ...generated,
    ].sort((first, second) => {
      const firstDate =
        first.dueDate ||
        (isManualNotification(first)
          ? first.createdAt.slice(0, 10)
          : '');

      const secondDate =
        second.dueDate ||
        (isManualNotification(second)
          ? second.createdAt.slice(0, 10)
          : '');

      return firstDate.localeCompare(
        secondDate,
      );
    });
  }, [
    manualNotifications,
    generatedNotifications,
    dismissedNotificationIds,
  ]);

  const filteredNotifications =
    useMemo(() => {
      const search =
        searchTerm.trim().toLowerCase();

      return allNotifications.filter(
        (notification) => {
          const isRead =
            isManualNotification(notification)
              ? notification.read
              : readNotificationIds.includes(
                  notification.id,
                );

          const matchesSearch =
            !search ||
            [
              notification.title,
              notification.message,
              notification.category,
              notification.priority,
              notification.dueDate,
            ]
              .join(' ')
              .toLowerCase()
              .includes(search);

          const matchesCategory =
            categoryFilter === 'All' ||
            notification.category ===
              categoryFilter;

          const matchesUnread =
            !showUnreadOnly || !isRead;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesUnread
          );
        },
      );
    }, [
      allNotifications,
      searchTerm,
      categoryFilter,
      showUnreadOnly,
      readNotificationIds,
    ]);

  const unreadCount =
    allNotifications.filter(
      (notification) =>
        isManualNotification(notification)
          ? !notification.read
          : !readNotificationIds.includes(
              notification.id,
            ),
    ).length;

  const highPriorityCount =
    allNotifications.filter(
      (notification) =>
        notification.priority === 'High',
    ).length;

  const dueTodayCount =
    allNotifications.filter(
      (notification) =>
        notification.dueDate ===
        getLocalDate(),
    ).length;

  const openAddForm = () => {
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyForm);
  };

  const updateForm = <
    K extends keyof NotificationForm,
  >(
    field: K,
    value: NotificationForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveNotification = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert(
        'Notification title is required.',
      );

      return;
    }

    if (!form.message.trim()) {
      window.alert(
        'Notification message is required.',
      );

      return;
    }

    const newNotification: ManualNotification =
      {
        id: `manual-${Date.now()}`,
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        priority: form.priority,
        dueDate: form.dueDate,
        read: false,
        createdAt:
          new Date().toISOString(),
      };

    setManualNotifications(
      (currentNotifications) => [
        newNotification,
        ...currentNotifications,
      ],
    );

    closeForm();
  };

  const markAsRead = (
    notification: NotificationItem,
  ) => {
    if (isManualNotification(notification)) {
      setManualNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (currentNotification) =>
              currentNotification.id ===
              notification.id
                ? {
                    ...currentNotification,
                    read: true,
                  }
                : currentNotification,
          ),
      );

      return;
    }

    setReadNotificationIds((currentIds) =>
      currentIds.includes(notification.id)
        ? currentIds
        : [...currentIds, notification.id],
    );
  };

  const markAsUnread = (
    notification: NotificationItem,
  ) => {
    if (isManualNotification(notification)) {
      setManualNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (currentNotification) =>
              currentNotification.id ===
              notification.id
                ? {
                    ...currentNotification,
                    read: false,
                  }
                : currentNotification,
          ),
      );

      return;
    }

    setReadNotificationIds((currentIds) =>
      currentIds.filter(
        (id) => id !== notification.id,
      ),
    );
  };

  const markAllAsRead = () => {
    setManualNotifications(
      (currentNotifications) =>
        currentNotifications.map(
          (notification) => ({
            ...notification,
            read: true,
          }),
        ),
    );

    setReadNotificationIds(
      generatedNotifications.map(
        (notification) => notification.id,
      ),
    );
  };

  const deleteNotification = (
    notification: NotificationItem,
  ) => {
    const confirmed = window.confirm(
      'Remove this notification?',
    );

    if (!confirmed) {
      return;
    }

    if (isManualNotification(notification)) {
      setManualNotifications(
        (currentNotifications) =>
          currentNotifications.filter(
            (currentNotification) =>
              currentNotification.id !==
              notification.id,
          ),
      );

      return;
    }

    setDismissedNotificationIds(
      (currentIds) =>
        currentIds.includes(
          notification.id,
        )
          ? currentIds
          : [
              ...currentIds,
              notification.id,
            ],
    );
  };

  const priorityClasses: Record<
    NotificationPriority,
    string
  > = {
    High: 'bg-red-100 text-red-700',
    Medium:
      'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };

  const categoryIcon = (
    category: NotificationCategory,
  ) => {
    if (category === 'Task') {
      return CheckCircle2;
    }

    if (category === 'Calendar') {
      return CalendarDays;
    }

    if (category === 'Payment') {
      return Wallet;
    }

    if (category === 'Quotation') {
      return Receipt;
    }

    if (category === 'Case') {
      return Briefcase;
    }

    return Bell;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-gray-500">
            Monitor deadlines, hearings, payments
            and important reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-orange-700"
        >
          <Plus className="h-5 w-5" />
          Add Reminder
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total alerts
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {allNotifications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Unread
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-700">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            High priority
          </p>

          <p className="mt-1 text-2xl font-bold text-red-700">
            {highPriorityCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Due today
          </p>

          <p className="mt-1 text-2xl font-bold text-orange-700">
            {dueTodayCount}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            placeholder="Search notifications"
            className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value as
                | 'All'
                | NotificationCategory,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-orange-500"
        >
          <option value="All">
            All categories
          </option>

          <option value="Task">Tasks</option>
          <option value="Calendar">
            Calendar
          </option>
          <option value="Payment">
            Payments
          </option>
          <option value="Quotation">
            Quotations
          </option>
          <option value="Case">Cases</option>
          <option value="General">
            General
          </option>
        </select>

        <button
          type="button"
          onClick={markAllAsRead}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Check className="h-5 w-5" />
          Mark all read
        </button>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showUnreadOnly}
          onChange={(event) =>
            setShowUnreadOnly(
              event.target.checked,
            )
          }
          className="h-4 w-4 rounded"
        />

        Show unread notifications only
      </label>

      <div className="mt-6 space-y-4">
        {filteredNotifications.map(
          (notification) => {
            const Icon = categoryIcon(
              notification.category,
            );

            const isRead =
              isManualNotification(
                notification,
              )
                ? notification.read
                : readNotificationIds.includes(
                    notification.id,
                  );

            return (
              <article
                key={notification.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  isRead
                    ? 'border-gray-200 opacity-75'
                    : 'border-orange-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 rounded-xl p-3 ${
                      notification.priority ===
                      'High'
                        ? 'bg-red-100 text-red-600'
                        : notification.priority ===
                            'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-gray-900">
                            {
                              notification.title
                            }
                          </h2>

                          {!isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {
                            notification.message
                          }
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          priorityClasses[
                            notification
                              .priority
                          ]
                        }`}
                      >
                        {
                          notification.priority
                        }
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">
                        {
                          notification.category
                        }
                      </span>

                      {notification.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-4 w-4" />
                          {formatDate(
                            notification.dueDate,
                          )}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      {isRead ? (
                        <button
                          type="button"
                          onClick={() =>
                            markAsUnread(
                              notification,
                            )
                          }
                          className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Mark unread
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              notification,
                            )
                          }
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                          Mark read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(
                            notification,
                          )
                        }
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          },
        )}

        {filteredNotifications.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Bell className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-gray-500">
              No matching notifications found.
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Reminder
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a manual internal
                  notification.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close notification form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveNotification}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Title *
                </label>

                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      'title',
                      event.target.value,
                    )
                  }
                  placeholder="Follow up with client"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Message *
                </label>

                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(event) =>
                    updateForm(
                      'message',
                      event.target.value,
                    )
                  }
                  placeholder="Describe the reminder or required action"
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateForm(
                        'category',
                        event.target
                          .value as NotificationCategory,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  >
                    <option value="General">
                      General
                    </option>

                    <option value="Task">
                      Task
                    </option>

                    <option value="Calendar">
                      Calendar
                    </option>

                    <option value="Payment">
                      Payment
                    </option>

                    <option value="Quotation">
                      Quotation
                    </option>

                    <option value="Case">
                      Case
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(event) =>
                      updateForm(
                        'priority',
                        event.target
                          .value as NotificationPriority,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Reminder date
                </label>

                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    updateForm(
                      'dueDate',
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                Automatic notifications are also
                generated from tasks, hearings,
                payment deadlines, quotations and case
                hearing dates.
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}