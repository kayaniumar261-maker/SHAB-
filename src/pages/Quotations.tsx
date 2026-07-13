import {
  Clipboard,
  FileText,
  Pencil,
  Plus,
  Printer,
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

type QuotationStatus =
  | 'Draft'
  | 'Sent'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

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
};

type QuotationItem = {
  id: number;
  description: string;
  quantity: number;
  rate: number;
};

type QuotationRecord = {
  id: number;
  quotationNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  relatedCase: string;
  title: string;
  issueDate: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  terms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type QuotationForm = {
  quotationNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  relatedCase: string;
  title: string;
  issueDate: string;
  validUntil: string;
  vatRate: string;
  status: QuotationStatus;
  terms: string;
  notes: string;
};

const QUOTATIONS_STORAGE_KEY = 'shab-quotations';
const CLIENTS_STORAGE_KEY = 'shab-clients';
const CASES_STORAGE_KEY = 'shab-cases';

const emptyForm: QuotationForm = {
  quotationNumber: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  relatedCase: '',
  title: '',
  issueDate: '',
  validUntil: '',
  vatRate: '5',
  status: 'Draft',
  terms:
    '50% advance payment is required before commencement of work. The remaining balance shall be payable as agreed.',
  notes: '',
};

function loadQuotations(): QuotationRecord[] {
  try {
    const savedQuotations =
      window.localStorage.getItem(
        QUOTATIONS_STORAGE_KEY,
      );

    if (!savedQuotations) {
      return [];
    }

    const parsedQuotations = JSON.parse(
      savedQuotations,
    );

    return Array.isArray(parsedQuotations)
      ? parsedQuotations
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

function getLocalDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');
  const day = String(date.getDate()).padStart(
    2,
    '0',
  );

  return `${year}-${month}-${day}`;
}

function addDays(
  dateValue: string,
  days: number,
): string {
  const date = new Date(
    `${dateValue}T00:00:00`,
  );

  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');
  const day = String(date.getDate()).padStart(
    2,
    '0',
  );

  return `${year}-${month}-${day}`;
}

function generateQuotationNumber(
  count: number,
): string {
  return `SHAB-QTN-${new Date().getFullYear()}-${String(
    count + 1,
  ).padStart(3, '0')}`;
}

function roundCurrency(value: number): number {
  return (
    Math.round(
      (value + Number.EPSILON) * 100,
    ) / 100
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB');
}

function createQuotationText(
  quotation: QuotationRecord,
): string {
  const itemLines = quotation.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.description}
Quantity: ${item.quantity}
Rate: ${formatCurrency(item.rate)}
Amount: ${formatCurrency(
          item.quantity * item.rate,
        )}`,
    )
    .join('\n\n');

  return `SHAB LEGAL CONSULTANTS FZC

QUOTATION

Quotation Number: ${
    quotation.quotationNumber
  }
Issue Date: ${formatDate(
    quotation.issueDate,
  )}
Valid Until: ${formatDate(
    quotation.validUntil,
  )}

CLIENT DETAILS

Client: ${quotation.clientName}
Email: ${quotation.clientEmail || '-'}
Phone: ${quotation.clientPhone || '-'}
Address: ${quotation.clientAddress || '-'}
Related Case: ${
    quotation.relatedCase || 'Not linked'
  }

SUBJECT

${quotation.title}

SERVICES

${itemLines}

FINANCIAL SUMMARY

Subtotal: ${formatCurrency(
    quotation.subtotal,
  )}
VAT (${quotation.vatRate}%): ${formatCurrency(
    quotation.vatAmount,
  )}
Total: ${formatCurrency(
    quotation.totalAmount,
  )}

TERMS AND CONDITIONS

${quotation.terms || '-'}

NOTES

${quotation.notes || '-'}

For and on behalf of:

SHAB Legal Consultants FZC`;
}

export function Quotations() {
  const [quotations, setQuotations] =
    useState<QuotationRecord[]>(
      loadQuotations,
    );

  const [clients, setClients] =
    useState<StoredClient[]>(loadClients);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<'All' | QuotationStatus>(
      'All',
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [
    editingQuotationId,
    setEditingQuotationId,
  ] = useState<number | null>(null);

  const [form, setForm] =
    useState<QuotationForm>(emptyForm);

  const [items, setItems] = useState<
    QuotationItem[]
  >([]);

  useEffect(() => {
    window.localStorage.setItem(
      QUOTATIONS_STORAGE_KEY,
      JSON.stringify(quotations),
    );
  }, [quotations]);

  useEffect(() => {
    const refreshRelatedData = () => {
      setClients(loadClients());
      setCases(loadCases());
    };

    refreshRelatedData();

    window.addEventListener(
      'focus',
      refreshRelatedData,
    );

    window.addEventListener(
      'storage',
      refreshRelatedData,
    );

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

  const subtotal = useMemo(
    () =>
      roundCurrency(
        items.reduce(
          (total, item) =>
            total +
            item.quantity * item.rate,
          0,
        ),
      ),
    [items],
  );

  const vatRate =
    Number.parseFloat(form.vatRate) || 0;

  const vatAmount = roundCurrency(
    subtotal * (vatRate / 100),
  );

  const totalAmount = roundCurrency(
    subtotal + vatAmount,
  );

  const filteredQuotations = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return [...quotations]
      .sort((first, second) =>
        second.updatedAt.localeCompare(
          first.updatedAt,
        ),
      )
      .filter((quotation) => {
        const matchesStatus =
          statusFilter === 'All' ||
          quotation.status === statusFilter;

        const matchesSearch =
          !search ||
          [
            quotation.quotationNumber,
            quotation.clientName,
            quotation.relatedCase,
            quotation.title,
            quotation.status,
            quotation.notes,
          ]
            .join(' ')
            .toLowerCase()
            .includes(search);

        return matchesStatus && matchesSearch;
      });
  }, [
    quotations,
    searchTerm,
    statusFilter,
  ]);

  const totalQuoted = useMemo(
    () =>
      roundCurrency(
        quotations
          .filter(
            (quotation) =>
              quotation.status !== 'Rejected',
          )
          .reduce(
            (total, quotation) =>
              total +
              quotation.totalAmount,
            0,
          ),
      ),
    [quotations],
  );

  const acceptedValue = useMemo(
    () =>
      roundCurrency(
        quotations
          .filter(
            (quotation) =>
              quotation.status === 'Accepted',
          )
          .reduce(
            (total, quotation) =>
              total +
              quotation.totalAmount,
            0,
          ),
      ),
    [quotations],
  );

  const openAddForm = () => {
    const today = getLocalDate();

    setEditingQuotationId(null);

    setForm({
      ...emptyForm,
      quotationNumber:
        generateQuotationNumber(
          quotations.length,
        ),
      issueDate: today,
      validUntil: addDays(today, 15),
    });

    setItems([
      {
        id: Date.now(),
        description: '',
        quantity: 1,
        rate: 0,
      },
    ]);

    setIsFormOpen(true);
  };

  const openEditForm = (
    quotation: QuotationRecord,
  ) => {
    setEditingQuotationId(
      quotation.id,
    );

    setForm({
      quotationNumber:
        quotation.quotationNumber,
      clientName: quotation.clientName,
      clientEmail: quotation.clientEmail,
      clientPhone: quotation.clientPhone,
      clientAddress:
        quotation.clientAddress,
      relatedCase: quotation.relatedCase,
      title: quotation.title,
      issueDate: quotation.issueDate,
      validUntil: quotation.validUntil,
      vatRate: String(quotation.vatRate),
      status: quotation.status,
      terms: quotation.terms,
      notes: quotation.notes,
    });

    setItems(quotation.items);

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingQuotationId(null);
    setForm(emptyForm);
    setItems([]);
  };

  const updateForm = <
    K extends keyof QuotationForm,
  >(
    field: K,
    value: QuotationForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleClientChange = (
    clientName: string,
  ) => {
    const selectedClient = clients.find(
      (client) =>
        client.name === clientName,
    );

    setForm((currentForm) => ({
      ...currentForm,
      clientName,
      clientEmail:
        selectedClient?.email || '',
      clientPhone:
        selectedClient?.phone || '',
      clientAddress:
        selectedClient?.address || '',
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
      title:
        currentForm.title ||
        selectedCase?.title ||
        '',
    }));
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id:
          Date.now() +
          currentItems.length,
        description: '',
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const updateItem = (
    id: number,
    field:
      | 'description'
      | 'quantity'
      | 'rate',
    value: string,
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === 'description'
                  ? value
                  : Math.max(
                      Number.parseFloat(value) ||
                        0,
                      0,
                    ),
            }
          : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    if (items.length === 1) {
      window.alert(
        'A quotation must contain at least one service.',
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id,
      ),
    );
  };

  const saveQuotation = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!form.quotationNumber.trim()) {
      window.alert(
        'Quotation number is required.',
      );
      return;
    }

    if (!form.clientName.trim()) {
      window.alert(
        'Client name is required.',
      );
      return;
    }

    if (!form.title.trim()) {
      window.alert(
        'Quotation subject is required.',
      );
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.description.trim() &&
        item.quantity > 0 &&
        item.rate >= 0,
    );

    if (validItems.length === 0) {
      window.alert(
        'Add at least one valid service item.',
      );
      return;
    }

    const calculatedSubtotal =
      roundCurrency(
        validItems.reduce(
          (total, item) =>
            total +
            item.quantity * item.rate,
          0,
        ),
      );

    const calculatedVatAmount =
      roundCurrency(
        calculatedSubtotal *
          (vatRate / 100),
      );

    const calculatedTotal =
      roundCurrency(
        calculatedSubtotal +
          calculatedVatAmount,
      );

    const now = new Date().toISOString();

    const quotationData = {
      quotationNumber:
        form.quotationNumber.trim(),
      clientName: form.clientName.trim(),
      clientEmail:
        form.clientEmail.trim(),
      clientPhone:
        form.clientPhone.trim(),
      clientAddress:
        form.clientAddress.trim(),
      relatedCase:
        form.relatedCase.trim(),
      title: form.title.trim(),
      issueDate: form.issueDate,
      validUntil: form.validUntil,
      items: validItems,
      subtotal: calculatedSubtotal,
      vatRate,
      vatAmount:
        calculatedVatAmount,
      totalAmount: calculatedTotal,
      status: form.status,
      terms: form.terms.trim(),
      notes: form.notes.trim(),
      updatedAt: now,
    };

    if (
      editingQuotationId !== null
    ) {
      setQuotations(
        (currentQuotations) =>
          currentQuotations.map(
            (quotation) =>
              quotation.id ===
              editingQuotationId
                ? {
                    ...quotation,
                    ...quotationData,
                  }
                : quotation,
          ),
      );
    } else {
      const newQuotation: QuotationRecord =
        {
          id: Date.now(),
          ...quotationData,
          createdAt: now,
        };

      setQuotations(
        (currentQuotations) => [
          newQuotation,
          ...currentQuotations,
        ],
      );
    }

    closeForm();
  };

  const copyQuotation = async (
    quotation: QuotationRecord,
  ) => {
    const quotationText =
      createQuotationText(quotation);

    try {
      await navigator.clipboard.writeText(
        quotationText,
      );

      window.alert(
        'Quotation copied to clipboard.',
      );
    } catch {
      const textArea =
        window.document.createElement(
          'textarea',
        );

      textArea.value = quotationText;

      window.document.body.appendChild(
        textArea,
      );

      textArea.select();
      window.document.execCommand('copy');

      window.document.body.removeChild(
        textArea,
      );

      window.alert(
        'Quotation copied to clipboard.',
      );
    }
  };

  const printQuotation = (
    quotation: QuotationRecord,
  ) => {
    const printWindow = window.open(
      '',
      '_blank',
      'width=900,height=700',
    );

    if (!printWindow) {
      window.alert(
        'Please allow pop-ups to print the quotation.',
      );
      return;
    }

    const itemRows = quotation.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(
              item.rate,
            )}</td>
            <td>${formatCurrency(
              item.quantity * item.rate,
            )}</td>
          </tr>
        `,
      )
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${quotation.quotationNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111827;
            }

            h1 {
              margin-bottom: 4px;
            }

            .header {
              border-bottom: 3px solid #d4af37;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 25px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
            }

            .totals {
              width: 320px;
              margin-left: auto;
              margin-top: 25px;
            }

            .totals p {
              display: flex;
              justify-content: space-between;
            }

            .total {
              font-size: 20px;
              font-weight: bold;
              border-top: 2px solid #111827;
              padding-top: 10px;
            }

            .section {
              margin-top: 30px;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <h1>SHAB Legal Consultants FZC</h1>
            <p>Professional Legal Services Quotation</p>
          </div>

          <div class="details">
            <div>
              <strong>Quotation:</strong>
              ${quotation.quotationNumber}
            </div>

            <div>
              <strong>Issue Date:</strong>
              ${formatDate(
                quotation.issueDate,
              )}
            </div>

            <div>
              <strong>Client:</strong>
              ${quotation.clientName}
            </div>

            <div>
              <strong>Valid Until:</strong>
              ${formatDate(
                quotation.validUntil,
              )}
            </div>

            <div>
              <strong>Email:</strong>
              ${quotation.clientEmail || '-'}
            </div>

            <div>
              <strong>Phone:</strong>
              ${quotation.clientPhone || '-'}
            </div>
          </div>

          <h2>${quotation.title}</h2>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="totals">
            <p>
              <span>Subtotal</span>
              <strong>${formatCurrency(
                quotation.subtotal,
              )}</strong>
            </p>

            <p>
              <span>VAT (${quotation.vatRate}%)</span>
              <strong>${formatCurrency(
                quotation.vatAmount,
              )}</strong>
            </p>

            <p class="total">
              <span>Total</span>
              <span>${formatCurrency(
                quotation.totalAmount,
              )}</span>
            </p>
          </div>

          <div class="section">
            <h3>Terms and Conditions</h3>
            <p>${quotation.terms || '-'}</p>
          </div>

          <div class="section">
            <h3>Notes</h3>
            <p>${quotation.notes || '-'}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const deleteQuotation = (
    id: number,
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this quotation?',
    );

    if (!confirmed) {
      return;
    }

    setQuotations(
      (currentQuotations) =>
        currentQuotations.filter(
          (quotation) =>
            quotation.id !== id,
        ),
    );
  };

  const statusClasses: Record<
    QuotationStatus,
    string
  > = {
    Draft: 'bg-gray-100 text-gray-700',
    Sent: 'bg-blue-100 text-blue-700',
    Accepted:
      'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Expired:
      'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quotations
          </h1>

          <p className="mt-1 text-gray-500">
            Prepare and track professional legal
            service quotations.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white shadow-sm hover:bg-amber-600"
        >
          <Plus className="h-5 w-5" />
          New Quotation
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total quotations
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {quotations.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total quoted
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900">
            {formatCurrency(totalQuoted)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Accepted value
          </p>

          <p className="mt-1 text-xl font-bold text-green-700">
            {formatCurrency(acceptedValue)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Awaiting decision
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {
              quotations.filter(
                (quotation) =>
                  quotation.status === 'Draft' ||
                  quotation.status === 'Sent',
              ).length
            }
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search quotations"
            className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | 'All'
                | QuotationStatus,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-amber-500"
        >
          <option value="All">
            All statuses
          </option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Accepted">
            Accepted
          </option>
          <option value="Rejected">
            Rejected
          </option>
          <option value="Expired">
            Expired
          </option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {filteredQuotations.map(
          (quotation) => (
            <article
              key={quotation.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl bg-amber-100 p-3">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {
                          quotation.quotationNumber
                        }
                      </h2>

                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {quotation.clientName}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {quotation.title}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[
                          quotation.status
                        ]
                      }`}
                    >
                      {quotation.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Subtotal
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatCurrency(
                          quotation.subtotal,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        VAT
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatCurrency(
                          quotation.vatAmount,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Total
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {formatCurrency(
                          quotation.totalAmount,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Services
                      </p>

                      <p className="mt-1 font-semibold">
                        {quotation.items.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-gray-700">
                        Case:
                      </span>{' '}
                      {quotation.relatedCase ||
                        'Not linked'}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Issue date:
                      </span>{' '}
                      {formatDate(
                        quotation.issueDate,
                      )}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Valid until:
                      </span>{' '}
                      {formatDate(
                        quotation.validUntil,
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyQuotation(quotation)
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                    >
                      <Clipboard className="h-4 w-4" />
                      Copy
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        printQuotation(quotation)
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(quotation)
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteQuotation(
                          quotation.id,
                        )
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
          ),
        )}

        {filteredQuotations.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-gray-500">
              No matching quotations found.
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
                  {editingQuotationId !==
                  null
                    ? 'Edit Quotation'
                    : 'Create Quotation'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add client details, services,
                  VAT and terms.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close quotation form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveQuotation}
              className="space-y-6 p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Quotation number *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      form.quotationNumber
                    }
                    onChange={(event) =>
                      updateForm(
                        'quotationNumber',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Client *
                  </label>

                  {clients.length > 0 ? (
                    <select
                      required
                      value={form.clientName}
                      onChange={(event) =>
                        handleClientChange(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    >
                      <option value="">
                        Select client
                      </option>

                      {clients.map(
                        (client) => (
                          <option
                            key={client.id}
                            value={client.name}
                          >
                            {client.name}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={form.clientName}
                      onChange={(event) =>
                        updateForm(
                          'clientName',
                          event.target.value,
                        )
                      }
                      placeholder="Client name"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(event) =>
                    updateForm(
                      'clientEmail',
                      event.target.value,
                    )
                  }
                  placeholder="Client email"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                />

                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={(event) =>
                    updateForm(
                      'clientPhone',
                      event.target.value,
                    )
                  }
                  placeholder="Client phone"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                />

                <input
                  type="text"
                  value={
                    form.clientAddress
                  }
                  onChange={(event) =>
                    updateForm(
                      'clientAddress',
                      event.target.value,
                    )
                  }
                  placeholder="Client address"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                />
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
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-500"
                  >
                    <option value="">
                      No linked case
                    </option>

                    {cases.map(
                      (caseItem) => (
                        <option
                          key={caseItem.id}
                          value={
                            caseItem.reference
                          }
                        >
                          {
                            caseItem.reference
                          }{' '}
                          — {caseItem.title}
                        </option>
                      ),
                    )}
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
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quotation subject *
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
                  placeholder="Legal services for civil case"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Issue date
                  </label>

                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(event) =>
                      updateForm(
                        'issueDate',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Valid until
                  </label>

                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(event) =>
                      updateForm(
                        'validUntil',
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
                          .value as QuotationStatus,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    <option value="Draft">
                      Draft
                    </option>
                    <option value="Sent">
                      Sent
                    </option>
                    <option value="Accepted">
                      Accepted
                    </option>
                    <option value="Rejected">
                      Rejected
                    </option>
                    <option value="Expired">
                      Expired
                    </option>
                  </select>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Services
                    </h3>

                    <p className="text-sm text-gray-500">
                      Add each professional
                      service separately.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {items.map(
                    (item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-700">
                            Service{' '}
                            {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id,
                              )
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={
                            item.description
                          }
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              'description',
                              event.target
                                .value,
                            )
                          }
                          placeholder="Describe the legal service"
                          className="mt-3 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                        />

                        <div className="mt-3 grid grid-cols-3 gap-3">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.id,
                                'quantity',
                                event.target
                                  .value,
                              )
                            }
                            placeholder="Qty"
                            className="rounded-xl border border-gray-300 px-3 py-3"
                          />

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.id,
                                'rate',
                                event.target
                                  .value,
                              )
                            }
                            placeholder="Rate"
                            className="rounded-xl border border-gray-300 px-3 py-3"
                          />

                          <div className="rounded-xl bg-gray-50 px-3 py-3">
                            <p className="text-xs text-gray-500">
                              Amount
                            </p>

                            <p className="font-semibold">
                              {formatCurrency(
                                item.quantity *
                                  item.rate,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    VAT rate %
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.vatRate}
                    onChange={(event) =>
                      updateForm(
                        'vatRate',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Subtotal
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatCurrency(
                        subtotal,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      VAT
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatCurrency(
                        vatAmount,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {formatCurrency(
                        totalAmount,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Terms and conditions
                </label>

                <textarea
                  rows={4}
                  value={form.terms}
                  onChange={(event) =>
                    updateForm(
                      'terms',
                      event.target.value,
                    )
                  }
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Additional notes"
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600"
                >
                  {editingQuotationId !==
                  null
                    ? 'Save Changes'
                    : 'Save Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}