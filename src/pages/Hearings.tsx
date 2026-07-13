import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Gavel,
  MapPin,
  Pencil,
  Plus,
  Scale,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type HearingStatus =
  | 'Upcoming'
  | 'Attended'
  | 'Adjourned'
  | 'Judgment Reserved'
  | 'Completed'
  | 'Cancelled';

type HearingType =
  | 'First Hearing'
  | 'Case Management'
  | 'Submission'
  | 'Expert Meeting'
  | 'Mediation'
  | 'Pleading'
  | 'Judgment'
  | 'Appeal'
  | 'Execution'
  | 'Other';

type StoredCase = {
  id: number;
  title: string;
  reference: string;
  client?: string;
  opponent?: string;
  court?: string;
  assignedTo?: string;
};

type StoredStaff = {
  id: number;
  name: string;
  role?: string;
  status?: string;
};

type HearingRecord = {
  id: number;
  title: string;
  relatedCase: string;
  caseTitle: string;
  clientName: string;
  opponentName: string;
  courtName: string;
  emirate: string;
  caseNumber: string;
  hearingDate: string;
  hearingTime: string;
  hearingType: HearingType;
  courtHall: string;
  judgeName: string;
  assignedLawyer: string;
  status: HearingStatus;
  outcome: string;
  nextHearingDate: string;
  nextHearingTime: string;
  notes: string;
  reminderDays: number;
  createdAt: string;
  updatedAt: string;
};

type HearingForm = {
  title: string;
  relatedCase: string;
  caseTitle: string;
  clientName: string;
  opponentName: string;
  courtName: string;
  emirate: string;
  caseNumber: string;
  hearingDate: string;
  hearingTime: string;
  hearingType: HearingType;
  courtHall: string;
  judgeName: string;
  assignedLawyer: string;
  status: HearingStatus;
  outcome: string;
  nextHearingDate: string;
  nextHearingTime: string;
  notes: string;
  reminderDays: string;
};

type CalendarEvent = {
  id: number;
  title: string;
  eventType: string;
  date: string;
  time: string;
  court: string;
  location: string;
  relatedCase: string;
};

const HEARINGS_STORAGE_KEY = 'shab-hearings';
const CASES_STORAGE_KEY = 'shab-cases';
const STAFF_STORAGE_KEY = 'shab-staff';
const CALENDAR_STORAGE_KEY = 'shab-calendar-events';

const emptyForm: HearingForm = {
  title: '',
  relatedCase: '',
  caseTitle: '',
  clientName: '',
  opponentName: '',
  courtName: '',
  emirate: 'Dubai',
  caseNumber: '',
  hearingDate: '',
  hearingTime: '',
  hearingType: 'First Hearing',
  courtHall: '',
  judgeName: '',
  assignedLawyer: '',
  status: 'Upcoming',
  outcome: '',
  nextHearingDate: '',
  nextHearingTime: '',
  notes: '',
  reminderDays: '2',
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

function loadHearings(): HearingRecord[] {
  return loadArray<HearingRecord>(HEARINGS_STORAGE_KEY);
}

function loadCases(): StoredCase[] {
  return loadArray<StoredCase>(CASES_STORAGE_KEY);
}

function loadStaff(): StoredStaff[] {
  return loadArray<StoredStaff>(STAFF_STORAGE_KEY);
}

function getLocalDate(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value: string): string {
  if (!value) {
    return 'Not scheduled';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysDifference(dateValue: string): number {
  if (!dateValue) {
    return 0;
  }

  const today = new Date(`${getLocalDate()}T00:00:00`);
  const target = new Date(`${dateValue}T00:00:00`);

  return Math.ceil(
    (target.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function getDateDescription(dateValue: string): string {
  if (!dateValue) {
    return 'Not scheduled';
  }

  const difference = getDaysDifference(dateValue);

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

function saveCalendarEvent(hearing: HearingRecord) {
  const currentEvents = loadArray<CalendarEvent>(
    CALENDAR_STORAGE_KEY,
  );

  const calendarEvent: CalendarEvent = {
    id: hearing.id,
    title: hearing.title,
    eventType: 'Hearing',
    date: hearing.hearingDate,
    time: hearing.hearingTime,
    court: hearing.courtName,
    location: hearing.courtHall,
    relatedCase: hearing.relatedCase,
  };

  const existingIndex = currentEvents.findIndex(
    (event) => event.id === hearing.id,
  );

  if (existingIndex >= 0) {
    currentEvents[existingIndex] = calendarEvent;
  } else {
    currentEvents.push(calendarEvent);
  }

  window.localStorage.setItem(
    CALENDAR_STORAGE_KEY,
    JSON.stringify(currentEvents),
  );
}

function removeCalendarEvent(id: number) {
  const currentEvents = loadArray<CalendarEvent>(
    CALENDAR_STORAGE_KEY,
  );

  const updatedEvents = currentEvents.filter(
    (event) => event.id !== id,
  );

  window.localStorage.setItem(
    CALENDAR_STORAGE_KEY,
    JSON.stringify(updatedEvents),
  );
}

export function Hearings() {
  const [hearings, setHearings] =
    useState<HearingRecord[]>(loadHearings);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [staff, setStaff] =
    useState<StoredStaff[]>(loadStaff);

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] =
    useState<'All' | HearingStatus>('All');

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingHearingId, setEditingHearingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<HearingForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      HEARINGS_STORAGE_KEY,
      JSON.stringify(hearings),
    );
  }, [hearings]);

  useEffect(() => {
    const refreshRelatedData = () => {
      setCases(loadCases());
      setStaff(loadStaff());
    };

    refreshRelatedData();

    window.addEventListener('focus', refreshRelatedData);
    window.addEventListener('storage', refreshRelatedData);

    return () => {
      window.removeEventListener(
        'focus',
        refreshRelatedData,
      );

      window.removeEventListener(
        'storage',
        refreshRelatedData,
      );
    };
  }, []);

  const filteredHearings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return [...hearings]
      .sort((first, second) => {
        const firstValue = `${first.hearingDate} ${first.hearingTime}`;
        const secondValue = `${second.hearingDate} ${second.hearingTime}`;

        return firstValue.localeCompare(secondValue);
      })
      .filter((hearing) => {
        const matchesStatus =
          statusFilter === 'All' ||
          hearing.status === statusFilter;

        const matchesSearch =
          !search ||
          [
            hearing.title,
            hearing.relatedCase,
            hearing.caseTitle,
            hearing.clientName,
            hearing.opponentName,
            hearing.courtName,
            hearing.emirate,
            hearing.caseNumber,
            hearing.hearingType,
            hearing.courtHall,
            hearing.judgeName,
            hearing.assignedLawyer,
            hearing.status,
            hearing.outcome,
            hearing.notes,
          ]
            .join(' ')
            .toLowerCase()
            .includes(search);

        return matchesStatus && matchesSearch;
      });
  }, [hearings, searchTerm, statusFilter]);

  const today = getLocalDate();

  const todayHearings = hearings.filter(
    (hearing) =>
      hearing.hearingDate === today &&
      hearing.status !== 'Cancelled',
  ).length;

  const upcomingHearings = hearings.filter(
    (hearing) =>
      hearing.hearingDate > today &&
      hearing.status === 'Upcoming',
  ).length;

  const completedHearings = hearings.filter(
    (hearing) =>
      hearing.status === 'Completed' ||
      hearing.status === 'Attended',
  ).length;

  const adjournedHearings = hearings.filter(
    (hearing) => hearing.status === 'Adjourned',
  ).length;

  const activeStaff = staff.filter(
    (staffMember) =>
      !staffMember.status ||
      staffMember.status === 'Active',
  );

  const openAddForm = () => {
    setEditingHearingId(null);

    setForm({
      ...emptyForm,
      hearingDate: getLocalDate(),
    });

    setIsFormOpen(true);
  };

  const openEditForm = (hearing: HearingRecord) => {
    setEditingHearingId(hearing.id);

    setForm({
      title: hearing.title,
      relatedCase: hearing.relatedCase,
      caseTitle: hearing.caseTitle,
      clientName: hearing.clientName,
      opponentName: hearing.opponentName,
      courtName: hearing.courtName,
      emirate: hearing.emirate,
      caseNumber: hearing.caseNumber,
      hearingDate: hearing.hearingDate,
      hearingTime: hearing.hearingTime,
      hearingType: hearing.hearingType,
      courtHall: hearing.courtHall,
      judgeName: hearing.judgeName,
      assignedLawyer: hearing.assignedLawyer,
      status: hearing.status,
      outcome: hearing.outcome,
      nextHearingDate: hearing.nextHearingDate,
      nextHearingTime: hearing.nextHearingTime,
      notes: hearing.notes,
      reminderDays: String(hearing.reminderDays),
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingHearingId(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof HearingForm>(
    field: K,
    value: HearingForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCaseChange = (reference: string) => {
    const selectedCase = cases.find(
      (caseItem) => caseItem.reference === reference,
    );

    setForm((currentForm) => ({
      ...currentForm,
      relatedCase: reference,
      caseTitle:
        selectedCase?.title || currentForm.caseTitle,
      clientName:
        selectedCase?.client || currentForm.clientName,
      opponentName:
        selectedCase?.opponent ||
        currentForm.opponentName,
      courtName:
        selectedCase?.court || currentForm.courtName,
      assignedLawyer:
        selectedCase?.assignedTo ||
        currentForm.assignedLawyer,
      title:
        currentForm.title ||
        (selectedCase
          ? `Hearing — ${selectedCase.title}`
          : ''),
    }));
  };

  const saveHearing = (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert('Hearing title is required.');
      return;
    }

    if (!form.hearingDate) {
      window.alert('Hearing date is required.');
      return;
    }

    const reminderDays =
      Number.parseInt(form.reminderDays, 10) || 0;

    const now = new Date().toISOString();

    const hearingData = {
      title: form.title.trim(),
      relatedCase: form.relatedCase.trim(),
      caseTitle: form.caseTitle.trim(),
      clientName: form.clientName.trim(),
      opponentName: form.opponentName.trim(),
      courtName: form.courtName.trim(),
      emirate: form.emirate.trim(),
      caseNumber: form.caseNumber.trim(),
      hearingDate: form.hearingDate,
      hearingTime: form.hearingTime,
      hearingType: form.hearingType,
      courtHall: form.courtHall.trim(),
      judgeName: form.judgeName.trim(),
      assignedLawyer: form.assignedLawyer.trim(),
      status: form.status,
      outcome: form.outcome.trim(),
      nextHearingDate: form.nextHearingDate,
      nextHearingTime: form.nextHearingTime,
      notes: form.notes.trim(),
      reminderDays,
      updatedAt: now,
    };

    if (editingHearingId !== null) {
      setHearings((currentHearings) =>
        currentHearings.map((hearing) => {
          if (hearing.id !== editingHearingId) {
            return hearing;
          }

          const updatedHearing = {
            ...hearing,
            ...hearingData,
          };

          saveCalendarEvent(updatedHearing);

          return updatedHearing;
        }),
      );
    } else {
      const newHearing: HearingRecord = {
        id: Date.now(),
        ...hearingData,
        createdAt: now,
      };

      setHearings((currentHearings) => [
        newHearing,
        ...currentHearings,
      ]);

      saveCalendarEvent(newHearing);
    }

    closeForm();
  };

  const deleteHearing = (id: number) => {
    const confirmed = window.confirm(
      'Delete this hearing permanently?',
    );

    if (!confirmed) {
      return;
    }

    setHearings((currentHearings) =>
      currentHearings.filter(
        (hearing) => hearing.id !== id,
      ),
    );

    removeCalendarEvent(id);
  };

  const updateHearingStatus = (
    id: number,
    status: HearingStatus,
  ) => {
    setHearings((currentHearings) =>
      currentHearings.map((hearing) =>
        hearing.id === id
          ? {
              ...hearing,
              status,
              updatedAt: new Date().toISOString(),
            }
          : hearing,
      ),
    );
  };

  const createNextHearing = (
    hearing: HearingRecord,
  ) => {
    if (!hearing.nextHearingDate) {
      window.alert(
        'No next hearing date has been recorded.',
      );

      return;
    }

    const now = new Date().toISOString();

    const newHearing: HearingRecord = {
      ...hearing,
      id: Date.now(),
      title: `Next Hearing — ${
        hearing.caseTitle || hearing.title
      }`,
      hearingDate: hearing.nextHearingDate,
      hearingTime: hearing.nextHearingTime,
      hearingType: 'Submission',
      status: 'Upcoming',
      outcome: '',
      nextHearingDate: '',
      nextHearingTime: '',
      notes: '',
      createdAt: now,
      updatedAt: now,
    };

    setHearings((currentHearings) => [
      newHearing,
      ...currentHearings,
    ]);

    saveCalendarEvent(newHearing);

    window.alert(
      'The next hearing has been added to Hearings and Calendar.',
    );
  };

  const statusClasses: Record<
    HearingStatus,
    string
  > = {
    Upcoming: 'bg-blue-100 text-blue-700',
    Attended: 'bg-green-100 text-green-700',
    Adjourned: 'bg-yellow-100 text-yellow-700',
    'Judgment Reserved':
      'bg-purple-100 text-purple-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Gavel className="h-8 w-8 text-[#C9A84C]" />
            Hearings
          </h1>

          <p className="mt-1 text-gray-500">
            Manage court hearings, appearances,
            outcomes and adjournments.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black shadow-sm hover:bg-[#b89536]"
        >
          <Plus className="h-5 w-5" />
          Add Hearing
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Today
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {todayHearings}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Upcoming
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-700">
            {upcomingHearings}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {completedHearings}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Adjourned
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-700">
            {adjournedHearings}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_210px]">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search hearings"
            className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | 'All'
                | HearingStatus,
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

          <option value="Attended">
            Attended
          </option>

          <option value="Adjourned">
            Adjourned
          </option>

          <option value="Judgment Reserved">
            Judgment Reserved
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
        {filteredHearings.map((hearing) => (
          <article
            key={hearing.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-yellow-50 p-3">
                <Scale className="h-6 w-6 text-[#C9A84C]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900">
                      {hearing.title}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {hearing.relatedCase ||
                        hearing.caseNumber ||
                        'No case reference'}
                    </p>

                    {hearing.caseTitle && (
                      <p className="mt-1 text-sm text-gray-500">
                        {hearing.caseTitle}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClasses[hearing.status]
                    }`}
                  >
                    {hearing.status}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl bg-[#111111] p-4 text-white">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Hearing date
                      </p>

                      <p className="mt-1 font-bold text-[#C9A84C]">
                        {formatDate(
                          hearing.hearingDate,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-300">
                        {getDateDescription(
                          hearing.hearingDate,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Time
                      </p>

                      <p className="mt-1 font-bold">
                        {hearing.hearingTime ||
                          'Not recorded'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Type
                      </p>

                      <p className="mt-1 font-bold">
                        {hearing.hearingType}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <span>
                      <span className="font-medium text-gray-700">
                        Court:
                      </span>{' '}
                      {hearing.courtName ||
                        'Not recorded'}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Emirate:
                    </span>{' '}
                    {hearing.emirate ||
                      'Not recorded'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Court hall:
                    </span>{' '}
                    {hearing.courtHall ||
                      'Not recorded'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Client:
                    </span>{' '}
                    {hearing.clientName ||
                      'Not recorded'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Opponent:
                    </span>{' '}
                    {hearing.opponentName ||
                      'Not recorded'}
                  </p>

                  <p className="flex items-start gap-2">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <span>
                      <span className="font-medium text-gray-700">
                        Assigned:
                      </span>{' '}
                      {hearing.assignedLawyer ||
                        'Not assigned'}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Judge:
                    </span>{' '}
                    {hearing.judgeName ||
                      'Not recorded'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Case number:
                    </span>{' '}
                    {hearing.caseNumber ||
                      'Not recorded'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Reminder:
                    </span>{' '}
                    {hearing.reminderDays} day
                    {hearing.reminderDays === 1
                      ? ''
                      : 's'}{' '}
                    before
                  </p>
                </div>

                {hearing.outcome && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-800">
                      Hearing Outcome
                    </p>

                    <p className="mt-2 text-sm leading-6 text-green-700">
                      {hearing.outcome}
                    </p>
                  </div>
                )}

                {hearing.nextHearingDate && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-800">
                          Next Hearing
                        </p>

                        <p className="mt-1 text-sm text-blue-700">
                          {formatDate(
                            hearing.nextHearingDate,
                          )}
                          {hearing.nextHearingTime
                            ? ` at ${hearing.nextHearingTime}`
                            : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          createNextHearing(hearing)
                        }
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Add Next Hearing
                      </button>
                    </div>
                  </div>
                )}

                {hearing.notes && (
                  <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    {hearing.notes}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                  {hearing.status === 'Upcoming' && (
                    <button
                      type="button"
                      onClick={() =>
                        updateHearingStatus(
                          hearing.id,
                          'Attended',
                        )
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Attended
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(hearing)
                    }
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteHearing(hearing.id)
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
        ))}

        {filteredHearings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-gray-500">
              No matching hearings found.
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-5xl sm:rounded-3xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingHearingId !== null
                    ? 'Edit Hearing'
                    : 'Add Hearing'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Record court, case, appearance and
                  outcome information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close hearing form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveHearing}
              className="space-y-6 p-5"
            >
              <section>
                <h3 className="font-bold text-gray-900">
                  Case Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Hearing title *
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
                      placeholder="First hearing — Commercial Case"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Internal SHAB case
                    </label>

                    {cases.length > 0 ? (
                      <select
                        value={form.relatedCase}
                        onChange={(event) =>
                          handleCaseChange(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
                      >
                        <option value="">
                          No linked case
                        </option>

                        {cases.map((caseItem) => (
                          <option
                            key={caseItem.id}
                            value={
                              caseItem.reference
                            }
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
                        placeholder="SHAB case reference"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Case title
                    </label>

                    <input
                      type="text"
                      value={form.caseTitle}
                      onChange={(event) =>
                        updateForm(
                          'caseTitle',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Court case number
                    </label>

                    <input
                      type="text"
                      value={form.caseNumber}
                      onChange={(event) =>
                        updateForm(
                          'caseNumber',
                          event.target.value,
                        )
                      }
                      placeholder="Case number and year"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

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
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Opponent
                    </label>

                    <input
                      type="text"
                      value={form.opponentName}
                      onChange={(event) =>
                        updateForm(
                          'opponentName',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900">
                  Court and Hearing Details
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Court name
                    </label>

                    <input
                      type="text"
                      value={form.courtName}
                      onChange={(event) =>
                        updateForm(
                          'courtName',
                          event.target.value,
                        )
                      }
                      placeholder="Dubai Courts"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Emirate
                    </label>

                    <select
                      value={form.emirate}
                      onChange={(event) =>
                        updateForm(
                          'emirate',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                    >
                      <option value="Abu Dhabi">
                        Abu Dhabi
                      </option>

                      <option value="Dubai">
                        Dubai
                      </option>

                      <option value="Sharjah">
                        Sharjah
                      </option>

                      <option value="Ajman">
                        Ajman
                      </option>

                      <option value="Umm Al Quwain">
                        Umm Al Quwain
                      </option>

                      <option value="Ras Al Khaimah">
                        Ras Al Khaimah
                      </option>

                      <option value="Fujairah">
                        Fujairah
                      </option>

                      <option value="Federal">
                        Federal
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Hearing type
                    </label>

                    <select
                      value={form.hearingType}
                      onChange={(event) =>
                        updateForm(
                          'hearingType',
                          event.target
                            .value as HearingType,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                    >
                      <option value="First Hearing">
                        First Hearing
                      </option>

                      <option value="Case Management">
                        Case Management
                      </option>

                      <option value="Submission">
                        Submission
                      </option>

                      <option value="Expert Meeting">
                        Expert Meeting
                      </option>

                      <option value="Mediation">
                        Mediation
                      </option>

                      <option value="Pleading">
                        Pleading
                      </option>

                      <option value="Judgment">
                        Judgment
                      </option>

                      <option value="Appeal">
                        Appeal
                      </option>

                      <option value="Execution">
                        Execution
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Hearing date *
                    </label>

                    <input
                      type="date"
                      required
                      value={form.hearingDate}
                      onChange={(event) =>
                        updateForm(
                          'hearingDate',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Hearing time
                    </label>

                    <input
                      type="time"
                      value={form.hearingTime}
                      onChange={(event) =>
                        updateForm(
                          'hearingTime',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Court hall
                    </label>

                    <input
                      type="text"
                      value={form.courtHall}
                      onChange={(event) =>
                        updateForm(
                          'courtHall',
                          event.target.value,
                        )
                      }
                      placeholder="Hall or chamber"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Judge
                    </label>

                    <input
                      type="text"
                      value={form.judgeName}
                      onChange={(event) =>
                        updateForm(
                          'judgeName',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Assigned lawyer or staff
                    </label>

                    {activeStaff.length > 0 ? (
                      <select
                        value={form.assignedLawyer}
                        onChange={(event) =>
                          updateForm(
                            'assignedLawyer',
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
                        value={form.assignedLawyer}
                        onChange={(event) =>
                          updateForm(
                            'assignedLawyer',
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Reminder days
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={form.reminderDays}
                      onChange={(event) =>
                        updateForm(
                          'reminderDays',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900">
                  Status and Outcome
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Hearing status
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          'status',
                          event.target
                            .value as HearingStatus,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                    >
                      <option value="Upcoming">
                        Upcoming
                      </option>

                      <option value="Attended">
                        Attended
                      </option>

                      <option value="Adjourned">
                        Adjourned
                      </option>

                      <option value="Judgment Reserved">
                        Judgment Reserved
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  <div />

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Hearing outcome
                    </label>

                    <textarea
                      rows={4}
                      value={form.outcome}
                      onChange={(event) =>
                        updateForm(
                          'outcome',
                          event.target.value,
                        )
                      }
                      placeholder="Record the court decision, instructions or adjournment reason"
                      className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Next hearing date
                    </label>

                    <input
                      type="date"
                      value={form.nextHearingDate}
                      onChange={(event) =>
                        updateForm(
                          'nextHearingDate',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Next hearing time
                    </label>

                    <input
                      type="time"
                      value={form.nextHearingTime}
                      onChange={(event) =>
                        updateForm(
                          'nextHearingTime',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Internal notes
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
                      placeholder="Preparation notes, documents required or follow-up instructions"
                      className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3"
                    />
                  </div>
                </div>
              </section>

              <div className="rounded-xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
                Saving a hearing also adds or updates the
                corresponding event in the SHAB Calendar.
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
                  {editingHearingId !== null
                    ? 'Save Changes'
                    : 'Save Hearing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
