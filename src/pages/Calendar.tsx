import {
  CalendarDays,
  Clock3,
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

type EventType =
  | 'Hearing'
  | 'Meeting'
  | 'Deadline'
  | 'Reminder';

type CalendarEvent = {
  id: number;
  title: string;
  eventType: EventType;
  date: string;
  time: string;
  court: string;
  location: string;
  relatedCase: string;
  assignedTo: string;
  notes: string;
};

type EventForm = Omit<CalendarEvent, 'id'>;

type StoredCase = {
  id: number;
  title: string;
  reference: string;
};

const CALENDAR_STORAGE_KEY = 'shab-calendar-events';
const CASES_STORAGE_KEY = 'shab-cases';

const emptyForm: EventForm = {
  title: '',
  eventType: 'Hearing',
  date: '',
  time: '',
  court: '',
  location: '',
  relatedCase: '',
  assignedTo: '',
  notes: '',
};

const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Case Management Hearing',
    eventType: 'Hearing',
    date: '2026-07-20',
    time: '10:00',
    court: 'Dubai Courts',
    location: 'Dubai Courts Building',
    relatedCase: 'SHAB-2026-001',
    assignedTo: 'Umar Kayani',
    notes: 'Carry the complete case file and original documents.',
  },
];

function loadEvents(): CalendarEvent[] {
  try {
    const savedEvents = window.localStorage.getItem(
      CALENDAR_STORAGE_KEY,
    );

    if (!savedEvents) {
      return initialEvents;
    }

    const parsedEvents = JSON.parse(savedEvents);

    return Array.isArray(parsedEvents)
      ? parsedEvents
      : initialEvents;
  } catch {
    return initialEvents;
  }
}

function loadCases(): StoredCase[] {
  try {
    const savedCases = window.localStorage.getItem(
      CASES_STORAGE_KEY,
    );

    if (!savedCases) {
      return [];
    }

    const parsedCases = JSON.parse(savedCases);

    return Array.isArray(parsedCases)
      ? parsedCases
      : [];
  } catch {
    return [];
  }
}

export function CalendarPage() {
  const [events, setEvents] =
    useState<CalendarEvent[]>(loadEvents);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingEventId, setEditingEventId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<EventForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      CALENDAR_STORAGE_KEY,
      JSON.stringify(events),
    );
  }, [events]);

  useEffect(() => {
    const refreshCases = () => {
      setCases(loadCases());
    };

    refreshCases();

    window.addEventListener('focus', refreshCases);
    window.addEventListener('storage', refreshCases);

    return () => {
      window.removeEventListener('focus', refreshCases);
      window.removeEventListener('storage', refreshCases);
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const sortedEvents = [...events].sort(
      (firstEvent, secondEvent) => {
        const firstDateTime = `${firstEvent.date}T${
          firstEvent.time || '00:00'
        }`;

        const secondDateTime = `${secondEvent.date}T${
          secondEvent.time || '00:00'
        }`;

        return firstDateTime.localeCompare(secondDateTime);
      },
    );

    if (!search) {
      return sortedEvents;
    }

    return sortedEvents.filter((event) =>
      [
        event.title,
        event.eventType,
        event.date,
        event.time,
        event.court,
        event.location,
        event.relatedCase,
        event.assignedTo,
        event.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [events, searchTerm]);

  const openAddForm = () => {
    setEditingEventId(null);

    setForm({
      ...emptyForm,
      assignedTo: 'Umar Kayani',
      relatedCase: cases[0]?.reference || '',
    });

    setIsFormOpen(true);
  };

  const openEditForm = (event: CalendarEvent) => {
    setEditingEventId(event.id);

    setForm({
      title: event.title,
      eventType: event.eventType,
      date: event.date,
      time: event.time,
      court: event.court,
      location: event.location,
      relatedCase: event.relatedCase,
      assignedTo: event.assignedTo,
      notes: event.notes,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEventId(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof EventForm>(
    field: K,
    value: EventForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveEvent = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();

    if (!form.title.trim()) {
      window.alert('Event title is required.');
      return;
    }

    if (!form.date) {
      window.alert('Event date is required.');
      return;
    }

    if (editingEventId !== null) {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === editingEventId
            ? {
                ...event,
                ...form,
                title: form.title.trim(),
                court: form.court.trim(),
                location: form.location.trim(),
                relatedCase: form.relatedCase.trim(),
                assignedTo: form.assignedTo.trim(),
                notes: form.notes.trim(),
              }
            : event,
        ),
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now(),
        ...form,
        title: form.title.trim(),
        court: form.court.trim(),
        location: form.location.trim(),
        relatedCase: form.relatedCase.trim(),
        assignedTo: form.assignedTo.trim(),
        notes: form.notes.trim(),
      };

      setEvents((currentEvents) => [
        newEvent,
        ...currentEvents,
      ]);
    }

    closeForm();
  };

  const deleteEvent = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this calendar event?',
    );

    if (!confirmed) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== id),
    );
  };

  const eventTypeClasses: Record<EventType, string> = {
    Hearing: 'bg-orange-100 text-orange-700',
    Meeting: 'bg-blue-100 text-blue-700',
    Deadline: 'bg-red-100 text-red-700',
    Reminder: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Calendar
          </h1>

          <p className="mt-1 text-gray-500">
            Track hearings, meetings, deadlines and reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" />
          Add Event
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search calendar events"
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-6 space-y-4">
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-orange-100 p-3">
                <CalendarDays className="h-6 w-6 text-orange-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {event.title}
                    </h2>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        eventTypeClasses[event.eventType]
                      }`}
                    >
                      {event.eventType}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(event)}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      aria-label="Edit event"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteEvent(event.id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>{event.date}</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-gray-400" />
                    <span>
                      {event.time || 'Time not set'}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {event.location || 'Location not set'}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Court:
                    </span>{' '}
                    {event.court || 'Not applicable'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Case:
                    </span>{' '}
                    {event.relatedCase || 'Not linked'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Assigned to:
                    </span>{' '}
                    {event.assignedTo || 'Unassigned'}
                  </p>
                </div>

                {event.notes && (
                  <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                    {event.notes}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}

        {filteredEvents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No matching calendar events found.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEventId !== null
                    ? 'Edit Event'
                    : 'Add Event'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the hearing, meeting or deadline details.
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
              className="space-y-5 p-5"
            >
              <div>
                <label
                  htmlFor="event-title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Event title *
                </label>

                <input
                  id="event-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm('title', event.target.value)
                  }
                  placeholder="Case management hearing"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="event-type"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Event type
                </label>

                <select
                  id="event-type"
                  value={form.eventType}
                  onChange={(event) =>
                    updateForm(
                      'eventType',
                      event.target.value as EventType,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="Hearing">Hearing</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Reminder">Reminder</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Date *
                  </label>

                  <input
                    id="event-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      updateForm('date', event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-time"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Time
                  </label>

                  <input
                    id="event-time"
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      updateForm('time', event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-case"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Related case
                </label>

                {cases.length > 0 ? (
                  <select
                    id="event-case"
                    value={form.relatedCase}
                    onChange={(event) =>
                      updateForm(
                        'relatedCase',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">
                      No linked case
                    </option>

                    {cases.map((caseItem) => (
                      <option
                        key={caseItem.id}
                        value={caseItem.reference}
                      >
                        {caseItem.reference} — {caseItem.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="event-case"
                    type="text"
                    value={form.relatedCase}
                    onChange={(event) =>
                      updateForm(
                        'relatedCase',
                        event.target.value,
                      )
                    }
                    placeholder="Case reference"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-court"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Court or authority
                  </label>

                  <input
                    id="event-court"
                    type="text"
                    value={form.court}
                    onChange={(event) =>
                      updateForm('court', event.target.value)
                    }
                    placeholder="Dubai Courts"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-location"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Location
                  </label>

                  <input
                    id="event-location"
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateForm(
                        'location',
                        event.target.value,
                      )
                    }
                    placeholder="Court room or meeting location"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-assigned"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Assigned to
                </label>

                <input
                  id="event-assigned"
                  type="text"
                  value={form.assignedTo}
                  onChange={(event) =>
                    updateForm(
                      'assignedTo',
                      event.target.value,
                    )
                  }
                  placeholder="Staff member"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="event-notes"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="event-notes"
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm('notes', event.target.value)
                  }
                  placeholder="Documents required, reminders or attendance instructions"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
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
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600"
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