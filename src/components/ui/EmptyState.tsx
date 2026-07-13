import { FolderOpen } from 'lucide-react';

type Props = {
  message: string;
};

export function EmptyState({
  message,
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <FolderOpen className="mx-auto h-10 w-10 text-gray-300" />

      <p className="mt-3 text-gray-500">
        {message}
      </p>
    </div>
  );
}