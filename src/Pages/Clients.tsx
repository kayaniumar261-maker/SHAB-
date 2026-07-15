import {
  Building2,
  Mail,
  Pencil,
  Phone,
  Plus,
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

import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBar } from '../components/ui/SearchBar';
import { StatCard } from '../components/ui/StatCard';
import { Activity } from '../services/activityLogger';
import { Storage } from '../services/storage';
import { generateId } from '../utils/idGenerator';

type ClientType = 'Individual' | 'Company';

type ClientStatus =
  | 'Active'
  | 'Inactive'
  | 'Prospective';

type ClientRecord = {
  id: number;
  reference: string;
  name: string;
  type: ClientType;
  status: ClientStatus;
  phone: string;
  email: string;
  whatsapp: string;
  nationality: string;
  identification: string;
  tradeLicense: string;
  contactPerson: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type ClientForm = {
  name: string;
  type: ClientType;
  status: ClientStatus;
  phone: string;
  email: string;
  whatsapp: string;
  nationality: string;
  identification: string;
  tradeLicense: string;
  contactPerson: string;
  address: string;
  notes: string;
};

const emptyForm: ClientForm = {
  name: '',
  type: 'Individual',
  status: 'Active',
  phone: '',
  email: '',
  whatsapp: '',
  nationality: '',
  identification: '',
  tradeLicense: '',
  contactPerson: '',
  address: '',
  notes: '',
};

function normalizeClient(
  client: Partial<ClientRecord>,
): ClientRecord {
  const now = new Date().toISOString();

  return {
    id:
      typeof client.id === 'number'
        ? client.id
        : Date.now(),
    reference:
      typeof client.reference === 'string'
        ? client.reference
        : '',
    name:
      typeof client.name === 'string'
        ? client.name
        : '',
    type:
      client.type === 'Company'
        ? 'Company'
        : 'Individual',
    status:
      client.status === 'Inactive' ||
      client.status === 'Prospective'
        ? client.status
        : 'Active',
    phone:
      typeof client.phone === 'string'
        ? client.phone
        : '',
    email:
      typeof client.email === 'string'
        ? client.email
        : '',
    whatsapp:
      typeof client.whatsapp === 'string'
        ? client.whatsapp
        : '',
    nationality:
      typeof client.nationality === 'string'
        ? client.nationality
        : '',
    identification:
      typeof client.identification === 'string'
        ? client.identification
        : '',
    tradeLicense:
      typeof client.tradeLicense === 'string'
        ? client.tradeLicense
        : '',
    contactPerson:
      typeof client.contactPerson === 'string'
        ? client.contactPerson
        : '',
    address:
      typeof client.address === 'string'
        ? client.address
        : '',
    notes:
      typeof client.notes === 'string'
        ? client.notes
        : '',
    createdAt:
      typeof client.createdAt === 'string'
        ? client.createdAt
        : now,
    updatedAt:
      typeof client.updatedAt === 'string'
        ? client.updatedAt
        : now,
  };
}

function loadClients(): ClientRecord[] {
  const savedClients =
    Storage.getClients<
      Partial<ClientRecord>
    >();

  return savedClients.map(
    normalizeClient,
  );
}

export function Clients() {
  const [clients, setClients] =
    useState<ClientRecord[]>(
      loadClients,
    );

  const [searchTerm, setSearchTerm] =
    useState('');

  const [typeFilter, setTypeFilter] =
    useState<'All' | ClientType>(
      'All',
    );

  const [statusFilter, setStatusFilter] =
    useState<
      'All' | ClientStatus
    >('All');

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [
    editingClientId,
    setEditingClientId,
  ] = useState<number | null>(null);

  const [form, setForm] =
    useState<ClientForm>(emptyForm);

  useEffect(() => {
    const saved =
      Storage.saveClients(clients);

    if (!saved) {
      window.alert(
        'Client data could not be saved because browser storage may be full.',
      );
    }
  }, [clients]);

  useEffect(() => {
    const refreshClients = (
      event: Event,
    ) => {
      if (
        event instanceof CustomEvent &&
        event.detail?.key &&
        event.detail.key !==
          'clients'
      ) {
        return;
      }

      setClients(loadClients());
    };

    window.addEventListener(
      'shab-storage-updated',
      refreshClients,
    );

    window.addEventListener(
      'storage',
      refreshClients,
    );

    return () => {
      window.removeEventListener(
        'shab-storage-updated',
        refreshClients,
      );

      window.removeEventListener(
        'storage',
        refreshClients,
      );
    };
  }, []);

  const filteredClients =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return [...clients]
        .sort((first, second) =>
          first.name.localeCompare(
            second.name,
          ),
        )
        .filter((client) => {
          const matchesType =
            typeFilter === 'All' ||
            client.type === typeFilter;

          const matchesStatus =
            statusFilter === 'All' ||
            client.status ===
              statusFilter;

          const matchesSearch =
            !search ||
            [
              client.reference,
              client.name,
              client.type,
              client.status,
              client.phone,
              client.email,
              client.whatsapp,
              client.nationality,
              client.identification,
              client.tradeLicense,
              client.contactPerson,
              client.address,
              client.notes,
            ]
              .join(' ')
              .toLowerCase()
              .includes(search);

          return (
            matchesType &&
            matchesStatus &&
            matchesSearch
          );
        });
    }, [
      clients,
      searchTerm,
      typeFilter,
      statusFilter,
    ]);

  const totalCompanies =
    clients.filter(
      (client) =>
        client.type === 'Company',
    ).length;

  const totalIndividuals =
    clients.filter(
      (client) =>
        client.type === 'Individual',
    ).length;

  const activeClients =
    clients.filter(
      (client) =>
        client.status === 'Active',
    ).length;

  const openAddForm = () => {
    setEditingClientId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (
    client: ClientRecord,
  ) => {
    setEditingClientId(client.id);

    setForm({
      name: client.name,
      type: client.type,
      status: client.status,
      phone: client.phone,
      email: client.email,
      whatsapp: client.whatsapp,
      nationality:
        client.nationality,
      identification:
        client.identification,
      tradeLicense:
        client.tradeLicense,
      contactPerson:
        client.contactPerson,
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

  const updateForm = <
    K extends keyof ClientForm,
  >(
    field: K,
    value: ClientForm[K],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveClient = (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert(
        'Client name is required.',
      );

      return;
    }

    const now =
      new Date().toISOString();

    const clientData = {
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      phone: form.phone.trim(),
      email: form.email.trim(),
      whatsapp:
        form.whatsapp.trim(),
      nationality:
        form.nationality.trim(),
      identification:
        form.identification.trim(),
      tradeLicense:
        form.tradeLicense.trim(),
      contactPerson:
        form.contactPerson.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
      updatedAt: now,
    };

    if (
      editingClientId !== null
    ) {
      const existingClient =
        clients.find(
          (client) =>
            client.id ===
            editingClientId,
        );

      if (!existingClient) {
        window.alert(
          'The selected client could not be found.',
        );

        return;
      }

      const updatedClient:
        ClientRecord = {
        ...existingClient,
        ...clientData,
      };

      setClients(
        (currentClients) =>
          currentClients.map(
            (client) =>
              client.id ===
              editingClientId
                ? updatedClient
                : client,
          ),
      );

      Activity.add(
        'Client',
        'Client Updated',
        `${updatedClient.name} was updated.`,
        updatedClient.reference,
      );
    } else {
      const newClient:
        ClientRecord = {
        id: Date.now(),
        reference:
          generateId('CLI'),
        ...clientData,
        createdAt: now,
      };

      setClients(
        (currentClients) => [
          newClient,
          ...currentClients,
        ],
      );

      Activity.add(
        'Client',
        'New Client Created',
        `${newClient.name} was added to the client database.`,
        newClient.reference,
      );
    }

    closeForm();
  };

  const deleteClient = (
    client: ClientRecord,
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${client.name}? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setClients(
      (currentClients) =>
        currentClients.filter(
          (currentClient) =>
            currentClient.id !==
            client.id,
        ),
    );

    Activity.add(
      'Client',
      'Client Deleted',
      `${client.name} was removed from the client database.`,
      client.reference,
    );
  };

  const statusClasses:
    Record<ClientStatus, string> = {
    Active:
      'bg-green-100 text-green-700',
    Inactive:
      'bg-gray-100 text-gray-700',
    Prospective:
      'bg-blue-100 text-blue-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-6">
      <PageHeader
        title="Clients"
        subtitle="Manage individual and corporate client records."
        action={
          <button
            type="button"
            onClick={openAddForm}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 font-semibold text-black shadow-sm hover:bg-[#b89536]"
          >
            <Plus className="h-5 w-5" />
            Add Client
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Clients"
          value={clients.length}
        />

        <StatCard
          label="Active"
          value={activeClients}
          color="text-green-700"
        />

        <StatCard
          label="Companies"
          value={totalCompanies}
          color="text-[#B89536]"
        />

        <StatCard
          label="Individuals"
          value={totalIndividuals}
          color="text-blue-700"
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search clients"
        />

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(
              event.target
                .value as
                | 'All'
                | ClientType,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-[#C9A84C]"
        >
          <option value="All">
            All client types
          </option>

          <option value="Individual">
            Individuals
          </option>

          <option value="Company">
            Companies
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as
                | 'All'
                | ClientStatus,
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

          <option value="Prospective">
            Prospective
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredClients.map(
          (client) => {
            const Icon =
              client.type ===
              'Company'
                ? Building2
                : User;

            return (
              <article
                key={client.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#C9A84C]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="shrink-0 rounded-xl bg-[#111111] p-3">
                      <Icon className="h-6 w-6 text-[#C9A84C]" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-gray-900">
                        {client.name}
                      </h2>

                      <p className="mt-1 truncate text-xs font-semibold text-[#B89536]">
                        {client.reference ||
                          'Legacy client'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(
                          client,
                        )
                      }
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      aria-label={`Edit ${client.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteClient(
                          client,
                        )
                      }
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label={`Delete ${client.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-[#B89536]">
                    {client.type}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClasses[
                        client.status
                      ]
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-gray-600">
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-2 hover:text-[#B89536]"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>
                        {client.phone}
                      </span>
                    </a>
                  )}

                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="flex items-center gap-2 hover:text-[#B89536]"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-gray-400" />

                      <span className="truncate">
                        {client.email}
                      </span>
                    </a>
                  )}

                  {client.contactPerson && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Contact:
                      </span>{' '}
                      {
                        client.contactPerson
                      }
                    </p>
                  )}

                  {client.nationality && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Nationality:
                      </span>{' '}
                      {
                        client.nationality
                      }
                    </p>
                  )}

                  {client.identification && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Identification:
                      </span>{' '}
                      {
                        client.identification
                      }
                    </p>
                  )}

                  {client.tradeLicense && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Trade licence:
                      </span>{' '}
                      {
                        client.tradeLicense
                      }
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
                    <p className="rounded-xl bg-gray-50 p-3 leading-6">
                      {client.notes}
                    </p>
                  )}
                </div>
              </article>
            );
          },
        )}
      </div>

      {filteredClients.length ===
        0 && (
        <div className="mt-6">
          <EmptyState message="No matching clients found." />
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingClientId !==
                  null
                    ? 'Edit Client'
                    : 'Add Client'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the client’s
                  contact and identification
                  details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close client form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveClient}
              className="space-y-5 p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Client type
                  </label>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      updateForm(
                        'type',
                        event.target
                          .value as ClientType,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Individual">
                      Individual
                    </option>

                    <option value="Company">
                      Company
                    </option>
                  </select>
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
                          .value as ClientStatus,
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Prospective">
                      Prospective
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {form.type ===
                  'Company'
                    ? 'Company name *'
                    : 'Client name *'}
                </label>

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder={
                    form.type ===
                    'Company'
                      ? 'Company legal name'
                      : 'Full name'
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              {form.type ===
                'Company' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Contact person
                    </label>

                    <input
                      type="text"
                      value={
                        form.contactPerson
                      }
                      onChange={(event) =>
                        updateForm(
                          'contactPerson',
                          event.target
                            .value,
                        )
                      }
                      placeholder="Primary contact"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Trade licence
                    </label>

                    <input
                      type="text"
                      value={
                        form.tradeLicense
                      }
                      onChange={(event) =>
                        updateForm(
                          'tradeLicense',
                          event.target
                            .value,
                        )
                      }
                      placeholder="Trade licence number"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm(
                        'phone',
                        event.target.value,
                      )
                    }
                    placeholder="+971"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    WhatsApp
                  </label>

                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(event) =>
                      updateForm(
                        'whatsapp',
                        event.target.value,
                      )
                    }
                    placeholder="+971"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm(
                      'email',
                      event.target.value,
                    )
                  }
                  placeholder="client@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nationality
                  </label>

                  <input
                    type="text"
                    value={
                      form.nationality
                    }
                    onChange={(event) =>
                      updateForm(
                        'nationality',
                        event.target.value,
                      )
                    }
                    placeholder="Nationality"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Identification
                  </label>

                  <input
                    type="text"
                    value={
                      form.identification
                    }
                    onChange={(event) =>
                      updateForm(
                        'identification',
                        event.target.value,
                      )
                    }
                    placeholder="Emirates ID or passport"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    updateForm(
                      'address',
                      event.target.value,
                    )
                  }
                  placeholder="Complete address"
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Internal notes
                </label>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Client background or internal notes"
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
                  {editingClientId !==
                  null
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