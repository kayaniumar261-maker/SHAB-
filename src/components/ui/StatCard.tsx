import { ReactNode } from 'react';

type Props = {
  label: string;

  value: ReactNode;

  color?: string;
};

export function StatCard({
  label,
  value,
  color = 'text-gray-900',
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-bold ${color}`}
      >
        {value}
      </p>
    </div>
  );
}