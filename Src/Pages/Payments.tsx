import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type PaymentStatus =
  | 'Pending'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

type PaymentMethod =
  | 'Bank Transfer'
  | 'Cash'
  | 'Card'
  | 'Cheque'
  | 'Online'
  | 'Other';

type StoredClient = {
  id: number;
  name: string;
};

type StoredCase = {
  id: number;
  title: string;
  reference: string;
  client?: string;
};

type PaymentRecord = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  relatedCase: string;
  description: string;
  subtotal: number;
  vatRate: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  issueDate: string;
  dueDate: string;
  paidDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type PaymentForm = {
  invoiceNumber: string;
  clientName: string;
  relatedCase: string;
  description: string;
  subtotal: string;
  vatRate: string;
  amountPaid: string;
  issueDate: string;
  dueDate: string;
  paidDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: PaymentStatus;
  notes: string;
};

const PAYMENTS_STORAGE_KEY = 'shab-payments';
const CLIENTS_STORAGE_KEY = 'shab-clients';
const CASES_STORAGE_KEY = 'shab-cases';

const emptyForm: PaymentForm = {
  invoiceNumber: '',
  clientName: '',
  relatedCase: '',
  description: '',
  subtotal: '',
  vatRate: '5',
  amountPaid: '0',
  issueDate: '',
  dueDate: '',
  paidDate: '',
  paymentMethod: 'Bank Transfer',
  transactionReference: '',
  status: 'Pending',
  notes: '',
};

function loadPayments(): PaymentRecord[] {
  try {
    const savedPayments = window.localStorage.getItem(
      PAYMENTS_STORAGE_KEY,
    );

    if (!savedPayments) {
      return [];
    }

    const parsedPayments = JSON.parse(savedPayments);

    return Array.isArray(parsedPayments)
      ? parsedPayments
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
  const month = String(date.getMonth() + 1).padStart(
    2,
    '0',
  );
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDaysToDate(
  dateValue: string,
  days: number,
): string {
  const date = dateValue
    ? new Date(`${dateValue}T00:00:00`)
    : new Date();

  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    '0',
  );
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function generateInvoiceNumber(
  paymentCount: number,
): string {
  return `SHAB-INV-${new Date().getFullYear()}-${String(
    paymentCount + 1,
  ).padStart(3, '0')}`;
}

function toNumber(value: string): number {
  const numberValue = Number.parseFloat(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB');
}

function calculateStatus(
  currentStatus: PaymentStatus,
  totalAmount: number,
  amountPaid: number,
  dueDate: string,
): PaymentStatus {
  if (currentStatus === 'Cancelled') {
    return 'Cancelled';
  }

  if (totalAmount > 0 && amountPaid >= totalAmount) {
    return 'Paid';
  }

  if (amountPaid > 0 && amountPaid < totalAmount) {
    return 'Partially Paid';
  }

  if (
    dueDate &&
    dueDate < getLocalDate() &&
    amountPaid < totalAmount
  ) {
    return 'Overdue';
  }

  return 'Pending';
}

export function Payments() {
  const [payments, setPayments] =
    useState<PaymentRecord[]>(loadPayments);

  const [clients, setClients] =
    useState<StoredClient[]>(loadClients);

  const [cases, setCases] =
    useState<StoredCase[]>(loadCases);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'All' | PaymentStatus>('All');

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingPaymentId, setEditingPaymentId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<PaymentForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      PAYMENTS_STORAGE_KEY,
      JSON.stringify(payments),
    );
  }, [payments]);

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

  const filteredPayments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return [...payments]
      .sort((firstPayment, secondPayment) =>
        secondPayment.updatedAt.localeCompare(
          firstPayment.updatedAt,
        ),
      )
      .filter((payment) => {
        const matchesStatus =
          statusFilter === 'All' ||
          payment.status === statusFilter;

        const matchesSearch =
          !search ||
          [
            payment.invoiceNumber,
            payment.clientName,
            payment.relatedCase,
            payment.description,
            payment.status,
            payment.paymentMethod,
            payment.transactionReference,
            payment.notes,
          ]
            .join(' ')
            .toLowerCase()
            .includes(search);

        return matchesStatus && matchesSearch;
      });
  }, [payments, searchTerm, statusFilter]);

  const totalBilled = useMemo(
    () =>
      roundCurrency(
        payments
          .filter(
            (payment) =>
              payment.status !== 'Cancelled',
          )
          .reduce(
            (total, payment) =>
              total + payment.totalAmount,
            0,
          ),
      ),
    [payments],
  );

  const totalCollected = useMemo(
    () =>
      roundCurrency(
        payments
          .filter(
            (payment) =>
              payment.status !== 'Cancelled',
          )
          .reduce(
            (total, payment) =>
              total + payment.amountPaid,
            0,
          ),
      ),
    [payments],
  );

  const totalOutstanding = useMemo(
    () =>
      roundCurrency(
        payments
          .filter(
            (payment) =>
              payment.status !== 'Cancelled',
          )
          .reduce(
            (total, payment) =>
              total + payment.balance,
            0,
          ),
      ),
    [payments],
  );

  const overdueCount = useMemo(
    () =>
      payments.filter(
        (payment) => payment.status === 'Overdue',
      ).length,
    [payments],
  );

  const previewSubtotal = toNumber(form.subtotal);
  const previewVatRate = toNumber(form.vatRate);
  const previewVatAmount = roundCurrency(
    previewSubtotal * (previewVatRate / 100),
  );
  const previewTotal = roundCurrency(
    previewSubtotal + previewVatAmount,
  );
  const previewPaid = toNumber(form.amountPaid);
  const previewBalance = roundCurrency(
    Math.max(previewTotal - previewPaid, 0),
  );

  const openAddForm = () => {
    const today = getLocalDate();

    setEditingPaymentId(null);

    setForm({
      ...emptyForm,
      invoiceNumber: generateInvoiceNumber(
        payments.length,
      ),
      clientName: clients[0]?.name || '',
      issueDate: today,
      dueDate: addDaysToDate(today, 15),
    });

    setIsFormOpen(true);
  };

  const openEditForm = (
    payment: PaymentRecord,
  ) => {
    setEditingPaymentId(payment.id);

    setForm({
      invoiceNumber: payment.invoiceNumber,
      clientName: payment.clientName,
      relatedCase: payment.relatedCase,
      description: payment.description,
      subtotal: String(payment.subtotal),
      vatRate: String(payment.vatRate),
      amountPaid: String(payment.amountPaid),
      issueDate: payment.issueDate,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate,
      paymentMethod: payment.paymentMethod,
      transactionReference:
        payment.transactionReference,
      status: payment.status,
      notes: payment.notes,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPaymentId(null);
    setForm(emptyForm);
  };

  const updateForm = <
    K extends keyof PaymentForm,
  >(
    field: K,
    value: PaymentForm[K],
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
      description:
        currentForm.description ||
        selectedCase?.title ||
        '',
    }));
  };

  const savePayment = (event: FormEvent) => {
    event.preventDefault();

    if (!form.invoiceNumber.trim()) {
      window.alert(
        'Invoice or payment reference is required.',
      );
      return;
    }

    if (!form.clientName.trim()) {
      window.alert('Client name is required.');
      return;
    }

    if (previewSubtotal <= 0) {
      window.alert(
        'The service amount must be greater than zero.',
      );
      return;
    }

    if (previewPaid < 0) {
      window.alert(
        'The amount paid cannot be negative.',
      );
      return;
    }

    if (previewPaid > previewTotal) {
      window.alert(
        'The amount paid cannot exceed the total amount.',
      );
      return;
    }

    const calculatedStatus = calculateStatus(
      form.status,
      previewTotal,
      previewPaid,
      form.dueDate,
    );

    const paidDate =
      calculatedStatus === 'Paid'
        ? form.paidDate || getLocalDate()
        : form.paidDate;

    const now = new Date().toISOString();

    const paymentData = {
      invoiceNumber: form.invoiceNumber.trim(),
      clientName: form.clientName.trim(),
      relatedCase: form.relatedCase.trim(),
      description: form.description.trim(),
      subtotal: roundCurrency(previewSubtotal),
      vatRate: roundCurrency(previewVatRate),
      totalAmount: previewTotal,
      amountPaid: roundCurrency(previewPaid),
      balance: previewBalance,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      paidDate,
      paymentMethod: form.paymentMethod,
      transactionReference:
        form.transactionReference.trim(),
      status: calculatedStatus,
      notes: form.notes.trim(),
      updatedAt: now,
    };

    if (editingPaymentId !== null) {
      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === editingPaymentId
            ? {
                ...payment,
                ...paymentData,
              }
            : payment,
        ),
      );
    } else {
      const newPayment: PaymentRecord = {
        id: Date.now(),
        ...paymentData,
        createdAt: now,
      };

      setPayments((currentPayments) => [
        newPayment,
        ...currentPayments,
      ]);
    }

    closeForm();
  };

  const deletePayment = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this payment record?',
    );

    if (!confirmed) {
      return;
    }

    setPayments((currentPayments) =>
      currentPayments.filter(
        (payment) => payment.id !== id,
      ),
    );
  };

  const statusClasses: Record<
    PaymentStatus,
    string
  > = {
    Pending: 'bg-yellow-100 text-yellow-700',
    'Partially Paid':
      'bg-blue-100 text-blue-700',
    Paid: 'bg-green-100 text-green-700',
    Overdue: 'bg-red-100 text-red-700',
    Cancelled: 'bg-gray-100 text-gray-700',
  };

  const paymentMethodIcon = (
    method: PaymentMethod,
  ) => {
    if (method === 'Cash') {
      return Banknote;
    }

    if (
      method === 'Card' ||
      method === 'Online'
    ) {
      return CreditCard;
    }

    return Wallet;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payments
          </h1>

          <p className="mt-1 text-gray-500">
            Track professional fees, collections and
            outstanding balances.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          <Plus className="h-5 w-5" />
          Add Payment
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total billed
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(totalBilled)}
              </p>
            </div>

            <Receipt className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Collected
              </p>

              <p className="mt-1 text-xl font-bold text-green-700">
                {formatCurrency(totalCollected)}
              </p>
            </div>

            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Outstanding
              </p>

              <p className="mt-1 text-xl font-bold text-red-700">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>

            <Clock3 className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Overdue records
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {overdueCount}
              </p>
            </div>

            <CalendarDays className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_190px]">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search payments"
            className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | 'All'
                | PaymentStatus,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-teal-500"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Partially Paid">
            Partially Paid
          </option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">
            Cancelled
          </option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {filteredPayments.map((payment) => {
          const MethodIcon = paymentMethodIcon(
            payment.paymentMethod,
          );

          return (
            <article
              key={payment.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl bg-teal-100 p-3">
                  <MethodIcon className="h-6 w-6 text-teal-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-gray-900">
                        {payment.invoiceNumber}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {payment.clientName}
                      </p>

                      {payment.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {payment.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[payment.status]
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Total
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {formatCurrency(
                          payment.totalAmount,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Paid
                      </p>

                      <p className="mt-1 font-semibold text-green-700">
                        {formatCurrency(
                          payment.amountPaid,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Balance
                      </p>

                      <p className="mt-1 font-semibold text-red-700">
                        {formatCurrency(
                          payment.balance,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        VAT
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {payment.vatRate}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-gray-700">
                        Case:
                      </span>{' '}
                      {payment.relatedCase ||
                        'Not linked'}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Method:
                      </span>{' '}
                      {payment.paymentMethod}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Issued:
                      </span>{' '}
                      {formatDate(payment.issueDate)}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">
                        Due:
                      </span>{' '}
                      {formatDate(payment.dueDate)}
                    </p>

                    {payment.transactionReference && (
                      <p className="sm:col-span-2">
                        <span className="font-medium text-gray-700">
                          Transaction reference:
                        </span>{' '}
                        {payment.transactionReference}
                      </p>
                    )}
                  </div>

                  {payment.notes && (
                    <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                      {payment.notes}
                    </p>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(payment)
                      }
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deletePayment(payment.id)
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

        {filteredPayments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Receipt className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-gray-500">
              No matching payment records found.
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
                  {editingPaymentId !== null
                    ? 'Edit Payment'
                    : 'Add Payment'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Record fees, VAT, payments and
                  outstanding balances.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close payment form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={savePayment}
              className="space-y-5 p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="payment-reference"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Invoice or payment reference *
                  </label>

                  <input
                    id="payment-reference"
                    type="text"
                    required
                    value={form.invoiceNumber}
                    onChange={(event) =>
                      updateForm(
                        'invoiceNumber',
                        event.target.value,
                      )
                    }
                    placeholder="SHAB-INV-2026-001"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payment-client"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Client *
                  </label>

                  {clients.length > 0 ? (
                    <select
                      id="payment-client"
                      required
                      value={form.clientName}
                      onChange={(event) =>
                        updateForm(
                          'clientName',
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
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
                      id="payment-client"
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
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="payment-case"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Related case
                </label>

                {cases.length > 0 ? (
                  <select
                    id="payment-case"
                    value={form.relatedCase}
                    onChange={(event) =>
                      handleCaseChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
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
                    id="payment-case"
                    type="text"
                    value={form.relatedCase}
                    onChange={(event) =>
                      updateForm(
                        'relatedCase',
                        event.target.value,
                      )
                    }
                    placeholder="Case reference"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="payment-description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Service description
                </label>

                <input
                  id="payment-description"
                  type="text"
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      'description',
                      event.target.value,
                    )
                  }
                  placeholder="Legal consultation, case filing or retainer fee"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="payment-subtotal"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Service amount *
                  </label>

                  <input
                    id="payment-subtotal"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.subtotal}
                    onChange={(event) =>
                      updateForm(
                        'subtotal',
                        event.target.value,
                      )
                    }
                    placeholder="10000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payment-vat"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    VAT rate %
                  </label>

                  <input
                    id="payment-vat"
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
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payment-paid"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Amount received
                  </label>

                  <input
                    id="payment-paid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amountPaid}
                    onChange={(event) =>
                      updateForm(
                        'amountPaid',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Subtotal
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatCurrency(
                      previewSubtotal,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    VAT
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatCurrency(
                      previewVatAmount,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Total
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {formatCurrency(previewTotal)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Balance
                  </p>

                  <p className="mt-1 font-semibold text-red-700">
                    {formatCurrency(
                      previewBalance,
                    )}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="payment-issue-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Issue date
                  </label>

                  <input
                    id="payment-issue-date"
                    type="date"
                    value={form.issueDate}
                    onChange={(event) =>
                      updateForm(
                        'issueDate',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payment-due-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Due date
                  </label>

                  <input
                    id="payment-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm(
                        'dueDate',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payment-paid-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Payment date
                  </label>

                  <input
                    id="payment-paid-date"
                    type="date"
                    value={form.paidDate}
                    onChange={(event) =>
                      updateForm(
                        'paidDate',
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="payment-method"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Payment method
                  </label>

                  <select
                    id="payment-method"
                    value={form.paymentMethod}
                    onChange={(event) =>
                      updateForm(
                        'paymentMethod',
                        event.target
                          .value as PaymentMethod,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                    <option value="Cash">
                      Cash
                    </option>
                    <option value="Card">
                      Card
                    </option>
                    <option value="Cheque">
                      Cheque
                    </option>
                    <option value="Online">
                      Online
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="payment-status"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="payment-status"
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        'status',
                        event.target
                          .value as PaymentStatus,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Partially Paid">
                      Partially Paid
                    </option>
                    <option value="Paid">
                      Paid
                    </option>
                    <option value="Overdue">
                      Overdue
                    </option>
                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="payment-transaction-reference"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Bank, cheque or transaction reference
                </label>

                <input
                  id="payment-transaction-reference"
                  type="text"
                  value={form.transactionReference}
                  onChange={(event) =>
                    updateForm(
                      'transactionReference',
                      event.target.value,
                    )
                  }
                  placeholder="Transfer reference or cheque number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-notes"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="payment-notes"
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Instalment terms, collection notes or internal remarks"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
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
                  className="flex-1 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
                >
                  {editingPaymentId !== null
                    ? 'Save Changes'
                    : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}