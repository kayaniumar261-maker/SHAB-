import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gavel,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type CalendarEventType =
  | 'Hearing'
  | 'Deadline'
  | 'Meeting'
  | 'Task'
  | 'Reminder'
  | 'Appointment'
  | 'Other';

type CalendarEventStatus =
  | 'Upcoming'
  | 'Completed'
  | 'Cancelled';

type EventSource =
  | 'Calendar'
  | 'Hearing'
  | 'Task';

type CalendarEvent = {
  id: string;
  sourceId: number | string;
  title: string;
  eventType: CalendarEventType;
  date: string;
  time: string;
  endTime: string;
  court: string;
  location: string;
  relatedCase: string;
  clientName: string;
  assignedTo: string;
  status: CalendarEventStatus;
  notes: string;
  source: EventSource;
  createdAt: string;
  updatedAt: string;
};

type StoredHearing = {
  id: number | string;
  title?: string;
  relatedCase?: string;
  caseTitle?: string;
  clientName?: string;
  courtName?: string;
  hearingDate?: string;
  hearingTime?: string;
  assignedLawyer?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type StoredTask = {
  id: number | string;
  title?: string;
  description?: string;
  assignedTo?: string;
  relatedCase?: string;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
};

type StoredCase = {
  id: number | string;
  title?: string;
  reference?: string;
  client?: string;
  court?: string;
  assignedTo?: string;
};

type StoredStaff = {
  id: number | string;
  name?: string;
  role?: string;
  status?: string;
};

type CalendarForm = {
  title: string;
  eventType: CalendarEventType;
  date: string;
  time: string;
  endTime: string;
  court: string;
  location: string;
  relatedCase: string;
  clientName: string;
  assignedTo: string;
  status: CalendarEventStatus;
  notes: string;
};

const CALENDAR_STORAGE_KEY =
  'shab-calendar-events';

const HEARINGS_STORAGE_KEY =
  'shab-hearings';

const TASKS_STORAGE_KEY =
  'shab-tasks';

const CASES_STORAGE_KEY =
  'shab-cases';

const STAFF_STORAGE_KEY =
  'shab-staff';

const emptyForm: CalendarForm = {
  title: '',
  eventType: 'Meeting',
  date: '',
  time: '',
  endTime: '',
  court: '',
  location: '',
  relatedCase: '',
  clientName: '',
  assignedTo: '',
  status: 'Upcoming',
  notes: '',
};

function loadArray<T>(
  key: string,
): T[] {
  try {
    const savedValue =
      window.localStorage.getItem(key);

    if (!savedValue) {
      return [];
    }

    const parsedValue =
      JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
}

function saveManualEvents(
  events: CalendarEvent[],
): void {
  const manualEvents =
    events.filter(
      (event) =>
        event.source === 'Calendar',
    );

  window.localStorage.setItem(
    CALENDAR_STORAGE_KEY,
    JSON.stringify(manualEvents),
  );

  window.dispatchEvent(
    new CustomEvent(
      'shab-calendar-updated',
    ),
  );
}

function normalizeManualEvents():
  CalendarEvent[] {
  const savedEvents =
    loadArray<
      Partial<CalendarEvent>
    >(CALENDAR_STORAGE_KEY);

  return savedEvents.map(
    (event, index) => {
      const now =
        new Date().toISOString();

      return {
        id:
          typeof event.id === 'string'
            ? event.id
            : `calendar-${
                event.sourceId ??
                event.id ??
                index
              }`,

        sourceId:
          event.sourceId ??
          event.id ??
          index,

        title:
          event.title ??
          'Untitled Event',

        eventType:
          event.eventType ??
          'Other',

        date: event.date ?? '',
        time: event.time ?? '',
        endTime:
          event.endTime ?? '',
        court: event.court ?? '',
        location:
          event.location ?? '',
        relatedCase:
          event.relatedCase ?? '',
        clientName:
          event.clientName ?? '',
        assignedTo:
          event.assignedTo ?? '',

        status:
          event.status ??
          'Upcoming',

        notes: event.notes ?? '',
        source: 'Calendar',

        createdAt:
          event.createdAt ?? now,

        updatedAt:
          event.updatedAt ?? now,
      };
    },
  );
}

function hearingsToEvents():
  CalendarEvent[] {
  const hearings =
    loadArray<StoredHearing>(
      HEARINGS_STORAGE_KEY,
    );

  return hearings
    .filter(
      (hearing) =>
        Boolean(
          hearing.hearingDate,
        ),
    )
    .map((hearing) => {
      const hearingStatus =
        String(
          hearing.status ?? '',
        ).toLowerCase();

      let status:
        CalendarEventStatus =
        'Upcoming';

      if (
        hearingStatus ===
          'completed' ||
        hearingStatus ===
          'attended'
      ) {
        status = 'Completed';
      }

      if (
        hearingStatus ===
        'cancelled'
      ) {
        status = 'Cancelled';
      }

      const now =
        new Date().toISOString();

      return {
        id: `hearing-${hearing.id}`,
        sourceId: hearing.id,

        title:
          hearing.title ||
          hearing.caseTitle ||
          'Court Hearing',

        eventType: 'Hearing',
        date:
          hearing.hearingDate ??
          '',
        time:
          hearing.hearingTime ??
          '',
        endTime: '',

        court:
          hearing.courtName ?? '',

        location:
          hearing.courtName ?? '',

        relatedCase:
          hearing.relatedCase ??
          '',

        clientName:
          hearing.clientName ?? '',

        assignedTo:
          hearing.assignedLawyer ??
          '',

        status,
        notes: hearing.notes ?? '',
        source: 'Hearing',

        createdAt:
          hearing.createdAt ?? now,

        updatedAt:
          hearing.updatedAt ?? now,
      };
    });
}

function tasksToEvents():
  CalendarEvent[] {
  const tasks =
    loadArray<StoredTask>(
      TASKS_STORAGE_KEY,
    );

  return tasks
    .filter(
      (task) =>
        Boolean(task.dueDate),
    )
    .map((task) => {
      const now =
        new Date().toISOString();

      return {
        id: `task-${task.id}`,
        sourceId: task.id,

        title:
          task.title ||
          'Task Deadline',

        eventType: 'Task',
        date: task.dueDate ?? '',
        time: '',
        endTime: '',
        court: '',
        location: '',

        relatedCase:
          task.relatedCase ?? '',

        clientName: '',

        assignedTo:
          task.assignedTo ?? '',

        status:
          task.completed
            ? 'Completed'
            : 'Upcoming',

        notes:
          task.description ?? '',

        source: 'Task',
        createdAt: now,
        updatedAt: now,
      };
    });
}

function loadCombinedEvents():
  CalendarEvent[] {
  return [
    ...normalizeManualEvents(),
    ...hearingsToEvents(),
    ...tasksToEvents(),
  ];
}

function getLocalDate(): string {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return 'Date not set';
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatTime(
  value: string,
): string {
  if (!value) {
    return 'Time not set';
  }

  const [hours, minutes] =
    value.split(':');

  const date = new Date();

  date.setHours(
    Number.parseInt(
      hours,
      10,
    ),
    Number.parseInt(
      minutes,
      10,
    ),
    0,
    0,
  );

  return date.toLocaleTimeString(
    'en-AE',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function getDaysDifference(
  dateValue: string,
): number {
  if (!dateValue) {
    return 0;
  }

  const today = new Date(
    `${getLocalDate()}T00:00:00`,
  );

  const eventDate =
    new Date(
      `${dateValue}T00:00:00`,
    );

  return Math.ceil(
    (eventDate.getTime() -
      today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function getRelativeDate(
  dateValue: string,
): string {
  const difference =
    getDaysDifference(
      dateValue,
    );

  if (difference < 0) {
    const days =
      Math.abs(difference);

    return `${days} day${
      days === 1 ? '' : 's'
    } ago`;
  }

  if (difference === 0) {
    return 'Today';
  }

  if (difference === 1) {
    return 'Tomorrow';
  }

  return `In ${difference} days`;
}

export function CalendarPage() {
  const [events, setEvents] =
    useState<CalendarEvent[]>(
      loadCombinedEvents,
    );

  const [cases, setCases] =
    useState<StoredCase[]>(() =>
      loadArray<StoredCase>(
        CASES_STORAGE_KEY,
      ),
    );

  const [staff, setStaff] =
    useState<StoredStaff[]>(() =>
      loadArray<StoredStaff>(
        STAFF_STORAGE_KEY,
      ),
    );

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<
    'All' | CalendarEventType
  >('All');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    'All' | CalendarEventStatus
  >('All');

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const [
    editingEventId,
    setEditingEventId,
  ] = useState<
    string | null
  >(null);

  const [form, setForm] =
    useState<CalendarForm>(
      emptyForm,
    );

  const refreshData = () => {
    setEvents(
      loadCombinedEvents(),
    );

    setCases(
      loadArray<StoredCase>(
        CASES_STORAGE_KEY,
      ),
    );

    setStaff(
      loadArray<StoredStaff>(
        STAFF_STORAGE_KEY,
      ),
    );
  };

  useEffect(() => {
    window.addEventListener(
      'focus',
      refreshData,
    );

    window.addEventListener(
      'storage',
      refreshData,
    );

    window.addEventListener(
      'shab-calendar-updated',
      refreshData,
    );

    window.addEventListener(
      'shab-storage-updated',
      refreshData,
    );

    return () => {
      window.removeEventListener(
        'focus',
        refreshData,
      );

      window.removeEventListener(
        'storage',
        refreshData,
      );

      window.removeEventListener(
        'shab-calendar-updated',
        refreshData,
      );

      window.removeEventListener(
        'shab-storage-updated',
        refreshData,
      );
    };
  }, []);

  const filteredEvents =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return [...events]
        .sort((first, second) => {
          const firstDate =
            `${first.date}T${
              first.time ||
              '00:00'
            }`;

          const secondDate =
            `${second.date}T${
              second.time ||
              '00:00'
            }`;

          return (
            new Date(
              firstDate,
            ).getTime() -
            new Date(
              secondDate,
            ).getTime()
          );
        })
        .filter((event) => {
          const matchesType =
            typeFilter === 'All' ||
            event.eventType ===
              typeFilter;

          const matchesStatus =
            statusFilter ===
              'All' ||
            event.status ===
              statusFilter;

          const matchesSearch =
            !search ||
            [
              event.title,
              event.eventType,
              event.date,
              event.court,
              event.location,
              event.relatedCase,
              event.clientName,
              event.assignedTo,
              event.notes,
              event.source,
            ]
              .join(' ')
              .toLowerCase()
              .includes(search);

          return (
            matchesType &&
            matchesStatus &&
            matchesSearch
          );
        });
    }, [
      events,
      searchTerm,
      typeFilter,
      statusFilter,
    ]);

  const upcomingCount =
    events.filter(
      (event) =>
        event.status ===
          'Upcoming' &&
        getDaysDifference(
          event.date,
        ) >= 0,
    ).length;

  const hearingCount =
    events.filter(
      (event) =>
        event.eventType ===
        'Hearing',
    ).length;

  const taskCount =
    events.filter(
      (event) =>
        event.eventType ===
        'Task',
    ).length;

  const completedCount =
    events.filter(
      (event) =>
        event.status ===
        'Completed',
    ).length;

  const openAddForm = () => {
    setEditingEventId(null);

    setForm({
      ...emptyForm,
      date: getLocalDate(),
      assignedTo:
        staff.find(
          (member) =>
            member.status !==
            'Inactive',
        )?.name ?? '',
    });

    setIsFormOpen(true);
  };

  const openEditForm = (
    event: CalendarEvent,
  ) => {
    if (
      event.source !==
      'Calendar'
    ) {
      window.alert(
        `${event.eventType} records must be edited from the ${event.source}s module.`,
      );

      return;
    }

    setEditingEventId(
      event.id,
    );

    setForm({
      title: event.title,
      eventType:
        event.eventType,
      date: event.date,
      time: event.time,
      endTime:
        event.endTime,
      court: event.court,
      location:
        event.location,
      relatedCase:
        event.relatedCase,
      clientName:
        event.clientName,
      assignedTo:
        event.assignedTo,
      status: event.status,
      notes: event.notes,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEventId(null);
    setForm(emptyForm);
  };

  const updateForm = <
    K extends keyof CalendarForm,
  >(
    field: K,
    value: CalendarForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveEvent = (
    submitEvent: FormEvent,
  ) => {
    submitEvent.preventDefault();

    if (!form.title.trim()) {
      window.alert(
        'Event title is required.',
      );

      return;
    }

    if (!form.date) {
      window.alert(
        'Event date is required.',
      );

      return;
    }

    const now =
      new Date().toISOString();

    const manualEvents =
      events.filter(
        (event) =>
          event.source ===
          'Calendar',
      );

    if (editingEventId) {
      const updatedManualEvents =
        manualEvents.map(
          (event) =>
            event.id ===
            editingEventId
              ? {
                  ...event,
                  ...form,
                  title:
                    form.title.trim(),
                  court:
                    form.court.trim(),
                  location:
                    form.location.trim(),
                  relatedCase:
                    form.relatedCase.trim(),
                  clientName:
                    form.clientName.trim(),
                  assignedTo:
                    form.assignedTo.trim(),
                  notes:
                    form.notes.trim(),
                  updatedAt: now,
                }
              : event,
        );

      saveManualEvents(
        updatedManualEvents,
      );
    } else {
      const sourceId =
        Date.now();

      const newEvent:
        CalendarEvent = {
        id: `calendar-${sourceId}`,
        sourceId,
        title:
          form.title.trim(),
        eventType:
          form.eventType,
        date: form.date,
        time: form.time,
        endTime:
          form.endTime,
        court:
          form.court.trim(),
        location:
          form.location.trim(),
        relatedCase:
          form.relatedCase.trim(),
        clientName:
          form.clientName.trim(),
        assignedTo:
          form.assignedTo.trim(),
        status:
          form.status,
        notes:
          form.notes.trim(),
        source: 'Calendar',
        createdAt: now,
        updatedAt: now,
      };

      saveManualEvents([
        newEvent,
        ...manualEvents,
      ]);
    }

    refreshData();
    closeForm();
  };

  const deleteEvent = (
    event: CalendarEvent,
  ) => {
    if (
      event.source !==
      'Calendar'
    ) {
      window.alert(
        `${event.eventType} records must be deleted from the ${event.source}s module.`,
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${event.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    const remaining =
      events.filter(
        (item) =>
          item.source ===
            'Calendar' &&
          item.id !== event.id,
      );

    saveManualEvents(
      remaining,
    );

    refreshData();
  };

  const iconForEvent = (
    type: CalendarEventType,
  ) => {
    if (type === 'Hearing') {
      return Gavel;
    }

    if (type === 'Task') {
      return CheckCircle2;
    }

    if (
      type === 'Deadline'
    ) {
      return Clock3;
    }

    if (
      type === 'Meeting' ||
      type ===
        'Appointment'
    ) {
      return Briefcase;
    }

    return CalendarDays;
  };

  const eventClasses:
    Record<
      CalendarEventType,
      string
    > = {
    Hearing:
      'bg-red-100 text-red-700',
    Task:
      'bg-green-100 text-green-700',
    Deadline:
      'bg-orange-100 text-orange-700',
    Meeting:
      'bg-blue-100 text-blue-700',
    Reminder:
      'bg-purple-100 text-purple-700',
    Appointment:
      'bg-cyan-100 text-cyan-700',
    Other:
      'bg-gray-100 text-gray-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Calendar
          </h1>

          <p className="mt-1 text-gray-500">
            Hearings, task deadlines and SHAB events in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black shadow-sm hover:bg-[#b89536]"
        >
          <Plus className="h-5 w-5" />
          Add Event
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox
          label="Upcoming"
          value={upcomingCount}
        />

        <StatBox
          label="Hearings"
          value={hearingCount}
        />

        <StatBox
          label="Tasks"
          value={taskCount}
        />

        <StatBox
          label="Completed"
          value={completedCount}
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
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
            placeholder="Search calendar"
            className="w-full bg-transparent outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(
              event.target
                .value as
                | 'All'
                | CalendarEventType,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <option value="All">
            All types
          </option>

          <option value="Hearing">
            Hearings
          </option>

          <option value="Task">
            Tasks
          </option>

          <option value="Deadline">
            Deadlines
          </option>

          <option value="Meeting">
            Meetings
          </option>

          <option value="Reminder">
            Reminders
          </option>

          <option value="Appointment">
            Appointments
          </option>

          <option value="Other">
            Other
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as
                | 'All'
                | CalendarEventStatus,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <option value="All">
            All statuses
          </option>

          <option value="Upcoming">
            Upcoming
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {filteredEvents.map(
          (event) => {
            const Icon =
              iconForEvent(
                event.eventType,
              );

            return (
              <article
                key={event.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl p-3 ${
                      eventClasses[
                        event.eventType
                      ]
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {event.title}
                        </h2>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              eventClasses[
                                event
                                  .eventType
                              ]
                            }`}
                          >
                            {
                              event.eventType
                            }
                          </span>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {
                              event.source
                            }
                          </span>

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {
                              event.status
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              event,
                            )
                          }
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteEvent(
                              event,
                            )
                          }
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />

                        <span>
                          {formatDate(
                            event.date,
                          )}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-gray-400" />

                        <span>
                          {formatTime(
                            event.time,
                          )}
                        </span>
                      </p>

                      <p className="font-medium text-[#8A6B20]">
                        {getRelativeDate(
                          event.date,
                        )}
                      </p>

                      {event.court && (
                        <p className="flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-gray-400" />

                          <span>
                            {event.court}
                          </span>
                        </p>
                      )}

                      {event.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />

                          <span>
                            {
                              event.location
                            }
                          </span>
                        </p>
                      )}

                      {event.relatedCase && (
                        <p>
                          <strong>
                            Case:
                          </strong>{' '}
                          {
                            event.relatedCase
                          }
                        </p>
                      )}

                      {event.assignedTo && (
                        <p>
                          <strong>
                            Assigned:
                          </strong>{' '}
                          {
                            event.assignedTo
                          }
                        </p>
                      )}

                      {event.clientName && (
                        <p>
                          <strong>
                            Client:
                          </strong>{' '}
                          {
                            event.clientName
                          }
                        </p>
                      )}
                    </div>

                    {event.notes && (
                      <p className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-600">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          },
        )}

        {filteredEvents.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No calendar events found.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingEventId
                    ? 'Edit Event'
                    : 'Add Event'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manual calendar event
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveEvent}
              className="space-y-5 p-5"
            >
              <FieldInput
                label="Event title *"
                required
                value={form.title}
                onChange={(value) =>
                  updateForm(
                    'title',
                    value,
                  )
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSelect
                  label="Event type"
                  value={
                    form.eventType
                  }
                  onChange={(value) =>
                    updateForm(
                      'eventType',
                      value as CalendarEventType,
                    )
                  }
                  options={[
                    'Hearing',
                    'Deadline',
                    'Meeting',
                    'Task',
                    'Reminder',
                    'Appointment',
                    'Other',
                  ]}
                />

                <FieldSelect
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    updateForm(
                      'status',
                      value as CalendarEventStatus,
                    )
                  }
                  options={[
                    'Upcoming',
                    'Completed',
                    'Cancelled',
                  ]}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FieldInput
                  label="Date *"
                  type="date"
                  required
                  value={form.date}
                  onChange={(value) =>
                    updateForm(
                      'date',
                      value,
                    )
                  }
                />

                <FieldInput
                  label="Start time"
                  type="time"
                  value={form.time}
                  onChange={(value) =>
                    updateForm(
                      'time',
                      value,
                    )
                  }
                />

                <FieldInput
                  label="End time"
                  type="time"
                  value={
                    form.endTime
                  }
                  onChange={(value) =>
                    updateForm(
                      'endTime',
                      value,
                    )
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldInput
                  label="Court"
                  value={form.court}
                  onChange={(value) =>
                    updateForm(
                      'court',
                      value,
                    )
                  }
                />

                <FieldInput
                  label="Location"
                  value={
                    form.location
                  }
                  onChange={(value) =>
                    updateForm(
                      'location',
                      value,
                    )
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Related case
                  </label>

                  <select
                    value={
                      form.relatedCase
                    }
                    onChange={(event) =>
                      updateForm(
                        'relatedCase',
                        event.target
                          .value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    <option value="">
                      No related case
                    </option>

                    {cases.map(
                      (caseItem) => (
                        <option
                          key={
                            caseItem.id
                          }
                          value={
                            caseItem.reference ??
                            ''
                          }
                        >
                          {caseItem.reference ||
                            caseItem.title ||
                            'Case'}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Assigned to
                  </label>

                  <select
                    value={
                      form.assignedTo
                    }
                    onChange={(event) =>
                      updateForm(
                        'assignedTo',
                        event.target
                          .value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {staff.map(
                      (member) => (
                        <option
                          key={
                            member.id
                          }
                          value={
                            member.name ??
                            ''
                          }
                        >
                          {member.name ||
                            'Staff member'}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <FieldInput
                label="Client name"
                value={
                  form.clientName
                }
                onChange={(value) =>
                  updateForm(
                    'clientName',
                    value,
                  )
                }
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Notes
                </label>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target
                        .value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div className="flex gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black"
                >
                  {editingEventId
                    ? 'Save Changes'
                    : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type StatBoxProps = {
  label: string;
  value: number;
};

function StatBox({
  label,
  value,
}: StatBoxProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

type FieldInputProps = {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  required?: boolean;
};

function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: FieldInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </div>
  );
}

type FieldSelectProps = {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: string[];
};

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: FieldSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ),
        )}
      </select>
    </div>
  );
}