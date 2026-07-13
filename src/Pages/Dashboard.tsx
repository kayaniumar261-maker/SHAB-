import {
  AlertCircle,
  Briefcase,
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  Scale,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type StoredClient = {
  id: number;
  name: string;
};

type StoredCase = {
  id: number;
  title: string;
  status?: 'Active' | 'Pending' | 'Closed';
};

type StoredTask = {
  id: number;
  title: string;
  completed?: boolean;
  dueDate?: string;
};

type StoredCalendarEvent = {
  id: number;
  title: string;
  eventType?: string;
  date: string;
  time?: string;
  court?: string;
  location?: string;
};

function readStorageArray<T>(key: string): T[] {
  try {
    const savedValue = window.localStorage.getItem(key);

    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function getTodayDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 18) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

export function Dashboard() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<StoredClient[]>([]);
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [events, setEvents] = useState<StoredCalendarEvent[]>([]);

  const refreshDashboard = () => {
    setClients(readStorageArray<StoredClient>('shab-clients'));
    setCases(readStorageArray<StoredCase>('shab-cases'));
    setTasks(readStorageArray<StoredTask>('shab-tasks'));
    setEvents(
      readStorageArray<StoredCalendarEvent>(
        'shab-calendar-events',
      ),
    );
  };

  useEffect(() => {
    refreshDashboard();

    window.addEventListener('focus', refreshDashboard);
    window.addEventListener('storage', refreshDashboard);

    return () => {
      window.removeEventListener('focus', refreshDashboard);
      window.removeEventListener('storage', refreshDashboard);
    };
  }, []);

  const today = getTodayDate();

  const activeCaseCount = useMemo(
    () =>
      cases.filter(
        (caseItem) =>
          !caseItem.status || caseItem.status === 'Active',
      ).length,
    [cases],
  );

  const pendingTaskCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );

  const completedTaskCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );

  const todayEvents = useMemo(
    () =>
      events
        .filter((event) => event.date === today)
        .sort((firstEvent, secondEvent) =>
          (firstEvent.time || '').localeCompare(
            secondEvent.time || '',
          ),
        ),
    [events, today],
  );

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((event) => event.date >= today)
        .sort((firstEvent, secondEvent) => {
          const firstDateTime = `${firstEvent.date}T${
            firstEvent.time || '00:00'
          }`;

          const secondDateTime = `${secondEvent.date}T${
            secondEvent.time || '00:00'
          }`;

          return firstDateTime.localeCompare(secondDateTime);
        })
        .slice(0, 5),
    [events, today],
  );

  const stats = [
    {
      label: 'Clients',
      value: clients.length,
      icon: Users,
      iconClasses: 'bg-blue-100 text-blue-600',
      path: '/clients',
    },
    {
      label: 'Active Cases',
      value: activeCaseCount,
      icon: Briefcase,
      iconClasses: 'bg-purple-100 text-purple-600',
      path: '/cases',
    },
    {
      label: 'Open Tasks',
      value: pendingTaskCount,
      icon: CheckSquare,
      iconClasses: 'bg-green-100 text-green-600',
      path: '/tasks',
    },
    {
      label: "Today's Events",
      value: todayEvents.length,
      icon: CalendarIcon,
      iconClasses: 'bg-orange-100 text-orange-600',
      path: '/calendar',
    },
  ];

  const quickActions = [
    {
      label: 'Add Client',
      icon: Users,
      path: '/clients',
      iconClasses: 'bg-blue-600',
    },
    {
      label: 'Add Case',
      icon: Briefcase,
      path: '/cases',
      iconClasses: 'bg-purple-600',
    },
    {
      label: 'Add Task',
      icon: CheckSquare,
      path: '/tasks',
      iconClasses: 'bg-green-600',
    },
    {
      label: 'Add Event',
      icon: CalendarIcon,
      path: '/calendar',
      iconClasses: 'bg-orange-500',
    },
    {
      label: 'Documents',
      icon: FileText,
      path: '/documents',
      iconClasses: 'bg-indigo-600',
    },
    {
      label: 'Legal Notice',
      icon: Scale,
      path: '/legal-notices',
      iconClasses: 'bg-red-600',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          SHAB Legal Practice Manager
        </p>
      </div>

      <section className="mb-6 rounded-2xl bg-gradient-to-r from-gray-900 to-slate-700 p-5 text-white shadow-sm">
        <p className="font-semibold text-yellow-400">
          {getGreeting()}, Umar
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-200">
          You have{' '}
          <strong className="text-white">
            {pendingTaskCount}
          </strong>{' '}
          open tasks and{' '}
          <strong className="text-white">
            {todayEvents.length}
          </strong>{' '}
          scheduled events today.
        </p>

        <button
          type="button"
          onClick={refreshDashboard}
          className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          Refresh dashboard
        </button>
      </section>

      <section className="mb-7">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => navigate(stat.path)}
                className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {stat.label}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-3 ${stat.iconClasses}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-7">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Quick Actions
        </h2>

        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-sm transition hover:shadow-md"
              >
                <div
                  className={`rounded-full p-3 text-white ${action.iconClasses}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="text-xs font-semibold text-gray-700">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Today&apos;s Schedule
            </h2>

            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="text-sm font-medium text-orange-600"
            >
              View calendar
            </button>
          </div>

          <div className="space-y-3">
            {todayEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigate('/calendar')}
                className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm"
              >
                <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                  <CalendarIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {event.title}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {event.time || 'Time not set'}
                    {event.location
                      ? ` • ${event.location}`
                      : ''}
                  </p>

                  {event.court && (
                    <p className="mt-1 text-xs text-gray-400">
                      {event.court}
                    </p>
                  )}
                </div>
              </button>
            ))}

            {todayEvents.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                No events scheduled for today.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Upcoming Events
            </h2>

            <span className="text-sm text-gray-500">
              Next {upcomingEvents.length}
            </span>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {event.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {event.date}
                      {event.time ? ` at ${event.time}` : ''}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {event.eventType || 'Event'}
                  </span>
                </div>
              </div>
            ))}

            {upcomingEvents.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                No upcoming calendar events.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-7 rounded-2xl border-l-4 border-yellow-500 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />

          <div>
            <p className="font-semibold text-gray-900">
              Work summary
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {completedTaskCount} tasks completed and{' '}
              {pendingTaskCount} tasks currently open.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}