import {
  Briefcase,
  CalendarDays,
  Gavel,
  Pencil,
  Plus,
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

import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBar } from '../components/ui/SearchBar';
import { StatCard } from '../components/ui/StatCard';
import { Activity } from '../services/activityLogger';
import { Storage } from '../services/storage';
import { generateId } from '../utils/idGenerator';

type CaseStatus =
  | 'Active'
  | 'Pending'
  | 'On Hold'
  | 'Closed';

type CasePriority =
  | 'High'
  | 'Medium'
  | 'Low';

type CaseRecord = {
  id: number;
  reference: string;
  title: string;
  client: string;
  clientReference: string;
  caseNumber: string;
  caseType: string;
  court: string;
  emirate: string;
  opponent: string;
  assignedTo: string;
  filingDate: string;
  nextHearing: string;
  status: CaseStatus;
  priority: CasePriority;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type CaseForm = {
  title: string;
  client: string;
  clientReference: string;
  caseNumber: string;
  caseType: string;
  court: string;
  emirate: string;
  opponent: string;
  assignedTo: string;
  filingDate: string;
  nextHearing: string;
  status: CaseStatus;
  priority: CasePriority;
  notes: string;
};

type StoredClient = {
  id: number;
  reference?: string;
  name: string;
  status?: string;
};

type StoredStaff = {
  id: number;
  name: string;
  role?: string;
  status?: string;
};

const emptyForm: CaseForm = {
  title: '',
  client: '',
  clientReference: '',
  caseNumber: '',
  caseType: '',
  court: '',
  emirate: 'Dubai',
  opponent: '',
  assignedTo: '',
  filingDate: '',
  nextHearing: '',
  status: 'Active',
  priority: 'Medium',
  notes: '',
};

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
    return 'Not scheduled';
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function normalizeCase(
  item: Partial<CaseRecord>,
): CaseRecord {
  const now =
    new Date().toISOString();

  let status: CaseStatus = 'Active';

  if (item.status === 'Pending') {
    status = 'Pending';
  } else if (
    item.status === 'On Hold'
  ) {
    status = 'On Hold';
  } else if (
    item.status === 'Closed'
  ) {
    status = 'Closed';
  }

  let priority: CasePriority =
    'Medium';

  if (item.priority === 'High') {
    priority = 'High';
  } else if (
    item.priority === 'Low'
  ) {
    priority = 'Low';
  }

  return {
    id:
      typeof item.id === 'number'
        ? item.id
        : Date.now(),
    reference:
      typeof item.reference ===
      'string'
        ? item.reference
        : '',
    title:
      typeof item.title === 'string'
        ? item.title
        : '',
    client:
      typeof item.client === 'string'
        ? item.client
        : '',
    clientReference:
      typeof item.clientReference ===
      'string'
        ? item.clientReference
        : '',
    caseNumber:
      typeof item.caseNumber ===
      'string'
        ? item.caseNumber
        : '',
    caseType:
      typeof item.caseType ===
      'string'
        ? item.caseType
        : '',
    court:
      typeof item.court === 'string'
        ? item.court
        : '',
    emirate:
      typeof item.emirate === 'string'
        ? item.emirate
        : '',
    opponent:
      typeof item.opponent ===
      'string'
        ? item.opponent
        : '',
    assignedTo:
      typeof item.assignedTo ===
      'string'
        ? item.assignedTo
        : '',
    filingDate:
      typeof item.filingDate ===
      'string'
        ? item.filingDate
        : '',
    nextHearing:
      typeof item.nextHearing ===
      'string'
        ? item.nextHearing
        : '',
    status,
    priority,
    notes:
      typeof item.notes === 'string'
        ? item.notes
        : '',
    createdAt:
      typeof item.createdAt ===
      'string'
        ? item.createdAt
        : now,
    updatedAt:
      typeof item.updatedAt ===
      'string'
        ? item.updatedAt
        : now,
  };
}

function loadCases(): CaseRecord[] {
  return Storage
    .getCases<
      Partial<CaseRecord>
    >()
    .map(normalizeCase);
}

function loadClients(): StoredClient[] {
  return Storage
    .getClients<StoredClient>()
    .filter(
      (client) =>
        client &&
        typeof client.name ===
          'string',
    );
}

function loadStaff(): StoredStaff[] {
  return Storage
    .getStaff<StoredStaff>()
    .filter(
      (staffMember) =>
        staffMember &&
        typeof staffMember.name ===
          'string',
    );
}

export function Cases() {
  const [cases, setCases] =
    useState<CaseRecord[]>(
      loadCases,
    );

  const [clients, setClients] =
    useState<StoredClient[]>(
      loadClients,
    );

  const [staff, setStaff] =
    useState<StoredStaff[]>(
      loadStaff,
    );

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<
      'All' | CaseStatus
    >('All');

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState<
    'All' | CasePriority
  >('All');

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [
    editingCaseId,
    setEditingCaseId,
  ] = useState<number | null>(null);

  const [form, setForm] =
    useState<CaseForm>(emptyForm);

  useEffect(() => {
    const saved =
      Storage.saveCases(cases);

    if (!saved) {
      window.alert(
        'Case data could not be saved because browser storage may be full.',
      );
    }
  }, [cases]);

  useEffect(() => {
    const refreshRelatedData = (
      event?: Event,
    ) => {
      if (
        event instanceof CustomEvent
      ) {
        const key =
          event.detail?.key;

        if (
          key &&
          key !== 'clients' &&
          key !== 'staff' &&
          key !== 'database' &&
          key !==
            'operational-data'
        ) {
          return;
        }
      }

      setClients(loadClients());
      setStaff(loadStaff());
    };

    window.addEventListener(
      'shab-storage-updated',
      refreshRelatedData,
    );

    window.addEventListener(
      'storage',
      refreshRelatedData,
    );

    window.addEventListener(
      'focus',
      refreshRelatedData,
    );

    return () => {
      window.removeEventListener(
        'shab-storage-updated',
        refreshRelatedData,
      );

      window.removeEventListener(
        'storage',
        refreshRelatedData,
      );

      window.removeEventListener(
        'focus',
        refreshRelatedData,
      );
    };
  }, []);

  const filteredCases =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return [...cases]
        .sort((first, second) =>
          second.updatedAt.localeCompare(
            first.updatedAt,
          ),
        )
        .filter((caseItem) => {
          const matchesStatus =
            statusFilter === 'All' ||
            caseItem.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter === 'All' ||
            caseItem.priority ===
              priorityFilter;

          const matchesSearch =
            !search ||
            [
              caseItem.reference,
              caseItem.title,
              caseItem.client,
              caseItem.clientReference,
              caseItem.caseNumber,
              caseItem.caseType,
              caseItem.court,
              caseItem.emirate,
              caseItem.opponent,
              caseItem.assignedTo,
              caseItem.status,
              caseItem.priority,
              caseItem.notes,
            ]
              .join(' ')
              .toLowerCase()
              .includes(search);

          return (
            matchesStatus &&
            matchesPriority &&
            matchesSearch
          );
        });
    }, [
      cases,
      searchTerm,
      statusFilter,
      priorityFilter,
    ]);

  const activeCases =
    cases.filter(
      (caseItem) =>
        caseItem.status ===
        'Active',
    ).length;

  const pendingCases =
    cases.filter(
      (caseItem) =>
        caseItem.status ===
        'Pending' ||
        caseItem.status ===
          'On Hold',
    ).length;

  const closedCases =
    cases.filter(
      (caseItem) =>
        caseItem.status ===
        'Closed',
    ).length;

  const highPriorityCases =
    cases.filter(
      (caseItem) =>
        caseItem.priority ===
          'High' &&
        caseItem.status !==
          'Closed',
    ).length;

  const activeClients =
    clients.filter(
      (client) =>
        !client.status ||
        client.status === 'Active' ||
        client.status ===
          'Prospective',
    );

  const activeStaff =
    staff.filter(
      (staffMember) =>
        !staffMember.status ||
        staffMember.status ===
          'Active',
    );

  const openAddForm = () => {
    const firstClient =
      activeClients[0];

    setEditingCaseId(null);

    setForm({
      ...emptyForm,
      client:
        firstClient?.name || '',
      clientReference:
        firstClient?.reference || '',
      filingDate: getLocalDate(),
      assignedTo:
        activeStaff[0]?.name || '',
    });

    setIsFormOpen(true);
  };

  const openEditForm = (
    caseItem: CaseRecord,
  ) => {
    setEditingCaseId(caseItem.id);

    setForm({
      title: caseItem.title,
      client: caseItem.client,
      clientReference:
        caseItem.clientReference,
      caseNumber:
        caseItem.caseNumber,
      caseType:
        caseItem.caseType,
      court: caseItem.court,
      emirate: caseItem.emirate,
      opponent: caseItem.opponent,
      assignedTo:
        caseItem.assignedTo,
      filingDate:
        caseItem.filingDate,
      nextHearing:
        caseItem.nextHearing,
      status: caseItem.status,
      priority: caseItem.priority,
      notes: caseItem.notes,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCaseId(null);
    setForm(emptyForm);
  };

  const updateForm = <
    K extends keyof CaseForm,
  >(
    field: K,
    value: CaseForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleClientChange = (
    clientReference: string,
  ) => {
    const selectedClient =
      clients.find(
        (client) =>
          client.reference ===
            clientReference ||
          String(client.id) ===
            clientReference,
      );

    setForm((currentForm) => ({
      ...currentForm,
      clientReference:
        selectedClient?.reference ||
        '',
      client:
        selectedClient?.name || '',
    }));
  };

  const saveCase = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert(
        'Case title is required.',
      );

      return;
    }

    if (!form.client.trim()) {
      window.alert(
        'Please select or enter a client.',
      );

      return;
    }

    const now =
      new Date().toISOString();

    const caseData = {
      title: form.title.trim(),
      client: form.client.trim(),
      clientReference:
        form.clientReference.trim(),
      caseNumber:
        form.caseNumber.trim(),
      caseType:
        form.caseType.trim(),
      court: form.court.trim(),
      emirate:
        form.emirate.trim(),
      opponent:
        form.opponent.trim(),
      assignedTo:
        form.assignedTo.trim(),
      filingDate:
        form.filingDate,
      nextHearing:
        form.nextHearing,
      status: form.status,
      priority: form.priority,
      notes: form.notes.trim(),
      updatedAt: now,
    };

    if (editingCaseId !== null) {
      const existingCase =
        cases.find(
          (caseItem) =>
            caseItem.id ===
            editingCaseId,
        );

      if (!existingCase) {
        window.alert(
          'The selected case could not be found.',
        );

        return;
      }

      const updatedCase:
        CaseRecord = {
        ...existingCase,
        ...caseData,
      };

      setCases(
        (currentCases) =>
          currentCases.map(
            (caseItem) =>
              caseItem.id ===
              editingCaseId
                ? updatedCase
                : caseItem,
          ),
      );

      Activity.add(
        'Case',
        'Case Updated',
        `${updatedCase.title} was updated.`,
        updatedCase.reference,
      );
    } else {
      const newCase:
        CaseRecord = {
        id: Date.now(),
        reference:
          generateId('CASE'),
        ...caseData,
        createdAt: now,
      };

      setCases(
        (currentCases) => [
          newCase,
          ...currentCases,
        ],
      );

      Activity.add(
        'Case',
        'New Case Created',
        `${newCase.title} was opened for ${newCase.client}.`,
        newCase.reference,
      );
    }

    closeForm();
  };

  const deleteCase = (
    caseItem: CaseRecord,
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${caseItem.reference || caseItem.title}? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setCases(
      (currentCases) =>
        currentCases.filter(
          (currentCase) =>
            currentCase.id !==
            caseItem.id,
        ),
    );

    Activity.add(
      'Case',
      'Case Deleted',
      `${caseItem.title} was removed from the case database.`,
      caseItem.reference,
    );
  };

  const statusClasses:
    Record<CaseStatus, string> = {
    Active:
      'bg-green-100 text-green-700',
    Pending:
      'bg-yellow-100 text-yellow-700',
    'On Hold':
      'bg-orange-100 text-orange-700',
    Closed:
      'bg-gray-100 text-gray-700',
  };

  const priorityClasses:
    Record<
      CasePriority,
      string
    > = {
    High:
      'bg-red-100 text-red-700',
    Medium:
      'bg-yellow-100 text-yellow-700',
    Low:
      'bg-blue-100 text-blue-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <PageHeader
        title="Cases"
        subtitle="Manage SHAB legal matters, courts, opponents and assigned staff."
        action={
          <button
            type="button"
            onClick={openAddForm}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black shadow-sm hover:bg-[#b89536]"
          >
            <Plus className="h-5 w-5" />
            Add Case
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active Cases"
          value={activeCases}
          color="text-green-700"
        />

        <StatCard
          label="Pending / On Hold"
          value={pendingCases}
          color="text-yellow-700"
        />

        <StatCard
          label="High Priority"
          value={highPriorityCases}
          color="text-red-700"
        />

        <StatCard
          label="Closed Cases"
          value={closedCases}
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_190px_190px]">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search cases, clients or references"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | 'All'
                | CaseStatus,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-[#C9A84C]"
        >
          <option value="All">
            All statuses
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="On Hold">
            On Hold
          </option>

          <option value="Closed">
            Closed
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(
              event.target.value as
                | 'All'
                | CasePriority,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-[#C9A84C]"
        >
          <option value="All">
            All priorities
          </option>

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

      <div className="mt-6 space-y-4">
        {filteredCases.map(
          (caseItem) => (
            <article
              key={caseItem.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#C9A84C]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <div className="shrink-0 rounded-xl bg-[#111111] p-3">
                    <Briefcase className="h-6 w-6 text-[#C9A84C]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900">
                      {caseItem.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      {caseItem.client}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#B89536]">
                      {caseItem.reference ||
                        'Legacy case'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClasses[
                        caseItem.status
                      ]
                    }`}
                  >
                    {caseItem.status}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      priorityClasses[
                        caseItem.priority
                      ]
                    }`}
                  >
                    {caseItem.priority}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                <p>
                  <span className="font-medium text-gray-700">
                    Case type:
                  </span>{' '}
                  {caseItem.caseType ||
                    'Not specified'}
                </p>

                <p>
                  <span className="font-medium text-gray-700">
                    Court:
                  </span>{' '}
                  {caseItem.court ||
                    'Not specified'}
                </p>

                <p>
                  <span className="font-medium text-gray-700">
                    Emirate:
                  </span>{' '}
                  {caseItem.emirate ||
                    'Not specified'}
                </p>

                <p>
                  <span className="font-medium text-gray-700">
                    Court case number:
                  </span>{' '}
                  {caseItem.caseNumber ||
                    'Not recorded'}
                </p>

                <p>
                  <span className="font-medium text-gray-700">
                    Opponent:
                  </span>{' '}
                  {caseItem.opponent ||
                    'Not specified'}
                </p>

                <p className="flex items-start gap-2">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                  <span>
                    <span className="font-medium text-gray-700">
                      Assigned:
                    </span>{' '}
                    {caseItem.assignedTo ||
                      'Unassigned'}
                  </span>
                </p>

                <p>
                  <span className="font-medium text-gray-700">
                    Filing date:
                  </span>{' '}
                  {caseItem.filingDate
                    ? formatDate(
                        caseItem.filingDate,
                      )
                    : 'Not recorded'}
                </p>

                <p className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                  <span>
                    <span className="font-medium text-gray-700">
                      Next hearing:
                    </span>{' '}
                    {caseItem.nextHearing
                      ? formatDate(
                          caseItem.nextHearing,
                        )
                      : 'Not scheduled'}
                  </span>
                </p>
              </div>

              {caseItem.notes && (
                <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                  {caseItem.notes}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    openEditForm(
                      caseItem,
                    )
                  }
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deleteCase(
                      caseItem,
                    )
                  }
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          ),
        )}

        {filteredCases.length ===
          0 && (
          <EmptyState message="No matching cases found." />
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-4xl sm:rounded-3xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCaseId !==
                  null
                    ? 'Edit Case'
                    : 'Add Case'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Record the client,
                  court and matter details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close case form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveCase}
              className="space-y-6 p-5"
            >
              <section>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-[#C9A84C]" />

                  <h3 className="font-bold text-gray-900">
                    Matter Information
                  </h3>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Case title *
                    </label>

                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(event) =>
                        updateForm(
                          'title',
                          event.target
                            .value,
                        )
                      }
                      placeholder="Commercial dispute or labour claim"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-yellow-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Client *
                    </label>

                    {activeClients.length >
                    0 ? (
                      <select
                        required
                        value={
                          form.clientReference ||
                          activeClients.find(
                            (client) =>
                              client.name ===
                              form.client,
                          )?.reference ||
                          String(
                            activeClients.find(
                              (client) =>
                                client.name ===
                                form.client,
                            )?.id || '',
                          )
                        }
                        onChange={(event) =>
                          handleClientChange(
                            event.target
                              .value,
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
                      >
                        <option value="">
                          Select client
                        </option>

                        {activeClients.map(
                          (client) => (
                            <option
                              key={
                                client.id
                              }
                              value={
                                client.reference ||
                                String(
                                  client.id,
                                )
                              }
                            >
                              {client.name}
                              {client.reference
                                ? ` — ${client.reference}`
                                : ''}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={form.client}
                        onChange={(event) =>
                          updateForm(
                            'client',
                            event.target
                              .value,
                          )
                        }
                        placeholder="Client name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Case type
                    </label>

                    <select
                      value={form.caseType}
                      onChange={(event) =>
                        updateForm(
                          'caseType',
                          event.target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
                    >
                      <option value="">
                        Select case type
                      </option>

                      <option value="Civil">
                        Civil
                      </option>

                      <option value="Commercial">
                        Commercial
                      </option>

                      <option value="Criminal">
                        Criminal
                      </option>

                      <option value="Labour">
                        Labour
                      </option>

                      <option value="Family">
                        Family
                      </option>

                      <option value="Rental Dispute">
                        Rental Dispute
                      </option>

                      <option value="Real Estate">
                        Real Estate
                      </option>

                      <option value="Execution">
                        Execution
                      </option>

                      <option value="Arbitration">
                        Arbitration
                      </option>

                      <option value="Corporate">
                        Corporate
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Opponent
                    </label>

                    <input
                      type="text"
                      value={form.opponent}
                      onChange={(event) =>
                        updateForm(
                          'opponent',
                          event.target
                            .value,
                        )
                      }
                      placeholder="Opponent or counterparty"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Filing date
                    </label>

                    <input
                      type="date"
                      value={
                        form.filingDate
                      }
                      onChange={(event) =>
                        updateForm(
                          'filingDate',
                          event.target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3">
                  <Gavel className="h-5 w-5 text-[#C9A84C]" />

                  <h3 className="font-bold text-gray-900">
                    Court Information
                  </h3>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Court or authority
                    </label>

                    <input
                      type="text"
                      value={form.court}
                      onChange={(event) =>
                        updateForm(
                          'court',
                          event.target
                            .value,
                        )
                      }
                      placeholder="Dubai Courts"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
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
                          event.target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
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
                      Court case number
                    </label>

                    <input
                      type="text"
                      value={
                        form.caseNumber
                      }
                      onChange={(event) =>
                        updateForm(
                          'caseNumber',
                          event.target
                            .value,
                        )
                      }
                      placeholder="Court case number and year"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Next hearing
                    </label>

                    <input
                      type="date"
                      value={
                        form.nextHearing
                      }
                      onChange={(event) =>
                        updateForm(
                          'nextHearing',
                          event.target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-gray-200 pt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Assigned staff
                    </label>

                    {activeStaff.length >
                    0 ? (
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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
                      >
                        <option value="">
                          Unassigned
                        </option>

                        {activeStaff.map(
                          (
                            staffMember,
                          ) => (
                            <option
                              key={
                                staffMember.id
                              }
                              value={
                                staffMember.name
                              }
                            >
                              {
                                staffMember.name
                              }
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
                        placeholder="Assigned staff"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                      />
                    )}
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
                            .value as CaseStatus,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="On Hold">
                        On Hold
                      </option>

                      <option value="Closed">
                        Closed
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
                            .value as CasePriority,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
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
              </section>

              <div>
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
                  placeholder="Case background, strategy or internal instructions"
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
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
                  className="flex-1 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black hover:bg-[#b89536]"
                >
                  {editingCaseId !==
                  null
                    ? 'Save Changes'
                    : 'Save Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}