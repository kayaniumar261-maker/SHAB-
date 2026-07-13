import {
  Briefcase,
  CalendarDays,
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

type CaseStatus = 'Active' | 'Pending' | 'Closed';

type CaseItem = {
  id: number;
  title: string;
  client: string;
  reference: string;
  caseType: string;
  court: string;
  opponent: string;
  assignedTo: string;
  nextHearing: string;
  status: CaseStatus;
  notes: string;
};

type CaseForm = Omit<CaseItem, 'id'>;

type StoredClient = {
  id: number;
  name: string;
};

const CASES_STORAGE_KEY = 'shab-cases';
const CLIENTS_STORAGE_KEY = 'shab-clients';

const emptyForm: CaseForm = {
  title: '',
  client: '',
  reference: '',
  caseType: '',
  court: '',
  opponent: '',
  assignedTo: '',
  nextHearing: '',
  status: 'Active',
  notes: '',
};

const initialCases: CaseItem[] = [
  {
    id: 1,
    title: 'Commercial Dispute',
    client: 'ABC Trading LLC',
    reference: 'SHAB-2026-001',
    caseType: 'Civil',
    court: 'Dubai Courts',
    opponent: 'XYZ Holdings LLC',
    assignedTo: 'Umar Kayani',
    nextHearing: '2026-07-20',
    status: 'Active',
    notes: 'Commercial payment recovery dispute.',
  },
];

function loadCases(): CaseItem[] {
  try {
    const savedCases = window.localStorage.getItem(
      CASES_STORAGE_KEY,
    );

    if (!savedCases) {
      return initialCases;
    }

    const parsedCases = JSON.parse(savedCases);

    return Array.isArray(parsedCases)
      ? parsedCases
      : initialCases;
  } catch {
    return initialCases;
  }
}

function loadClients(): StoredClient[] {
  try {
    const savedClients = window.localStorage.getItem(
      CLIENTS_STORAGE_KEY,
    );

    if (!savedClients) {
      return [];
    }

    const parsedClients = JSON.parse(savedClients);

    return Array.isArray(parsedClients)
      ? parsedClients
      : [];
  } catch {
    return [];
  }
}

function generateReference(caseCount: number): string {
  return `SHAB-${new Date().getFullYear()}-${String(
    caseCount + 1,
  ).padStart(3, '0')}`;
}

export function Cases() {
  const [cases, setCases] =
    useState<CaseItem[]>(loadCases);

  const [clients, setClients] =
    useState<StoredClient[]>(loadClients);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingCaseId, setEditingCaseId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CaseForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      CASES_STORAGE_KEY,
      JSON.stringify(cases),
    );
  }, [cases]);

  useEffect(() => {
    const refreshClients = () => {
      setClients(loadClients());
    };

    refreshClients();

    window.addEventListener('focus', refreshClients);
    window.addEventListener('storage', refreshClients);

    return () => {
      window.removeEventListener('focus', refreshClients);
      window.removeEventListener('storage', refreshClients);
    };
  }, []);

  const filteredCases = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return cases;
    }

    return cases.filter((item) =>
      [
        item.title,
        item.client,
        item.reference,
        item.caseType,
        item.court,
        item.opponent,
        item.assignedTo,
        item.status,
        item.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [cases, searchTerm]);

  const openAddForm = () => {
    setEditingCaseId(null);

    setForm({
      ...emptyForm,
      reference: generateReference(cases.length),
      client: clients[0]?.name || '',
      assignedTo: 'Umar Kayani',
    });

    setIsFormOpen(true);
  };

  const openEditForm = (caseItem: CaseItem) => {
    setEditingCaseId(caseItem.id);

    setForm({
      title: caseItem.title,
      client: caseItem.client,
      reference: caseItem.reference,
      caseType: caseItem.caseType,
      court: caseItem.court,
      opponent: caseItem.opponent,
      assignedTo: caseItem.assignedTo,
      nextHearing: caseItem.nextHearing,
      status: caseItem.status,
      notes: caseItem.notes,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCaseId(null);
    setForm(emptyForm);
  };

  const updateForm = (
    field: keyof CaseForm,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveCase = (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert('Case title is required.');
      return;
    }

    if (!form.client.trim()) {
      window.alert('Please select or enter a client.');
      return;
    }

    if (!form.reference.trim()) {
      window.alert('Case reference is required.');
      return;
    }

    if (editingCaseId !== null) {
      setCases((currentCases) =>
        currentCases.map((caseItem) =>
          caseItem.id === editingCaseId
            ? {
                ...caseItem,
                ...form,
                title: form.title.trim(),
                client: form.client.trim(),
                reference: form.reference.trim(),
                caseType: form.caseType.trim(),
                court: form.court.trim(),
                opponent: form.opponent.trim(),
                assignedTo: form.assignedTo.trim(),
                nextHearing: form.nextHearing.trim(),
                notes: form.notes.trim(),
              }
            : caseItem,
        ),
      );
    } else {
      const newCase: CaseItem = {
        id: Date.now(),
        ...form,
        title: form.title.trim(),
        client: form.client.trim(),
        reference: form.reference.trim(),
        caseType: form.caseType.trim(),
        court: form.court.trim(),
        opponent: form.opponent.trim(),
        assignedTo: form.assignedTo.trim(),
        nextHearing: form.nextHearing.trim(),
        notes: form.notes.trim(),
      };

      setCases((currentCases) => [
        newCase,
        ...currentCases,
      ]);
    }

    closeForm();
  };

  const deleteCase = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this case?',
    );

    if (!confirmed) {
      return;
    }

    setCases((currentCases) =>
      currentCases.filter(
        (caseItem) => caseItem.id !== id,
      ),
    );
  };

  const statusClasses: Record<CaseStatus, string> = {
    Active: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Closed: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cases
          </h1>

          <p className="mt-1 text-gray-500">
            Manage SHAB legal matters and case records.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          Add Case
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
          placeholder="Search cases, clients or references"
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-6 space-y-4">
        {filteredCases.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <div className="shrink-0 rounded-xl bg-purple-100 p-3">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.client}
                  </p>

                  <p className="mt-1 text-xs font-medium text-gray-400">
                    {item.reference}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[item.status]}`}
              >
                {item.status}
              </span>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
              <p>
                <span className="font-medium text-gray-700">
                  Case type:
                </span>{' '}
                {item.caseType || 'Not specified'}
              </p>

              <p>
                <span className="font-medium text-gray-700">
                  Court:
                </span>{' '}
                {item.court || 'Not specified'}
              </p>

              <p>
                <span className="font-medium text-gray-700">
                  Opponent:
                </span>{' '}
                {item.opponent || 'Not specified'}
              </p>

              <p>
                <span className="font-medium text-gray-700">
                  Assigned to:
                </span>{' '}
                {item.assignedTo || 'Unassigned'}
              </p>

              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />

                <span>
                  {item.nextHearing || 'No hearing scheduled'}
                </span>
              </p>
            </div>

            {item.notes && (
              <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                {item.notes}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditForm(item)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => deleteCase(item.id)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </article>
        ))}

        {filteredCases.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No matching cases found.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCaseId !== null
                    ? 'Edit Case'
                    : 'Add Case'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the complete legal matter details.
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
              className="space-y-5 p-5"
            >
              <div>
                <label
                  htmlFor="case-title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Case title *
                </label>

                <input
                  id="case-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateForm('title', event.target.value)
                  }
                  placeholder="Commercial dispute"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="case-client"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Client *
                  </label>

                  {clients.length > 0 ? (
                    <select
                      id="case-client"
                      required
                      value={form.client}
                      onChange={(event) =>
                        updateForm(
                          'client',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="">
                        Select a client
                      </option>

                      {clients.map((client) => (
                        <option
                          key={client.id}
                          value={client.name}
                        >
                          {client.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="case-client"
                      type="text"
                      required
                      value={form.client}
                      onChange={(event) =>
                        updateForm(
                          'client',
                          event.target.value,
                        )
                      }
                      placeholder="Client name"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  )}
                </div>

                <div>
                  <label
                    htmlFor="case-reference"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Case reference *
                  </label>

                  <input
                    id="case-reference"
                    type="text"
                    required
                    value={form.reference}
                    onChange={(event) =>
                      updateForm(
                        'reference',
                        event.target.value,
                      )
                    }
                    placeholder="SHAB-2026-001"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="case-type"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Case type
                  </label>

                  <input
                    id="case-type"
                    type="text"
                    value={form.caseType}
                    onChange={(event) =>
                      updateForm(
                        'caseType',
                        event.target.value,
                      )
                    }
                    placeholder="Civil, Labour, Criminal..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="case-court"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Court or authority
                  </label>

                  <input
                    id="case-court"
                    type="text"
                    value={form.court}
                    onChange={(event) =>
                      updateForm(
                        'court',
                        event.target.value,
                      )
                    }
                    placeholder="Dubai Courts"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="case-opponent"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Opponent
                  </label>

                  <input
                    id="case-opponent"
                    type="text"
                    value={form.opponent}
                    onChange={(event) =>
                      updateForm(
                        'opponent',
                        event.target.value,
                      )
                    }
                    placeholder="Opponent name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="case-assigned"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Assigned to
                  </label>

                  <input
                    id="case-assigned"
                    type="text"
                    value={form.assignedTo}
                    onChange={(event) =>
                      updateForm(
                        'assignedTo',
                        event.target.value,
                      )
                    }
                    placeholder="Staff member"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="case-hearing"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Next hearing
                  </label>

                  <input
                    id="case-hearing"
                    type="date"
                    value={form.nextHearing}
                    onChange={(event) =>
                      updateForm(
                        'nextHearing',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="case-status"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="case-status"
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        'status',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="case-notes"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="case-notes"
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Case background, next steps and internal notes"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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
                  className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  {editingCaseId !== null
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