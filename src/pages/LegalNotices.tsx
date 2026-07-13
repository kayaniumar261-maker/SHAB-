import {
  Clipboard,
  FileText,
  Pencil,
  Plus,
  Save,
  Scale,
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

type NoticeType =
  | 'Debt Recovery'
  | 'Breach of Contract'
  | 'Labour'
  | 'Rental'
  | 'Final Demand'
  | 'General';

type NoticeStatus = 'Draft' | 'Final';

type StoredClient = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

type StoredCase = {
  id: number;
  title: string;
  reference: string;
  client?: string;
  opponent?: string;
};

type LegalNoticeRecord = {
  id: number;
  title: string;
  noticeType: NoticeType;
  clientName: string;
  relatedCase: string;
  recipientName: string;
  recipientAddress: string;
  subject: string;
  amount: string;
  deadlineDays: string;
  facts: string;
  demand: string;
  noticeText: string;
  status: NoticeStatus;
  createdAt: string;
  updatedAt: string;
};

type NoticeForm = Omit<
  LegalNoticeRecord,
  'id' | 'createdAt' | 'updatedAt'
>;

const NOTICES_STORAGE_KEY = 'shab-legal-notices';
const CLIENTS_STORAGE_KEY = 'shab-clients';
const CASES_STORAGE_KEY = 'shab-cases';

const emptyForm: NoticeForm = {
  title: '',
  noticeType: 'Debt Recovery',
  clientName: '',
  relatedCase: '',
  recipientName: '',
  recipientAddress: '',
  subject: '',
  amount: '',
  deadlineDays: '15',
  facts: '',
  demand: '',
  noticeText: '',
  status: 'Draft',
};

function loadNotices(): LegalNoticeRecord[] {
  try {
    const savedNotices = window.localStorage.getItem(
      NOTICES_STORAGE_KEY,
    );

    if (!savedNotices) {
      return [];
    }

    const parsedNotices = JSON.parse(savedNotices);

    return Array.isArray(parsedNotices)
      ? parsedNotices
      : [];
  } catch {
    return [];
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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function createNoticeText(form: NoticeForm): string {
  const today = new Date().toLocaleDateString('en-GB');

  const amountLine = form.amount.trim()
    ? `Amount claimed: AED ${form.amount.trim()}`
    : '';

  const caseLine = form.relatedCase.trim()
    ? `Reference: ${form.relatedCase.trim()}`
    : '';

  return `WITHOUT PREJUDICE

LEGAL NOTICE

Date: ${today}

From:
${form.clientName.trim() || '[CLIENT NAME]'}

To:
${form.recipientName.trim() || '[RECIPIENT NAME]'}
${form.recipientAddress.trim() || '[RECIPIENT ADDRESS]'}

Subject: ${form.subject.trim() || form.noticeType}

${caseLine}
${amountLine}

Dear Sir/Madam,

We act on behalf of ${
    form.clientName.trim() || '[CLIENT NAME]'
  }.

BACKGROUND

${
  form.facts.trim() ||
  '[Insert the material facts and background of the matter.]'
}

FORMAL DEMAND

${
  form.demand.trim() ||
  '[Insert the precise payment, performance or corrective action required.]'
}

You are hereby called upon to comply with the above demand within ${
    form.deadlineDays.trim() || '15'
  } days from receipt of this notice.

Failing full compliance within the stated period, our client reserves the right to commence appropriate legal proceedings and seek all available remedies, costs and relief, without further notice.

This notice is issued without prejudice to all rights, remedies and claims available to our client.

Yours faithfully,

SHAB Legal Consultants FZC
For and on behalf of ${
    form.clientName.trim() || '[CLIENT NAME]'
  }`;
}

export function LegalNotices() {
  const [notices, setNotices] =
    useState<LegalNoticeRecord[]>(loadNotices);

  const [clients, setClients] =
    useState<StoredClient[]>(loadClients);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingNoticeId, setEditingNoticeId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<NoticeForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      NOTICES_STORAGE_KEY,
      JSON.stringify(notices),
    );
  }, [notices]);

  useEffect(() => {
    const refreshRelatedData = () => {
      setClients(loadClients());
      setCases(loadCases());
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

  const filteredNotices = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const sortedNotices = [...notices].sort(
      (firstNotice, secondNotice) =>
        secondNotice.updatedAt.localeCompare(
          firstNotice.updatedAt,
        ),
    );

    if (!search) {
      return sortedNotices;
    }

    return sortedNotices.filter((notice) =>
      [
        notice.title,
        notice.noticeType,
        notice.clientName,
        notice.relatedCase,
        notice.recipientName,
        notice.subject,
        notice.status,
        notice.noticeText,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [notices, searchTerm]);

  const openAddForm = () => {
    setEditingNoticeId(null);

    setForm({
      ...emptyForm,
      clientName: clients[0]?.name || '',
      relatedCase: cases[0]?.reference || '',
    });

    setIsFormOpen(true);
  };

  const openEditForm = (
    notice: LegalNoticeRecord,
  ) => {
    setEditingNoticeId(notice.id);

    setForm({
      title: notice.title,
      noticeType: notice.noticeType,
      clientName: notice.clientName,
      relatedCase: notice.relatedCase,
      recipientName: notice.recipientName,
      recipientAddress: notice.recipientAddress,
      subject: notice.subject,
      amount: notice.amount,
      deadlineDays: notice.deadlineDays,
      facts: notice.facts,
      demand: notice.demand,
      noticeText: notice.noticeText,
      status: notice.status,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingNoticeId(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof NoticeForm>(
    field: K,
    value: NoticeForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleClientChange = (clientName: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      clientName,
    }));
  };

  const handleCaseChange = (reference: string) => {
    const selectedCase = cases.find(
      (caseItem) => caseItem.reference === reference,
    );

    setForm((currentForm) => ({
      ...currentForm,
      relatedCase: reference,
      recipientName:
        currentForm.recipientName ||
        selectedCase?.opponent ||
        '',
    }));
  };

  const generateNotice = () => {
    if (!form.clientName.trim()) {
      window.alert('Please select or enter a client.');
      return;
    }

    if (!form.recipientName.trim()) {
      window.alert('Recipient name is required.');
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      noticeText: createNoticeText(currentForm),
    }));
  };

  const saveNotice = (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert('Notice title is required.');
      return;
    }

    if (!form.clientName.trim()) {
      window.alert('Client name is required.');
      return;
    }

    if (!form.recipientName.trim()) {
      window.alert('Recipient name is required.');
      return;
    }

    const finalNoticeText =
      form.noticeText.trim() || createNoticeText(form);

    const now = new Date().toISOString();

    if (editingNoticeId !== null) {
      setNotices((currentNotices) =>
        currentNotices.map((notice) =>
          notice.id === editingNoticeId
            ? {
                ...notice,
                ...form,
                title: form.title.trim(),
                clientName: form.clientName.trim(),
                relatedCase: form.relatedCase.trim(),
                recipientName:
                  form.recipientName.trim(),
                recipientAddress:
                  form.recipientAddress.trim(),
                subject: form.subject.trim(),
                amount: form.amount.trim(),
                deadlineDays:
                  form.deadlineDays.trim() || '15',
                facts: form.facts.trim(),
                demand: form.demand.trim(),
                noticeText: finalNoticeText,
                updatedAt: now,
              }
            : notice,
        ),
      );
    } else {
      const newNotice: LegalNoticeRecord = {
        id: Date.now(),
        ...form,
        title: form.title.trim(),
        clientName: form.clientName.trim(),
        relatedCase: form.relatedCase.trim(),
        recipientName: form.recipientName.trim(),
        recipientAddress:
          form.recipientAddress.trim(),
        subject: form.subject.trim(),
        amount: form.amount.trim(),
        deadlineDays:
          form.deadlineDays.trim() || '15',
        facts: form.facts.trim(),
        demand: form.demand.trim(),
        noticeText: finalNoticeText,
        createdAt: now,
        updatedAt: now,
      };

      setNotices((currentNotices) => [
        newNotice,
        ...currentNotices,
      ]);
    }

    closeForm();
  };

  const copyNotice = async (
    noticeText: string,
  ) => {
    try {
      await navigator.clipboard.writeText(noticeText);
      window.alert('Notice copied to clipboard.');
    } catch {
      const textArea =
        window.document.createElement('textarea');

      textArea.value = noticeText;
      window.document.body.appendChild(textArea);
      textArea.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(textArea);

      window.alert('Notice copied to clipboard.');
    }
  };

  const deleteNotice = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this legal notice?',
    );

    if (!confirmed) {
      return;
    }

    setNotices((currentNotices) =>
      currentNotices.filter(
        (notice) => notice.id !== id,
      ),
    );
  };

  const statusClasses: Record<NoticeStatus, string> = {
    Draft: 'bg-yellow-100 text-yellow-700',
    Final: 'bg-green-100 text-green-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Legal Notices
          </h1>

          <p className="mt-1 text-gray-500">
            Draft, edit and save SHAB legal notices.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-red-700"
        >
          <Plus className="h-5 w-5" />
          New Notice
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total notices
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {notices.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Final notices
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {
              notices.filter(
                (notice) => notice.status === 'Final',
              ).length
            }
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search notices"
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-6 space-y-4">
        {filteredNotices.map((notice) => (
          <article
            key={notice.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-red-100 p-3">
                <Scale className="h-6 w-6 text-red-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900">
                      {notice.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {notice.noticeType}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClasses[notice.status]
                    }`}
                  >
                    {notice.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <p>
                    <span className="font-medium text-gray-700">
                      Client:
                    </span>{' '}
                    {notice.clientName}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Recipient:
                    </span>{' '}
                    {notice.recipientName}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Case:
                    </span>{' '}
                    {notice.relatedCase || 'Not linked'}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Updated:
                    </span>{' '}
                    {formatDate(notice.updatedAt)}
                  </p>
                </div>

                {notice.subject && (
                  <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                    <span className="font-semibold text-gray-700">
                      Subject:
                    </span>{' '}
                    {notice.subject}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyNotice(notice.noticeText)
                    }
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                  >
                    <Clipboard className="h-4 w-4" />
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(notice)
                    }
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteNotice(notice.id)
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

        {filteredNotices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-gray-500">
              No matching legal notices found.
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-4xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingNoticeId !== null
                    ? 'Edit Legal Notice'
                    : 'Create Legal Notice'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Complete the details and generate the draft.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close legal notice form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveNotice}
              className="space-y-5 p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="notice-title"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Internal title *
                  </label>

                  <input
                    id="notice-title"
                    type="text"
                    required
                    value={form.title}
                    onChange={(event) =>
                      updateForm(
                        'title',
                        event.target.value,
                      )
                    }
                    placeholder="Final demand to ABC LLC"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notice-type"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Notice type
                  </label>

                  <select
                    id="notice-type"
                    value={form.noticeType}
                    onChange={(event) =>
                      updateForm(
                        'noticeType',
                        event.target.value as NoticeType,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="Debt Recovery">
                      Debt Recovery
                    </option>

                    <option value="Breach of Contract">
                      Breach of Contract
                    </option>

                    <option value="Labour">
                      Labour
                    </option>

                    <option value="Rental">
                      Rental
                    </option>

                    <option value="Final Demand">
                      Final Demand
                    </option>

                    <option value="General">
                      General
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="notice-client"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Client *
                  </label>

                  {clients.length > 0 ? (
                    <select
                      id="notice-client"
                      required
                      value={form.clientName}
                      onChange={(event) =>
                        handleClientChange(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                      <option value="">
                        Select client
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
                      id="notice-client"
                      type="text"
                      required
                      value={form.clientName}
                      onChange={(event) =>
                        handleClientChange(
                          event.target.value,
                        )
                      }
                      placeholder="Client name"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  )}
                </div>

                <div>
                  <label
                    htmlFor="notice-case"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Related case
                  </label>

                  {cases.length > 0 ? (
                    <select
                      id="notice-case"
                      value={form.relatedCase}
                      onChange={(event) =>
                        handleCaseChange(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                      id="notice-case"
                      type="text"
                      value={form.relatedCase}
                      onChange={(event) =>
                        updateForm(
                          'relatedCase',
                          event.target.value,
                        )
                      }
                      placeholder="Case reference"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="recipient-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Recipient name *
                  </label>

                  <input
                    id="recipient-name"
                    type="text"
                    required
                    value={form.recipientName}
                    onChange={(event) =>
                      updateForm(
                        'recipientName',
                        event.target.value,
                      )
                    }
                    placeholder="Opponent or debtor"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="recipient-address"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Recipient address
                  </label>

                  <input
                    id="recipient-address"
                    type="text"
                    value={form.recipientAddress}
                    onChange={(event) =>
                      updateForm(
                        'recipientAddress',
                        event.target.value,
                      )
                    }
                    placeholder="Recipient address"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notice-subject"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Subject
                </label>

                <input
                  id="notice-subject"
                  type="text"
                  value={form.subject}
                  onChange={(event) =>
                    updateForm(
                      'subject',
                      event.target.value,
                    )
                  }
                  placeholder="Demand for payment and breach of agreement"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="notice-amount"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Amount claimed in AED
                  </label>

                  <input
                    id="notice-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      updateForm(
                        'amount',
                        event.target.value,
                      )
                    }
                    placeholder="25000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notice-deadline"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Compliance deadline in days
                  </label>

                  <input
                    id="notice-deadline"
                    type="number"
                    min="1"
                    value={form.deadlineDays}
                    onChange={(event) =>
                      updateForm(
                        'deadlineDays',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notice-facts"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Background and facts
                </label>

                <textarea
                  id="notice-facts"
                  rows={5}
                  value={form.facts}
                  onChange={(event) =>
                    updateForm(
                      'facts',
                      event.target.value,
                    )
                  }
                  placeholder="Explain the agreement, transaction, breach, unpaid amount and relevant dates."
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label
                  htmlFor="notice-demand"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Formal demand
                </label>

                <textarea
                  id="notice-demand"
                  rows={4}
                  value={form.demand}
                  onChange={(event) =>
                    updateForm(
                      'demand',
                      event.target.value,
                    )
                  }
                  placeholder="State exactly what the recipient must pay, return, perform or stop doing."
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <button
                type="button"
                onClick={generateNotice}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-black"
              >
                <Scale className="h-5 w-5" />
                Generate Notice Draft
              </button>

              <div>
                <label
                  htmlFor="notice-text"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Notice text
                </label>

                <textarea
                  id="notice-text"
                  rows={18}
                  value={form.noticeText}
                  onChange={(event) =>
                    updateForm(
                      'noticeText',
                      event.target.value,
                    )
                  }
                  placeholder="Generate the notice, then edit the wording here."
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label
                  htmlFor="notice-status"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Status
                </label>

                <select
                  id="notice-status"
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      'status',
                      event.target.value as NoticeStatus,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  <option value="Draft">Draft</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div className="rounded-xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
                Review and adapt every notice to the facts,
                supporting documents and applicable law before
                serving it.
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
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                >
                  <Save className="h-5 w-5" />

                  {editingNoticeId !== null
                    ? 'Save Changes'
                    : 'Save Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}