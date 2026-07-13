import { Search } from 'lucide-react';

type Props = {
  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search',
}: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <Search className="h-5 w-5 text-gray-400" />

      <input
        value={value}
        type="search"
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full bg-transparent outline-none"
      />
    </div>
  );
}