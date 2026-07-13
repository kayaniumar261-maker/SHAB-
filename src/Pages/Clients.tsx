import { Building2, Mail, Phone, Plus, Search, User } from 'lucide-react';
import { useMemo, useState } from 'react';

type ClientType = 'Individual' | 'Company';

type Client = {
  id: number;
  name: string;
  type: ClientType;
  phone: string;
  email: string;
  nationality: string;
  notes: string;
};

const initialClients: Client[] = [
  {
    id: 1,
    name: 'ABC Trading LLC',
    type: 'Company',
    phone: '+971 50 123 4567',
    email: 'accounts@abctrading.ae',
    nationality: 'UAE',
    notes: 'Commercial dispute client',
  },
  {
    id: 2,
    name: 'Mohammed Ali',
    type: 'Individual',
    phone: '+971 55 987 6543',
    email: 'mohammed@example.com',
    nationality: 'Pakistan',
    notes: 'Labour matter',
  },
];

export function Clients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');

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
        client.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [clients, searchTerm]);

  const addClient = () => {
    const name = window.prompt('Enter client name');

    if (!name?.trim()) {
      return;
    }

    const typeInput =
      window.prompt('Enter client type: Individual or Company')?.trim() ||
      'Individual';

    const type: ClientType =
      typeInput.toLowerCase() === 'company' ? 'Company' : 'Individual';

    const phone = window.prompt('Enter phone number')?.trim() || '';
    const email = window.prompt('Enter email address')?.trim() || '';
    const nationality =
      window.prompt('Enter nationality or country')?.trim() || '';
    const notes = window.prompt('Enter client notes')?.trim() || '';

    setClients((currentClients) => [
      {
        id: Date.now(),
        name: name.trim(),
        type,
        phone,
        email,
        nationality,
        notes,
      },
      ...currentClients,
    ]);
  };

  const deleteClient = (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this client?',
    );

    if (!confirmed) {
      return;
    }

    setClients((currentClients) =>
      currentClients.filter((client) => client.id !== id),
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-gray-500">
            Manage individual and corporate client records.
          </p>
        </div>

        <button
          type="button"
          onClick={addClient}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
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
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search clients"
          className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredClients.map((client) => {
          const Icon = client.type === 'Company' ? Building2 : User;

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

                <button
                  type="button"
                  onClick={() => deleteClient(client.id)}
                  className="rounded-lg px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                )}

                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}

                {client.nationality && (
                  <p>
                    <span className="font-medium text-gray-700">
                      Nationality:
                    </span>{' '}
                    {client.nationality}
                  </p>
                )}

                {client.notes && (
                  <p className="rounded-xl bg-gray-50 p-3 text-gray-600">
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
    </div>
  );
}