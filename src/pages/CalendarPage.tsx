import { CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';

type Hearing = {
  id: number;
  title: string;
  date: string;
  court: string;
};

export function CalendarPage() {
  const [hearings, setHearings] = useState<Hearing[]>([
    {
      id: 1,
      title: 'Case Management Hearing',
      date: '15 July 2026',
      court: 'Dubai Courts',
    },
  ]);

  const addHearing = () => {
    const title = window.prompt('Enter hearing title');
    if (!title) return;

    const date = window.prompt('Enter hearing date') || 'Date not set';
    const court = window.prompt('Enter court name') || 'Court not set';

    setHearings((currentHearings) => [
      ...currentHearings,
      {
        id: Date.now(),
        title,
        date,
        court,
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-gray-500">Track hearings and deadlines.</p>
        </div>

        <button
          type="button"
          onClick={addHearing}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white"
        >
          <Plus className="h-5 w-5" />
          Add Hearing
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {hearings.map((hearing) => (
          <div
            key={hearing.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex gap-3">
              <div className="rounded-xl bg-orange-100 p-3">
                <CalendarDays className="h-6 w-6 text-orange-600" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  {hearing.title}
                </h2>
                <p className="text-sm text-gray-500">{hearing.date}</p>
                <p className="text-sm text-gray-500">{hearing.court}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}