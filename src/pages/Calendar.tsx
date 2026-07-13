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

type CalendarEvent = {
  id: number;
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
  source: 'Calendar' | 'Hearing';
  createdAt: string;
  updatedAt: string;
};

type StoredCase = {
  id: number;
  title: string;
  reference: string;
  client?: string;
  court?: string;
  assignedTo?: string;
};

type StoredStaff = {
  id: number;
  name: string;
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

const CALENDAR_STORAGE_KEY = 'shab-calendar-events';
const CASES_STORAGE_KEY = 'shab-cases';
const STAFF_STORAGE_KEY = 'shab-staff';

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

function loadArray<T>(key: string): T[] {
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

function normalizeCalendarEvents(): CalendarEvent[] {
  const savedEvents = loadArray<
    Partial<CalendarEvent>
  >(CALENDAR_STORAGE_KEY);

  return savedEvents.map((event) => ({
    id: event.id || Date.now(),
    title: event.title || 'Untitled Event',
    eventType:
      (event.eventType as CalendarEventType) ||
      'Other',
    date: event.date || '',
    time: event.time || '',
    endTime: event.endTime || '',
    court: event.court || '',
    location: event.location || '',
    relatedCase: event.relatedCase || '',
    clientName: event.clientName || '',
    assignedTo: event.assignedTo || '',
    status:
      (event.status as CalendarEventStatus) ||
      'Upcoming',
    notes: event.notes || '',
    source:
      event.source === 'Hearing'
        ? 'Hearing'
        : event.eventType === 'Hearing'
          ? 'Hearing'
          : 'Calendar',
    createdAt:
      event.createdAt ||
      new Date().toISOString(),
    updatedAt:
      event.updatedAt ||
      new Date().toISOString(),
  }));
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

function formatDate(value: string): string {
  if (!value) {
    return 'Date not set';
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value: string): string {
  if (!value) {
    return 'Time not set';
  }

  const [hours, minutes] = value.split(':');

  const date = new Date();

  date.setHours(
    Number.parseInt(hours, 10),
    Number.parseInt(minutes, 10),
    0,
    0,
  );

  return date.toLocaleTimeString('en-AE', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

  const eventDate = new Date(
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
    getDaysDifference(dateValue);

  if (difference < 0) {
    return `${Math.abs(difference)} day${
      Math.abs(difference) === 1 ? '' : 's'
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
      normalizeCalendarEvents,
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

  const [searchTerm, setSearchTerm] =
    useState('');

  const [typeFilter, setTypeFilter] =
    useState<'All' | CalendarEventType>(
      'All',
    );

  const [statusFilter, setStatusFilter] =
    useState<
      'All' | CalendarEventStatus
    >('All');

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingEventId, setEditingEventId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CalendarForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      CALENDAR_STORAGE_KEY,
      JSON.stringify(events),
    );
  }, [events]);

  useEffect(() => {
    const refreshData = () => {
      setEvents(normalizeCalendarEvents());

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
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return [...events]
      .sort((first, second) => {
        const firstValue = `${first.date} ${first.time}`;
        const secondValue = `${second.date} ${second.time}`;

        return firstValue.localeCompare(
          secondValue,
        );
      })
      .filter((event) => {
        const matchesType =
          typeFilter === 'All' ||
          event.eventType === typeFilter;

        const matchesStatus =
          statusFilter === 'All' ||
          event.status === statusFilter;

        const matchesSearch =
          !search ||
          [
            event.title,
            event.eventType,
            event.date,
            event.time,
            event.court,
            event.location,
            event.relatedCase,
            event.clientName,
            event.assignedTo,
            event.status,
            event.notes,
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

  const today = getLocalDate();

  const todayEvents = events.filter(
    (event) =>
      event.date === today &&
      event.status !== 'Cancelled',
  ).length;

  const upcomingEvents = events.filter(
    (event) =>
      event.date > today &&
      event.status === 'Upcoming',
  ).length;

  const hearingEvents = events.filter(
    (event) =>
      event.eventType === 'Hearing' &&
      event.status !== 'Cancelled',
  ).length;

  const completedEvents = events.filter(
    (event) =>
      event.status === 'Completed',
  ).length;

  const activeStaff = staff.filter(
    (staffMember) =>
      !staffMember.status ||
      staffMember.status === 'Active',
  );

  const openAddForm = () => {
    setEditingEventId(null);

    setForm({
      ...emptyForm,
      date: getLocalDate(),
    });

    setIsFormOpen(true);
  };

  const openEditForm = (
    event: CalendarEvent,
  ) => {
    if (event.source === 'Hearing') {
      window.alert(
        'This event was created from the Hearings module. Edit it from Hearings to keep both modules synchronized.',
      );

      return;
    }

    setEditingEventId(event.id);

    setForm({
      title: event.title,
      eventType: event.eventType,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      court: event.court,
      location: event.location,
      relatedCase: event.relatedCase,
      clientName: event.clientName,
      assignedTo: event.assignedTo,
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
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCaseChange = (
    reference: string,
  ) => {
    const selectedCase = cases.find(
      (caseItem) =>
        caseItem.reference === reference,
    );

    setForm((currentForm) => ({
      ...currentForm,
      relatedCase: reference,
      clientName:
        selectedCase?.client ||
        currentForm.clientName,
      court:
        selectedCase?.court ||
        currentForm.court,
      assignedTo:
        selectedCase?.assignedTo ||
        currentForm.assignedTo,
      title:
        currentForm.title ||
        selectedCase?.title ||
        '',
    }));
  };

  const saveEvent = (
    event: FormEvent,
  ) => {
    event.preventDefault();

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

    const now = new Date().toISOString();

    const eventData = {
      title: form.title.trim(),
      eventType: form.eventType,
      date: form.date,
      time: form.time,
      endTime: form.endTime,
      court: form.court.trim(),
      location: form.location.trim(),
      relatedCase:
        form.relatedCase.trim(),
      clientName:
        form.clientName.trim(),
      assignedTo:
        form.assignedTo.trim(),
      status: form.status,
      notes: form.notes.trim(),
      source: 'Calendar' as const,
      updatedAt: now,
    };

    if (editingEventId !== null) {
      setEvents((currentEvents) =>
        currentEvents.map(
          (calendarEvent) =>
            calendarEvent.id ===
            editingEventId
              ? {
                  ...calendarEvent,
                  ...eventData,
                }
              : calendarEvent,
        ),
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now(),
        ...eventData,
        createdAt: now,
      };

      setEvents((currentEvents) => [
        newEvent,
        ...currentEvents,
      ]);
    }

    closeForm();
  };

  const markCompleted = (
    id: number,
  ) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === id
          ? {
              ...event,
              status: 'Completed',
              updatedAt:
                new Date().toISOString(),
            }
          : event,
      ),
    );
  };

  const deleteEvent = (
    event: CalendarEvent,
  ) => {
    if (event.source === 'Hearing') {
      window.alert(
        'This event belongs to the Hearings module. Delete the hearing from Hearings so both modules remain synchronized.',
      );

      return;
    }

    const confirmed = window.confirm(
      'Delete this calendar event permanently?',
    );

    if (!confirmed) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter(
        (calendarEvent) =>
          calendarEvent.id !== event.id,
      ),
    );
  };

  const eventIcon = (
    type: CalendarEventType,
  ) => {
    if (type === 'Hearing') {
      return Gavel;
    }

    if (type === 'Deadline') {
      return Clock3;
    }

    if (type === 'Task') {
      return CheckCircle2;
    }

    if (type === 'Meeting') {
      return Briefcase;
    }

    return CalendarDays;
  };

  const eventTypeClasses: Record<
    CalendarEventType,
    string
  > = {
    Hearing:
      'bg-yellow-100 text-yellow-700',
    Deadline:
      'bg-red-100 text-red-700',
    Meeting:
      'bg-blue-100 text-blue-700',
    Task: 'bg-green-100 text-green-700',
    Reminder:
      'bg-purple-100 text-purple-700',
    Appointment:
      'bg-cyan-100 text-cyan-700',
    Other:
      'bg-gray-100 text-gray-700',
  };

  const statusClasses: Record<
    CalendarEventStatus,
    string
  > = {
    Upcoming:
      'bg-blue-100 text-blue-700',
    Completed:
      'bg-green-100 text-green-700',
    Cancelled:
      'bg-gray-100 text-gray-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <CalendarDays className="h-8 w-8 text-[#C9A84C]" />
            Calendar
          </h1>

          <p className="mt-1 text-gray-500">
            Track hearings, deadlines,
            meetings and firm reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black shadow-sm hover:bg-[#b89536]"
        >
          <Plus className="h-5 w-5" />
          Add Event
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Today
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {todayEvents}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Upcoming
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-700">
            {upcomingEvents}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Hearings
          </p>

          <p className="mt-1 text-2xl font-bold text-[#B89536]">
            {hearingEvents}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {completedEvents}
          </p>
        </div>
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
            className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(
              event.target.value as
                | 'All'
                | CalendarEventType,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-[#C9A84C]"
        >
          <option value="All">
            All event types
          </option>

          <option value="Hearing">
            Hearings
          </option>

          <option value="Deadline">
            Deadlines
          </option>

          <option value="Meeting">
            Meetings
          </option>

          <option value="Task">
            Tasks
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
              event.target.value as
                | 'All'
                | CalendarEventStatus,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-[#C9A84C]"
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
        {filteredEvents.map((event) => {
          const EventIcon = eventIcon(
            event.eventType,
          );

          return (
            <article
              key={`${event.source}-${event.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 rounded-xl p-3 ${
                    eventTypeClasses[
                      event.eventType
                    ]
                  }`}
                >
                  <EventIcon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-900">
                        {event.title}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            eventTypeClasses[
                              event.eventType
                            ]
                          }`}
                        >
                          {event.eventType}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusClasses[
                              event.status
                            ]
                          }`}
                        >
                          {event.status}
                        </span>

                        {event.source ===
                          'Hearing' && (
                          <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-[#C9A84C]">
                            Synced from Hearings
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#111111] p-4 text-white">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Date
                        </p>

                        <p className="mt-1 font-bold text-[#C9A84C]">
                          {formatDate(
                            event.date,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-300">
                          {getRelativeDate(
                            event.date,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Start
                        </p>

                        <p className="mt-1 font-bold">
                          {formatTime(
                            event.time,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          End
                        </p>

                        <p className="mt-1 font-bold">
                          {event.endTime
                            ? formatTime(
                                event.endTime,
                              )
                            : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                    <p>
                      <span className="font-medium text-gray-700">
                        Case:
                      </span>{' '}
                      {event.relatedCase ||
                        'Not linked'}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Client:
                      </span>{' '}
                      {event.clientName ||
                        'Not recorded'}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Assigned:
                      </span>{' '}
                      {event.assignedTo ||
                        'Not assigned'}
                    </p>

                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                      <span>
                        <span className="font-medium text-gray-700">
                          Location:
                        </span>{' '}
                        {event.location ||
                          event.court ||
                          'Not recorded'}
                      </span>
                    </p>

                    {event.court && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Court:
                        </span>{' '}
                        {event.court}
                      </p>
                    )}
                  </div>

                  {event.notes && (
                    <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                      {event.notes}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                    {event.status ===
                      'Upcoming' &&
                      event.source !==
                        'Hearing' && (
                        <button
                          type="button"
                          onClick={() =>
                            markCompleted(
                              event.id,
                            )
                          }
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Complete
                        </button>
                      )}

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(event)
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteEvent(event)
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-gray-500">
              No matching calendar events found.
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-4xl sm:rounded-3xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEventId !== null
                    ? 'Edit Calendar Event'
                    : 'Add Calendar Event'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a meeting, deadline,
                  appointment or reminder.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close calendar form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveEvent}
              className="space-y-6 p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Event title *
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
                    placeholder="Client meeting or filing deadline"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-yellow-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Event type
                  </label>

                  <select
                    value={form.eventType}
                    onChange={(event) =>
                      updateForm(
                        'eventType',
                        event.target
                          .value as CalendarEventType,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    <option value="Deadline">
                      Deadline
                    </option>

                    <option value="Meeting">
                      Meeting
                    </option>

                    <option value="Task">
                      Task
                    </option>

                    <option value="Reminder">
                      Reminder
                    </option>

                    <option value="Appointment">
                      Appointment
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      updateForm(
                        'date',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        'status',
                        event.target
                          .value as CalendarEventStatus,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Start time
                  </label>

                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      updateForm(
                        'time',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    End time
                  </label>

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      updateForm(
                        'endTime',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Related case
                </label>

                {cases.length > 0 ? (
                  <select
                    value={form.relatedCase}
                    onChange={(event) =>
                      handleCaseChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    <option value="">
                      No linked case
                    </option>

                    {cases.map((caseItem) => (
                      <option
                        key={caseItem.id}
                        value={caseItem.reference}
                      >
                        {caseItem.reference} —{' '}
                        {caseItem.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.relatedCase}
                    onChange={(event) =>
                      updateForm(
                        'relatedCase',
                        event.target.value,
                      )
                    }
                    placeholder="Case reference"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Client
                  </label>

                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(event) =>
                      updateForm(
                        'clientName',
                        event.target.value,
                      )
                    }
                    placeholder="Client name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Assigned staff
                  </label>

                  {activeStaff.length > 0 ? (
                    <select
                      value={form.assignedTo}
                      onChange={(event) =>
                        updateForm(
                          'assignedTo',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                    >
                      <option value="">
                        Select staff member
                      </option>

                      {activeStaff.map(
                        (staffMember) => (
                          <option
                            key={staffMember.id}
                            value={staffMember.name}
                          >
                            {staffMember.name}
                            {staffMember.role
                              ? ` — ${staffMember.role}`
                              : ''}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.assignedTo}
                      onChange={(event) =>
                        updateForm(
                          'assignedTo',
                          event.target.value,
                        )
                      }
                      placeholder="Assigned staff member"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Court
                  </label>

                  <input
                    type="text"
                    value={form.court}
                    onChange={(event) =>
                      updateForm(
                        'court',
                        event.target.value,
                      )
                    }
                    placeholder="Court or authority"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateForm(
                        'location',
                        event.target.value,
                      )
                    }
                    placeholder="Office, court hall or meeting location"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Notes
                </label>

                <textarea
                  rows={5}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Preparation notes or reminder details"
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
                Court hearings should normally be created
                and updated from the Hearings module. They
                will automatically appear here.
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
                  className="flex-1 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black hover:bg-[#b89536]"
                >
                  {editingEventId !== null
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