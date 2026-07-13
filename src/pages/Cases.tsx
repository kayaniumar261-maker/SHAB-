import { Briefcase, Plus, Search } from 'lucide-react';
import { useState } from 'react';

type CaseItem = {
  id: number;
  title: string;
  client: string;
  status: 'Active' | 'Pending' | 'Closed';
};

export function Cases() {
  const [cases, setCases] = useState<CaseItem[]>([
    {
      id: 1,
      title: 'Commercial Dispute',
      client: 'ABC Trading LLC',
      status: 'Active',
    },
    {
      id: 2,
      title: 'Labour Claim',
      client: 'Mohammed Ali',
      status: 'Pending',
    },
  ]);

  const addCase = () => {
    const title = window.prompt('Enter case title');
    if (!title) return;

    const client = window.prompt('Enter client name') || 'Unnamed Client';

    setCases((currentCases) => [
      ...currentCases,
      {
        id: Date.now(),
        title,
        client,
        status: 'Active',
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          <p className="mt-1 text-gray-500">Manage all legal matters.</p>
        </div>

        <button
          type="button"
          onClick={addCase}
          className="flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-white"
        >
          <Plus className="h-5 w-5" />
          Add Case
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search cases"
          className="w-full bg-transparent outline-none"
        />
      </div>

      <div className="mt-6 space-y-4">
        {cases.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="rounded-xl bg-purple-100 p-3">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-500">{item.client}</p>
                </div>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}