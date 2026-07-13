import {
  Building2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ClientType = 'Individual' | 'Company';

type Client = {
  id: number;
  name: string;
  type: ClientType;
  phone: string;
  email: string;
  nationality: string;
  identification: string;
  address: string;
  notes: string;
};

type ClientForm = Omit<Client, 'id'>;

const CLIENTS_STORAGE_KEY = 'shab-clients';

const emptyForm: ClientForm = {
  name: '',
  type: 'Individual',
  phone: '',
  email: '',
  nationality: '',
  identification: '',
  address: '',
  notes: '',
};

const initialClients: Client[] = [
  {
    id: 1,
    name: 'ABC Trading LLC',
    type: 'Company',
    phone: '+971 50 123 4567',
    email: 'accounts@abctrading.ae',
    nationality: 'UAE',
    identification: 'Trade Licence: 123456',
    address: 'Dubai, United Arab Emirates',
    notes: 'Commercial dispute client',
  },
  {
    id: 2,
    name: 'Mohammed Ali',
    type: 'Individual',
    phone: '+971 55 987 6543',
    email: 'mohammed@example.com',
    nationality: 'Pakistan',
    identification: 'Emirates ID on file',
    address: 'Sharjah, United Arab Emirates',
    notes: 'Labour matter',
  },
];

function loadClients(): Client[] {
  try {
    const savedClients = window.localStorage.getItem(
      CLIENTS_STORAGE_KEY,
    );

    if (!savedClients) {
      return initialClients;
    }

    const parsedClients = JSON.parse(savedClients);

    if (!Array.isArray(parsedClients)) {
      return initialClients;
    }

    return parsedClients.map((client) => ({
      id: client.id,
      name: client.name || '',
      type:
        client.type === 'Company'
          ? 'Company'
          : 'Individual',
      phone: client.phone || '',
      email: client.email || '',
      nationality: client.nationality || '',
      identification: client.identification || '',
      address: client.address || '',
      notes: client.notes || '',
    }));
  } catch {
    return initialClients;
  }
}

export function Clients() {
  const [clients, setClients] =
    useState<Client[]>(loadClients);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<ClientForm>(emptyForm);

  useEffect(() => {
    window.localStorage.setItem(
      CLIENTS_STORAGE_KEY,
      JSON.stringify(clients),
    );
  }, [clients]);

  const filteredClients = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.name,
        client.type,
        client.phone,
        client.email,
        client.nationality,
        client.identification,
        client.address,
        client.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [clients, searchTerm]);

  const openAddForm = () => {
    setEditingClientId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (client: Client) => {
    setEditingClientId(client.id);

    setForm({
      name: client.name,
      type: client.type,
      phone: client.phone,
      email: client.email,
      nationality: client.nationality,
      identification: client.identification,
      address: client.address,
      notes: client.notes,
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingClientId(null);
    setForm(emptyForm);
  };

  const updateForm = (
    field: keyof ClientForm,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveClient = (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert('Client name is required.');
      return;
    }

    if (editingClientId !== null) {
      setClients((currentClients) =>
        currentClients.map((client) =>
          client.id === editingClientId
            ? {
                ...client,
                ...form,
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                nationality: form.nationality.trim(),
                identification:
                  form.identification.trim(),
                address: form.address.trim(),
                notes: form.notes.trim(),
              }
            : client,
        ),
      );
    } else {
      const newClient: Client = {
        id: Date.now(),
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        nationality: form.nationality.trim(),
        identification:
          form.identification.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      };

      setClients((currentClients) => [
        newClient,
        ...currentClients,
      ]);
    }

    closeForm();
  };

  const deleteClient = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this client?',
    );

    if (!confirmed) {
      return;
    }

    setClients((currentClients) =>
      currentClients.filter(
        (client) => client.id !== id,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Clients
          </h1>

          <p className="mt-1 text-gray-500">
            Manage individual and corporate client records.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Client
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
          placeholder="Search clients"
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredClients.map((client) => {
          const Icon =
            client.type === 'Company'
              ? Building2
              : User;

          return (
            <article
              key={client.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <div className="shrink-0 rounded-xl bg-blue-100 p-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">
                      {client.name}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {client.type}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(client)
                    }
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    aria-label="Edit client"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteClient(client.id)
                    }
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label="Delete client"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{client.phone}</span>
                  </a>
                )}

                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />

                    <span className="truncate">
                      {client.email}
                    </span>
                  </a>
                )}

                {client.nationality && (
                  <p>
                    <span className="font-medium text-gray-700">
                      Nationality:
                    </span>{' '}
                    {client.nationality}
                  </p>
                )}

                {client.identification && (
                  <p>
                    <span className="font-medium text-gray-700">
                      ID:
                    </span>{' '}
                    {client.identification}
                  </p>
                )}

                {client.address && (
                  <p>
                    <span className="font-medium text-gray-700">
                      Address:
                    </span>{' '}
                    {client.address}
                  </p>
                )}

                {client.notes && (
                  <p className="rounded-xl bg-gray-50 p-3">
                    {client.notes}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          No matching clients found.
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingClientId !== null
                    ? 'Edit Client'
                    : 'Add Client'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the client&apos;s complete details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveClient}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Client type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {(['Individual', 'Company'] as ClientType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          updateForm('type', type)
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                          form.type === type
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="client-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Client name *
                </label>

                <input
                  id="client-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder="Full name or company name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="client-phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone
                  </label>

                  <input
                    id="client-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm(
                        'phone',
                        event.target.value,
                      )
                    }
                    placeholder="+971 50 000 0000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="client-email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="client-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        'email',
                        event.target.value,
                      )
                    }
                    placeholder="client@email.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="client-nationality"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Nationality / Country
                  </label>

                  <input
                    id="client-nationality"
                    type="text"
                    value={form.nationality}
                    onChange={(event) =>
                      updateForm(
                        'nationality',
                        event.target.value,
                      )
                    }
                    placeholder="UAE"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="client-identification"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Emirates ID / Passport / Licence
                  </label>

                  <input
                    id="client-identification"
                    type="text"
                    value={form.identification}
                    onChange={(event) =>
                      updateForm(
                        'identification',
                        event.target.value,
                      )
                    }
                    placeholder="Identification details"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="client-address"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Address
                </label>

                <textarea
                  id="client-address"
                  rows={2}
                  value={form.address}
                  onChange={(event) =>
                    updateForm(
                      'address',
                      event.target.value,
                    )
                  }
                  placeholder="Client address"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="client-notes"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="client-notes"
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Case background, referral source or other notes"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editingClientId !== null
                    ? 'Save Changes'
                    : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}