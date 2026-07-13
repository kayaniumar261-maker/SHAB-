import {
  Briefcase,
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

const CASES_STORAGE_KEY = 'shab-cases';

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
  {
    id: 2,
    title: 'Labour Claim',
    client: 'Mohammed Ali',
    reference: 'SHAB-2026-002',
    caseType: 'Labour',
    court: 'MOHRE',
    opponent: 'Previous Employer LLC',
    assignedTo: 'Umar Kayani',
    nextHearing: '2026-07-24',
    status: 'Pending',
    notes: 'Unpaid salary and end-of-service claim.',
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

export function Cases() {
  const [cases, setCases] =
    useState<CaseItem[]>(loadCases);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.localStorage.setItem(
      CASES_STORAGE_KEY,
      JSON.stringify(cases),
    );
  }, [cases]);

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

  const addCase = () => {
    const title = window.prompt('Enter case title');

    if (!title?.trim()) {
      return;
    }

    const client =
      window.prompt('Enter client name')?.trim() ||
      'Unnamed Client';

    const reference =
      window.prompt('Enter case reference')?.trim() ||
      `SHAB-${new Date().getFullYear()}-${String(
        cases.length + 1,
      ).padStart(3, '0')}`;

    const caseType =
      window.prompt('Enter case type')?.trim() ||
      'General';

    const court =
      window.prompt('Enter court or authority')?.trim() ||
      'Not specified';

    const opponent =
      window.prompt('Enter opponent name')?.trim() || '';

    const assignedTo =
      window.prompt('Enter assigned staff member')?.trim() ||
      'Unassigned';

    const nextHearing =
      window.prompt(
        'Enter next hearing date in YYYY-MM-DD format',
      )?.trim() || '';

    const notes =
      window.prompt('Enter case notes')?.trim() || '';

    const newCase: CaseItem = {
      id: Date.now(),
      title: title.trim(),
      client,
      reference,
      caseType,
      court,
      opponent,
      assignedTo,
      nextHearing,
      status: 'Active',
      notes,
    };

    setCases((currentCases) => [
      newCase,
      ...currentCases,
    ]);
  };

  const editCase = (caseItem: CaseItem) => {
    const title = window.prompt(
      'Edit case title',
      caseItem.title,
    );

    if (!title?.trim()) {
      return;
    }

    const client =
      window.prompt(
        'Edit client name',
        caseItem.client,
      ) ?? caseItem.client;

    const reference =
      window.prompt(
        'Edit case reference',
        caseItem.reference,
      ) ?? caseItem.reference;

    const caseType =
      window.prompt(
        'Edit case type',
        caseItem.caseType,
      ) ?? caseItem.caseType;

    const court =
      window.prompt(
        'Edit court or authority',
        caseItem.court,
      ) ?? caseItem.court;

    const opponent =
      window.prompt(
        'Edit opponent name',
        caseItem.opponent,
      ) ?? caseItem.opponent;

    const assignedTo =
      window.prompt(
        'Edit assigned staff member',
        caseItem.assignedTo,
      ) ?? caseItem.assignedTo;

    const nextHearing =
      window.prompt(
        'Edit next hearing date',
        caseItem.nextHearing,
      ) ?? caseItem.nextHearing;

    const statusInput =
      window.prompt(
        'Edit status: Active, Pending or Closed',
        caseItem.status,
      ) ?? caseItem.status;

    const normalizedStatus =
      statusInput.trim().toLowerCase();

    const status: CaseStatus =
      normalizedStatus === 'closed'
        ? 'Closed'
        : normalizedStatus === 'pending'
          ? 'Pending'
          : 'Active';

    const notes =
      window.prompt(
        'Edit case notes',
        caseItem.notes,
      ) ?? caseItem.notes;

    setCases((currentCases) =>
      currentCases.map((currentCase) =>
        currentCase.id === caseItem.id
          ? {
              ...currentCase,
              title: title.trim(),
              client: client.trim(),
              reference: reference.trim(),
              caseType: caseType.trim(),
              court: court.trim(),
              opponent: opponent.trim(),
              assignedTo: assignedTo.trim(),
              nextHearing: nextHearing.trim(),
              status,
              notes: notes.trim(),
            }
          : currentCase,
      ),
    );
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
          onClick={addCase}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-yellow-600"
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
                {item.caseType}
              </p>

              <p>
                <span className="font-medium text-gray-700">
                  Court:
                </span>{' '}
                {item.court}
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
                {item.assignedTo}
              </p>

              <p>
                <span className="font-medium text-gray-700">
                  Next hearing:
                </span>{' '}
                {item.nextHearing || 'Not scheduled'}
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
                onClick={() => editCase(item)}
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
    </div>
  );
}