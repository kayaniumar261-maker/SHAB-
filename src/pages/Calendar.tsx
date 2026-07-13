import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
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

const CALENDAR_STORAGE_KEY = 'shab-calendar-events';

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
  {
    id: 2,
    title: 'Client Consultation',
    eventType: 'Meeting',
    date: '2026-07-22',
    time: '14:30',
    court: '',
    location: 'SHAB Office',
    relatedCase: '',
    assignedTo: 'Nourhan',
    notes: 'Initial consultation regarding a labour dispute.',
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

function normalizeEventType(value: string): EventType {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'meeting') {
    return 'Meeting';
  }

  if (normalizedValue === 'deadline') {
    return 'Deadline';
  }

  if (normalizedValue === 'reminder') {
    return 'Reminder';
  }

  return 'Hearing';
}

export function CalendarPage() {
  const [events, setEvents] =
    useState<CalendarEvent[]>(loadEvents);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.localStorage.setItem(
      CALENDAR_STORAGE_KEY,
      JSON.stringify(events),
    );
  }, [events]);

  const filteredEvents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const sortedEvents = [...events].sort((first, second) => {
      const firstDate = `${first.date}T${first.time || '00:00'}`;
      const secondDate = `${second.date}T${second.time || '00:00'}`;

      return firstDate.localeCompare(secondDate);
    });

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

  const addEvent = () => {
    const title = window.prompt('Enter event title');

    if (!title?.trim()) {
      return;
    }

    const eventTypeInput =
      window.prompt(
        'Enter event type: Hearing, Meeting, Deadline or Reminder',
      ) || 'Hearing';

    const date =
      window.prompt(
        'Enter date in YYYY-MM-DD format',
      )?.trim() || '';

    if (!date) {
      window.alert('A date is required.');
      return;
    }

    const time =
      window.prompt(
        'Enter time in HH:MM format',
      )?.trim() || '';

    const court =
      window.prompt('Enter court or authority')?.trim() || '';

    const location =
      window.prompt('Enter location')?.trim() || '';

    const relatedCase =
      window.prompt(
        'Enter related case reference',
      )?.trim() || '';

    const assignedTo =
      window.prompt(
        'Enter assigned staff member',
      )?.trim() || 'Unassigned';

    const notes =
      window.prompt('Enter notes')?.trim() || '';

    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: title.trim(),
      eventType: normalizeEventType(eventTypeInput),
      date,
      time,
      court,
      location,
      relatedCase,
      assignedTo,
      notes,
    };

    setEvents((currentEvents) => [
      ...currentEvents,
      newEvent,
    ]);
  };

  const editEvent = (event: CalendarEvent) => {
    const title = window.prompt(
      'Edit event title',
      event.title,
    );

    if (!title?.trim()) {
      return;
    }

    const eventTypeInput =
      window.prompt(
        'Edit event type: Hearing, Meeting, Deadline or Reminder',
        event.eventType,
      ) || event.eventType;

    const date =
      window.prompt(
        'Edit date',
        event.date,
      ) ?? event.date;

    const time =
      window.prompt(
        'Edit time',
        event.time,
      ) ?? event.time;

    const court =
      window.prompt(
        'Edit court or authority',
        event.court,
      ) ?? event.court;

    const location =
      window.prompt(
        'Edit location',
        event.location,
      ) ?? event.location;

    const relatedCase =
      window.prompt(
        'Edit related case reference',
        event.relatedCase,
      ) ?? event.relatedCase;

    const assignedTo =
      window.prompt(
        'Edit assigned staff member',
        event.assignedTo,
      ) ?? event.assignedTo;

    const notes =
      window.prompt(
        'Edit notes',
        event.notes,
      ) ?? event.notes;

    setEvents((currentEvents) =>
      currentEvents.map((currentEvent) =>
        currentEvent.id === event.id
          ? {
              ...currentEvent,
              title: title.trim(),
              eventType: normalizeEventType(eventTypeInput),
              date: date.trim(),
              time: time.trim(),
              court: court.trim(),
              location: location.trim(),
              relatedCase: relatedCase.trim(),
              assignedTo: assignedTo.trim(),
              notes: notes.trim(),
            }
          : currentEvent,
      ),
    );
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
          onClick={addEvent}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
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
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${eventTypeClasses[event.eventType]}`}
                    >
                      {event.eventType}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => editEvent(event)}
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
                    <span>{event.time || 'Time not set'}</span>
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
                    {event.assignedTo}
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
    </div>
  );
}